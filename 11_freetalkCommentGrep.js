/**
 * Created by ecst_000 on 2016-01-09.
 */
var async = require('async');
var config = require('./core/config');
var fs = require('fs');
var http = require('http');
var crypto = require('crypto');
var cheerio = require('cheerio');
var Stream = require('stream').Transform;
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var regex = /(http\:\/\/cyimg[0-9]+\.cyworld\.com\/[a-zA-Z0-9\.\?\=\%\/_\+]+)/g;
var talks = [];

async.waterfall([
    // get list
    function (callback) {
        console.log('get galleries list');
        fs.readdir('./result/', callback);
    },

    function (list, callback) {
        for (var i in list) {
            var entry = list[i];
            if ('freetalk_' === entry.substr(0, 9)) {
                talks.push(entry);
            }
        }

        callback(null);
    },

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
    function (cookies) {
        async.eachSeries(
            talks,
            function (file, next) {
                async.waterfall([
                    function (subroutine) {
                        console.log('read file - ' + file);
                        fs.readFile('./freetalk/' + file, 'utf8', subroutine);
                    },
                    function (data, subroutine) {
                        console.log('get comment list - ' + file);
                        async.eachSeries(
                            JSON.parse(data),
                            function (entry, nextComment) {
                                var content = JSON.stringify({
                                    clubauth: "0",
                                    gradeIcon: "3005",
                                    gradeNo: "5",
                                    item_seq: entry.idx,
                                    //membergrade: "1",
                                    //user_id: "ALG42K2D",
                                    //user_nm: "이현석"
                                });
                                var contentLength = content.length;

                                var options = {
                                    'Content-Length': contentLength,
                                    host: 'club.cyworld.com',
                                    path: '/club2/service/clubservice.svc/RetriveFreeTalkReply',
                                    method: 'POST',
                                    headers: {
                                        'Origin': 'http://club.cyworld.com',
                                        'X-Requested-With' : 'XMLHttpRequest',
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
                                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                                        'Upgrade-Insecure-Requests': 1,
                                        'Content-Type': 'application/json',
                                        'Referer': 'http://club.cyworld.com/ClubV1/Home.cy/' + config.clubId,
                                        'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4',
                                        'Cookie': cookies
                                    }
                                };

                                var req = http.request(options, function (res) {
                                    var chunks = [];
                                    res.on('data', function (chunk) {
                                        chunks.push(chunk);
                                    });

                                    res.on('end', function () {
                                        var result = chunks.join('');
                                        var json = JSON.parse(result);
                                        var $ = cheerio.load(json.d);

                                        var replies = $('#freetalk_cmnt_list li');
                                        var result = [];

                                        replies.each(function(i, e){
                                            var reply = $(this);
                                            if (!reply.hasClass('new_re')) {
                                                result.push({
                                                    username: reply.find('a.nameui').text(),
                                                    registerAt: reply.find('em.date').text(),
                                                    contents: reply.find('span.current_cmnt').text()
                                                });
                                            }
                                        });

                                        fs.writeFile("./freetalk/comment_" + entry.idx + ".txt", JSON.stringify(result));
                                        nextComment();
                                    });
                                });

                                req.write(content);
                                req.end();
                            }, function done() {
                                subroutine(null);
                            }
                        );
                    },

                    function () {
                        setTimeout(function(){
                            next();
                        }, 2000);
                    }
                ]);
            }
        );
    }
]);