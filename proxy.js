var http = require('http')
    , url = require('url')
    , settings = require("./settings")()
    , rewriters = require("./rewrite/")
    ;

function _getDestinationUrl(request){
    var dest = request.url.substr(1);   // kill the slash

    if (!dest.match(/^(http:|https:)?\/\//i)) {
        dest = "http://" + dest;
    }

    return dest;
}


function _getDestinationRequestParameters(request){
    var dest = _getDestinationUrl(request), opt;

    opt = url.parse(dest);
    opt.method = request.method;


    return opt;
}

function _getRewriter(proxyResponse){
    var contentType = (proxyResponse.headers["content-type"] || "").match(/^([\w\-/]+?)(;|$)+/i);
    return contentType && contentType.length>1 ? rewriters.response[contentType[1]] : null;
}

function _isRelative(url){
    return !url.match(/^(http:|https:)?\/\//i);
}

function _createProxiedUrl(originalUrl, referrer, forceSsl){
    var o, s;

    originalUrl = typeof originalUrl === 'string' ? originalUrl : url.format(originalUrl);

    if (_isRelative(originalUrl)){
        originalUrl = url.resolve(referrer, originalUrl);
    }

    o = Object.create(settings);
    //o.pathname = originalUrl.replace(/http:\/\/|https:\/\//, '');
    o.protocol = forceSsl || settings.forceSsl || originalUrl.match(/https:\/\//) ? "https" : "http";

    s = url.format(o) +'/'+ originalUrl.replace(/^(http:|https:)?\/\//i, '');
    return s;
}

function _getContentEncoding(repsonse){
    var matches = (repsonse.headers["content-type"] || '').match(/charset=(.+)/i),
        encoding =   matches && matches.length>1 ? (matches[1] || '').toLowerCase() : 'utf-8';

    switch (encoding){
        case 'iso-8859-1':
           return 'utf-8';

        default:
            return encoding;
    }
}

exports.go = function(request, response) {
    var destinationOptions =  _getDestinationRequestParameters(request),
        requestUrl = url.format(destinationOptions),
        html='',
        encoding,
        urlRewriter = function(originalUrl){
            return _createProxiedUrl(originalUrl, requestUrl);
        };

    destinationOptions.headers = rewriters.request.headers(request.headers, urlRewriter);

    var proxy_request = http.request(destinationOptions, function(proxy_response){
        var rewriter = _getRewriter(proxy_response);

        response.writeHead(proxy_response.statusCode, rewriters.response.headers(proxy_response.headers, urlRewriter));

        if (rewriter){
            encoding = _getContentEncoding(proxy_response);

            proxy_response.addListener('data', function(chunk) {

                html += new Buffer(Array.prototype.slice.call(chunk, 0), encoding).toString(encoding);
            });

            proxy_response.addListener('end', function() {
                response.write(rewriter(html, urlRewriter), encoding);
                response.end();
            });

        } else {

            proxy_response.addListener('data', function(chunk) {
                response.write(chunk, 'binary');
            });

            proxy_response.addListener('end', function() {
                response.end();
            });
        }

        proxy_response.addListener('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
    });


    proxy_request.on('error', function (err) {
        console.log(err);
        response.writeHead(500);
        response.end();
    });


    if (request.mt3 && request.mt3.body){

        proxy_request.write(request.mt3.body);

    }

    request.on('data', function(chunk) {
        proxy_request.write(chunk, 'binary');
    });

    request.on('end', function() {
        proxy_request.end();
    });

}

