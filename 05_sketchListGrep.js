/**
 * Created by ecst_000 on 2016-01-09.
 */
var async = require('async');
var cheerio = require('cheerio');
var config = require('./core/config');
var fs = require('fs');

var articles = [];

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

    function (cookies, callback) {
        require('./core/sketchList')(cookies, config.clubId, 1, callback);
    },

    function (cookies, data, callback) {
        console.log('parsing first page');
        require('./core/parseGalleryList')(cookies, data, callback);
    },

    function (cookies, result, callback) {
        console.log('get page count');
        fs.writeFile('result/sketch_list_1.txt', JSON.stringify(result.articles));

        var queue = [];
        for (var i = 2; i <= result.maxPage; i++) {
            queue.push(i);
        }

        callback(null, cookies, queue);
    },

    function (cookies, queue) {
        async.eachSeries(
            queue,
            function (pageNo, next) {
                async.waterfall([
                    function (subroutine) {
                        require('./core/sketchList')(cookies, config.clubId, pageNo, subroutine);
                    },
                    function (cookies, data, subroutine) {
                        console.log('parsing page - ' + pageNo);
                        require('./core/parseGalleryList')(cookies, data, subroutine);
                    },
                    function (cookies, result) {
                        fs.writeFile('result/sketch_list_' + pageNo + '.txt', JSON.stringify(result.articles));
                        setTimeout(next, 2000);
                    }
                ]);
            },
            function () {
                console.log('sketches done');
            }
        );
    }
]);