/**
 * Created by ecst_000 on 2016-01-10.
 */
module.exports = function(userId, password, rsaPublic, rsaModulus, callback){
    var querystring = require('querystring');
    var RSAKey = require('./../lib/RSAKey');
    var Base64 = require('./../lib/Base64');
    var https = require('https');

    var today = new Date();
    var timestamp = [
        today.getYear(),
        "y",
        (today.getMonth() + 1),
        "m",
        today.getDate(),
        "d ",
        today.getHours(),
        "h",
        today.getMinutes(),
        "m",
        today.getSeconds(),
        "s"
    ].join('');

    var rsa = new RSAKey();
    rsa.setPublic(rsaPublic, rsaModulus);

    var content = querystring.stringify({
        'email': userId,
        'passwd': '',
        'x': 0,
        'y': 0,
        'loginstr': '',
        'redirection': 'http://www.cyworld.com/cymain',
        'pop': '',
        'passwd_rsa': Base64.hex2b64(rsa.encrypt([timestamp, userId, password].join('|^|'))),
        'iplevel': 2,
        'mode': '',
        'cpurl': ''
    });
    var contentLength = content.length;

    var options = {
        host: 'cyxso.cyworld.com',
        path: '/LoginAuth.sk',
        method: 'POST',
        headers: {
            'Content-Length': contentLength,
            'Cache-Control': 'max-age=0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Origin': 'http://cyxso.cyworld.com',
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'http://cyxso.cyworld.com/Login.sk?loginsrc=redirect&redirection=http%3A%2F%2Fwww.cyworld.com%2Fcymain',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4'
        }
    };


    var req = https.request(options, function (res) {
        if (200 === res.statusCode) {
            callback(null, res.headers['set-cookie']);
        }
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(content);
    req.end();
};