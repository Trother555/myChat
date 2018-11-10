'use strict';

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

let UserModel = require('./models/mongoUserModel');
let chat = require('./services/chat');
let auth = require('./services/authorization');

app.use(express.static('./www/js'));
app.use(cookieParser())
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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

app.get('/changeMyName', async function(req, res) {
    let user = await auth.checkAuthorization(req, UserModel);
    if (!user) {
        res.redirect('/login');
        return;
    }
    res.sendFile(__dirname + '/www/changeName.html');
});

app.post('/changeMyName', async function(req, res) {
    console.log(req.body);
    let user = await auth.checkAuthorization(req, UserModel);
    if (!user) {
        res.redirect('/login');
        return;
    }
    
    if(req.body.userName) {
        console.log('hi')
        await user.rename(req.body.userName);
        res.redirect('/');
        return;
    }
    res.redirect('/changeMyName');
});

app.get('/', async function(req, res){
    if (await auth.checkAuthorization(req, UserModel)) {
        res.sendFile(__dirname + '/www/index.html');
        return;
    }
    res.redirect('/login');
});
