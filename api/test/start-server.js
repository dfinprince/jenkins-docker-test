'use strict';
var async = require('async');
var app = require('../server/server');
var fs = require('fs');

module.exports = function() {
  const data = JSON.parse(
    fs.readFileSync('./data/dummy_data.json', {encoding: 'utf8'}));
  return {
    start: () => {
      return new Promise((resolve) => {
        initialize().then(() => {
          resolve(app.start());
        });
      });
    },
    stop: () => {
      return app.stop();
    },
    data: () => {
      return data;
    },
  };

  function initialize() {
    var abDS = app.dataSources.abDS;

    return new Promise((resolve) => {
      if (process.env.NODE_ENV === 'Test') {
        console.log('***** Generating test data');
        async.parallel({
          logins: async.apply(createLoginUsers),
          users: async.apply(createUsers),
          files: async.apply(createFiles),
        }, function(err, results) {
          if (err) throw err;
          createFileRequests(results.users, results.files, function(err) {
            if (!err) {
              console.log('***** Generating test data done');
            }
            resolve();
          });
        });
      } else {
        resolve();
      }
    });

    // creat login user
    function createLoginUsers(cb) {
      abDS.automigrate('user', function(err) {
        if (err) return cb(err);
        var user = app.models.user;
        user.create([data.user], cb);
      });
    }

    // create users
    function createUsers(cb) {
      abDS.automigrate('abUser', function(err) {
        if (err) return cb(err);
        var user = app.models.abUser;
        user.create(data.cbUsers, cb);
      });
    }

    // create files
    function createFiles(cb) {
      abDS.automigrate('file', function(err) {
        if (err) return cb(err);
        var file = app.models.file;
        file.create(data.files, cb);
      });
    };

    // create FileRequests
    function createFileRequests(users, files, cb) {
      abDS.automigrate('fileRequest', function(err) {
        if (err) return cb(err);
        var fileRequest = app.models.fileRequest;
        var frs = data.fileRequests;
        frs[0].preparerUserId = users[0].id;
        frs[0].reviewerUserId = users[1].id;
        frs[0].fileIds = [files[0].id, files[1].id];
        frs[1].preparerUserId = users[2].id;
        frs[1].reviewerUserId = users[3].id;
        frs[1].fileIds = [files[0].id, files[1].id];

        fileRequest.create(frs, cb);
      });
    }
  }
};
