$(function () {
    var socket = io();

    $("body").on('DOMSubtreeModified', "#messagesContainer", function(el) {
        
        $("#messagesContainer").scrollTop($("#messagesContainer")[0].scrollHeight);
    });

    $('form').submit(function(){
        socket.emit('chat message', {msg: $('#m').val()}
        );
        $('#m').val('');
        return false;
    });

    function appendMessage(name, msg, private) {
        if(private) {
            $('#messages').append($('<li>').html(
                `<font color = "red">FROM </font><font color = "green">${name}</font> : ${msg}`));
        } else {
            $('#messages').append($('<li>').html(
                '<font color = "green">' + name + '</font> : ' + msg));
        }
    }
    
    socket.on('chat message', function(data){
        appendMessage(data.name, data.msg);
    });

    socket.on('private message', function(data){
        appendMessage(data.name, data.msg, true);
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