#!/bin/sh
C='\033[30m\033[42m'
NC='\033[0m'

echo "${C} NOTE ${NC} Compiling ts files"
npx tsc
