var _ = require('underscore');
var URL_BLACKLIST = [
  '/favicon.ico',
  '/login',
];

module.exports = function (req, res, next) {
  if (req.session.validated) {
    return next();
  }

  var url = req.originalUrl;
  var backUrl = !_.contains(URL_BLACKLIST, url) ? url : '/';
  req.session.originalUrl = backUrl;
  res.redirect('/login');
};
