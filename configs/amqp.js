var debug = require('debug')('Shoutbox:amqp');

module.exports = {
  messages: function messages(amqpOpen) {
    return amqpOpen
      .then(function (conn) {
        debug('Creating rabbitmq channel');
        return conn.createChannel();
      }, debug)
      .then(function (channel) {
        debug('Asserting rabbitmq exchange');
        return channel.assertExchange('messages', 'fanout', { durable: true })
          .then(function () {
            debug('Rabbitmq setup');
            return channel;
          }, debug);
      });
  },
};
