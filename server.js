require('node-jsx').install({ extension: '.jsx' });

var Application = require('./app');
var debug = require('debug')('Shoutbox');
var express = require('express');
var expressState = require('express-state');
var navigateAction = require('flux-router-component').navigateAction;
var React = require('react/addons');

debug('Initializing server');
var app = express();
expressState.extend(app);
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/build'));

app.use(function (req, res, next) {
    var application = new Application();

    debug('Executing navigate action');
    application.context.getActionContext().executeAction(navigateAction, {
        path: req.url
    }, function (err) {
        if (err) {
            if (err.status && err.status === 404) {
                next();
            } else {
                next(err);
            }
            return;
        }
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

const PORT = process.env.PORT || 3030;
app.listen(PORT);
debug('Listening on port: ' + PORT);
