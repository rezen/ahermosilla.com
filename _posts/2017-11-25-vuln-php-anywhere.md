---
layout: post
title:  "Vulnerability Report - WordPress plugin - php-everywhere"
subtitle: "Low priv users with code execution"
categories: security
tags: [ vulnerability  ]
---
This is a post I back dated to when I privately reported a vulnerability to the author of the php-everywhere plugin. I discovered a low privileged user could execute arbitrary PHP code and provided a POC where a low priv user could upgrade their permissions to admin. (The plugin is no longer available for downloadhttps://wordpress.org/plugins/php-everywhere/)

<hr />
<br />
> Hi Alexander, I discovered a vulnerability in the PHP EveryWhere Plugin. 


## Steps
- 1 - In PHP EveryWhere plugin options, set user role management option to Administrator only
- 2 - Login as a contributor, or use User Switching plugin to switch to a contributor user.
- 3 - Observe user id via JavaScript `console.log(userSettings.uid)` or from the field on the source code on /wp-admin/profile.php. The user is able to find their user_id.
- 4 - As contributor, add new post, with whatever title they want & with content of `[php_everywhere]`. 
  - They add a custom field with name of php_everywhere_code and use example value from below, with their user_id (using 4 for examples sake)
    - `<?php wp_update_user(array('ID' => 4,'role'=>'administrator'));?>";`
- 5 - Save draft, preview post
- 6 - Go to dashboard and observe, wallah, privileges upgraded to admin.


An administrator would expect, which that setting that contributors/editors would not be able to execute php, but that is not the case. With example below a contributor is able to make themselves an admin and do whatever they please.

What should happen, is in the function `php_everywhere_data` you should check if the option was set to Administrator only, and if the current user was not an administrator, then you should not save. Additionally you need filter out the key php_everywhere_code in the meta set in the `$_POST`.

I'd also like to mention, it is probably safer to make the default setting that only admins by default can execute PHP, not editors & contributors. 