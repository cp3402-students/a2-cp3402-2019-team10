(function(){var N=this;N.N2_=N.N2_||{r:[],d:[]},N.N2R=N.N2R||function(){N.N2_.r.push(arguments)},N.N2D=N.N2D||function(){N.N2_.d.push(arguments)}}).call(window);
N2R('$', function ($) {

    $.extend(window.nextend, {
        fontManager: null,
        styleManager: null,
        animationManager: null,
        browse: null,
        askToSave: true,
        cancel: function (url) {
            nextend.askToSave = false;
            window.location.href = url;
            return false;
        }
    });

    window.n2_ = function (text) {
        if (typeof nextend.localization[text] !== 'undefined') {
            return nextend.localization[text];
        }
        return text;
    };

    window.n2_printf = function (text) {
        var args = arguments;
        var index = 1;
        return text.replace(/%s/g, function () {
            return args[index++];
        });
    };

    /**
     * Helps us to track when the user loaded the page
     */
    window.nextendtime = $.now();

    window.nextend.roundTo = 5;
    window.nextend.roundHelper = function (value) {
        if (window.nextend.roundTo <= 1) {
            return value;
        }

        return Math.round(value / window.nextend.roundTo) * window.nextend.roundTo;
    };

    $.fn.n2opener = function () {
        return this.each(function () {
            var opener = $(this).on("click", function (e) {
                opener.toggleClass("n2-active");
            });

            opener.siblings('span').on("click", function (e) {
                opener.toggleClass("n2-active");
            });

            opener.parent().on("mouseleave", function () {
                opener.removeClass("n2-active");
            });
            opener.find(".n2-button-menu").on("click", function (e) {
                e.stopPropagation();
                opener.removeClass("n2-active");
            });
        });
    };

    if (typeof jQuery !== 'undefined') {
        jQuery(document).on('wp-collapse-menu', function () {
            $(window).trigger('resize');
        });
    }


    nextend.deepDiff = function () {
        return {
            map: function (obj1, obj2) {
                if (this.isValue(obj1)) {
                    if ('undefined' != typeof(obj1) && obj1 != obj2) {
                        return obj1;
                    } else {
                        return undefined;
                    }
                }

                for (var key in obj2) {
                    if (this.isFunction(obj2[key])) {
                        continue;
                    }

                    obj1[key] = this.map(obj1[key], obj2[key]);
                    if (obj1[key] === undefined || ($.isPlainObject(obj1[key]) && $.isEmptyObject(obj1[key])) || (this.isArray(obj1[key]) && obj1[key].length == 0)) {
                        delete obj1[key];
                    }
                }


                return obj1;

            },

            isFunction: function (obj) {
                return {}.toString.apply(obj) === '[object Function]';
            },
            isArray: function (obj) {
                return {}.toString.apply(obj) === '[object Array]';
            },
            isObject: function (obj) {
                return {}.toString.apply(obj) === '[object Object]';
            },
            isValue: function (obj) {
                return !this.isObject(obj) && !this.isArray(obj);
            }
        }
    }();


    nextend.UnicodeToHTMLEntity = function (s) {
        try {
            var patt = /(?:[\uD800-\uDBFF][\uDC00-\uDFFF])/g,
                match;

            function surrogatePairToCodePoint(charCode1, charCode2) {
                return ((charCode1 & 0x3FF) << 10) + (charCode2 & 0x3FF) + 0x10000;
            }

            function stringToCodePointArray(str) {
                var codePoints = [],
                    i = 0,
                    charCode;
                while (i < str.length) {
                    charCode = str.charCodeAt(i);
                    if ((charCode & 0xF800) == 0xD800) {
                        codePoints.push(surrogatePairToCodePoint(charCode, str.charCodeAt(++i)));
                    } else {
                        codePoints.push(charCode);
                    }
                    ++i;
                }
                return '&#' + codePoints + ';';
            }

            while ((match = patt.exec(s))) {
                s = s.substr(0, match.index) + stringToCodePointArray(s.substr(match.index, patt.lastIndex - match.index)) + s.substr(patt.lastIndex);
            }
        } catch (e) {
            console.error(e);
            return s;
        }

        return s;
    };
});
N2D('NextendHeadingPane', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param $node
     * @param headings
     * @param contents
     * @param identifier
     * @constructor
     */
    function NextendHeadingPane($node, headings, contents, identifier) {
        this.$node = $node.data('pane', this);
        this.headings = headings;
        this.contents = contents;
        this.tabNames = [];
        this.headings.each($.proxy(function (i, el) {
            this.tabNames.push($(el).data('tab'));
        }, this));
        this.identifier = identifier;

        this._active = headings.index(headings.filter('.n2-active'));

        for (var i = 0; i < headings.length; i++) {
            headings.eq(i).on('click', $.proxy(this.switchToPane, this, i));
        }

        if (identifier) {
            var saved = $.jStorage.get(this.identifier + "-pane", -1);
            if (saved != -1) {
                this.switchToPane(saved);
                return;
            }
        }
        this.hideAndShow();
    }


    NextendHeadingPane.prototype.switchToPane = function (i, e) {
        if (e) {
            e.preventDefault();
        }
        this.headings.eq(this._active).removeClass('n2-active');
        this.headings.eq(i).addClass('n2-active');
        this._active = i;
        this.hideAndShow();
        this.store(this._active);

        this.$node.triggerHandler('changetab');
    };

    NextendHeadingPane.prototype.hideAndShow = function () {
        $(this.contents[this._active]).css('display', 'block').trigger('activate');
        for (var i = 0; i < this.contents.length; i++) {
            if (i != this._active) {
                $(this.contents[i]).css('display', 'none');
            }
        }
    };

    NextendHeadingPane.prototype.store = function (i) {
        if (this.identifier) {
            $.jStorage.set(this.identifier + "-pane", i);
        }
    };

    NextendHeadingPane.prototype.showTabs = function (tabNames) {
        var activatedFirst = false;
        for (var i = 0; i < this.tabNames.length; i++) {
            if ($.inArray(this.tabNames[i], tabNames) != '-1') {
                this.headings.eq(i).css('display', '');
                $(this.contents[i]).css('display', '');
                if (i == this._active) {
                    activatedFirst = i;
                } else if (activatedFirst === false) {
                    activatedFirst = i;
                }
            } else {
                this.headings.eq(i).css('display', 'none');
                $(this.contents[i]).css('display', 'none');
            }
        }
        this.switchToPane(activatedFirst);
    };

    return NextendHeadingPane;
});
N2D('NextendHeadingScrollToPane', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param headings
     * @param contents
     * @param identifier
     * @constructor
     */
    function NextendHeadingScrollToPane(headings, contents, identifier) {
        this.headings = headings;
        this.contents = contents;
        this.identifier = identifier;

        for (var i = 0; i < headings.length; i++) {
            headings.eq(i).on('click', $.proxy(this.scrollToPane, this, i));
        }
    }

    NextendHeadingScrollToPane.prototype.scrollToPane = function (i, e) {
        if (e) {
            e.preventDefault();
        }
        $('html, body').animate({
            scrollTop: this.contents[i].offset().top - $('.n2-main-top-bar').height() - $('#wpadminbar, .navbar-fixed-top').height() - 10
        }, 1000);
    };

    return NextendHeadingScrollToPane;
});
N2D('WindowManager', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function WindowManager() {
        this.window = ['main'];
        this.mouseDownArea = false;
        this.timeout = null;

        this.isPreventDblClick = false;
        this.dblClickTimeout = null;
    }

    WindowManager.prototype.addWindow = function (name) {
        this.window.push(name);
    };

    WindowManager.prototype.removeWindow = function () {
        this.window.pop();
    };

    WindowManager.prototype.getCurrentWindow = function () {
        return this.window[this.window.length - 1];
    };

    WindowManager.prototype.setMouseDownArea = function (area, e) {
        this.mouseDownArea = area;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout($.proxy(function () {
            this.timeout = null;
            this.mouseDownArea = false;
        }, this), 50);
    };

    WindowManager.prototype.preventDblClick = function () {
        this.isPreventDblClick = true;
        if (this.dblClickTimeout) {
            clearTimeout(this.dblClickTimeout);
        }
        this.dblClickTimeout = setTimeout($.proxy(function () {
            this.dblClickTimeout = null;
            this.isPreventDblClick = false;
        }, this), 200);
    };

    var windowManagerInstance = new WindowManager();
    /**
     * @returns {N2Classes.WindowManager}
     */
    WindowManager.get = function () {
        return windowManagerInstance;
    };

    WindowManager.setMouseDownArea = function () {
        windowManagerInstance.setMouseDownArea.apply(windowManagerInstance, arguments);
    };

    return WindowManager;
});
N2D('AjaxHelper', function ($, undefined) {

    var loader = null;

    /**
     * @memberOf N2Classes
     * @constructor
     */
    function AjaxHelper() {
    }

    AjaxHelper.query = {};

    AjaxHelper.addAjaxLoader = function () {
        loader = $('<div class="n2-loader-overlay"><div class="n2-loader"></div></div>')
            .appendTo('body');
    };

    AjaxHelper.addAjaxArray = function (parts) {
        for (var k in parts) {
            AjaxHelper.query[k] = parts[k];
        }
    };

    AjaxHelper.makeAjaxQuery = function (queryArray, isAjax) {
        if (isAjax) {
            queryArray['mode'] = 'ajax';
            queryArray['nextendajax'] = '1';
        }
        for (var k in AjaxHelper.query) {
            queryArray[k] = AjaxHelper.query[k];
        }
        return N2Classes.N2QueryString.stringify(queryArray);
    };

    AjaxHelper.makeAjaxUrl = function (url, queries) {
        var urlParts = url.split("?");
        if (urlParts.length < 2) {
            urlParts[1] = '';
        }
        var parsed = N2Classes.N2QueryString.parse(urlParts[1]);
        if (typeof queries != 'undefined') {
            for (var k in queries) {
                parsed[k] = queries[k];
            }
        }
        return urlParts[0] + '?' + AjaxHelper.makeAjaxQuery(parsed, true);
    };

    AjaxHelper.makeFallbackUrl = function (url, queries) {
        var urlParts = url.split("?");
        if (urlParts.length < 2) {
            urlParts[1] = '';
        }
        var parsed = N2Classes.N2QueryString.parse(urlParts[1]);
        if (typeof queries != 'undefined') {
            for (var k in queries) {
                parsed[k] = queries[k];
            }
        }
        return urlParts[0] + '?' + AjaxHelper.makeAjaxQuery(parsed, false);
    };

    AjaxHelper.ajax = function (ajax) {
        AjaxHelper.startLoading();
        return $.ajax(ajax).always(function (response, status) {
            AjaxHelper.stopLoading();
            try {

                if (status != 'success') {
                    response = JSON.parse(response.responseText);
                } else if (typeof response === 'string') {
                    response = JSON.parse(response);
                }
                if (response.redirect !== undefined) {
                    AjaxHelper.startLoading();
                    window.location.href = response.redirect;
                    return;
                }

                AjaxHelper.notification(response);
            } catch (e) {
                var pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im,
                    matches = pattern.exec(response.responseText);
                if (matches.length) {
                    N2Classes.NextendModal.SafeHTML(response.status, matches[1]);
                } else {
                    console.error(response.responseText, response);
                }
            }
        });
    };

    AjaxHelper.notification = function (response) {

        if (typeof response.notification !== 'undefined' && response.notification) {
            for (var k in response.notification) {
                for (var i = 0; i < response.notification[k].length; i++) {
                    N2Classes.Notification[k](response.notification[k][i][0], response.notification[k][i][1]);
                }
            }
        }
    };

    AjaxHelper.getJSON = function (ajax) {
        AjaxHelper.startLoading();
        return $.getJSON(ajax).always(function () {
            AjaxHelper.stopLoading();
        });
    };

    AjaxHelper.startLoading = function () {
        loader.addClass('n2-active');
    };

    AjaxHelper.stopLoading = function () {
        loader.removeClass('n2-active');
    };

    N2R('documentReady', function () {
        AjaxHelper.addAjaxLoader();
    });

    return AjaxHelper;
});
N2D('Esc', function ($, undefined) {

    /**
     * @alias N2Classes.Esc
     * @constructor
     */
    function Esc() {
        this.FiLo = [];
        this.doc = $(document);
        this.isListening = false;
    }

    Esc.prototype.add = function (callback) {
        this.FiLo.push(callback);

        if (!this.isListening) {
            this.doc.on('keydown.n2-esc', $.proxy(function (e) {
                if ((e.keyCode == 27 || e.keyCode == 8)) {
                    if (!$(e.target).is("input, textarea")) {
                        e.preventDefault();
                        var ret = this.FiLo[this.FiLo.length - 1]();
                        if (ret) {
                            this.pop();
                        }
                    } else if (e.keyCode == 27) {
                        e.preventDefault();
                        $(e.target).blur();
                    }
                }
            }, this));
            this.isListening = true;
        }
    };

    Esc.prototype.pop = function () {
        this.FiLo.pop();
        if (this.FiLo.length === 0) {
            this.doc.off('keydown.n2-esc');
            this.isListening = false;
        }
    };

    return new Esc();
});
N2D('tooltip', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function Tooltip() {
        this.$element = $('<div class="n2 n2-tooltip n2-radius-m"></div>');
        this.timeout = null;
        this.$tipFor = null;


        $(window).ready($.proxy(this.ready, this));

    }

    Tooltip.prototype.ready = function () {
        this.$element.appendTo('body');
        this.add($('body'));
    };


    Tooltip.prototype.add = function ($parent) {
        $parent.find('[data-n2tip]').off('.n2hastip').on({
            'mouseenter.n2hastip': $.proxy(this.onEnter, this)
        });
    };


    Tooltip.prototype.addElement = function ($el, title, h, v) {
        $el.data({
            n2tip: title,
            n2tipv: v,
            n2tiph: h
        }).off('.n2hastip').on({
            'mouseenter.n2hastip': $.proxy(this.onEnter, this)
        });
    };


    Tooltip.prototype.onEnter = function (e) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.$tipFor = $(e.currentTarget).on({
            'mousemove.n2tip': $.proxy(this.onMove, this),
            'mouseleave.n2tip': $.proxy(this.onLeave, this)
        });
        this.onMove(e);
        this.timeout = setTimeout($.proxy(function () {
            var v = this.$tipFor.data('n2tipv'),
                h = this.$tipFor.data('n2tiph');
            if (typeof v === 'undefined') {
                v = 10;
            }
            if (typeof h === 'undefined') {
                h = 10;
            }
            this.$element.css({
                margin: v + 'px ' + h + 'px'
            }).html(this.$tipFor.data('n2tip')).addClass('n2-active');
        }, this), 500);
    };


    Tooltip.prototype.onMove = function (e) {
        this.$element.css({
            left: e.pageX,
            top: e.pageY
        });
    };


    Tooltip.prototype.onLeave = function (e) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.$tipFor) {
            this.$tipFor.off('.n2tip');
            this.$tipFor = null;
            this.$element.removeClass('n2-active').css('margin', '');
        }
    };


    function TooltipMouse() {
        this.isVisible = false;
        this.$body = $('body');
        this.$element = $('<div class="n2 n2-tooltip n2-radius-m"></div>').appendTo(this.$body);
    }

    TooltipMouse.prototype.show = function (text, e) {
        if (this.isVisible) {
            this.$element.html(text);
        } else {
            this.isVisible = true;
            this.$body.on('mousemove.tooltipMouse', $.proxy(this.mouseMove, this));
            this.mouseMove(e);
            this.$element.html(text).addClass('n2-active');
        }
    };


    TooltipMouse.prototype.mouseMove = function (e) {
        this.$element.css({
            left: e.pageX + 10,
            top: e.pageY + 10
        });
    };


    TooltipMouse.prototype.hide = function () {
        this.$body.off('mousemove.tooltipMouse');
        this.$element.removeClass('n2-active').html('');
        this.isVisible = false;
    };


    nextend.tooltip = new Tooltip();

    $(window).ready(function () {
        nextend.tooltipMouse = new TooltipMouse();
    });

    return nextend.tooltip;
});
/**
 * Convert 8 char hexadecimal color into RGBA color
 * @param 8 characters of hexadecimal color value. Last two character stands for alpha 0-255
 * @returns RGBA representation string
 */

window.N2Color = {
    hex2rgba: function (str) {
        var num = parseInt(str, 16); // Convert to a number
        return [num >> 24 & 255, num >> 16 & 255, num >> 8 & 255, (num & 255) / 255];
    },
    hex2rgbaCSS: function (str) {
        return 'RGBA(' + N2Color.hex2rgba(str).join(',') + ')';
    },
    hexdec: function (hex_string) {
        hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
        return parseInt(hex_string, 16);
    },

    hex2alpha: function (str) {
        var num = parseInt(str, 16); // Convert to a number
        return ((num & 255) / 255).toFixed(3);
    },
    colorizeSVG: function (str, color) {
        var parts = str.split('base64,');
        if (parts.length == 1) {
            return str;
        }
        parts[1] = N2Classes.Base64.encode(N2Classes.Base64.decode(parts[1]).replace('fill="#FFF"', 'fill="#' + color.substr(0, 6) + '"').replace('opacity="1"', 'opacity="' + N2Color.hex2alpha(color) + '"'));
        return parts.join('base64,');
    },
    colorToSVG: function (str) {
        var num = parseInt(str, 16); // Convert to a number

        return [str.substr(0, 6), (num & 255) / 255];
    }
};
/*!
 query-string
 Parse and stringify URL query strings
 https://github.com/sindresorhus/query-string
 by Sindre Sorhus
 MIT License
 */
N2D('N2QueryString', function ($, undefined) {
    'use strict';

    /**
     * @memberOf N2Classes
     *
     * @type {{parse: parse, stringify: function(*=): string}}
     */
    var N2QueryString = {
        parse: function (str) {
            if (typeof str !== 'string') {
                return {};
            }

            str = str.trim().replace(/^(\?|#)/, '');

            if (!str) {
                return {};
            }

            return str.trim().split('&').reduce(function (ret, param) {
                var parts = param.replace(/\+/g, ' ').split('=');
                var key = parts[0];
                var val = parts[1];

                key = decodeURIComponent(key);
                // missing `=` should be `null`:
                // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
                val = val === undefined ? null : decodeURIComponent(val);

                if (!ret.hasOwnProperty(key)) {
                    ret[key] = val;
                } else if (Array.isArray(ret[key])) {
                    ret[key].push(val);
                } else {
                    ret[key] = [ret[key], val];
                }

                return ret;
            }, {});
        },
        stringify: function (obj) {
            return obj ? Object.keys(obj).map(function (key) {
                var val = obj[key];

                if (Array.isArray(val)) {
                    return val.map(function (val2) {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                    }).join('&');
                }

                return encodeURIComponent(key) + '=' + encodeURIComponent(val);
            }).join('&') : '';

        }
    };

    return N2QueryString;
});

!function (g) {
    var $0 = [], // result
        $1 = [], // tail
        $2 = [], // blocks
        $3 = [], // s1
        $4 = ("0123456789abcdef").split(""), // hex
        $5 = [], // s2
        $6 = [], // state
        $7 = false, // is state created
        $8 = 0, // len_cache
        $9 = 0, // len
        BUF = [];

    // use Int32Array if defined
    if (g.Int32Array) {
        $1 = new Int32Array(16);
        $2 = new Int32Array(16);
        $3 = new Int32Array(4);
        $5 = new Int32Array(4);
        $6 = new Int32Array(4);
        BUF = new Int32Array(4);
    } else {
        var i;
        for (i = 0; i < 16; i++) $1[i] = $2[i] = 0;
        for (i = 0; i < 4; i++) $3[i] = $5[i] = $6[i] = BUF[i] = 0;
    }

    // fill s1
    $3[0] = 128;
    $3[1] = 32768;
    $3[2] = 8388608;
    $3[3] = -2147483648;

    // fill s2
    $5[0] = 0;
    $5[1] = 8;
    $5[2] = 16;
    $5[3] = 24;

    function encode(s) {
        var utf = enc = "",
            start = end = 0;

        for (var i = 0, j = s.length; i < j; i++) {
            var c = s.charCodeAt(i);

            if (c < 128) {
                end++;
                continue;
            } else if (c > 127 && c < 2048)
                enc = String.fromCharCode((c >> 6) | 192, (c & 63) | 128);
            else
                enc = String.fromCharCode((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);

            if (end > start)
                utf += s.slice(start, end);

            utf += enc;
            start = end = i + 1;
        }

        if (end > start)
            utf += s.slice(start, j);

        return utf;
    }

    function md5_update(s) {
        var i, I;

        s += "";
        $7 = false;
        $8 = $9 = s.length;

        if ($9 > 63) {
            getBlocks(s.substring(0, 64));
            md5cycle($2);
            $7 = true;

            for (i = 128; i <= $9; i += 64) {
                getBlocks(s.substring(i - 64, i));
                md5cycleAdd($2);
            }

            s = s.substring(i - 64);
            $9 = s.length;
        }

        $1[0] = 0;
        $1[1] = 0;
        $1[2] = 0;
        $1[3] = 0;
        $1[4] = 0;
        $1[5] = 0;
        $1[6] = 0;
        $1[7] = 0;
        $1[8] = 0;
        $1[9] = 0;
        $1[10] = 0;
        $1[11] = 0;
        $1[12] = 0;
        $1[13] = 0;
        $1[14] = 0;
        $1[15] = 0;

        for (i = 0; i < $9; i++) {
            I = i % 4;
            if (I === 0)
                $1[i >> 2] = s.charCodeAt(i);
            else
                $1[i >> 2] |= s.charCodeAt(i) << $5[I];
        }
        $1[i >> 2] |= $3[i % 4];

        if (i > 55) {
            if ($7) md5cycleAdd($1);
            else {
                md5cycle($1);
                $7 = true;
            }

            return md5cycleAdd([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, $8 << 3, 0]);
        }

        $1[14] = $8 << 3;

        if ($7) md5cycleAdd($1);
        else md5cycle($1);
    }

    function getBlocks(s) {
        for (var i = 16; i--;) {
            var I = i << 2;
            $2[i] = s.charCodeAt(I) + (s.charCodeAt(I + 1) << 8) + (s.charCodeAt(I + 2) << 16) + (s.charCodeAt(I + 3) << 24);
        }
    }

    function md5(data, ascii, arrayOutput) {
        md5_update(ascii ? data : encode(data));

        var tmp = $6[0];
        $0[1] = $4[tmp & 15];
        $0[0] = $4[(tmp >>= 4) & 15];
        $0[3] = $4[(tmp >>= 4) & 15];
        $0[2] = $4[(tmp >>= 4) & 15];
        $0[5] = $4[(tmp >>= 4) & 15];
        $0[4] = $4[(tmp >>= 4) & 15];
        $0[7] = $4[(tmp >>= 4) & 15];
        $0[6] = $4[(tmp >>= 4) & 15];

        tmp = $6[1];
        $0[9] = $4[tmp & 15];
        $0[8] = $4[(tmp >>= 4) & 15];
        $0[11] = $4[(tmp >>= 4) & 15];
        $0[10] = $4[(tmp >>= 4) & 15];
        $0[13] = $4[(tmp >>= 4) & 15];
        $0[12] = $4[(tmp >>= 4) & 15];
        $0[15] = $4[(tmp >>= 4) & 15];
        $0[14] = $4[(tmp >>= 4) & 15];

        tmp = $6[2];
        $0[17] = $4[tmp & 15];
        $0[16] = $4[(tmp >>= 4) & 15];
        $0[19] = $4[(tmp >>= 4) & 15];
        $0[18] = $4[(tmp >>= 4) & 15];
        $0[21] = $4[(tmp >>= 4) & 15];
        $0[20] = $4[(tmp >>= 4) & 15];
        $0[23] = $4[(tmp >>= 4) & 15];
        $0[22] = $4[(tmp >>= 4) & 15];

        tmp = $6[3];
        $0[25] = $4[tmp & 15];
        $0[24] = $4[(tmp >>= 4) & 15];
        $0[27] = $4[(tmp >>= 4) & 15];
        $0[26] = $4[(tmp >>= 4) & 15];
        $0[29] = $4[(tmp >>= 4) & 15];
        $0[28] = $4[(tmp >>= 4) & 15];
        $0[31] = $4[(tmp >>= 4) & 15];
        $0[30] = $4[(tmp >>= 4) & 15];

        return arrayOutput ? $0 : $0.join("");
    }

    function R(q, a, b, x, s1, s2, t) {
        a += q + x + t;
        return ((a << s1 | a >>> s2) + b) << 0;
    }

    function md5cycle(k) {
        md5_rounds(0, 0, 0, 0, k);

        $6[0] = (BUF[0] + 1732584193) << 0;
        $6[1] = (BUF[1] - 271733879) << 0;
        $6[2] = (BUF[2] - 1732584194) << 0;
        $6[3] = (BUF[3] + 271733878) << 0;
    }

    function md5cycleAdd(k) {
        md5_rounds($6[0], $6[1], $6[2], $6[3], k);

        $6[0] = (BUF[0] + $6[0]) << 0;
        $6[1] = (BUF[1] + $6[1]) << 0;
        $6[2] = (BUF[2] + $6[2]) << 0;
        $6[3] = (BUF[3] + $6[3]) << 0;
    }

    function md5_rounds(a, b, c, d, k) {
        var bc, da;

        if ($7) {
            a = R(((c ^ d) & b) ^ d, a, b, k[0], 7, 25, -680876936);
            d = R(((b ^ c) & a) ^ c, d, a, k[1], 12, 20, -389564586);
            c = R(((a ^ b) & d) ^ b, c, d, k[2], 17, 15, 606105819);
            b = R(((d ^ a) & c) ^ a, b, c, k[3], 22, 10, -1044525330);
        } else {
            a = k[0] - 680876937;
            a = ((a << 7 | a >>> 25) - 271733879) << 0;
            d = k[1] - 117830708 + ((2004318071 & a) ^ -1732584194);
            d = ((d << 12 | d >>> 20) + a) << 0;
            c = k[2] - 1126478375 + (((a ^ -271733879) & d) ^ -271733879);
            c = ((c << 17 | c >>> 15) + d) << 0;
            b = k[3] - 1316259209 + (((d ^ a) & c) ^ a);
            b = ((b << 22 | b >>> 10) + c) << 0;
        }

        a = R(((c ^ d) & b) ^ d, a, b, k[4], 7, 25, -176418897);
        d = R(((b ^ c) & a) ^ c, d, a, k[5], 12, 20, 1200080426);
        c = R(((a ^ b) & d) ^ b, c, d, k[6], 17, 15, -1473231341);
        b = R(((d ^ a) & c) ^ a, b, c, k[7], 22, 10, -45705983);
        a = R(((c ^ d) & b) ^ d, a, b, k[8], 7, 25, 1770035416);
        d = R(((b ^ c) & a) ^ c, d, a, k[9], 12, 20, -1958414417);
        c = R(((a ^ b) & d) ^ b, c, d, k[10], 17, 15, -42063);
        b = R(((d ^ a) & c) ^ a, b, c, k[11], 22, 10, -1990404162);
        a = R(((c ^ d) & b) ^ d, a, b, k[12], 7, 25, 1804603682);
        d = R(((b ^ c) & a) ^ c, d, a, k[13], 12, 20, -40341101);
        c = R(((a ^ b) & d) ^ b, c, d, k[14], 17, 15, -1502002290);
        b = R(((d ^ a) & c) ^ a, b, c, k[15], 22, 10, 1236535329);

        a = R(((b ^ c) & d) ^ c, a, b, k[1], 5, 27, -165796510);
        d = R(((a ^ b) & c) ^ b, d, a, k[6], 9, 23, -1069501632);
        c = R(((d ^ a) & b) ^ a, c, d, k[11], 14, 18, 643717713);
        b = R(((c ^ d) & a) ^ d, b, c, k[0], 20, 12, -373897302);
        a = R(((b ^ c) & d) ^ c, a, b, k[5], 5, 27, -701558691);
        d = R(((a ^ b) & c) ^ b, d, a, k[10], 9, 23, 38016083);
        c = R(((d ^ a) & b) ^ a, c, d, k[15], 14, 18, -660478335);
        b = R(((c ^ d) & a) ^ d, b, c, k[4], 20, 12, -405537848);
        a = R(((b ^ c) & d) ^ c, a, b, k[9], 5, 27, 568446438);
        d = R(((a ^ b) & c) ^ b, d, a, k[14], 9, 23, -1019803690);
        c = R(((d ^ a) & b) ^ a, c, d, k[3], 14, 18, -187363961);
        b = R(((c ^ d) & a) ^ d, b, c, k[8], 20, 12, 1163531501);
        a = R(((b ^ c) & d) ^ c, a, b, k[13], 5, 27, -1444681467);
        d = R(((a ^ b) & c) ^ b, d, a, k[2], 9, 23, -51403784);
        c = R(((d ^ a) & b) ^ a, c, d, k[7], 14, 18, 1735328473);
        b = R(((c ^ d) & a) ^ d, b, c, k[12], 20, 12, -1926607734);

        bc = b ^ c;
        a = R(bc ^ d, a, b, k[5], 4, 28, -378558);
        d = R(bc ^ a, d, a, k[8], 11, 21, -2022574463);
        da = d ^ a;
        c = R(da ^ b, c, d, k[11], 16, 16, 1839030562);
        b = R(da ^ c, b, c, k[14], 23, 9, -35309556);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[1], 4, 28, -1530992060);
        d = R(bc ^ a, d, a, k[4], 11, 21, 1272893353);
        da = d ^ a;
        c = R(da ^ b, c, d, k[7], 16, 16, -155497632);
        b = R(da ^ c, b, c, k[10], 23, 9, -1094730640);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[13], 4, 28, 681279174);
        d = R(bc ^ a, d, a, k[0], 11, 21, -358537222);
        da = d ^ a;
        c = R(da ^ b, c, d, k[3], 16, 16, -722521979);
        b = R(da ^ c, b, c, k[6], 23, 9, 76029189);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[9], 4, 28, -640364487);
        d = R(bc ^ a, d, a, k[12], 11, 21, -421815835);
        da = d ^ a;
        c = R(da ^ b, c, d, k[15], 16, 16, 530742520);
        b = R(da ^ c, b, c, k[2], 23, 9, -995338651);

        a = R(c ^ (b | ~d), a, b, k[0], 6, 26, -198630844);
        d = R(b ^ (a | ~c), d, a, k[7], 10, 22, 1126891415);
        c = R(a ^ (d | ~b), c, d, k[14], 15, 17, -1416354905);
        b = R(d ^ (c | ~a), b, c, k[5], 21, 11, -57434055);
        a = R(c ^ (b | ~d), a, b, k[12], 6, 26, 1700485571);
        d = R(b ^ (a | ~c), d, a, k[3], 10, 22, -1894986606);
        c = R(a ^ (d | ~b), c, d, k[10], 15, 17, -1051523);
        b = R(d ^ (c | ~a), b, c, k[1], 21, 11, -2054922799);
        a = R(c ^ (b | ~d), a, b, k[8], 6, 26, 1873313359);
        d = R(b ^ (a | ~c), d, a, k[15], 10, 22, -30611744);
        c = R(a ^ (d | ~b), c, d, k[6], 15, 17, -1560198380);
        b = R(d ^ (c | ~a), b, c, k[13], 21, 11, 1309151649);
        a = R(c ^ (b | ~d), a, b, k[4], 6, 26, -145523070);
        d = R(b ^ (a | ~c), d, a, k[11], 10, 22, -1120210379);
        c = R(a ^ (d | ~b), c, d, k[2], 15, 17, 718787259);
        b = R(d ^ (c | ~a), b, c, k[9], 21, 11, -343485551);

        BUF[0] = a;
        BUF[1] = b;
        BUF[2] = c;
        BUF[3] = d;
    }

    g.md5 = g.md5 || md5;
}(window);

N2D('NextendCSS', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendCSS() {
        this.style = '';
    }

    NextendCSS.prototype.add = function (css) {
        var body = document.body || document.getElementsByTagName('body')[0],
            style = document.createElement('style');

        body.appendChild(style);

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    };

    NextendCSS.prototype.deleteRule = function (selectorText) {
        var selectorText1 = selectorText.toLowerCase();
        var selectorText2 = selectorText1.replace('.', '\\.');
        for (var j = document.styleSheets.length - 1; j >= 0; j--) {
            var rules = this._getRulesArray(j);
            for (var i = 0; rules && i < rules.length; i++) {
                if (rules[i].selectorText) {
                    var lo = rules[i].selectorText.toLowerCase();
                    if ((lo == selectorText1) || (lo == selectorText2)) {
                        if (document.styleSheets[j].cssRules) {
                            document.styleSheets[j].deleteRule(i);
                        } else {
                            document.styleSheets[j].removeRule(i);
                        }
                    }
                }
            }
        }
        return (null);
    };

    NextendCSS.prototype._getRulesArray = function (i) {
        var crossrule = null;
        try {
            if (document.styleSheets[i].cssRules)
                crossrule = document.styleSheets[i].cssRules;
            else if (document.styleSheets[i].rules)
                crossrule = document.styleSheets[i].rules;
        } catch (e) {
        }
        return (crossrule);
    };

    /**
     * @type {NextendCSS}
     */
    window.nextend.css = new NextendCSS();

    return window.nextend.css;
});

N2D('ImageHelper', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param parameters
     * @param openLightbox
     * @param openMultipleLightbox
     * @param openFoldersLightbox
     * @constructor
     */
    function ImageHelper(parameters, openLightbox, openMultipleLightbox, openFoldersLightbox) {
        ImageHelper.prototype.openLightbox = openLightbox;
        ImageHelper.prototype.openMultipleLightbox = openMultipleLightbox;
        ImageHelper.prototype.openFoldersLightbox = openFoldersLightbox;
        nextend.imageHelper = this;
        this.parameters = $.extend({
            siteKeywords: [],
            imageUrls: [],
            wordpressUrl: '',
            placeholderImage: '',
            placeholderRepeatedImage: '',
            protocolRelative: 1
        }, parameters);
    }

    ImageHelper.prototype.protocolRelative = function (image) {
        if (this.parameters.protocolRelative) {
            return image.replace(/^http(s)?:\/\//, '//');
        }
        return image;
    };


    ImageHelper.prototype.make = function (image) {
        return this.dynamic(image);
    };

    ImageHelper.prototype.dynamic = function (image) {
        var imageUrls = this.parameters.imageUrls,
            keywords = this.parameters.siteKeywords,
            _image = this.protocolRelative(image);
        for (var i = 0; i < keywords.length; i++) {
            if (_image.indexOf(imageUrls[i]) === 0) {
                image = keywords[i] + _image.slice(imageUrls[i].length);
                break;
            }
        }
        return image;
    };

    ImageHelper.prototype.fixed = function (image) {
        var imageUrls = this.parameters.imageUrls,
            keywords = this.parameters.siteKeywords;
        for (var i = 0; i < keywords.length; i++) {
            if (image.indexOf(keywords[i]) === 0) {
                image = imageUrls[i] + image.slice(keywords[i].length);
                break;
            }
        }
        return image;
    };

    ImageHelper.prototype.openLightbox = function (callback) {

    };

    ImageHelper.prototype.openMultipleLightbox = function (callback) {
    };

    ImageHelper.prototype.openFoldersLightbox = function (callback) {
    };

    ImageHelper.prototype.getPlaceholder = function () {
        return this.fixed(this.parameters.placeholderImage);
    };

    ImageHelper.prototype.getRepeatedPlaceholder = function () {
        return this.fixed(this.parameters.placeholderRepeatedImage);
    };

    return ImageHelper;
});
N2D('NextendModal', function ($, undefined) {

    var counter = 0;

    /**
     * @memberOf N2Classes
     *
     * @param panes
     * @param show
     * @param args
     * @constructor
     */
    function NextendModal(panes, show, args) {
        this.inited = false;
        this.currentPane = null;
        this.customClass = '';
        this.$ = $(this);
        this.counter = counter++;

        this.panes = panes;

        if (show) {
            this.show(null, args);
        }

    }

    NextendModal.prototype.setCustomClass = function (customClass) {
        this.customClass = customClass;
    };

    NextendModal.prototype.lateInit = function () {
        if (!this.inited) {

            for (var k in this.panes) {
                this.panes[k] = $.extend({
                    customClass: '',
                    fit: false,
                    fitX: true,
                    overflow: 'hidden',
                    size: false,
                    back: false,
                    close: true,
                    controlsClass: '',
                    controls: [],
                    fn: {}
                }, this.panes[k]);
            }

            var stopClick = false;
            this.modal = $('<div class="n2-modal ' + this.customClass + '"/>').css('opacity', 0)
                .on('click', $.proxy(function (e) {
                    if (stopClick == false) {
                        if (!this.close.hasClass('n2-hidden') && $(e.target).closest('.n2-notification-center-modal').length == 0) {
                            this.hide(e);
                        }
                    }
                    stopClick = false;
                }, this));
            this.window = $('<div class="n2-modal-window n2-border-radius"/>')
                .on('click', function (e) {
                    stopClick = true;
                }).appendTo(this.modal);
            this.notificationStack = new N2Classes.NotificationStackModal(this.modal);

            var titleContainer = $('<div class="n2-modal-title n2-content-box-title-bg"/>')
                .appendTo(this.window);

            this.title = $('<div class="n2-h2 n2-ucf"/>').appendTo(titleContainer);
            this.back = $('<i class="n2-i n2-i-a-back"/>')
                .on('click', $.proxy(this.goBackButton, this))
                .appendTo(titleContainer);
            this.close = $('<i class="n2-i n2-i-a-deletes"/>')
                .on('click', $.proxy(this.hide, this))
                .appendTo(titleContainer);

            this.content = $('<div class="n2-modal-content"/>').appendTo(this.window);
            this.controls = $('<div class="n2-table n2-table-fixed n2-table-auto"/>');

            $('<div class="n2-modal-controls"/>')
                .append(this.controls)
                .appendTo(this.window);

            this.inited = true;
        }
    };

    NextendModal.prototype.show = function (paneId, args) {
        this.lateInit();
        this.notificationStack.enableStack();
        if (typeof paneId === 'undefined' || !paneId) {
            paneId = 'zero';
        }

        N2Classes.WindowManager.get().addWindow("modal");
        N2Classes.Esc.add($.proxy(function () {
            if (!this.close.hasClass('n2-hidden')) {
                this.hide('esc');
                return true;
            }
            return false;
        }, this));

        this.loadPane(paneId, false, true, args);

        NextendTween.fromTo(this.modal, 0.3, {
            opacity: 0
        }, {
            opacity: 1,
            ease: 'easeOutCubic'
        });
    };

    NextendModal.prototype.hide = function (e) {
        $(window).off('.n2-modal-' + this.counter);
        this.notificationStack.popStack();
        N2Classes.WindowManager.get().removeWindow();
        if (arguments.length > 0 && e != 'esc') {
            N2Classes.Esc.pop();
        }
        this.apply('hide');
        this.apply('destroy');
        this.currentPane = null;
        this.modal.detach();

        $(document).off('keyup.n2-esc-modal');
    };

    NextendModal.prototype.destroy = function () {
        this.modal.remove();
    };

    NextendModal.prototype.loadPane = function (id, backward, isShow, args) {
        var end = $.proxy(function () {
            var pane = this.panes[id];
            this.currentPane = pane;

            if (pane.title !== false) {
                this.title.html(pane.title);
            }

            if (pane.back === false) {
                this.back.addClass('n2-hidden');
            } else {
                this.back.removeClass('n2-hidden');
            }

            if (pane.close === false) {
                this.close.addClass('n2-hidden');
            } else {
                this.close.removeClass('n2-hidden');
            }

            this.content.find('> *').detach();
            this.content.append(pane.content);


            var hasControls = false;
            var tr = $('<div class="n2-tr" />');
            var i = 0;
            for (; i < pane.controls.length; i++) {
                $('<div class="n2-td"/>')
                    .addClass('n2-modal-controls-' + i)
                    .html(pane.controls[i])
                    .appendTo(tr);
                hasControls = true;
            }

            tr.addClass('n2-modal-controls-' + i);
            this.controls.html(tr);
            this.controls.attr('class', 'n2-table n2-table-fixed n2-table-auto ' + pane.controlsClass);


            if (typeof isShow == 'undefined' || !isShow) {
                NextendTween.fromTo(this.window, 0.3, {
                    x: backward ? -2000 : 2000
                }, {
                    x: 0,
                    ease: 'easeOutCubic'
                });
            }

            this.modal.appendTo('#n2-admin');

            if (pane.fit) {
                var $w = $(window),
                    margin = 40,
                    resize = $.proxy(function () {
                        var w = $w.width() - 2 * margin,
                            h = $w.height() - 2 * margin;

                        if (!pane.fitX) {
                            w = pane.size[0];
                        }
                        this.window.css({
                            width: w,
                            height: h,
                            marginLeft: w / -2,
                            marginTop: h / -2
                        });

                        this.content.css({
                            height: h - 60 - (hasControls ? this.controls.parent().outerHeight(true) : 0),
                            overflow: pane.overflow
                        });
                    }, this);
                resize();
                $w.on('resize.n2-modal-' + this.counter, resize);
            } else if (pane.size !== false) {
                this.window.css({
                    width: pane.size[0],
                    height: pane.size[1],
                    marginLeft: pane.size[0] / -2,
                    marginTop: pane.size[1] / -2
                });

                this.content.css({
                    height: pane.size[1] - 60 - (hasControls ? this.controls.parent().outerHeight(true) : 0),
                    overflow: pane.overflow
                });

            }

            this.apply('show', args);

        }, this);

        if (this.currentPane !== null) {
            this.apply('destroy');
            NextendTween.to(this.window, 0.3, {
                x: backward ? 2000 : -2000,
                onComplete: end,
                ease: 'easeOutCubic'
            });
        } else {
            end();
        }

    };

    NextendModal.prototype.trigger = function (event, args) {
        this.$.trigger(event, args);
    };

    NextendModal.prototype.on = function (event, fn) {
        this.$.on(event, fn);
    };

    NextendModal.prototype.one = function (event, fn) {
        this.$.one(event, fn);
    };

    NextendModal.prototype.off = function (event, fn) {
        this.$.off(event, fn);
    };

    NextendModal.prototype.goBackButton = function () {
        var args = null;
        if (typeof this.goBackArgs !== null) {
            args = this.goBackArgs;
            this.goBackArgs = null;
        }
        this.goBack(args);
    };

    NextendModal.prototype.goBack = function (args) {
        if (this.apply('goBack', args)) {
            this.loadPane(this.currentPane.back, true, false, args);
        }
    };

    NextendModal.prototype.apply = function (event, args) {
        if (typeof this.currentPane.fn[event] !== 'undefined') {
            return this.currentPane.fn[event].apply(this, args);
        }
        return true;
    };

    NextendModal.prototype.createInput = function (label, id) {
        var style = '';
        if (arguments.length == 3) {
            style = arguments[2];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"></div></div></div></div>');
    };

    NextendModal.prototype.createInputUnit = function (label, id, unit) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"><div class="n2-text-unit n2-h5 n2-uc">' + unit + '</div></div></div></div></div>');
    };

    NextendModal.prototype.createInputSub = function (label, id, sub) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + sub + '</div><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"></div></div></div></div>');
    };

    NextendModal.prototype.createTextarea = function (label, id) {
        var style = '';
        if (arguments.length == 3) {
            style = arguments[2];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-textarea n2-border-radius"><textarea id="' + id + '" class="n2-h5" autocomplete="off" style="resize:none;' + style + '"></textarea></div></div></div></div>');
    };


    NextendModal.prototype.createSelect = function (label, id, values) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        $group = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group "><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-list" style=""><select id="' + id + '" autocomplete="off" style="' + style + '"></select></div></div></div></div>');
        $select = $group.find('select');

        for (var k in values) {
            $('<option value="' + k + '"></option>').text(values[k]).appendTo($select);
        }
        $select.prop('selectedIndex', 0);

        return $group;
    };


    NextendModal.prototype.createHeading = function (title) {
        return $('<h3 class="n2-h3">' + title + '</h3>');
    };
    NextendModal.prototype.createSubHeading = function (title) {
        return $('<h3 class="n2-h4">' + title + '</h3>');
    };

    NextendModal.prototype.createCenteredHeading = function (title) {
        return $('<h3 class="n2-h3 n2-center">' + title + '</h3>');
    };
    NextendModal.prototype.createCenteredSubHeading = function (title) {
        return $('<h3 class="n2-h4 n2-center">' + title + '</h3>');
    };

    NextendModal.prototype.createResult = function () {
        return $('<div class="n2-result"></div>');
    };

    NextendModal.prototype.createTable = function (data, style) {
        var table = $('<table class="n2-table-fancy"/>');
        for (var j = 0; j < data.length; j++) {
            var tr = $('<tr />').appendTo(table);
            for (var i = 0; i < data[j].length; i++) {
                tr.append($('<td style="' + style[i] + '"/>').append(data[j][i]));
            }
        }
        return table;
    };

    NextendModal.prototype.createTableWrap = function () {
        return $('<div class="n2-table-fancy-wrap" style="overflow:auto;height:196px;" />');
    };

    NextendModal.prototype.createImageRadio = function (options) {

        var wrapper = $('<div class="n2-modal-radio" />'),
            input = $('<input type="hidden" value="' + options[0].key + '"/>').appendTo(wrapper);

        for (var i = 0; i < options.length; i++) {
            var url = "'" + nextend.imageHelper.fixed(options[i].image) + "'";
            wrapper.append('<div class="n2-modal-radio-option" data-key="' + options[i].key + '" style="background-image: url(' + url + ')"><div class="n2-h4">' + options[i].name + '</div></div>')
        }

        var options = wrapper.find('.n2-modal-radio-option');
        options.eq(0).addClass('n2-active');

        options.on('click', function (e) {
            options.removeClass('n2-active');
            var option = $(e.currentTarget);
            option.addClass('n2-active');
            input.val(option.data('key'));
        });

        return wrapper;
    };

    NextendModal.settings = function (title, url) {
        new N2Classes.NextendModal({
            zero: {
                size: [
                    1300,
                    700
                ],
                title: title,
                content: '<iframe src="' + url + '" width="1300" height="640" frameborder="0" style="margin:0 -20px -20px -20px;"></iframe>'
            }
        }, true);
    };

    NextendModal.documentation = function (title, url) {
        new N2Classes.NextendModal({
            zero: {
                size: [
                    760,
                    700
                ],
                title: title,
                content: '<iframe src="' + url + '" width="760" height="640" frameborder="0" style="margin:0 -20px -20px -20px;"></iframe>'
            }
        }, true);
    };

    NextendModal.newFullWindow = function (url, id) {
        var params = [
            'height=' + screen.height,
            'width=' + screen.width,
            'fullscreen=yes'
        ].join(',');

        var popup = window.open(url, id, params);
        popup.moveTo(0, 0);
        return popup;
    };

    NextendModal.deleteModal = function (identifier, instanceName, callback) {
        if ($.jStorage.get('n2-delete-' + identifier, false)) {
            callback();
            return true;
        }
        new N2Classes.NextendModal({
            zero: {
                size: [
                    500,
                    190
                ],
                title: n2_('Delete'),
                back: false,
                close: true,
                content: '',
                controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-grey n2-uc n2-h4">' + n2_('Cancel') + '</a>', '<div class="n2-button n2-button-with-actions n2-button-l n2-radius-s n2-button-red"><a href="#" class="n2-button-inner n2-uc n2-h4">' + n2_('Delete') + '</a><div class="n2-button-menu-open"><i class="n2-i n2-i-buttonarrow"></i><div class="n2-button-menu"><div class="n2-button-menu-inner n2-border-radius"><a href="#" class="n2-h4">' + n2_('Delete and never ask for confirmation again') + '</a></div></div></div></div>'],
                fn: {
                    show: function () {
                        this.createCenteredSubHeading(n2_('Are you sure you want to delete?')).appendTo(this.content);
                        this.controls.find('.n2-button-grey')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                this.hide(e);
                            }, this));
                        this.controls.find('.n2-button-red a')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                callback();
                                this.hide(e);
                            }, this));

                        this.controls.find('.n2-button-red .n2-button-menu-inner a')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                $.jStorage.set('n2-delete-' + identifier, true);
                            }, this));

                        this.controls.find(".n2-button-menu-open").n2opener();

                    },
                    destroy: function () {
                        this.destroy();
                    }
                }
            }
        }, true);
        return false;
    };

    NextendModal.deleteModalLink = function (element, identifier, instanceName) {
        N2Classes.NextendModal.deleteModal(identifier, instanceName, function () {
            window.location.href = $(element).attr('href');
        });
        return false;
    };

    NextendModal.SafeHTML = function (title, html) {

        var modal = new N2Classes.NextendModal({
            zero: {
                fit: true,
                size: [
                    1300,
                    700
                ],
                title: title,
                content: ''
            }
        }, true);

        modal.content.removeClass('n2-modal-content').css('padding', '0 20px 20px');
        var $html = $(html.replace(/document\.write/g, 'n2Write')),
            $currentNode;
        window.n2Write = $.proxy(function (buffer) {
            $('<span />').html(buffer).appendTo(modal.content);
        }, this);
        $html.each($.proxy(function (i, el) {
            $currentNode = $(el);
            $currentNode.appendTo(modal.content);
        }, this));
        delete window.n2Write;
    };

    return NextendModal;
});
N2D('NextendSimpleModal', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param html
     * @param options
     * @constructor
     */
    function NextendSimpleModal(html, options) {
        this.$ = $(this);
        this.options = $.extend({
            'class': ''
        }, options);
        this.modal = $('<div class="n2-modal n2-modal-simple"/>').addClass(this.options.class).css({
            display: 'none'
        }).appendTo('#n2-admin');

        $('<i class="n2-i n2-i-a-deletes"/>')
            .on('click', $.proxy(this.hide, this))
            .appendTo(this.modal);

        this.window = $('<div class="n2-modal-window"/>')
            .on('click', function (e) {
                e.stopPropagation();
            })
            .appendTo(this.modal);
        this.notificationStack = new N2Classes.NotificationStackModal(this.modal);
        this.content = $(html).appendTo(this.window);
    }

    NextendSimpleModal.prototype.resize = function () {
        this.window.width(this.modal.width());
        this.window.height(this.modal.height());
    };

    NextendSimpleModal.prototype.show = function () {
        $('body').addClass('n2-modal-active');
        this.modal.css('display', 'block');
        this.resize();
        $(window).on('resize.n2-simple-modal', $.proxy(this.resize, this));
        this.notificationStack.enableStack();

        N2Classes.Esc.add($.proxy(function () {
            this.hide('esc');
            return true;
        }, this));
    };

    NextendSimpleModal.prototype.hide = function (e) {
        this.notificationStack.popStack();
        if (arguments.length > 0 && e != 'esc') {
            N2Classes.Esc.pop();
        }
        this.modal.css('display', 'none');
        $('body').removeClass('n2-modal-active');
        $(document).off('keyup.n2-esc-modal');
        $(window).off('.n2-simple-modal');
        this.modal.trigger('ModalHide');
    };

    return NextendSimpleModal;
});
// Spectrum Colorpicker v1.0.9
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

N2D('Spectrum', function ($, undefined) {
    var tinycolor = null;
    var defaultOpts = {

            // Events
            beforeShow: noop,
            move: noop,
            change: noop,
            show: noop,
            hide: noop,

            // Options
            color: false,
            flat: false,
            showInput: false,
            showButtons: true,
            clickoutFiresChange: false,
            showInitial: false,
            showPalette: false,
            showPaletteOnly: false,
            showSelectionPalette: true,
            localStorageKey: false,
            maxSelectionSize: 7,
            cancelText: "cancel",
            chooseText: "choose",
            preferredFormat: false,
            className: "",
            showAlpha: false,
            theme: "n2-sp-light",
            palette: ['fff', '000'],
            selectionPalette: [],
            disabled: false
        },
        spectrums = [],
        IE = !!/msie/i.exec(window.navigator.userAgent),
        rgbaSupport = (function () {
            function contains(str, substr) {
                return !!~('' + str).indexOf(substr);
            }

            var elem = document.createElement('div');
            var style = elem.style;
            style.cssText = 'background-color:rgba(0,0,0,.5)';
            return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
        })(),
        replaceInput = [
            "<div class='n2-sp-replacer'>",
            "<div class='n2-sp-preview'><div class='n2-sp-preview-inner'></div></div>",
            "<div class='n2-sp-dd'>&#9650;</div>",
            "</div>"
        ].join(''),
        markup = (function () {

            // IE does not support gradients with multiple stops, so we need to simulate
            //  that for the rainbow slider with 8 divs that each have a single gradient
            var gradientFix = "";
            if (IE) {
                for (var i = 1; i <= 6; i++) {
                    gradientFix += "<div class='n2-sp-" + i + "'></div>";
                }
            }

            return [
                "<div class='n2-sp-container'>",
                "<div class='n2-sp-palette-container'>",
                "<div class='n2-sp-palette n2-sp-thumb n2-sp-cf'></div>",
                "</div>",
                "<div class='n2-sp-picker-container'>",
                "<div class='n2-sp-top n2-sp-cf'>",
                "<div class='n2-sp-fill'></div>",
                "<div class='n2-sp-top-inner'>",
                "<div class='n2-sp-color'>",
                "<div class='n2-sp-sat'>",
                "<div class='n2-sp-val'>",
                "<div class='n2-sp-dragger'></div>",
                "</div>",
                "</div>",
                "</div>",
                "<div class='n2-sp-hue'>",
                "<div class='n2-sp-slider'></div>",
                gradientFix,
                "</div>",
                "</div>",
                "<div class='n2-sp-alpha'><div class='n2-sp-alpha-inner'><div class='n2-sp-alpha-handle'></div></div></div>",
                "</div>",
                "<div class='n2-sp-input-container n2-sp-cf'>",
                "<input class='n2-sp-input' type='text' spellcheck='false'  />",
                "</div>",
                "<div class='n2-sp-initial n2-sp-thumb n2-sp-cf'></div>",
                "<div class='n2-sp-button-container n2-sp-cf'>",
                "<a class='n2-sp-cancel' href='#'></a>",
                "<button class='n2-sp-choose'></button>",
                "</div>",
                "</div>",
                "</div>"
            ].join("");
        })();

    function paletteTemplate(p, color, className) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var tiny = tinycolor(p[i]);
            var c = tiny.toHsl().l < 0.5 ? "n2-sp-thumb-el n2-sp-thumb-dark" : "n2-sp-thumb-el n2-sp-thumb-light";
            c += (tinycolor.equals(color, p[i])) ? " n2-sp-thumb-active" : "";

            var swatchStyle = "background-color:" + tiny.toRgbString();
            html.push('<span title="' + tiny.toRgbString() + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="n2-sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
        }
        return "<div class='n2-sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = opts.palette.slice(0),
            paletteArray = $.isArray(palette[0]) ? palette : [palette],
            selectionPalette = opts.selectionPalette.slice(0),
            draggingClass = "n2-sp-dragging";


        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            dragger = container.find(".n2-sp-color"),
            dragHelper = container.find(".n2-sp-dragger"),
            slider = container.find(".n2-sp-hue"),
            slideHelper = container.find(".n2-sp-slider"),
            alphaSliderInner = container.find(".n2-sp-alpha-inner"),
            alphaSlider = container.find(".n2-sp-alpha"),
            alphaSlideHelper = container.find(".n2-sp-alpha-handle"),
            textInput = container.find(".n2-sp-input"),
            paletteContainer = container.find(".n2-sp-palette"),
            initialColorContainer = container.find(".n2-sp-initial"),
            cancelButton = container.find(".n2-sp-cancel"),
            chooseButton = container.find(".n2-sp-choose"),
            isInput = boundElement.is("input"),
            shouldReplace = isInput && !flat,
            replacer = null,
            offsetElement = null,
            previewElement = null,
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            preferredFormat = opts.preferredFormat,
            currentPreferredFormat = preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange;

        container.on('mousedown', function (e) {
            N2Classes.WindowManager.get().setMouseDownArea('colorpicker', e);
        });


        function applyOptions(noReflow) {

            container.toggleClass("n2-sp-flat", flat);
            container.toggleClass("n2-sp-input-disabled", !opts.showInput);
            container.toggleClass("n2-sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("n2-sp-buttons-disabled", !opts.showButtons || flat);
            container.toggleClass("n2-sp-palette-disabled", !opts.showPalette);
            container.toggleClass("n2-sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("n2-sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className);

            if (typeof noReflow === 'undefined') {
                reflow();
            }
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            var customReplace = boundElement.parent().find('.n2-sp-replacer');
            if (customReplace.length) {
                replacer = customReplace;
            } else {
                replacer = (shouldReplace) ? $(replaceInput).addClass(theme) : $([]);

                if (shouldReplace) {
                    //boundElement.hide().after(replacer);
                    boundElement.parent().after(replacer);
                }
            }
            offsetElement = (shouldReplace) ? replacer : boundElement;
            previewElement = replacer.find(".n2-sp-preview-inner");

            applyOptions(true);

            if (flat) {
                boundElement.parent().after(container).hide();
            }
            else {
                $(body).append(container.hide());
            }

            if (localStorageKey && window.localStorage) {

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) {
                }
            }

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if (boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) {
                if (e.keyCode == 13) {
                    setFromTextInput();
                }
            });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                hide("cancel");
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            });

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY) {
                currentSaturation = parseFloat(dragX / dragWidth);
                currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                move();
            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function palletElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(this).data("color"));
                    move();
                }
                else {
                    set($(this).data("color"));
                    updateOriginalInput(true);
                    move();
                    hide();
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".n2-sp-thumb-el", paletteEvent, palletElementClick);
            initialColorContainer.delegate(".n2-sp-thumb-el:nth-child(1)", paletteEvent, {ignore: true}, palletElementClick);
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var colorRgb = tinycolor(color).toRgbString();
                if ($.inArray(colorRgb, selectionPalette) === -1) {
                    selectionPalette.push(colorRgb);
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch (e) {
                    }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            var p = selectionPalette;
            var paletteLookup = {};
            var rgb;

            if (opts.showPalette) {

                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }

                for (i = 0; i < p.length; i++) {
                    rgb = tinycolor(p[i]).toRgbString();

                    if (!paletteLookup.hasOwnProperty(rgb)) {
                        unique.push(p[i]);
                        paletteLookup[rgb] = true;
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "n2-sp-palette-row n2-sp-palette-row-" + i);
            });

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "n2-sp-palette-row n2-sp-palette-row-selection"));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "n2-sp-palette-row-initial"));
            }
        }

        function dragStart() {
            if (dragHeight === 0 || dragWidth === 0 || slideHeight === 0) {
                reflow();
            }
            container.addClass(draggingClass);
        }

        function dragStop() {
            container.removeClass(draggingClass);
        }

        function setFromTextInput() {
            var tiny = tinycolor(textInput.val());
            if (tiny.ok) {
                set(tiny);
            }
            else {
                textInput.addClass("n2-sp-validation-error");
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            if (visible) {
                reflow();
                return;
            }
            if (callbacks.beforeShow(get()) === false) return;

            hideAll();
            visible = true;

            $(doc).bind("click.spectrum", hide);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("n2-sp-active");
            container.show();

            if (opts.showPalette) {
                drawPalette();
            }
            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
        }

        function hide(e) {

            // Return on right click
            if (e && e.type == "click" && e.button == 2) {
                return;
            }

            // Return if hiding is unnecessary
            if (!visible || flat) {
                return;
            }
            visible = false;

            $(doc).unbind("click.spectrum", hide);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("n2-sp-active");
            container.hide();

            var colorHasChanged = !tinycolor.equals(get(), colorOnShow);

            if (colorHasChanged) {
                if (clickoutFiresChange && e !== "cancel") {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
            }

            callbacks.hide(get());
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                return;
            }

            var newColor = tinycolor(color);
            var newHsv = newColor.toHsv();

            currentHue = newHsv.h;
            currentSaturation = newHsv.s;
            currentValue = newHsv.v;
            currentAlpha = newHsv.a;

            updateUI();

            if (!ignoreFormatChange) {
                currentPreferredFormat = preferredFormat || newColor.format;
            }
        }

        function get() {
            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            });
        }

        function isValid() {
            return !textInput.hasClass("n2-sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
        }

        function updateUI() {

            textInput.removeClass("n2-sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor({h: currentHue, s: "1.0", v: "1.0"});
            dragger.css("background-color", '#' + flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1) {
                if (format === "hex" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get(),
                realHex = realColor.toHexString(),
                realRgb = realColor.toRgbString();


            // Update the replaced elements background color (with actual selected color)
            if (rgbaSupport || realColor.alpha === 1) {
                previewElement.css("background-color", realRgb);
            }
            else {
                previewElement.css("background-color", "transparent");
                previewElement.css("filter", realColor.toFilter());
            }

            if (opts.showAlpha) {
                var rgb = realColor.toRgb();
                rgb.a = 0;
                var realAlpha = tinycolor(rgb).toRgbString();
                var gradient = "linear-gradient(to right, " + realAlpha + ", " + realHex + ")";
                alphaSliderInner.css("background", gradient);
            }


            // Update the text entry input as it changes happen
            if (opts.showInput) {
                if (currentAlpha < 1) {
                    if (format === "hex" || format === "name") {
                        format = "rgb";
                    }
                }
                textInput.val(realColor.toString(format));
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            // Where to show the little circle in that displays your current selected color
            var dragX = s * dragWidth;
            var dragY = dragHeight - (v * dragHeight);
            dragX = Math.max(
                -dragHelperHeight,
                Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
            );
            dragY = Math.max(
                -dragHelperHeight,
                Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
            );
            dragHelper.css({
                "top": dragY,
                "left": dragX
            });

            var alphaX = currentAlpha * alphaWidth;
            alphaSlideHelper.css({
                "left": alphaX - (alphaSlideHelperWidth / 2)
            });

            // Where to show the bar that displays your current selected hue
            var slideY = (currentHue) * slideHeight;
            slideHelper.css({
                "top": slideY - slideHelperHeight
            });
        }

        function updateOriginalInput(fireCallback) {
            var color = get();

            if (isInput) {
                boundElement.val(color.toString(currentPreferredFormat)).change();
            }

            //var hasChanged = !tinycolor.equals(color, colorOnShow);
            var hasChanged = 1;

            colorOnShow = color;

            // Update the selection palette with the current color
            addColorToSelectionPalette(color);
            if (fireCallback && hasChanged) {
                callbacks.change(color);
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.offset(getOffset(container, offsetElement.parent()));
            }

            updateHelperLocations();
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("n2-sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("n2-sp-disabled");
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
     * checkOffset - get the offset below/above and left/right element depending on screen position
     * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
     */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        offset.top += inputHeight + 3;

        offset.left -=
            Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
                Math.abs(offset.left + dpWidth - viewWidth) : 0);

        offset.top -=
            Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
                Math.abs(dpHeight + inputHeight + 6 - extraY) : extraY));

        return offset;
    }

    /**
     * noop - do nothing
     */
    function noop() {

    }

    /**
     * stopPropagation - makes the code only doing this a little easier to read in line
     */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
     * Create a function bound to a given object
     * Thanks to underscore.js
     */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
     * Lightweight drag helper.  Handles containment within the element, so that
     * when dragging, the x is within [0,element.width] and y is within [0,element.height]
     */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () {
        };
        onstart = onstart || function () {
        };
        onstop = onstop || function () {
        };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = false;

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents[(hasTouch ? "touchmove" : "mousemove")] = move;
        duringDragEvents[(hasTouch ? "touchend" : "mouseup")] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) {
                    return stop();
                }

                var touches = e.originalEvent.touches;
                var pageX = touches ? touches[0].pageX : e.pageX;
                var pageY = touches ? touches[0].pageY : e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            var touches = e.originalEvent.touches;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("n2-sp-dragging");

                    if (!hasTouch) {
                        move(e);
                    }

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("n2-sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind(hasTouch ? "touchstart" : "mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }


    /**
     * Define a jQuery plugin
     */
    var dataID = "spectrum.id";
    $.fn.n2spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {

                    var method = spect[opts];
                    if (!method) {
                        throw new Error("Spectrum: no such method: '" + opts + "'");
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.n2spectrum("destroy").each(function () {
            var spect = spectrum(this, opts);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.n2spectrum.load = true;
    $.fn.n2spectrum.loadOpts = {};
    $.fn.n2spectrum.draggable = draggable;
    $.fn.n2spectrum.defaults = defaultOpts;

    $.n2spectrum = {};
    $.n2spectrum.localization = {};
    $.n2spectrum.palettes = {};

    // TinyColor.js - <https://github.com/bgrins/TinyColor> - 2011 Brian Grinstead - v0.5

    (function () {

        var trimLeft = /^[\s,#]+/,
            trimRight = /\s+$/,
            tinyCounter = 0,
            math = Math,
            mathRound = math.round,
            mathMin = math.min,
            mathMax = math.max,
            mathRandom = math.random;

        tinycolor = function (color, opts) {

            // If input is already a tinycolor, return itself
            if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
                return color;
            }

            var rgb = inputToRGB(color);
            var r = rgb.r, g = rgb.g, b = rgb.b, a = parseFloat(rgb.a), format = rgb.format;

            return {
                ok: rgb.ok,
                format: format,
                _tc_id: tinyCounter++,
                alpha: a,
                toHsv: function () {
                    var hsv = rgbToHsv(r, g, b);
                    return {h: hsv.h, s: hsv.s, v: hsv.v, a: a};
                },
                toHsvString: function () {
                    var hsv = rgbToHsv(r, g, b);
                    var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
                    return (a == 1) ?
                        "hsv(" + h + ", " + s + "%, " + v + "%)" :
                        "hsva(" + h + ", " + s + "%, " + v + "%, " + a + ")";
                },
                toHsl: function () {
                    var hsl = rgbToHsl(r, g, b);
                    return {h: hsl.h, s: hsl.s, l: hsl.l, a: a};
                },
                toHslString: function () {
                    var hsl = rgbToHsl(r, g, b);
                    var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
                    return (a == 1) ?
                        "hsl(" + h + ", " + s + "%, " + l + "%)" :
                        "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")";
                },
                toHex: function () {
                    return rgbToHex(r, g, b);
                },
                toHexString: function (force6Char) {
                    return rgbToHex(r, g, b, force6Char);
                },
                toHexString8: function () {
                    return rgbToHex(r, g, b, true) + pad2(mathRound(a * 255).toString(16));
                },
                toRgb: function () {
                    return {r: mathRound(r), g: mathRound(g), b: mathRound(b), a: a};
                },
                toRgbString: function () {
                    return (a == 1) ?
                        "rgb(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" :
                        "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + a + ")";
                },
                toName: function () {
                    return hexNames[rgbToHex(r, g, b)] || false;
                },
                toFilter: function (opts, secondColor) {

                    var hex = rgbToHex(r, g, b, true);
                    var secondHex = hex;
                    var alphaHex = Math.round(parseFloat(a) * 255).toString(16);
                    var secondAlphaHex = alphaHex;
                    var gradientType = opts && opts.gradientType ? "GradientType = 1, " : "";

                    if (secondColor) {
                        var s = tinycolor(secondColor);
                        secondHex = s.toHex();
                        secondAlphaHex = Math.round(parseFloat(s.alpha) * 255).toString(16);
                    }

                    return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=#" + pad2(alphaHex) + hex + ",endColorstr=#" + pad2(secondAlphaHex) + secondHex + ")";
                },
                toString: function (format) {
                    format = format || this.format;
                    var formattedString = false;
                    if (format === "rgb") {
                        formattedString = this.toRgbString();
                    }
                    if (format === "hex") {
                        formattedString = this.toHexString();
                    }
                    if (format === "hex6") {
                        formattedString = this.toHexString(true);
                    }
                    if (format === "hex8") {
                        formattedString = this.toHexString8();
                    }
                    if (format === "name") {
                        formattedString = this.toName();
                    }
                    if (format === "hsl") {
                        formattedString = this.toHslString();
                    }
                    if (format === "hsv") {
                        formattedString = this.toHsvString();
                    }

                    return formattedString || this.toHexString(true);
                }
            };
        };

        // If input is an object, force 1 into "1.0" to handle ratios properly
        // String input requires "1.0" as input, so 1 will be treated as 1
        tinycolor.fromRatio = function (color) {

            if (typeof color == "object") {
                for (var i in color) {
                    if (color[i] === 1) {
                        color[i] = "1.0";
                    }
                }
            }

            return tinycolor(color);

        };

        // Given a string or object, convert that input to RGB
        // Possible string inputs:
        //
        //     "red"
        //     "#f00" or "f00"
        //     "#ff0000" or "ff0000"
        //     "rgb 255 0 0" or "rgb (255, 0, 0)"
        //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
        //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
        //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
        //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
        //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
        //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
        //
        function inputToRGB(color) {

            var rgb = {r: 0, g: 0, b: 0};
            var a = 1;
            var ok = false;
            var format = false;

            if (typeof color == "string") {
                color = stringInputToObject(color);
            }

            if (typeof color == "object") {
                if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                    rgb = rgbToRgb(color.r, color.g, color.b);
                    ok = true;
                    format = "rgb";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                    rgb = hsvToRgb(color.h, color.s, color.v);
                    ok = true;
                    format = "hsv";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                    rgb = hslToRgb(color.h, color.s, color.l);
                    ok = true;
                    format = "hsl";
                }

                if (color.hasOwnProperty("a")) {
                    a = color.a;
                }
            }

            rgb.r = mathMin(255, mathMax(rgb.r, 0));
            rgb.g = mathMin(255, mathMax(rgb.g, 0));
            rgb.b = mathMin(255, mathMax(rgb.b, 0));


            // Don't let the range of [0,255] come back in [0,1].
            // Potentially lose a little bit of precision here, but will fix issues where
            // .5 gets interpreted as half of the total, instead of half of 1.
            // If it was supposed to be 128, this was already taken care of in the conversion function
            if (rgb.r < 1) {
                rgb.r = mathRound(rgb.r);
            }
            if (rgb.g < 1) {
                rgb.g = mathRound(rgb.g);
            }
            if (rgb.b < 1) {
                rgb.b = mathRound(rgb.b);
            }

            return {
                ok: ok,
                format: (color && color.format) || format,
                r: rgb.r,
                g: rgb.g,
                b: rgb.b,
                a: a
            };
        }


        // Conversion Functions
        // --------------------

        // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
        // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

        // `rgbToRgb`
        // Handle bounds / percentage checking to conform to CSS color spec
        // <http://www.w3.org/TR/css3-color/>
        // *Assumes:* r, g, b in [0, 255] or [0, 1]
        // *Returns:* { r, g, b } in [0, 255]
        function rgbToRgb(r, g, b) {
            return {
                r: bound01(r, 255) * 255,
                g: bound01(g, 255) * 255,
                b: bound01(b, 255) * 255
            };
        }

        // `rgbToHsl`
        // Converts an RGB color value to HSL.
        // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
        // *Returns:* { h, s, l } in [0,1]
        function rgbToHsl(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, l = (max + min) / 2;

            if (max == min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }

                h /= 6;
            }

            return {h: h, s: s, l: l};
        }

        // `hslToRgb`
        // Converts an HSL color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hslToRgb(h, s, l) {
            var r, g, b;

            h = bound01(h, 360);
            s = bound01(s, 100);
            l = bound01(l, 100);

            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            if (s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return {r: r * 255, g: g * 255, b: b * 255};
        }

        // `rgbToHsv`
        // Converts an RGB color value to HSV
        // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
        // *Returns:* { h, s, v } in [0,1]
        function rgbToHsv(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max == min) {
                h = 0; // achromatic
            }
            else {
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return {h: h, s: s, v: v};
        }

        // `hsvToRgb`
        // Converts an HSV color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hsvToRgb(h, s, v) {
            h = bound01(h, 360) * 6;
            s = bound01(s, 100);
            v = bound01(v, 100);

            var i = math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6,
                r = [v, q, p, p, t, v][mod],
                g = [t, v, v, q, p, p][mod],
                b = [p, p, t, v, v, q][mod];

            return {r: r * 255, g: g * 255, b: b * 255};
        }

        // `rgbToHex`
        // Converts an RGB color to hex
        // Assumes r, g, and b are contained in the set [0, 255]
        // Returns a 3 or 6 character hex
        function rgbToHex(r, g, b, force6Char) {

            var hex = [
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            // Return a 3 character hex if possible
            if (!force6Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
            }

            return hex.join("");
        }

        // `equals`
        // Can be called with any tinycolor input
        tinycolor.equals = function (color1, color2) {
            if (!color1 || !color2) {
                return false;
            }
            return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
        };
        tinycolor.random = function () {
            return tinycolor.fromRatio({
                r: mathRandom(),
                g: mathRandom(),
                b: mathRandom()
            });
        };


        // Modification Functions
        // ----------------------
        // Thanks to less.js for some of the basics here
        // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>


        tinycolor.desaturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s -= ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.saturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s += ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.greyscale = function (color) {
            return tinycolor.desaturate(color, 100);
        };
        tinycolor.lighten = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l += ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.darken = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l -= ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.complement = function (color) {
            var hsl = tinycolor(color).toHsl();
            hsl.h = (hsl.h + 0.5) % 1;
            return tinycolor(hsl);
        };


        // Combination Functions
        // ---------------------
        // Thanks to jQuery xColor for some of the ideas behind these
        // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

        tinycolor.triad = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 120) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 240) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.tetrad = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 90) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 180) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 270) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.splitcomplement = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 216) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.analogous = function (color, results, slices) {
            results = results || 6;
            slices = slices || 30;

            var hsl = tinycolor(color).toHsl();
            var part = 360 / slices;
            var ret = [tinycolor(color)];

            hsl.h *= 360;

            for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results;) {
                hsl.h = (hsl.h + part) % 360;
                ret.push(tinycolor(hsl));
            }
            return ret;
        };
        tinycolor.monochromatic = function (color, results) {
            results = results || 6;
            var hsv = tinycolor(color).toHsv();
            var h = hsv.h, s = hsv.s, v = hsv.v;
            var ret = [];
            var modification = 1 / results;

            while (results--) {
                ret.push(tinycolor({h: h, s: s, v: v}));
                v = (v + modification) % 1;
            }

            return ret;
        };
        tinycolor.readable = function (color1, color2) {
            var a = tinycolor(color1).toRgb(), b = tinycolor(color2).toRgb();
            return (
                (b.r - a.r) * (b.r - a.r) +
                (b.g - a.g) * (b.g - a.g) +
                (b.b - a.b) * (b.b - a.b)
            ) > 0x28A4;
        };

        // Big List of Colors
        // ---------
        // <http://www.w3.org/TR/css3-color/#svg-color>
        var names = tinycolor.names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "0ff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000",
            blanchedalmond: "ffebcd",
            blue: "00f",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            burntsienna: "ea7e5d",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "0ff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkgrey: "a9a9a9",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkslategrey: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dimgrey: "696969",
            dodgerblue: "1e90ff",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "f0f",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            grey: "808080",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgray: "d3d3d3",
            lightgreen: "90ee90",
            lightgrey: "d3d3d3",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslategray: "789",
            lightslategrey: "789",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "0f0",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "f0f",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370db",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "db7093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            red: "f00",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            slategrey: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            wheat: "f5deb3",
            white: "fff",
            whitesmoke: "f5f5f5",
            yellow: "ff0",
            yellowgreen: "9acd32"
        };

        // Make it easy to access colors via `hexNames[hex]`
        var hexNames = tinycolor.hexNames = flip(names);


        // Utilities
        // ---------

        // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
        function flip(o) {
            var flipped = {};
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    flipped[o[i]] = i;
                }
            }
            return flipped;
        }

        // Take input from [0, n] and return it as [0, 1]
        function bound01(n, max) {
            if (isOnePointZero(n)) {
                n = "100%";
            }

            var processPercent = isPercentage(n);
            n = mathMin(max, mathMax(0, parseFloat(n)));

            // Automatically convert percentage into number
            if (processPercent) {
                n = n * (max / 100);
            }

            // Handle floating point rounding errors
            if (math.abs(n - max) < 0.000001) {
                return 1;
            }
            else if (n >= 1) {
                return (n % max) / parseFloat(max);
            }
            return n;
        }

        // Force a number between 0 and 1
        function clamp01(val) {
            return mathMin(1, mathMax(0, val));
        }

        // Parse an integer into hex
        function parseHex(val) {
            return parseInt(val, 16);
        }

        // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
        // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
        function isOnePointZero(n) {
            return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
        }

        // Check to see if string passed in is a percentage
        function isPercentage(n) {
            return typeof n === "string" && n.indexOf('%') != -1;
        }

        // Force a hex value to have 2 characters
        function pad2(c) {
            return c.length == 1 ? '0' + c : '' + c;
        }

        var matchers = (function () {

            // <http://www.w3.org/TR/css3-values/#integers>
            var CSS_INTEGER = "[-\\+]?\\d+%?";

            // <http://www.w3.org/TR/css3-values/#number-value>
            var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

            // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
            var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

            // Actual matching.
            // Parentheses and commas are optional, but not required.
            // Whitespace can take the place of commas or opening paren
            var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
            var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

            return {
                rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
                rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
                hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
                hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
                hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
                hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
                hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
            };
        })();

        // `stringInputToObject`
        // Permissive string parsing.  Take in a number of formats, and output an object
        // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
        function stringInputToObject(color) {

            color = color.replace(trimLeft, '').replace(trimRight, '').toLowerCase();
            var named = false;
            if (names[color]) {
                color = names[color];
                named = true;
            }
            else if (color == 'transparent') {
                return {r: 0, g: 0, b: 0, a: 0};
            }

            // Try to match string input using regular expressions.
            // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
            // Just return an object and let the conversion functions handle that.
            // This way the result will be the same whether the tinycolor is initialized with string or object.
            var match;
            if ((match = matchers.rgb.exec(color))) {
                return {r: match[1], g: match[2], b: match[3]};
            }
            if ((match = matchers.rgba.exec(color))) {
                return {r: match[1], g: match[2], b: match[3], a: match[4]};
            }
            if ((match = matchers.hsl.exec(color))) {
                return {h: match[1], s: match[2], l: match[3]};
            }
            if ((match = matchers.hsla.exec(color))) {
                return {h: match[1], s: match[2], l: match[3], a: match[4]};
            }
            if ((match = matchers.hsv.exec(color))) {
                return {h: match[1], s: match[2], v: match[3]};
            }
            if ((match = matchers.hex6.exec(color))) {
                return {
                    r: parseHex(match[1]),
                    g: parseHex(match[2]),
                    b: parseHex(match[3]),
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex8.exec(color))) {
                return {
                    r: parseHex(match[1]),
                    g: parseHex(match[2]),
                    b: parseHex(match[3]),
                    a: parseHex(match[4]) / 255,
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex3.exec(color))) {
                return {
                    r: parseHex(match[1] + '' + match[1]),
                    g: parseHex(match[2] + '' + match[2]),
                    b: parseHex(match[3] + '' + match[3]),
                    format: named ? "name" : "hex"
                };
            }

            return false;
        }

        // Everything is ready, expose to window
        //tinycolor;

    })();

    return $.fn.n2spectrum;
});

N2D('ExpertMode', function ($, undefined) {

    /**
     * @param allowed
     * @constructor
     */
    function ExpertMode(allowed) {
        this.app = 'system';
        this.key = 'IsExpert';
        this.isExpert = 0;

        this.style = $('<div style="display: none;"></div>').appendTo('body');

        if (!allowed) {
            this.switches = $();
            this.disable(false);
        } else {

            this.switches = $('.n2-expert-switch')
                .on({
                    mousedown: $.proxy(N2Classes.WindowManager.setMouseDownArea, null, 'expertClicked'),
                    click: $.proxy(this.switchExpert, this, true)
                });

            this.load();
            if (!this.isExpert) {
                this.disable(false);
            }

            $.jStorage.listenKeyChange(this.app + this.key, $.proxy(this.load, this));
        }
    }

    ExpertMode.prototype.load = function () {
        var isExpert = parseInt($.jStorage.get(this.app + this.key, 0));
        if (isExpert != this.isExpert) {
            this.switchExpert(false, false);
        }
    };

    ExpertMode.prototype.set = function (value, needSet) {
        this.isExpert = value;
        if (needSet) {
            $.jStorage.set(this.app + this.key, value);
        }
    };

    ExpertMode.prototype.switchExpert = function (needSet, e) {
        if (e) {
            e.preventDefault();
        }
        if (!this.isExpert) {
            this.enable(needSet);
        } else {
            this.disable(needSet);
        }
    };

    ExpertMode.prototype.measureElement = function () {
        var el = null,
            scrollTop = $(window).scrollTop(),
            cutoff = scrollTop + 62,
            cutoffBottom = scrollTop + $(window).height() - 100;
        $('.n2-content-area > .n2-heading-bar,.n2-content-area > .n2-form-tab ,#n2-admin .n2-content-area form > .n2-form > .n2-form-tab').each(function () {
            var $el = $(this);
            if ($el.offset().top > cutoff) {
                if (!$el.hasClass('n2-heading-bar')) {
                    el = $el;
                }
                return false;
            } else if ($el.offset().top + $el.height() > cutoffBottom) {
                if (!$el.hasClass('n2-heading-bar')) {
                    el = $el;
                }
                return false;
            }
        });
        this.measuredElement = el;
    };

    ExpertMode.prototype.scrollToMeasured = function () {

        if (this.measuredElement !== null) {
            while (this.measuredElement.length && !this.measuredElement.is(':VISIBLE')) {
                this.measuredElement = this.measuredElement.prev();
            }
            if (this.measuredElement.length != 0) {
                $('html,body').scrollTop(this.measuredElement.offset().top - 102);
            }
        }
    };

    ExpertMode.prototype.enable = function (needSet) {
        this.measureElement();
        this.changeStyle('');
        this.set(1, needSet);
        this.switches.addClass('n2-active');
        $('html').addClass('n2-in-expert');

        if (needSet) {
            this.scrollToMeasured();
        }
    };

    ExpertMode.prototype.disable = function (needSet) {
        this.measureElement();
        this.changeStyle('.n2-expert{display: none !important;}');
        this.set(0, needSet);
        this.switches.removeClass('n2-active');
        $('html').removeClass('n2-in-expert');

        if (needSet) {
            this.scrollToMeasured();
        }
    };

    ExpertMode.prototype.changeStyle = function (style) {
        this.style.html('<style type="text/css">' + style + '</style>');
    };

    return function (app, allowed) {
        return new ExpertMode(app, allowed);
    }
});
N2D('Form', function ($, undefined) {

    $(window).ready(function () {
        $('input[data-disabled]').on('focus', function () {
            this.blur();
        });
    });

    var registeredBeforeUnload = false;

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param url
     * @param values
     * @constructor
     */
    function Form(id, url, values) {
        this.form = $('#' + id)
            .on('saved', $.proxy(this.updateSerializedData, this))
            .data('form', this);

        this.updateSerializedData();

        this.url = url;

        this.values = values;

        // Special fix for Joomla 1.6, 1.7 & 2.5. Speedy save!
        if (typeof document.formvalidator !== "undefined") {
            document.formvalidator.isValid = function () {
                return true;
            };
        }

        $(window).on('n2-before-unload', $.proxy(this.onBeforeUnload, this));
        this.registerBeforeUnload();

        $('input, textarea').on('keyup', function (e) {
            if (e.which === 27) {
                e.target.blur();
                e.stopPropagation();
            }
        });
    }

    Form.prototype.registerBeforeUnload = function () {
        if (!registeredBeforeUnload) {
            $(window).on('beforeunload', function (e) {
                if (nextend.askToSave && registeredBeforeUnload + 180000 < $.now()) {
                    var data = {
                        changed: false
                    };
                    $(window).triggerHandler('n2-before-unload', data);

                    if (data.changed) {
                        var confirmationMessage = n2_('The changes you made will be lost if you navigate away from this page.');

                        (e || window.event).returnValue = confirmationMessage;
                        return confirmationMessage;
                    }
                }
            });
            registeredBeforeUnload = $.now();
        }
    };

    Form.prototype.onBeforeUnload = function (e, data) {
        if (!data.changed && this.isChanged()) {
            data.changed = true;
        }
    };

    Form.prototype.isChanged = function () {
        this.form.triggerHandler('checkChanged');

        return this.serialized != this.form.serialize();
    };

    Form.prototype.updateSerializedData = function () {
        this.serialized = this.form.serialize();
    };

    Form.submit = function (query) {
        nextend.askToSave = false;
        setTimeout(function () {
            $(query).submit();
        }, 300);
        return false;
    };

    return Form;
});
N2D('FormElement', function ($, undefined) {

    /**
     * @memberOf N2Classes
     * 
     * @constructor
     */
    function FormElement() {
        this.connectedField = null;
        this.element.data('field', this);
    }

    FormElement.prototype.triggerOutsideChange = function () {
        this.element.triggerHandler('outsideChange', this);
        this.element.triggerHandler('nextendChange', this);
    };

    FormElement.prototype.triggerInsideChange = function () {
        this.element.triggerHandler('insideChange', this);
        this.element.triggerHandler('nextendChange', this);
    };

    FormElement.prototype.focus = function (shouldOpen) {
        if (this.connectedField) {
            this.connectedField.focus(shouldOpen);
        }
    };

    return FormElement;
});

N2D('FormElementText', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementText(id) {
        this.element = $('#' + id).on({
            focus: $.proxy(this._focus, this),
            blur: $.proxy(this._blur, this),
            change: $.proxy(this.change, this)
        });

        this.tagName = this.element.prop('tagName');

        this.parent = this.element.parent();

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementText.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementText.prototype.constructor = FormElementText;


    FormElementText.prototype._focus = function () {
        this.parent.addClass('focus');

        if (this.tagName != 'TEXTAREA') {
            this.element.on('keypress.n2-text', $.proxy(function (e) {
                if (e.which == 13) {
                    this.element.off('keypress.n2-text');
                    this.element.trigger('blur');
                }
            }, this));
        }
    };

    FormElementText.prototype._blur = function () {
        this.parent.removeClass('focus');
    };

    FormElementText.prototype.change = function () {

        this.triggerOutsideChange();
    };

    FormElementText.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    FormElementText.prototype.focus = function (shouldOpen) {
        if (this.connectedField) {
            this.connectedField.focus(shouldOpen);
        } else if (shouldOpen) {
            this.element.focus().select();
        }
    };

    return FormElementText;
});
N2D('Notification', function ($, undefined) {

    /**
     * @alias N2Classes.notification
     * @constructor
     */
    function Notification() {
        /**
         * @type {NotificationStack[]}
         */
        this.stack = [];
        this.tween = null;

        N2R('documentReady', $.proxy(function ($) {
            var mainTopBar = $('#n2-admin').find('.n2-main-top-bar');
            if (mainTopBar.length > 0) {
                var stack = new N2Classes.NotificationStack($('#n2-admin').find('.n2-main-top-bar'));
                stack.enableStack();
            } else {
                var stack = new N2Classes.NotificationStackModal($('#n2-admin'));
                stack.enableStack();
            }
        }, this));
    }


    Notification.prototype.add = function (stack) {
        this.stack.push(stack);
    };

    Notification.prototype.popStack = function () {
        this.stack.pop();
    };

    /**
     *
     * @returns {NotificationStack}
     */
    Notification.prototype.getCurrentStack = function () {
        return this.stack[this.stack.length - 1];
    };

    Notification.prototype.success = function (message, parameters) {
        this.getCurrentStack().success(message, parameters);
    };

    Notification.prototype.error = function (message, parameters) {
        this.getCurrentStack().error(message, parameters);
    };

    Notification.prototype.notice = function (message, parameters) {
        this.getCurrentStack().notice(message, parameters);
    };

    return new Notification();
});
N2D('NotificationStack', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NotificationStack(bar) {
        this.messages = [];
        this.isShow = false;
        this.importantOnly = 0;

        this.importantOnlyNode = $('<div class="n2-notification-important n2-h5 ' + (this.importantOnly ? 'n2-active' : '') + '"><span>' + n2_('Show only errors') + '</span><div class="n2-checkbox n2-light"><i class="n2-i n2-i-tick"></i></div></div>')
            .on('click', $.proxy(this.changeImportant, this));
        $.jStorage.listenKeyChange('ss-important-only', $.proxy(this.importantOnlyChanged, this));
        this.importantOnlyChanged();

        this._init(bar);
        this.emptyMessage = $('<div class="n2-notification-empty n2-h4">' + n2_('There are no messages to display.') + '</div>');
    }

    NotificationStack.prototype._init = function (bar) {

        this.showButton = bar.find('.n2-notification-button')
            .on('click', $.proxy(this.hideOrShow, this));

        var settings = $('<div class="n2-notification-settings"></div>')
            .append($('<div class="n2-button n2-button-normal n2-button-s n2-button-blue n2-radius-s n2-h5 n2-uc n2-notification-clear">' + n2_('Got it!') + '</div>').on('click', $.proxy(this.clear, this)))
            .append(this.importantOnlyNode);


        this.container = this.messageContainer = $('<div class="n2-notification-center n2-border-radius-br n2-border-radius-bl"></div>')
            .append(settings)
            .appendTo(bar);
    };

    NotificationStack.prototype.enableStack = function () {
        N2Classes.Notification.add(this);
    };

    NotificationStack.prototype.popStack = function () {
        N2Classes.Notification.popStack();
    };

    NotificationStack.prototype.hideOrShow = function (e) {
        e.preventDefault();
        if (this.isShow) {
            this.hide()
        } else {
            this.show();
        }
    };

    NotificationStack.prototype.show = function () {
        if (!this.isShow) {
            this.isShow = true;

            if (this.messages.length == 0) {
                this.showEmptyMessage();
            }

            if (this.showButton) {
                this.showButton.addClass('n2-active');
            }
            this.container.addClass('n2-active');

            this.container.css('display', 'block');

            this._animateShow();
        }
    };

    NotificationStack.prototype.hide = function () {
        if (this.isShow) {
            if (this.showButton) {
                this.showButton.removeClass('n2-active');
            }
            this.container.removeClass('n2-active');

            this._animateHide();

            this.container.css('display', 'none');

            this.isShow = false;
        }
    };

    NotificationStack.prototype._animateShow = function () {
        if (this.tween) {
            this.tween.pause();
        }
        this.tween = NextendTween.fromTo(this.container, 0.4, {
            opacity: 0
        }, {
            opacity: 1
        });
    };

    NotificationStack.prototype._animateHide = function () {
        if (this.tween) {
            this.tween.pause();
        }
    };

    NotificationStack.prototype.success = function (message, parameters) {
        this._message('success', n2_('success'), message, parameters);
    };

    NotificationStack.prototype.error = function (message, parameters) {
        this._message('error', n2_('error'), message, parameters);
    };

    NotificationStack.prototype.notice = function (message, parameters) {
        this._message('notice', n2_('notice'), message, parameters);
    };

    NotificationStack.prototype._message = function (type, label, message, parameters) {

        this.hideEmptyMessage();

        parameters = $.extend({
            timeout: false,
            remove: false
        }, parameters);

        var messageNode = $('<div></div>');

        if (parameters.timeout) {
            setTimeout($.proxy(function () {
                this.hideMessage(messageNode, parameters.remove);
            }, this), parameters.timeout * 1000);
        }

        messageNode
            .addClass('n2-table n2-table-fixed n2-h3 n2-border-radius n2-notification-message n2-notification-message-' + type)
            .append($('<div class="n2-tr"></div>')
                .append('<div class="n2-td n2-first"><i class="n2-i n2-i-n-' + type + '"/></div>')
                .append('<div class="n2-td n2-message"><h4 class="n2-h4 n2-uc">' + label + '</h4><p class="n2-h4">' + message + '</p></div>'))
            .prependTo(this.messageContainer);

        this.messages.push(messageNode);
        if (this.messages.length > 3) {
            this.messages.shift().remove();
        }

        if (!this.importantOnly || type == 'error' || type == 'notice') {
            this.show();
        }
        return messageNode;
    };

    NotificationStack.prototype.hideMessage = function (message, remove) {
        if (remove) {
            this.deleteMessage(message);
        } else {
            this.hide();
        }
    };

    NotificationStack.prototype.deleteMessage = function (message) {
        var index = $.inArray(message, this.messages);
        if (index > -1) {
            this.messages.splice(index, 1);
            message.remove();
        }
        if (this.messages.length == 0) {
            this.hide();
        }
    };
    NotificationStack.prototype.clear = function () {
        for (var i = this.messages.length - 1; i >= 0; i--) {
            this.messages.pop().remove();
        }

        this.showEmptyMessage();

        this.hide();
    };
    NotificationStack.prototype.changeImportant = function () {
        if (this.importantOnly) {
            $.jStorage.set('ss-important-only', 0);
        } else {
            $.jStorage.set('ss-important-only', 1);
        }
    };

    NotificationStack.prototype.importantOnlyChanged = function () {
        this.importantOnly = parseInt($.jStorage.get('ss-important-only', 0));
        if (this.importantOnly) {
            this.importantOnlyNode.addClass('n2-active');
        } else {
            this.importantOnlyNode.removeClass('n2-active');
        }
    };

    NotificationStack.prototype.showEmptyMessage = function () {
        this.emptyMessage.prependTo(this.container);
    };

    NotificationStack.prototype.hideEmptyMessage = function () {
        this.emptyMessage.detach();
    };

    return NotificationStack;
});
N2D('NotificationStackModal', ['NotificationStack'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments NotificationStack
     */
    function NotificationStackModal() {
        N2Classes.NotificationStack.prototype.constructor.apply(this, arguments);
    }

    NotificationStackModal.prototype = Object.create(N2Classes.NotificationStack.prototype);
    NotificationStackModal.prototype.constructor = NotificationStackModal;


    NotificationStackModal.prototype._init = function (bar) {
        var settings = $('<div class="n2-notification-settings"></div>')
            .append($('<div class="n2-button n2-button-normal n2-button-s n2-button-blue n2-radius-s n2-h5 n2-uc n2-notification-clear">'+n2_('Got it!')+'</div>').on('click', $.proxy(this.clear, this)))
            .append(this.importantOnlyNode);

        this.messageContainer = $('<div class="n2-notification-center n2-border-radius"></div>')
            .append(settings);
        this.container = $('<div class="n2-notification-center-modal"></div>')
            .append(this.messageContainer)
            .appendTo(bar);
    };

    NotificationStackModal.prototype.show = function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
        N2Classes.Esc.add($.proxy(function () {
            this.clear();
            return false;
        }, this));

        N2Classes.NotificationStack.prototype.show.apply(this, arguments);
    };

    NotificationStackModal.prototype.hide = function () {
        N2Classes.Esc.pop();

        N2Classes.NotificationStack.prototype.hide.apply(this, arguments);
    };

    NotificationStackModal.prototype._animateShow = function () {

    };

    NotificationStackModal.prototype._animateHide = function () {

    };

    return NotificationStackModal;
});
N2D('FormElementAutocompleteSimple', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param values
     * @constructor
     */
    function FormElementAutocompleteSimple(id, values) {
        this.element = $('#' + id).data('autocomplete', this);
        this.element.nUIAutocomplete({
            positionTo: '.n2-form-element-autocomplete',
            y: -2,
            appendTo: $.proxy(function () {
                return this.element.closest('.n2-scrollable, body')
            }, this),
            source: function () {
                return values;
            },
            select: function (event, ui) {
                $(this).val(ui.value).trigger('change');
            }
        });
    }

    return FormElementAutocompleteSimple;
});
N2D('FormElementAutocomplete', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param tags
     * @constructor
     */
    function FormElementAutocomplete(id, tags) {
        this.tags = tags;
        this.element = $('#' + id).data('autocomplete', this);

        this.element.nUIAutocomplete({
            positionTo: '.n2-form-element-autocomplete',
            y: -2,
            appendTo: $.proxy(function () {
                return this.element.closest('.n2-scrollable, body')
            }, this),
            source: $.proxy(function () {
                return this.tags;
            }, this),
            select: function (event, ui) {
                var terms = this.value.split(/,/);
                terms.pop();
                terms.push(ui.value);
                terms.push("");
                this.value = terms.join(",");
                $(this).trigger('change');
            }
        });

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    };

    FormElementAutocomplete.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.element.val('').trigger('change');
    };

    FormElementAutocomplete.prototype.setTags = function (tags) {
        this.tags = tags;
    };

    return FormElementAutocomplete;

});
N2D('BasicCSSFont', ['BasicCSSSkeleton'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function BasicCSSFont() {
        this._singular = 'font';
        this._prular = 'fonts';
        N2Classes.BasicCSSSkeleton.prototype.constructor.apply(this, arguments);

        this.form = {
            afont: $('#layerfamily'),
            color: $('#layercolor'),
            size: $('#layersize'),
            weight: $('#layerweight'),
            lineheight: $('#layerlineheight'),
            align: $('#layertextalign'),
            underline: $('#layerdecoration'),
            italic: $('#layerdecoration')

        };

        this.loaded();
    }

    BasicCSSFont.prototype = Object.create(N2Classes.BasicCSSSkeleton.prototype);
    BasicCSSFont.prototype.constructor = BasicCSSFont;

    BasicCSSFont.prototype.setValue = function (value) {
        for (var i = 0; i < value.length; i++) {
            if (value[i].bold !== undefined) {
                if (value[i].weight !== undefined) {
                    delete value[i].bold;
                } else {
                    if (value[i].bold == 1) {
                        value[i].weight = 700;
                    } else if (value[i].bold > 0) {
                        value[i].weight = value[i].bold;
                    }
                    delete value[i].bold;
                }
            }
        }
        this.value = value;
    }

    BasicCSSFont.prototype._transformsize = function (value) {
        return value.split('||').join('|*|');
    };

    BasicCSSFont.prototype._setsize = function (tab, value) {
        tab.size = value.replace('|*|', '||');
    };

    BasicCSSFont.prototype._transformweight = function (value) {
        return parseInt(value);
    };

    BasicCSSFont.prototype._setweight = function (tab, value) {
        tab.weight = parseInt(value);
    };

    BasicCSSFont.prototype._transformunderline = function (value) {
        return [
            this.value[this.activeTab].italic == 1 ? 'italic' : '',
            value == 1 ? 'underline' : ''
        ].join('||');
    };

    BasicCSSFont.prototype._setunderline = function (tab, value) {
        var values = value.split('||');
        tab.underline = (values[1] == 'underline' ? 1 : 0);
    };

    BasicCSSFont.prototype._transformitalic = function (value) {
        return [
            value == 1 ? 'italic' : '',
            this.value[this.activeTab].underline == 1 ? 'underline' : ''
        ].join('||');
    };

    BasicCSSFont.prototype._setitalic = function (tab, value) {
        var values = value.split('||');
        tab.italic = (values[0] == 'italic' ? 1 : 0);
    };

    return BasicCSSFont;
});
N2D('BasicCSSSkeleton', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param manager
     * @constructor
     */
    function BasicCSSSkeleton(manager) {
        this.hasVisuals = false;
        this.isInsideChange = false;
        this.isReload = false;
        this.manager = manager;
        this.$container = manager.$container.find('#n2-tab-basiccss' + this._singular);
        this.$visuals = this.$container.find('.n2-css-name');
        this.$visualsLabel = this.$visuals.find('.n2-css-name-label');
        this.$visualsList = this.$visuals.find('.n2-css-name-list');
        this.$tabsContainer = this.$container.find('.n2-css-tab');
        this.$reset = this.$container.find('.n2-css-tab-reset').on('click', $.proxy(function (e) {
            this.value[this.activeTab] = {};
            this._lazySave(e);
            this.activateTab(this.activeTab);
        }, this));
        this.$more = this.$container.find('.n2-basiccss-more').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.visuals[this.activeVisual].field.show(e);
        }, this));

        this.activeVisual = 0;
        this.activeTab = 0;
        this.tabs = [];
    }

    BasicCSSSkeleton.prototype.loaded = function () {
        for (var k in this.form) {
            this.form[k].on({
                nextendChange: $.proxy(this.changeValue, this, k)
            });
        }
    };

    BasicCSSSkeleton.prototype.changeValue = function (name, e) {
        if (!this.isReload) {
            if (typeof this['_set' + name] == 'function') {
                this['_set' + name](this.value[this.activeTab], this.form[name].val());
            } else {
                this.value[this.activeTab][name] = this.form[name].val();
            }

            this._lazySave(e);
        }
    };

    BasicCSSSkeleton.prototype._lazySave = NextendDeBounce(function (e) {
        this.isInsideChange = true;
        var value = this.getBase64();
        this.visuals[this.activeVisual].field.save(e, value);
        this.visuals[this.activeVisual].value = value;
        this.isInsideChange = false;
    }, 50);

    BasicCSSSkeleton.prototype.save = function (data) {
        this.isInsideChange = true;
        for (var k in data) {
            this.visualsByName[k].field.save({}, data[k]);
            this.visualsByName[k].value = data[k];
        }
        this.isInsideChange = false;
    };

    BasicCSSSkeleton.prototype.getBase64 = function () {
        return N2Classes.Base64.encode(JSON.stringify({
            name: n2_('Static'),
            data: this.value
        }));
    };

    BasicCSSSkeleton.prototype.load = function (values, visuals) {
        this.hasVisuals = visuals.length > 0;
        this.$container.toggleClass('n2-css-has-' + this._singular, this.hasVisuals);
        if (this.hasVisuals) {
            this.visuals = [];
            this.visualsByName = {};

            this.$visualsList.html('');

            this.$visuals.toggleClass('n2-multiple', visuals.length > 1);
            for (var i = 0; i < visuals.length; i++) {
                var visual = visuals[i];
                this.visualsByName[visual.name] = {
                    value: values[visual.name],
                    mode: visual.mode,
                    field: visual.field
                };

                visual.field.element
                    .off('.basiccss')
                    .on('outsideChange.basiccss', $.proxy(this.loadSingleValue, this, i, visual.name));
                this.visuals.push(this.visualsByName[visual.name]);

                $('<span>' + visual.field.getLabel() + '</span>').on('click', $.proxy(function (i, e) {
                    this.activateVisual(i);
                    this.activateTab(0);
                }, this, i)).appendTo(this.$visualsList);
            }

            this.activateVisual(0);

            this.activateTab(0);
        }
    };

    BasicCSSSkeleton.prototype.loadSingleValue = function (i, k, e) {
        if (!this.isInsideChange) {
            this.visuals[i].value = this.visuals[i].field.element.val();
            if (this.activeVisual == i) {
                this.activateVisual(i);
                this.activateTab(this.activeTab);
            }
        }
    };

    BasicCSSSkeleton.prototype.activateVisual = function (index) {
        this.activeVisual = index;

        this.$visualsLabel.html(this.visuals[index].field.getLabel());

        nextend[this._singular + 'Manager'].getDataFromController(this.visuals[index].value, {previewMode: this.visuals[index].mode}, $.proxy(function (value, tabs) {
            this.setValue(value);
            this.setTabs(tabs);
        }, this));
    };

    BasicCSSSkeleton.prototype.setValue = function (value) {
        this.value = value;
    }

    BasicCSSSkeleton.prototype.activateTab = function (index) {
        this.isReload = true;
        this.activeTab = index;
        this.$container.toggleClass('n2-css-show-reset', index != 0);
        var value = (index == 0 ? this.value[index] : $.extend({}, this.value[0], this.value[index]));
        for (var k in value) {
            if (typeof this.form[k] !== 'undefined') {
                if (typeof this['_transform' + k] == 'function') {
                    this.form[k].data('field').insideChange(this['_transform' + k](value[k]));
                } else {
                    this.form[k].data('field').insideChange(value[k]);
                }
            }
        }

        this.$tabs.removeClass('n2-active').eq(index).addClass('n2-active');
        this.isReload = false;
    };

    BasicCSSSkeleton.prototype.setTabs = function (tabs) {
        this.tabs = tabs;
        this.$tabsContainer.html('');

        for (var i = 0; i < tabs.length; i++) {
            $('<span>' + tabs[i] + '</span>').on('click', $.proxy(function (i, e) {
                this.activateTab(i);
            }, this, i)).appendTo(this.$tabsContainer);
        }
        this.$tabs = this.$tabsContainer.find('span');
    };

    BasicCSSSkeleton.prototype.serialize = function () {
        if (this.hasVisuals) {
            var serialized = {};
            for (var k in this.visualsByName) {
                serialized[k] = this.visualsByName[k].value;
            }
            return serialized;
        }
        return {};
    };

    BasicCSSSkeleton.prototype.unSerialize = function (serialized) {
        for (var k in serialized) {
            if (serialized.hasOwnProperty(k)) {
                this.visualsByName[k].field.save({}, serialized[k]);
                this.visualsByName[k].value = serialized[k];
            }
        }
    };

    return BasicCSSSkeleton;
});
N2D('BasicCSSStyle', ['BasicCSSSkeleton'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function BasicCSSStyle() {
        this._singular = 'style';
        this._prular = 'styles';
        N2Classes.BasicCSSSkeleton.prototype.constructor.apply(this, arguments);


        this.form = {
            backgroundcolor: $('#layerbackgroundcolor'),
            opacity: $('#layeropacity'),
            padding: $('#layerpadding'),
            border: $('#layerborder'),
            borderradius: $('#layerborderradius')
        };

        this.loaded();
    }

    BasicCSSStyle.prototype = Object.create(N2Classes.BasicCSSSkeleton.prototype);
    BasicCSSStyle.prototype.constructor = BasicCSSStyle;

    return BasicCSSStyle;
});
N2D('BasicCSS', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param ajaxUrl
     * @constructor
     */
    function BasicCSS(id, ajaxUrl) {
        this.underActivate = false;
        this.inPresetList = false;
        this.$container = $('#' + id);
        this.ajaxUrl = ajaxUrl;

        this.throttleSetTimeout = null;
        this.throttleExitTimeout = null;

        this.storage = {};

        this.assets = {
            font: new N2Classes.BasicCSSFont(this),
            style: new N2Classes.BasicCSSStyle(this)
        };


        this.$preset = $('<div id="n2-tab-basiccsspreset"><div class="n2-editor-header n2-h2 n2-uc"><span class="n2-css-name n2-css-name-label">' + n2_('Preset') + '</span></div></div>').prependTo(this.$container);


        $('<div class="n2-ss-editor-window-notice n2-ss-responsive-helper n2-h5">' + n2_(window.n2_printf('NOTE: Layer design changes apply to each device. Watch <a href="%s" target="_blank">video tutorial</a> to learn responsive tools.', "https://www.youtube.com/watch?v=yGpVsrzwt1U&index=4&list=PLSawiBnEUNfvzcI3pBHs4iKcbtMCQU0dB")) + '</div>').prependTo(this.$container);

        var presetRightButtons = $('<div class="n2-ss-button-container"></div>').insertAfter(this.$preset.find('.n2-css-name'));
        $('<a class="n2-button n2-button-icon n2-button-s n2-radius-s n2-button-darker n2-h5 n2-uc" href="#" data-n2tip="' + n2_('Reset design to default') + '"><i class="n2-i n2-i-reset2"></i></a>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();
                this.exitPresetList(this.defs, e);
            }, this)).appendTo(presetRightButtons);

        $('<a class="n2-basiccss-save n2-button n2-button-icon n2-button-s n2-radius-s n2-button-darker n2-h5 n2-uc" href="#" data-n2tip="' + n2_('Save design as new preset') + '"><i class="n2-i n2-i-save"></i></a>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();

                this.saveAsNew();
            }, this)).appendTo(presetRightButtons);


        this.$presets = $('<div id="n2-tab-basiccsspresets"></div>').appendTo(this.$container);


        $('<a class="n2-basiccss-choose n2-button n2-button-icon n2-button-s n2-radius-s n2-button-green n2-h5 n2-uc" data-n2tip="' + n2_('Load design') + '" href="#"><i class="n2-i n2-i-addlayer2"></i></a>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();

                this.showList();
            }, this))
            .appendTo(presetRightButtons);

        $('<a class="n2-basiccss-back n2-button n2-button-icon n2-button-s n2-radius-s n2-button-grey n2-h5 n2-uc" href="#"><i class="n2-i n2-i-closewindow"></i></a>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();
                this.exitPresetList(false, e);
            }, this))
            .appendTo(presetRightButtons);

        nextend.basicCSS = this;
    }

    BasicCSS.prototype.showList = function () {
        this.inPresetList = true;
        this.lastState = this.serialize();

        $.when(this.loadType()).done($.proxy(function (data) {
            this.$presets.append(this.storage[this.type]);

            this.$container.addClass('n2-basiccss-show-preset-list');
        }, this));


        this.$presets.on('mouseleave', $.proxy(function () {
            this.throttledUnSerialize(this.lastState);
        }, this));
    };

    BasicCSS.prototype.activate = function (type, values, structure) {

        if (this.inPresetList) {
            this.exitPresetList(false);
        }

        this.underActivate = true;
        if (this.type && this.type !== type && typeof this.storage[this.type] !== 'undefined') {
            this.storage[this.type].detach();
        }

        var hasVisuals = false;
        this.defs = {
            font: [],
            style: []
        };
        this.type = type;
        for (var k in this.assets) {
            for (var i = 0; i < structure[k].length; i++) {
                this.defs[k][structure[k][i].name] = structure[k][i].def;
            }
            this.assets[k].load(values, structure[k]);
            hasVisuals = hasVisuals || this.assets[k].hasVisuals;
        }
        $('#n2-ss-layer-window').toggleClass('n2-ss-has-design-option', hasVisuals);
        if (!hasVisuals) {
            if ($('#n2-ss-layer-window .n2-sidebar-tab-switcher .n2-td[data-tab="style"]').hasClass('n2-active')) {
                $('#n2-ss-layer-window .n2-sidebar-tab-switcher .n2-td[data-tab="item"]').trigger('click');
            }
        }
        this.underActivate = false;
    };

    BasicCSS.prototype.deActivate = function () {

        if (this.inPresetList) {
            this.exitPresetList(false);
        }
    };

    BasicCSS.prototype.serialize = function () {
        var serialized = {};
        for (var k in this.assets) {
            serialized[k] = this.assets[k].serialize();
        }
        return serialized;
    };

    BasicCSS.prototype.unSerialize = function (serialized) {
        for (var k in this.assets) {
            this.assets[k].unSerialize(serialized[k]);
        }
    };

    BasicCSS.prototype.throttledUnSerialize = function (serialized) {
        this._addThrottledRenderTimeout($.proxy(this.unSerialize, this, serialized));
    };

    BasicCSS.prototype.saveAsNew = function (name) {
        if (typeof this.saveAsModal == 'undefined') {
            var that = this;
            this.saveAsModal = new N2Classes.NextendModal({
                zero: {
                    size: [
                        500,
                        220
                    ],
                    title: n2_('Save as'),
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Save as new') + '</a>'],
                    fn: {
                        show: function () {

                            var button = this.controls.find('.n2-button'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                }).append(this.createInput(n2_('Name'), 'n2-visual-name', 'width: 446px;')),
                                nameField = this.content.find('#n2-visual-name').focus();

                            button.on('click', $.proxy(function (e) {
                                e.preventDefault();
                                var name = nameField.val();
                                if (name == '') {
                                    N2Classes.Notification.error(n2_('Please fill the name field!'));
                                } else {
                                    N2Classes.AjaxHelper.ajax({
                                        type: "POST",
                                        url: N2Classes.AjaxHelper.makeAjaxUrl(that.ajaxUrl, {
                                            nextendaction: 'addVisual'
                                        }),
                                        data: {
                                            type: that.type,
                                            value: N2Classes.Base64.encode(JSON.stringify({
                                                name: name,
                                                data: that.serialize()
                                            }))
                                        },
                                        dataType: 'json'
                                    })
                                        .done($.proxy(function (response) {

                                            $.when(that.loadType()).done(function () {
                                                that.addVisual(response.data.visual).prependTo(that.storage[that.type]);
                                            });
                                            this.hide(e);
                                        }, this));
                                }
                            }, this));
                        }
                    }
                }
            }, false);
        }
        this.saveAsModal.show();
    };

    BasicCSS.prototype.loadType = function () {
        if (typeof this.storage[this.type] === 'undefined') {
            var deferred = $.Deferred(),
                parseVisuals = $.proxy(function (visuals) {
                    this.storage[this.type] = $('<ul class="n2-list n2-h4"></ul>');
                    for (var i = 0; i < visuals.length; i++) {
                        this.addVisual(visuals[i]);
                    }
                    deferred.resolve();
                }, this);
            if (typeof window[this.type] === 'undefined') {
                this.storage[this.type] = deferred;
                N2Classes.AjaxHelper.ajax({
                    type: "POST",
                    url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                        nextendaction: 'loadVisuals'
                    }),
                    data: {
                        type: this.type
                    },
                    dataType: 'json'
                }).done($.proxy(function (response) {
                    parseVisuals(response.data.visuals);
                }, this));
            } else {
                parseVisuals(window[this.type]);
            }
        }
        return this.storage[this.type];
    };

    /**
     * loadType must be called for the actual type to be able to add visual!!!
     * @param visual
     * @returns {*}
     */
    BasicCSS.prototype.addVisual = function (visual) {

        var decoded = visual.value;
        if (decoded[0] != '{') {
            decoded = N2Classes.Base64.decode(decoded)
        }

        var value = JSON.parse(decoded),
            row = $('<li><a href="#">' + value.name + '</a></li>').on({
                mouseenter: $.proxy(function (value, e) {
                    this.throttledUnSerialize(value.data);
                }, this, value),
                click: $.proxy(function (data, e) {
                    e.preventDefault();
                    this.exitPresetList(data, e);
                }, this, value.data)
            }).appendTo(this.storage[this.type]);

        if (visual.id > 10000) {
            var actions = $('<span class="n2-actions"></span>').appendTo(row);

            $('<div class="n2-button n2-button-icon n2-button-s" data-n2tip="Overwrite preset"><i class="n2-i n2-i-save n2-i-grey-opacity"></i></div>').on('click', $.proxy(function (visualID, name, e) {
                e.stopPropagation();
                N2Classes.AjaxHelper.ajax({
                    type: "POST",
                    url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                        nextendaction: 'changeVisual'
                    }),
                    data: {
                        visualId: visualID,
                        value: N2Classes.Base64.encode(JSON.stringify({
                            name: name,
                            data: this.lastState
                        })),
                        type: this.type
                    },
                    dataType: 'json'
                }).done($.proxy(function (response) {
                    row.replaceWith(this.addVisual(response.data.visual));
                }, this));
            }, this, visual.id, value.name)).appendTo(actions);

            $('<div class="n2-button n2-button-icon n2-button-s"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>').on('click', $.proxy(function (visualID, e) {
                e.preventDefault();
                e.stopPropagation();
                N2Classes.AjaxHelper.ajax({
                    type: "POST",
                    url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                        nextendaction: 'deleteVisual'
                    }),
                    data: {
                        visualId: visualID,
                        type: this.type
                    },
                    dataType: 'json'
                }).done($.proxy(function (response) {
                    row.remove();
                }, this));
            }, this, visual.id)).appendTo(actions);

            nextend.tooltip.add(actions);
        }
        return row;
    };

    BasicCSS.prototype.exitPresetList = function (data, e) {
        if (this.throttleSetTimeout) {
            clearTimeout(this.throttleSetTimeout);
        }

        this.$presets.off('mouseleave');

        if (data) {
            this.inPresetList = false;
            this.unSerialize(data);
        } else {
            this.unSerialize(this.lastState);
        }
        this.$container.removeClass('n2-basiccss-show-preset-list');
        this.inPresetList = false;

    };

    BasicCSS.prototype._addThrottledRenderTimeout = function (cb) {
        if (this.throttleSetTimeout) {
            clearTimeout(this.throttleSetTimeout);
        }

        this.throttleSetTimeout = setTimeout(cb, 100);
    };

    BasicCSS.prototype._addThrottledExitTimeout = function (cb) {
        if (this.throttleExitTimeout) {
            clearTimeout(this.throttleExitTimeout);
        }

        this.throttleExitTimeout = setTimeout(cb, 100);
    };

    return BasicCSS;

});
N2D('FormElementCheckbox', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param values
     * @constructor
     */
    function FormElementCheckbox(id, values) {
        this.separator = '||';

        this.element = $('#' + id);

        this.values = values;

        this.checkboxes = this.element.parent().find('.n2-checkbox-option');

        this.states = this.element.val().split(this.separator);

        for (var i = 0; i < this.checkboxes.length; i++) {
            if (typeof this.states[i] === 'undefined' || this.states[i] != this.values[i]) {
                this.states[i] = '';
            }

            this.checkboxes.eq(i).on('click', $.proxy(this.switchCheckbox, this, i));
        }

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementCheckbox.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementCheckbox.prototype.constructor = FormElementCheckbox;


    FormElementCheckbox.prototype.switchCheckbox = function (i) {
        if (this.states[i] == this.values[i]) {
            this.states[i] = '';
            this.setSelected(i, 0);
        } else {
            this.states[i] = this.values[i];
            this.setSelected(i, 1);
        }
        this.element.val(this.states.join(this.separator));

        this.triggerOutsideChange();
    };

    FormElementCheckbox.prototype.insideChange = function (values) {

        var states = values.split(this.separator);

        for (var i = 0; i < this.checkboxes.length; i++) {
            if (typeof states[i] === 'undefined' || states[i] != this.values[i]) {
                this.states[i] = '';
                this.setSelected(i, 0);
            } else {
                this.states[i] = this.values[i];
                this.setSelected(i, 1);
            }

        }

        this.element.val(this.states.join(this.separator));

        this.triggerInsideChange();
    };

    FormElementCheckbox.prototype.setSelected = function (i, state) {
        if (state) {
            this.checkboxes.eq(i)
                .addClass('n2-active');
        } else {
            this.checkboxes.eq(i)
                .removeClass('n2-active');
        }
    };


    return FormElementCheckbox;

});
N2D('FormElementColor', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param alpha
     * @constructor
     */
    function FormElementColor(id, alpha) {

        this.element = $('#' + id);

        if (alpha == 1) {
            this.alpha = true;
        } else {
            this.alpha = false;
        }
        this.element.off('change')
            .n2spectrum({
                showAlpha: this.alpha,
                preferredFormat: (this.alpha == 1 ? "hex8" : "hex6"),
                showInput: false,
                showButtons: false,
                move: $.proxy(this.onMove, this),
                showSelectionPalette: true,
                showPalette: true,
                maxSelectionSize: 6,
                localStorageKey: 'color',
                palette: [
                    ['000000', '55aa39', '357cbd', 'bb4a28', '8757b2', '000000CC'],
                    ['81898d', '5cba3c', '4594e1', 'd85935', '9e74c2', '00000080'],
                    ['ced3d5', '27ae60', '01add3', 'e79d19', 'e264af', 'FFFFFFCC'],
                    ['ffffff', '2ecc71', '00c1c4', 'ecc31f', 'ec87c0', 'FFFFFF80']
                ]
            })
            .on('change', $.proxy(this.onChange, this));

        this.text = this.element.data('field');

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    };

    FormElementColor.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementColor.prototype.constructor = FormElementColor;

    FormElementColor.prototype.onMove = function () {
        this.element.val(this.getCurrent());
        this.triggerOutsideChange();
    };

    FormElementColor.prototype.onChange = function (e) {
        var current = this.getCurrent(),
            value = this.element.val();
        if (current != value) {
            if (value.length > 0 && value.charAt(0) != '{') {
                this.element.n2spectrum("set", value);
            } else if (value.length === 0) {
                // If the field left blank, we need to fix it
                value = (this.alpha == 1 ? "00000000" : "000000");
                this.element.val(value);
                this.element.n2spectrum("set", value);
            }

            this.triggerInsideChange();
            this.triggerOutsideChange();
        }
        e.stopImmediatePropagation();
    };

    FormElementColor.prototype.insideChange = function (value) {
        this.element.val(value);
        this.element.n2spectrum("set", value);

        this.triggerInsideChange();
    };

    FormElementColor.prototype.getCurrent = function () {
        if (this.alpha) {
            return this.element.n2spectrum("get").toHexString8();
        }
        return this.element.n2spectrum("get").toHexString(true);
    };

    return FormElementColor;

});
N2D('FormElementDevice', ['FormElementOnoff'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementDevice(id) {
        N2Classes.FormElementOnoff.prototype.constructor.apply(this, arguments);
    }

    FormElementDevice.prototype = Object.create(N2Classes.FormElementOnoff.prototype);
    FormElementDevice.prototype.constructor = FormElementDevice;

    FormElementDevice.prototype.detach = function () {
        this.onoff.detach();
    };

    FormElementDevice.prototype.setSelected = function (state) {
        if (state) {
            this.onoff.addClass('n2-active');
        } else {
            this.onoff.removeClass('n2-active');
        }
    };

    return FormElementDevice;
});
N2D('FormElementDevices', ['FormElementDevice'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param values
     * @constructor
     */
    function FormElementDevices(id, values) {

        this.$el = $('#' + id).data('field', this);
        this.fields = {};
        for (var i = 0; i < values.length; i++) {
            this.fields[values[i]] = new N2Classes.FormElementDevice(id + '-' + values[i]);
        }
    }

    FormElementDevices.prototype.setAvailableDevices = function (devices) {
        for (var k in devices) {
            var field = this.fields[k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()];
            if (!devices[k]) {
                field.detach();
            }
        }
        this.$el.children().first().addClass('n2-first');
        this.$el.children().last().addClass('n2-last');
    };

    return FormElementDevices;
});
N2D('FormElementFolders', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param parameters
     * @constructor
     */
    function FormElementFolders(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');

        this.parameters = parameters;

        this.editButton = $('#' + id + '_edit')
            .on('click', $.proxy(this.edit, this));

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }

    FormElementFolders.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementFolders.prototype.constructor = FormElementFolders;

    FormElementFolders.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementFolders.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementFolders.prototype.open = function (e) {
        e.preventDefault();
        nextend.imageHelper.openFoldersLightbox($.proxy(this.val, this));
    };

    return FormElementFolders;
});
N2D('FormElementFont', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param parameters
     * @constructor
     */
    function FormElementFont(id, parameters) {
        this.element = $('#' + id);

        this.parameters = parameters;

        this.defaultSetId = parameters.set;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        nextend.fontManager.$.on('visualDelete', $.proxy(this.fontDeleted, this));

        this.updateName(this.element.val());

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }

    FormElementFont.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementFont.prototype.constructor = FormElementFont;


    FormElementFont.prototype.getLabel = function () {
        return this.parameters.label;
    };

    FormElementFont.prototype.show = function (e) {
        e.preventDefault();
        if (this.parameters.style != '') {
            nextend.fontManager.setConnectedStyle(this.parameters.style);
        }
        if (this.parameters.style2 != '') {
            nextend.fontManager.setConnectedStyle2(this.parameters.style2);
        }
        if (this.defaultSetId) {
            nextend.fontManager.changeSetById(this.defaultSetId);
        }
        nextend.fontManager.show(this.element.val(), $.proxy(this.save, this), {
            previewMode: this.parameters.previewmode,
            previewHTML: this.parameters.preview
        });
    };

    FormElementFont.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementFont.prototype.save = function (e, value) {

        nextend.fontManager.addVisualUsage(this.parameters.previewmode, value, window.nextend.pre);

        this.val(value);
    };

    FormElementFont.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    FormElementFont.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    FormElementFont.prototype.updateName = function (value) {
        $.when(nextend.fontManager.getVisual(value))
            .done($.proxy(function (font) {
                this.name.val(font.name);
            }, this));
    };
    FormElementFont.prototype.fontDeleted = function (e, id) {
        if (id == this.element.val()) {
            this.insideChange('');
        }
    };

    FormElementFont.prototype.renderFont = function () {
        var font = this.element.val();
        nextend.fontManager.addVisualUsage(this.parameters.previewmode, font, '');
        return nextend.fontManager.getClass(font, this.parameters.previewmode);
    };

    return FormElementFont;
});
N2D('FormElementIcon2Manager', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementIcon2Manager(id) {
        this.element = $('#' + id);
        this.button = $('#' + id + '_edit').on('click', $.proxy(this.openModal, this));

        this.preview = this.element.parent().find('.n2-form-element-preview').on('click', $.proxy(this.openModal, this));

        this.element.on('nextendChange', $.proxy(this.makePreview, this));


        N2Classes.FormElement.prototype.constructor.apply(this, arguments);

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    }

    FormElementIcon2Manager.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementIcon2Manager.prototype.constructor = FormElementIcon2Manager;

    FormElementIcon2Manager.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementIcon2Manager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    FormElementIcon2Manager.prototype.openModal = function (e) {
        if (e) e.preventDefault();
        N2Classes.Icons.showModal($.proxy(this.setIcon, this), this.element.val());
    };

    FormElementIcon2Manager.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementIcon2Manager.prototype.setIcon = function (value) {
        this.val(value);
    };

    FormElementIcon2Manager.prototype.makePreview = function () {
        var iconData = N2Classes.Icons.render(this.element.val());
        if (iconData) {
            this.preview.html('<i class="n2i ' + iconData.class + '">' + iconData.ligature + '</i>');
        } else {
            this.preview.html('');
        }
    };

    FormElementIcon2Manager.prototype.focus = function (shouldOpen) {
        if (shouldOpen) {
            this.openModal();
        }
    };


    return FormElementIcon2Manager;
});
N2D('FormElementIconManager', ['FormElement'], function ($, undefined) {
    var modal = null,
        callback = function () {
        };

    function getIconModal() {
        if (!modal) {
            var content = '';

            modal = new N2Classes.NextendModal({
                zero: {
                    size: [
                        1200,
                        600
                    ],
                    title: 'Icons',
                    back: false,
                    close: true,
                    content: content,
                    fn: {
                        show: function () {

                            var icons = this.content.find('.n2-icon');
                            icons.on('click', $.proxy(function (e) {
                                var node = $(e.currentTarget).clone(),
                                    svg = node.find('svg');

                                if (svg[0].hasChildNodes()) {
                                    var children = svg[0].childNodes;
                                    for (var i = 0; i < children.length; i++) {
                                        children[i].setAttribute("data-style", "{style}");
                                    }
                                }
                                callback(node.html());
                                this.hide(e);
                            }, this));
                        }
                    }
                }
            }, false);
            modal.setCustomClass('n2-icons-modal');
        }
        return modal;
    }

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementIconManager(id) {
        this.element = $('#' + id);
        this.button = $('#' + id + '_edit').on('click', $.proxy(this.openModal, this));

        this.preview = this.element.parent().find('img').on('click', $.proxy(this.openModal, this));

        this.element.on('nextendChange', $.proxy(this.makePreview, this));


        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementIconManager.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementIconManager.prototype.constructor = FormElementIconManager;

    FormElementIconManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    FormElementIconManager.prototype.openModal = function (e) {
        if (e) e.preventDefault();
        callback = $.proxy(this.setIcon, this);
        getIconModal().show();
    };

    FormElementIconManager.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementIconManager.prototype.setIcon = function (svg) {
        this.val(svg);
    };

    FormElementIconManager.prototype.makePreview = function () {
        this.preview.attr('src', 'data:image/svg+xml;base64,' + N2Classes.Base64.encode(this.element.val()));
    };

    FormElementIconManager.prototype.focus = function (shouldOpen) {
        if (shouldOpen) {
            this.openModal();
        }
    };

    function LZWDecompress(compressed) {
        "use strict";
        // Build the dictionary.
        var i,
            dictionary = [],
            w,
            result,
            k,
            entry = "",
            dictSize = 256;
        for (i = 0; i < 256; i += 1) {
            dictionary[i] = String.fromCharCode(i);
        }

        w = String.fromCharCode(compressed[0]);
        result = w;
        for (i = 1; i < compressed.length; i += 1) {
            k = compressed[i];
            if (dictionary[k]) {
                entry = dictionary[k];
            } else {
                if (k === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }

            result += entry;

            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);

            w = entry;
        }
        return result;
    }

    return FormElementIconManager;


});
N2D('FormElementImage', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param parameters
     * @constructor
     */
    function FormElementImage(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');
        this.field.connectedField = this;

        this.parameters = parameters;

        this.preview = $('#' + id + '_preview')
            .on('click', $.proxy(this.open, this));

        this.element.on('nextendChange', $.proxy(this.makePreview, this));

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    }


    FormElementImage.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementImage.prototype.constructor = FormElementImage;

    FormElementImage.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementImage.prototype.val = function (value, meta) {
        meta = $.extend({alt: false}, meta);
        if (meta.alt && meta.alt !== '' && this.parameters.alt && this.parameters.alt !== '') {
            $('#' + this.parameters.alt).val(meta.alt).trigger('change');
        }
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementImage.prototype.makePreview = function () {
        var image = this.element.val();
        if (image.substr(0, 1) === '{') {
            this.preview.css('background-image', '');
        } else {
            this.preview.css('background-image', 'url(' + nextend.imageHelper.fixed(image) + ')');
        }
    };

    FormElementImage.prototype.open = function (e) {
        if (e) {
            e.preventDefault();
        }
        nextend.imageHelper.openLightbox($.proxy(this.val, this));
    };

    FormElementImage.prototype.focus = function (shouldOpen) {
        if (shouldOpen) {
            this.open();
        }
    };

    return FormElementImage;
});
N2D('FormElementImageManager', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param parameters
     * @constructor
     */
    function FormElementImageManager(id, parameters) {
        this.element = $('#' + id);
        $('#' + id + '_manage').on('click', $.proxy(this.show, this));

        this.parameters = parameters;
        this.imageField = this.element.data('field');

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementImageManager.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementImageManager.prototype.constructor = FormElementImageManager;


    FormElementImageManager.prototype.show = function (e) {
        e.preventDefault();
        nextend.imageManager.show(this.element.val(), $.proxy(this.save, this));
    };

    FormElementImageManager.prototype.save = function () {

    };

    FormElementImageManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    return FormElementImageManager;

});
N2D('FormElementList', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param multiple
     * @param relatedFields
     * @constructor
     */
    function FormElementList(id, multiple, relatedFields, relatedValueFields) {

        this.separator = '||';

        this.element = $('#' + id).on('change', $.proxy(this.onHiddenChange, this));

        this.select = $('#' + id + '_select').on('change', $.proxy(this.onChange, this));

        this.multiple = multiple;

        this.relatedFields = false;
        if (relatedFields !== undefined && relatedFields.length) {
            this.relatedFields = $('');
            for (var i = 0; i < relatedFields.length; i++) {
                this.relatedFields = this.relatedFields.add($('[data-field="' + relatedFields[i] + '"]'));
            }

            this.relatedFields.toggleClass('n2-hidden', this.isOff(this.element.val()));
        }

        this.relatedValueFields = false;
        if (relatedValueFields !== undefined && relatedValueFields.length) {
            var value = this.element.val();
            this.relatedValueFields = $('');
            for (var i = 0; i < relatedValueFields.length; i++) {
                var $field = $('[data-field="' + relatedValueFields[i].field + '"]')
                    .data('show-values', relatedValueFields[i].values);

                $field.toggleClass('n2-hidden', $.inArray(value, relatedValueFields[i].values) === -1);

                this.relatedValueFields = this.relatedValueFields.add($field);
            }

        }

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementList.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementList.prototype.constructor = FormElementList;

    FormElementList.prototype.onHiddenChange = function () {
        var value = this.element.val();
        if (value && value != this.select.val()) {
            this.insideChange(value);
        }
    };

    FormElementList.prototype.onChange = function () {
        var value = this.select.val();
        if (value !== null && typeof value === 'object') {
            value = value.join(this.separator);
        }
        this.setHiddenValue(value);

        this.triggerOutsideChange();
    };

    FormElementList.prototype.insideChange = function (value) {
        if (typeof value === 'object') {
            this.select.val(value.split(this.separator));
        } else {
            this.select.val(value);
        }
        this.setHiddenValue(value);
        this.select.val(value);

        this.triggerInsideChange();
    };

    FormElementList.prototype.setHiddenValue = function (value) {
        this.element.val(value);

        if (this.relatedFields) {
            this.relatedFields.toggleClass('n2-hidden', this.isOff(value));
        }

        if (this.relatedValueFields) {
            this.relatedValueFields.each(function () {
                var $el = $(this);
                $el.toggleClass('n2-hidden', $.inArray(value, $el.data('show-values')) === -1);
            });
        }
    };

    FormElementList.prototype.isOff = function (value) {
        return value == '' || value == '0' || value == 'off';
    };

    return FormElementList;

});

N2D('FormElementMarginPadding', ['FormElementMixed'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param elements
     * @param separator
     * @constructor
     */
    function FormElementMarginPadding(id, elements, separator) {
        this.linkedValues = false;

        N2Classes.FormElementMixed.prototype.constructor.apply(this, arguments);

        this.$field = this.element.parent();

        this.$field.find('.n2-text-sub-label').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.linkedValues = !this.linkedValues;

            this.$field.toggleClass('n2-values-linked', this.linkedValues);

            if (this.linkedValues) {
                this.elements[0].trigger('change');
            }
        }, this));
    }


    FormElementMarginPadding.prototype = Object.create(N2Classes.FormElementMixed.prototype);
    FormElementMarginPadding.prototype.constructor = FormElementMarginPadding;

    FormElementMarginPadding.prototype.onFieldChange = function () {
        if (this.linkedValues) {
            var value = this.elements[0].val();
            for (var i = 1; i < 4; i++) {
                this.elements[i].data('field').insideChange(value);
            }
        }

        this.element.val(this.getValue());
        this.triggerOutsideChange();
    };

    FormElementMarginPadding.prototype.insideChange = function (value) {
        N2Classes.FormElementMixed.prototype.insideChange.apply(this, arguments);

        this.linkedValues = true;
        var value = this.elements[0].val();
        for (var i = 1; i < 4; i++) {
            if (value != this.elements[i].val()) {
                this.linkedValues = false;
                break;
            }
        }

        this.$field.toggleClass('n2-values-linked', this.linkedValues);
    };

    return FormElementMarginPadding;
});




N2D('FormElementMixed', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param elements
     * @param separator
     * @constructor
     */
    function FormElementMixed(id, elements, separator) {

        this.element = $('#' + id);

        this.elements = [];
        for (var i = 0; i < elements.length; i++) {
            this.elements.push($('#' + elements[i])
                .on('outsideChange', $.proxy(this.onFieldChange, this)));
        }

        this.separator = separator;

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementMixed.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementMixed.prototype.constructor = FormElementMixed;


    FormElementMixed.prototype.onFieldChange = function () {
        this.element.val(this.getValue());

        this.triggerOutsideChange();
    };

    FormElementMixed.prototype.insideChange = function (value) {
        this.element.val(value);

        var values = value.split(this.separator);

        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].data('field').insideChange(values[i]);
        }

        this.triggerInsideChange();
    };

    FormElementMixed.prototype.getValue = function () {
        var values = [];
        for (var i = 0; i < this.elements.length; i++) {
            values.push(this.elements[i].val());
        }

        return values.join(this.separator);
    };

    return FormElementMixed;

});
N2D('FormElementNumberSlider', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param properties
     * @constructor
     */
    function FormElementNumberSlider(id, properties) {
        this.localChange = false;
        this.element = $('#' + id).data('autocomplete', this);
        var $parent = this.element.parent().on({
            'mouseenter.n2slider': $.proxy(this.startSlider, this, properties)
        });
        var $units = $parent.siblings('.n2-form-element-units').find('> input');
        if (properties.units && $units.length) {
            var units = properties.units;
            $units.on('nextendChange', $.proxy(function () {
                properties.min = units[$units.val() + 'Min'];
                properties.max = units[$units.val() + 'SliderMax'];
                if (this.slider) {
                    this.slider.nUISlider("option", "min", properties.min);
                    this.slider.nUISlider("option", "max", properties.max);
                }
            }, this));
        }
    }

    FormElementNumberSlider.prototype.startSlider = function (properties, e) {
        this.element.parent().off('.n2slider');
        if (!this.slider) {
            this.slider = $('<div></div>')
                .appendTo($('<div class="nui-slider-container"></div>').insertAfter(this.element))
                .removeAttr('slide').prop('slide', false).nUISlider($.extend({
                    start: $.proxy(function () {
                        this.element.parent().addClass('n2-active');
                    }, this),
                    stop: $.proxy(function () {
                        this.element.parent().removeClass('n2-active');
                    }, this),
                    slide: $.proxy(function (e, ui) {
                        this.localChange = true;
                        this.element.val(ui.value).trigger('change');
                        this.localChange = false;
                    }, this)
                }, properties));

            if (typeof this.slider[0].slide !== 'undefined') {
                this.slider[0].slide = null;
            }

            this.element.on('nextendChange', $.proxy(function () {
                if (!this.localChange) {
                    var val = this.element.val();
                    if (val == parseFloat(val)) {
                        this.slider.nUISlider("option", 'value', parseFloat(this.element.val()));
                    }
                }
            }, this));
        }
        this.slider.nUISlider("option", 'value', parseFloat(this.element.val()));
    };

    return FormElementNumberSlider;
});
N2D('FormElementNumber', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param min
     * @param max
     * @param units
     * @constructor
     */
    function FormElementNumber(id, min, max, units) {
        this.min = min;
        this.max = max;

        this.element = $('#' + id).on({
            focus: $.proxy(this._focus, this),
            blur: $.proxy(this.blur, this),
            change: $.proxy(this.change, this)
        });
        this.parent = this.element.parent();

        var $units = this.parent.siblings('.n2-form-element-units').find('> input');
        if (units && $units.length) {
            $units.on('nextendChange', $.proxy(function () {
                this.min = units[$units.val() + 'Min'];
                this.max = units[$units.val() + 'Max'];
            }, this));
        }

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementNumber.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementNumber.prototype.constructor = FormElementNumber;


    FormElementNumber.prototype._focus = function () {
        this.parent.addClass('focus');

        this.element.on('keypress.n2-text', $.proxy(function (e) {
            if (e.which == 13) {
                this.element.off('keypress.n2-text');
                this.element.trigger('blur');
            }
        }, this));
    };

    FormElementNumber.prototype.blur = function () {
        this.parent.removeClass('focus');
    };

    FormElementNumber.prototype.change = function () {
        var validated = this.validate(this.element.val());
        if (validated === true) {
            this.triggerOutsideChange();
        } else {
            this.element.val(validated).trigger('change');
        }
    };

    FormElementNumber.prototype.insideChange = function (value) {
        var validated = this.validate(value);
        if (validated === true) {
            this.element.val(value);
        } else {
            this.element.val(validated);
        }

        this.triggerInsideChange();
    };

    FormElementNumber.prototype.validate = function (value) {
        var validatedValue = parseFloat(value);
        if (isNaN(validatedValue)) {
            validatedValue = 0;
        }
        validatedValue = Math.max(this.min, Math.min(this.max, validatedValue));
        if (validatedValue != value) {
            return validatedValue;
        }
        return true;
    };

    return FormElementNumber;
});
N2D('FormElementOnoff', ['FormElement'], function ($, undefined) {

    /**
     * @typedef {{relatedFields: array, relatedAttribute: string}} options
     */
    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param isEnable
     * @param {options} options
     * @constructor
     */
    function FormElementOnoff(id, isEnable, options) {
        this.element = $('#' + id);

        this.isEnable = !!isEnable;
        this.relatedFields = $('');
        if (options !== undefined) {
            if (options.relatedFields !== undefined && options.relatedFields.length) {
                for (var i = 0; i < options.relatedFields.length; i++) {
                    this.relatedFields = this.relatedFields.add($('[data-field="' + options.relatedFields[i] + '"]'));
                }
            }

            if (options.relatedAttribute !== undefined && options.relatedAttribute !== '') {
                var $body = $('#n2-admin');
                $body.attr('data-' + options.relatedAttribute, this.element.val());
                this.element.on('nextendChange', $.proxy(function () {
                    $body.attr('data-' + options.relatedAttribute, this.element.val());
                }, this))
            }
        }

        this.onoff = this.element.parent()
            .on('click', $.proxy(this.switch, this));

        if (!this.onoff.hasClass('n2-onoff-on')) {
            this.relatedFields.toggleClass('n2-hidden', this.isEnable);
        } else {
            this.relatedFields.toggleClass('n2-hidden', !this.isEnable);
        }

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementOnoff.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementOnoff.prototype.constructor = FormElementOnoff;


    FormElementOnoff.prototype.switch = function () {
        var value = parseInt(this.element.val());
        if (value) {
            value = 0;
        } else {
            value = 1;
        }
        this.element.val(value);
        this.setSelected(value);

        this.triggerOutsideChange();
    };

    FormElementOnoff.prototype.insideChange = function (value) {
        value = parseInt(value);
        this.element.val(value);
        this.setSelected(value);

        this.triggerInsideChange();
    };

    FormElementOnoff.prototype.setSelected = function (state) {
        if (state) {
            this.onoff.addClass('n2-onoff-on');
            this.relatedFields.toggleClass('n2-hidden', !this.isEnable);
        } else {
            this.onoff.removeClass('n2-onoff-on');
            this.relatedFields.toggleClass('n2-hidden', this.isEnable);
        }
    };

    return FormElementOnoff;

});

N2D('FormElementRadio', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param values
     * @constructor
     */
    function FormElementRadio(id, values, relatedFields) {
        this.element = $('#' + id);

        this.values = values;
        this.relatedFields = false;
        if (relatedFields !== undefined && relatedFields.length) {
            this.relatedFields = $('');
            for (var i = 0; i < relatedFields.length; i++) {
                this.relatedFields = this.relatedFields.add($('[data-field="' + relatedFields[i] + '"]'));
            }

            this.relatedFields.toggleClass('n2-hidden', this.isOff(this.element.val()));
        }

        this.parent = this.element.parent();

        this.options = this.parent.find('.n2-radio-option');

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.click, this));
        }

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }

    FormElementRadio.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementRadio.prototype.constructor = FormElementRadio;

    FormElementRadio.prototype.click = function (e) {
        this.changeSelectedIndex(this.options.index(e.currentTarget));
    };

    FormElementRadio.prototype.changeSelectedIndex = function (index) {
        var value = this.values[index];

        this.setValue(value);

        this.setSelected(index);

        this.triggerOutsideChange();
    };

    FormElementRadio.prototype.insideChange = function (value, option) {
        var index = $.inArray(value, this.values);
        if (index == '-1') {
            index = this.partialSearch(value);
        }

        if (index == '-1' && typeof option !== 'undefined') {
            index = this.addOption(value, option);
        }

        if (index != '-1') {
            this.setValue(this.values[index]);
            this.setSelected(index);

            this.triggerInsideChange();
        } else {
            // It will reset the state if the preferred value not available
            this.options.eq(0).trigger('click');
        }
    };

    FormElementRadio.prototype.setSelected = function (index) {
        this.options.removeClass('n2-active');
        this.options.eq(index).addClass('n2-active');
    };

    FormElementRadio.prototype.partialSearch = function (text) {
        text = text.replace(/^.*[\\\/]/, '');
        for (var i = 0; i < this.values.length; i++) {
            if (this.values[i].indexOf(text) != -1) return i;
        }
        return -1;
    };

    FormElementRadio.prototype.addOption = function (value, option) {
        var i = this.values.push(value) - 1;
        option.appendTo(this.parent)
            .on('click', $.proxy(this.click, this));
        this.options = this.options.add(option);
        return i;
    };

    FormElementRadio.prototype.addTabOption = function (value, label) {
        var i = this.values.push(value) - 1;
        var option = $('<div class="n2-radio-option n2-h4 n2-last">' + label + '</div>')
            .insertAfter(this.options.last().removeClass('n2-last'))
            .on('click', $.proxy(this.click, this));
        this.options = this.options.add(option);
        return i;
    };

    FormElementRadio.prototype.removeTabOption = function (value) {
        var i = $.inArray(value, this.values);
        var option = this.options.eq(i);
        this.options = this.options.not(option);
        option.remove();
        if (i == 0) {
            this.options.eq(0).addClass('n2-first');
        }
        if (i == this.options.length) {
            this.options.eq(this.options.length - 1).addClass('n2-last');
        }

        this.values.splice(i, 1);
    };

    FormElementRadio.prototype.moveTab = function (originalIndex, targetIndex) {

    };

    FormElementRadio.prototype.setValue = function (value) {
        this.element.val(value);

        if (this.relatedFields) {
            this.relatedFields.toggleClass('n2-hidden', this.isOff(value));
        }
    };

    FormElementRadio.prototype.isOff = function (value) {
        return value === '' || value === '0' || value === 0 || value === 'off';
    };

    return FormElementRadio;

});
N2D('FormRelatedFields', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param relatedFields
     * @constructor
     */
    function FormRelatedFields(id, relatedFields) {

        this.$field = $('#' + id);
        this.field = this.$field.data('field');

        if (this.field && this.field.relatedFieldsOff !== undefined) {
            this.fieldChanged = this.fieldChangedCallback;
        } else {
            this.fieldChanged = this.fieldChangedSimple;
        }

        this.$field.on('nextendChange', $.proxy(this.fieldChanged, this))

        this.relatedFields = $('');
        for (var i = 0; i < relatedFields.length; i++) {
            this.relatedFields = this.relatedFields.add($('[data-field="' + relatedFields[i] + '"]'));
        }

        this.fieldChanged();
    }

    FormRelatedFields.prototype.fieldChangedSimple = function () {
        var value = this.$field.val();

        this.relatedFields.toggleClass('n2-hidden', value === '');
    };

    FormRelatedFields.prototype.fieldChangedCallback = function () {
        this.relatedFields.toggleClass('n2-hidden', this.field.relatedFieldsOff());
    };

    return FormRelatedFields;
});

N2D('FormElementRichText', ['FormElementText'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementRichText(id) {

        N2Classes.FormElementText.prototype.constructor.apply(this, arguments);

        this.parent.find('.n2-textarea-rich-bold').on('click', $.proxy(this.bold, this));
        this.parent.find('.n2-textarea-rich-italic').on('click', $.proxy(this.italic, this));
        this.parent.find('.n2-textarea-rich-link').on('click', $.proxy(this.link, this));

    }


    FormElementRichText.prototype = Object.create(N2Classes.FormElementText.prototype);
    FormElementRichText.prototype.constructor = FormElementRichText;


    FormElementRichText.prototype.bold = function () {
        this.wrapText('<b>', '</b>');
    };

    FormElementRichText.prototype.italic = function () {
        this.wrapText('<i>', '</i>');
    };

    FormElementRichText.prototype.link = function () {
        this.wrapText('<a href="#">', '</a>');
    };

    FormElementRichText.prototype.list = function () {
        this.wrapText('', "\n<ul>\n<li>#1 Item</li>\n<li>#2 Item</li>\n</ul>\n");
    };


    FormElementRichText.prototype.wrapText = function (openTag, closeTag) {
        var textArea = this.element;
        var len = textArea.val().length;
        var start = textArea[0].selectionStart;
        var end = textArea[0].selectionEnd;
        var selectedText = textArea.val().substring(start, end);
        var replacement = openTag + selectedText + closeTag;
        textArea.val(textArea.val().substring(0, start) + replacement + textArea.val().substring(end, len));
        this.triggerOutsideChange();
        this.element.focus();
    };

    return FormElementRichText;
});
N2D('FormElementSkin', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param preId
     * @param skins
     * @param fixedMode
     * @constructor
     */
    function FormElementSkin(id, preId, skins, fixedMode) {
        this.element = $('#' + id);

        this.preId = preId;

        this.skins = skins;

        this.list = this.element.data('field');

        this.fixedMode = fixedMode;

        this.firstOption = this.list.select.find('option').eq(0);

        this.originalText = this.firstOption.text();

        this.element.on('nextendChange', $.proxy(this.onSkinSelect, this));

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementSkin.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementSkin.prototype.constructor = FormElementSkin;


    FormElementSkin.prototype.onSkinSelect = function () {
        var skin = this.element.val();
        if (skin != '0') {
            skin = this.skins[skin].settings;
            for (var k in skin) {
                if (skin.hasOwnProperty(k)) {
                    var el = $('#' + this.preId + k);
                    if (el.length) {
                        var field = el.data('field');
                        field.insideChange(skin[k]);
                    }
                }
            }

            if (!this.fixedMode) {
                this.changeFirstOptionText(n2_('Done'));
                this.list.insideChange('0');
                setTimeout($.proxy(this.changeFirstOptionText, this, this.originalText), 3000);
            }

        }
    };

    FormElementSkin.prototype.changeFirstOptionText = function (text) {
        this.firstOption.text(text);
    };

    FormElementSkin.prototype.insideChange = function (value) {
        this.element.val(value);
        this.list.select.val(value);
    };

    return FormElementSkin;
});

N2D('FormElementStyle', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param parameters
     * @constructor
     */
    function FormElementStyle(id, parameters) {
        this.element = $('#' + id);

        this.parameters = parameters;

        this.defaultSetId = parameters.set;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        nextend.styleManager.$.on('visualDelete', $.proxy(this.styleDeleted, this));

        this.updateName(this.element.val());
        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }

    FormElementStyle.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementStyle.prototype.constructor = FormElementStyle;

    FormElementStyle.prototype.getLabel = function () {
        return this.parameters.label;
    };

    FormElementStyle.prototype.show = function (e) {
        e.preventDefault();
        if (this.parameters.font != '') {
            nextend.styleManager.setConnectedFont(this.parameters.font);
        }
        if (this.parameters.font2 != '') {
            nextend.styleManager.setConnectedFont2(this.parameters.font2);
        }
        if (this.parameters.style2 != '') {
            nextend.styleManager.setConnectedStyle(this.parameters.style2);
        }
        if (this.defaultSetId) {
            nextend.styleManager.changeSetById(this.defaultSetId);
        }
        nextend.styleManager.show(this.element.val(), $.proxy(this.save, this), {
            previewMode: this.parameters.previewmode,
            previewHTML: this.parameters.preview
        });
    };

    FormElementStyle.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementStyle.prototype.save = function (e, value) {

        nextend.styleManager.addVisualUsage(this.parameters.previewmode, value, window.nextend.pre);

        this.val(value);
    };

    FormElementStyle.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    FormElementStyle.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    FormElementStyle.prototype.updateName = function (value) {
        $.when(nextend.styleManager.getVisual(value))
            .done($.proxy(function (style) {
                this.name.val(style.name);
            }, this));
    };
    FormElementStyle.prototype.styleDeleted = function (e, id) {
        if (id == this.element.val()) {
            this.insideChange('');
        }
    };
    FormElementStyle.prototype.renderStyle = function () {
        var style = this.element.val();
        nextend.styleManager.addVisualUsage(this.parameters.previewmode, style, '');
        return nextend.styleManager.getClass(style, this.parameters.previewmode);
    };

    return FormElementStyle;

});
N2D('FormElementSubform', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param ajaxUrl
     * @param target
     * @param tab
     * @param originalValue
     * @constructor
     */
    function FormElementSubform(id, ajaxUrl, target, tab, originalValue) {
        this.id = id;

        this.ajaxUrl = ajaxUrl;

        this.element = $('#' + id);

        this.target = $('#' + target);

        this.tab = tab;

        this.originalValue = originalValue;

        this.form = this.element.closest('form').data('form');

        this.list = this.element.data('field');

        this.element.on('nextendChange', $.proxy(this.loadSubform, this));

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementSubform.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementSubform.prototype.constructor = FormElementSubform;

    FormElementSubform.prototype.loadSubform = function () {
        var value = this.element.val();
        if (value == 'disabled') {
            this.target.html('');
        } else {
            var values = [];
            if (value == this.originalValue) {
                values = this.form.values;
            }

            var data = {
                values: values,
                value: value
            };

            N2Classes.AjaxHelper.ajax({
                type: "POST",
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl),
                data: data,
                dataType: 'json'
            }).done($.proxy(this.load, this));
        }
    };

    FormElementSubform.prototype.load = function (response) {
        this.target.html(response.data.html);
        eval(response.data.scripts);

        nextend.tooltip.add(this.target);
    };

    return FormElementSubform;
});

N2D('FormElementSubformImage', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param options
     * @constructor
     */
    function FormElementSubformImage(id, options) {

        this.element = $('#' + id);

        this.options = $('#' + options).find('.n2-subform-image-option');

        this.subform = this.element.data('field');

        this.active = this.getIndex(this.options.filter('.n2-active').get(0));

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.selectOption, this));
        }

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }

    FormElementSubformImage.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementSubformImage.prototype.constructor = FormElementSubformImage;


    FormElementSubformImage.prototype.selectOption = function (e) {
        var index = this.getIndex(e.currentTarget);
        if (index != this.active) {

            this.options.eq(index).addClass('n2-active');
            this.options.eq(this.active).removeClass('n2-active');

            this.active = index;

            var value = this.subform.list.select.find('option').eq(index).val();
            this.subform.list.insideChange(value);
        }
    };

    FormElementSubformImage.prototype.getIndex = function (option) {
        return $.inArray(option, this.options);
    };

    return FormElementSubformImage;
});
N2D('FormElementSwitcher', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param values
     * @constructor
     */
    function FormElementSwitcher(id, values) {

        this.element = $('#' + id);

        this.options = this.element.parent().find('.n2-switcher-unit');

        this.active = this.options.index(this.options.filter('.n2-active'));

        this.values = values;

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.switch, this, i));
        }

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }

    FormElementSwitcher.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementSwitcher.prototype.constructor = FormElementSwitcher;


    FormElementSwitcher.prototype.switch = function (i, e) {
        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerOutsideChange();
    };

    FormElementSwitcher.prototype.insideChange = function (value) {
        var i = $.inArray(value, this.values);

        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerInsideChange();
    };

    FormElementSwitcher.prototype.setSelected = function (i) {
        this.options.eq(this.active).removeClass('n2-active');
        this.options.eq(i).addClass('n2-active');
        this.active = i;
    };

    return FormElementSwitcher;
});

N2D('FormElementUnits', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param values
     * @constructor
     */
    function FormElementUnits(id, values) {

        this.element = $('#' + id);

        this.options = this.element.parent().find('.n2-element-unit');
        this.currentUnit = this.element.parent().find('.n2-element-current-unit');

        this.values = values;

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.switch, this, i));
        }

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }

    FormElementUnits.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementUnits.prototype.constructor = FormElementUnits;


    FormElementUnits.prototype.switch = function (i, e) {
        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerOutsideChange();
    };

    FormElementUnits.prototype.insideChange = function (value) {
        var i = $.inArray(value, this.values);

        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerInsideChange();
    };

    FormElementUnits.prototype.setSelected = function (i) {
        this.currentUnit.html(this.options.eq(i).html());
    };

    return FormElementUnits;
});

N2D('FormElementUrl', ['FormElement'], function ($, undefined) {

    var ajaxUrl = '',
        modal = null,
        cache = {},
        callback = function (url) {
        },
        lastValue = '';

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param parameters
     * @constructor
     */
    function FormElementUrl(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');

        this.parameters = parameters;

        ajaxUrl = this.parameters.url;

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    }

    FormElementUrl.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementUrl.prototype.constructor = FormElementUrl;

    FormElementUrl.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('#');
    };

    FormElementUrl.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementUrl.prototype.open = function (e) {
        e.preventDefault();
        callback = $.proxy(this.insert, this);
        lastValue = this.element.val();
        this.getModal().show();
    };

    FormElementUrl.prototype.insert = function (url) {
        this.val(url);
    };

    FormElementUrl.prototype.getModal = function () {
        if (!modal) {
            var getLinks = function (search) {
                if (typeof cache[search] == 'undefined') {
                    cache[search] = $.ajax({
                        type: "POST",
                        url: N2Classes.AjaxHelper.makeAjaxUrl(ajaxUrl),
                        data: {
                            keyword: search
                        },
                        dataType: 'json'
                    });
                }
                return cache[search];
            };

            var parameters = this.parameters;

            var links = {
                size: [
                    600,
                    500
                ],
                title: n2_('Link'),
                back: 'zero',
                close: true,
                content: '<div class="n2-form"></div>',
                fn: {
                    show: function () {

                        this.content.find('.n2-form').append(this.createInput(n2_('Keyword'), 'n2-links-keyword', 'width:546px;'));
                        var search = $('#n2-links-keyword'),
                            heading = this.createHeading('').appendTo(this.content),
                            result = this.createResult().appendTo(this.content),
                            searchString = '';

                        search.on('keyup', $.proxy(function () {
                            searchString = search.val();
                            getLinks(searchString).done($.proxy(function (r) {
                                if (search.val() == searchString) {
                                    var links = r.data;
                                    if (searchString == '') {
                                        heading.html(n2_('No search term specified. Showing recent items.'));
                                    } else {
                                        heading.html(n2_printf(n2_('Showing items match for "%s"'), searchString));
                                    }

                                    var data = [],
                                        modal = this;
                                    for (var i = 0; i < links.length; i++) {
                                        data.push([links[i].title, links[i].info, $('<div class="n2-button n2-button-normal n2-button-xs n2-radius-s n2-button-green n2-uc n2-h5">' + n2_('Select') + '</div>')
                                            .on('click', {permalink: links[i].link}, function (e) {
                                                callback(e.data.permalink);
                                                modal.hide();
                                            })]);
                                    }
                                    result.html('');
                                    this.createTable(data, ['width:100%;', '', '']).appendTo(this.createTableWrap().appendTo(result));
                                }
                            }, this));
                        }, this))
                            .trigger('keyup').focus();

                        this.content.append('<hr style="margin: 0 -20px;"/>');
                        var external = $('<div class="n2-input-button"><input placeholder="' + n2_("External url") + '" type="text" id="external-url" name="external-url" value="" /><a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_("Insert") + '</a></div>')
                                .css({
                                    display: 'block',
                                    textAlign: 'center'
                                })
                                .appendTo(this.content),
                            externalInput = external.find('input').val(lastValue);

                        external.find('.n2-button').on('click', function (e) {
                            e.preventDefault();
                            callback(externalInput.val());
                            modal.hide();
                        });
                    }
                }
            };
            links.back = false;
            modal = new N2Classes.NextendModal({
                zero: links
            }, false);
        
            modal.setCustomClass('n2-url-modal');
        }
        return modal;
    };

    return FormElementUrl;
});
/*! fixto - v0.5.0 - 2016-06-16
 * http://github.com/bbarakaci/fixto/*/

N2R('$', function ($) {
    // Start Computed Style. Please do not modify this module here. Modify it from its own repo. See address below.

    /*! Computed Style - v0.1.0 - 2012-07-19
     * https://github.com/bbarakaci/computed-style
     * Copyright (c) 2012 Burak Barakaci; Licensed MIT */
    var computedStyle = (function () {
        var computedStyle = {
            getAll: function (element) {
                return document.defaultView.getComputedStyle(element);
            },
            get: function (element, name) {
                return this.getAll(element)[name];
            },
            toFloat: function (value) {
                return parseFloat(value, 10) || 0;
            },
            getFloat: function (element, name) {
                return this.toFloat(this.get(element, name));
            },
            _getAllCurrentStyle: function (element) {
                return element.currentStyle;
            }
        };

        if (document.documentElement.currentStyle) {
            computedStyle.getAll = computedStyle._getAllCurrentStyle;
        }

        return computedStyle;

    }());

    // End Computed Style. Modify whatever you want to.

    var mimicNode = (function () {
        /*
         Class Mimic Node
         Dependency : Computed Style
         Tries to mimick a dom node taking his styles, dimensions. May go to his repo if gets mature.
         */

        function MimicNode(element) {
            this.element = element;
            this.replacer = document.createElement('div');
            this.replacer.style.visibility = 'hidden';
            this.hide();
            element.parentNode.insertBefore(this.replacer, element);
        }

        MimicNode.prototype = {
            replace: function () {
                var rst = this.replacer.style;
                var styles = computedStyle.getAll(this.element);

                // rst.width = computedStyle.width(this.element) + 'px';
                // rst.height = this.element.offsetHeight + 'px';

                // Setting offsetWidth
                rst.width = this._width();
                rst.height = this._height();

                // Adopt margins
                rst.marginTop = styles.marginTop;
                rst.marginBottom = styles.marginBottom;
                rst.marginLeft = styles.marginLeft;
                rst.marginRight = styles.marginRight;

                // Adopt positioning
                rst.cssFloat = styles.cssFloat;
                rst.styleFloat = styles.styleFloat; //ie8;
                rst.position = styles.position;
                rst.top = styles.top;
                rst.right = styles.right;
                rst.bottom = styles.bottom;
                rst.left = styles.left;
                // rst.borderStyle = styles.borderStyle;

                rst.display = styles.display;

            },

            hide: function () {
                this.replacer.style.display = 'none';
            },

            _width: function () {
                return this.element.getBoundingClientRect().width + 'px';
            },

            _widthOffset: function () {
                return this.element.offsetWidth + 'px';
            },

            _height: function () {
                return this.element.getBoundingClientRect().height + 'px';
            },

            _heightOffset: function () {
                return this.element.offsetHeight + 'px';
            },

            destroy: function () {
                $(this.replacer).remove();

                // set properties to null to break references
                for (var prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        this[prop] = null;
                    }
                }
            }
        };

        var bcr = document.documentElement.getBoundingClientRect();
        if (!bcr.width) {
            MimicNode.prototype._width = MimicNode.prototype._widthOffset;
            MimicNode.prototype._height = MimicNode.prototype._heightOffset;
        }

        return {
            MimicNode: MimicNode,
            computedStyle: computedStyle
        };
    }());

    // Class handles vendor prefixes
    function Prefix() {
        // Cached vendor will be stored when it is detected
        this._vendor = null;

        //this._dummy = document.createElement('div');
    }

    Prefix.prototype = {

        _vendors: {
            webkit: {cssPrefix: '-webkit-', jsPrefix: 'Webkit'},
            moz: {cssPrefix: '-moz-', jsPrefix: 'Moz'},
            ms: {cssPrefix: '-ms-', jsPrefix: 'ms'},
            opera: {cssPrefix: '-o-', jsPrefix: 'O'}
        },

        _prefixJsProperty: function (vendor, prop) {
            return vendor.jsPrefix + prop[0].toUpperCase() + prop.substr(1);
        },

        _prefixValue: function (vendor, value) {
            return vendor.cssPrefix + value;
        },

        _valueSupported: function (prop, value, dummy) {
            // IE8 will throw Illegal Argument when you attempt to set a not supported value.
            try {
                dummy.style[prop] = value;
                return dummy.style[prop] === value;
            }
            catch (er) {
                return false;
            }
        },

        /**
         * Returns true if the property is supported
         * @param {string} prop Property name
         * @returns {boolean}
         */
        propertySupported: function (prop) {
            // Supported property will return either inine style value or an empty string.
            // Undefined means property is not supported.
            return document.documentElement.style[prop] !== undefined;
        },

        /**
         * Returns prefixed property name for js usage
         * @param {string} prop Property name
         * @returns {string|null}
         */
        getJsProperty: function (prop) {
            // Try native property name first.
            if (this.propertySupported(prop)) {
                return prop;
            }

            // Prefix it if we know the vendor already
            if (this._vendor) {
                return this._prefixJsProperty(this._vendor, prop);
            }

            // We don't know the vendor, try all the possibilities
            var prefixed;
            for (var vendor in this._vendors) {
                prefixed = this._prefixJsProperty(this._vendors[vendor], prop);
                if (this.propertySupported(prefixed)) {
                    // Vendor detected. Cache it.
                    this._vendor = this._vendors[vendor];
                    return prefixed;
                }
            }

            // Nothing worked
            return null;
        },

        /**
         * Returns supported css value for css property. Could be used to check support or get prefixed value string.
         * @param {string} prop Property
         * @param {string} value Value name
         * @returns {string|null}
         */
        getCssValue: function (prop, value) {
            // Create dummy element to test value
            var dummy = document.createElement('div');

            // Get supported property name
            var jsProperty = this.getJsProperty(prop);

            // Try unprefixed value
            if (this._valueSupported(jsProperty, value, dummy)) {
                return value;
            }

            var prefixedValue;

            // If we know the vendor already try prefixed value
            if (this._vendor) {
                prefixedValue = this._prefixValue(this._vendor, value);
                if (this._valueSupported(jsProperty, prefixedValue, dummy)) {
                    return prefixedValue;
                }
            }

            // Try all vendors
            for (var vendor in this._vendors) {
                prefixedValue = this._prefixValue(this._vendors[vendor], value);
                if (this._valueSupported(jsProperty, prefixedValue, dummy)) {
                    // Vendor detected. Cache it.
                    this._vendor = this._vendors[vendor];
                    return prefixedValue;
                }
            }
            // No support for value
            return null;
        }
    };

    var prefix = new Prefix();

    // We will need this frequently. Lets have it as a global until we encapsulate properly.
    var transformJsProperty = prefix.getJsProperty('transform');

    // Will hold if browser creates a positioning context for fixed elements.
    var fixedPositioningContext;

    // Checks if browser creates a positioning context for fixed elements.
    // Transform rule will create a positioning context on browsers who follow the spec.
    // Ie for example will fix it according to documentElement
    // TODO: Other css rules also effects. perspective creates at chrome but not in firefox. transform-style preserve3d effects.
    function checkFixedPositioningContextSupport() {
        var support = false;
        var parent = document.createElement('div');
        var child = document.createElement('div');
        parent.appendChild(child);
        parent.style[transformJsProperty] = 'translate(0)';
        // Make sure there is space on top of parent
        parent.style.marginTop = '10px';
        parent.style.visibility = 'hidden';
        child.style.position = 'fixed';
        child.style.top = 0;
        document.body.appendChild(parent);
        var rect = child.getBoundingClientRect();
        // If offset top is greater than 0 meand transformed element created a positioning context.
        if (rect.top > 0) {
            support = true;
        }
        // Remove dummy content
        document.body.removeChild(parent);
        return support;
    }

    // It will return null if position sticky is not supported
    var nativeStickyValue = prefix.getCssValue('position', 'sticky');

    // It will return null if position fixed is not supported
    var fixedPositionValue = prefix.getCssValue('position', 'fixed');

    // Dirty business
    var ie = navigator.appName === 'Microsoft Internet Explorer';
    var ieversion;

    if (ie) {
        ieversion = parseFloat(navigator.appVersion.split("MSIE")[1]);
    }

    function FixTo(child, parent, options) {
        this.child = child;
        this._$child = $(child);
        this.parent = parent;
        this.options = {
            className: 'fixto-fixed',
            top: 0,
            mindViewport: false
        };
        this._setOptions(options);
    }

    FixTo.prototype = {
        // Returns the total outerHeight of the elements passed to mind option. Will return 0 if none.
        _mindtop: function () {
            var top = 0;
            if (this._$mind) {
                var el;
                var rect;
                var height;
                for (var i = 0, l = this._$mind.length; i < l; i++) {
                    el = this._$mind[i];
                    rect = el.getBoundingClientRect();
                    if (rect.height) {
                        top += rect.height;
                    }
                    else {
                        var styles = computedStyle.getAll(el);
                        top += el.offsetHeight + computedStyle.toFloat(styles.marginTop) + computedStyle.toFloat(styles.marginBottom);
                    }
                }
            }
            return top;
        },

        // Public method to stop the behaviour of this instance.
        stop: function () {
            this._stop();
            this._running = false;
        },

        // Public method starts the behaviour of this instance.
        start: function () {

            // Start only if it is not running not to attach event listeners multiple times.
            if (!this._running) {
                this._start();
                this._running = true;
            }
        },

        //Public method to destroy fixto behaviour
        destroy: function () {
            this.stop();

            this._destroy();

            // Remove jquery data from the element
            this._$child.removeData('fixto-instance');

            // set properties to null to break references
            for (var prop in this) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = null;
                }
            }
        },

        _setOptions: function (options) {
            $.extend(this.options, options);
            if (this.options.mind) {
                this._$mind = $(this.options.mind);
            }
            if (this.options.zIndex) {
                this.child.style.zIndex = this.options.zIndex;
            }
        },

        setOptions: function (options) {
            this._setOptions(options);
            this.refresh();
        },

        // Methods could be implemented by subclasses

        _stop: function () {

        },

        _start: function () {

        },

        _destroy: function () {

        },

        refresh: function () {

        }
    };

    // Class FixToContainer
    function FixToContainer(child, parent, options) {
        FixTo.call(this, child, parent, options);
        this._replacer = new mimicNode.MimicNode(child);
        this._ghostNode = this._replacer.replacer;

        this._saveStyles();

        this._saveViewportHeight();

        // Create anonymous functions and keep references to register and unregister events.
        this._proxied_onscroll = this._bind(this._onscroll, this);
        this._proxied_onresize = this._bind(this._onresize, this);

        this.start();
    }

    FixToContainer.prototype = new FixTo();

    $.extend(FixToContainer.prototype, {

        // Returns an anonymous function that will call the given function in the given context
        _bind: function (fn, context) {
            return function () {
                return fn.call(context);
            };
        },

        // at ie8 maybe only in vm window resize event fires everytime an element is resized.
        _toresize: ieversion === 8 ? document.documentElement : window,

        _onscroll: function _onscroll() {
            this._scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            this._parentBottom = (this.parent.offsetHeight + this._fullOffset('offsetTop', this.parent));

            if (this.options.mindBottomPadding !== false) {
                this._parentBottom -= computedStyle.getFloat(this.parent, 'paddingBottom');
            }

            if (!this.fixed && this._shouldFix()) {
                this._fix();
                this._adjust();
            } else {
                if (this._scrollTop > this._parentBottom || this._scrollTop < (this._fullOffset('offsetTop', this._ghostNode) - this.options.top - this._mindtop())) {
                    this._unfix();
                    return;
                }
                this._adjust();
            }
        },

        _shouldFix: function () {
            if (this._scrollTop < this._parentBottom && this._scrollTop > (this._fullOffset('offsetTop', this.child) - this.options.top - this._mindtop())) {
                if (this.options.mindViewport && !this._isViewportAvailable()) {
                    return false;
                }
                return true;
            }
        },

        _isViewportAvailable: function () {
            var childStyles = computedStyle.getAll(this.child);
            return this._viewportHeight > (this.child.offsetHeight + computedStyle.toFloat(childStyles.marginTop) + computedStyle.toFloat(childStyles.marginBottom));
        },

        _adjust: function _adjust() {
            var top = 0;
            var mindTop = this._mindtop();
            var diff = 0;
            var childStyles = computedStyle.getAll(this.child);
            var context = null;

            if (fixedPositioningContext) {
                // Get positioning context.
                context = this._getContext();
                if (context) {
                    // There is a positioning context. Top should be according to the context.
                    top = Math.abs(context.getBoundingClientRect().top);
                }
            }

            diff = (this._parentBottom - this._scrollTop) - (this.child.offsetHeight + computedStyle.toFloat(childStyles.marginBottom) + mindTop + this.options.top);

            if (diff > 0) {
                diff = 0;
            }
            if (this.fixed) {
                this.child.style.top = (diff + mindTop + top + this.options.top) - computedStyle.toFloat(childStyles.marginTop) + 'px';
            } else {
                this.child.style.top = 'auto';
            }

        },

        // Calculate cumulative offset of the element.
        // Optionally according to context
        _fullOffset: function _fullOffset(offsetName, elm, context) {
            var offset = elm[offsetName];
            var offsetParent = elm.offsetParent;

            // Add offset of the ascendent tree until we reach to the document root or to the given context
            while (offsetParent !== null && offsetParent !== context) {
                offset = offset + offsetParent[offsetName];
                offsetParent = offsetParent.offsetParent;
            }

            return offset;
        },

        // Get positioning context of the element.
        // We know that the closest parent that a transform rule applied will create a positioning context.
        _getContext: function () {
            var parent;
            var element = this.child;
            var context = null;
            var styles;

            // Climb up the treee until reaching the context
            while (!context) {
                parent = element.parentNode;
                if (parent === document.documentElement) {
                    return null;
                }

                styles = computedStyle.getAll(parent);
                // Element has a transform rule
                if (styles[transformJsProperty] !== 'none') {
                    context = parent;
                    break;
                }
                element = parent;
            }
            return context;
        },

        _fix: function _fix() {
            var isRTL = window.n2const.isRTL();
            var child = this.child;
            var childStyle = child.style;
            var childStyles = computedStyle.getAll(child);
            var xOffset;
            if (isRTL) {
                xOffset = document.body.clientWidth - child.getBoundingClientRect().right;
            } else {
                xOffset = child.getBoundingClientRect().left;
            }
            var width = childStyles.width;

            this._saveStyles();

            if (document.documentElement.currentStyle) {
                // Function for ie<9. When hasLayout is not triggered in ie7, he will report currentStyle as auto, clientWidth as 0. Thus using offsetWidth.
                // Opera also falls here
                width = (child.offsetWidth) - (computedStyle.toFloat(childStyles.paddingLeft) + computedStyle.toFloat(childStyles.paddingRight) + computedStyle.toFloat(childStyles.borderLeftWidth) + computedStyle.toFloat(childStyles.borderRightWidth)) + 'px';
            }

            // Ie still fixes the container according to the viewport.
            if (fixedPositioningContext) {
                var context = this._getContext();
                if (context) {
                    // There is a positioning context. Left should be according to the context.
                    if (isRTL) {
                        xOffset = (document.body.clientWidth - child.getBoundingClientRect().right) - (document.body.clientWidth - context.getBoundingClientRect().right);
                    } else {
                        xOffset = child.getBoundingClientRect().left - context.getBoundingClientRect().left;
                    }
                }
            }

            this._replacer.replace();

            if (isRTL) {
                childStyle.right = (xOffset - computedStyle.toFloat(childStyles.marginRight)) + 'px';
            } else {
                childStyle.left = (xOffset - computedStyle.toFloat(childStyles.marginLeft)) + 'px';
            }

            childStyle.width = width;

            childStyle.position = 'fixed';
            childStyle.top = this._mindtop() + this.options.top - computedStyle.toFloat(childStyles.marginTop) + 'px';
            this._$child.addClass(this.options.className);
            this.fixed = true;
        },

        _unfix: function _unfix() {
            var childStyle = this.child.style;
            this._replacer.hide();
            childStyle.position = this._childOriginalPosition;
            childStyle.top = this._childOriginalTop;
            childStyle.width = this._childOriginalWidth;
            if (window.n2const.isRTL()) {
                childStyle.right = this._childOriginalRight;
            } else {
                childStyle.left = this._childOriginalLeft;
            }
            this._$child.removeClass(this.options.className);
            this.fixed = false;
        },

        _saveStyles: function () {
            var childStyle = this.child.style;
            this._childOriginalPosition = childStyle.position;
            this._childOriginalTop = childStyle.top;
            this._childOriginalWidth = childStyle.width;
            if (window.n2const.isRTL()) {
                this._childOriginalRight = childStyle.right;
            } else {
                this._childOriginalLeft = childStyle.left;
            }
        },

        _onresize: function () {
            this.refresh();
        },

        _saveViewportHeight: function () {
            // ie8 doesn't support innerHeight
            this._viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        },

        _stop: function () {
            // Unfix the container immediately.
            this._unfix();
            // remove event listeners
            $(window).unbind('scroll', this._proxied_onscroll);
            $(this._toresize).unbind('resize', this._proxied_onresize);
        },

        _start: function () {
            // Trigger onscroll to have the effect immediately.
            this._onscroll();

            // Attach event listeners
            $(window).bind('scroll', this._proxied_onscroll);
            $(this._toresize).bind('resize', this._proxied_onresize);
        },

        _destroy: function () {
            // Destroy mimic node instance
            this._replacer.destroy();
        },

        refresh: function () {
            this._saveViewportHeight();
            this._unfix();
            this._onscroll();
        }
    });

    function NativeSticky(child, parent, options) {
        FixTo.call(this, child, parent, options);
        this.start();
    }

    NativeSticky.prototype = new FixTo();

    $.extend(NativeSticky.prototype, {
        _start: function () {

            var childStyles = computedStyle.getAll(this.child);

            this._childOriginalPosition = childStyles.position;
            this._childOriginalTop = childStyles.top;

            this.child.style.position = nativeStickyValue;
            this.refresh();
        },

        _stop: function () {
            this.child.style.position = this._childOriginalPosition;
            this.child.style.top = this._childOriginalTop;
        },

        refresh: function () {
            this.child.style.top = this._mindtop() + this.options.top + 'px';
        }
    });


    var fixTo = function fixTo(childElement, parentElement, options) {
        if ((nativeStickyValue && !options) || (nativeStickyValue && options && options.useNativeSticky !== false)) {
            // Position sticky supported and user did not disabled the usage of it.
            return new NativeSticky(childElement, parentElement, options);
        }
        else if (fixedPositionValue) {
            // Position fixed supported

            if (fixedPositioningContext === undefined) {
                // We don't know yet if browser creates fixed positioning contexts. Check it.
                fixedPositioningContext = checkFixedPositioningContextSupport();
            }

            return new FixToContainer(childElement, parentElement, options);
        }
        else {
            return 'Neither fixed nor sticky positioning supported';
        }
    };

    /*
     No support for ie lt 8
     */

    if (ieversion < 8) {
        fixTo = function () {
            return 'not supported';
        };
    }

    // Let it be a jQuery Plugin
    $.fn.fixTo = function (targetSelector, options) {

        var $targets = $(targetSelector);

        var i = 0;
        return this.each(function () {

            // Check the data of the element.
            var instance = $(this).data('fixto-instance');

            // If the element is not bound to an instance, create the instance and save it to elements data.
            if (!instance) {
                $(this).data('fixto-instance', fixTo(this, $targets[i], options));
            }
            else {
                // If we already have the instance here, expect that targetSelector parameter will be a string
                // equal to a public methods name. Run the method on the instance without checking if
                // it exists or it is a public method or not. Cause nasty errors when necessary.
                var method = targetSelector;
                instance[method].call(instance, options);
            }
            i++;
        });
    };
});
/*
 * ----------------------------- JSTORAGE -------------------------------------
 * Simple local storage wrapper to save data on the browser side, supporting
 * all major browsers - IE6+, Firefox2+, Safari4+, Chrome4+ and Opera 10.5+
 *
 * Author: Andris Reinman, andris.reinman@gmail.com
 * Project homepage: www.jstorage.info
 *
 * Licensed under Unlicense:
 *
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

N2R('$', function ($) {
    'use strict';

    var
        /* jStorage version */
        JSTORAGE_VERSION = '0.4.12',

        /* check for a JSON handling support */
        JSON = {
            parse: window.JSON && (window.JSON.parse || window.JSON.decode) ||
            String.prototype.evalJSON && function (str) {
                return String(str).evalJSON();
            } ||
            $.parseJSON ||
            $.evalJSON,
            stringify: Object.toJSON ||
            window.JSON && (window.JSON.stringify || window.JSON.encode) ||
            $.toJSON
        };

    // Break if no JSON support was found
    if (typeof JSON.parse !== 'function' || typeof JSON.stringify !== 'function') {
        throw new Error('No JSON support found, include //cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js to page');
    }

    var
        /* This is the object, that holds the cached values */
        _storage = {
            __jstorage_meta: {
                CRC32: {}
            }
        },

        /* Actual browser storage (localStorage or globalStorage['domain']) */
        _storage_service = {
            jStorage: '{}'
        },

        /* DOM element for older IE versions, holds userData behavior */
        _storage_elm = null,

        /* How much space does the storage take */
        _storage_size = 0,

        /* which backend is currently used */
        _backend = false,

        /* onchange observers */
        _observers = {},

        /* timeout to wait after onchange event */
        _observer_timeout = false,

        /* last update time */
        _observer_update = 0,

        /* pubsub observers */
        _pubsub_observers = {},

        /* skip published items older than current timestamp */
        _pubsub_last = +new Date(),

        /* Next check for TTL */
        _ttl_timeout,

        /**
         * XML encoding and decoding as XML nodes can't be JSON'ized
         * XML nodes are encoded and decoded if the node is the value to be saved
         * but not if it's as a property of another object
         * Eg. -
         *   $.jStorage.set('key', xmlNode);        // IS OK
         *   $.jStorage.set('key', {xml: xmlNode}); // NOT OK
         */
        _XMLService = {

            /**
             * Validates a XML node to be XML
             * based on jQuery.isXML function
             */
            isXML: function (elm) {
                var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
                return documentElement ? documentElement.nodeName !== 'HTML' : false;
            },

            /**
             * Encodes a XML node to string
             * based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
             */
            encode: function (xmlNode) {
                if (!this.isXML(xmlNode)) {
                    return false;
                }
                try { // Mozilla, Webkit, Opera
                    return new XMLSerializer().serializeToString(xmlNode);
                } catch (E1) {
                    try { // IE
                        return xmlNode.xml;
                    } catch (E2) {
                    }
                }
                return false;
            },

            /**
             * Decodes a XML node from string
             * loosely based on http://outwestmedia.com/jquery-plugins/xmldom/
             */
            decode: function (xmlString) {
                var dom_parser = ('DOMParser' in window && (new DOMParser()).parseFromString) ||
                    (window.ActiveXObject && function (_xmlString) {
                        var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
                        xml_doc.async = 'false';
                        xml_doc.loadXML(_xmlString);
                        return xml_doc;
                    }),
                    resultXML;
                if (!dom_parser) {
                    return false;
                }
                resultXML = dom_parser.call('DOMParser' in window && (new DOMParser()) || window, xmlString, 'text/xml');
                return this.isXML(resultXML) ? resultXML : false;
            }
        };


    ////////////////////////// PRIVATE METHODS ////////////////////////

    /**
     * Initialization function. Detects if the browser supports DOM Storage
     * or userData behavior and behaves accordingly.
     */
    function _init() {
        /* Check if browser supports localStorage */
        var localStorageReallyWorks = false;
        if ('localStorage' in window) {
            try {
                window.localStorage.setItem('_tmptest', 'tmpval');
                localStorageReallyWorks = true;
                window.localStorage.removeItem('_tmptest');
            } catch (BogusQuotaExceededErrorOnIos5) {
                // Thanks be to iOS5 Private Browsing mode which throws
                // QUOTA_EXCEEDED_ERRROR DOM Exception 22.
            }
        }

        if (localStorageReallyWorks) {
            try {
                if (window.localStorage) {
                    _storage_service = window.localStorage;
                    _backend = 'localStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E3) { /* Firefox fails when touching localStorage and cookies are disabled */
            }
        }
        /* Check if browser supports globalStorage */
        else if ('globalStorage' in window) {
            try {
                if (window.globalStorage) {
                    if (window.location.hostname == 'localhost') {
                        _storage_service = window.globalStorage['localhost.localdomain'];
                    } else {
                        _storage_service = window.globalStorage[window.location.hostname];
                    }
                    _backend = 'globalStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E4) { /* Firefox fails when touching localStorage and cookies are disabled */
            }
        }
        /* Check if browser supports userData behavior */
        else {
            _storage_elm = document.createElement('link');
            if (_storage_elm.addBehavior) {

                /* Use a DOM element to act as userData storage */
                _storage_elm.style.behavior = 'url(#default#userData)';

                /* userData element needs to be inserted into the DOM! */
                document.getElementsByTagName('head')[0].appendChild(_storage_elm);

                try {
                    _storage_elm.load('jStorage');
                } catch (E) {
                    // try to reset cache
                    _storage_elm.setAttribute('jStorage', '{}');
                    _storage_elm.save('jStorage');
                    _storage_elm.load('jStorage');
                }

                var data = '{}';
                try {
                    data = _storage_elm.getAttribute('jStorage');
                } catch (E5) {
                }

                try {
                    _observer_update = _storage_elm.getAttribute('jStorage_update');
                } catch (E6) {
                }

                _storage_service.jStorage = data;
                _backend = 'userDataBehavior';
            } else {
                _storage_elm = null;
                return;
            }
        }

        // Load data from storage
        _load_storage();

        // remove dead keys
        _handleTTL();

        // start listening for changes
        _setupObserver();

        // initialize publish-subscribe service
        _handlePubSub();

        // handle cached navigation
        if ('addEventListener' in window) {
            window.addEventListener('pageshow', function (event) {
                if (event.persisted) {
                    _storageObserver();
                }
            }, false);
        }
    }

    /**
     * Reload data from storage when needed
     */
    function _reloadData() {
        var data = '{}';

        if (_backend == 'userDataBehavior') {
            _storage_elm.load('jStorage');

            try {
                data = _storage_elm.getAttribute('jStorage');
            } catch (E5) {
            }

            try {
                _observer_update = _storage_elm.getAttribute('jStorage_update');
            } catch (E6) {
            }

            _storage_service.jStorage = data;
        }

        _load_storage();

        // remove dead keys
        _handleTTL();

        _handlePubSub();
    }

    /**
     * Sets up a storage change observer
     */
    function _setupObserver() {
        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            if ('addEventListener' in window) {
                window.addEventListener('storage', _storageObserver, false);
            } else {
                document.attachEvent('onstorage', _storageObserver);
            }
        } else if (_backend == 'userDataBehavior') {
            setInterval(_storageObserver, 1000);
        }
    }

    /**
     * Fired on any kind of data change, needs to check if anything has
     * really been changed
     */
    function _storageObserver() {
        var updateTime;
        // cumulate change notifications with timeout
        clearTimeout(_observer_timeout);
        _observer_timeout = setTimeout(function () {

            if (_backend == 'localStorage' || _backend == 'globalStorage') {
                updateTime = _storage_service.jStorage_update;
            } else if (_backend == 'userDataBehavior') {
                _storage_elm.load('jStorage');
                try {
                    updateTime = _storage_elm.getAttribute('jStorage_update');
                } catch (E5) {
                }
            }

            if (updateTime && updateTime != _observer_update) {
                _observer_update = updateTime;
                _checkUpdatedKeys();
            }

        }, 25);
    }

    /**
     * Reloads the data and checks if any keys are changed
     */
    function _checkUpdatedKeys() {
        var oldCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32)),
            newCrc32List;

        _reloadData();
        newCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32));

        var key,
            updated = [],
            removed = [];

        for (key in oldCrc32List) {
            if (oldCrc32List.hasOwnProperty(key)) {
                if (!newCrc32List[key]) {
                    removed.push(key);
                    continue;
                }
                if (oldCrc32List[key] != newCrc32List[key] && String(oldCrc32List[key]).substr(0, 2) == '2.') {
                    updated.push(key);
                }
            }
        }

        for (key in newCrc32List) {
            if (newCrc32List.hasOwnProperty(key)) {
                if (!oldCrc32List[key]) {
                    updated.push(key);
                }
            }
        }

        _fireObservers(updated, 'updated');
        _fireObservers(removed, 'deleted');
    }

    /**
     * Fires observers for updated keys
     *
     * @param {Array|String} keys Array of key names or a key
     * @param {String} action What happened with the value (updated, deleted, flushed)
     */
    function _fireObservers(keys, action) {
        keys = [].concat(keys || []);

        var i, j, len, jlen;

        if (action == 'flushed') {
            keys = [];
            for (var key in _observers) {
                if (_observers.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            action = 'deleted';
        }
        for (i = 0, len = keys.length; i < len; i++) {
            if (_observers[keys[i]]) {
                for (j = 0, jlen = _observers[keys[i]].length; j < jlen; j++) {
                    _observers[keys[i]][j](keys[i], action);
                }
            }
            if (_observers['*']) {
                for (j = 0, jlen = _observers['*'].length; j < jlen; j++) {
                    _observers['*'][j](keys[i], action);
                }
            }
        }
    }

    /**
     * Publishes key change to listeners
     */
    function _publishChange() {
        var updateTime = (+new Date()).toString();

        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            try {
                _storage_service.jStorage_update = updateTime;
            } catch (E8) {
                // safari private mode has been enabled after the jStorage initialization
                _backend = false;
            }
        } else if (_backend == 'userDataBehavior') {
            _storage_elm.setAttribute('jStorage_update', updateTime);
            _storage_elm.save('jStorage');
        }

        _storageObserver();
    }

    /**
     * Loads the data from the storage based on the supported mechanism
     */
    function _load_storage() {
        /* if jStorage string is retrieved, then decode it */
        if (_storage_service.jStorage) {
            try {
                _storage = JSON.parse(String(_storage_service.jStorage));
            } catch (E6) {
                _storage_service.jStorage = '{}';
            }
        } else {
            _storage_service.jStorage = '{}';
        }
        _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;

        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.CRC32) {
            _storage.__jstorage_meta.CRC32 = {};
        }
    }

    /**
     * This functions provides the 'save' mechanism to store the jStorage object
     */
    function _save() {
        _dropOldEvents(); // remove expired events
        try {
            _storage_service.jStorage = JSON.stringify(_storage);
            // If userData is used as the storage engine, additional
            if (_storage_elm) {
                _storage_elm.setAttribute('jStorage', _storage_service.jStorage);
                _storage_elm.save('jStorage');
            }
            _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;
        } catch (E7) { /* probably cache is full, nothing is saved this way*/
        }
    }

    /**
     * Function checks if a key is set and is string or numberic
     *
     * @param {String} key Key name
     */
    function _checkKey(key) {
        if (typeof key != 'string' && typeof key != 'number') {
            throw new TypeError('Key name must be string or numeric');
        }
        if (key == '__jstorage_meta') {
            throw new TypeError('Reserved key name');
        }
        return true;
    }

    /**
     * Removes expired keys
     */
    function _handleTTL() {
        var curtime, i, TTL, CRC32, nextExpire = Infinity,
            changed = false,
            deleted = [];

        clearTimeout(_ttl_timeout);

        if (!_storage.__jstorage_meta || typeof _storage.__jstorage_meta.TTL != 'object') {
            // nothing to do here
            return;
        }

        curtime = +new Date();
        TTL = _storage.__jstorage_meta.TTL;

        CRC32 = _storage.__jstorage_meta.CRC32;
        for (i in TTL) {
            if (TTL.hasOwnProperty(i)) {
                if (TTL[i] <= curtime) {
                    delete TTL[i];
                    delete CRC32[i];
                    delete _storage[i];
                    changed = true;
                    deleted.push(i);
                } else if (TTL[i] < nextExpire) {
                    nextExpire = TTL[i];
                }
            }
        }

        // set next check
        if (nextExpire != Infinity) {
            _ttl_timeout = setTimeout(_handleTTL, Math.min(nextExpire - curtime, 0x7FFFFFFF));
        }

        // save changes
        if (changed) {
            _save();
            _publishChange();
            _fireObservers(deleted, 'deleted');
        }
    }

    /**
     * Checks if there's any events on hold to be fired to listeners
     */
    function _handlePubSub() {
        var i, len;
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }
        var pubelm,
            _pubsubCurrent = _pubsub_last,
            needFired = [];

        for (i = len = _storage.__jstorage_meta.PubSub.length - 1; i >= 0; i--) {
            pubelm = _storage.__jstorage_meta.PubSub[i];
            if (pubelm[0] > _pubsub_last) {
                _pubsubCurrent = pubelm[0];
                needFired.unshift(pubelm);
            }
        }

        for (i = needFired.length - 1; i >= 0; i--) {
            _fireSubscribers(needFired[i][1], needFired[i][2]);
        }

        _pubsub_last = _pubsubCurrent;
    }

    /**
     * Fires all subscriber listeners for a pubsub channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload data to deliver
     */
    function _fireSubscribers(channel, payload) {
        if (_pubsub_observers[channel]) {
            for (var i = 0, len = _pubsub_observers[channel].length; i < len; i++) {
                // send immutable data that can't be modified by listeners
                try {
                    _pubsub_observers[channel][i](channel, JSON.parse(JSON.stringify(payload)));
                } catch (E) {
                }
            }
        }
    }

    /**
     * Remove old events from the publish stream (at least 2sec old)
     */
    function _dropOldEvents() {
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }

        var retire = +new Date() - 2000;

        for (var i = 0, len = _storage.__jstorage_meta.PubSub.length; i < len; i++) {
            if (_storage.__jstorage_meta.PubSub[i][0] <= retire) {
                // deleteCount is needed for IE6
                _storage.__jstorage_meta.PubSub.splice(i, _storage.__jstorage_meta.PubSub.length - i);
                break;
            }
        }

        if (!_storage.__jstorage_meta.PubSub.length) {
            delete _storage.__jstorage_meta.PubSub;
        }

    }

    /**
     * Publish payload to a channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload to send to the subscribers
     */
    function _publish(channel, payload) {
        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.PubSub) {
            _storage.__jstorage_meta.PubSub = [];
        }

        _storage.__jstorage_meta.PubSub.unshift([+new Date(), channel, payload]);

        _save();
        _publishChange();
    }


    /**
     * JS Implementation of MurmurHash2
     *
     *  SOURCE: https://github.com/garycourt/murmurhash-js (MIT licensed)
     *
     * @author <a href='mailto:gary.court@gmail.com'>Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href='mailto:aappleby@gmail.com'>Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} str ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */

    function murmurhash2_32_gc(str, seed) {
        var
            l = str.length,
            h = seed ^ l,
            i = 0,
            k;

        while (l >= 4) {
            k =
                ((str.charCodeAt(i) & 0xff)) |
                ((str.charCodeAt(++i) & 0xff) << 8) |
                ((str.charCodeAt(++i) & 0xff) << 16) |
                ((str.charCodeAt(++i) & 0xff) << 24);

            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
            k ^= k >>> 24;
            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

            l -= 4;
            ++i;
        }

        switch (l) {
            case 3:
                h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
            /* falls through */
            case 2:
                h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
            /* falls through */
            case 1:
                h ^= (str.charCodeAt(i) & 0xff);
                h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        }

        h ^= h >>> 13;
        h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        h ^= h >>> 15;

        return h >>> 0;
    }

    ////////////////////////// PUBLIC INTERFACE /////////////////////////

    $.jStorage = {
        /* Version number */
        version: JSTORAGE_VERSION,

        /**
         * Sets a key's value.
         *
         * @param {String} key Key to set. If this value is not set or not
         *              a string an exception is raised.
         * @param {Mixed} value Value to set. This can be any value that is JSON
         *              compatible (Numbers, Strings, Objects etc.).
         * @param {Object} [options] - possible options to use
         * @param {Number} [options.TTL] - optional TTL value, in milliseconds
         * @return {Mixed} the used value
         */
        set: function (key, value, options) {
            _checkKey(key);

            options = options || {};

            // undefined values are deleted automatically
            if (typeof value == 'undefined') {
                this.deleteKey(key);
                return value;
            }

            if (_XMLService.isXML(value)) {
                value = {
                    _is_xml: true,
                    xml: _XMLService.encode(value)
                };
            } else if (typeof value == 'function') {
                return undefined; // functions can't be saved!
            } else if (value && typeof value == 'object') {
                // clone the object before saving to _storage tree
                value = JSON.parse(JSON.stringify(value));
            }

            _storage[key] = value;

            _storage.__jstorage_meta.CRC32[key] = '2.' + murmurhash2_32_gc(JSON.stringify(value), 0x9747b28c);

            this.setTTL(key, options.TTL || 0); // also handles saving and _publishChange

            _fireObservers(key, 'updated');
            return value;
        },

        /**
         * Looks up a key in cache
         *
         * @param {String} key - Key to look up.
         * @param {mixed} def - Default value to return, if key didn't exist.
         * @return {Mixed} the key value, default value or null
         */
        get: function (key, def) {
            _checkKey(key);
            if (key in _storage) {
                if (_storage[key] && typeof _storage[key] == 'object' && _storage[key]._is_xml) {
                    return _XMLService.decode(_storage[key].xml);
                } else {
                    return _storage[key];
                }
            }
            return typeof(def) == 'undefined' ? null : def;
        },

        /**
         * Deletes a key from cache.
         *
         * @param {String} key - Key to delete.
         * @return {Boolean} true if key existed or false if it didn't
         */
        deleteKey: function (key) {
            _checkKey(key);
            if (key in _storage) {
                delete _storage[key];
                // remove from TTL list
                if (typeof _storage.__jstorage_meta.TTL == 'object' &&
                    key in _storage.__jstorage_meta.TTL) {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                delete _storage.__jstorage_meta.CRC32[key];

                _save();
                _publishChange();
                _fireObservers(key, 'deleted');
                return true;
            }
            return false;
        },

        /**
         * Sets a TTL for a key, or remove it if ttl value is 0 or below
         *
         * @param {String} key - key to set the TTL for
         * @param {Number} ttl - TTL timeout in milliseconds
         * @return {Boolean} true if key existed or false if it didn't
         */
        setTTL: function (key, ttl) {
            var curtime = +new Date();
            _checkKey(key);
            ttl = Number(ttl) || 0;
            if (key in _storage) {

                if (!_storage.__jstorage_meta.TTL) {
                    _storage.__jstorage_meta.TTL = {};
                }

                // Set TTL value for the key
                if (ttl > 0) {
                    _storage.__jstorage_meta.TTL[key] = curtime + ttl;
                } else {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                _save();

                _handleTTL();

                _publishChange();
                return true;
            }
            return false;
        },

        /**
         * Gets remaining TTL (in milliseconds) for a key or 0 when no TTL has been set
         *
         * @param {String} key Key to check
         * @return {Number} Remaining TTL in milliseconds
         */
        getTTL: function (key) {
            var curtime = +new Date(),
                ttl;
            _checkKey(key);
            if (key in _storage && _storage.__jstorage_meta.TTL && _storage.__jstorage_meta.TTL[key]) {
                ttl = _storage.__jstorage_meta.TTL[key] - curtime;
                return ttl || 0;
            }
            return 0;
        },

        /**
         * Deletes everything in cache.
         *
         * @return {Boolean} Always true
         */
        flush: function () {
            _storage = {
                __jstorage_meta: {
                    CRC32: {}
                }
            };
            _save();
            _publishChange();
            _fireObservers(null, 'flushed');
            return true;
        },

        /**
         * Returns a read-only copy of _storage
         *
         * @return {Object} Read-only copy of _storage
         */
        storageObj: function () {
            function F() {
            }

            F.prototype = _storage;
            return new F();
        },

        /**
         * Returns an index of all used keys as an array
         * ['key1', 'key2',..'keyN']
         *
         * @return {Array} Used keys
         */
        index: function () {
            var index = [],
                i;
            for (i in _storage) {
                if (_storage.hasOwnProperty(i) && i != '__jstorage_meta') {
                    index.push(i);
                }
            }
            return index;
        },

        /**
         * How much space in bytes does the storage take?
         *
         * @return {Number} Storage size in chars (not the same as in bytes,
         *                  since some chars may take several bytes)
         */
        storageSize: function () {
            return _storage_size;
        },

        /**
         * Which backend is currently in use?
         *
         * @return {String} Backend name
         */
        currentBackend: function () {
            return _backend;
        },

        /**
         * Test if storage is available
         *
         * @return {Boolean} True if storage can be used
         */
        storageAvailable: function () {
            return !!_backend;
        },

        /**
         * Register change listeners
         *
         * @param {String} key Key name
         * @param {Function} callback Function to run when the key changes
         */
        listenKeyChange: function (key, callback) {
            _checkKey(key);
            if (!_observers[key]) {
                _observers[key] = [];
            }
            _observers[key].push(callback);
        },

        /**
         * Remove change listeners
         *
         * @param {String} key Key name to unregister listeners against
         * @param {Function} [callback] If set, unregister the callback, if not - unregister all
         */
        stopListening: function (key, callback) {
            _checkKey(key);

            if (!_observers[key]) {
                return;
            }

            if (!callback) {
                delete _observers[key];
                return;
            }

            for (var i = _observers[key].length - 1; i >= 0; i--) {
                if (_observers[key][i] == callback) {
                    _observers[key].splice(i, 1);
                }
            }
        },

        /**
         * Subscribe to a Publish/Subscribe event stream
         *
         * @param {String} channel Channel name
         * @param {Function} callback Function to run when the something is published to the channel
         */
        subscribe: function (channel, callback) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }
            if (!_pubsub_observers[channel]) {
                _pubsub_observers[channel] = [];
            }
            _pubsub_observers[channel].push(callback);
        },

        /**
         * Publish data to an event stream
         *
         * @param {String} channel Channel name
         * @param {Mixed} payload Payload to deliver
         */
        publish: function (channel, payload) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }

            _publish(channel, payload);
        },

        /**
         * Reloads the data from browser storage
         */
        reInit: function () {
            _reloadData();
        },

        /**
         * Removes reference from global objects and saves it as jStorage
         *
         * @param {Boolean} option if needed to save object as simple 'jStorage' in windows context
         */
        noConflict: function (saveInGlobal) {
            delete window.$.jStorage;

            if (saveInGlobal) {
                window.jStorage = this;
            }

            return this;
        }
    };

    // Initialize jStorage
    _init();

});
/**
 * @preserve jQuery DateTimePicker plugin v2.4.1
 * @homepage http://xdsoft.net/jqplugins/datetimepicker/
 * (c) 2014, Chupurnov Valeriy.
 */
N2R('$', function ($) {
    'use strict';

    var default_options = {
        i18n: {
            ar: { // Arabic
                months: [
                    "كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
                ],
                dayOfWeek: [
                    "ن", "ث", "ع", "خ", "ج", "س", "ح"
                ]
            },
            ro: { // Romanian
                months: [
                    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
                ],
                dayOfWeek: [
                    "l", "ma", "mi", "j", "v", "s", "d"
                ]
            },
            id: { // Indonesian
                months: [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ],
                dayOfWeek: [
                    "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
                ]
            },
            bg: { // Bulgarian
                months: [
                    "Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
                ],
                dayOfWeek: [
                    "Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            fa: { // Persian/Farsi
                months: [
                    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
                ],
                dayOfWeek: [
                    'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
                ]
            },
            ru: { // Russian
                months: [
                    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ],
                dayOfWeek: [
                    "Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            uk: { // Ukrainian
                months: [
                    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
                ],
                dayOfWeek: [
                    "Ндл", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"
                ]
            },
            en: { // English
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            el: { // Ελληνικά
                months: [
                    "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
                ],
                dayOfWeek: [
                    "Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"
                ]
            },
            de: { // German
                months: [
                    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
                ],
                dayOfWeek: [
                    "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
                ]
            },
            nl: { // Dutch
                months: [
                    "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"
                ],
                dayOfWeek: [
                    "zo", "ma", "di", "wo", "do", "vr", "za"
                ]
            },
            tr: { // Turkish
                months: [
                    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
                ],
                dayOfWeek: [
                    "Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"
                ]
            },
            fr: { //French
                months: [
                    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                ],
                dayOfWeek: [
                    "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"
                ]
            },
            es: { // Spanish
                months: [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"
                ]
            },
            th: { // Thai
                months: [
                    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ],
                dayOfWeek: [
                    'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
                ]
            },
            pl: { // Polish
                months: [
                    "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
                ],
                dayOfWeek: [
                    "nd", "pn", "wt", "śr", "cz", "pt", "sb"
                ]
            },
            pt: { // Portuguese
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"
                ]
            },
            ch: { // Simplified Chinese
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            se: { // Swedish
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            kr: { // Korean
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            it: { // Italian
                months: [
                    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"
                ]
            },
            da: { // Dansk
                months: [
                    "January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
                ]
            },
            no: { // Norwegian
                months: [
                    "Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
                ]
            },
            ja: { // Japanese
                months: [
                    "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
                ],
                dayOfWeek: [
                    "日", "月", "火", "水", "木", "金", "土"
                ]
            },
            vi: { // Vietnamese
                months: [
                    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                ],
                dayOfWeek: [
                    "CN", "T2", "T3", "T4", "T5", "T6", "T7"
                ]
            },
            sl: { // Slovenščina
                months: [
                    "Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"
                ]
            },
            cs: { // Čeština
                months: [
                    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
                ],
                dayOfWeek: [
                    "Ne", "Po", "Út", "St", "Čt", "Pá", "So"
                ]
            },
            hu: { // Hungarian
                months: [
                    "Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"
                ],
                dayOfWeek: [
                    "Va", "Hé", "Ke", "Sze", "Cs", "Pé", "Szo"
                ]
            },
            az: { //Azerbaijanian (Azeri)
                months: [
                    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
                ],
                dayOfWeek: [
                    "B", "Be", "Ça", "Ç", "Ca", "C", "Ş"
                ]
            },
            bs: { //Bosanski
                months: [
                    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
                ]
            },
            ca: { //Català
                months: [
                    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
                ],
                dayOfWeek: [
                    "Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"
                ]
            },
            'en-GB': { //English (British)
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            et: { //"Eesti"
                months: [
                    "Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"
                ],
                dayOfWeek: [
                    "P", "E", "T", "K", "N", "R", "L"
                ]
            },
            eu: { //Euskara
                months: [
                    "Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"
                ],
                dayOfWeek: [
                    "Ig.", "Al.", "Ar.", "Az.", "Og.", "Or.", "La."
                ]
            },
            fi: { //Finnish (Suomi)
                months: [
                    "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"
                ],
                dayOfWeek: [
                    "Su", "Ma", "Ti", "Ke", "To", "Pe", "La"
                ]
            },
            gl: { //Galego
                months: [
                    "Xan", "Feb", "Maz", "Abr", "Mai", "Xun", "Xul", "Ago", "Set", "Out", "Nov", "Dec"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Xov", "Ven", "Sab"
                ]
            },
            hr: { //Hrvatski
                months: [
                    "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
                ]
            },
            ko: { //Korean (한국어)
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            lt: { //Lithuanian (lietuvių)
                months: [
                    "Sausio", "Vasario", "Kovo", "Balandžio", "Gegužės", "Birželio", "Liepos", "Rugpjūčio", "Rugsėjo", "Spalio", "Lapkričio", "Gruodžio"
                ],
                dayOfWeek: [
                    "Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"
                ]
            },
            lv: { //Latvian (Latviešu)
                months: [
                    "Janvāris", "Februāris", "Marts", "Aprīlis ", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"
                ],
                dayOfWeek: [
                    "Sv", "Pr", "Ot", "Tr", "Ct", "Pk", "St"
                ]
            },
            mk: { //Macedonian (Македонски)
                months: [
                    "јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"
                ],
                dayOfWeek: [
                    "нед", "пон", "вто", "сре", "чет", "пет", "саб"
                ]
            },
            mn: { //Mongolian (Монгол)
                months: [
                    "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"
                ],
                dayOfWeek: [
                    "Дав", "Мяг", "Лха", "Пүр", "Бсн", "Бям", "Ням"
                ]
            },
            'pt-BR': { //Português(Brasil)
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
                ]
            },
            sk: { //Slovenčina
                months: [
                    "Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"
                ],
                dayOfWeek: [
                    "Ne", "Po", "Ut", "St", "Št", "Pi", "So"
                ]
            },
            sq: { //Albanian (Shqip)
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            'sr-YU': { //Serbian (Srpski)
                months: [
                    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sre", "čet", "Pet", "Sub"
                ]
            },
            sr: { //Serbian Cyrillic (Српски)
                months: [
                    "јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"
                ],
                dayOfWeek: [
                    "нед", "пон", "уто", "сре", "чет", "пет", "суб"
                ]
            },
            sv: { //Svenska
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            'zh-TW': { //Traditional Chinese (繁體中文)
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            zh: { //Simplified Chinese (简体中文)
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            he: { //Hebrew (עברית)
                months: [
                    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                ],
                dayOfWeek: [
                    'א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'שבת'
                ]
            }
        },
        value: '',
        lang: 'en',

        format: 'Y/m/d H:i',
        formatTime: 'H:i',
        formatDate: 'Y/m/d',

        startDate: false, // new Date(), '1986/12/08', '-1970/01/05','-1970/01/05',
        step: 60,
        monthChangeSpinner: true,

        closeOnDateSelect: false,
        closeOnWithoutClick: true,
        closeOnInputClick: true,

        timepicker: true,
        datepicker: true,
        weeks: false,

        defaultTime: false,	// use formatTime format (ex. '10:00' for formatTime:	'H:i')
        defaultDate: false,	// use formatDate format (ex new Date() or '1986/12/08' or '-1970/01/05' or '-1970/01/05')

        minDate: false,
        maxDate: false,
        minTime: false,
        maxTime: false,

        allowTimes: [],
        opened: false,
        initTime: true,
        inline: false,
        theme: '',

        onSelectDate: function () {
        },
        onSelectTime: function () {
        },
        onChangeMonth: function () {
        },
        onChangeYear: function () {
        },
        onChangeDateTime: function () {
        },
        onShow: function () {
        },
        onClose: function () {
        },
        onGenerate: function () {
        },

        withoutCopyright: true,
        inverseButton: false,
        hours12: false,
        next: 'xdsoft_next',
        prev: 'xdsoft_prev',
        dayOfWeekStart: 0,
        parentID: 'body',
        timeHeightInTimePicker: 25,
        timepickerScrollbar: true,
        todayButton: true,
        defaultSelect: true,

        scrollMonth: true,
        scrollTime: true,
        scrollInput: true,

        lazyInit: false,
        mask: false,
        validateOnBlur: true,
        allowBlank: true,
        yearStart: 1950,
        yearEnd: 2050,
        style: '',
        id: '',
        fixed: false,
        roundTime: 'round', // ceil, floor
        className: '',
        weekends: [],
        disabledDates: [],
        yearOffset: 0,
        beforeShowDay: null,

        enterLikeTab: true
    };
    // fix for ie8
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            var i, j;
            for (i = (start || 0), j = this.length; i < j; i += 1) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        };
    }
    Date.prototype.countDaysInMonth = function () {
        return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
    };
    $.fn.xdsoftScroller = function (percent) {
        return this.each(function () {
            var timeboxparent = $(this),
                pointerEventToXY = function (e) {
                    var out = {x: 0, y: 0},
                        touch;
                    if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
                        touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        out.x = touch.clientX;
                        out.y = touch.clientY;
                    } else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
                        out.x = e.clientX;
                        out.y = e.clientY;
                    }
                    return out;
                },
                move = 0,
                timebox,
                parentHeight,
                height,
                scrollbar,
                scroller,
                maximumOffset = 100,
                start = false,
                startY = 0,
                startTop = 0,
                h1 = 0,
                touchStart = false,
                startTopScroll = 0,
                calcOffset = function () {
                };
            if (percent === 'hide') {
                timeboxparent.find('.xdsoft_scrollbar').hide();
                return;
            }
            if (!$(this).hasClass('xdsoft_scroller_box')) {
                timebox = timeboxparent.children().eq(0);
                parentHeight = timeboxparent[0].clientHeight;
                height = timebox[0].offsetHeight;
                scrollbar = $('<div class="xdsoft_scrollbar"></div>');
                scroller = $('<div class="xdsoft_scroller"></div>');
                scrollbar.append(scroller);

                timeboxparent.addClass('xdsoft_scroller_box').append(scrollbar);
                calcOffset = function calcOffset(event) {
                    var offset = pointerEventToXY(event).y - startY + startTopScroll;
                    if (offset < 0) {
                        offset = 0;
                    }
                    if (offset + scroller[0].offsetHeight > h1) {
                        offset = h1 - scroller[0].offsetHeight;
                    }
                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [maximumOffset ? offset / maximumOffset : 0]);
                };

                scroller
                    .on('touchstart.xdsoft_scroller mousedown.xdsoft_scroller', function (event) {
                        if (!parentHeight) {
                            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
                        }

                        startY = pointerEventToXY(event).y;
                        startTopScroll = parseInt(scroller.css('margin-top'), 10);
                        h1 = scrollbar[0].offsetHeight;

                        if (event.type === 'mousedown') {
                            if (document) {
                                $(document.body).addClass('xdsoft_noselect');
                            }
                            $([document.body, window]).on('mouseup.xdsoft_scroller', function arguments_callee() {
                                $([document.body, window]).off('mouseup.xdsoft_scroller', arguments_callee)
                                    .off('mousemove.xdsoft_scroller', calcOffset)
                                    .removeClass('xdsoft_noselect');
                            });
                            $(document.body).on('mousemove.xdsoft_scroller', calcOffset);
                        } else {
                            touchStart = true;
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    })
                    .on('touchmove', function (event) {
                        if (touchStart) {
                            event.preventDefault();
                            calcOffset(event);
                        }
                    })
                    .on('touchend touchcancel', function (event) {
                        touchStart = false;
                        startTopScroll = 0;
                    });

                timeboxparent
                    .on('scroll_element.xdsoft_scroller', function (event, percentage) {
                        if (!parentHeight) {
                            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percentage, true]);
                        }
                        percentage = percentage > 1 ? 1 : (percentage < 0 || isNaN(percentage)) ? 0 : percentage;

                        scroller.css('margin-top', maximumOffset * percentage);

                        setTimeout(function () {
                            timebox.css('marginTop', -parseInt((timebox[0].offsetHeight - parentHeight) * percentage, 10));
                        }, 10);
                    })
                    .on('resize_scroll.xdsoft_scroller', function (event, percentage, noTriggerScroll) {
                        var percent, sh;
                        parentHeight = timeboxparent[0].clientHeight;
                        height = timebox[0].offsetHeight;
                        percent = parentHeight / height;
                        sh = percent * scrollbar[0].offsetHeight;
                        if (percent > 1) {
                            scroller.hide();
                        } else {
                            scroller.show();
                            scroller.css('height', parseInt(sh > 10 ? sh : 10, 10));
                            maximumOffset = scrollbar[0].offsetHeight - scroller[0].offsetHeight;
                            if (noTriggerScroll !== true) {
                                timeboxparent.trigger('scroll_element.xdsoft_scroller', [percentage || Math.abs(parseInt(timebox.css('marginTop'), 10)) / (height - parentHeight)]);
                            }
                        }
                    });

                timeboxparent.on('wheel', function (event) {
                    var top = Math.abs(parseInt(timebox.css('marginTop'), 10));

                    top = top - (event.deltaY * 20);
                    if (top < 0) {
                        top = 0;
                    }

                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [top / (height - parentHeight)]);
                    event.stopPropagation();
                    return false;
                });

                timeboxparent.on('touchstart', function (event) {
                    start = pointerEventToXY(event);
                    startTop = Math.abs(parseInt(timebox.css('marginTop'), 10));
                });

                timeboxparent.on('touchmove', function (event) {
                    if (start) {
                        event.preventDefault();
                        var coord = pointerEventToXY(event);
                        timeboxparent.trigger('scroll_element.xdsoft_scroller', [(startTop - (coord.y - start.y)) / (height - parentHeight)]);
                    }
                });

                timeboxparent.on('touchend touchcancel', function (event) {
                    start = false;
                    startTop = 0;
                });
            }
            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
        });
    };

    $.fn.datetimepicker = function (opt) {
        var KEY0 = 48,
            KEY9 = 57,
            _KEY0 = 96,
            _KEY9 = 105,
            CTRLKEY = 17,
            DEL = 46,
            ENTER = 13,
            ESC = 27,
            BACKSPACE = 8,
            ARROWLEFT = 37,
            ARROWUP = 38,
            ARROWRIGHT = 39,
            ARROWDOWN = 40,
            TAB = 9,
            F5 = 116,
            AKEY = 65,
            CKEY = 67,
            VKEY = 86,
            ZKEY = 90,
            YKEY = 89,
            ctrlDown = false,
            options = ($.isPlainObject(opt) || !opt) ? $.extend(true, {}, default_options, opt) : $.extend(true, {}, default_options),

            lazyInitTimer = 0,
            createDateTimePicker,
            destroyDateTimePicker,

            lazyInit = function (input) {
                if (typeof options.i18n[options.lang] === 'undefined') {
                    options.lang = 'en';
                }
                input
                    .on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function initOnActionCallback(event) {
                        if (input.is(':disabled') || input.data('xdsoft_datetimepicker')) {
                            return;
                        }
                        clearTimeout(lazyInitTimer);
                        lazyInitTimer = setTimeout(function () {

                            if (!input.data('xdsoft_datetimepicker')) {
                                createDateTimePicker(input);
                            }
                            input
                                .off('open.xdsoft focusin.xdsoft mousedown.xdsoft', initOnActionCallback)
                                .trigger('open.xdsoft');
                        }, 100);
                    });
            };

        createDateTimePicker = function (input) {
            var datetimepicker = $('<div ' + (options.id ? 'id="' + options.id + '"' : '') + ' ' + (options.style ? 'style="' + options.style + '"' : '') + ' class="xdsoft_datetimepicker xdsoft_' + options.theme + ' xdsoft_noselect ' + (options.weeks ? ' xdsoft_showweeks' : '') + options.className + '"></div>'),
                xdsoft_copyright = $('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),
                datepicker = $('<div class="xdsoft_datepicker active"></div>'),
                mounth_picker = $('<div class="xdsoft_mounthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button>' +
                    '<div class="xdsoft_label xdsoft_month"><span></span><i></i></div>' +
                    '<div class="xdsoft_label xdsoft_year"><span></span><i></i></div>' +
                    '<button type="button" class="xdsoft_next"></button></div>'),
                calendar = $('<div class="xdsoft_calendar"></div>'),
                timepicker = $('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),
                timeboxparent = timepicker.find('.xdsoft_time_box').eq(0),
                timebox = $('<div class="xdsoft_time_variant"></div>'),
                /*scrollbar = $('<div class="xdsoft_scrollbar"></div>'),
                 scroller = $('<div class="xdsoft_scroller"></div>'),*/
                monthselect = $('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),
                yearselect = $('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'),
                triggerAfterOpen = false,
                XDSoft_datetime,
                //scroll_element,
                xchangeTimer,
                timerclick,
                current_time_index,
                setPos,
                timer = 0,
                timer1 = 0,
                _xdsoft_datetime;

            mounth_picker
                .find('.xdsoft_month span')
                .after(monthselect);
            mounth_picker
                .find('.xdsoft_year span')
                .after(yearselect);

            mounth_picker
                .find('.xdsoft_month,.xdsoft_year')
                .on('mousedown.xdsoft', function (event) {
                    var select = $(this).find('.xdsoft_select').eq(0),
                        val = 0,
                        top = 0,
                        visible = select.is(':visible'),
                        items,
                        i;

                    mounth_picker
                        .find('.xdsoft_select')
                        .hide();
                    if (_xdsoft_datetime.currentTime) {
                        val = _xdsoft_datetime.currentTime[$(this).hasClass('xdsoft_month') ? 'getMonth' : 'getFullYear']();
                    }

                    select[visible ? 'hide' : 'show']();
                    for (items = select.find('div.xdsoft_option'), i = 0; i < items.length; i += 1) {
                        if (items.eq(i).data('value') === val) {
                            break;
                        } else {
                            top += items[0].offsetHeight;
                        }
                    }

                    select.xdsoftScroller(top / (select.children()[0].offsetHeight - (select[0].clientHeight)));
                    event.stopPropagation();
                    return false;
                });

            mounth_picker
                .find('.xdsoft_select')
                .xdsoftScroller()
                .on('mousedown.xdsoft', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                })
                .on('mousedown.xdsoft', '.xdsoft_option', function (event) {
                    var year = _xdsoft_datetime.currentTime.getFullYear();
                    if (_xdsoft_datetime && _xdsoft_datetime.currentTime) {
                        _xdsoft_datetime.currentTime[$(this).parent().parent().hasClass('xdsoft_monthselect') ? 'setMonth' : 'setFullYear']($(this).data('value'));
                    }

                    $(this).parent().parent().hide();

                    datetimepicker.trigger('xchange.xdsoft');
                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    if (year !== _xdsoft_datetime.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
                        options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                });

            datetimepicker.setOptions = function (_options) {
                options = $.extend(true, {}, options, _options);

                if (_options.allowTimes && $.isArray(_options.allowTimes) && _options.allowTimes.length) {
                    options.allowTimes = $.extend(true, [], _options.allowTimes);
                }

                if (_options.weekends && $.isArray(_options.weekends) && _options.weekends.length) {
                    options.weekends = $.extend(true, [], _options.weekends);
                }

                if (_options.disabledDates && $.isArray(_options.disabledDates) && _options.disabledDates.length) {
                    options.disabledDates = $.extend(true, [], _options.disabledDates);
                }

                if ((options.open || options.opened) && (!options.inline)) {
                    input.trigger('open.xdsoft');
                }

                if (options.inline) {
                    triggerAfterOpen = true;
                    datetimepicker.addClass('xdsoft_inline');
                    input.after(datetimepicker).hide();
                }

                if (options.inverseButton) {
                    options.next = 'xdsoft_prev';
                    options.prev = 'xdsoft_next';
                }

                if (options.datepicker) {
                    datepicker.addClass('active');
                } else {
                    datepicker.removeClass('active');
                }

                if (options.timepicker) {
                    timepicker.addClass('active');
                } else {
                    timepicker.removeClass('active');
                }

                if (options.value) {
                    if (input && input.val) {
                        input.val(options.value);
                    }
                    _xdsoft_datetime.setCurrentTime(options.value);
                }

                if (isNaN(options.dayOfWeekStart)) {
                    options.dayOfWeekStart = 0;
                } else {
                    options.dayOfWeekStart = parseInt(options.dayOfWeekStart, 10) % 7;
                }

                if (!options.timepickerScrollbar) {
                    timeboxparent.xdsoftScroller('hide');
                }

                if (options.minDate && /^-(.*)$/.test(options.minDate)) {
                    options.minDate = _xdsoft_datetime.strToDateTime(options.minDate).dateFormat(options.formatDate);
                }

                if (options.maxDate && /^\+(.*)$/.test(options.maxDate)) {
                    options.maxDate = _xdsoft_datetime.strToDateTime(options.maxDate).dateFormat(options.formatDate);
                }

                mounth_picker
                    .find('.xdsoft_today_button')
                    .css('visibility', !options.todayButton ? 'hidden' : 'visible');

                if (options.mask) {
                    var e,
                        getCaretPos = function (input) {
                            try {
                                if (document.selection && document.selection.createRange) {
                                    var range = document.selection.createRange();
                                    return range.getBookmark().charCodeAt(2) - 2;
                                }
                                if (input.setSelectionRange) {
                                    return input.selectionStart;
                                }
                            } catch (e) {
                                return 0;
                            }
                        },
                        setCaretPos = function (node, pos) {
                            node = (typeof node === "string" || node instanceof String) ? document.getElementById(node) : node;
                            if (!node) {
                                return false;
                            }
                            if (node.createTextRange) {
                                var textRange = node.createTextRange();
                                textRange.collapse(true);
                                textRange.moveEnd('character', pos);
                                textRange.moveStart('character', pos);
                                textRange.select();
                                return true;
                            }
                            if (node.setSelectionRange) {
                                node.setSelectionRange(pos, pos);
                                return true;
                            }
                            return false;
                        },
                        isValidValue = function (mask, value) {
                            var reg = mask
                                .replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, '\\$1')
                                .replace(/_/g, '{digit+}')
                                .replace(/([0-9]{1})/g, '{digit$1}')
                                .replace(/\{digit([0-9]{1})\}/g, '[0-$1_]{1}')
                                .replace(/\{digit[\+]\}/g, '[0-9_]{1}');
                            return (new RegExp(reg)).test(value);
                        };
                    input.off('keydown.xdsoft');

                    if (options.mask === true) {
                        options.mask = options.format
                            .replace(/Y/g, '9999')
                            .replace(/F/g, '9999')
                            .replace(/m/g, '19')
                            .replace(/d/g, '39')
                            .replace(/H/g, '29')
                            .replace(/i/g, '59')
                            .replace(/s/g, '59');
                    }

                    if ($.type(options.mask) === 'string') {
                        if (!isValidValue(options.mask, input.val())) {
                            input.val(options.mask.replace(/[0-9]/g, '_'));
                        }

                        input.on('keydown.xdsoft', function (event) {
                            var val = this.value,
                                key = event.which,
                                pos,
                                digit;

                            if (((key >= KEY0 && key <= KEY9) || (key >= _KEY0 && key <= _KEY9)) || (key === BACKSPACE || key === DEL)) {
                                pos = getCaretPos(this);
                                digit = (key !== BACKSPACE && key !== DEL) ? String.fromCharCode((_KEY0 <= key && key <= _KEY9) ? key - KEY0 : key) : '_';

                                if ((key === BACKSPACE || key === DEL) && pos) {
                                    pos -= 1;
                                    digit = '_';
                                }

                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
                                    pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
                                }

                                val = val.substr(0, pos) + digit + val.substr(pos + 1);
                                if ($.trim(val) === '') {
                                    val = options.mask.replace(/[0-9]/g, '_');
                                } else {
                                    if (pos === options.mask.length) {
                                        event.preventDefault();
                                        return false;
                                    }
                                }

                                pos += (key === BACKSPACE || key === DEL) ? 0 : 1;
                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
                                    pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
                                }

                                if (isValidValue(options.mask, val)) {
                                    this.value = val;
                                    setCaretPos(this, pos);
                                } else if ($.trim(val) === '') {
                                    this.value = options.mask.replace(/[0-9]/g, '_');
                                } else {
                                    input.trigger('error_input.xdsoft');
                                }
                            } else {
                                if (([AKEY, CKEY, VKEY, ZKEY, YKEY].indexOf(key) !== -1 && ctrlDown) || [ESC, ARROWUP, ARROWDOWN, ARROWLEFT, ARROWRIGHT, F5, CTRLKEY, TAB, ENTER].indexOf(key) !== -1) {
                                    return true;
                                }
                            }

                            event.preventDefault();
                            return false;
                        });
                    }
                }
                if (options.validateOnBlur) {
                    input
                        .off('blur.xdsoft')
                        .on('blur.xdsoft', function () {
                            if (options.allowBlank && !$.trim($(this).val()).length) {
                                $(this).val(null);
                                datetimepicker.data('xdsoft_datetime').empty();
                            } else if (!Date.parseDate($(this).val(), options.format)) {
                                $(this).val((_xdsoft_datetime.now()).dateFormat(options.format));
                                datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                            } else {
                                datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                            }
                            datetimepicker.trigger('changedatetime.xdsoft');
                        });
                }
                options.dayOfWeekStartPrev = (options.dayOfWeekStart === 0) ? 6 : options.dayOfWeekStart - 1;

                datetimepicker
                    .trigger('xchange.xdsoft')
                    .trigger('afterOpen.xdsoft');
            };

            datetimepicker
                .data('options', options)
                .on('mousedown.xdsoft', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    yearselect.hide();
                    monthselect.hide();
                    return false;
                });

            //scroll_element = timepicker.find('.xdsoft_time_box');
            timeboxparent.append(timebox);
            timeboxparent.xdsoftScroller();

            datetimepicker.on('afterOpen.xdsoft', function () {
                timeboxparent.xdsoftScroller();
            });

            datetimepicker
                .append(datepicker)
                .append(timepicker);

            if (options.withoutCopyright !== true) {
                datetimepicker
                    .append(xdsoft_copyright);
            }

            datepicker
                .append(mounth_picker)
                .append(calendar);

            $(options.parentID)
                .append(datetimepicker);

            XDSoft_datetime = function () {
                var _this = this;
                _this.now = function (norecursion) {
                    var d = new Date(),
                        date,
                        time;

                    if (!norecursion && options.defaultDate) {
                        date = _this.strToDate(options.defaultDate);
                        d.setFullYear(date.getFullYear());
                        d.setMonth(date.getMonth());
                        d.setDate(date.getDate());
                    }

                    if (options.yearOffset) {
                        d.setFullYear(d.getFullYear() + options.yearOffset);
                    }

                    if (!norecursion && options.defaultTime) {
                        time = _this.strtotime(options.defaultTime);
                        d.setHours(time.getHours());
                        d.setMinutes(time.getMinutes());
                    }

                    return d;
                };

                _this.isValidDate = function (d) {
                    if (Object.prototype.toString.call(d) !== "[object Date]") {
                        return false;
                    }
                    return !isNaN(d.getTime());
                };

                _this.setCurrentTime = function (dTime) {
                    _this.currentTime = (typeof dTime === 'string') ? _this.strToDateTime(dTime) : _this.isValidDate(dTime) ? dTime : _this.now();
                    datetimepicker.trigger('xchange.xdsoft');
                };

                _this.empty = function () {
                    _this.currentTime = null;
                };

                _this.getCurrentTime = function (dTime) {
                    return _this.currentTime;
                };

                _this.nextMonth = function () {
                    var month = _this.currentTime.getMonth() + 1,
                        year;
                    if (month === 12) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() + 1);
                        month = 0;
                    }

                    year = _this.currentTime.getFullYear();

                    _this.currentTime.setDate(
                        Math.min(
                            new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
                            _this.currentTime.getDate()
                        )
                    );
                    _this.currentTime.setMonth(month);

                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    if (year !== _this.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
                        options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    datetimepicker.trigger('xchange.xdsoft');
                    return month;
                };

                _this.prevMonth = function () {
                    var month = _this.currentTime.getMonth() - 1;
                    if (month === -1) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() - 1);
                        month = 11;
                    }
                    _this.currentTime.setDate(
                        Math.min(
                            new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
                            _this.currentTime.getDate()
                        )
                    );
                    _this.currentTime.setMonth(month);
                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                    datetimepicker.trigger('xchange.xdsoft');
                    return month;
                };

                _this.getWeekOfYear = function (datetime) {
                    var onejan = new Date(datetime.getFullYear(), 0, 1);
                    return Math.ceil((((datetime - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                };

                _this.strToDateTime = function (sDateTime) {
                    var tmpDate = [], timeOffset, currentTime;

                    if (sDateTime && sDateTime instanceof Date && _this.isValidDate(sDateTime)) {
                        return sDateTime;
                    }

                    tmpDate = /^(\+|\-)(.*)$/.exec(sDateTime);
                    if (tmpDate) {
                        tmpDate[2] = Date.parseDate(tmpDate[2], options.formatDate);
                    }
                    if (tmpDate && tmpDate[2]) {
                        timeOffset = tmpDate[2].getTime() - (tmpDate[2].getTimezoneOffset()) * 60000;
                        currentTime = new Date((_xdsoft_datetime.now()).getTime() + parseInt(tmpDate[1] + '1', 10) * timeOffset);
                    } else {
                        currentTime = sDateTime ? Date.parseDate(sDateTime, options.format) : _this.now();
                    }

                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now();
                    }

                    return currentTime;
                };

                _this.strToDate = function (sDate) {
                    if (sDate && sDate instanceof Date && _this.isValidDate(sDate)) {
                        return sDate;
                    }

                    var currentTime = sDate ? Date.parseDate(sDate, options.formatDate) : _this.now(true);
                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now(true);
                    }
                    return currentTime;
                };

                _this.strtotime = function (sTime) {
                    if (sTime && sTime instanceof Date && _this.isValidDate(sTime)) {
                        return sTime;
                    }
                    var currentTime = sTime ? Date.parseDate(sTime, options.formatTime) : _this.now(true);
                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now(true);
                    }
                    return currentTime;
                };

                _this.str = function () {
                    return _this.currentTime.dateFormat(options.format);
                };
                _this.currentTime = this.now();
            };

            _xdsoft_datetime = new XDSoft_datetime();

            mounth_picker
                .find('.xdsoft_today_button')
                .on('mousedown.xdsoft', function () {
                    datetimepicker.data('changed', true);
                    _xdsoft_datetime.setCurrentTime(0);
                    datetimepicker.trigger('afterOpen.xdsoft');
                }).on('dblclick.xdsoft', function () {
                input.val(_xdsoft_datetime.str());
                datetimepicker.trigger('close.xdsoft');
            });
            mounth_picker
                .find('.xdsoft_prev,.xdsoft_next')
                .on('mousedown.xdsoft', function () {
                    var $this = $(this),
                        timer = 0,
                        stop = false;

                    (function arguments_callee1(v) {
                        var month = _xdsoft_datetime.currentTime.getMonth();
                        if ($this.hasClass(options.next)) {
                            _xdsoft_datetime.nextMonth();
                        } else if ($this.hasClass(options.prev)) {
                            _xdsoft_datetime.prevMonth();
                        }
                        if (options.monthChangeSpinner) {
                            if (!stop) {
                                timer = setTimeout(arguments_callee1, v || 100);
                            }
                        }
                    }(500));

                    $([document.body, window]).on('mouseup.xdsoft', function arguments_callee2() {
                        clearTimeout(timer);
                        stop = true;
                        $([document.body, window]).off('mouseup.xdsoft', arguments_callee2);
                    });
                });

            timepicker
                .find('.xdsoft_prev,.xdsoft_next')
                .on('mousedown.xdsoft', function () {
                    var $this = $(this),
                        timer = 0,
                        stop = false,
                        period = 110;
                    (function arguments_callee4(v) {
                        var pheight = timeboxparent[0].clientHeight,
                            height = timebox[0].offsetHeight,
                            top = Math.abs(parseInt(timebox.css('marginTop'), 10));
                        if ($this.hasClass(options.next) && (height - pheight) - options.timeHeightInTimePicker >= top) {
                            timebox.css('marginTop', '-' + (top + options.timeHeightInTimePicker) + 'px');
                        } else if ($this.hasClass(options.prev) && top - options.timeHeightInTimePicker >= 0) {
                            timebox.css('marginTop', '-' + (top - options.timeHeightInTimePicker) + 'px');
                        }
                        timeboxparent.trigger('scroll_element.xdsoft_scroller', [Math.abs(parseInt(timebox.css('marginTop'), 10) / (height - pheight))]);
                        period = (period > 10) ? 10 : period - 10;
                        if (!stop) {
                            timer = setTimeout(arguments_callee4, v || period);
                        }
                    }(500));
                    $([document.body, window]).on('mouseup.xdsoft', function arguments_callee5() {
                        clearTimeout(timer);
                        stop = true;
                        $([document.body, window])
                            .off('mouseup.xdsoft', arguments_callee5);
                    });
                });

            xchangeTimer = 0;
            // base handler - generating a calendar and timepicker
            datetimepicker
                .on('xchange.xdsoft', function (event) {
                    clearTimeout(xchangeTimer);
                    xchangeTimer = setTimeout(function () {
                        var table = '',
                            start = new Date(_xdsoft_datetime.currentTime.getFullYear(), _xdsoft_datetime.currentTime.getMonth(), 1, 12, 0, 0),
                            i = 0,
                            j,
                            today = _xdsoft_datetime.now(),
                            maxDate = false,
                            minDate = false,
                            d,
                            y,
                            m,
                            w,
                            classes = [],
                            customDateSettings,
                            newRow = true,
                            time = '',
                            h = '',
                            line_time;

                        while (start.getDay() !== options.dayOfWeekStart) {
                            start.setDate(start.getDate() - 1);
                        }

                        table += '<table><thead><tr>';

                        if (options.weeks) {
                            table += '<th></th>';
                        }

                        for (j = 0; j < 7; j += 1) {
                            table += '<th>' + options.i18n[options.lang].dayOfWeek[(j + options.dayOfWeekStart) % 7] + '</th>';
                        }

                        table += '</tr></thead>';
                        table += '<tbody>';

                        if (options.maxDate !== false) {
                            maxDate = _xdsoft_datetime.strToDate(options.maxDate);
                            maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999);
                        }

                        if (options.minDate !== false) {
                            minDate = _xdsoft_datetime.strToDate(options.minDate);
                            minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                        }

                        while (i < _xdsoft_datetime.currentTime.countDaysInMonth() || start.getDay() !== options.dayOfWeekStart || _xdsoft_datetime.currentTime.getMonth() === start.getMonth()) {
                            classes = [];
                            i += 1;

                            d = start.getDate();
                            y = start.getFullYear();
                            m = start.getMonth();
                            w = _xdsoft_datetime.getWeekOfYear(start);

                            classes.push('xdsoft_date');

                            if (options.beforeShowDay && $.isFunction(options.beforeShowDay.call)) {
                                customDateSettings = options.beforeShowDay.call(datetimepicker, start);
                            } else {
                                customDateSettings = null;
                            }

                            if ((maxDate !== false && start > maxDate) || (minDate !== false && start < minDate) || (customDateSettings && customDateSettings[0] === false)) {
                                classes.push('xdsoft_disabled');
                            } else if (options.disabledDates.indexOf(start.dateFormat(options.formatDate)) !== -1) {
                                classes.push('xdsoft_disabled');
                            }

                            if (customDateSettings && customDateSettings[1] !== "") {
                                classes.push(customDateSettings[1]);
                            }

                            if (_xdsoft_datetime.currentTime.getMonth() !== m) {
                                classes.push('xdsoft_other_month');
                            }

                            if ((options.defaultSelect || datetimepicker.data('changed')) && _xdsoft_datetime.currentTime.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
                                classes.push('xdsoft_current');
                            }

                            if (today.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
                                classes.push('xdsoft_today');
                            }

                            if (start.getDay() === 0 || start.getDay() === 6 || ~options.weekends.indexOf(start.dateFormat(options.formatDate))) {
                                classes.push('xdsoft_weekend');
                            }

                            if (options.beforeShowDay && $.isFunction(options.beforeShowDay)) {
                                classes.push(options.beforeShowDay(start));
                            }

                            if (newRow) {
                                table += '<tr>';
                                newRow = false;
                                if (options.weeks) {
                                    table += '<th>' + w + '</th>';
                                }
                            }

                            table += '<td data-date="' + d + '" data-month="' + m + '" data-year="' + y + '"' + ' class="xdsoft_date xdsoft_day_of_week' + start.getDay() + ' ' + classes.join(' ') + '">' +
                                '<div>' + d + '</div>' +
                                '</td>';

                            if (start.getDay() === options.dayOfWeekStartPrev) {
                                table += '</tr>';
                                newRow = true;
                            }

                            start.setDate(d + 1);
                        }
                        table += '</tbody></table>';

                        calendar.html(table);

                        mounth_picker.find('.xdsoft_label span').eq(0).text(options.i18n[options.lang].months[_xdsoft_datetime.currentTime.getMonth()]);
                        mounth_picker.find('.xdsoft_label span').eq(1).text(_xdsoft_datetime.currentTime.getFullYear());

                        // generate timebox
                        time = '';
                        h = '';
                        m = '';
                        line_time = function line_time(h, m) {
                            var now = _xdsoft_datetime.now();
                            now.setHours(h);
                            h = parseInt(now.getHours(), 10);
                            now.setMinutes(m);
                            m = parseInt(now.getMinutes(), 10);
                            var optionDateTime = new Date(_xdsoft_datetime.currentTime);
                            optionDateTime.setHours(h);
                            optionDateTime.setMinutes(m);
                            classes = [];
                            if ((options.minDateTime !== false && options.minDateTime > optionDateTime) || (options.maxTime !== false && _xdsoft_datetime.strtotime(options.maxTime).getTime() < now.getTime()) || (options.minTime !== false && _xdsoft_datetime.strtotime(options.minTime).getTime() > now.getTime())) {
                                classes.push('xdsoft_disabled');
                            }
                            if ((options.initTime || options.defaultSelect || datetimepicker.data('changed')) && parseInt(_xdsoft_datetime.currentTime.getHours(), 10) === parseInt(h, 10) && (options.step > 59 || Math[options.roundTime](_xdsoft_datetime.currentTime.getMinutes() / options.step) * options.step === parseInt(m, 10))) {
                                if (options.defaultSelect || datetimepicker.data('changed')) {
                                    classes.push('xdsoft_current');
                                } else if (options.initTime) {
                                    classes.push('xdsoft_init_time');
                                }
                            }
                            if (parseInt(today.getHours(), 10) === parseInt(h, 10) && parseInt(today.getMinutes(), 10) === parseInt(m, 10)) {
                                classes.push('xdsoft_today');
                            }
                            time += '<div class="xdsoft_time ' + classes.join(' ') + '" data-hour="' + h + '" data-minute="' + m + '">' + now.dateFormat(options.formatTime) + '</div>';
                        };

                        if (!options.allowTimes || !$.isArray(options.allowTimes) || !options.allowTimes.length) {
                            for (i = 0, j = 0; i < (options.hours12 ? 12 : 24); i += 1) {
                                for (j = 0; j < 60; j += options.step) {
                                    h = (i < 10 ? '0' : '') + i;
                                    m = (j < 10 ? '0' : '') + j;
                                    line_time(h, m);
                                }
                            }
                        } else {
                            for (i = 0; i < options.allowTimes.length; i += 1) {
                                h = _xdsoft_datetime.strtotime(options.allowTimes[i]).getHours();
                                m = _xdsoft_datetime.strtotime(options.allowTimes[i]).getMinutes();
                                line_time(h, m);
                            }
                        }

                        timebox.html(time);

                        opt = '';
                        i = 0;

                        for (i = parseInt(options.yearStart, 10) + options.yearOffset; i <= parseInt(options.yearEnd, 10) + options.yearOffset; i += 1) {
                            opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getFullYear() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + i + '</div>';
                        }
                        yearselect.children().eq(0)
                            .html(opt);

                        for (i = 0, opt = ''; i <= 11; i += 1) {
                            opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getMonth() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + options.i18n[options.lang].months[i] + '</div>';
                        }
                        monthselect.children().eq(0).html(opt);
                        $(datetimepicker)
                            .trigger('generate.xdsoft');
                    }, 10);
                    event.stopPropagation();
                })
                .on('afterOpen.xdsoft', function () {
                    if (options.timepicker) {
                        var classType, pheight, height, top;
                        if (timebox.find('.xdsoft_current').length) {
                            classType = '.xdsoft_current';
                        } else if (timebox.find('.xdsoft_init_time').length) {
                            classType = '.xdsoft_init_time';
                        }
                        if (classType) {
                            pheight = timeboxparent[0].clientHeight;
                            height = timebox[0].offsetHeight;
                            top = timebox.find(classType).index() * options.timeHeightInTimePicker + 1;
                            if ((height - pheight) < top) {
                                top = height - pheight;
                            }
                            timeboxparent.trigger('scroll_element.xdsoft_scroller', [parseInt(top, 10) / (height - pheight)]);
                        } else {
                            timeboxparent.trigger('scroll_element.xdsoft_scroller', [0]);
                        }
                    }
                });

            timerclick = 0;
            calendar
                .on('click.xdsoft', 'td', function (xdevent) {
                    xdevent.stopPropagation();  // Prevents closing of Pop-ups, Modals and Flyouts in Bootstrap
                    timerclick += 1;
                    var $this = $(this),
                        currentTime = _xdsoft_datetime.currentTime;

                    if (currentTime === undefined || currentTime === null) {
                        _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                        currentTime = _xdsoft_datetime.currentTime;
                    }

                    if ($this.hasClass('xdsoft_disabled')) {
                        return false;
                    }

                    currentTime.setDate(1);
                    currentTime.setFullYear($this.data('year'));
                    currentTime.setMonth($this.data('month'));
                    currentTime.setDate($this.data('date'));

                    datetimepicker.trigger('select.xdsoft', [currentTime]);

                    input.val(_xdsoft_datetime.str());
                    if ((timerclick > 1 || (options.closeOnDateSelect === true || (options.closeOnDateSelect === 0 && !options.timepicker))) && !options.inline) {
                        datetimepicker.trigger('close.xdsoft');
                    }

                    if (options.onSelectDate && $.isFunction(options.onSelectDate)) {
                        options.onSelectDate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
                    }

                    datetimepicker.data('changed', true);
                    datetimepicker.trigger('xchange.xdsoft');
                    datetimepicker.trigger('changedatetime.xdsoft');
                    setTimeout(function () {
                        timerclick = 0;
                    }, 200);
                });

            timebox
                .on('click.xdsoft', 'div', function (xdevent) {
                    xdevent.stopPropagation();
                    var $this = $(this),
                        currentTime = _xdsoft_datetime.currentTime;

                    if (currentTime === undefined || currentTime === null) {
                        _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                        currentTime = _xdsoft_datetime.currentTime;
                    }

                    if ($this.hasClass('xdsoft_disabled')) {
                        return false;
                    }
                    currentTime.setHours($this.data('hour'));
                    currentTime.setMinutes($this.data('minute'));
                    datetimepicker.trigger('select.xdsoft', [currentTime]);

                    datetimepicker.data('input').val(_xdsoft_datetime.str());
                    if (!options.inline) {
                        datetimepicker.trigger('close.xdsoft');
                    }

                    if (options.onSelectTime && $.isFunction(options.onSelectTime)) {
                        options.onSelectTime.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
                    }
                    datetimepicker.data('changed', true);
                    datetimepicker.trigger('xchange.xdsoft');
                    datetimepicker.trigger('changedatetime.xdsoft');
                });


            datepicker
                .on('wheel.xdsoft', function (event) {
                    if (!options.scrollMonth) {
                        return true;
                    }
                    if (event.deltaY < 0) {
                        _xdsoft_datetime.nextMonth();
                    } else {
                        _xdsoft_datetime.prevMonth();
                    }
                    return false;
                });

            input
                .on('wheel.xdsoft', function (event) {
                    if (!options.scrollInput) {
                        return true;
                    }
                    if (!options.datepicker && options.timepicker) {
                        current_time_index = timebox.find('.xdsoft_current').length ? timebox.find('.xdsoft_current').eq(0).index() : 0;
                        if (current_time_index + event.deltaY >= 0 && current_time_index + event.deltaY < timebox.children().length) {
                            current_time_index += event.deltaY;
                        }
                        if (timebox.children().eq(current_time_index).length) {
                            timebox.children().eq(current_time_index).trigger('mousedown');
                        }
                        return false;
                    }
                    if (options.datepicker && !options.timepicker) {
                        datepicker.trigger(event, [event.deltaY, event.deltaX, event.deltaY]);
                        if (input.val) {
                            input.val(_xdsoft_datetime.str());
                        }
                        datetimepicker.trigger('changedatetime.xdsoft');
                        return false;
                    }
                });

            datetimepicker
                .on('changedatetime.xdsoft', function (event) {
                    if (options.onChangeDateTime && $.isFunction(options.onChangeDateTime)) {
                        var $input = datetimepicker.data('input');
                        options.onChangeDateTime.call(datetimepicker, _xdsoft_datetime.currentTime, $input, event);
                        delete options.value;
                        $input.trigger('change');
                    }
                })
                .on('generate.xdsoft', function () {
                    if (options.onGenerate && $.isFunction(options.onGenerate)) {
                        options.onGenerate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                    if (triggerAfterOpen) {
                        datetimepicker.trigger('afterOpen.xdsoft');
                        triggerAfterOpen = false;
                    }
                })
                .on('click.xdsoft', function (xdevent) {
                    xdevent.stopPropagation();
                });

            current_time_index = 0;

            setPos = function () {
                var offset = datetimepicker.data('input').offset(),
                    top = offset.top + datetimepicker.data('input')[0].offsetHeight - 1, left = offset.left,
                    position = "absolute";
                if (options.fixed) {
                    top -= $(window).scrollTop();
                    left -= $(window).scrollLeft();
                    position = "fixed";
                } else {
                    if (top + datetimepicker[0].offsetHeight > $(window).height() + $(window).scrollTop()) {
                        top = offset.top - datetimepicker[0].offsetHeight + 1;
                    }
                    if (top < 0) {
                        top = 0;
                    }
                    if (left + datetimepicker[0].offsetWidth > $(window).width()) {
                        left = $(window).width() - datetimepicker[0].offsetWidth;
                    }
                }
                datetimepicker.css({
                    left: left,
                    top: top,
                    position: position
                });
            };
            datetimepicker
                .on('open.xdsoft', function (event) {
                    var onShow = true;
                    if (options.onShow && $.isFunction(options.onShow)) {
                        onShow = options.onShow.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
                    }
                    if (onShow !== false) {
                        datetimepicker.show();
                        setPos();
                        $(window)
                            .off('resize.xdsoft', setPos)
                            .on('resize.xdsoft', setPos);

                        if (options.closeOnWithoutClick) {
                            $([document.body, window]).on('mousedown.xdsoft', function arguments_callee6() {
                                datetimepicker.trigger('close.xdsoft');
                                $([document.body, window]).off('mousedown.xdsoft', arguments_callee6);
                            });
                        }
                    }
                })
                .on('close.xdsoft', function (event) {
                    var onClose = true;
                    mounth_picker
                        .find('.xdsoft_month,.xdsoft_year')
                        .find('.xdsoft_select')
                        .hide();
                    if (options.onClose && $.isFunction(options.onClose)) {
                        onClose = options.onClose.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
                    }
                    if (onClose !== false && !options.opened && !options.inline) {
                        datetimepicker.hide();
                    }
                    event.stopPropagation();
                })
                .on('toggle.xdsoft', function (event) {
                    if (datetimepicker.is(':visible')) {
                        datetimepicker.trigger('close.xdsoft');
                    } else {
                        datetimepicker.trigger('open.xdsoft');
                    }
                })
                .data('input', input);

            timer = 0;
            timer1 = 0;

            datetimepicker.data('xdsoft_datetime', _xdsoft_datetime);
            datetimepicker.setOptions(options);

            function getCurrentValue() {

                var ct = false, time;

                if (options.startDate) {
                    ct = _xdsoft_datetime.strToDate(options.startDate);
                } else {
                    ct = options.value || ((input && input.val && input.val()) ? input.val() : '');
                    if (ct) {
                        ct = _xdsoft_datetime.strToDateTime(ct);
                    } else if (options.defaultDate) {
                        ct = _xdsoft_datetime.strToDate(options.defaultDate);
                        if (options.defaultTime) {
                            time = _xdsoft_datetime.strtotime(options.defaultTime);
                            ct.setHours(time.getHours());
                            ct.setMinutes(time.getMinutes());
                        }
                    }
                }

                if (ct && _xdsoft_datetime.isValidDate(ct)) {
                    datetimepicker.data('changed', true);
                } else {
                    ct = '';
                }

                return ct || 0;
            }

            _xdsoft_datetime.setCurrentTime(getCurrentValue());

            input
                .data('xdsoft_datetimepicker', datetimepicker)
                .on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function (event) {
                    if (input.is(':disabled') || (input.data('xdsoft_datetimepicker').is(':visible') && options.closeOnInputClick)) {
                        return;
                    }
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        if (input.is(':disabled')) {
                            return;
                        }

                        triggerAfterOpen = true;
                        _xdsoft_datetime.setCurrentTime(getCurrentValue());

                        datetimepicker.trigger('open.xdsoft');
                    }, 100);
                })
                .on('keydown.xdsoft', function (event) {
                    var val = this.value, elementSelector,
                        key = event.which;
                    if ([ENTER].indexOf(key) !== -1 && options.enterLikeTab) {
                        elementSelector = $("input:visible,textarea:visible");
                        datetimepicker.trigger('close.xdsoft');
                        elementSelector.eq(elementSelector.index(this) + 1).focus();
                        return false;
                    }
                    if ([TAB].indexOf(key) !== -1) {
                        datetimepicker.trigger('close.xdsoft');
                        return true;
                    }
                });
        };
        destroyDateTimePicker = function (input) {
            var datetimepicker = input.data('xdsoft_datetimepicker');
            if (datetimepicker) {
                datetimepicker.data('xdsoft_datetime', null);
                datetimepicker.remove();
                input
                    .data('xdsoft_datetimepicker', null)
                    .off('.xdsoft');
                $(window).off('resize.xdsoft');
                $([window, document.body]).off('mousedown.xdsoft');
                if (input.unmousewheel) {
                    input.unmousewheel();
                }
            }
        };
        $(document)
            .off('keydown.xdsoftctrl keyup.xdsoftctrl')
            .on('keydown.xdsoftctrl', function (e) {
                if (e.keyCode === CTRLKEY) {
                    ctrlDown = true;
                }
            })
            .on('keyup.xdsoftctrl', function (e) {
                if (e.keyCode === CTRLKEY) {
                    ctrlDown = false;
                }
            });
        return this.each(function () {
            var datetimepicker = $(this).data('xdsoft_datetimepicker');
            if (datetimepicker) {
                if ($.type(opt) === 'string') {
                    switch (opt) {
                        case 'show':
                            $(this).select().focus();
                            datetimepicker.trigger('open.xdsoft');
                            break;
                        case 'hide':
                            datetimepicker.trigger('close.xdsoft');
                            break;
                        case 'toggle':
                            datetimepicker.trigger('toggle.xdsoft');
                            break;
                        case 'destroy':
                            destroyDateTimePicker($(this));
                            break;
                        case 'reset':
                            this.value = this.defaultValue;
                            if (!this.value || !datetimepicker.data('xdsoft_datetime').isValidDate(Date.parseDate(this.value, options.format))) {
                                datetimepicker.data('changed', false);
                            }
                            datetimepicker.data('xdsoft_datetime').setCurrentTime(this.value);
                            break;
                    }
                } else {
                    datetimepicker
                        .setOptions(opt);
                }
                return 0;
            }
            if ($.type(opt) !== 'string') {
                if (!options.lazyInit || options.open || options.inline) {
                    createDateTimePicker($(this));
                } else {
                    lazyInit($(this));
                }
            }
        });
    };
    $.fn.datetimepicker.defaults = default_options;
    /*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
     * Licensed under the MIT License (LICENSE.txt).
     *
     * Version: 3.1.12
     *
     * Requires: jQuery 1.2.2+
     */
    (function (a) {
        function b(b) {
            var g = b || window.event, h = i.call(arguments, 1), j = 0, l = 0, m = 0, n = 0, o = 0, p = 0;
            if (b = a.event.fix(g), b.type = "mousewheel", "detail" in g && (m = -1 * g.detail), "wheelDelta" in g && (m = g.wheelDelta), "wheelDeltaY" in g && (m = g.wheelDeltaY), "wheelDeltaX" in g && (l = -1 * g.wheelDeltaX), "axis" in g && g.axis === g.HORIZONTAL_AXIS && (l = -1 * m, m = 0), j = 0 === m ? l : m, "deltaY" in g && (m = -1 * g.deltaY, j = m), "deltaX" in g && (l = g.deltaX, 0 === m && (j = -1 * l)), 0 !== m || 0 !== l) {
                if (1 === g.deltaMode) {
                    var q = a.data(this, "mousewheel-line-height");
                    j *= q, m *= q, l *= q
                } else if (2 === g.deltaMode) {
                    var r = a.data(this, "mousewheel-page-height");
                    j *= r, m *= r, l *= r
                }
                if (n = Math.max(Math.abs(m), Math.abs(l)), (!f || f > n) && (f = n, d(g, n) && (f /= 40)), d(g, n) && (j /= 40, l /= 40, m /= 40), j = Math[j >= 1 ? "floor" : "ceil"](j / f), l = Math[l >= 1 ? "floor" : "ceil"](l / f), m = Math[m >= 1 ? "floor" : "ceil"](m / f), k.settings.normalizeOffset && this.getBoundingClientRect) {
                    var s = this.getBoundingClientRect();
                    o = b.clientX - s.left, p = b.clientY - s.top
                }
                return b.deltaX = l, b.deltaY = m, b.deltaFactor = f, b.offsetX = o, b.offsetY = p, b.deltaMode = 0, h.unshift(b, j, l, m), e && clearTimeout(e), e = setTimeout(c, 200), (a.event.dispatch || a.event.handle).apply(this, h)
            }
        }

        function c() {
            f = null
        }

        function d(a, b) {
            return k.settings.adjustOldDeltas && "mousewheel" === a.type && b % 120 === 0
        }

        var e, f, g = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
            h = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
            i = Array.prototype.slice;
        if (a.event.fixHooks) for (var j = g.length; j;) a.event.fixHooks[g[--j]] = a.event.mouseHooks;
        var k = a.event.special.mousewheel = {
            version: "3.1.12", setup: function () {
                if (this.addEventListener) for (var c = h.length; c;) this.addEventListener(h[--c], b, !1); else this.onmousewheel = b;
                a.data(this, "mousewheel-line-height", k.getLineHeight(this)), a.data(this, "mousewheel-page-height", k.getPageHeight(this))
            }, teardown: function () {
                if (this.removeEventListener) for (var c = h.length; c;) this.removeEventListener(h[--c], b, !1); else this.onmousewheel = null;
                a.removeData(this, "mousewheel-line-height"), a.removeData(this, "mousewheel-page-height")
            }, getLineHeight: function (b) {
                var c = a(b), d = c["offsetParent" in a.fn ? "offsetParent" : "parent"]();
                return d.length || (d = a("body")), parseInt(d.css("fontSize"), 10) || parseInt(c.css("fontSize"), 10) || 16
            }, getPageHeight: function (b) {
                return a(b).height()
            }, settings: {adjustOldDeltas: !0, normalizeOffset: !0}
        };
        a.fn.extend({
            mousewheel: function (a) {
                return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
            }, unmousewheel: function (a) {
                return this.unbind("mousewheel", a)
            }
        })
    })($);

// Parse and Format Library
//http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/
    /*
     * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
     *
     * This program is free software; you can redistribute it and/or modify it
     * under the terms of the GNU Lesser General Public License as published by the
     * Free Software Foundation, version 2.1.
     *
     * This program is distributed in the hope that it will be useful, but WITHOUT
     * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
     * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
     * details.
     */
    Date.parseFunctions = {count: 0};
    Date.parseRegexes = [];
    Date.formatFunctions = {count: 0};
    Date.prototype.dateFormat = function (b) {
        if (b == "unixtime") {
            return parseInt(this.getTime() / 1000);
        }
        if (Date.formatFunctions[b] == null) {
            Date.createNewFormat(b);
        }
        var a = Date.formatFunctions[b];
        return this[a]();
    };
    Date.createNewFormat = function (format) {
        var funcName = "format" + Date.formatFunctions.count++;
        Date.formatFunctions[format] = funcName;
        var code = "Date.prototype." + funcName + " = function() {return ";
        var special = false;
        var ch = "";
        for (var i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else {
                if (special) {
                    special = false;
                    code += "'" + String.escape(ch) + "' + ";
                } else {
                    code += Date.getFormatCode(ch);
                }
            }
        }
        eval(code.substring(0, code.length - 3) + ";}");
    };
    Date.getFormatCode = function (a) {
        switch (a) {
            case"d":
                return "String.leftPad(this.getDate(), 2, '0') + ";
            case"D":
                return "Date.dayNames[this.getDay()].substring(0, 3) + ";
            case"j":
                return "this.getDate() + ";
            case"l":
                return "Date.dayNames[this.getDay()] + ";
            case"S":
                return "this.getSuffix() + ";
            case"w":
                return "this.getDay() + ";
            case"z":
                return "this.getDayOfYear() + ";
            case"W":
                return "this.getWeekOfYear() + ";
            case"F":
                return "Date.monthNames[this.getMonth()] + ";
            case"m":
                return "String.leftPad(this.getMonth() + 1, 2, '0') + ";
            case"M":
                return "Date.monthNames[this.getMonth()].substring(0, 3) + ";
            case"n":
                return "(this.getMonth() + 1) + ";
            case"t":
                return "this.getDaysInMonth() + ";
            case"L":
                return "(this.isLeapYear() ? 1 : 0) + ";
            case"Y":
                return "this.getFullYear() + ";
            case"y":
                return "('' + this.getFullYear()).substring(2, 4) + ";
            case"a":
                return "(this.getHours() < 12 ? 'am' : 'pm') + ";
            case"A":
                return "(this.getHours() < 12 ? 'AM' : 'PM') + ";
            case"g":
                return "((this.getHours() %12) ? this.getHours() % 12 : 12) + ";
            case"G":
                return "this.getHours() + ";
            case"h":
                return "String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";
            case"H":
                return "String.leftPad(this.getHours(), 2, '0') + ";
            case"i":
                return "String.leftPad(this.getMinutes(), 2, '0') + ";
            case"s":
                return "String.leftPad(this.getSeconds(), 2, '0') + ";
            case"O":
                return "this.getGMTOffset() + ";
            case"T":
                return "this.getTimezone() + ";
            case"Z":
                return "(this.getTimezoneOffset() * -60) + ";
            default:
                return "'" + String.escape(a) + "' + ";
        }
    };
    Date.parseDate = function (a, c) {
        if (c == "unixtime") {
            return new Date(!isNaN(parseInt(a)) ? parseInt(a) * 1000 : 0);
        }
        if (Date.parseFunctions[c] == null) {
            Date.createParser(c);
        }
        var b = Date.parseFunctions[c];
        return Date[b](a);
    };
    Date.createParser = function (format) {
        var funcName = "parse" + Date.parseFunctions.count++;
        var regexNum = Date.parseRegexes.length;
        var currentGroup = 1;
        Date.parseFunctions[format] = funcName;
        var code = "Date." + funcName + " = function(input) {\nvar y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, z = -1;\nvar d = new Date();\ny = d.getFullYear();\nm = d.getMonth();\nd = d.getDate();\nvar results = input.match(Date.parseRegexes[" + regexNum + "]);\nif (results && results.length > 0) {";
        var regex = "";
        var special = false;
        var ch = "";
        for (var i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else {
                if (special) {
                    special = false;
                    regex += String.escape(ch);
                } else {
                    var obj = Date.formatCodeToRegex(ch, currentGroup);
                    currentGroup += obj.g;
                    regex += obj.s;
                    if (obj.g && obj.c) {
                        code += obj.c;
                    }
                }
            }
        }
        code += "if (y > 0 && z > 0){\nvar doyDate = new Date(y,0);\ndoyDate.setDate(z);\nm = doyDate.getMonth();\nd = doyDate.getDate();\n}";
        code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n{return new Date(y, m, d, h, i, s);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n{return new Date(y, m, d, h, i);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0)\n{return new Date(y, m, d, h);}\nelse if (y > 0 && m >= 0 && d > 0)\n{return new Date(y, m, d);}\nelse if (y > 0 && m >= 0)\n{return new Date(y, m);}\nelse if (y > 0)\n{return new Date(y);}\n}return null;}";
        Date.parseRegexes[regexNum] = new RegExp("^" + regex + "$");
        eval(code);
    };
    Date.formatCodeToRegex = function (b, a) {
        switch (b) {
            case"D":
                return {g: 0, c: null, s: "(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"};
            case"j":
            case"d":
                return {g: 1, c: "d = parseInt(results[" + a + "], 10);\n", s: "(\\d{1,2})"};
            case"l":
                return {g: 0, c: null, s: "(?:" + Date.dayNames.join("|") + ")"};
            case"S":
                return {g: 0, c: null, s: "(?:st|nd|rd|th)"};
            case"w":
                return {g: 0, c: null, s: "\\d"};
            case"z":
                return {g: 1, c: "z = parseInt(results[" + a + "], 10);\n", s: "(\\d{1,3})"};
            case"W":
                return {g: 0, c: null, s: "(?:\\d{2})"};
            case"F":
                return {
                    g: 1,
                    c: "m = parseInt(Date.monthNumbers[results[" + a + "].substring(0, 3)], 10);\n",
                    s: "(" + Date.monthNames.join("|") + ")"
                };
            case"M":
                return {
                    g: 1,
                    c: "m = parseInt(Date.monthNumbers[results[" + a + "]], 10);\n",
                    s: "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
                };
            case"n":
            case"m":
                return {g: 1, c: "m = parseInt(results[" + a + "], 10) - 1;\n", s: "(\\d{1,2})"};
            case"t":
                return {g: 0, c: null, s: "\\d{1,2}"};
            case"L":
                return {g: 0, c: null, s: "(?:1|0)"};
            case"Y":
                return {g: 1, c: "y = parseInt(results[" + a + "], 10);\n", s: "(\\d{4})"};
            case"y":
                return {
                    g: 1,
                    c: "var ty = parseInt(results[" + a + "], 10);\ny = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
                    s: "(\\d{1,2})"
                };
            case"a":
                return {
                    g: 1,
                    c: "if (results[" + a + "] == 'am') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",
                    s: "(am|pm)"
                };
            case"A":
                return {
                    g: 1,
                    c: "if (results[" + a + "] == 'AM') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",
                    s: "(AM|PM)"
                };
            case"g":
            case"G":
            case"h":
            case"H":
                return {g: 1, c: "h = parseInt(results[" + a + "], 10);\n", s: "(\\d{1,2})"};
            case"i":
                return {g: 1, c: "i = parseInt(results[" + a + "], 10);\n", s: "(\\d{2})"};
            case"s":
                return {g: 1, c: "s = parseInt(results[" + a + "], 10);\n", s: "(\\d{2})"};
            case"O":
                return {g: 0, c: null, s: "[+-]\\d{4}"};
            case"T":
                return {g: 0, c: null, s: "[A-Z]{3}"};
            case"Z":
                return {g: 0, c: null, s: "[+-]\\d{1,5}"};
            default:
                return {g: 0, c: null, s: String.escape(b)};
        }
    };
    Date.prototype.getTimezone = function () {
        return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3");
    };
    Date.prototype.getGMTOffset = function () {
        return (this.getTimezoneOffset() > 0 ? "-" : "+") + String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset()) / 60), 2, "0") + String.leftPad(Math.abs(this.getTimezoneOffset()) % 60, 2, "0");
    };
    Date.prototype.getDayOfYear = function () {
        var a = 0;
        Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
        for (var b = 0; b < this.getMonth(); ++b) {
            a += Date.daysInMonth[b];
        }
        return a + this.getDate();
    };
    Date.prototype.getWeekOfYear = function () {
        var b = this.getDayOfYear() + (4 - this.getDay());
        var a = new Date(this.getFullYear(), 0, 1);
        var c = (7 - a.getDay() + 4);
        return String.leftPad(Math.ceil((b - c) / 7) + 1, 2, "0");
    };
    Date.prototype.isLeapYear = function () {
        var a = this.getFullYear();
        return ((a & 3) == 0 && (a % 100 || (a % 400 == 0 && a)));
    };
    Date.prototype.getFirstDayOfMonth = function () {
        var a = (this.getDay() - (this.getDate() - 1)) % 7;
        return (a < 0) ? (a + 7) : a;
    };
    Date.prototype.getLastDayOfMonth = function () {
        var a = (this.getDay() + (Date.daysInMonth[this.getMonth()] - this.getDate())) % 7;
        return (a < 0) ? (a + 7) : a;
    };
    Date.prototype.getDaysInMonth = function () {
        Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
        return Date.daysInMonth[this.getMonth()];
    };
    Date.prototype.getSuffix = function () {
        switch (this.getDate()) {
            case 1:
            case 21:
            case 31:
                return "st";
            case 2:
            case 22:
                return "nd";
            case 3:
            case 23:
                return "rd";
            default:
                return "th";
        }
    };
    String.escape = function (a) {
        return a.replace(/('|\\)/g, "\\$1");
    };
    String.leftPad = function (d, b, c) {
        var a = new String(d);
        if (c == null) {
            c = " ";
        }
        while (a.length < b) {
            a = c + a;
        }
        return a;
    };
    Date.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    Date.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    Date.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    Date.y2kYear = 50;
    Date.monthNumbers = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11
    };
    Date.patterns = {
        ISO8601LongPattern: "Y-m-d H:i:s",
        ISO8601ShortPattern: "Y-m-d",
        ShortDatePattern: "n/j/Y",
        LongDatePattern: "l, F d, Y",
        FullDateTimePattern: "l, F d, Y g:i:s A",
        MonthDayPattern: "F d",
        ShortTimePattern: "g:i A",
        LongTimePattern: "g:i:s A",
        SortableDateTimePattern: "Y-m-d\\TH:i:s",
        UniversalSortableDateTimePattern: "Y-m-d H:i:sO",
        YearMonthPattern: "F, Y"
    };
});
/**
 * jquery.unique-element-id.js
 *
 * A simple jQuery plugin to get a unique ID for
 * any HTML element
 *
 * Usage:
 *    $('some_element_selector').uid();
 *
 * by Jamie Rumbelow <jamie@jamierumbelow.net>
 * http://jamieonsoftware.com
 * Copyright (c)2011 Jamie Rumbelow
 *
 * Licensed under the MIT license (http://www.opensource.org/licenses/MIT)
 */

N2R('$', function ($) {
    /**
     * Generate a new unqiue ID
     */
    function generateUniqueId(prefix) {

        // Return a unique ID
        return prefix + Math.floor((1 + Math.random()) * 0x1000000000000)
            .toString(16);
    }

    /**
     * Get a unique ID for an element, ensuring that the
     * element has an id="" attribute
     */
    $.fn.uid = function (prefix) {
        var id = null;
        prefix = prefix || "n";
        do {
            id = generateUniqueId(prefix);
        } while ($('#' + id).length > 0);
        return id;
    };

    $.fn.generateUniqueClass = function (prefix) {
        var id = null;
        prefix = prefix || "n";
        do {
            id = generateUniqueId(prefix);
        } while ($('.' + id).length > 0);
        return id;
    };
});
N2D('nUIAutocomplete', ['nUIWidgetBase'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments nUIWidgetBase
     * @this nUIAutocomplete
     */
    function nUIAutocomplete(element, options) {

        this.isRendered = false;

        this.element = $(element);

        this.widgetName = this.widgetName || 'nUIAutocomplete';
        this.widgetEventPrefix = "autocomplete";

        this.isActive = false;
        this.allowBlur = true;

        this.options = $.extend({
            appendTo: 'body',
            source: null,
            select: null,
            positionTo: 'self',
            x: 0,
            y: 0
        }, this.options, options);

        N2Classes.nUIWidgetBase.prototype.constructor.apply(this, arguments);

        this.element.on({
            focus: $.proxy(this.focus, this),
            blur: $.proxy(this.blur, this)
        });

        if (this.options.positionTo === 'self') {
            this.positionTo = this.element;
        } else {
            this.positionTo = this.element.closest(this.options.positionTo);
        }
    }

    nUIAutocomplete.prototype = Object.create(N2Classes.nUIWidgetBase.prototype);
    nUIAutocomplete.prototype.constructor = nUIAutocomplete;

    nUIAutocomplete.prototype.focus = function (e) {
        if (this.isActive === false) {
            this.showList(e);
            this.element.on('click.' + this.widgetEventPrefix, $.proxy(this.showList, this));

            this.isActive = true;
        }
    };

    nUIAutocomplete.prototype.showList = function (e) {
        if (typeof this.options.appendTo === 'function') {
            this.options.appendTo = this.options.appendTo.call(window);
        } else {
            this.options.appendTo = $(this.options.appendTo);
        }
        var $list = this.getList().appendTo(this.options.appendTo);

        var appendToOffset = {
                left: 0,
                top: 0
            },
            offset = this.positionTo.offset();

        if (!this.options.appendTo.is($('body'))) {
            appendToOffset = this.options.appendTo.offset();
            appendToOffset.top -= this.options.appendTo.scrollTop();

            $list.css('height', '');
            var listHeight = $list.height();

            var paneRect = this.options.appendTo[0].getBoundingClientRect(),
                fieldRect = this.positionTo[0].getBoundingClientRect(),
                newListHeight = Math.min(paneRect.top + paneRect.height - fieldRect.top - fieldRect.height - 10, listHeight);

            if (newListHeight < 100 && newListHeight < listHeight) {
                newListHeight = Math.min(fieldRect.top - paneRect.top - 10, listHeight);
                appendToOffset.top = appendToOffset.top + fieldRect.height + newListHeight;
            }

            $list.css('height', newListHeight);
        }
        $list.css({
            left: offset.left - appendToOffset.left + this.element.position().left + this.options.x,
            top: offset.top + this.positionTo.outerHeight() - appendToOffset.top + this.options.y,
            minWidth: this.element.outerWidth(true) + 'px'
        });

        /**
         * If scrollbar dragged with mouse prevent the list to disappear
         */
        $list.off('.' + this.widgetEventPrefix)
            .on('mousedown.' + this.widgetEventPrefix, $.proxy(function (e) {
                if ($(e.target).is($list)) {
                    this.element.parent().addClass('focus2');
                    this.allowBlur = false;
                }
            }, this))
            .on('mouseup.' + this.widgetEventPrefix, $.proxy(function (e) {
                if ($(e.target).is($list)) {
                    this.allowBlur = true;
                    this.element.focus();
                    this.element.parent().removeClass('focus2');
                }
            }, this));
    };

    nUIAutocomplete.prototype.blur = function (e) {
        if (this.allowBlur) {
            this.hide();
            this.element.off('.' + this.widgetEventPrefix);
        }
    };

    nUIAutocomplete.prototype.hide = function () {
        this.$list.detach();
        this.isActive = false;
    };

    nUIAutocomplete.prototype.getList = function () {
        if (!this.isRendered) {
            this.$list = $('<ul class="n2 nui-autocomplete"></ul>')
                .attr({
                    "unselectable": "on"
                })
                .on({
                    mousedown: $.proxy(N2Classes.WindowManager.setMouseDownArea, null, 'nUIAutocomplete'),
                    'wheel': function (e) {
                        e.stopPropagation();
                    }
                });
            var options = this.options.source.call(this, this.ui());
            for (var i = 0; i < options.length; i++) {
                $('<li class="nui-menu-item"><div tabindex="-1">' + options[i] + '</div></li>')
                    .on({
                        mousedown: function (e) {
                            e.preventDefault();
                        },
                        click: $.proxy(function (value, e) {
                            this._trigger('select', e, {
                                value: value
                            });
                            this.hide();
                        }, this, options[i])
                    })
                    .appendTo(this.$list);
            }
            this.isRendered = true;
        }

        return this.$list;
    };

    nUIAutocomplete.prototype.ui = function () {
        return {};
    };

    N2Classes.nUIWidgetBase.register('nUIAutocomplete');

    return nUIAutocomplete;
});
N2D('nUIDraggableBar', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param element
     * @param options
     */
    function nUIDraggableBar(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUIDraggable';
        this.widgetEventPrefix = "drag";

        this.options = $.extend({
            // Callbacks
            drag: null,
            start: null,
            stop: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this._mouseInit();
    }

    nUIDraggableBar.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUIDraggableBar.prototype.constructor = nUIDraggableBar;

    nUIDraggableBar.prototype._mouseStart = function (event) {

        this.currentData = this.originalData = {
            margin: parseInt(this.element.css(n2const.rtl.marginLeft))
        };
        this.originalMousePosition = {left: event.pageX};

        this.element.addClass("nui-draggable-dragging");

        this._trigger("start", event, this.ui());

        this._mouseDrag(event);
        return true;
    };

    nUIDraggableBar.prototype._mouseDrag = function (event) {
        var dx = (event.pageX - this.originalMousePosition.left) || 0;
        this.currentData = {};

        if (!n2const.rtl.isRtl) {
            this.currentData.margin = Math.max(0, this.originalData.margin + dx);
        } else {
            this.currentData.margin = Math.max(0, this.originalData.margin - dx);
        }

        this._trigger("drag", event, this.ui());

        this.element.css(n2const.rtl.marginLeft, this.currentData.margin);

        return true;
    };


    nUIDraggableBar.prototype._mouseStop = function (event) {

        this._trigger("stop", event, this.ui());

        return true;
    };

    nUIDraggableBar.prototype.ui = function () {
        return {
            currentData: this.currentData
        };
    };

    N2Classes.nUIWidgetBase.register('nUIDraggableBar');

    return nUIDraggableBar;
});
N2D('nUIDraggableDelay', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param element
     * @param options
     */
    function nUIDraggableDelay(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUIDraggable';
        this.widgetEventPrefix = "drag";

        this.options = $.extend({
            // Callbacks
            drag: null,
            start: null,
            stop: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this._mouseInit();
    }

    nUIDraggableDelay.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUIDraggableDelay.prototype.constructor = nUIDraggableDelay;

    nUIDraggableDelay.prototype._mouseStart = function (event) {

        this.currentData = this.originalData = {
            width: parseInt(this.element.width())
        };
        this.originalMousePosition = {left: event.pageX};

        this.element.addClass("nui-draggable-dragging");

        this._trigger("start", event, this.ui());

        this._mouseDrag(event);
        return true;
    };

    nUIDraggableDelay.prototype._mouseDrag = function (event) {
        var dx = (event.pageX - this.originalMousePosition.left) || 0;
        this.currentData = {};

        if (!n2const.rtl.isRtl) {
            this.currentData.width = Math.max(0, this.originalData.width + dx);
        } else {
            this.currentData.width = Math.max(0, this.originalData.width - dx);
        }

        this._trigger("drag", event, this.ui());

        this.element.width(this.currentData.width);

        return true;
    };


    nUIDraggableDelay.prototype._mouseStop = function (event) {

        this._trigger("stop", event, this.ui());

        return true;
    };

    nUIDraggableDelay.prototype.ui = function () {
        return {
            currentData: this.currentData
        };
    };

    N2Classes.nUIWidgetBase.register('nUIDraggableDelay');

    return nUIDraggableDelay;
});
N2D('nUIDraggable', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments nUIMouse
     * @this nUIDraggable
     */
    function nUIDraggable(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUIDraggable';
        this.widgetEventPrefix = "drag";

        this.options = $.extend({
            addClasses: true,
            appendTo: "parent",
            axis: false,
            containment: false,
            cursor: "auto",
            cursorAt: false,
            handle: false,
            helper: "original",
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,

            // Callbacks
            drag: null,
            start: null,
            stop: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUIDraggable.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUIDraggable.prototype.constructor = nUIDraggable;

    nUIDraggable.prototype.create = function () {

        if (this.options.helper === "original") {
            this._setPositionRelative();
        }
        if (this.options.addClasses) {
            this.element.addClass("nui-draggable");
        }
        this._setHandleClassName();

        this._mouseInit();
    };

    nUIDraggable.prototype._setPositionRelative = function () {
        if (!( /^(?:r|a|f)/ ).test(this.element.css("position"))) {
            this.element[0].style.position = "relative";
        }
    };

    nUIDraggable.prototype._getHandle = function (event) {
        return this.options.handle ?
            !!$(event.target).closest(this.element.find(this.options.handle)).length :
            true;
    };

    nUIDraggable.prototype._setHandleClassName = function () {
        this.handleElement = this.options.handle ?
            this.element.find(this.options.handle) : this.element;
        this.handleElement.addClass("nui-draggable-handle");
    };

    nUIDraggable.prototype._mouseCapture = function (event) {
        var o = this.options;
        // Among others, prevent a drag on a resizable-handle
        if (this.helper || o.disabled ||
            $(event.target).closest(".nui-resizable-handle").length > 0) {
            return false;
        }

        //Quit if we're not on a valid handle
        this.handle = this._getHandle(event);
        if (!this.handle) {
            return false;
        }

        this._blurActiveElement(event);

        return true;
    };

    nUIDraggable.prototype.cancel = function () {

        if (this.helper.is(".nui-draggable-dragging")) {
            this._mouseUp(new $.Event("mouseup", {target: this.element[0]}));
        } else {
            this._clear();
        }

        return this;

    };

    $.fn.nuiScrollParent = function (includeHidden) {
        var position = this.css("position"),
            excludeStaticParent = position === "absolute",
            overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
            scrollParent = this.parents().filter(function () {
                var parent = $(this);
                if (excludeStaticParent && parent.css("position") === "static") {
                    return false;
                }
                return overflowRegex.test(parent.css("overflow") + parent.css("overflow-y") +
                    parent.css("overflow-x"));
            }).eq(0);

        return position === "fixed" || !scrollParent.length ?
            $(this[0].ownerDocument || document) :
            scrollParent;
    };

    nUIDraggable.prototype._mouseStart = function (event) {
        var o = this.options;
        //Create and append the visible helper
        this.helper = this._createHelper(event);

        this.helper.addClass("nui-draggable-dragging");

        //Cache the helper size
        this._cacheHelperProportions();

        /*
         * - Position generation -
         * This block generates everything position related - it's the core of draggables.
         */

        //Cache the margins of the original element
        this._cacheMargins();

        //Store the helper's css position
        this.cssPosition = this.helper.css("position");
        this.scrollParent = this.helper.nuiScrollParent(true);
        this.offsetParent = this.helper.offsetParent();
        this.hasFixedAncestor = this.helper.parents().filter(function () {
                return $(this).css("position") === "fixed";
            }).length > 0;

        //The element's absolute position on the page minus margins
        this.positionAbs = this.element.offset();
        this._refreshOffsets(event);

        //Generate the original position
        this.originalPosition = this.position = this._generatePosition(event, false);
        this.originalPageX = event.pageX;
        this.originalPageY = event.pageY;

        //Adjust the mouse offset relative to the helper if "cursorAt" is supplied
        ( o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt) );

        //Set a containment if given in the options
        this._setContainment();

        //Trigger event + callbacks
        if (this._trigger("start", event) === false) {
            this._clear();
            return false;
        }

        //Recache the helper size
        this._cacheHelperProportions();


        // Execute the drag once - this causes the helper not to be visible before getting its
        // correct position
        this._mouseDrag(event, true);

        return true;
    };

    nUIDraggable.prototype._mouseDrag = function (event, noPropagation) {

        // reset any necessary cached properties (see #5009)
        if (this.hasFixedAncestor) {
            this.offset.parent = this._getParentOffset();
        }

        //Compute the helpers position
        this.position = this._generatePosition(event, true);
        this.positionAbs = this._convertPositionTo("absolute");

        //Call plugins and callbacks and use the resulting position if something is returned
        if (!noPropagation) {
            var ui = this._uiHash();
            if (this._trigger("drag", event, ui) === false) {
                this._mouseUp(new $.Event("mouseup", event));
                return false;
            }
            this.position = ui.position;
        }

        this.helper[0].style.left = this.position.left + "px";
        this.helper[0].style.top = this.position.top + "px";

        return false;
    };

    nUIDraggable.prototype._mouseStop = function (event) {

        if (this._trigger("stop", event) !== false) {
            this._clear();
        }

        return false;
    };

    nUIDraggable.prototype._mouseUp = function (event) {

        // Only need to focus if the event occurred on the draggable itself, see #10527
        if (this.handleElement.is(event.target)) {

            // The interaction is over; whether or not the click resulted in a drag,
            // focus the element
            this.element.trigger("focus");
        }

        return N2Classes.nUIMouse.prototype._mouseUp.call(this, event);
    };

    nUIDraggable.prototype._trigger = function (type, event, ui) {
        ui = ui || this._uiHash();

        return N2Classes.nUIWidgetBase.prototype._trigger.call(this, type, event, ui);
    };

    nUIDraggable.prototype._uiHash = function () {
        return {
            helper: this.helper,
            position: this.position,
            originalPosition: this.originalPosition
        };
    };

    nUIDraggable.prototype._createHelper = function (event) {

        var o = this.options,
            helperIsFunction = $.isFunction(o.helper),
            helper = helperIsFunction ?
                $(o.helper.apply(this.element[0], [event])) :
                ( o.helper === "clone" ?
                    this.element.clone().removeAttr("id") :
                    this.element );

        if (!helper.parents("body").length) {
            helper.appendTo(( o.appendTo === "parent" ?
                this.element[0].parentNode :
                o.appendTo ));
        }

        // Http://bugs.jqueryui.com/ticket/9446
        // a helper function can return the original element
        // which wouldn't have been set to relative in _create
        if (helperIsFunction && helper[0] === this.element[0]) {
            this._setPositionRelative();
        }

        if (helper[0] !== this.element[0] && !( /(fixed|absolute)/ ).test(helper.css("position"))) {
            helper.css("position", "absolute");
        }

        return helper;

    };

    nUIDraggable.prototype._cacheHelperProportions = function () {
        this.helperProportions = {
            width: this.helper.outerWidth(),
            height: this.helper.outerHeight()
        };
    };

    nUIDraggable.prototype._cacheMargins = function () {
        this.margins = {
            left: ( parseInt(this.element.css("marginLeft"), 10) || 0 ),
            top: ( parseInt(this.element.css("marginTop"), 10) || 0 ),
            right: ( parseInt(this.element.css("marginRight"), 10) || 0 ),
            bottom: ( parseInt(this.element.css("marginBottom"), 10) || 0 )
        };
    };

    nUIDraggable.prototype._refreshOffsets = function (event) {
        this.offset = {
            top: this.positionAbs.top - this.margins.top,
            left: this.positionAbs.left - this.margins.left,
            scroll: false,
            parent: this._getParentOffset(),
            relative: this._getRelativeOffset()
        };

        this.offset.click = {
            left: event.pageX - this.offset.left,
            top: event.pageY - this.offset.top
        };
    };

    nUIDraggable.prototype._getParentOffset = function () {

        //Get the offsetParent and cache its position
        var po = this.offsetParent.offset(),
            document = this.document[0];

        // This is a special case where we need to modify a offset calculated on start, since the
        // following happened:
        // 1. The position of the helper is absolute, so it's position is calculated based on the
        // next positioned parent
        // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't
        // the document, which means that the scroll is included in the initial calculation of the
        // offset of the parent, and never recalculated upon drag
        if (this.cssPosition === "absolute" && this.scrollParent[0] !== document &&
            $.contains(this.scrollParent[0], this.offsetParent[0])) {
            po.left += this.scrollParent.scrollLeft();
            po.top += this.scrollParent.scrollTop();
        }

        if (this._isRootNode(this.offsetParent[0])) {
            po = {top: 0, left: 0};
        }

        return {
            top: po.top + ( parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0 ),
            left: po.left + ( parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0 )
        };

    };

    nUIDraggable.prototype._getRelativeOffset = function () {
        if (this.cssPosition !== "relative") {
            return {top: 0, left: 0};
        }

        var p = this.element.position(),
            scrollIsRootNode = this._isRootNode(this.scrollParent[0]);

        return {
            top: p.top - ( parseInt(this.helper.css("top"), 10) || 0 ) +
            ( !scrollIsRootNode ? this.scrollParent.scrollTop() : 0 ),
            left: p.left - ( parseInt(this.helper.css("left"), 10) || 0 ) +
            ( !scrollIsRootNode ? this.scrollParent.scrollLeft() : 0 )
        };

    };

    nUIDraggable.prototype._convertPositionTo = function (d, pos) {

        if (!pos) {
            pos = this.position;
        }

        var mod = d === "absolute" ? 1 : -1,
            scrollIsRootNode = this._isRootNode(this.scrollParent[0]);

        return {
            top: (

                // The absolute mouse position
                pos.top +

                // Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.relative.top * mod +

                // The offsetParent's offset without borders (offset + border)
                this.offset.parent.top * mod -
                ( ( this.cssPosition === "fixed" ?
                    -this.offset.scroll.top :
                    ( scrollIsRootNode ? 0 : this.offset.scroll.top ) ) * mod )
            ),
            left: (

                // The absolute mouse position
                pos.left +

                // Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.relative.left * mod +

                // The offsetParent's offset without borders (offset + border)
                this.offset.parent.left * mod -
                ( ( this.cssPosition === "fixed" ?
                    -this.offset.scroll.left :
                    ( scrollIsRootNode ? 0 : this.offset.scroll.left ) ) * mod )
            )
        };

    };

    nUIDraggable.prototype._setContainment = function () {

        var isUserScrollable, c, ce,
            o = this.options,
            document = this.document[0];

        this.relativeContainer = null;

        if (!o.containment) {
            this.containment = null;
            return;
        }

        if (o.containment === "window") {
            this.containment = [
                $(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
                $(window).scrollTop() - this.offset.relative.top - this.offset.parent.top,
                $(window).scrollLeft() + $(window).width() -
                this.helperProportions.width - this.margins.left,
                $(window).scrollTop() +
                ( $(window).height() || document.body.parentNode.scrollHeight ) -
                this.helperProportions.height - this.margins.top
            ];
            return;
        }

        if (o.containment === "document") {
            this.containment = [
                0,
                0,
                $(document).width() - this.helperProportions.width - this.margins.left,
                ( $(document).height() || document.body.parentNode.scrollHeight ) -
                this.helperProportions.height - this.margins.top
            ];
            return;
        }

        if (o.containment.constructor === Array) {
            this.containment = o.containment;
            return;
        }

        if (o.containment === "parent") {
            o.containment = this.helper[0].parentNode;
        }

        c = $(o.containment);
        ce = c[0];

        if (!ce) {
            return;
        }

        isUserScrollable = /(scroll|auto)/.test(c.css("overflow"));

        this.containment = [
            ( parseInt(c.css("borderLeftWidth"), 10) || 0 ) +
            ( parseInt(c.css("paddingLeft"), 10) || 0 ),
            ( parseInt(c.css("borderTopWidth"), 10) || 0 ) +
            ( parseInt(c.css("paddingTop"), 10) || 0 ),
            ( isUserScrollable ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth ) -
            ( parseInt(c.css("borderRightWidth"), 10) || 0 ) -
            ( parseInt(c.css("paddingRight"), 10) || 0 ) -
            this.helperProportions.width -
            this.margins.left -
            this.margins.right,
            ( isUserScrollable ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight ) -
            ( parseInt(c.css("borderBottomWidth"), 10) || 0 ) -
            ( parseInt(c.css("paddingBottom"), 10) || 0 ) -
            this.helperProportions.height -
            this.margins.top -
            this.margins.bottom
        ];
        this.relativeContainer = c;
    };


    nUIDraggable.prototype._adjustOffsetFromHelper = function (obj) {
        if (typeof obj === "string") {
            obj = obj.split(" ");
        }
        if ($.isArray(obj)) {
            obj = {left: +obj[0], top: +obj[1] || 0};
        }
        if ("left" in obj) {
            this.offset.click.left = obj.left + this.margins.left;
        }
        if ("right" in obj) {
            this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
        }
        if ("top" in obj) {
            this.offset.click.top = obj.top + this.margins.top;
        }
        if ("bottom" in obj) {
            this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
        }
    };

    nUIDraggable.prototype._isRootNode = function (element) {
        return ( /(html|body)/i ).test(element.tagName) || element === this.document[0];
    };

    nUIDraggable.prototype._generatePosition = function (event, constrainPosition) {

        var containment, co,
            o = this.options,
            scrollIsRootNode = this._isRootNode(this.scrollParent[0]),
            pageX = event.pageX,
            pageY = event.pageY;

        // Cache the scroll
        if (!scrollIsRootNode || !this.offset.scroll) {
            this.offset.scroll = {
                top: this.scrollParent.scrollTop(),
                left: this.scrollParent.scrollLeft()
            };
        }

        /*
         * - Position constraining -
         * Constrain the position to containment.
         */

        // If we are not dragging yet, we won't check for options
        if (constrainPosition) {
            if (this.containment) {
                if (this.relativeContainer) {
                    co = this.relativeContainer.offset();
                    containment = [
                        this.containment[0] + co.left,
                        this.containment[1] + co.top,
                        this.containment[2] + co.left,
                        this.containment[3] + co.top
                    ];
                } else {
                    containment = this.containment;
                }

                if (event.pageX - this.offset.click.left < containment[0]) {
                    pageX = containment[0] + this.offset.click.left;
                }
                if (event.pageY - this.offset.click.top < containment[1]) {
                    pageY = containment[1] + this.offset.click.top;
                }
                if (event.pageX - this.offset.click.left > containment[2]) {
                    pageX = containment[2] + this.offset.click.left;
                }
                if (event.pageY - this.offset.click.top > containment[3]) {
                    pageY = containment[3] + this.offset.click.top;
                }
            }

            if (o.axis === "y") {
                pageX = this.originalPageX;
            }

            if (o.axis === "x") {
                pageY = this.originalPageY;
            }
        }

        return {
            top: (

                // The absolute mouse position
                pageY -

                // Click offset (relative to the element)
                this.offset.click.top -

                // Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.relative.top -

                // The offsetParent's offset without borders (offset + border)
                this.offset.parent.top +
                ( this.cssPosition === "fixed" ?
                    -this.offset.scroll.top :
                    ( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
            ),
            left: (

                // The absolute mouse position
                pageX -

                // Click offset (relative to the element)
                this.offset.click.left -

                // Only for relative positioned nodes: Relative offset from element to offset parent
                this.offset.relative.left -

                // The offsetParent's offset without borders (offset + border)
                this.offset.parent.left +
                ( this.cssPosition === "fixed" ?
                    -this.offset.scroll.left :
                    ( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
            )
        };

    };

    nUIDraggable.prototype._clear = function () {
        this.helper.removeClass("nui-draggable-dragging");
        if (this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
            this.helper.remove();
        }
        this.helper = null;
        this.cancelHelperRemoval = false;
        if (this.destroyOnClear) {
            this.destroy();
        }
    };


    var safeActiveElement = function (document) {
            var activeElement;

            // Support: IE 9 only
            // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
            try {
                activeElement = document.activeElement;
            } catch (error) {
                activeElement = document.body;
            }

            // Support: IE 9 - 11 only
            // IE may return null instead of an element
            // Interestingly, this only seems to occur when NOT in an iframe
            if (!activeElement) {
                activeElement = document.body;
            }

            // Support: IE 11 only
            // IE11 returns a seemingly empty object in some cases when accessing
            // document.activeElement from an <iframe>
            if (!activeElement.nodeName) {
                activeElement = document.body;
            }

            return activeElement;
        },
        safeBlur = function (element) {

            // Support: IE9 - 10 only
            // If the <body> is blurred, IE will switch windows, see #9420
            if (element && element.nodeName.toLowerCase() !== "body") {
                $(element).trigger("blur");
            }
        };

    nUIDraggable.prototype._blurActiveElement = function (event) {
        var activeElement = safeActiveElement(this.document[0]),
            target = $(event.target);

        // Don't blur if the event occurred on an element that is within
        // the currently focused element
        // See #10527, #12472
        if (target.closest(activeElement).length) {
            return;
        }

        // Blur any element that currently has focus, see #4261
        safeBlur(activeElement);
    };

    N2Classes.nUIWidgetBase.register('nUIDraggable');

    return nUIDraggable;
});
/*
 * jQuery File Upload Plugin 5.42.3
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, require, window, document, location, Blob, FormData */

N2D('nUIFileUpload', ["nUIWidgetBase"], function ($, undefined) {
    'use strict';

    // Detect file input support, based on
    // http://viljamis.com/blog/2012/file-upload-support-on-mobile/
    $.support.fileInput = !(new RegExp(
        // Handle devices which give false positives for the feature detection:
        '(Android (1\\.[0156]|2\\.[01]))' +
        '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' +
        '|(w(eb)?OSBrowser)|(webOS)' +
        '|(Kindle/(1\\.0|2\\.[05]|3\\.0))'
        ).test(window.navigator.userAgent) ||
        // Feature detection for all other devices:
        $('<input type="file">').prop('disabled'));

    // The FileReader API is not actually used, but works as feature detection,
    // as some Safari versions (5?) support XHR file uploads via the FormData API,
    // but not non-multipart XHR file uploads.
    // window.XMLHttpRequestUpload is not available on IE10, so we check for
    // window.ProgressEvent instead to detect XHR2 file upload capability:
    $.support.xhrFileUpload = !!(window.ProgressEvent && window.FileReader);
    $.support.xhrFormDataFileUpload = !!window.FormData;

    // Detect support for Blob slicing (required for chunked uploads):
    $.support.blobSlice = window.Blob && (Blob.prototype.slice ||
        Blob.prototype.webkitSlice || Blob.prototype.mozSlice);

    // Helper function to create drag handlers for dragover/dragenter/dragleave:
    function getDragHandler(type) {
        var isDragOver = type === 'dragover';
        return function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var dataTransfer = e.dataTransfer;
            if (dataTransfer && $.inArray('Files', dataTransfer.types) !== -1 &&
                this._trigger(
                    type,
                    $.Event(type, {delegatedEvent: e})
                ) !== false) {
                e.preventDefault();
                if (isDragOver) {
                    dataTransfer.dropEffect = 'copy';
                }
            }
        };
    }

    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.


    /**
     * @class
     * @constructor
     * @augments nUIWidgetBase

     * @this nUIFileUpload
     */
    function nUIFileUpload(element, options) {

        this.element = $(element);

        this.widgetName = this.widgetName || 'nUIFileUpload';

        this.options = $.extend({
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),
            // The paste target element(s), by the default undefined.
            // Set to a DOM node or jQuery object to enable file pasting:
            pasteZone: undefined,
            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            fileInput: undefined,
            // By default, the file input field is replaced with a clone after
            // each input field change event. This is required for iframe transport
            // queues and allows change events to be fired for the same file
            // selection, but can be disabled by setting the following option to false:
            replaceFileInput: true,
            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // The following option limits the number of files uploaded with one
            // XHR request to keep the request size under or equal to the defined
            // limit in bytes:
            limitMultiFileUploadSize: undefined,
            // Multipart file uploads add a number of bytes to each uploaded file,
            // therefore the following option adds an overhead for each file used
            // in the limitMultiFileUploadSize configuration:
            limitMultiFileUploadSizeOverhead: 512,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // Set the following option to true to force iframe transport uploads:
            forceIframeTransport: false,
            // Set the following option to the location of a redirect url on the
            // origin server, for cross-domain iframe transport uploads:
            redirect: undefined,
            // The parameter name for the redirect url, sent as part of the form
            // data and set to 'redirect' if this option is empty:
            redirectParamName: undefined,
            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
            // By default, uploads are started automatically when adding files:
            autoUpload: true,

            // Error and info messages:
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },

            // Translation function, gets the message key to be translated
            // and an object with context specific data as arguments:
            i18n: function (message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    $.each(context, function (key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uploads, else
            // once for each file selection.
            //
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows you to override plugin options as well as define ajax settings.
            //
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            //
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                if (data.autoUpload || (data.autoUpload !== false &&
                    $(this).nUIFileUpload('option', 'autoUpload'))) {
                    data.process().done(function () {
                        data.submit();
                    });
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        }, this.options, options);

        N2Classes.nUIWidgetBase.prototype.constructor.apply(this, arguments);

        this._specialOptions = [
            'fileInput',
            'dropZone',
            'pasteZone',
            'multipart',
            'forceIframeTransport'
        ];

        this.create();
    }

    nUIFileUpload.prototype = Object.create(N2Classes.nUIWidgetBase.prototype);
    nUIFileUpload.prototype.constructor = nUIFileUpload;


    nUIFileUpload.prototype._blobSlice = $.support.blobSlice && function () {
        var slice = this.slice || this.webkitSlice || this.mozSlice;
        return slice.apply(this, arguments);
    };

    nUIFileUpload.prototype._BitrateTimer = function () {
        this.timestamp = ((Date.now) ? Date.now() : (new Date()).getTime());
        this.loaded = 0;
        this.bitrate = 0;
        this.getBitrate = function (now, loaded, interval) {
            var timeDiff = now - this.timestamp;
            if (!this.bitrate || !interval || timeDiff > interval) {
                this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                this.loaded = loaded;
                this.timestamp = now;
            }
            return this.bitrate;
        };
    };

    nUIFileUpload.prototype._isXHRUpload = function (options) {
        return !options.forceIframeTransport &&
            ((!options.multipart && $.support.xhrFileUpload) ||
                $.support.xhrFormDataFileUpload);
    };

    nUIFileUpload.prototype._getFormData = function (options) {
        var formData;
        if ($.type(options.formData) === 'function') {
            return options.formData(options.form);
        }
        if ($.isArray(options.formData)) {
            return options.formData;
        }
        if ($.type(options.formData) === 'object') {
            formData = [];
            $.each(options.formData, function (name, value) {
                formData.push({name: name, value: value});
            });
            return formData;
        }
        return [];
    };

    nUIFileUpload.prototype._getTotal = function (files) {
        var total = 0;
        $.each(files, function (index, file) {
            total += file.size || 1;
        });
        return total;
    };

    nUIFileUpload.prototype._initProgressObject = function (obj) {
        var progress = {
            loaded: 0,
            total: 0,
            bitrate: 0
        };
        if (obj._progress) {
            $.extend(obj._progress, progress);
        } else {
            obj._progress = progress;
        }
    };

    nUIFileUpload.prototype._initResponseObject = function (obj) {
        var prop;
        if (obj._response) {
            for (prop in obj._response) {
                if (obj._response.hasOwnProperty(prop)) {
                    delete obj._response[prop];
                }
            }
        } else {
            obj._response = {};
        }
    };

    nUIFileUpload.prototype._onProgress = function (e, data) {
        if (e.lengthComputable) {
            var now = ((Date.now) ? Date.now() : (new Date()).getTime()),
                loaded;
            if (data._time && data.progressInterval &&
                (now - data._time < data.progressInterval) &&
                e.loaded !== e.total) {
                return;
            }
            data._time = now;
            loaded = Math.floor(
                e.loaded / e.total * (data.chunkSize || data._progress.total)
            ) + (data.uploadedBytes || 0);
            // Add the difference from the previously loaded state
            // to the global loaded counter:
            this._progress.loaded += (loaded - data._progress.loaded);
            this._progress.bitrate = this._bitrateTimer.getBitrate(
                now,
                this._progress.loaded,
                data.bitrateInterval
            );
            data._progress.loaded = data.loaded = loaded;
            data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(
                now,
                loaded,
                data.bitrateInterval
            );
            // Trigger a custom progress event with a total data property set
            // to the file size(s) of the current upload and a loaded data
            // property calculated accordingly:
            this._trigger(
                'progress',
                $.Event('progress', {delegatedEvent: e}),
                data
            );
            // Trigger a global progress event for all current file uploads,
            // including ajax calls queued for sequential file uploads:
            this._trigger(
                'progressall',
                $.Event('progressall', {delegatedEvent: e}),
                this._progress
            );
        }
    };

    nUIFileUpload.prototype._initProgressListener = function (options) {
        var that = this,
            xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
        // Accesss to the native XHR object is required to add event listeners
        // for the upload progress event:
        if (xhr.upload) {
            $(xhr.upload).bind('progress', function (e) {
                var oe = e.originalEvent;
                // Make sure the progress event properties get copied over:
                e.lengthComputable = oe.lengthComputable;
                e.loaded = oe.loaded;
                e.total = oe.total;
                that._onProgress(e, options);
            });
            options.xhr = function () {
                return xhr;
            };
        }
    };

    nUIFileUpload.prototype._isInstanceOf = function (type, obj) {
        // Cross-frame instanceof check
        return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    };

    nUIFileUpload.prototype._initXHRData = function (options) {
        var that = this,
            formData,
            file = options.files[0],
            // Ignore non-multipart setting if not supported:
            multipart = options.multipart || !$.support.xhrFileUpload,
            paramName = $.type(options.paramName) === 'array' ?
                options.paramName[0] : options.paramName;
        options.headers = $.extend({}, options.headers);
        if (options.contentRange) {
            options.headers['Content-Range'] = options.contentRange;
        }
        if (!multipart || options.blob || !this._isInstanceOf('File', file)) {
            options.headers['Content-Disposition'] = 'attachment; filename="' +
                encodeURI(file.name) + '"';
        }
        if (!multipart) {
            options.contentType = file.type || 'application/octet-stream';
            options.data = options.blob || file;
        } else if ($.support.xhrFormDataFileUpload) {
            if (options.postMessage) {
                // window.postMessage does not allow sending FormData
                // objects, so we just add the File/Blob objects to
                // the formData array and let the postMessage window
                // create the FormData object out of this array:
                formData = this._getFormData(options);
                if (options.blob) {
                    formData.push({
                        name: paramName,
                        value: options.blob
                    });
                } else {
                    $.each(options.files, function (index, file) {
                        formData.push({
                            name: ($.type(options.paramName) === 'array' &&
                                options.paramName[index]) || paramName,
                            value: file
                        });
                    });
                }
            } else {
                if (that._isInstanceOf('FormData', options.formData)) {
                    formData = options.formData;
                } else {
                    formData = new FormData();
                    $.each(this._getFormData(options), function (index, field) {
                        formData.append(field.name, field.value);
                    });
                }
                if (options.blob) {
                    formData.append(paramName, options.blob, file.name);
                } else {
                    $.each(options.files, function (index, file) {
                        // This check allows the tests to run with
                        // dummy objects:
                        if (that._isInstanceOf('File', file) ||
                            that._isInstanceOf('Blob', file)) {
                            formData.append(
                                ($.type(options.paramName) === 'array' &&
                                    options.paramName[index]) || paramName,
                                file,
                                file.uploadName || file.name
                            );
                        }
                    });
                }
            }
            options.data = formData;
        }
        // Blob reference is not needed anymore, free memory:
        options.blob = null;
    };

    nUIFileUpload.prototype._initIframeSettings = function (options) {
        var targetHost = $('<a></a>').prop('href', options.url).prop('host');
        // Setting the dataType to iframe enables the iframe transport:
        options.dataType = 'iframe ' + (options.dataType || '');
        // The iframe transport accepts a serialized array as form data:
        options.formData = this._getFormData(options);
        // Add redirect url to form data on cross-domain uploads:
        if (options.redirect && targetHost && targetHost !== location.host) {
            options.formData.push({
                name: options.redirectParamName || 'redirect',
                value: options.redirect
            });
        }
    };

    nUIFileUpload.prototype._initDataSettings = function (options) {
        if (this._isXHRUpload(options)) {
            if (!this._chunkedUpload(options, true)) {
                if (!options.data) {
                    this._initXHRData(options);
                }
                this._initProgressListener(options);
            }
            if (options.postMessage) {
                // Setting the dataType to postmessage enables the
                // postMessage transport:
                options.dataType = 'postmessage ' + (options.dataType || '');
            }
        } else {
            this._initIframeSettings(options);
        }
    };

    nUIFileUpload.prototype._getParamName = function (options) {
        var fileInput = $(options.fileInput),
            paramName = options.paramName;
        if (!paramName) {
            paramName = [];
            fileInput.each(function () {
                var input = $(this),
                    name = input.prop('name') || 'files[]',
                    i = (input.prop('files') || [1]).length;
                while (i) {
                    paramName.push(name);
                    i -= 1;
                }
            });
            if (!paramName.length) {
                paramName = [fileInput.prop('name') || 'files[]'];
            }
        } else if (!$.isArray(paramName)) {
            paramName = [paramName];
        }
        return paramName;
    };

    nUIFileUpload.prototype._initFormSettings = function (options) {
        // Retrieve missing options from the input field and the
        // associated form, if available:
        if (!options.form || !options.form.length) {
            options.form = $(options.fileInput.prop('form'));
            // If the given file input doesn't have an associated form,
            // use the default widget file input's form:
            if (!options.form.length) {
                options.form = $(this.options.fileInput.prop('form'));
            }
        }
        options.paramName = this._getParamName(options);
        if (!options.url) {
            options.url = options.form.prop('action') || location.href;
        }
        // The HTTP request method must be "POST" or "PUT":
        options.type = (options.type ||
            ($.type(options.form.prop('method')) === 'string' &&
                options.form.prop('method')) || ''
        ).toUpperCase();
        if (options.type !== 'POST' && options.type !== 'PUT' &&
            options.type !== 'PATCH') {
            options.type = 'POST';
        }
        if (!options.formAcceptCharset) {
            options.formAcceptCharset = options.form.attr('accept-charset');
        }
    };

    nUIFileUpload.prototype._getAJAXSettings = function (data) {
        var options = $.extend({}, this.options, data);
        this._initFormSettings(options);
        this._initDataSettings(options);
        return options;
    };

    // jQuery 1.6 doesn't provide .state(),
    // while jQuery 1.8+ removed .isRejected() and .isResolved():
    nUIFileUpload.prototype._getDeferredState = function (deferred) {
        if (deferred.state) {
            return deferred.state();
        }
        if (deferred.isResolved()) {
            return 'resolved';
        }
        if (deferred.isRejected()) {
            return 'rejected';
        }
        return 'pending';
    };

    // Maps jqXHR callbacks to the equivalent
    // methods of the given Promise object:
    nUIFileUpload.prototype._enhancePromise = function (promise) {
        promise.success = promise.done;
        promise.error = promise.fail;
        promise.complete = promise.always;
        return promise;
    };

    // Creates and returns a Promise object enhanced with
    // the jqXHR methods abort, success, error and complete:
    nUIFileUpload.prototype._getXHRPromise = function (resolveOrReject, context, args) {
        var dfd = $.Deferred(),
            promise = dfd.promise();
        context = context || this.options.context || promise;
        if (resolveOrReject === true) {
            dfd.resolveWith(context, args);
        } else if (resolveOrReject === false) {
            dfd.rejectWith(context, args);
        }
        promise.abort = dfd.promise;
        return this._enhancePromise(promise);
    };

    // Adds convenience methods to the data callback argument:
    nUIFileUpload.prototype._addConvenienceMethods = function (e, data) {
        var that = this,
            getPromise = function (args) {
                return $.Deferred().resolveWith(that, args).promise();
            };
        data.process = function (resolveFunc, rejectFunc) {
            if (resolveFunc || rejectFunc) {
                data._processQueue = this._processQueue =
                    (this._processQueue || getPromise([this])).pipe(
                        function () {
                            if (data.errorThrown) {
                                return $.Deferred()
                                    .rejectWith(that, [data]).promise();
                            }
                            return getPromise(arguments);
                        }
                    ).pipe(resolveFunc, rejectFunc);
            }
            return this._processQueue || getPromise([this]);
        };
        data.submit = function () {
            if (this.state() !== 'pending') {
                data.jqXHR = this.jqXHR =
                    (that._trigger(
                        'submit',
                        $.Event('submit', {delegatedEvent: e}),
                        this
                    ) !== false) && that._onSend(e, this);
            }
            return this.jqXHR || that._getXHRPromise();
        };
        data.abort = function () {
            if (this.jqXHR) {
                return this.jqXHR.abort();
            }
            this.errorThrown = 'abort';
            that._trigger('fail', null, this);
            return that._getXHRPromise(false);
        };
        data.state = function () {
            if (this.jqXHR) {
                return that._getDeferredState(this.jqXHR);
            }
            if (this._processQueue) {
                return that._getDeferredState(this._processQueue);
            }
        };
        data.processing = function () {
            return !this.jqXHR && this._processQueue && that
                ._getDeferredState(this._processQueue) === 'pending';
        };
        data.progress = function () {
            return this._progress;
        };
        data.response = function () {
            return this._response;
        };
    };

    // Parses the Range header from the server response
    // and returns the uploaded bytes:
    nUIFileUpload.prototype._getUploadedBytes = function (jqXHR) {
        var range = jqXHR.getResponseHeader('Range'),
            parts = range && range.split('-'),
            upperBytesPos = parts && parts.length > 1 &&
                parseInt(parts[1], 10);
        return upperBytesPos && upperBytesPos + 1;
    };

    // Uploads a file in multiple, sequential requests
    // by splitting the file up in multiple blob chunks.
    // If the second parameter is true, only tests if the file
    // should be uploaded in chunks, but does not invoke any
    // upload requests:
    nUIFileUpload.prototype._chunkedUpload = function (options, testOnly) {
        options.uploadedBytes = options.uploadedBytes || 0;
        var that = this,
            file = options.files[0],
            fs = file.size,
            ub = options.uploadedBytes,
            mcs = options.maxChunkSize || fs,
            slice = this._blobSlice,
            dfd = $.Deferred(),
            promise = dfd.promise(),
            jqXHR,
            upload;
        if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) ||
            options.data) {
            return false;
        }
        if (testOnly) {
            return true;
        }
        if (ub >= fs) {
            file.error = options.i18n('uploadedBytes');
            return this._getXHRPromise(
                false,
                options.context,
                [null, 'error', file.error]
            );
        }
        // The chunk upload method:
        upload = function () {
            // Clone the options object for each chunk upload:
            var o = $.extend({}, options),
                currentLoaded = o._progress.loaded;
            o.blob = slice.call(
                file,
                ub,
                ub + mcs,
                file.type
            );
            // Store the current chunk size, as the blob itself
            // will be dereferenced after data processing:
            o.chunkSize = o.blob.size;
            // Expose the chunk bytes position range:
            o.contentRange = 'bytes ' + ub + '-' +
                (ub + o.chunkSize - 1) + '/' + fs;
            // Process the upload data (the blob and potential form data):
            that._initXHRData(o);
            // Add progress listeners for this chunk upload:
            that._initProgressListener(o);
            jqXHR = ((that._trigger('chunksend', null, o) !== false && $.ajax(o)) ||
                that._getXHRPromise(false, o.context))
                .done(function (result, textStatus, jqXHR) {
                    ub = that._getUploadedBytes(jqXHR) ||
                        (ub + o.chunkSize);
                    // Create a progress event if no final progress event
                    // with loaded equaling total has been triggered
                    // for this chunk:
                    if (currentLoaded + o.chunkSize - o._progress.loaded) {
                        that._onProgress($.Event('progress', {
                            lengthComputable: true,
                            loaded: ub - o.uploadedBytes,
                            total: ub - o.uploadedBytes
                        }), o);
                    }
                    options.uploadedBytes = o.uploadedBytes = ub;
                    o.result = result;
                    o.textStatus = textStatus;
                    o.jqXHR = jqXHR;
                    that._trigger('chunkdone', null, o);
                    that._trigger('chunkalways', null, o);
                    if (ub < fs) {
                        // File upload not yet complete,
                        // continue with the next chunk:
                        upload();
                    } else {
                        dfd.resolveWith(
                            o.context,
                            [result, textStatus, jqXHR]
                        );
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    o.jqXHR = jqXHR;
                    o.textStatus = textStatus;
                    o.errorThrown = errorThrown;
                    that._trigger('chunkfail', null, o);
                    that._trigger('chunkalways', null, o);
                    dfd.rejectWith(
                        o.context,
                        [jqXHR, textStatus, errorThrown]
                    );
                });
        };
        this._enhancePromise(promise);
        promise.abort = function () {
            return jqXHR.abort();
        };
        upload();
        return promise;
    };

    nUIFileUpload.prototype._beforeSend = function (e, data) {
        if (this._active === 0) {
            // the start callback is triggered when an upload starts
            // and no other uploads are currently running,
            // equivalent to the global ajaxStart event:
            this._trigger('start');
            // Set timer for global bitrate progress calculation:
            this._bitrateTimer = new this._BitrateTimer();
            // Reset the global progress values:
            this._progress.loaded = this._progress.total = 0;
            this._progress.bitrate = 0;
        }
        // Make sure the container objects for the .response() and
        // .progress() methods on the data object are available
        // and reset to their initial state:
        this._initResponseObject(data);
        this._initProgressObject(data);
        data._progress.loaded = data.loaded = data.uploadedBytes || 0;
        data._progress.total = data.total = this._getTotal(data.files) || 1;
        data._progress.bitrate = data.bitrate = 0;
        this._active += 1;
        // Initialize the global progress values:
        this._progress.loaded += data.loaded;
        this._progress.total += data.total;
    };

    nUIFileUpload.prototype._onDone = function (result, textStatus, jqXHR, options) {
        var total = options._progress.total,
            response = options._response;
        if (options._progress.loaded < total) {
            // Create a progress event if no final progress event
            // with loaded equaling total has been triggered:
            this._onProgress($.Event('progress', {
                lengthComputable: true,
                loaded: total,
                total: total
            }), options);
        }
        response.result = options.result = result;
        response.textStatus = options.textStatus = textStatus;
        response.jqXHR = options.jqXHR = jqXHR;
        this._trigger('done', null, options);
    };

    nUIFileUpload.prototype._onFail = function (jqXHR, textStatus, errorThrown, options) {
        var response = options._response;
        if (options.recalculateProgress) {
            // Remove the failed (error or abort) file upload from
            // the global progress calculation:
            this._progress.loaded -= options._progress.loaded;
            this._progress.total -= options._progress.total;
        }
        response.jqXHR = options.jqXHR = jqXHR;
        response.textStatus = options.textStatus = textStatus;
        response.errorThrown = options.errorThrown = errorThrown;
        this._trigger('fail', null, options);
    };

    nUIFileUpload.prototype._onAlways = function (jqXHRorResult, textStatus, jqXHRorError, options) {
        // jqXHRorResult, textStatus and jqXHRorError are added to the
        // options object via done and fail callbacks
        this._trigger('always', null, options);
    };

    nUIFileUpload.prototype._onSend = function (e, data) {
        if (!data.submit) {
            this._addConvenienceMethods(e, data);
        }
        var that = this,
            jqXHR,
            aborted,
            slot,
            pipe,
            options = that._getAJAXSettings(data),
            send = function () {
                that._sending += 1;
                // Set timer for bitrate progress calculation:
                options._bitrateTimer = new that._BitrateTimer();
                jqXHR = jqXHR || (
                    ((aborted || that._trigger(
                        'send',
                        $.Event('send', {delegatedEvent: e}),
                        options
                        ) === false) &&
                        that._getXHRPromise(false, options.context, aborted)) ||
                    that._chunkedUpload(options) || $.ajax(options)
                ).done(function (result, textStatus, jqXHR) {
                    that._onDone(result, textStatus, jqXHR, options);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    that._onFail(jqXHR, textStatus, errorThrown, options);
                }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
                    that._onAlways(
                        jqXHRorResult,
                        textStatus,
                        jqXHRorError,
                        options
                    );
                    that._sending -= 1;
                    that._active -= 1;
                    if (options.limitConcurrentUploads &&
                        options.limitConcurrentUploads > that._sending) {
                        // Start the next queued upload,
                        // that has not been aborted:
                        var nextSlot = that._slots.shift();
                        while (nextSlot) {
                            if (that._getDeferredState(nextSlot) === 'pending') {
                                nextSlot.resolve();
                                break;
                            }
                            nextSlot = that._slots.shift();
                        }
                    }
                    if (that._active === 0) {
                        // The stop callback is triggered when all uploads have
                        // been completed, equivalent to the global ajaxStop event:
                        that._trigger('stop');
                    }
                });
                return jqXHR;
            };
        this._beforeSend(e, options);
        if (this.options.sequentialUploads ||
            (this.options.limitConcurrentUploads &&
                this.options.limitConcurrentUploads <= this._sending)) {
            if (this.options.limitConcurrentUploads > 1) {
                slot = $.Deferred();
                this._slots.push(slot);
                pipe = slot.pipe(send);
            } else {
                this._sequence = this._sequence.pipe(send, send);
                pipe = this._sequence;
            }
            // Return the piped Promise object, enhanced with an abort method,
            // which is delegated to the jqXHR object of the current upload,
            // and jqXHR callbacks mapped to the equivalent Promise methods:
            pipe.abort = function () {
                aborted = [undefined, 'abort', 'abort'];
                if (!jqXHR) {
                    if (slot) {
                        slot.rejectWith(options.context, aborted);
                    }
                    return send();
                }
                return jqXHR.abort();
            };
            return this._enhancePromise(pipe);
        }
        return send();
    };

    nUIFileUpload.prototype._onAdd = function (e, data) {
        var that = this,
            result = true,
            options = $.extend({}, this.options, data),
            files = data.files,
            filesLength = files.length,
            limit = options.limitMultiFileUploads,
            limitSize = options.limitMultiFileUploadSize,
            overhead = options.limitMultiFileUploadSizeOverhead,
            batchSize = 0,
            paramName = this._getParamName(options),
            paramNameSet,
            paramNameSlice,
            fileSet,
            i,
            j = 0;
        if (limitSize && (!filesLength || files[0].size === undefined)) {
            limitSize = undefined;
        }
        if (!(options.singleFileUploads || limit || limitSize) || !this._isXHRUpload(options)) {
            fileSet = [files];
            paramNameSet = [paramName];
        } else if (!(options.singleFileUploads || limitSize) && limit) {
            fileSet = [];
            paramNameSet = [];
            for (i = 0; i < filesLength; i += limit) {
                fileSet.push(files.slice(i, i + limit));
                paramNameSlice = paramName.slice(i, i + limit);
                if (!paramNameSlice.length) {
                    paramNameSlice = paramName;
                }
                paramNameSet.push(paramNameSlice);
            }
        } else if (!options.singleFileUploads && limitSize) {
            fileSet = [];
            paramNameSet = [];
            for (i = 0; i < filesLength; i = i + 1) {
                batchSize += files[i].size + overhead;
                if (i + 1 === filesLength ||
                    ((batchSize + files[i + 1].size + overhead) > limitSize) ||
                    (limit && i + 1 - j >= limit)) {
                    fileSet.push(files.slice(j, i + 1));
                    paramNameSlice = paramName.slice(j, i + 1);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                    j = i + 1;
                    batchSize = 0;
                }
            }
        } else {
            paramNameSet = paramName;
        }
        data.originalFiles = files;
        $.each(fileSet || files, function (index, element) {
            var newData = $.extend({}, data);
            newData.files = fileSet ? element : [element];
            newData.paramName = paramNameSet[index];
            that._initResponseObject(newData);
            that._initProgressObject(newData);
            that._addConvenienceMethods(e, newData);
            result = that._trigger(
                'add',
                $.Event('add', {delegatedEvent: e}),
                newData
            );
            return result;
        });
        return result;
    };

    nUIFileUpload.prototype._replaceFileInput = function (data) {
        var input = data.fileInput,
            inputClone = input.clone(true);
        // Add a reference for the new cloned file input to the data argument:
        data.fileInputClone = inputClone;
        $('<form></form>').append(inputClone)[0].reset();
        // Detaching allows to insert the fileInput on another form
        // without loosing the file input value:
        input.after(inputClone).detach();
        // Avoid memory leaks with the detached file input:
        $.cleanData(input.unbind('remove'));
        // Replace the original file input element in the fileInput
        // elements set with the clone, which has been copied including
        // event handlers:
        this.options.fileInput = this.options.fileInput.map(function (i, el) {
            if (el === input[0]) {
                return inputClone[0];
            }
            return el;
        });
        // If the widget has been initialized on the file input itself,
        // override this.element with the file input clone:
        if (input[0] === this.element[0]) {
            this.element = inputClone;
        }
    };

    nUIFileUpload.prototype._handleFileTreeEntry = function (entry, path) {
        var that = this,
            dfd = $.Deferred(),
            errorHandler = function (e) {
                if (e && !e.entry) {
                    e.entry = entry;
                }
                // Since $.when returns immediately if one
                // Deferred is rejected, we use resolve instead.
                // This allows valid files and invalid items
                // to be returned together in one set:
                dfd.resolve([e]);
            },
            successHandler = function (entries) {
                that._handleFileTreeEntries(
                    entries,
                    path + entry.name + '/'
                ).done(function (files) {
                    dfd.resolve(files);
                }).fail(errorHandler);
            },
            readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (!results.length) {
                        successHandler(entries);
                    } else {
                        entries = entries.concat(results);
                        readEntries();
                    }
                }, errorHandler);
            },
            dirReader, entries = [];
        path = path || '';
        if (entry.isFile) {
            if (entry._file) {
                // Workaround for Chrome bug #149735
                entry._file.relativePath = path;
                dfd.resolve(entry._file);
            } else {
                entry.file(function (file) {
                    file.relativePath = path;
                    dfd.resolve(file);
                }, errorHandler);
            }
        } else if (entry.isDirectory) {
            dirReader = entry.createReader();
            readEntries();
        } else {
            // Return an empy list for file system items
            // other than files or directories:
            dfd.resolve([]);
        }
        return dfd.promise();
    };

    nUIFileUpload.prototype._handleFileTreeEntries = function (entries, path) {
        var that = this;
        return $.when.apply(
            $,
            $.map(entries, function (entry) {
                return that._handleFileTreeEntry(entry, path);
            })
        ).pipe(function () {
            return Array.prototype.concat.apply(
                [],
                arguments
            );
        });
    };

    nUIFileUpload.prototype._getDroppedFiles = function (dataTransfer) {
        dataTransfer = dataTransfer || {};
        var items = dataTransfer.items;
        if (items && items.length && (items[0].webkitGetAsEntry ||
            items[0].getAsEntry)) {
            return this._handleFileTreeEntries(
                $.map(items, function (item) {
                    var entry;
                    if (item.webkitGetAsEntry) {
                        entry = item.webkitGetAsEntry();
                        if (entry) {
                            // Workaround for Chrome bug #149735:
                            entry._file = item.getAsFile();
                        }
                        return entry;
                    }
                    return item.getAsEntry();
                })
            );
        }
        return $.Deferred().resolve(
            $.makeArray(dataTransfer.files)
        ).promise();
    };

    nUIFileUpload.prototype._getSingleFileInputFiles = function (fileInput) {
        fileInput = $(fileInput);
        var entries = fileInput.prop('webkitEntries') ||
            fileInput.prop('entries'),
            files,
            value;
        if (entries && entries.length) {
            return this._handleFileTreeEntries(entries);
        }
        files = $.makeArray(fileInput.prop('files'));
        if (!files.length) {
            value = fileInput.prop('value');
            if (!value) {
                return $.Deferred().resolve([]).promise();
            }
            // If the files property is not available, the browser does not
            // support the File API and we add a pseudo File object with
            // the input value as name with path information removed:
            files = [{name: value.replace(/^.*\\/, '')}];
        } else if (files[0].name === undefined && files[0].fileName) {
            // File normalization for Safari 4 and Firefox 3:
            $.each(files, function (index, file) {
                file.name = file.fileName;
                file.size = file.fileSize;
            });
        }
        return $.Deferred().resolve(files).promise();
    };

    nUIFileUpload.prototype._getFileInputFiles = function (fileInput) {
        if (!(fileInput instanceof $) || fileInput.length === 1) {
            return this._getSingleFileInputFiles(fileInput);
        }
        return $.when.apply(
            $,
            $.map(fileInput, this._getSingleFileInputFiles)
        ).pipe(function () {
            return Array.prototype.concat.apply(
                [],
                arguments
            );
        });
    };

    nUIFileUpload.prototype._onChange = function (e) {
        var that = this,
            data = {
                fileInput: $(e.target),
                form: $(e.target.form)
            };
        this._getFileInputFiles(data.fileInput).always(function (files) {
            data.files = files;
            if (that.options.replaceFileInput) {
                that._replaceFileInput(data);
            }
            if (that._trigger(
                'change',
                $.Event('change', {delegatedEvent: e}),
                data
            ) !== false) {
                that._onAdd(e, data);
            }
        });
    };

    nUIFileUpload.prototype._onPaste = function (e) {
        var items = e.originalEvent && e.originalEvent.clipboardData &&
            e.originalEvent.clipboardData.items,
            data = {files: []};
        if (items && items.length) {
            $.each(items, function (index, item) {
                var file = item.getAsFile && item.getAsFile();
                if (file) {
                    data.files.push(file);
                }
            });
            if (this._trigger(
                'paste',
                $.Event('paste', {delegatedEvent: e}),
                data
            ) !== false) {
                this._onAdd(e, data);
            }
        }
    }
    ;

    nUIFileUpload.prototype._onDrop = function (e) {
        e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
        var that = this,
            dataTransfer = e.dataTransfer,
            data = {};
        if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
            e.preventDefault();
            e.stopPropagation();
            this._getDroppedFiles(dataTransfer).always(function (files) {
                data.files = files;
                if (that._trigger(
                    'drop',
                    $.Event('drop', {delegatedEvent: e}),
                    data
                ) !== false) {
                    that._onAdd(e, data);
                }
            });
        }
    };

    nUIFileUpload.prototype._onDragOver = getDragHandler('dragover');

    nUIFileUpload.prototype._onDragEnter = getDragHandler('dragenter');

    nUIFileUpload.prototype._onDragLeave = getDragHandler('dragleave');

    nUIFileUpload.prototype._initEventHandlers = function () {
        if (this._isXHRUpload(this.options)) {
            $(this.options.dropZone).on({
                dragover: $.proxy(this._onDragOver, this),
                drop: $.proxy(this._onDrop, this),
                // event.preventDefault() on dragenter is required for IE10+:
                dragenter: $.proxy(this._onDragEnter, this),
                // dragleave is not required, but added for completeness:
                dragleave: $.proxy(this._onDragLeave, this)
            });
            $(this.options.pasteZone).on({
                paste: $.proxy(this._onPaste, this)
            });
        }
        if ($.support.fileInput) {
            $(this.options.fileInput).on({
                change: $.proxy(this._onChange, this)
            });
        }
    };

    nUIFileUpload.prototype._destroyEventHandlers = function () {
        $(this.options.dropZone).off('dragenter dragleave dragover drop');
        $(this.options.pasteZone).off('paste');
        $(this.options.fileInput).off('change');
    };

    nUIFileUpload.prototype.setOption = function (key, value) {
        var reinit = $.inArray(key, this._specialOptions) !== -1;
        if (reinit) {
            this._destroyEventHandlers();
        }

        N2Classes.nUIWidgetBase.prototype.setOption.apply(this, arguments);

        if (reinit) {
            this._initSpecialOptions();
            this._initEventHandlers();
        }
    };

    nUIFileUpload.prototype._initSpecialOptions = function () {
        var options = this.options;
        if (options.fileInput === undefined) {
            options.fileInput = this.element.is('input[type="file"]') ?
                this.element : this.element.find('input[type="file"]');
        } else if (!(options.fileInput instanceof $)) {
            options.fileInput = $(options.fileInput);
        }
        if (!(options.dropZone instanceof $)) {
            options.dropZone = $(options.dropZone);
        }
        if (!(options.pasteZone instanceof $)) {
            options.pasteZone = $(options.pasteZone);
        }
    };

    nUIFileUpload.prototype._getRegExp = function (str) {
        var parts = str.split('/'),
            modifiers = parts.pop();
        parts.shift();
        return new RegExp(parts.join('/'), modifiers);
    };

    nUIFileUpload.prototype._isRegExpOption = function (key, value) {
        return key !== 'url' && $.type(value) === 'string' && /^\/.*\/[igm]{0,3}$/.test(value);
    };

    nUIFileUpload.prototype._initDataAttributes = function () {
        var that = this,
            options = this.options,
            data = this.element.data();
        // Initialize options set via HTML5 data-attributes:
        $.each(
            this.element[0].attributes,
            function (index, attr) {
                var key = attr.name.toLowerCase(),
                    value;
                if (/^data-/.test(key)) {
                    // Convert hyphen-ated key to camelCase:
                    key = key.slice(5).replace(/-[a-z]/g, function (str) {
                        return str.charAt(1).toUpperCase();
                    });
                    value = data[key];
                    if (that._isRegExpOption(key, value)) {
                        value = that._getRegExp(value);
                    }
                    options[key] = value;
                }
            }
        );
    };

    nUIFileUpload.prototype.create = function () {
        this._initDataAttributes();
        this._initSpecialOptions();
        this._slots = [];
        this._sequence = this._getXHRPromise(true);
        this._sending = this._active = 0;
        this._initProgressObject(this);
        this._initEventHandlers();
    };

    // This method is exposed to the widget API and allows to query
    // the number of active uploads:
    nUIFileUpload.prototype.active = function () {
        return this._active;
    };

    // This method is exposed to the widget API and allows to query
    // the widget upload progress.
    // It returns an object with loaded, total and bitrate properties
    // for the running uploads:
    nUIFileUpload.prototype.progress = function () {
        return this._progress;
    };

    // This method is exposed to the widget API and allows adding files
    // using the fileupload API. The data parameter accepts an object which
    // must have a files property and can contain additional options:
    // .nUIFileUpload('add', {files: filesList});
    nUIFileUpload.prototype.add = function (data) {
        var that = this;
        if (!data || this.options.disabled) {
            return;
        }
        if (data.fileInput && !data.files) {
            this._getFileInputFiles(data.fileInput).always(function (files) {
                data.files = files;
                that._onAdd(null, data);
            });
        } else {
            data.files = $.makeArray(data.files);
            this._onAdd(null, data);
        }
    };

    // This method is exposed to the widget API and allows sending files
    // using the nUIFileUpload API. The data parameter accepts an object which
    // must have a files or fileInput property and can contain additional options:
    // .nUIFileUpload('send', {files: filesList});
    // The method returns a Promise object for the file upload call.
    nUIFileUpload.prototype.send = function (data) {
        if (data && !this.options.disabled) {
            if (data.fileInput && !data.files) {
                var that = this,
                    dfd = $.Deferred(),
                    promise = dfd.promise(),
                    jqXHR,
                    aborted;
                promise.abort = function () {
                    aborted = true;
                    if (jqXHR) {
                        return jqXHR.abort();
                    }
                    dfd.reject(null, 'abort', 'abort');
                    return promise;
                };
                this._getFileInputFiles(data.fileInput).always(
                    function (files) {
                        if (aborted) {
                            return;
                        }
                        if (!files.length) {
                            dfd.reject();
                            return;
                        }
                        data.files = files;
                        jqXHR = that._onSend(null, data);
                        jqXHR.then(
                            function (result, textStatus, jqXHR) {
                                dfd.resolve(result, textStatus, jqXHR);
                            },
                            function (jqXHR, textStatus, errorThrown) {
                                dfd.reject(jqXHR, textStatus, errorThrown);
                            }
                        );
                    }
                );
                return this._enhancePromise(promise);
            }
            data.files = $.makeArray(data.files);
            if (data.files.length) {
                return this._onSend(null, data);
            }
        }
        return this._getXHRPromise(false, data && data.context);
    };

    N2Classes.nUIWidgetBase.register('nUIFileUpload');

    return nUIFileUpload;
});
N2D('HorizontalScrollBar', function ($) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param $container
     * @constructor
     */
    function HorizontalScrollBar($container) {
        this.$container = $container;
        this.$document = $(document);

        this.currentLeft = 0;

        this.$viewport = $container.find('.n2-scroll-viewport');
        this.$content = $container.find('.n2-scroll-content');

        this.$track = $container.find('.n2-scroll-track');
        this.$grip = $container.find('.n2-scroll-grip');

        this.side = window.n2const.isRTL() ? "right" : "left";
        this.modifier = window.n2const.isRTL() ? -1 : 1;

        this.$grip.on('mousedown.scrollbar', $.proxy(this.mouseDown, this));

        this.update();

        $(window).resize($.proxy(this.update, this));
    }

    HorizontalScrollBar.prototype.update = function () {
        this.viewportWidth = this.$viewport.width();
        this.contentWidth = this.$content.outerWidth();
        this.trackWidth = this.$track.width();

        this.ratio = Math.min(1, this.viewportWidth / this.contentWidth);

        this.gripWidth = Math.max(20, Math.floor(this.ratio * this.trackWidth));

        this.$grip.width(this.gripWidth);

        this.setLeft(this.currentLeft);


        this.$container.toggleClass("n2-scroll-disable", this.ratio === 1);
    };

    HorizontalScrollBar.prototype.setLeft = function (left) {
        left = Math.max(0, Math.min(this.trackWidth - this.gripWidth, left));

        this.$grip.css(this.side, left);
        this.$content.css(this.side, -1 * Math.ceil(left / this.ratio));

        this.currentLeft = left;
    };

    HorizontalScrollBar.prototype.mouseDown = function (e) {
        this.context = {
            pageX: e.pageX,
            left: this.currentLeft
        };
        this.$document.on({
            'mousemove.scrollbar': $.proxy(this.mouseMove, this),
            'mouseup.scrollbar': $.proxy(this.mouseUp, this)
        });
    };

    HorizontalScrollBar.prototype.mouseMove = function (e) {

        this.setLeft(this.context.left + (e.pageX - this.context.pageX) * this.modifier);
    };

    HorizontalScrollBar.prototype.mouseUp = function (e) {

        this.mouseMove(e);

        /**
         * Cleanup when the interaction ends.
         */
        this.$document.off('.scrollbar');
        delete this.context;
    };

    return HorizontalScrollBar;
});
/*
 * jQuery Iframe Transport Plugin 1.8.3
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global define, require, window, document */

N2D('ajaxTransportIframe', function ($, undefined) {
    'use strict';

    // Helper variable to create unique names for the transport iframes:
    var counter = 0;

    // The iframe transport accepts four additional options:
    // options.fileInput: a jQuery collection of file input fields
    // options.paramName: the parameter name for the file form data,
    //  overrides the name property of the file input field(s),
    //  can be a string or an array of strings.
    // options.formData: an array of objects with name and value properties,
    //  equivalent to the return data of .serializeArray(), e.g.:
    //  [{name: 'a', value: 1}, {name: 'b', value: 2}]
    // options.initialIframeSrc: the URL of the initial iframe src,
    //  by default set to "javascript:false;"
    $.ajaxTransport('iframe', function (options) {
        if (options.async) {
            // javascript:false as initial iframe src
            // prevents warning popups on HTTPS in IE6:
            /*jshint scripturl: true */
            var initialIframeSrc = options.initialIframeSrc || 'javascript:false;',
                /*jshint scripturl: false */
                form,
                iframe,
                addParamChar;
            return {
                send: function (_, completeCallback) {
                    form = $('<form style="display:none;"></form>');
                    form.attr('accept-charset', options.formAcceptCharset);
                    addParamChar = /\?/.test(options.url) ? '&' : '?';
                    // XDomainRequest only supports GET and POST:
                    if (options.type === 'DELETE') {
                        options.url = options.url + addParamChar + '_method=DELETE';
                        options.type = 'POST';
                    } else if (options.type === 'PUT') {
                        options.url = options.url + addParamChar + '_method=PUT';
                        options.type = 'POST';
                    } else if (options.type === 'PATCH') {
                        options.url = options.url + addParamChar + '_method=PATCH';
                        options.type = 'POST';
                    }
                    // IE versions below IE8 cannot set the name property of
                    // elements that have already been added to the DOM,
                    // so we set the name along with the iframe HTML markup:
                    counter += 1;
                    iframe = $(
                        '<iframe src="' + initialIframeSrc +
                        '" name="iframe-transport-' + counter + '"></iframe>'
                    ).bind('load', function () {
                        var fileInputClones,
                            paramNames = $.isArray(options.paramName) ?
                                options.paramName : [options.paramName];
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                // Wrap in a try/catch block to catch exceptions thrown
                                // when trying to access cross-domain iframe contents:
                                try {
                                    response = iframe.contents();
                                    // Google Chrome and Firefox do not throw an
                                    // exception when calling iframe.contents() on
                                    // cross-domain requests, so we unify the response:
                                    if (!response.length || !response[0].firstChild) {
                                        throw new Error();
                                    }
                                } catch (e) {
                                    response = undefined;
                                }
                                // The complete callback returns the
                                // iframe content document as response object:
                                completeCallback(
                                    200,
                                    'success',
                                    {'iframe': response}
                                );
                                // Fix for IE endless progress bar activity bug
                                // (happens on form submits to iframe targets):
                                $('<iframe src="' + initialIframeSrc + '"></iframe>')
                                    .appendTo(form);
                                window.setTimeout(function () {
                                    // Removing the form in a setTimeout call
                                    // allows Chrome's developer tools to display
                                    // the response result
                                    form.remove();
                                }, 0);
                            });
                        form
                            .prop('target', iframe.prop('name'))
                            .prop('action', options.url)
                            .prop('method', options.type);
                        if (options.formData) {
                            $.each(options.formData, function (index, field) {
                                $('<input type="hidden"/>')
                                    .prop('name', field.name)
                                    .val(field.value)
                                    .appendTo(form);
                            });
                        }
                        if (options.fileInput && options.fileInput.length &&
                            options.type === 'POST') {
                            fileInputClones = options.fileInput.clone();
                            // Insert a clone for each file input field:
                            options.fileInput.after(function (index) {
                                return fileInputClones[index];
                            });
                            if (options.paramName) {
                                options.fileInput.each(function (index) {
                                    $(this).prop(
                                        'name',
                                        paramNames[index] || options.paramName
                                    );
                                });
                            }
                            // Appending the file input fields to the hidden form
                            // removes them from their original location:
                            form
                                .append(options.fileInput)
                                .prop('enctype', 'multipart/form-data')
                                // enctype must be set as encoding for IE:
                                .prop('encoding', 'multipart/form-data');
                            // Remove the HTML5 form attribute from the input(s):
                            options.fileInput.removeAttr('form');
                        }
                        form.submit();
                        // Insert the file input fields at their original location
                        // by replacing the clones with the originals:
                        if (fileInputClones && fileInputClones.length) {
                            options.fileInput.each(function (index, input) {
                                var clone = $(fileInputClones[index]);
                                // Restore the original name and form properties:
                                $(input)
                                    .prop('name', clone.prop('name'))
                                    .attr('form', clone.attr('form'));
                                clone.replaceWith(input);
                            });
                        }
                    });
                    form.append(iframe).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        // javascript:false as iframe src aborts the request
                        // and prevents warning popups on HTTPS in IE6.
                        // concat is used to avoid the "Script URL" JSLint error:
                        iframe
                            .unbind('load')
                            .prop('src', initialIframeSrc);
                    }
                    if (form) {
                        form.remove();
                    }
                }
            };
        }
    });

    // The iframe transport returns the iframe content document as response.
    // The following adds converters from iframe to text, json, html, xml
    // and script.
    // Please note that the Content-Type for JSON responses has to be text/plain
    // or text/html, if the browser doesn't include application/json in the
    // Accept header, else IE will show a download dialog.
    // The Content-Type for XML responses on the other hand has to be always
    // application/xml or text/xml, so IE properly parses the XML response.
    // See also
    // https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation
    $.ajaxSetup({
        converters: {
            'iframe text': function (iframe) {
                return iframe && $(iframe[0].body).text();
            },
            'iframe json': function (iframe) {
                return iframe && $.parseJSON($(iframe[0].body).text());
            },
            'iframe html': function (iframe) {
                return iframe && $(iframe[0].body).html();
            },
            'iframe xml': function (iframe) {
                var xmlDoc = iframe && iframe[0];
                return xmlDoc && $.isXMLDoc(xmlDoc) ? xmlDoc :
                    $.parseXML((xmlDoc.XMLDocument && xmlDoc.XMLDocument.xml) ||
                        $(xmlDoc.body).html());
            },
            'iframe script': function (iframe) {
                return iframe && $.globalEval($(iframe[0].body).text());
            }
        }
    });

});

N2D('nUIMouse', ['nUIWidgetBase'], function ($, undefined) {
    "use strict";

    var ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());

    var mouseHandled = false;
    $(document).on("mouseup", function () {
        mouseHandled = false;
    });

    /**
     * @memberOf N2Classes
     *
     * @abstract
     * @constructor
     * @augments nUIWidgetBase
     */
    function nUIMouse(element, options) {
        this.widgetName = this.widgetName || 'nUIMouse';
        this.options = $.extend({}, {
            cancel: "input, textarea, button, select, option",
            distance: 1,
            delay: 0
        }, this.options);

        N2Classes.nUIWidgetBase.prototype.constructor.apply(this, arguments);
    }


    nUIMouse.prototype = Object.create(N2Classes.nUIWidgetBase.prototype);
    nUIMouse.prototype.constructor = nUIMouse;

    nUIMouse.prototype._mouseInit = function () {
        var that = this;
        this.element
            .on("mousedown." + this.widgetName, function (event) {
                return that._mouseDown(event);
            })
            .on("click." + this.widgetName, function (event) {
                if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
                    $.removeData(event.target, that.widgetName + ".preventClickEvent");
                    event.stopImmediatePropagation();
                    return false;
                }
            });

        this.started = false;
    };

    nUIMouse.prototype._mouseDestroy = function () {
        this.element.off("." + this.widgetName);
        if (this._mouseMoveDelegate) {
            this.document
                .off("mousemove." + this.widgetName, this._mouseMoveDelegate)
                .off("mouseup." + this.widgetName, this._mouseUpDelegate);
        }
    };

    nUIMouse.prototype._mouseDown = function (event) {
        // don't let more than one widget handle mouseStart
        if (mouseHandled) {
            return;
        }

        this._mouseMoved = false;

        // We may have missed mouseup (out of window)
        ( this._mouseStarted && this._mouseUp(event) );

        this._mouseDownEvent = event;

        var that = this,
            btnIsLeft = ( event.which === 1 ),

            // event.target.nodeName works around a bug in IE 8 with
            // disabled inputs (#7620)
            elIsCancel = ( typeof this.options.cancel === "string" && event.target.nodeName ?
                $(event.target).closest(this.options.cancel).length : false );
        if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
            return true;
        }

        this.mouseDelayMet = !this.options.delay;
        if (!this.mouseDelayMet) {
            this._mouseDelayTimer = setTimeout(function () {
                that.mouseDelayMet = true;
            }, this.options.delay);
        }

        if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
            this._mouseStarted = ( this._mouseStart(event) !== false );
            if (!this._mouseStarted) {
                event.preventDefault();
                return true;
            }
        }

        // Click event may never have fired (Gecko & Opera)
        if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
            $.removeData(event.target, this.widgetName + ".preventClickEvent");
        }

        // These delegates are required to keep context
        this._mouseMoveDelegate = function (event) {
            return that._mouseMove(event);
        };
        this._mouseUpDelegate = function (event) {
            return that._mouseUp(event);
        };

        this.document
            .on("mousemove." + this.widgetName, this._mouseMoveDelegate)
            .on("mouseup." + this.widgetName, this._mouseUpDelegate);

        event.preventDefault();

        mouseHandled = true;
        return true;
    };


    nUIMouse.prototype._mouseMove = function (event) {

        // Only check for mouseups outside the document if you've moved inside the document
        // at least once. This prevents the firing of mouseup in the case of IE<9, which will
        // fire a mousemove event if content is placed under the cursor. See #7778
        // Support: IE <9
        if (this._mouseMoved) {

            // IE mouseup check - mouseup happened when mouse was out of window
            if (ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
                return this._mouseUp(event);

                // Iframe mouseup check - mouseup occurred in another document
            } else if (!event.which) {

                // Support: Safari <=8 - 9
                // Safari sets which to 0 if you press any of the following keys
                // during a drag (#14461)
                if (event.originalEvent.altKey || event.originalEvent.ctrlKey ||
                    event.originalEvent.metaKey || event.originalEvent.shiftKey) {
                    this.ignoreMissingWhich = true;
                } else if (!this.ignoreMissingWhich) {
                    return this._mouseUp(event);
                }
            }
        }

        if (event.which || event.button) {
            this._mouseMoved = true;
        }

        if (this._mouseStarted) {
            this._mouseDrag(event);
            return event.preventDefault();
        }

        if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
            this._mouseStarted =
                ( this._mouseStart(this._mouseDownEvent, event) !== false );
            ( this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event) );
        }

        return !this._mouseStarted;
    };

    nUIMouse.prototype._mouseUp = function (event) {
        this.document
            .off("mousemove." + this.widgetName, this._mouseMoveDelegate)
            .off("mouseup." + this.widgetName, this._mouseUpDelegate);

        if (this._mouseStarted) {
            this._mouseStarted = false;

            if (event.target === this._mouseDownEvent.target) {
                $.data(event.target, this.widgetName + ".preventClickEvent", true);
            }

            this._mouseStop(event);
        }

        if (this._mouseDelayTimer) {
            clearTimeout(this._mouseDelayTimer);
            delete this._mouseDelayTimer;
        }

        this.ignoreMissingWhich = false;
        mouseHandled = false;
        event.preventDefault();
    };

    nUIMouse.prototype._mouseDistanceMet = function (event) {
        return ( Math.max(
                Math.abs(this._mouseDownEvent.pageX - event.pageX),
                Math.abs(this._mouseDownEvent.pageY - event.pageY)
            ) >= this.options.distance
        );
    };

    nUIMouse.prototype._mouseDelayMet = function (/* event */) {
        return this.mouseDelayMet;
    };

    // These are placeholder methods, to be overriden by extending plugin
    nUIMouse.prototype._mouseStart = function (/* event */) {
    };
    nUIMouse.prototype._mouseDrag = function (/* event */) {
    };
    nUIMouse.prototype._mouseStop = function (/* event */) {
    };
    nUIMouse.prototype._mouseCapture = function (/* event */) {
        return true;
    };

    return nUIMouse;
});
N2D('nUINormalSizing', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments nUIMouse
     * @this nUINormalSizing
     */
    function nUINormalSizing(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUINormalSizing';
        this.widgetEventPrefix = "normalsizing";
        this.multiplier = 1;

        this.options = $.extend({
            maxWidth: true,
            height: false,
            syncWidth: false,
            start: null,
            resizeMaxWidth: null,
            resizeHeight: null,
            stopMaxWidth: null,
            stopHeight: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUINormalSizing.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUINormalSizing.prototype.constructor = nUINormalSizing;


    nUINormalSizing.prototype.create = function () {

        this._setupHandles();

        this._mouseInit();
    };

    nUINormalSizing.prototype._destroy = function () {

        this._mouseDestroy();

        this.element
            .removeData(this.widgetName);

        for (var k in this.handles) {
            this.handles[k].remove();
        }

        return this;
    };

    nUINormalSizing.prototype._setupHandles = function () {
        var o = this.options, i, n = [], hname, axis;

        if (o.maxWidth) {
            n.push('w');
            n.push('e');
        }

        if (o.height) {
            n.push('s');
        }
        this.handles = {};

        for (i = 0; i < n.length; i++) {
            var handle = n[i];
            axis = $('<div class="nui-normal-sizing-handle nui-normal-sizing-' + handle + '">').css('zIndex', 90);
            this.handles[handle] = axis;
            this.element.append(axis);
        }

        if (o.maxWidth) {
            nextend.tooltip.addElement(this.handles.e, 'Max width');
            nextend.tooltip.addElement(this.handles.w, 'Max width');
        }

        if (o.height) {
            nextend.tooltip.addElement(this.handles.s, 'Height');
        }

        this._handles = this.element.find("> .nui-normal-sizing-handle");
        this._handles.addClass('n2-unselectable');
    };

    nUINormalSizing.prototype._removeHandles = function () {
        this._handles.remove();
    };

    nUINormalSizing.prototype._mouseCapture = function (event) {
        var handle,
            capture = false;
        for (handle in this.handles) {
            if (this.handles[handle][0] === event.target) {
                this.currentHandle = handle;
                return !this.options.disabled;
            }
        }

        return false;
    };

    nUINormalSizing.prototype._mouseStart = function (event) {
        var o = this.options,
            el = this.element;

        this.resizing = true;

        this.originalMousePosition = {left: event.pageX, top: event.pageY};

        switch (this.currentHandle) {
            case 'w':
            case 'e':
                this.originalValue = this.element.width();
                this.maxWidth = this.element.parent().width();

                this._trigger("start", event, 'maxwidth');

                if (this.element.css('align-self') == 'center') {
                    this.multiplier = 2;
                } else {
                    this.multiplier = 1;
                }
                break;
            case 's':
                this.originalValue = this.element.height();

                this._trigger("start", event, 'height');
                break;
        }

        this.element.addClass("nui-normal-sizing-resizing");


        $("body").addClass('n2-ss-normal-sizing-element');
        return true;
    };

    nUINormalSizing.prototype._parse_movement_s = function (e) {
        return e.pageY - this.originalMousePosition.top;
    };

    nUINormalSizing.prototype._parse_movement_e = function (e) {
        return (e.pageX - this.originalMousePosition.left) * this.multiplier;
    };

    nUINormalSizing.prototype._parse_movement_w = function (e) {
        return (this.originalMousePosition.left - e.pageX) * this.multiplier;
    };

    nUINormalSizing.prototype._mouseDrag = function (event) {
        var o = this.options;

        this.currentValue = nextend.roundHelper(this.originalValue + this['_parse_movement_' + this.currentHandle].call(this, event));

        switch (this.currentHandle) {
            case 'w':
            case 'e':
                if (this.currentValue <= this.maxWidth) {
                    this.element.css('maxWidth', this.currentValue + 'px');
                    if (o.syncWidth) {
                        this.element.css('width', this.currentValue + 'px');
                    }
                } else {
                    this.element.css('maxWidth', 'none');
                    if (o.syncWidth) {
                        this.element.css('width', '');
                    }
                    this.currentValue = 0;
                }
                this._trigger("resizeMaxWidth", event, {value: this.currentValue});
                break;
            case 's':
                this.currentValue = Math.max(1, this.currentValue);
                this.element.height(this.currentValue);

                this._trigger("resizeHeight", event, {value: this.currentValue});
                break;
        }
    };

    nUINormalSizing.prototype._mouseStop = function (event) {
        var o = this.options;

        this.currentValue = nextend.roundHelper(this.originalValue + this['_parse_movement_' + this.currentHandle].call(this, event));

        switch (this.currentHandle) {
            case 'w':
            case 'e':
                if (this.currentValue <= this.maxWidth) {
                    this.element.css('maxWidth', this.currentValue + 'px');
                    if (o.syncWidth) {
                        this.element.css('width', '');
                    }
                } else {
                    this.element.css('maxWidth', 'none');
                    if (o.syncWidth) {
                        this.element.css('width', '');
                    }
                    this.currentValue = 0;
                }

                this._trigger("stopMaxWidth", event, {value: this.currentValue});
                break;
            case 's':
                this.currentValue = Math.max(1, this.currentValue);
                this.element.height(this.currentValue);

                this._trigger("stopHeight", event, {value: this.currentValue});
                break;
        }

        this.resizing = false;

        $("body").off('.uiNextendNormalSizing')
            .removeClass('n2-ss-normal-sizing-element');

        this.element.removeClass("nui-normal-sizing-resizing");

        nextend.preventMouseUp();
        return false;
    };

    N2Classes.nUIWidgetBase.register('nUINormalSizing');

    return nUINormalSizing;
});
N2D('nUIResizableBar', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param element
     * @param options
     */
    function nUIResizableBar(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUIResizable';
        this.widgetEventPrefix = "resize";

        this.options = $.extend({
            zIndex: 90,

            // Callbacks
            resize: null,
            start: null,
            stop: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUIResizableBar.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUIResizableBar.prototype.constructor = nUIResizableBar;

    nUIResizableBar.prototype.create = function () {

        var o = this.options;
        this.element.addClass("nui-resizable");

        this._setupHandles();

        this._mouseInit();

        this._trigger('create', null, {});
    };

    nUIResizableBar.prototype._setupHandles = function () {
        var o = this.options, handle, i, n, hname, axis, that = this;

        this._handles = $();

        n = ["e", "w"];
        this.handles = {};

        for (i = 0; i < n.length; i++) {

            handle = $.trim(n[i]);
            hname = "nui-resizable-" + handle;
            axis = $("<div>")
                .addClass("nui-resizable-handle " + hname)
                .css({zIndex: o.zIndex});

            this.handles[handle] = ".nui-resizable-" + handle;
            this.element.append(axis);
            axis.on({
                "mousedown": $.proxy(function (handleName, e) {
                    this.currentHandle = handleName;
                    this._mouseDown(e);
                }, this, handle)
            });

            this._handles = this._handles.add(axis);
        }

        this._handles.css({
            '-ms-user-select': 'none',
            '-moz-user-select': '-moz-none',
            '-khtml-user-select': 'none',
            '-webkit-user-select': 'none',
            'user-select': 'none'
        });
    };

    nUIResizableBar.prototype._mouseStart = function (event) {

        this.currentData = this.originalData = {
            margin: parseInt(this.element.css(n2const.rtl.marginLeft)),
            width: parseInt(this.element.width())
        };
        this.originalMousePosition = {left: event.pageX};

        var cursor = $(".nui-resizable-" + this.axis).css("cursor");
        $("body").css("cursor", cursor === "auto" ? this.axis + "-resize" : cursor);

        this.element.addClass("nui-resizable-resizing");
        this._trigger("start", event, this.ui());
        return true;
    };

    nUIResizableBar.prototype._mouseDrag = function (event) {
        var dx = (event.pageX - this.originalMousePosition.left) || 0;
        this.currentData = {};

        if (!n2const.rtl.isRtl) {
            if (this.currentHandle === 'e') {
                this.currentData.margin = this.originalData.margin;
                this.currentData.width = Math.max(0, this.originalData.width + dx);
            } else if (this.currentHandle === 'w') {
                this.currentData.margin = Math.max(0, this.originalData.margin + dx);
                this.currentData.width = Math.max(0, this.originalData.width - dx);
            }
        } else {
            if (this.currentHandle === 'e') {
                this.currentData.margin = Math.max(0, this.originalData.margin - dx);
                this.currentData.width = Math.max(0, this.originalData.width + dx);
            } else if (this.currentHandle === 'w') {
                this.currentData.margin = this.originalData.margin;
                this.currentData.width = Math.max(0, this.originalData.width - dx);
            }
        }

        this._trigger("resize", event, this.ui());

        this.element.css(n2const.rtl.marginLeft, this.currentData.margin);
        this.element.css('width', this.currentData.width);
    };

    nUIResizableBar.prototype._mouseStop = function (event) {

        $("body").css("cursor", "auto");

        this.element.removeClass("nui-resizable-resizing");

        this._trigger("stop", event, this.ui());
    };

    nUIResizableBar.prototype.ui = function () {
        return {
            currentData: this.currentData
        };
    };

    N2Classes.nUIWidgetBase.register('nUIResizableBar');

    return nUIResizableBar;
});
N2D('nUIResizable', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param element
     * @param options
     */
    function nUIResizable(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUIResizable';
        this.widgetEventPrefix = "resize";

        this.options = $.extend({
            alsoResize: false,
            containment: false,
            handles: "e,s,se",
            helper: false,
            maxHeight: null,
            maxWidth: null,
            minHeight: 10,
            minWidth: 10,

            // See #7960
            zIndex: 90,

            // Callbacks
            resize: null,
            start: null,
            stop: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUIResizable.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUIResizable.prototype.constructor = nUIResizable;

    nUIResizable.plugins = {};

    nUIResizable.prototype._num = function (value) {
        return parseFloat(value) || 0;
    };

    nUIResizable.prototype._isNumber = function (value) {
        return !isNaN(parseFloat(value));
    };

    nUIResizable.prototype._hasScroll = function (el, a) {

        if ($(el).css("overflow") === "hidden") {
            return false;
        }

        var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop",
            has = false;

        if (el[scroll] > 0) {
            return true;
        }

        // TODO: determine which cases actually cause this to happen
        // if the element doesn't have the scroll set, see if it's possible to
        // set the scroll
        el[scroll] = 1;
        has = (el[scroll] > 0);
        el[scroll] = 0;
        return has;
    };

    nUIResizable.prototype.create = function () {

        var o = this.options;
        this.element.addClass("nui-resizable");

        $.extend(this, {
            originalElement: this.element,
            _helper: o.helper ? o.helper || "nui-resizable-helper" : null
        });

        this._setupHandles();

        this._mouseInit();

        this._trigger('create', null, {});
    };

    nUIResizable.prototype._setupHandles = function () {
        var o = this.options, handle, i, n, hname, axis, that = this;
        this.handles = o.handles ||
            (!$(".nui-resizable-handle", this.element).length ?
                "e,s,se" : {
                    n: ".nui-resizable-n",
                    e: ".nui-resizable-e",
                    s: ".nui-resizable-s",
                    w: ".nui-resizable-w",
                    se: ".nui-resizable-se",
                    sw: ".nui-resizable-sw",
                    ne: ".nui-resizable-ne",
                    nw: ".nui-resizable-nw"
                });

        this._handles = $();
        if (this.handles.constructor === String) {

            if (this.handles === "all") {
                this.handles = "n,e,s,w,se,sw,ne,nw";
            }

            n = this.handles.split(",");
            this.handles = {};

            for (i = 0; i < n.length; i++) {

                handle = $.trim(n[i]);
                hname = "nui-resizable-" + handle;
                axis = $("<div>")
                    .addClass("nui-resizable-handle " + hname);

                axis.css({zIndex: o.zIndex});

                this.handles[handle] = ".nui-resizable-" + handle;
                this.element.append(axis);
            }

        }

        this._renderAxis = function () {

            var i;

            for (i in this.handles) {

                if (this.handles[i].constructor === String) {
                    this.handles[i] = this.element.children(this.handles[i]).first().show();
                } else if (this.handles[i].jquery || this.handles[i].nodeType) {
                    this.handles[i] = $(this.handles[i]);
                    this._on(this.handles[i], {"mousedown": that._mouseDown});
                }

                this._handles = this._handles.add(this.handles[i]);
            }
        };

        // TODO: make renderAxis a prototype function
        this._renderAxis(this.element);

        this._handles = this._handles.add(this.element.find(".nui-resizable-handle"));
        this._handles.addClass('n2-unselectable');

        this._handles.on("mouseover", function () {
            if (!that.resizing) {
                if (this.className) {
                    axis = this.className.match(/nui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
                }
                that.axis = axis && axis[1] ? axis[1] : "se";
            }
        });
    };

    nUIResizable.prototype._mouseCapture = function (event) {
        var i, handle,
            capture = false;

        for (i in this.handles) {
            handle = $(this.handles[i])[0];
            if (handle === event.target || $.contains(handle, event.target)) {
                capture = true;
            }
        }

        return !this.options.disabled && capture;
    };

    nUIResizable.prototype._removeHandles = function () {
        this._handles.remove();
    };

    nUIResizable.prototype._mouseStart = function (event) {

        var position = this.element.position();
        this.element.css({
            left: position.left,
            top: position.top,
            right: 'auto',
            bottom: 'auto'
        });

        var curleft, curtop, cursor,
            o = this.options,
            el = this.element;

        this.resizing = true;

        this._renderProxy();

        curleft = this._num(this.helper.css("left"));
        curtop = this._num(this.helper.css("top"));

        if (o.containment) {
            curleft += $(o.containment).scrollLeft() || 0;
            curtop += $(o.containment).scrollTop() || 0;
        }

        this.offset = this.helper.offset();
        this.position = {left: curleft, top: curtop};

        this.size = this._helper ? {
            width: this.helper.width(),
            height: this.helper.height()
        } : {
            width: el.width(),
            height: el.height()
        };

        this.originalSize = this._helper ? {
            width: el.outerWidth(),
            height: el.outerHeight()
        } : {
            width: el.width(),
            height: el.height()
        };

        this.sizeDiff = {
            width: el.outerWidth() - el.width(),
            height: el.outerHeight() - el.height()
        };

        this.originalPosition = {left: curleft, top: curtop};
        this.originalMousePosition = {left: event.pageX, top: event.pageY};

        cursor = $(".nui-resizable-" + this.axis).css("cursor");
        $("body").css("cursor", cursor === "auto" ? this.axis + "-resize" : cursor);

        this.element.addClass("nui-resizable-resizing");
        this._propagate("start", event);
        return true;
    };

    nUIResizable.prototype._mouseDrag = function (event) {

        var data, props,
            smp = this.originalMousePosition,
            a = this.axis,
            dx = (event.pageX - smp.left) || 0,
            dy = (event.pageY - smp.top) || 0,
            trigger = this._change[a];

        this._updatePrevProperties();

        if (!trigger) {
            return false;
        }

        data = trigger.apply(this, [event, dx, dy]);

        this._updateVirtualBoundaries();

        data = this._respectSize(data, event);

        this._updateCache(data);

        this._propagate("resize", event);

        props = this._applyChanges();

        if (!$.isEmptyObject(props)) {
            this._updatePrevProperties();
            this._trigger("resize", event, this.ui());
            this._applyChanges();
        }

        return false;
    };

    nUIResizable.prototype._mouseStop = function (event) {

        this.resizing = false;
        var s, left, top, that = this;

        if (this._helper) {

            s = {
                width: that.helper.width(),
                height: that.helper.height()
            };
            left = (parseFloat(that.element.css("left")) +
                (that.position.left - that.originalPosition.left)) || null;
            top = (parseFloat(that.element.css("top")) +
                (that.position.top - that.originalPosition.top)) || null;

            this.element.css($.extend(s, {top: top, left: left}));


            that.helper.height(that.size.height);
            that.helper.width(that.size.width);

        }

        $("body").css("cursor", "auto");

        this.element.removeClass("nui-resizable-resizing");

        this._propagate("stop", event);

        if (this._helper) {
            this.helper.remove();
        }

        return false;

    };

    nUIResizable.prototype._updatePrevProperties = function () {
        this.prevPosition = {
            top: this.position.top,
            left: this.position.left
        };
        this.prevSize = {
            width: this.size.width,
            height: this.size.height
        };
    };

    nUIResizable.prototype._applyChanges = function () {
        var props = {};

        if (this.position.top !== this.prevPosition.top) {
            props.top = this.position.top + "px";
        }
        if (this.position.left !== this.prevPosition.left) {
            props.left = this.position.left + "px";
        }
        if (this.size.width !== this.prevSize.width) {
            props.width = this.size.width + "px";
        }
        if (this.size.height !== this.prevSize.height) {
            props.height = this.size.height + "px";
        }

        this.helper.css(props);

        return props;
    };

    nUIResizable.prototype._updateVirtualBoundaries = function () {
        var b,
            o = this.options;

        b = {
            minWidth: this._isNumber(o.minWidth) ? o.minWidth : 0,
            maxWidth: this._isNumber(o.maxWidth) ? o.maxWidth : Infinity,
            minHeight: this._isNumber(o.minHeight) ? o.minHeight : 0,
            maxHeight: this._isNumber(o.maxHeight) ? o.maxHeight : Infinity
        };

        this._vBoundaries = b;
    };

    nUIResizable.prototype._updateCache = function (data) {
        this.offset = this.helper.offset();
        if (this._isNumber(data.left)) {
            this.position.left = data.left;
        }
        if (this._isNumber(data.top)) {
            this.position.top = data.top;
        }
        if (this._isNumber(data.height)) {
            this.size.height = data.height;
        }
        if (this._isNumber(data.width)) {
            this.size.width = data.width;
        }
    };

    nUIResizable.prototype._respectSize = function (data) {

        var o = this._vBoundaries,
            a = this.axis,
            ismaxw = this._isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width),
            ismaxh = this._isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
            isminw = this._isNumber(data.width) && o.minWidth && (o.minWidth > data.width),
            isminh = this._isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
            dw = this.originalPosition.left + this.originalSize.width,
            dh = this.originalPosition.top + this.originalSize.height,
            cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);
        if (isminw) {
            data.width = o.minWidth;
        }
        if (isminh) {
            data.height = o.minHeight;
        }
        if (ismaxw) {
            data.width = o.maxWidth;
        }
        if (ismaxh) {
            data.height = o.maxHeight;
        }

        if (isminw && cw) {
            data.left = dw - o.minWidth;
        }
        if (ismaxw && cw) {
            data.left = dw - o.maxWidth;
        }
        if (isminh && ch) {
            data.top = dh - o.minHeight;
        }
        if (ismaxh && ch) {
            data.top = dh - o.maxHeight;
        }

        // Fixing jump error on top/left - bug #2330
        if (!data.width && !data.height && !data.left && data.top) {
            data.top = null;
        } else if (!data.width && !data.height && !data.top && data.left) {
            data.left = null;
        }

        return data;
    };

    nUIResizable.prototype._renderProxy = function () {

        var el = this.element, o = this.options;
        this.elementOffset = el.offset();

        if (this._helper) {

            this.helper = this.helper || $("<div style='overflow:hidden;'></div>")
                .addClass(this._helper);
            this.helper.css({
                width: this.element.outerWidth(),
                height: this.element.outerHeight(),
                position: "absolute",
                left: this.elementOffset.left + "px",
                top: this.elementOffset.top + "px",
                zIndex: ++o.zIndex //TODO: Don't modify option
            });

            this.helper
                .addClass('n2-unselectable')
                .appendTo("body");

        } else {
            this.helper = this.element;
        }

    };

    nUIResizable.prototype._change = {
        e: function (event, dx) {
            return {width: this.originalSize.width + dx};
        },
        w: function (event, dx) {
            var cs = this.originalSize, sp = this.originalPosition;
            return {left: sp.left + dx, width: cs.width - dx};
        },
        n: function (event, dx, dy) {
            var cs = this.originalSize, sp = this.originalPosition;
            return {top: sp.top + dy, height: cs.height - dy};
        },
        s: function (event, dx, dy) {
            return {height: this.originalSize.height + dy};
        },
        se: function (event, dx, dy) {
            return $.extend(this._change.s.apply(this, arguments),
                this._change.e.apply(this, [event, dx, dy]));
        },
        sw: function (event, dx, dy) {
            return $.extend(this._change.s.apply(this, arguments),
                this._change.w.apply(this, [event, dx, dy]));
        },
        ne: function (event, dx, dy) {
            return $.extend(this._change.n.apply(this, arguments),
                this._change.e.apply(this, [event, dx, dy]));
        },
        nw: function (event, dx, dy) {
            return $.extend(this._change.n.apply(this, arguments),
                this._change.w.apply(this, [event, dx, dy]));
        }
    };

    nUIResizable.prototype._propagate = function (n, event) {
        this.callPlugin(n, [event, this.ui()]);
        (n !== "resize" && this._trigger(n, event, this.ui()));
    };

    nUIResizable.prototype.ui = function () {
        return {
            originalElement: this.originalElement,
            element: this.element,
            helper: this.helper,
            position: this.position,
            size: this.size,
            originalSize: this.originalSize,
            originalPosition: this.originalPosition,
            axis: this.axis
        };
    };


    nUIResizable.prototype._destroy = function () {
        this._mouseDestroy();

        this.element
            .removeClass("nui-resizable")
            .removeData(this.widgetName);

        for (var k in this.handles) {
            this.handles[k].remove();
        }

        return this;
    };

    N2Classes.nUIWidgetBase.addPlugin(nUIResizable, "smartguides", {
        start: function (event, ui) {
            var i = $(this).data("nUIResizable"), o = i.options;
            i.gridH = $('<div class="n2-grid n2-grid-h"></div>').appendTo(o._containment);
            i.gridV = $('<div class="n2-grid n2-grid-v"></div>').appendTo(o._containment);
            i.gridH2 = $('<div class="n2-grid n2-grid-h"></div>').appendTo(o._containment);
            i.gridV2 = $('<div class="n2-grid n2-grid-v"></div>').appendTo(o._containment);
            i.elements = [];
            if (typeof o.smartguides == 'function') {

                var guides = o.smartguides();
                if (guides) {
                    var containmentOffset = o._containment.offset();
                    guides.each(function () {
                        var $t = $(this);
                        var $o = $t.offset();
                        if (this != i.element[0]) i.elements.push({
                            item: this,
                            width: $t.outerWidth(),
                            height: $t.outerHeight(),
                            top: Math.round($o.top - containmentOffset.top),
                            left: Math.round($o.left - containmentOffset.left)
                        });
                    });
                    i.elements.push({
                        item: o._containment,
                        width: o._containment.width(), height: o._containment.height(),
                        top: 0, left: 0
                    });
                }
            }
        },
        stop: function (event, ui) {
            var i = $(this).data("nUIResizable");
            i.gridH.remove();
            i.gridV.remove();
            i.gridH2.remove();
            i.gridV2.remove();
        },
        resize: function (event, ui) {
            var inst = $(this).data("nUIResizable"), o = inst.options;
            var d = o.tolerance;
            inst.gridV.css({"display": "none"});
            inst.gridH.css({"display": "none"});
            inst.gridV2.css({"display": "none"});
            inst.gridH2.css({"display": "none"});


            var container = inst.elements[inst.elements.length - 1];

            function setGridV(left) {
                inst.gridV.css({left: Math.min(left, container.width - 1), display: "block"});
            };

            function setGridV2(left) {
                inst.gridV2.css({left: Math.min(left, container.width - 1), display: "block"});
            };

            function setGridH(top) {
                inst.gridH.css({top: Math.min(top, container.height - 1), display: "block"});
            };

            function setGridH2(top) {
                inst.gridH2.css({top: Math.min(top, container.height - 1), display: "block"});
            };

            var ctrlKey = event.ctrlKey || event.metaKey,
                altKey = event.altKey;
            if (ctrlKey && altKey) {
                return;
            }

            var x1 = ui.position.left, x2 = x1 + ui.size.width,
                y1 = ui.position.top, y2 = y1 + ui.size.height;
            for (var i = inst.elements.length - 1; i >= 0; i--) {
                var l = inst.elements[i].left, r = l + inst.elements[i].width,
                    t = inst.elements[i].top, b = t + inst.elements[i].height;

                if (!ctrlKey) {
                    var hc = (l + r) / 2;

                    if (Math.abs(l - x2) <= d) {
                        ui.size.width = l - ui.position.left;
                        setGridV(ui.position.left + ui.size.width);
                    } else if (Math.abs(l - x1) <= d) {
                        var diff = ui.position.left - l;
                        ui.position.left = l;
                        ui.size.width += diff;
                        setGridV(ui.position.left);
                    } else if (Math.abs(hc - x1) <= d) {
                        var diff = ui.position.left - hc;
                        ui.position.left = hc;
                        ui.size.width += diff;
                        setGridV(ui.position.left);
                    }

                    if (Math.abs(r - x1) <= d) {
                        var diff = ui.position.left - r;
                        ui.position.left = r;
                        ui.size.width += diff;
                        setGridV2(ui.position.left);
                    } else if (Math.abs(r - x2) <= d) {
                        ui.size.width = r - ui.position.left;
                        setGridV2(ui.position.left + ui.size.width);
                    } else if (Math.abs(hc - x2) <= d) {
                        ui.size.width = hc - ui.position.left;
                        setGridV2(ui.position.left + ui.size.width);
                    }
                }

                if (!altKey) {
                    var vc = (t + b) / 2;

                    if (Math.abs(t - y2) <= d) {
                        ui.size.height = t - ui.position.top;
                        setGridH(t);
                    } else if (Math.abs(t - y1) <= d) {
                        var diff = ui.position.top - t;
                        ui.position.top = t;
                        ui.size.height += diff;
                        setGridH(ui.position.top);
                    } else if (Math.abs(vc - y1) <= d) {
                        var diff = ui.position.top - vc;
                        ui.position.top = vc;
                        ui.size.height += diff;
                        setGridH(ui.position.top);
                    }

                    if (Math.abs(b - y1) <= d) {
                        var diff = ui.position.top - b;
                        ui.position.top = b;
                        ui.size.height += diff;
                        setGridH2(ui.position.top);
                    } else if (Math.abs(b - y2) <= d) {
                        ui.size.height = b - ui.position.top;
                        setGridH2(ui.position.top + ui.size.height);
                    } else if (Math.abs(vc - y2) <= d) {
                        ui.size.height = vc - ui.position.top;
                        setGridH2(ui.position.top + ui.size.height);
                    }
                }
            }
        }
    });

    N2Classes.nUIWidgetBase.register('nUIResizable');

    return nUIResizable;
});
N2D('nUISlider', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments nUIMouse
     * @this nUISlider
     */
    function nUISlider(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUISlider';
        this.widgetEventPrefix = "slide";

        this.options = $.extend({
            min: 0,
            max: 100,
            step: 1,
            value: 0,

            // Callbacks
            change: null,
            slide: null,
            start: null,
            stop: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUISlider.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUISlider.prototype.constructor = nUISlider;


    N2Classes.nUIWidgetBase.register('nUISlider');

    nUISlider.prototype.create = function () {
        this._mouseSliding = false;
        this._mouseInit();
        this._calculateNewMax();

        this.element.addClass("nui-slider nui-slider-horizontal");

        this._refresh();
    };

    nUISlider.prototype.doAction = function (action) {
        N2Classes.nUIWidgetBase.prototype.doAction.apply(this, arguments);

        switch (action) {
            case 'value':
                return this._value();
        }
    };

    nUISlider.prototype.setOption = function (key, value) {
        N2Classes.nUIWidgetBase.prototype.setOption.call(this, key, value);

        switch (key) {
            case "value":
                this._refreshValue();
                this._change(null, 0);
                break;
            case "step":
            case "min":
            case "max":
                this._calculateNewMax();
                this._refreshValue();
                break;
        }
    };


    nUISlider.prototype._refresh = function () {
        this._createHandle();
        this._refreshValue();
    };

    nUISlider.prototype._createHandle = function () {
        var existingHandle = this.element.find(".nui-slider-handle");

        if (existingHandle.length) {
            this.handle = existingHandle;
        } else {
            this.handle = $("<span tabindex='0'></span>");
        }

        this.handle.attr("tabIndex", 0)
            .addClass("nui-slider-handle")
            .appendTo(this.element);
    };

    nUISlider.prototype._mouseCapture = function (event) {
        var position, normValue, distance, handle = this.handle, allowed, offset, mouseOverHandle,
            o = this.options;

        if (o.disabled) {
            return false;
        }

        this.elementSize = {
            width: this.element.outerWidth(),
            height: this.element.outerHeight()
        };
        this.elementOffset = this.element.offset();

        position = {x: event.pageX, y: event.pageY};
        normValue = this._normValueFromMouse(position);

        allowed = this._start(event);
        if (allowed === false) {
            return false;
        }
        this._mouseSliding = true;

        handle.trigger("focus");

        this._slide(event, normValue);

        return true;
    };

    nUISlider.prototype._mouseStart = function () {
        this.lastValue = Number.MAX_VALUE;
        return true;
    };

    nUISlider.prototype._mouseDrag = function (event) {
        var position = {x: event.pageX, y: event.pageY},
            normValue = this._normValueFromMouse(position);

        if (this.lastValue != normValue) {
            this._slide(event, normValue);
            this.lastValue = normValue;
        }

        return false;
    };

    nUISlider.prototype._mouseStop = function (event) {
        this._mouseSliding = false;

        this._stop(event);
        this._change(event);

        return false;
    };

    nUISlider.prototype._normValueFromMouse = function (position) {
        var pixelTotal,
            pixelMouse,
            percentMouse,
            valueTotal,
            valueMouse;

        pixelTotal = this.elementSize.width;
        pixelMouse = position.x - this.elementOffset.left;

        percentMouse = ( pixelMouse / pixelTotal );
        if (percentMouse > 1) {
            percentMouse = 1;
        }
        if (percentMouse < 0) {
            percentMouse = 0;
        }

        valueTotal = this._valueMax() - this._valueMin();
        valueMouse = this._valueMin() + percentMouse * valueTotal;

        return this._trimAlignValue(valueMouse);
    };

    nUISlider.prototype._trimAlignValue = function (val) {
        if (val <= this._valueMin()) {
            return this._valueMin();
        }
        if (val >= this._valueMax()) {
            return this._valueMax();
        }
        var step = ( this.options.step > 0 ) ? this.options.step : 1,
            valModStep = ( val - this._valueMin() ) % step,
            alignValue = val - valModStep;

        if (Math.abs(valModStep) * 2 >= step) {
            alignValue += ( valModStep > 0 ) ? step : ( -step );
        }

        // Since JavaScript has problems with large floats, round
        // the final value to 5 digits after the decimal point (see #4124)
        return parseFloat(alignValue.toFixed(5));
    };

    nUISlider.prototype._calculateNewMax = function () {
        var max = this.options.max,
            min = this._valueMin(),
            step = this.options.step,
            aboveMin = Math.round(( max - min ) / step) * step;
        max = aboveMin + min;
        if (max > this.options.max) {

            //If max is not divisible by step, rounding off may increase its value
            max -= step;
        }
        this.max = parseFloat(max.toFixed(this._precision()));
    };

    nUISlider.prototype._precision = function () {
        var precision = this._precisionOf(this.options.step);
        if (this.options.min !== null) {
            precision = Math.max(precision, this._precisionOf(this.options.min));
        }
        return precision;
    };

    nUISlider.prototype._precisionOf = function (num) {
        var str = num.toString(),
            decimal = str.indexOf(".");
        return decimal === -1 ? 0 : str.length - decimal - 1;
    };

    nUISlider.prototype._change = function (event) {
        if (!this._mouseSliding) {
            this._trigger("change", event, this._uiHash());
        }
    };

    nUISlider.prototype.value = function (newValue) {
        if (arguments.length) {
            this.options.value = this._trimAlignValue(newValue);
            this._refreshValue();
            this._change(null, 0);
            return;
        }

        return this._value();
    };

    //internal value getter
    // _value() returns value trimmed by min and max, aligned by step
    nUISlider.prototype._value = function () {
        var val = this.options.value;
        val = this._trimAlignValue(val);

        return val;
    };

    nUISlider.prototype._valueMin = function () {
        return this.options.min;
    };

    nUISlider.prototype._valueMax = function () {
        return this.max;
    };

    nUISlider.prototype._refreshValue = function () {
        var value = this.value(),
            valueMin = this._valueMin(),
            valueMax = this._valueMax(),
            valPercent = ( valueMax !== valueMin ) ? ( value - valueMin ) / ( valueMax - valueMin ) * 100 : 0;
        this.handle.css('left', valPercent + "%");
    };


    nUISlider.prototype._uiHash = function (value) {
        return {
            handle: this.handle[0],
            value: value !== undefined ? value : this.value()
        };
    };

    nUISlider.prototype._start = function (event) {
        return this._trigger("start", event, this._uiHash());
    };

    nUISlider.prototype._slide = function (event, newVal) {
        var allowed,
            currentValue = this.value();

        if (newVal === currentValue) {
            return;
        }

        allowed = this._trigger("slide", event, this._uiHash(newVal));

        // A slide can be canceled by returning false from the slide callback
        if (allowed === false) {
            return;
        }

        this.value(newVal);
    };

    nUISlider.prototype._stop = function (event) {
        this._trigger("stop", event, this._uiHash());
    };

    return nUISlider;
});
N2D('nUISortable', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments nUIMouse
     */
    function nUISortable(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUISortable';
        this.widgetEventPrefix = "sortable";

        this.options = $.extend({
            items: '> *',
            handle: '',
            placeholder: false,
            helper: 'original',
            forcePlaceholderSize: false,
            forceHelperSize: false,
            axis: false,
            droppables: false
        }, this.options, options);

        this.isOver = false;

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUISortable.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUISortable.prototype.constructor = nUISortable;

    nUISortable.prototype.create = function () {
        this._mouseInit();
    };

    nUISortable.prototype._mouseCapture = function (e) {
        if (this.options.disabled) {
            return false;
        }

        var currentItem = null,
            $target = $(e.target);

        if (this.options.handle !== '') {
            var handles = this.element.find(this.options.items + ' ' + this.options.handle);
            if (handles.index($target) === -1 && !handles.has($target).length) {
                //Item not dragged by the handle
                return false;
            }
        }

        var items = this.element.find(this.options.items);
        if (items.index($target) !== -1) {
            currentItem = $target;
        } else {
            currentItem = items.has($target);
        }

        if (!currentItem.length) {
            return false;
        }

        this.currentItem = currentItem;

        return true;
    };

    nUISortable.prototype._mouseStart = function (e) {

        this._trigger('beforestart', e, {
            currentItem: this.currentItem
        });

        this.context = {
            e: e,
            original: {
                pageX: e.pageX,
                pageY: e.pageY,
                clientX: e.clientX,
                clientY: e.clientY,
                elementBCR: this.element[0].getBoundingClientRect(),
                currentItemBCR: this.currentItem[0].getBoundingClientRect()
            },
            offsetShift: {
                top: 0,
                left: 0
            },
            scrollCB: $.proxy(this._mouseScroll, this)
        };

        this.element.addClass('n2-ui-sortable-in-progress');

        this._cacheItems();

        this.placeholder = $('<div/>')
            .addClass(this.options.placeholder || this.currentItem[0].className);

        var size = {
            width: this.currentItem.width(),
            height: this.currentItem.height()
        };

        if (this.options.helper === 'clone') {
            this.helper = this.currentItem.clone();
        } else if (this.options.helper === 'clone_hide') {
            this.helper = this.currentItem.clone();
            this.currentItem.css('display', 'none');
        } else {
            this.helper = this.currentItem
        }

        if (this.options.forceHelperSize) {
            this.helper.css(size);
        }

        if (this.options.forcePlaceholderSize) {
            this.placeholder.css(size);
        }

        this.helper.addClass('n2-ui-sortable-helper')
            .css({
                position: 'absolute',
                zIndex: 1000
            })
            .appendTo(this.element);

        this._trigger('start', e, this.ui());

        /**
         * Trigger mousemove event on scroll to update the helper position
         */
        window.addEventListener('scroll', this.context.scrollCB, {
            capture: true,
            passive: true
        });
    };

    nUISortable.prototype._mouseDrag = function (e) {
        this.context.e = e;

        var elementBDR = this.element[0].getBoundingClientRect(),
            helperPosition = {};

        if (!this.options.axis || this.options.axis === 'x') {

            var modifierX = elementBDR.left + this.context.original.clientX - e.clientX;
            this.context.offsetShift.left = e.pageX - this.context.original.pageX - this.context.original.elementBCR.left + modifierX;

            helperPosition.left = this.context.original.currentItemBCR.left - modifierX;
        }

        if (!this.options.axis || this.options.axis === 'y') {

            var modifierY = elementBDR.top + this.context.original.clientY - e.clientY;
            this.context.offsetShift.top = e.pageY - this.context.original.pageY - this.context.original.elementBCR.top + modifierY;

            helperPosition.top = this.context.original.currentItemBCR.top - modifierY;
        }

        this.helper.css(helperPosition);

        var closestData = this._findClosestItem(e),
            nearestItem = closestData[1] === 'before' ? this.items[Math.max(0, closestData[2] - 1)] : this.items[Math.min(this.items.length - 1, closestData[2])];

        if (this.options.helper === 'clone' && (closestData[0].is(this.currentItem) || $(nearestItem).is(this.currentItem))) {
            this.placeholder.detach();
        } else {

            this.positionPlaceholder(closestData);
        }

        if (this.options.droppables) {
            if (closestData[1] !== 'over') {
                if (this.isOver) {
                    this._trigger('out', e, this.ui());
                    this.isOver = false;
                }
            } else {
                if (this.isOver && !this.isOver.is(closestData[0])) {
                    this._trigger('out', e, this.ui());
                    this.isOver = false;
                }

                if (!this.isOver) {
                    this.isOver = closestData[0];
                    this._trigger('over', e, this.ui());
                }
            }
        }
    };

    nUISortable.prototype.positionPlaceholder = function (closestData) {
        switch (closestData[1]) {
            case 'before':
                this.placeholder.insertBefore(closestData[0]);
                break;
            case 'after':
                this.placeholder.insertAfter(closestData[0]);
                break;
            case 'over':
                this.placeholder.detach();
                break;
        }
    };

    nUISortable.prototype._mouseStop = function (e) {
        this.context.e = e;

        this._trigger('beforestop', e, this.ui());

        window.removeEventListener('scroll', this.context.scrollCB, {
            capture: true,
            passive: true
        });

        this.placeholder.remove();

        var closestData = this._findClosestItem(e);
        switch (closestData[1]) {
            case 'before':
                this.currentItem.insertBefore(closestData[0]);
                break;
            case 'after':
                this.currentItem.insertAfter(closestData[0]);
                break;
        }

        this.helper
            .removeClass('n2-ui-sortable-helper')
            .css({
                position: '',
                zIndex: '',
                left: '',
                top: ''
            });

        if (this.options.helper === 'clone' || this.options.helper === 'clone_hide') {
            this.helper.remove();
        }
        if (this.options.helper === 'clone_hide') {
            this.currentItem.css('display', '');
        }

        this.element.removeClass('n2-ui-sortable-in-progress');

        if (closestData[1] === 'over') {
            this._trigger('drop', e, this.ui());
            this._trigger('out', e, this.ui());
        } else {
            this._trigger('stop', e, this.ui());
        }

        this.currentItem = null;

    };

    nUISortable.prototype._findClosestItem = function (e) {
        var distance = Number.MAX_VALUE,
            left = e.pageX - this.context.offsetShift.left,
            top = e.pageY - this.context.offsetShift.top,
            closestItem, closestItemSide, closestItemIndex;

        for (var i = 0; i < this.itemsData.length; i++) {
            var item = this.itemsData[i];
            for (var k in item.side) {
                var localDistance = Math.sqrt(Math.pow((left - item.side[k].left) / item.width, 2) + Math.pow((top - item.side[k].top) / item.height, 2));
                if (localDistance < distance) {
                    distance = localDistance;
                    closestItem = item.item;

                    closestItemSide = k;
                    if (k === 'after') {
                        closestItemIndex = i + 1;
                    } else if (k === 'before') {
                        closestItemIndex = i;
                    }
                }
            }
        }
        return [closestItem, closestItemSide, closestItemIndex];
    };

    nUISortable.prototype.getItems = function () {
        return this.element.find(this.options.items);
    };

    nUISortable.prototype._cacheItems = function () {
        this.items = this.getItems();

        this.itemsData = [];
        for (var i = 0; i < this.items.length; i++) {

            if (this.options.helper === 'original' && this.items[i] === this.currentItem[0]) {
                continue;
            }

            var offset = this.items.eq(i).offset(),
                width = this.items.eq(i).width(),
                height = this.items.eq(i).height(),
                side = {};

            if (this.options.droppables && !this.currentItem.hasClass(this.options.droppables) && this.items.eq(i).hasClass(this.options.droppables)) {
                side.before = {
                    left: offset.left + width / 6,
                    top: offset.top + height / 6
                };
                side.over = {
                    left: offset.left + 3 * width / 6,
                    top: offset.top + 3 * height / 6
                };
                side.after = {
                    left: offset.left + 5 * width / 6,
                    top: offset.top + 5 * height / 6
                };
            } else {
                side.before = {
                    left: offset.left + width / 4,
                    top: offset.top + height / 4
                };
                side.after = {
                    left: offset.left + 3 * width / 4,
                    top: offset.top + 3 * height / 4
                };
            }

            if (window.n2const.isRTL()) {
                var after = side.after;
                side.after = side.before;
                side.before = after;
            }

            this.itemsData.push({
                item: this.items.eq(i),
                side: side,
                width: width,
                height: height
            });
        }
    };

    nUISortable.prototype._mouseScroll = function () {
        var e = this.context.e;
        document.dispatchEvent(new MouseEvent('mousemove', {
            clientX: e.clientX,
            clientY: e.clientY
        }));
    };

    nUISortable.prototype.ui = function () {
        return {
            placeholder: this.placeholder,
            helper: this.helper,
            item: this.currentItem,
            droppable: this.isOver
        };
    };

    N2Classes.nUIWidgetBase.register('nUISortable');

    return nUISortable;
});
N2D('nUISortableRow', ['nUISortable'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param element
     * @param options
     */
    function nUISortableRow(element, options) {

        N2Classes.nUISortable.prototype.constructor.apply(this, arguments);

        this.lastPosition = null;
    }


    nUISortableRow.prototype = Object.create(N2Classes.nUISortable.prototype);
    nUISortableRow.prototype.constructor = nUISortableRow;


    nUISortableRow.prototype.getItems = function () {
        var items = this.element.find(this.options.items);

        if (items.eq(0).attr('style').indexOf('order:') !== -1) {
            items.sort(function (a, b) {
                var aOrder = $(a).css('order'),
                    bOrder = $(b).css('order');
                return ((aOrder < bOrder) ? -1 : ((aOrder > bOrder) ? 1 : 0));
            });

            this.hasOrder = true;
        } else {
            this.hasOrder = false;
        }

        this.lastPosition = null;

        return items;
    };


    nUISortableRow.prototype.positionPlaceholder = function (closestData) {
        switch (closestData[1]) {
            case 'before':
                this.placeholder.insertBefore(closestData[0]);
                if (this.hasOrder) {
                    this.placeholder.css('order', closestData[0].css('order') - 1);
                }
                break;
            case 'after':
                this.placeholder.insertAfter(closestData[0]);
                if (this.hasOrder) {
                    this.placeholder.css('order', closestData[0].css('order') + 1);
                }
                break;
            case 'over':
                this.placeholder.detach();
                break;
        }

        this.lastPosition = closestData;
    };

    nUISortableRow.prototype.ui = function () {
        return {
            placeholder: this.placeholder,
            helper: this.helper,
            item: this.currentItem,
            droppable: this.isOver,
            lastPosition: this.lastPosition
        };
    };

    N2Classes.nUIWidgetBase.register('nUISortableRow');

    return nUISortableRow;
});
N2D('nUISpacing', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments nUIMouse
     * @this nUISpacing
     */
    function nUISpacing(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUISpacing';
        this.widgetEventPrefix = "spacing";

        this.options = $.extend({
            handles: '',
            mode: 'padding',
            sync: {
                n: 'padding-top',
                e: 'padding-right',
                s: 'padding-bottom',
                w: 'padding-left'
            },
            syncInv: {
                n: 's',
                e: 'w',
                s: 'n',
                w: 'e'
            },
            side: {
                n: 'top',
                e: 'right',
                s: 'bottom',
                w: 'left'
            },
            size: {
                n: 'height',
                e: 'width',
                s: 'height',
                w: 'width'
            },
            // Callbacks
            drag: null,
            start: null,
            stop: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUISpacing.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUISpacing.prototype.constructor = nUISpacing;


    nUISpacing.prototype.create = function () {

        this._setupHandles();

        this._mouseInit();
    };


    nUISpacing.prototype._destroy = function () {

        this._mouseDestroy();

        this.element
            .removeData(this.widgetName);

        for (var k in this.handles) {
            this.handles[k].remove();
        }

        return this;
    };

    nUISpacing.prototype._setupHandles = function () {
        var o = this.options, handle, i, n, hname, axis;

        n = "n,e,s,w".split(",");
        this.handles = {};

        for (i = 0; i < n.length; i++) {

            handle = $.trim(n[i]);
            hname = "nui-spacing-" + handle;
            this.handles[handle] = axis = $("<div>")
                .addClass("nui-spacing-handle nui-spacing-handle-" + o.mode + " nui-spacing-handle " + hname)
                .addClass('n2-unselectable')
                .on('mousedown', $.proxy(this._mouseDown, this))
                .appendTo(this.element);

            nextend.tooltip.addElement(this.handles[handle], N2Classes.StringHelper.capitalize(o.mode) + ' ' + o.side[handle]);

        }
    };

    nUISpacing.prototype._removeHandles = function () {
        this.element.find("> .nui-spacing-handle").remove();
    };

    nUISpacing.prototype._parse_movement_n = function (e) {
        return e.pageY - this.originalMousePosition.top;
    };

    nUISpacing.prototype._parse_movement_w = function (e) {
        return e.pageX - this.originalMousePosition.left;
    };

    nUISpacing.prototype._parse_movement_s = function (e) {
        return e.pageY - this.originalMousePosition.top;
    };

    nUISpacing.prototype._parse_movement_e = function (e) {
        return this.originalMousePosition.left - e.pageX;
    };

    nUISpacing.prototype._mouseCapture = function (e) {
        var i, handle,
            capture = false;

        for (i in this.handles) {
            handle = $(this.handles[i])[0];
            if (handle === e.target || $.contains(handle, e.target)) {
                capture = true;
            }
        }

        return !this.options.disabled && capture;
    };

    nUISpacing.prototype._mouseStart = function (e) {

        this.wasShiftPressed = false;
        var handle;
        for (var d in this.handles) {
            handle = this.handles[d][0];
            if (handle === e.target || $.contains(handle, e.target)) {
                this.direction = d;
                break;
            }
        }
        this.syncProperty = this.options.sync[this.direction];
        this.originalValue = parseInt(this.element.css(this.syncProperty));

        this.invSyncProperty = this.options.sync[this.options.syncInv[this.direction]];
        this.invOriginalValue = parseInt(this.element.css(this.invSyncProperty));

        this.resizing = true;

        this.originalMousePosition = {left: e.pageX, top: e.pageY};
        this.currentValue = this.originalValue;

        this.handles[this.direction].addClass('nui-spacing-under-spacing');

        this.element.addClass("nui-spacing-resizing");
        $("body")
            .on('keydown.' + this.widgetEventPrefix, $.proxy(this._keyDown, this))
            .on('keyup.' + this.widgetEventPrefix, $.proxy(this._keyUp, this))
            .addClass('n2-ss-spacing-element');

        this._trigger("start", e, this.ui());
        return true;
    };

    nUISpacing.prototype._keyDown = function (e) {
        if (e.shiftKey && !this.wasShiftPressed) {
            this.wasShiftPressed = true;
            this.element.css(this.invSyncProperty, this.currentValue);
            this.handles[this.options.syncInv[this.direction]].css(this.options.size[this.options.syncInv[this.direction]], this.currentValue);
            this._trigger("spacing", e, this.ui());
        }
    };

    nUISpacing.prototype._keyUp = function (e) {
        if (!e.shiftKey && this.wasShiftPressed) {
            this.wasShiftPressed = false;
            this.element.css(this.invSyncProperty, this.invOriginalValue);
            this.handles[this.options.syncInv[this.direction]].css(this.options.size[this.options.syncInv[this.direction]], '');
            this._trigger("spacing", e, this.ui());
        }
    };

    nUISpacing.prototype._mouseDrag = function (e) {

        this.movement = this['_parse_movement_' + this.direction].call(this, e);

        this.currentValue = nextend.roundHelper(this.originalValue + this.movement);

        if (this.options.mode == 'padding') {
            this.currentValue = Math.max(0, this.currentValue);
        }

        this.element.css(this.syncProperty, this.currentValue);
        this.handles[this.direction].css(this.options.size[this.direction], this.currentValue);
        if (e.shiftKey) {
            this.wasShiftPressed = true;
            this.element.css(this.invSyncProperty, this.currentValue);
            this.handles[this.options.syncInv[this.direction]].css(this.options.size[this.options.syncInv[this.direction]], this.currentValue);
        } else if (this.wasShiftPressed) {
            this.wasShiftPressed = false;
            this.element.css(this.invSyncProperty, this.invOriginalValue);
            this.handles[this.options.syncInv[this.direction]].css(this.options.size[this.options.syncInv[this.direction]], '');
        }
        this._trigger("spacing", e, this.ui());
    };

    nUISpacing.prototype._mouseStop = function (e) {
        this.movement = this['_parse_movement_' + this.direction].call(this, e);

        this.currentValue = nextend.roundHelper(this.originalValue + this.movement);

        if (this.options.mode == 'padding') {
            this.currentValue = Math.max(0, this.currentValue);
        }

        this.element.css(this.syncProperty, this.currentValue);

        if (e.shiftKey) {
            this.element.css(this.invSyncProperty, this.currentValue);
        } else if (this.wasShiftPressed) {
            this.element.css(this.invSyncProperty, this.invOriginalValue);
        }

        this.resizing = false;

        $("body").off('.' + this.widgetEventPrefix)
            .removeClass('n2-ss-spacing-element');

        this.handles[this.direction].removeClass('nui-spacing-under-spacing');
        this.element.removeClass("nui-spacing-resizing");

        this._trigger("stop", e, this.ui());

        nextend.preventMouseUp();
        return false;
    };

    nUISpacing.prototype.ui = function () {
        var changed = {};
        changed[this.options.side[this.direction]] = this.currentValue;
        if (this.wasShiftPressed) {
            changed[this.options.side[this.options.syncInv[this.direction]]] = this.currentValue;
        }
        return {
            element: this.element,
            changed: changed
        };
    };

    nUISpacing.prototype.setOption = function (key, value) {
        N2Classes.nUIWidgetBase.prototype.setOption.apply(this, arguments);

        if (key === "current") {
            var values = value.split(' ');
            this.handles.n.css('height', values[0]);
            this.handles.e.css('width', values[1]);
            this.handles.s.css('height', values[2]);
            this.handles.w.css('width', values[3]);
        }
    };

    N2Classes.nUIWidgetBase.register('nUISpacing');

    return nUISpacing;
});
N2D('nUIWidgetBase', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @abstract
     * @constructor
     */
    function nUIWidgetBase(element, options) {

        this.document = $(element.style ?

            // Element within the document
            element.ownerDocument :

            // Element is window or document
            element.document || element);
        this.window = $(this.document[0].defaultView || this.document[0].parentWindow);

        this.disabled = false;

        this.plugins = [];
    }

    nUIWidgetBase.prototype.doAction = function (action) {
        switch (action) {
            case 'option':
                return this.setOption.apply(this, Array.prototype.slice.call(arguments, 1));
                break;
            case 'instance':
                return this;
            case 'destroy':
                return this._destroy();
        }
    };


    nUIWidgetBase.prototype.setOption = function (key, value) {

        this.options[key] = value;

        return this;
    };

    /**
     * @abstract
     * @returns {N2Classes.nUIWidgetBase}
     */
    nUIWidgetBase.prototype._destroy = function () {
        return this;
    };

    nUIWidgetBase.prototype._trigger = function (type, event, data) {
        var prop, orig;
        var callback = this.options[type];

        data = data || {};
        event = $.Event(event);
        event.type = ( type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type ).toLowerCase();

        // The original event may come from any element
        // so we need to reset the target on the new event
        event.target = this.element[0];

        // Copy original event properties over to the new event
        orig = event.originalEvent;
        if (orig) {
            for (prop in orig) {
                if (!( prop in event )) {
                    event[prop] = orig[prop];
                }
            }
        }

        this.element.trigger(event, data);
        return !( $.isFunction(callback) &&
        callback.apply(this.element[0], [event].concat(data)) === false ||
        event.isDefaultPrevented() );
    };

    nUIWidgetBase.register = function (name, className) {
        className = className || name;
        $.fn[name] = function () {
            if (arguments.length && typeof arguments[0] === 'string') {
                var o = this.eq(0).data(name);
                if (!o) {
                    return false;
                }

                return o.doAction.apply(o, arguments);
            }

            var options = {};
            if (arguments.length == 1) {
                options = arguments[0];
            }

            this.each(function () {
                var o = $(this).data(name);
                if (!o) {
                    $(this).data(name, new N2Classes[className](this, options))
                }
            });

            return this;
        };
    };

    nUIWidgetBase.addPlugin = function (_class, option, set) {
        for (var key in set) {
            _class.plugins[key] = _class.plugins[key] || [];
            _class.plugins[key].push([option, set[key]]);
        }
    };

    nUIWidgetBase.prototype.callPlugin = function (name, args, allowDisconnected) {
        var set = this.constructor.plugins[name];

        if (!set) {
            return;
        }

        if (!allowDisconnected && ( !this.element[0].parentNode ||
            this.element[0].parentNode.nodeType === 11 )) {
            return;
        }

        for (var i = 0; i < set.length; i++) {
            if (this.options[set[i][0]]) {
                set[i][1].apply(this.element, args);
            }
        }
    };

    return nUIWidgetBase;
});

N2D('nextend-backend')