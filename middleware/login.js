var _ = require('underscore');
var cookie = require('cookie');
var debug = require('debug')('Shoutbox:Login');
var request = require('superagent');
var RSVP = require('rsvp');

function getMybbSession (session, username, password) {
  return new RSVP.Promise(function (resolve, reject) {
    debug('Login attemp for', username);
    request
      .post('http://raise.ch/forum/member.php')
      .type('form')
      .send({
        action: 'do_login',
        remember: 'yes',
        username: username,
        password: password,
      })
      .end(function (err, res) {
        if (err) {
          debug('Login Failure', err);
          reject(err);
        } else {
          var cookies = res.header['set-cookie'].map(cookie.parse);
          var superCookie = _.extend.apply(_, cookies);
          debug(superCookie);
          if (superCookie.mybbuser && superCookie.sid) {
            debug('Login Attemp Successful for', username);
            session.mybbuser = superCookie.mybbuser;
            session.sid = superCookie.sid;
            session.validated = true;
            resolve();
          } else {
            debug('Login Attemp Failed for', username);
            reject();
          }
        }
      });
  });
}

module.exports = function (req, res) {
  var user = req.body.username;
  var pass = req.body.password;

  var redirect = function () {
    var url = req.session.originalUrl || '/';
    debug('Session validated redirecting', url);
    return res.redirect(url);
  };

  var renderForm = function () {
    debug('Rendering login form');

    res.render('login', {
      user: user,
      pass: pass,
    }, function (err, markup) {
      if (err) {
        return debug(err);
      }

      debug('Sending markup');
      res.send(markup);
    });
  };

  if (req.session.validated) {
    redirect();
  }

  if (req.method === 'POST') {
    getMybbSession(req.session, user, pass)
      .then(redirect, renderForm);
  } else {
    renderForm();
  }
};
