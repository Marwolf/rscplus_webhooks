#!/bin/sh

# $1 - GitHub username
# $2 - GitHub repository
# $3 - GitHub password
# $4 - GitHub email
# $5 - GitHub real name
# $6 - GitHub branch

# Update repo
cd rscplus
git fetch origin
git reset --hard origin/$6

# Update rscplus version
ant setversion
git add src/Client/Settings.java

# Format source code
ant format-source
git add **/**.java

# Update repository with our copy
git config user.email "$4"
git config user.name "$5"
git commit --amend --no-edit
git push -f https://$1:$3@github.com/$1/$2

exit 0
