'use strict';

let cookie = require('cookie');

let UserModel = require('./../models/mongoUserModel');
let ChatHistory = require('./../models/mongoChatHistoryModel').ChatHistory;
let ChatMessage = require('./../models/mongoChatHistoryModel').ChatMessage;

let chatHistory = new ChatHistory();

function start(io, http) {
    io.on('connection', async function(socket) {

        // authorization check
        if(!socket.handshake.headers.cookie) {
            return;
        }
        let cookies = cookie.parse(socket.handshake.headers.cookie);
        let userModel = await UserModel.findOne({
            secret: cookies.secret, 
            id: cookies.id,
        });
        if (!userModel) {
            socket.disconnect(true);
            return;
        }

        // authorized
        console.log(`User ${userModel.nick} connected`)
        io.emit('user connected', {name: userModel.nick});
        socket.emit('chat history', chatHistory.getHistory());

        socket.on('chat message', function(data){
            console.log(data);
            message  = new ChatMessage(data.name, data.msg, new Date());
            chatHistory.appendMessage(message);
            io.emit('chat message', {
                name: userModel.nick, 
                msg: data.msg, 
                time: new Date(),
            });
        });
    
        socket.on('disconnect', function(){
            console.log(`User ${userModel.nick} disconnected`);
        });
    });
    http.listen(3000, function(){
        console.log('listening on *:3000');
    });
}

module.exports = {
    start: start,
}