var showChat = require('../actions/showChat');

module.exports = {
  home: {
    path: '/',
    method: 'get',
    page: 'home',
    waitFor: [showChat],
  },
  online: {
    path: '/online',
    method: 'get',
    page: 'online',
    waitFor: [],
  }
};
