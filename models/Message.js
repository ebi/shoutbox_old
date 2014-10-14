var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  time: Date,
  username: String,
  message: String,
});

module.exports = mongoose.model('Messages', messageSchema);
