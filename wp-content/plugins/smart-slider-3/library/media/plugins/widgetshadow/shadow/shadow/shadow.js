N2D('SmartSliderWidgetShadow', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param slider
     * @param parameters
     * @constructor
     */
    function SmartSliderWidgetShadow(slider, parameters) {
        this.slider = slider;

        this.slider.started($.proxy(this.start, this, parameters));
    }


    SmartSliderWidgetShadow.prototype.start = function (parameters) {
        this.shadow = this.slider.sliderElement.find('.nextend-shadow');
        this.slider.responsive.addStaticMargin('Bottom', this);
    };

    SmartSliderWidgetShadow.prototype.isVisible = function () {
        return this.shadow.is(':visible');
    };

    SmartSliderWidgetShadow.prototype.getSize = function () {
        return this.shadow.height();
    };

    return SmartSliderWidgetShadow;
});