var User = require("../models/users.js");
var genRes = require('./genres.js');
var _=require('lodash');
var mandrill = require('mandrill-api');

var security = require( '../../utility/encryption.js'); //import encrytion library

exports.create = function(params,callback){

	console.log("Inside create")

	var user = new User(params);
/*
	console.log("Password: " + user.password);
	console.log("Email: " + user.email);
	console.log("fname: " + user.fname);
	console.log("lname: " + user.lname);
	console.log("mobile: " + user.mobile);

*/	security.encrypt(user.password,function(err,hash){

		if(err)
		{
			var response_string=genRes.generateResponse(false, "Error : "+err);
			console.error(err.stack);
			callback(response_string);		
		}

		user.password=hash;		//Rewriting password with the hashed one

/*		console.log("Hashed password: " + user.password);
*/
		user.save(function(err,user){
			console.log(user);
			if( !( _.isNull(err) ) )
			{
				var response_string=genRes.generateResponse(false, "There Occured Some Error : "+err);
				callback(response_string);
			}
			else
			{
			
				var response_string=genRes.generateResponse(true, "User Create Succesfully : ");
				response_string=JSON.parse(response_string);
				response_string.user=user._id;
				response_string=JSON.stringify(response_string);
				callback(response_string);
			}

		});

	});

	

};

//$2a$10$8ZbMLF4q7kkv9M3Pl3nfIOXXm/p3hqkfm5rN0112r1Xd28IUKER4C

//$2a$10$AxsgMo8gUmx5syomZFE3eOUCK4RrFsUgS8WrUWkR8Tc7DqvCb26t2

exports.get = function(params,callback){
		console.log("Params: " + params);

		User.find(params).exec(function (err,user){
			if( !(_.isNull(err)) )
			{
				var response_string=genRes.generateResponse(false,"There Occured Some Error : "+err.err);
				callback(response_string,null);
			}
			else
			{
				if(user.length!=0)
				{
					var response_string=genRes.generateResponse(true,"User Found : ");
					callback(response_string,user);
				}
				else
				{
					var response_string=genRes.generateResponse(false,"No User Found");
					callback(response_string,null);
				}
			}
		});
};

exports.set = function (params, callback){
    console.log("Inside confirm_string function");

    var user = new User(params);

    User.update({_id: user['confirm_string']}, {$set : {valid: true}}, function (err, user){
            if( !(_.isNull(err)) )
            {
                var response_string=genRes.generateResponse(false,"There Occured Some Error : "+err.err);
                callback(response_string,null);
            }
            else
            {
                if(user.length!=0)
                {
                    var response_string=genRes.generateResponse(true,"User Found : ");
                    callback(response_string,user);
                }
                else
                {
                    var response_string=genRes.generateResponse(false,"No User Found");
                    callback(response_string,null);
                }
            }
        });
}



exports.update = function(condition,setvalue,callback){
	var x;
	var flag=0;

	setvalue=JSON.parse(setvalue);


	if(condition=='')
	{
		console.log("WARNING : Updating Without Proper conditions");
	}
	if(setvalue=='')
	{
		flag=1;
		var response_string=genRes.generateResponse(false,"Nothing To Update");
		callback(response_string);
	}

	for ( x in setvalue)
	{
		if(x=='username')
		{
			flag=1;
			var response_string=genRes.generateResponse(false,"UserName Cannot be updated");
			callback(response_string);
		}
	//	if(x=='permissions')
	//	{
	//		setvalue[x]=JSON.parse(setvalue[x]);
	//	}
	}

	if(flag!=1)
	{
		var options={ multi : false };

		User.update(condition,setvalue,options,function(err,numAffected){
			if( !(_.isNull(err)) )
			{
				console.log(typeof options);
				var response_string=genRes.generateResponse(false,"There Occured Some Error in Update Process: "+err);
				callback(response_string);
			}
			else if(numAffected==0)
			{
				var response_string=genRes.generateResponse(false,"No Matching data Found To update");
				callback(response_string);
			}
			else
			{
				var response_string=genRes.generateResponse(true,numAffected+" Entries are Updated");
				callback(response_string);
			}
		});
	}
};

exports.remove = function(id,callback)
{
	User.findByIdAndRemove(id,function(err,users){
		if( _.isNull(err) ){
			var response = genRes.generateResponse(true,"removed successfully");
			callback(response);
		}
		else{
			var response = genRes.generateResponse(false,"there occured some error : "+err);
			callback(response);
		}
	
	});
};

exports.allEmails = User.find({},{email: true});