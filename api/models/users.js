var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var objid = Schema.ObjectId;

var UserSchema = new Schema({

	email: {type: String, required: true, unique: true},
	fname : {type : String},
	lname : {type : String},
	password : { type : String ,required : true},
	mobile : {type : String},
	valid: {type: Boolean, default: false},
	profileUrl: {type: String, default: '/comingsoon'},
/*	codes: [{
			submissions: {type: String, default: 0},
			shares: {type: String, default : 0},
			language:[ {
				c: {type: String, default: 0},
				cpp: {type: String, default: 0},
				JAVA: {type: String, default: 0},
			}]
	}]
*/});

module.exports = mongoose.model('user',UserSchema);