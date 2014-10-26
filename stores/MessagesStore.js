var debug = require('debug')('Shoutbox:MessagesStore');
var BaseStore = require('dispatchr/utils/BaseStore');
var util = require('util');

function MessagesStore(dispatcher) {
    this.dispatcher = dispatcher;
    this.messages = [];
}

MessagesStore.storeName = 'MessagesStore';

util.inherits(MessagesStore, BaseStore);

MessagesStore.handlers = {
    'RECEIVE_MESSAGES': 'receiveMessages',
};

MessagesStore.prototype.receiveMessages = function receiveMessages (messages) {
    debug('Received messages', messages);
    var msgs = messages.messages;
    msgs = msgs.sort(function sortMessages (a, b) {
        return a.id - b.id;
    });

    msgs.forEach(function pushMessages (msg) {
        this.messages.push(msg);
    }, this);
    this.emitChange();
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
