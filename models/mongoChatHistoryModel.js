'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//mongoose.connect('mongodb://localhost:27017');

var chatHistorySchema = new Schema({
    messages: [{name: String, msg: String, time: Date}],
});

/**
 * Append message to chathistory
 * @param {Object} data - @see ChatMessage
 */
chatHistorySchema.methods.appendMessage = async function(data) {
    this.messages.push({name: data.name, msg: data.msg, time: data.time});
    await this.save();
}

/**
 * Get chat history since the date
 * @param {Date} date - date since wich to get the history
 */
chatHistorySchema.methods.getHistory = function(date) {
    // TODO get messages with date>date
    return this.messages;
}

let ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

/**
 * 
 * @param {String} name - user nick
 * @param {String} msg - user message
 * @param {Date} time - messaeg timestamp
 */
function ChatMessage(name, msg, time) {
    this.name = name;
    this.msg = msg;
    this.time = time;
}

module.exports = {
    ChatHistory: ChatHistory,
    ChatMessage: ChatMessage,
};