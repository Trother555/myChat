$(function () {
    var socket = io();
    
    $('#name').val('123')

    socket.emit('user connected', $('#name').val());

    $('form').submit(function(){
        socket.emit('chat message', {name: $('#name').val(), 
            msg: $('#m').val()}
        );
        $('#m').val('');
        return false;
    });
    
    socket.on('chat message', function(data){
        $('#messages').append($('<li>').html(
            '<font color = "red">' + data.name + '</font> : ' + data.msg));
    });
});