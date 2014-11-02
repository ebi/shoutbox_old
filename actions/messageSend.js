'use strict';

var debug = require('debug')('Shoutbox:messageSend');

module.exports = function (context, payload, done) {
  context.dispatch('MESSAGE_SEND_START');
  debug('Sending message');
  context.fetcher.create('messages', payload, {}, function (err) {
    if (err) {
      context.dispatch('MESSAGE_SEND_ERROR', err);
    } else {
      context.dispatch('MESSAGE_SEND_SUCCESS');
    }
    context.dispatch('MESSAGE_SEND_END');
    done();
  });
};
