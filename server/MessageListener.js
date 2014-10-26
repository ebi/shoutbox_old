var amqpConf = require('../configs/amqp');
var debug = require('debug')('Shoutbox:MessageListener');
var messageUtil = require('../utils/message');

module.exports = function MessageListener (amqpOpen, socket) {
  var queue = {
    name: '',
    options: {
      exclusive: true,
      autoDelete: true,
      noAck: true,
    },
  };
  debug('Setting up listener');
  amqpConf.messagesChannel(amqpOpen)
    .then(function (channel) {
      socket.on('disconnect', function () {
        channel.close();
      });
      amqpConf.messagesConsumer(channel, queue, function (channel, msg) {
        console.log(msg);
        var messageObj = messageUtil.parse(msg);
        socket.emit('message', { messages: [messageObj] });
      });
    });
};

