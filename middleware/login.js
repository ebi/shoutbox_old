var debug = require('debug')('Shoutbox:Login');
var mybbSession = require('../server/mybbSession');

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
    mybbSession(req.session, user, pass)
      .then(function (mybb) {
        req.session.mybbuser = mybb.mybbuser;
        req.session.sid = mybb.sid;
        req.session.validated = true;
      }, renderForm);
  } else {
    renderForm();
  }
};
