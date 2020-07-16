FROM ruby:2.7.0-buster
RUN mkdir /app && gem install bundler:1.17.1
WORKDIR /app
COPY Gemfile  Gemfile.lock ./
RUN bundler install && bundle update --bundler
COPY . /app
EXPOSE 4000
RUN bundler exec jekyll build
CMD sh -c 'bundler exec jekyll serve --host=0.0.0.0'