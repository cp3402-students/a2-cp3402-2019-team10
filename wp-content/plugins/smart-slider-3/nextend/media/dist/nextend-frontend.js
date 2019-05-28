(function(){var N=this;N.N2_=N.N2_||{r:[],d:[]},N.N2R=N.N2R||function(){N.N2_.r.push(arguments)},N.N2D=N.N2D||function(){N.N2_.d.push(arguments)}}).call(window);
N2D('StringHelper', function () {
    return {
        capitalize: function (s) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
    };
});
window.n2c = (function (origConsole) {
    var isDebug = false,
        logArray = {
            logs: [],
            errors: [],
            warns: [],
            infos: []
        };
    return {
        log: function () {
            logArray.logs.push(arguments);
            isDebug && origConsole.log && origConsole.log.apply(origConsole, arguments);
        },
        warn: function () {
            logArray.warns.push(arguments);
            isDebug && origConsole.warn && origConsole.warn.apply(origConsole, arguments);
        },
        error: function () {
            logArray.errors.push(arguments);
            isDebug && origConsole.error && origConsole.error.apply(origConsole, arguments);
        },
        info: function (v) {
            logArray.infos.push(arguments);
            isDebug && origConsole.info && origConsole.info.apply(origConsole, arguments);
        },
        debug: function (bool) {
            isDebug = bool;
        },
        logArray: function () {
            return logArray;
        }
    };

}(window.console));

n2c.debug(false);
window.n2const = {
    passiveEvents: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    isIOS: /iPad|iPhone|iPod/.test(navigator.platform),
    isEdge: (function () {
        var m = navigator.userAgent.match(/Edge\/([0-9]+)/);
        if (m === null) {
            return false;
        }

        return m[1];
    })(),
    isFirefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Silk/i.test(navigator.userAgent),
    isPhone: (/Android/i.test(navigator.userAgent) && /mobile/i.test(navigator.userAgent)) || /webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIE: (function () {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        return false;
    })(),
    isSamsungBrowser: navigator.userAgent.match(/SamsungBrowser/i),
    isBot: /bot|googlebot|crawler|spider|robot|crawling|Google Search Console/i.test(navigator.userAgent),
    lightboxMobileNewTab: 1,
    isVideoAutoplayAllowed: function () {
        var isAllowed = !!(navigator.platform.match(/(Win|Mac)/) || !(/Mobi/.test(navigator.userAgent)) || ('playsInline' in document.createElement('video') || ('webkit-playsinline' in document.createElement('video'))) || (navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) && parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 53) || navigator.userAgent.match(/Android.*(Firefox|Edge|Opera)/));
        window.n2const.isVideoAutoplayAllowed = function () {
            return isAllowed;
        };
        return isAllowed;
    },
    isWaybackMachine: function () {
        var isWaybackMachine = typeof window.__wm !== 'undefined';
        window.n2const.isWaybackMachine = function () {
            return isWaybackMachine;
        };
        return isWaybackMachine;
    },
    setLocation: function (l) {
        if (typeof window.zajax_goto === 'function') {
            /**
             * @url https://wordpress.org/plugins/zajax-ajax-navigation/
             */
            window.zajax_goto(l);
        } else {
            window.location = l;
        }
    }
};

window.n2const.IOSVersion = (function () {
    if (window.n2const.isIOS) {
        var match = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
        if (match) {
            return match[1];
        }

        return 100;
    }
    return false;
})();

window.n2const.isTablet = (function () {
    if (!window.n2const.isPhone) {
        return /Android|iPad|tablet|Silk/i.test(navigator.userAgent);
    }
    return false;
})();


try {
    var opts = Object.defineProperty({}, 'passive', {
        get: function () {
            window.n2const.passiveEvents = true;
        }
    });
    window.addEventListener('test', null, opts);
} catch (e) {
}

window.n2const.rtl = (function () {
    window.n2const.isRTL = function () {
        return window.n2const.rtl.isRtl;
    };

    if (document.documentElement.getAttribute('dir') === 'rtl') {
        return {
            isRtl: true,
            marginLeft: 'marginRight',
            marginRight: 'marginLeft',
            left: 'right',
            right: 'left',
            next: 'previous',
            previous: 'next',
            modifier: -1
        };
    }

    document.documentElement.setAttribute('dir', 'ltr');
    return {
        isRtl: false,
        marginLeft: 'marginLeft',
        marginRight: 'marginRight',
        left: 'left',
        right: 'right',
        next: 'next',
        previous: 'previous',
        modifier: 1
    };
})();

N2R('$', function ($) {

    n2const.isRetina = (function () {
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2));
    })();

    nextend.triggerResize = (function () {
        var delay = 100,
            timeout = null,
            $window = $(window);

        return function () {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                $window.trigger('resize');
                timeout = null;
            }, delay);
        };
    })();


    nextend.shouldPreventClick = false;

    nextend.preventClick = function () {
        if (!nextend.shouldPreventClick) {
            nextend.shouldPreventClick = true;
            setTimeout(function () {
                nextend.shouldPreventClick = false;
            }, 300);
        }
    };
    nextend.shouldPreventMouseUp = false;

    nextend.preventMouseUp = function () {
        if (!nextend.shouldPreventMouseUp) {
            nextend.shouldPreventMouseUp = true;
            setTimeout(function () {
                nextend.shouldPreventMouseUp = false;
            }, 300);
        } else {
            $('html').attr('dir', 'ltr');
        }
    };
});

