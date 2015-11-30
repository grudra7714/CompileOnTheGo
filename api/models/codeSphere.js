
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var objid = Schema.ObjectId;

var CodeSphere = new Schema({

	id: {type: String},
	iv: {type: String},
	cipherText: {type: String},
	language: {type: String},
	date : {type: Date},
	sharing: {type: Boolean, default: true}
});
module.exports = mongoose.model('codesphere', CodeSphere);