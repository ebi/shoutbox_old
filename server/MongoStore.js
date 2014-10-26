var amqpConf = require('../configs/amqp');
var debug = require('debug')('Shoutbox:MongoStore');
var Message = require('../models/Message');
var messageUtil = require('../utils/message');

function storeMessage(channel, msg) {
  var messageObj = messageUtil.parse(msg);
  debug('Saving message %s', messageObj.id);
  var message = new Message(messageObj);
  message.save(function (err) {
    if (err && err.code !== 11000) {
      debug('Could not save %s', msg);
      return;
    }
    channel.ack(msg);
  });
}

function MongoStore(amqpOpen) {
  debug('Setting up mongo store');
  return amqpConf.messagesChannel(amqpOpen)
    .then(function (channel) {
      var queue = {
        name: 'messages',
      };
      return amqpConf.messagesConsumer(channel, queue, storeMessage);
    }, debug);
}

module.exports = MongoStore;
