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
  echo -e "\n\nCleanup:"
  echo " > removing $tmp"
  rm -rf $tmp
}

# tests
##
function run_tests {
  assert "npm install hexo --silent" "hexo install"
  assert "./node_modules/.bin/hexo init test_blog" "hexo init"
  assert_dir "test_blog" "hexo init"
  cd test_blog

  assert "npm install $WORKING_DIR --silent" "maxcdn plugin install"

  cp $WORKING_DIR/test/support/after_footer.ejs themes/light/layout/_partial/
  cp $WORKING_DIR/test/support/hello-world.md source/_posts/
  cp $WORKING_DIR/test/support/_maxcdn.yml .
  assert_file "_maxcdn.yml" \
                "failed to copy _maxcdn.yml"

  export NODE_ENV=test

  assert "../node_modules/.bin/hexo generate" "hexo generation"

  unset NODE_ENV

  COMMAND="cat $tmp/test_blog/public/2013/10/06/hello-world/index.html"

  # helper tests
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/helper\.css.*stylesheet" "helper: css"
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/helper\.ico.*icon" "helper: ico"

  assert_grep "$COMMAND" "<script.*\/\/you\.maxcdn\.com\/helper\.js.*text\/javascript" "helper: js"

  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.bmp" "helper: bmp"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.gif" "helper: gif"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.jpg" "helper: jpg"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.jpeg" "helper: jpeg"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/helper\.png" "helper: png"

  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/tag\.pdf" "helper: pdf"
  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/tag\.svg.*image\/svg" "helper: svg"

  # tag tests
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/tag\.css.*stylesheet" "tag: css"
  assert_grep "$COMMAND" "<link.*\/\/you\.maxcdn\.com\/tag\.ico.*icon" "tag: ico"

  assert_grep "$COMMAND" "<script.*\/\/you\.maxcdn\.com\/tag\.js.*text\/javascript" "tag: js"

  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.bmp" "tag: bmp"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.gif" "tag: gif"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.jpg" "tag: jpg"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.jpeg" "tag: jpeg"
  assert_grep "$COMMAND" "<img.*\/\/you\.maxcdn\.com\/tag\.png" "tag: png"

  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/tag\.pdf" "tag: pdf"
  assert_grep "$COMMAND" "<embed.*\/\/you\.maxcdn\.com\/tag\.svg.*image\/svg" "tag: svg"

  # tag tests w/ attrs
  assert_grep "$COMMAND" "<img.*/tag-with-attrs\.gif.*zfirst='1'" "tag with attrs"
  assert_grep "$COMMAND" "<img.*/tag-with-attrs\.gif.*zsecond='2'" "tag with attrs on single quote"
  assert_grep "$COMMAND" "<img.*/tag-with-attrs\.gif.*zthrid='3'" "tag with attrs on double quote"
}

# vim: ft=sh:
