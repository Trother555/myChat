'use strict';

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let cookieParser = require('cookie-parser');
let axios = require('axios');

let UserModel = require('./models/mongoUserModel');
let chat = require('./services/chat');
let auth = require('./services/authorization');

app.use(express.static('./www/js'));
app.use(cookieParser())

chat.start(io, http);

app.get('/vkauthorize', async (req, res) => {
    if (await auth.checkAuthorization(req, UserModel)) {
        res.redirect('/');
        return;
    }
    await auth.vkAuthorize(req, res, UserModel);
});

app.get('/login', async function(req, res) {
    if (await auth.checkAuthorization(req, UserModel)) {
        res.redirect('/');
        return;
    }
    res.sendFile(__dirname + '/www/login.html');
});

app.get('/', async function(req, res){
    if (await auth.checkAuthorization(req, UserModel)) {
        res.sendFile(__dirname + '/www/index.html');
        return;
    }
    res.redirect('/login');
});
