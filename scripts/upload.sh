#!/bin/sh

# $1 - GitHub username
# $2 - GitHub password
# $3 - GitHub repository
# $4 - GitHub owner

response=$(curl --silent https://api.github.com/repos/$4/$3/releases/tags/Latest)
release_id=$(echo $response | grep -Po '"id"\s*:\s*\K\d+' | head -1)

# Package windows build
rm -rf rscplus/dist/rscplus-windows.zip
cp data/windows_wrapper.zip rscplus/dist/rscplus-windows.zip
cd rscplus/dist
zip -u rscplus-windows.zip rscplus.jar

if [ -e rscplus.jar ]; then
  curl --user "$1:$2" \
       -H "Content-Type: application/zip" \
       --request POST \
       --data-binary "@rscplus.jar" \
       https://uploads.github.com/repos/$4/$3/releases/$release_id/assets?name=rscplus.jar
fi

if [ -e rscplus-windows.zip ]; then
  curl --user "$1:$2" \
       -H "Content-Type: application/zip" \
       --request POST \
       --data-binary "@rscplus-windows.zip" \
       https://uploads.github.com/repos/$4/$3/releases/$release_id/assets?name=rscplus-windows.zip
fi
