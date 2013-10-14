#!/usr/bin/env bash

WORKING_DIR="$(pwd)"

# setup
##
function before {
  echo "Setup:"
  tmp=$(mktemp -d /tmp/hexo-maxcdn.XXXXX)
  echo " > creating $tmp"
  cd $tmp
}

function after {
  echo "Cleanup:"
  echo " > removing $tmp"
  rm -rf $tmp
}

# tests
##
function run_tests {
  assert "npm install hexo --silent" "hexo install failed"
  assert "./node_modules/.bin/hexo init test_blog" "hexo init failed"
  assert_dir "test_blog" "hexo init failed"
  cd test_blog

  assert "npm install $WORKING_DIR --silent" "maxcdn plugin install failed"

  cp $WORKING_DIR/test/support/after_footer.ejs themes/light/layout/_partial/
  cp $WORKING_DIR/test/support/hello-world.md source/_posts/
  cp $WORKING_DIR/test/support/_maxcdn.yml .
  assert_file "_maxcdn.yml" \
                "failed to copy _maxcdn.yml"

  export NODE_ENV=test

  assert "../node_modules/.bin/hexo generate" "hexo generation failed"

  unset NODE_ENV

  COMMAND="cat $tmp/test_blog/public/2013/10/06/hello-world/index.html"

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

# vim: ft=sh:
