
/*
* jQuery dom 构建帮助 1.0
* 返回的为 jQuery 的dom对象
*/
(function () {
    var domHelper = {
        //获取div
        getDiv: function () {
            return $('<div />');
        },
        getDivByClass: function (cla) {
            var div = this.getDiv();
            div.addClass(cla);
            return div;
        },
        //获取span
        getSpan: function () {
            return $('<span />');
        },
        getSpanByClass: function (cla) {
            var span = this.getSpan();
            span.addClass(cla);
            return span;
        },
        //获取option
        getOption: function () {
            return $('<option/>');
        },
        getOptionByContent: function (content) {
            var option = this.getOption();
            option.html(content);
            return option;
        },
        //获取select
        getSelect: function () {
            return $('<select />');
        },
        getSelectByClass: function (cla) {
            var select = this.getSelect();
            select.addClass(cla);
            return select;
        }
    }
    window.domHelper = domHelper;
})();
/*
* 常用正则表达式封装 等1.0
*/
(function () {
    /***字符串扩展**/
    //1.去除所有空格、换行符等
    String.prototype.TrimAll = function () {
        return this.replace(/(\s|\u00A0)+/g, "");
    }
    //2.去除左右空格
    String.prototype.Trim = function () {
        return this.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
    }
    //3.去除左空格
    String.prototype.LTrim = function () {
        return this.replace(/^(\s|\u00A0)*/, "");
    }
    //4.去除右空格
    String.prototype.RTrim = function () {
        return this.replace(/(\s|\u00A0)*$/g, "");
    }
    //5.字符串换 （如果当前字符串和参数相同 则返回空）
    String.prototype.ReplaceToNull = function (str) {
        if (this == str)
            return "";
        return this;
    }
    //字符串替换 （所有）
    String.prototype.ReplaceAll = function (str, target) {
        var pattern = new RegExp(str, "g");
        return this.replace(pattern, target);
    }
    /***数组扩展**/
    Array.prototype.remove = function (dx) {
        if (isNaN(dx) || dx > this.length) { return false; }
        for (var i = 0, n = 0; i < this.length; i++) {
            if (this[i] != this[dx]) {
                this[n++] = this[i]
            }
        }
        this.length -= 1
    }

    /*正则验证*/
    window.Regex = {
        //手机号验证
        PhoneNumber: function (number) {
            number = number.Trim();
            if (number.length <= 0) return false;
            var regPattton = /1[3-8]+\d{9}/;
            if (regPattton.test(number))
                return true;
            return false;
        },
        //邮箱验证
        EMail: function (email) {
            email = email.Trim();
            if (email.length <= 0)
                return false;
            var regPattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
            return regPattern.test(email);
        },
        //QQ验证
        QQ: function (qq) {
            qq = qq.TrimAll();
            if (qq.length <= 0)
                return false;
            var regPattern = /^[1-9]\d{4,12}$/;
            return regPattern.test(qq);
        },
        //固定电话验证
        FixedPhone: function (phone) {
            phone = phone.TrimAll();
            if (phone.length <= 0)
                return false;
            var regPattern = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            return regPattern.test(phone);
        },
        //域名地址验证 格式：http://www.**.com
        SiteUrl: function (url) {
            url = url.TrimAll();
            if (url.length <= 0)
                return false;
            var regPattern = /^http:[/]{2}www.\w+.com$/;
            return regPattern.test(url);
        },
        //url地址验证
        Url: function (url) {
            url = url.TrimAll();
            if (url.length <= 0)
                return false;

            var strRegex = '^((https|http|ftp|rtsp|mms)?://)'
                + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
                + '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
                + '|' // 允许IP和DOMAIN（域名） 
                + '([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
                + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
                + '[a-z]{2,6})' // first level domain- .com or .museum 
                + '(:[0-9]{1,4})?' // 端口- :80 
                + '((/?)|' // a slash isn't required if there is no file name 
                + '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$';
            var re = new RegExp(strRegex);
            return re.test(url);
        },
        //正整数验证
        PositiveInteger: function (number) {
            number = number.TrimAll();
            if (number.length <= 0)
                return false;

            var regStr = /^[0-9]*[1-9][0-9]*$/;
            var re = new RegExp(regStr);
            return re.test(number);
        },


        //浏览器版本验证 
        //禁用IE内核number(默认8) 以下的浏览器
        navigatorFileter: function (number) {
            var userAgent = window.navigator.userAgent.toLowerCase();
            if (number == undefined)
                number = 8;
            if (window.navigator.appName == "Microsoft Internet Explorer") {
                try {
                    var version = userAgent.match(/msie ([\d.]+)/)[1];
                    version = parseInt(version);
                    if (version < number) {
                        alert("网站暂不支持，IE7内核以下的浏览器，为了更好的体验请升级或使用其他浏览器。");
                        window.close();
                    }
                } catch (e) {
                }
            }
        }
    }


    /*富文本编辑器调用*/

    /**富文本编辑器  获取方法**/
    window.RichEditor = function (id, isSingle,width, uploadJson, fileManagerJson) {
        var defaults = {
            resizeType: 1,
            allowPreviewEmoticons: false,
            allowImageUpload: true,
            urlType: 'absolute',
            uploadJson: "../Scripts/kindeditor-4.1.10/asp.net/upload_json.ashx",
            fileManagerJson: '../Scripts/kindeditor-4.1.10/asp.net/file_manager_json.ashx',
            allowFileManager: true,
            width: width
        }
        if (isSingle) {
            defaults.items = [
            'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
            'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist',
            'insertunorderedlist', '|', 'emoticons', 'image', 'link'];
        }
        if (uploadJson) {
            defaults.uploadJson = uploadJson;
        }
        if (fileManagerJson) {
            defaults.fileManagerJson = fileManagerJson;
        }

        var tempEditor = KindEditor.create(id, defaults);
        //tempEditor.html('&nbsp;');
        return tempEditor;
    }

})();
/*
* 滚动条 常用方法封装
*/
(function () {
    /*******window滚动条**********/
    window.scrollHelper = {
        //1. 1秒钟 滚动到指定位置
        scrollTop: function (top) {
            $('body,html').stop(true, false).animate({
                scrollTop: top
            }, 1000);
        },
        //2. 1秒钟 滚动到 dom对象的位置
        scrollTo: function (dom) {
            scrollHelper.scrollTop(dom.offset().top);
        },
        //3. 1秒钟 滚动到 文档头部
        scrollToTop: function () {
            scrollHelper.scrollTop(0);
        },
        //1秒钟  滚动到 完档的底部
        scrollToBottom: function () {

        }
    }
})();


/*
*  window.urlHelper
*  浏览器 地址栏 操作帮助类
*/
(function () {
    var urlHelper = {
        //获取地址栏中的ID  http://....../xxx.html
        getUrlID: function () {
            var url = this.getHref();
            var number = url.substr(url.lastIndexOf('/') + 1);
            number = number.substr(0, number.indexOf('.'));
            return number;
        },
        //获取地址栏 url 全路径
        getHref: function () {
            return window.location.href.toLowerCase();
        },
        //获取地址栏 参数部分
        getParams: function () {
            return window.location.search;
        },
        //为地址栏 设置参数-----参数统一小写
        setParams: function (params) {
            params = params.toLowerCase();
            window.location.href =
                window.location.href.replace(window.location.search, '')
                + '?' + params;
        },
        //获取 地址栏 参数key对应的值--key不区分大小写
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name.toLowerCase() + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return r[2];
            return "";
        },
        //页面跳转--当前页面,统一小写
        open: function (url) {
            window.location.href = url.toLowerCase();
        },
        //页面跳转---新窗口，统一小写
        openNew: function (url) {
            window.open(url.toLowerCase(), '_blank');
        },
        //判断地址栏中是否有指定的字符串---不区分大小写
        isContain: function (str) {
            str = str.toLowerCase();
            var url = this.getHref();

            if (url.indexOf(str) == -1)
                return false;
            return true;
        }
        //向地址栏中添加参数
    }
    window.urlHelper = urlHelper;
})();



