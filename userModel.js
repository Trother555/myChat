
/**
 * 
 * @param {Object} modelConstructor - a function that creates a new underlyingModel
 */
function UserModel (modelConstructor){
    this.nick = "";
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

UserModel.prototype.setUnderlyingModel = function(model) {
    // TODO: check if model has functionality
    this.underModel = model;
}

