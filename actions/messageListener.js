var debug = require('debug')('Shoutbox:messageListener');
var MessageStore = require('../stores/MessagesStore');
var SocketIO     = require('socket.io-client');

function listenToMessage(context, socket) {
  debug('Listening for messages');
  socket.on('message', function (message) {
    context.dispatch('RECEIVE_MESSAGES', message);
  });
}

var MessageListener = {};

MessageListener.startListening = function startListening (context, payload, done) { // jshint ignore:line
  debug('Setting up listener');
  context.dispatch('START_MESSAGE_LISTENER');
  var messageStore = context.getStore(MessageStore);
  var socket = messageStore.getSocket();
  if (! socket) {
    debug('Creating new socket');
    socket = SocketIO.connect();
    socket.on('connect', function () {
      context.dispatch('CREATED_SOCKET', socket);
      context.dispatch('STARTED_MESSAGE_LISTENER');
      listenToMessage(context, socket);
      done();
    });
    return;
  }
  debug('Reusing socket');
  context.dispatch('STARTED_MESSAGE_LISTENER');
  listenToMessage(context, socket);
  done();
};

MessageListener.stopListening = function stopListening (context, payload, done) { // jshint ignore:line
  context.dispatch('STOP_MESSAGE_LISTENER');
  var messageStore = context.getStore(MessageStore);
  if (messageStore.getListeners === 0) {
    debug('Closing socket');
    context.dispatch('REMOVE_SOCKET');
  }
  done();
};

module.exports= MessageListener;
