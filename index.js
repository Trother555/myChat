'use strict';

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let cookieParser = require('cookie-parser')
let axios = require('axios');

let UserModel = require('./models/mongoUserModel');
let chat = require('./services/chat')

app.use(express.static('./www/js'));
app.use(cookieParser())


let redirectURL = 'http://localhost:3000/vkauthorize';
let appId = '6744098';
let appSecret = '6RCwcpK3EVYvsIWfXQJh';

chat.start(io, http);

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
    expDate.setSeconds(expDate.getSeconds() + userTimeToLive);
    let userModel = await UserModel.findOne({id: authUserData.user_id});
    console.log(userModel);
    if (!userModel) {
        userModel = new UserModel({
            name: "Anonymous",
            id: authUserData.user_id,
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
    res.sendFile(__dirname + '/www/login.html');
});

app.get('/', async function(req, res){
    if (req.cookies.secret) {
        let userModel = await UserModel.findOne({
            secret: req.cookies.secret, 
            id: req.cookies.id,
        });
        if (userModel) {
            res.sendFile(__dirname + '/www/index.html');
            return;
        }
    }
    res.redirect('/login');
});
