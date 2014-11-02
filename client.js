/*global App, document, window */
'use strict';
var React = require('react/addons');
var Fetcher = require('fetchr');
var Application = require('./App');
var fetcher = new Fetcher({
    xhrPath: Application.config.xhrPath
});
var dehydratedState = App && App.Context;
dehydratedState.fetcher = fetcher;

window.React = React; // For chrome dev tool support

var application = new Application(dehydratedState);
window.context = application.context;

var app = application.getComponent();
var mountNode = document.getElementById('app');

React.render(app, mountNode);
