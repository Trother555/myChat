
/**
 * 
 * @param {Object} modelConstructor - a function that creates a new underlyingModel
 */
function UserModel (modelConstructor){
    this.name = "";
    this.vkId = "";
    this.email = "";
    this.secret = "";
    this.expiresAt = Date();
    this.underModel = new modelConstructor()
}

UserModel.prototype.isSecretExpired = function() {
    // TODO: implement
    return false;
}

UserModel.prototype.findOne = function(id, secret) {
    return this.underModel
}

