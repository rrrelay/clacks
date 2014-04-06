var url = require('url');

var o = {
  hostname: process.env.MT3_hostname || 'admin.miketown3.com',
  port: process.env.MT3_port || 80,
  sslPort: process.env.MT3_sslPort || 443,
  forceSsl: true,
  showNavBar: true,
  lastCommit: process.env.MT3_lastCommit || '2dd0af47bc8586681b48733ec8f27413d0489e6a',
  isProduction: process.env.NODE_ENV === 'production',
  homepage: 'http://about.miketown3.com',
  cookieSecret: process.env.MT3_cookieSecret || 'you have gross feet',
  idCookieName: 'chocolate',
  redisUrl:  process.env.REDISTOGO_URL
};


o.createHttpsUrl = function(){
	return url.format({
		port: o.sslPort,
		hostname: o.hostname,
		protocol: 'https:',
		slashes: true,
		pathname:'/proxy/'
	});
};
o.createHttpUrl = function(){
	return url.format({
		port: o.port,
		hostname: o.hostname,
		protocol: 'http:',
		slashes: true,
		pathname:'/proxy/'
	});
};


module.exports = function(){return Object.create(o);};
