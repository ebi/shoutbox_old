var debug = require('debug')('Shoutbox:amqp');
var appConf = require('../configs/app');

function messagesExchange(amqpOpen) {
  return amqpOpen
    .then(function (conn) {
      debug('Creating rabbitmq channel');
      return conn.createChannel();
    }, debug)
    .then(function (channel) {
      debug('Asserting rabbitmq exchange');
      return channel.assertExchange(appConf.messagesExchange, 'fanout',
                                    { durable: true })
        .then(function () {
          debug('Rabbitmq setup');
          return channel;
        }, debug);
    });
}

function messagesChannel(amqpOpen, cb) {
  debug('Setting up channel');
  return messagesExchange(amqpOpen)
    .then(cb, debug);
}

function messagesConsumer(channel, queue, cb) {
  debug('Setting up queue');
  return channel.assertQueue(queue.name, queue.options)
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
      channel.consume(queue, cb.bind(null, channel));
    }, debug);
}


module.exports = {
  messagesExchange: messagesExchange,
  messagesChannel: messagesChannel,
  messagesConsumer: messagesConsumer,
};
