'use strict';

let session = require('./session');
let config = require('../config.json');

let redirectURL = config.redirectURL;
let appId = config.appId;
let appSecret = config.appSecret;

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
        return resp.data;
    }
    return null;
}

/**
 * Check if user is authorized
 * @param {Object} req - request object
 * @param {Object} session - session object
 * @param {Object} UserModel - UserModel object
 */
async function checkAuthorization(req, UserModel) {
    if (!req.cookies.secret || !req.cookies.id) {
        return false;
    }
    let userModel = await UserModel.findOne({
        secret: req.cookies.secret, 
        id: req.cookies.id,
    });
    if (userModel) {
        return true;
    }
}

async function vkAuthorize(req, res, UserModel) {
    if(!req.query.code) {
        respondWithError(res, "Error: no code specified", 500);
        return;
    }
    let authUserData = await authenticateVk(req.query.code);
    if (!authUserData) {
        respondWithError(res, "Error: vk auth failed", 500);
        return;
    }
    let userModel = await UserModel.findOne({id: authUserData.user_id});
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
}



module.exports = {
    checkAuthorization,
    vkAuthorize,
}