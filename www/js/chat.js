$(function () {
    var socket = io();

    $('form').submit(function(){
        socket.emit('chat message', {msg: $('#m').val()}
        );
        $('#m').val('');
        return false;
    });

    function appendMessage(name, msg) {
        $('#messages').append($('<li>').html(
            '<font color = "red">' + name + '</font> : ' + msg));
    }
    
    socket.on('chat message', function(data){
        $('#messages').append($('<li>').html(
            '<font color = "red">' + data.name + '</font> : ' + data.msg));
    });
    socket.on('user connected', function(data){
        $('#users').append($('<li>').html(data.name));
    });

    socket.on('chat history', (data) => {
        for (let message of data) {
            appendMessage(message.name, message.msg);
        }
    })
});