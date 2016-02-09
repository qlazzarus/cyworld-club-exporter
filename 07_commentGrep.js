/**
 * Created by ecst_000 on 2016-01-09.
 */
var async = require('async');
var fs = require('fs');
var cheerio = require('cheerio');
var config = require('./core/config');

var articleId = [];

async.waterfall([
    // get list
    function (callback) {
        console.log('get galleries list');
        fs.readdir('./result/', callback);
    },

    function (list, callback) {
        for (var i in list) {
            var entry = list[i];
            if (-1 !== ['sketch_view_', 'gallery_view', 'article_view'].indexOf(entry.substr(0, 12))) {
                articleId.push(entry);
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

    function (cookies) {
        async.eachSeries(
            articleId,
            function (articleFile, next) {
                async.waterfall([
                    function (subroutine) {
                        var articleCapture = /([a-z]+)_[a-z_]+([0-9]+)\.txt/g.exec(articleFile);
                        if (null !== articleCapture) {
                            subroutine(null, articleCapture[1], articleCapture[2]);
                        }
                    },

                    // articles -> board_type=1
                    // galleries -> board_type=2
                    // sketch -> board_type=4
                    function (category, articleNo, subroutine) {
                        var categoryNo = 1;
                        if ('gallery' === category) {
                            categoryNo = 2;
                        } else if ('sketch' === category) {
                            categoryNo = 4;
                        }

                        require('./core/comment')(cookies, config.clubId, articleNo, categoryNo, subroutine);
                    },

                    function (cookies, articleNo, data, subroutine) {
                        console.log('parsing article - ' + articleNo);
                        require('./core/parseComment')(cookies, articleNo, data, subroutine);
                    },

                    function (cookies, articleNo, contents) {
                        fs.writeFile("./result/comment_" + articleNo + '.txt', JSON.stringify(contents));
                        setTimeout(next, 1000);
                    }
                ]);
            },

            function () {
                console.log('comments done');
            }
        );
    }
]);