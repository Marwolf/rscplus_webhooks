// Static config options
var USER_REPO = "rscplus"; // Your github repo
var USER_BRANCH = "master"; // Your branch within the repository

// Copy config if it isn't made yet
var fs = require('fs-extra');
try {
  fs.statSync("./config.js");
} catch(e) {
  fs.copySync("./data/config_default.js", "./config.js");
  console.log("config.js created with defaults");
}

var config = require('./config.js');
var http = require('http');
var createHandler = require('github-webhook-handler');
var handler = createHandler({ path: '/webhook', secret: config.SECRET });
var GitHub = require('github-api');
var discord = require('discord.js');
var child_process = require('child_process');

var release_ready = false;
var tag_ready = false;

if(!config.RUN) {
  console.log("Please edit config.js before running!");
  process.exit();
}

var discord_client = new discord.Client();
discord_client.login(config.DISCORD_TOKEN);

discord_client.on('ready', () => {
  discord_send("Hello world, I'm back!");
  console.log("Discord bot connected");
});

function discord_announce(message) {
  const channel = discord_client.channels.find("name", "announcements");
  channel.send(message);
}

function discord_send(message) {
  const channel = discord_client.channels.find("name", "general-chat");
  channel.send(message);
}

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
    if(config.UPLOAD_BUILD) {
      child_process.spawnSync('sh', ['scripts/upload.sh', config.USER_NAME, config.USER_PASS, USER_REPO], {stdio: 'inherit'});
    }
    discord_send("rscplus has been updated!");
  });
  release_ready = false;
  tag_ready = false;
}

child_process.spawnSync('sh', ['scripts/init.sh', config.USER_NAME, USER_REPO], {stdio: 'inherit'});

http.createServer(function(req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(config.PORT);

handler.on('error', function(err) {
  console.error('Error:', err.message);
});

handler.on('push', function (event) {
  var repo = event.payload.repository.full_name;
  var branch = event.payload.ref.substring(11);
  var forced = event.payload.forced;

  if(repo != (config.USER_NAME + "/" + USER_REPO) || branch != USER_BRANCH) {
    return;
  }

  console.log('Received a push event for %s to %s', repo, branch);

  if(forced == false) {
    // Update our repository, we havn't updated the version yet
    console.log("Running updater...");
    child_process.spawnSync('sh', ['scripts/update.sh', config.USER_NAME, USER_REPO, config.USER_PASS, config.USER_EMAIL, config.USER_REALNAME, USER_BRANCH, config.HTTP_DIRECTORY], {stdio: 'inherit'});
    return;
  }

  console.log("Running release...");

  // Build the project
  if(config.UPLOAD_BUILD) {
    child_process.spawnSync('sh', ['scripts/build.sh', config.HTTP_DIRECTORY], {stdio: 'inherit'});
  }

  var gh = new GitHub({
    username: config.USER_NAME,
    password: config.USER_PASS
  });

  var repo = gh.getRepo(config.USER_NAME, USER_REPO);

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
