var express = require('express'),
	swig    = require('swig'),
	cons    = require('consolidate'),
	fs      = require('fs'),
	mongoose = require('mongoose'),
	users = {},
	uuid    = require('node-uuid');
	var Facebook = require('facebook-node-sdk');

var env = "dev";

var app      = express(),
	baseData = fs.readFileSync('./base-data.json').toString(),
	server   = require('http').createServer(app),
	io       = require('socket.io').listen(server);

var data = JSON.parse(baseData);

swig.init({
	cache : false
});

// View engine
app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.set('views', './app/views');

// Add POST, PUT, DELETE methods to the app
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());

//login face

app.configure(function () {
      app.use(express.bodyParser());
      app.use(express.cookieParser());
      app.use(express.session({ secret: 'foo bar' }));
      app.use(Facebook.middleware({ appId: '1384809215100744', secret: '2afc9e2cc778409ac23afc75b3c35d60' }));
    });

// Static files
app.use( express.static('./public') );

// Routes
app.get('/articles/', function(req, res){
	res.send(data);
});

app.post('/articles', function (req, res){
	req.body.id = uuid.v1();
	req.body.votes = 0;
	req.body.image = "/imagenes/img3.jpg";
	// req.body.user  = "Siedrix";

	data.push(req.body);

	console.log('articles::create', req.body);

	io.sockets.emit('articles::create', req.body);

	res.send(200, {status:"Ok", id: req.body.id});
});

app.put('/articles', function (req, res){
	console.log('Updating',req.body);
	var article;

	for (var i = data.length - 1; i >= 0; i--) {
		article = data[i];

		if(article.id === req.body.id){
			data[i] = req.body;
		}
	}

	console.log('articles::update', req.body);

	io.sockets.emit('articles::update', req.body);

	res.send(200, {status:"Ok"});
});

var home = function (req, res) {
req.facebook.api('/me', function(err, user) {
	res.render('index',{
		posts : data,
		env   : env
	});

});
};

var nome = function (req, res) {
req.facebook.api('/me', function(err, user) {
	return user.name;
	
});
};

var logueo = function (req, res) {
	res.render('login',{
		posts : data,
		env   : env
	});
};

app.get('/', logueo);
app.get('/principal', Facebook.loginRequired(), home);
app.get('/article/:id', home);


server.listen(3000);

mongoose.connect('mongodb://localhost/chat', function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Conectado a mongoDB!');
	}
});

var chatSchema = mongoose.Schema({
	nick: String,
	msg: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	var query = Chat.find({});
	query.sort('-created').limit(8).exec(function(err, docs){
		if(err) throw err;
		socket.emit('load old msgs', docs);
	});
	
	socket.on('new user', function(data, callback){
		if (data in users){
			callback(false);
		} else{
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});
	
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}

	socket.on('send message', function(data, callback){
		var msg = data.trim();
		console.log('after trimming message is: ' + msg);
		if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind !== -1){
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				if(name in users){
					users[name].emit('whisper', {msg: msg, nick: socket.nickname});
					console.log('message sent is: ' + msg);
					console.log('Whisper!');
				} else{
					callback('Error!  Enter a valid user.');
				}
			} else{
				callback('Error!  Please enter a message for your whisper.');
			}
		} else{
			var newMsg = new Chat({msg: msg, nick: socket.nickname});
			newMsg.save(function(err){
				if(err) throw err;
				io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
			});
		}
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
});