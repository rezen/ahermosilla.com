---
layout: post
title:  Setup ZAP baseline for CI & tracking with JIRA
subtitle: "Everybody loves JIRA tickets!"
categories: security
tags: [ security, zap ]
---

Doing a baseline security scan of your web application before deployment is a simple way to improve the security of your application. Adding a scan to your CI as part of your SDLC makes it effortless to iterate and improve your application's security. There are lots of options for scanning your web application, but in this post we'll focus on scanning with [OWASP ZAP](https://www.zaproxy.org/)! I'm going to walk through getting a basic scan setup and configured and then show how you can script up loading the results into [JIRA](https://www.atlassian.com/software/jira). I don't get into configuration details of the CI, I've done this setup primarily with teams using Jenkins, but it translate well into any CI. (If you are using Github, there is a nice post on [ZAP with Github Actions](https://www.zaproxy.org/blog/2020-04-09-automate-security-testing-with-zap-and-github-actions/))

*I put together the majority of this guide a couple years ago so some of the scripts haven't been tested recently*

## Requirements
- Docker
- `jq`  <https://stedolan.github.io/jq/>
- `jira` (cli) <https://github.com/Netflix-Skunkworks/go-jira>

## Prepare
You'll need Docker installed on your system to try things out. When you are setup, you can execute this command to do a test run against your application  (Change the url to your application endpoint). The `alerts.json` will have a report of findings and `alerts.conf` is a config file (being generated this time with the `-g` flag) you can change (<https://www.zaproxy.org/docs/docker/baseline-scan/>) - pay attention to stdout for now. There will be minimal output, running the command will take 30 seconds to 5 minutes depending on how many crawlable urls you have.

```sh
docker run --rm --env PYTHONBUFFERED=1 \
  -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py \
  -t https://ahermosilla.com/ \
  -a -d -j \
  -J "alerts.json" \
  -g alerts.conf \
  -m 1 \
  -z '-config spider.maxDepth=1 -config spider.thread=4 -config spider.maxChildren=1'
```

## Review
After the command runs & finishes you'll see some results in stdout that look like the output below. Review the results & make note of any items that may be false positives, noting the number in the square brackets after the label (e.g `[10010]`)

```
--- snip ---
PASS: WSDL File Passive Scanner [90030]
PASS: Loosely Scoped Cookie [90033]
WARN-NEW: Cookie No HttpOnly Flag [10010] x 13 
	https://ahermosilla.com/
	https://ahermosilla.com/account/login?return_url=https%3A%2F%2Fahermosilla.com
	https://ahermosilla.com/user/auth/login?return_url=https%3A%2F%2Fahermosilla.com
	https://ahermosilla.com/robots.txt
	https://ahermosilla.com/sitemap.xml
WARN-NEW: Cookie Without Secure Flag [10011] x 13 
	https://ahermosilla.com/
--- snip ---
```

## Tune
The scan from the first step will generate an  `alerts.conf` which you can tune.  You can change `WARN` to `IGNORE` for false positives or `WARN` to `FAIL` for items that you would want to fail builds for. Tuning is optional, but like most tools, you can get better mileage with tuning. Once you have altered the config, do some more test runs with the supplied config to verify the changes are what you want.

**alerts.conf**  
```
# zap-baseline rule configuration file
# Change WARN to IGNORE to ignore rule or FAIL to fail if rule matches
# Only the rule identifiers are used - the names are just for info
# You can add your own messages to each rule by appending them after a tab on each line.
10009   WARN    (In Page Banner Information Leak)
10010   WARN    (Cookie No HttpOnly Flag)
10011   WARN    (Cookie Without Secure Flag)
10015   WARN    (Incomplete or No Cache-control and Pragma HTTP Header Set)
10016   WARN    (Web Browser XSS Protection Not Enabled)
10017   WARN    (Cross-Domain JavaScript Source File Inclusion)
10019   WARN    (Content-Type Header Missing)
10020   WARN    (X-Frame-Options Header Scanner)
10021   WARN    (X-Content-Type-Options Header Missing)
10023   WARN    (Information Disclosure - Debug Error Messages)
10024   WARN    (Information Disclosure - Sensitive Information in URL)
10025   WARN    (Information Disclosure - Sensitive Information in HTTP Referrer Header)
10026   WARN    (HTTP Parameter Override)
10027   WARN    (Information Disclosure - Suspicious Comments)
```

Now that you have adjusted the `alerts.conf` file, you 
 can run the command again, this time with the `-c`.

```sh
docker run --rm -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py  \
    -t https://ahermosilla.com/ \
    -a -d -j \
    -J "alerts.json" \
    -c alerts.conf \
    -m 1 \
    -z '-config spider.maxDepth=1 -config spider.thread=4 -config spider.maxChildren=1'
```

## Building
Once you have everything tuned & verified, add a job to your CI environment. You should setup parameterized builds to pass in your target and alerts configuration. I recommend running the scans after acceptance testing, but find where it best fits into your team's SDLC. This is essentially the script you can use.

```sh
export JIRA_PROJECT=TST
export TARGET='https://ahermosilla.com/'
export IGNORE_IDS="$(cat alerts.conf  | grep -v '^#' | grep IGNORE | cut -f1 | tr '\r\n' ' ')"
export REPORT_FILE="report-$(date '+%Y%m%d%H%M%S').json"
 
docker run --rm -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py  \
    -t "$TARGET" \
    -a \
    -J "$REPORT_FILE" \
    -c alerts.conf \
    -m 1 \
    -z '-config spider.maxDepth=1 -config spider.thread=4 -config spider.maxChildren=1'

# Export alerts to JIRA
./zap_alerts_to_jira.sh "$REPORT_FILE"
```

## JIRA
Everyone who has used JIRA has feelings about JIRA (myself included). This base script enables you to use the `jira` cli to create tickets from the alerts generated by ZAP. For teams that primarily work out of JIRA, this is very helpful for keeping tabs of any issues ZAP has found.

```bash
#!/bin/bash

set -e

report_file="$1"
target_host="$2"
project="${JIRA_PROJECT}"
ignore_ids="${IGNORE_IDS:-2 10026}"

# If ignore_ids is actually a file instead of numbers
if [ -f "${ignore_ids}" ]
then
  # https://github.com/zaproxy/zaproxy/wiki/ZAP-Baseline-Scan#configuration-file
  echo "[i] Reading alerts conf file for alerts to ignore"
  ignore_ids="$(cat ${ignore_ids}  | grep -v '^#' | grep IGNORE | awk '{ print $1 }' | tr '\r\n' ' ')"
fi

if [ -z "${target_host}" ]
then
  echo '[!] You need to provide a target host ./zap_alerts_to_jira.sh report.json myapp.com'
  exit 10
fi

should_ignore_id()
{
  local id="$1"
  if [ -z "$ignore_ids" ]
  then
    return 1
  fi

  for iid in ${ignore_ids}
  do
    if [ "$iid" == "$id" ]
    then
      return 0
    fi
  done
  return 1
}

create_jira_issue() 
{
  local summary="$1"
  local alert="$2"
  description=$(echo "${alert}" | jq -r '.description,"\n", (.uris[] | " - \(.)")' | sed "s/://g")
  
  # If you want to add custom fields etc, you will need to change the go-jira create templates
  # which can be generated with `jira export-templates` and then
  # adjusted in ~/.jira.d/templates/create
  jira create --project="${project}" \
    --issuetype=Task \
    --noedit \
    --override="summary=${summary}" \
    --override="description=${description}"
}

handle_target_alerts()
{
  local target="$1"
  local alerts="$2"
  while read -r alert
  do
    id=$(echo "${alert}" | jq -r '.id')
    prefix=$(echo "${alert}" | jq -r '"\(.id) -- \(.name)"')

    if should_ignore_id "$id"
    then
      echo "[i] Ignoring alert $prefix"
      continue
    fi

    risk_code=$(echo "${alert}" | jq -r '.riskcode')

    if [ "$risk_code" == "0" ]
    then
      echo "[i] Low risk ... skipping creating [${prefix}]"
      continue
    fi

    # If you change your summary after issues have been created, you will end up with duplicates
    summary="${prefix} -- ${target}"
    found=$(jira list --limit=1 --query "project=${project} AND summary~'\"${summary}\"'")

    if [ "${found}" == "" ]
    then
      create_jira_issue "${summary}" "${alert}"
    else
      issue_key=$(echo "${found}" | cut -d':' -f1)
      echo "[i] Issue already being tracked ${issue_key} [${prefix}]"
      jira comment "${issue_key}" --noedit  --comment='ZAP issue still being seen'
    fi
  done<<< "${alerts}"
}

if !(command -v jira) || !(command -v jq)
then
  echo "[!] Expects jira cli & jq to be installed"
  echo " - https://github.com/Netflix-Skunkworks/go-jira"
  exit 1
fi

if [ ! -f "${report_file}" ]
then
  echo "[!] That does not appear to be a report file ${report_file}"
  exit 1
fi

if [ -z "${project}" ]
then
  echo '[!] Specify your jira project with JIRA_PROJECT env variable'
  exit 1
fi

echo '[i] Checking if the configured JIRA project exists'

if !(jira list --project="${project}" --limit=1)
then
  echo "[!] That project does not exist"
  exit 1
fi

site_type=$(cat "${report_file}" | jq -r '.site | type')
if [ "$site_type" == "array" ]
then
  max=$(cat "${report_file}" | jq -r '.site | length')
  max=$((max-1))
  for i in $(seq 0 $max)
  do
    target=$(cat "${report_file}" | jq -r ".site[$i][\"@host\"]")

    if [ "${target}" != "${target_host}" ]
    then
      echo "[!] Ignoring alerts for ${target}" 
      continue
    fi

    alerts=$(cat "${report_file}" | jq -r -c -a -M ".site[$i].alerts[] | {uris: [.instances[]|.uri], description: .desc, id: .pluginid, name: .alert, riskcode: .riskcode }" | xargs -L1 -0)
    handle_target_alerts "${target}" "${alerts}"
  done
else 
  target=$(cat "${report_file}" | jq -r '.site["@host"]')

  if [ "${target}" != "${target_host}" ]
  then
    echo "[!] Ignoring alerts for ${target}"
    return
  fi
    
  alerts=$(cat "${report_file}" | jq -r -c -a -M '.site.alerts[] | {uris: [.instances[]|.uri], description: .desc, id: .pluginid, name: .alert, riskcode: .riskcode }' | xargs -L1 -0)
  handle_target_alerts "${target}" "${alerts}"
fi
```


<br />
**jira_cli_login.sh**  
Configuring authentication with the `jira` cli typically requires manually interaction. In the context of CI, configuring auth to work with `expect` is a bit hacky. Doing some digging, I found `jira` use a json file ( `~/.jira.d/cookies`) credentials ... so I just created a script that generates that json file. *Warning, I haven't tested this script in awhile*

```bash
#!/bin/bash

set -e

json='[{"Name":"atlassian.xsrf.token","Value":"{{TOKEN}}","Path":"/","Domain":"jira.internal.net","Expires":"2030-04-30T11:35:02.409249143-07:00","RawExpires":"","MaxAge":0,"Secure":false,"HttpOnly":false,"Raw":"atlassian.xsrf.token={{TOKEN}}; Path=/","Unparsed":null},{"Name":"JSESSIONID","Value":"{{JID}}","Path":"/","Domain":"jira.internal.net","Expires":"2030-04-30T11:35:02.301767644-07:00","RawExpires":"","MaxAge":0,"Secure":false,"HttpOnly":true,"Raw":"JSESSIONID={{JID}}; Path=/; HttpOnly","Unparsed":null}]'
cookies=$(curl --silent  --output /dev/null  -c - -X POST   https://jira.internal.net/rest/auth/1/session   -H 'content-type: application/json'   -d '{ "username": "'"$JIRA_USER"'", "password": "'"$JIRA_PASS"' }'  | tail -n3 | cut -f6,7 | tr '\t' '=')
token=$(echo "$cookies" | grep token | cut -d'=' -f2)
JID=$(echo "$cookies" | grep JSESSIONID | cut -d'=' -f2)

json=$(echo "$json" | sed "s/{{TOKEN}}/$token/g" )
json=$(echo "$json" | sed "s/{{JID}}/$JID/g" )

echo "$json" > ~/.jira.d/cookies.js
```