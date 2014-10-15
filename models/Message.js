var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true,
  },
  time: {
    type: Date,
    index: true,
  },
  username: {
    type: String,
    index: true,
  },
  message: String,
});

module.exports = mongoose.model('Messages', messageSchema);