window.n2FilterProperty = false;
var element = document.createElement('div');
if (element.style.webkitFilter !== undefined) {
    window.n2FilterProperty = 'webkitFilter';
} else if (element.style.filter !== undefined) {
    window.n2FilterProperty = 'filter';
}
N2D('Base64', function () {

    var utf8_encode = function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },
        utf8_decode = function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while (i < utftext.length) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        };
    N2Classes.Base64 = {

        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = utf8_encode(input);

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
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

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

            output = utf8_decode(output);

            return output;

        }
    };

    return N2Classes.Base64;
});
/*! mobile-detect - v1.3.0 - 2015-11-12
 https://github.com/hgoebl/mobile-detect.js */!function(a,b){a(function(){"use strict";function a(a,b){return null!=a&&null!=b&&a.toLowerCase()===b.toLowerCase()}function c(a,b){var c,d,e=a.length;if(!e||!b)return!1;for(c=b.toLowerCase(),d=0;e>d;++d)if(c===a[d].toLowerCase())return!0;return!1}function d(a){for(var b in a)h.call(a,b)&&(a[b]=new RegExp(a[b],"i"))}function e(a,b){this.ua=a||"",this._cache={},this.maxPhoneWidth=b||600}var f={};f.mobileDetectRules={phones:{iPhone:"\\biPhone\\b|\\biPod\\b",BlackBerry:"BlackBerry|\\bBB10\\b|rim[0-9]+",HTC:"HTC|HTC.*(Sensation|Evo|Vision|Explorer|6800|8100|8900|A7272|S510e|C110e|Legend|Desire|T8282)|APX515CKT|Qtek9090|APA9292KT|HD_mini|Sensation.*Z710e|PG86100|Z715e|Desire.*(A8181|HD)|ADR6200|ADR6400L|ADR6425|001HT|Inspire 4G|Android.*\\bEVO\\b|T-Mobile G1|Z520m",Nexus:"Nexus One|Nexus S|Galaxy.*Nexus|Android.*Nexus.*Mobile|Nexus 4|Nexus 5|Nexus 6",Dell:"Dell.*Streak|Dell.*Aero|Dell.*Venue|DELL.*Venue Pro|Dell Flash|Dell Smoke|Dell Mini 3iX|XCD28|XCD35|\\b001DL\\b|\\b101DL\\b|\\bGS01\\b",Motorola:"Motorola|DROIDX|DROID BIONIC|\\bDroid\\b.*Build|Android.*Xoom|HRI39|MOT-|A1260|A1680|A555|A853|A855|A953|A955|A956|Motorola.*ELECTRIFY|Motorola.*i1|i867|i940|MB200|MB300|MB501|MB502|MB508|MB511|MB520|MB525|MB526|MB611|MB612|MB632|MB810|MB855|MB860|MB861|MB865|MB870|ME501|ME502|ME511|ME525|ME600|ME632|ME722|ME811|ME860|ME863|ME865|MT620|MT710|MT716|MT720|MT810|MT870|MT917|Motorola.*TITANIUM|WX435|WX445|XT300|XT301|XT311|XT316|XT317|XT319|XT320|XT390|XT502|XT530|XT531|XT532|XT535|XT603|XT610|XT611|XT615|XT681|XT701|XT702|XT711|XT720|XT800|XT806|XT860|XT862|XT875|XT882|XT883|XT894|XT901|XT907|XT909|XT910|XT912|XT928|XT926|XT915|XT919|XT925|XT1021|\\bMoto E\\b",Samsung:"Samsung|SM-G9250|GT-19300|SGH-I337|BGT-S5230|GT-B2100|GT-B2700|GT-B2710|GT-B3210|GT-B3310|GT-B3410|GT-B3730|GT-B3740|GT-B5510|GT-B5512|GT-B5722|GT-B6520|GT-B7300|GT-B7320|GT-B7330|GT-B7350|GT-B7510|GT-B7722|GT-B7800|GT-C3010|GT-C3011|GT-C3060|GT-C3200|GT-C3212|GT-C3212I|GT-C3262|GT-C3222|GT-C3300|GT-C3300K|GT-C3303|GT-C3303K|GT-C3310|GT-C3322|GT-C3330|GT-C3350|GT-C3500|GT-C3510|GT-C3530|GT-C3630|GT-C3780|GT-C5010|GT-C5212|GT-C6620|GT-C6625|GT-C6712|GT-E1050|GT-E1070|GT-E1075|GT-E1080|GT-E1081|GT-E1085|GT-E1087|GT-E1100|GT-E1107|GT-E1110|GT-E1120|GT-E1125|GT-E1130|GT-E1160|GT-E1170|GT-E1175|GT-E1180|GT-E1182|GT-E1200|GT-E1210|GT-E1225|GT-E1230|GT-E1390|GT-E2100|GT-E2120|GT-E2121|GT-E2152|GT-E2220|GT-E2222|GT-E2230|GT-E2232|GT-E2250|GT-E2370|GT-E2550|GT-E2652|GT-E3210|GT-E3213|GT-I5500|GT-I5503|GT-I5700|GT-I5800|GT-I5801|GT-I6410|GT-I6420|GT-I7110|GT-I7410|GT-I7500|GT-I8000|GT-I8150|GT-I8160|GT-I8190|GT-I8320|GT-I8330|GT-I8350|GT-I8530|GT-I8700|GT-I8703|GT-I8910|GT-I9000|GT-I9001|GT-I9003|GT-I9010|GT-I9020|GT-I9023|GT-I9070|GT-I9082|GT-I9100|GT-I9103|GT-I9220|GT-I9250|GT-I9300|GT-I9305|GT-I9500|GT-I9505|GT-M3510|GT-M5650|GT-M7500|GT-M7600|GT-M7603|GT-M8800|GT-M8910|GT-N7000|GT-S3110|GT-S3310|GT-S3350|GT-S3353|GT-S3370|GT-S3650|GT-S3653|GT-S3770|GT-S3850|GT-S5210|GT-S5220|GT-S5229|GT-S5230|GT-S5233|GT-S5250|GT-S5253|GT-S5260|GT-S5263|GT-S5270|GT-S5300|GT-S5330|GT-S5350|GT-S5360|GT-S5363|GT-S5369|GT-S5380|GT-S5380D|GT-S5560|GT-S5570|GT-S5600|GT-S5603|GT-S5610|GT-S5620|GT-S5660|GT-S5670|GT-S5690|GT-S5750|GT-S5780|GT-S5830|GT-S5839|GT-S6102|GT-S6500|GT-S7070|GT-S7200|GT-S7220|GT-S7230|GT-S7233|GT-S7250|GT-S7500|GT-S7530|GT-S7550|GT-S7562|GT-S7710|GT-S8000|GT-S8003|GT-S8500|GT-S8530|GT-S8600|SCH-A310|SCH-A530|SCH-A570|SCH-A610|SCH-A630|SCH-A650|SCH-A790|SCH-A795|SCH-A850|SCH-A870|SCH-A890|SCH-A930|SCH-A950|SCH-A970|SCH-A990|SCH-I100|SCH-I110|SCH-I400|SCH-I405|SCH-I500|SCH-I510|SCH-I515|SCH-I600|SCH-I730|SCH-I760|SCH-I770|SCH-I830|SCH-I910|SCH-I920|SCH-I959|SCH-LC11|SCH-N150|SCH-N300|SCH-R100|SCH-R300|SCH-R351|SCH-R400|SCH-R410|SCH-T300|SCH-U310|SCH-U320|SCH-U350|SCH-U360|SCH-U365|SCH-U370|SCH-U380|SCH-U410|SCH-U430|SCH-U450|SCH-U460|SCH-U470|SCH-U490|SCH-U540|SCH-U550|SCH-U620|SCH-U640|SCH-U650|SCH-U660|SCH-U700|SCH-U740|SCH-U750|SCH-U810|SCH-U820|SCH-U900|SCH-U940|SCH-U960|SCS-26UC|SGH-A107|SGH-A117|SGH-A127|SGH-A137|SGH-A157|SGH-A167|SGH-A177|SGH-A187|SGH-A197|SGH-A227|SGH-A237|SGH-A257|SGH-A437|SGH-A517|SGH-A597|SGH-A637|SGH-A657|SGH-A667|SGH-A687|SGH-A697|SGH-A707|SGH-A717|SGH-A727|SGH-A737|SGH-A747|SGH-A767|SGH-A777|SGH-A797|SGH-A817|SGH-A827|SGH-A837|SGH-A847|SGH-A867|SGH-A877|SGH-A887|SGH-A897|SGH-A927|SGH-B100|SGH-B130|SGH-B200|SGH-B220|SGH-C100|SGH-C110|SGH-C120|SGH-C130|SGH-C140|SGH-C160|SGH-C170|SGH-C180|SGH-C200|SGH-C207|SGH-C210|SGH-C225|SGH-C230|SGH-C417|SGH-C450|SGH-D307|SGH-D347|SGH-D357|SGH-D407|SGH-D415|SGH-D780|SGH-D807|SGH-D980|SGH-E105|SGH-E200|SGH-E315|SGH-E316|SGH-E317|SGH-E335|SGH-E590|SGH-E635|SGH-E715|SGH-E890|SGH-F300|SGH-F480|SGH-I200|SGH-I300|SGH-I320|SGH-I550|SGH-I577|SGH-I600|SGH-I607|SGH-I617|SGH-I627|SGH-I637|SGH-I677|SGH-I700|SGH-I717|SGH-I727|SGH-i747M|SGH-I777|SGH-I780|SGH-I827|SGH-I847|SGH-I857|SGH-I896|SGH-I897|SGH-I900|SGH-I907|SGH-I917|SGH-I927|SGH-I937|SGH-I997|SGH-J150|SGH-J200|SGH-L170|SGH-L700|SGH-M110|SGH-M150|SGH-M200|SGH-N105|SGH-N500|SGH-N600|SGH-N620|SGH-N625|SGH-N700|SGH-N710|SGH-P107|SGH-P207|SGH-P300|SGH-P310|SGH-P520|SGH-P735|SGH-P777|SGH-Q105|SGH-R210|SGH-R220|SGH-R225|SGH-S105|SGH-S307|SGH-T109|SGH-T119|SGH-T139|SGH-T209|SGH-T219|SGH-T229|SGH-T239|SGH-T249|SGH-T259|SGH-T309|SGH-T319|SGH-T329|SGH-T339|SGH-T349|SGH-T359|SGH-T369|SGH-T379|SGH-T409|SGH-T429|SGH-T439|SGH-T459|SGH-T469|SGH-T479|SGH-T499|SGH-T509|SGH-T519|SGH-T539|SGH-T559|SGH-T589|SGH-T609|SGH-T619|SGH-T629|SGH-T639|SGH-T659|SGH-T669|SGH-T679|SGH-T709|SGH-T719|SGH-T729|SGH-T739|SGH-T746|SGH-T749|SGH-T759|SGH-T769|SGH-T809|SGH-T819|SGH-T839|SGH-T919|SGH-T929|SGH-T939|SGH-T959|SGH-T989|SGH-U100|SGH-U200|SGH-U800|SGH-V205|SGH-V206|SGH-X100|SGH-X105|SGH-X120|SGH-X140|SGH-X426|SGH-X427|SGH-X475|SGH-X495|SGH-X497|SGH-X507|SGH-X600|SGH-X610|SGH-X620|SGH-X630|SGH-X700|SGH-X820|SGH-X890|SGH-Z130|SGH-Z150|SGH-Z170|SGH-ZX10|SGH-ZX20|SHW-M110|SPH-A120|SPH-A400|SPH-A420|SPH-A460|SPH-A500|SPH-A560|SPH-A600|SPH-A620|SPH-A660|SPH-A700|SPH-A740|SPH-A760|SPH-A790|SPH-A800|SPH-A820|SPH-A840|SPH-A880|SPH-A900|SPH-A940|SPH-A960|SPH-D600|SPH-D700|SPH-D710|SPH-D720|SPH-I300|SPH-I325|SPH-I330|SPH-I350|SPH-I500|SPH-I600|SPH-I700|SPH-L700|SPH-M100|SPH-M220|SPH-M240|SPH-M300|SPH-M305|SPH-M320|SPH-M330|SPH-M350|SPH-M360|SPH-M370|SPH-M380|SPH-M510|SPH-M540|SPH-M550|SPH-M560|SPH-M570|SPH-M580|SPH-M610|SPH-M620|SPH-M630|SPH-M800|SPH-M810|SPH-M850|SPH-M900|SPH-M910|SPH-M920|SPH-M930|SPH-N100|SPH-N200|SPH-N240|SPH-N300|SPH-N400|SPH-Z400|SWC-E100|SCH-i909|GT-N7100|GT-N7105|SCH-I535|SM-N900A|SGH-I317|SGH-T999L|GT-S5360B|GT-I8262|GT-S6802|GT-S6312|GT-S6310|GT-S5312|GT-S5310|GT-I9105|GT-I8510|GT-S6790N|SM-G7105|SM-N9005|GT-S5301|GT-I9295|GT-I9195|SM-C101|GT-S7392|GT-S7560|GT-B7610|GT-I5510|GT-S7582|GT-S7530E|GT-I8750|SM-G9006V|SM-G9008V|SM-G9009D|SM-G900A|SM-G900D|SM-G900F|SM-G900H|SM-G900I|SM-G900J|SM-G900K|SM-G900L|SM-G900M|SM-G900P|SM-G900R4|SM-G900S|SM-G900T|SM-G900V|SM-G900W8|SHV-E160K|SCH-P709|SCH-P729|SM-T2558|GT-I9205",LG:"\\bLG\\b;|LG[- ]?(C800|C900|E400|E610|E900|E-900|F160|F180K|F180L|F180S|730|855|L160|LS740|LS840|LS970|LU6200|MS690|MS695|MS770|MS840|MS870|MS910|P500|P700|P705|VM696|AS680|AS695|AX840|C729|E970|GS505|272|C395|E739BK|E960|L55C|L75C|LS696|LS860|P769BK|P350|P500|P509|P870|UN272|US730|VS840|VS950|LN272|LN510|LS670|LS855|LW690|MN270|MN510|P509|P769|P930|UN200|UN270|UN510|UN610|US670|US740|US760|UX265|UX840|VN271|VN530|VS660|VS700|VS740|VS750|VS910|VS920|VS930|VX9200|VX11000|AX840A|LW770|P506|P925|P999|E612|D955|D802)",Sony:"SonyST|SonyLT|SonyEricsson|SonyEricssonLT15iv|LT18i|E10i|LT28h|LT26w|SonyEricssonMT27i|C5303|C6902|C6903|C6906|C6943|D2533",Asus:"Asus.*Galaxy|PadFone.*Mobile",Micromax:"Micromax.*\\b(A210|A92|A88|A72|A111|A110Q|A115|A116|A110|A90S|A26|A51|A35|A54|A25|A27|A89|A68|A65|A57|A90)\\b",Palm:"PalmSource|Palm",Vertu:"Vertu|Vertu.*Ltd|Vertu.*Ascent|Vertu.*Ayxta|Vertu.*Constellation(F|Quest)?|Vertu.*Monika|Vertu.*Signature",Pantech:"PANTECH|IM-A850S|IM-A840S|IM-A830L|IM-A830K|IM-A830S|IM-A820L|IM-A810K|IM-A810S|IM-A800S|IM-T100K|IM-A725L|IM-A780L|IM-A775C|IM-A770K|IM-A760S|IM-A750K|IM-A740S|IM-A730S|IM-A720L|IM-A710K|IM-A690L|IM-A690S|IM-A650S|IM-A630K|IM-A600S|VEGA PTL21|PT003|P8010|ADR910L|P6030|P6020|P9070|P4100|P9060|P5000|CDM8992|TXT8045|ADR8995|IS11PT|P2030|P6010|P8000|PT002|IS06|CDM8999|P9050|PT001|TXT8040|P2020|P9020|P2000|P7040|P7000|C790",Fly:"IQ230|IQ444|IQ450|IQ440|IQ442|IQ441|IQ245|IQ256|IQ236|IQ255|IQ235|IQ245|IQ275|IQ240|IQ285|IQ280|IQ270|IQ260|IQ250",Wiko:"KITE 4G|HIGHWAY|GETAWAY|STAIRWAY|DARKSIDE|DARKFULL|DARKNIGHT|DARKMOON|SLIDE|WAX 4G|RAINBOW|BLOOM|SUNSET|GOA|LENNY|BARRY|IGGY|OZZY|CINK FIVE|CINK PEAX|CINK PEAX 2|CINK SLIM|CINK SLIM 2|CINK +|CINK KING|CINK PEAX|CINK SLIM|SUBLIM",iMobile:"i-mobile (IQ|i-STYLE|idea|ZAA|Hitz)",SimValley:"\\b(SP-80|XT-930|SX-340|XT-930|SX-310|SP-360|SP60|SPT-800|SP-120|SPT-800|SP-140|SPX-5|SPX-8|SP-100|SPX-8|SPX-12)\\b",Wolfgang:"AT-B24D|AT-AS50HD|AT-AS40W|AT-AS55HD|AT-AS45q2|AT-B26D|AT-AS50Q",Alcatel:"Alcatel",Nintendo:"Nintendo 3DS",Amoi:"Amoi",INQ:"INQ",GenericPhone:"Tapatalk|PDA;|SAGEM|\\bmmp\\b|pocket|\\bpsp\\b|symbian|Smartphone|smartfon|treo|up.browser|up.link|vodafone|\\bwap\\b|nokia|Series40|Series60|S60|SonyEricsson|N900|MAUI.*WAP.*Browser"},tablets:{iPad:"iPad|iPad.*Mobile",NexusTablet:"Android.*Nexus[\\s]+(7|9|10)",SamsungTablet:"SAMSUNG.*Tablet|Galaxy.*Tab|SC-01C|GT-P1000|GT-P1003|GT-P1010|GT-P3105|GT-P6210|GT-P6800|GT-P6810|GT-P7100|GT-P7300|GT-P7310|GT-P7500|GT-P7510|SCH-I800|SCH-I815|SCH-I905|SGH-I957|SGH-I987|SGH-T849|SGH-T859|SGH-T869|SPH-P100|GT-P3100|GT-P3108|GT-P3110|GT-P5100|GT-P5110|GT-P6200|GT-P7320|GT-P7511|GT-N8000|GT-P8510|SGH-I497|SPH-P500|SGH-T779|SCH-I705|SCH-I915|GT-N8013|GT-P3113|GT-P5113|GT-P8110|GT-N8010|GT-N8005|GT-N8020|GT-P1013|GT-P6201|GT-P7501|GT-N5100|GT-N5105|GT-N5110|SHV-E140K|SHV-E140L|SHV-E140S|SHV-E150S|SHV-E230K|SHV-E230L|SHV-E230S|SHW-M180K|SHW-M180L|SHW-M180S|SHW-M180W|SHW-M300W|SHW-M305W|SHW-M380K|SHW-M380S|SHW-M380W|SHW-M430W|SHW-M480K|SHW-M480S|SHW-M480W|SHW-M485W|SHW-M486W|SHW-M500W|GT-I9228|SCH-P739|SCH-I925|GT-I9200|GT-P5200|GT-P5210|GT-P5210X|SM-T311|SM-T310|SM-T310X|SM-T210|SM-T210R|SM-T211|SM-P600|SM-P601|SM-P605|SM-P900|SM-P901|SM-T217|SM-T217A|SM-T217S|SM-P6000|SM-T3100|SGH-I467|XE500|SM-T110|GT-P5220|GT-I9200X|GT-N5110X|GT-N5120|SM-P905|SM-T111|SM-T2105|SM-T315|SM-T320|SM-T320X|SM-T321|SM-T520|SM-T525|SM-T530NU|SM-T230NU|SM-T330NU|SM-T900|XE500T1C|SM-P605V|SM-P905V|SM-T337V|SM-T537V|SM-T707V|SM-T807V|SM-P600X|SM-P900X|SM-T210X|SM-T230|SM-T230X|SM-T325|GT-P7503|SM-T531|SM-T330|SM-T530|SM-T705|SM-T705C|SM-T535|SM-T331|SM-T800|SM-T700|SM-T537|SM-T807|SM-P907A|SM-T337A|SM-T537A|SM-T707A|SM-T807A|SM-T237|SM-T807P|SM-P607T|SM-T217T|SM-T337T|SM-T807T|SM-T116NQ|SM-P550|SM-T350|SM-T550|SM-T9000|SM-P9000|SM-T705Y|SM-T805|GT-P3113|SM-T710|SM-T810|SM-T360|SM-T533",Kindle:"Kindle|Silk.*Accelerated|Android.*\\b(KFOT|KFTT|KFJWI|KFJWA|KFOTE|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|WFJWAE|KFSAWA|KFSAWI|KFASWI)\\b",SurfaceTablet:"Windows NT [0-9.]+; ARM;.*(Tablet|ARMBJS)",HPTablet:"HP Slate (7|8|10)|HP ElitePad 900|hp-tablet|EliteBook.*Touch|HP 8|Slate 21|HP SlateBook 10",AsusTablet:"^.*PadFone((?!Mobile).)*$|Transformer|TF101|TF101G|TF300T|TF300TG|TF300TL|TF700T|TF700KL|TF701T|TF810C|ME171|ME301T|ME302C|ME371MG|ME370T|ME372MG|ME172V|ME173X|ME400C|Slider SL101|\\bK00F\\b|\\bK00C\\b|\\bK00E\\b|\\bK00L\\b|TX201LA|ME176C|ME102A|\\bM80TA\\b|ME372CL|ME560CG|ME372CG|ME302KL| K010 | K017 |ME572C|ME103K|ME170C|ME171C|\\bME70C\\b|ME581C|ME581CL|ME8510C|ME181C",BlackBerryTablet:"PlayBook|RIM Tablet",HTCtablet:"HTC_Flyer_P512|HTC Flyer|HTC Jetstream|HTC-P715a|HTC EVO View 4G|PG41200|PG09410",MotorolaTablet:"xoom|sholest|MZ615|MZ605|MZ505|MZ601|MZ602|MZ603|MZ604|MZ606|MZ607|MZ608|MZ609|MZ615|MZ616|MZ617",NookTablet:"Android.*Nook|NookColor|nook browser|BNRV200|BNRV200A|BNTV250|BNTV250A|BNTV400|BNTV600|LogicPD Zoom2",AcerTablet:"Android.*; \\b(A100|A101|A110|A200|A210|A211|A500|A501|A510|A511|A700|A701|W500|W500P|W501|W501P|W510|W511|W700|G100|G100W|B1-A71|B1-710|B1-711|A1-810|A1-811|A1-830)\\b|W3-810|\\bA3-A10\\b|\\bA3-A11\\b",ToshibaTablet:"Android.*(AT100|AT105|AT200|AT205|AT270|AT275|AT300|AT305|AT1S5|AT500|AT570|AT700|AT830)|TOSHIBA.*FOLIO",LGTablet:"\\bL-06C|LG-V909|LG-V900|LG-V700|LG-V510|LG-V500|LG-V410|LG-V400|LG-VK810\\b",FujitsuTablet:"Android.*\\b(F-01D|F-02F|F-05E|F-10D|M532|Q572)\\b",PrestigioTablet:"PMP3170B|PMP3270B|PMP3470B|PMP7170B|PMP3370B|PMP3570C|PMP5870C|PMP3670B|PMP5570C|PMP5770D|PMP3970B|PMP3870C|PMP5580C|PMP5880D|PMP5780D|PMP5588C|PMP7280C|PMP7280C3G|PMP7280|PMP7880D|PMP5597D|PMP5597|PMP7100D|PER3464|PER3274|PER3574|PER3884|PER5274|PER5474|PMP5097CPRO|PMP5097|PMP7380D|PMP5297C|PMP5297C_QUAD|PMP812E|PMP812E3G|PMP812F|PMP810E|PMP880TD|PMT3017|PMT3037|PMT3047|PMT3057|PMT7008|PMT5887|PMT5001|PMT5002",LenovoTablet:"Idea(Tab|Pad)( A1|A10| K1|)|ThinkPad([ ]+)?Tablet|Lenovo.*(S2109|S2110|S5000|S6000|K3011|A3000|A3500|A1000|A2107|A2109|A1107|A5500|A7600|B6000|B8000|B8080)(-|)(FL|F|HV|H|)",DellTablet:"Venue 11|Venue 8|Venue 7|Dell Streak 10|Dell Streak 7",YarvikTablet:"Android.*\\b(TAB210|TAB211|TAB224|TAB250|TAB260|TAB264|TAB310|TAB360|TAB364|TAB410|TAB411|TAB420|TAB424|TAB450|TAB460|TAB461|TAB464|TAB465|TAB467|TAB468|TAB07-100|TAB07-101|TAB07-150|TAB07-151|TAB07-152|TAB07-200|TAB07-201-3G|TAB07-210|TAB07-211|TAB07-212|TAB07-214|TAB07-220|TAB07-400|TAB07-485|TAB08-150|TAB08-200|TAB08-201-3G|TAB08-201-30|TAB09-100|TAB09-211|TAB09-410|TAB10-150|TAB10-201|TAB10-211|TAB10-400|TAB10-410|TAB13-201|TAB274EUK|TAB275EUK|TAB374EUK|TAB462EUK|TAB474EUK|TAB9-200)\\b",MedionTablet:"Android.*\\bOYO\\b|LIFE.*(P9212|P9514|P9516|S9512)|LIFETAB",ArnovaTablet:"AN10G2|AN7bG3|AN7fG3|AN8G3|AN8cG3|AN7G3|AN9G3|AN7dG3|AN7dG3ST|AN7dG3ChildPad|AN10bG3|AN10bG3DT|AN9G2",IntensoTablet:"INM8002KP|INM1010FP|INM805ND|Intenso Tab|TAB1004",IRUTablet:"M702pro",MegafonTablet:"MegaFon V9|\\bZTE V9\\b|Android.*\\bMT7A\\b",EbodaTablet:"E-Boda (Supreme|Impresspeed|Izzycomm|Essential)",AllViewTablet:"Allview.*(Viva|Alldro|City|Speed|All TV|Frenzy|Quasar|Shine|TX1|AX1|AX2)",ArchosTablet:"\\b(101G9|80G9|A101IT)\\b|Qilive 97R|Archos5|\\bARCHOS (70|79|80|90|97|101|FAMILYPAD|)(b|)(G10| Cobalt| TITANIUM(HD|)| Xenon| Neon|XSK| 2| XS 2| PLATINUM| CARBON|GAMEPAD)\\b",AinolTablet:"NOVO7|NOVO8|NOVO10|Novo7Aurora|Novo7Basic|NOVO7PALADIN|novo9-Spark",SonyTablet:"Sony.*Tablet|Xperia Tablet|Sony Tablet S|SO-03E|SGPT12|SGPT13|SGPT114|SGPT121|SGPT122|SGPT123|SGPT111|SGPT112|SGPT113|SGPT131|SGPT132|SGPT133|SGPT211|SGPT212|SGPT213|SGP311|SGP312|SGP321|EBRD1101|EBRD1102|EBRD1201|SGP351|SGP341|SGP511|SGP512|SGP521|SGP541|SGP551|SGP621|SGP612|SOT31",PhilipsTablet:"\\b(PI2010|PI3000|PI3100|PI3105|PI3110|PI3205|PI3210|PI3900|PI4010|PI7000|PI7100)\\b",CubeTablet:"Android.*(K8GT|U9GT|U10GT|U16GT|U17GT|U18GT|U19GT|U20GT|U23GT|U30GT)|CUBE U8GT",CobyTablet:"MID1042|MID1045|MID1125|MID1126|MID7012|MID7014|MID7015|MID7034|MID7035|MID7036|MID7042|MID7048|MID7127|MID8042|MID8048|MID8127|MID9042|MID9740|MID9742|MID7022|MID7010",MIDTablet:"M9701|M9000|M9100|M806|M1052|M806|T703|MID701|MID713|MID710|MID727|MID760|MID830|MID728|MID933|MID125|MID810|MID732|MID120|MID930|MID800|MID731|MID900|MID100|MID820|MID735|MID980|MID130|MID833|MID737|MID960|MID135|MID860|MID736|MID140|MID930|MID835|MID733",MSITablet:"MSI \\b(Primo 73K|Primo 73L|Primo 81L|Primo 77|Primo 93|Primo 75|Primo 76|Primo 73|Primo 81|Primo 91|Primo 90|Enjoy 71|Enjoy 7|Enjoy 10)\\b",SMiTTablet:"Android.*(\\bMID\\b|MID-560|MTV-T1200|MTV-PND531|MTV-P1101|MTV-PND530)",RockChipTablet:"Android.*(RK2818|RK2808A|RK2918|RK3066)|RK2738|RK2808A",FlyTablet:"IQ310|Fly Vision",bqTablet:"Android.*(bq)?.*(Elcano|Curie|Edison|Maxwell|Kepler|Pascal|Tesla|Hypatia|Platon|Newton|Livingstone|Cervantes|Avant|Aquaris E10)|Maxwell.*Lite|Maxwell.*Plus",HuaweiTablet:"MediaPad|MediaPad 7 Youth|IDEOS S7|S7-201c|S7-202u|S7-101|S7-103|S7-104|S7-105|S7-106|S7-201|S7-Slim",NecTablet:"\\bN-06D|\\bN-08D",PantechTablet:"Pantech.*P4100",BronchoTablet:"Broncho.*(N701|N708|N802|a710)",VersusTablet:"TOUCHPAD.*[78910]|\\bTOUCHTAB\\b",ZyncTablet:"z1000|Z99 2G|z99|z930|z999|z990|z909|Z919|z900",PositivoTablet:"TB07STA|TB10STA|TB07FTA|TB10FTA",NabiTablet:"Android.*\\bNabi",KoboTablet:"Kobo Touch|\\bK080\\b|\\bVox\\b Build|\\bArc\\b Build",DanewTablet:"DSlide.*\\b(700|701R|702|703R|704|802|970|971|972|973|974|1010|1012)\\b",TexetTablet:"NaviPad|TB-772A|TM-7045|TM-7055|TM-9750|TM-7016|TM-7024|TM-7026|TM-7041|TM-7043|TM-7047|TM-8041|TM-9741|TM-9747|TM-9748|TM-9751|TM-7022|TM-7021|TM-7020|TM-7011|TM-7010|TM-7023|TM-7025|TM-7037W|TM-7038W|TM-7027W|TM-9720|TM-9725|TM-9737W|TM-1020|TM-9738W|TM-9740|TM-9743W|TB-807A|TB-771A|TB-727A|TB-725A|TB-719A|TB-823A|TB-805A|TB-723A|TB-715A|TB-707A|TB-705A|TB-709A|TB-711A|TB-890HD|TB-880HD|TB-790HD|TB-780HD|TB-770HD|TB-721HD|TB-710HD|TB-434HD|TB-860HD|TB-840HD|TB-760HD|TB-750HD|TB-740HD|TB-730HD|TB-722HD|TB-720HD|TB-700HD|TB-500HD|TB-470HD|TB-431HD|TB-430HD|TB-506|TB-504|TB-446|TB-436|TB-416|TB-146SE|TB-126SE",PlaystationTablet:"Playstation.*(Portable|Vita)",TrekstorTablet:"ST10416-1|VT10416-1|ST70408-1|ST702xx-1|ST702xx-2|ST80208|ST97216|ST70104-2|VT10416-2|ST10216-2A|SurfTab",PyleAudioTablet:"\\b(PTBL10CEU|PTBL10C|PTBL72BC|PTBL72BCEU|PTBL7CEU|PTBL7C|PTBL92BC|PTBL92BCEU|PTBL9CEU|PTBL9CUK|PTBL9C)\\b",AdvanTablet:"Android.* \\b(E3A|T3X|T5C|T5B|T3E|T3C|T3B|T1J|T1F|T2A|T1H|T1i|E1C|T1-E|T5-A|T4|E1-B|T2Ci|T1-B|T1-D|O1-A|E1-A|T1-A|T3A|T4i)\\b ",DanyTechTablet:"Genius Tab G3|Genius Tab S2|Genius Tab Q3|Genius Tab G4|Genius Tab Q4|Genius Tab G-II|Genius TAB GII|Genius TAB GIII|Genius Tab S1",GalapadTablet:"Android.*\\bG1\\b",MicromaxTablet:"Funbook|Micromax.*\\b(P250|P560|P360|P362|P600|P300|P350|P500|P275)\\b",KarbonnTablet:"Android.*\\b(A39|A37|A34|ST8|ST10|ST7|Smart Tab3|Smart Tab2)\\b",AllFineTablet:"Fine7 Genius|Fine7 Shine|Fine7 Air|Fine8 Style|Fine9 More|Fine10 Joy|Fine11 Wide",PROSCANTablet:"\\b(PEM63|PLT1023G|PLT1041|PLT1044|PLT1044G|PLT1091|PLT4311|PLT4311PL|PLT4315|PLT7030|PLT7033|PLT7033D|PLT7035|PLT7035D|PLT7044K|PLT7045K|PLT7045KB|PLT7071KG|PLT7072|PLT7223G|PLT7225G|PLT7777G|PLT7810K|PLT7849G|PLT7851G|PLT7852G|PLT8015|PLT8031|PLT8034|PLT8036|PLT8080K|PLT8082|PLT8088|PLT8223G|PLT8234G|PLT8235G|PLT8816K|PLT9011|PLT9045K|PLT9233G|PLT9735|PLT9760G|PLT9770G)\\b",YONESTablet:"BQ1078|BC1003|BC1077|RK9702|BC9730|BC9001|IT9001|BC7008|BC7010|BC708|BC728|BC7012|BC7030|BC7027|BC7026",ChangJiaTablet:"TPC7102|TPC7103|TPC7105|TPC7106|TPC7107|TPC7201|TPC7203|TPC7205|TPC7210|TPC7708|TPC7709|TPC7712|TPC7110|TPC8101|TPC8103|TPC8105|TPC8106|TPC8203|TPC8205|TPC8503|TPC9106|TPC9701|TPC97101|TPC97103|TPC97105|TPC97106|TPC97111|TPC97113|TPC97203|TPC97603|TPC97809|TPC97205|TPC10101|TPC10103|TPC10106|TPC10111|TPC10203|TPC10205|TPC10503",GUTablet:"TX-A1301|TX-M9002|Q702|kf026",PointOfViewTablet:"TAB-P506|TAB-navi-7-3G-M|TAB-P517|TAB-P-527|TAB-P701|TAB-P703|TAB-P721|TAB-P731N|TAB-P741|TAB-P825|TAB-P905|TAB-P925|TAB-PR945|TAB-PL1015|TAB-P1025|TAB-PI1045|TAB-P1325|TAB-PROTAB[0-9]+|TAB-PROTAB25|TAB-PROTAB26|TAB-PROTAB27|TAB-PROTAB26XL|TAB-PROTAB2-IPS9|TAB-PROTAB30-IPS9|TAB-PROTAB25XXL|TAB-PROTAB26-IPS10|TAB-PROTAB30-IPS10",OvermaxTablet:"OV-(SteelCore|NewBase|Basecore|Baseone|Exellen|Quattor|EduTab|Solution|ACTION|BasicTab|TeddyTab|MagicTab|Stream|TB-08|TB-09)",HCLTablet:"HCL.*Tablet|Connect-3G-2.0|Connect-2G-2.0|ME Tablet U1|ME Tablet U2|ME Tablet G1|ME Tablet X1|ME Tablet Y2|ME Tablet Sync",DPSTablet:"DPS Dream 9|DPS Dual 7",VistureTablet:"V97 HD|i75 3G|Visture V4( HD)?|Visture V5( HD)?|Visture V10",CrestaTablet:"CTP(-)?810|CTP(-)?818|CTP(-)?828|CTP(-)?838|CTP(-)?888|CTP(-)?978|CTP(-)?980|CTP(-)?987|CTP(-)?988|CTP(-)?989",MediatekTablet:"\\bMT8125|MT8389|MT8135|MT8377\\b",ConcordeTablet:"Concorde([ ]+)?Tab|ConCorde ReadMan",GoCleverTablet:"GOCLEVER TAB|A7GOCLEVER|M1042|M7841|M742|R1042BK|R1041|TAB A975|TAB A7842|TAB A741|TAB A741L|TAB M723G|TAB M721|TAB A1021|TAB I921|TAB R721|TAB I720|TAB T76|TAB R70|TAB R76.2|TAB R106|TAB R83.2|TAB M813G|TAB I721|GCTA722|TAB I70|TAB I71|TAB S73|TAB R73|TAB R74|TAB R93|TAB R75|TAB R76.1|TAB A73|TAB A93|TAB A93.2|TAB T72|TAB R83|TAB R974|TAB R973|TAB A101|TAB A103|TAB A104|TAB A104.2|R105BK|M713G|A972BK|TAB A971|TAB R974.2|TAB R104|TAB R83.3|TAB A1042",ModecomTablet:"FreeTAB 9000|FreeTAB 7.4|FreeTAB 7004|FreeTAB 7800|FreeTAB 2096|FreeTAB 7.5|FreeTAB 1014|FreeTAB 1001 |FreeTAB 8001|FreeTAB 9706|FreeTAB 9702|FreeTAB 7003|FreeTAB 7002|FreeTAB 1002|FreeTAB 7801|FreeTAB 1331|FreeTAB 1004|FreeTAB 8002|FreeTAB 8014|FreeTAB 9704|FreeTAB 1003",VoninoTablet:"\\b(Argus[ _]?S|Diamond[ _]?79HD|Emerald[ _]?78E|Luna[ _]?70C|Onyx[ _]?S|Onyx[ _]?Z|Orin[ _]?HD|Orin[ _]?S|Otis[ _]?S|SpeedStar[ _]?S|Magnet[ _]?M9|Primus[ _]?94[ _]?3G|Primus[ _]?94HD|Primus[ _]?QS|Android.*\\bQ8\\b|Sirius[ _]?EVO[ _]?QS|Sirius[ _]?QS|Spirit[ _]?S)\\b",ECSTablet:"V07OT2|TM105A|S10OT1|TR10CS1",StorexTablet:"eZee[_']?(Tab|Go)[0-9]+|TabLC7|Looney Tunes Tab",VodafoneTablet:"SmartTab([ ]+)?[0-9]+|SmartTabII10|SmartTabII7",EssentielBTablet:"Smart[ ']?TAB[ ]+?[0-9]+|Family[ ']?TAB2",RossMoorTablet:"RM-790|RM-997|RMD-878G|RMD-974R|RMT-705A|RMT-701|RME-601|RMT-501|RMT-711",iMobileTablet:"i-mobile i-note",TolinoTablet:"tolino tab [0-9.]+|tolino shine",AudioSonicTablet:"\\bC-22Q|T7-QC|T-17B|T-17P\\b",AMPETablet:"Android.* A78 ",SkkTablet:"Android.* (SKYPAD|PHOENIX|CYCLOPS)",TecnoTablet:"TECNO P9",JXDTablet:"Android.*\\b(F3000|A3300|JXD5000|JXD3000|JXD2000|JXD300B|JXD300|S5800|S7800|S602b|S5110b|S7300|S5300|S602|S603|S5100|S5110|S601|S7100a|P3000F|P3000s|P101|P200s|P1000m|P200m|P9100|P1000s|S6600b|S908|P1000|P300|S18|S6600|S9100)\\b",iJoyTablet:"Tablet (Spirit 7|Essentia|Galatea|Fusion|Onix 7|Landa|Titan|Scooby|Deox|Stella|Themis|Argon|Unique 7|Sygnus|Hexen|Finity 7|Cream|Cream X2|Jade|Neon 7|Neron 7|Kandy|Scape|Saphyr 7|Rebel|Biox|Rebel|Rebel 8GB|Myst|Draco 7|Myst|Tab7-004|Myst|Tadeo Jones|Tablet Boing|Arrow|Draco Dual Cam|Aurix|Mint|Amity|Revolution|Finity 9|Neon 9|T9w|Amity 4GB Dual Cam|Stone 4GB|Stone 8GB|Andromeda|Silken|X2|Andromeda II|Halley|Flame|Saphyr 9,7|Touch 8|Planet|Triton|Unique 10|Hexen 10|Memphis 4GB|Memphis 8GB|Onix 10)",FX2Tablet:"FX2 PAD7|FX2 PAD10",XoroTablet:"KidsPAD 701|PAD[ ]?712|PAD[ ]?714|PAD[ ]?716|PAD[ ]?717|PAD[ ]?718|PAD[ ]?720|PAD[ ]?721|PAD[ ]?722|PAD[ ]?790|PAD[ ]?792|PAD[ ]?900|PAD[ ]?9715D|PAD[ ]?9716DR|PAD[ ]?9718DR|PAD[ ]?9719QR|PAD[ ]?9720QR|TelePAD1030|Telepad1032|TelePAD730|TelePAD731|TelePAD732|TelePAD735Q|TelePAD830|TelePAD9730|TelePAD795|MegaPAD 1331|MegaPAD 1851|MegaPAD 2151",ViewsonicTablet:"ViewPad 10pi|ViewPad 10e|ViewPad 10s|ViewPad E72|ViewPad7|ViewPad E100|ViewPad 7e|ViewSonic VB733|VB100a",OdysTablet:"LOOX|XENO10|ODYS[ -](Space|EVO|Xpress|NOON)|\\bXELIO\\b|Xelio10Pro|XELIO7PHONETAB|XELIO10EXTREME|XELIOPT2|NEO_QUAD10",CaptivaTablet:"CAPTIVA PAD",IconbitTablet:"NetTAB|NT-3702|NT-3702S|NT-3702S|NT-3603P|NT-3603P|NT-0704S|NT-0704S|NT-3805C|NT-3805C|NT-0806C|NT-0806C|NT-0909T|NT-0909T|NT-0907S|NT-0907S|NT-0902S|NT-0902S",TeclastTablet:"T98 4G|\\bP80\\b|\\bX90HD\\b|X98 Air|X98 Air 3G|\\bX89\\b|P80 3G|\\bX80h\\b|P98 Air|\\bX89HD\\b|P98 3G|\\bP90HD\\b|P89 3G|X98 3G|\\bP70h\\b|P79HD 3G|G18d 3G|\\bP79HD\\b|\\bP89s\\b|\\bA88\\b|\\bP10HD\\b|\\bP19HD\\b|G18 3G|\\bP78HD\\b|\\bA78\\b|\\bP75\\b|G17s 3G|G17h 3G|\\bP85t\\b|\\bP90\\b|\\bP11\\b|\\bP98t\\b|\\bP98HD\\b|\\bG18d\\b|\\bP85s\\b|\\bP11HD\\b|\\bP88s\\b|\\bA80HD\\b|\\bA80se\\b|\\bA10h\\b|\\bP89\\b|\\bP78s\\b|\\bG18\\b|\\bP85\\b|\\bA70h\\b|\\bA70\\b|\\bG17\\b|\\bP18\\b|\\bA80s\\b|\\bA11s\\b|\\bP88HD\\b|\\bA80h\\b|\\bP76s\\b|\\bP76h\\b|\\bP98\\b|\\bA10HD\\b|\\bP78\\b|\\bP88\\b|\\bA11\\b|\\bA10t\\b|\\bP76a\\b|\\bP76t\\b|\\bP76e\\b|\\bP85HD\\b|\\bP85a\\b|\\bP86\\b|\\bP75HD\\b|\\bP76v\\b|\\bA12\\b|\\bP75a\\b|\\bA15\\b|\\bP76Ti\\b|\\bP81HD\\b|\\bA10\\b|\\bT760VE\\b|\\bT720HD\\b|\\bP76\\b|\\bP73\\b|\\bP71\\b|\\bP72\\b|\\bT720SE\\b|\\bC520Ti\\b|\\bT760\\b|\\bT720VE\\b|T720-3GE|T720-WiFi",OndaTablet:"\\b(V975i|Vi30|VX530|V701|Vi60|V701s|Vi50|V801s|V719|Vx610w|VX610W|V819i|Vi10|VX580W|Vi10|V711s|V813|V811|V820w|V820|Vi20|V711|VI30W|V712|V891w|V972|V819w|V820w|Vi60|V820w|V711|V813s|V801|V819|V975s|V801|V819|V819|V818|V811|V712|V975m|V101w|V961w|V812|V818|V971|V971s|V919|V989|V116w|V102w|V973|Vi40)\\b[\\s]+",JaytechTablet:"TPC-PA762",BlaupunktTablet:"Endeavour 800NG|Endeavour 1010",DigmaTablet:"\\b(iDx10|iDx9|iDx8|iDx7|iDxD7|iDxD8|iDsQ8|iDsQ7|iDsQ8|iDsD10|iDnD7|3TS804H|iDsQ11|iDj7|iDs10)\\b",EvolioTablet:"ARIA_Mini_wifi|Aria[ _]Mini|Evolio X10|Evolio X7|Evolio X8|\\bEvotab\\b|\\bNeura\\b",LavaTablet:"QPAD E704|\\bIvoryS\\b|E-TAB IVORY|\\bE-TAB\\b",CelkonTablet:"CT695|CT888|CT[\\s]?910|CT7 Tab|CT9 Tab|CT3 Tab|CT2 Tab|CT1 Tab|C820|C720|\\bCT-1\\b",WolderTablet:"miTab \\b(DIAMOND|SPACE|BROOKLYN|NEO|FLY|MANHATTAN|FUNK|EVOLUTION|SKY|GOCAR|IRON|GENIUS|POP|MINT|EPSILON|BROADWAY|JUMP|HOP|LEGEND|NEW AGE|LINE|ADVANCE|FEEL|FOLLOW|LIKE|LINK|LIVE|THINK|FREEDOM|CHICAGO|CLEVELAND|BALTIMORE-GH|IOWA|BOSTON|SEATTLE|PHOENIX|DALLAS|IN 101|MasterChef)\\b",MiTablet:"\\bMI PAD\\b|\\bHM NOTE 1W\\b",NibiruTablet:"Nibiru M1|Nibiru Jupiter One",NexoTablet:"NEXO NOVA|NEXO 10|NEXO AVIO|NEXO FREE|NEXO GO|NEXO EVO|NEXO 3G|NEXO SMART|NEXO KIDDO|NEXO MOBI",LeaderTablet:"TBLT10Q|TBLT10I|TBL-10WDKB|TBL-10WDKBO2013|TBL-W230V2|TBL-W450|TBL-W500|SV572|TBLT7I|TBA-AC7-8G|TBLT79|TBL-8W16|TBL-10W32|TBL-10WKB|TBL-W100",UbislateTablet:"UbiSlate[\\s]?7C",PocketBookTablet:"Pocketbook",Hudl:"Hudl HT7S3",TelstraTablet:"T-Hub2",GenericTablet:"Android.*\\b97D\\b|Tablet(?!.*PC)|BNTV250A|MID-WCDMA|LogicPD Zoom2|\\bA7EB\\b|CatNova8|A1_07|CT704|CT1002|\\bM721\\b|rk30sdk|\\bEVOTAB\\b|M758A|ET904|ALUMIUM10|Smartfren Tab|Endeavour 1010|Tablet-PC-4|Tagi Tab|\\bM6pro\\b|CT1020W|arc 10HD|\\bJolla\\b|\\bTP750\\b"},oss:{AndroidOS:"Android",BlackBerryOS:"blackberry|\\bBB10\\b|rim tablet os",PalmOS:"PalmOS|avantgo|blazer|elaine|hiptop|palm|plucker|xiino",SymbianOS:"Symbian|SymbOS|Series60|Series40|SYB-[0-9]+|\\bS60\\b",WindowsMobileOS:"Windows CE.*(PPC|Smartphone|Mobile|[0-9]{3}x[0-9]{3})|Window Mobile|Windows Phone [0-9.]+|WCE;",WindowsPhoneOS:"Windows Phone 8.1|Windows Phone 8.0|Windows Phone OS|XBLWP7|ZuneWP7|Windows NT 6.[23]; ARM;",iOS:"\\biPhone.*Mobile|\\biPod|\\biPad",MeeGoOS:"MeeGo",MaemoOS:"Maemo",JavaOS:"J2ME/|\\bMIDP\\b|\\bCLDC\\b",webOS:"webOS|hpwOS",badaOS:"\\bBada\\b",BREWOS:"BREW"},uas:{Chrome:"\\bCrMo\\b|CriOS|Android.*Chrome/[.0-9]* (Mobile)?",Dolfin:"\\bDolfin\\b",Opera:"Opera.*Mini|Opera.*Mobi|Android.*Opera|Mobile.*OPR/[0-9.]+|Coast/[0-9.]+",Skyfire:"Skyfire",IE:"IEMobile|MSIEMobile",Firefox:"fennec|firefox.*maemo|(Mobile|Tablet).*Firefox|Firefox.*Mobile",Bolt:"bolt",TeaShark:"teashark",Blazer:"Blazer",Safari:"Version.*Mobile.*Safari|Safari.*Mobile|MobileSafari",Tizen:"Tizen",UCBrowser:"UC.*Browser|UCWEB",baiduboxapp:"baiduboxapp",baidubrowser:"baidubrowser",DiigoBrowser:"DiigoBrowser",Puffin:"Puffin",Mercury:"\\bMercury\\b",ObigoBrowser:"Obigo",NetFront:"NF-Browser",GenericBrowser:"NokiaBrowser|OviBrowser|OneBrowser|TwonkyBeamBrowser|SEMC.*Browser|FlyFlow|Minimo|NetFront|Novarra-Vision|MQQBrowser|MicroMessenger"},props:{Mobile:"Mobile/[VER]",Build:"Build/[VER]",Version:"Version/[VER]",VendorID:"VendorID/[VER]",iPad:"iPad.*CPU[a-z ]+[VER]",iPhone:"iPhone.*CPU[a-z ]+[VER]",iPod:"iPod.*CPU[a-z ]+[VER]",Kindle:"Kindle/[VER]",Chrome:["Chrome/[VER]","CriOS/[VER]","CrMo/[VER]"],Coast:["Coast/[VER]"],Dolfin:"Dolfin/[VER]",Firefox:"Firefox/[VER]",Fennec:"Fennec/[VER]",IE:["IEMobile/[VER];","IEMobile [VER]","MSIE [VER];","Trident/[0-9.]+;.*rv:[VER]"],NetFront:"NetFront/[VER]",NokiaBrowser:"NokiaBrowser/[VER]",Opera:[" OPR/[VER]","Opera Mini/[VER]","Version/[VER]"],"Opera Mini":"Opera Mini/[VER]","Opera Mobi":"Version/[VER]","UC Browser":"UC Browser[VER]",MQQBrowser:"MQQBrowser/[VER]",MicroMessenger:"MicroMessenger/[VER]",baiduboxapp:"baiduboxapp/[VER]",baidubrowser:"baidubrowser/[VER]",Iron:"Iron/[VER]",Safari:["Version/[VER]","Safari/[VER]"],Skyfire:"Skyfire/[VER]",Tizen:"Tizen/[VER]",Webkit:"webkit[ /][VER]",Gecko:"Gecko/[VER]",Trident:"Trident/[VER]",Presto:"Presto/[VER]",iOS:" \\bi?OS\\b [VER][ ;]{1}",Android:"Android [VER]",BlackBerry:["BlackBerry[\\w]+/[VER]","BlackBerry.*Version/[VER]","Version/[VER]"],BREW:"BREW [VER]",Java:"Java/[VER]","Windows Phone OS":["Windows Phone OS [VER]","Windows Phone [VER]"],"Windows Phone":"Windows Phone [VER]","Windows CE":"Windows CE/[VER]","Windows NT":"Windows NT [VER]",Symbian:["SymbianOS/[VER]","Symbian/[VER]"],webOS:["webOS/[VER]","hpwOS/[VER];"]},utils:{Bot:"Googlebot|facebookexternalhit|AdsBot-Google|Google Keyword Suggestion|Facebot|YandexBot|bingbot|ia_archiver|AhrefsBot|Ezooms|GSLFbot|WBSearchBot|Twitterbot|TweetmemeBot|Twikle|PaperLiBot|Wotbox|UnwindFetchor|Exabot|MJ12bot|YandexImages|TurnitinBot|Pingdom",MobileBot:"Googlebot-Mobile|AdsBot-Google-Mobile|YahooSeeker/M1A1-R2D2",DesktopMode:"WPDesktop",TV:"SonyDTV|HbbTV",WebKit:"(webkit)[ /]([\\w.]+)",Console:"\\b(Nintendo|Nintendo WiiU|Nintendo 3DS|PLAYSTATION|Xbox)\\b",Watch:"SM-V700"}},f.detectMobileBrowsers={fullPattern:/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,shortPattern:/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,tabletPattern:/android|ipad|playbook|silk/i};var g,h=Object.prototype.hasOwnProperty;return f.FALLBACK_PHONE="UnknownPhone",f.FALLBACK_TABLET="UnknownTablet",f.FALLBACK_MOBILE="UnknownMobile",g="isArray"in Array?Array.isArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)},function(){var a,b,c,e,i,j,k=f.mobileDetectRules;for(a in k.props)if(h.call(k.props,a)){for(b=k.props[a],g(b)||(b=[b]),i=b.length,e=0;i>e;++e)c=b[e],j=c.indexOf("[VER]"),j>=0&&(c=c.substring(0,j)+"([\\w._\\+]+)"+c.substring(j+5)),b[e]=new RegExp(c,"i");k.props[a]=b}d(k.oss),d(k.phones),d(k.tablets),d(k.uas),d(k.utils),k.oss0={WindowsPhoneOS:k.oss.WindowsPhoneOS,WindowsMobileOS:k.oss.WindowsMobileOS}}(),f.findMatch=function(a,b){for(var c in a)if(h.call(a,c)&&a[c].test(b))return c;return null},f.findMatches=function(a,b){var c=[];for(var d in a)h.call(a,d)&&a[d].test(b)&&c.push(d);return c},f.getVersionStr=function(a,b){var c,d,e,g,i=f.mobileDetectRules.props;if(h.call(i,a))for(c=i[a],e=c.length,d=0;e>d;++d)if(g=c[d].exec(b),null!==g)return g[1];return null},f.getVersion=function(a,b){var c=f.getVersionStr(a,b);return c?f.prepareVersionNo(c):NaN},f.prepareVersionNo=function(a){
    var b;return b=a.split(/[a-z._ \/\-]/i),1===b.length&&(a=b[0]),b.length>1&&(a=b[0]+".",b.shift(),a+=b.join("")),Number(a)},f.isMobileFallback=function(a){return f.detectMobileBrowsers.fullPattern.test(a)||f.detectMobileBrowsers.shortPattern.test(a.substr(0,4))},f.isTabletFallback=function(a){return f.detectMobileBrowsers.tabletPattern.test(a)},f.prepareDetectionCache=function(a,c,d){if(a.mobile===b){var g,h,i;return(h=f.findMatch(f.mobileDetectRules.tablets,c))?(a.mobile=a.tablet=h,void(a.phone=null)):(g=f.findMatch(f.mobileDetectRules.phones,c))?(a.mobile=a.phone=g,void(a.tablet=null)):void(f.isMobileFallback(c)?(i=e.isPhoneSized(d),i===b?(a.mobile=f.FALLBACK_MOBILE,a.tablet=a.phone=null):i?(a.mobile=a.phone=f.FALLBACK_PHONE,a.tablet=null):(a.mobile=a.tablet=f.FALLBACK_TABLET,a.phone=null)):f.isTabletFallback(c)?(a.mobile=a.tablet=f.FALLBACK_TABLET,a.phone=null):a.mobile=a.tablet=a.phone=null)}},f.mobileGrade=function(a){var b=null!==a.mobile();return a.os("iOS")&&a.version("iPad")>=4.3||a.os("iOS")&&a.version("iPhone")>=3.1||a.os("iOS")&&a.version("iPod")>=3.1||a.version("Android")>2.1&&a.is("Webkit")||a.version("Windows Phone OS")>=7||a.is("BlackBerry")&&a.version("BlackBerry")>=6||a.match("Playbook.*Tablet")||a.version("webOS")>=1.4&&a.match("Palm|Pre|Pixi")||a.match("hp.*TouchPad")||a.is("Firefox")&&a.version("Firefox")>=12||a.is("Chrome")&&a.is("AndroidOS")&&a.version("Android")>=4||a.is("Skyfire")&&a.version("Skyfire")>=4.1&&a.is("AndroidOS")&&a.version("Android")>=2.3||a.is("Opera")&&a.version("Opera Mobi")>11&&a.is("AndroidOS")||a.is("MeeGoOS")||a.is("Tizen")||a.is("Dolfin")&&a.version("Bada")>=2||(a.is("UC Browser")||a.is("Dolfin"))&&a.version("Android")>=2.3||a.match("Kindle Fire")||a.is("Kindle")&&a.version("Kindle")>=3||a.is("AndroidOS")&&a.is("NookTablet")||a.version("Chrome")>=11&&!b||a.version("Safari")>=5&&!b||a.version("Firefox")>=4&&!b||a.version("MSIE")>=7&&!b||a.version("Opera")>=10&&!b?"A":a.os("iOS")&&a.version("iPad")<4.3||a.os("iOS")&&a.version("iPhone")<3.1||a.os("iOS")&&a.version("iPod")<3.1||a.is("Blackberry")&&a.version("BlackBerry")>=5&&a.version("BlackBerry")<6||a.version("Opera Mini")>=5&&a.version("Opera Mini")<=6.5&&(a.version("Android")>=2.3||a.is("iOS"))||a.match("NokiaN8|NokiaC7|N97.*Series60|Symbian/3")||a.version("Opera Mobi")>=11&&a.is("SymbianOS")?"B":(a.version("BlackBerry")<5||a.match("MSIEMobile|Windows CE.*Mobile")||a.version("Windows Mobile")<=5.2,"C")},f.detectOS=function(a){return f.findMatch(f.mobileDetectRules.oss0,a)||f.findMatch(f.mobileDetectRules.oss,a)},f.getDeviceSmallerSide=function(){return window.screen.width<window.screen.height?window.screen.width:window.screen.height},e.prototype={constructor:e,mobile:function(){return f.prepareDetectionCache(this._cache,this.ua,this.maxPhoneWidth),this._cache.mobile},phone:function(){return f.prepareDetectionCache(this._cache,this.ua,this.maxPhoneWidth),this._cache.phone},tablet:function(){return f.prepareDetectionCache(this._cache,this.ua,this.maxPhoneWidth),this._cache.tablet},userAgent:function(){return this._cache.userAgent===b&&(this._cache.userAgent=f.findMatch(f.mobileDetectRules.uas,this.ua)),this._cache.userAgent},userAgents:function(){return this._cache.userAgents===b&&(this._cache.userAgents=f.findMatches(f.mobileDetectRules.uas,this.ua)),this._cache.userAgents},os:function(){return this._cache.os===b&&(this._cache.os=f.detectOS(this.ua)),this._cache.os},version:function(a){return f.getVersion(a,this.ua)},versionStr:function(a){return f.getVersionStr(a,this.ua)},is:function(b){return c(this.userAgents(),b)||a(b,this.os())||a(b,this.phone())||a(b,this.tablet())||c(f.findMatches(f.mobileDetectRules.utils,this.ua),b)},match:function(a){return a instanceof RegExp||(a=new RegExp(a,"i")),a.test(this.ua)},isPhoneSized:function(a){return e.isPhoneSized(a||this.maxPhoneWidth)},mobileGrade:function(){return this._cache.grade===b&&(this._cache.grade=f.mobileGrade(this)),this._cache.grade}},"undefined"!=typeof window&&window.screen?e.isPhoneSized=function(a){return 0>a?b:f.getDeviceSmallerSide()<=a}:e.isPhoneSized=function(){},e._impl=f,e})}(function(a){return function(a){window.MobileDetect=a()};}());
