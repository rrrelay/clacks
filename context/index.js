var url = require('url'),
	UrlConvertor = require('./url-convertor'),
	settings = require('../settings')(),
	rewriters = require('../rewriters'),
	serverUrl = settings.createHttpUrl(),
	secureServerUrl = settings.createHttpsUrl(),
	uuid = require('node-uuid'),
	watch = require('nostalgorithm').watch;

function _id(request, response){
	console.log('2.1');
	if (!request.signedCookies) return uuid.v4();
	console.log('2.11111');
	var id = request.signedCookies[settings.idCookieName];

	console.log('2.2222');
	if (id) return id;
console.log('2.3333');

	id = uuid.v4();
	console.log('2.44444');
	if (response.cookie){
		//response.cookie(settings.idCookieName, id, {signed: true});

	}
	console.log('2.2');
	return id;
}

function _isClientConnectionSecure(req){
	console.log('hey');
	if (!req) return false;

	return settings.isProduction? req.headers['x-forwarded-proto'] == 'https' : req.secure;
}

function _ipAddress(req){
	if (!req || !req.isProduction) return '127.0.0.1';

	return req.headers['x-forwarded-for'];
}

var Context = function(request, response){
	if (request.url === '/') request.url = '/' + settings.homepage;

	var self = this;
	this.errors = [];
	this.convert =  new UrlConvertor(request);
	this.convert.on('error', function(e){
		// todo: figure out alerts on these
		self.errors.push(e);
	});

	var targetUrl = this.convert.fromProxyUrl(),
		oTargetUrl;

	if (!targetUrl) return;

	this.convert.rewriters = rewriters;
	this.convert = watch(this.convert);

	oTargetUrl = url.parse(targetUrl);

	// ah man, you know..
	this.extraCookies = request.extraCookies;

	this.client =  {
		id: _id(request, response),
		isSecure: _isClientConnectionSecure(request),
		ipAddress: _ipAddress(request)
	};
	this.target =  {
		url: targetUrl,
		oUrl: oTargetUrl
	};
};

Context.prototype.server = {
	url: serverUrl,
	oUrl: url.parse(serverUrl),
	secureUrl: secureServerUrl,
	oSecureUrl: url.parse(secureServerUrl)
};

module.exports = Context;
