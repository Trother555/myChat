'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
});

var chatUserShema = new Schema({
  nick: String,
  id: String,
  email: String,
  secret: String,
});

chatUserShema.methods.isSecretExpired = function(expirationDate) {
  return expirationDate > expiresAt;
}

chatUserShema.statics.isAuthorized = function(id, secret) {
  return this.find({id: id, secret: secret});
}



let ChatUser = mongoose.model('ChatUser', chatUserShema);

module.exports = ChatUser;