#!/bin/sh

git checkout develop
bundler install
bundler exec jekyll build

cp -rf _site/* ./
rm -rf _*
rm *.md
rm Gemfile Gemfile.lock Dockerfile
git stash
# git config --global user.email "$GITHUB_ACTOR@users.noreply.github.com"
# git config --global user.name "$GITHUB_ACTOR"
git checkout master
git stash pop
git add .
git commit -m "Updating build branch"
git push -f origin master