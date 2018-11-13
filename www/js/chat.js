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

    $("#users").on('click', function (e) {
        if (e.target !== e.currentTarget) {
            var clickedItem = e.target;
            $('#m').val(`@${clickedItem.innerText} `);
        }
        e.stopPropagation();
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
        console.log($(`li#${data.chatId}`).get()[0]);
        if (!$(`li#${data.chatId}`).get()[0]){
            $('#users').append($(`<li id=${data.chatId}>`).html(data.name));
        }
    });

    socket.on('user disconnected', function(data){
        $(`li#${data.chatId}`).remove();
    });

    socket.on('chat history', (data) => {
        for (let message of data) {
            appendMessage(message.name, message.msg);
        }
    })
});