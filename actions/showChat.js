'use strict';

var debug = require('debug')('Shoutbox:showChatAction');

module.exports = function (context, payload, done) {
    context.dispatch('SHOW_CHAT_START');
    debug('fetching messages');
    context.fetcher.read('messages', {}, {}, function (err, messages) {
        context.dispatch('RECEIVE_MESSAGES', messages);
        debug('dispatching SHOW_CHAT_END');
        context.dispatch('SHOW_CHAT_END');
        done();
    });
};
