var bcrypt=require('bcryptjs');
//var config=require('../config/encryption.js');


exports.encrypt= function(val,callback){

	console.log("Val: " + val);
	//console.log(config['SALT_WORK_FACTOR']);

	bcrypt.genSalt(10,function(err,salt){

		if(err)
			return callback(err,null);

		bcrypt.hash(val,salt,callback);

	});
}

exports.compare= function(val,enc,callback){
	bcrypt.compare(val,enc,callback);
}
