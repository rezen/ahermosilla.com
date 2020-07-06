---
layout: post
title:  "Where does IP data come from?"
categories: tools
tags: [ ip ]
---

I've wondered for quite some time, how do sites like ipinfo.io get their data? Secondly, the question I had was "Could I gather/build out the data used by these sorts of services?". Off the bat, looking at the data, I make the assumption there is ownership data stored publically or "premiumly" that I could access, but where?

ICANN runs IANA which allocates IP addresses globally. The IANA allocates blocks of IPs to RIRs which manage the blocks allocated to them. You can view the list of ranges and how they are allocated hered https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml. It seems they allocate just `/8` ranges, which you can also see here https://en.wikipedia.org/wiki/List_of_assigned_/8_IPv4_address_blocks

The RIR is a regional registory (RIPE, APNIC, ARIN, LACNIC, NRO, AFRINIC) and you can see the map here https://en.wikipedia.org/wiki/Regional_Internet_registry#/media/File:Regional_Internet_Registries_world_map.svg. Each RIR will further allocate addresses to a LIR.

So with that knowledge, I dug down into each RIR so see how the addresses were allocated. I started looking at ARIN and came into the term ASN 
https://en.wikipedia.org/wiki/Autonomous_system_(Internet). ASNs are assigned 

- Get a list of ASNS ftp://ftp.arin.net/info/asn.txt
- Get ASN ranges http://ftp.arin.net/pub/stats/arin/delegated-arin-extended-latest 

For verification, I looked up IP info to see if things checked out, and everything looked good, but there was some caveats. How did I know a given range was "inactive"? Some of the allocated ranges were inactive and so I was at a loss.

During my research process, verifying information about ranges and ownership I ran into https://bgp.he.net/AS3356. BGP is a protcol for exchanging routing. You can download dumps of exchanges and parse through them. Inside those dumps, you can find ASNs and ranges.

http://archive.routeviews.org/bgpdata/


