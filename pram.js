var express = require('express');
var path = require('path');

var app = express();

var defaults = require('./config/default.json');
var PORT = defaults.port || 8080;
console.log("PORT = " + PORT);

// configure app
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

// define routes
console.log('base directory: ' + __dirname);

app.use('/controllers', express.static(__dirname + '/public/js/controllers'));
app.use('/views', express.static(__dirname + '/views'));
app.use('/lib', express.static(__dirname + '/public/lib'));
app.use('/shared', express.static(__dirname + '/shared'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/config', express.static(__dirname + '/config'));

app.use('/features', express.static(__dirname + '/public/features'));

app.all('*', function(req, res, next) {
  // CORS headers
  console.log('allow origin');
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
  	next();
    // res.status(500).send('redirect');
  }
});

/** Add Custom Routes for PRAM **/

app.use('/request', require('./routes/request'));
app.use('/order', require('./routes/order'));

app.use('/report', require('./routes/report'));

/** End of Custom Routes **/

app.use('/record', require('./routes/record'));
app.use('/api', require('./routes/api') );
// app.use('/login', require('./routes/login') );

app.use('/test', require('./routes/test'));

app.get('/partials/:name', function (req, res)
 { var name = req.params.name;
    res.render('partials/' + name);
});

app.get('/', function (req, res) {
	console.log('login attempted');
//	res.put('http://limsdemo01.dmz.bcgs.ca');	
	res.render('help');
});

app.get('/home', function (req, res) {
	console.log('generating home page');	
	res.render('homePage', { user: 'Current'})
});

app.listen(PORT, function () {
	console.log('ready on port ' + PORT);
});
