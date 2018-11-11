'use strict';

var mongoose = require('mongoose');
let config = require('../config.json');
var Schema = mongoose.Schema;

mongoose.connect(process.env.constring || config.constring);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
});

var chatUserShema = new Schema({
  name: String,
  id: String,
  email: String,
  secret: String,
});

chatUserShema.methods.isSecretExpired = function(expirationDate) {
  return expirationDate > expiresAt;
}

chatUserShema.methods.rename = async function(newName) {
  this.name = newName;
  await this.save();
}

chatUserShema.statics.isAuthorized = function(id, secret) {
  return this.find({id: id, secret: secret});
}


let ChatUser = mongoose.model('ChatUser', chatUserShema);

module.exports = ChatUser;