/*!
 * imagesLoaded PACKAGED v3.2.0
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

N2D('ImagesLoaded', function ($, undefined) {
    /*!
     * EventEmitter v4.2.6 - git.io/ee
     * Oliver Caldwell
     * MIT license
     * @preserve
     */

    (function () {
        'use strict';

        /**
         * Class for managing events.
         * Can be extended to provide event functionality in other classes.
         *
         * @class EventEmitter Manages event registering and emitting.
         */
        function EventEmitter() {
        }

        // Shortcuts to improve speed and size
        var proto = EventEmitter.prototype;
        var exports = this;
        var originalGlobalValue = exports.EventEmitter;

        /**
         * Finds the index of the listener for the event in it's storage array.
         *
         * @param {Function[]} listeners Array of listeners to search through.
         * @param {Function} listener Method to look for.
         * @return {Number} Index of the specified listener, -1 if not found
         * @api private
         */
        function indexOfListener(listeners, listener) {
            var i = listeners.length;
            while (i--) {
                if (listeners[i].listener === listener) {
                    return i;
                }
            }

            return -1;
        }

        /**
         * Alias a method while keeping the context correct, to allow for overwriting of target method.
         *
         * @param {String} name The name of the target method.
         * @return {Function} The aliased method
         * @api private
         */
        function alias(name) {
            return function aliasClosure() {
                return this[name].apply(this, arguments);
            };
        }

        /**
         * Returns the listener array for the specified event.
         * Will initialise the event object and listener arrays if required.
         * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
         * Each property in the object response is an array of listener functions.
         *
         * @param {String|RegExp} evt Name of the event to return the listeners from.
         * @return {Function[]|Object} All listener functions for the event.
         */
        proto.getListeners = function getListeners(evt) {
            var events = this._getEvents();
            var response;
            var key;

            // Return a concatenated array of all matching events if
            // the selector is a regular expression.
            if (typeof evt === 'object') {
                response = {};
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        response[key] = events[key];
                    }
                }
            } else {
                response = events[evt] || (events[evt] = []);
            }

            return response;
        };

        /**
         * Takes a list of listener objects and flattens it into a list of listener functions.
         *
         * @param {Object[]} listeners Raw listener objects.
         * @return {Function[]} Just the listener functions.
         */
        proto.flattenListeners = function flattenListeners(listeners) {
            var flatListeners = [];
            var i;

            for (i = 0; i < listeners.length; i += 1) {
                flatListeners.push(listeners[i].listener);
            }

            return flatListeners;
        };

        /**
         * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
         *
         * @param {String|RegExp} evt Name of the event to return the listeners from.
         * @return {Object} All listener functions for an event in an object.
         */
        proto.getListenersAsObject = function getListenersAsObject(evt) {
            var listeners = this.getListeners(evt);
            var response;

            if (listeners instanceof Array) {
                response = {};
                response[evt] = listeners;
            }

            return response || listeners;
        };

        /**
         * Adds a listener function to the specified event.
         * The listener will not be added if it is a duplicate.
         * If the listener returns true then it will be removed after it is called.
         * If you pass a regular expression as the event name then the listener will be added to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to attach the listener to.
         * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addListener = function addListener(evt, listener) {
            var listeners = this.getListenersAsObject(evt);
            var listenerIsWrapped = typeof listener === 'object';
            var key;

            for (key in listeners) {
                if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                    listeners[key].push(listenerIsWrapped ? listener : {
                        listener: listener,
                        once: false
                    });
                }
            }

            return this;
        };

        /**
         * Alias of addListener
         */
        proto.on = alias('addListener');

        /**
         * Semi-alias of addListener. It will add a listener that will be
         * automatically removed after it's first execution.
         *
         * @param {String|RegExp} evt Name of the event to attach the listener to.
         * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addOnceListener = function addOnceListener(evt, listener) {
            return this.addListener(evt, {
                listener: listener,
                once: true
            });
        };

        /**
         * Alias of addOnceListener.
         */
        proto.once = alias('addOnceListener');

        /**
         * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
         * You need to tell it what event names should be matched by a regex.
         *
         * @param {String} evt Name of the event to create.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.defineEvent = function defineEvent(evt) {
            this.getListeners(evt);
            return this;
        };

        /**
         * Uses defineEvent to define multiple events.
         *
         * @param {String[]} evts An array of event names to define.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.defineEvents = function defineEvents(evts) {
            for (var i = 0; i < evts.length; i += 1) {
                this.defineEvent(evts[i]);
            }
            return this;
        };

        /**
         * Removes a listener function from the specified event.
         * When passed a regular expression as the event name, it will remove the listener from all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to remove the listener from.
         * @param {Function} listener Method to remove from the event.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeListener = function removeListener(evt, listener) {
            var listeners = this.getListenersAsObject(evt);
            var index;
            var key;

            for (key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    index = indexOfListener(listeners[key], listener);

                    if (index !== -1) {
                        listeners[key].splice(index, 1);
                    }
                }
            }

            return this;
        };

        /**
         * Alias of removeListener
         */
        proto.off = alias('removeListener');

        /**
         * Adds listeners in bulk using the manipulateListeners method.
         * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
         * You can also pass it a regular expression to add the array of listeners to all events that match it.
         * Yeah, this function does quite a bit. That's probably a bad thing.
         *
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to add.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.addListeners = function addListeners(evt, listeners) {
            // Pass through to manipulateListeners
            return this.manipulateListeners(false, evt, listeners);
        };

        /**
         * Removes listeners in bulk using the manipulateListeners method.
         * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
         * You can also pass it an event name and an array of listeners to be removed.
         * You can also pass it a regular expression to remove the listeners from all events that match it.
         *
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to remove.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeListeners = function removeListeners(evt, listeners) {
            // Pass through to manipulateListeners
            return this.manipulateListeners(true, evt, listeners);
        };

        /**
         * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
         * The first argument will determine if the listeners are removed (true) or added (false).
         * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
         * You can also pass it an event name and an array of listeners to be added/removed.
         * You can also pass it a regular expression to manipulate the listeners of all events that match it.
         *
         * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
         * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
         * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
            var i;
            var value;
            var single = remove ? this.removeListener : this.addListener;
            var multiple = remove ? this.removeListeners : this.addListeners;

            // If evt is an object then pass each of it's properties to this method
            if (typeof evt === 'object' && !(evt instanceof RegExp)) {
                for (i in evt) {
                    if (evt.hasOwnProperty(i) && (value = evt[i])) {
                        // Pass the single listener straight through to the singular method
                        if (typeof value === 'function') {
                            single.call(this, i, value);
                        } else {
                            // Otherwise pass back to the multiple function
                            multiple.call(this, i, value);
                        }
                    }
                }
            } else {
                // So evt must be a string
                // And listeners must be an array of listeners
                // Loop over it and pass each one to the multiple method
                i = listeners.length;
                while (i--) {
                    single.call(this, evt, listeners[i]);
                }
            }

            return this;
        };

        /**
         * Removes all listeners from a specified event.
         * If you do not specify an event then all listeners will be removed.
         * That means every event will be emptied.
         * You can also pass a regex to remove all events that match it.
         *
         * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.removeEvent = function removeEvent(evt) {
            var type = typeof evt;
            var events = this._getEvents();
            var key;

            // Remove different things depending on the state of evt
            if (type === 'string') {
                // Remove all listeners for the specified event
                delete events[evt];
            } else if (type === 'object') {
                // Remove all events matching the regex.
                for (key in events) {
                    if (events.hasOwnProperty(key) && evt.test(key)) {
                        delete events[key];
                    }
                }
            } else {
                // Remove all listeners in all events
                delete this._events;
            }

            return this;
        };

        /**
         * Alias of removeEvent.
         *
         * Added to mirror the node API.
         */
        proto.removeAllListeners = alias('removeEvent');

        /**
         * Emits an event of your choice.
         * When emitted, every listener attached to that event will be executed.
         * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
         * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
         * So they will not arrive within the array on the other side, they will be separate.
         * You can also pass a regular expression to emit to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
         * @param {Array} [args] Optional array of arguments to be passed to each listener.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.emitEvent = function emitEvent(evt, args) {
            var listeners = this.getListenersAsObject(evt);
            var listener;
            var i;
            var key;
            var response;

            for (key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    i = listeners[key].length;

                    while (i--) {
                        // If the listener returns true then it shall be removed from the event
                        // The function is executed either with a basic call or an apply if there is an args array
                        listener = listeners[key][i];

                        if (listener.once === true) {
                            this.removeListener(evt, listener.listener);
                        }

                        response = listener.listener.apply(this, args || []);

                        if (response === this._getOnceReturnValue()) {
                            this.removeListener(evt, listener.listener);
                        }
                    }
                }
            }

            return this;
        };

        /**
         * Alias of emitEvent
         */
        proto.trigger = alias('emitEvent');

        /**
         * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
         * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
         *
         * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
         * @param {...*} Optional additional arguments to be passed to each listener.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.emit = function emit(evt) {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.emitEvent(evt, args);
        };

        /**
         * Sets the current value to check against when executing listeners. If a
         * listeners return value matches the one set here then it will be removed
         * after execution. This value defaults to true.
         *
         * @param {*} value The new value to check for when executing listeners.
         * @return {Object} Current instance of EventEmitter for chaining.
         */
        proto.setOnceReturnValue = function setOnceReturnValue(value) {
            this._onceReturnValue = value;
            return this;
        };

        /**
         * Fetches the current value to check against when executing listeners. If
         * the listeners return value matches this one then it should be removed
         * automatically. It will return true by default.
         *
         * @return {*|Boolean} The current value to check for or the default, true.
         * @api private
         */
        proto._getOnceReturnValue = function _getOnceReturnValue() {
            if (this.hasOwnProperty('_onceReturnValue')) {
                return this._onceReturnValue;
            } else {
                return true;
            }
        };

        /**
         * Fetches the events object and creates one if required.
         *
         * @return {Object} The events storage object.
         * @api private
         */
        proto._getEvents = function _getEvents() {
            return this._events || (this._events = {});
        };

        /**
         * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
         *
         * @return {Function} Non conflicting EventEmitter class.
         */
        EventEmitter.noConflict = function noConflict() {
            exports.EventEmitter = originalGlobalValue;
            return EventEmitter;
        };


        this.EventEmitter = EventEmitter;
    }.call(window));

    /*!
     * eventie v1.0.4
     * event binding helper
     *   eventie.bind( elem, 'click', myFn )
     *   eventie.unbind( elem, 'click', myFn )
     */

    /*jshint browser: true, undef: true, unused: true */
    /*global define: false */

    (function (window) {


        var docElem = document.documentElement;

        var bind = function () {
        };

        function getIEEvent(obj) {
            var event = window.event;
            // add event.target
            event.target = event.target || event.srcElement || obj;
            return event;
        }

        if (docElem.addEventListener) {
            bind = function (obj, type, fn) {
                obj.addEventListener(type, fn, false);
            };
        } else if (docElem.attachEvent) {
            bind = function (obj, type, fn) {
                obj[type + fn] = fn.handleEvent ?
                    function () {
                        var event = getIEEvent(obj);
                        fn.handleEvent.call(fn, event);
                    } :
                    function () {
                        var event = getIEEvent(obj);
                        fn.call(obj, event);
                    };
                obj.attachEvent("on" + type, obj[type + fn]);
            };
        }

        var unbind = function () {
        };

        if (docElem.removeEventListener) {
            unbind = function (obj, type, fn) {
                obj.removeEventListener(type, fn, false);
            };
        } else if (docElem.detachEvent) {
            unbind = function (obj, type, fn) {
                obj.detachEvent("on" + type, obj[type + fn]);
                try {
                    delete obj[type + fn];
                } catch (err) {
                    // can't delete window object properties
                    obj[type + fn] = undefined;
                }
            };
        }

        var eventie = {
            bind: bind,
            unbind: unbind
        };

        // browser global
        window.eventie = eventie;

    })(window);

    /*!
     * imagesLoaded v3.2.0
     * JavaScript is all like "You images are done yet or what?"
     * MIT License
     */

    (function (window, factory) {
        'use strict';
        // universal module definition

        // browser global
        window.imagesLoaded = factory(
            window,
            window.EventEmitter,
            window.eventie
        );

    })(window,

// --------------------------  factory -------------------------- //

        function factory(window, EventEmitter, eventie) {


            var console = window.console;

// -------------------------- helpers -------------------------- //

// extend objects
            function extend(a, b) {
                for (var prop in b) {
                    a[prop] = b[prop];
                }
                return a;
            }

            var objToString = Object.prototype.toString;

            function isArray(obj) {
                return objToString.call(obj) == '[object Array]';
            }

// turn element or nodeList into an array
            function makeArray(obj) {
                var ary = [];
                if (isArray(obj)) {
                    // use object if already an array
                    ary = obj;
                } else if (typeof obj.length == 'number') {
                    // convert nodeList to array
                    for (var i = 0; i < obj.length; i++) {
                        ary.push(obj[i]);
                    }
                } else {
                    // array of single index
                    ary.push(obj);
                }
                return ary;
            }

            // -------------------------- imagesLoaded -------------------------- //

            /**
             * @param {Array, Element, NodeList, String} elem
             * @param {Object or Function} options - if function, use as callback
             * @param {Function} onAlways - callback function
             */
            function ImagesLoaded(elem, options, onAlways) {
                // coerce ImagesLoaded() without new, to be new ImagesLoaded()
                if (!(this instanceof ImagesLoaded)) {
                    return new ImagesLoaded(elem, options, onAlways);
                }
                // use elem as selector string
                if (typeof elem == 'string') {
                    elem = document.querySelectorAll(elem);
                }

                this.elements = makeArray(elem);
                this.options = extend({}, this.options);

                if (typeof options == 'function') {
                    onAlways = options;
                } else {
                    extend(this.options, options);
                }

                if (onAlways) {
                    this.on('always', onAlways);
                }

                this.getImages();

                if ($) {
                    // add jQuery Deferred object
                    this.jqDeferred = new $.Deferred();
                }

                // HACK check async to allow time to bind listeners
                var _this = this;
                setTimeout(function () {
                    _this.check();
                });
            }

            ImagesLoaded.prototype = new EventEmitter();

            ImagesLoaded.prototype.options = {};

            ImagesLoaded.prototype.getImages = function () {
                this.images = [];

                // filter & find items if we have an item selector
                for (var i = 0; i < this.elements.length; i++) {
                    var elem = this.elements[i];
                    this.addElementImages(elem);
                }
            };

            /**
             * @param {Node} element
             */
            ImagesLoaded.prototype.addElementImages = function (elem) {

                // filter siblings
                if (elem.nodeName == 'IMG') {
                    this.addImage(elem);
                }
                // get background image on element
                if (this.options.background === true) {
                    this.addElementBackgroundImages(elem);
                }

                // find children
                // no non-element nodes, #143
                var nodeType = elem.nodeType;
                if (!nodeType || !elementNodeTypes[nodeType]) {
                    return;
                }
                var childImgs = elem.querySelectorAll('img');
                // concat childElems to filterFound array
                for (var i = 0; i < childImgs.length; i++) {
                    var img = childImgs[i];
                    this.addImage(img);
                }

                // get child background images
                if (typeof this.options.background == 'string') {
                    var children = elem.querySelectorAll(this.options.background);
                    for (i = 0; i < children.length; i++) {
                        var child = children[i];
                        this.addElementBackgroundImages(child);
                    }
                }
            };

            var elementNodeTypes = {
                1: true,
                9: true,
                11: true
            };

            ImagesLoaded.prototype.addElementBackgroundImages = function (elem) {
                var style = getStyle(elem);
                // get url inside url("...")
                var reURL = /url\(["]*([^"\)]+)["]*\)/gi;
                var matches = reURL.exec(style.backgroundImage);
                if (!matches) {
                    var reURL2 = /url\([']*([^'\)]+)[']*\)/gi;
                    matches = reURL2.exec(style.backgroundImage);
                }
                while (matches !== null) {
                    var url = matches && matches[1];
                    if (url) {
                        this.addBackground(url, elem);
                    }
                    matches = reURL.exec(style.backgroundImage);
                }
            };

            // IE8
            var getStyle = window.getComputedStyle || function (elem) {
                return elem.currentStyle;
            };

            /**
             * @param {Image} img
             */
            ImagesLoaded.prototype.addImage = function (img) {
                var loadingImage = new LoadingImage(img);
                this.images.push(loadingImage);
            };

            ImagesLoaded.prototype.addBackground = function (url, elem) {
                var background = new Background(url, elem);
                this.images.push(background);
            };

            ImagesLoaded.prototype.check = function () {
                var _this = this;
                this.progressedCount = 0;
                this.hasAnyBroken = false;
                // complete if no images
                if (!this.images.length) {
                    this.complete();
                    return;
                }

                function onProgress(image, elem, message) {
                    // HACK - Chrome triggers event before object properties have changed. #83
                    setTimeout(function () {
                        _this.progress(image, elem, message);
                    });
                }

                for (var i = 0; i < this.images.length; i++) {
                    var loadingImage = this.images[i];
                    loadingImage.once('progress', onProgress);
                    loadingImage.check();
                }
            };

            ImagesLoaded.prototype.progress = function (image, elem, message) {
                this.progressedCount++;
                this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
                // progress event
                this.emit('progress', this, image, elem);
                if (this.jqDeferred && this.jqDeferred.notify) {
                    this.jqDeferred.notify(this, image);
                }
                // check if completed
                if (this.progressedCount == this.images.length) {
                    this.complete();
                }

                if (this.options.debug && console) {
                    console.log('progress: ' + message, image, elem);
                }
            };

            ImagesLoaded.prototype.complete = function () {
                var eventName = this.hasAnyBroken ? 'fail' : 'done';
                this.isComplete = true;
                this.emit(eventName, this);
                this.emit('always', this);
                if (this.jqDeferred) {
                    var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
                    this.jqDeferred[jqMethod](this);
                }
            };

            // --------------------------  -------------------------- //

            function LoadingImage(img) {
                this.img = img;
            }

            LoadingImage.prototype = new EventEmitter();

            LoadingImage.prototype.check = function () {
                // If complete is true and browser supports natural sizes,
                // try to check for image status manually.
                var isComplete = this.getIsImageComplete();
                if (isComplete) {
                    // report based on naturalWidth
                    this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
                    return;
                }

                // If none of the checks above matched, simulate loading on detached element.
                this.proxyImage = new Image();
                eventie.bind(this.proxyImage, 'load', this);
                eventie.bind(this.proxyImage, 'error', this);
                // bind to image as well for Firefox. #191
                eventie.bind(this.img, 'load', this);
                eventie.bind(this.img, 'error', this);
                this.proxyImage.src = this.img.src;
            };

            LoadingImage.prototype.getIsImageComplete = function () {
                return this.img.complete && this.img.naturalWidth !== undefined;
            };

            LoadingImage.prototype.confirm = function (isLoaded, message) {
                this.isLoaded = isLoaded;
                this.emit('progress', this, this.img, message);
            };

            // ----- events ----- //

            // trigger specified handler for event type
            LoadingImage.prototype.handleEvent = function (event) {
                var method = 'on' + event.type;
                if (this[method]) {
                    this[method](event);
                }
            };

            LoadingImage.prototype.onload = function () {
                this.confirm(true, 'onload');
                this.unbindEvents();
            };

            LoadingImage.prototype.onerror = function () {
                this.confirm(false, 'onerror');
                this.unbindEvents();
            };

            LoadingImage.prototype.unbindEvents = function () {
                eventie.unbind(this.proxyImage, 'load', this);
                eventie.unbind(this.proxyImage, 'error', this);
                eventie.unbind(this.img, 'load', this);
                eventie.unbind(this.img, 'error', this);
            };

            // -------------------------- Background -------------------------- //

            function Background(url, element) {
                this.url = url;
                this.element = element;
                this.img = new Image();
            }

            // inherit LoadingImage prototype
            Background.prototype = new LoadingImage();

            Background.prototype.check = function () {
                eventie.bind(this.img, 'load', this);
                eventie.bind(this.img, 'error', this);
                this.img.src = this.url;
                // check if image is already complete
                var isComplete = this.getIsImageComplete();
                if (isComplete) {
                    this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
                    this.unbindEvents();
                }
            };

            Background.prototype.unbindEvents = function () {
                eventie.unbind(this.img, 'load', this);
                eventie.unbind(this.img, 'error', this);
            };

            Background.prototype.confirm = function (isLoaded, message) {
                this.isLoaded = isLoaded;
                this.emit('progress', this, this.element, message);
            };

            // -------------------------- jQuery -------------------------- //

            ImagesLoaded.makeJQueryPlugin = function () {
                if (!$) {
                    return;
                }

                // $().imagesLoaded()
                $.fn.n2imagesLoaded = function (options, callback) {
                    var instance = new ImagesLoaded(this, options, callback);
                    return instance.jqDeferred.promise($(this));
                };
            };
            // try making plugin
            ImagesLoaded.makeJQueryPlugin();

            // --------------------------  -------------------------- //

            return ImagesLoaded;

        });

});
N2D('UniversalPointer', function ($, undefined) {
    var pointerEvents = !!(window.PointerEvent || window.MSPointerEvent || window.navigator.msPointerEnabled || window.navigator.pointerEnabled),
        touchEvents = !!window.TouchEvent,
        isIOS = touchEvents && navigator.userAgent.match(/iPhone|iPad|iPod/i);

    function UniversalClickContext(el, handler) {
        this.el = el;
        this.handler = handler;
        this.$el = $(el).data('universalclick', this);
        this.preventMouse = false;
        this.timeouts = [];
        this.localListeners = [];
        this.globalListeners = [];
    }

    UniversalClickContext.prototype.addTimeout = function (timeout) {
        this.timeouts.push(timeout);
    };

    UniversalClickContext.prototype.clearTimeouts = function () {

        for (var i = 0; i < this.timeouts.length; i++) {
            clearTimeout(this.timeouts[i]);
        }

        this.timeouts = [];
    };

    UniversalClickContext.prototype.click = function (e, currentTarget) {

        if (currentTarget !== undefined) {
            /**
             * For complex events, we need to fix the currentTarget property
             * @type {{currentTarget: *, target: *}}
             */
            e = {
                currentTarget: currentTarget,
                target: this.el
            };
        }

        this.handler.call(this.el, e);

        this.clear();
    };

    UniversalClickContext.prototype.clear = function () {

        for (var i = 0; i < this.localListeners.length; i++) {
            this.localListeners[i][0].removeEventListener(this.localListeners[i][1], this.localListeners[i][2], this.localListeners[i][3]);
        }
    };

    UniversalClickContext.prototype.addGlobalEventListener = function (type, listener, options) {
        this.globalListeners.push([type, listener, options]);
        this.el.addEventListener(type, listener, options);
    };

    UniversalClickContext.prototype.addLocalEventListener = function (el, type, listener, options) {
        this.localListeners.push([el, type, listener, options]);
        el.addEventListener(type, listener, options);
    };

    UniversalClickContext.prototype.remove = function () {

        this.clear();

        this.clearTimeouts();

        for (var i = 0; i < this.globalListeners.length; i++) {
            this.el.removeEventListener(this.globalListeners[i][0], this.globalListeners[i][1], this.globalListeners[i][2]);
        }
    };

    $.event.special.universalclick = {
        add: function (handleObj) {
            var context = new UniversalClickContext(this, handleObj.handler);

            if (pointerEvents) {
                context.addGlobalEventListener('pointerdown', function (downEvent) {
                    if (!downEvent.isPrimary) return;

                    var currentTarget = downEvent.currentTarget;

                    context.addLocalEventListener(document.body.parentNode, 'pointerup', function (upEvent) {
                        if (!upEvent.isPrimary) return;

                        if (downEvent.pointerId === upEvent.pointerId) {
                            if (Math.abs(upEvent.clientX - downEvent.clientX) < 10 && Math.abs(upEvent.clientY - downEvent.clientY) < 10) {
                                context.click(upEvent, currentTarget);
                            } else {
                                context.clear();
                            }
                        }
                    });
                });
            } else {
                if (!isIOS) {
                    context.addGlobalEventListener('click', function (e) {
                        if (!context.preventMouse) {
                            context.click(e);
                        }
                    });
                }

                if (touchEvents) {
                    context.addGlobalEventListener('touchstart', function (downEvent) {
                        var currentTarget = downEvent.currentTarget;

                        context.clearTimeouts();

                        context.preventMouse = true;
                        context.addLocalEventListener(document.body.parentNode, 'touchend', function (upEvent) {
                            if (Math.abs(upEvent.changedTouches[0].clientX - downEvent.changedTouches[0].clientX) < 10 && Math.abs(upEvent.changedTouches[0].clientY - downEvent.changedTouches[0].clientY) < 10) {
                                context.click(upEvent, currentTarget);
                            } else {
                                context.clear();
                            }
                            context.addTimeout(setTimeout(function () {
                                context.preventMouse = false;
                            }, 1000));
                        }, {passive: true});
                    }, {passive: true});
                }
            }

        },
        remove: function () {
            var $el = $(this),
                context = $el.data('universalclick');
            if (context) {
                context.remove();
                $el.removeData('universalclick');
            }
        }
    };


    function UniversalEnterContext(el, handler, leaveOnSecond) {
        this.el = el;
        this.handler = handler;
        this.$el = $(el).data('universalenter', this);
        this.leaveOnSecond = leaveOnSecond;
        this.preventMouse = false;
        this.isActive = false;
        this.timeouts = [];
        this.localListeners = [];
        this.globalListeners = [];
    }

    UniversalEnterContext.prototype.enter = function (e) {
        if (this.leaveOnSecond && this.isActive) {
            this.leave();
            return false;
        }

        this.handler.apply(this.el, arguments);
        this.isActive = true;
        return true;
    };

    UniversalEnterContext.prototype.leave = function () {
        this.clearTimeouts();

        for (var i = 0; i < this.localListeners.length; i++) {
            this.localListeners[i][0].removeEventListener(this.localListeners[i][1], this.localListeners[i][2], this.localListeners[i][3]);
        }

        this.isActive = false;
        this.$el.triggerHandler('universalleave');
    };

    UniversalEnterContext.prototype.testLeave = function (target) {
        if (!this.$el.is(target) && this.$el.find(target).length === 0) {
            this.leave();
        }
    };

    UniversalEnterContext.prototype.addTimeout = function (timeout) {
        this.timeouts.push(timeout);
    };

    UniversalEnterContext.prototype.clearTimeouts = function () {

        for (var i = 0; i < this.timeouts.length; i++) {
            clearTimeout(this.timeouts[i]);
        }

        this.timeouts = [];
    };

    UniversalEnterContext.prototype.addGlobalEventListener = function (type, listener, options) {
        this.globalListeners.push([type, listener, options]);
        this.el.addEventListener(type, listener, options);
    };

    UniversalEnterContext.prototype.remove = function () {
        if (this.isActive) {
            this.leave();
        }

        this.clearTimeouts();

        for (var i = 0; i < this.globalListeners.length; i++) {
            this.el.removeEventListener(this.globalListeners[i][0], this.globalListeners[i][1], this.globalListeners[i][2]);
        }
    };

    UniversalEnterContext.prototype.addLocalEventListener = function (el, type, listener, options) {
        this.localListeners.push([el, type, listener, options]);
        el.addEventListener(type, listener, options);
    };

    $.event.special.universalenter = {
        add: function (handleObj) {
            var context = new UniversalEnterContext(this, handleObj.handler, handleObj.data ? handleObj.data.leaveOnSecond : false);

            if (pointerEvents) {
                context.addGlobalEventListener('pointerenter', function (e) {
                    if (!e.isPrimary) return;

                    context.clearTimeouts();

                    if (context.enter(e)) {

                        if (e.pointerType !== 'mouse') {
                            context.addLocalEventListener(document.body.parentNode, 'pointerdown', function (e) {
                                if (!e.isPrimary) return;

                                context.testLeave(e.target);
                            });

                            context.addTimeout(setTimeout(function () {
                                context.leave();
                            }, 5000));
                        }
                    }

                });

                context.addGlobalEventListener('pointerleave', function (e) {
                    if (!e.isPrimary) return;

                    if (e.pointerType === 'mouse') {
                        context.leave();
                    }
                });
            } else {

                context.addGlobalEventListener('mouseenter', function (e) {
                    if (!context.preventMouse) {
                        context.enter(e);
                    }
                });

                context.addGlobalEventListener('mouseleave', function () {
                    if (!context.preventMouse) {
                        context.leave();
                    }
                });

                if (touchEvents) {
                    context.addGlobalEventListener('touchstart', function (e) {
                        context.preventMouse = true;
                        context.clearTimeouts();

                        if (context.enter(e)) {
                            context.addLocalEventListener(document.body.parentNode, 'touchstart', function (e) {
                                context.testLeave(e.target);
                            });

                            context.addTimeout(setTimeout(function () {
                                context.leave();
                                context.preventMouse = false;
                            }, 5000));
                        }
                    }, {passive: true});
                }
            }
        },
        remove: function () {
            var $el = $(this),
                context = $el.data('universalenter');
            if (context) {
                context.remove();
                $el.removeData('universalenter');
            }
        }
    };
});
/*!
 * Event Burrito is a touch / mouse / pointer event unifier
 * https://github.com/wilddeer/Event-Burrito
 * Copyright Oleg Korsunsky | http://wd.dizaina.net/
 *
 * MIT License
 */
