var express = require('express'); 
var router = express.Router();

/* GET home page. */
exports.index  = function(req, res) {
	
//session checking code - from here

	
// till here	
	console.log("Inside routes");
	res.contentType('text/html');
	res.render('index.html', {title: "Compile - On - The - Go", session: true});
	//res.redirect("/access");
};
