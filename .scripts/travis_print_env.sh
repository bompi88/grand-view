#!/usr/bin/env bash

# System info
uname -a

# print environment variables
printenv

# build output files
tree .dist -L 2
tree .releases -L 2

# build tool versions
npm --version
meteor --version
node --version
g++ -v
gcc -v
