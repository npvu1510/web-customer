const createError = require('http-errors');
const express = require('express');
const session = require("express-session");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const passport = require("./config/passport");
const indexRouter = require('./routes/index');
const authRouter = require('./components/auth/authRouter');
const googleRouter = require('./components/google/googleRouter');
const userRouter = require('./components/user/userRouter');
const shopRouter = require('./components/product/productRouter');
const contactRouter = require('./components/contact/contactRouter');
const cartRouter = require('./components/cart/cartRouter');
const orderRouter = require('./components/order/orderRouter')
const apiRouter = require('./api/apiRouter');

const db = require('./config/database.config');
db.connect().then();

const app = express();

app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, "components")]);
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.authenticate('session'));

app.use(function (req, res, next) {
  res.locals.user = req.user || req.session.user;

  if (req.user === undefined) {
    req.user = req.session.user;
  }

  res.locals.number_product = req.session.number_product;
  next();
});

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/google', googleRouter);
app.use('/user', userRouter);
app.use('/product', shopRouter);
app.use('/contact', contactRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/api', apiRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
