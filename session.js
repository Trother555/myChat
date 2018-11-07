'use strict';

/**
 * 
 * @class
 * @classdesc This class is to store chat users in server's RAM
 */
function Session () {
    this.users = [];
    this.maxUsers = 100;
}

/**
 * @param {Object} user - user object {secret: secret, id: id}
 */
Session.prototype.store = function(user) {
    if (this.users.length > this.maxUsers) {
        //TODO: pop the oldest user
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

module.exports = new Session();