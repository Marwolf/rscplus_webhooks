#!/bin/sh

# $1 - HTTP server directory

cd rscplus
ant clean
ant test dist > $1/dist.log

exit 0
