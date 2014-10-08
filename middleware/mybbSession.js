module.exports = function (req, res, next) {
  if (req.session.validated) {
    return next();
  }

  var mybbuser = req.session.mybbuser;
  var sid = req.session.sid;
  var backUrl = req.originalUrl !== '/login' ? req.originalUrl : '/';
  req.session.originalUrl = backUrl;
  res.redirect('/login');
};
