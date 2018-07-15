// Config options
var USER_NAME = "<SET ME>"; // Your github username
var USER_PASS = "<SET ME>"; // Your github password
var USER_EMAIL = "<SET ME>"; // Your github email
var USER_REALNAME = "<SET ME>"; // Your real name
var SECRET = "<SET ME>"; // Github webhooks secret

// More config options
var USER_REPO = "rscplus"; // Your github repo
var USER_BRANCH = "master"; // Your branch within the repository
var UPLOAD_BUILD = false; // Upload build to release

// CODE STARTS HERE

var http = require('http');
var createHandler = require('github-webhook-handler');
var handler = createHandler({ path: '/webhook', secret: SECRET });
var GitHub = require('github-api');
var child_process = require('child_process');

var release_ready = false;
var tag_ready = false;

function repo_createRelease(repo) {
  if(!release_ready || !tag_ready) {
    return;
  }

  var createRelease_options = {
    tag_name: "Latest",
    target_commitish: USER_BRANCH,
    name: "Latest",
    body: "",
    draft: false,
    prerelease: false
  };

  repo.createRelease(createRelease_options, function(error, results) {
    console.log("release created");
    if(UPLOAD_BUILD) {
      console.log("warning: The script doesn't currently support build uploads");
    }
  });
  release_ready = false;
  tag_ready = false;
}

child_process.spawnSync('sh', ['init.sh', USER_NAME, USER_REPO], {stdio: 'inherit'});

http.createServer(function(req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(7777);

handler.on('error', function(err) {
  console.error('Error:', err.message);
});

handler.on('push', function (event) {
  var repo = event.payload.repository.full_name;
  var branch = event.payload.ref.substring(11);
  var forced = event.payload.forced;

  if(repo != (USER_NAME + "/" + USER_REPO) || branch != USER_BRANCH) {
    return;
  }

  console.log('Received a push event for %s to %s', repo, branch);

  if(forced == false) {
    // Update our repository, we havn't updated the version yet
    console.log("Running updater...");
    child_process.spawnSync('sh', ['update.sh', USER_NAME, USER_REPO, USER_PASS, USER_EMAIL, USER_REALNAME], {stdio: 'inherit'});
    return;
  }

  console.log("Running release...");

  // Build the project
  if(UPLOAD_BUILD) {
    child_process.spawnSync('sh', ['build.sh'], {stdio: 'inherit'});
  }

  var gh = new GitHub({
    username: USER_NAME,
    password: USER_PASS
  });

  var repo = gh.getRepo(USER_NAME, USER_REPO);

  repo.listReleases(function(err, result) {
    var release = result[0];
    if(release != null) {
      repo.deleteRelease(String(release.id), function() {
        console.log("Release deleted");
        release_ready = true;
        repo_createRelease(repo);
      });
    } else {
      release_ready = true;
      repo_createRelease(repo);
    }
  });

  repo.listTags(function(err, result) {
    var tag = result[0];
    if(tag != null) {
      repo.deleteRef("tags/" + tag.name, function() {
        console.log("Tag deleted");
        tag_ready = true;
        repo_createRelease(repo);
      });
    } else {
      tag_ready = true;
      repo_createRelase(repo);
    }
  });
})
