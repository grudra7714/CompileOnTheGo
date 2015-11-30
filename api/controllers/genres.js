//Generate Response JS
exports.generateResponse = function(status, message, code, data){
	var response = {
		status : status,
		message : message,
		code : code,
		data : data
	}
	return JSON.stringify(response);
}

exports.pidResponse = function(message, data){
	var response = {
		message: message,
		data: data
	}
	return JSON.stringify(response);
}

