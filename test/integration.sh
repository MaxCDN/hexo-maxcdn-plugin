#!/usr/bin/env bash

WORKING_DIR="$(pwd)"

function message() {
  echo " $1 "
}

function header() {
  echo " "
  echo "###########################################"
  message "$1"
  echo "###########################################"
  echo " "
}

function subheader() {
  echo " "
  message "$1"
  echo "-------------------------------------------"
}

header "Initializing Integration Environment"

message "Creating clean tmp directory."
test -d /tmp/hexo-maxcdn-integration && rm -rf /tmp/hexo-maxcdn-integration
mkdir /tmp/hexo-maxcdn-integration
cd /tmp/hexo-maxcdn-integration

echo "{ }" > package.json

subheader "Install hexo."
npm install hexo --save

subheader "Generating test_blog."
./node_modules/.bin/hexo init test_blog --debug
cd test_blog

subheader "Install hexo-maxcdn-plugin."
npm install $WORKING_DIR --save

subheader "Copying test template."
cp -v $WORKING_DIR/test/support/after_footer.ejs themes/light/layout/_partial/

subheader "Copying test configuration."
cp -v $WORKING_DIR/_maxcdn.yml .

subheader "Running hexo generate."
../node_modules/.bin/hexo generate --debug


header "Running Test Suite"

function run_tests {
  COMMAND="cat /tmp/hexo-maxcdn-integration/test_blog/public/index.html"

  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/helper\.css.*stylesheet" "css failed"
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/helper\.ico.*icon" "ico failed"

  assert_grep "$COMMAND" "<script.*\/\/you\.maxcdn\.com\/helper\.js.*text\/javascript" "js failed"

  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.bmp" "bmp failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.gif" "gif failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.jpg" "jpg failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.jpeg" "jpeg failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.png" "png failed"

  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/helper\.pdf" "pdf failed"
  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/helper\.svg.*image\/svg" "svg failed"
}

source $WORKING_DIR/test/support/CLIunit.sh