/**
 * jQuery JSON plugin 2.4.0
 *
 * @author Brantley Harris, 2009-2011
 * @author Timo Tijhof, 2011-2012
 * @source This plugin is heavily influenced by MochiKit's serializeJSON, which is
 *         copyrighted 2005 by Bob Ippolito.
 * @source Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 *         website's http://www.json.org/json2.js, which proclaims:
 *         "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 *         I uphold.
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function ($) {
    'use strict';

    var escape = /["\\\x00-\x1f\x7f-\x9f]/g,
		meta = {
		    '\b': '\\b',
		    '\t': '\\t',
		    '\n': '\\n',
		    '\f': '\\f',
		    '\r': '\\r',
		    '"': '\\"',
		    '\\': '\\\\'
		},
		hasOwn = Object.prototype.hasOwnProperty;

    /**
	 * jQuery.toJSON
	 * Converts the given argument into a JSON representation.
	 *
	 * @param o {Mixed} The json-serializable *thing* to be converted
	 *
	 * If an object has a toJSON prototype, that will be used to get the representation.
	 * Non-integer/string keys are skipped in the object, as are keys that point to a
	 * function.
	 *
	 */
    $.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function (o) {
        if (o === null) {
            return 'null';
        }

        var pairs, k, name, val,
			type = $.type(o);

        if (type === 'undefined') {
            return undefined;
        }

        // Also covers instantiated Number and Boolean objects,
        // which are typeof 'object' but thanks to $.type, we
        // catch them here. I don't know whether it is right
        // or wrong that instantiated primitives are not
        // exported to JSON as an {"object":..}.
        // We choose this path because that's what the browsers did.
        if (type === 'number' || type === 'boolean') {
            return String(o);
        }
        if (type === 'string') {
            return $.quoteString(o);
        }
        if (typeof o.toJSON === 'function') {
            return $.toJSON(o.toJSON());
        }
        if (type === 'date') {
            var month = o.getUTCMonth() + 1,
				day = o.getUTCDate(),
				year = o.getUTCFullYear(),
				hours = o.getUTCHours(),
				minutes = o.getUTCMinutes(),
				seconds = o.getUTCSeconds(),
				milli = o.getUTCMilliseconds();

            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            if (milli < 100) {
                milli = '0' + milli;
            }
            if (milli < 10) {
                milli = '0' + milli;
            }
            return '"' + year + '-' + month + '-' + day + 'T' +
				hours + ':' + minutes + ':' + seconds +
				'.' + milli + 'Z"';
        }

        pairs = [];

        if ($.isArray(o)) {
            for (k = 0; k < o.length; k++) {
                pairs.push($.toJSON(o[k]) || 'null');
            }
            return '[' + pairs.join(',') + ']';
        }

        // Any other object (plain object, RegExp, ..)
        // Need to do typeof instead of $.type, because we also
        // want to catch non-plain objects.
        if (typeof o === 'object') {
            for (k in o) {
                // Only include own properties,
                // Filter out inherited prototypes
                if (hasOwn.call(o, k)) {
                    // Keys must be numerical or string. Skip others
                    type = typeof k;
                    if (type === 'number') {
                        name = '"' + k + '"';
                    } else if (type === 'string') {
                        name = $.quoteString(k);
                    } else {
                        continue;
                    }
                    type = typeof o[k];

                    // Invalid values like these return undefined
                    // from toJSON, however those object members
                    // shouldn't be included in the JSON string at all.
                    if (type !== 'function' && type !== 'undefined') {
                        val = $.toJSON(o[k]);
                        pairs.push(name + ':' + val);
                    }
                }
            }
            return '{' + pairs.join(',') + '}';
        }
    };

    /**
	 * jQuery.evalJSON
	 * Evaluates a given json string.
	 *
	 * @param str {String}
	 */
    $.evalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        /*jshint evil: true */
        return eval('(' + str + ')');
    };

    /**
	 * jQuery.secureEvalJSON
	 * Evals JSON in a way that is *more* secure.
	 *
	 * @param str {String}
	 */
    $.secureEvalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        var filtered =
			str
			.replace(/\\["\\\/bfnrtu]/g, '@')
			.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
			.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

        if (/^[\],:{}\s]*$/.test(filtered)) {
            /*jshint evil: true */
            return eval('(' + str + ')');
        }
        throw new SyntaxError('Error parsing JSON, source is not valid.');
    };

    /**
	 * jQuery.quoteString
	 * Returns a string-repr of a string, escaping quotes intelligently.
	 * Mostly a support function for toJSON.
	 * Examples:
	 * >>> jQuery.quoteString('apple')
	 * "apple"
	 *
	 * >>> jQuery.quoteString('"Where are we going?", she asked.')
	 * "\"Where are we going?\", she asked."
	 */
    $.quoteString = function (str) {
        if (str.match(escape)) {
            return '"' + str.replace(escape, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + str + '"';
    };

}(jQuery));
/**
*
*  Base64 encode / decode
*
*  @author haitao.tu
*  @date   2010-04-26
*  @email  tuhaitao@foxmail.com
*
*/

function Base64() {

    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
			_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
			_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }

    // public method for decoding
    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }

    // private method for UTF-8 encoding
    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }

    // private method for UTF-8 decoding
    _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}