N2D('EventBurrito', function ($, undefined) {

    var noop = function () {
            return true;
        },
        isDragStarted = false; //Allow one drag at the same time

    /**
     * @memberOf N2Classes
     *
     * @param _this
     * @param options
     * @returns {{getClicksAllowed: function(): boolean, kill: kill}}
     * @constructor
     */
    function EventBurrito(_this, options) {

        var o = {
            preventDefault: true,
            clickTolerance: 10,
            preventScroll: false,
            mouse: true,
            axis: 'x',
            start: noop,
            move: noop,
            end: noop,
            click: noop
        };

        //merge user options into defaults
        options && mergeObjects(o, options);

        var support = {
                pointerEvents: !!(window.PointerEvent || window.MSPointerEvent || window.navigator.msPointerEnabled || window.navigator.pointerEnabled)
            },
            start = {},
            diff = {},
            listeners = [],
            isScrolling,
            isRealScrolling,
            eventType,
            clicksAllowed = true, //flag allowing default click actions (e.g. links)
            eventModel = (support.pointerEvents ? 1 : 0),
            events = [
                ['touchstart', 'touchmove', 'touchend', 'touchcancel'], //touch events
                ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'], //pointer events
                ['mousedown', 'mousemove', 'mouseup', false] //mouse events
            ],
            //some checks for different event types
            checks = [
                //touch events
                function (e) {
                    //skip the event if it's multitouch or pinch move
                    return (e.touches && e.touches.length > 1) || (e.scale && e.scale !== 1);
                },
                //pointer events
                function (e) {
                    //Skip it, if:
                    //1. event is not primary (other pointers during multitouch),
                    //2. left mouse button is not pressed,
                    //3. mouse drag is disabled and event is not touch
                    return !e.isPrimary || (e.buttons && e.buttons !== 1) || (!o.mouse && e.pointerType !== 'touch' && e.pointerType !== 'pen');
                },
                //mouse events
                function (e) {
                    //skip the event if left mouse button is not pressed
                    //in IE7-8 `buttons` is not defined, in IE9 LMB is 0
                    return (e.buttons && e.buttons !== 1);
                }
            ],
            checkTarget = function (target) {
                var tagName = target.tagName;
                if (tagName == 'INPUT' || tagName == 'TEXTAREA' || tagName == 'SELECT' || tagName == 'BUTTON' || tagName == 'VIDEO' || $(target).hasClass('n2-scrollable') || $(target).closest('.n2-scrollable').length) {
                    return true;
                }
                return false;
            };

        function mergeObjects(targetObj, sourceObject) {
            for (var key in sourceObject) {
                if (sourceObject.hasOwnProperty(key)) {
                    targetObj[key] = sourceObject[key];
                }
            }
        }

        function addEvent(el, event, func, options) {
            if (!event) return;

            el.addEventListener ? el.addEventListener(event, func, options) : el.attachEvent('on' + event, func);

            //return event remover to easily remove anonymous functions later
            return {
                remove: function () {
                    removeEvent(el, event, func, options);
                }
            };
        }

        function removeEvent(el, event, func, options) {
            if (!event) return;

            el.removeEventListener ? el.removeEventListener(event, func, options) : el.detachEvent('on' + event, func);
        }

        function preventDefault(event) {
            event.preventDefault ? event.preventDefault() : event.returnValue = false;
        }

        function getDiff(event) {
            diff = {
                x: (eventType ? event.clientX : event.touches[0].clientX) - start.x,
                y: (eventType ? event.clientY : event.touches[0].clientY) - start.y,
                time: Date.now()
            };
        }

        function tStart(event, eType) {
            if (event.isPrimary !== undefined && !event.isPrimary) return;
            if (isDragStarted) return;

            clicksAllowed = true;
            eventType = eType; //leak event type

            if (checks[eventType](event)) return;
            if (checkTarget(event.target)) return;

            isDragStarted = true;

            //attach event listeners to the document, so that the slider
            //will continue to recieve events wherever the pointer is
            if (eventType !== 0) {
                addEvent(document, events[eventType][1], tMove, false);
            }
            addEvent(document, events[eventType][2], tEnd, false);
            addEvent(document, events[eventType][3], tEnd, false);

            //fixes WebKit's cursor while dragging
            if (o.preventDefault && eventType) preventDefault(event);

            //remember starting time and position
            start = {
                x: eventType ? event.clientX : event.touches[0].clientX,
                y: eventType ? event.clientY : event.touches[0].clientY,

                time: Date.now()
            };

            //reset
            isScrolling = undefined;
            isRealScrolling = false;
            diff = {x: 0, y: 0};

            o.start(event, start);

            tMove(event);
        }

        function tMove(event) {
            if (event.isPrimary !== undefined && !event.isPrimary) return;
            //if user is trying to scroll vertically -- do nothing
            if (o.axis === 'x') {
                if ((!o.preventScroll && isScrolling) || checks[eventType](event)) return;
            }
            if (checkTarget(event.target)) return;

            getDiff(event);

            if (Math.abs(diff.x) > o.clickTolerance || Math.abs(diff.y) > o.clickTolerance) {
                clicksAllowed = false; //if there was a move -- deny all the clicks before next tStart
            }

            //check whether the user is trying to scroll vertically
            if (isScrolling === undefined && eventType !== 2) {
                isScrolling = (Math.abs(diff.x) < Math.abs(diff.y)) && !o.preventScroll
                if (isScrolling) {
                    return;
                }
            }

            if (o.move(event, start, diff, isRealScrolling)) {
                if (o.preventDefault) {
                    preventDefault(event); //Prevent scrolling
                }
            }
        }

        function tEnd(event) {
            if (event.isPrimary !== undefined && !event.isPrimary) return;
            eventType && getDiff(event);

            //IE likes to focus links after touchend.
            //Since we don't want to disable link outlines completely for accessibility reasons,
            //we just blur it after touch and disable the outline for `:active` links in css.
            //This way the outline will remain visible when using keyboard.
            !clicksAllowed && event.target && event.target.blur && event.target.blur();

            //detach event listeners from the document
            if (eventType !== 0) {
                removeEvent(document, events[eventType][1], tMove, false);
            }
            removeEvent(document, events[eventType][2], tEnd, false);
            removeEvent(document, events[eventType][3], tEnd, false);

            o.end(event, start, diff, isRealScrolling);
            isRealScrolling = false;
            isDragStarted = false;
        }

        function init() {
            //bind scroll
            listeners.push(addEvent(document, 'scroll', function (e) {
                if (window.nextendScrollFocus === undefined || !window.nextendScrollFocus) {
                    isRealScrolling = true;
                }
            }));

            if (eventModel === 1) {
                if (o.axis === 'y') {
                    _this.style.touchAction = 'pan-up pan-x';
                } else {
                    _this.style.touchAction = 'pan-y';
                }
            }

            //bind touchstart
            listeners.push(addEvent(_this, events[eventModel][0], function (e) {
                tStart(e, eventModel);
            }, eventModel === 0 ? {passive: false} : false));

            if (eventModel === 0) {
                listeners.push(addEvent(_this, events[0][1], function (e) {
                    tMove(e, 0);
                }, {passive: false}));
            }

            //prevent stuff from dragging when using mouse
            listeners.push(addEvent(_this, 'dragstart', preventDefault));

            //bind mousedown if necessary
            if (o.mouse && !eventModel) {
                listeners.push(addEvent(_this, events[2][0], function (e) {
                    tStart(e, 2);
                }));
            }

            //No clicking during touch
            listeners.push(addEvent(_this, 'click', function (event) {
                clicksAllowed ? o.click(event) : preventDefault(event);
            }));
        }

        init();

        //expose the API
        return {
            supportsPointerEvents: support.pointerEvents,
            getClicksAllowed: function () {
                return clicksAllowed;
            },
            kill: function () {
                for (var i = listeners.length - 1; i >= 0; i--) {
                    listeners[i].remove();
                }
            }
        }
    }

    return EventBurrito;
});
var tmpModernizr = null;
if(typeof window.Modernizr !== "undefined" ) tmpModernizr = window.Modernizr;

