'use strict';

var Application = require('./components/Application.jsx');
var Context = require('./Context');
var debug = require('debug')('Shoutbox:App');
var routes = require('./configs/routes');

function App(initialState) {
  debug('Creating App');
  this.context = new Context({
        routes: routes
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
