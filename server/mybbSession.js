var _ = require('underscore');
var cookie = require('cookie');
var debug = require('debug')('Shoutbox:mybbSession');
var raiseUrls = require('../configs/raiseUrls');
var request = require('superagent');
var RSVP = require('rsvp');

module.exports = function (username, password) {
  return new RSVP.Promise(function (resolve, reject) {
    debug('Login attemp for', username);
    request
      .post(raiseUrls.login)
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

            resolve({
              mybbuser: superCookie.mybbuser,
              sid: superCookie.sid,
            });
          } else {
            debug('Login Attemp Failed for', username);
            reject();
          }
        }
      });
  });
};
