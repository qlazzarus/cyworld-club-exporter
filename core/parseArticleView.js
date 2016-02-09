/**
 * Created by ecst_000 on 2016-01-10.
 */
module.exports = function (cookies, articleNo, articles, callback) {
    var cheerio = require('cheerio');
    var $ = cheerio.load(articles);

    callback(null, cookies, articleNo, {
        articleNo: articleNo,
        subject: $('.wrapTitle h4').text().trim(),
        registerAt: $('.box_posting_info em.dateinfo').text().trim(),
        username: $('.box_posting_info a.nameui').text().trim(),
        contents: $('#main_content').html().trim()
    });
};