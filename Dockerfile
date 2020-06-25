FROM ruby:2.7.0-buster
RUN mkdir /app && gem install bundler
WORKDIR /app
COPY Gemfile ./
RUN bundler install && bundle update --bundler
COPY . /app
RUN bundler exec jekyll build