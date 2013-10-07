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

subheader "Copying test post"
cp -v $WORKING_DIR/test/support/hello-world.md source/_posts/

subheader "Copying test configuration."
cp -v $WORKING_DIR/test/support/_maxcdn.yml .

subheader "Running hexo generate."
../node_modules/.bin/hexo generate --debug

header "Running Test Suite"

function run_tests {
  # `assert_file` periodically fails (opened: https://github.com/jmervine/CLIunit/issues/3),
  # commenting this out as all other tests will fail if the generator fails
  #
  #assert_file "/tmp/hexo-maxcdn-integration/test_blog/_maxcdn.yml", "generator failed"

  COMMAND="cat /tmp/hexo-maxcdn-integration/test_blog/public/2013/10/06/hello-world/index.html"

  # helper tests
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/helper\.css.*stylesheet" "helper: css failed"
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/helper\.ico.*icon" "helper: ico failed"

  assert_grep "$COMMAND" "<script.*\/\/you\.maxcdn\.com\/helper\.js.*text\/javascript" "helper: js failed"

  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.bmp" "helper: bmp failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.gif" "helper: gif failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.jpg" "helper: jpg failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.jpeg" "helper: jpeg failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.png" "helper: png failed"

  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/tag\.pdf" "helper: pdf failed"
  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/tag\.svg.*image\/svg" "helper: svg failed"

  # tag tests
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/tag\.css.*stylesheet" "tag: css failed"
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/tag\.ico.*icon" "tag: ico failed"

  assert_grep "$COMMAND" "<script.*\/\/you\.maxcdn\.com\/tag\.js.*text\/javascript" "tag: js failed"

  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.bmp" "tag: bmp failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.gif" "tag: gif failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.jpg" "tag: jpg failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.jpeg" "tag: jpeg failed"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.png" "tag: png failed"

  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/tag\.pdf" "tag: pdf failed"
  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/tag\.svg.*image\/svg" "tag: svg failed"

  # tag tests w/ attrs
  assert_grep "$COMMAND" "<img.*/tag-with-attrs\.gif.*zfirst='1'" "tag with attrs failed"
  assert_grep "$COMMAND" "<img.*/tag-with-attrs\.gif.*zsecond='2'" "tag with attrs failed on single quote"
  assert_grep "$COMMAND" "<img.*/tag-with-attrs\.gif.*zthrid='3'" "tag with attrs failed on double quote"
}

source $WORKING_DIR/test/support/CLIunit.sh

