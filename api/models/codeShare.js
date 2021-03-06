
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var objid = Schema.ObjectId;

var CodeShare = new Schema({

	id: {type: String},
	email: {type: String},
	fname: {type: String},
	lname: {type: String},
	iv: {type: String},
	cipherText: {type: String},
	language: {type: String},
	date : {type: Date},
});
module.exports = mongoose.model('codesphere', CodeSphere);