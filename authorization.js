'use strict';

let session = require('./session');

/**
 * 
 * @param {Object} req - request object
 */
async function checkAuthorization(req) {
    if (session.find(req.cookies.id, req.cookies.secret)) {
        return true;
    }
}

async function vkAuthorize(req, res) {
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
    let userModel = UserModel.find({vkId: authUserData.user_id});
    if (!userModel) {
        userModel = new UserModel({
            nick: "Anonymous",
            vkId: authUserData.user_id,
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
    res.redirect('/');
}