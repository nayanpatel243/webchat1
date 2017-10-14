const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const passport = require('passport');
const passportJWT = require('passport-jwt');

const config = require('./config/app.conf');
const User = require('./models/user');

console.log('config.database---> ',config.database)
mongoose.connect(config.database, { useMongoClient: true });

const app = express();
global.config = config;

// passport Stratergy
const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
  secretOrKey: config.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const strategy = new Strategy(params, ((payload, done) => {
  // console.log('Payload ', payload, payload._doc._id);
  User.findById(payload._doc._id, (err, user) => {
    if (!user) {
      return done(new Error('Unknown user !'), null);
    }
    return done(null, user);
  });
}));

passport.use(strategy);

// middlewares 
const requireAuth = require('./config/passport');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Validator
app.use(expressValidator({
  errorFormatter(param, msg, value) {
    let namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += `[${namespace.shift()}]`;
    }
    return {
      param: formParam,
      msg,
      value,
    };
  },
}));

// Global Vars
app.use((req, res, next) => {
  // res.locals.success_msg = req.flash('success_msg');
  // res.locals.error_msg = req.flash('error_msg');
  // res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// res.status(404).json({success: false, message: 'Unauthorised'});


// Routing 

app.use('/', require('./routes/index'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', requireAuth.authenticate, require('./routes/users'));
app.use('/api/chat', requireAuth.authenticate, require('./routes/chat'));
app.use('/api/group', requireAuth.authenticate, require('./routes/group'));


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ success: false, message: 'Invalid Url' });
  // next(err);
});

process.on('uncaughtException', (error) => {
  console.dir(error);
});
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  // console.log('errrr ', err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  const code = err.status || 500;
  res.status(code);
  // res.render('error');
  res.status(code).json({ status: false, message: err.message });
});

module.exports = app;
