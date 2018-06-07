'use strict';
var async = require('async');
var fs = require('fs');

module.exports = (app) => {
  var abDS = app.dataSources.abDS;
  const data = JSON.parse(
    fs.readFileSync('./data/dummy_data.json', {
      encoding: 'utf8',
    }));

  if (process.env.NODE_ENV === 'Development') {
    console.log('***** Generating dummy data');
    async.parallel({
      logins: async.apply(createLoginUsers),
      users: async.apply(createUsers),
      files: async.apply(createFiles),
    }, (err, results) => {
      if (err) throw err;
      createFileRequests(results.users, results.files, (err) => {
        console.log('***** Generating dummy data done');
      });
    });
  }

  // creat login user
  function createLoginUsers(cb) {
    abDS.automigrate('user', (err) => {
      if (err) return cb(err);
      var user = app.models.user;
      user.create([data.user], cb);
    });
  }

  // create users
  function createUsers(cb) {
    abDS.automigrate('abUser', (err) => {
      if (err) return cb(err);
      var user = app.models.abUser;
      user.create(data.cbUsers, cb);
    });
  }

  // create files
  function createFiles(cb) {
    abDS.automigrate('file', (err) => {
      if (err) return cb(err);
      var file = app.models.file;
      file.create(data.files, cb);
    });
  };
  // create FileRequests
  function createFileRequests(users, files, cb) {
    abDS.automigrate('fileRequest', (err) => {
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
};
