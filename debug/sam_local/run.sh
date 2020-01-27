#!/usr/bin/env bash
set -e
#find the location of the script, not the current directory
file="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#change to the script location, before continuing
pushd $file

sam local invoke "EchoLambda" -t lambda.yml --event event.json
popd
