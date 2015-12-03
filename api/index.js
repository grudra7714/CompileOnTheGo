'use strict';

var database=require('../config/database.js');
var genRes=require('./controllers/genres.js');

//Include Custom Controllers here

var User = require('./controllers/users.js');
var email = require('./controllers/emailTemplate.js')
var CodeSphere  = require('./controllers/codeSphere.js')
var CodeShare = require('./controllers/codeShare.js')
//required librabries

var _ 			= require('lodash');
var async		= require('async');
var fs 			= require('fs');
var path 		= require('path');
var crypto 		= require('crypto');
var mongoose 	= require('mongoose');
var ObjectId 	= require('mongoose').Types.ObjectId;
var cc 			= require('coupon-code');
var compiler 	= require('compilex');
var options = {stats : true}; //prints stats on console  
compiler.init(options);

var moment 		=require('moment'); //moment library for timestamping 
var url			= require('url');
var request 	= require("request");
var NodeRSA = require('node-rsa');
var key = new NodeRSA({b: 512});
var JSONStream = require('json-stream');var fileContent = '';
var prettyjson = require('prettyjson');

//User defined modules

var security = require('../utility/encryption.js');

mongoose.connect(database.url);

mongoose.connection.on('error', console.error.bind(console, 'connection error:')); // Error handler
var db = mongoose.connection;

 // ---------------- MONGODB SPECIFICALLY FOR SENDING DATA TO ANGUALRJS -------------- 
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/compiler';

// Use connect method to connect to the Server


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

exports.sendPublic = function (req, res){
	console.log(req.url);
	res.redirect(req.url);
}


exports.sendNew = function (req, res){
	console.log(req.url);
	res.redirect(req.url);
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

	var plaintext = new Buffer(obj.data, 'base64');
	var encrypted;

	var cipher;

	cipher = crypto.Cipheriv('aes-128-cbc', sharedSecret, initializationVector);
	encrypted += cipher.update(plaintext, 'utf8', 'base64');
	encrypted += cipher.final('base64');


	query['id'] = obj._id;
	query['iv'] = initializationVector.toString('base64');
	query['sharedSecret'] = sharedSecret;
	query['cipherText'] = encrypted;
	query['language'] = obj.language;
	query['date'] = new Date();	

	console.log(JSON.stringify(query));


	var t = Number(new Date())
	var fileName = "app/public/publicCodes/" + obj.fileName + "_" + t +"_c" + ".txt";
	fs.writeFile(fileName, encrypted,  function(err) {
		if (err) {
		   return console.error(err);
		}
		console.log("Data written successfully!");
		console.log("After");

		query = {};
		query['id'] = obj._id;
		query['iv'] = initializationVector.toString('base64');
		query['sharedSecret'] = sharedSecret;
		query['filePath'] = fileName;
		query['savedName'] = obj.fileName;
		query['language'] = obj.language;
		query['date'] = new Date();	

		CodeSphere.save(query, function(msg, data){

			console.log("Insid codeSave's save function");
			msg = JSON.parse(msg);
			if(msg.status){
				console.log("Code Saved");
				console.log(JSON.stringify(msg));
				insertAgain();
				res.send(JSON.stringify(msg));
			}
		})

			function insertAgain(){
				console.log("Inside insertAgain()");
				console.log("before");
				var fileName = "app/public/js/files/" + obj.fileName + "_" + t  +"_c" + ".txt";
				fs.writeFile(fileName, plaintext,  function(err) {
					if (err) {
					   return console.error(err);
					}
					console.log("Data written successfully in another file!");
					console.log("After this");
				})
			}


	})
}




exports.shareCode = function (req, res){
	console.log("Inside Sharecode");
	var param = req.body.params;
	var obj = JSON.parse(param);


	var sharedSecret = crypto.randomBytes(16); // should be 128 (or 256) bits

	console.log("sharedSecret: " + sharedSecret);
	var initializationVector = crypto.randomBytes(16); // IV is always 16-bytes

	var plaintext = new Buffer(obj.data, 'base64');
	var encrypted;

	var cipher;

	cipher = crypto.createCipheriv('aes-128-cbc', sharedSecret, initializationVector);
	encrypted += cipher.update(plaintext, 'utf8', 'base64');
	encrypted += cipher.final('base64');

	console.log("Going to write into existing file");
	console.log("Before");
	var t = Number(new Date())
	var fileName = "app/public/publicCodes/" + obj.fileName + "_" + t +"_c" + ".txt";
	fs.writeFile(fileName, encrypted,  function(err) {
		if (err) {
		   return console.error(err);
		}
		console.log("Data written successfully!");
		console.log("After");

		var query = {};
		query["id"] = obj.id;
		query["email"] = obj.email;
		query["fname"] = obj.fname;
		query["lname"] = obj.lname;
		query['iv'] = initializationVector.toString('base64');
		query['sharedSecret'] = sharedSecret.toString('base64');
		query['filePath'] = fileName;
		query['savedName'] = obj.fileName;
		query['language'] = obj.language;
		query['date'] = new Date();	


		CodeShare.save(query, function (msg, data){
			msg = JSON.parse(msg);

			if(msg.status){
				var iv_encrypted = key.encrypt(query["iv"], 'base64');
				//var decrypted = key.decrypt(encrypted, 'utf8');
				var cursor = User.allEmails;
				//cursor.skip(0);
				cursor.stream()
				.on('data', function (doc){
					console.log("emails: " + doc['email']);

					email.sendPublicNotification(doc['email'], query["fname"],query["id"], iv_encrypted, function (response){
						if(response[0].status == 'sent'){
							console.log("Public email sent");
						}else{
							console.log("Unable to send");
						}
					})

				})
				.on('err', function(err){
					console.log(err);
				})
				.on('end', function (){
					insertAgain();
					res.send("Done");
				})
			}
			function insertAgain(){
				console.log("Inside insertAgain()");
				console.log("before");
				var fileName = "app/public/js/files/" + obj.fileName + "_" + t  +"_c" + ".txt";
				fs.writeFile(fileName, plaintext,  function(err) {
					if (err) {
					   return console.error(err);
					}
					console.log("Data written successfully in another file!");
					console.log("After this");
				})
			}
		})
	});	
}

