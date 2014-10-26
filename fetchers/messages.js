var _ = require('underscore');
var debug = require('debug')('Shoutbox:messagesFetcher');
var Message = require('../models/Message');

module.exports = {
  name: 'messages',
  read: function (req, resource, params, config, callback) {
    var query = Message.find().sort({ id: 'asc' });
      console.log(arguments);
    query.exec(function (err, results) {
      var ret = { messages: [] };
      if (!err) {
        results.forEach(function (msg) {
          ret.messages.push(_.pick(msg, 'time', 'username', 'message'));
        });
      } else {
        debug(err);
      }
      callback(err, ret);
    });
  },
};
