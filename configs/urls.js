'use strict';

var baseUrl = process.env.DOMAIN + '/forum/';

module.exports = {
  login: baseUrl + 'member.php',
  postMessage: baseUrl + 'xmlhttp.php?action=add_shout',
  pollUrl: baseUrl + 'xmlhttp.php?action=show_shouts&last_id='
};
