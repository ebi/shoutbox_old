'use strict';

var baseUrl = 'http://raise.ch/forum/';

module.exports = {
  login: baseUrl + 'member.php',
  postMessage: baseUrl + 'xmlhttp.php?action=add_shout',
};
