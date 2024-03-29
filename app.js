var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
var helpers = require('handlebars-helpers')({
  handlebars: hbs
});

var indexRouter = require('./routes/index');
var dataRouter = require('./routes/data');
var chatRouter = require('./routes/chat');

var app = express();

// view engine setup
hbs.registerHelper('getRandomRegion', (image, options) => {
  let size = 50;
  if (options.hash["size"]) {
    size = options.hash["size"];
  }

  let minX = Math.ceil(size/2);
  let maxX = Math.floor(image.width-(size/2));
  let minY = Math.ceil(size/2);
  let maxY = Math.floor(image.height-(size/2));

  let pos = {
      x: Math.floor(Math.random() * (maxX - minX + 1)) + minX,
      y: Math.floor(Math.random() * (maxY - minY + 1)) + minY
  };

  return `${pos.x},${pos.y},${size},${size}`;
});

hbs.registerHelper('makeGradient', (colors) => {
  let scale = 100;
  let steps = [];
  let stop = 0;
 
  colors.forEach((c, i) => {    
    if (i>0) stop += Math.round(colors[i-1].percentRounded);
    // a stupid hack to clamp the percents at the upper end between 1 and 100
    if (stop>=90) stop = stop - (stop - 100 + (colors.length-i)) + 1;
    steps.push(`rgba(${c.r},${c.g},${c.b},1) ${stop}%`);
  })
  
  return `linear-gradient(90deg, ${steps.toString()})`;
});

hbs.registerHelper('colorPercentToWidth', (amount, options) => {
  let scale = 300;

  if (options.hash["scale"]) {
      scale = options.hash["scale"];
  }

  return Math.ceil(amount * scale);
});

hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/data', dataRouter);
app.use('/chat', chatRouter);

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
