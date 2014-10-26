var _ = require('underscore');
var debug = require('debug')('Shoutbox:messagesFetcher');
var Message = require('../models/Message');

module.exports = {
  name: 'messages',
  read: function (req, resource, params, config, callback) {
    var query = Message.find().sort({ id: 'asc' });
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
};
