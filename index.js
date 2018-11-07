'use strict';

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.use(express.static('./www/js'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/www/index.html');
});

io.on('connection', function(socket){
    socket.on('user connected', (username) => {
        console.log(`User ${username} connected`)
    })

    socket.on('chat message', function(data){
        console.log(data);
        io.emit('chat message', data);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});
  
http.listen(3000, function(){
console.log('listening on *:3000');
});