/**
 * Returns the latest messages from mongoDB in a json format.
 */

 var _ = require('underscore');
 var debug = require('debug')('Shoutbox:latest');
 var Message = require('../models/Message');

module.exports = function (req, res) {
  var query = Message.find().sort({ id: 'asc' });
  query.exec(function (err, results) {
    var ret = { messages: [] };
    if (!err) {
      results.forEach(function (msg) {
        ret.messages.push(_.pick(msg, 'time', 'username', 'message'));
      });
    } else {
      debug(err);
    }
    res.send(ret);
  });
};
