var createError = require('http-errors');
const fs = require('fs')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars')
var handlebars = require('handlebars')
// const fileUpload = require('express-fileUpload')
const db = require('./config/connection')
const session = require('express-session')
const nocache = require("nocache");
const multer = require('multer')
const dotenv = require('dotenv').config();
const client = require("twilio")(process.env.TWILIO_SID_KEY,process.env.TWILIO_SECRET_KEY);



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',   runtimeOptions: {
  allowProtoPropertiesByDefault: true,
  allowProtoMethodsByDefault: true
},
defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
handlebars.registerHelper("inc",function(value,options){
  return(value)+1
})
handlebars.registerHelper("productstatus",function(value,options){
  if(value == 'Item Ready For Dispatch')
  return(value = true)
})
handlebars.registerHelper("productstatus1",function(value,options){
  if(value == 'Shipped')
  return(value = true)
})
handlebars.registerHelper("productstatus2",function(value,options){
  if(value == 'Delivered')
  return(value = true)
})
handlebars.registerHelper("wishlist",function(value,options){
  if(value == 0)
  return(value = true)
})
handlebars.registerHelper("productstatus3",function(value,options){
  if(value == 'Cancelled')
  return(value = true)
})
handlebars.registerHelper("returnstatus",function(value,options){
  if(value == 'Return Requested')
  return(value = true)
})
handlebars.registerHelper("return",function(value,options){
  if(value == 'Return Approved')
  return(value = true)
})
handlebars.registerHelper("multiply",function(value1,value2){
  return value1*value2
})
handlebars.registerHelper("trackorder",function(value){
  if(value=='pending')
  return(value = true)
})


app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload())
app.use(session({secret:"Key",cookie:{maxAge:600000}}))
db.connect((err)=>{
  if(err){
    console.log('Connection Error'+err);
  }else{
    console.log('Database Connected');
  }
})

app.use('/', indexRouter);
app.use('/admin', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
