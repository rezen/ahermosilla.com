---
layout: post
title:  "Getting going with Jekyll"
subtitle: "Jumping into THE static site generator"
categories: tools
tags: [ tools, jekyll ]
---
* TOC
{:toc}


I've been wanting to start blogging for quite some time and decided to finally make the jump.
I've created countless WordPress sites for clients but wanted to go a different route for my own 
blog. I wanted to use a system that was simple and light and something I didn't need a db for.
I wanted something that would let me write markdown files and generate the site from there.
Nowadays there are so many [static site generators](https://www.staticgen.com/) to choose from 
it is easy to find something that fits your needs. I personally decided to use Jekyll, since it 
is ubiquitous and has a robust ecosystem. Another nice thing about  Jekyll is you can host your blog on 
[github][jekyll-github] and it just works**! *(provided you don't use plugins)*

**An aside, there is an interesting alternative to Jekyll in the nodejs world - Metalsmith**.
Metalsmith let's you essentially mix your own functionality with plugins to morph into a
generator you are used to. Below is an example how to use Metalsmith with a Jekyll structure 
if you are more inclined to use nodejs tools.

<https://github.com/metalsmith/metalsmith/tree/master/examples/jekyll>


## Requirements
*An aside, there are plenty of guides to tools on Mac, I want to make sure windows users get some love!*

Jekyll is powered by ruby which you can install on windows/mac/*nix. For windows you can download a Windows 
specific [ruby installer][ruby-installer]  which is an executable to set ruby up. Personally I'm a big 
fan of [chocolatey][chocolatey],  which is a package mananger for windows! (A post on my windows setup coming soon!)

To first install chocolately, run `cmd.exe` as an Administrator and run the following command

```powershell
@powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
```
<https://chocolatey.org/install'  | urlize }}

Once that is complete you can use chocolatey to install ruby!

```powershell
choco install -y ruby
```

Alternatively if you are a running `bash` on Windows 10 via the `Windows Subsystems for Linux` you can 
quickly setup ruby! (You can find installation guide for setting up [bash on Windows here][windows-bash].)


```shell
# Debian setup instructions!
# https://www.brightbox.com/blog/2016/01/06/ruby-2-3-ubuntu-packages/
sudo apt-add-repository ppa:brightbox/ruby-ng
sudo apt-get update
sudo apt-get install ruby2.3 ruby2.3-dev
gem install jekyll bundler
```


## Installing jekyll
Once ruby is installed, getting jekyll installed is pretty straight forward!
```shell
gem install jekyll bundler
jekyll new awesome-blog
cd awesome-blog
gem install
bundle exec jekyll serve
```

### SSL Errors
If you are running windows you may run into a certificate error ...

```
SSL_connect returned=1 errno=0 state=SSLv3 read server certificate B: certificate verify failed
```
... luckily there is a guide for that! You can create a `batch` script `ruby_gem_fix.bat` width the snippet below are run that!
I used the [guide on rubygems.org](http://guides.rubygems.org/ssl-certificate-update/) to 
help me figure out how to fix the issue.

```powershell
:: http://stackoverflow.com/questions/636381/what-is-the-best-way-to-do-a-substring-in-a-batch-file
:: http://stackoverflow.com/questions/6359820/how-to-set-commands-output-as-a-variable-in-a-batch-file
FOR /F "tokens=* USEBACKQ" %%F IN (`gem which rubygems`) DO (
SET GEM_BIN=%%F
)
PUSHD "%GEM_BIN:~0,-3%/ssl_certs"
powershell -Command "(New-Object Net.WebClient).DownloadFile('https://raw.githubusercontent.com/rubygems/rubygems/master/lib/rubygems/ssl_certs/index.rubygems.org/GlobalSignRootCA.pem', 'GlobalSignRootCA.pem')"
POPD
```

If you are still having certificate errors, I found this answer on [Stackoverflow helpful][stack-answer].

You can also check out this thorough guide for windows install I found after wrestling through SSL troubles.
<http://yizeng.me/2013/05/10/setup-jekyll-on-windows/>

## Editing
Once you are all setup you'll see the contents of the blog similar to structure below.
If you aren't tweaking the theme, the `_posts` directory is where you can write and 
edit posts. The name of the each file contains the date the post will be published as well as
the url/slug of the post.

```
|-- _posts
|   |-- 2016-11-09-post.md
|   |-- 2016-11-10-best-cats.md
|   `-- 2020-11-11-gifs-on-fire.md
|-- _site
|-- _config.yml
|-- about.md
|-- Gemfile
|-- Gemfile.lock
`-- index.md
```

The content of a post looks like this!

```
---
layout: post
title:  "Getting going with Jekyll"
subtitle: "Jumping into THE static site generator"
categories: tools
tags: [ tools, windows ]
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut id eleifend augue. 
Ut varius sit amet ipsum eu maximus. Praesent odio mauris, pellentesque in porttitor 
vitae, dictum nec magna. Aenean elementum sem non facilisis malesuada. Suspendisse a

## Blarg
laoreet dui, vitae fermentum odio. Fusce dictum, magna sed congue pellentesque, velit 
velit facilisis dolor, quis commodo dolor purus dignissim eros. Cras in magna gravida, 
viverra enim non, rhoncus mauris. Phasellus vel turpis tincidunt, tristique mi vel ....

- Fusce dictum
- Phasellus vel 
- Aenean elementum

```

**Note** One thing nice I discovered by accident is you can future 
date a post and it won't render/display until that date!

## Customizing & Plugins
Jekyll has a healthy ecosystem which of course includes plugins & themes. One feature I 
wanted to add that I found a plugin for was embedding twitter posts.
Adding the new plugin was pretty straightforward! I edited the `Gemfile` in the project
root and under the `:jekyll_plugins` group added the name of the plugins I wanted
installed.

```ruby
source "https://rubygems.org"
ruby RUBY_VERSION

gem "jekyll", "3.3.0"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.6"
  # Added a new plugin
  gem "jekyll-twitter-plugin" 
end
```
After I updated the `Gemfile`  I ran `bundler install` and the additional dependancies were added!

### No auto-urlize?
One thing that I've grown accustom to with markdown on github, was automatic url to link conversion.
I'm not sure if I used another markdown renderer if it would be different, but the default renderer,
`kramdown` didn't handle that automagically. Luckily it is 
really easy to create a plugin! I didn't feel like investing the time to create an 
auto urlizer at this point so I made a liquid filter and dropped it into the project -
 `_plugins/urlize-filter.rb`! to use it it's as simple as

```
{{ "<http://jekyllrb.com/docs/home' | urlize " }}}}
```

```ruby
module Jekyll
  module UrlizeFilter
    def urlize(input)
      "<a rel=\"external\" href=\"#{input}\">#{input}</a>"
    end
  end
end

Liquid::Template.register_filter(Jekyll::UrlizeFilter)
```

### Pinning Posts
In WordPress you can tag posts as "sticky", essentially pinning them as more important.
I did some quick searching around and found a solution to add a `pinned` attribute
and drop in a new plugin!

<https://talk.jekyllrb.com/t/pinned-posts-like-wordpress/1595/4>
```
---
layout: post
title:  "Getting going with Jekyll (on Windows!)"
categories: tools
tags: [ tools, windows ]
pinned: true
---
```

I dropped a new ruby file into the `_plugins` directory following the 
pattern found [on this this](https://talk.jekyllrb.com/t/pinned-posts-like-wordpress/1595/4)

```ruby
Jekyll::Hooks.register :site, :pre_render do |site, payload|
  # Sort pinned posts up!
  # https://talk.jekyllrb.com/t/pinned-posts-like-wordpress/1595/4
  payload['site']['posts'].sort_by!{|p| [p.data['pinned'] ? 1:0, p.date]}.reverse!
end
```
Now pinned posts percolate to the top! Once I unpin the post it will be sorted normally.

### Post CSS Classes
In WordPress there is a handy dandy function `post_class();` that give a CSS 
class with names derived from the post attributes, including post type, category,
tags etc. I wanted to implement a post_class attribute on posts/pages that I could
use in the templates. 

In templates I wanted to be able to reference the attribute like this!
```html
<div class="{{ "{{ post.post_class " }}}}">
  <!-- ... -->
</div>
```
... which would render this!
```html
<div class="category-tools tag-tools tag-windows is-pinned">
  <!-- ... -->
</div>
```

... so I went ahead and dropped in another plugin which I quickly wrote!
```ruby
Jekyll::Hooks.register :site, :pre_render do |site, payload|
  # Add an attribute, post_class, for use in templates
  payload['site']['posts'].map!{|p|
    classes = [
      p.data['categories'].map{|c|"category-#{c.downcase}"}.join(" "),
      p.data['tags'].map{|t|"tag-#{t.downcase}"}.join(" ")
    ]

    if p.data['pinned']
      classes.push("is-pinned")
    end

    p.data['post_class'] = classes.join(" ")
    p
  }
end
```
The nice thing about having category and tag classes is I can customize the style of the page
depending on the tag!


### Heading Anchors
One thing handy-dandy github does is id & link headers. Jekyll automatically adds
ids to headers but not links. The quickest way to remedy this missing feature is 
to use JavaScript to add a link!

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script>
jQuery(function ($) {
  // Add anchors to headings that have ids
  // https://github.com/jekyll/jekyll/issues/2690#issuecomment-153697263
  $('h2,h3,h4,h5,h6').filter('[id]').each(function () {
    $(this).html('<a href="#'+$(this).attr('id')+'">' + $(this).text() + '</a>');
  });
});
</script>
```

### Archives
In WordPress I am used to have an archives page for categories, tags etc.
One thing that appeared to be missing by default from Jekyll is the notion of a category archives.
I assume this could be easily remedied by a plugin and found `jekyll-archives`!

Here are some more links on archives you can check out, maybe there is another solution you like better!

- <https://www.mikeapted.com/jekyll/2015/12/30/category-and-tag-archives-in-jekyll-no-plugins/>
- <https://blog.webjeda.com/jekyll-categories/>
- <https://www.chrisanthropic.com/blog/2014/jekyll-themed-category-pages-without-plugins/>
- <http://reyhan.org/2013/03/jekyll-archive-without-plugins.html>

### Image Classes
I wanted to add a custom class to an image but didn't think markdown supported the
notion of arbitrary attributes on elements. Apparently the `kramdown` markdown render
supports **"extended"** features including extra attributes. I found the 
[link here](https://thornelabs.net/2014/11/30/centering-images-with-jekyll-and-markdown.html)
that explains the details, but below is how you do it in the markdown.

```html
<!--
This markdown ....

![Andres](https://s.gravatar.com/avatar/md5yo?s=100){:class="biopic gravatar"}

... turns into
-->
<img src="https://s.gravatar.com/avatar/md5yo?s=100" alt="Andres" class="biopic gravatar" />
```

### More
I covered some quick "plugins" to get you introduced, but make sure check out the resources below!

- <https://jekyllrb.com/docs/plugins/>
- <http://www.jekyll-plugins.com/>
- <https://tuananh.org/2014/08/04/writing-your-first-jekyll-plugin/>
- <https://divshot.com/blog/web-development/advanced-jekyll-features/>
- <http://www.createdbypete.com/articles/create-a-custom-liquid-tag-as-a-jekyll-plugin/>
- <http://www.xorcode.com/2012/08/15/jekyll-creating-your-first-liquid-plugin/>
- <https://github.com/planetjekyll/awesome-jekyll-plugins>
- <http://dev-notes.eu/2016/01/images-in-kramdown-jekyll/>

## Next Steps
Once you are all setup and installed you can jump into creating content
or customizing your [theme](http://jekyllthemes.org/)! There is
so much you can do to customize your blog! As I continue hacking on this site
I will share more

- [Cheatsheet!](https://gist.github.com/smutnyleszek/9803727)
- [Liquid templating](http://shopify.github.io/liquid/)
- <http://jekyllrb.com/docs/home>
- <https://github.com/planetjekyll/awesome-jekyll>
- <https://www.digitalocean.com/community/tutorials/exploring-jekyll-s-default-content>
- <https://www.jflh.ca/2016-01-23-adding-and-displaying-tags-on-jekyll-posts>
- <http://jekyll-windows.juthilo.com/>
- <https://divshot.com/blog/web-development/advanced-jekyll-features/>
- <http://www.remotesynthesis.com/general/2015/10/02/advanced-jekyll-templates/>
- <http://svmiller.com/blog/2015/08/create-your-website-in-jekyll>
- <http://blog.apps.npr.org/2012/11/08/npr-news-apps-blog.html>


Check out the [Jekyll docs][jekyll-docs]

[chocolatey]: https://chocolatey.org/
[ruby-installer]: http://rubyinstaller.org/
[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-github]:https://help.github.com/articles/about-github-pages-and-jekyll/
[windows-bash]: https://msdn.microsoft.com/en-us/commandline/wsl/install_guide
[stack-answer]:http://stackoverflow.com/questions/5720484/how-to-solve-certificate-verify-failed-on-windows#answer-16134586