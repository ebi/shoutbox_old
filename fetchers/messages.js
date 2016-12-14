var _ = require('underscore');
var debug = require('debug')('Shoutbox:messagesFetcher');
var Message = require('../models/Message');
var urls = require('../configs/urls');
var request = require('superagent');

module.exports = {
  name: 'messages',

  read: function read (req, resource, params, config, callback) {
    var query = Message.find().sort({ id: 'desc' }).limit(50);
    query.exec(function (err, results) {
      var ret = { messages: [] };
      if (!err) {
        results.forEach(function (msg) {
          ret.messages.push(_.pick(msg, 'id', 'time', 'username', 'message'));
        });
      } else {
        debug(err);
      }
      callback(err, ret);
    });
  },

  create: function create (req, resource, params, body, config, callback) {
    var msg = params.message;
    if (_.isEmpty(msg)) {
      callback('No message given');
      return;
    }

    debug('Sending message', msg);

    var user = req.session.mybbuser;
    var sid = req.session.sid;

    request
      .post(urls.postMessage)
      .type('form')
      .set('Cookie', 'mybbuser=' + user + '; sid=' + sid)
      .send({
        'shout_data': msg,
      })
      .end(function (err, res) {
        if (err || res.text.indexOf('success') === -1) {
          debug('Sending message failed');
          callback(res.text);
          return;
        }

        debug('Sending message successful');
        callback(null);
      });
  },
};
