if (typeof window.n2SSIframeLoader !== "function") {
    if (typeof window.jQuery === 'undefined' && typeof window.parent !== 'undefined') {
        window.jQuery = window.parent.jQuery;
    }
    (function ($) {
        var frames = [],
            eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        window[eventMethod](eventMethod === "attachEvent" ? "onmessage" : "message", function (e) {
            for (var i = 0; i < frames.length; i++) {
                if (frames[i] && frames[i].match(e.source)) {
                    frames[i].message(e[e.message ? "message" : "data"]);
                }
            }
        });

        function S(frame, i) {
            this.i = i;
            this.frame = frame;
            this.$frame = $(frame);
        }

        S.prototype.match = function (w) {
            if (w === (this.frame.contentWindow || this.frame.contentDocument)) {
                this.frameContent = this.frame.contentWindow || this.frame.contentDocument;
                return true;
            }

            return false;
        };

        S.prototype.message = function (data) {
            switch (data["key"]) {
                case "setLocation":
                    if (typeof window.zajax_goto === 'function') {
                        /**
                         * @url https://wordpress.org/plugins/zajax-ajax-navigation/
                         */
                        window.zajax_goto(data.location);
                    } else {
                        window.location = data.location;
                    }
                    break;
                case "ready":
                    var clientHeight = this.getClientHeight();
                    this.frameContent.postMessage({
                        key: "ackReady",
                        clientHeight: clientHeight
                    }, "*");
                    break;
                case "resize":
                    if (data.fullPage) {
                        if (this.fullpage !== data.fullPage) {
                            this.fullpage = data.fullPage;
                            this.$verticalOffsetSelectors = $(data.focus.offsetTop).add(data.focus.offsetBottom);
                            this.resizeFullPage();
                            $(window).on("resize.n2-ss-iframe-" + this.i, $.proxy(this.resizeFullPage, this));
                            $(window).on("orientationchange.n2-ss-iframe-" + this.i, $.proxy(this.resizeFullPage, this));
                        }
                    } else {
                        this.fullpage = 0;
                    }
                    this.$frame.css({
                        height: data.height
                    });

                    if (data.forceFull && this.forcefull !== data.forceFull) {

                        this.forcefull = data.forceFull;

                        var $container = $('body');
                        $container.css("overflow-x", "hidden");

                        this.$fullWidthTo = $('.edit-post-visual-editor,.fl-responsive-preview .fl-builder-content');

                        this.resizeFullWidth();
                        $(window).on("resize.n2-ss-iframe-" + this.i, $.proxy(this.resizeFullWidth, this));
                        this.watchWidth();
                    }
                    break;
            }
        };

        S.prototype.watchWidth = function () {
            if (this.$fullWidthTo.length) {
                if (window.ResizeObserver !== undefined) {
                    var width = 0;
                    this.observer = new ResizeObserver($.proxy(function (entries) {
                        entries.forEach($.proxy(function (entry) {
                            if (width !== entry.contentRect.width) {
                                width = entry.contentRect.width;
                                this.resizeFullWidth();
                            }
                        }, this));
                    }, this));

                    this.observer.observe(this.$fullWidthTo[0]);
                } else {
                    try {
                        /**
                         * We can detect every width changes with a dummy iframe.
                         */
                        this.$resizeObserverIframe = $('<iframe class="bt_skip_resize" sandbox="allow-same-origin allow-scripts" style="margin:0;padding:0;border:0;display:block;width:100%;height:0;min-height:0;max-height:0px;"/>')
                            .on('load', $.proxy(function (e) {
                                var width = 0,
                                    $frame = $(e.target.contentWindow ? e.target.contentWindow : e.target.contentDocument.defaultView).on('resize', $.proxy(function (e) {
                                        var newWidth = $frame.width();
                                        if (width !== newWidth) {
                                            width = newWidth;
                                            this.resizeFullWidth();
                                        }
                                    }, this));
                            }, this)).appendTo(this.$fullWidthTo[0]);
                    } catch (e) {
                    }
                }
            }
        };

        S.prototype.exists = function () {
            if ($.contains(document.body, this.frame)) {
                return true;
            }

            frames[this.i] = false;
            $(window).off(".n2-ss-iframe-" + this.i);

            if (this.observer) {
                this.observer.unobserve(this.$fullWidthTo[0]);
                delete this.observer;
            }

            if (this.$resizeObserverIframe) {
                this.$resizeObserverIframe.remove();
                delete this.$resizeObserverIframe;
            }

            return false;
        };

        S.prototype.resizeFullWidth = function () {
            if (this.exists()) {
                var customWidth = 0,
                    adjustLeftOffset = 0;
                if (this.$fullWidthTo.length) {
                    customWidth = this.$fullWidthTo.width();
                    adjustLeftOffset = this.$fullWidthTo.offset().left;
                }

                var windowWidth = customWidth > 0 ? customWidth : (document.body.clientWidth || document.documentElement.clientWidth),
                    outerEl = this.$frame.parent(),
                    outerElBoundingRect = outerEl[0].getBoundingClientRect(),
                    outerElOffset,
                    isRTL = $("html").attr("dir") === "rtl";
                if (isRTL) {
                    outerElOffset = windowWidth - (outerElBoundingRect.left + outerEl.outerWidth());
                } else {
                    outerElOffset = outerElBoundingRect.left;
                }
                this.$frame.css(isRTL ? 'marginRight' : 'marginLeft', -outerElOffset - parseInt(outerEl.css('paddingLeft')) - parseInt(outerEl.css('borderLeftWidth')) + adjustLeftOffset)
                    .css("maxWidth", "none")
                    .width(windowWidth);
            }
        };

        S.prototype.resizeFullPage = function (e) {
            if (this.exists()) {
                var clientHeight = this.getClientHeight(e);
                for (var i = 0; i < this.$verticalOffsetSelectors.length; i++) {
                    clientHeight -= this.$verticalOffsetSelectors.eq(i).outerHeight();
                }
                this.frameContent.postMessage({
                    key: "update",
                    clientHeight: clientHeight
                }, "*");
                this.$frame.height(clientHeight);
            }
        };

        S.prototype.getClientHeight = function (e) {
            var document = window.document,
                clientHeight = 0;
            try {
                if (window.parent && window.parent !== window) {
                    document = window.parent.document;
                }
            } catch (e) {
            }
            if (window.matchMedia && (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)) {
                var innerHeight,
                    isOrientationChanged = false,
                    lastOrientation = this.lastOrientation;

                if (e && e.type === 'orientationchange') {
                    isOrientationChanged = true;
                }

                if (/iPad|iPhone|iPod/.test(navigator.platform)) {
                    innerHeight = document.documentElement.clientHeight;
                } else {
                    innerHeight = window.innerHeight;
                }

                if (window.matchMedia("(orientation: landscape)").matches) {
                    clientHeight = Math.min(screen.width, innerHeight);
                    if (lastOrientation !== 90) {
                        isOrientationChanged = true;
                        this.lastOrientation = 90;
                    }
                } else {
                    clientHeight = Math.min(screen.height, innerHeight);
                    if (lastOrientation !== 0) {
                        isOrientationChanged = true;
                        this.lastOrientation = 0;
                    }
                }

                if (!isOrientationChanged && Math.abs(clientHeight - this.lastClientHeight) < 100) {
                    clientHeight = this.lastClientHeight;
                } else {
                    this.lastClientHeight = clientHeight;
                }
            } else {
                clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
            }

            return clientHeight;
        };

        window.n2SSIframeLoader = function (iframe) {
            frames.push(new S(iframe, frames.length));
        }
    })(window.jQuery);
}