---
layout: post
title:  "Where does IP data come from?"
subtitle: "Find the sources of IP data sets"
categories: tools
tags: [ ip ]
---

I've wondered for quite some time, how do sites like ipinfo.io get their data? Secondly, the question I had was "Could I gather/build out the data used by these sorts of services?". Off the bat, looking at the data, I made the assumption that the ownership data is stored publicly or "premiumly" that I could access, but where? So I did some digging around and below is some the datasets I discovered.

## IANA
ICANN runs IANA which allocates IP addresses globally. The IANA allocates blocks of IPs to RIRs (Regional Internet Registry) which manage the blocks allocated to them. You can view the list of ranges and how they are allocated here https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml. It seems they allocate  `/8` ranges, which you can also see here https://en.wikipedia.org/wiki/List_of_assigned_/8_IPv4_address_blocks

## RIR
The RIR is a regional registry (RIPE, APNIC, ARIN, LACNIC, NRO, AFRINIC) and you can see the map here https://en.wikipedia.org/wiki/Regional_Internet_registry#/media/File:Regional_Internet_Registries_world_map.svg. Each RIR will further allocate addresses to a LIR.

## ASN
So with that knowledge, I dug down into each RIR to see where I could possibly mine the allocated addresses. I found there were dumps of data which took me some time to look through to find what datasets would be helpful. In the process of looking at ARIN datasets I ran across the term ASN 
https://en.wikipedia.org/wiki/Autonomous_system_(Internet). ASNs are assigned by the IANA to each RIR which assign those the ASNs to a block.
You can see all the assigments here https://www.iana.org/assignments/as-numbers/as-numbers.xhtml

So you can get the list of ASN details from each RIR. It did notice RIPE had the details for every RIR (https://ftp.ripe.net/pub/stats/
) so you don't necessarily have to go to every RIR to get that data. Using the data I could figure out what ranges and ASNs belonged together.

- Get all ASNs
  - https://ftp.ripe.net/ripe/asnames/asn.txt
- Get a list of ASNs for ARIN
  - ftp://ftp.arin.net/info/asn.txt
- Get ASNs & ranges for ARIN
  - http://ftp.arin.net/pub/stats/arin/delegated-arin-extended-latest 
- Get a specific ASN
  - https://rdap.arin.net/registry/autnum/15169
- Use whois to get ranges for an ASN
  - `whois -h whois.radb.net -- '-i origin AS714' | grep -Eo "([0-9.]+){4}/[0-9]+" | head`

For verification that the data was good, I looked up some addresses at IP info to see if things checked out, and everything looked good, but there was some caveats. I looked up some of the ranges and they were noted as inactive. How did I know a given range was "inactive", there were not clear indicators in the ARIN datasets?

### Stats delegated format 
Looking at the delegated extended datasets, they look like this.

```2.3|arin|1594044013396|154725|19700101|20200706|-0400
arin|*|asn|*|28470|summary
arin|*|ipv4|*|66069|summary
arin|*|ipv6|*|60186|summary
arin|US|asn|1|1|20010920|assigned|e5e3b9c13678dfc483fb1f819d70883c
arin|US|asn|2|1|19910110|assigned|c3a16289a7ed6fb75fec2e256e5b5101
arin|US|asn|3|1|00000000|assigned|d98c567cda2db06e693f2b574eafe848
arin|US|asn|4|1|19840222|assigned|8c3f2df306a67e97a7abb5a2a0335865
arin|US|asn|5|1|19840202|assigned|17758c838b246924a54466f28f2b45ef
arin|US|asn|6|1|19840202|assigned|481b80475499335d51156e7b72507568
arin|US|asn|8|1|19840326|assigned|5f676a1dae02fc7cb708558c3ff1d122
arin|US|asn|9|1|19840417|assigned|859ff8395a142b506a4aa4425d450e1d
arin|US|asn|10|1|00000000|assigned|3fa2e5aa48f205a7696ea6fbcd437cff
arin|US|asn|11|1|19840704|assigned|88e9e1a9f78221c5b97e72d580642205
````

It look me awhile to decipher the format, especially the last column, but this is the gist of it. The last column essentially is a key to help you associate rows with a given org.

```
registry|country|type|value|?|?|status|association
```


## BGP
During my research process, verifying information about ranges and ownership I ran into https://bgp.he.net/AS3356. BGP (which I won't dig into because I haven't take the time yet to understand) is a protcol for exchanging routing information. I found you can download dumps of the exchanges and parse through them. Inside those dumps (http://archive.routeviews.org/bgpdata/
), you can find ASNs and ranges - aha! this is where I can sort out if a range is inactive or not!

The data roughly looks like this when you dump it out with `bgpdump`

```
TYPE      ?|  DATE    |?|FROM     |ASN |PREFIX    |ASNPATH   |ORG|NEXT_HOP |?|?|COMMUNITY
TABLE_DUMP2|1593640801|B|12.0.1.63|7018|8.8.8.0/24|7018 15169|IGP|12.0.1.63|0|0|7018:2500 7018:37232|NAG||
TABLE_DUMP2|1593640801|B|144.228.241.130|1239|8.8.8.0/24|1239 15169|IGP|144.228.241.130|0|80||NAG||
TABLE_DUMP2|1593640801|B|208.51.134.246|3549|8.8.8.0/24|3549 3356 15169|IGP|208.51.134.246|0|2504|3356:2 3356:86 3356:500 3356:666 3356:2064 3356:11078 3549:2352 3549:31826|NAG||
TABLE_DUMP2|1593640801|B|202.232.0.3|2497|8.8.8.0/24|2497 15169|IGP|202.232.0.3|0|0||NAG||
```

```sh
# Get outgoing IP and asn
bgpdump -m rib.20200701.2200.bz2  | cut -d'|' -f 4,5

# Find matches for a specific ASN
bgpdump updates.20200428.1815 | grep 'AS6447'
```

Parsing through a rib file you can find figure out what ASNs are associated with what ranges and are still active.

## Conclusion 
So I'm still not concluded ... but you can start to see how the pieces are coming together. I'm not clear on how you get specific states or cities, but that's why things are not concluded.


## Links
During my process of searching for data I always find useful looks that directly contributed to my discoveries or are related.

- https://host.io/
- https://blogofsomeguy.com/a/2017-07-26/fastmetrics-p4-mapping-ip-to-asn.html
- https://github.com/t2mune/mrtparse/blob/master/examples/summary.py
- https://ftp.ripe.net/ripe/ipmap/
- https://asn.cymru.com/
- https://www.iana.org/whois?q=67.187.185.36
- https://search.arin.net/rdap/?query=67.187.185.36&searchFilter=ipaddr
- https://team-cymru.com/community-services/ip-asn-mapping/
- http://rest.db.ripe.net/search?query-string=8.8.8.8&type-filter=inetnum
- https://hackertarget.com/as-ip-lookup/
- https://rdap.arin.net/registry/ip/8.8.8.8
- https://www.arin.net/resources/registry/whois/rdap/#rdap-urls