/**
 * Created by ecst_000 on 2016-01-09.
 */
var async = require('async');
var config = require('./core/config');
var fs = require('fs');
var http = require('http');
var crypto = require('crypto');
var Stream = require('stream').Transform;
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var regex = /(http\:\/\/cyimg[0-9]+\.cyworld\.com\/[a-zA-Z0-9\.\?\=\%\/_\+]+)/g;
var pageNo = 1;

async.waterfall([
    // get auth
    function (callback) {
        console.log('get auth');
        require('./core/auth')(config.userId, config.password, config.rsaPublic, config.rsaModulus,
            callback);
    },

    // paring cookie
    function (cookies, callback) {
        console.log('paring cookies');
        var cookieLength = cookies.length;
        var newCookie = [];
        for (var i = 0; i < cookieLength; i++) {
            var chuck = cookies[i];
            newCookie.push(chuck.substring(0, chuck.indexOf('; ')));
        }

        callback(null, newCookie.join('; '));
    },

    // get files
    function (cookies, callback) {
        var http = require('http');
        var iconv = require('iconv-lite');

        var options = {
            host: 'club.cyworld.com',
            path: 'http://club.cyworld.com/club2/views/board/freetalk/FreeTalkMainView.aspx?club_id=' + config.clubId +'&board_no=6',
            method: 'POST',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'http://club.cyworld.com/ClubV1/Home.cy/' + config.clubId,
                'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4',
                'Cookie' : cookies
            }
        };

        var req = http.request(options, function (res) {
            var chunks = [];
            res.on('data', function(chuck){
                chunks.push(chuck);
            });

            res.on('end', function(){
                var decodedBody = iconv.decode(Buffer.concat(chunks), 'euckr');
                callback(null, cookies, decodedBody);
            });
        });

        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        req.end();
    },

    function (cookies, data, callback) {
        var cheerio = require('cheerio');
        var $ = cheerio.load(data);
        var itemList = $('#freetalk_listbox li');
        var result = [];

        itemList.each(function(i, e){
            var item = $(this);
            result.push({
                username: item.find('span.wrap_namebox a.nameui').text(),
                registerAt: item.find('em.date').text(),
                contents: item.find('span.textWrap').text().trim(),
                idx: item.find('a.cyHide').attr('name').replace('replyTarget_', '')
            });
        });

        callback(null, result);
    },

    function (data) {
        var fs = require('fs');
        fs.writeFile('./result/freetalk_' + pageNo + '.txt', JSON.stringify(data));
    }
]);