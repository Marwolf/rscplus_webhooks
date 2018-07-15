#!/bin/sh

# $1 - GitHub username
# $2 - GitHub password
# $3 - GitHub repository

response=$(curl --silent https://api.github.com/repos/$1/$3/releases/tags/Latest)
release_id=$(echo $response | grep -Po '"id"\s*:\s*\K\d+' | head -1)

curl --user "$1:$2" \
     -H "Content-Type: application/zip" \
     --request POST \
     --data-binary "@rscplus/dist/rscplus.jar" \
     https://uploads.github.com/repos/$1/$3/releases/$release_id/assets?name=rscplus.jar

curl --user "$1:$2" \
     -H "Content-Type: application/zip" \
     --request POST \
     --data-binary "@rscplus/dist/rscplus-windows.zip" \
     https://uploads.github.com/repos/$1/$3/releases/$release_id/assets?name=rscplus-windows.zip
