/*
Installation:
1. Install node.js.
2. `npm install`
3. (optional) Install gulp globally so it'll be on your path:
   `sudo npm install -g gulp`

Then type `gulp` and make edits `Overview.bs`
to see in your browser.
*/

var gulp = require("gulp");

gulp.task("default", ["browser-sync"]);

gulp.task("bikeshed", function () {
  return bikeshed();
});

gulp.task("watch", function () {
  gulp.watch("*.bs", function () {
    bikeshed();
  });
});

gulp.task("browser-sync", ["watch"], function () {
  var browserSync = require("browser-sync");
  browserSync({
    server: {
      baseDir: "..",
      directory: true,
    },
    files: ["*.html", "!~*"],
    startPath: "css-snap-size/Overview.html",
  });
});

var use_local_bikeshed = true;

function bikeshed() {
  return new Promise(function (resolve, reject) {
    if (use_local_bikeshed)
      bikeshed_local_or_online_with_cb(resolve, reject);
    else
      bikeshed_online_with_cb(resolve, reject);
  });
}

function bikeshed_local_or_online_with_cb(resolve, reject) {
  var spawn = require('child_process').spawn;
  spawn("bikeshed", [], {
    stdio: "inherit"
  }).on("error", function (e) {
    // ENOENT doesn't fire "close" so need to handle here.
    // console.log("bikeshed error:", e);
    if (e.code == "ENOENT") { // bikeshed not installed locally.
      console.log("Local bikeshed not found, switch to online version of bikeshed.");
      use_local_bikeshed = false; // prefer online for future calls.
      bikeshed_online_with_cb(resolve, reject);
    } else
      reject(e);
  }).on("close", function (code) {
    if (!code)
      return resolve();
    console.log("Local bikeshed exited with code:", code);
    // No need to reject() because on("error") also fires.
  });
}

function bikeshed_online_with_cb(resolve, reject) {
  var fs = require("fs");
  var request = require('request');
  // gulp.watch() kicks in when pipe() creates the file,
  // so write to a temp file and move it.
  var tmp = "~Overview.html";
  var req = request.post({
    url: "http://api.csswg.org/bikeshed/",
    formData: {
      file: fs.createReadStream("Overview.bs"),
    },
  }).on("error", function (err) {
    reject(err);
  }).pipe(fs.createWriteStream(tmp))
  .on("finish", function () {
    fs.rename(tmp, "Overview.html", function (err) {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
}
