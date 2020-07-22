---
title: dig without dig
category: snippet
tags: [ dns ]
---

```sh
curl -s -H 'host: dns.google.com' \
  'https://8.8.8.8/resolve?name=assets.github.com&type=NS' \
  | jq
```