/*! modernizr 3.2.0 (Custom Build) | MIT *
 * http://modernizr.com/download/?-csstransforms3d-addtest-domprefixes-prefixed-prefixes-shiv-testallprops-testprop-teststyles !*/
!function(e,t,n){function r(e,t){return typeof e===t}function o(){var e,t,n,o,i,a,s;for(var l in C)if(C.hasOwnProperty(l)){if(e=[],t=C[l],t.name&&(e.push(t.name.toLowerCase()),t.options&&t.options.aliases&&t.options.aliases.length))for(n=0;n<t.options.aliases.length;n++)e.push(t.options.aliases[n].toLowerCase());for(o=r(t.fn,"function")?t.fn():t.fn,i=0;i<e.length;i++)a=e[i],s=a.split("."),1===s.length?Modernizr[s[0]]=o:(!Modernizr[s[0]]||Modernizr[s[0]]instanceof Boolean||(Modernizr[s[0]]=new Boolean(Modernizr[s[0]])),Modernizr[s[0]][s[1]]=o),N.push((o?"":"no-")+s.join("-"))}}function i(e){return e.replace(/([a-z])-([a-z])/g,function(e,t,n){return t+n.toUpperCase()}).replace(/^-/,"")}function a(e){var t=w.className,n=Modernizr._config.classPrefix||"";if(j&&(t=t.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+n+"no-js(\\s|$)");/*t=t.replace(i, "$1" + n + "js$2")*/}Modernizr._config.enableClasses&&(t+=" "+n+e.join(" "+n),j?w.className.baseVal=t:w.className=t)}function s(e,t){if("object"==typeof e)for(var n in e)b(e,n)&&s(n,e[n]);else{e=e.toLowerCase();var r=e.split("."),o=Modernizr[r[0]];if(2==r.length&&(o=o[r[1]]),"undefined"!=typeof o)return Modernizr;t="function"==typeof t?t():t,1==r.length?Modernizr[r[0]]=t:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=t),a([(t&&0!=t?"":"no-")+r.join("-")]),Modernizr._trigger(e,t)}return Modernizr}function l(e,t){return!!~(""+e).indexOf(t)}function f(){return"function"!=typeof t.createElement?t.createElement(arguments[0]):j?t.createElementNS.call(t,"http://www.w3.org/2000/svg",arguments[0]):t.createElement.apply(t,arguments)}function u(){var e=t.body;return e||(e=f(j?"svg":"body"),e.fake=!0),e}function c(e,n,r,o){var i,a,s,l,c="modernizr",d=f("div"),p=u();if(parseInt(r,10))for(;r--;)s=f("div"),s.id=o?o[r]:c+(r+1),d.appendChild(s);return i=f("style"),i.type="text/css",i.id="s"+c,(p.fake?p:d).appendChild(i),p.appendChild(d),i.styleSheet?i.styleSheet.cssText=e:i.appendChild(t.createTextNode(e)),d.id=c,p.fake&&(p.style.background="",p.style.overflow="hidden",l=w.style.overflow,w.style.overflow="hidden",w.appendChild(p)),a=n(d,e),p.fake?(p.parentNode.removeChild(p),w.style.overflow=l,w.offsetHeight):d.parentNode.removeChild(d),!!a}function d(e,t){return function(){return e.apply(t,arguments)}}function p(e,t,n){var o;for(var i in e)if(e[i]in t)return n===!1?e[i]:(o=t[e[i]],r(o,"function")?d(o,n||t):o);return!1}function m(e){return e.replace(/([A-Z])/g,function(e,t){return"-"+t.toLowerCase()}).replace(/^ms-/,"-ms-")}function h(t,r){var o=t.length;if("CSS"in e&&"supports"in e.CSS){for(;o--;)if(e.CSS.supports(m(t[o]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var i=[];o--;)i.push("("+m(t[o])+":"+r+")");return i=i.join(" or "),c("@supports ("+i+") { #modernizr { position: absolute; } }",function(e){return"absolute"==getComputedStyle(e,null).position})}return n}function g(e,t,o,a){function s(){c&&(delete M.style,delete M.modElem)}if(a=r(a,"undefined")?!1:a,!r(o,"undefined")){var u=h(e,o);if(!r(u,"undefined"))return u}for(var c,d,p,m,g,v=["modernizr","tspan"];!M.style;)c=!0,M.modElem=f(v.shift()),M.style=M.modElem.style;for(p=e.length,d=0;p>d;d++)if(m=e[d],g=M.style[m],l(m,"-")&&(m=i(m)),M.style[m]!==n){if(a||r(o,"undefined"))return s(),"pfx"==t?m:!0;try{M.style[m]=o}catch(y){}if(M.style[m]!=g)return s(),"pfx"==t?m:!0}return s(),!1}function v(e,t,n,o,i){var a=e.charAt(0).toUpperCase()+e.slice(1),s=(e+" "+k.join(a+" ")+a).split(" ");return r(t,"string")||r(t,"undefined")?g(s,t,o,i):(s=(e+" "+E.join(a+" ")+a).split(" "),p(s,t,n))}function y(e,t,r){return v(e,n,n,t,r)}var C=[],_={_version:"3.2.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,t){var n=this;setTimeout(function(){t(n[e])},0)},addTest:function(e,t,n){C.push({name:e,fn:t,options:n})},addAsyncTest:function(e){C.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=_,Modernizr=new Modernizr;var S=_._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):[];_._prefixes=S;var w=t.documentElement,x="Moz O ms Webkit",E=_._config.usePrefixes?x.toLowerCase().split(" "):[];_._domPrefixes=E;var b;!function(){var e={}.hasOwnProperty;b=r(e,"undefined")||r(e.call,"undefined")?function(e,t){return t in e&&r(e.constructor.prototype[t],"undefined")}:function(t,n){return e.call(t,n)}}();var N=[],P="CSS"in e&&"supports"in e.CSS,T="supportsCSS"in e;Modernizr.addTest("supports",P||T);var j="svg"===w.nodeName.toLowerCase();_._l={},_.on=function(e,t){this._l[e]||(this._l[e]=[]),this._l[e].push(t),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},_._trigger=function(e,t){if(this._l[e]){var n=this._l[e];setTimeout(function(){var e,r;for(e=0;e<n.length;e++)(r=n[e])(t)},0),delete this._l[e]}},Modernizr._q.push(function(){_.addTest=s});j||!function(e,t){function n(e,t){var n=e.createElement("p"),r=e.getElementsByTagName("head")[0]||e.documentElement;return n.innerHTML="x<style>"+t+"</style>",r.insertBefore(n.lastChild,r.firstChild)}function r(){var e=C.elements;return"string"==typeof e?e.split(" "):e}function o(e,t){var n=C.elements;"string"!=typeof n&&(n=n.join(" ")),"string"!=typeof e&&(e=e.join(" ")),C.elements=n+" "+e,f(t)}function i(e){var t=y[e[g]];return t||(t={},v++,e[g]=v,y[v]=t),t}function a(e,n,r){if(n||(n=t),c)return n.createElement(e);r||(r=i(n));var o;return o=r.cache[e]?r.cache[e].cloneNode():h.test(e)?(r.cache[e]=r.createElem(e)).cloneNode():r.createElem(e),!o.canHaveChildren||m.test(e)||o.tagUrn?o:r.frag.appendChild(o)}function s(e,n){if(e||(e=t),c)return e.createDocumentFragment();n=n||i(e);for(var o=n.frag.cloneNode(),a=0,s=r(),l=s.length;l>a;a++)o.createElement(s[a]);return o}function l(e,t){t.cache||(t.cache={},t.createElem=e.createElement,t.createFrag=e.createDocumentFragment,t.frag=t.createFrag()),e.createElement=function(n){return C.shivMethods?a(n,e,t):t.createElem(n)},e.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+r().join().replace(/[\w\-:]+/g,function(e){return t.createElem(e),t.frag.createElement(e),'c("'+e+'")'})+");return n}")(C,t.frag)}function f(e){e||(e=t);var r=i(e);return!C.shivCSS||u||r.hasCSS||(r.hasCSS=!!n(e,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),c||l(e,r),e}var u,c,d="3.7.3",p=e.html5||{},m=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,h=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g="_html5shiv",v=0,y={};!function(){try{var e=t.createElement("a");e.innerHTML="<xyz></xyz>",u="hidden"in e,c=1==e.childNodes.length||function(){t.createElement("a");var e=t.createDocumentFragment();return"undefined"==typeof e.cloneNode||"undefined"==typeof e.createDocumentFragment||"undefined"==typeof e.createElement}()}catch(n){u=!0,c=!0}}();var C={elements:p.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",version:d,shivCSS:p.shivCSS!==!1,supportsUnknownElements:c,shivMethods:p.shivMethods!==!1,type:"default",shivDocument:f,createElement:a,createDocumentFragment:s,addElements:o};e.html5=C,f(t),"object"==typeof module&&module.exports&&(module.exports=C)}("undefined"!=typeof e?e:this,t);var k=_._config.usePrefixes?x.split(" "):[];_._cssomPrefixes=k;var z=function(t){var r,o=S.length,i=e.CSSRule;if("undefined"==typeof i)return n;if(!t)return!1;if(t=t.replace(/^@/,""),r=t.replace(/-/g,"_").toUpperCase()+"_RULE",r in i)return"@"+t;for(var a=0;o>a;a++){var s=S[a],l=s.toUpperCase()+"_"+r;if(l in i)return"@-"+s.toLowerCase()+"-"+t}return!1};_.atRule=z;var F=_.testStyles=c,L={elem:f("modernizr")};Modernizr._q.push(function(){delete L.elem});var M={style:L.elem.style};Modernizr._q.unshift(function(){delete M.style});_.testProp=function(e,t,r){return g([e],n,t,r)};_.testAllProps=v;_.prefixed=function(e,t,n){return 0===e.indexOf("@")?z(e):(-1!=e.indexOf("-")&&(e=i(e)),t?v(e,t,n):v(e,"pfx"))};_.testAllProps=y,Modernizr.addTest("csstransforms3d",function(){var e=!!y("perspective","1px",!0),t=Modernizr._config.usePrefixes;if(e&&(!t||"webkitPerspective"in w.style)){var n,r="#modernizr{width:0;height:0}";Modernizr.supports?n="@supports (perspective: 1px)":(n="@media (transform-3d)",t&&(n+=",(-webkit-transform-3d)")),n+="{#modernizr{width:7px;height:18px;margin:0;padding:0;border:0}}",F(r+n,function(t){e=7===t.offsetWidth&&18===t.offsetHeight})}return e}),o(),a(N),delete _.addTest,delete _.addAsyncTest;for(var O=0;O<Modernizr._q.length;O++)Modernizr._q[O]();e.Modernizr=Modernizr}(window,document);

