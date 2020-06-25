---
layout: post
title:  "Getting sneaky with DNS for SSRF"
subtitle: "Understanding how fundamental technologies work goes a long way ..."
categories: security
tags: [ ssrf, dns  ]
---

Generally when I make http requests against a domain, I wouldn't expect it to make requests on my localhost - but sometimes, just that happens. For getting sneaky with [SSRF](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery) attacks you can have a DNS record point to `127.0.0.1`. When a record pointing to `127.0.0.1` is resolved, your application will end up making requests `127.0.0.1`. For experimentation, I used one of Rapid7's free datasets, & found the domain `volks-seat.de` pointing `127.0.0.1`. It never occurred to me you could do such a thing so I did some digging ;) to see what I could learn.

### Check Record
You can check DNS record for a domain you suspect is pointing to `127.0.0.1`. Using dig check the `ANSWER` section for where the domain points. I confirmed `volks-seat.de` did in fact point to `127.0.0.1`

```sh
dig volks-seat.de | grep -A2 ';; ANSWER'
# ;; ANSWER SECTION:
# volks-seat.de.          71858   IN      A       127.0.0.1
```

### Quick Test
Okay, so DNS resolves the domain to `127.0.0.1`, how do applications actually respond to this? As a basic test, I started a webserver on my machine to simple list the contents of a directory.

- Start up a webserver in a directory 
  - `pwd && echo ruh_roh_raggy > zzzzz_flag.txt`
  - `python -m SimpleHTTPServer 8000`
- Fetch the page and see if anything looks familiar
  - `curl http://volks-seat.de:8000`
    - You'll see towards the end of the output `zzzzz_flag.txt`
  - `curl -vs http://volks-seat.de:8000 2>&1 | grep Connected`
    - When showing verbose output you'll see curl connecting to `127.0.0.1`


### Example App
So how does this come into play with SSRF in your app? An application may have a whitelist/blacklist of valid hosts to perform certain actions against. Let's imagine you had an app that simply checked if a site was up or not. We want to prevent users from trying to access private assets so we create a basic blacklist of hosts that we won't want to be reached. Let's take a look at this basic example below that captures the concept.

```php
<?php

$ignore_hosts = [
    '127.0.0.1', 'localhost', '169.254.169.254', 
    '0.0.0.0', '192.168.0.1', '10.0.0.1', '172.16.0.1', 
];
$url_alive    = "http://volks-seat.de:3000";
$parsed_url   = parse_url($url_alive);

if (empty($parsed_url['host'])) {
    return json_encode(['error' => 'Invalid host']);
}

if (in_array($parsed_url['host'], $ignore_hosts)) {
    return json_encode(['error' => 'Invalid host']);
}

// We should also check protocol ... 
// ... but you get the idea
$response    = file_get_contents($url_alive);
$status_code = explode(" ", $http_response_header[0] ?? "HTTP/1.1 0 x")[1] ?? "";

return json_encode([
    'success'     => true,
    'status_code' => $status_code,
    'body'        => $response,
]);
```

We can see the hostname is checked from the parse uri, but that is not enough to protect yourself. The example above is problematic because once the "bad" DNS record is resolved, the ip the hostname resolves to ends up being `127.0.0.1`. An attacker can "recon" our internal server adding tests for every port (0-65535) with the same domain to see what else can be found. If, for example, you had Elasticsearch running without authentication, an attacker could add the url `http://volks-seat.de:9200/_stats/indexing,store` and access content you wouldn't want them to.

To actually make sure everything is sane, the application needs to resolve the host and make sure the host is not a host we want to ignore

```php
// Resolve the ip and make sure that is not in the blacklist
// Naive, may not be performant
$ip = gethostbyname($parsed_url['host']); 

if (in_array($parsed_url['host'], $ignore_hosts) || in_array($ip, $ignore_hosts)) {
    return json_encode(['error' => 'Invalid host']);
}
```

### Finding Records
You can take a look at some dns records pointing to `127.0.0.1` using Rapid7's public dataset
https://blog.rapid7.com/2018/10/16/how-to-conduct-dns-reconnaissance-for-02-using-rapid7-open-data-and-aws/

```sql
SELECT * FROM rapid7_fdns_any 
where value like '127.0.0.1'
order by date desc
```

### Links
- https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
- https://blog.appsecco.com/an-ssrf-privileged-aws-keys-and-the-capital-one-breach-4c3c2cded3af
- https://www.hackerone.com/blog-How-To-Server-Side-Request-Forgery-SSRF
- https://portswigger.net/web-security/ssrf


### DNS Rebinding
**Related**

An app many check the DNS record for a domain to ensure the domain does not point to private instances. With DNS rebinding attacks, you have a short TTL for a record which changes between a public ip & a private ip. Your application may see that a domain resolves to a public ip and then continues on to the request, but if you don't explicitly use the ip that was resolved earlier, the library/module making requests may make another DNS query which resolves to a private ip since the original DNS request.

#### Links
- https://medium.com/@brannondorsey/attacking-private-networks-from-the-internet-with-dns-rebinding-ea7098a2d325
- https://danielmiessler.com/blog/dns-rebinding-explained/
- https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/august/singularity-of-origin-a-dns-rebinding-attack-framework/
- https://github.com/nccgroup/singularity
- https://github.com/taviso/rbndr
- https://research.nccgroup.com/2020/03/30/impact-of-dns-over-https-doh-on-dns-rebinding-attacks/
