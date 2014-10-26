var sanitizeHtml = require('sanitize-html');
var smilies = require('../configs/smilies');

var imgRegexp = /<img.*title="([^"]*).*?\/>/;

module.exports = {
  parse: function (msg) {
    var messageObj = JSON.parse(msg.content.toString());
    var messageStr = messageObj.message;
    messageStr = messageStr.replace(imgRegexp, function replaceImg (full, match) { // jshint ignore:line
      return smilies[match] || '';
    });
    messageObj.message =  sanitizeHtml(messageStr, {
      allowedTags: [],
    });
    return messageObj;
  },
};
