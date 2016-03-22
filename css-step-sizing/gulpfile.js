/*
Installation:
1. Install node.js.
2. `npm install`
3. (optional) Install gulp globally so it'll be on your path:
   `sudo npm install -g gulp`

Then run `gulp` and save `Overview.bs`
for gulp to run bikeshed and refresh your browser.
*/

var gulp = require("gulp");

gulp.task("default", ["preview"]);

gulp.task("bikeshed", function () {
  return bikeshed();
});

gulp.task("watch", function () {
  gulp.watch("*.bs", function () {
    bikeshed();
  });
});

gulp.task("preview", ["bikeshed", "watch"], function () {
  var browserSync = require("browser-sync");
  browserSync({
    server: {
      baseDir: "..",
      directory: true,
    },
    files: ["*.html", "!~*"],
    startPath: "css-step-sizing/Overview.html",
  });
});

var try_local_bikeshed_first = true;

function bikeshed() {
  return new Promise(bikeshed_cb);
}

function bikeshed_cb(resolve, reject) {
  if (!try_local_bikeshed_first)
    return bikeshed_online_cb(resolve, reject);
  bikeshed_local_cb(resolve, function (e) {
    if (e.code == "ENOENT") { // bikeshed not installed locally.
      console.log("Local bikeshed not found, switch to online version of bikeshed.");
      try_local_bikeshed_first = false; // prefer online for future calls.
      bikeshed_online_cb(resolve, reject);
      return;
    }
    reject(e);
  });
}

function bikeshed_local_cb(resolve, reject) {
  var spawn = require('child_process').spawn;
  spawn("bikeshed", [], {
    stdio: "inherit"
  }).on("error", function (e) {
    // ENOENT doesn't fire "close" and throws without on("error")
    reject(e);
  }).on("close", function (code) {
    if (code) {
      console.log("Local bikeshed exited with code:", code);
      // No need to reject() because on("error") also fires.
      return;
    }
    return resolve();
  });
}

function bikeshed_online_cb(resolve, reject) {
  var fs = require("fs");
  var request = require('request');
  // gulp.watch() kicks in when pipe() creates the file,
  // so write to a temp file and move it.
  var tmpfile = "~Overview.html";
  request.post({
    url: "http://api.csswg.org/bikeshed/",
    formData: {
      file: fs.createReadStream("Overview.bs"),
    },
  }).on("error", function (err) {
    reject(err);
  }).pipe(fs.createWriteStream(tmpfile))
  .on("finish", function () {
    fs.rename(tmpfile, "Overview.html", function (err) {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
}
