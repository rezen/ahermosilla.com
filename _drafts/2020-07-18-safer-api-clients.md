---
layout: post
title:  "Safer API Clients"
categories: security
tags: [ api ]
---
There are two mistakes I frequently see in API clients.

- Lack of data verifaction which is passed into REST paths (path traversal)
- Lack of TLS/SSL verification