N2D('SmartSliderWidgetArrowImage', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param desktopRatio
     * @param tabletRatio
     * @param mobileRatio
     * @constructor
     */
    function SmartSliderWidgetArrowImage(slider, desktopRatio, tabletRatio, mobileRatio) {
        this.slider = slider;

        this.slider.started($.proxy(this.start, this, desktopRatio, tabletRatio, mobileRatio));
    }

    SmartSliderWidgetArrowImage.prototype.start = function (desktopRatio, tabletRatio, mobileRatio) {
        if (this.slider.sliderElement.data('arrow')) {
            return false;
        }
        this.slider.sliderElement.data('arrow', this);

        this.deferred = $.Deferred();

        this.slider.sliderElement
            .on('SliderDevice', $.proxy(this.onDevice, this))
            .trigger('addWidget', this.deferred);

        this.previous = $('#' + this.slider.elementID + '-arrow-previous').on('click', $.proxy(function (e) {
            e.stopPropagation();
            this.slider[n2const.rtl.previous]();
        }, this));

        this.previousResize = this.previous.find('.n2-resize');
        if (this.previousResize.length === 0) {
            this.previousResize = this.previous;
        }

        this.next = $('#' + this.slider.elementID + '-arrow-next').on('click', $.proxy(function (e) {
            e.stopPropagation();
            this.slider[n2const.rtl.next]();
        }, this));

        this.nextResize = this.next.find('.n2-resize');
        if (this.nextResize.length === 0) {
            this.nextResize = this.next;
        }

        this.desktopRatio = desktopRatio;
        this.tabletRatio = tabletRatio;
        this.mobileRatio = mobileRatio;

        $.when(this.previous.n2imagesLoaded(), this.next.n2imagesLoaded()).always($.proxy(this.loaded, this));
    };

    SmartSliderWidgetArrowImage.prototype.loaded = function () {
        this.previous.css('display', 'inline-block');
        this.previousResize.css('display', 'inline-block');
        this.previousWidth = this.previousResize.width();
        this.previousHeight = this.previousResize.height();
        this.previousResize.css('display', '');
        this.previous.css('display', '');

        this.next.css('display', 'inline-block');
        this.nextResize.css('display', 'inline-block');
        this.nextWidth = this.nextResize.width();
        this.nextHeight = this.nextResize.height();
        this.nextResize.css('display', '');
        this.next.css('display', '');

        this.previousResize.find('img').css('width', '100%');
        this.nextResize.find('img').css('width', '100%');

        this.onDevice(null, {device: this.slider.responsive.getDeviceMode()});

        this.deferred.resolve();
    };

    SmartSliderWidgetArrowImage.prototype.onDevice = function (e, device) {
        var ratio = 1;
        switch (device.device) {
            case 'tablet':
                ratio = this.tabletRatio;
                break;
            case 'mobile':
                ratio = this.mobileRatio;
                break;
            default:
                ratio = this.desktopRatio;
        }
        this.previousResize.width(this.previousWidth * ratio);
        this.previousResize.height(this.previousHeight * ratio);
        this.nextResize.width(this.nextWidth * ratio);
        this.nextResize.height(this.nextHeight * ratio);
    };

    return SmartSliderWidgetArrowImage;
});