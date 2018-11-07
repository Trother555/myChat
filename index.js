'use strict';

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let axios = require('axios');
let UserModel = require('./mongoUserModel');
let cookieParser = require('cookie-parser')
let cookie = require('cookie');

// time in seconds before user authentication expires
const userTimeToLive = 1e5  ;

//app.use(cookieParser())
app.use(express.static('./www/js'));
app.use(cookieParser())

let redirectURL = 'http://localhost:3000/vkauthorize';
let appId = '6744098';
let appSecret = '6RCwcpK3EVYvsIWfXQJh';

/**
 * Send error message as response
 * @param {Object} resp - express resp object
 * @param {String} message - message string
 * @param {Number} - error code
 */
function respondWithError(res, message, code) {
    res.status(code).send(message);
}

async function authenticateVk(code) {
    let authRequest = `https://oauth.vk.com/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${redirectURL}&code=${code}`;
    let resp = await axios.get(authRequest);
    if(resp.status == 200) {
        console.log(resp.data);
        return resp.data;
    }
    return null;
}

app.get('/vkauthorize', async (req, res) => {
    if(!req.query.code) {
        respondWithError(res, "Error: no code specified", 500);
        return;
    }

    let authUserData = await authenticateVk(req.query.code);
    if (!authUserData) {
        respondWithError(res, "Error: vk auth failed", 500);
        return;
    }
    let expDate = new Date();
    expDate.setSeconds(expDate.getSeconds() + userTimeToLive);
    let userModel = await UserModel.findOne({id: authUserData.user_id});
    console.log(userModel);
    if (!userModel) {
        userModel = new UserModel({
            nick: "Anonymous",
            id: authUserData.user_id,
            expiresAt: expDate,
            secret: req.query.code,
        });
        res.cookie('secret', req.query.code);
        await userModel.save().catch(() => {
            respondWithError(res, "Error upon registration. Try again later", 500);
        }).then(() => res.redirect('/'));
        return;
    }
    res.cookie('secret', userModel.secret);
    res.cookie('id', userModel.id);
    res.redirect('/');
});

app.get('/login', function(req, res) {
    if(req.cookies.id && 
        UserModel.isAuthorized(req.cookies.id, req.cookies.secret)) {
            res.redirect('/');
        return;
    }
    res.sendFile(__dirname + '/www/index.html');
});

app.get('/', async function(req, res){
    if (req.cookies.secret) {
        let userModel = await UserModel.find({
            secret: req.cookies.secret, 
            id: req.cookies.id,
        });
        if (!userModel) {
            // TODO: redirect to login
        }
    }
    res.sendFile(__dirname + '/www/index.html');
});

// chat
io.on('connection', async function(socket) {
    let cookies = cookie.parse(socket.handshake.headers.cookie);
    let userModel = await UserModel.findOne({
        secret: cookies.secret, 
        id: cookies.id,
    });
    if (!userModel) {
        socket.disconnect(true);
        return;
    }
    console.log(`User ${userModel.nick} connected`)
    io.emit('user connected', {name: userModel.nick});

    socket.on('chat message', function(data){
        console.log(data);
        io.emit('chat message', {name: userModel.nick, msg: data.msg});
    });

    socket.on('disconnect', function(){
        console.log(`User ${userModel.nick} disconnected`);
    });
});
  
http.listen(3000, function(){
console.log('listening on *:3000');
});