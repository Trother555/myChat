'use strict';

let cookie = require('cookie');

let UserModel = require('./../models/mongoUserModel');
let ChatHistory = require('./../models/mongoChatHistoryModel').ChatHistory;
let ChatMessage = require('./../models/mongoChatHistoryModel').ChatMessage;
let session = require('./session').session;

async function start(io, http) {

    let chatHistory = await ChatHistory.loadHistory();
    io.on('connection', async function(socket) {
        // authorization check
        if(!socket.handshake.headers.cookie) {
            return;
        }
        let cookies = cookie.parse(socket.handshake.headers.cookie);
        // TODO: check in session first
        // user is logged in already
        if (session.find(cookie.id, cookies.secret)) {
            return;
        }
        let userModel = await UserModel.findOne({
            secret: cookies.secret, 
            id: cookies.id,
        });
        // user not authorized
        if (!userModel) {
            socket.disconnect(true);
            return;
        }

        session.store({id: userModel.id, secret: userModel.secret, 
            socket: socket, name: userModel.name});

        // authorized
        console.log(`User ${userModel.name} connected`)

        io.emit('user connected', {name: userModel.name});
        socket.emit('chat history', chatHistory.getHistory());

        socket.on('chat message', function(data){
            // handle private message
            if (data.msg && data.msg[0] == '@') {
                let toName = data.msg.slice(1, data.msg.indexOf(' '));
                let toUser = session.findByName(toName);
                if (!toUser) {
                    return;
                }
                toUser.socket.emit('private message', {
                    name: userModel.name,
                    msg: data.msg.slice(data.msg.indexOf(' ') + 1),
                    time: new Date(),
                })
                return;
            }
            // handle mass message
            let message  = new ChatMessage(userModel.name, data.msg, new Date());
            chatHistory.appendMessage(message);
            io.emit('chat message', {
                name: message.name, 
                msg: message.msg, 
                time: message.date,
            });
        });
    
        socket.on('disconnect', function() {
            if(session.remove(userModel.id)) {
                console.log(`User ${userModel.name} disconnected`);
            }
        });
    });
    let port = process.env.PORT || 3000;
    http.listen(port, function() {
        console.log(`Chat started on port${port}`);
    });
}

module.exports = {
    start: start,
}