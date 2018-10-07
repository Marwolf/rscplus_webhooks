#!/bin/sh

# $1 - GitHub username
# $2 - GitHub repository
# $3 - GitHub password
# $4 - GitHub email
# $5 - GitHub real name
# $6 - GitHub branch
# $7 - HTTP server directory
# $8 - Repo Owner

# Update repo
cd rscplus
git fetch origin
git reset --hard origin/$6

# Update rscplus version
ant setversion > $7/setversion.log
git add src/Client/Settings.java

# Format source code
ant format-source > $7/format-source.log
git add **/**.java

# Update repository with our copy
git config user.email "$4"
git config user.name "$5"
git commit -m "Automated version update and source format"
git push https://$1:$3@github.com/$8/$2

exit 0
