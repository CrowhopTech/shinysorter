#!/bin/bash

set -ex

# If TARGET_BASE_PATH is empty then replace with empty string
if [[ -z "${TARGET_BASE_PATH}" ]]; then
  sed -i "s|/replacemebasehref||g" /etc/nginx/conf.d/*
  sed -i "s|/replacemebasehref||g" /etc/nginx/html/index.html
else
  sed -i "s|replacemebasehref|${TARGET_BASE_PATH}|g" /etc/nginx/conf.d/*
  sed -i "s|replacemebasehref|${TARGET_BASE_PATH}|g" /etc/nginx/html/index.html
fi
