//EXPRESS SETUP

var express = require('express');
var app = express();
var router = express.Router();
var port = process.env.PORT || 5000;

//MIDDLEWARES

var path = require('path');
var http = require('http');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var methodOverride      = require('method-override');
var bodyParser = require('body-parser');
var session = require('express-session');
var ejs = require("ejs");
var dbcon = require('./config/database.js');
var MongoStore = require("connect-mongo")(session);

var routes = require('./routes');

var api = require("./api");

// view engine setup
app.set('views', path.join(__dirname, 'app'));
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app')));
app.use(express.static(path.join(__dirname, 'app/views')));
app.use(express.static(path.join(__dirname, 'app/public/')));
app.use(express.static(path.join(__dirname, 'app/public/js')));
app.use(express.static(path.join(__dirname, 'app/public/css')));
app.use('/bower_components', express.static(__dirname + '/app/bower_components'));
app.use(session({
    secret: "5da4s5dasad5as4d",
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
        url: dbcon.url,
        ttl: 14*24*60*60,
        clear_interval: -1
    })
}))

app.use(bodyParser.urlencoded({                     // parse application/x-www-form-urlencoded
  extended: true
}));


app.use('/', router);
app.get('/api', api.index);


//USER OPERATIONS
    
app.post("/api/user/loginUser", api.loginUser);
app.post("/api/user/getData", api.getData);
app.post("/api/user/addUser", api.addUser);
app.post("/api/user/shareCode", api.shareCode);
app.post("/api/user/saveCode", api.codeSave);
app.post("/api/get/public", api.getPublic);
app.get("/new/user/email/*", api.confirmUser);
app.get("/codearea/public/*", api.sendPublic);
app.get("/codearea/new/*", api.sendNew);
app.post("/api/run/code", api.runCode);

/// error handlers
 //


app.get("/", routes.index);

app.listen(port,'127.0.0.1', function(){
    console.log('Magic happens on port ' + port);
    console.log("... in %s mode", app.settings.env);
});