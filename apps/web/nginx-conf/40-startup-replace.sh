#!/bin/bash

set -ex

sed -i "s|replacemebasehref|${TARGET_BASE_PATH}|g" /etc/nginx/html/index.html
sed -i "s|replacemebasehref|${TARGET_BASE_PATH}|g" /etc/nginx/conf.d/*