'use strict';

var database=require('../config/database.js');
var genRes=require('./controllers/genres.js');

//Include Custom Controllers here

var User = require('./controllers/users.js');
var email = require('./controllers/emailTemplate.js')
var CodeSphere  = require('./controllers/codeSphere.js')

//required librabries

var _ 			= require('lodash');
var fs 			= require('fs');
var path 		= require('path');
var crypto 		= require('crypto');
var mongoose 	= require('mongoose');
var ObjectId 	= require('mongoose').Types.ObjectId;
var cc 			= require('coupon-code');
var moment 		=require('moment'); //moment library for timestamping 
var url			= require('url');
var request 	= require("request");

//User defined modules

var security = require('../utility/encryption.js');

mongoose.connect(database.url);

mongoose.connection.on('error', console.error.bind(console, 'connection error:')); // Error handler
var db = mongoose.connection;


exports.index = function (req, res) {
		if(res){
			res.send('You got yourself into the api');
		}
		else{
			res.send('Invalid Request');
		}
}

exports.addUser = function (req, res){
	var param = req.body.params;

	var obj = JSON.parse(param);
	User.create(obj, function(str){
		console.log("status: " + str);
		var str = JSON.parse(str);
		console.log("status: " + str.status); 
		if(str.status){
/*			console.log("TRUE");
			console.log("Now");
*/
			var query = {}
			query['email'] = obj.email;
			query['confirm_string'] = str.user;
			query['status'] = 0;
			query['initDate'] = new Date();
			email.create(query, function(msg, data){
				msg = JSON.parse(msg);
				if(msg.status){
					email.sendEmail(obj.email, obj.fname, str.user, function(response){

							//response = JSON.parse(response)
							console.log("status: " + response[0].status);
							if(response[0].status == 'sent'){
								res.send("Confirmation Email sent: " + str + "Email Details: " + response);
							}else{
								console.log("Unable to send");
								res.send("Unable to send: " + str );
							}
					
					})
				}
			})
		}
	})

//	res.send("param in addUser: " + obj.email);

}

exports.loginUser = function (req, res){
	console.log("Into Login user function");
	var param = req.body.params;

	var obj = JSON.parse(param);
	console.log("lu"+obj.email);

	var query = {
		email: obj.email,
		password: obj.password
	};

	var ob= {};
	var ret={};

	ob['email']=obj.email;	

	User.get(ob, function(msg, data){
		msg=JSON.parse(msg);
		if(msg.status){
			data = data[0];
			console.log("password: " + data['password']);
			msg.data=data;
			console.log("msg" + JSON.stringify(msg.data));
			res.send(JSON.stringify(msg.data));
		}else{
			res.send("Not a valid user");
			msg.data=data;
			console.log("msg" + JSON.stringify(msg));
		}
	})

}

exports.getData = function (req, res){
	console.log("Inside getData function");

	var param = req.body.params;

	var obj = JSON.parse(param);
	console.log("lu"+obj.email);

	var query = {
		_id : obj._id
	};

	var ob = {}
	ob['_id'] = obj._id;

	User.get(ob, function (msg, data){
		msg=JSON.parse(msg);
		if(msg.status){
			data = data[0];
			msg.data=data;
			console.log("msg" + JSON.stringify(msg.data));
			res.send(JSON.stringify(msg.data));
		}else{
			res.send("Cannot fetch data");
			msg.data=data;
			console.log("msg" + JSON.stringify(msg));
		}
	})
}

exports.confirmUser = function (req, res){
	console.log("Confirm User");
	console.log("url: " + req.url);
	var id = req.url.lastIndexOf('/');
	var cid = req.url.substr(id+1);

		
	console.log("ID: " + cid);

	var query = {}

	query['confirm_string'] = cid;

	email.get(query, function(msg, data){
		msg = JSON.parse(msg);
		console.log(JSON.stringify(msg));

		var dateB = moment(data['initDate']);
		var dateC = moment(new Date());

		console.log('Difference is ', dateB.diff(dateC, 'days'), 'days');

		if(dateB.diff(dateC, 'days') > 0){
			console.log("Invalid");
			//res.redirect("/emailValidityExpire");
		}else{
			email.set(query, function (msg, data){
				msg = JSON.parse(msg);
				console.log(JSON.stringify(msg))
				if(msg.status){
					User.set(query, function (msg1, data1){
						msg1 = JSON.parse(msg1)
						if(msg1.status){
							console.log("Reached till here")
							res.redirect("/");
						}
					})					
				}
			})
		}
	})
}

exports.codeSave = function (req, res){
	console.log("Inside code save function");

	var param = req.body.params;
	var obj = JSON.parse(param)	;

	var query = {};


	var sharedSecret = crypto.randomBytes(16); // should be 128 (or 256) bits
	var initializationVector = crypto.randomBytes(16); // IV is always 16-bytes

	var plaintext = obj.data;
	var encrypted;

	var cipher;

	cipher = crypto.Cipheriv('aes-128-cbc', sharedSecret, initializationVector);
	encrypted += cipher.update(plaintext, 'utf8', 'base64');
	encrypted += cipher.final('base64');


	query['id'] = obj._id;
	query['iv'] = initializationVector.toString('base64');
	query['cipherText'] = encrypted;
	query['language'] = obj.language;
	query['date'] = new Date();	

	console.log(JSON.stringify(query));

	CodeSphere.save(query, function(msg, data){

		console.log("Insid codeSave's save function");
		msg = JSON.parse(msg);
		if(msg.status){
			//data = data[0];
			//msg.data = data;
			console.log(JSON.stringify(msg));
		}
	})
}

exports.shareCode = function (req, res){
	var param = req.body.param;
}