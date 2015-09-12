web: bundle exec rails server -p $PORT
web: lein run -m demo.web $PORT
web: sh target/bin/webapp
worker:  bundle exec rake jobs:work
