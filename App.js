'use strict';

var React = require('react/addons');
var Application = React.createFactory(require('./components/Application.jsx'));
var Context = require('./Context');
var debug = require('debug')('Shoutbox:App');
var ApplicationStore = require('./stores/ApplicationStore');
var MessagesStore = require('./stores/MessagesStore');
var routes = require('./configs/routes');

Context.registerStore(ApplicationStore);
Context.registerStore(MessagesStore);

function App(initialState) {
  debug('Creating App');
  this.context = new Context({
    fetcher: initialState.fetcher,
    routes: routes,
  });
  if (initialState) {
    debug('Rehydrating context');
    this.context.rehydrate(initialState);
  }
}

App.prototype.getComponent = function () {
  debug('Creating Application component');
  var appComponent = new Application({
    context: this.context.getComponentContext()
  });
  debug('Rendering Application component');
  return appComponent;
};


module.exports = App;
module.exports.config = {
  xhrPath: '/api',
};