exports.getPublic = function (req, res){
			console.log("Inside getPublic function");
			var cursor = CodeShare.allCodes;
			var prg = [];
			//cursor.skip(0);
			var i = 0;
			var inside ="";
			var flag = 1;
			MongoClient.connect(url, function (err, db) {
			  if (err) {
			    console.log('Unable to connect to the mongoDB server. Error:', err);
			  } else {
			    //HURRAY!! We are connected. :)
			    console.log('Connection established to', url);

			    // do some work here with the database.
			    var cursor = db.collection('codeshares').find();
			    //var count = cursor.count();

			    //console.log("count: " + JSON.stringify(count));
			    var temp = 0;

				cursor.count({}, function(error, num){
					console.log("num: " + num);
					var final_inside  = {};

					cursorForEach();

					function cursorForEach(){
						var flag = 0;
						cursor.forEach( function (doc){
		

								console.log("iv: " + doc['iv'] + "filePath: " + doc['filePath'] + "sharedSecret: " + doc['sharedSecret']);
								var iv = doc['iv'];
								var sharedSecret = doc['sharedSecret'];
								var filePath = doc['filePath'];
								filePath = filePath.substr(filePath.lastIndexOf("/"));
								var newFilePath = "app/public/js/files";
								newFilePath += filePath;

								var decrypted;

								var cipher;
								var content;

								fs.readFile(newFilePath, function read(err, data){
									if(err)
										throw err;

									temp++;
									console.log(temp);

									function processFile(){
										var initializationVector = new Buffer(iv, 'base64');
										var SharedSecret = new Buffer(sharedSecret, 'base64');
										cipher = crypto.createDecipheriv('aes-128-cbc', SharedSecret, initializationVector);
										decrypted += cipher.update(content, 'base64', 'utf8');
										decrypted += cipher.final('utf8');

										console.log(decrypted);
									}


										content = data;
										if(temp == 1)
											inside += ",{\"name\":\"" + doc['fname'] + "" + doc['lname']+ "\"";
										else
											inside += "{\"name\":\"" + doc['fname'] + "" + doc['lname']+ "\"";

										inside += ",\"fileName\":\"" + doc['savedName'] + "\"";
										inside += ",\"language\":\"c\"";
										inside += ",\"date\":\"" + doc['date'] + "\"";
										inside += ",\"content\":\"" + content.toString("base64") + "\"},";


										if(temp == num){
											console.log("Now");
											temp++;
											flag = 1;
										    if (inside.substr(0,1) == ",") {
										        inside = inside.substring(1);
										    }
										    var len = inside.length;
										    if (inside.substr(len-1,1) == ",") {
										        inside = inside.substring(0,len-1);
										    }

											final_inside = "[" + inside + "]";
											final_inside = JSON.parse(final_inside);
											console.log(prettyjson.render(final_inside, {noColor: false}));
											res.send(JSON.stringify(final_inside));
											//console.log(prettyjson.render(final_inside, {noColor: false}));
										}
									})
								})// FOR EACH LOOP
								
							if(flag == 1){
								console.log("When ?");
							}
						}
					});// count

			}// ELSE BLOCK
		});
}

exports.runCode = function (req, res){

	var param = req.body.params;

	var obj = JSON.parse(param);

	var code = new Buffer(obj.data, 'base64');

	console.log("flag: " + obj.flag);
	var f = parseInt(obj.flag);
	if(f){
		console.log("Inside f1");
		console.log(obj.values);
	var envData = { OS : "linux" , cmd : "gcc" }; // ( uses gcc command to compile ) 
	    compiler.compileCPPWithInput(envData , code , obj.values, function (data) {
	        res.send(data);
	        //data.error = error message  
	        //data.output = output value 
	    });

	}else{
	var envData = { OS : "linux" , cmd : "gcc" }; // ( uses gcc command to compile ) 
	    compiler.compileCPP(envData , code , function (data) {
	        res.send(data);
	        //data.error = error message  
	        //data.output = output value 
	    });


	}
}