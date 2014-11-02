var debug = require('debug')('Shoutbox:MessagesStore');
var BaseStore = require('dispatchr/utils/BaseStore');
var util = require('util');

function MessagesStore(dispatcher) {
    this.dispatcher = dispatcher;
    this.messages = [];
    this.messageIds = [];
    this.listeners = 0;
    this.sendStatus = false;
}

MessagesStore.storeName = 'MessagesStore';

util.inherits(MessagesStore, BaseStore);

MessagesStore.handlers = {
    'RECEIVE_MESSAGES': 'receiveMessages',
    'CREATED_SOCKET': 'storeSocket',
    'REMOVE_SOCKET': 'removeSocket',
    'START_MESSAGE_LISTENER': 'addListener',
    'STOP_MESSAGE_LISTENER': 'removeListener',
    'MESSAGE_SEND_START': 'sendStart',
    'MESSAGE_SEND_SUCCESS': 'sendSuccess',
    'MESSAGE_SEND_ERROR': 'sendError',
};

MessagesStore.prototype.receiveMessages = function receiveMessages (messages) {
    debug('Received messages', messages);
    var msgs = messages.messages;
    msgs = msgs.sort(function sortMessages (a, b) {
        return a.id - b.id;
    });

    msgs.forEach(function pushMessages (msg) {
        if (this.messageIds.indexOf(msg.id) === -1) {
            this.messages.push(msg);
            this.messageIds.push(msg.id);
        }
    }, this);
    this.emitChange();
};

MessagesStore.prototype.sendStart = function sendStart () {
  this.sendStatus = 'progress';
  this.emitChange();
};

MessagesStore.prototype.sendSuccess = function sendSuccess () {
  this.sendStatus = 'success';
  this.emitChange();
};

MessagesStore.prototype.sendError = function sendError () {
  this.sendStatus = 'error';
  this.emitChange();
};

MessagesStore.prototype.getSendStatus = function getSendStatus () {
  return this.sendStatus;
};

MessagesStore.prototype.storeSocket = function storeSocket (socket) {
    this.socket = socket;
    socket.on('disconnect', function disconnectedSocket () {
        this.socket = null;
    }.bind(this));
};

MessagesStore.prototype.removeSocket = function removeSocket () {
    this.socket = null;
};

MessagesStore.prototype.getSocket = function getSocket () {
    return this.socket;
};

MessagesStore.prototype.getListeners = function getListeners () {
    return this.listeners;
};

MessagesStore.prototype.addListener = function addListener () {
    this.listeners += 1;
    return this.listeners;
};

MessagesStore.prototype.removeListener = function removeListener () {
    this.listeners -= 1;
    return this.listeners;
};

MessagesStore.prototype.getMessagePoller = function getMessagePoller () {
    return this.poller;
};

MessagesStore.prototype.setMessagePoller = function setMessagePoller (poller) {
    this.poller = poller;
};

MessagesStore.prototype.lastID = function lastId () {
    var len = this.messages.length;
    if (len === 0) {
        return 0;
    }

    return this.messages[len - 1].id;
};

MessagesStore.prototype.getAllMessages = function getAllMessages () {
    return this.messages;
};

MessagesStore.prototype.dehydrate = function dehydrate () {
    return {
        messages: this.messages,
    };
};

MessagesStore.prototype.rehydrate = function hydrate (state) {
    this.messages = state.messages;
};

module.exports = MessagesStore;
