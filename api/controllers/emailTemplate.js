var mandrill = require('mandrill-api/mandrill');
var User = require("../models/emailConfirmation.js");
var genRes = require('./genres.js');
var _=require('lodash');

var security = require( '../../utility/encryption.js'); //import encrytion library

exports.create = function(params,callback){

    console.log("Inside create")

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
            
                var response_string=genRes.generateResponse(true, "User Create Succesfully : ");
                response_string=JSON.parse(response_string);
                response_string.user=user._id;
                response_string=JSON.stringify(response_string);
                callback(response_string);
             }

        });
};

exports.set = function (params, callback){
    console.log("Inside confirm_string function");

    var user = new User(params);

    User.update({confirm_string: user['confirm_string']}, {$set : {status: true}}, function (err, user){
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

exports.get = function(params, callback){
    console.log("Inside get to confirm email ");
    var user = new User(params)
    console.log("user: " + user['confirm_string']);
    User.findOne({confirm_string: user['confirm_string']}, function (err, user){
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

exports.sendEmail = function(username, name, customID, callback){
    console.log("" + username  + " " + name + " " + customID);
    mandrill_client = new mandrill.Mandrill('V0chXZeXBAaLZ_MgocxynA');
var message = {
    "html": "Please Click on the following link to confirm your email: http://localhost:4000/new/user/email/" + customID,
    "text": "Please Click on the following link to confirm your email: " + customID,
    "subject": "Compile On the Go",
    "from_email": "grudra7714@gmail.com",
    "from_name": "Email Confirmation",
    "to": [{
            "email": "grudra7714@gmail.com",
            "name": name,
            "type": "to"
        }],
    "headers": {
        "Reply-To": "grudra7714@gmail.com"
    },
    "important": false,
    "track_opens": null,
    "track_clicks": null,
    "auto_text": null,
    "auto_html": null,
    "inline_css": null,
    "url_strip_qs": null,
    "preserve_recipients": null,
    "view_content_link": null,
    "tracking_domain": null,
    "signing_domain": null,
    "return_path_domain": null,
    "merge": true,
    "merge_language": "mailchimp"
};
var async = false;
var ip_pool = "Main Pool";
var send_at = "example send_at";
mandrill_client.messages.send({"message": message, "async": async}, function(result) {
    console.log(result);
    callback(result);
    /*  
    [{
            "email": "recipient.email@example.com",
            "status": "sent",
            "reject_reason": "hard-bounce",
            "_id": "abc123abc123abc123abc123abc123"
        }]
    */
}, function(e) {
    // Mandrill returns the error as an object with name and message keys

    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
});
}