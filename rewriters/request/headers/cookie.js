var CookieStore = require('../../../cookie_store');
var q = require('q');

module.exports = function(headerValue, context) {
	var d = q.defer();


	d.resolve(context.extraCookies[0]);


	return d.promise;
};
