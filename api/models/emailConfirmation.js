
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var objid = Schema.ObjectId;

var EmailConfirmSchema = new Schema({

	email: {type: String, required: true, unique: true},
	confirm_string : {type : String},
	status : {type : Boolean},
	initDate: {type: Date}
});

module.exports = mongoose.model('emailconfirm',EmailConfirmSchema);