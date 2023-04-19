const { ROLE } = require("../constants");


function checkRole(user, role, exact=false){
    if(!user) return false;

    

    // TODO maybe superadmin id shouldn't
    // be hardcoded?
    
    // superadmin id
    if(user.id == 1) return true;
    // role is role
    else if(exact) return ROLE[user.role] == role;
    // role is role or higher
    else return ROLE[user.role] >= role
}

module.exports = {checkRole}