'use strict';

module.exports = function(server) {
  var router = server.loopback.Router();
  var User = server.models.user;
  var AccessToken = server.models.AccessToken;

  // Install a `/` route that returns server status
  router.get('/', server.loopback.status());

  // log a user in
  router.post('/login', function(req, res) {
    // console.log(req);
    User.login({
      email: req.body.email,
      password: req.body.password,
    }, 'user', function(err, token) {
      if (err) {
        res.writeHead(401, {'Content-Type': 'text/plain'});
        res.end('Login failed. Wrong username or password');
        return;
      }
      res.json(token);
    });
  });

  // log the user out
  router.get('/logout', function(req, res, next) {
    // console.log(req.accessToken);
    if (!req.accessToken) return res.sendStatus(401);
    User.logout(req.accessToken.id, function(err) {
      if (err) return next(err);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('user logged out.');
    });
  });

  server.use(router);
};
