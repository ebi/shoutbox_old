var appConf = require('../configs/app');
var debug = require('debug')('Shoutbox:ShoutboxPoll');
var mybbSession = require('./mybbSession.js');
var request = require('superagent');
var RSVP = require('rsvp');

var queue = appConf.messagesQueue;
var parseRegexp = /shout-(\d*)\'><td[^>]*><span[^>]*>&raquo; &nbsp;&nbsp;(\d{2}\.\d{2} - \d{2}:\d{2})\s*- <\/span><span[^>]*> (.*?):<\/span><\/td><td[^>]*><\/span[^>]*>(.*?)<\/span><\/td><\/tr>/; // jshint ignore:line
var nameExtractRegexp = /<.*?>/g;

function publishMessage(channel, message) {
  if (!message) {
    return;
  }
  var content = new Buffer(JSON.stringify(message));
  debug('Publishing message', message.id);
  channel.assertQueue(queue);
  channel.sendToQueue(queue, content);
}

var ShoutboxPoll = function (amqpOpen) {
  debug('Initializing ShoutboxPoll');

  var lastId = 0;
  var baseUrl = 'http://raise.ch/forum/xmlhttp.php?action=show_shouts&last_id=';

  function getSession () {
    return mybbSession(process.env.RAISE_POLL_USER,
                       process.env.RAISE_POLL_PASSWORD);
  }

  function startPoll (args) {
    var channel = args[0];
    var mybb = args[1];
    debug('Polling', lastId);
    request
      .get(baseUrl + lastId)
      .set('Cookie', 'mybbuser=' + mybb.mybbuser + '; sid=' + mybb.sid)
      .on('error', debug)
      .end(function (mybb, result) {
        if (! result.text) {
          // TODO: Reconnect
          throw new Error('Got now response…');
        }
        debug('Got response for', lastId);
        var response = result.text.split('^--^');
        lastId = response[0];
        var messages = response[2].split('<tr id=\'');
        messages.forEach(function (message) {
          var parsedMsg = parseRegexp.exec(message);
          if (!parsedMsg) {
            debug('Could not parse message', message);
            return;
          }
          var messageObj = {
            id: parsedMsg[1],
            time: parsedMsg[2],
            username: parsedMsg[3].replace(nameExtractRegexp, ''),
            message: parsedMsg[4],
          };
          publishMessage(channel, messageObj);
        });
        setTimeout(startPoll.bind(this, args), 250);
      }.bind(this, mybb));
  }

  var amqpChannel = amqpOpen
    .then(function (conn) {
      debug('Creating rabbitmq channel');
      return conn.createChannel();
    }, debug);

  RSVP.all([amqpChannel, getSession()])
    .then(startPoll, function () {
      // TODO: Reconnect
      throw new Error('Could not login polling user');
    });
};

module.exports = ShoutboxPoll;
