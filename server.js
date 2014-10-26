require('node-jsx').install({ extension: '.jsx' });

var appConf = require('./configs/app');
var Application = require('./App');
var bodyParser = require('body-parser');
var debug = require('debug')('Shoutbox');
var express = require('express');
var expressState = require('express-state');
var Fetcher = require('fetchr');
var login = require('./middleware/login');
var mongoose = require('mongoose');
var MongoStore = require('./server/MongoStore');
var mybbSession = require('./middleware/mybbSession');
var navigateAction = require('flux-router-component').navigateAction;
var React = require('react/addons');
var routes = require('./configs/routes');
var RSVP = require('RSVP');
var session = require('express-session');
var ShoutboxPoll = require('./server/ShoutboxPoll');

debug('Setting up redis');
if (process.env.REDISTOGO_URL) {
  var rtg   = require('url').parse(process.env.REDISTOGO_URL);
  var redis = require('redis').createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(':')[1]);
} else {
  var redis = require('redis').createClient();
}
var RedisStore = require('connect-redis')(session);

debug('Setting up rabbitmq');
var amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://localhost';
var amqpOpen = require('amqplib').connect(amqpUrl)
  .then(null, function () {
    debug('Could not connect to rabbitmq.');
    process.exit(1);
  });

debug('Setting up MongoDB');
var mongoUrl = process.env.MONGOHQ_URL || 'mongodb://localhost/shoutbox';
mongoose.connect(mongoUrl, function (err) {
  if (err) {
    debug('Could not connect to MongoDB');
  } else {
    debug('Setup MongoDB');
  }
});

debug('Setting up MongoStore Instance');
new MongoStore(amqpOpen)
  .then(function setupShoutboxPoll () {
    debug('Setting up ShoutboxPoll Instance');
    new ShoutboxPoll(amqpOpen);
  }, debug);

debug('Initializing server');
var app = express();
expressState.extend(app);
app.set('state namespace', 'App');
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/build'));
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: appConf.secret,
}));
app.use(bodyParser.urlencoded());

//Ensure Login
app.use('/login', login);
app.use(mybbSession);

//Fetchers
Fetcher.registerFetcher(require('./fetchers/messages'));
app.use(appConf.xhrPath, Fetcher.middleware());

// Isomorphic Side
app.use(function (req, res, next) {
  var fetcher = new Fetcher({
    req: req,
    xhrPath: appConf.xhrPath,
  });

  var application = new Application({
    fetcher: fetcher,
  });
  debug('Executing navigate action');
  application.context.getActionContext().executeAction(navigateAction, {
    session: req.session,
    path: req.url,
  }, function (err) {
    if (err) {
      if (err.status && err.status === 404) {
        next();
      } else {
        next(err);
      }
      return;
    }

    var context = application.context;
    var appStore = context.dispatcher.getStore('ApplicationStore');
    var pageName = appStore.getCurrentPageName();
    var currentRoute = routes[pageName];
    var waits = [];

    currentRoute.waitFor.forEach(function (wait) {
      var deferred = RSVP.defer();
      context.getActionContext().executeAction(wait, null, deferred.resolve);
      waits.push(deferred.promise);
    });

    RSVP.all(waits).then(function () {
      debug('Rendering Application component');
      var html = React.renderComponentToString(application.getComponent());
      debug('Exposing context state');
      res.expose(application.context.dehydrate(), 'Context');
      debug('Rendering application into layout');
      res.render('layout', {
        html: html
      }, function (err, markup) {
        if (err) {
          next(err);
        }
        debug('Sending markup');
        res.send(markup);
      });
    });
  });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT);
debug('Listening on port: ' + PORT);
