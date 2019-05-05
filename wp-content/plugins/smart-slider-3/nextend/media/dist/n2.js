(function(){var N=this;N.N2_=N.N2_||{r:[],d:[]},N.N2R=N.N2R||function(){N.N2_.r.push(arguments)},N.N2D=N.N2D||function(){N.N2_.d.push(arguments)}}).call(window);
function N2Deferred() {
    this.state = 0;
    this.args = null;
    this.callbacks = [];
}

N2Deferred.prototype._doCallbacks = function () {
    if (this.state !== 0) {
        while (this.callbacks.length > 0) {
            this.callbacks.shift().apply(window, this.args);
        }
    }
};

N2Deferred.prototype.resolve = function () {
    this.state = 1;
    this.args = arguments;
    this._doCallbacks();
};


N2Deferred.prototype.reject = function () {
    this.state = -1;
    this._doCallbacks();
};

N2Deferred.prototype.then = function (cb) {
    this.callbacks.push(cb);
    this._doCallbacks();
};

/**
 * @param deferreds
 * @returns {N2Deferred}
 */
N2Deferred.n2When = function (deferreds) {
    var length = deferreds.length,
        deferred = new N2Deferred();

    if (length === 0) {
        deferred.resolve();
    } else {
        var done = 0,
            doneCurrent = function () {
                done++;
                if (done === length) {
                    deferred.resolve();
                }
            };
        for (var i = 0; i < length; i++) {
            if (deferreds[i] instanceof N2Deferred) {
                deferreds[i].then(doneCurrent);
            } else {
                doneCurrent();
            }
        }
    }

    return deferred;
};
(function (undefined) {
    "use strict";

    this.N2Classes = {};

    var a = {};

    this.N2D = function (name, dependencies, fn) {
        var deps = [];
        if (name && a[name] === undefined) {
            a[name] = new N2Deferred();
        }

        if (arguments.length === 2) {
            fn = arguments[1];
            dependencies = [];
        } else {
            if (typeof dependencies === 'string') {
                dependencies = [dependencies];
            }
        }

        dependencies = dependencies || [];

        if (name !== '$') {
            dependencies.push('$');
        }
        if (dependencies.length) {
            for (var i = 0; i < dependencies.length; i++) {
                if (a[dependencies[i]] === undefined) {
                    a[dependencies[i]] = new N2Deferred();
                }
                deps.push(a[dependencies[i]]);
            }
        }
        N2Deferred.n2When(deps).then(function () {
            if (typeof fn === 'function') {
                var ret = fn.apply(N2Classes, [N2Classes.$]);
                if (ret instanceof N2Deferred) {
                    ret.then(function (ret) {
                        N2Classes[name] = ret;
                        a[name].resolve();
                    });
                } else {
                    N2Classes[name] = ret;
                    a[name].resolve();
                }
            } else {
                N2Classes[name] = true;
                a[name].resolve();
            }
        });
    };

    for (var i = 0; i < this.N2_.d.length; i++) {
        this.N2D.apply(this, this.N2_.d[i]);
    }

    this.N2R = function (dependencies, fn) {
        var deps = [];

        if (arguments.length === 1) {
            fn = arguments[0];
            dependencies = [];
        } else {
            if (typeof dependencies === 'string') {
                dependencies = [dependencies];
            }
        }

        dependencies = dependencies || [];

        dependencies.push('$');

        if (dependencies !== undefined && dependencies) {
            for (var i = 0; i < dependencies.length; i++) {
                if (a[dependencies[i]] === undefined) {
                    a[dependencies[i]] = new N2Deferred();
                }
                deps.push(a[dependencies[i]]);
            }
        }

        N2Deferred.n2When(deps).then(function () {
            var args = [N2Classes.$];
            for (var i = 0; i < dependencies.length - 1; i++) {
                args.push(N2Classes[dependencies[i]]);
            }
            fn.apply(N2Classes, args);
        });
    };

    for (var j = 0; j < this.N2_.r.length; j++) {
        this.N2R.apply(this, this.N2_.r[j]);
    }
}).call(window);
function NextendThrottle(func, wait) {
    wait || (wait = 250);
    var last,
        deferTimer;
    return function () {
        var context = this,
            now = +new Date,
            args = arguments;
        if (last && now < last + wait) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                func.apply(context, args);
            }, wait);
        } else {
            last = now;
            func.apply(context, args);
        }
    };
}
function NextendDeBounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
(function () {
    var startDate = new Date();
    // Poll to see if jQuery is ready
    var waitForJQuery = function () {
        if (window.nextend && window.jQuery) {
            var $ = window.jQuery;
            N2D('$', function () {
                window.n2 = $; //Backward compatibility
                return $;
            });

            N2R('nextend-frontend', function () {
                $(document).ready(function () {
                    N2D('documentReady');
                });

                if (document.readyState === 'complete') {
                    N2D('windowLoad');
                } else {
                    $(window).on('load', function () {
                        N2D('windowLoad');
                    });
                }
            });
        } else {
            setTimeout(waitForJQuery, 20);

            if ((new Date).getTime() - startDate.getTime() > 1000) {
                var script = document.createElement('script');
                // If there is no jQuery on the page in 1 second, we will load one from CDN
                script.src = "//ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js";
                document.getElementsByTagName('head')[0].appendChild(script);
            }
        }
    };

    waitForJQuery();
})();
//Based on easing equations from Robert Penner (http://www.robertpenner.com/easing)
N2R('$', function ($) {
    var baseEasings = {};

    $.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (i, name) {
        baseEasings[name] = function (p) {
            return Math.pow(p, i + 2);
        };
    });

    $.extend(baseEasings, {
        Sine: function (p) {
            return 1 - Math.cos(p * Math.PI / 2);
        },
        Circ: function (p) {
            return 1 - Math.sqrt(1 - p * p);
        },
        Elastic: function (p) {
            return p === 0 || p === 1 ? p :
                -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
        },
        Back: function (p) {
            return p * p * (3 * p - 2);
        },
        Bounce: function (p) {
            var pow2,
                bounce = 4;

            while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {
            }
            return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
        }
    });

    $.each(baseEasings, function (name, easeIn) {
        $.easing["easeIn" + name] = easeIn;
        $.easing["easeOut" + name] = function (p) {
            return 1 - easeIn(1 - p);
        };
        $.easing["easeInOut" + name] = function (p) {
            return p < 0.5 ?
                easeIn(p * 2) / 2 :
                1 - easeIn(p * -2 + 2) / 2;
        };
    });
});
N2D('n2')