var debug = require('debug')('Shoutbox:ApplicationStore');
var EventEmitter = require('events').EventEmitter;
var routes = '../configs/routes';
var util = require('util');

function ApplicationStore() {
  debug('Setting up ApplicationStore');
  this.currentPageName = null;
  this.currentPage = null;
  this.currentRoute = null;
  this.pages = routes;
}

ApplicationStore.storeName = 'ApplicationStore';
ApplicationStore.handlers = {
  'CHANGE_ROUTE_START': 'handleNavigate'
};

util.inherits(ApplicationStore, EventEmitter);

ApplicationStore.prototype.handleNavigate = function (route) {
  var pageName = route.config.page,
  page = this.pages[pageName];

  if (pageName === this.getCurrentPageName()) {
    return;
  }

  this.currentPageName = pageName;
  this.currentPage = page;
  this.currentRoute = route;
  this.emit('change');
};

ApplicationStore.prototype.getCurrentPageName = function () {
  return this.currentPageName;
};

ApplicationStore.prototype.getState = function () {
  return {
    currentPageName: this.currentPageName,
    currentPage: this.currentPage,
    pages: this.pages,
    route: this.currentRoute
  };
};

ApplicationStore.prototype.dehydrate = function () {
  return this.getState();
};

ApplicationStore.prototype.rehydrate = function (state) {
  this.currentPageName = state.currentPageName;
  this.currentPage = state.currentPage;
  this.pages = state.pages;
  this.currentRoute = state.route;
};

module.exports = ApplicationStore;
