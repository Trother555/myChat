'use strict';

let cookie = require('cookie');

let UserModel = require('./../models/mongoUserModel');
let ChatHistory = require('./../models/mongoChatHistoryModel').ChatHistory;
let ChatMessage = require('./../models/mongoChatHistoryModel').ChatMessage;
let session = require('./session');

let chatHistory = new ChatHistory();

async function start(io, http) {
    
    await chatHistory.loadHistory();

    io.on('connection', async function(socket) {

        // authorization check
        if(!socket.handshake.headers.cookie) {
            return;
        }
        let cookies = cookie.parse(socket.handshake.headers.cookie);
        // TODO: check in session first
        let userModel = await UserModel.findOne({
            secret: cookies.secret, 
            id: cookies.id,
        });
        if (!userModel) {
            socket.disconnect(true);
            return;
        }

        // authorized
        console.log(`User ${userModel.name} connected`)

        io.emit('user connected', {name: userModel.name});
        socket.emit('chat history', chatHistory.getHistory());

        socket.on('chat message', function(data){
            // console.log(data);
            let message  = new ChatMessage(userModel.name, data.msg, new Date());
            chatHistory.appendMessage(message);
            io.emit('chat message', {
                name: message.name, 
                msg: message.msg, 
                time: message.date,
            });
        });
    
        socket.on('disconnect', function(){
            console.log(`User ${userModel.name} disconnected`);
        });
    });
    http.listen(3000, function(){
        console.log('listening on *:3000');
    });
}

module.exports = {
    start: start,
}