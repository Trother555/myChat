$(function () {
    var socket = io();
    
    $('#name').val('123')

    $('form').submit(function(){
        socket.emit('chat message', {msg: $('#m').val()}
        );
        $('#m').val('');
        return false;
    });
    
    socket.on('chat message', function(data){
        $('#messages').append($('<li>').html(
            '<font color = "red">' + data.name + '</font> : ' + data.msg));
    });
    socket.on('user connected', function(data){
        $('#users').append($('<li>').html(data.name));
    });
});