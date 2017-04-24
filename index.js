'use strict';
var cheerio = require('cheerio');
var _ = require('underscore');
var re = /^\s*\[[x ]\]\s*/;

function fixElHelper(el, html, tag, addStyle, $) {
  var style = (el.attr('style') || '').trim();
  style = (style.length > 0 && style[style.length-1] != ';') ? style + '; ' : style;
  var attributes = 'style="' + style + addStyle + '"';
  if (el.attr('class')) attributes += ' class="' + el.attr('class') + '"';
  if (el.attr('id')) attributes += ' id="' + el.attr('id') + '"';
  el.replaceWith('<' + tag + ' ' + attributes + '>' + html + '</' + tag + '>');
}
function fixUl(ul, $) {
  var found = false;
  ul.find('ul').each(function (index, ulChild) {
    fixUl($(ulChild), $);
    var found = true;
  });
  if (!found) fixElHelper(ul, ul.html(), 'ul', 'margin-left: 0; padding-left: 0;', $);
}
function fixLi(li, $) {
  var found = false;
  li.find('li').each(function (index, liChild) {
    fixLi($(liChild), $);
    var found = true;
  });
  if (!found) {
    var html = li.html();
    if (re.test(html)) {
      html = html
        .replace(/^\s*\[ \]\s*/, '<input type="checkbox" disabled="disabled" style="margin-right: 0.8em"> ')
        .replace(/^\s*\[x\]\s*/, '<input type="checkbox" disabled="disabled" checked="checked" style="margin-right: 0.8em"> ');
      fixElHelper(li, html, 'li', 'list-style: none; padding-left: 1em;', $);
    } else {
      fixElHelper(li, html, 'li', 'list-style-position: inside; padding-left: 1em; padding-left: calc(1em + 1px);', $);
    }
  }
}

module.exports = {
  hooks: {
    page: function (page) {
      var $ = cheerio.load(page.content);
      $('ul').each(function (index, ul) {
        fixUl($(ul), $);
      });
      $('li').each(function (index, li) {
        fixLi($(li), $);
      });
      page.content = $.html();

      return page;
    }
  }
};
