var amqpConf = require('../configs/amqp');
var appConf = require('../configs/app');
var debug = require('debug')('Shoutbox:ShoutboxPoll');
var moment = require('moment');
var mybbSession = require('./mybbSession.js');
var newrelic = require('newrelic');
var request = require('superagent');
var RSVP = require('rsvp');

var parseRegexp = /shout-(\d*)\'><td[^>]*><span[^>]*>&raquo; &nbsp;&nbsp;(\d{2}\.\d{2} - \d{2}:\d{2})\s*- <\/span><span[^>]*> (.*?):<\/span><\/td><td[^>]*><\/span[^>]*>(.*?)<\/span><\/td><\/tr>/; // jshint ignore:line
var linkRe = new RegExp('<a href="([^"]*).*</a>', 'g');
var nameExtractRegexp = /<.*?>/g;

function publishMessage(channel, message) {
  if (!message) {
    return;
  }
  var content = new Buffer(JSON.stringify(message));
  debug('Publishing message', message.id);
  channel.publish(appConf.messagesExchange, 'messages', content);
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

    var requestCb = function (mybb, result) {
      var rePoll = function () {
          if (!process.env.NOPOLL) {
            setTimeout(startPoll.bind(this, args), 250);
          }
        }.bind(this);

      if (! result.text) {
        // TODO: Reconnect
        newrelic.noticeError('Shoutbox did not give any response');
        throw new Error('Got no response…');
      }
      debug('Got response for', lastId);
      var response = result.text.split('^--^');
      lastId = response[0];
      var messages = response[2].split('<tr id=\'');
      messages.forEach(function (message) {
        var parsedMsg = parseRegexp.exec(message);
        if (!parsedMsg) {
          newrelic.noticeError('Could not parse message ' + message);
          debug('Could not parse message', message);
          return;
        }
        var msg = parsedMsg[4].replace(linkRe, '$1');
        var messageObj = {
          id: parsedMsg[1],
          time: moment.utc(parsedMsg[2], 'DD.MM - HH:mm'),
          username: parsedMsg[3].replace(nameExtractRegexp, ''),
          message: msg,
        };
        publishMessage(channel, messageObj);
      });
      rePoll();
      newrelic.endTransaction();
    }.bind(this, mybb);

    request
      .get(baseUrl + lastId)
      .set('Cookie', 'mybbuser=' + mybb.mybbuser + '; sid=' + mybb.sid)
      .on('error', debug)
      .end(newrelic.createBackgroundTransaction('poll-message', requestCb));
  }



  RSVP.all([amqpConf.messagesExchange(amqpOpen), getSession()])
    .then(startPoll, function () {
      // TODO: Reconnect
      throw new Error('Could not login polling user');
    });
};

module.exports = ShoutboxPoll;
