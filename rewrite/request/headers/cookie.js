var url = require('url'),
    settings = require("../../../settings")(),
    cookieCookiePrefix = settings.cookieCookiePrefix;



function _getDomain(urlRewriter) {
    return url.parse(urlRewriter('/')).pathname.replace(/\//g, '');
}

function _shouldSubmit(domain, cookieCookie){
    if (!cookieCookie)
        return true;
    var t = decodeURIComponent(cookieCookie),
        o = JSON.parse(t);

    return domain.match(new RegExp(o.d + '$'));
}

module.exports = function(headerValue, urlRewriter) {


    var cookies = {},
        newCookies = {},
        domain = _getDomain(urlRewriter),
        cookieNames,
        newHeaderValue = '';


   headerValue.replace(/((.*?)=)*?((.*?)=(.*?))(;|$)/gi, function (a,b,c,d,e,f,g){

       cookies[(c || e).trim()] = f;
       return a;
   });


    cookieNames = Object.getOwnPropertyNames(cookies);

    cookieNames.forEach(function (cookieName) {
        var cookieCookie = cookies[cookieCookiePrefix+cookieName];

        if (!_shouldSubmit(domain, cookieCookie) || cookieName.match(/^mt3__/i)) {
            return;
        }
        newCookies[cookieName] = cookies[cookieName];
    });


    cookieNames = Object.getOwnPropertyNames(newCookies);

    cookieNames.forEach(function (cookieName) {

        if (newHeaderValue!=='' && !/;\s*&/i.test(newHeaderValue)) {
            newHeaderValue += '; ';
        }

        newHeaderValue += cookieName + '=' + newCookies[cookieName];
    });


    return newHeaderValue;
}