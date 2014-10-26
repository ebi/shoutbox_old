module.exports = {
  xhrPath: '/api',
  messagesExchange: 'messages',
  secret: process.env.SESSION_SECRET || 'no secure',
};
