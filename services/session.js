'use strict';

/**
 * 
 * @class
 * @classdesc This class is to store current chat users
 */
function Session () {
    this.users = [];
    this.maxUsers = 100;
}

/**
 * @class
 * @classdesc User class
 */
function User () {
    this.name = "Anonymous";
    this.id = "";
    this.secret = "";
}

/**
 * @param {Object} user - user object {secret: secret, id: id}
 */
Session.prototype.store = function(user) {
    if (this.users.length > this.maxUsers) {
        //TODO: handle this somehow
    } else {
        if(!this.find(user.id, user.secret)) {
            this.users.push(user);
        }
    }
}

/**
 * @param {String} id - id of user
 * @param {String} secret - secret of user
 */
Session.prototype.find = function(id, secret) {
    return this.users.find((el) => el.id == id && el.secret == secret);
}

/**
 * @param {String} id - id of user
 * @returns - true if user is found and deleted else false
 */
Session.prototype.remove = function(id) {
    let ind = this.users.findIndex((el) => el.id == id);
    if (ind <0) {
        return false;
    }
    this.users.splice(ind, 1);
    return true; 
}


module.exports = {
    session: new Session(),
    User: User,
}