/**
 * Created by ecst_000 on 2016-01-09.
 */
var async = require('async');
var config = require('./core/config');
var fs = require('fs');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var regex = /http\:\/\/[a-zA-Z0-9]+\.cyworld\.com\/[a-zA-Z0-9\.\?\=\%\/_\+]+/g;

async.waterfall([
    // get list
    function (callback) {
        console.log('get galleries list');
        fs.readdir('./result/', callback);
    },

    function (list, callback) {
        var queue = [];
        for (var i in list) {
            var entry = list[i];
            if (-1 !== ['sketch_view_', 'gallery_view', 'article_view'].indexOf(entry.substr(0, 12))) {
                queue.push(entry);
            }
        }

        callback(null, queue);
    },

    function (queue) {
        async.eachSeries(
            queue,
            function (filename, next) {
                async.waterfall([
                    function (subroutine) {
                        fs.readFile('./result/' + filename, 'utf8', subroutine);
                    },

                    function (data) {
                        var json = JSON.parse(data);
                        var match;
                        var queue = [];

                        var saveName = 'file_queue_' + filename;

                        if ('undefined' !== typeof json.files) {
                            while (match = regex.exec(json.files)) {
                                queue.push({
                                    index: 'files',
                                    original: match[0]
                                });
                            }
                        }

                        var convert = entities.decode(json.contents);

                        while (match = regex.exec(convert)) {
                            queue.push({
                                index: match.index,
                                original: match[0]
                            });
                        }

                        if (0 < queue.length) {
                            fs.writeFile("./result/" + saveName, JSON.stringify(queue));
                        }

                        next();
                    }
                ]);
            },
            function () {
                console.log('attach file queue save done');
            }
        );
    }
]);