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
var regex = /(http\:\/\/[a-zA-Z0-9]+\.cyworld\.com\/[a-zA-Z0-9\.\?\=\%\/_\+]+)/g;
var files = [];
var statics = [];

async.waterfall([
    // get list
    function (callback) {
        console.log('get queue list');
        fs.readdir('./result/', callback);
    },

    function (list, callback) {
        for (var i in list) {
            var entry = list[i];
            if ('file_queue' === entry.substr(0, 10)) {
                files.push(entry);
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
            files,
            function (file, next) {
                async.waterfall([
                    function (subroutine) {
                        console.log('read file - ' + file);
                        fs.readFile('./result/' + file, 'utf8', subroutine);
                    },
                    function (data, subroutine) {
                        console.log('save image - ' + file);
                        async.eachSeries(
                            JSON.parse(data),
                            function (entry, nextImage) {
                                if (-1 === statics.indexOf(entry.original)) {
                                    statics.push(entry.original);
                                    var newName = crypto.createHash('sha1').update(entry.original, 'utf8').digest('hex') + '.jpg';
                                    var address = /http\:\/\/([^\/]+)(\/.+)/g.exec(entry.original);
                                    var options = {
                                        host: address[1],
                                        path: address[2],
                                        method: 'GET',
                                        headers: {
                                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                                            'Upgrade-Insecure-Requests': 1,
                                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                            'Referer': 'http://club.cyworld.com/ClubV1/Home.cy/' + config.clubId,
                                            'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4',
                                            'Cookie': cookies
                                        }
                                    };

                                    http.request(options, function (res) {
                                        var imageStream = new Stream();
                                        res.on('data', function (chunk) {
                                            imageStream.push(chunk);
                                        });

                                        res.on('end', function () {
                                            console.log('saved as - ' + newName);
                                            fs.writeFileSync('./images/' + newName, imageStream.read());
                                            nextImage();
                                        });
                                    }).end();
                                } else {
                                    nextImage();
                                }
                            }, function done() {
                                subroutine(null);
                            }
                        );
                    },
                    function (subroutine) {
                        var articleName = file.replace('file_queue_', '');
                        console.log('read original article - ' + articleName);
                        fs.readFile('./result/' + articleName, 'utf8', subroutine);
                    },
                    function (data) {
                        var articleName = file.replace('file_queue_', '');
                        console.log('save original article - ' + articleName);
                        var json = JSON.parse(data);
                        json.contents = entities.decode(json.contents);
                        json.contents = json.contents.replace(regex, function(match){
                            return '/images/' + crypto.createHash('sha1').update(match, 'utf8').digest('hex') + '.jpg';
                        });
                        if ('undefined' !== typeof json.files) {
                            json.files = json.files.replace(regex, function(match){
                                return '/images/' + crypto.createHash('sha1').update(match, 'utf8').digest('hex') + '.jpg';
                            });
                        }

                        fs.writeFile("./result/" + articleName, JSON.stringify(json));

                        setTimeout(function(){
                            next();
                        }, 2000);
                    }
                ]);
            }
        );
    }
]);