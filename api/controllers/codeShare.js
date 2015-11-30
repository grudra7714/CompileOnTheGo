var User = require("../models/codeShare.js");
var genRes = require('./genres.js');
var _=require('lodash');
var mandrill = require('mandrill-api');

var security = require( '../../utility/encryption.js'); //import encrytion library


exports.save = function(params,callback){

    console.log("Inside create in codeShare.js")

    var user = new User(params);

        user.save(function(err,user){
            console.log(user);
            if( !( _.isNull(err) ) )
            {
                var response_string=genRes.generateResponse(false, "There Occured Some Error : "+err);
                callback(response_string);
            }
            else
            {
            
                var response_string=genRes.generateResponse(true, "Code Shared Succesfully : ");
                response_string=JSON.parse(response_string);
                response_string.user=user._id;
                response_string=JSON.stringify(response_string);
                callback(response_string);
             }

        });
};
