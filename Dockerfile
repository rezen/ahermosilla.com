FROM ruby:3.2.2-bullseye
RUN mkdir /app && gem install bundler:2.4.22
WORKDIR /app
COPY Gemfile  Gemfile.lock ./
RUN bundler install && bundle update --bundler
COPY . /app
EXPOSE 4000
RUN bundler exec jekyll build
CMD sh -c 'bundler exec jekyll serve  --force_polling  --host=0.0.0.0'