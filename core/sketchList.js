/**
 * Created by ecst_000 on 2016-01-10.
 */
module.exports = function(cookies, clubId, pageNo, callback){
    var http = require('http');
    var iconv = require('iconv-lite');

    var options = {
        host: 'club.cyworld.com',
        path: '/club/board/sketch/ListAlbum.asp?club_id=' + clubId + '&cpage=' + pageNo + '&board_no=4&list_type=0&board_type=4&show_type=4',
        method: 'POST',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'http://club.cyworld.com/ClubV1/Home.cy/' + clubId,
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
};