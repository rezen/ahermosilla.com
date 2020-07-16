---
layout: post
title:  "Naming Things!"
subtitle: "Labeling classes, methods, functions, variables, servers ...."
categories: craftmanship
tags: [ ideas, raw ]
---
** This is a work in progress, that mostly contains lots of good links **

It's one of the [hardest things](http://martinfowler.com/bliki/TwoHardThings.html) you do a 
programmer and also one of the most important aspects of writing code. 
Code is read [10x more](http://www.goodreads.com/quotes/835238-indeed-the-ratio-of-time-spent-reading-versus-writing-is)
than it's written so when you are writing you need to be very thoughtful of the 
future readers, which are yourself & others. You want your code to be very
clear to readers, even if you are the only reader. Readability makes or break a project
There has been plenty of times that I don't look at a piece of code for months 
and come back and have to re-learn what I what I was doing. 

An important principle for naming is to communicate intentions.

The process of thoughtful naming also help you to identify code smells. If you are having 
a hard time naming a class, it may do too many things and should be possbily broken down.


#### Purpose & Potential
There is this idea that people live up to their names, & derive meaning/purpose from
their name. You should apply this notion of naming things to objects. 
Naming something gives it a purpose & meaning - it essentially creates it's "definition".
If you name an object generically, it doesn't have clear
definiion, clear boundaries.  Due to this lack of focus an object 
can quickly end up doing more than it should which lead be bad code smell.


### Hints
Is there a physical object that can help describe

When you are struggling with naming something, created wordmaps, word graphs from
the name or concept that you are starting with.

## Tools
Using a thesarus helps you to find similar terms that may better communicate 
intent &/or context
- <http://source-code-wordle.de/>
- <http://visualthesaurus.com/>
- <http://www.thesaurus.com/>

Inversely, if you enter your variable or method on the link and it's on the list
then you probably shouldn't use the name.
- <http://sph.mn/o/svn?words=evnHndlr>

## Seek
- Names that reveal intent
 - `class CommentModerator` encapsulates logic for moderating comments
 - `find_configs(directory)` returns list of configs from a directory
 - `is_risky_command(command)` returns true/false of risk of command
- Names that remove need for comments
- Be consistent
- To name things that correlate to the domain
- Accurately describe the variable or method
- Conciseness over verbosity
- Use analogies & metaphors
- Scalable patterns
- Have some fun
- Memorable

## Avoid
- Ambiguity
  - One letter or Short names
  - `ls` vs `list`
  - Don't use `a` or `bcz` unless `i` in loop
- Generic terms like *Manager* or *Provider* or *words*
  - `class ServiceProvider ...`
  - `list = ['a', 'b', 'c']`
  - `process_data(d)`
  - `word = "word"`
  - `file_handle = open('output.log')`
- Uneeded abbreviations or prefixes/suffixes
  - `WordPrcsr` vs `WordProcessor`
  - Including type in variable `listOfCats` vs `cats`
- Misleading names 
  - `words = [1, 2, 3]`
  - `has_word(sentence) # -> but returns 'string'`
- Methods or functions that describe how it works
  - `query_mysql_users()` vs `get_users()`
- Cleverness
 - `nuke(cache)` vs `flush(cache)`
 - `shun(user)` vs `ban(user)`

## Inspirations
- <http://www.bbc.co.uk/ontologies>
- <http://schema.org/CreativeWork>
- <https://namingschemes.com/>
- <http://www.ereadingworksheets.com/figurative-language/figurative-language-examples/metaphor-examples/>
- <http://literarydevices.net/a-huge-list-of-short-metaphor-examples/>
- <https://www.scribd.com/doc/29896677/Some-Common-Traditional-Symbols-in-Western-Literature>
- <http://fos.iloveindia.com/analogy-examples.html>

## Links
- <https://24ways.org/2014/naming-things/>
- <http://deviq.com/naming-things/>
- <https://a-nickels-worth.blogspot.com/2016/04/a-guide-to-naming-variables.html>
- <http://www.yacoset.com/Home/naming-tips>
- <http://bensmith.io/20-tips-for-better-naming>
- <http://www.makinggoodsoftware.com/2009/05/04/71-tips-for-naming-variables/>
- <http://www.eventhelix.com/RealtimeMantra/Object_Oriented/object_design_tips.htm>
- <http://steve-yegge.blogspot.com/2006/03/execution-in-kingdom-of-nouns.html>
- <http://objology.blogspot.com/2011/09/one-of-best-bits-of-programming-advice.html>
- <http://codebuild.blogspot.com/2012/02/15-best-practices-of-variable-method.html>
- <http://caseysoftware.com/blog/useful-naming-conventions>
- <http://mojones.net/how-to-pick-bad-function-and-variable-names.html>
- <http://www.yegor256.com/2015/03/09/objects-end-with-er.html>
- <http://www.ed.ac.uk/records-management/records-management/staff-guidance/electronic-records/naming-conventions>
- <http://wiki.c2.com/?IntentionRevealingNames>
- <http://wiki.c2.com/?IntentionRevealingSelector>
- <http://www.outofscope.com/name-with-intention-not-implementation/>
- <http://www.cs.uakron.edu/~chanc/CS490/SeniorSeminar2012/Lecture%202%20-%20Program%20Style/programming%20style.pdf>
- <https://signalvnoise.com/posts/3531-intention-revealing-methods>
- <https://signalvnoise.com/posts/3250-clarity-over-brevity-in-variable-and-method-names>
- <http://wiki.c2.com/?TheWhatButNotTheWhy>
- <http://wiki.c2.com/?DontNameClassesObjectManagerHandlerOrData>
- <https://blog.codinghorror.com/i-shall-call-it-somethingmanager/>
- <http://stackoverflow.com/questions/1866794/naming-classes-how-to-avoid-calling-everything-a-whatevermanager>
- <http://www.sandywalsh.com/2010/04/am-i-bad-man-for-naming-my-classes.html>
- <https://blog.goyello.com/2013/05/17/express-names-in-code-bad-vs-clean/>
- <http://www.itiseezee.com/?p=83>
- <http://javarevisited.blogspot.com/2014/10/10-java-best-practices-to-name-variables-methods-classes-packages.html>
- <http://www.carlopescio.com/2011/04/your-coding-conventions-are-hurting-you.html>
- <http://ontologydesignpatterns.org/wiki/Submissions:ContentOPs>
- <http://www.yesodweb.com/blog/2011/12/variable-naming-context>
- <http://breckyunits.com/naming-things.html>
- <http://slidedeck.io/hoontw/naming-things>
- <https://medium.com/@cavill/how-to-name-your-product-876f78b959d4#.rb65jb5ju>
- <https://www.freshconsulting.com/development-principle-1-choose-appropriate-variable-names/>
