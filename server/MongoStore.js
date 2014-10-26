var amqpConf = require('../configs/amqp');
var debug = require('debug')('Shoutbox:MongoStore');
var appConf = require('../configs/app');
var Message = require('../models/Message');


function storeMessage(channel, msg) {
  var messageObj = JSON.parse(msg.content.toString());
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
  return amqpConf.messages(amqpOpen)
    .then(function (channel) {
      debug('Setting up queue');
      return channel.assertQueue('messages')
        .then(function (qok) {
          debug('Binding queue');
          return channel.bindQueue(qok.queue, appConf.messagesExchange, '')
            .then(function () {
              debug('Bound queue %s', qok.queue);
              return qok.queue;
            }, debug);
        }, debug)
        .then(function (queue) {
          debug('Consuming queue');
          channel.consume(queue, storeMessage.bind(null, channel));
        }, debug);
    }, debug);
}

module.exports = MongoStore;
