#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $DIR

docker build --platform linux/arm/v7 -t node14amazon .
cd ..
docker run --platform linux/arm/v7 -it -v ${PWD}/runtime/:/target/ node14amazon
chmod +x runtime/node
