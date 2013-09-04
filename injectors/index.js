var cheerio = require('cheerio');
var fs = require('fs');

var injectors = [];

fs.readdirSync(__dirname).forEach(function(file) {
	if (/\.js$/i.test(file) && file!='index.js' && !/\.spec\.js$/i.test(file)) {
		injectors.push(require(__dirname + '/' + file ));
	}
});

module.exports = function(context, data) {
    var $ = cheerio.load(data.body);

	for (var i=0; i< injectors.length; i++){
		if (injectors[i]($, context, data) === false) break;
	}

    return $.html();
};
