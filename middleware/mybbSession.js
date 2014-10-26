module.exports = function (req, res, next) {
  if (req.session.validated) {
    return next();
  }

  var backUrl = req.originalUrl !== '/login' ? req.originalUrl : '/';
  req.session.originalUrl = backUrl;
  res.redirect('/login');
};