Modernizr.addTest('csstransformspreserve3d', function () {
    var prop = Modernizr.prefixed('transformStyle');
    var val = 'preserve-3d';
    var computedStyle;
    if(!prop) return false;
    prop = prop.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');
    Modernizr.testStyles('#modernizr{' + prop + ':' + val + ';}', function (el, rule) {
        if(window.getComputedStyle){
            computedStyle = getComputedStyle(el, null);
            if(computedStyle) {
                computedStyle = computedStyle.getPropertyValue(prop);
            }else{
                computedStyle = '';
            }
        }else{
            computedStyle = '';
        }
    });
    return (computedStyle === val);
});

window.nModernizr = window.Modernizr;

if(tmpModernizr) window.Modernizr = tmpModernizr;
N2D('RAF', function () {

    // http://stackoverflow.com/questions/3954438/remove-item-from-array-by-value
    var N2ArrayRemove = function (arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax = arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    };

    function RAF() {
        this._isTicking = false;
        this._isMobile = false;
        this._lastTick = 0;
        this._ticks = [];
        this._postTickCallbacks = [];


        /* rAF shim. Gist: https://gist.github.com/julianshapiro/9497513 */
        var rAFShim = (function () {
            var timeLast = 0;

            return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
                var timeCurrent = (new Date()).getTime(),
                    timeDelta;

                /* Dynamically set delay on a per-tick basis to match 60fps. */
                /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
                timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
                timeLast = timeCurrent + timeDelta;

                return setTimeout(function () {
                    callback(timeCurrent + timeDelta);
                }, timeDelta);
            };
        })();

        /* Ticker function. */
        this._raf = window.requestAnimationFrame || rAFShim;

        var _this = this;
        /* Inactive browser tabs pause rAF, which results in all active animations immediately sprinting to their completion states when the tab refocuses.
         To get around this, we dynamically switch rAF to setTimeout (which the browser *doesn't* pause) when the tab loses focus. We skip this for mobile
         devices to avoid wasting battery power on inactive tabs. */
        /* Note: Tab focus detection doesn't work on older versions of IE, but that's okay since they don't support rAF to begin with. */
        if (!this._isMobile && document.hidden !== undefined) {
            document.addEventListener("visibilitychange", function () {
                /* Reassign the rAF function (which the global tick() function uses) based on the tab's focus state. */
                if (document.hidden) {
                    this._raf = function (callback) {
                        /* The tick function needs a truthy first argument in order to pass its internal timestamp check. */
                        return setTimeout(function () {
                            callback(_this.now());
                        }, 16);
                    };

                    /* The rAF loop has been paused by the browser, so we manually restart the tick. */
                    _this._tick(_this.now());
                } else {
                    _this._raf = window.requestAnimationFrame || rAFShim;
                }
            });
        }
    }

    RAF.prototype.addTick = function (callback) {
        if (this._ticks.indexOf(callback) == -1) {
            this._ticks.push(callback);
        }
        if (!this._isTicking) {
            this._isTicking = true;
            this._raf.call(null, this.getTickStart());
        }
    };

    RAF.prototype.removeTick = function (callback) {
        N2ArrayRemove(this._ticks, callback);

        if (this._ticks.length === 0 && this._isTicking) {
            this._lastTick = 0;
            this._isTicking = false;
        }
    };

    RAF.prototype._tickStart = function (time) {
        this._lastTick = time;
        //this._tick(time);

        if (this._isTicking) {
            this._lastTick = time;
            this._raf.call(null, this.getTick());
        }
    };


    RAF.prototype._tick = function (time) {
        var delta = (time - this._lastTick) / 1000;
        if (delta != 0) {
            for (var i = 0; i < this._ticks.length; i++) {
                this._ticks[i].call(null, delta);
            }

            this.postTick();
        }
        this._continueTick(time);
    };

    RAF.prototype._continueTick = function (time) {

        if (this._isTicking) {
            this._lastTick = time;
            this._raf.call(null, this.getTick());
        }
    };

    RAF.prototype.getTick = function () {
        var that = this;
        return function () {
            that._tick.apply(that, arguments);
        };
    };

    RAF.prototype.getTickStart = function () {
        var that = this;
        return function () {
            that._tickStart.apply(that, arguments);
        };
    };

    RAF.prototype.now = function () {
        return performance.now();
    };

    RAF.prototype.postTick = function () {
        for (var i = 0; i < this._postTickCallbacks.length; i++) {
            this._postTickCallbacks[i]();
        }
        this._postTickCallbacks = [];
    };

    RAF.prototype.addPostTick = function (callback) {
        this._postTickCallbacks.push(callback);
    };

    return new RAF();
});
N2D('Animation', 'RAF', function () {

    /**
     * @memberOf N2Classes
     *
     * @param toParams
     * @constructor
     */
    function Animation(toParams) {
        this._tickCallback = null;
        this._progress = 0;
        this._delayTimeout = false;
        this._delay = 0;
        this._duration = 4;
        this._timeScale = 1.0;
        this._isPlaying = false;
        this._startTime = 0;
        this._eventCallbacks = {};
        this._immediateRender = true;
        this._timeline = null;
        this._isCompleted = false;
        this._isStarted = false;
        this._isReversed = false;

        this.toParams = toParams;

        this.initParameters()
    }

    Animation.prototype.initParameters = function () {
        this.parseParameters(this.toParams);

        if (typeof this.toParams !== 'object') {
            this.paused(false);
        }
    };

    Animation.prototype.parseParameters = function (params) {
        if (params) {
            if (params.delay) {
                this.delay(params.delay);
                delete params.delay;
            }
            if (typeof params.duration !== 'undefined') {
                this.duration(params.duration);
                delete params.duration;
            }
            if (params.onComplete) {
                this.eventCallback('onComplete', params.onComplete);
                delete params.onComplete;
            }
            if (params.onStart) {
                this.eventCallback('onStart', params.onStart);
                delete params.onStart;
            }
            if (params.onUpdate) {
                this.eventCallback('onUpdate', params.onUpdate);
                delete params.onUpdate;
            }
            if (params.immediateRender) {
                this._immediateRender = params.immediateRender;
                delete params.immediateRender;
            }
            if (params.paused) {
                this.paused(true);
            }
        }
    };

    Animation.prototype.setTimeline = function (timeline) {
        this._timeline = timeline;
    };

    Animation.prototype._tick = function (delta) {
        var pr = this._progress;
        if (!this._isReversed) {
            this._progress += delta / this._duration * this._timeScale;
            if (pr == 0 || !this._isStarted) {
                this._onStart();
            } else {
                if (this._progress >= 1) {
                    this._progress = 1;
                    this._isPlaying = false;
                    N2Classes.RAF.removeTick(this.getTickCallback());
                    this._onUpdate();
                    this._onComplete();
                } else {
                    this._onUpdate();
                }
            }
        } else {
            this._progress -= delta / this._duration * this._timeScale;
            if (pr == 1 || !this._isStarted) {
                this._onReverseStart();
            } else {
                if (this._progress <= 0) {
                    this._progress = 0;
                    this._isPlaying = false;
                    N2Classes.RAF.removeTick(this.getTickCallback());
                    this._onUpdate();
                    this._onReverseComplete();
                } else {
                    this._onUpdate();
                }
            }
        }
    };

    Animation.prototype._onStart = function () {
        this._isStarted = true;
        this._isPlaying = false;
        this._isCompleted = false;
        this.trigger('onStart');
        this._onUpdate();
    };

    Animation.prototype._onUpdate = function () {

        this.trigger('onUpdate');
    };

    Animation.prototype._onComplete = function () {
        this._isCompleted = true;
        this._onUpdate();
        this.trigger('onComplete');
    };

    Animation.prototype._onReverseComplete = function () {
        this._isCompleted = true;
        this._isReversed = false;
        this._onUpdate();
        this.trigger('onReverseComplete');
    };

    Animation.prototype._onReverseStart = function () {
        this._isStarted = true;
        this._isPlaying = false;
        this._isCompleted = false;
        this.trigger('onReverseStart');
        this._onUpdate();
    };

    Animation.prototype.getTickCallback = function () {
        if (!this._tickCallback) {
            var that = this;
            this._tickCallback = function () {
                that._tick.apply(that, arguments);
            };
        }
        return this._tickCallback;
    };

    Animation.prototype._clearDelayTimeout = function () {
        if (this._delayTimeout) {
            clearTimeout(this._delayTimeout);
            this._delayTimeout = false;
        }
    };

    Animation.prototype._timeToProgress = function (time) {
        return time / this._duration * this._timeScale;
    };


    Animation.prototype.delay = function () {
        if (arguments.length > 0) {
            var delay = parseFloat(arguments[0]);
            if (isNaN(delay) || delay == Infinity || !delay) {
                delay = 0;
            }
            this._delay = Math.max(0, delay);
            return this;
        }
        return this._delay;
    };

    Animation.prototype.duration = function () {
        if (arguments.length > 0) {
            var duration = parseFloat(arguments[0]);
            if (isNaN(duration) || duration == Infinity || !duration) {
                duration = 0;
            }
            this._duration = Math.max(0, duration);
            return this;
        }
        return this._duration;
    };

    Animation.prototype.eventCallback = function (type) {
        if (arguments.length > 3) {
            this._eventCallbacks[type] = [arguments[1], arguments[2], arguments[3]];
        } else if (arguments.length > 2) {
            this._eventCallbacks[type] = [arguments[1], arguments[2], this];
        } else if (arguments.length > 1) {
            this._eventCallbacks[type] = [arguments[1], [], this];
        }
        return this._eventCallbacks[type];
    };

    Animation.prototype.pause = function () {
        this._isPlaying = false;
        N2Classes.RAF.removeTick(this.getTickCallback());
        if (arguments.length > 0) {
            if (arguments[0] != null) {
                this.progress(this._timeToProgress(arguments[0]));
            }
        }
        return this;
    };

    Animation.prototype.paused = function () {
        if (arguments.length > 0) {
            if (arguments[0]) {
                if (this._isPlaying) {
                    this.pause();
                }
            } else {
                if (!this._isPlaying) {
                    this.play();
                }
            }
            return this;
        }
        return !this._isPlaying;
    };

    Animation.prototype.play = function () {
        var startDelay = true;
        if (arguments.length > 0) {
            if (arguments[0] != null) {
                startDelay = false;
                this._progress = this._timeToProgress(arguments[0]);
            }
        }

        this._play(startDelay);
    };

    Animation.prototype._play = function (startDelay) {

        if (this._progress < 1) {
            if (this._progress == 0 && startDelay && this._delay > 0) {
                if (!this._delayTimeout) {
                    var that = this;
                    this._delayTimeout = setTimeout(function () {
                        that.__play.apply(that, arguments);
                    }, this._delay * 1000);
                }
            } else {
                this.__play();
            }
        } else if (!this._isCompleted) {
            if (!this._isReversed) {
                this._onComplete();
            } else {
                this._onReverseComplete();
            }
        }
    };

    Animation.prototype.__play = function () {
        this._clearDelayTimeout();
        if (!this._isPlaying) {
            //this.getTickCallback().call(this, 0);
            N2Classes.RAF.addTick(this.getTickCallback());
            this._isPlaying = true;
        }
    };

    Animation.prototype.progress = function () {
        if (arguments.length > 0) {
            var progress = parseFloat(arguments[0]);
            if (isNaN(progress)) {
                progress = 0;
            }
            progress = Math.min(1, Math.max(0, progress));

            if (1 || this._progress != progress) {
                this._progress = progress;
                if (!this._isPlaying) {
                    if (!this._isStarted) {
                        this._onStart();
                    }
                    this._onUpdate();
                }
            }
            return this;
        }
        return this._progress;
    };

    Animation.prototype.reverse = function () {
        this._isReversed = true;
        if (this.progress() != 0) {
            this.play();
        }
    };

    Animation.prototype.restart = function () {
        if (arguments.length > 0) {
            if (arguments[0]) {
                // restart with delay
                this.pause(0);
                this.play();
                return this;
            }
        }
        this.play(0);
        return this;
    };

    Animation.prototype.seek = function (time) {
        if (time != null) {
            this._progress = this._timeToProgress(arguments[0]);
            if (!this._isPlaying) {
                this._onUpdate();
            }
        }
    };

    Animation.prototype.startTime = function () {
        if (arguments.length > 0) {
            var startTime = parseFloat(arguments[0]);
            if (isNaN(startTime)) {
                startTime = 0;
            }
            this._startTime = Math.max(0, startTime);
            return this;
        }
        return this._startTime;
    };

    Animation.prototype.timeScale = function () {
        if (arguments.length > 0) {
            var timeScale = parseFloat(arguments[0]);
            if (isNaN(timeScale)) {
                timeScale = 1;
            }
            timeScale = Math.max(0.01, timeScale);

            if (this._timeScale != timeScale) {
                this._timeScale = timeScale;
            }
            return this;
        }
        return this._timeScale;
    };

    Animation.prototype.trigger = function (type) {
        if (typeof this._eventCallbacks[type] == 'object') {
            this._eventCallbacks[type][0].apply(this._eventCallbacks[type][2], this._eventCallbacks[type][1]);
        }
    };

    Animation.prototype.totalDuration = function () {
        if (arguments.length > 0) {
            var totalDuration = parseFloat(arguments[0]);
            if (isNaN(totalDuration)) {
                totalDuration = 0;
            }
            totalDuration = Math.max(0, totalDuration);

            this.timeScale(this._duration / totalDuration);
            return this;
        }

        return this._duration * this._timeScale;
    };

    Animation.prototype.reset = function () {
        this._isCompleted = false;
        this._isStarted = false;
        this.progress(0);
    };

    return Animation;
});
N2D('AnimationCSS', 'RAF', function ($) {

    var hookProperties = {},
        isFunction = function (arg) {
            return typeof arg === 'function';
        },
        isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function AnimationCSS() {
    }

    AnimationCSS.prototype.set = function (elements, property, value, unit) {

        if (!elements.length) {
            elements = [elements];
        }

		    value = value + unit;

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

			      this.applyStyles(element, property, value);
        }
    };

    AnimationCSS.prototype.applyStyles = function (element, property, value) {
    	 var styles = {};
    		styles[property] = value;
    		if (typeof hookProperties[property] !== 'undefined') {
    			hookProperties[property](element).prepare(styles);
    		}
    
    		for (var prop in styles) {
    			var prefixed = nModernizr.prefixed(prop);
    			if (prefixed) {
    				element.style[prefixed] = styles[prop];
    			}
    		}
    };

    AnimationCSS.prototype.makeTransitionData = function (element, property, startValue, endValue) {
        var unit, unitFrom, unitTo, separatedStartValue, separatedEndValue;
        if (property.match(/transformOrigin|perspective/)) {
            if (endValue) {
                return {
                    startValue: endValue,
                    endValue: endValue,
                    unit: '',
                    range: 0
                }
            } else if (startValue) {
                return {
                    startValue: startValue,
                    endValue: startValue,
                    unit: '',
                    range: 0
                }
            }
        }

        if (typeof startValue === 'undefined') {
            startValue = this.getProperty(element, property);
        }
        separatedStartValue = this.separateValue(property, startValue);
        startValue = separatedStartValue[0];
        unitFrom = separatedStartValue[1];


        if (typeof endValue === 'undefined') {
            endValue = this.getProperty(element, property);
        }
        separatedEndValue = this.separateValue(property, endValue);
        endValue = separatedEndValue[0];
        unitTo = separatedEndValue[1];

        unit = unitTo || unitFrom;

        if (unitTo != unit) {
            endValue = this.transformUnit(element, property, endValue, unitTo, unit);
        }

        if (unitFrom != unit) {
            startValue = this.transformUnit(element, property, startValue, unitFrom, unit);
        }

        return {
            startValue: startValue,
            endValue: endValue,
            unit: unit,
            range: endValue - startValue
        }
    };

    AnimationCSS.prototype.getProperty = function (element, property) {
        if (typeof hookProperties[property] !== 'undefined') {
            return hookProperties[property](element).get(property);
        }
        var prefixed = nModernizr.prefixed(property);
        if (prefixed) {
            var value = $(element).css(property);
            if (value == 'auto') {
                return 0;
            }
            return value;
        }

    }

    AnimationCSS.prototype.transformUnit = function (element, property, value, startUnit, endUnit) {
        if (value == 0) {
            return 0;
        }
        var parentProperty = '';
        switch (property) {
            case 'left':
            case 'right':
                parentProperty = 'width';
                break;
            case 'top':
            case 'bottom':
                parentProperty = 'height';
                break;
            default:
                parentProperty = property;
        }
        if (startUnit == 'px' && endUnit == '%') {
            var parentValue = this.getProperty(element.parent(), parentProperty),
                separatedParentValue = this.separateValue(parentProperty, parentValue);
            return value / separatedParentValue[0] * 100;
        } else if (startUnit == '%' && endUnit == 'px') {
            var parentValue = this.getProperty(element.parent(), parentProperty),
                separatedParentValue = this.separateValue(parentProperty, parentValue);
            return value / 100 * separatedParentValue[0];
        }
        return value;
    }

    AnimationCSS.prototype.parsePropertyValue = function (element, valueData) {
        var endValue = undefined,
            startValue = undefined;

        /* Handle the array format, which can be structured as one of three potential overloads:
         A) [ endValue, easing, startValue ], B) [ endValue, easing ], or C) [ endValue, startValue ] */
        if (isArray(valueData)) {
            /* endValue is always the first item in the array. Don't bother validating endValue's value now
             since the ensuing property cycling logic does that. */
            endValue = valueData[0];
            startValue = valueData[1];
            /* Handle the single-value format. */
        } else {
            endValue = valueData;
        }

        /* If functions were passed in as values, pass the function the current element as its context,
         plus the element's index and the element set's size as arguments. Then, assign the returned value. */
        if (isFunction(endValue)) {
            endValue = endValue.call(element);
        }

        if (isFunction(startValue)) {
            startValue = startValue.call(element);
        }
        /* Allow startValue to be left as undefined to indicate to the ensuing code that its value was not forcefed. */
        return [endValue || 0, startValue];
    };

    AnimationCSS.prototype.separateValue = function (property, value) {
        var unitType,
            numericValue;

        numericValue = (value || "0")
            .toString()
            .toLowerCase()
            /* Match the unit type at the end of the value. */
            .replace(/[%A-z]+$/, function (match) {
                /* Grab the unit type. */
                unitType = match;

                /* Strip the unit type off of value. */
                return "";
            });
        /* If no unit type was supplied, assign one that is appropriate for this property (e.g. "deg" for rotateZ or "px" for width). */
        if (!unitType) {
            unitType = this.getUnitType(property);
        }

        return [parseFloat(numericValue), unitType];
    };

    AnimationCSS.prototype.getUnitType = function (property) {
        if (/(^(x|y|z|rotationX|rotationY|rotationZ|scale|scaleX|scaleY|opacity)$)/i.test(property)) {
            /* The above properties are unitless. */
            return "";
        } else {
            /* Default to px for all other properties. */
            return "px";
        }
    };

    function getTransformObject(element) {
        if (!element.n2Transform) {
            element.n2Transform = new Transform();
        }
        return element.n2Transform;
    }

	  hookProperties['transform'] = getTransformObject;
    hookProperties['x'] = getTransformObject;
    hookProperties['y'] = getTransformObject;
    hookProperties['z'] = getTransformObject;
    hookProperties['rotationX'] = getTransformObject;
    hookProperties['rotationY'] = getTransformObject;
    hookProperties['rotationZ'] = getTransformObject;
    hookProperties['scale'] = getTransformObject;
    hookProperties['scaleX'] = getTransformObject;
    hookProperties['scaleY'] = getTransformObject;
    hookProperties['scaleZ'] = getTransformObject;
    
    var defaultTransformData = {
    		x: 0,
    		y: 0,
    		z: 0,
    		rotationX: 0,
    		rotationY: 0,
    		rotationZ: 0,
    		scaleX: 1,
    		scaleY: 1,
    		scaleZ: 1,
    		scale: 1
  	};

    function Transform(element) {
        this.data = $.extend({}, defaultTransformData);
    }

    Transform.prototype.get = function (property) {
        return this.data[property];
    };


    var rad = Math.PI / 180;
    Transform.prototype.prepare = function (styles) {
    		
        if(typeof styles.transform !== 'undefined' && styles.transform === 'none'){
    			this.data = $.extend({}, defaultTransformData);
    		}

        if (typeof styles['scale'] !== 'undefined') {
            styles['scaleX'] = styles['scale'];
            styles['scaleY'] = styles['scale'];
            delete styles['scale'];
        }

        for (var k in this.data) {
            if (typeof styles[k] !== 'undefined') {
                this.data[k] = styles[k];
                delete styles[k];
            }
        }

        this.data['scale'] = this.data['scaleX'];

        styles['transform'] = this.matrix3d(this.data.x, this.data.y, this.data.z, this.data.scaleX, this.data.scaleY, this.data.rotationX, this.data.rotationY, this.data.rotationZ);

        return styles;
    };


    Transform.prototype.matrix3d = function (x, y, z, scaleX, scaleY, rotateX, rotateY, rotateZ) {
        var Y = Math.cos(rotateX * rad),
            Z = Math.sin(rotateX * rad),
            b = Math.cos(rotateY * rad),
            F = Math.sin(rotateY * rad),
            I = Math.cos(rotateZ * rad),
            P = Math.sin(rotateZ * rad);

        var a = new Array(16);

        a[0] = b * I * scaleX;
        a[1] = P;
        a[2] = F;
        a[3] = 0;
        a[4] = -1 * P;
        a[5] = Y * I * scaleY;
        a[6] = Z;
        a[7] = 0;
        a[8] = -1 * F;
        a[9] = -1 * Z;
        a[10] = b * Y;
        a[11] = 0;
        a[12] = x;
        a[13] = y;
        a[14] = z;
        a[15] = 1;
        return "matrix3d(" + a[0] + "," + a[1] + "," + a[2] + "," + a[3] + "," + a[4] + "," + a[5] + "," + a[6] + "," + a[7] + "," + a[8] + "," + a[9] + "," + a[10] + "," + a[11] + "," + a[12] + "," + a[13] + "," + a[14] + "," + a[15] + ")";
    };

    return new AnimationCSS();
});
N2D('Tween', 'RAF', function ($) {
    var MODE = {
        FROM: 1,
        FROMTO: 2,
        TO: 3
    };

    /**
     * @memberOf N2Classes
     *
     * @param target
     * @param duration
     * @constructor
     */
    function Tween(target, duration) {
        this.ease = 'linear';
        this._tweenContainer = null;
        this._setContainer = null;
        var fromParams = null, toParams;
        switch (arguments.length) {
            case 4:
                fromParams = $.extend(true, {}, arguments[2]);
                toParams = arguments[3];
                if (!toParams) {
                    this._mode = MODE.FROM;
                } else {
                    this._mode = MODE.FROMTO;
                    toParams = $.extend(true, {}, toParams);
                }
                break;
            default:
                this._mode = MODE.TO;
                fromParams = {};
                toParams = $.extend(true, {}, arguments[2]);
        }

        this._target = $(target);

        this.fromParams = fromParams;

        N2Classes.Animation.call(this, toParams);

        this.parseParameters({
            duration: duration
        });

        if ((this._mode == MODE.FROM || this._mode == MODE.FROMTO) && this._immediateRender) {
            if (this._tweenContainer === null) {
                this._makeTweenContainer(this.fromParams, this.toParams);
            }
            for (var k in this._tweenContainer) {
                var tween = this._tweenContainer[k];
                N2Classes.AnimationCSS.set(this._target, k, tween.startValue, tween.unit);
            }
            for (var k in this._setContainer) {
                var tween = this._setContainer[k];
                N2Classes.AnimationCSS.set(this._target, k, tween.endValue, tween.unit);
            }
        }
    }

    Tween.prototype = Object.create(N2Classes.Animation.prototype);
    Tween.prototype.constructor = Tween;

    Tween.prototype.initParameters = function () {

        this.parseParameters(this.fromParams);

        N2Classes.Animation.prototype.initParameters.apply(this, arguments);
    };

    Tween.prototype.parseParameters = function (params) {
        if (params) {
            if (params.ease) {
                this.ease = params.ease;
                delete params.ease;
            }

            N2Classes.Animation.prototype.parseParameters.apply(this, arguments);
        }
    };

    Tween.prototype._onStart = function () {
        if (this._tweenContainer === null) {
            this._makeTweenContainer(this.fromParams, this.toParams);
        }

        for (var k in this._setContainer) {
            var tween = this._setContainer[k];
            N2Classes.AnimationCSS.set(this._target, k, tween.endValue, tween.unit);
        }

        N2Classes.Animation.prototype._onStart.call(this);
    };

    Tween.prototype._onUpdate = function () {
        for (var k in this._tweenContainer) {
            var tween = this._tweenContainer[k];
            N2Classes.AnimationCSS.set(this._target, k, N2Classes.Easings[this.ease](this._progress, tween.startValue, tween.range * this._progress, 1), tween.unit);
        }
        N2Classes.Animation.prototype._onUpdate.call(this);
    };

    Tween.prototype._makeTweenContainer = function (from, to) {
        this._setContainer = {};
        this._tweenContainer = {};
        if (to) {
            for (var k  in to) {
                var container = N2Classes.AnimationCSS.makeTransitionData(this._target, k, from[k], to[k]);
                if (container.range == 0) {
                    this._setContainer[k] = container;
                } else {
                    this._tweenContainer[k] = container;
                }
            }
        } else {
            for (var k  in from) {
                var container = N2Classes.AnimationCSS.makeTransitionData(this._target, k, from[k]);
                if (container.range == 0) {
                    this._setContainer[k] = container;
                } else {
                    this._tweenContainer[k] = container;
                }
            }
        }
    };

    Tween.set = function (element, to) {
        for (var k in to) {
            N2Classes.AnimationCSS.set($(element), k, to[k], '');
        }
    };

    Tween.to = function (element, duration, to) {
        var tween = new Tween(element, duration, to);
        if (to.paused === undefined || !to.paused) {
            tween.play();
        }
        return tween;
    };

    Tween.fromTo = function (element, duration, from, to) {
        var tween = new Tween(element, duration, from, to);
        if (to.paused === undefined || !to.paused) {
            tween.play();
        }
        return tween;
    };

    Tween.from = function (element, duration, from) {
        var tween = new Tween(element, duration, from, null);
        if (from.paused === undefined || !from.paused) {
            tween.play();
        }
        return tween;
    };

    window.NextendTween = Tween;

    return Tween;
});
N2D('Timeline', 'RAF', function ($) {

    /**
     * @memberOf N2Classes
     *
     * @param params
     * @constructor
     */
    function Timeline(params) {
        this.originalParams = $.extend(true, {}, params);
        this._tweens = [];
        N2Classes.Animation.call(this, params);
        this._duration = 0;
    }

    Timeline.prototype = Object.create(N2Classes.Animation.prototype);
    Timeline.prototype.constructor = Timeline;

    Timeline.prototype._onUpdate = function () {
        if (this.tweensContainer) {

            for (var i = 0; i < this.tweensContainer.length; i++) {
                var tweenContainer = this.tweensContainer[i];
                var currentProgress = Math.min(1, (this._progress - tweenContainer.startProgress) / (tweenContainer.endProgress - tweenContainer.startProgress));
                if (tweenContainer.tween._isCompleted && currentProgress <= tweenContainer.endProgress) {
                    tweenContainer.tween.reset();
                }

                if (!tweenContainer.tween._isStarted && currentProgress >= 0 && tweenContainer.tween.progress() == 0) {
                    tweenContainer.tween._onStart();
                }
                if (tweenContainer.tween._isStarted) {
                    if (currentProgress == 1 && !tweenContainer.tween._isCompleted) {
                        tweenContainer.tween.progress(currentProgress);
                        tweenContainer.tween._onComplete();
                    } else if (currentProgress >= 0 && currentProgress < 1) {
                        tweenContainer.tween.progress(currentProgress);
                    } else if (currentProgress < 0 && tweenContainer.tween.progress() != 0) {
                        tweenContainer.tween.progress(0);
                    }
                }
            }
        }
        N2Classes.Animation.prototype._onUpdate.call(this);
        if (!N2Classes.RAF._isTicking) {
            N2Classes.RAF.postTick();
        }
    };

    Timeline.prototype.addTween = function (tween) {
        tween.pause();
        tween.setTimeline(this);
        var position = 0;
        if (arguments.length > 1) {
            position = this._parsePosition(arguments[1]);
        } else {
            position = this._parsePosition();
        }

        var delay = tween.delay();
        if (delay > 0) {
            position += delay;
            tween.delay(0);
        }

        tween.startTime(position);
        this._tweens.push(tween);
        var duration = tween.totalDuration() + position;
        if (duration > this._duration) {
            this._duration = duration;
        }
        this.makeCache();
    };

    Timeline.prototype.clear = function () {
        if (!this.paused()) {
            this.pause();
        }
        Timeline.call(this, this.originalParams);
    };

    Timeline.prototype.add = function (tween, position) {
        this.addTween(tween, position);
    };

    Timeline.prototype.set = function (element, to, position) {
        this.addTween(NextendTween.to(element, 0.05, to), position);
    };

    Timeline.prototype.to = function (element, duration, to, position) {
        to.paused = true;
        this.addTween(NextendTween.to(element, duration, to), position);
    };

    Timeline.prototype.fromTo = function (element, duration, from, to, position) {
        to.paused = true;
        this.addTween(NextendTween.fromTo(element, duration, from, to), position);
    };

    Timeline.prototype.from = function (element, duration, from, position) {
        from.paused = true;
        this.addTween(NextendTween.from(element, duration, from), position);
    };

    Timeline.prototype._play = function () {
        if (this._progress == 0) {

            for (var i = 0; i < this._tweens.length; i++) {
                this._tweens[i].pause(0);

            }
        }
        N2Classes.Animation.prototype._play.apply(this, arguments);
    };

    Timeline.prototype._parsePosition = function () {
        var positionString = '+=0';
        if (arguments.length > 0 && typeof arguments[0] !== 'undefined' && !isNaN(arguments[0])) {
            positionString = arguments[0];
        }
        var position = 0;

        switch (typeof positionString) {
            case 'string':
                switch (positionString.substr(0, 2)) {
                    case'+=':
                        position = this.duration() + parseFloat(positionString.substr(2));
                        break;
                    case'-=':
                        position = this.duration() - parseFloat(positionString.substr(2));
                        break;
                }
                break;
            default:
                position = parseFloat(positionString);
        }

        return Math.max(0, position);
    };

    Timeline.prototype.makeCache = function () {
        var totalDuration = this.totalDuration();
        this.tweensContainer = [];
        for (var i = 0; i < this._tweens.length; i++) {
            var tween = this._tweens[i];

            var startProgress = tween.startTime() / totalDuration,
                endProgress = (tween.startTime() + tween.totalDuration()) / totalDuration;
            this.tweensContainer.push({
                tween: tween,
                startProgress: startProgress,
                endProgress: endProgress,
                range: endProgress - startProgress
            });
        }
    };

    window.NextendTimeline = Timeline;

    return Timeline;
});
/*
 * jQuery Easing v1.3.2 - http://gsgd.co.uk/sandbox/jquery/easing/
 * Open source under the BSD License.
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/gdsmith/jquery-easing/master/LICENSE
 */

// t: current time, b: beginning value, c: change In value, d: duration
N2D('Easings', 'RAF', function () {

    /**
     * @memberOf N2Classes
     */
    var easings = {
        linear: function (t, b, c, d) {
            return c + b;
        },
        easeInQuad: function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function (t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function (t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function (t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function (t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function (t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeInBounce: function (t, b, c, d) {
            return c - N2Classes.Easing.easeOutBounce(d - t, 0, c, d) + b;
        },
        easeOutBounce: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        easeInOutBounce: function (t, b, c, d) {
            if (t < d / 2) return N2Classes.Easing.easeInBounce(t * 2, 0, c, d) * .5 + b;
            return N2Classes.Easing.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    };
    return easings;
});

N2D('nextend-frontend')