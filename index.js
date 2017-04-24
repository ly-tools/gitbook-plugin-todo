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
function fixEl(el, tag, $) {
  var found = false;
  el.find(tag).each(function (index, elChild) {
    fixEl($(elChild), tag, $);
    var found = true;
  });
  if (!found) fixElHelper(el, el.html(), tag, 'padding-left: 2em;', $);
}
function fixLi(li, $) {
  var found = false;
  li.find('li').each(function (index, liChild) {
    fixLi($(liChild), $);
    var found = true;
  });
  if (!found) {
    var html = li.html(),
    text = li.text(),
    spanStyle = 'style="display: inline-block; margin-left: -2em; width: 2em; text-align: right; padding-right: 0.45em;"';
    if (re.test(text)) {
      html = html
        .replace(/\s*\[ \]\s*/, '<span ' + spanStyle + '><input type="checkbox" disabled="disabled"></span>')
        .replace(/\s*\[x\]\s*/, '<span ' + spanStyle + '><input type="checkbox" disabled="disabled" checked="checked"></span>');
      fixElHelper(li, html, 'li', 'list-style: none;', $);
    }
  }
}

module.exports = {
  hooks: {
    page: function (page) {
      var $ = cheerio.load(page.content);
      // Ensuring conformant left padding for unordered and ordered lists
      $('ul').each(function (index, ul) {
        fixEl($(ul), 'ul', $);
      });
      $('ol').each(function (index, ul) {
        fixEl($(ul), 'ol', $);
      });
      // Introducing checkboxes
      $('li').each(function (index, li) {
        fixLi($(li), $);
      });
      page.content = $.html();

      return page;
    }
  }
};
