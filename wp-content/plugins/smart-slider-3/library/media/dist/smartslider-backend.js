(function(){var N=this;N.N2_=N.N2_||{r:[],d:[]},N.N2R=N.N2R||function(){N.N2_.r.push(arguments)},N.N2D=N.N2D||function(){N.N2_.d.push(arguments)}}).call(window);
N2D('ContextMenu', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param $el
     * @param parameters
     * @constructor
     */
    function ContextMenu($el, parameters) {
        this.isActive = false;
        this.$el = $el.data('nextendcontextmenu', this);
        this.parameters = $.extend({
            selector: false,
            onShow: function () {
            }
        }, parameters);

        this.$menu = $('<div class="n2-context-menu"></div>').on('mousedown', function () {
            N2Classes.WindowManager.get().setMouseDownArea('context-menu');
        }).appendTo('body');
        if (this.parameters.selector) {
            this.$el.on('contextmenu', this.parameters.selector, $.proxy(this.onShowContextMenu, this));
        } else {
            this.$el.on('contextmenu', $.proxy(this.onShowContextMenu, this));
        }
    }

    ContextMenu.prototype.onShowContextMenu = function (e) {
        e.preventDefault();
        this.clearItems();
        this.parameters.onShow.call(this, e, this);
        if (this.hasItems) {
            e.stopPropagation();
            this.isActive = true;
            this.$menu.css({
                left: e.pageX,
                top: e.pageY
            });

            $('html').on('mouseleave.nextendcontextmenu, click.nextendcontextmenu', $.proxy(this.onHide, this));
        }
        this.$menu.toggleClass('n2-active', this.hasItems);
    };

    ContextMenu.prototype.onHide = function () {
        $('html').off('.nextendcontextmenu');
        this.$menu.removeClass('n2-active');
        this.isActive = false;
    };

    ContextMenu.prototype.clearItems = function () {
        if (this.isActive) {
            this.onHide();
        }
        this.hasItems = false;
        this.$menu.html('');
    };

    ContextMenu.prototype.addItem = function (label, icon, action) {
        this.hasItems = true;
        this.$menu.append($('<div><i class="n2-i ' + icon + '"></i><span>' + label + '</span></div>').on('click', action));
    };

    $.fn.nextendContextMenu = function (parameters) {
        return this.each(function () {
            new ContextMenu($(this), parameters);
        });
    };

    return ContextMenu;
});

N2D('Zoom', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param responsive
     * @constructor
     */
    function Zoom(responsive) {

        this.currentContainerWidth = 0;

        this.devices = {
            unknownUnknown: $('<div />')
        };
        /**
         *
         * @type {N2Classes.SmartSliderResponsive[]}
         */
        this.responsives = [];

        this.add(responsive);

        var desktopWidth = responsive.parameters.sliderWidthToDevice['desktopPortrait'];

        this.container = responsive.containerElement.closest('.n2-ss-container-device,.n2-ss-canvas-slider-container').add(responsive.containerElement.closest('.n2-ss-slider-outer-container'));
        this.container.width(desktopWidth);
        this.containerWidth = desktopWidth;

        this.initZoom();

        var tr = $('#n2-ss-devices .n2-tr'),
            modes = responsive.parameters.deviceModes;

        this.devices.desktopPortrait = $('<div class="n2-td n2-panel-option" data-device="desktop" data-orientation="portrait"><i class="n2-i n2-it n2-i-v-desktop"></i></div>').prependTo(tr);
        if (modes.desktopLandscape) {
            this.devices.desktopLandscape = $('<div class="n2-td n2-panel-option" data-device="desktop" data-orientation="landscape"><i class="n2-i n2-it n2-i-v-desktop-landscape"></i></div>').prependTo(tr);
        } else {
            this.devices.desktopLandscape = this.devices.desktopPortrait;
        }

        if (modes.tabletPortrait) {
            this.devices.tabletPortrait = $('<div class="n2-td n2-panel-option" data-device="tablet" data-orientation="portrait"><i class="n2-i n2-it n2-i-v-tablet"></i></div>').prependTo(tr);
        } else {
            this.devices.tabletPortrait = this.devices.desktopPortrait;
        }
        if (modes.tabletLandscape) {
            this.devices.tabletLandscape = $('<div class="n2-td n2-panel-option" data-device="tablet" data-orientation="landscape"><i class="n2-i n2-it n2-i-v-tablet-landscape"></i></div>').prependTo(tr);
        } else {
            this.devices.tabletLandscape = this.devices.desktopLandscape;
        }

        if (modes.mobilePortrait) {
            this.devices.mobilePortrait = $('<div class="n2-td n2-panel-option" data-device="mobile" data-orientation="portrait"><i class="n2-i n2-it n2-i-v-mobile"></i></div>').prependTo(tr);
        } else {
            this.devices.mobilePortrait = this.devices.tabletPortrait;
        }
        if (modes.mobileLandscape) {
            this.devices.mobileLandscape = $('<div class="n2-td n2-panel-option" data-device="mobile" data-orientation="landscape"><i class="n2-i n2-it n2-i-v-mobile-landscape"></i></div>').prependTo(tr);
        } else {
            this.devices.mobileLandscape = this.devices.tabletLandscape;
        }

        this.deviceOptions = $('#n2-ss-devices .n2-panel-option');

        this.deviceOptions.each($.proxy(function (i, el) {
            $(el).on({
                mousedown: $.proxy(N2Classes.WindowManager.setMouseDownArea, null, 'zoomDeviceClicked'),
                click: $.proxy(this.setDeviceMode, this)
            });
        }, this));

        responsive.sliderElement.on('SliderDeviceOrientation', $.proxy(this.onDeviceOrientationChange, this));
    }

    var zoom = null;
    Zoom.add = function (responsive) {
        zoom = new Zoom(responsive);

        Zoom.add = function (responsive) {
            zoom.add(responsive);
        };
    };

    Zoom.prototype.add = function (responsive) {
        this.responsives.push(responsive);
        this.setOrientation('portrait');
        responsive.parameters.onResizeEnabled = 0;
        responsive.parameters.forceFull = 0; // We should disable force full feature on admin dashboard as it won't render before the sidebar
        responsive._getDevice = responsive._getDeviceZoom;
    };

    Zoom.prototype.onDeviceOrientationChange = function (e, modes) {
        $('#n2-admin').removeClass('n2-ss-mode-' + modes.lastDevice + modes.lastOrientation)
            .addClass('n2-ss-mode-' + modes.device + modes.orientation);
        this.devices[modes.lastDevice + modes.lastOrientation].removeClass('n2-active');
        this.devices[modes.device + modes.orientation].addClass('n2-active');
    };

    Zoom.prototype.initZoom = function () {
        var zoom = $("#n2-ss-slider-zoom");
        if (zoom.length > 0) {

            if (typeof zoom[0].slide !== 'undefined') {
                zoom[0].slide = null;
            }

            this.zoom =
                zoom.removeAttr('slide').prop('slide', false)
                    .nUISlider({
                        step: 1,
                        value: 1,
                        min: 0,
                        max: 102
                    });
            this.$handle = zoom.data('nUISlider').handle;

            // Init the slider width
            this.responsives[0].sliderElement.one('SliderResize', $.proxy(function (e) {
                var newWidth = this.responsives[0].containerElement.width();
                this.setContainerWidth(e, newWidth, true);
            }, this));

            this.zoom.on({
                'slide.n2-ss-zoom': $.proxy(this.zoomChange, this),
                'slidechange.n2-ss-zoom': $.proxy(this.zoomChange, this)
            });
        }
    };

    Zoom.prototype.zoomChange = function (e, ui) {

        if (e.originalEvent !== undefined) {
            var value = ui.value,
                width;
            var ratio = 1;
            if (value < 50) {
                ratio = nextend.smallestZoom / this.containerWidth + Math.max(value / 50, 0) * (1 - nextend.smallestZoom / this.containerWidth);
            } else if (value > 52) {
                ratio = 1 + (value - 52) / 50;
            }
            width = parseInt(ratio * this.containerWidth);

            this.setContainerWidth(e, width);
        }
    };

    Zoom.prototype.setContainerWidth = function (e, targetWidth, syncSlider) {
        if (this.currentContainerWidth != targetWidth) {
            this.currentContainerWidth = targetWidth;

            this.$handle.html(targetWidth + 'px');
            this.container.width(targetWidth);

            for (var i = 0; i < this.responsives.length; i++) {
                this.responsives[i].doResize(e);
            }

            if (syncSlider) {

                var ratio = targetWidth / this.containerWidth;
                var v = 50;
                if (ratio < 1) {
                    v = (ratio - nextend.smallestZoom / this.containerWidth) / (1 - nextend.smallestZoom / this.containerWidth) * 50;
                } else if (ratio > 1) {
                    v = (ratio - 1) * 50 + 52;
                }

                this.zoom.nUISlider("option", 'value', v);
            }

            $(window).trigger('resize');
        }
    };

    Zoom.prototype.setDeviceMode = function (e) {
        var el = $(e.currentTarget);
        if ((e.ctrlKey || e.metaKey) && this.responsives[0].slider.editor.fragmentEditor) {
            var orientation = el.data('orientation');
            this.responsives[0].slider.editor.fragmentEditor.copyOrResetMode(el.data('device') + orientation[0].toUpperCase() + orientation.substr(1));
        } else {

            this.setOrientation(el.data('orientation'));
            this.setContainerWidth(e, this.getModeWidth(el.data('device')), true);
        }
    };

    Zoom.prototype.getModeWidth = function (newMode) {

        var responsive = this.responsives[0],
            orientation;
        if (responsive.orientationMode == N2Classes.SmartSliderResponsive.OrientationMode.ADMIN_PORTRAIT) {
            orientation = N2Classes.SmartSliderResponsive.DeviceOrientation.PORTRAIT;
        } else {
            orientation = N2Classes.SmartSliderResponsive.DeviceOrientation.LANDSCAPE;
        }
        var width = responsive.parameters.sliderWidthToDevice[newMode + N2Classes.SmartSliderResponsive._DeviceOrientation[orientation]];

        if (newMode == 'mobile') {
            switch (N2Classes.SmartSliderResponsive._DeviceOrientation[orientation]) {
                case 'Portrait':
                    width = Math.max(nextend.smallestZoom, 320);
                    break;
            }
        }

        return width;
    };

    Zoom.prototype.setOrientation = function (newOrientation) {
        if (newOrientation == 'portrait') {
            for (var i = 0; i < this.responsives.length; i++) {
                this.responsives[i].orientationMode = N2Classes.SmartSliderResponsive.OrientationMode.ADMIN_PORTRAIT;
            }
        } else {
            for (var i = 0; i < this.responsives.length; i++) {
                this.responsives[i].orientationMode = N2Classes.SmartSliderResponsive.OrientationMode.ADMIN_LANDSCAPE;
            }
        }
    };

    return Zoom;
});
N2D('CreateSlider', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param groupID
     * @param ajaxUrl
     * @param shouldSkipLicenseModal
     * @constructor
     */
    function CreateSlider(groupID, ajaxUrl, shouldSkipLicenseModal) {
        this.addToGroupModal = null;
        this.groupID = groupID;
        this.ajaxUrl = ajaxUrl;
        this.shouldSkipLicenseModal = shouldSkipLicenseModal;
        $('.n2-ss-create-slider').click($.proxy(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.showModal();
        
        }, this));

        this.notificationStack = new N2Classes.NotificationStackModal($('body'));
        $('.n2-ss-add-sample-slider').click($.proxy(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.showDemoSliders();
        

        }, this));

        if (window.location.hash.substring(1) === 'createslider') {
            this.showModal();
        }
    }

    CreateSlider.prototype.showModal = function () {
        if (!this.createSliderModal) {
            var that = this;
            var ajaxUrl = this.ajaxUrl;
            var presets = [];

            presets.push({
                key: 'default',
                name: n2_('Default'),
                image: '$ss$/admin/images/sliderpresets/default.png'
            });
            presets.push({
                key: 'fullwidth',
                name: n2_('Full width'),
                image: '$ss$/admin/images/sliderpresets/fullwidth.png'
            });
            presets.push({
                key: 'thumbnailhorizontal',
                name: n2_('Thumbnail - horizontal'),
                image: '$ss$/admin/images/sliderpresets/thumbnailhorizontal.png'
            });
            var size = [550, 540];
        

            this.createSliderModal = new N2Classes.NextendModal({
                zero: {
                    size: size,
                    title: n2_('Create Slider'),
                    back: false,
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: [
                        '<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Create') + '</a>'
                    ],
                    fn: {
                        show: function () {

                            var button = this.controls.find('.n2-button-green'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                });

                            form.append(this.createInput(n2_('Slider name'), 'createslidertitle', 'width: 240px;'));
                            form.append(this.createInputUnit(n2_('Width'), 'createsliderwidth', 'px', 'width: 30px;'));
                            form.append(this.createInputUnit(n2_('Height'), 'createsliderheight', 'px', 'width: 30px;'));

                            new N2Classes.FormElementAutocompleteSimple("createsliderwidth", ["1920", "1200", "1000", "800", "600", "400"]);
                            new N2Classes.FormElementAutocompleteSimple("createsliderheight", ["800", "600", "500", "400", "300", "200"]);

                            var sliderTitle = $('#createslidertitle').val(n2_('Slider')).focus(),
                                sliderWidth = $('#createsliderwidth').val(1200),
                                sliderHeight = $('#createsliderheight').val(500);

                            sliderWidth.parent().addClass('n2-form-element-autocomplete');
                            sliderHeight.parent().addClass('n2-form-element-autocomplete');

                            this.createHeading(n2_('Preset')).appendTo(this.content);
                            var imageRadioHeight = 120
                        
                            var imageRadio = this.createImageRadio(presets)
                                    .css({
                                        height: imageRadioHeight,
                                        display: 'flex',
                                        flexWrap: 'wrap'
                                    })
                                    .appendTo(this.content),
                                sliderPreset = imageRadio.find('input');
                            imageRadio.css('overflow', 'hidden');
                            this.createHeading(n2_('Import Sample Sliders')).appendTo(this.content);
                            $('<div class="n2-ss-create-slider-free-sample" style="background-image: url(\'' + nextend.imageHelper.fixed('$ss$/admin/images/free/sample1.png') + '\')"></div><div class="n2-ss-create-slider-free-sample" style="background-image: url(\'' + nextend.imageHelper.fixed('$ss$/admin/images/free/sample2.png') + '\')"></div><div class="n2-ss-create-slider-free-sample" style="background-image: url(\'' + nextend.imageHelper.fixed('$ss$/admin/images/free/sample3.png') + '\')"></div>')
                                .on('click', $.proxy(function () {
                                    this.hide();
                                    that.showDemoSliders();
                                }, this))
                                .appendTo(this.content);
                        

                            button.on('click', $.proxy(function () {

                                N2Classes.AjaxHelper.ajax({
                                    type: "POST",
                                    url: N2Classes.AjaxHelper.makeAjaxUrl(ajaxUrl, {
                                        nextendaction: 'create'
                                    }),
                                    data: {
                                        groupID: that.groupID,
                                        sliderTitle: sliderTitle.val(),
                                        sliderSizeWidth: sliderWidth.val(),
                                        sliderSizeHeight: sliderHeight.val(),
                                        preset: sliderPreset.val()
                                    },
                                    dataType: 'json'
                                }).done($.proxy(function (response) {
                                    N2Classes.AjaxHelper.startLoading();
                                }, this));

                            }, this));
                        }
                    }
                }
            });
        }
        this.createSliderModal.show();
    };

    CreateSlider.prototype.showDemoSliders = function () {
        var that = this;
        $('body').css('overflow', 'hidden');
        var pro = 0;
        var frame = $('<iframe src="//smartslider3.com/demo-import/?pro=' + pro + '&version=' + N2SS3VERSION + '&utm_campaign=' + N2SS3C + '&utm_source=import-slider-frame&utm_medium=smartslider-' + N2PLATFORM + '-' + (pro ? 'pro' : 'free') + '" frameborder="0"></iframe>').css({
                position: 'fixed',
                zIndex: 100000,
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
            }).appendTo('body'),
            closeFrame = function () {
                $('body').css('overflow', '');
                frame.remove();
                window.removeEventListener("message", listener, false);
                that.notificationStack.popStack();
            },
            importSlider = function (href) {
                N2Classes.AjaxHelper.ajax({
                    type: "POST",
                    url: N2Classes.AjaxHelper.makeAjaxUrl(that.ajaxUrl, {
                        nextendaction: 'importDemo'
                    }),
                    data: {
                        groupID: that.groupID,
                        key: N2Classes.Base64.encode(href.replace(/^(http(s)?:)?\/\//, '//'))
                    },
                    dataType: 'json'
                }).fail(function () {
                    //closeFrame();
                });
            },
            listener = function (e) {
                if (e.origin !== "http://smartslider3.com" && e.origin !== "https://smartslider3.com")
                    return;
                var msg = e.data;
                switch (msg.key) {
                    case 'importSlider':
                        if (typeof nextend.joinCommunity === 'function') {
                            nextend.joinCommunity(function () {
                                importSlider(msg.data.href);
                            });
                        } else {
                            importSlider(msg.data.href);
                        }
                    
                        return;

                        break;
                    case 'closeWindow':
                        closeFrame();
                }
            };

        this.notificationStack.enableStack();
        N2Classes.Esc.add($.proxy(function () {
            closeFrame();
            return true;
        }, this));

        window.addEventListener("message", listener, false);
    };

    return CreateSlider;
});
N2D('ManageSliders', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param groupID
     * @param ajaxUrl
     * @param shouldSkipLicenseModal
     * @constructor
     */
    function ManageSliders(groupID, ajaxUrl, shouldSkipLicenseModal) {
        this.groupID = groupID;
        this.ajaxUrl = ajaxUrl;
        this.sliders = [];
        this.sliderPanel = $('#n2-ss-slider-container');
        this.orderBy = this.sliderPanel.data('orderby') == 'ordering' ? true : false;
        this.slidersContainer = this.sliderPanel.find('.n2-ss-sliders-container');

        var sliders = this.slidersContainer.find('.n2-ss-box-slider');
        for (var i = 0; i < sliders.length; i++) {
            this.sliders.push(new N2Classes.Slider(this, sliders.eq(i)));
        }

        this.changed();

        this.initMenu();

        this.initOrderable();

        this.create = new N2Classes.CreateSlider(groupID, ajaxUrl, shouldSkipLicenseModal);
        this.initBulk();
    }

    ManageSliders.prototype.changed = function () {

        $('html').attr('data-sliders', this.sliders.length);
    };

    ManageSliders.prototype.initSliders = function () {
        var sliderNodes = this.slidersContainer.find('.n2-ss-box-slider'),
            sliders = [];
        for (var i = 0; i < sliderNodes.length; i++) {
            var slider = sliderNodes.eq(i).data('slider');
            sliders.push(slider);
        }
        this.sliders = sliders;
        this.changed();
        $(window).triggerHandler('SmartSliderSidebarSlidersChanged');
    };

    ManageSliders.prototype.initOrderable = function () {
        if (this.orderBy) {
            var sortableObject = {
                helper: 'clone',
                items: "> .n2-ss-box-slider",
                stop: $.proxy(this.saveOrder, this),
                placeholder: 'n2-box-sortable-placeholder',
                distance: 10
            };

            this.slidersContainer.nUISortable(sortableObject);
        }
    };

    ManageSliders.prototype.saveOrder = function (e, ui) {

        var sliderNodes = this.slidersContainer.find('.n2-ss-box-slider'),
            sliders = [],
            ids = [],
            originalIds = [];
        for (var i = 0; i < sliderNodes.length; i++) {
            var slider = sliderNodes.eq(i).data('slider');
            sliders.push(slider);
            ids.push(slider.getId());
        }
        for (var i = 0; i < this.sliders.length; i++) {
            originalIds.push(this.sliders[i].getId());
        }

        if (JSON.stringify(originalIds) != JSON.stringify(ids)) {
            $(window).triggerHandler('SmartSliderSidebarSlidersOrderChanged');
            var queries = {
                nextendcontroller: 'sliders',
                nextendaction: 'order'
            };
            N2Classes.AjaxHelper.ajax({
                type: 'POST',
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, queries),
                data: {
                    groupID: this.groupID,
                    sliderorder: ids,
                    isReversed: (this.sliderPanel.data('orderbydirection') == 'DESC' ? 1 : 0)
                }
            });
            this.sliders = sliders;
        }
    };


    ManageSliders.prototype.initMenu = function () {
        this.slider = null;
        this.menu = $('#n2-ss-slider-menu').detach().addClass('n2-inited');

        this.menuActions = {
            duplicate: this.menu.find('.n2-ss-duplicate').on('click', $.proxy(function (e) {
                this.slider.duplicate(e);
            }, this)),
            'delete': this.menu.find('.n2-ss-delete').on('click', $.proxy(function (e) {
                this.slider.delete(e);
            }, this)),
            preview: this.menu.find('.n2-ss-preview').on('click', $.proxy(function (e) {
                this.slider.preview(e);
            }, this))
        };

        this.menu.find('.n2-button').on('click', $.proxy(function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.menu.hasClass('n2-active')) {
                this.menu.removeClass('n2-active').off('mouseleave');
            } else {
                this.menu.addClass('n2-active').on('mouseleave', function () {
                    $(this).removeClass('n2-active');
                });
            }
        }, this));
    };


    ManageSliders.prototype.showMenu = function (slider) {
        this.slider = slider;
        this.menu.appendTo(slider.box);
    };

    ManageSliders.prototype.hideMenu = function () {
        if (this.menu.hasClass('n2-active')) {
            this.menu.removeClass('n2-active').off('mouseleave');
        }
        this.menu.detach();
    };

    ManageSliders.prototype.deleteSliders = function (ids, sliders) {
        this.hideMenu();
        var title = sliders[0].box.find('.n2-box-placeholder-title a').text();
        if (sliders.length > 1) {
            title += ' and ' + (sliders.length - 1) + ' more';
        }
        N2Classes.NextendModal.deleteModal('slider-delete', title, $.proxy(function () {
            N2Classes.AjaxHelper.ajax({
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                    nextendcontroller: 'sliders',
                    nextendaction: 'delete'
                }),
                type: 'POST',
                data: {
                    sliders: ids
                }
            }).done($.proxy(function () {
                for (var i = 0; i < sliders.length; i++) {
                    sliders[i].deleted();
                }
                this.initSliders();
                this.leaveBulk();
            }, this));
        }, this));
    };

    ManageSliders.prototype.duplicateSliders = function (ids, slides) {
        for (var i = 0; i < this.sliders.length; i++) {
            if (this.sliders[i].selected) {
                this.sliders[i].duplicate($.Event("click", {
                    currentTarget: null
                }));
            }
        }
    };

    ManageSliders.prototype.exportSliders = function (ids, sliders) {

        window.location.href = (N2Classes.AjaxHelper.makeFallbackUrl(this.ajaxUrl, {
            nextendcontroller: 'sliders',
            nextendaction: 'exportAll'
        }) + '&' + $.param({sliders: ids, currentGroupID: this.groupID}));
    };

    ManageSliders.prototype.initBulk = function () {

        this.selection = [];

        this.isBulkSelection = false;

        var selects = $('.n2-bulk-select').find('a');

        //Select all
        selects.eq(0).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slider) {
                slider.select();
            });
        }, this));

        //Select none
        selects.eq(1).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slider) {
                slider.deSelect();
            });
        }, this));

        var actions = $('.n2-bulk-actions').find('a')
            .on('click', $.proxy(function (e) {
                e.preventDefault();

                switch ($(e.currentTarget).data('action')) {
                    case 'duplicate':
                        this.bulkAction('duplicateSliders', false);
                        break;
                    case 'delete':
                        this.bulkAction('deleteSliders', false);
                        break;
                    case 'export':
                        this.bulkAction('exportSliders', false);
                        break;
                    case 'addToGroup':
                        this.bulkAction('addToGroup', true);
                        break;
                }
            }, this));
    };

    ManageSliders.prototype.addSelection = function (slider) {
        if (this.selection.length == 0) {
            this.enterBulk();
        }
        this.selection.push(slider);
    };

    ManageSliders.prototype.removeSelection = function (slider) {
        this.selection.splice($.inArray(slider, this.selection), 1);
        if (this.selection.length == 0) {
            this.leaveBulk();
        }
    };

    ManageSliders.prototype.bulkSelect = function (cb) {
        for (var i = 0; i < this.sliders.length; i++) {
            cb(this.sliders[i]);
        }
    };

    ManageSliders.prototype.bulkAction = function (action, skipGroups) {
        var sliders = [],
            ids = [];
        this.bulkSelect(function (slider) {
            if (slider.selected && (!skipGroups || !slider.isGroup)) {
                sliders.push(slider);
                ids.push(slider.getId());
            }
        });
        if (ids.length) {
            this[action](ids, sliders);
            this.leaveBulk();
        } else {
            if (skipGroups) {
                N2Classes.Notification.notice('Please select one or more sliders for the action!');
            } else {
                N2Classes.Notification.notice('Please select one or more sliders or groups for the action!');
            }
        }
    };

    ManageSliders.prototype.enterBulk = function () {
        if (!this.isBulkSelection) {
            this.isBulkSelection = true;
            if (this.orderBy) {
                this.slidersContainer.nUISortable('option', 'disabled', true);
            }
            $('#n2-admin').addClass('n2-ss-has-box-selection');
        }
    };

    ManageSliders.prototype.leaveBulk = function () {
        if (this.isBulkSelection) {
            if (this.orderBy) {
                this.slidersContainer.nUISortable('option', 'disabled', false);
            }
            $('#n2-admin').removeClass('n2-ss-has-box-selection');

            for (var i = 0; i < this.sliders.length; i++) {
                this.sliders[i].deSelect();
            }
            this.selection = [];
            this.isBulkSelection = false;
        }
    };

    return ManageSliders;
});
N2D('Slider', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param manager
     * @param box
     * @constructor
     */
    function Slider(manager, box) {
        this.selected = false;
        this.manager = manager;

        this.box = box.data('slider', this)
            .addClass('n2-clickable');

        this.isGroup = this.box.hasClass('n2-ss-box-slider-group');

        this.box
            .on('mouseenter', $.proxy(function () {
                this.manager.showMenu(this);
            }, this))
            .on('mouseleave', $.proxy(function () {
                this.manager.hideMenu();
            }, this))
            .on('click.n2-slider', $.proxy(this.goToEdit, this));
        this.box.find('.n2-ss-box-select').on('click', $.proxy(function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.invertSelection();
        }, this));
    };

    Slider.prototype.getId = function () {
        return this.box.data('sliderid');
    };

    Slider.prototype.goToEdit = function (e, isBlank) {
        if (e.target.tagName !== 'A') {
            var editUrl = this.box.data('editurl');
            if (typeof isBlank !== 'undefined' && isBlank) {
                window.open(editUrl, '_blank');
            } else {
                window.location = editUrl;
            }
        }
    };

    Slider.prototype.preview = function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.open(N2Classes.AjaxHelper.makeFallbackUrl(this.box.data('editurl'), {
            nextendcontroller: 'preview',
            nextendaction: 'index'
        }), '_blank');
    };


    Slider.prototype.duplicate = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var deferred = $.Deferred();
        N2Classes.AjaxHelper.ajax({
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.box.data('editurl'), {
                nextendcontroller: 'slider',
                nextendaction: 'duplicate'
            })
        }).done($.proxy(function (response) {
            var box = $(response.data).insertAfter(this.box);
            var newSlider = new Slider(this.manager, box);
            this.manager.initSliders();
            deferred.resolve(newSlider);
        }, this));
        return deferred;
    };

    Slider.prototype.delete = function (e) {
        e.stopPropagation();
        e.preventDefault();
        this.manager.deleteSliders([this.getId()], [this]);
    };
    Slider.prototype.deleted = function () {
        this.box.remove();
    };

    Slider.prototype.invertSelection = function (e) {
        if (e) {
            e.preventDefault();
        }

        if (!this.selected) {
            this.select();
        } else {
            this.deSelect();
        }
    };

    Slider.prototype.select = function () {
        if (!this.selected) {
            this.selected = true;
            this.box.addClass('n2-selected');
            this.manager.addSelection(this);
        }
    };

    Slider.prototype.deSelect = function () {
        if (this.selected) {
            this.selected = false;
            this.box.removeClass('n2-selected');
            this.manager.removeSelection(this);
        }
    };

    return Slider;
});
N2D('FormElementAnimationManager', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @param managerIdentifier
     * @constructor
     */
    function FormElementAnimationManager(id, managerIdentifier) {
        this.element = $('#' + id);
        this.managerIdentifier = managerIdentifier;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        this.updateName(this.element.val());

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementAnimationManager.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementAnimationManager.prototype.constructor = FormElementAnimationManager;


    FormElementAnimationManager.prototype.show = function (e) {
        e.preventDefault();
        nextend[this.managerIdentifier].show(this.element.val(), $.proxy(this.save, this));
    };

    FormElementAnimationManager.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementAnimationManager.prototype.save = function (e, value) {
        this.val(value);
    };

    FormElementAnimationManager.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    FormElementAnimationManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    FormElementAnimationManager.prototype.updateName = function (value) {
        if (value == '') {
            value = n2_('Disabled');
        } else if (value.split('||').length > 1) {
            value = n2_('Multiple animations')
        } else {
            value = n2_('Single animation');
        }
        this.name.val(value);
    };

    return FormElementAnimationManager;
});
N2D('FormElementBackground', ['FormElement'], function ($, undefined) {

    /**
     *
     * @memberOf N2Classes
     *
     * @param id
     * @param value
     * @constructor
     */
    function FormElementBackground(id, value) {
        this.value = '';
        this.element = $('#' + id);

        this.$container = this.element.closest('.n2-form-tab');

        this.panel = $('#' + id + '-panel');
        this.setValue(value);
        this.options = this.panel.find('.n2-subform-image-option').on('click', $.proxy(this.selectOption, this));

        this.active = this.getIndex(this.options.filter('.n2-active').get(0));

        this.element.on('change', $.proxy(function () {
            this.insideChange(this.element.val());
        }, this));

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    };

    FormElementBackground.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementBackground.prototype.constructor = FormElementBackground;

    FormElementBackground.prototype.selectOption = function (e) {
        var index = this.getIndex(e.currentTarget);
        if (index != this.active) {

            this.options.eq(index).addClass('n2-active');
            this.options.eq(this.active).removeClass('n2-active');

            this.active = index;

            var value = $(e.currentTarget).data('value');
            this.insideChange(value);
        }
    };
    FormElementBackground.prototype.setValue = function (newValue) {
        this.$container.removeClass('n2-ss-background-type-' + this.value);
        this.value = newValue;
        this.$container.addClass('n2-ss-background-type-' + this.value);
    };

    FormElementBackground.prototype.insideChange = function (value) {
        this.setValue(value);

        this.element.val(value);

        this.options.removeClass('n2-active');
        this.options.filter('[data-value="' + value + '"]').addClass('n2-active');
        this.triggerInsideChange();
    };

    FormElementBackground.prototype.getIndex = function (option) {
        return $.inArray(option, this.options);
    };

    return FormElementBackground;
});

N2D('FormElementColumns', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementColumns(id) {
        this.denominators = {
            1: 100,
            2: 100,
            3: 144,
            4: 100,
            5: 100,
            6: 144
        };
        this.element = $('#' + id);
        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
        this.$c = $('#' + id).parent();
        this.$container = this.$c.find('.n2-ss-columns-element-container');
        this.containerWidth = 284;
        this.maxWidth = 0;


        this.$container.nUISortable({
            axis: 'x',
            items: '.n2-ss-columns-element-column',
            helper: 'clone_hide',
            start: $.proxy(function (e, ui) {
                this.$container.addClass('n2-sortable-currently-sorted');
                ui.placeholder.css({
                    width: ui.item.width(),
                    visibility: 'hidden'
                });

                var $columns = this.$container.find('.n2-ss-columns-element-column');
                ui.item.data('index', $columns.index(ui.item));

            }, this),

            stop: $.proxy(function (e, ui) {
                var $columns = this.$container.find('.n2-ss-columns-element-column');
                var oldIndex = ui.item.data('index'),
                    newIndex = $columns.index(ui.item);
                if (oldIndex != newIndex) {

                    this.currentRow.moveCol(oldIndex, newIndex);

                    ui.item.data('index', null);
                }
                this.makeResizable();
                this.$container.removeClass('n2-sortable-currently-sorted');
            }, this)
        });

        this.$c.find('.n2-ss-columns-element-add-col').on({
            click: $.proxy(function () {
                this.currentRow.createCol();
            }, this)
        });
    }

    FormElementColumns.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementColumns.prototype.constructor = FormElementColumns;


    FormElementColumns.prototype.getDenominator = function (i) {
        if (this.denominators[i] === undefined) {
            this.denominators[i] = i * 15;
        }
        return this.denominators[i];
    };

    FormElementColumns.prototype.setRow = function (row) {
        this.currentRow = row;
        this.insideChange(row.getColumnsOrdered());
    };

    FormElementColumns.prototype.setValue = function (newValue) {

    };

    FormElementColumns.prototype.insideChange = function (value) {
        this.start(value);
    };

    FormElementColumns.prototype.activateColumn = function (e) {
        var clickedColIndex = this.$container.find('.n2-ss-columns-element-column').index(e.currentTarget);
        this.currentRow.activateColumn(clickedColIndex, e);
    };

    FormElementColumns.prototype.start = function (value) {
        this.percentages = [];

        var columnWidths = value.split('+');
        for (var i = 0; i < columnWidths.length; i++) {
            this.percentages.push(new Fraction(columnWidths[i]));
        }

        this.refreshMaxWidth();

        this.$container.empty();

        for (var i = 0; i < this.percentages.length; i++) {
            this.updateColumn($('<div class="n2-ss-columns-element-column">')
                .on('click', $.proxy(this.activateColumn, this))
                .appendTo(this.$container), this.percentages[i]);
        }

        this.makeResizable();

    };

    FormElementColumns.prototype.refreshMaxWidth = function () {
        this.maxWidth = this.containerWidth - (this.percentages.length - 1) * 15;
    };

    FormElementColumns.prototype.updateColumn = function ($col, fraction) {
        $col.css('width', (this.maxWidth * fraction.valueOf()) + 'px')
            .html(Math.round(fraction.valueOf() * 100 * 10) / 10 + '%');
    };

    FormElementColumns.prototype.makeResizable = function () {
        if (this.handles) {
            this.handles.remove();
        }
        this.$columns = this.$container.find('.n2-ss-columns-element-column');
        $('<div class="n2-ss-columns-element-handle"><div class="n2-i n2-i-more"></div></div>').insertAfter(this.$columns.not(this.$columns.last()));

        this.handles = this.$container.find('.n2-ss-columns-element-handle')
            .on('mousedown', $.proxy(this._resizeStart, this));
    };

    FormElementColumns.prototype._resizeStart = function (e) {
        var index = this.handles.index(e.currentTarget),
            cLeft = this.$container.offset().left + 8;

        this.resizeContext = {
            index: index,
            cLeft: cLeft,
            $currentCol: this.$columns.eq(index),
            $nextCol: this.$columns.eq(index + 1),
            startX: Math.max(0, Math.min(e.clientX - cLeft, this.containerWidth)),
        };

        this._resizeMove(e);

        $('html').off('.resizecol').on({
            'mousemove.resizecol': $.proxy(this._resizeMove, this),
            'mouseup.resizecol mouseleave.resizecol': $.proxy(this._resizeStop, this)
        });
    };

    FormElementColumns.prototype._resizeMove = function (e) {
        e.preventDefault();
        var currentX = Math.max(0, Math.min(e.clientX - this.resizeContext.cLeft, this.containerWidth)),
            currentDenominator = this.getDenominator(this.percentages.length),
            fractionDifference = new Fraction(Math.round((currentX - this.resizeContext.startX) / (this.maxWidth / currentDenominator)), currentDenominator);
        if (fractionDifference.compare(this.percentages[this.resizeContext.index].clone().mul(-1)) < 0) {
            fractionDifference = this.percentages[this.resizeContext.index].clone().mul(-1);
        }
        if (fractionDifference.compare(this.percentages[this.resizeContext.index + 1]) > 0) {
            fractionDifference = this.percentages[this.resizeContext.index + 1].clone();
        }
        var currentP = this.percentages[this.resizeContext.index].add(fractionDifference),
            nextP = this.percentages[this.resizeContext.index + 1].sub(fractionDifference);

        this.updateColumn(this.resizeContext.$currentCol, currentP);
        this.updateColumn(this.resizeContext.$nextCol, nextP);

        var _percentages = $.extend([], this.percentages);
        _percentages[this.resizeContext.index] = currentP;
        _percentages[this.resizeContext.index + 1] = nextP;

        this.onColumnWidthChange(_percentages);

        return [currentP, nextP];
    };

    FormElementColumns.prototype._resizeStop = function (e) {
        var ret = this._resizeMove(e);
        this.percentages[this.resizeContext.index] = ret[0];
        this.percentages[this.resizeContext.index + 1] = ret[1];
        $('html').off('.resizecol');
        delete this.resizeContext;

        this.currentRow.setRealColsWidth(this.percentages);
    };

    FormElementColumns.prototype.onColumnWidthChange = function (_percentages) {
        var percentages = [];
        for (var i = 0; i < _percentages.length; i++) {
            percentages.push(_percentages[i].valueOf());
        }
        this.currentRow.updateColumnWidth(percentages);
    };

    return FormElementColumns;
});

/**
 * @license Fraction.js v3.3.1 09/09/2015
 * http://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2015, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/


/**
 *
 * This class offers the possibility to calculate fractions.
 * You can pass a fraction in different formats. Either as array, as double, as string or as an integer.
 *
 * Array/Object form
 * [ 0 => <nominator>, 1 => <denominator> ]
 * [ n => <nominator>, d => <denominator> ]
 *
 * Integer form
 * - Single integer value
 *
 * Double form
 * - Single double value
 *
 * String form
 * 123.456 - a simple double
 * 123/456 - a string fraction
 * 123.'456' - a double with repeating decimal places
 * 123.(456) - synonym
 * 123.45'6' - a double with repeating last place
 * 123.45(6) - synonym
 *
 * Example:
 *
 * var f = new Fraction("9.4'31'");
 * f.mul([-4, 3]).div(4.9);
 *
 */

(function (root) {

    "use strict";

    // Maximum search depth for cyclic rational numbers. 2000 should be more than enough.
    // Example: 1/7 = 0.(142857) has 6 repeating decimal places.
    // If MAX_CYCLE_LEN gets reduced, long cycles will not be detected and toString() only gets the first 10 digits
    var MAX_CYCLE_LEN = 2000;

    // Parsed data to avoid calling "new" all the time
    var P = {
        "s": 1,
        "n": 0,
        "d": 1
    };

    function assign(n, s) {

        if (isNaN(n = parseInt(n, 10))) {
            throwInvalidParam();
        }
        return n * s;
    }

    function throwInvalidParam() {
        throw "Invalid Param";
    }

    var parse = function (p1, p2) {

        var n = 0, d = 1, s = 1;
        var v = 0, w = 0, x = 0, y = 1, z = 1;

        var A = 0, B = 1;
        var C = 1, D = 1;

        var N = 10000000;
        var M;

        if (p1 === undefined || p1 === null) {
            /* void */
        } else if (p2 !== undefined) {
            n = p1;
            d = p2;
            s = n * d;
        } else
            switch (typeof p1) {

                case "object": {
                    if ("d" in p1 && "n" in p1) {
                        n = p1["n"];
                        d = p1["d"];
                        if ("s" in p1)
                            n *= p1["s"];
                    } else if (0 in p1) {
                        n = p1[0];
                        if (1 in p1)
                            d = p1[1];
                    } else {
                        throwInvalidParam();
                    }
                    s = n * d;
                    break;
                }
                case "number": {
                    if (p1 < 0) {
                        s = p1;
                        p1 = -p1;
                    }

                    if (p1 % 1 === 0) {
                        n = p1;
                    } else if (p1 > 0) { // check for != 0, scale would become NaN (log(0)), which converges really slow

                        if (p1 >= 1) {
                            z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
                            p1 /= z;
                        }

                        // Using Farey Sequences
                        // http://www.johndcook.com/blog/2010/10/20/best-rational-approximation/

                        while (B <= N && D <= N) {
                            M = (A + C) / (B + D);

                            if (p1 === M) {
                                if (B + D <= N) {
                                    n = A + C;
                                    d = B + D;
                                } else if (D > B) {
                                    n = C;
                                    d = D;
                                } else {
                                    n = A;
                                    d = B;
                                }
                                break;

                            } else {

                                if (p1 > M) {
                                    A += C;
                                    B += D;
                                } else {
                                    C += A;
                                    D += B;
                                }

                                if (B > N) {
                                    n = C;
                                    d = D;
                                } else {
                                    n = A;
                                    d = B;
                                }
                            }
                        }
                        n *= z;
                    } else if (isNaN(p1) || isNaN(p2)) {
                        d = n = NaN;
                    }
                    break;
                }
                case "string": {
                    B = p1.match(/\d+|./g);

                    if (B[A] === '-') {// Check for minus sign at the beginning
                        s = -1;
                        A++;
                    } else if (B[A] === '+') {// Check for plus sign at the beginning
                        A++;
                    }

                    if (B.length === A + 1) { // Check if it's just a simple number "1234"
                        w = assign(B[A++], s);
                    } else if (B[A + 1] === '.' || B[A] === '.') { // Check if it's a decimal number

                        if (B[A] !== '.') { // Handle 0.5 and .5
                            v = assign(B[A++], s);
                        }
                        A++;

                        // Check for decimal places
                        if (A + 1 === B.length || B[A + 1] === '(' && B[A + 3] === ')' || B[A + 1] === "'" && B[A + 3] === "'") {
                            w = assign(B[A], s);
                            y = Math.pow(10, B[A].length);
                            A++;
                        }

                        // Check for repeating places
                        if (B[A] === '(' && B[A + 2] === ')' || B[A] === "'" && B[A + 2] === "'") {
                            x = assign(B[A + 1], s);
                            z = Math.pow(10, B[A + 1].length) - 1;
                            A += 3;
                        }

                    } else if (B[A + 1] === '/' || B[A + 1] === ':') { // Check for a simple fraction "123/456" or "123:456"
                        w = assign(B[A], s);
                        y = assign(B[A + 2], 1);
                        A += 3;
                    } else if (B[A + 3] === '/' && B[A + 1] === ' ') { // Check for a complex fraction "123 1/2"
                        v = assign(B[A], s);
                        w = assign(B[A + 2], s);
                        y = assign(B[A + 4], 1);
                        A += 5;
                    }

                    if (B.length <= A) { // Check for more tokens on the stack
                        d = y * z;
                        s = /* void */
                            n = x + d * v + z * w;
                        break;
                    }

                    /* Fall through on error */
                }
                default:
                    throwInvalidParam();
            }

        if (d === 0) {
            throw "DIV/0";
        }

        P["s"] = s < 0 ? -1 : 1;
        P["n"] = Math.abs(n);
        P["d"] = Math.abs(d);
    };

    var modpow = function (b, e, m) {

        for (var r = 1; e > 0; b = (b * b) % m, e >>= 1) {

            if (e & 1) {
                r = (r * b) % m;
            }
        }
        return r;
    };

    var cycleLen = function (n, d) {

        for (; d % 2 === 0;
               d /= 2) {
        }

        for (; d % 5 === 0;
               d /= 5) {
        }

        if (d === 1) // Catch non-cyclic numbers
            return 0;

        // If we would like to compute really large numbers quicker, we could make use of Fermat's little theorem:
        // 10^(d-1) % d == 1
        // However, we don't need such large numbers and MAX_CYCLE_LEN should be the capstone,
        // as we want to translate the numbers to strings.

        var rem = 10 % d;

        for (var t = 1; rem !== 1; t++) {
            rem = rem * 10 % d;

            if (t > MAX_CYCLE_LEN)
                return 0; // Returning 0 here means that we don't print it as a cyclic number. It's likely that the answer is `d-1`
        }
        return t;
    };

    var cycleStart = function (n, d, len) {

        var rem1 = 1;
        var rem2 = modpow(10, len, d);

        for (var t = 0; t < 300; t++) { // s < ~log10(Number.MAX_VALUE)
            // Solve 10^s == 10^(s+t) (mod d)

            if (rem1 === rem2)
                return t;

            rem1 = rem1 * 10 % d;
            rem2 = rem2 * 10 % d;
        }
        return 0;
    };

    var gcd = function (a, b) {

        if (!a) return b;
        if (!b) return a;

        while (1) {
            a %= b;
            if (!a) return b;
            b %= a;
            if (!b) return a;
        }
    };

    /**
     * Module constructor
     *
     * @constructor
     * @param {number|Fraction} a
     * @param {number=} b
     */
    function Fraction(a, b) {

        if (!(this instanceof Fraction)) {
            return new Fraction(a, b);
        }

        parse(a, b);

        if (Fraction['REDUCE']) {
            a = gcd(P["d"], P["n"]); // Abuse a
        } else {
            a = 1;
        }

        this["s"] = P["s"];
        this["n"] = P["n"] / a;
        this["d"] = P["d"] / a;
    }

    /**
     * Boolean global variable to be able to disable automatic reduction of the fraction
     *
     */
    Fraction['REDUCE'] = 1;

    Fraction.prototype = {

        "s": 1,
        "n": 0,
        "d": 1,

        /**
         * Calculates the absolute value
         *
         * Ex: new Fraction(-4).abs() => 4
         **/
        "abs": function () {

            return new Fraction(this["n"], this["d"]);
        },

        /**
         * Inverts the sign of the current fraction
         *
         * Ex: new Fraction(-4).neg() => 4
         **/
        "neg": function () {

            return new Fraction(-this["s"] * this["n"], this["d"]);
        },

        /**
         * Adds two rational numbers
         *
         * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
         **/
        "add": function (a, b) {

            parse(a, b);
            return new Fraction(
                this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
                this["d"] * P["d"]
            );
        },

        /**
         * Subtracts two rational numbers
         *
         * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
         **/
        "sub": function (a, b) {

            parse(a, b);
            return new Fraction(
                this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
                this["d"] * P["d"]
            );
        },

        /**
         * Multiplies two rational numbers
         *
         * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
         **/
        "mul": function (a, b) {

            parse(a, b);
            return new Fraction(
                this["s"] * P["s"] * this["n"] * P["n"],
                this["d"] * P["d"]
            );
        },

        /**
         * Divides two rational numbers
         *
         * Ex: new Fraction("-17.(345)").inverse().div(3)
         **/
        "div": function (a, b) {

            parse(a, b);
            return new Fraction(
                this["s"] * P["s"] * this["n"] * P["d"],
                this["d"] * P["n"]
            );
        },

        /**
         * Clones the actual object
         *
         * Ex: new Fraction("-17.(345)").clone()
         **/
        "clone": function () {
            return new Fraction(this);
        },

        /**
         * Calculates the modulo of two rational numbers - a more precise fmod
         *
         * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
         **/
        "mod": function (a, b) {

            if (isNaN(this['n']) || isNaN(this['d'])) {
                return new Fraction(NaN);
            }

            if (a === undefined) {
                return new Fraction(this["s"] * this["n"] % this["d"], 1);
            }

            parse(a, b);
            if (0 === P["n"] && 0 === this["d"]) {
                Fraction(0, 0); // Throw div/0
            }

            /*
             * First silly attempt, kinda slow
             *
             return that["sub"]({
             "n": num["n"] * Math.floor((this.n / this.d) / (num.n / num.d)),
             "d": num["d"],
             "s": this["s"]
             });*/

            /*
             * New attempt: a1 / b1 = a2 / b2 * q + r
             * => b2 * a1 = a2 * b1 * q + b1 * b2 * r
             * => (b2 * a1 % a2 * b1) / (b1 * b2)
             */
            return new Fraction(
                (this["s"] * P["d"] * this["n"]) % (P["n"] * this["d"]),
                P["d"] * this["d"]
            );
        },

        /**
         * Calculates the fractional gcd of two rational numbers
         *
         * Ex: new Fraction(5,8).gcd(3,7) => 1/56
         */
        "gcd": function (a, b) {

            parse(a, b);

            // gcd(a / b, c / d) = gcd(a, c) / lcm(b, d)

            return new Fraction(gcd(P["n"], this["n"]), P["d"] * this["d"] / gcd(P["d"], this["d"]));
        },

        /**
         * Calculates the fractional lcm of two rational numbers
         *
         * Ex: new Fraction(5,8).lcm(3,7) => 15
         */
        "lcm": function (a, b) {

            parse(a, b);

            // lcm(a / b, c / d) = lcm(a, c) / gcd(b, d)

            if (P["n"] === 0 && this["n"] === 0) {
                return new Fraction;
            }
            return new Fraction(P["n"] * this["n"] / gcd(P["n"], this["n"]), gcd(P["d"], this["d"]));
        },

        /**
         * Calculates the ceil of a rational number
         *
         * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
         **/
        "ceil": function (places) {

            places = Math.pow(10, places || 0);

            if (isNaN(this["n"]) || isNaN(this["d"])) {
                return new Fraction(NaN);
            }
            return new Fraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
        },

        /**
         * Calculates the floor of a rational number
         *
         * Ex: new Fraction('4.(3)').floor() => (4 / 1)
         **/
        "floor": function (places) {

            places = Math.pow(10, places || 0);

            if (isNaN(this["n"]) || isNaN(this["d"])) {
                return new Fraction(NaN);
            }
            return new Fraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
        },

        /**
         * Rounds a rational numbers
         *
         * Ex: new Fraction('4.(3)').round() => (4 / 1)
         **/
        "round": function (places) {

            places = Math.pow(10, places || 0);

            if (isNaN(this["n"]) || isNaN(this["d"])) {
                return new Fraction(NaN);
            }
            return new Fraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
        },

        /**
         * Gets the inverse of the fraction, means numerator and denumerator are exchanged
         *
         * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
         **/
        "inverse": function () {

            return new Fraction(this["s"] * this["d"], this["n"]);
        },

        /**
         * Calculates the fraction to some integer exponent
         *
         * Ex: new Fraction(-1,2).pow(-3) => -8
         */
        "pow": function (m) {

            if (m < 0) {
                return new Fraction(Math.pow(this['s'] * this["d"], -m), Math.pow(this["n"], -m));
            } else {
                return new Fraction(Math.pow(this['s'] * this["n"], m), Math.pow(this["d"], m));
            }
        },

        /**
         * Check if two rational numbers are the same
         *
         * Ex: new Fraction(19.6).equals([98, 5]);
         **/
        "equals": function (a, b) {

            parse(a, b);
            return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"]; // Same as compare() === 0
        },

        /**
         * Check if two rational numbers are the same
         *
         * Ex: new Fraction(19.6).equals([98, 5]);
         **/
        "compare": function (a, b) {

            parse(a, b);
            var t = (this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"]);
            return (0 < t) - (t < 0);
        },

        /**
         * Check if two rational numbers are divisible
         *
         * Ex: new Fraction(19.6).divisible(1.5);
         */
        "divisible": function (a, b) {

            parse(a, b);
            return !(!(P["n"] * this["d"]) || ((this["n"] * P["d"]) % (P["n"] * this["d"])));
        },

        /**
         * Returns a decimal representation of the fraction
         *
         * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
         **/
        'valueOf': function () {

            return this["s"] * this["n"] / this["d"];
        },

        /**
         * Returns a string-fraction representation of a Fraction object
         *
         * Ex: new Fraction("1.'3'").toFraction() => "4 1/3"
         **/
        'toFraction': function (excludeWhole) {

            var whole, str = "";
            var n = this["n"];
            var d = this["d"];
            if (this["s"] < 0) {
                str += '-';
            }

            if (d === 1) {
                str += n;
            } else {

                if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
                    str += whole;
                    str += " ";
                    n %= d;
                }

                str += n;
                str += '/';
                str += d;
            }
            return str;
        },

        /**
         * Returns a latex representation of a Fraction object
         *
         * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
         **/
        'toLatex': function (excludeWhole) {

            var whole, str = "";
            var n = this["n"];
            var d = this["d"];
            if (this["s"] < 0) {
                str += '-';
            }

            if (d === 1) {
                str += n;
            } else {

                if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
                    str += whole;
                    n %= d;
                }

                str += "\\frac{";
                str += n;
                str += '}{';
                str += d;
                str += '}';
            }
            return str;
        },

        /**
         * Returns an array of continued fraction elements
         *
         * Ex: new Fraction("7/8").toContinued() => [0,1,7]
         */
        'toContinued': function () {

            var t;
            var a = this['n'];
            var b = this['d'];
            var res = [];

            do {
                res.push(Math.floor(a / b));
                t = a % b;
                a = b;
                b = t;
            } while (a !== 1);

            return res;
        },

        /**
         * Creates a string representation of a fraction with all digits
         *
         * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
         **/
        'toString': function () {

            var g;
            var N = this["n"];
            var D = this["d"];

            if (isNaN(N) || isNaN(D)) {
                return "NaN";
            }

            if (!Fraction['REDUCE']) {
                g = gcd(N, D);
                N /= g;
                D /= g;
            }

            var p = String(N).split(""); // Numerator chars
            var t = 0; // Tmp var

            var ret = [~this["s"] ? "" : "-", "", ""]; // Return array, [0] is zero sign, [1] before comma, [2] after
            var zeros = ""; // Collection variable for zeros

            var cycLen = cycleLen(N, D); // Cycle length
            var cycOff = cycleStart(N, D, cycLen); // Cycle start

            var j = -1;
            var n = 1; // str index

            // rough estimate to fill zeros
            var length = 15 + cycLen + cycOff + p.length; // 15 = decimal places when no repitation

            for (var i = 0; i < length; i++, t *= 10) {

                if (i < p.length) {
                    t += Number(p[i]);
                } else {
                    n = 2;
                    j++; // Start now => after comma
                }

                if (cycLen > 0) { // If we have a repeating part
                    if (j === cycOff) {
                        ret[n] += zeros + "(";
                        zeros = "";
                    } else if (j === cycLen + cycOff) {
                        ret[n] += zeros + ")";
                        break;
                    }
                }

                if (t >= D) {
                    ret[n] += zeros + ((t / D) | 0); // Flush zeros, Add current digit
                    zeros = "";
                    t = t % D;
                } else if (n > 1) { // Add zeros to the zero buffer
                    zeros += "0";
                } else if (ret[n]) { // If before comma, add zero only if already something was added
                    ret[n] += "0";
                }
            }

            // If it's empty, it's a leading zero only
            ret[0] += ret[1] || "0";

            // If there is something after the comma, add the comma sign
            if (ret[2]) {
                return ret[0] + "." + ret[2];
            }
            return ret[0];
        }
    };
    root['Fraction'] = Fraction;

})(window);
N2D('FormElementSliderType', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementSliderType(id) {
        this.element = $('#' + id);

        this.setAttribute();

        this.element.on('nextendChange', $.proxy(this.setAttribute, this));
    }

    FormElementSliderType.prototype.setAttribute = function () {
        var val = this.element.val();
        $('#n2-admin')
            .data('slider-type', val)
            .attr('data-slider-type', val);

        if (this.element.val() === 'block') {
            $('.n2-fm-shadow').trigger('click');
        }
    };

    return FormElementSliderType;
});

N2D('FormElementSliderWidgetArea', ['FormElement'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementSliderWidgetArea(id) {
        this.element = $('#' + id);

        this.area = $('#' + id + '_area');

        this.areas = this.area.find('.n2-area');

        this.areas.on('click', $.proxy(this.chooseArea, this));

        N2Classes.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementSliderWidgetArea.prototype = Object.create(N2Classes.FormElement.prototype);
    FormElementSliderWidgetArea.prototype.constructor = FormElementSliderWidgetArea;


    FormElementSliderWidgetArea.prototype.chooseArea = function (e) {
        var value = parseInt($(e.target).data('area'));

        this.element.val(value);
        this.setSelected(value);

        this.triggerOutsideChange();
    };

    FormElementSliderWidgetArea.prototype.insideChange = function (value) {
        value = parseInt(value);
        this.element.val(value);
        this.setSelected(value);

        this.triggerInsideChange();
    };

    FormElementSliderWidgetArea.prototype.setSelected = function (index) {
        this.areas.removeClass('n2-active');
        this.areas.eq(index - 1).addClass('n2-active');
    };

    return FormElementSliderWidgetArea;
});

N2D('FormElementWidgetPosition', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementWidgetPosition(id) {

        this.element = $('#' + id + '-mode');
        this.container = this.element.closest('.n2-form-element-mixed');

        this.tabs = this.container.find('> .n2-mixed-group');

        this.element.on('nextendChange', $.proxy(this.onChange, this));

        this.onChange();
    }

    FormElementWidgetPosition.prototype.onChange = function () {
        var value = this.element.val();

        if (value === 'advanced') {
            this.tabs.eq(2).css('display', '');
            this.tabs.eq(1).css('display', 'none');
        } else {
            this.tabs.eq(1).css('display', '');
            this.tabs.eq(2).css('display', 'none');
        }
    };

    return FormElementWidgetPosition;
});

N2D('SmartSliderGeneratorRecords', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param ajaxUrl
     * @constructor
     */
    function SmartSliderGeneratorRecords(ajaxUrl) {
        this.ajaxUrl = ajaxUrl;

        $("#generatorrecord-viewer").on("click", $.proxy(this.showRecords, this));
    }

    SmartSliderGeneratorRecords.prototype.showRecords = function (e) {
        e.preventDefault();
        N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: this.ajaxUrl,
            data: $("#smartslider-form").serialize(),
            dataType: "json"
        }).done(function (response) {
            var modal = new N2Classes.NextendModal({
                zero: {
                    size: [
                        1300,
                        700
                    ],
                    title: "Records",
                    content: response.data.html
                }
            }, true);
            modal.content.css('overflow', 'auto');
        }).error(function (response) {
            if (response.status == 200) {
                var modal = new N2Classes.NextendModal({
                    zero: {
                        size: [
                            1300,
                            700
                        ],
                        title: "Response",
                        content: response.responseText
                    }
                }, true);
                modal.content.css('overflow', 'auto');
            }
        });
    };

    return SmartSliderGeneratorRecords;
});
N2D('QuickSlides', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param ajaxUrl
     * @constructor
     */
    function QuickSlides(ajaxUrl) {

        var button = $('#n2-quick-slides-edit');
        if (button.length < 1) {
            return;
        }

        this.ajaxUrl = ajaxUrl;

        button.on('click', $.proxy(this.openEdit, this));
    }

    QuickSlides.prototype.openEdit = function (e) {
        e.preventDefault();
        var slides = $('#n2-ss-slides .n2-box-slide');

        var that = this;
        this.modal = new N2Classes.NextendModal({
            zero: {
                fit: true,
                fitX: false,
                overflow: 'auto',
                size: [
                    1200,
                    700
                ],
                title: n2_('Quick Edit - Slides'),
                back: false,
                close: true,
                content: '<form class="n2-form"><table></table></form>',
                controls: [
                    '<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Save') + '</a>'
                ],
                fn: {
                    show: function () {

                        var button = this.controls.find('.n2-button-green'),
                            form = this.content.find('.n2-form').on('submit', function (e) {
                                e.preventDefault();
                                button.trigger('click');
                            }),
                            table = form.find('table');

                        slides.each($.proxy(function (i, el) {
                            var slide = $(el),
                                tr = $('<tr />').appendTo(table),
                                id = slide.data('slideid');
                            tr.append($('<td />').append('<img src="' + slide.data('image') + '" style="width:100px;"/>'));
                            tr.append($('<td />').append(that.createInput(n2_('Name'), 'title-' + id, slide.data('title'), 'width: 240px;')));
                            tr.append($('<td />').append(that.createTextarea(n2_('Description'), 'description-' + id, slide.data('description'), 'width: 330px;height:24px;')));
                            var link = slide.data('link').split('|*|');
                            tr.append($('<td />').append(that.createLink(n2_('Link'), 'link-' + id, link[0], 'width: 180px;')));
                            tr.append($('<td />').append(that.createTarget(n2_('Target window'), 'target-' + id, link.length > 1 ? link[1] : '_self', '')));

                            new N2Classes.FormElementUrl('link-' + id, nextend.NextendElementUrlParams);

                        }, this));


                        button.on('click', $.proxy(function (e) {

                            var changed = {};
                            slides.each($.proxy(function (i, el) {
                                var slide = $(el),
                                    id = slide.data('slideid'),
                                    name = $('#title-' + id).val(),
                                    description = $('#description-' + id).val(),
                                    link = $('#link-' + id).val() + '|*|' + $('#target-' + id).val();

                                if (name != slide.data('title') || description != slide.data('description') || link != slide.data('link')) {
                                    changed[id] = {
                                        name: name,
                                        description: description,
                                        link: link
                                    };
                                }
                            }, this));

                            if (jQuery.isEmptyObject(changed)) {
                                this.hide(e);
                            } else {
                                this.hide(e);
                                N2Classes.AjaxHelper.ajax({
                                    type: "POST",
                                    url: N2Classes.AjaxHelper.makeAjaxUrl(that.ajaxUrl),
                                    data: {changed: N2Classes.Base64.encode(JSON.stringify(changed))},
                                    dataType: 'json'
                                }).done($.proxy(function (response) {
                                    var slides = response.data;
                                    for (var slideID in slides) {
                                        var slideBox = $('.n2-box-slide[data-slideid="' + slideID + '"]');
                                        slideBox.find('.n2-box-placeholder a.n2-h4').html(slides[slideID].title);

                                        slideBox.attr('data-title', slides[slideID].rawTitle);
                                        slideBox.data('title', slides[slideID].rawTitle);
                                        slideBox.attr('data-description', slides[slideID].rawDescription);
                                        slideBox.data('description', slides[slideID].rawDescription);
                                        slideBox.attr('data-link', slides[slideID].rawLink);
                                        slideBox.data('link', slides[slideID].rawLink);
                                    }
                                }, this));
                            }
                        }, this));
                    }
                }
            }
        });

        this.modal.setCustomClass('n2-ss-quick-slides-edit-modal');
        this.modal.show();

    };

    QuickSlides.prototype.createInput = function (label, id, value) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        var nodes = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" class="n2-h5" autocomplete="off" style="' + style + '"></div></div></div></div>');
        nodes.find('input').val(value);
        return nodes;
    };

    QuickSlides.prototype.createTextarea = function (label, id, value) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        var nodes = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-textarea n2-border-radius"><textarea id="' + id + '" class="n2-h5" autocomplete="off" style="resize:y;' + style + '"></textarea></div></div></div></div>');
        nodes.find('textarea').val(value);
        return nodes;
    };

    QuickSlides.prototype.createLink = function (label, id, value) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        var nodes = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" class="n2-h5" autocomplete="off" style="' + style + '"><a href="#" class="n2-form-element-clear"><i class="n2-i n2-it n2-i-empty n2-i-grey-opacity"></i></a><a id="' + id + '_button" class="n2-form-element-button n2-h5 n2-uc" href="#">Link</a></div></div></div></div>');
        nodes.find('input').val(value);
        return nodes;
    };


    QuickSlides.prototype.createTarget = function (label, id, value) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        var nodes = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-list"><select id="' + id + '" autocomplete="off" style="' + style + '"><option value="_self">Self</option><option value="_blank">Blank</option></select></div></div></div></div>');
        nodes.find('select').val(value);
        return nodes;
    };

    return QuickSlides;
});
N2D('Slide', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param manager
     * @param box
     * @constructor
     */
    function Slide(manager, box) {
        this.selected = false;
        this.manager = manager;

        this.box = box.data('slide', this)
            .addClass('n2-clickable');

        this.box
            .on('mouseenter', $.proxy(function () {
                this.manager.showMenu(this);
            }, this))
            .on('mouseleave', $.proxy(function () {
                this.manager.hideMenu();
            }, this))
            .on('click.n2-slide', $.proxy(this.goToEdit, this));

        this.publishElement = this.box.find('.n2-slide-published')
            .on('click', $.proxy(this.switchPublished, this));

        this.box.find('.n2-ss-box-select').on('click', $.proxy(function (e) {
            e.stopPropagation();
            e.preventDefault();

            this.invertSelection();
        }, this));
    };

    Slide.prototype.getId = function () {
        return this.box.data('slideid');
    };

    Slide.prototype.setFirst = function (e) {
        e.stopPropagation();
        e.preventDefault();
        N2Classes.AjaxHelper.ajax({
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.manager.ajaxUrl, {
                nextendaction: 'first'
            }),
            type: 'POST',
            data: {
                id: this.getId()
            }
        }).done($.proxy(function () {
            this.manager.unsetFirst();
            this.box.addClass('n2-slide-state-first');
        }, this));
    };

    Slide.prototype.unsetFirst = function () {
        this.box.removeClass('n2-slide-state-first');
    };

    Slide.prototype.switchPublished = function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.isPublished()) {
            this.manager.unPublishSlides([this.getId()], [this]);
        } else {
            this.manager.publishSlides([this.getId()], [this]);
        }
    };

    Slide.prototype.isPublished = function () {
        return this.box.hasClass('n2-slide-state-published');
    };

    Slide.prototype.published = function () {
        this.box.addClass('n2-slide-state-published');
    };

    Slide.prototype.unPublished = function () {
        this.box.removeClass('n2-slide-state-published');
    };

    Slide.prototype.goToEdit = function (e, isBlank) {
        if (this.manager.isBulkSelection) {
            this.invertSelection();
            e.preventDefault();
        } else {
            if (e.target.tagName !== 'A') {
                var editUrl = this.box.data('editurl');
                if (typeof isBlank !== 'undefined' && isBlank) {
                    window.open(editUrl, '_blank');
                } else if (editUrl === location.href) {
                    $("#n2-admin").toggleClass("n2-ss-slides-outer-container-visible");
                } else {
                    window.location = editUrl;
                }
            }
        }
    };

    Slide.prototype.duplicate = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var deferred = $.Deferred();
        N2Classes.AjaxHelper.ajax({
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.box.data('editurl'), {
                nextendaction: 'duplicate'
            })
        }).done($.proxy(function (response) {
            var box = $(response.data).insertAfter(this.box);
            var newSlide = new Slide(this.manager, box);
            this.manager.initSlides();
            deferred.resolve(newSlide);
        }, this));
        return deferred;
    };

    Slide.prototype.delete = function (e) {
        e.stopPropagation();
        e.preventDefault();
        this.manager.deleteSlides([this.getId()], [this]);
    };
    Slide.prototype.deleted = function () {
        this.box.remove();
    };

    Slide.prototype.invertSelection = function (e) {
        if (e) {
            e.preventDefault();
        }

        if (!this.selected) {
            this.select();
        } else {
            this.deSelect();
        }
    };

    Slide.prototype.select = function () {
        if (!this.selected) {
            this.selected = true;
            this.box.addClass('n2-selected');
            this.manager.addSelection(this);
        }
    };

    Slide.prototype.deSelect = function () {
        if (this.selected) {
            this.selected = false;
            this.box.removeClass('n2-selected');
            this.manager.removeSelection(this);
        }
    };

    Slide.prototype.publish = function (e) {
        this.switchPublished(e);
    };

    Slide.prototype.unpublish = function (e) {
        this.switchPublished(e);
    };

    Slide.prototype.generator = function (e) {
        window.location = this.box.data('generator');
    };

    Slide.prototype.copy = function (e) {
        this.manager.showSliderSelector(n2_('Copy slide to ...'), $.proxy(function (data) {
            N2Classes.AjaxHelper.ajax({
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.box.data('editurl'), {
                    nextendaction: 'copy',
                    targetSliderID: data.sliderID
                })
            });
        }, this));
    };

    return Slide;
});
N2D('SlidesManager', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function SlidesManager(ajaxUrl, contentAjaxUrl, parameters, isUploadDisabled, uploadUrl, uploadDir) {
        this.quickPostModal = null;
        this.quickVideoModal = null;
        this.parameters = parameters;
        this.slides = [];
        this.ajaxUrl = ajaxUrl;
        this.contentAjaxUrl = contentAjaxUrl;
        this.slidesPanel = $('#n2-ss-slides-container');
        this.slidesContainer = this.slidesPanel.find('.n2-ss-slides-container');

        this.initMenu();

        this.initSlidesOrderable();

        var slides = this.slidesContainer.find('.n2-box-slide');
        for (var i = 0; i < slides.length; i++) {
            this.slides.push(new N2Classes.Slide(this, slides.eq(i)));
        }

        $('body').attr('data-slides', this.slides.length);

        $('#n2-ss-slides').find('.n2-ss-slides-create-action-box').on('mouseup', $.proxy(function (e) {
            e.preventDefault();
            var which = 0;
            if (e.which !== undefined) {
                which = e.which;
            }
            if (which <= 2) {
                switch ($(e.currentTarget).data('action')) {
                    case 'image':
                        this.addQuickImage(e);
                        break;
                    case 'video':
                        this.addQuickVideo(e);
                        break;
                    case 'post':
                        this.addQuickPost(e);
                        break;
                    case 'empty':
                    case 'static':
                    case 'dynamic':
                        if (which === 2) {
                            window.open($(e.currentTarget).data('href'), '_blank').focus();
                        } else {
                            window.location = $(e.currentTarget).data('href');
                        }
                        break;
                    case 'library':
                        if (which === 2) {
                            window.open($(e.currentTarget).data('href'), '_blank').focus();
                        } else {
                            window.location = $(e.currentTarget).data('href');
                        }
                    
                        break;
                }
            }
        }, this));

        $('.n2-box-slide-dummy').on('click', $.proxy(this.addQuickImage, this));

        this.initBulk();


        if (!isUploadDisabled) {
            var images = [];
            this.slidesContainer.nUIFileUpload({
                url: uploadUrl,
                pasteZone: false,
                dataType: 'json',
                paramName: 'image',
                dropZone: $('.n2-ss-slides-outer-container'),

                add: $.proxy(function (e, data) {
                    data.formData = {path: '/' + uploadDir};
                    data.submit();
                }, this),

                done: $.proxy(function (e, data) {
                    var response = data.result;
                    if (response.data && response.data.name) {
                        images.push({
                            title: response.data.name.replace(/\.[^/.]+$/, ""),
                            description: '',
                            image: response.data.url
                        });
                    } else {
                        N2Classes.AjaxHelper.notification(response);
                    }

                }, this),

                fail: $.proxy(function (e, data) {
                    N2Classes.AjaxHelper.notification(data.jqXHR.responseJSON);
                }, this),

                start: function () {
                    N2Classes.AjaxHelper.startLoading();
                },

                stop: $.proxy(function () {
                    if (images.length) {
                        this._addQuickImages(images);
                    } else {
                        setTimeout(function () {
                            N2Classes.AjaxHelper.stopLoading();
                        }, 100);
                    }
                    images = [];
                }, this)
            });

            var timeout = null;
            this.slidesContainer.on('dragover', $.proxy(function (e) {
                if (timeout !== null) {
                    clearTimeout(timeout);
                    timeout = null;
                } else {
                    this.slidesContainer.addClass('n2-drag-over');
                }
                timeout = setTimeout($.proxy(function () {
                    this.slidesContainer.removeClass('n2-drag-over');
                    timeout = null;
                }, this), 400);

            }, this));
        }
    };

    SlidesManager.prototype.changed = function () {

    };

    SlidesManager.prototype.initSlidesOrderable = function () {
        this.slidesContainer.nUISortable({
            items: ".n2-box-slide",
            stop: $.proxy(this.saveSlideOrder, this),
            placeholder: 'n2-box-sortable-placeholder n2-box-sortable-placeholder-small',
            distance: 10,
            helper: 'clone'
        });
    };

    SlidesManager.prototype.saveSlideOrder = function (e) {
        var slideNodes = this.slidesContainer.find('.n2-box-slide'),
            slides = [],
            ids = [],
            originalIds = [];
        for (var i = 0; i < slideNodes.length; i++) {
            var slide = slideNodes.eq(i).data('slide');
            slides.push(slide);
            ids.push(slide.getId());
        }
        for (var i = 0; i < this.slides.length; i++) {
            originalIds.push(this.slides[i].getId());
        }

        if (JSON.stringify(originalIds) != JSON.stringify(ids)) {
            $(window).triggerHandler('SmartSliderSidebarSlidesOrderChanged');
            var queries = {
                nextendcontroller: 'slides',
                nextendaction: 'order'
            };
            N2Classes.AjaxHelper.ajax({
                type: 'POST',
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, queries),
                data: {
                    slideorder: ids
                }
            });
            this.slides = slides;
            this.changed();
        }
    };

    SlidesManager.prototype.initSlides = function () {
        var slideNodes = this.slidesContainer.find('.n2-box-slide'),
            slides = [];
        for (var i = 0; i < slideNodes.length; i++) {
            var slide = slideNodes.eq(i).data('slide');
            slides.push(slide);
        }
        this.slides = slides;
        this.changed();
        $(window).triggerHandler('SmartSliderSidebarSlidesChanged');

        $('body').attr('data-slides', this.slides.length);
    };

    SlidesManager.prototype.unsetFirst = function () {
        for (var i = 0; i < this.slides.length; i++) {
            this.slides[i].unsetFirst();
        }
        this.changed();
    };

    SlidesManager.prototype.addQuickImage = function (e) {
        e.preventDefault();
        nextend.imageHelper.openMultipleLightbox($.proxy(this._addQuickImages, this));
    };

    SlidesManager.prototype.addBoxes = function (boxes) {

        boxes.insertBefore(this.slidesContainer.find('.n2-clear'));
        boxes.addClass('n2-ss-box-just-added').each($.proxy(function (i, el) {
            new N2Classes.Slide(this, $(el));
        }, this));
        this.initSlides();
        setTimeout(function () {
            boxes.removeClass('n2-ss-box-just-added');
        }, 200);
    };

    SlidesManager.prototype._addQuickImages = function (_images) {
        var images = [];
        for (var i = 0; i < _images.length; i++) {
            if (_images[i].image.match(/\.(mp4)/i)) {
                N2Classes.Notification.error('MP4 videos are not supported in the Free version!');
            
            } else {
                images.push(_images[i]);
            }
        }
        if (images.length) {
            N2Classes.AjaxHelper.ajax({
                type: 'POST',
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                    nextendaction: 'quickImages'
                }),
                data: {
                    images: N2Classes.Base64.encode(JSON.stringify(images))
                }
            }).done($.proxy(function (response) {
                this.addBoxes($(response.data));
            }, this));
        }
    };

    SlidesManager.prototype.addQuickVideo = function (e) {
        e.preventDefault();
        var manager = this;
        if (!this.quickVideoModal) {
            this.quickVideoModal = new N2Classes.NextendModal({
                zero: {
                    size: [
                        500,
                        360
                    ],
                    title: n2_('Add video'),
                    back: false,
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Add video') + '</a>'],
                    fn: {
                        show: function () {
                            var button = this.controls.find('.n2-button'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                }).append(this.createInput(n2_('Video url'), 'n2-slide-video-url', 'width: 446px;')),
                                videoUrlField = this.content.find('#n2-slide-video-url').focus();

                            this.content.append(this.createHeading(n2_('Examples')));
                            this.content.append(this.createTable([['YouTube', 'https://www.youtube.com/watch?v=lsq09izc1H4'], ['Vimeo', 'https://vimeo.com/144598279']], ['', '']));

                            button.on('click', $.proxy($.proxy(function (e) {
                                e.preventDefault();
                                var video = videoUrlField.val(),
                                    youtubeRegexp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
                                    youtubeMatch = video.match(youtubeRegexp),
                                    vimeoRegexp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/,
                                    vimeoMatch = video.match(vimeoRegexp),
                                    html5Video = video.match(/\.(mp4)/i);

                                if (youtubeMatch) {
                                    N2Classes.AjaxHelper.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + encodeURI(youtubeMatch[2]) + '&part=snippet&key=AIzaSyC3AolfvPAPlJs-2FgyPJdEEKS6nbPHdSM').done($.proxy(function (data) {
                                        if (data.items.length) {
                                            var snippet = data.items[0].snippet;

                                            var thumbnails = data.items[0].snippet.thumbnails,
                                                thumbnail = thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default;

                                            manager._addQuickVideo(this, {
                                                type: 'youtube',
                                                title: snippet.title,
                                                description: snippet.description,
                                                image: thumbnail.url,
                                                video: video
                                            });
                                        }
                                    }, this)).fail(function (data) {
                                        N2Classes.Notification.error(data.error.errors[0].message);
                                    });
                                } else if (vimeoMatch) {
                                    N2Classes.AjaxHelper.getJSON('https://vimeo.com/api/v2/video/' + vimeoMatch[3] + '.json').done($.proxy(function (data) {
                                        manager._addQuickVideo(this, {
                                            type: 'vimeo',
                                            title: data[0].title,
                                            description: data[0].description,
                                            video: vimeoMatch[3],
                                            image: data[0].thumbnail_large
                                        });
                                    }, this)).fail(function (data) {
                                        N2Classes.Notification.error('Video not found or private.');
                                        manager._addQuickVideo(this, {
                                            type: 'vimeo',
                                            title: '',
                                            description: '',
                                            video: vimeoMatch[3],
                                            image: ''
                                        });
                                    });

                                } else if (html5Video) {
                                    N2Classes.Notification.error(n2_('This video url is not supported!'));
                                
                                } else {
                                    N2Classes.Notification.error(n2_('This video url is not supported!'));
                                }
                            }, this)));
                        }
                    }
                }
            });
        }
        this.quickVideoModal.show();
    };

    SlidesManager.prototype._addQuickVideo = function (modal, video) {
        N2Classes.AjaxHelper.ajax({
            type: 'POST',
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'quickVideo'
            }),
            data: {
                video: N2Classes.Base64.encode(encodeURIComponent(JSON.stringify(video)))
            }
        }).done($.proxy(function (response) {
            this.addBoxes($(response.data));

            this.initSlides();
        }, this));
        if (modal) modal.hide();
    };

    SlidesManager.prototype.addQuickPost = function (e) {
        e.preventDefault();
        if (!this.quickPostModal) {
            var manager = this,
                cache = {},
                getContent = $.proxy(function (search) {
                    if (typeof cache[search] == 'undefined') {
                        cache[search] = N2Classes.AjaxHelper.ajax({
                            type: "POST",
                            url: N2Classes.AjaxHelper.makeAjaxUrl(this.contentAjaxUrl),
                            data: {
                                keyword: search
                            },
                            dataType: 'json'
                        });
                    }
                    return cache[search];
                }, this);

            this.quickPostModal = new N2Classes.NextendModal({
                zero: {
                    size: [
                        600,
                        430
                    ],
                    title: n2_('Add post'),
                    back: false,
                    close: true,
                    content: '<div class="n2-form"></div>',
                    fn: {
                        show: function () {

                            this.content.find('.n2-form').append(this.createInput(n2_('Keyword'), 'n2-ss-keyword', 'width:546px;'));
                            var search = $('#n2-ss-keyword'),
                                heading = this.createHeading('').appendTo(this.content),
                                result = this.createResult().appendTo(this.content),
                                searchString = '';

                            search.on('keyup', $.proxy(function () {
                                searchString = search.val();
                                getContent(searchString).done($.proxy(function (r) {
                                    if (search.val() == searchString) {
                                        if (searchString == '') {
                                            heading.html(n2_('No search term specified. Showing recent items.'));
                                        } else {
                                            heading.html(n2_printf(n2_('Showing items match for "%s"'), searchString));
                                        }

                                        var rows = r.data,
                                            data = [],
                                            modal = this;
                                        for (var i = 0; i < rows.length; i++) {
                                            data.push([rows[i].title, rows[i].info, $('<div class="n2-button n2-button-normal n2-button-xs n2-button-green n2-radius-s n2-uc n2-h5">' + n2_('Select') + '</div>')
                                                .on('click', {post: rows[i]}, function (e) {
                                                    manager._addQuickPost(modal, e.data.post);
                                                })]);
                                        }
                                        result.html('');
                                        this.createTable(data, ['width:100%;', '', '']).appendTo(this.createTableWrap().appendTo(result));
                                    }
                                }, this));
                            }, this))
                                .trigger('keyup').focus();
                        }
                    }
                }
            });
        }
        this.quickPostModal.show();
    };

    SlidesManager.prototype._addQuickPost = function (modal, post) {
        if (!post.image) {
            post.image = '';
        }
        N2Classes.AjaxHelper.ajax({
            type: 'POST',
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'quickPost'
            }),
            data: {
                post: post
            }
        }).done($.proxy(function (response) {
            this.addBoxes($(response.data));

            this.initSlides();
        }, this));
        modal.hide();
    };

    SlidesManager.prototype.initBulk = function () {

        this.selection = [];

        this.isBulkSelection = false;

        var selects = $('.n2-bulk-select').find('a');

        //Select all
        selects.eq(0).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slide) {
                slide.select();
            });
        }, this));

        //Select none
        selects.eq(1).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slide) {
                slide.deSelect();
            });
        }, this));

        //Select published
        selects.eq(2).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slide) {
                if (slide.box.hasClass('n2-slide-state-published')) {
                    slide.select();
                } else {
                    slide.deSelect();
                }
            });
        }, this));

        //Select unpublished
        selects.eq(3).on('click', $.proxy(function (e) {
            e.preventDefault();
            this.bulkSelect(function (slide) {
                if (slide.box.hasClass('n2-slide-state-published')) {
                    slide.deSelect();
                } else {
                    slide.select();
                }
            });
        }, this));

        $('.n2-bulk-actions a').on('click', $.proxy(function (e) {
            var action = $(e.currentTarget).data('action');
            if (action) {
                e.preventDefault();
                this.bulkAction(action);
            }
        }, this));
    };

    SlidesManager.prototype.addSelection = function (slide) {
        if (this.selection.length == 0) {
            this.enterBulk();
        }
        this.selection.push(slide);
    };

    SlidesManager.prototype.removeSelection = function (slide) {
        this.selection.splice($.inArray(slide, this.selection), 1);
        if (this.selection.length == 0) {
            this.leaveBulk();
        }
    };

    SlidesManager.prototype.bulkSelect = function (cb) {
        for (var i = 0; i < this.slides.length; i++) {
            cb(this.slides[i]);
        }
    };

    SlidesManager.prototype.bulkAction = function (action) {
        var slides = [],
            ids = [];
        this.bulkSelect(function (slide) {
            if (slide.selected) {
                slides.push(slide);
                ids.push(slide.getId());
            }
        });
        if (ids.length) {
            this[action](ids, slides);
        } else {
            N2Classes.Notification.notice('Please select one or more slides for the action!');
        }
    };

    SlidesManager.prototype.enterBulk = function () {
        if (!this.isBulkSelection) {
            this.isBulkSelection = true;
            this.slidesContainer.nUISortable('option', 'disabled', true);
            $('#n2-admin').addClass('n2-ss-has-box-selection');
        }
    };

    SlidesManager.prototype.leaveBulk = function () {
        if (this.isBulkSelection) {
            this.slidesContainer.nUISortable('option', 'disabled', false);
            $('#n2-admin').removeClass('n2-ss-has-box-selection');

            for (var i = 0; i < this.slides.length; i++) {
                this.slides[i].deSelect();
            }
            this.selection = [];
            this.isBulkSelection = false;
        }
    };

    SlidesManager.prototype.deleteSlides = function (ids, slides) {
        this.hideMenu();
        var title = slides[0].box.find('.n2-box-placeholder-title a').text();
        if (slides.length > 1) {
            title += ' and ' + (slides.length - 1) + ' more';
        }
        N2Classes.NextendModal.deleteModal('slide-delete', title, $.proxy(function () {
            N2Classes.AjaxHelper.ajax({
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                    nextendaction: 'delete'
                }),
                type: 'POST',
                data: {
                    slides: ids
                }
            }).done($.proxy(function () {
                for (var i = 0; i < slides.length; i++) {
                    slides[i].deleted();
                }
                this.initSlides();
                this.leaveBulk();
            }, this));
        }, this));
    };

    SlidesManager.prototype.duplicateSlides = function (ids, slides) {
        for (var i = 0; i < this.slides.length; i++) {
            if (this.slides[i].selected) {
                this.slides[i].duplicate($.Event("click", {
                    currentTarget: null
                }));
            }
        }
    };

    SlidesManager.prototype.copySlides = function (ids, slides) {
        this.showSliderSelector(n2_('Copy slide to ...'), $.proxy(function (data) {
            N2Classes.AjaxHelper.ajax({
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                    nextendaction: 'copySlides',
                    targetSliderID: data.sliderID
                }),
                type: 'POST',
                data: {
                    slides: ids
                }
            });
        }, this));
    };

    SlidesManager.prototype.publishSlides = function (ids, slides) {
        N2Classes.AjaxHelper.ajax({
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'publish'
            }),
            type: 'POST',
            data: {
                slides: ids
            }
        }).done($.proxy(function () {
            for (var i = 0; i < slides.length; i++) {
                slides[i].published();
            }
            this.changed();
        }, this));
    };

    SlidesManager.prototype.unPublishSlides = function (ids, slides) {
        N2Classes.AjaxHelper.ajax({
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'unpublish'
            }),
            type: 'POST',
            data: {
                slides: ids
            }
        }).done($.proxy(function () {
            for (var i = 0; i < slides.length; i++) {
                slides[i].unPublished();
            }
            this.changed();
        }, this));
    };

    SlidesManager.prototype.initMenu = function () {
        this.slide = null;
        this.menu = $('#n2-ss-slide-menu').detach().addClass('n2-inited');

        this.menu.find('li').on('click', $.proxy(function (e) {
            e.stopPropagation();
            var action = $(e.currentTarget).data('action');
            if (action && typeof this.slide[action] === 'function') {
                this.slide[action](e);
            }

            this.menu.removeClass('n2-active').off('mouseleave');
        }, this));

        this.menu.find('.n2-button').on('click', $.proxy(function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.menu.hasClass('n2-active')) {
                this.menu.removeClass('n2-active').off('mouseleave');
            } else {
                this.menu.addClass('n2-active').on('mouseleave', function () {
                    $(this).removeClass('n2-active');
                });
            }
        }, this));
    };


    SlidesManager.prototype.showMenu = function (slide) {
        this.slide = slide;
        this.menu.appendTo(slide.box);
    };

    SlidesManager.prototype.hideMenu = function () {
        this.menu.detach();
    };

    SlidesManager.prototype.showSliderSelector = function (title, cb) {
        var url = N2Classes.AjaxHelper.makeFallbackUrl(this.ajaxUrl, {
            nextendcontroller: 'sliders',
            nextendaction: 'choose'
        });
        this.sliderSelectorModal = new N2Classes.NextendModal({
            zero: {
                size: [
                    970,
                    600
                ],
                title: title,
                back: false,
                close: true,
                content: '',
                fn: {
                    show: function () {
                        var iframe = $('<iframe src="' + url + '" width="970" height="540" style="margin: 0 -20px 0 -20px;"></iframe>').appendTo(this.content);

                        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
                        window[eventMethod](eventMethod == "attachEvent" ? "onmessage" : "message", $.proxy(function (e) {
                            if (e.source == (iframe[0].contentWindow || iframe[0].contentDocument)) {
                                var message = e[e.message ? "message" : "data"];
                                try {
                                    message = JSON.parse(message);
                                    if (message.action && message.action === 'ss3embed') {
                                        cb(message);
                                    }
                                } catch (ex) {

                                }
                                this.hide();
                            }
                        }, this), false);

                    },
                    destroy: function () {
                        this.destroy();
                    }
                }
            }
        }, true);
    };

    return SlidesManager;
});
N2D('SmartSliderSlideBackgroundAdmin', ['SmartSliderSlideBackground'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FrontendSliderSlide} slide
     * @param {jQuery} element
     * @param {N2Classes.SmartSliderBackgrounds} manager
     * @constructor
     */
    function SmartSliderSlideBackgroundAdmin(slide, element, manager) {

        this.types = {
            color: 'SmartSliderAdminSlideBackgroundColor',
            image: 'SmartSliderAdminSlideBackgroundImage',
            video: 'SmartSliderAdminSlideBackgroundVideo'
        };

        this.allowVisualLoad = true;
        this.slider = slide.slider;


        this.editor = nextend.currentEditor;

        N2Classes.SmartSliderSlideBackground.prototype.constructor.call(this, slide, element, manager);
    }

    SmartSliderSlideBackgroundAdmin.prototype = Object.create(N2Classes.SmartSliderSlideBackground.prototype);
    SmartSliderSlideBackgroundAdmin.prototype.constructor = SmartSliderSlideBackgroundAdmin;

    SmartSliderSlideBackgroundAdmin.prototype.setVisualLoad = function (state) {
        this.allowVisualLoad = state;
    };

    SmartSliderSlideBackgroundAdmin.prototype.setType = function (type) {
        if (type === 'color') {
            if (!this.elements.color) {
                this.createColorElement(true);
            }

            if (this.elements.image) {
                this.elements.image.kill();
                this.elements.image = false;
            }
        } else if (type === 'image') {
            if (!this.elements.color) {
                this.createColorElement(true);
            }

            if (!this.elements.image) {
                this.createImageElement();
            }
        } else {
        }
    };

    SmartSliderSlideBackgroundAdmin.prototype.setMode = function (newMode) {
        if (newMode === 'default') {
            newMode = this.slider.editor.options.slideBackgroundMode;
        }
        this.element.attr('data-mode', newMode);

        if (this.elements.image) {
            this.elements.image.updateMode(newMode, this.mode);
        }

        this.mode = newMode;
    };

    SmartSliderSlideBackgroundAdmin.prototype.setFocus = function (x, y) {
        if (this.elements.image) {
            this.elements.image.updateFocus(x, y);
        }
    };

    SmartSliderSlideBackgroundAdmin.prototype.setImageOpacity = function (opacity) {
        if (this.elements.image) {
            this.elements.image.updateOpacity(opacity);
        }
    };

    SmartSliderSlideBackgroundAdmin.prototype.setBlur = function (blur) {
        if (this.elements.image) {
            this.elements.image.updateBlur(blur);
        }
    };

    SmartSliderSlideBackgroundAdmin.prototype.createColorElement = function (needRefresh) {
        needRefresh = needRefresh || false;
        this.elements.color = new N2Classes[this.types.color](this, $('<div class="n2-ss-slide-background-color"></div>')
            .appendTo(this.$wrapElement));

        if (needRefresh) {
            this.elements.color.update(this.editor.settings.getBackgroundColor(), this.editor.settings.getBackgroundGradient(), this.editor.settings.getBackgroundColorEnd(), this.editor.settings.getBackgroundColorOverlay());
        }
    };

    SmartSliderSlideBackgroundAdmin.prototype.updateColor = function (color, gradient, colorEnd, isOverlay) {
        if (!this.elements.color) {
            this.createColorElement();
        }


        this.elements.color.update(color, gradient, colorEnd, isOverlay);
    };

    SmartSliderSlideBackgroundAdmin.prototype.createImageElement = function () {
        var settings = this.editor.settings,
            image = settings.getBackgroundImage();
        if (image !== '') {
            var imageUrl = nextend.imageHelper.fixed(image),
                $image = $('<div class="n2-ss-slide-background-image"/>')
                    .css({
                        opacity: settings.getBackgroundImageOpacity() / 100,
                        backgroundPosition: settings.getBackgroundFocusX() + '% ' + settings.getBackgroundFocusY() + '%'
                    })
                    .attr({
                        'data-hash': md5(image),
                        'data-desktop': imageUrl,
                        'data-blur': settings.getBackgroundImageBlur()
                    })
                    .appendTo(this.$wrapElement);
            this.elements.image = new N2Classes[this.types.image](this.slide, this.manager, this, $image);
            this.elements.image.preLoadAdmin(image);
        }
    };

    SmartSliderSlideBackgroundAdmin.prototype.setImage = function (image) {
        if (this.elements.image) {
            this.elements.image.setDesktopSrc(image);
        } else if (image !== '') {
            if (image.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp|svg)$/) === null) {
                N2Classes.Notification.error('The background image format is not correct! The supported image formats are: png, jpg, jpeg, gif, webp, svg.');
            } else if (this.editor.settings.getType() === 'image') {
                this.createImageElement(image);
            }
        }
    };

    return SmartSliderSlideBackgroundAdmin;
});
N2D('EditorAbstract', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {string} sliderElementID
     * @param {string} slideContentElementID
     * @param {object} options
     * @constructor
     * @abstract
     */
    function EditorAbstract(sliderElementID, slideContentElementID, options) {

        warnInternetExplorerUsers();

        this.readyDeferred = $.Deferred();

        this.sliderElementID = sliderElementID;
        this.slideContentElementID = slideContentElementID;

        this.readyDeferred.done($.proxy(function () {
            N2D('SSEditor', $.proxy(function () {
                return this;
            }, this));
        }, this));

        this.options = $.extend({
            slideAsFile: 0,
            isUploadDisabled: true,
            uploadUrl: '',
            uploadDir: ''
        }, options);

        /**
         * @type {N2Classes.EditorAbstract}
         */
        nextend.currentEditor = this;

        /** @type {N2Classes.SmartSliderAbstract} */
        this.frontend = null;
        /** @type {N2Classes.Generator} */
        this.generator = null;
        /** @type {N2Classes.FragmentEditor} */
        this.fragmentEditor = null;

        this.$editedElement = null;
        this.editedInstance = null;

        N2R('documentReady', $.proxy(function ($) {
            if (typeof nextend.fontsDeferred !== 'undefined') {
                nextend.fontsDeferred.done($.proxy(this.startEditor, this));
            } else {
                this.startEditor();
            }
        }, this));
    }

    /**
     * @abstract
     */
    EditorAbstract.prototype.startEditor = function () {
    };

    EditorAbstract.prototype.ready = function (fn) {
        this.readyDeferred.done(fn);
    };

    EditorAbstract.prototype.getSelf = function () {
        return this;
    };

    EditorAbstract.prototype.getAvailableDeviceModes = function () {
        return {
            "desktopPortrait": 1,
            "desktopLandscape": 0,
            "tabletPortrait": 1,
            "tabletLandscape": 1,
            "mobilePortrait": 1,
            "mobileLandscape": 1
        };
    };

    EditorAbstract.prototype.getGeneratorVariables = function () {
        return this.$editedElement.data('variables');
    };

    /**
     *
     * @returns {*} .n2-ss-layers-container
     */
    EditorAbstract.prototype.getMainContainerElement = function () {
        return this.$editedElement.find('.n2-ss-layers-container').addBack().last();
    };

    function warnInternetExplorerUsers() {
        var ie = isInternetExplorer();
        if (ie && ie < 10) {
            alert(window.ss2lang.The_editor_was_tested_under_Internet_Explorer_10_Firefox_and_Chrome_Please_use_one_of_the_tested_browser);
        }
    }

    function isInternetExplorer() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }


    return EditorAbstract;
});
N2D('EditorSlide', ['EditorAbstract'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {string} sliderElementID
     * @param {string} slideContentElementID
     * @param {object} options
     * @constructor
     * @augments {N2Classes.EditorAbstract}
     */
    function EditorSlide(sliderElementID, slideContentElementID, options) {

        N2Classes.EditorAbstract.prototype.constructor.call(this, sliderElementID, slideContentElementID, $.extend({
            isAddSample: false,
            sampleSlidesUrl: '',
            slideBackgroundMode: 'fill'
        }, options));

    }

    EditorSlide.prototype = Object.create(N2Classes.EditorAbstract.prototype);
    EditorSlide.prototype.constructor = EditorSlide;


    EditorSlide.prototype.startEditor = function () {

        this.$slideContentElement = $('#' + this.slideContentElementID);
        this.slideStartValue = this.$slideContentElement.val();

        N2R('#' + this.sliderElementID, $.proxy(function ($, slider) {
            /** @type {N2Classes.SmartSliderAbstract} */
            this.frontend = slider;
            this.frontend.editor = this;
            nextend.pre = 'div#' + this.frontend.elementID + ' ';

            this.frontend.visible($.proxy(this.sliderStarted, this));
        }, this));
    };

    EditorSlide.prototype.sliderStarted = function () {

        $('body').addClass('n2-ss-slider-visible');

        this.scrollbar = new N2Classes.HorizontalScrollBar($("#n2-ss-slide-canvas-container"));

        this.frontend.sliderElement.on('SliderResize', $.proxy(function () {
            this.scrollbar.update();
        }, this));


        this.$editedElement = this.frontend.sliderElement.find('.n2-ss-currently-edited-slide');
        this.editedInstance = this.$editedElement.data('slide');

        var isStatic = this.$editedElement.hasClass('n2-ss-static-slide');

        this.generator = new N2Classes.Generator(this);

        this.generator.registerFields([
            '#slidetitle',
            '#sldedescription',
            '#slidethumbnail',
            '#slidebackgroundImage',
            '#slidebackgroundAlt',
            '#slidebackgroundTitle',
            '#slidebackgroundVideoMp4',
            '#slidebackgroundColor',
            '#slidebackgroundColorEnd',
            '#slidehref',
            '#layergenerator-visible',
            '#layergroup-generator-visible'
        ]);

        this.generator.registerGlobalField('slide', 'name', '#slidetitle');
        this.generator.registerGlobalField('slide', 'description', '#slidedescription');

        this.getMainContainerElement().on('updateSize', $.proxy(this.updateSize, this));

        this.settings = new N2Classes.SlideSettings(this, isStatic);

        var fragmentEditorConfiguration = {};
        if (isStatic) {
            fragmentEditorConfiguration.snapSelector = '.n2-ss-static-slide .n2-ss-layer.nui-resizable:not(.n2-ss-layer-locked):not(.n2-ss-layer-parent):not(.n2-ss-layer-selected):visible, .n2-ruler-user-guide';
        } else {
            fragmentEditorConfiguration.snapSelector = '.n2-ss-slide.n2-ss-slide-active .n2-ss-layer.nui-resizable:not(.n2-ss-layer-locked):not(.n2-ss-layer-parent):not(.n2-ss-layer-selected):visible, .n2-ruler-user-guide';
        }

        this.fragmentEditor = new N2Classes.FragmentEditor(this, this.getFrontendSlide().$element, fragmentEditorConfiguration, this.options);

        this.getFrontendElement()
            .on({
                SliderResize: $.proxy(this.fragmentEditor.onResize, this.fragmentEditor),
                SliderDeviceOrientation: $.proxy(this.fragmentEditor.onChangeDeviceOrientation, this.fragmentEditor)
            });

        this.readyDeferred.resolve();


        $('#smartslider-form').on({
            checkChanged: $.proxy(this.prepareFormForCheck, this),
            submit: $.proxy(this.onSlideSubmit, this)
        });

        if (this.options.isAddSample) {
            this.startSampleSlides();
        }
    };

    EditorSlide.prototype.prepareFormForCheck = function () {
        var data = JSON.stringify(this.fragmentEditor.getData()),
            startData = JSON.stringify(JSON.parse(N2Classes.Base64.decode(this.slideStartValue)));

        this.$slideContentElement.val(startData == data ? this.slideStartValue : N2Classes.Base64.encode(data));
    };

    EditorSlide.prototype.onSlideSubmit = function (e) {
        if (!nextend.isPreview) {
            this.prepareForm();
            e.preventDefault();

            nextend.askToSave = false;

            //$('#n2-admin').removeClass('n2-ss-add-slide-with-sample');

            if (this.options.slideAsFile && typeof window.FormData !== undefined && typeof window.File !== 'undefined') {
                var fd = new FormData();
                var data = $('#smartslider-form').serializeArray();
                $.each(data, function (key, input) {
                    if (input.name == 'slide[slide]') {
                        try {
                            fd.append('slide', new Blob([input.value]), "slide.txt");
                        } catch (e) {
                            try {
                                fd.append('slide', new Blob([input.value]));
                            } catch (e) {
                                try {
                                    fd.append('slide', new File([input.value], "slide.txt"));
                                } catch (e) {
                                    N2Classes.Notification.notice('Your browser does not support File api, please disable "Send slide as file" option in the global settings.');
                                }
                            }
                        }
                    } else {
                        fd.append(input.name, input.value);
                    }
                });

                N2Classes.AjaxHelper.ajax({
                    url: N2Classes.AjaxHelper.makeAjaxUrl(window.location.href),
                    type: 'POST',
                    data: fd,
                    contentType: false,
                    processData: false
                }).done($.proxy(this.afterSave, this));
            } else {
                N2Classes.AjaxHelper.ajax({
                    type: 'POST',
                    url: N2Classes.AjaxHelper.makeAjaxUrl(window.location.href),
                    data: $('#smartslider-form').serialize(),
                    dataType: 'json'
                }).done($.proxy(this.afterSave, this));
            }
        }
    };

    EditorSlide.prototype.afterSave = function () {
        nextend.askToSave = true;
        $('#smartslider-form').trigger('saved');

        $('.n2-ss-edit-slide-top-details .n2-h1').text($('#slidetitle').val());
    };

    EditorSlide.prototype.prepareForm = function () {
        if (this.fragmentEditor.canvasSettings.ruler) {
            $('#slideguides').val(N2Classes.Base64.encode(JSON.stringify(this.fragmentEditor.canvasSettings.ruler.toArray())));
        }

        this.$slideContentElement.val(N2Classes.Base64.encode(nextend.UnicodeToHTMLEntity(JSON.stringify(this.fragmentEditor.getData()))));
    };

    EditorSlide.prototype.getLayout = function () {
        var propertiesRaw = $('#smartslider-form').serializeArray(),
            properties = {};

        for (var i = 0; i < propertiesRaw.length; i++) {
            var m = propertiesRaw[i].name.match(/slide\[(.*?)\]/);
            if (m) {
                properties[m[1]] = propertiesRaw[i].value;
            }
        }
        delete properties['generator'];
        delete properties['published'];
        delete properties['publishdates'];
        delete properties['record-start'];
        delete properties['record-slides'];
        delete properties['slide'];

        properties['slide'] = this.fragmentEditor.getData();
        return properties;
    };

    EditorSlide.prototype.loadLayout = function (properties, slideDataOverwrite, layerOverwrite) {
        // we are working on references!
        var slide = properties['slide'];
        delete properties['slide'];
        if (layerOverwrite) {
            this.fragmentEditor.importLayers(slide, true);
        } else {
            this.fragmentEditor.importLayers(slide, false);
        }
        if (slideDataOverwrite) {
            for (var k in properties) {
                $('#slide' + k).val(properties[k]).trigger('change');
            }
        }
        properties['slide'] = slide;
    };

    EditorSlide.prototype.copy = function () {
        var slide = {
            data: this.settings.getBackgroundData(),
            layers: this.fragmentEditor.getData()
        };
        $.jStorage.set('copiedSlide', JSON.stringify(slide));
    };

    EditorSlide.prototype.paste = function () {
        var slide = $.jStorage.get('copiedSlide');
        if (slide) {
            slide = JSON.parse(slide);
            this.settings.setData(slide.data);

            this.fragmentEditor.mainContainer.replaceLayers(slide.layers);
        }
    };

    EditorSlide.prototype.hasClipboard = function () {
        var slide = $.jStorage.get('copiedSlide');
        if (slide) {
            return true;
        }
        return false;
    };

    EditorSlide.prototype.startSampleSlides = function () {

        var that = this,
            eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
            $iframe = $('<iframe src="' + this.options.sampleSlidesUrl + '"></iframe>').prependTo('.n2-ss-sample-slides-container'),
            iframe = $iframe[0];

        $('html, body').scrollTop($iframe.offset().top - $('#wpadminbar').height());

        var $settings = $('.n2-ss-sample-slide-settings');

        var $type = $('#slidebackground-type'),
            $backgroundImage = $('#slidebackgroundImage'),
            $sampleBackgroundImage = $('#n2-ss-sample-slide-setting-background-image')
                .on('click', function () {
                    $backgroundImage.parent().find('.n2-form-element-button').trigger('click');
                }),
            cbUpdateBackgroundImage = function () {
                var image = $backgroundImage.val();
                if (image === '') {
                    $settings.removeClass('n2-ss-has-image');
                    $sampleBackgroundImage.css('background-image', 'url(' + nextend.imageHelper.fixed('$system$/images/placeholder/image.png') + ')');
                    if ($type.val() !== 'color') {
                        $type.val('color')
                            .trigger('change');
                    }
                } else {
                    $settings.addClass('n2-ss-has-image');
                    if ($type.val() !== 'image') {
                        $type.val('image')
                            .trigger('change');
                    }
                    $sampleBackgroundImage.css('background-image', 'url(' + nextend.imageHelper.fixed(image) + ')');
                }
            };

        $sampleBackgroundImage.find('.n2-i-close').on('click', function (e) {
            e.stopPropagation();
            $backgroundImage.parent().find('.n2-form-element-clear').trigger('click');
        });

        $backgroundImage.on('nextendChange', cbUpdateBackgroundImage);
        cbUpdateBackgroundImage();

        var $opacityField = $('#slidebackgroundImageOpacity'),
            $opacitySlider = $('#n2-ss-sample-slide-setting-opacity-slider').removeAttr('slide').prop('slide', false).nUISlider({
                min: 0,
                max: 100,
                step: 1,
                slide: function (event, ui) {
                    $opacityField.data('field').insideChange(ui.value);
                }
            }),
            cb = function (e) {
                $opacitySlider.nUISlider("option", 'value', $opacityField.val());
            };

        $opacityField.on('nextendChange', cb);
        cb();

        var $blurField = $('#slidebackgroundImageBlur'),
            $blurSlider = $('#n2-ss-sample-slide-setting-blur-slider').removeAttr('slide').prop('slide', false).nUISlider({
                min: 0,
                max: 40,
                step: 1,
                slide: function (event, ui) {
                    $blurField.data('field').insideChange(ui.value);
                }
            }),
            cb2 = function (e) {
                $blurSlider.nUISlider("option", 'value', $blurField.val());
            };

        $blurField.on('nextendChange', cb2);
        cb2();

        var $colorField = $('#slidebackgroundColor'),
            $color = $('#n2-ss-sample-slide-setting-color')
                .n2spectrum({
                    showAlpha: 1,
                    preferredFormat: "hex8",
                    showInput: false,
                    showButtons: false,
                    move: function () {
                        var value = $color.n2spectrum("get").toHexString8();
                        $color.val(value);
                        $colorField.data('field').insideChange(value);
                    },
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
                }),
            cb3 = function (e) {
                var color = $colorField.val();
                if (color !== $color.val()) {
                    $color.n2spectrum("set", color);
                }
            };
        $colorField.on('nextendChange', cb3);
        cb3();


        var $gradientDir = $('#slidebackgroundGradient'),
            cb4 = function () {
                if ($gradientDir.val() === 'off') {
                    $settings.removeClass('n2-ss-has-gradient');
                } else {
                    $settings.addClass('n2-ss-has-gradient');
                }
            };
        $gradientDir.on('nextendChange', cb4);
        cb4();

        var $gradientField = $('#slidebackgroundColorEnd'),
            gradient = $('#n2-ss-sample-slide-setting-gradient')
                .n2spectrum({
                    showAlpha: 1,
                    preferredFormat: "hex8",
                    showInput: false,
                    showButtons: false,
                    move: function () {
                        var value = gradient.n2spectrum("get").toHexString8();
                        $gradientField.data('field').insideChange(value);
                    },
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
                }),
            cb5 = function (e) {
                gradient.n2spectrum("set", $gradientField.val());
            };
        $gradientField.on('outsideChange', cb5);
        cb5();

        window[eventMethod](eventMethod == "attachEvent" ? "onmessage" : "message", function (e) {
            if (e.source == (iframe.contentWindow || iframe.contentDocument)) {
                var a = e[e.message ? "message" : "data"];
                if (a.key) {
                    switch (a.key) {
                        case 'sampleSlide':
                            var slide = JSON.parse(a.data);
                            that.settings.setData(slide.data, true);

                            that.fragmentEditor.mainContainer.replaceLayers(slide.layers);

                            if (that.fragmentEditor.currentEditorMode != 'content' && that.fragmentEditor.mainContent != undefined) {
                                that.fragmentEditor.updateEditorMode('content');
                            }
                            break;

                        case 'ready':
                            (iframe.contentWindow || iframe.contentDocument).postMessage({
                                key: 'ackReady'
                            }, "*");
                            if (that.options.isAddSample) {
                                (iframe.contentWindow || iframe.contentDocument).postMessage({
                                    key: 'create'
                                }, "*");
                                that.options.isAddSample = false;
                            }
                            break;
                    }
                }
            }
        }, false);
    };

    EditorSlide.prototype.getAvailableDeviceModes = function () {
        return this.frontend.responsive.parameters.deviceModes;
    };

    EditorSlide.prototype.getSlideBackground = function () {
        return this.$editedElement.data('slideBackground');
    };

    /**
     *
     * @returns {jQuery} #n2-ss-0
     */
    EditorSlide.prototype.getFrontendElement = function () {
        return this.frontend.sliderElement;
    };

    /**
     * @returns {N2Classes.FrontendSliderSlide}
     */
    EditorSlide.prototype.getFrontendSlide = function () {
        return this.editedInstance;
    };

    EditorSlide.prototype.getHorizontalRatio = function () {
        return this.frontend.responsive.lastRatios.slideW;
    };

    EditorSlide.prototype.getVerticalRatio = function () {
        return this.frontend.responsive.lastRatios.slideH;
    };

    EditorSlide.prototype.updateSize = function () {
        return this.frontend.responsive.doVerticalResize();
    };

    EditorSlide.prototype.getDeviceMode = function () {
        return this.frontend.responsive.getNormalizedModeString();
    };

    return EditorSlide;
});
N2D('Generator', ['EditorAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.EditorAbstract} editor
     * @constructor
     */
    function Generator(editor) {

        /**
         * @type {N2Classes.EditorAbstract}
         */
        this.editor = editor;
        this._refreshTimeout = null;
        this.modal = false;
        this.group = 0;
        this.editor.generator = this;
        var variables = this.editor.getGeneratorVariables();
        if (variables) {
            this.variables = variables;

            for (var i in this.variables) {
                if (!isNaN(parseFloat(i)) && isFinite(i)) {
                    this.group = Math.max(this.group, parseInt(i) + 1);
                }
            }

            this.fill = this.generatorFill;
            if (this.group > 0) {
                this.registerField = this.generatorRegisterField;

                this.button = $('<a href="#" class="n2-button n2-button-normal n2-button-xs n2-radius-s n2-button-blue n2-h5 n2-uc" style="position:absolute;right: -2px;top: -18px;">Variable</a>')
                    .on('click', $.proxy(function (e) {
                        e.preventDefault();
                        this.showModal();
                    }, this));


                $('body').addClass('n2-ss-dynamic-slide');
            }
        } else {
            this.variables = null;
        }
    }

    Generator.prototype.isDynamicSlide = function () {
        return this.group > 0;
    };

    Generator.prototype.splitTokens = function (input) {
        var tokens = [];
        var currentToken = "";
        var nestingLevel = 0;
        for (var i = 0; i < input.length; i++) {
            var currentChar = input[i];
            if (currentChar === "," && nestingLevel === 0) {
                tokens.push(currentToken);
                currentToken = "";
            } else {
                currentToken += currentChar;
                if (currentChar === "(") {
                    nestingLevel++;
                }
                else if (currentChar === ")") {
                    nestingLevel--;
                }
            }
        }
        if (currentToken.length) {
            tokens.push(currentToken);
        }
        return tokens;
    };

    Generator.prototype.fill = function (value) {
        return value;
    };

    Generator.prototype.generatorFill = function (value) {
        return value.replace(/{((([a-z]+)\(([^}]+)\))|([a-zA-Z0-9][a-zA-Z0-9_\/]*))}/g, $.proxy(this.parseFunction, this));
    };

    Generator.prototype.parseFunction = function (s, s2, s3, functionName, argumentString, variable) {
        if (typeof variable == 'undefined') {

            var args = this.splitTokens(argumentString);
            for (var i = 0; i < args.length; i++) {
                args[i] = this.parseVariable(args[i]);
            }
            if (typeof this[functionName] === 'function') {
                return this[functionName].apply(this, args);
            }
            return s;
        } else {
            return this.parseVariable(variable);
        }
    };

    Generator.prototype.parseVariable = function (variable) {
        var _string = variable.match(/^("|')(.*)("|')$/);
        if (_string) {
            return _string[2];
        }

        var functionMatch = variable.match(/((([a-z]+)\(([^}]+)\)))/);
        if (functionMatch) {
            return this.parseFunction.apply(this, functionMatch);
        } else {
            var variableMatch = variable.match(/([a-zA-Z][0-9a-zA-Z_]*)(\/([0-9a-z]+))?/);
            if (variableMatch) {
                var index = variableMatch[3];
                if (typeof index == 'undefined') {
                    index = 0;
                } else {
                    var i = parseInt(index);
                    if (!isNaN(i)) {
                        index = Math.max(index, 1) - 1;
                    }
                }
                if (typeof this.variables[index] != 'undefined' && typeof this.variables[index][variableMatch[1]] != 'undefined') {
                    return this.variables[index][variableMatch[1]];
                }
                return '';
            }
            return variable;
        }
    };

    Generator.prototype.fallback = function (variable, def) {
        if (variable == '') {
            return def;
        }
        return variable;
    };

    Generator.prototype.cleanhtml = function (variable) {
        return this.stripTags(variable, '<p><a><b><br /><br/><i>');
    };

    Generator.prototype.stripTags = function (input, allowed) {
        allowed = (((allowed || '') + '')
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g) || [])
            .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '')
            .replace(tags, function ($0, $1) {
                return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
            });
    };

    Generator.prototype.removehtml = function (variable) {
        return $('<div>' + variable + '</div>').text();
    };

    Generator.prototype.splitbychars = function (s, start, length) {
        return s.substr(start, length);
    };

    Generator.prototype.splitbywords = function (variable, start, length) {
        var s = variable,
            len = s.length,
            posStart = Math.max(0, start == 0 ? 0 : s.indexOf(' ', start)),
            posEnd = Math.max(0, length > len ? len : s.indexOf(' ', length));
        if (posEnd == 0 && length <= len) posEnd = len;
        return s.substr(posStart, posEnd);
    };

    Generator.prototype.findimage = function (variable, index) {
        var s = variable,
            re = /(<img.*?src=[\'"](.*?)[\'"][^>]*>)|(background(-image)??\s*?:.*?url\((["|\']?)?(.+?)(["|\']?)?\))/gi,
            r = [],
            tmp = null;

        index = typeof index != 'undefined' ? parseInt(index) - 1 : 0;

        while (tmp = re.exec(s)) {
            if (typeof tmp[2] != 'undefined') {
                r.push(tmp[2]);
            } else if (typeof tmp[6] != 'undefined') {
                r.push(tmp[6]);
            }
        }

        if (r.length) {
            if (r.length > index) {
                return r[index];
            } else {
                return r[r.length - 1];
            }
        } else {
            return '';
        }
    };

    Generator.prototype.findlink = function (variable, index) {
        var s = variable,
            re = /href=["\']?([^"\'>]+)["\']?/gi,
            r = [],
            tmp = null;

        index = typeof index != 'undefined' ? parseInt(index) - 1 : 0;

        while (tmp = re.exec(s)) {
            if (typeof tmp[1] != 'undefined') {
                r.push(tmp[1]);
            }
        }

        if (r.length) {
            if (r.length > index) {
                return r[index];
            } else {
                return r[r.length - 1];
            }
        } else {
            return '';
        }
    };

    Generator.prototype.removevarlink = function (variable) {
        var s = String(variable),
            re = /<a href=\"(.*?)\">(.*?)<\/a>/g;

        return s.replace(re, '');
    };

    Generator.prototype.removelinebreaks = function (variable) {
        var s = String(variable),
            re = /\r?\n|\r/g;
        return s.replace(re, '');
    };

    Generator.prototype.registerFields = function (fields) {
        for (var i = 0; i < fields.length; i++) {
            this.registerField(fields[i]);
        }
    };

    Generator.prototype.registerGlobalField = function (namespace, name, field) {
        if (this.variables !== null) {
            field = $(field).on('nextendChange', $.proxy(function () {
                this.variables[namespace][name] = field.val();
                this.refresh();
            }, this));
        }
    };

    Generator.prototype.registerField = function (field) {
    };

    Generator.prototype.generatorRegisterField = function (field) {
        field = $(field);
        var parent = field.parent();
        parent.on({
            mouseenter: $.proxy(function () {
                this.activeField = field;
                this.button.prependTo(parent);
            }, this)
        });
    };

    Generator.prototype.getModal = function () {
        var that = this;
        if (!this.modal) {
            var active = {
                    key: '',
                    group: 1,
                    filter: 'no',
                    split: 'no',
                    splitStart: 0,
                    splitLength: 300,
                    findImage: 0,
                    findImageIndex: 1,
                    findLink: 0,
                    findLinkIndex: 1,
                    removeVarLink: 0,
                    removelinebreaks: 0
                },
                getVariableString = function () {
                    var variable = active.key + '/' + active.group;
                    if (active.findImage) {
                        variable = 'findimage(' + variable + ',' + Math.max(1, active.findImageIndex) + ')';
                    }
                    if (active.findLink) {
                        variable = 'findlink(' + variable + ',' + Math.max(1, active.findLinkIndex) + ')';
                    }
                    if (active.removeVarLink) {
                        variable = 'removevarlink(' + variable + ')';
                    }
                    if (active.removelinebreaks) {
                        variable = 'removelinebreaks(' + variable + ')';
                    }
                    if (active.filter != 'no') {
                        variable = active.filter + '(' + variable + ')';
                    }
                    if (active.split != 'no' && active.splitStart >= 0 && active.splitLength > 0) {
                        variable = active.split + '(' + variable + ',' + active.splitStart + ',' + active.splitLength + ')';
                    }
                    return '{' + variable + '}';
                },
                resultContainer = $('<div class="n2-generator-result-container" />'),
                updateResult = function () {
                    resultContainer.html($('<div/>').text(that.fill(getVariableString())).html());
                };

            var group = that.group,
                variables = null,
                groups = null,
                content = $('<div class="n2-generator-insert-variable"/>');


            var groupHeader = N2Classes.NextendModal.prototype.createHeading(n2_('Choose the group')).appendTo(content);
            var groupContainer = $('<div class="n2-group-container" />').appendTo(content);


            content.append(N2Classes.NextendModal.prototype.createHeading(n2_('Choose the variable')));
            var variableContainer = $('<div class="n2-variable-container webkit-scroll-fix" />').appendTo(content);

            //content.append(N2Classes.NextendModal.prototype.createHeading('Functions'));
            var functionsContainer = $('<div class="n2-generator-functions-container n2-form-element-mixed" />')
                .appendTo($('<div class="n2-form" />').appendTo(content));

            content.append(N2Classes.NextendModal.prototype.createHeading(n2_('Result')));
            resultContainer.appendTo(content);


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Filter') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-list"><select autocomplete="off" name="filter" id="n2-generator-function-filter"><option selected="selected" value="no">' + n2_('No') + '</option><option value="cleanhtml">' + n2_('Clean HTML') + '</option><option value="removehtml">' + n2_('Remove HTML') + '</option></select></div></div></div>')
                .appendTo(functionsContainer);
            var filter = functionsContainer.find('#n2-generator-function-filter');
            filter.on('change', $.proxy(function () {
                active.filter = filter.val();
                updateResult();
            }, this));


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Split by chars') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-list"><select autocomplete="off" name="split" id="n2-generator-function-split"><option selected="selected" value="no">' + n2_('No') + '</option><option value="splitbychars">' + n2_('Strict') + '</option><option value="splitbywords">' + n2_('Respect words') + '</option></select></div><div class="n2-form-element-text n2-text-has-unit n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + n2_('Start') + '</div><input type="text" autocomplete="off" style="width: 22px;" class="n2-h5" value="0" id="n2-generator-function-split-start"></div><div class="n2-form-element-text n2-text-has-unit n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + n2_('Length') + '</div><input type="text" autocomplete="off" style="width: 22px;" class="n2-h5" value="300" id="n2-generator-function-split-length"></div></div></div>')
                .appendTo(functionsContainer);
            var split = functionsContainer.find('#n2-generator-function-split');
            split.on('change', $.proxy(function () {
                active.split = split.val();
                updateResult();
            }, this));
            var splitStart = functionsContainer.find('#n2-generator-function-split-start');
            splitStart.on('change', $.proxy(function () {
                active.splitStart = parseInt(splitStart.val());
                updateResult();
            }, this));
            var splitLength = functionsContainer.find('#n2-generator-function-split-length');
            splitLength.on('change', $.proxy(function () {
                active.splitLength = parseInt(splitLength.val());
                updateResult();
            }, this));


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Find image') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-onoff"><div class="n2-onoff-slider"><div class="n2-onoff-yes"><i class="n2-i n2-i-tick"></i></div><div class="n2-onoff-round"></div><div class="n2-onoff-no"><i class="n2-i n2-i-close"></i></div></div><input type="hidden" autocomplete="off" value="0" id="n2-generator-function-findimage"></div><div class="n2-form-element-text n2-text-has-unit n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + n2_('Index') + '</div><input type="text" autocomplete="off" style="width: 22px;" class="n2-h5" value="1" id="n2-generator-function-findimage-index"></div></div></div>')
                .appendTo(functionsContainer);

            var findImage = functionsContainer.find('#n2-generator-function-findimage');
            findImage.on('nextendChange', $.proxy(function () {
                active.findImage = parseInt(findImage.val());
                updateResult();
            }, this));
            var findImageIndex = functionsContainer.find('#n2-generator-function-findimage-index');
            findImageIndex.on('change', $.proxy(function () {
                active.findImageIndex = parseInt(findImageIndex.val());
                updateResult();
            }, this));

            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Find link') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-onoff"><div class="n2-onoff-slider"><div class="n2-onoff-yes"><i class="n2-i n2-i-tick"></i></div><div class="n2-onoff-round"></div><div class="n2-onoff-no"><i class="n2-i n2-i-close"></i></div></div><input type="hidden" autocomplete="off" value="0" id="n2-generator-function-findlink"></div><div class="n2-form-element-text n2-text-has-unit n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + n2_('Index') + '</div><input type="text" autocomplete="off" style="width: 22px;" class="n2-h5" value="1" id="n2-generator-function-findlink-index"></div></div></div>')
                .appendTo(functionsContainer);

            var findLink = functionsContainer.find('#n2-generator-function-findlink');
            findLink.on('nextendChange', $.proxy(function () {
                active.findLink = parseInt(findLink.val());
                updateResult();
            }, this));
            var findLinkIndex = functionsContainer.find('#n2-generator-function-findlink-index');
            findLinkIndex.on('change', $.proxy(function () {
                active.findLinkIndex = parseInt(findLinkIndex.val());
                updateResult();
            }, this));


            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Remove links') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-onoff"><div class="n2-onoff-slider"><div class="n2-onoff-yes"><i class="n2-i n2-i-tick"></i></div><div class="n2-onoff-round"></div><div class="n2-onoff-no"><i class="n2-i n2-i-close"></i></div></div><input type="hidden" autocomplete="off" value="0" id="n2-generator-function-removevarlink"></div></div></div>')
                .appendTo(functionsContainer);

            var removeVarLink = functionsContainer.find('#n2-generator-function-removevarlink');
            removeVarLink.on('nextendChange', $.proxy(function () {
                active.removeVarLink = parseInt(removeVarLink.val());
                updateResult();
            }, this));
            var removeVarLinkIndex = functionsContainer.find('#n2-generator-function-removevarlink-index');
            removeVarLinkIndex.on('change', $.proxy(function () {
                active.removeVarLinkIndex = parseInt(removeVarLinkIndex.val());
                updateResult();
            }, this));

            $('<div class="n2-mixed-group"><div class="n2-mixed-label"><label>' + n2_('Remove line breaks') + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-onoff"><div class="n2-onoff-slider"><div class="n2-onoff-yes"><i class="n2-i n2-i-tick"></i></div><div class="n2-onoff-round"></div><div class="n2-onoff-no"><i class="n2-i n2-i-close"></i></div></div><input type="hidden" autocomplete="off" value="0" id="n2-generator-function-removelinebreaks"></div></div></div>')
                .appendTo(functionsContainer);

            var removelinebreaks = functionsContainer.find('#n2-generator-function-removelinebreaks');
            removelinebreaks.on('nextendChange', $.proxy(function () {
                active.removelinebreaks = parseInt(removelinebreaks.val());
                updateResult();
            }, this));
            var removelinebreaksIndex = functionsContainer.find('#n2-generator-function-removelinebreaks-index');
            removelinebreaksIndex.on('change', $.proxy(function () {
                active.removelinebreaksIndex = parseInt(removelinebreaksIndex.val());
                updateResult();
            }, this));

            for (var k in this.variables[0]) {
                $('<a href="#" class="n2-button n2-button-normal n2-button-s n2-button-grey n2-radius-s">' + k + '</a>')
                    .on('click', $.proxy(function (key, e) {
                        e.preventDefault();
                        variables.removeClass('n2-active');
                        $(e.currentTarget).addClass('n2-active');
                        active.key = key;
                        updateResult();
                    }, this, k))
                    .appendTo(variableContainer);
            }

            variables = variableContainer.find('a');
            variables.eq(0).trigger('click');

            if (group == 1) {
                groupHeader.css('display', 'none');
                groupContainer.css('display', 'none');
            }
            for (var i = 0; i < group; i++) {
                $('<a href="#" class="n2-button n2-button-normal n2-button-s n2-button-grey n2-radius-s">' + (i + 1) + '</a>')
                    .on('click', $.proxy(function (groupIndex, e) {
                        e.preventDefault();
                        groups.removeClass('n2-active');
                        $(e.currentTarget).addClass('n2-active');
                        active.group = groupIndex + 1;
                        updateResult();
                    }, this, i))
                    .appendTo(groupContainer);
            }
            groups = groupContainer.find('a');
            groups.eq(0).trigger('click');

            var inited = false;

            this.modal = new N2Classes.NextendModal({
                zero: {
                    size: [
                        1000,
                        group > 1 ? 670 : 600
                    ],
                    title: n2_('Insert variable'),
                    back: false,
                    close: true,
                    content: content,
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green">' + n2_('Insert') + '</a>'],
                    fn: {
                        show: function () {
                            if (!inited) {
                                new N2Classes.FormElementOnoff("n2-generator-function-findimage");
                                new N2Classes.FormElementOnoff("n2-generator-function-findlink");
                                new N2Classes.FormElementOnoff("n2-generator-function-removevarlink");
                                new N2Classes.FormElementOnoff("n2-generator-function-removelinebreaks");
                                inited = true;
                            }
                            this.controls.find('.n2-button').on('click', $.proxy(function (e) {
                                e.preventDefault();
                                that.insert(getVariableString());
                                this.hide(e);
                            }, this));
                        }
                    }
                }
            }, false);

            this.modal.setCustomClass('n2-ss-generator-modal');
        }
        return this.modal;
    };

    Generator.prototype.showModal = function () {

        this.getModal().show();
    };

    Generator.prototype.insert = function (value) {
        this.activeField.val(value).trigger('change');
    };


    Generator.prototype.refresh = function () {
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
            this._refreshTimeout = null;
        }
        this._refreshTimeout = setTimeout($.proxy(this._refresh, this), 100);
    };

    Generator.prototype._refresh = function () {
        var layers = this.editor.fragmentEditor.mainContainer.container.getAllLayers();
        for (var j = 0; j < layers.length; j++) {
            if (layers[j].type == 'layer') {
                layers[j].item.reRender();
            }
        }
    };

    return Generator;
});
N2D('Historical', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     * @param c class
     */
    function Historical(c) {
        for (var k in Historical.prototype) {
            c.prototype[k] = Historical.prototype[k];
        }
    }

    /**
     * @param {N2Classes.Historical} self
     */
    Historical.prototype.setSelf = function (self) {
        if (self === undefined) {
            console.error(self);
        }
        if (this.self !== undefined && this.self !== this) {
            this.self.setSelf(self);
        }
        /**
         * @type {N2Classes.Historical}
         */
        this.self = self;

        this.onSelfChange();
    };

    /**
     * @returns {N2Classes.Historical}
     */
    Historical.prototype.getSelf = function () {
        if (this.self === undefined) {
            this.self = this;
        } else if (this.self !== this) {
            this.self = this.self.getSelf();
        }
        return this.self;
    };

    Historical.prototype.onSelfChange = function () {

    };

    return Historical;
});
N2D('History', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function History() {
        this.historyStates = 50;
        this.enabled = this.historyStates !== 0;
        this.historyActionInProgress = false;
        this.historyAddAllowed = true;
        this.isBatched = false;
        this.currentBatch = this;
        this.index = -1;
        this.stackedOff = [];

        /**
         @type {Array.<Array.<Task>>}
         */
        this.tasks = [];

        this.preventUndoRedo = false;

        this.undoBTN = $('#n2-ss-undo').on({
            click: $.proxy(this.undo, this),
            mousedown: function (e) {
                N2Classes.WindowManager.get().setMouseDownArea('undo', e);
            }
        });
        this.redoBTN = $('#n2-ss-redo').on({
            click: $.proxy(this.redo, this),
            mousedown: function (e) {
                N2Classes.WindowManager.get().setMouseDownArea('redo', e);
            }
        });
        this.updateUI();
    }

    /**
     * @returns {N2Classes.History}
     */
    History.get = function () {
        var history = new History();
        /**
         * @returns {N2Classes.History}
         */
        History.get = function () {
            return history;
        };
        return history;
    };

    History.prototype.updateUI = function () {
        if (this.index === 0 || this.tasks.length === 0) {
            this.undoBTN.removeClass('n2-active');
        } else {
            this.undoBTN.addClass('n2-active');
        }

        if (this.index == -1 || this.index >= this.tasks.length) {
            this.redoBTN.removeClass('n2-active');
        } else {
            this.redoBTN.addClass('n2-active');
        }
    };

    History.prototype.throttleUndoRedo = function () {
        if (!this.preventUndoRedo) {
            this.preventUndoRedo = true;
            setTimeout($.proxy(function () {
                this.preventUndoRedo = false;
            }, this), 100);
            return false;
        }
        return true;
    };

    History.prototype.isEnabled = function () {
        return this.enabled && this.historyAddAllowed;
    };

    /**
     *
     * @returns {Batch}
     */
    History.prototype.startBatch = function () {
        if (this.isEnabled()) {
            var batch = new Batch(this.currentBatch);
            this.currentBatch._add(batch);
            this.currentBatch = batch;
            return batch;
        }
        return false;
    };

    History.prototype.endBatch = function () {
        if (this.isEnabled()) {
            if (this.currentBatch.parent == undefined) {
                debugger;
            }
            this.currentBatch = this.currentBatch.parent;
        }
    };

    History.prototype.addControl = function (mode) {
        return this.currentBatch._add(new Control(mode));
    };

    History.prototype.addSimple = function (that, undoAction, redoAction, context) {
        if (this.isEnabled()) {
            return this.currentBatch._add(new Task(that, undoAction, redoAction, context));
        }
        return false;
    };

    /**
     *
     * @param that
     * @param action
     * @param context
     * @returns {TaskValue}
     */
    History.prototype.addValue = function (that, action, context) {
        if (this.isEnabled()) {
            if (this.isBatched || this.currentBatch !== this) {
                var currentBatch = this.getCurrentBatchStack();
                for (var i = 0; i < currentBatch.length; i++) {
                    if (currentBatch[i].isEqual(that, action, context)) {
                        currentBatch.push(currentBatch.splice(i, 1)[0]);
                        return currentBatch[currentBatch.length - 1];
                    }
                }
            }
            return this.currentBatch._add(new TaskValue(that, action, action, context));
        }
        return false;
    };

    History.prototype.getCurrentBatchStack = function () {
        if (this.currentBatch !== this) {
            return this.currentBatch.tasks;
        }
        return this.tasks[this.tasks.length - 1];
    };

    /**
     *
     * @param {Task} task
     * @returns {Task}
     */
    History.prototype._add = function (task) {
        if (this.index != -1) {
            this.tasks.splice(this.index, this.tasks.length);
        }
        this.index = -1;
        if (!this.isBatched) {
            this.tasks.push([task]);
            this.isBatched = true;
            setTimeout($.proxy(function () {
                this.isBatched = false;
            }, this), 100);
        } else {
            this.tasks[this.tasks.length - 1].push(task);
        }

        if (this.tasks.length > this.historyStates) {
            this.tasks.unshift();
        }
        this.updateUI();
        return task;
    };

    History.prototype.off = function () {
        this.historyAddAllowed = false;
        this.stackedOff.push(1);
    };

    History.prototype.on = function () {
        this.stackedOff.pop();
        if (this.stackedOff.length == 0) {
            this.historyAddAllowed = true;
        }
    };

    History.prototype.undo = function (e) {
        if (e) {
            e.preventDefault();
        }
        if (this.throttleUndoRedo()) {
            return false;
        }

        this.historyActionInProgress = true;
        this.off();
        if (this.index == -1) {
            this.index = this.tasks.length - 1;
        } else {
            this.index--;
        }
        if (this.index >= 0) {
            var tasks = this.tasks[this.index];

            for (var i = tasks.length - 1; i >= 0; i--) {
                if (!tasks[i].undo()) {
                    break;
                }
            }
        } else {
            this.index = 0;
            // No more undo
        }
        this.on();
        this.historyActionInProgress = false;

        this.updateUI();
        return true;
    };

    History.prototype.redo = function (e) {
        if (e) {
            e.preventDefault();
        }
        if (this.throttleUndoRedo()) {
            return false;
        }

        this.historyActionInProgress = true;
        this.off();
        if (this.index != -1) {
            if (this.index < this.tasks.length) {
                var tasks = this.tasks[this.index];
                this.index++;
                for (var i = 0; i < tasks.length; i++) {
                    if (!tasks[i].redo()) {
                        break;
                    }
                }
            } else {
                // No more redo
            }
        } else {
            // No redo
        }
        this.on();
        this.historyActionInProgress = false;

        this.updateUI();
        return true;
    };

    History.prototype.actionInProgress = function () {
        return this.historyActionInProgress;
    };

    function Batch(parent) {
        this.parent = parent;
        this.tasks = [];
    }

    Batch.prototype._add = function (task) {
        this.tasks.push(task);
        return task;
    };

    Batch.prototype.undo = function () {
        for (var i = 0; i < this.tasks.length; i++) {
            if (!this.tasks[i].undo()) {
                break;
            }
        }
        return true;
    };

    Batch.prototype.redo = function () {
        for (var i = 0; i < this.tasks.length; i++) {
            if (!this.tasks[i].redo()) {
                break;
            }
        }
        return true;
    };

    Batch.prototype.isEqual = function () {
        return false;
    };

    function Control(mode) {
        switch (mode) {
            case 'skipForwardUndos':
                this.undo = function () {
                    return false;
                };
                break;
        }
    }


    Control.prototype.undo = function () {
        return true;
    };

    Control.prototype.redo = function () {
        return true;
    };

    Control.prototype.isEqual = function () {
        return false;
    };

    function Task(that, undoAction, redoAction, context) {
        this.that = that;
        this.undoAction = undoAction;
        this.redoAction = redoAction;
        this.context = context || [];
    }


    Task.prototype.undo = function () {
        this.undoAction.apply(this.that.getSelf(), this.context);
        return true;
    };

    Task.prototype.redo = function () {
        this.redoAction.apply(this.that.getSelf(), this.context);
        return true;
    };

    Task.prototype.isEqual = function () {
        return false;
    };

    function TaskValue() {
        Task.prototype.constructor.apply(this, arguments);
    }

    TaskValue.prototype = Object.create(Task.prototype);
    TaskValue.prototype.constructor = TaskValue;

    TaskValue.prototype.setValues = function (undoValue, redoValue) {
        this.undoValue = undoValue;
        this.redoValue = redoValue;
    };

    TaskValue.prototype.undo = function () {
        this.context.unshift(this.undoValue);
        this.undoAction.apply(this.that.getSelf(), this.context);
        this.context.shift();
        return true;
    };

    TaskValue.prototype.redo = function () {
        this.context.unshift(this.redoValue);
        this.redoAction.apply(this.that.getSelf(), this.context);
        this.context.shift();
        return true;
    };

    TaskValue.prototype.isEqual = function (that, action, context) {
        if (that === this.that && action == this.undoAction) {
            for (var i = 0; i < context.length; i++) {
                if (context[i] != this.context[i]) {
                    return false;
                }
            }
            this.setValues = function (undoValue, redoValue) {
                this.redoValue = redoValue;
            };
            return true;
        }
        return false;
    };

    return History;
});

N2D('InlineField', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function InlineField() {

        this.$input = $('<input type="text" name="name" />')
            .on({
                mouseup: function (e) {
                    e.stopPropagation();
                },
                keyup: $.proxy(function (e) {
                    if (e.keyCode == 27) {
                        this.cancel();
                    }
                }, this),
                blur: $.proxy(this.save, this)
            });

        this.$form = $('<form class="n2-inline-form"></form>')
            .append(this.$input)
            .on('submit', $.proxy(this.save, this));
    }

    InlineField.prototype.injectNode = function ($targetNode, value) {
        this.$input.val(value);
        $targetNode.append(this.$form);
        this.$input.focus();
    };

    InlineField.prototype.save = function (e) {
        e.preventDefault();
        this.$input.trigger('valueChanged', [this.$input.val()]);
        this.$input.off('blur');
        this.destroy();
    };

    InlineField.prototype.cancel = function () {
        this.$input.trigger('cancel');
        this.destroy();
    };

    InlineField.prototype.destroy = function () {
        this.$input.off('blur');
        this.$form.remove();
    };

    return InlineField;
});
N2D('SlideSettings', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.EditorSlide} editor
     * @param {boolean} isStatic
     * @constructor
     */
    function SlideSettings(editor, isStatic) {

        /**
         * @type {N2Classes.EditorSlide}
         */
        this.editor = editor;
        this.isStatic = isStatic;

        var $fields = $('#smartslider-form').find('input[id][name^="slide"], textarea[id][name^="slide"]'),
            fields = {};
        $fields.each($.proxy(function (i, el) {
            var $field = $(el),
                name = $field.attr('name').match(/slide\[(.*)\]/)[1];
            fields[name] = $field.on('nextendChange', $.proxy(this.onChange, this, name));
        }, this));

        /**
         * @type {object}
         */
        this.fields = fields;

        this.slideBackground = this.editor.getSlideBackground();

        if (!isStatic) {

            // Auto fill thumbnail if empty
            var thumbnail = $('#slidethumbnail')
                .on('change, nextendChange', function () {
                    var newThumbnail = thumbnail.val();
                    if (newThumbnail === '') {
                        newThumbnail = '$system$/images/placeholder/image.png';
                    }
                    $('.n2-ss-edit-slide-top-thumbnail img').attr('src', nextend.imageHelper.fixed(newThumbnail));
                });

            var itemImage = null,
                currentSlideBackground = this.fields.backgroundImage.val(),
                updateThumbnailImage = $.proxy(function (image) {
                    if ((image !== '' && image !== '$system$/images/placeholder/image.png') && (thumbnail.val() === '' || thumbnail.val() === currentSlideBackground)) {
                        thumbnail.val(image).trigger('change');
                        if (itemImage) {
                            itemImage.off('.slidethumbnail');
                            itemImage = null;
                        }
                    }
                }, this);

            this.fields.backgroundImage.on('nextendChange.slidethumbnail', $.proxy(function () {
                var newSlideBackground = this.fields.backgroundImage.val();
                updateThumbnailImage(newSlideBackground);
                currentSlideBackground = newSlideBackground;
            }, this));

            if (thumbnail.val() === '') {
                itemImage = $('#item_imageimage').on('nextendChange.slidethumbnail', $.proxy(function () {
                    updateThumbnailImage(itemImage.val());
                }, this));
            }
        }

        this.createHistory();
    }

    SlideSettings.prototype.createHistory = function () {
        this.values = {};
        $('#smartslider-form').find('input[id][name^="slide"], textarea[id][name^="slide"]').not('#slideslide').each($.proxy(function (i, el) {
            var $input = $(el),
                field = $input.data('field'),
                id = $input.attr('id');
            this.values[id] = $input.val();
            $input.on('nextendChange', $.proxy(function () {
                var newValue = $input.val();

                var task = N2Classes.History.get().addValue(this, this.historyUpdateSlideValue, [field]);
                if (task) {
                    task.setValues(this.values[id], newValue);
                }

                this.values[id] = newValue;
            }, this));
        }, this));
    };

    SlideSettings.prototype.getSelf = function () {
        return this;
    };

    SlideSettings.prototype.historyUpdateSlideValue = function (value, field) {
        field.insideChange(value);
    };

    SlideSettings.prototype.getAllData = function () {

        var data = {};

        for (var k in this.fields) {
            data[k] = this.fields[k].val();
        }

        return data;
    };

    var backgroundFields = ['thumbnail', 'background-type', 'backgroundColor', 'backgroundGradient', 'backgroundColorEnd', 'backgroundColorOverlay', 'backgroundImage', 'backgroundImageOpacity', 'backgroundImageBlur', 'backgroundFocusX', 'backgroundFocusY', 'backgroundMode'];

    SlideSettings.prototype.getBackgroundData = function () {

        var data = {};

        for (var i = 0; i < backgroundFields.length; i++) {
            data[backgroundFields[i]] = this.fields[backgroundFields[i]].val();
        }

        return data;
    };

    SlideSettings.prototype.setData = function (data, disableVisualLoad) {

        if (disableVisualLoad) {
            this.slideBackground.setVisualLoad(false);
        }

        for (var k in data) {
            this.fields[k].val(data[k]).trigger('change');
        }

        if (disableVisualLoad) {
            this.slideBackground.setVisualLoad(false);
        }
    };

    SlideSettings.prototype.onChange = function (name, e) {
        name = name.replace(/-/g, '_');
        if (typeof this['sync_' + name] === 'function') {
            this['sync_' + name].call(this);
        }
    };

    SlideSettings.prototype.sync_backgroundColor =
        SlideSettings.prototype.sync_backgroundGradient =
            SlideSettings.prototype.sync_backgroundColorEnd =
                SlideSettings.prototype.sync_backgroundColorOverlay = function () {
                    this.updateBackgroundColor();
                };

    SlideSettings.prototype.updateBackgroundColor = function () {

        var color = this.getBackgroundColor(),
            gradient = this.getBackgroundGradient(),
            colorEnd;
        if (gradient !== 'off') {
            colorEnd = this.getBackgroundColorEnd();
        }
        this.slideBackground.updateColor(color, gradient, colorEnd, this.getBackgroundColorOverlay());
    };

    SlideSettings.prototype.sync_backgroundImage = function () {
        this.slideBackground.setImage(this.getBackgroundImage());
    };

    SlideSettings.prototype.sync_background_type = function () {

        this.slideBackground.setType(this.fields['background-type'].val());
    };

    SlideSettings.prototype.getType = function () {
        return this.fields['background-type'].val();
    };

    SlideSettings.prototype.sync_backgroundMode = function () {
        this.slideBackground.setMode(this.fields.backgroundMode.val());
    };

    SlideSettings.prototype.sync_backgroundFocusY =
        SlideSettings.prototype.sync_backgroundFocusX = function () {
            this.slideBackground.setFocus(this.getBackgroundFocusX(), this.getBackgroundFocusY());
        };

    SlideSettings.prototype.sync_backgroundImageOpacity = function () {
        this.slideBackground.setImageOpacity(this.getBackgroundImageOpacity());
    };

    SlideSettings.prototype.getBackgroundImageOpacity = function () {
        return this.fields.backgroundImageOpacity.val();
    };

    SlideSettings.prototype.sync_backgroundImageBlur = function () {
        this.slideBackground.setBlur(this.getBackgroundImageBlur());
    };

    SlideSettings.prototype.getBackgroundColor = function () {
        return this.editor.generator.fill(this.fields.backgroundColor.val());
    };

    SlideSettings.prototype.getBackgroundGradient = function () {
        return this.fields.backgroundGradient.val();
    };

    SlideSettings.prototype.getBackgroundColorEnd = function () {
        return this.editor.generator.fill(this.fields.backgroundColorEnd.val());
    };

    SlideSettings.prototype.getBackgroundColorOverlay = function () {
        return !!+this.fields.backgroundColorOverlay.val();
    };

    SlideSettings.prototype.getBackgroundImage = function () {
        return this.editor.generator.fill(this.fields.backgroundImage.val());
    };

    SlideSettings.prototype.getBackgroundImageBlur = function () {
        return this.fields.backgroundImageBlur.val();
    };

    SlideSettings.prototype.getBackgroundFocusX = function () {
        return this.fields.backgroundFocusX.val();
    };

    SlideSettings.prototype.getBackgroundFocusY = function () {
        return this.fields.backgroundFocusY.val();
    };


    return SlideSettings;
});
N2D('FormElementStyleMode', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param id
     * @constructor
     */
    function FormElementStyleMode(id) {

        this.$element = $('#' + id).on('nextendChange', $.proxy(function () {
            if (this.$element.val() == '') {
                this.$reset.css('visibility', 'hidden');
            } else {
                this.$reset.css('visibility', '');
            }
        }, this));

        this.$container = this.$element.parent();
        this.$reset = this.$container.find('.n2-form-element-style-mode-reset')
            .on('click', $.proxy(function () {
                this.$element.triggerHandler('n2resetmode');
            }, this));

    }

    return FormElementStyleMode;
});
N2D('SmartSliderAdminSlideBackgroundColor', ['SmartSliderSlideBackgroundColor'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.SmartSliderSlideBackground} background
     * @param $el
     * @constructor
     * @augments N2Classes.SmartSliderSlideBackgroundColor
     */
    function SmartSliderAdminSlideBackgroundColor(background, $el) {

        N2Classes.SmartSliderSlideBackgroundColor.prototype.constructor.apply(this, arguments);
    }

    SmartSliderAdminSlideBackgroundColor.prototype = Object.create(N2Classes.SmartSliderSlideBackgroundColor.prototype);
    SmartSliderAdminSlideBackgroundColor.prototype.constructor = SmartSliderAdminSlideBackgroundColor;

    SmartSliderAdminSlideBackgroundColor.prototype.update = function (color, gradient, colorEnd, isOverlay) {
        color = this.fixColor(color);
        this.$el.css({background: ''});

        this.$el.attr('data-overlay', isOverlay ? 1 : 0);

        if (gradient !== 'off') {
            this.updateGradient(color, gradient, colorEnd)
        } else {
            this.updateColor(color);
        }
    };

    SmartSliderAdminSlideBackgroundColor.prototype.updateColor = function (color) {
        if (color.substr(6, 8) !== '00') {
            this.$el
                .css('background', '#' + color.substr(0, 6))
                .css('background', N2Color.hex2rgbaCSS(color));
        }
    };

    SmartSliderAdminSlideBackgroundColor.prototype.updateGradient = function (color, gradient, colorEnd) {
        this.$el.css({background: ''});

        colorEnd = this.fixColor(colorEnd);

        switch (gradient) {
            case 'horizontal':
                this.$el.css('background', 'linear-gradient(to right, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorEnd) + ' 100%)');
                break;
            case 'vertical':
                this.$el.css('background', 'linear-gradient(to bottom, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorEnd) + ' 100%)');
                break;
            case 'diagonal1':
                this.$el.css('background', 'linear-gradient(45deg, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorEnd) + ' 100%)');
                break;
            case 'diagonal2':
                this.$el.css('background', 'linear-gradient(135deg, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorEnd) + ' 100%)');
                break;
        }
    };

    SmartSliderAdminSlideBackgroundColor.prototype.fixColor = function (color) {
        if (color.length && color.charAt(0) === '#') {
            color = color.substring(1);
            if (color.length === 6) {
                color += 'ff';
            }
        }
        return color;
    };

    return SmartSliderAdminSlideBackgroundColor;
});
N2D('SmartSliderAdminSlideBackgroundImage', ['SmartSliderSlideBackgroundImage'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FrontendSliderSlide} slide
     * @param {N2Classes.SmartSliderBackgrounds} manager
     * @param {N2Classes.SmartSliderSlideBackground} background
     * @param $background
     * @constructor
     * @augments N2Classes.SmartSliderSlideBackgroundColor
     */
    function SmartSliderAdminSlideBackgroundImage(slide, manager, background, $background) {

        this.hash = $background.data('hash');

        N2Classes.SmartSliderSlideBackgroundImage.prototype.constructor.apply(this, arguments);
        this.loadAllowed = true;

        this.listenImageManager();
    }

    SmartSliderAdminSlideBackgroundImage.prototype = Object.create(N2Classes.SmartSliderSlideBackgroundImage.prototype);
    SmartSliderAdminSlideBackgroundImage.prototype.constructor = SmartSliderAdminSlideBackgroundImage;


    SmartSliderAdminSlideBackgroundImage.prototype.listenImageManager = function () {
        if (this.hash !== '') {
            $(window).on(this.hash, $.proxy(this.onImageManagerChanged, this));
        }
    };

    SmartSliderAdminSlideBackgroundImage.prototype.notListenImageManager = function () {
        if (this.hash !== '') {
            $(window).off(this.hash, null, $.proxy(this.onImageManagerChanged, this));
        }
    };

    SmartSliderAdminSlideBackgroundImage.prototype.onImageManagerChanged = function (e, imageData) {
        this.tabletSrc = imageData.tablet.image;
        this.mobileSrc = imageData.mobile.image;

        this.updateBackgroundToDevice(this.manager.device);
    };

    SmartSliderAdminSlideBackgroundImage.prototype.preLoadAdmin = function (image) {
        this.preLoad();

        if (image !== '' && this.background.allowVisualLoad) {
            this.notListenImageManager();

            this.deferred.done($.proxy(function () {
                $.when(nextend.imageManager.getVisual(image))
                    .done($.proxy(function (visual) {
                        this.onImageManagerChanged(null, visual.value);
                        this.listenImageManager();
                    }, this));
            }, this));
        }
    };

    SmartSliderAdminSlideBackgroundImage.prototype.setDesktopSrc = function (src) {
        this.notListenImageManager();
        this.desktopSrc = src;
        this.hash = md5(src);

        if (src !== '' && this.background.allowVisualLoad) {
            var img = new Image();
            img.addEventListener("load", $.proxy(function () {
                $.when(nextend.imageManager.getVisual(src))
                    .done($.proxy(function (visual) {
                        this.onImageManagerChanged(null, visual.value);
                        this.listenImageManager();
                    }, this));
            }, this), false);
            img.src = nextend.imageHelper.fixed(src);
        } else {
            this.tabletSrc = '';
            this.mobileSrc = '';

            this.setSrc(nextend.imageHelper.fixed(src));
        }
    };

    SmartSliderAdminSlideBackgroundImage.prototype.setSrc = function (src) {
        N2Classes.SmartSliderSlideBackgroundImage.prototype.setSrc.call(this, nextend.imageHelper.fixed(src));
    };

    SmartSliderAdminSlideBackgroundImage.prototype.startFixed = function () {

    };

    SmartSliderAdminSlideBackgroundImage.prototype.updateMode = function (newMode, oldMode) {
        if (newMode === 'blurfit') {
            if (this.$background.length === 1) {

                // Clone image and use as front
                this.$background = this.$background.add(this.$background.clone()
                    .insertAfter(this.$background));

                // Blur the rear image
                var size = 7;
                this.$background.first().css({
                    margin: '-' + (size * 2) + 'px',
                    padding: (size * 2) + 'px'
                }).css(window.n2FilterProperty, 'blur(' + size + 'px)');
            }
        }

        if (oldMode === 'blurfit' && newMode !== 'blurfit') {

            // Remove front image
            this.$background.eq(1).remove();
            this.$background = this.$background.eq(0);

            // Reset blur on the main image
            this.updateBlur(this.blur);
        }
    };

    SmartSliderAdminSlideBackgroundImage.prototype.updateFocus = function (x, y) {
        this.$background.css('background-position', x + '% ' + y + '%');
    };

    SmartSliderAdminSlideBackgroundImage.prototype.updateOpacity = function (opacity) {
        this.$background.css('opacity', opacity / 100);
    };

    SmartSliderAdminSlideBackgroundImage.prototype.updateBlur = function (blur) {
        if (window.n2FilterProperty) {
            if (blur > 0) {
                this.$background.last().css({
                    margin: '-' + (blur * 2) + 'px',
                    padding: (blur * 2) + 'px'
                }).css(window.n2FilterProperty, 'blur(' + blur + 'px)');
            } else {
                this.$background.last().css({
                    margin: '',
                    padding: ''
                }).css(window.n2FilterProperty, '');
            }
        }
        this.blur = blur;
    };

    SmartSliderAdminSlideBackgroundImage.prototype.kill = function () {
        this.notListenImageManager();
        this.$background.remove();
    };

    return SmartSliderAdminSlideBackgroundImage;
});
N2D('LayerContainer', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param component
     * @param $ul
     * @param allowedPlacementMode
     * @param childrenSelector
     * @param allowedChildren
     * @constructor
     */
    function LayerContainer(component, $ul, allowedPlacementMode, childrenSelector, allowedChildren) {
        this.component = component;
        this.$ul = $ul
            .data('container', this);

        this.allowedPlacementMode = allowedPlacementMode;
        this.childrenSelector = childrenSelector;
        this.allowedChildren = allowedChildren;

        this.layerContainerElement = component.layer;
    }

    LayerContainer.prototype.setLayerContainerElement = function ($layerContainerElement) {
        this.layerContainerElement = $layerContainerElement;
    };

    LayerContainer.prototype.startWithExistingNodes = function (isEditorStart) {
        var nodes = this.layerContainerElement.find(this.childrenSelector);
        for (var i = 0; i < nodes.length; i++) {
            this._loadNode(nodes.eq(i), isEditorStart);
        }
        this.component.onChildCountChange();
    };

    LayerContainer.prototype.isChildAllowed = function (type) {
        return $.inArray(type, this.allowedChildren) !== -1;
    };

    LayerContainer.prototype._loadNode = function ($el, isEditorStart) {
        var type = $el.data('sstype');
        if (this.isChildAllowed(type)) {
            var lastPlacement = $el.data('lastplacement'),
                removedPlacementData = {};
            if (lastPlacement !== undefined && lastPlacement != this.allowedPlacementMode) {
                switch (lastPlacement) {
                    case 'absolute':
                        removedPlacementData = N2Classes.PlacementAbsolute.cleanLayer($el);
                        break;
                    case 'normal':
                        removedPlacementData = N2Classes.PlacementNormal.cleanLayer($el);
                        break;
                }
            }
            /** @type {N2Classes.ComponentAbstract} */
            var component;
            switch (type) {
                case 'layer':
                    component = new N2Classes.Layer(this.component.fragmentEditor, this.component);

                    var itemClass = component.itemEditor.getItemClass($el.find('.n2-ss-item').data('item'));
                    if (itemClass && N2Classes[itemClass].needSize) {
                        if (removedPlacementData.desktopportraitheight !== undefined) {
                            // If absolute layer pasted into normal position then we should force the absolute height
                            // when the item has needSize property true.
                            $el.data('desktopportraitheight', removedPlacementData.desktopportraitheight);
                        }
                    }
                    break;
                case 'content':
                    component = new N2Classes.Content(this.component.fragmentEditor, this.component);
                    break;
                case 'row':
                    component = new N2Classes.Row(this.component.fragmentEditor, this.component);
                    break;
                case 'col':
                    component = new N2Classes.Col(this.component.fragmentEditor, this.component);
                    break;
                case 'group':
                    break;
            }

            if (component) {
                component.load($el, isEditorStart);
                if (!isEditorStart) {
                    component.sync();
                }
                return component;
            }
        } else {
            console.error(type + ' is not allowed in ' + this.component.label);
        }
        return false;
    };

    LayerContainer.prototype.getLayerCount = function () {
        return this.layerContainerElement.find(this.childrenSelector).length;
    };

    LayerContainer.prototype.getLayerIndex = function ($layer) {
        return this.layerContainerElement.find(this.childrenSelector).index($layer);
    };

    LayerContainer.prototype.getSortedLayers = function () {
        var layers = [];
        this.layerContainerElement.find(this.childrenSelector).each(function (i, el) {
            var layer = $(el).data('layerObject');
            if (layer !== undefined) {
                layers.push(layer);
            }
        });
        return layers;
    };

    LayerContainer.prototype.append = function ($layer) {
        $layer.appendTo(this.layerContainerElement);
        var layer = this._loadNode($layer, false);
        this.component.onChildCountChange();
        return layer;
    };

    LayerContainer.prototype.insertAt = function ($layer, index) {

        var layers = this.getSortedLayers();
        if (index >= layers.length) {
            $layer.appendTo(this.layerContainerElement);
        } else {
            $layer.insertBefore(layers[index].layer);
        }

        var layer = this._loadNode($layer, false);
        this.component.onChildCountChange();
        return layer;
    };

    LayerContainer.prototype.insert = function (layer) {
        layer.getRootElement().appendTo(this.layerContainerElement);
    };

    LayerContainer.prototype.insertLayerAt = function (layer, index) {

        var layers = this.getSortedLayers(),
            oldGroup = layer.group;

        var layerIndex = $.inArray(layer, layers);
        if (layerIndex > -1 && layerIndex < index) {
            // we have to readjust the target index of the layer
            index++;
        }

        if (index >= layers.length) {
            layer.getRootElement().appendTo(this.layerContainerElement);
        } else {
            layer.getRootElement().insertBefore(layers[index].getRootElement());
        }

        this.syncLayerRow(layer);

        if (oldGroup !== this.component) {
            oldGroup.onChildCountChange();
        }
    };

    LayerContainer.prototype.syncLayerRow = function (layer) {
        var relatedLayer,
            isReversed = (this.allowedPlacementMode === 'absolute');
        if (isReversed) {
            relatedLayer = layer.getRootElement().prevAll('.n2-ss-layer, .n2-ss-layer-group').first().data('layerObject');
        } else {
            relatedLayer = layer.getRootElement().nextAll('.n2-ss-layer, .n2-ss-layer-group').first().data('layerObject');
        }

        if (relatedLayer !== undefined) {
            layer.layerRow.insertBefore(relatedLayer.layerRow);
        } else {
            this.$ul.append(layer.layerRow);
        }

        if (layer.animations) {
            layer.animations.syncRow(relatedLayer, isReversed);
        }
    };

    LayerContainer.prototype.getChildLayersRecursive = function (nodeOnly) {
        var _layers = this.getSortedLayers();
        var layers = [];
        for (var i = 0; i < _layers.length; i++) {
            if (nodeOnly) {
                layers.push(_layers[i].layer[0]);
            } else {
                layers.push(_layers[i]);
            }
            if (_layers[i].container) {
                layers.push.apply(layers, _layers[i].container.getChildLayersRecursive(nodeOnly));
            }
        }
        return layers;
    };

    LayerContainer.prototype.moveLayerToGroup = function (layer, newLocalIndex) {
        this.moveLayersToGroup([layer], [newLocalIndex]);
    };

    LayerContainer.prototype.moveLayersToGroup = function (layers, newLocalIndexs) {
        newLocalIndexs = newLocalIndexs || [];

        var originalGroups = [];
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i],
                originalGroup = layer.group;

            var originalIndex = layer.getIndex();
            if (typeof  newLocalIndexs[i] != 'undefined') {
                this.insertLayerAt(layer, newLocalIndexs[i]);
            } else {
                this.insert(layer);
            }
            layer.changeGroup(originalIndex, this.component);

            if (this != originalGroup) {
                if ($.inArray(originalGroup, originalGroups) == -1) {
                    originalGroups.push(originalGroup);
                }
            }
        }

        for (var i = 0; i < originalGroups.length; i++) {
            originalGroups[i].update();
        }
    };

    LayerContainer.prototype.activateFirst = function () {
        var layers = this.getSortedLayers();
        if (layers.length > 0) {
            layers[layers.length - 1].activate(); //Do not show editor on load!
        }
    };

    LayerContainer.prototype.resetModes = function (mode) {
        var layers = this.getSortedLayers();
        for (var i = 0; i < layers.length; i++) {
            layers[i].resetMode(mode);
            if (layers[i].container != undefined) {
                layers[i].container.resetModes(mode);
            }
        }
    };

    LayerContainer.prototype.copyModes = function (mode, currentMode) {
        var layers = this.getSortedLayers();
        for (var i = 0; i < layers.length; i++) {
            layers[i].copyMode(mode, currentMode);
            if (layers[i].container != undefined) {
                layers[i].container.copyModes(mode, currentMode);
            }
        }
    };

    LayerContainer.prototype.changeEditorModes = function (mode) {
        var layers = this.getSortedLayers();
        for (var i = 0; i < layers.length; i++) {
            layers[i].changeEditorMode(mode);
            if (layers[i].container != undefined) {
                layers[i].container.changeEditorModes(mode);
            }
        }
    };

    LayerContainer.prototype.renderModeProperties = function () {
        var layers = this.getSortedLayers();
        for (var i = 0; i < layers.length; i++) {
            layers[i].renderModeProperties();
            if (layers[i].container != undefined) {
                layers[i].container.renderModeProperties();
            }
        }
    };

    LayerContainer.prototype.getAllLayers = function (layers) {
        layers = layers || [];
        var sortedLayers = this.getSortedLayers();
        for (var i = 0; i < sortedLayers.length; i++) {
            layers.push(sortedLayers[i]);
            if (sortedLayers[i].container != undefined) {
                sortedLayers[i].container.getAllLayers(layers);
            }
        }
        return layers;
    };

    LayerContainer.prototype.getData = function (params) {
        params = $.extend({
            layersIncluded: true,
            itemsIncluded: true
        }, params);
        var layers = [];

        var sortedLayers = this.getSortedLayers();
        if (this.allowedPlacementMode == 'absolute') {
            for (var i = sortedLayers.length - 1; i >= 0; i--) {
                layers.push(sortedLayers[i].getData(params));
            }
        } else {
            for (var i = 0; i < sortedLayers.length; i++) {
                layers.push(sortedLayers[i].getData(params));
            }
        }

        return layers;
    };

    LayerContainer.prototype.getHTML = function (base64) {
        var layers = this.getSortedLayers(),
            nodes = [];
        for (var i = 0; i < layers.length; i++) {
            nodes.push(layers[i].getHTML(base64));
        }
        return nodes;
    };

    /**
     * Used for layer editor
     * @param exclude
     * @returns {Array}
     */
    LayerContainer.prototype.getDroppables = function (exclude) {
        var droppables = [],
            layers = this.getSortedLayers();

        for (var i = 0; i < layers.length; i++) {
            if (layers[i] != exclude) {
                var droppable = layers[i].getDroppable();
                if (typeof droppable == 'object') {
                    droppables.push(droppable);
                }
                if (droppable != 'hidden' && layers[i].container) {
                    droppables.push.apply(droppables, layers[i].container.getDroppables(exclude));
                }
            }
        }

        return droppables;
    };

    /**
     * Used for Layer List
     * @param layer
     * @returns {Array}
     */
    LayerContainer.prototype.getLLDroppables = function (layer) {
        var droppables = [];

        var droppable = this.component.getLLDroppable(layer);
        if (droppable) {
            droppables.push(droppable);
        }

        var layers = this.getSortedLayers();
        for (var i = 0; i < layers.length; i++) {
            if (!layers[i].container || layers[i] == layer) continue;

            droppables.push.apply(droppables, layers[i].container.getLLDroppables(layer));
        }

        return droppables;
    };

    return LayerContainer;
});
N2D('LayerDataStorage', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function LayerDataStorage() {
        this.isDeviceProp = {};
        this.propertyScope = {};
        this.property = {};
        this.deviceProperty = {
            desktopPortrait: {},
            desktopLandscape: {},
            tabletPortrait: {},
            tabletLandscape: {},
            mobilePortrait: {},
            mobileLandscape: {}
        };

        this.advancedProperties = {};
    }

    LayerDataStorage.prototype.getMode = function () {
        return this.fragmentEditor.getMode();
    };

    LayerDataStorage.prototype.getProperties = function () {
        var properties = {};
        for (var k in this.property) {
            if (this.advancedProperties[k] !== undefined) {
                if (k == this.advancedProperties[k].getName()) {
                    var value = this.property[k],
                        baseName = this.advancedProperties[k].getBaseName();
                    if (this.property[k] === undefined) {
                        value = this.property[baseName];
                    }
                    properties[baseName] = value;
                }
            } else {
                properties[k] = this.property[k];
            }
        }
        return properties;
    };

    LayerDataStorage.prototype.getRawProperty = function (name) {

        if (this.isDeviceProp[name]) {
            var mode = this.getMode(),
                properties = this.deviceProperty[mode];
            if (properties[name] !== undefined) {
                return properties[name];
            }
            return undefined;
        }
        return this.property[name];
    };

    LayerDataStorage.prototype.getProperty = function (name) {

        if (this.isDeviceProp[name]) {
            var mode = this.getMode(),
                properties = this.deviceProperty[mode],
                fallbackProperties = this.deviceProperty['desktopPortrait'];
            if (typeof properties[name] !== 'undefined') {
                return properties[name];
            } else if (typeof fallbackProperties[name] !== 'undefined') {
                return fallbackProperties[name];
            }
        }
        return this.property[name];
    };

    LayerDataStorage.prototype.historyStore = function (value, name, mode) {
        if (!this.isDeleteStarted) {
            var currentMode = this.getMode();
            if (!this.isDeviceProp[name] || mode == currentMode) {
                this.store(name, value, true, 'history');
                this.$.trigger('propertyChanged', [name, this.getProperty(name)]);
            } else {
                this.deviceProperty[mode][name] = value;
                this.render(name);
            }
        }
    };

    LayerDataStorage.prototype.store = function (name, value, needRender, from) {

        var mode = this.getMode(),
            oldValue,
            oldValueFilled;
        if (this.isDeviceProp[name]) {
            oldValue = this.deviceProperty[mode][name];
            oldValueFilled = this.getProperty(name);
        } else {
            oldValueFilled = oldValue = this.property[name];
        }
        var task = N2Classes.History.get().addValue(this, this.historyStore, [name, mode]);
        if (task) {
            task.setValues(oldValue, value);
        }

        this.property[name] = value;

        if (this.isDeviceProp[name]) {
            this.deviceProperty[mode][name] = value;
        }

        if (needRender) {
            this.render(name, oldValueFilled, from);
        }
    };

    LayerDataStorage.prototype.render = function (name, oldValue, from) {
        this.propertyScope[name]['_sync' + name](oldValue, from);
    };

    LayerDataStorage.prototype.isDimensionPropertyAccepted = function (value) {
        return (value + '').match(/[0-9]+%/) || value == 'auto';
    };

    LayerDataStorage.prototype.changeEditorMode = function (mode) {
        var value = parseInt(this.property[mode]);
        if (value) {
            this._show();
        } else {
            this._hide();
        }

        this.layer.triggerHandler('LayerShowChange', [mode, value]);

        this.renderModeProperties(false);
    };

    LayerDataStorage.prototype.renderModeProperties = function (isReset) {
        for (var k in this.isDeviceProp) {
            if (this.isDeviceProp[k]) {
                this.property[k] = this.getProperty(k);
                this.$.trigger('propertyChanged', [k, this.property[k]]);
            }
        }
    };

    LayerDataStorage.prototype.historyResetMode = function (value, mode) {

        this.deviceProperty[mode] = $.extend({}, value);

        if (mode == this.fragmentEditor.getMode()) {
            this.renderModeProperties(true);
        }
    };

    LayerDataStorage.prototype.resetMode = function (mode) {
        if (mode != 'desktopPortrait') {
            var undefined;

            var task = N2Classes.History.get().addValue(this, this.historyResetMode, [mode]);
            if (task) {
                task.setValues($.extend({}, this.deviceProperty[mode]), {});
            }

            for (var k in this.deviceProperty[mode]) {
                this.deviceProperty[mode][k] = undefined;
            }
            if (mode == this.fragmentEditor.getMode()) {
                this.renderModeProperties(true);
            }
        }
    };

    LayerDataStorage.prototype.copyMode = function (from, to) {
        if (from != to) {
            var originalValues = this.deviceProperty[to];

            this.deviceProperty[to] = $.extend({}, this.deviceProperty[to], this.deviceProperty[from]);

            var task = N2Classes.History.get().addValue(this, this.historyResetMode, [to]);
            if (task) {
                task.setValues(originalValues, this.deviceProperty[to]);
            }
        }
    };

    LayerDataStorage.prototype._getDefault = function (name, def) {
        if (this.originalProperties[name] !== undefined) {
            return this.originalProperties[name];
        }
        return def;
    };

    LayerDataStorage.prototype.createProperty = function (name, def, $layer, scope) {
        this.isDeviceProp[name] = false;
        this.propertyScope[name] = scope || this;
        if ($layer) {
            this.property[name] = $layer.data(name.toLowerCase());
            if (this.property[name] === undefined) {
                this.property[name] = this._getDefault(name, def);
            }
        } else {
            this.property[name] = this._getDefault(name, def);
        }
    };

    /**
     * @param {N2Classes.LayerAdvancedProperty} advancedProperty
     * @param $layer
     * @param scope
     */
    LayerDataStorage.prototype.createAdvancedProperty = function (advancedProperty, $layer, scope) {
        var names = advancedProperty.getNames();
        for (var k in names) {
            this.advancedProperties[k] = advancedProperty;
            this.createProperty(k, names[k], $layer, scope);
        }
    };

    LayerDataStorage.prototype.syncAdvancedField = function (baseName) {
        var name = this.advancedProperties[baseName].getName(),
            value = this.property[name];
        if (this.property[name] === undefined) {
            value = this.property[baseName];
        }
        this.fragmentEditor.layerOptions.updateField(baseName, value);
    };

    LayerDataStorage.prototype.createDeviceProperty = function (name, def, $layer, scope) {
        var k, defaultValue;
        this.isDeviceProp[name] = true;
        this.propertyScope[name] = scope || this;
        if ($layer) {
            for (k in this.deviceProperty) {
                this.deviceProperty[k][name] = $layer.data(k.toLowerCase() + name.toLowerCase());
                if (this.deviceProperty[k][name] === "") {
                    this.deviceProperty[k][name] = undefined;
                }
            }
            for (k in this.deviceProperty) {
                if (this.deviceProperty[k][name] === undefined || this.deviceProperty[k][name] === "") {
                    defaultValue = this._getDefault(k.toLowerCase() + name.toLowerCase());
                    if (defaultValue !== undefined) {
                        this.deviceProperty[k][name] = defaultValue;
                    }
                }
            }
            for (k in def) {
                if (this.deviceProperty[k][name] === undefined || this.deviceProperty[k][name] === "") {
                    this.deviceProperty[k][name] = def[k];
                }
            }
        } else {
            //Create layer
            for (k in def) {
                this.deviceProperty[k][name] = def[k];
            }
            for (k in this.deviceProperty) {
                defaultValue = this._getDefault(k.toLowerCase() + name.toLowerCase());
                if (defaultValue !== undefined) {
                    this.deviceProperty[k][name] = defaultValue;
                }
            }
        }
        this.property[name] = this.deviceProperty.desktopPortrait[name];
    };

    LayerDataStorage.prototype.removeProperty = function (name) {
        delete this.property[name];
        this.layer.removeData(name.toLowerCase())
            .removeAttr('data-' + name.toLowerCase());

        if (this.isDeviceProp[name]) {
            for (var k in this.deviceProperty) {
                delete this.deviceProperty[k][name];
                this.layer.removeData(k.toLowerCase() + name.toLowerCase())
                    .removeAttr('data-' + k.toLowerCase() + name.toLowerCase());
            }
        }
        delete this.isDeviceProp[name];
        delete this.propertyScope[name];
    };

    LayerDataStorage.prototype.removeProperties = function (properties) {
        for (var i = 0; i < properties.length; i++) {
            this.removeProperty(properties[i]);
        }
    };

    LayerDataStorage.prototype.getPropertiesData = function (properties) {
        var data = {};
        for (var i = 0; i < properties.length; i++) {
            var name = properties[i];
            if (this.property[name] !== undefined) {
                data[name] = this.property[name];
            }
            if (this.isDeviceProp[name]) {
                for (var k in this.deviceProperty) {
                    if (this.deviceProperty[k][name] !== undefined) {
                        data[k.toLowerCase() + name] = this.deviceProperty[k][name];
                    }
                }
            }
        }
        return data;
    };

    LayerDataStorage.prototype.setProperty = function (name, value, from) {

        if (this.advancedProperties[name] !== undefined) {
            name = this.advancedProperties[name].getName();
        }

        if (this.propertyScope[name] !== undefined) {
            if (typeof this.propertyScope[name]['setProperty' + name] == 'function') {
                this.propertyScope[name]['setProperty' + name](name, value, from);
            } else {
                this._setProperty(name, value, from);
            }
        } else if (typeof this['setProperty' + name] == 'function') {
            this['setProperty' + name](name, value, from);
        }
    };

    LayerDataStorage.prototype._setProperty = function (name, value, from) {

        this.store(name, value, true, from);

        if (from != 'manager') {
            this.$.trigger('propertyChanged', [name, this.getProperty(name)]);
        }
    };

    LayerDataStorage.prototype.onSyncFields = function () {

    };

    LayerDataStorage.prototype.resetStyleMode = function (name) {
        for (var k in this.advancedProperties) {
            this.advancedProperties[k].resetMode(name);
        }
    };

    return LayerDataStorage;
});
N2D('FragmentEditor', function ($, undefined) {
    "use strict";
    var layerClass = '.n2-ss-layer',
        keys = {
            16: 0,
            38: 0,
            40: 0,
            37: 0,
            39: 0
        },
        horizontalAlign = {
            97: 'left',
            98: 'center',
            99: 'right',
            100: 'left',
            101: 'center',
            102: 'right',
            103: 'left',
            104: 'center',
            105: 'right'
        },
        verticalAlign = {
            97: 'bottom',
            98: 'bottom',
            99: 'bottom',
            100: 'middle',
            101: 'middle',
            102: 'middle',
            103: 'top',
            104: 'top',
            105: 'top'
        },
        SELECT_MODE = {
            OFF: 0,
            ON: 1,
            GROUP: 2
        },
        SELECT_MODE_INV = {
            0: 'OFF',
            1: 'ON',
            2: 'GROUP'
        };

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.EditorAbstract} editor
     * @param jQuery $editedElement
     * @param configuration
     * @param options
     * @constructor
     */
    function FragmentEditor(editor, $editedElement, configuration, options) {
        this.mode = 'desktopPortrait';

        /**
         * @type {N2Classes.EditorAbstract}
         */
        this.editor = editor;
        this.$editedElement = $editedElement;
        this.configuration = configuration;
        this.ready = $.Deferred();

        this.shouldPreventActivationBubble = false;

        this.$ = $(this);

        editor.fragmentEditor = this;

        this.$highlight = $('<div class="n2-ss-layer-highlight n2-ss-layer-highlight-n" /><div class="n2-ss-layer-highlight n2-ss-layer-highlight-e" /><div class="n2-ss-layer-highlight n2-ss-layer-highlight-s" /><div class="n2-ss-layer-highlight n2-ss-layer-highlight-w" />');

        this.initSelectMode();

        this.layerWindow = new N2Classes.LayerWindow(this);

        this.layerOptions = new N2Classes.ComponentSettings(this);

        this.ui = new N2Classes.CanvasUserInterface(this);

        /**
         * @type {N2Classes.MainContainer}
         */
        this.mainContainer = new N2Classes.MainContainer(this);

        this.itemEditor = new N2Classes.ItemManager(this, options);

        this.mainContainer.lateInit();

        this._initDeviceModeChange();

        /**
         * @type {N2Classes.CanvasSettings}
         */
        this.canvasSettings = new N2Classes.CanvasSettings(this);

        this.layerOptions.startFeatures();

        this.hotkeys();

        this.addContextMenu();

        this.mainContainer.refreshHasLayers();

        var editorModes = $('#n2-ss-editor-mode .n2-radio-option'),
            updateEditorModeSync = $.proxy(function (mode) {
                this.updateEditorMode(mode);
                switch (mode) {
                    case 'content':
                        editorModes.eq(0).addClass('n2-active');
                        editorModes.eq(1).removeClass('n2-active');
                        break;
                    case 'canvas':
                        editorModes.eq(0).removeClass('n2-active');
                        editorModes.eq(1).addClass('n2-active');
                        break;
                }
            }, this);

        if (this.mainContent && this.mainContent.container.getLayerCount()) {
            updateEditorModeSync('content');
        } else {
            var layers = this.mainContainer.container.getSortedLayers();
            if (this.mainContent && layers.length > 1 || !this.mainContent && layers.length > 0) {
                updateEditorModeSync('canvas');
            } else {
                var stored = $.jStorage.get('editormode');
                if (!stored) {
                    stored = 'content';
                    $.jStorage.set('editormode', stored);
                }
                updateEditorModeSync(stored);
            }
        }

        editorModes.on('click', $.proxy(function (e) {
            editorModes.removeClass('n2-active');
            var $el = $(e.currentTarget),
                mode = $el.data('mode');
            $el.addClass('n2-active');
            if (mode != this.currentEditorMode) {
                this.updateEditorMode(mode);

                $.jStorage.set('editormode', mode);
            }
        }, this));

        this.isMultiDrag = false;
    }

    FragmentEditor.prototype.updateEditorMode = function (mode) {
        this.currentEditorMode = mode;
        $('body').attr('data-editormode', this.currentEditorMode);
    };

    FragmentEditor.prototype.getMode = function () {
        return this.mode;
    };

    FragmentEditor.prototype.getResponsiveRatioHorizontal = function () {
        return this.editor.getHorizontalRatio();
    };

    FragmentEditor.prototype.getResponsiveRatioVertical = function () {
        return this.editor.getVerticalRatio();
    };

    FragmentEditor.prototype.setMainContent = function (layer) {
        this.mainContent = layer;
    };

    FragmentEditor.prototype.isGroup = function (layer) {
        return false;
    
    };

    FragmentEditor.prototype.isRow = function (layer) {
        return layer instanceof N2Classes.Row;
    };

    FragmentEditor.prototype.isCol = function (layer) {
        return layer instanceof N2Classes.Col;
    };

    FragmentEditor.prototype.isLayer = function (layer) {
        return layer instanceof N2Classes.Layer;
    };

    FragmentEditor.prototype.isContent = function (layer) {
        return layer instanceof N2Classes.Content;
    };

    //<editor-fold desc="Initialize the device mode changer">


    FragmentEditor.prototype._initDeviceModeChange = function () {
        var resetButton = $('#layerresettodesktop').on('click', $.proxy(this.__onResetToDesktopClick, this));
        this.resetToDesktopTRElement = resetButton.closest('tr');
        this.resetToDesktopGlobalElement = $('#n2-ss-layer-reset-to-desktop').on('click', $.proxy(function () {
            if (this.resetToDesktopTRElement.css('display') == 'block') {
                resetButton.trigger('click');
            }
        }, this));

        var showOn = $('#n2-ss-layer-show-on'),
            showOnShortCuts = {},
            deviceModes = this.editor.getAvailableDeviceModes();
        for (var k in deviceModes) {
            if (deviceModes[k]) {
                showOnShortCuts[k] = $('<div class="n2-radio-option"><i class="n2-i n2-it n2-i-' + k + '"></i></div>').on('click', $.proxy(function (mode) {
                    this.layerOptions.currentForm[mode]
                        .data('field')
                        .onoff.trigger('click');
                }, this, k)).appendTo(showOn);
            }
        }

        showOn.children().first().addClass('n2-first');
        showOn.children().last().addClass('n2-last');


        this.globalShowOnDeviceCB = function (mode) {
            if (typeof showOnShortCuts[mode] !== 'undefined') {
                showOnShortCuts[mode].toggleClass('n2-active', this.layerOptions.currentForm[mode].val() == 1);
            }
        };

        this.layerOptions.forms.global.desktopPortrait.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'desktopPortrait'));
        this.layerOptions.forms.global.desktopLandscape.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'desktopLandscape'));
        this.layerOptions.forms.global.tabletPortrait.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'tabletPortrait'));
        this.layerOptions.forms.global.tabletLandscape.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'tabletLandscape'));
        this.layerOptions.forms.global.mobilePortrait.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'mobilePortrait'));
        this.layerOptions.forms.global.mobileLandscape.on('nextendChange', $.proxy(this.globalShowOnDeviceCB, this, 'mobileLandscape'));

        $('#layershow').data('field').setAvailableDevices(deviceModes);

        this.refreshMode();

        this.ready.resolve();

    }

    /**
     * Refresh the current responsive mode. Example: you are in tablet view and unpublish a layer for tablet, then you should need a refresh on the mode.
     */
    FragmentEditor.prototype.refreshMode = function () {
        this.mode = this.editor.getDeviceMode();

        this.resetToDesktopTRElement.css('display', (this.mode == 'desktopPortrait' ? 'none' : ''));
        this.resetToDesktopGlobalElement.css('display', (this.mode == 'desktopPortrait' ? 'none' : ''));

        this.mainContainer.container.changeEditorModes(this.mode);
    };

    FragmentEditor.prototype.onChangeDeviceOrientation = function () {
        this.refreshMode();
    };

    FragmentEditor.prototype.onResize = function (ratios) {
        this.mainContainer.onResize(ratios);

        if (this.canvasSettings.ruler) {
            this.canvasSettings.ruler.onResize();
        }
    };

    /**
     * Reset the custom values of the current mode on the current layer to the desktop values.
     * @private
     */
    FragmentEditor.prototype.__onResetToDesktopClick = function () {
        if (this.mainContainer.getSelectedLayer()) {
            var mode = this.getMode();
            this.mainContainer.getSelectedLayer().resetMode(mode);
        }
    };

    FragmentEditor.prototype.copyOrResetMode = function (mode) {
        var currentMode = this.getMode();
        if (currentMode == 'desktopPortrait') {
            if (mode != 'desktopPortrait') {
                this.mainContainer.container.resetModes(mode);
            }
        } else {
            if (mode == currentMode) {
                this.mainContainer.container.resetModes(mode);
            } else {
                this.mainContainer.container.copyModes(currentMode, mode);
            }
        }
    };

//</editor-fold>

    FragmentEditor.prototype.getSnap = function () {
        if (this.canvasSettings.get("n2-ss-snap-to-enabled")) {
            return $(this.configuration.snapSelector);
        }
        return false;
    };

    /**
     * Get the HTML code of the whole slide
     * @returns {string} HTML
     */
    FragmentEditor.prototype.getHTML = function () {
        var node = $('<div></div>');

        var list = this.mainContainer.container.getAllLayers();
        for (var i = 0; i < list.length; i++) {
            node.append(list[i].getHTML(true));
        }

        return node.html();
    };


    FragmentEditor.prototype.getData = function () {
        return this.mainContainer.container.getData();
    };

    FragmentEditor.prototype.importLayers = function (data, overwrite) {
        var group = this.mainContainer;

        var layers = $.extend(true, [], data);
        if (overwrite) {
            this.mainContainer.deleteLayers();
        }

        this._idTranslation = {};

        var layerNodes = this.dataToLayers(layers);

        for (var i = 0; i < layerNodes.length; i++) {
            this.mainContainer.container.append(layerNodes[i]);
        }

        this.refreshMode();


        if (!this.mainContainer.getSelectedLayer()) {
            var layers = this.mainContainer.container.getSortedLayers();
            if (layers.length > 0) {
                layers[0].activate();
            }
        }

    };

    FragmentEditor.prototype.loadComponentWithNode = function (group, $component, needHistory, refresh) {

        var component = group.container.append($component);

        if (refresh) {
            this.refreshMode();
        }

        return component;
    };

    FragmentEditor.prototype.insertComponentWithNode = function (group, $component, index, needHistory, refresh) {

        var component = group.container.insertAt($component, index);

        if (refresh) {
            this.refreshMode();
        }

        return component;
    };


    /**
     * getter for the currently selected layer
     * @returns {jQuery|boolean} layer element in jQuery representation or false
     * @private
     */

    FragmentEditor.prototype.fixActiveLayer = function () {
        var selectedLayer = this.mainContainer.getSelectedLayer();
        if (selectedLayer == false || selectedLayer.isDeleted) {
            this.resetActiveLayer();
        }
    };

    FragmentEditor.prototype.resetActiveLayer = function () {
        var layers = this.mainContainer.container.getSortedLayers();
        if (layers.length) {
            layers[layers.length - 1].activate();
        } else {
            this.changeActiveLayer(null);
        }
    };

    FragmentEditor.prototype.changeActiveLayer = function (nextActiveLayer, preventExitFromSelection) {
        var layer = this.mainContainer.getSelectedLayer();
        if (layer && !layer.isDeleted) {
            // There is a chance that the layer already deleted
            layer.$.off('propertyChanged.editor')
                .off('.active');

            layer.deActivate();
        }
        this.mainContainer.activeLayer = nextActiveLayer;

        if (!preventExitFromSelection) {
            this.exitSelectMode();
        }

        if (nextActiveLayer) {

            this.layerOptions.changeActiveComponent(nextActiveLayer, nextActiveLayer.type, nextActiveLayer.placement.getType(), nextActiveLayer.getProperties());

            nextActiveLayer.$.on({
                'propertyChanged.editor': $.proxy(this.layerOptions.onUpdateField, this.layerOptions),
                'placementChanged.active': $.proxy(function (e, current, last) {
                    this.layerOptions.changeActiveComponentPlacement(current, nextActiveLayer.property);
                }, this)
            });
        }

        this.$.trigger('activeLayerChanged');
    };

    FragmentEditor.prototype.highlight = function (layer) {
        this.$highlight.appendTo(layer.layer);
    };

    FragmentEditor.prototype.deHighlight = function (layer) {
        this.$highlight.detach();
    };

    FragmentEditor.prototype.delete = function () {
        if (this.mainContainer.getSelectedLayer()) {
            this.doActionOnActiveLayer('delete');
        }
    };

    FragmentEditor.prototype.duplicate = function () {
        if (this.mainContainer.getSelectedLayer()) {
            this.doActionOnActiveLayer('duplicate', [this.selectMode == SELECT_MODE.ON ? false : true, false]);
        }
    };

    FragmentEditor.prototype.copy = function (clickedLayer) {
        var requestedLayers;
        if (clickedLayer == undefined) {
            if (this.selectMode == 1) {
                requestedLayers = this.selectedLayers;
            } else {
                var activeLayer = this.mainContainer.getSelectedLayer();
                if (activeLayer) {
                    if (this.isCol(activeLayer) || this.isContent(activeLayer)) {
                        requestedLayers = activeLayer.container.getSortedLayers()
                    } else {
                        requestedLayers = [activeLayer];
                    }
                }
            }
        } else {
            if (this.isCol(clickedLayer) || this.isContent(clickedLayer)) {
                requestedLayers = clickedLayer.container.getSortedLayers()
            } else {
                requestedLayers = [clickedLayer];
            }
        }

        var layers = this.mainContainer.getLayerData(requestedLayers);
        if (layers.length) {
            $.jStorage.set('ss3layersclipboard', JSON.stringify(layers))
        }
    };

    FragmentEditor.prototype.paste = function (target) {
        var clipboard = $.jStorage.get('ss3layersclipboard');
        if (clipboard) {
            var layers = JSON.parse(clipboard);
            if (layers.length) {
                var targetGroup;
                if (target === undefined || !target) {
                    targetGroup = this.mainContainer.getActiveGroup();
                } else {
                    if (this.isCol(target) || this.isContent(target)) {
                        targetGroup = target;
                    } else {
                        targetGroup = target.group;
                    }
                }
                this.mainContainer.addLayers(layers, targetGroup);
            }
        }
    };

    FragmentEditor.prototype.hasLayersOnClipboard = function () {
        if ($.jStorage.get('ss3layersclipboard')) {
            return true;
        }
        return false;
    };

    FragmentEditor.prototype.addContextMenu = function () {

        this.$editedElement.nextendContextMenu({
            onShow: $.proxy(function (e, contextMenu) {
                var $target = $(e.target);

                var $closestLayer = $target.closest('.n2-ss-layer'),
                    closestLayer = $closestLayer.data('layerObject');
                if (!closestLayer) {
                    closestLayer = this.mainContainer.getSelectedLayer();
                }

                if (closestLayer) {
                    if (this.isCol(closestLayer) || this.isContent(closestLayer)) {
                        contextMenu.addItem('Copy child layers', 'n2-i-copy', $.proxy(function () {
                            this.copy(closestLayer);
                        }, this));
                    } else {
                        contextMenu.addItem('Copy layer', 'n2-i-copy', $.proxy(function () {
                            if (this.selectMode == SELECT_MODE.ON) {
                                this.copy();
                            } else {
                                this.copy(closestLayer);
                            }
                        }, this));
                    }
                }

                if (this.hasLayersOnClipboard()) {
                    contextMenu.addItem('Paste layer(s)', 'n2-i-paste', $.proxy(function () {
                        this.paste(closestLayer);
                    }, this));
                }

                contextMenu.addItem('Copy slide', 'n2-i-copy', $.proxy(function () {
                    this.editor.copy();
                }, this));
                if (this.editor.hasClipboard()) {
                    contextMenu.addItem('Paste slide', 'n2-i-paste', $.proxy(function () {
                        this.editor.paste();
                    }, this));
                }
            }, this)
        });
    };


    FragmentEditor.prototype.initSelectMode = function () {
        this.selectMode = SELECT_MODE.OFF;
        this.selectedLayers = [];

        $('.n2-ss-layer-list-top-bar .n2-button').on('mousedown', $.proxy(function (e) {
            e.preventDefault();
            switch ($(e.currentTarget).data('action')) {
                case 'delete':
                    this.delete();
                    break;
                case 'duplicate':
                    this.duplicate();
                    break;
                case 'group':
                    this.createGroupFromSelected();
                    break;
                case 'cancel':
                    this.exitSelectMode();
                    break;
            }
        }, this))
    };

    FragmentEditor.prototype.startSelection = function (isGroupMode) {
        if (isGroupMode) {
            if (this.selectMode == SELECT_MODE.ON) {
                this.exitSelectMode();
            }
            this.changeSelectMode(SELECT_MODE.GROUP);
        } else {
            this.changeSelectMode(SELECT_MODE.ON);
        }
    };

    FragmentEditor.prototype.changeSelectMode = function (targetMode) {
        var lastMode = this.selectMode;
        if (lastMode != targetMode) {

            if (lastMode == SELECT_MODE.ON) {
                $('#n2-admin').removeClass('n2-ss-select-layer-mode-on');
            } else if (lastMode == SELECT_MODE.GROUP) {
                $('#n2-admin').removeClass('n2-ss-select-layer-mode-group');
            }

            this.selectMode = targetMode;

            if (lastMode == SELECT_MODE.GROUP && targetMode == SELECT_MODE.ON) {
                this.selectedLayers[0].activate(null, null, true);
            }

            if (targetMode == SELECT_MODE.OFF) {
                $('#n2-admin').removeClass('n2-ss-select-layer-mode');
            } else {
                $('#n2-admin').addClass('n2-ss-select-layer-mode');
                if (targetMode == SELECT_MODE.ON) {
                    $('#n2-admin').addClass('n2-ss-select-layer-mode-on');
                } else if (targetMode == SELECT_MODE.GROUP) {
                    $('#n2-admin').addClass('n2-ss-select-layer-mode-group');
                }
            }

            if (this.selectMode == SELECT_MODE.OFF) {
                $('body').off('.n2-ss-selection');
            } else {
                $('body').on('mousedown.n2-ss-selection', $.proxy(function (e) {
                    if (e.which != 3 && N2Classes.WindowManager.get().getCurrentWindow() == 'main') {
                        if (N2Classes.WindowManager.get().mouseDownArea === false) {
                            this.exitSelectMode();
                        }
                    }
                }, this));
            }
        }
    };

    FragmentEditor.prototype.endSelection = function (isGroupMode) {
        if (isGroupMode && this.selectMode == SELECT_MODE.GROUP) {
            this.exitSelectMode();
        }
    };

    FragmentEditor.prototype.selectLayer = function (layer, addActive) {
        if (layer.type != 'layer') {
            return true;
        }

        if (this.selectMode != SELECT_MODE.ON) {

            var activeLayer = this.mainContainer.getSelectedLayer();
            if (activeLayer.type == 'layer') {
                this.startSelection(false);
                if (addActive) {
                    this.selectedLayers.push(activeLayer);
                }
            } else {
                layer.activate(null);
                return true;
            }
        }

        this._selectLayer(layer);

        return true;
    };

    FragmentEditor.prototype._selectLayer = function (layer) {

        var index = $.inArray(layer, this.selectedLayers);
        if (index != -1) {
            if (this.selectMode == SELECT_MODE.ON && this.selectedLayers.length <= 1) {
                this.exitSelectMode();
                return false;
            }

            var deSelectedLayer = this.selectedLayers[index];
            this.selectedLayers.splice(index, 1);
            layer.layerRow.removeClass('n2-selected');
            layer.layer.removeClass('n2-ss-layer-selected');

            if (this.selectMode == SELECT_MODE.ON && this.selectedLayers.length <= 1) {
                this.selectedLayers[0].activate();
                this.exitSelectMode();
                return false;
            }

            // As the active layer removed from the selection,
            // change the active layer to the first of the current selection
            if (deSelectedLayer === this.mainContainer.getSelectedLayer()) {
                this.selectedLayers[0].activate(false, null, true);
            }

        } else {
            var pushToIndex = this.selectedLayers.length;
            /*for (var i = 0; i < this.selectedLayers.length; i++) {
             if (this.selectedLayers[i].placement.doAction('indexCompare', layer)) {
             pushToIndex = i;
             break;
             }
             }*/
            for (var i = 0; i < this.selectedLayers.length; i++) {
                if (layer.layer.add(this.selectedLayers[i].layer).index(this.selectedLayers[i].layer) > 0) {
                    pushToIndex = i;
                    break;
                }
            }

            this.selectedLayers.splice(pushToIndex, 0, layer);
        }
        for (var i = 0; i < this.selectedLayers.length; i++) {
            this.selectedLayers[i].layerRow.addClass('n2-selected');
            this.selectedLayers[i].layer.addClass('n2-ss-layer-selected');
        }
    };

    FragmentEditor.prototype.addSelection = function (layers, isGroupSelected) {
        if (!isGroupSelected) {
            this.changeSelectMode(SELECT_MODE.ON);
        }

        for (var i = 0; i < layers.length; i++) {
            this._selectLayer(layers[i], false);
        }
    };

    FragmentEditor.prototype.exitSelectMode = function () {
        if (this.selectMode) {
            for (var i = 0; i < this.selectedLayers.length; i++) {
                if (this.selectedLayers[i] != this.mainContainer.getSelectedLayer()) {
                    this.selectedLayers[i].layerRow.removeClass('n2-active');
                }
                this.selectedLayers[i].layerRow.removeClass('n2-selected');
                this.selectedLayers[i].layer.removeClass('n2-ss-layer-selected');
            }
            $('#n2-admin').removeClass('n2-ss-select-layer-mode');
            this.selectedLayers = [];
            this.changeSelectMode(SELECT_MODE.OFF);
        }
    };

    FragmentEditor.prototype.doActionOnActiveLayer = function (action, args) {
        if (this.selectMode == SELECT_MODE.ON) {

            var selectedLayers = $.extend([], this.selectedLayers);
            for (var i = 0; i < selectedLayers.length; i++) {
                selectedLayers[i][action].apply(selectedLayers[i], args);
            }
        } else {
            var selectedLayer = this.mainContainer.getSelectedLayer();
            if (selectedLayer) {
                selectedLayer[action].apply(selectedLayer, args);
            }
        }
    };

    FragmentEditor.prototype.canvasDragStart = function (e, ui) {
        if (this.selectMode && this.currentEditorMode == 'canvas' && ui.mode == 'absolute') {

            var targetFoundInSelection = false;
            for (var i = 0; i < this.selectedLayers.length; i++) {
                var selectedLayer = this.selectedLayers[i],
                    $selectedLayer = selectedLayer.layer;

                if ($selectedLayer[0] != ui.layer.layer[0]) {

                    var display = $selectedLayer.css('display');
                    if (display == 'none') {
                        $selectedLayer.css('display', '');
                    }

                    selectedLayer._originalPosition = $selectedLayer.position();


                    if (display == 'none') {
                        $selectedLayer.css('display', 'none');
                    }
                } else {
                    targetFoundInSelection = true;
                }
            }
            if (!targetFoundInSelection) {
                this.exitSelectMode();
            }

            this.isMultiDrag = true;
        }
    };

    FragmentEditor.prototype.canvasDragMove = function (e, ui) {
        if (this.isMultiDrag === true) {
            var movement = {
                left: ui.position.left + ui.canvasOffset.left - ui.originalOffset.left,
                top: ui.position.top + ui.canvasOffset.top - ui.originalOffset.top
            };
            for (var i = 0; i < this.selectedLayers.length; i++) {
                var selectedLayer = this.selectedLayers[i];
                if (!this.isGroup(selectedLayer)) {
                    var $selectedLayer = selectedLayer.layer;
                    if ($selectedLayer[0] != ui.layer.layer[0]) {

                        $selectedLayer.css({
                            left: selectedLayer._originalPosition.left + movement.left,
                            top: selectedLayer._originalPosition.top + movement.top,
                            bottom: 'auto',
                            right: 'auto'
                        });
                        selectedLayer.placement.doAction('triggerLayerResized');

                    }
                }
            }
        }
    };

    FragmentEditor.prototype.canvasDragStop = function (e, ui) {
        if (this.isMultiDrag === true) {
            for (var i = 0; i < this.selectedLayers.length; i++) {
                var selectedLayer = this.selectedLayers[i];
                if (!this.isGroup(selectedLayer)) {
                    var $selectedLayer = selectedLayer.layer;
                    if ($selectedLayer[0] != ui.layer.layer[0]) {
                        var display = $selectedLayer.css('display');
                        if (display == 'none') {
                            $selectedLayer.css('display', 'block');
                        }
                        var left = parseInt(selectedLayer.layer.css('left')),
                            top = parseInt(selectedLayer.layer.css('top'));
                        selectedLayer.placement.current.setPosition(left, top);

                        selectedLayer.placement.doAction('triggerLayerResized');

                        if (display == 'none') {
                            $selectedLayer.css('display', "none");
                        }
                    }
                }
            }
            this.isMultiDrag = false;
            return true;
        }
        return false;
    };

    FragmentEditor.prototype.historyDeleteGroup = function (historicalGroup) {
        historicalGroup.getSelf().delete();
    };

    FragmentEditor.prototype.historyCreateGroup = function (historicalGroup) {
        var group = new N2Classes.Group(this, this.mainContainer, {}, null);
        group.create();
        historicalGroup.setSelf(group);
    };

    FragmentEditor.prototype.createGroupFromSelected = function () {
        var group;
        switch (this.selectMode) {
            case SELECT_MODE.ON:
                group = new N2Classes.Group(this, this.mainContainer, {}, null);
                group.create();

                N2Classes.History.get().addSimple(this, this.historyDeleteGroup, this.historyCreateGroup, [group]);

                group.addLayers(this.selectedLayers);

                this.exitSelectMode();
                group.activate();

                break;
            case SELECT_MODE.OFF:
                var activeLayer = this.mainContainer.getSelectedLayer();

                // If the single layer is already in a group, we just activate that group
                if (activeLayer.group instanceof N2Classes.Group) {
                    activeLayer.group.activate();
                } else if (activeLayer instanceof N2Classes.Content || activeLayer instanceof N2Classes.Col) {
                    // Do nothing for content and Col layers
                } else {
                    group = new N2Classes.Group(this, this.mainContainer, {}, null);
                    group.create();

                    N2Classes.History.get().addSimple(this, this.historyDeleteGroup, this.historyCreateGroup, [group]);

                    group.addLayers([activeLayer]);

                    group.activate();
                }
                break;
            case SELECT_MODE.GROUP:
                break;
        }
    };

    FragmentEditor.prototype.createRow = function (group) {
        var layer = new N2Classes.Row(this, group, {});
        layer.create();
        layer.hightlightStructure();
        return {
            layer: layer
        };
    };

    FragmentEditor.prototype.createCol = function (group) {
        var activeGroup = group,
            layer = null;
        if (this.isCol(activeGroup)) {
            layer = activeGroup.group.createCol();
        } else if (this.isRow(activeGroup)) {
            layer = activeGroup.createCol();
        } else if (this.isCol(activeGroup.group)) {
            layer = activeGroup.group.group.createCol();
        } else {
            return this.createRow(group);
        }
        layer.activate(null);
        return {
            layer: layer
        };
    };

    FragmentEditor.prototype.preventActivationBubbling = function () {
        if (!this.shouldPreventActivationBubble) {
            this.shouldPreventActivationBubble = true;
            return true;
        }
        return false;
    };

    FragmentEditor.prototype.allowActivation = function () {
        this.shouldPreventActivationBubble = false;
    };

    FragmentEditor.prototype.hotkeys = function () {
        $(window).on({
            keydown: $.proxy(function (e) {
                var isTimelineActive = false;
                if (e.target.tagName != 'TEXTAREA' && e.target.tagName != 'INPUT' && !isTimelineActive) {
                    var hasSelectedLayer = this.mainContainer.getSelectedLayer(),
                        keyCode = e.keyCode;

                    if (keyCode >= 49 && keyCode <= 57) {
                        var location = e.originalEvent.location || e.originalEvent.keyLocation || 0;
                        // Fix OSX Chrome numeric keycodes
                        if (location == 3) {
                            keyCode += 48;
                        }
                    }

                    if (hasSelectedLayer) {

                        if (keyCode == 46 || keyCode == 8) {
                            this.delete();
                            e.preventDefault();
                        } else if (keyCode == 35) {
                            this.duplicate();
                            e.preventDefault();
                        } else if (keyCode == 16) {
                            keys[keyCode] = 1;
                        } else if (keyCode == 38) {
                            if (!keys[keyCode]) {
                                var fn = $.proxy(function () {
                                    this.doActionOnActiveLayer('moveY', [-1 * (keys[16] ? 10 : 1)]);
                                }, this);
                                fn();
                                keys[keyCode] = setInterval(fn, 100);
                            }
                            e.preventDefault();
                        } else if (keyCode == 40) {
                            if (!keys[keyCode]) {
                                var fn = $.proxy(function () {
                                    this.doActionOnActiveLayer('moveY', [(keys[16] ? 10 : 1)]);
                                }, this);
                                fn();
                                keys[keyCode] = setInterval(fn, 100);
                            }
                            e.preventDefault();
                        } else if (keyCode == 37) {
                            if (!keys[keyCode]) {
                                var fn = $.proxy(function () {
                                    this.doActionOnActiveLayer('moveX', [-1 * (keys[16] ? 10 : 1)]);
                                }, this);
                                fn();
                                keys[keyCode] = setInterval(fn, 100);
                            }
                            e.preventDefault();
                        } else if (keyCode == 39) {
                            if (!keys[keyCode]) {
                                var fn = $.proxy(function () {
                                    this.doActionOnActiveLayer('moveX', [keys[16] ? 10 : 1]);
                                }, this);
                                fn();
                                keys[keyCode] = setInterval(fn, 100);
                            }
                            e.preventDefault();
                        } else if (keyCode >= 97 && keyCode <= 105) {

                            var hAlign = horizontalAlign[keyCode],
                                vAlign = verticalAlign[keyCode],
                                toZero = false;
                            if (this.layerOptions.forms.placement.absolute.align.val() == hAlign && this.layerOptions.forms.placement.absolute.valign.val() == vAlign) {
                                toZero = true;
                            }
                            // numeric pad
                            this.layerOptions.layerFeatures.horizontalAlign(hAlign, toZero);
                            this.layerOptions.layerFeatures.verticalAlign(vAlign, toZero);

                        } else if (keyCode == 65) {
                            e.preventDefault();
                            var selectedLayer = this.mainContainer.getSelectedLayer();
                            if (selectedLayer && selectedLayer.placement.getType() == 'absolute') {
                                selectedLayer.placement.current.fit();
                            }
                        }
                    }

                    if (e.ctrlKey || e.metaKey) {
                        if (keyCode == 90) {
                            if (e.shiftKey) {
                                if (N2Classes.History.get().redo()) {
                                    e.preventDefault();
                                }
                            } else {
                                if (N2Classes.History.get().undo()) {
                                    e.preventDefault();
                                }
                            }
                        } else if (keyCode == 71) {
                            this.createGroupFromSelected();
                            e.preventDefault();
                        } else if (keyCode == 68) {
                            e.preventDefault();
                            this.editor.copy();
                        } else if (keyCode == 70) {
                            e.preventDefault();
                            this.editor.paste();
                        } else if (keyCode == 67) {
                            this.copy();
                        } else if (keyCode == 86) {
                            this.paste();
                        }
                    }
                }
            }, this),
            keyup: $.proxy(function (e) {
                if (typeof keys[e.keyCode] !== 'undefined' && keys[e.keyCode]) {
                    clearInterval(keys[e.keyCode]);
                    keys[e.keyCode] = 0;
                }
            }, this)
        });
    };

    FragmentEditor.prototype.getSelf = function () {
        return this;
    };

    return FragmentEditor;
});
N2D('CanvasUserInterface', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param fragmentEditor
     * @constructor
     */
    function CanvasUserInterface(fragmentEditor) {
        this.fragmentEditor = fragmentEditor;
        this.isShown = !$.jStorage.get('ssLayersShown', false);
        this.tlHeight = $.jStorage.get('ssLayersHeight') || 200;

        this.$container = $('#n2-ss-layers');
        this.fixScroll();
        this.switchLayerList();

        this.topBar = $('.n2-ss-layer-list-top-bar')
            .on('mousedown', $.proxy(this.resizeStart, this));

        this.topBar.find('.n2-ss-layer-list-opener').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.switchLayerList();
        }, this));

        $('.n2-ss-slide-show-layers').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.switchLayerList();
        }, this));

        this.onResize();
        $(window).on('resize', $.proxy(this.onResize, this));
    };

    CanvasUserInterface.prototype.onResize = function () {
        var h = this.$container.height();
        this.paneLeft.height(h - 48);
        this.paneRight.height(h - 48);
    };

    CanvasUserInterface.prototype.onActivateLayer = function (layer) {

        var scrollTop = this.paneLeft.scrollTop(),
            top = 0,
            currentLayer = layer;

        do {
            top += currentLayer.layerRow.get(0).offsetTop;
            currentLayer = currentLayer.group;
        } while (currentLayer !== this.fragmentEditor.mainContainer);

        if (top < scrollTop || top > scrollTop + this.paneLeft.height() - 32) {
            this.paneLeft.scrollTop(top);
            this.paneRight.scrollTop(top);
        }
    };

    CanvasUserInterface.prototype.fixScroll = function () {

        this.paneLeft = $('.n2-ss-layers-sidebar-rows');
        this.paneRight = $('.n2-ss-timeline-content-layers-container');

        var cb = $.proxy(function (e) {
            var top = this.paneLeft.scrollTop();
            if (e.originalEvent.deltaY > 0) {
                top += 32;
            } else {
                top -= 32;
            }
            top = Math.round(top / 32) * 32;
            this.paneLeft.scrollTop(top);
            this.paneRight.scrollTop(top);
            e.preventDefault();
        }, this);

        this.paneLeft.on('wheel', cb);
        this.paneLeft.on('scroll', $.proxy(function (e) {
            var top = this.paneLeft.scrollTop();
            this.paneRight.scrollTop(top);
            e.preventDefault();
        }, this));

        this.paneRight.on('wheel', cb);
    };

    CanvasUserInterface.prototype.resizeStart = function (e) {
        if (!this.isShown) return;
        if (e.target == this.topBar[0] || $(e.target).hasClass('n2-h2')) {
            e.preventDefault();
            this.startY = e.clientY;
            this.height = this.$container.height();
            $('body').on({
                'mousemove.n2-ss-tl-resize': $.proxy(this.resizeMove, this),
                'mouseup.n2-ss-tl-resize': $.proxy(this.resizeStop, this),
                'mouseleave.n2-ss-tl-resize': $.proxy(this.resizeStop, this)
            });
        }
    };

    CanvasUserInterface.prototype.resizeMove = function (e) {
        e.preventDefault();
        this.setTLHeight(this._calculateDesiredHeight(e));
    };

    CanvasUserInterface.prototype.resizeStop = function (e) {
        e.preventDefault();
        $('body').off('.n2-ss-tl-resize');
        var h = this._calculateDesiredHeight(e);
        this.setTLHeight(h);

        this.tlHeight = h;
        $.jStorage.set('ssLayersHeight', h);
        $('#n2-admin').triggerHandler('resize');
    };

    CanvasUserInterface.prototype._calculateDesiredHeight = function (e) {
        var h = this.startY - e.clientY + this.height - 48;
        return this.__calculateDesiredHeight(h);
    };

    CanvasUserInterface.prototype.__calculateDesiredHeight = function (h) {
        return Math.round(Math.min(Math.max(32, h), (window.innerHeight || document.documentElement.clientHeight) / 2) / 32) * 32 + 48;
    };


    CanvasUserInterface.prototype.switchLayerList = function () {
        this.isShown = !this.isShown;
        this.$container.toggleClass('n2-active', this.isShown);
        if (this.isShown) {
            this.setTLHeight(this.tlHeight);
        } else {
            this.setTLHeight(48);
        }
        $.jStorage.set('ssLayersShown', this.isShown);
    };

    CanvasUserInterface.prototype.setTLHeight = function (h) {
        h = Math.max(48, h);
        this.$container.height(h);
        h = this.$container.height();
        this.paneLeft.height(h - 48);
        this.paneRight.height(h - 48);

        nextend.triggerResize();
    };

    CanvasUserInterface.prototype.activateAdd = function (x, y) {
        this.$add.css({
            left: x,
            top: y
        }).appendTo(this.$container);
    };

    return CanvasUserInterface;
});
N2D('LayerFeatures', function ($, undefined) {
    "use strict";

    var nameToIndex = {
        left: 0,
        center: 1,
        right: 2,
        top: 0,
        middle: 1,
        bottom: 2
    };

    /**
     * @memberOf N2Classes
     *
     * @param fields
     * @param fragmentEditor
     * @constructor
     */
    function LayerFeatures(fields, fragmentEditor) {
        this.fields = fields;
        this.fragmentEditor = fragmentEditor;

        this.initParentLinker();
        this.initAlign();
        this.initEvents();
    }

    LayerFeatures.prototype.initParentLinker = function () {
        var field = this.fields.parentid.data('field'),
            parentLinker = $('#n2-ss-layer-parent-linker').on({
                click: function (e) {
                    field.click(e);
                }
            });
    };

    LayerFeatures.prototype.initAlign = function () {

        this.layerDefault = {
            align: null,
            valign: null
        };

        var hAlignButton = $('#n2-ss-layer-horizontal-align .n2-radio-option'),
            vAlignButton = $('#n2-ss-layer-vertical-align .n2-radio-option');

        hAlignButton.add(vAlignButton).on('click', $.proxy(function (e) {
            if (e.ctrlKey || e.metaKey) {
                var $el = $(e.currentTarget),
                    isActive = $el.hasClass('n2-sub-active'),
                    align = $el.data('align');
                switch (align) {
                    case 'left':
                    case 'center':
                    case 'right':
                        hAlignButton.removeClass('n2-sub-active');
                        if (isActive) {
                            $.jStorage.set('ss-item-horizontal-align', null);
                            this.layerDefault.align = null;
                        } else {
                            $.jStorage.set('ss-item-horizontal-align', align);
                            this.layerDefault.align = align;
                            $el.addClass('n2-sub-active');
                        }
                        break;
                    case 'top':
                    case 'middle':
                    case 'bottom':
                        vAlignButton.removeClass('n2-sub-active');
                        if (isActive) {
                            $.jStorage.set('ss-item-vertical-align', null);
                            this.layerDefault.valign = null;
                        } else {
                            $.jStorage.set('ss-item-vertical-align', align);
                            this.layerDefault.valign = align;
                            $el.addClass('n2-sub-active');
                        }
                        break;
                }
            } else if (this.fragmentEditor.mainContainer.getSelectedLayer()) {
                var align = $(e.currentTarget).data('align');
                switch (align) {
                    case 'left':
                    case 'center':
                    case 'right':
                        this.horizontalAlign(align, true);
                        break;
                    case 'top':
                    case 'middle':
                    case 'bottom':
                        this.verticalAlign(align, true);
                        break;
                }
            }
        }, this));

        this.fields.align.on('nextendChange', $.proxy(function () {
            hAlignButton.removeClass('n2-active');
            switch (this.fields.align.val()) {
                case 'left':
                    hAlignButton.eq(0).addClass('n2-active');
                    break;
                case 'center':
                    hAlignButton.eq(1).addClass('n2-active');
                    break;
                case 'right':
                    hAlignButton.eq(2).addClass('n2-active');
                    break;
            }
        }, this));
        this.fields.valign.on('nextendChange', $.proxy(function () {
            vAlignButton.removeClass('n2-active');
            switch (this.fields.valign.val()) {
                case 'top':
                    vAlignButton.eq(0).addClass('n2-active');
                    break;
                case 'middle':
                    vAlignButton.eq(1).addClass('n2-active');
                    break;
                case 'bottom':
                    vAlignButton.eq(2).addClass('n2-active');
                    break;
            }
        }, this));


        var hAlign = $.jStorage.get('ss-item-horizontal-align', null),
            vAlign = $.jStorage.get('ss-item-vertical-align', null);
        if (hAlign != null) {
            hAlignButton.eq(nameToIndex[hAlign]).addClass('n2-sub-active');
            this.layerDefault.align = hAlign;
        }
        if (vAlign != null) {
            vAlignButton.eq(nameToIndex[vAlign]).addClass('n2-sub-active');
            this.layerDefault.valign = vAlign;
        }
    };

    LayerFeatures.prototype.horizontalAlign = function (align, toZero) {
        if (this.fields.align.val() != align) {
            this.fields.align.data('field').options.eq(nameToIndex[align]).trigger('click');
        } else if (toZero) {
            this.fields.left.val(0).trigger('change');
        }
    };

    LayerFeatures.prototype.verticalAlign = function (align, toZero) {
        if (this.fields.valign.val() != align) {
            this.fields.valign.data('field').options.eq(nameToIndex[align]).trigger('click');
        } else if (toZero) {
            this.fields.top.val(0).trigger('change');
        }
    };

    LayerFeatures.prototype.initEvents = function () {
        var parent = $('#n2-tab-events'),
            heading = parent.find('.n2-h3'),
            headingLabel = heading.html(),
            row = $('<div class="n2-editor-header n2-h2 n2-uc"><span>' + headingLabel + '</span></div>');

        heading.replaceWith(row);
    };

    return LayerFeatures;
});
N2D('LayerWindow', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param fragmentEditor
     * @constructor
     */
    function LayerWindow(fragmentEditor) {

        this.isMinimized = false;
        this.detachedPosition = {
            left: $.jStorage.get('ssPanelLeft') || 200,
            top: $.jStorage.get('ssPanelTop') || 100,
            height: $.jStorage.get('ssPanelHeight') || 400
        };

        this.hasBreadcrumb = false;
        this.lastHeight = this.detachedPosition.height;

        this.admin = $('#n2-admin');
        this.sidebar = $('#n2-ss-layer-window').on('mousedown', $.proxy(N2Classes.WindowManager.setMouseDownArea, null, 'sidebarClicked'));

        this.title = this.sidebar.find('.n2-ss-layer-window-title-inner');

        this.fragmentEditor = fragmentEditor;

        this.viewPanes = {
            layerEdit: $('#n2-tabbed-slide-editor-settings > .n2-tabs').addClass('n2-scrollable')
        };

        for (var k in this.viewPanes) {
            this.viewPanes[k].on('wheel', function (e) {
                var up = e.originalEvent.deltaY < 0;

                var prevent = function () {
                    e.stopPropagation();
                    e.preventDefault();
                    e.returnValue = false;
                    return false;
                };

                if (!up && this.scrollHeight <= $(this).innerHeight() + this.scrollTop + 1) {
                    return prevent();
                } else if (up && 0 >= this.scrollTop - 1) {
                    return prevent();
                }
            });
        }

        this.panelHeading = $('#n2-tabbed-slide-editor-settings').find('.n2-sidebar-tab-switcher .n2-td');

        var left = this.sidebar.find('.n2-ss-layer-window-title-nav-left');

        $('<a href="#"><i class="n2-i n2-i-minimize n2-i-grey-opacity"></i></a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.toggleMinimize();
        }, this)).appendTo(left);

        var right = this.sidebar.find('.n2-ss-layer-window-title-nav-right');

        $('<a href="#"><i class="n2-i n2-i-closewindow n2-i-grey-opacity"></i></a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.hide();
        }, this)).appendTo(right);

        nextend.tooltip.add(right);

        this.$breadcrumb = $('<div class="n2-ss-layer-window-breadcrumb"></div>').insertAfter('#n2-tabbed-slide-editor-settings > .n2-sidebar-tab-switcher');


        var $verticalBar = $('#n2-ss-add-sidebar');
        $('.n2-ss-add-layer-button').on('click', function (e) {
            e.preventDefault();
            $('#n2-ss-layers-switcher > .n2-labels .n2-td').eq(0).trigger('click');
            $verticalBar.toggleClass('n2-active');
        });

        $('.n2-ss-core-item').on('click', function (e) {
            $verticalBar.removeClass('n2-active');
        });

        var topOffset = $('#wpadminbar, .navbar-fixed-top').height() + $('.n2-top-bar').height();
        this.$verticalBarInner = $('.n2-ss-add-sidebar-inner').each(function () {
            var bar = $(this);
            bar.fixTo(bar.parent(), {
                top: topOffset
            });
        });

        this.$resizeInnerContainer = $('#n2-ss-layers-switcher_0, #n2-ss-layers-switcher_1');
        this.extraHeightToRemove = 60;
        if (!this.$resizeInnerContainer.length) {
            this.extraHeightToRemove = 0;
            this.$resizeInnerContainer = this.$verticalBarInner;
        }

        this.$resizeInnerContainer.css('overflow', 'auto');

        this.detach();

        $('#n2-admin').on('resize', $.proxy(this.resizeVerticalBar, this));

        $(window).on('resize', $.proxy(this.onResize, this));


        $('.n2-ss-slide-duplicate-layer').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.duplicate();
        }, this.fragmentEditor));

        $('.n2-ss-slide-delete-layer').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.delete();
        }, this.fragmentEditor));


        $('body').on('mousedown', $.proxy(function (e) {
            if (N2Classes.WindowManager.get().getCurrentWindow() == 'main') {
                if (N2Classes.WindowManager.get().mouseDownArea === false) {
                    this.hide();
                }
            }
        }, this));

        var $devicespecific = $('<div id="n2-ss-devicespecific-settings"></div>'),
            modes = this.fragmentEditor.editor.getAvailableDeviceModes();

        for (var k in modes) {
            if (modes[k]) {
                var mode = k.replace(/([A-Z])/g, ' $1').split(' '),
                    device = mode[0],
                    orientation = mode[1].toLowerCase();
                $devicespecific.append('<i class="n2-i n2-it n2-i-mini-' + device + '-' + orientation + '" data-device="' + device + '" data-orientation="' + orientation + '"></i>');
            }
        }
        var cb = {
            'mouseenter': $.proxy(function (e) {
                $devicespecific.appendTo(e.currentTarget);
            }, this),
            'mouseleave': $.proxy(function (e) {
                $devicespecific.detach();
            }, this)
        };
        this.sidebar.find('[data-devicespecific] label').prepend('<span class="n2-i n2-i-mini-desktop-portrait"></span>');
        this.sidebar.find('[data-devicespecific] label').on(cb);
        $devicespecific.find('.n2-i').on({
            'click': $.proxy(function (e) {
                //e.stopImmediatePropagation();
                e.preventDefault();
                var $target = $(e.currentTarget);
                $('#n2-ss-devices').find('[data-device="' + $target.data('device') + '"][data-orientation="' + $target.data('orientation') + '"]').trigger('click')
            }, this)
        });
    }

    LayerWindow.prototype.toggleMinimize = function () {
        this.isMinimized = !this.isMinimized;
        this.sidebar.toggleClass('n2-ss-layer-window-minized', this.isMinimized);
        if (!this.isMinimized) {
            this.onResize();
        }
    };

    LayerWindow.prototype.magnetize = function () {
        if (!this.autoPosition) {

            this.autoPosition = 1;
            $.jStorage.set('ssPanelAutoPosition', 1);

            this.magnet.css('display', 'none');

            var activeLayer = this.fragmentEditor.mainContainer.getSelectedLayer();
            if (activeLayer) {
                activeLayer.positionSidebar();
            }
        }
    };

    LayerWindow.prototype.show = function (layer, of) {
        this.setTitle(layer);

        $('body').addClass('n2-ss-layer-edit-visible');
    };

    LayerWindow.prototype._show = function () {
        $('body').addClass('n2-ss-layer-edit-visible');
    };

    LayerWindow.prototype.hide = function () {
        $('body').removeClass('n2-ss-layer-edit-visible');
    };

    LayerWindow.prototype.isVisible = function () {
        return $('body').hasClass('n2-ss-layer-edit-visible');
    };

    LayerWindow.prototype.hideWithDeferred = function (deferred) {
        if ($('body').hasClass('n2-ss-layer-edit-visible')) {
            this.hide();
            deferred.done($.proxy(this._show, this));
        }
    };

    LayerWindow.prototype.setTitle = function (layer) {
        this.title.html(layer.getName());

        this.updateGroupTitle(layer);
    };

    LayerWindow.prototype.updateGroupTitle = function (layer) {
        var i;
        this.$breadcrumb.html('');
        for (i = 0; i < 5; i++) {

            $('<span class="n2-window-title-structure-nav"><span>' + layer.label + '</span><span class="n2-i n2-it n2-i-mini-arrow-thin"></span></span>')
                .on({
                    mouseenter: $.proxy(function () {
                        this.fragmentEditor.highlight(this);
                    }, layer),
                    mouseleave: $.proxy(function () {
                        this.fragmentEditor.deHighlight(this);
                    }, layer),
                    click: $.proxy(function (e) {
                        this.fragmentEditor.deHighlight(this);
                        this.activate(e);
                    }, layer)
                })
                .prependTo(this.$breadcrumb);
            if (layer.group && layer.group !== this.fragmentEditor.mainContainer) {
                layer = layer.group;
            } else {
                break;
            }
        }

        this.hasBreadcrumb = i > 0;
        this.$breadcrumb.toggleClass('n2-has-breadcrumb', this.hasBreadcrumb);
        this.onResize();
    };

    LayerWindow.prototype.getLayerEditExcludedHeight = function () {
        return 85 + (this.hasBreadcrumb ? 23 : 0);
    };

    LayerWindow.prototype.resizeVerticalBar = function () {
        this.$resizeInnerContainer.height((window.innerHeight || document.documentElement.clientHeight) - ($('#n2-ss-layers').is(':visible') && $('#n2-ss-layers').hasClass('n2-active') ? $('#n2-ss-layers').height() : 0) - $('#wpadminbar, .navbar-fixed-top').height() - $('.n2-top-bar').height() - this.extraHeightToRemove);
    };

    LayerWindow.prototype.onResize = function () {
        this.sidebar.css('display', 'block');
        this.resizeVerticalBar();

        var windowHeight = (window.innerHeight || document.documentElement.clientHeight);

        var targetHeight = this.sidebar.height() - this.getLayerEditExcludedHeight();

        this.viewPanes['layerEdit'].height(targetHeight);

        var properties = {},
            windowWidth = (window.innerWidth || document.documentElement.clientWidth);
        var bounding = this.sidebar[0].getBoundingClientRect();

        if (bounding.left < 0) {
            properties.left = 0;
        } else if (bounding.left + bounding.width > windowWidth) {
            properties.left = Math.max(0, windowWidth - bounding.width);
        }

        if (bounding.height > windowHeight - bounding.top) {
            properties.top = windowHeight - bounding.top - bounding.height + bounding.top;
            if (properties.top < 0) {
                this.lastHeight = properties.height = bounding.height + properties.top;
                properties.top = 0;
            }
        }

        this.sidebar.css(properties);
        this.sidebar.css('display', '');

    };

    LayerWindow.prototype.detach = function () {

        this.sidebar.css(this.detachedPosition);
        this.sidebar.appendTo(this.admin);

        this.admin.addClass('n2-sidebar-hidden');

        $(window).off('.n2-ss-panel');
        this.sidebar.removeClass("n2-sidebar-fixed");

        this.sidebar
            .nUIDraggable({
                distance: 5,
                handle: ".n2-ss-layer-window-title",
                containment: 'window',
                stop: $.proxy(function (event, ui) {
                    this.sidebar.css('height', this.lastHeight);
                    var bounding = this.sidebar[0].getBoundingClientRect();
                    this.detachedPosition.left = bounding.left;
                    this.detachedPosition.top = bounding.top;

                    $.jStorage.set('ssPanelLeft', bounding.left);
                    $.jStorage.set('ssPanelTop', bounding.top);

                }, this),
                scroll: false
            })
            .nUIResizable({
                distance: 5,
                handles: "s",
                stop: $.proxy(function (event, ui) {
                    this.lastHeight = this.detachedPosition.height = this.sidebar.height();
                    $.jStorage.set('ssPanelHeight', this.detachedPosition.height);

                }, this),
                create: $.proxy(function (e, ui) {
                    var handle = $(e.target).find('.nui-resizable-handle').addClass('n2-ss-layer-window-resizer');
                }, this)
            });

        this.onResize();
        nextend.triggerResize();
    };

    LayerWindow.prototype.switchTab = function (tabName) {
        this.panelHeading.filter('[data-tab="' + tabName + '"]').trigger('click');
    };

    return LayerWindow;
});
N2D('PositionDisplay', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function PositionDisplay() {
        this.currentSource = '';
        $(window).ready($.proxy(this._ready, this));
    }

    /**
     * @private
     */
    PositionDisplay.prototype._ready = function () {
        this.$body = $('body');
        this.$el = $('<div class="n2 n2-ss-position-display"/>')
            .appendTo('body');
    };

    PositionDisplay.prototype.show = function (source) {
        if (this.currentSource == '') {
            this.currentSource = source;
            this.$el.addClass('n2-active');
            this.$body.addClass('n2-position-display-active');
        }
    };

    PositionDisplay.prototype.update = function (e, source, html) {
        if (this.currentSource == source) {
            this.$el.html(html)
                .css({
                    left: e.pageX + 10,
                    top: e.pageY + 10
                });
        }
    };

    PositionDisplay.prototype.hide = function (source) {
        if (this.currentSource == source || source === undefined) {
            this.$body.removeClass('n2-position-display-active');
            this.$el.removeClass('n2-active');
            this.currentSource = '';
        }

    };


    /**
     * @returns {PositionDisplay}
     */
    PositionDisplay.get = function () {
        var positionDisplay = new PositionDisplay();
        PositionDisplay.get = function () {
            return positionDisplay;
        };
        return positionDisplay;
    };

    return PositionDisplay;
});
N2D('Ruler', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.EditorAbstract} editor
     * @param stored
     * @constructor
     */
    function Ruler(editor, stored) {

        this.editor = editor;

        this.showGuides = 1;
        this.guides = [];
        this.container = $('<div class="n2-ruler-container" />').appendTo('#n2-ss-slide-canvas-container-inner .n2-ss-slider-outer-container');

        this.scale = 10;

        this.vertical = $('<div class="n2-ruler n2-ruler-vertical n2-unselectable"></div>').appendTo('.n2-ss-slider-real-container');
        this.horizontal = $('<div class="n2-ruler n2-ruler-horizontal n2-unselectable"></div>').appendTo(this.container);

        this.verticalSpans = $();
        this.horizontalSpans = $();

        this.onResize();
        $(window).on('resize', $.proxy(this.onResize, this));

        this.horizontal.on('mousedown', $.proxy(function (e) {
            if (this.showGuides) {
                new GuideHorizontal(this, this.horizontal, e);
            }
        }, this));


        this.vertical.on('mousedown', $.proxy(function (e) {
            if (this.showGuides) {
                new GuideVertical(this, this.vertical, e);
            }
        }, this));


        try {
            stored = $.extend({vertical: [], horizontal: []}, JSON.parse(N2Classes.Base64.decode(stored)));
            for (var i = 0; i < stored.horizontal.length; i++) {
                var guide = new GuideHorizontal(this, this.horizontal);
                guide.setPosition(stored.horizontal[i]);
            }
            for (var i = 0; i < stored.vertical.length; i++) {
                var guide = new GuideVertical(this, this.vertical);
                guide.setPosition(stored.vertical[i]);
            }
        } catch (e) {
        }
        this.measureToolVertical();
        this.measureToolHorizontal();
    }

    Ruler.prototype.addGuide = function (guide) {
        this.guides.push(guide);
    };

    Ruler.prototype.removeGuide = function (guide) {
        this.guides.splice($.inArray(guide, this.guides), 1);
    };

    Ruler.prototype.clearGuides = function () {
        for (var i = this.guides.length - 1; i >= 0; i--) {
            this.guides[i].delete();
        }
    };

    Ruler.prototype.onResize = function () {
        var $container = $('.n2-ss-slider-outer-container'),
            width = $container.width(),
            height = $container.height();

        this.container.css({
            width: width + 40,
            height: height + 40
        });

        for (var i = this.horizontalSpans.length - 3; i < width / this.scale; i++) {
            var mark = $('<span />').appendTo(this.horizontal);
            if (i % 10 == 0) {
                mark.addClass('n2-ss-ruler-mark-large').append('<span>' + ((i / 10) * 100) + '</span>');
            } else if (i % 2 == 0) {
                mark.addClass('n2-ss-ruler-mark-medium');
            }
            this.horizontalSpans = this.horizontalSpans.add(mark);
        }

        for (var i = this.verticalSpans.length - 3; i < height / this.scale; i++) {
            var mark = $('<span />').appendTo(this.vertical);
            if (i % 10 == 0) {
                mark.addClass('n2-ss-ruler-mark-large').append('<span>' + ((i / 10) * 100) + '</span>');
            } else if (i % 2 == 0) {
                mark.addClass('n2-ss-ruler-mark-medium');
            }
            this.verticalSpans = this.verticalSpans.add(mark);
        }
    };

    Ruler.prototype.toArray = function () {
        var data = {
            horizontal: [],
            vertical: []
        };
        for (var i = 0; i < this.guides.length; i++) {
            if (this.guides[i] instanceof GuideHorizontal) {
                data.horizontal.push(this.guides[i].position);
            } else if (this.guides[i] instanceof GuideVertical) {
                data.vertical.push(this.guides[i].position);
            }
        }
        return data;
    };

    Ruler.prototype.measureToolVertical = function () {
        var guide = $('<div class="n2-ruler-guide" style="z-index:1;"><div class="n2-ruler-guide-border" style="border-color: #f00;"></div></div>')
            .css('display', 'none')
            .appendTo(this.vertical);

        var guideVisible = false,
            showGuide = $.proxy(function () {
                if (!guideVisible) {
                    guideVisible = true;
                    guide.css('display', '');
                    N2Classes.PositionDisplay.get().show('Guide');
                }
            }, this),
            hideGuide = $.proxy(function () {
                if (guideVisible) {
                    guideVisible = false;
                    guide.css('display', 'none');
                    N2Classes.PositionDisplay.get().hide('Guide');
                }
            }, this);
        this.vertical.on({
            mouseenter: $.proxy(function (e) {
                if (!this.showGuides) return;
                var lastY = 0,
                    offset = Math.round(this.vertical.offset().top);
                showGuide();

                this.vertical.on('mousemove.n2-ruler-measure-tool', $.proxy(function (e) {
                    if ($(e.target).hasClass('n2-ruler-guide-border') && $(e.target).parent()[0] != guide[0]) {
                        hideGuide();
                    } else {
                        showGuide();
                        if (lastY != e.pageY) {
                            var pos = e.pageY - offset;
                            guide.css('top', pos);
                            N2Classes.PositionDisplay.get().update(e, 'Guide', (pos - 40) + 'px');
                            lastY = e.pageY;
                        }
                    }
                }, this));
            }, this),
            mouseleave: $.proxy(function () {
                this.vertical.off('.n2-ruler-measure-tool');
                hideGuide();
            }, this)
        });
    };

    Ruler.prototype.measureToolHorizontal = function () {
        var guide = $('<div class="n2-ruler-guide" style="z-index:1;"><div class="n2-ruler-guide-border" style="border-color: #f00;"></div></div>')
            .css('display', 'none')
            .appendTo(this.horizontal);

        var guideVisible = false,
            showGuide = $.proxy(function () {
                if (!guideVisible) {
                    guideVisible = true;
                    guide.css('display', '');
                    N2Classes.PositionDisplay.get().show('Guide');
                }
            }, this),
            hideGuide = $.proxy(function () {
                if (guideVisible) {
                    guideVisible = false;
                    guide.css('display', 'none');
                    N2Classes.PositionDisplay.get().hide('Guide');
                }
            }, this);

        this.horizontal.on({
            mouseenter: $.proxy(function (e) {
                if (!this.showGuides) return;
                var lastX = 0,
                    offset = Math.round(this.horizontal.offset().left);
                showGuide();

                this.horizontal.on('mousemove.n2-ruler-measure-tool', $.proxy(function (e) {
                    if ($(e.target).hasClass('n2-ruler-guide-border') && $(e.target).parent()[0] != guide[0]) {
                        hideGuide();
                    } else {
                        showGuide();
                        if (lastX != e.pageX) {
                            var pos = Math.max(e.pageX - offset, 40);
                            guide.css('left', pos);
                            N2Classes.PositionDisplay.get().update(e, 'Guide', (pos - 40) + 'px');
                            lastX = e.pageX;
                        }
                    }
                }, this));
            }, this),
            mouseleave: $.proxy(function () {
                this.horizontal.off('.n2-ruler-measure-tool');
                hideGuide();
            }, this)
        });
    };

    /**
     *
     * @param {N2Classes.Ruler} ruler
     * @param {jQuery} container
     * @param e
     * @constructor
     * @abstract
     */
    function Guide(ruler, container, e) {
        this.ruler = ruler;
        this.container = container;
        this.position = 0;

        this.guide = $('<div class="n2-ruler-guide n2-ruler-user-guide"><div class="n2-ruler-guide-border"></div><div class="n2-ruler-guide-handle"></div></div>')
            .appendTo(container)
            .on('mousedown', $.proxy(function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (!ruler.editor.fragmentEditor.canvasSettings.settings['n2-ss-lock-guides']) {
                    this.delete();
                }
            }, this));

        this.ruler.addGuide(this);

        if (e) {
            this.create(e);
        }
    }

    Guide.prototype._position = function (position, e) {
        return Math.max(0, position);
    };

    Guide.prototype.setPosition = function (position) {
        this.position = position;
        this.refresh();
    };

    Guide.prototype.refresh = function () {
        this.positionRender(this.position);
    };

    Guide.prototype.delete = function () {
        this.ruler.removeGuide(this);
        this.guide.remove();
    };

    /**
     *
     * @constructor
     * @implements Guide
     */
    function GuideHorizontal() {
        Guide.prototype.constructor.apply(this, arguments);
    }

    GuideHorizontal.prototype = Object.create(Guide.prototype);
    GuideHorizontal.prototype.constructor = GuideHorizontal;


    GuideHorizontal.prototype.create = function (e) {

        var offset = Math.round(this.container.offset().left) + 40;

        this.position = this._position((e.pageX - offset), e);
        this.positionRender(this.position);
    };

    GuideHorizontal.prototype.rawPositionRender = function (value) {
        this.guide.css('left', Math.max(0, value) + 40);
    };

    GuideHorizontal.prototype.positionRender = function (value) {
        this.guide.css('left', Math.max(0, value) + 40);
    };

    /**
     *
     * @constructor
     * @implements Guide
     */
    function GuideVertical() {
        Guide.prototype.constructor.apply(this, arguments);
    }

    GuideVertical.prototype = Object.create(Guide.prototype);
    GuideVertical.prototype.constructor = GuideVertical;

    GuideVertical.prototype.create = function (e) {

        var offset = Math.round(this.container.offset().top) + 40;
        this.position = this._position((e.pageY - offset), e);
        this.positionRender(this.position);
    };

    GuideVertical.prototype.rawPositionRender = function (value) {
        this.guide.css('top', Math.max(0, value) + 40);
    };

    GuideVertical.prototype.positionRender = function (value) {
        this.guide.css('top', Math.max(0, value) + 40);
    };

    return Ruler;
});
N2D('CanvasSettings', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FragmentEditor} fragmentEditor
     * @constructor
     */
    function CanvasSettings(fragmentEditor) {

        /**
         * @type {N2Classes.FragmentEditor}
         */
        this.fragmentEditor = fragmentEditor;

        this.settings = {};
        var $settings = $('#n2-ss-slide-canvas-settings')
            .on('mouseleave', $.proxy(function () {
                $settings.removeClass('n2-active');
            }, this));

        $settings.find('> a').on('click', function (e) {
            e.preventDefault();
            $settings.toggleClass('n2-active');
        });

        this.$settingsPanel = $settings.find('.n2-ss-settings-panel-inner');
        this.snapTo();
        this.roundTo();
        this.colorScheme();
        if (!this.fragmentEditor.editor.options.isAddSample) {
            this.startRuler();
        }
    }

    CanvasSettings.prototype._addSettings = function (hash, title, _default, cb) {
        this.settings[hash] = parseInt($.jStorage.get(hash, _default));
        var row = $('<a href="#">' + title + '<span class="n2-setting-tick"><i class="n2-i n2-it n2-i-tick2"></i></span></a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.settings[hash] = (this.settings[hash] == 1 ? 0 : 1);
            $.jStorage.set(hash, this.settings[hash]);
            row.toggleClass('n2-setting-enabled', this.settings[hash] == 1);
            cb(this.settings[hash], false);
        }, this)).appendTo(this.$settingsPanel);

        row.toggleClass('n2-setting-enabled', this.settings[hash] == 1);
        cb(this.settings[hash], true);
    };

    CanvasSettings.prototype._addAction = function (title, cb) {
        $('<a href="#" class="n2-panel-action">' + title + '</a>').on('click', $.proxy(function (e) {
            e.preventDefault();
            cb();
        }, this)).appendTo(this.$settingsPanel);
    };

    CanvasSettings.prototype.get = function (name) {
        return this.settings[name];
    };

    CanvasSettings.prototype.snapTo = function () {

        this._addSettings("n2-ss-snap-to-enabled", n2_('Smart Snap'), 1, $.proxy(function (value) {
            var layers = this.mainContainer.container.getSortedLayers();
            for (var i = 0; i < layers.length; i++) {
                layers[i].placement.doAction('snap');
            }
        }, this.fragmentEditor));
    };

    CanvasSettings.prototype.roundTo = function () {

        this._addSettings("n2-ss-round-to-enabled", n2_('Round to 5px'), 1, function (value) {
            if (value == 1) {
                nextend.roundTo = 5;
            } else {
                nextend.roundTo = 1;
            }
        });
    };

    CanvasSettings.prototype.colorScheme = function () {

        var themeElement = $('#n2-ss-slide-canvas-container');
        this._addSettings("n2-ss-theme-dark", n2_('Dark Mode'), 0, function (value) {
            themeElement.toggleClass('n2-ss-theme-dark', value == 1);
        });
    };


    CanvasSettings.prototype.startRuler = function () {
        this.ruler = new N2Classes.Ruler(this.fragmentEditor.editor, $('#slideguides').val());

        var editor = $('#n2-ss-slide-canvas-container');
        this._addSettings("n2-ss-ruler-enabled", n2_('Ruler'), 1, $.proxy(function (value) {
            editor.toggleClass('n2-ss-has-ruler', value == 1);
            nextend.triggerResize();
        }, this));


        this._addSettings("n2-ss-show-guides", n2_('Show Guides'), 1, $.proxy(function (value) {
            this.ruler.showGuides = value;
            editor.toggleClass('n2-ss-show-guides', value == 1);
        }, this));
        this._addSettings("n2-ss-lock-guides", n2_('Lock Guides'), 0, $.proxy(function (value) {
            editor.toggleClass('n2-ss-lock-guides', value == 1);
        }, this));

        this._addAction(n2_('Clear Guides'), $.proxy(function () {
            this.ruler.clearGuides();
        }, this))
    };

    return CanvasSettings;
});
N2D('nUICanvasItem', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @class
     * @constructor
     * @augments nUIMouse

     * @this nUICanvasItem
     */
    function nUICanvasItem(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUICanvasItem';
        this.widgetEventPrefix = "canvasItem";

        this.options = $.extend({
            canvasUIManager: null,
            layer: false,
            $layer: null,
            distance: 2,
            onCreate: function () {

            }
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUICanvasItem.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUICanvasItem.prototype.constructor = nUICanvasItem;

    nUICanvasItem.prototype.create = function () {

        if (typeof this.options.$layer === 'function') {
            this.options.$layer = this.options.$layer.call(this, this);
        }

        this._mouseInit();
    };
    nUICanvasItem.prototype._mouseCapture = function (event, overrideHandle) {
        return this.options.canvasUIManager._mouseCapture(this.options, event, overrideHandle);
    };

    nUICanvasItem.prototype._mouseStart = function (event, overrideHandle, noActivation) {
        this._trigger('start');
        return this.options.canvasUIManager._mouseStart(this.options, event, overrideHandle, noActivation);
    };

    nUICanvasItem.prototype._mouseDrag = function (event) {
        return this.options.canvasUIManager._mouseDrag(this.options, event);
    };

    nUICanvasItem.prototype._mouseStop = function (event, noPropagation) {
        return this.options.canvasUIManager._mouseStop(this.options, event, noPropagation);

    };

    nUICanvasItem.prototype._destroy = function () {
        this._mouseDestroy();

        return this;
    };

    N2Classes.nUIWidgetBase.register('nUICanvasItem');

    return nUICanvasItem;
});
N2D('nUICanvas', ['nUIWidgetBase'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @class
     * @constructor
     * @augments nUIWidgetBase

     * @this nUICanvas
     */
    function nUICanvas(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUICanvas';
        this.widgetEventPrefix = "canvas";

        this.options = $.extend({
            mainContainer: null,
            display: false,
        }, this.options, options);

        N2Classes.nUIWidgetBase.prototype.constructor.apply(this, arguments);
    }

    nUICanvas.prototype = Object.create(N2Classes.nUIWidgetBase.prototype);
    nUICanvas.prototype.constructor = nUICanvas;

    nUICanvas.plugins = {};

    nUICanvas.prototype._mouseCapture = function (itemOptions, event, overrideHandle) {
        return $(event.target).closest(".nui-resizable-handle, .nui-normal-sizing-handle, .nui-spacing-handle").length == 0;
    };

    nUICanvas.prototype._mouseStart = function (itemOptions, event, overrideHandle, noActivation) {

        $('body').addClass('n2-ss-move-layer');

        this.dragDeferred = $.Deferred();
        this.options.mainContainer.fragmentEditor.layerWindow.hideWithDeferred(this.dragDeferred);

        this.context = {
            placeholder: $('<div class="n2-ss-layer-placeholder" />'),
            mouse: {
                offset: {
                    left: event.pageX,
                    top: event.pageY
                }
            },
            canvas: {
                offset: this.options.mainContainer.layer.offset(),
                size: {
                    width: this.options.mainContainer.layer.outerWidth(),
                    height: this.options.mainContainer.layer.outerHeight()
                }
            },
            $layer: itemOptions.$layer
        };

        var css = {
            position: 'absolute',
            right: 'auto',
            bottom: 'auto'
        };

        if (!itemOptions.layer) {
            this.startMode = 'create';

            this.context.layer = {
                offset: {
                    left: 0,
                    top: 0
                }
            };

            itemOptions.$layer.appendTo('body');
        } else {
            this.startMode = itemOptions.layer.placement.getType();

            this.context.layer = {
                offset: itemOptions.$layer.offset()
            };

            this.context.originalIndex = itemOptions.layer.getIndex();

            if (this.startMode == 'normal') {

                css.width = itemOptions.$layer.width();
                //css.height = itemOptions.$layer.height();

                itemOptions.$layer.appendTo(this.options.mainContainer.layer);
            }
        }

        itemOptions.$layer
            .addClass('n2-canvas-item-drag')
            .css(css);

        this._cacheMargins(itemOptions.$layer);

        this.context.size = {
            width: itemOptions.$layer.outerWidth(),
            height: itemOptions.$layer.outerHeight()
        };


        this.context.droppables = this.options.mainContainer.getDroppables(itemOptions.layer);

        this._cacheContainers();

        this._trigger("start", event, {
            layer: itemOptions.layer,
            mode: this.startMode
        });

        this._mouseDrag(itemOptions, event);
    };

    nUICanvas.prototype._mouseDrag = function (itemOptions, event) {
        var position;
        if (this.startMode == 'create') {
            position = {
                top: event.pageY - this.context.canvas.offset.top - 20,
                left: event.pageX - this.context.canvas.offset.left - 20
            };
        } else {
            position = {
                top: this.context.layer.offset.top - this.context.canvas.offset.top + event.pageY - this.context.mouse.offset.top,
                left: this.context.layer.offset.left - this.context.canvas.offset.left + event.pageX - this.context.mouse.offset.left
            };
        }

        var targetContainer = this._findInnerContainer(event);
        if (targetContainer === false && this.startMode != 'create') {
            targetContainer = this.context.droppables[0];
        }
        if (targetContainer) {
            if (targetContainer.placement == 'normal') {

                if (typeof targetContainer.layers === "undefined") {
                    targetContainer.layers = this._cacheContainerLayers(targetContainer);
                }

                var targetIndex = this._findNormalIndex(event, targetContainer);
                if (targetIndex > 0) {
                    this.context.placeholder.css('order', targetContainer.layers[targetIndex - 1].layer.layer.css('order'));
                    this.context.placeholder.insertAfter(targetContainer.layers[targetIndex - 1].layer.layer);
                } else {
                    this.context.placeholder.css('order', 0);
                    this.context.placeholder.prependTo(targetContainer.$container);
                }

                this.context.targetIndex = targetIndex;
            } else {
                this.context.placeholder.detach();
            }
        } else {
            this.context.placeholder.detach();
        }

        this.context.targetContainer = targetContainer;


        this._trigger("drag", event, {
            layer: itemOptions.layer,
            originalOffset: this.context.layer.offset,
            position: position,
            canvasOffset: this.context.canvas.offset,
            offset: {
                left: position.left + this.context.canvas.offset.left,
                top: position.top + this.context.canvas.offset.top
            }
        });

        if (this.startMode == 'create') {
            position.left += this.context.canvas.offset.left;
            position.top += this.context.canvas.offset.top;
        }

        itemOptions.$layer.css(position);

        this._displayPosition(event, position);
    };

    nUICanvas.prototype._mouseStop = function (itemOptions, event, noPropagation) {
        this.context.placeholder.remove();

        var targetIndex = this.context.targetIndex,
            targetContainer = this.context.targetContainer;

        itemOptions.$layer
            .removeClass('n2-canvas-item-drag');

        if (this.startMode == 'create') {
            if (targetContainer) {
                itemOptions.onCreate.call(this, event, itemOptions, targetContainer, targetIndex);
            }
            itemOptions.$layer.detach();

        } else {
            if (targetContainer === undefined) {
                targetContainer = this.options.mainContainer.layer;
            }

            if (this.startMode == 'absolute' && targetContainer.placement == 'absolute') {

                // Simple drag on the canvas on an absolute layer. Just update its position!
                var left = parseInt(itemOptions.$layer.css('left')),
                    top = parseInt(itemOptions.$layer.css('top'));

                itemOptions.$layer.css({
                    position: '',
                    right: '',
                    bottom: '',
                });

                itemOptions.layer.placement.current.setPosition(left, top);

            } else if (targetContainer.placement == 'absolute') {

                // Layer moved from a normal container to the canvas.

                var left = parseInt(itemOptions.$layer.css('left')),
                    top = parseInt(itemOptions.$layer.css('top'));

                itemOptions.$layer.css({
                    position: '',
                    right: '',
                    bottom: '',
                });

                var width = itemOptions.$layer.width(),
                    height = itemOptions.$layer.height();

                itemOptions.layer.group.onChildCountChange();

                var oldAbsoluteGroup = itemOptions.layer;
                while (oldAbsoluteGroup && (!oldAbsoluteGroup.placement || oldAbsoluteGroup.placement.getType() !== 'absolute')) {
                    oldAbsoluteGroup = oldAbsoluteGroup.group;
                }

                N2Classes.History.get().startBatch();
                // Set the new group, which will trigger this current placement to activate
                itemOptions.layer.changeGroup(this.context.originalIndex, this.options.mainContainer);
                N2Classes.History.get().addControl('skipForwardUndos');

                if (itemOptions.layer.type == 'layer' && itemOptions.layer.item) {
                    if (!itemOptions.layer.item.needSize) {
                        height = 'auto';
                        width++; //Prevent text layers to wrap line ending to new line after drag
                    }
                }

                // As this placement activated, we have to set these values from the closest absolute parent
                var targetAlign = oldAbsoluteGroup ? oldAbsoluteGroup.getProperty('align') : 'center',
                    targetValign = oldAbsoluteGroup ? oldAbsoluteGroup.getProperty('valign') : 'middle';

                itemOptions.layer.placement.current._setPosition(targetAlign, targetValign, left, top, width, height, true);

                N2Classes.History.get().endBatch();

            } else if (targetContainer.placement == 'normal') {
                itemOptions.$layer.css({
                    position: 'relative',
                    width: '',
                    left: '',
                    top: ''
                });

                switch (targetContainer.layer.type) {

                    case 'content':
                    case 'col':
                        if (targetIndex > 0) {
                            itemOptions.$layer.insertAfter(targetContainer.layers[targetIndex - 1].layer.layer);
                        } else {
                            itemOptions.$layer.prependTo(targetContainer.$container);
                        }

                        itemOptions.layer.onCanvasUpdate(this.context.originalIndex, targetContainer.layer, targetIndex);
                        break;

                    case 'row':
                        var col = targetContainer.layer.createCol();
                        targetContainer.layer.moveCol(col.getIndex(), targetIndex);

                        itemOptions.$layer.prependTo(col.$content);
                        itemOptions.layer.onCanvasUpdate(this.context.originalIndex, col, 0);

                        break;
                }

                //itemOptions.layer.placement.current._syncheight(); // we should sync back the height of the normal layer
            }
        }

        delete this.context;

        if (this.options.display) {
            this.options.display.hide();
        }

        this._trigger("stop", event, {
            layer: itemOptions.layer
        });

        this.dragDeferred.resolve();


        $('body').removeClass('n2-ss-move-layer');
    };

    nUICanvas.prototype.cancel = function (itemOptions) {
    };

    nUICanvas.prototype._cacheContainers = function () {
        for (var i = 0; i < this.context.droppables.length; i++) {
            var obj = this.context.droppables[i];
            obj.offset = obj.$container.offset();
            obj.size = {
                width: obj.$container.outerWidth(),
                height: obj.$container.outerHeight()
            };
            obj.offset.right = obj.offset.left + obj.size.width;
            obj.offset.bottom = obj.offset.top + obj.size.height;
        }
    };

    nUICanvas.prototype._findInnerContainer = function (event) {
        for (var i = this.context.droppables.length - 1; i >= 0; i--) {
            var obj = this.context.droppables[i];
            if (obj.offset.left <= event.pageX && obj.offset.right >= event.pageX && obj.offset.top <= event.pageY && obj.offset.bottom >= event.pageY) {
                return obj;
            }
        }
        return false;
    };

    nUICanvas.prototype._cacheContainerLayers = function (droppable) {
        var layerObjects = [],
            layers = droppable.layer.container.getSortedLayers();

        for (var i = 0; i < layers.length; i++) {
            var obj = {
                layer: layers[i]
            };
            obj.offset = obj.layer.layer.offset();
            obj.size = {
                width: obj.layer.layer.outerWidth(),
                height: obj.layer.layer.outerHeight()
            };
            obj.offset.right = obj.offset.left + obj.size.width / 2;
            obj.offset.bottom = obj.offset.top + obj.size.height / 2;
            layerObjects.push(obj);
        }

        return layerObjects;
    };

    nUICanvas.prototype._findNormalIndex = function (event, targetContainer) {
        var index = -1;

        switch (targetContainer.axis) {
            case 'y':
                for (var i = 0; i < targetContainer.layers.length; i++) {
                    var obj = targetContainer.layers[i];
                    if (event.pageY <= obj.offset.bottom) {
                        index = i;
                        break;
                    }
                }
                break;
            case 'x':
                for (var i = 0; i < targetContainer.layers.length; i++) {
                    var obj = targetContainer.layers[i];
                    if (event.pageX <= obj.offset.right) {
                        index = i;
                        break;
                    }
                }
                break;
        }

        if (index === -1) {
            index = targetContainer.layers.length;
        }

        return index;
    };

    nUICanvas.prototype._displayPosition = function (event, position) {

        if (this.options.display) {
            if (this.context.targetContainer && this.context.targetContainer.placement == 'absolute') {
                if (this.options.display.hidden) {
                    this.options.display.show();
                }
                if (this.startMode == 'create') {
                    position.left -= this.context.canvas.offset.left;
                    position.top -= this.context.canvas.offset.top;
                }
                this.options.display.update(event, position);
            } else {
                if (this.options.display.hidden) {
                    this.options.display.hide();
                }
            }
        }
    };

    nUICanvas.prototype._trigger = function (type, event, ui) {
        ui = ui || {};

        this.callPlugin(type, [event, ui]);


        return N2Classes.nUIWidgetBase.prototype._trigger.apply(this, arguments);
    };

    nUICanvas.prototype._cacheMargins = function (layer) {
        this.margins = {
            left: ( parseInt(layer.css("marginLeft"), 10) || 0 ),
            top: ( parseInt(layer.css("marginTop"), 10) || 0 ),
            right: ( parseInt(layer.css("marginRight"), 10) || 0 ),
            bottom: ( parseInt(layer.css("marginBottom"), 10) || 0 )
        };
    };

    N2Classes.nUIWidgetBase.register('nUICanvas');


    N2Classes.nUIWidgetBase.addPlugin(nUICanvas, "smartguides", {
        start: function (event, ui) {
            var inst = $(this).data("nUICanvas"), o = inst.options;

            if (inst.startMode == 'create') return;

            inst.gridH = $('<div class="n2-grid n2-grid-h"></div>').appendTo(o.mainContainer.layer);
            inst.gridV = $('<div class="n2-grid n2-grid-v"></div>').appendTo(o.mainContainer.layer);
            inst.elements = [];
            if (typeof o.smartguides == 'function') {
                var guides = $(o.smartguides(inst.context)).not(inst.context.$layer);
                if (guides && guides.length) {
                    guides.each(function () {
                        var $t = $(this);
                        var $o = $t.offset();
                        if (this != inst.element[0]) inst.elements.push({
                            item: this,
                            width: $t.outerWidth(), height: $t.outerHeight(),
                            top: Math.round($o.top), left: Math.round($o.left),
                            backgroundColor: ''
                        });
                    });
                }
                var $o = o.mainContainer.layer.offset();
                inst.elements.push({
                    width: o.mainContainer.layer.width(), height: o.mainContainer.layer.height(),
                    top: Math.round($o.top), left: Math.round($o.left),
                    backgroundColor: '#ff4aff'
                });
            }
        },

        stop: function (event, ui) {
            var inst = $(this).data("nUICanvas");

            if (inst.startMode == 'create') return;

            inst.gridH.remove();
            inst.gridV.remove();
        },

        drag: function (event, ui) {
            var vElement = false,
                hElement = false,
                inst = $(this).data("nUICanvas"),
                o = inst.options,
                verticalTolerance = o.tolerance,
                horizontalTolerance = o.tolerance;

            if (inst.startMode == 'create') return;

            inst.gridH.css({"display": "none"});
            inst.gridV.css({"display": "none"});

            if (inst.context.targetContainer && inst.context.targetContainer.placement == 'absolute') {

                var container = inst.elements[inst.elements.length - 1],
                    setGridV = function (left) {
                        inst.gridV.css({left: Math.min(left, container.width - 1), display: "block"});
                    },
                    setGridH = function (top) {
                        inst.gridH.css({top: Math.min(top, container.height - 1), display: "block"});
                    };

                var ctrlKey = event.ctrlKey || event.metaKey,
                    altKey = event.altKey;
                if (ctrlKey && altKey) {
                    return;
                } else if (ctrlKey) {
                    vElement = true;
                } else if (altKey) {
                    hElement = true;
                }
                var x1 = ui.offset.left, x2 = x1 + inst.context.size.width,
                    y1 = ui.offset.top, y2 = y1 + inst.context.size.height,
                    xc = (x1 + x2) / 2,
                    yc = (y1 + y2) / 2;

                if (!vElement) {
                    for (var i = inst.elements.length - 1; i >= 0; i--) {
                        if (verticalTolerance == 0) break;

                        var l = inst.elements[i].left,
                            r = l + inst.elements[i].width,
                            hc = (l + r) / 2;

                        var v = true,
                            c;
                        if ((c = Math.abs(l - x2)) < verticalTolerance) {
                            ui.position.left = l - inst.context.size.width - inst.context.canvas.offset.left - inst.margins.left;
                            setGridV(ui.position.left + inst.context.size.width);
                        } else if ((c = Math.abs(l - x1)) < verticalTolerance) {
                            ui.position.left = l - inst.context.canvas.offset.left - inst.margins.left;
                            setGridV(ui.position.left);
                        } else if ((c = Math.abs(r - x1)) < verticalTolerance) {
                            ui.position.left = r - inst.context.canvas.offset.left - inst.margins.left;
                            setGridV(ui.position.left);
                        } else if ((c = Math.abs(r - x2)) < verticalTolerance) {
                            ui.position.left = r - inst.context.size.width - inst.context.canvas.offset.left - inst.margins.left;
                            setGridV(ui.position.left + inst.context.size.width);
                        } else if ((c = Math.abs(hc - x2)) < verticalTolerance) {
                            ui.position.left = hc - inst.context.size.width - inst.context.canvas.offset.left - inst.margins.left;
                            setGridV(ui.position.left + inst.context.size.width);
                        } else if ((c = Math.abs(hc - x1)) < verticalTolerance) {
                            ui.position.left = hc - inst.context.canvas.offset.left - inst.margins.left;
                            setGridV(ui.position.left);
                        } else if ((c = Math.abs(hc - xc)) < verticalTolerance) {
                            ui.position.left = hc - inst.context.size.width / 2 - inst.context.canvas.offset.left - inst.margins.left;
                            setGridV(ui.position.left + inst.context.size.width / 2);
                        } else {
                            v = false;
                        }

                        if (v) {
                            vElement = inst.elements[i];
                            verticalTolerance = Math.min(c, verticalTolerance);
                        }
                    }
                }

                if (!hElement) {
                    for (var i = inst.elements.length - 1; i >= 0; i--) {
                        if (horizontalTolerance == 0) break;

                        var t = inst.elements[i].top,
                            b = t + inst.elements[i].height,
                            vc = (t + b) / 2;

                        var h = true,
                            c;
                        if ((c = Math.abs(t - y2)) < horizontalTolerance) {
                            ui.position.top = t - inst.context.size.height - inst.context.canvas.offset.top - inst.margins.top;
                            setGridH(ui.position.top + inst.context.size.height);
                        } else if ((c = Math.abs(t - y1)) < horizontalTolerance) {
                            ui.position.top = t - inst.context.canvas.offset.top - inst.margins.top;
                            setGridH(ui.position.top);
                        } else if ((c = Math.abs(b - y1)) < horizontalTolerance) {
                            ui.position.top = b - inst.context.canvas.offset.top - inst.margins.top;
                            setGridH(ui.position.top);
                        } else if ((c = Math.abs(b - y2)) < horizontalTolerance) {
                            ui.position.top = b - inst.context.size.height - inst.context.canvas.offset.top - inst.margins.top;
                            setGridH(ui.position.top + inst.context.size.height);
                        } else if ((c = Math.abs(vc - y2)) < horizontalTolerance) {
                            ui.position.top = vc - inst.context.size.height - inst.context.canvas.offset.top - inst.margins.top;
                            setGridH(ui.position.top + inst.context.size.height);
                        } else if ((c = Math.abs(vc - y1)) < horizontalTolerance) {
                            ui.position.top = vc - inst.context.canvas.offset.top - inst.margins.top;
                            setGridH(ui.position.top);
                        } else if ((c = Math.abs(vc - yc)) < horizontalTolerance) {
                            ui.position.top = vc - inst.context.size.height / 2 - inst.context.canvas.offset.top - inst.margins.top;
                            setGridH(ui.position.top + inst.context.size.height / 2);
                        } else {
                            h = false;
                        }

                        if (h) {
                            hElement = inst.elements[i];
                            horizontalTolerance = Math.min(c, horizontalTolerance);
                        }
                    }
                }

                if (vElement && vElement !== true) {
                    inst.gridV.css('backgroundColor', vElement.backgroundColor);
                }
                if (hElement && hElement !== true) {
                    inst.gridH.css('backgroundColor', hElement.backgroundColor);
                }
            }
        }
    });

    return nUICanvas;
});
N2D('nUIColumns', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @class
     * @constructor
     * @augments nUIMouse

     * @this nUIColumns
     */
    function nUIColumns(element, options) {
        this.active = 0;
        this.created = false;
        this.invalidated = false;

        this.element = $(element);

        this.widgetName = this.widgetName || 'nUIColumns';
        this.widgetEventPrefix = "columns";

        this.options = $.extend({
            columns: '1',
            gutter: 0,
            denominators: {
                1: 100,
                2: 100,
                3: 144,
                4: 100,
                5: 100,
                6: 144
            },
            // Callbacks
            drag: null,
            start: null,
            stop: null
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);
    }

    nUIColumns.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUIColumns.prototype.constructor = nUIColumns;

    nUIColumns.prototype.create = function () {
        if (!this.created) {
            this.created = true;

            this._setupHandles();

            $(window).on('resize', $.proxy(this._resize, this));

            this._mouseInit();
        }
    };

    nUIColumns.prototype._destroy = function () {

        this._mouseDestroy();
        this.element
            .removeData("uiNextendColumns")
            .off(".columns")
            .find("> .ui-column-width-handle")
            .remove();

        return this;
    };

    nUIColumns.prototype.getDenominator = function (i) {
        if (this.options.denominators[i] === undefined) {
            this.options.denominators[i] = i * 15;
        }
        return this.options.denominators[i];
    };

    nUIColumns.prototype._setupHandles = function () {
        var o = this.options, handle, i, n, axis;

        this.fractions = [];

        var columnWidths = o.columns.split('+');
        for (var i = 0; i < columnWidths.length; i++) {
            this.fractions.push(new Fraction(columnWidths[i]));
        }
        this.currentDenominator = this.getDenominator(this.fractions.length);

        var currentPercent = 0;
        for (i = 0; i < this.fractions.length - 1; i++) {
            axis = $("<div class='ui-column-width-handle'>");

            currentPercent += this.fractions[i].valueOf() * 100;
            axis
                .data('i', i)
                .data('percent', currentPercent)
                .appendTo(this.element)
                .on('mousedown', $.proxy(this._mouseDown, this));
        }

        this.handles = this.element.find('> .ui-column-width-handle');

        this.handles.addClass('n2-unselectable');

        this._resize();
    };

    nUIColumns.prototype._resize = function () {
        if (this.active) {
            this.paddingLeft = parseInt(this.element.css('paddingLeft'));
            this.paddingRight = parseInt(this.element.css('paddingRight'));

            var containerWidth = this.element.width();

            this.outerWidth = containerWidth + this.paddingLeft + this.paddingRight;
            this.innerWidth = containerWidth - this.handles.length * this.options.gutter;

            for (var i = 0; i < this.handles.length; i++) {
                var currentPercent = this.handles.eq(i).data('percent');
                this._updateResizer(i, currentPercent);
            }
        } else {
            this.invalidated = true;
        }
    };

    nUIColumns.prototype._updateResizer = function (i, currentPercent) {
        this.handles.eq(i).css({
            left: currentPercent + '%',
            marginLeft: -2 + this.paddingLeft + (i + 0.5) * this.options.gutter + (this.innerWidth - this.outerWidth) * currentPercent / 100
        })
    };

    nUIColumns.prototype._removeHandles = function () {
        this.handles.remove();
    };

    nUIColumns.prototype.setOption = function (key, value) {
        N2Classes.nUIWidgetBase.prototype.setOption.apply(this, arguments);

        switch (key) {
            case "active":
                this.active = value;
                if (this.active) {
                    this.create();
                    if (this.invalidated) {
                        this._resize();
                    }
                }
                break;
            case "columns":
                if (this.created) {
                    this._removeHandles();
                    this._setupHandles();
                }
                break;
            case "gutter":
                this._resize();
                break;
        }
    };

    nUIColumns.prototype._mouseCapture = function (event) {
        var i, handle,
            capture = false;

        for (i = 0; i < this.handles.length; i++) {
            handle = this.handles[i];
            if (handle === event.target) {
                capture = true;
            }
        }

        return !this.options.disabled && capture;
    };

    nUIColumns.prototype._mouseStart = function (event) {
        var index = $(event.target).data('i'),
            cLeft = this.element.offset().left + 10,
            containerWidth = this.element.width() - 20;

        this.resizeContext = {
            index: index,
            cLeft: cLeft,
            containerWidth: containerWidth,
            startX: Math.max(0, Math.min(event.clientX - cLeft, containerWidth)),
        };

        this.currentFractions = [];
        this.currentPercent = [];
        for (var i = 0; i < this.fractions.length; i++) {
            this.currentFractions.push(this.fractions[i].clone());
            this.currentPercent.push(this.fractions[i].valueOf());
        }

        this.resizing = true;

        $("body").css("cursor", "ew-resize");

        this.element.addClass("ui-column-width-resizing");
        this._trigger("start", event, this.ui());
        return true;
    };

    nUIColumns.prototype._mouseDrag = function (event) {

        var currentX = Math.max(0, Math.min(event.clientX - this.resizeContext.cLeft, this.resizeContext.containerWidth)),
            fractionDifference = new Fraction(Math.round((currentX - this.resizeContext.startX) / (this.resizeContext.containerWidth / this.currentDenominator)), this.currentDenominator);

        if (fractionDifference.compare(this.fractions[this.resizeContext.index].clone().mul(-1)) < 0) {
            fractionDifference = this.fractions[this.resizeContext.index].clone().mul(-1);
        }
        if (fractionDifference.compare(this.fractions[this.resizeContext.index + 1]) > 0) {
            fractionDifference = this.fractions[this.resizeContext.index + 1].clone();
        }

        this.currentFractions[this.resizeContext.index] = this.fractions[this.resizeContext.index].add(fractionDifference);
        this.currentFractions[this.resizeContext.index + 1] = this.fractions[this.resizeContext.index + 1].sub(fractionDifference);

        var currentPercent = 0;
        this.currentPercent = [];
        for (var i = 0; i < this.currentFractions.length; i++) {
            var width = this.currentFractions[i].valueOf();
            this.currentPercent.push(width);
            currentPercent += width * 100;
            this._updateResizer(i, currentPercent);
        }

        this._trigger("colwidth", event, this.ui());
    };

    nUIColumns.prototype._mouseStop = function (event) {

        this.resizing = false;

        $("body").css("cursor", "auto");

        this._trigger("stop", event, this.ui());

        this.fractions = this.currentFractions;

        nextend.preventMouseUp();
        return false;
    };

    nUIColumns.prototype.ui = function () {
        return {
            element: this.element,
            originalFractions: this.fractions,
            currentFractions: this.currentFractions,
            currentPercent: this.currentPercent,
            index: this.resizeContext.index
        };
    };

    N2Classes.nUIWidgetBase.register('nUIColumns');

    return nUIColumns;
});
N2D('nUILayerListItem', ['nUIMouse'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @class
     * @constructor
     * @augments nUIMouse

     * @this nUILayerListItem
     */
    function nUILayerListItem(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUILayerListItem';
        this.widgetEventPrefix = "layerListItem";

        this.options = $.extend({
            UIManager: null,
            layer: false,
            $layer: null,
            distance: 2
        }, this.options, options);

        N2Classes.nUIMouse.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUILayerListItem.prototype = Object.create(N2Classes.nUIMouse.prototype);
    nUILayerListItem.prototype.constructor = nUILayerListItem;

    nUILayerListItem.prototype.create = function () {

        this._mouseInit();
    };

    nUILayerListItem.prototype._mouseCapture = function (event, overrideHandle) {
        return this.options.UIManager._mouseCapture(this.options, event, overrideHandle);
    };

    nUILayerListItem.prototype._mouseStart = function (event, overrideHandle, noActivation) {
        this._trigger('start');
        return this.options.UIManager._mouseStart(this.options, event, overrideHandle, noActivation);
    };

    nUILayerListItem.prototype._mouseDrag = function (event) {
        return this.options.UIManager._mouseDrag(this.options, event);
    };

    nUILayerListItem.prototype._mouseStop = function (event, noPropagation) {
        return this.options.UIManager._mouseStop(this.options, event, noPropagation);

    };

    nUILayerListItem.prototype._destroy = function () {
        this._mouseDestroy();
        return this;
    };

    N2Classes.nUIWidgetBase.register('nUILayerListItem');

    return nUILayerListItem;
});
N2D('nUILayerList', ['nUIWidgetBase'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @class
     * @constructor
     * @augments nUIWidgetBase

     * @this nUILayerList
     */
    function nUILayerList(element, options) {
        this.element = $(element);

        this.widgetName = this.widgetName || 'nUILayerList';
        this.widgetEventPrefix = "layerList";

        this.options = $.extend({
            $fixed: null,
            $scrolled: null
        }, this.options, options);

        N2Classes.nUIWidgetBase.prototype.constructor.apply(this, arguments);

        this.create();
    }

    nUILayerList.prototype = Object.create(N2Classes.nUIWidgetBase.prototype);
    nUILayerList.prototype.constructor = nUILayerList;

    nUILayerList.prototype.create = function () {

        this.scrollTimeout = null;
    };


    nUILayerList.prototype._mouseCapture = function (itemOptions, event, overrideHandle) {
        return true;
    };

    nUILayerList.prototype._mouseStart = function (itemOptions, event, overrideHandle, noActivation) {

        this.scrolledTop = this.options.$scrolled.offset().top;
        this.scrolledHeight = this.options.$scrolled.height();
        this.scrolledScroll = this.options.$scrolled.scrollTop();
        this.scrolledMaxHeight = this.options.$scrolled[0].scrollHeight - this.scrolledHeight;

        $('body').addClass('n2-ss-layer-list-move-layer');

        this.context = {
            placeholder: $('<div class="nextend-sortable-placeholder"><div></div></div>'),
            mouse: {
                y: event.pageY,
                topModifier: itemOptions.$item.offset().top - event.pageY
            },
            $item: itemOptions.$item,
            $clone: itemOptions.$item.clone()
        };

        this.context.$clone.addClass('n2-ss-ll-dragging').appendTo(this.options.$scrolled.find('> ul'));

        this.context.droppables = this.options.mainContainer.getLLDroppables(itemOptions.layer);

        this._cacheContainers();

        this._trigger("start", event);

        this._mouseDrag(itemOptions, event);
    };

    nUILayerList.prototype._scrollUp = function () {
        if (this.scrolledTop > 0) {
            if (this.scrollTimeout === null) {
                this.scrollTimeout = setInterval($.proxy(function () {
                    this.scrolledScroll -= 30;
                    this.options.$scrolled.scrollTop(this.scrolledScroll);
                }, this), 100);
                this.scrolledScroll -= 30;
                this.options.$scrolled.scrollTop(this.scrolledScroll);
            }
        }
    };

    nUILayerList.prototype._scrollDown = function () {
        if (this.scrollTimeout === null) {
            this.scrollTimeout = setInterval($.proxy(function () {
                this.scrolledScroll += 30;
                this.options.$scrolled.scrollTop(Math.min(this.scrolledScroll, this.scrolledMaxHeight));
            }, this), 100);
            this.scrolledScroll += 30;
            this.options.$scrolled.scrollTop(Math.min(this.scrolledScroll, this.scrolledMaxHeight));
        }
    };

    nUILayerList.prototype._mouseDrag = function (itemOptions, event) {

        this.scrolledTop = this.options.$scrolled.offset().top;

        if (this.scrolledHeight > 60) {
            if (event.pageY < this.scrolledTop + 30) {
                this._scrollUp();
            } else if (event.pageY > this.scrolledTop + this.scrolledHeight - 30) {
                this._scrollDown();
            } else {
                clearInterval(this.scrollTimeout);
                this.scrollTimeout = null;
            }
        }


        this.scrolledScroll = this.options.$scrolled.scrollTop();

        var y = event.pageY - this.scrolledTop + this.scrolledScroll;

        var targetContainer = this._findInnerContainer(y);
        if (targetContainer === false) {
            targetContainer = this.context.droppables[0];
        }

        if (typeof targetContainer.layers === "undefined") {
            targetContainer.layers = this._cacheContainerLayers(targetContainer);
        }

        var targetIndex = this._findNormalIndex(y, targetContainer);

        if (targetIndex > 0) {
            this.context.placeholder.insertAfter(targetContainer.layers[targetIndex - 1].layer.layerRow);
        } else {
            this.context.placeholder.prependTo(targetContainer.$container);
        }

        this.context.targetIndex = targetIndex;
        if (this.context.targetContainer && this.context.targetContainer != targetContainer) {
            this.context.targetContainer.layer.layerRow.removeClass('n2-ss-ll-dragging-parent');
        }

        this.context.targetContainer = targetContainer;
        this.context.targetContainer.layer.layerRow.addClass('n2-ss-ll-dragging-parent');

        this.context.$clone.css({
            top: y + this.context.mouse.topModifier
        });

    };

    nUILayerList.prototype._mouseStop = function (itemOptions, event, noPropagation) {

        if (this.scrollTimeout !== null) {
            clearInterval(this.scrollTimeout);
            this.scrollTimeout = null;
        }

        this.context.placeholder.remove();

        this.context.$clone.remove();

        this.context.targetContainer.layer.layerRow.removeClass('n2-ss-ll-dragging-parent');

        var targetIndex = this.context.targetIndex,
            targetContainer = this.context.targetContainer,
            originalIndex = itemOptions.layer.getIndex(),
            newIndex = -1;


        if (this.context.targetContainer.layers.length === 0) {
            newIndex = 0;
        } else {
            var nextLayer = false,
                prevLayer = false;

            if (this.context.targetContainer.layers[targetIndex]) {
                nextLayer = this.context.targetContainer.layers[targetIndex].layer;
            }

            if (this.context.targetContainer.layers[targetIndex - 1]) {
                prevLayer = this.context.targetContainer.layers[targetIndex - 1].layer;
            }

            if (nextLayer === itemOptions.layer || prevLayer === itemOptions.layer) {
                newIndex = -1;
            } else {
                if (targetContainer.layer.container.allowedPlacementMode === 'absolute') {
                    if (nextLayer) {
                        //itemOptions.layer.layer.detach();
                        newIndex = nextLayer.getIndex() + 1;
                    } else if (prevLayer) {
                        //itemOptions.layer.layer.detach();
                        newIndex = prevLayer.getIndex();
                    }
                } else {
                    if (prevLayer) {
                        //itemOptions.layer.layer.detach();
                        newIndex = prevLayer.getIndex() + 1;
                    } else if (nextLayer) {
                        //itemOptions.layer.layer.detach();
                        newIndex = nextLayer.getIndex();
                    }
                }
            }
        }
        if (newIndex >= 0) {
            if (newIndex > originalIndex) {
                newIndex--;
            }
            if (itemOptions.layer.type === 'col') {
                targetContainer.layer.moveCol(originalIndex, newIndex);
            } else {
                targetContainer.layer.container.insertLayerAt(itemOptions.layer, newIndex);
                itemOptions.layer.onCanvasUpdate(originalIndex, targetContainer.layer, newIndex);
            }
        }

        delete this.context;

        this._trigger("stop", event);


        $('body').removeClass('n2-ss-layer-list-move-layer');
    };

    nUILayerList.prototype.cancel = function (itemOptions) {
    };

    nUILayerList.prototype._cacheContainers = function () {
        for (var i = 0; i < this.context.droppables.length; i++) {
            var obj = this.context.droppables[i];
            obj.top = obj.$container.offset().top - this.scrolledTop + this.scrolledScroll - 15;
            obj.height = obj.$container.outerHeight();
            obj.bottom = obj.top + obj.height + 15;
        }
    };

    nUILayerList.prototype._findInnerContainer = function (y) {
        for (var i = this.context.droppables.length - 1; i >= 0; i--) {
            var obj = this.context.droppables[i];
            if (obj.top <= y && obj.bottom >= y) {
                return obj;
            }
        }
        return false;
    };

    nUILayerList.prototype._cacheContainerLayers = function (droppable) {
        var layerObjects = [],
            layers = droppable.layer.container.getSortedLayers();

        for (var i = 0; i < layers.length; i++) {
            //if (layers[i].layerRow[0] === this.context.$item[0]) continue;
            var obj = {
                layer: layers[i]
            };
            obj.top = obj.layer.layerRow.offset().top - this.scrolledTop + this.scrolledScroll;
            obj.height = obj.layer.layerRow.outerHeight();
            obj.bottom = obj.top + obj.height / 2;
            obj.index = i;
            layerObjects.push(obj);
        }

        if (droppable.layer.container.allowedPlacementMode == 'absolute') {
            layerObjects.reverse();
        }

        return layerObjects;
    };

    nUILayerList.prototype._findNormalIndex = function (y, targetContainer) {
        for (var i = 0; i < targetContainer.layers.length; i++) {
            var obj = targetContainer.layers[i];
            if (y <= obj.bottom) {
                return i;
            }
        }
        return targetContainer.layers.length;
    };

    N2Classes.nUIWidgetBase.register('nUILayerList');

    return nUILayerList;
});
N2D('PlacementAbsolute', ['PlacementAbstract'], function ($, undefined) {
    "use strict";

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
        })(),
        resizeCollection = {
            raf: false,
            ratios: null,
            isThrottled: false,
            layers: []
        },
        requestRender = function () {
            if (resizeCollection.raf === false) {
                resizeCollection.raf = true;
                rAFShim(function () {
                    for (var i = 0; i < resizeCollection.layers.length; i++) {
                        if (!resizeCollection.layers[i].isDeleted) {
                            resizeCollection.layers[i].doTheResize(resizeCollection.ratios, true, resizeCollection.isThrottled);
                        }
                    }
                    resizeCollection = {
                        raf: false,
                        ratios: null,
                        isThrottled: false,
                        layers: []
                    };
                });
            }
        };

    /**
     * @memberOf N2Classes
     *
     * @param placement
     * @param layer
     * @param fragmentEditor
     * @constructor
     * @augments PlacementAbstract
     */
    function PlacementAbsolute(placement, layer, fragmentEditor) {
        this.type = 'absolute';

        this.transferredProperties = {};

        N2Classes.PlacementAbstract.prototype.constructor.apply(this, arguments);

        this.doThrottledTheResize = this.doTheResize;
        this._triggerLayerResizedThrottled = NextendThrottle(this._triggerLayerResized, 30);

        this.parentIsVisible = true; // Related to parent child layer picker

        this.children = [];
    }

    PlacementAbsolute.prototype = Object.create(N2Classes.PlacementAbstract.prototype);
    PlacementAbsolute.prototype.constructor = PlacementAbsolute;

    PlacementAbsolute.prototype.start = function () {
        this.$layer = this.layer.layer;
        this.$layerRow = this.layer.layerRow;
    };

    PlacementAbsolute.prototype.preActivation = function (lastPlacement) {
        if (lastPlacement.type == 'normal') {
            var height = this.layer.getProperty('height');
            if (height > 0) {
                this.transferredProperties.height = height;
            }
        }
    };

    PlacementAbsolute.prototype.activated = function (properties) {
        var delayedActivate = false,
            parentid = this.$layer.data('parentid');
        if (parentid) {
            var $parent = $('#' + parentid);
            if ($parent.length > 0) {
                this.activatedAfterParentReady(properties);
            } else {
                setTimeout($.proxy(function () {
                    this.activatedAfterParentReady(properties);
                }, this), 300);
            }
        } else {
            this._activated(properties);
        }
    };

    PlacementAbsolute.prototype.activatedAfterParentReady = function (properties) {
        var parentid = this.$layer.data('parentid');
        if (parentid) {
            var $parent = $('#' + parentid);
            if ($parent.length > 0) {
                var layerObject = $parent.data('layerObject');
                if (layerObject) {
                    layerObject.readyDeferred.done($.proxy(this._activated, this, properties));
                } else {
                    $parent.on('layerStarted', $.proxy(function (e, layerObject) {
                        layerObject.readyDeferred.done($.proxy(this._activated, this, properties));
                    }, this));
                }
            } else {
                this.$layer.data('parentid', '');
                this._activated(properties);
            }
        } else {
            this._activated(properties);
        }
    };

    PlacementAbsolute.prototype._activated = function (properties) {
        this.loadProperties($.extend(properties, this.transferredProperties));
        this.transferredProperties = {};

        this.$layer.css('zIndex', '');

        this.___makeLayerAlign();
        this.___makeLayerResizeable();
    };

    PlacementAbsolute.cleanLayer = function ($layer) {
        var devices = [
            'desktopPortrait',
            'desktopLandscape',
            'tabletPortrait',
            'tabletLandscape',
            'mobilePortrait',
            'mobileLandscape'
        ];

        $layer
            .removeAttr('data-align')
            .removeAttr('data-valign')
            .css({
                left: '',
                top: '',
                right: '',
                bottom: '',
                width: '',
                height: '',
                'text-align': ''
            });
        var properties = ['parentid', 'responsiveposition', 'responsivesize', 'parentalign', 'parentvalign',
            'align', 'valign', 'left', 'top', 'width', 'height'];

        var data = {};
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i].toLowerCase();
            data[prop] = $layer.data(prop);
            $layer.removeAttr(prop);
            $layer.removeData(prop);
            for (var j = 0; j < devices.length; j++) {
                var device = devices[j].toLowerCase();
                data[device + prop] = $layer.data(device + prop);
                $layer.removeAttr(device + prop);
                $layer.removeData(device + prop);
            }
        }
        return data;
    };

    PlacementAbsolute.prototype.deActivated = function (newMode) {

        var value = this.layer.getProperty('parentid');
        if (value && value != '') {
            this.$layer.removeAttr('data-parentid');
            this.unSubscribeParent();
        }

        this.$layer
            .removeAttr('data-align')
            .removeAttr('data-valign')
            .css({
                left: '',
                top: '',
                right: '',
                bottom: '',
                width: '',
                height: '',
                'text-align': ''
            });

        this.alignMarker.remove();
        this.$layer.nUIResizable('destroy');
        this.$layer.off('.n2-ss-absolute');

        this.$layer.triggerHandler('LayerUnavailable');

        var properties = ['parentid', 'responsiveposition', 'responsivesize', 'parentalign', 'parentvalign',
                'align', 'valign', 'left', 'top', 'width', 'height'],
            historicalData = this.layer.getPropertiesData(properties);

        this.layer.removeProperties(properties);


        this.chainParent.remove();

        return historicalData;
    };

    PlacementAbsolute.prototype.loadProperties = function (options) {
        this.layer.createProperty('parentid', null, this.layer.layer, this);

        this.layer.createProperty('responsiveposition', 1, this.layer.layer, this);
        this.layer.createProperty('responsivesize', 1, this.layer.layer, this);

        this.layer.createDeviceProperty('parentalign', {desktopPortrait: 'center'}, this.layer.layer, this);
        this.layer.createDeviceProperty('parentvalign', {desktopPortrait: 'middle'}, this.layer.layer, this);

        this.layer.createDeviceProperty('align', {desktopPortrait: options.align || 'center'}, this.layer.layer, this);
        this.layer.createDeviceProperty('valign', {desktopPortrait: options.valign || 'middle'}, this.layer.layer, this);

        this.layer.createDeviceProperty('left', {desktopPortrait: options.left || 0}, this.layer.layer, this);
        this.layer.createDeviceProperty('top', {desktopPortrait: options.top || 0}, this.layer.layer, this);

        this.layer.createDeviceProperty('width', {desktopPortrait: options.width || 'auto'}, this.layer.layer, this);
        this.layer.createDeviceProperty('height', {desktopPortrait: options.height || 'auto'}, this.layer.layer, this);

        var $layer = this.layer.layer;

        this.subscribeParentCallbacks = {};
        if (this.layer.getProperty('parentid')) {
            this.subscribeParent();
        }

        $layer.attr({
            'data-align': this.layer.getProperty('align'),
            'data-valign': this.layer.getProperty('valign')
        });

        var $lastParent = null;
        this.chainParent = $('<div class="n2-ss-layer-chain-parent n2-button n2-button-icon n2-button-xs n2-radius-s n2-button-blue"><i class="n2-i n2-i-layerunlink"></i></div>').on({
            click: $.proxy(this.unlink, this),
            mouseenter: $.proxy(function () {
                $lastParent = $('#' + this.layer.getProperty('parentid')).addClass('n2-highlight');
            }, this),
            mouseleave: $.proxy(function () {
                if ($lastParent) {
                    $lastParent.removeClass('n2-highlight');
                    $lastParent = null;
                }
            }, this)
        }).appendTo(this.$layer);
    };


    PlacementAbsolute.prototype.triggerLayerResized = function (isThrottled, ratios) {
        if (isThrottled) {
            this._triggerLayerResized(isThrottled, ratios);
        } else {
            this._triggerLayerResizedThrottled(true, ratios);
        }
    };

    PlacementAbsolute.prototype._triggerLayerResized = function (isThrottled, ratios) {
        if (!this.layer.isDeleted) {
            this.$layer.triggerHandler('LayerResized', [ratios || {
                slideW: this.fragmentEditor.getResponsiveRatioHorizontal(),
                slideH: this.fragmentEditor.getResponsiveRatioVertical()
            }, isThrottled || false]);
        }
    };

    PlacementAbsolute.prototype.___makeLayerAlign = function () {
        this.alignMarker = $('<div class="n2-ss-layer-cc" />').appendTo(this.$layer);
    };

    //<editor-fold desc="Makes layer resizable">

    /**
     * Add resize handles to the specified layer
     * @param {jQuery} layer
     * @private
     */
    PlacementAbsolute.prototype.___makeLayerResizeable = function () {
        this._resizableJustClick = false;
        this.$layer.nUIResizable({
            handles: 'n, e, s, w, ne, se, sw, nw',
            _containment: this.fragmentEditor.mainContainer.layer,
            start: $.proxy(this.____makeLayerResizeableStart, this),
            resize: $.proxy(this.____makeLayerResizeableResize, this),
            stop: $.proxy(this.____makeLayerResizeableStop, this),
            create: $.proxy(function () {
                this.$layer.find('.nui-resizable-handle, .n2-ss-layer-cc').on({
                    mousedown: $.proxy(function (e) {
                        this._resizableJustClick = [e.clientX, e.clientY];
                    }, this),
                    mouseup: $.proxy(function (e) {
                        if (this._resizableJustClick && Math.abs(Math.sqrt(Math.pow(this._resizableJustClick[0] - e.clientX, 2) + Math.pow(this._resizableJustClick[1] - e.clientY, 2))) < 1) {
                            var $target = $(e.currentTarget),
                                layerFeatures = this.fragmentEditor.layerOptions.layerFeatures;
                            if ($target.hasClass('nui-resizable-nw')) {
                                layerFeatures.horizontalAlign('left', false);
                                layerFeatures.verticalAlign('top', false);
                            } else if ($target.hasClass('nui-resizable-w')) {
                                layerFeatures.horizontalAlign('left', false);
                                layerFeatures.verticalAlign('middle', false);
                            } else if ($target.hasClass('nui-resizable-sw')) {
                                layerFeatures.horizontalAlign('left', false);
                                layerFeatures.verticalAlign('bottom', false);
                            } else if ($target.hasClass('nui-resizable-n')) {
                                layerFeatures.horizontalAlign('center', false);
                                layerFeatures.verticalAlign('top', false);
                            } else if ($target.hasClass('n2-ss-layer-cc')) {
                                layerFeatures.horizontalAlign('center', false);
                                layerFeatures.verticalAlign('middle', false);
                            } else if ($target.hasClass('nui-resizable-s')) {
                                layerFeatures.horizontalAlign('center', false);
                                layerFeatures.verticalAlign('bottom', false);
                            } else if ($target.hasClass('nui-resizable-ne')) {
                                layerFeatures.horizontalAlign('right', false);
                                layerFeatures.verticalAlign('top', false);
                            } else if ($target.hasClass('nui-resizable-e')) {
                                layerFeatures.horizontalAlign('right', false);
                                layerFeatures.verticalAlign('middle', false);
                            } else if ($target.hasClass('nui-resizable-se')) {
                                layerFeatures.horizontalAlign('right', false);
                                layerFeatures.verticalAlign('bottom', false);
                            }
                        }
                        this._resizableJustClick = false;
                    }, this)
                });
            }, this),
            smartguides: $.proxy(function () {
                this.$layer.triggerHandler('LayerParent');
                return this.fragmentEditor.getSnap();
            }, this),
            tolerance: 5
        })
            .on({
                'mousedown.n2-ss-absolute': $.proxy(function (e) {
                    if (!this.layer.status != N2Classes.ComponentAbstract.STATUS.LOCKED) {
                        N2Classes.PositionDisplay.get().show('Canvas');

                        N2Classes.PositionDisplay.get().update(e, 'Canvas', 'W: ' + parseInt(this.$layer.width()) + 'px<br />H: ' + parseInt(this.$layer.height()) + 'px');

                    }
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                }, this),
                'mouseup.n2-ss-absolute': $.proxy(function (e) {
                    N2Classes.PositionDisplay.get().hide('Canvas');
                }, this)
            });
    };

    PlacementAbsolute.prototype.____makeLayerResizeableStart = function (event, ui) {
        this.preventActivation = true;
        this.resizableDeferred = $.Deferred();
        this.fragmentEditor.layerWindow.hideWithDeferred(this.resizableDeferred);
        $('body').addClass('n2-ss-resize-layer');
        if (this._resizableJustClick) {
            this._resizableJustClick = false;
        }
        this.____makeLayerResizeableResize(event, ui);
        N2Classes.PositionDisplay.get().show('Canvas');
    };

    PlacementAbsolute.prototype.____makeLayerResizeableResize = function (e, ui) {


        N2Classes.PositionDisplay.get().update(e, 'Canvas', 'W: ' + ui.size.width + 'px<br />H: ' + ui.size.height + 'px');

        this.triggerLayerResized();
    };

    PlacementAbsolute.prototype.____makeLayerResizeableStop = function (event, ui) {
        $('body').removeClass('n2-ss-resize-layer');
        this.resizableDeferred.resolve();

        var isAutoWidth = false;
        if (ui.axis == "n" || ui.axis == "s" || ui.originalSize.width == ui.size.width) {
            var currentValue = this.layer.getProperty('width');
            if (this.layer.isDimensionPropertyAccepted(currentValue)) {
                isAutoWidth = true;
                this._syncwidth();
            }
        }

        var isAutoHeight = false;
        if (ui.axis == "e" || ui.axis == "w" || ui.originalSize.height == ui.size.height) {
            var currentValue = this.layer.getProperty('height');
            if (this.layer.isDimensionPropertyAccepted(currentValue)) {
                isAutoHeight = true;
                this._syncheight();
            }
        }

        var ratioSizeH = this.fragmentEditor.getResponsiveRatioHorizontal(),
            ratioSizeV = this.fragmentEditor.getResponsiveRatioVertical();

        if (!parseInt(this.layer.getProperty('responsivesize'))) {
            ratioSizeH = ratioSizeV = 1;
        }
        var width = null;
        if (!isAutoWidth) {
            width = Math.round(ui.size.width * (1 / ratioSizeH));
        }
        var height = null;
        if (!isAutoHeight) {
            height = Math.round(ui.size.height * (1 / ratioSizeV));
        }

        this._setPosition(null, null, ui.position.left, ui.position.top, width, height, true);

        this.triggerLayerResized();

        this.$layer.triggerHandler('LayerUnParent');

        N2Classes.PositionDisplay.get().hide('Canvas');

        setTimeout($.proxy(function () {
            this.preventActivation = false;
        }, this), 80);

        //this.fragmentEditor.panel.positionMenu(this.$layer);
    };
    //</editor-fold>

    PlacementAbsolute.prototype._setPosition = function (align, valign, left, top, width, height, isPositionAbsolute) {
        var mode = this.layer.getMode();
        if (align === null) {
            align = this.layer.getProperty('align');
        }
        if (valign === null) {
            valign = this.layer.getProperty('valign');
        }

        if (left === null) {
            left = this.layer.getProperty('left');
        } else if (isPositionAbsolute) {
            left = this.calculatePositionLeft(align, left);
        }

        if (top === null) {
            top = this.layer.getProperty('top');
        } else if (isPositionAbsolute) {
            top = this.calculatePositionTop(valign, top);
        }

        if (width === null) {
            width = this.layer.getProperty('width');
        }

        if (height === null) {
            height = this.layer.getProperty('height');
        }

        var task = N2Classes.History.get().addValue(this.layer, this.layer.historyStoreOnPlacement, ['historyStorePosition', mode]);
        if (task) {
            task.setValues({
                align: this.layer.getRawProperty('align'),
                valign: this.layer.getRawProperty('valign'),
                left: this.layer.getRawProperty('left'),
                top: this.layer.getRawProperty('top'),
                width: this.layer.getRawProperty('width'),
                height: this.layer.getRawProperty('height')
            }, {
                align: align,
                valign: valign,
                left: left,
                top: top,
                width: width,
                height: height
            });
        }

        N2Classes.History.get().off();

        this.layer.store('width', width, true, 'layer');
        this.layer.$.trigger('propertyChanged', ['width', width]);

        this.layer.store('height', height, true, 'layer');
        this.layer.$.trigger('propertyChanged', ['height', height]);

        this.layer.store('align', align, true, 'layer');
        this.layer.$.trigger('propertyChanged', ['align', align]);

        this.layer.store('valign', valign, true, 'layer');
        this.layer.$.trigger('propertyChanged', ['valign', valign]);

        this.layer.store('left', left, true, 'layer');
        this.layer.$.trigger('propertyChanged', ['left', left]);

        this.layer.store('top', top, true, 'layer');
        this.layer.$.trigger('propertyChanged', ['top', top]);

        N2Classes.History.get().on();

    };

    PlacementAbsolute.prototype.historyStorePosition = function (values, mode) {

        this.layer.historyStore(values.align, 'align', mode);
        this.layer.historyStore(values.valign, 'valign', mode);

        this.layer.historyStore(values.width, 'width', mode);
        this.layer.historyStore(values.height, 'height', mode);

        this.layer.historyStore(values.left, 'left', mode);
        this.layer.historyStore(values.top, 'top', mode);

        this.triggerLayerResized();
    };

    PlacementAbsolute.prototype.calculatePositionLeft = function (align, left) {
        var ratioH = this.fragmentEditor.getResponsiveRatioHorizontal();

        if (!parseInt(this.layer.getProperty('responsiveposition'))) {
            ratioH = 1;
        }

        var parent = this.parent,
            p = {
                left: 0,
                leftMultiplier: 1
            };
        if (!parent || !parent.is(':visible')) {
            parent = this.$layer.parent();


            switch (align) {
                case 'center':
                    p.left += parent.width() / 2;
                    break;
                case 'right':
                    p.left += parent.width();
                    break;
            }
        } else {
            var position = parent.position();
            switch (this.layer.getProperty('parentalign')) {
                case 'right':
                    p.left = position.left + parent.width();
                    break;
                case 'center':
                    p.left = position.left + parent.width() / 2;
                    break;
                default:
                    p.left = position.left;
            }
        }


        var left;
        switch (align) {
            case 'left':
                left = -Math.round((p.left - left) * (1 / ratioH));
                break;
            case 'center':
                left = -Math.round((p.left - left - this.$layer.width() / 2) * (1 / ratioH));
                break;
            case 'right':
                left = -Math.round((p.left - left - this.$layer.width()) * (1 / ratioH));
                break;
        }

        return left;
    };


    PlacementAbsolute.prototype.calculatePositionTop = function (valign, top) {
        var ratioV = this.fragmentEditor.getResponsiveRatioVertical();

        if (!parseInt(this.layer.getProperty('responsiveposition'))) {
            ratioV = 1;
        }


        var parent = this.parent,
            p = {
                top: 0,
                topMultiplier: 1
            };
        if (!parent || !parent.is(':visible')) {
            parent = this.$layer.parent();

            switch (valign) {
                case 'middle':
                    p.top += parent.height() / 2;
                    break;
                case 'bottom':
                    p.top += parent.height();
                    break;
            }
        } else {
            var position = parent.position();

            switch (this.layer.getProperty('parentvalign')) {
                case 'bottom':
                    p.top = position.top + parent.height();
                    break;
                case 'middle':
                    p.top = position.top + parent.height() / 2;
                    break;
                default:
                    p.top = position.top;
            }
        }

        var top;
        switch (valign) {
            case 'top':
                top = -Math.round((p.top - top) * (1 / ratioV));
                break;
            case 'middle':
                top = -Math.round((p.top - top - this.$layer.height() / 2) * (1 / ratioV));
                break;
            case 'bottom':
                top = -Math.round((p.top - top - this.$layer.height()) * (1 / ratioV));
                break;
        }

        return top;
    };

    PlacementAbsolute.prototype.moveX = function (x) {

        this._setPosition(null, null, this.layer.getProperty('left') + x, null, null, null, false);
    };

    PlacementAbsolute.prototype.moveY = function (y) {

        this._setPosition(null, null, null, this.layer.getProperty('top') + y, null, null, false);
    };

    PlacementAbsolute.prototype.setPositionLeft = function (left) {

        left = this.calculatePositionLeft(this.layer.getProperty('align'), left);

        this.layer.store('left', left, true);
        this.layer.$.trigger('propertyChanged', ['left', left]);

    };

    PlacementAbsolute.prototype.setPositionTop = function (top) {

        top = this.calculatePositionTop(this.layer.getProperty('valign'), top);

        this.layer.store('top', top, true);
        this.layer.$.trigger('propertyChanged', ['top', top]);
    };

    PlacementAbsolute.prototype.setPosition = function (left, top) {
        this.setPositionLeft(left);
        this.setPositionTop(top);
    };

    PlacementAbsolute.prototype.setDeviceBasedAlign = function () {
        var mode = this.layer.getMode();
        if (typeof this.layer.deviceProperty[mode]['align'] == 'undefined') {
            this.layer.setProperty('align', this.layer.getProperty('align'), 'layer');
        }
        if (typeof this.layer.deviceProperty[mode]['valign'] == 'undefined') {
            this.layer.setProperty('valign', this.layer.getProperty('valign'), 'layer');
        }
    };
    //</editor-fold


    PlacementAbsolute.prototype.setPropertyresponsiveposition =
        PlacementAbsolute.prototype.setPropertyresponsivesize = function (name, value, from) {
            this.layer._setProperty(name, parseInt(value), from);
        };


    PlacementAbsolute.prototype.setPropertywidth =
        PlacementAbsolute.prototype.setPropertyheight = function (name, value, from) {
            var v = value;
            if (!this.layer.isDimensionPropertyAccepted(value)) {
                v = ~~value;
                if (v != value) {
                    this.layer.$.trigger('propertyChanged', [name, v]);
                }
            }
            setTimeout($.proxy(function () {
                this.onResize(false);
            }, this), 50);

            this.layer._setProperty(name, v, from);
        };

    PlacementAbsolute.prototype.setPropertyleft =
        PlacementAbsolute.prototype.setPropertytop = function (name, value, from) {
            var v = ~~value;
            if (v != value) {
                this.layer.$.trigger('propertyChanged', [name, v]);
            }
            this.layer._setProperty(name, v, from);
        };

    PlacementAbsolute.prototype.render = function (name) {
        this['_sync' + name]();
    };

    PlacementAbsolute.prototype.renderWithModifier = function (name, value, modifier) {
        try {
            if ((name == 'width' || name == 'height') && this.layer.isDimensionPropertyAccepted(value)) {
                this['_sync' + name](value);
            } else {
                this['_sync' + name](Math.round(value * modifier));
            }
        } catch (e) {
            console.error('_sync' + name);
        }
    };

    PlacementAbsolute.prototype.onResize = function (isForced) {
        this.resize({
            slideW: this.fragmentEditor.getResponsiveRatioHorizontal(),
            slideH: this.fragmentEditor.getResponsiveRatioVertical()
        }, isForced);
    };

    PlacementAbsolute.prototype.resize = function (ratios, isForced) {

        if (!this.parent || isForced) {
            //this.doThrottledTheResize(ratios, false);
            this.addToResizeCollection(this, ratios, false);
        }
    };

    PlacementAbsolute.prototype.addToResizeCollection = function (layer, ratios, isThrottled) {
        resizeCollection.ratios = ratios;
        resizeCollection.isThrottled = isThrottled;
        for (var i = 0; i < resizeCollection.layers.length; i++) {
            if (resizeCollection.layers[i] == this) {
                resizeCollection.layers.splice(i, 1);
                break;
            }
        }
        resizeCollection.layers.push(layer);

        requestRender();
        this.triggerLayerResized(isThrottled, ratios);
    };

    PlacementAbsolute.prototype._syncresponsiveposition = function () {
        this.onResize(false);
    };

    PlacementAbsolute.prototype._syncwidth = function () {
        var value = this.layer.getProperty('width');

        if (!this.layer.isDimensionPropertyAccepted(value)) {
            if (parseInt(this.layer.getProperty('responsivesize'))) {
                var ratio = this.fragmentEditor.getResponsiveRatioHorizontal();
                value = (value * ratio);
            }
            value += 'px';
        }

        this.$layer.css('width', value);
    };

    PlacementAbsolute.prototype._syncheight = function () {
        var value = this.layer.getProperty('height');
        if (!this.layer.isDimensionPropertyAccepted(value)) {
            if (parseInt(this.layer.getProperty('responsivesize'))) {
                var ratio = this.fragmentEditor.getResponsiveRatioVertical();
                value = (value * ratio);
            }
            value += 'px';
        }

        this.$layer.css('height', value);
    };

    PlacementAbsolute.prototype._syncparentalign = function () {
        var value = this.layer.getProperty('parentalign');
        this.$layer.data('parentalign', value);
        var parent = this.getParent();
        if (parent) {
            parent.placement.current.onResize(false);
        }
    };

    PlacementAbsolute.prototype._syncparentvalign = function () {
        var value = this.layer.getProperty('parentvalign');
        this.$layer.data('parentvalign', value);
        var parent = this.getParent();
        if (parent) {
            parent.placement.current.onResize(false);
        }
    };


    PlacementAbsolute.prototype._syncleft = function () {
        var value = this.layer.getProperty('left');

        if (parseInt(this.layer.getProperty('responsiveposition'))) {
            var ratio = this.fragmentEditor.getResponsiveRatioHorizontal();
            value = (value * ratio);
        }

        if (!this.parent || !this.parentIsVisible) {
            switch (this.layer.getProperty('align')) {
                case 'right':
                    this.$layer.css({
                        left: 'auto',
                        right: -value + 'px'
                    });
                    break;
                case 'center':
                    this.$layer.css({
                        left: (this.$layer.parent().width() / 2 + value - this.$layer.width() / 2) + 'px',
                        right: 'auto'
                    });
                    break;
                default:
                    this.$layer.css({
                        left: value + 'px',
                        right: 'auto'
                    });
            }
        } else {
            var position = this.parent.position(),
                align = this.layer.getProperty('align'),
                parentAlign = this.layer.getProperty('parentalign'),
                left = 0;
            switch (parentAlign) {
                case 'right':
                    left = position.left + this.parent.width();
                    break;
                case 'center':
                    left = position.left + this.parent.width() / 2;
                    break;
                default:
                    left = position.left;
            }

            switch (align) {
                case 'right':
                    this.$layer.css({
                        left: 'auto',
                        right: (this.$layer.parent().width() - left - value) + 'px'
                    });
                    break;
                case 'center':
                    this.$layer.css({
                        left: (left + value - this.$layer.width() / 2) + 'px',
                        right: 'auto'
                    });
                    break;
                default:
                    this.$layer.css({
                        left: (left + value) + 'px',
                        right: 'auto'
                    });
            }

        }

        this.triggerLayerResized();
    };

    PlacementAbsolute.prototype._synctop = function () {
        var value = this.layer.getProperty('top');

        if (parseInt(this.layer.getProperty('responsiveposition'))) {
            var ratio = this.fragmentEditor.getResponsiveRatioVertical();
            value = (value * ratio);
        }

        if (!this.parent || !this.parentIsVisible) {
            switch (this.layer.getProperty('valign')) {
                case 'bottom':
                    this.$layer.css({
                        top: 'auto',
                        bottom: -value + 'px'
                    });
                    break;
                case 'middle':
                    this.$layer.css({
                        top: (this.$layer.parent().height() / 2 + value - this.$layer.height() / 2) + 'px',
                        bottom: 'auto'
                    });
                    break;
                default:
                    this.$layer.css({
                        top: value + 'px',
                        bottom: 'auto'
                    });
            }
        } else {
            var position = this.parent.position(),
                valign = this.layer.getProperty('valign'),
                parentVAlign = this.layer.getProperty('parentvalign'),
                top = 0;
            switch (parentVAlign) {
                case 'bottom':
                    top = position.top + this.parent.height();
                    break;
                case 'middle':
                    top = position.top + this.parent.height() / 2;
                    break;
                default:
                    top = position.top;
            }

            switch (valign) {
                case 'bottom':
                    this.$layer.css({
                        top: 'auto',
                        bottom: (this.$layer.parent().height() - top - value) + 'px'
                    });
                    break;
                case 'middle':
                    this.$layer.css({
                        top: (top + value - this.$layer.height() / 2) + 'px',
                        bottom: 'auto'
                    });
                    break;
                default:
                    this.$layer.css({
                        top: (top + value) + 'px',
                        bottom: 'auto'
                    });
            }
        }

        this.triggerLayerResized();
    };

    PlacementAbsolute.prototype._syncresponsivesize = function () {
        this.onResize(false);
    };

    PlacementAbsolute.prototype.historyStoreDoubleProp = function (data, mode, prop, prop2) {
        var currentMode = this.layer.getMode();
        if (mode == currentMode) {
            this.layer._setProperty(prop, data.value, 'history');
            this.layer._setProperty(prop2, data.value2, 'history');
        } else {
            this.layer.deviceProperty[mode][prop] = data.value;
            this.layer.deviceProperty[mode][prop2] = data.value2;
            this.layer.$.trigger('propertyChanged', [prop, this.layer.getProperty(prop)]);
            this.layer.$.trigger('propertyChanged', [prop2, this.layer.getProperty(prop2)]);
            this.layer.render(prop, null, 'history');
            this.layer.render(prop2, null, 'history');
        }
    };

    PlacementAbsolute.prototype.setPropertyalign = function (name, value, from) {
        var oldValue = this.layer.getProperty(name),
            oldLeft = this.layer.getRawProperty('left');

        N2Classes.History.get().off();
        this.layer._setProperty(name, value, from);
        N2Classes.History.get().on();

        var task = N2Classes.History.get().addValue(this.layer, this.layer.historyStoreOnPlacement, ['historyStoreDoubleProp', this.layer.getMode(), 'align', 'left']);
        if (task) {
            task.setValues({
                value: oldValue,
                value2: oldLeft
            }, {
                value: value,
                value2: this.layer.getRawProperty('left')
            });
        }
    };

    PlacementAbsolute.prototype.setPropertyvalign = function (name, value, from) {
        var oldValue = this.layer.getProperty(name),
            oldTop = this.layer.getRawProperty('top');

        N2Classes.History.get().off();
        this.layer._setProperty(name, value, from);
        N2Classes.History.get().on();

        var task = N2Classes.History.get().addValue(this.layer, this.layer.historyStoreOnPlacement, ['historyStoreDoubleProp', this.layer.getMode(), 'valign', 'top']);
        if (task) {
            task.setValues({
                value: oldValue,
                value2: oldTop
            }, {
                value: value,
                value2: this.layer.getRawProperty('top')
            });
        }
    };

    PlacementAbsolute.prototype._syncalign = function (oldValue, from) {
        var value = this.layer.getProperty('align');
        this.$layer.attr('data-align', value);

        if (from !== 'history' && value != oldValue) {
            this.setPositionLeft(this.$layer.position().left);
        }
    };
    PlacementAbsolute.prototype._syncvalign = function (oldValue, from) {
        var value = this.layer.getProperty('valign');
        this.$layer.attr('data-valign', value);

        if (from !== 'history' && value != oldValue) {
            this.setPositionTop(this.$layer.position().top);
        }
    };

    PlacementAbsolute.prototype.fit = function () {
        var layer = this.$layer.get(0);

        var position = this.$layer.position();

        if (layer.scrollWidth > 0 && layer.scrollHeight > 0) {
            var resized = false;
            if (this.layer.item) {
                resized = this.layer.item.fitLayer();
            }
            if (!resized) {
                this.layer.setProperty('width', 'auto', 'layer');
                this.layer.setProperty('height', 'auto', 'layer');

                var layerWidth = this.$layer.width();
                if (Math.abs(this.fragmentEditor.mainContainer.layer.width() - this.$layer.position().left - layerWidth) < 2) {
                    this.layer.setProperty('width', layerWidth, 'layer');
                }
            }
        }
    };

    PlacementAbsolute.prototype.hide = function (targetMode) {
        this.layer.store((targetMode ? targetMode : this.layer.getMode()), 0, true);
    };

    PlacementAbsolute.prototype.show = function (targetMode) {
        this.layer.store((targetMode ? targetMode : this.layer.getMode()), 1, true);
    };


    PlacementAbsolute.prototype.changeStatus = function (oldStatus, newStatus) {

        if (oldStatus == N2Classes.ComponentAbstract.STATUS.LOCKED) {
            this.layer.nUIResizable("enable");
        }


        if (newStatus == N2Classes.ComponentAbstract.STATUS.LOCKED) {
            this.$layer.nUIResizable("disable");
        }
    };

    PlacementAbsolute.prototype.getParent = function () {
        return $('#' + this.layer.getProperty('parentid')).data('layerObject');
    };

    PlacementAbsolute.prototype.subscribeParent = function () {
        var that = this;
        var $newParent = $('#' + this.layer.property.parentid);
        if (this.parent && !$newParent.is(this.parent)) {
            this.parent.off(this.subscribeParentCallbacks);
            this.parent = false;
        }
        if (!this.parent) {
            this.subscribeParentCallbacks = {
                LayerResized: function () {
                    that.resizeParent.apply(that, arguments);
                },
                LayerParent: function () {
                    that.$layer.addClass('n2-ss-layer-parent');
                    that.$layer.triggerHandler('LayerParent');
                },
                LayerUnParent: function () {
                    that.$layer.removeClass('n2-ss-layer-parent');
                    that.$layer.triggerHandler('LayerUnParent');
                },
                LayerDeleted: function (e) {

                    that.layer.setProperty('parentid', '', 'layer');
                },
                LayerUnavailable: function (e) {

                    that.layer.setProperty('parentid', '', 'layer');
                    that.layer.setProperty('left', 0, 'layer');
                    that.layer.setProperty('top', 0, 'layer');
                },
                LayerShowChange: function (e, mode, value) {
                    if (that.layer.getMode() == mode) {
                        that.parentIsVisible = value;
                    }
                },
                'n2-ss-activate': function () {
                    that.$layerRow.addClass('n2-parent-active');
                },
                'n2-ss-deactivate': function () {
                    that.$layerRow.removeClass('n2-parent-active');
                },
                'LayerGetDataWithChildren': function (e, layersData, layers) {
                    that.layer.getDataWithChildren(layersData, layers);
                }
            };
            this.parent = $newParent.on(this.subscribeParentCallbacks);
            this.parent.data('layerObject').placement.current.addChild(this);
            this.$layer.addClass('n2-ss-layer-has-parent');
        }
    };

    PlacementAbsolute.prototype.unSubscribeParent = function (context) {
        this.$layerRow.removeClass('n2-parent-active');
        this.$layer.removeClass('n2-ss-layer-has-parent');
        if (this.parent) {
            this.parent.off(this.subscribeParentCallbacks);
            this.parent = false;
            this.subscribeParentCallbacks = {};
            if (context != 'delete') {
                var position = this.$layer.position();
                this._setPosition(null, null, position.left, position.top, null, null, true);
            }
        }

    };

    PlacementAbsolute.prototype.addChild = function (childPlacement) {
        this.children.push(childPlacement);
    };

    PlacementAbsolute.prototype.removeChild = function (childPlacement) {
        this.children.splice($.inArray(childPlacement, this.children), 1);
    };

    PlacementAbsolute.prototype.unlink = function (e) {
        if (e) e.preventDefault();
        this.layer.setProperty('parentid', '', 'layer');
    };

    PlacementAbsolute.prototype.parentPicked = function (parentObject, parentAlign, parentValign, align, valign) {
        this.layer.setProperty('parentid', '', 'layer');

        this.layer.setProperty('align', align, 'layer');
        this.layer.setProperty('valign', valign, 'layer');
        this.layer.setProperty('parentalign', parentAlign, 'layer');
        this.layer.setProperty('parentvalign', parentValign, 'layer');

        this.layer.setProperty('parentid', parentObject.requestID(), 'layer');

        var undef;
        for (var device in this.layer.deviceProperty) {
            if (device == 'desktopPortrait') continue;
            this.layer.deviceProperty[device].left = undef;
            this.layer.deviceProperty[device].top = undef;
            this.layer.deviceProperty[device].valign = undef;
            this.layer.deviceProperty[device].align = undef;
        }
    };

    PlacementAbsolute.prototype._syncparentid = function () {
        var value = this.layer.getProperty('parentid');
        if (!value || value == '') {
            this.$layer.removeAttr('data-parentid');
            this.unSubscribeParent();
        } else {
            if (!N2Classes.History.get().actionInProgress()) {
                this._linkToParentID(value, false);
            } else {
                setTimeout($.proxy(this._linkToParentID, this, value, true), 100);
            }
        }
    };

    PlacementAbsolute.prototype._linkToParentID = function (value, historyAction) {
        if ($('#' + value).length === 0) {
            this.layer.setProperty('parentid', '', 'layer');
        } else {
            this.$layer.attr('data-parentid', value).addClass('n2-ss-layer-has-parent');
            this.subscribeParent();

            if (!historyAction) {
                var position = this.$layer.position();
                this._setPosition(null, null, position.left, position.top, null, null, true);
            } else {
                N2Classes.History.get().off();
                this._setPosition(null, null, null, null, null, null, true);
                N2Classes.History.get().on();
            }
        }
    };

    PlacementAbsolute.prototype.snap = function () {
        this.$layer.nextendResizable("option", "smartguides", $.proxy(function () {
            this.$layer.triggerHandler('LayerParent');
            return this.fragmentEditor.getSnap();
        }, this));
    };

    PlacementAbsolute.prototype._renderModeProperties = function (isReset) {

        this.$layer.attr('data-align', this.layer.property.align);
        this.$layer.attr('data-valign', this.layer.property.valign);
        if (isReset) {
            this.onResize(true);
        }
    };

    PlacementAbsolute.prototype.doLinearResize = function (ratios) {
        this.doThrottledTheResize(ratios, true);
    };

    PlacementAbsolute.prototype.doTheResize = function (ratios, isLinear, isThrottled) {

        this.render('width');
        this.render('height');

        this.render('left');
        this.render('top');

        if (!isLinear) {
            this.triggerLayerResized(isThrottled, ratios);
        }
    };

    PlacementAbsolute.prototype.resizeParent = function (e, ratios, isThrottled) {
        this.addToResizeCollection(this, ratios, isThrottled);
    };

    PlacementAbsolute.prototype.updatePosition = function () {
        var parent = this.parent;

        if (this.layer.getProperty('align') == 'center') {
            var left = 0;
            if (parent) {
                left = parent.position().left + parent.width() / 2;
            } else {
                left = this.$layer.parent().width() / 2;
            }
            var ratio = this.fragmentEditor.getResponsiveRatioHorizontal();
            if (!parseInt(this.layer.getProperty('responsiveposition'))) {
                ratio = 1;
            }
            this.$layer.css('left', (left - this.$layer.width() / 2 + this.layer.getProperty('left') * ratio));
        }

        if (this.layer.getProperty('valign') == 'middle') {
            var top = 0;
            if (parent) {
                top = parent.position().top + parent.height() / 2;
            } else {
                top = this.$layer.parent().height() / 2;
            }
            var ratio = this.fragmentEditor.getResponsiveRatioVertical();
            if (!parseInt(this.layer.getProperty('responsiveposition'))) {
                ratio = 1;
            }
            this.$layer.css('top', (top - this.$layer.height() / 2 + this.layer.getProperty('top') * ratio));
        }
        this.triggerLayerResized();
    };

    PlacementAbsolute.prototype.getIndex = function () {
        var index = parseInt(this.$layer.css('zIndex'));
        if (isNaN(index)) {
            index = 0;
        }
        return index;
    };

    PlacementAbsolute.prototype.renderIndex = function (index) {
        //this.layer.layer.css('zIndex', index + 1);
    };

    PlacementAbsolute.prototype.sync = function () {

        this._syncalign(null, 'history');
        this._syncvalign(null, 'history');

        this._syncwidth();
        this._syncheight();
        this._synctop();
        this._syncleft();

        this._syncparentid();

    };

    PlacementAbsolute.prototype.delete = function () {

        var parentId = this.layer.getProperty('parentid');
        if (parentId) {
            this.unSubscribeParent('delete');
        }
    };

    PlacementAbsolute.prototype.isParentOrChild = function () {
        return this.parent || this.children.length > 0;
    };

    return PlacementAbsolute;
});
N2D('PlacementContent', ['PlacementAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param placement
     * @param layer
     * @param fragmentEditor
     * @constructor
     */
    function PlacementContent(placement, layer, fragmentEditor) {
        this.type = 'content';

        N2Classes.PlacementAbstract.prototype.constructor.apply(this, arguments);
    }

    PlacementContent.prototype = Object.create(N2Classes.PlacementAbstract.prototype);
    PlacementContent.prototype.constructor = PlacementContent;

    return PlacementContent;
});
N2D('PlacementDefault', ['PlacementAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param placement
     * @param layer
     * @param fragmentEditor
     * @constructor
     */
    function PlacementDefault(placement, layer, fragmentEditor) {
        this.type = 'default';

        N2Classes.PlacementAbstract.prototype.constructor.apply(this, arguments);
    }

    PlacementDefault.prototype = Object.create(N2Classes.PlacementAbstract.prototype);
    PlacementDefault.prototype.constructor = PlacementDefault;

    PlacementDefault.prototype.start = function () {
        this.$layer = this.layer.layer;
    };


    PlacementDefault.prototype.activated = function (properties) {

        this.startUISizing();
    };

    PlacementDefault.prototype.deActivated = function (newMode) {
        this.$layer.nUINormalSizing('destroy');
    };

    PlacementDefault.prototype.startUISizing = function () {
        var needSize = false;
        if (this.layer.item && this.layer.item.needSize) {
            needSize = true;
        }
        this.$layer.nUINormalSizing({
            start: $.proxy(function (e, prop) {
                N2Classes.PositionDisplay.get().show('NormalSizing');
                if (prop === 'maxwidth') {
                    this.layer.layer.attr('data-has-maxwidth', '1');
                }
            }, this),
            resizeMaxWidth: $.proxy(function (e, ui) {

                N2Classes.PositionDisplay.get().update(e, 'NormalSizing', 'Max-width: ' + (ui.value == 0 ? 'none' : (ui.value + 'px')));

            }, this),
            stopMaxWidth: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().hide('NormalSizing');
                this.layer.setProperty('maxwidth', ui.value);
            }, this)
        });
    };

    return PlacementDefault;
});
N2D('PlacementNormal', ['PlacementAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param placement
     * @param layer
     * @param fragmentEditor
     * @constructor
     * @augments PlacementAbstract

     */
    function PlacementNormal(placement, layer, fragmentEditor) {
        this.type = 'normal';

        this.transferredProperties = {};

        N2Classes.PlacementAbstract.prototype.constructor.apply(this, arguments);
    }

    PlacementNormal.prototype = Object.create(N2Classes.PlacementAbstract.prototype);
    PlacementNormal.prototype.constructor = PlacementNormal;

    PlacementNormal.prototype.start = function () {
        this.$layer = this.layer.layer;
    };

    PlacementNormal.prototype.preActivation = function (lastPlacement) {
        if (lastPlacement.type == 'absolute' && this.layer.item && this.layer.item.needSize) {
            var height = this.layer.getProperty('height');
            if (height.match && height.match(/[0-9]+%$/)) {
                this.transferredProperties.height = Math.max(100, parseInt(this.$layer.parent().height() * parseInt(height) / 100));
            } else if (height > 0) {
                this.transferredProperties.height = height;
            }
        }
    };

    PlacementNormal.prototype.activated = function (properties) {
        this.loadProperties($.extend(properties, this.transferredProperties));
        this.transferredProperties = {};

        this.layer.$.on('baseSizeUpdated.placementnormal', $.proxy(this._syncmargin, this));
        this.layer.$.on('baseSizeUpdated.placementnormal', $.proxy(this._syncheight, this));

        this.startUISpacing();

        this.startUISizing();

        this.$layer.on({
            mousedown: $.proxy(function (e) {
                e.stopPropagation();
            })
        });
    };

    PlacementNormal.prototype.loadProperties = function (options) {
        this.layer.createDeviceProperty('margin', {desktopPortrait: '0|*|0|*|0|*|0|*|px+'}, this.layer.layer, this);
        this.layer.createDeviceProperty('height', {desktopPortrait: (options.height || 0)}, this.layer.layer, this);
        this.layer.createDeviceProperty('maxwidth', {desktopPortrait: 0}, this.layer.layer, this);
        this.layer.createDeviceProperty('selfalign', {desktopPortrait: 'inherit'}, this.layer.layer, this);
    };

    PlacementNormal.cleanLayer = function ($layer) {
        var devices = [
            'desktopPortrait',
            'desktopLandscape',
            'tabletPortrait',
            'tabletLandscape',
            'mobilePortrait',
            'mobileLandscape'
        ];

        $layer
            .attr('data-has-maxwidth', '0')
            .removeAttr('data-cssselfalign')
            .css({
                position: '',
                margin: '',
                height: '',
                maxWidth: ''
            });

        var properties = ['margin', 'height', 'maxwidth', 'selfalign'];

        var data = {};
        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i].toLowerCase();
            data[prop] = $layer.data(prop);
            $layer.removeAttr(prop);
            $layer.removeData(prop);
            for (var j = 0; j < devices.length; j++) {
                var device = devices[j].toLowerCase();
                data[prop] = $layer.data(device + prop);
                $layer.removeAttr(device + prop);
                $layer.removeData(device + prop);
            }
        }
        return data;
    };

    PlacementNormal.prototype.deActivated = function (newMode) {
        this.layer.$.off('.placementnormal');
        this.$layer.nUISpacing('destroy');
        this.$layer.nUINormalSizing('destroy');

        this.layer.layer.attr('data-has-maxwidth', '0');
        this.layer.layer.removeAttr('data-cssselfalign');

        var properties = ['margin', 'height', 'maxwidth', 'selfalign'],
            historicalData = this.layer.getPropertiesData(properties);
        this.layer.removeProperties(properties);


        this.layer.layer.css({
            position: '',
            margin: '',
            height: '',
            maxWidth: ''
        });
        return historicalData;
    };

    PlacementNormal.prototype._renderModeProperties = function (isReset) {

        this._syncmargin();
        this._syncheight();
        this._syncmaxwidth();
        this._syncselfalign();
    };

    PlacementNormal.prototype._syncmargin = function () {
        var margin = this.layer.getProperty('margin').split('|*|'),
            unit = margin.pop(),
            baseSize = this.layer.baseSize;

        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < margin.length; i++) {
                margin[i] = parseInt(margin[i]) / baseSize;
            }
        }

        var margin = margin.join(unit + ' ') + unit;
        this.layer.layer.css('margin', margin);
        this.layer.update();

        this.$layer.nUISpacing('option', 'current', margin);
    };

    PlacementNormal.prototype.startUISpacing = function () {
        this.$layer.nUISpacing({
            mode: 'margin',
            sync: {
                n: 'margin-top',
                e: 'margin-right',
                s: 'margin-bottom',
                w: 'margin-left',
            },
            handles: 'n, s, e, w',
            start: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().show('Spacing');
            }, this),
            spacing: $.proxy(function (e, ui) {
                var html = '';
                for (var k in ui.changed) {
                    html += 'Margin ' + k + ': ' + ui.changed[k] + 'px<br>';
                }

                N2Classes.PositionDisplay.get().update(e, 'Spacing', html);
            }, this),
            stop: $.proxy(this.onSpacingStop, this),
        });
    };

    PlacementNormal.prototype.onSpacingStop = function (event, ui) {
        N2Classes.PositionDisplay.get().hide('Spacing');
        var margin = this.layer.getProperty('margin').split('|*|'),
            ratioH = 1,
            ratioV = 1;
        if (margin[margin.length - 1] == 'px+' && Math.abs(parseFloat(this.$layer.css('fontSize')) - this.layer.baseSize) > 1) {
            ratioH = this.fragmentEditor.getResponsiveRatioHorizontal();
            ratioV = this.fragmentEditor.getResponsiveRatioVertical();
        }

        for (var k in ui.changed) {
            var value = ui.changed[k];
            switch (k) {
                case 'top':
                    margin[0] = Math.round(value / ratioV);
                    break;
                case 'right':
                    margin[1] = Math.round(value / ratioH);
                    break;
                case 'bottom':
                    margin[2] = Math.round(value / ratioV);
                    break;
                case 'left':
                    margin[3] = Math.round(value / ratioH);
                    break;
            }
        }
        this.layer.setProperty('margin', margin.join('|*|'));
        $('#layernormal-margin').data('field').insideChange(margin.join('|*|'));
    };

    PlacementNormal.prototype.startUISizing = function () {
        var needSize = false;
        if (this.layer.item && this.layer.item.needSize) {
            needSize = true;
        }
        this.$layer.nUINormalSizing({
            height: needSize,
            syncWidth: true,
            start: $.proxy(function (e, prop) {
                N2Classes.PositionDisplay.get().show('NormalSizing');
                if (prop === 'maxwidth') {
                    this.layer.layer.attr('data-has-maxwidth', '1');
                }
            }, this),
            resizeMaxWidth: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().update(e, 'NormalSizing', 'Max-width: ' + (ui.value == 0 ? 'none' : (ui.value + 'px')));

            }, this),
            stopMaxWidth: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().hide('NormalSizing');
                this.layer.setProperty('maxwidth', ui.value);
            }, this),
            resizeHeight: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().update(e, 'NormalSizing', 'Height: ' + ui.value + 'px');

            }, this),
            stopHeight: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().hide('NormalSizing');
                var ratio = 1;
                if (parseInt(this.$layer.css('fontSize')) != this.layer.baseSize) {
                    ratio = this.fragmentEditor.getResponsiveRatioHorizontal();
                }
                var value = Math.round(value / ratio);

                this.layer.setProperty('height', ui.value);
            }, this)
        });
    };

    PlacementNormal.prototype._syncheight = function () {
        var height = parseInt(this.layer.getProperty('height'));

        if (height > 0) {
            var unit = 'px',
                baseSize = this.layer.baseSize;
            if (baseSize > 0) {
                unit = 'em';
                height = parseInt(height) / baseSize;
            }

            this.layer.layer.css('height', height + unit);
        } else {

            this.layer.layer.css('height', '');
        }

        this.layer.update();
    };

    PlacementNormal.prototype._syncmaxwidth = function () {
        var value = parseInt(this.layer.getProperty('maxwidth'));
        if (value <= 0 || isNaN(value)) {
            this.layer.layer.css('maxWidth', '')
                .attr('data-has-maxwidth', '0');
        } else {
            this.layer.layer.css('maxWidth', value + 'px')
                .attr('data-has-maxwidth', '1');
        }

        this.layer.update();
    };

    PlacementNormal.prototype._syncselfalign = function () {
        this.layer.layer.attr('data-cssselfalign', this.layer.getProperty('selfalign'));
    };

    PlacementNormal.prototype.sync = function () {
        this._syncmargin();
        this._syncheight();
        this._syncmaxwidth();
    };

    return PlacementNormal;
});
N2D('Placement', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param layer
     * @constructor
     */
    function Placement(layer) {
        this.layer = layer;
        this.fragmentEditor = layer.fragmentEditor;
        this.modes = {};
        this.current = null;
        this.isTransferHandled = false;

        this.updatePositionThrottled = NextendDeBounce(this.updatePosition, 200);
    }

    Placement.prototype.allow = function (mode) {
        switch (mode) {
            case 'absolute':
                this.modes.absolute = new N2Classes.PlacementAbsolute(this, this.layer, this.fragmentEditor);
                break;
            case 'normal':
                this.modes.normal = new N2Classes.PlacementNormal(this, this.layer, this.fragmentEditor);
                break;
            case 'group':
                this.modes.absolute = new N2Classes.PlacementGroup(this, this.layer, this.fragmentEditor);
                break;
            case 'content':
                this.modes.absolute = new N2Classes.PlacementContent(this, this.layer, this.fragmentEditor);
                break;
            case 'default':
                this.modes['default'] = new N2Classes.PlacementDefault(this, this.layer, this.fragmentEditor);
                break;
        }
    };

    Placement.prototype.start = function () {
        for (var k in this.modes) {
            this.modes[k].start();
        }
    };

    Placement.prototype.setMode = function (mode, properties) {
        var historicalData = false;
        properties = properties || {};
        if (typeof this.modes[mode] !== 'undefined') {
            if (this.current != this.modes[mode]) {
                var lastType;
                if (this.current) {

                    this.modes[mode].preActivation(this.current);
                    lastType = this.current.type;
                    historicalData = this.current.deActivated(this.modes[mode]);
                }
                this.current = this.modes[mode];

                this.layer.layer.attr('data-pm', this.current.type);
                this.current.activated(properties);

                this.layer.$.triggerHandler('placementChanged', [this.current.type, lastType]);
            }
        } else {
            throw new Exception('Layer placement(' + mode + ') not allowed for the container', this.layer);
        }
        return historicalData;
    };

    Placement.prototype.doAction = function (action) {
        try {
            return this.current[action].apply(this.current, Array.prototype.slice.call(arguments, 1));
        } catch (e) {

        }
    };

    Placement.prototype.getType = function () {
        return this.current.type;
    };

    Placement.prototype.onResize = function (isForced) {
        if (typeof this.current.onResize == 'function') {
            this.current.onResize(isForced);
        }
    };

    Placement.prototype.updatePosition = function () {
        this.current.updatePosition();
    };

    Placement.prototype.getIndex = function () {
        return this.current.getIndex();
    };

    Placement.prototype.renderIndex = function (index) {
        return this.current.renderIndex(index);
    };

    Placement.prototype.doLinearResize = function (ratios) {
        this.current.doLinearResize(ratios);
    };

    Placement.prototype.sync = function () {
        this.current.sync();
    };

    Placement.prototype.renderModeProperties = function (isReset) {

        var fontSize = this.layer.getProperty('fontsize');
        this.layer.adjustFontSize(this.layer.getProperty('adaptivefont'), fontSize, false);

        this.current._renderModeProperties(isReset);
    };

    Placement.prototype.delete = function () {
        this.current.delete();
    };

    return Placement;
});
N2D('PlacementAbstract', ['Placement'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param placement
     * @param {N2Classes.ComponentAbstract} layer
     * @param fragmentEditor
     * @constructor
     */
    function PlacementAbstract(placement, layer, fragmentEditor) {
        this.placement = placement;
        /**
         * @type {N2Classes.ComponentAbstract}
         */
        this.layer = layer;
        this.fragmentEditor = fragmentEditor;
    }

    PlacementAbstract.prototype.start = function () {

    };

    PlacementAbstract.prototype.preActivation = function (lastPlacement) {

    };

    PlacementAbstract.prototype.activated = function () {

    };

    PlacementAbstract.prototype.deActivated = function (newMode) {

        return false;
    };

    PlacementAbstract.prototype.updatePosition = function () {
        this.layer.group.update();
    };

    PlacementAbstract.prototype._renderModeProperties = function (isReset) {

    };

    PlacementAbstract.prototype._hide = function () {
    };

    PlacementAbstract.prototype._show = function () {
    };

    PlacementAbstract.prototype.snap = function () {
        return false;
    };

    PlacementAbstract.prototype.getIndex = function () {
        return this.layer.layer.index();
    };

    PlacementAbstract.prototype.renderIndex = function (index) {

    };

    PlacementAbstract.prototype.doLinearResize = function (ratios) {
    };

    PlacementAbstract.prototype.sync = function () {

    };

    PlacementAbstract.prototype.delete = function () {
    };


    PlacementAbstract.prototype.triggerLayerResized = function (isThrottled, ratios) {

    };

    PlacementAbstract.prototype.changeStatus = function (oldStatus, newStatus) {

    };

    return PlacementAbstract;
});
N2D('Item', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     * @augments N2Classes.Historical
     *
     * @constructor
     */
    function Item($item, layer, itemEditor) {
        if (this.type === undefined) {
            this.type = $item.data('item');
        }

        this.needSize = this.constructor.needSize;

        this.fragmentEditor = itemEditor.fragmentEditor;
        /**
         * @type {N2Classes.Generator}
         */
        this.generator = this.fragmentEditor.editor.generator;

        this.self = this;
        this.$item = $item;
        this.layer = layer;
        this.itemEditor = itemEditor;

        this.fonts = [];
        this.styles = [];

        this.needFill = [];

        this.values = this.$item.data('itemvalues');
        if (typeof this.values !== 'object') {
            this.values = $.parseJSON(this.values);
        }

        this.pre = 'div#' + this.fragmentEditor.editor.frontend.elementID + ' ';
        this.defaultValues = itemEditor.getItemForm(this.type).values;

        this.added();

        this.$item.data('item', this);

        this.$item.appendTo(this.layer.getContent());

        this.layer.item = this;

        if (this.$item.children().length === 0) {
            // It's create, so render the item
            this.layer.readyDeferred.done($.proxy(this.reRender, this));
        }


        $('<div/>')
            .addClass('n2-ss-item-overlay')
            .css('zIndex', 89)
            .appendTo(this.$item);

        this.$item.find('a').on('click', function (e) {
            e.preventDefault();
        });


        $(window).trigger('ItemCreated');
    }

    Item.needSize = false;

    N2Classes.Historical(Item);

    Item.prototype.changeValue = function (property, value) {
        if (this == this.itemEditor.activeItem) {
            $('#item_' + this.type + property).data('field')
                .insideChange(value);
        } else {
            this.values[property] = value;
        }
    };

    Item.prototype.activate = function (e, context, force) {
        if (this.itemEditor.setActiveItem(this, context, force)) {
            nextend.basicCSS.activate('ss3item' + this.type, this.values, {
                font: this.fonts,
                style: this.styles
            });
            this.itemEditor.lastValues[this.type] = this.values;
        }
    };

    Item.prototype.deActivate = function () {
        nextend.basicCSS.deActivate();
    };

    Item.prototype.render = function (data, originalData) {
        this.layer.layer.triggerHandler('itemRender');
        this.$item.html('');

        this.parseAll(data);
        this._render(data);

        // These will be available on the backend render
        this.itemEditor.lastValues[this.type] = this.values = originalData;

        $('<div/>')
            .addClass('n2-ss-item-overlay')
            .css('zIndex', 89)
            .appendTo(this.$item);

        var layerName = this.getName(data);
        if (layerName === false || layerName == '' || layerName == 'Layer') {
            layerName = this.type;
        } else {
            layerName = layerName.replace(/[<>]/gi, '');
        }
        this.layer.rename(layerName, false);

        this.layer.update();

        this.$item.find('a').on('click', function (e) {
            e.preventDefault();
        });
    };

    Item.prototype._render = function (data) {
    };

    Item.prototype.reRender = function (newData) {

        this.values = $.extend({}, this.getDefault(), this.values, newData);

        this.render($.extend({}, this.values), this.values);
    };

    Item.prototype.delete = function () {
        this.$item.trigger('mouseleave');
        this.$item.remove();

        if (this.itemEditor.activeItem == this) {
            this.itemEditor.activeItem = null;
        }
    };

    Item.prototype.getHTML = function (base64) {
        var item = '';
        if (base64) {

            item = '[' + this.type + ' values="' + N2Classes.Base64.encode(JSON.stringify(this.values)) + '"]';
        } else {
            item = $('<div class="n2-ss-item n2-ss-item-' + this.type + '"></div>')
                .attr('data-item', this.type)
                .attr('data-itemvalues', JSON.stringify(this.values));
        }
        return item;
    };

    Item.prototype.getData = function () {
        return {
            type: this.type,
            values: this.values
        };
    };


    Item.prototype.getDefault = function () {
        return {};
    };

    Item.prototype.added = function () {

    };

    Item.prototype.addedFont = function (mode, name) {
        var $input = $('#item_' + this.type + name);
        if ($input.length) {
            this.fonts.push({
                mode: mode,
                name: name,
                field: $input.data('field'),
                def: this.defaultValues[name]
            });
            $.when(nextend.fontManager.addVisualUsage(mode, this.values[name], this.pre))
                .done($.proxy(function (existsFont) {
                    if (!existsFont) {
                        this.changeValue(name, '');
                    }
                }, this));
        }
    };

    Item.prototype.addedStyle = function (mode, name) {
        var $input = $('#item_' + this.type + name);
        if ($input.length) {
            this.styles.push({
                mode: mode,
                name: name,
                field: $input.data('field'),
                def: this.defaultValues[name]
            });

            $.when(nextend.styleManager.addVisualUsage(mode, this.values[name], this.pre))
                .done($.proxy(function (existsStyle) {
                    if (!existsStyle) {
                        this.changeValue(name, '');
                    }
                }, this));
        }

    };

    Item.prototype.parseAll = function (data) {

        for (var i = 0; i < this.fonts.length; i++) {
            data[this.fonts[i].name + 'class'] = nextend.fontManager.getClass(data[this.fonts[i].name], this.fonts[i].mode) + ' ';
        }

        for (var i = 0; i < this.styles.length; i++) {
            data[this.styles[i].name + 'class'] = nextend.styleManager.getClass(data[this.styles[i].name], this.styles[i].mode) + ' ';
        }

        for (var i = 0; i < this.needFill.length; i++) {
            if (typeof data[this.needFill[i]] !== 'undefined') {
                data[this.needFill[i]] = this.generator.fill(data[this.needFill[i]] + '');
            }
        }
    };

    Item.prototype.getName = function (data) {
        return 'Layer';
    };

    Item.prototype.resizeLayerToImage = function (image) {
        var layer = this.layer,
            $image = $("<img/>")
                .attr("src", image)
                .on('load', $.proxy(function () {
                    var width = $image[0].width,
                        height = $image[0].height;

                    if (width > 0 && height > 0) {
                        var $containerElement = this.fragmentEditor.editor.getMainContainerElement(),
                            maxWidth = $containerElement.width(),
                            maxHeight = $containerElement.height();

                        if (width > maxWidth) {
                            height = height * maxWidth / width;
                            width = maxWidth;
                        }
                        if (height > maxHeight) {
                            width = width * maxHeight / height;
                            //height = maxHeight;
                        }
                        N2Classes.History.get().off();
                        layer.setProperty('width', width);
                        layer.setProperty('height', 'auto');
                        N2Classes.History.get().on();
                    }
                }, this));
    };

    Item.prototype.fitLayer = function (item) {
        return false;
    };

    return Item;
});
N2D('ItemManager', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FragmentEditor} fragmentEditor
     * @param options
     * @constructor
     */
    function ItemManager(fragmentEditor, options) {
        this.suppressChange = false;

        this.activeItemOriginalData = null;

        this.fragmentEditor = fragmentEditor;

        this.lastValues = {};

        this.startItems();

        this.forms = {};
        this.activeForm = false;

        if (!options.isUploadDisabled) {
            var dropArea = $('#n2-ss-slide-canvas-container-inner');
            dropArea.nUIFileUpload({
                url: options.uploadUrl,
                pasteZone: false,
                dropZone: dropArea,
                dataType: 'json',
                paramName: 'image',
                add: function (e, data) {
                    data.formData = {path: '/' + options.uploadDir};
                    data.submit();
                },
                done: $.proxy(function (e, data) {
                    var response = data.result;
                    if (response.data && response.data.name) {
                        var item = this.createLayerItem(false, {item: 'image'});
                        item.reRender({
                            image: response.data.url
                        });
                        item.activate(null, null, true);
                    } else {
                        N2Classes.AjaxHelper.notification(response);
                    }

                }, this),
                fail: function (e, data) {
                    N2Classes.AjaxHelper.notification(data.jqXHR.responseJSON);
                },

                start: function () {
                    N2Classes.AjaxHelper.startLoading();
                },

                stop: function () {
                    setTimeout(function () {
                        N2Classes.AjaxHelper.stopLoading();
                    }, 100);
                }
            });
        }
    }

    ItemManager.prototype.setActiveItem = function (item, context, force) {
        // Must be called through N2Classes.Item.activate();
        if (item != this.activeItem || force) {
            this.activeItemOriginalData = null;

            var type = item.type;

            if (this.activeForm) {
                this.activeForm.form.css('display', 'none');
            }

            if (this.activeItem) {
                this.activeItem.deActivate();
            }

            this.activeForm = this.getItemForm(type);

            var values = $.extend({}, this.activeForm.values, item.values);

            this.activeItem = item;

            this.suppressChange = true;

            for (var key in values) {
                var field = $('#item_' + type + key).data('field');
                if (field) {
                    field.insideChange(values[key]);
                }
            }

            this.suppressChange = false;

            this.activeForm.form.css('display', 'block');
            this.focusFirst(context);
            return true;
        }
        //this.focusFirst(context);
        return false;
    };

    ItemManager.prototype.focusFirst = function (context) {
        var field = this.activeForm.fields.eq(0).data('field');
        if (this.fragmentEditor.editor.generator.isDynamicSlide() && field.connectedField && field.connectedField instanceof N2Classes.FormElementImage) {

        } else {
            field.focus(typeof context !== 'undefined' && context);
        }
    };

    ItemManager.prototype.startItems = function () {

        $('.n2-ss-core-item').nUICanvasItem({
            canvasUIManager: this.fragmentEditor.mainContainer.canvasUIManager,
            distance: 5,
            $layer: function () {
                return this.element.clone();
            },
            onCreate: $.proxy(function (e, itemOptions, targetContainer, targetIndex) {
                switch (targetContainer.layer.type) {
                    case 'content':
                    case 'col':
                        N2Classes.History.get().startBatch();
                        var item = this.createLayerItem(targetContainer.layer, itemOptions.$layer.data(), 'click');
                        N2Classes.History.get().addControl('skipForwardUndos');

                        targetContainer.layer.container.insertLayerAt(item.layer, targetIndex);
                        item.layer.changeGroup(false, targetContainer.layer);

                        N2Classes.History.get().endBatch();

                        break;

                    case 'row':
                        var col = targetContainer.layer.createCol();
                        targetContainer.layer.moveCol(col.getIndex(), targetIndex);

                        N2Classes.History.get().startBatch();
                        var item = this.createLayerItem(col, itemOptions.$layer.data(), 'click');
                        N2Classes.History.get().addControl('skipForwardUndos');

                        col.container.insertLayerAt(item.layer, 0);
                        item.layer.changeGroup(false, col);

                        N2Classes.History.get().endBatch();

                        break;
                    default:
                        var mainContainerOffset = this.fragmentEditor.mainContainer.layer.offset(),
                            item = this.createLayerItem(this.fragmentEditor.mainContainer, itemOptions.$layer.data(), 'click');
                        item.layer.placement.current.setPosition(e.pageX - mainContainerOffset.left - 20, e.pageY - mainContainerOffset.top - 20);

                        break;
                }
            }, this),
            start: function () {
                $('#n2-ss-add-sidebar').removeClass('n2-active');
            }
        }).on('click', $.proxy(function (e) {
            this.createLayerItem(this.fragmentEditor.mainContainer.getActiveGroup(), $(e.currentTarget).data(), 'click');
        }, this));


        $('[data-itemshortcut]').on({
            click: $.proxy(function (e) {
                e.preventDefault();
                $('.n2-ss-core-item[data-item="' + $(e.currentTarget).data('itemshortcut') + '"]').trigger('click');
            }, this),
            mousedown: $.proxy(function (e) {
                $('.n2-ss-core-item[data-item="' + $(e.currentTarget).data('itemshortcut') + '"]').trigger(e);
            }, this)
        });

        $('[data-structureshortcut]').on({
            click: $.proxy(function (e) {
                e.preventDefault();
                $('.n2-ss-add-layer-button').trigger('click');
                $('#n2-ss-layers-switcher > .n2-labels .n2-td').eq(1).trigger('click');
            }, this),
            mousedown: $.proxy(function (e) {
                $('.n2-ss-core-item[data-sstype="' + $(e.currentTarget).data('structureshortcut') + '"]').trigger(e);
            }, this)
        });
    };

    ItemManager.prototype.createLayerItem = function (group, data, interaction, props) {
        group = group || this.fragmentEditor.mainContainer.getActiveGroup();
        var type = data.item;
        if (type === 'structure') {
            var layer = new N2Classes.Row(this.fragmentEditor, group, {});
            layer.create(data.sstype);
            layer.hightlightStructure();

            return {
                layer: layer
            };
        } else {
            var itemData = this.getItemForm(type),
                extraValues = {};
            switch (type) {
                case 'image':
                    if (group.container.allowedPlacementMode === 'absolute') {
                        extraValues.size = '100%|*|auto';
                    } else {
                        extraValues.size = 'auto|*|auto';
                    }
                    break;
            }

            var $item = $('<div></div>').attr('data-item', type)
                    .data('itemvalues', $.extend(true, {}, itemData.values, this.getLastValues(type), extraValues))
                    .addClass('n2-ss-item n2-ss-item-' + type),
                layer = this._createLayer($item, group, $.extend($('.n2-ss-core-item-' + type).data('layerproperties'), props));

            if (interaction && interaction == "click") {
                setTimeout(function () {
                    layer.layer.trigger('mousedown', ['create']).trigger('mouseup', ['create']).trigger('click', ['create']);
                }, 500);
            } else {
                layer.activate();
            }

            this.fragmentEditor.layerWindow.switchTab('item');

            N2Classes.History.get().addSimple(this, this.historyDelete, this.historyCreate, [group, layer, data]);

            return layer.item;
        }
    };

    ItemManager.prototype.getLastValues = function (type) {
        if (this.lastValues[type] !== undefined) {
            return this.lastValues[type];
        }
        return {};
    };

    ItemManager.prototype.getItemClass = function (type) {
        var itemClass = 'Item' + N2Classes.StringHelper.capitalize(type);
        if (typeof N2Classes[itemClass] === 'undefined') {
            return 'Item';
        }
        return itemClass;
    };

    ItemManager.prototype._createLayer = function ($item, group, properties) {
        var defaultAlign = this.fragmentEditor.layerOptions.layerFeatures.layerDefault;
        for (var k in defaultAlign) {
            if (defaultAlign[k] !== null) {
                properties[k] = defaultAlign[k];
            }
        }

        var newLayer = new N2Classes.Layer(this.fragmentEditor, group, properties);

        newLayer.create(function (layer) {
            return layer._createLayer()
                .append($item);
        });

        return newLayer;
    };

    /**
     * Initialize an item type and subscribe the field changes on that type.
     * We use event normalization to prevent rendering.
     * @param type
     * @private
     */
    ItemManager.prototype.getItemForm = function (type) {
        if (this.forms[type] === undefined) {
            var form = $('#smartslider-slide-toolbox-item-type-' + type),
                formData = {
                    form: form,
                    values: form.data('itemvalues'),
                    fields: form.find('[name^="item_' + type + '"]'),
                    fieldNameRegexp: new RegExp('item_' + type + "\\[(.*?)\\]", "")
                };
            formData.fields.on({
                nextendChange: $.proxy(this.updateCurrentItem, this),
                keydown: $.proxy(this.updateCurrentItemDeBounced, this)
            });

            this.forms[type] = formData;
        }
        return this.forms[type];
    };

    /**
     * This function renders the current item with the current values of the related form field.
     */
    ItemManager.prototype.updateCurrentItem = function (e) {
        if (!this.suppressChange) {
            if (this.activeItemOriginalData === null) {
                this.activeItemOriginalData = $.extend({}, this.activeItem.values);
            }
            var data = {},
                originalData = {};
            // Get the current values of the fields
            // Run through the related item filter
            this.activeForm.fields.each($.proxy(function (i, field) {
                var field = $(field),
                    name = field.attr('name').match(this.activeForm.fieldNameRegexp)[1];

                originalData[name] = data[name] = field.val();

            }, this));

            if (e && e.type == 'nextendChange') {
                var task = N2Classes.History.get().addValue(this, this.historyUpdateCurrentItem, [this.activeItem]);
                if (task) {
                    task.setValues(this.activeItemOriginalData, $.extend({}, originalData));
                }

                this.activeItemOriginalData = null;
            }

            this.activeItem.render($.extend({}, this.activeItem.getDefault(), data), originalData);
        }
    };

    ItemManager.prototype.historyUpdateCurrentItem = function (values, historyActiveItem) {
        var maybeOldActiveItem = historyActiveItem.getSelf();
        maybeOldActiveItem.reRender($.extend(true, {}, values));
        maybeOldActiveItem.values = values;
        if (this.activeItem == maybeOldActiveItem) {
            maybeOldActiveItem.activate(null, null, true);
        }
    };

    ItemManager.prototype.updateCurrentItemDeBounced = NextendDeBounce(function (e) {
        this.updateCurrentItem(e);
    }, 100);

    ItemManager.prototype.historyDelete = function (historyGroup, historyLayer) {
        historyLayer.getSelf().delete();
    };

    ItemManager.prototype.historyCreate = function (historyGroup, historyLayer, data) {
        var item = this.createLayerItem(historyGroup.getSelf(), data);
        historyLayer.setSelf(item.layer);
    };

    ItemManager.prototype.historyCreateStructure = function (historyGroup, historyLayer, data) {
        var obj = this.createLayerItem(historyGroup.getSelf(), data);
        historyLayer.setSelf(obj.layer);
    };

    ItemManager.prototype.getSelf = function () {
        return this;
    };

    return ItemManager;
});
N2D('PluginActivatable', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function PluginActivatable() {
        this.isActive = false;
        this.preventActivation = false;
    }

    PluginActivatable.prototype.activate = function (e, context, preventExitFromSelection) {
        if (this.preventActivation) return false;
        if (document.activeElement) {
            document.activeElement.blur();
        }
        if (e && (e.ctrlKey || e.metaKey) && this.fragmentEditor.mainContainer.getSelectedLayer()) {
            return !this.select();
        } else {
            if (e && e.which == 3 && this.fragmentEditor.selectMode) {
                return false;
            }

            if (!preventExitFromSelection) {
                this.fragmentEditor.exitSelectMode();
            }
        }

        if (e) {
            this.positionSidebar();
        }


        // Set the layer active if it is not active currently
        if (this.fragmentEditor.mainContainer.getSelectedLayer() !== this) {
            this.layerRow.addClass('n2-active');
            this.layer.addClass('n2-active');
            this.layer.triggerHandler('n2-ss-activate');
            this.fragmentEditor.changeActiveLayer(this, preventExitFromSelection);
            nextend.activeLayer = this.layer;


            this.fragmentEditor.ui.onActivateLayer(this);
        }
        this.isActive = true;
        return true;
    };

    PluginActivatable.prototype.deActivate = function () {
        this.isActive = false;
        if (this.layer === undefined) {
            console.error();
        }
        this.layer.removeClass('n2-active');
        this.layerRow.removeClass('n2-active');
        this.layer.triggerHandler('n2-ss-deactivate');
    };

    return PluginActivatable;
});
N2D('PluginEditableName', function ($, undefined) {
    "use strict";
    var dblClickInterval = 300,
        timeout = null;

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function PluginEditableName() {
    }

    PluginEditableName.prototype.addProperties = function ($layer) {
        this.createProperty('name', this.label, $layer);
        this.createProperty('nameSynced', 1, $layer);
    };

    PluginEditableName.prototype.makeNameEditable = function () {
        this.layerTitleSpan.on({
            mouseup: $.proxy(function (e) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                    this.editName();
                } else {
                    this.activate(e);
                    timeout = setTimeout($.proxy(function () {
                        timeout = null;
                    }, this), dblClickInterval);
                }
            }, this)
        })
    };

    PluginEditableName.prototype.editName = function () {
        var input = new N2Classes.InlineField();

        input.$input.on({
            valueChanged: $.proxy(function (e, newName) {
                this.rename(newName, true);
                this.layerTitleSpan.css('display', 'inline');
            }, this),
            cancel: $.proxy(function () {
                this.layerTitleSpan.css('display', 'inline');
            }, this)
        });

        this.layerTitleSpan.css('display', 'none');
        input.injectNode(this.layerTitle, this.property.name);

    };

    PluginEditableName.prototype.rename = function (newName, force) {

        if (this.property.nameSynced || force) {

            if (force) {
                this.property.nameSynced = 0;
            }

            if (newName == '') {
                if (force) {
                    this.property.nameSynced = 1;
                    this.item.reRender();
                    return false;
                }
                newName = 'Layer #' + (this.group.getLayerCount() + 1);
            }
            newName = newName.substr(0, 35);
            if (this.property.name != newName) {
                this.property.name = newName;
                this.layerTitleSpan.html(newName);

                this.$.trigger('layerRenamed', newName);
            }
        }
    };

    return PluginEditableName;
});
N2D('PluginShowOn', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function PluginShowOn() {

    }

    PluginShowOn.prototype.addProperties = function ($layer) {
        this.showsOnCurrent = true;
        this.createProperty('generatorvisible', '', $layer);
        this.createProperty('desktopPortrait', 1, $layer);
        this.createProperty('desktopLandscape', 1, $layer);
        this.createProperty('tabletPortrait', 1, $layer);
        this.createProperty('tabletLandscape', 1, $layer);
        this.createProperty('mobilePortrait', 1, $layer);
        this.createProperty('mobileLandscape', 1, $layer);
    };

    PluginShowOn.prototype._hide = function () {
        this.layer.css('display', 'none');
        this.showsOnCurrent = false;
        this.update();
    };

    PluginShowOn.prototype._show = function () {
        if (parseInt(this.property[this.fragmentEditor.getMode()])) {
            this.layer.css('display', '');
            this.showsOnCurrent = true;
        }
        this.update();
    };


    PluginShowOn.prototype._syncdesktopPortrait = function () {
        var value = this.getProperty('desktopPortrait');
        this.__syncShowOnDevice('desktopPortrait', value);
    };

    PluginShowOn.prototype._syncdesktopLandscape = function () {
        var value = this.getProperty('desktopLandscape');
        this.__syncShowOnDevice('desktopLandscape', value);
    };

    PluginShowOn.prototype._synctabletPortrait = function () {
        var value = this.getProperty('tabletPortrait');
        this.__syncShowOnDevice('tabletPortrait', value);
    };

    PluginShowOn.prototype._synctabletLandscape = function () {
        var value = this.getProperty('tabletLandscape');
        this.__syncShowOnDevice('tabletLandscape', value);
    };

    PluginShowOn.prototype._syncmobilePortrait = function () {
        var value = this.getProperty('mobilePortrait');
        this.__syncShowOnDevice('mobilePortrait', value);
    };

    PluginShowOn.prototype._syncmobileLandscape = function () {
        var value = this.getProperty('mobileLandscape');
        this.__syncShowOnDevice('mobileLandscape', value);
    };

    PluginShowOn.prototype.__syncShowOnDevice = function (mode, value) {
        if (this.getMode() == mode) {
            var value = parseInt(value);
            if (value) {
                this._show();
            } else {
                this._hide();
            }
            this.layer.triggerHandler('LayerShowChange', [mode, value]);
            this.placement.doAction('triggerLayerResized');
        }
    };

    return PluginShowOn;
});
N2D('Col', ['ContentAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param fragmentEditor
     * @param group
     * @param properties
     * @constructor

     * @augments ContentAbstract
     */
    function Col(fragmentEditor, group, properties) {
        this.label = 'Col';
        this.type = 'col';

        this.innerContainer = '> .n2-ss-layer-col';

        this.localStyle = [
            {
                group: 'normal', selector: '-inner', css: {
                    transition: 'transition:all .3s;transition-property:border,background-image,background-color,border-radius,box-shadow;'
                }
            },
            {group: 'hover', selector: '-inner:HOVER', css: {}}
        ];

        N2Classes.ContentAbstract.prototype.constructor.call(this, fragmentEditor, group, properties);

        this.placement.allow('default');
    }

    Col.prototype = Object.create(N2Classes.ContentAbstract.prototype);
    Col.prototype.constructor = Col;

    Col.prototype._createLayer = function () {
        return $('<div class="n2-ss-layer"><div class="n2-ss-layer-content n2-ss-layer-col"></div></div>')
            .attr('data-sstype', this.type);
    };

    Col.prototype.addProperties = function ($layer) {

        N2Classes.ContentAbstract.prototype.addProperties.call(this, $layer);

        this.createProperty('colwidth', '1', $layer);
        this.createProperty('href', '', $layer);
        this.createProperty('href-target', '_self', $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('borderradius', 0, {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('boxshadow', '0|*|0|*|0|*|0|*|00000080', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('borderwidth', '1|*|1|*|1|*|1', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('borderstyle', 'none', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('bordercolor', 'ffffffff', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createDeviceProperty('order', {desktopPortrait: 0}, $layer);
    };

    Col.prototype.create = function () {
        N2Classes.ContentAbstract.prototype.create.call(this);

        this._syncorder();

        this._syncborder();

        this._syncborderradius();
        this._syncboxshadow();

        this._onReady();
    };

    Col.prototype.load = function ($layer, isEditorStart) {

        N2Classes.ContentAbstract.prototype.load.call(this, $layer, isEditorStart);

        this._syncorder();

        this._syncborder();
        this._syncborderradius();
        this._syncboxshadow();

        this._onReady();

        var storedRowColumnWidths = $layer.data('rowcolumns') + ''; //jQuery can convert it to number
        if (storedRowColumnWidths != undefined) {
            if (this.group.readyDeferred.state() == 'resolved') {
                var widths = storedRowColumnWidths.split('+');
                for (var i = 0; i < widths.length; i++) {
                    widths[i] = new Fraction(widths[i]);
                }
                this.group.setColsWidth(widths);
            }
        }
    };

    Col.prototype.createRow = function () {
        this.$content = this.layer.find('.n2-ss-layer-content:first');

        this.container = new N2Classes.LayerContainer(this, $('<ul class="n2-list n2-h4 n2-list-orderable" />'), 'normal', '> .n2-ss-layer', ['row', 'layer']);
        this.container.setLayerContainerElement(this.$content);

        this.addClassElement(this.layer);
        this.addClassElement(this.$content, '-inner');

        var remove = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Delete layer') + '"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>').on('click', $.proxy(this.delete, this)),
            duplicate = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Duplicate layer') + '"><i class="n2-i n2-i-duplicate n2-i-grey-opacity"></i></div>').on('click', $.proxy(function () {
                this.duplicate(true, false)
            }, this));


        this._createLayerListRow([
            $('<div class="n2-actions"></div>').append(duplicate).append(remove)
        ]).addClass('n2-ss-layer-content-row');


        this.openerElement = $('<a href="#" class="n2-ss-layer-icon n2-button n2-button-icon n2-button-m"><i class="n2-i n2-i-col"></i></a>').insertBefore(this.layerTitleSpan)
            .on('click', $.proxy(this.switchOpened, this));

        this.container.$ul.appendTo(this.layerRow);

        this.readyDeferred.done($.proxy(this._syncopened, this));
    };

    Col.prototype._start = function (isCreate) {

        N2Classes.ContentAbstract.prototype._start.call(this, isCreate);

        if (isCreate) {
            this.highlight(2000);
        }
    };

    Col.prototype.getRealOrder = function () {
        var order = this.getProperty('order');
        if (order == 0) {
            return 10;
        }
        return order;
    };

    Col.prototype._syncorder = function () {
        var order = this.getProperty('order');

        if (order == 0) {
            this.layer.css('order', '');
        } else {
            this.layer.css('order', order * 2);
        }

        this.group.refreshUI();
    };

    Col.prototype._synccolwidth = function () {
        this.widthPercentage = ((new Fraction(this.getProperty('colwidth'))).valueOf() * 100);
        //this.layer.css('width', this.widthPercentage + '%');
        this.group.refreshUI();
    };

    Col.prototype.getWidthPercentage = function () {
        return this.widthPercentage;
    };

    Col.prototype._synchref =
        Col.prototype['_synchref-target'] = function () {
        };

    Col.prototype._syncborderradius =
        Col.prototype['_syncborderradius-hover'] = function () {
            var borderRadius = this.getProperty('borderradius');
            if (borderRadius > 0) {
                this.addLocalStyle('normal', 'borderradius', 'border-radius:' + borderRadius + 'px;');
            }

            var borderRadiusHover = this.getProperty('borderradius-hover');
            if (borderRadiusHover && borderRadiusHover != borderRadius) {
                this.addLocalStyle('hover', 'borderradius', 'border-radius:' + borderRadiusHover + 'px;');
            }
        };

    Col.prototype._syncborderwidth =
        Col.prototype._syncbordercolor =
            Col.prototype._syncborderstyle =
                Col.prototype['_syncborderstyle-hover'] =
                    Col.prototype['_syncbordercolor-hover'] =
                        Col.prototype['_syncborderwidth-hover'] = function () {
                            this._syncborder();
                        };

    Col.prototype._syncborder = function () {
        var borderstyle = this.getProperty('borderstyle'),
            bordercolor = this.getProperty('bordercolor'),
            borderwidth = this.getProperty('borderwidth');

        this.addLocalStyle('normal', 'border', this.getBorderCSS(borderstyle, bordercolor, borderwidth));

        var hoverStyle = '',
            isHoverDifferent = false,
            borderstyleHover = this.getProperty('borderstyle-hover'),
            bordercolorHover = this.getProperty('bordercolor-hover'),
            borderwidthHover = this.getProperty('borderwidth-hover');

        if (borderstyleHover !== undefined && borderstyleHover != borderstyle) {
            isHoverDifferent = true;
        }
        if (bordercolorHover !== undefined && bordercolorHover != bordercolor) {
            isHoverDifferent = true;
        }
        if (borderwidthHover !== undefined && borderwidthHover != borderwidth) {
            isHoverDifferent = true;
        }

        if (isHoverDifferent) {
            if (borderstyleHover === undefined) {
                borderstyleHover = borderstyle;
            }
            if (bordercolorHover === undefined) {
                bordercolorHover = bordercolor;
            }
            if (borderwidthHover === undefined) {
                borderwidthHover = borderwidth;
            }
            hoverStyle = this.getBorderCSS(borderstyleHover, bordercolorHover, borderwidthHover);
        }
        this.addLocalStyle('hover', 'border', hoverStyle);

        this.update();
    };

    Col.prototype.getBorderCSS = function (borderStyle, borderColor, borderWidth) {
        var style = '';
        if (borderStyle != 'none') {
            style += 'border-color:' + N2Color.hex2rgbaCSS(borderColor) + ';';
            style += 'border-style:' + borderStyle + ';';
            borderWidth = borderWidth.split('|*|');
            var unit = 'px';

            style += 'border-width:' + borderWidth.join(unit + ' ') + unit + ';';
        }
        return style;
    };

    Col.prototype._syncboxshadow =
        Col.prototype['_syncboxshadow-hover'] = function () {

            var boxShadow = this.getProperty('boxshadow');
            this.addLocalStyle('normal', 'boxshadow', this.getBoxShadowCSS(boxShadow.split('|*|')));

            var hoverStyle = '',
                boxShadowHover = this.getProperty('boxshadow-hover');
            if (boxShadowHover !== undefined && boxShadowHover != boxShadow) {
                hoverStyle = this.getBoxShadowCSS(boxShadowHover.split('|*|'));
            }
            this.addLocalStyle('hover', 'boxshadow', hoverStyle);
        };

    Col.prototype.getBoxShadowCSS = function (boxShadow) {
        if ((boxShadow[0] != 0 || boxShadow[1] != 0 || boxShadow[2] != 0 || boxShadow[3] != 0) && N2Color.hex2alpha(boxShadow[4]) != 0) {
            return 'box-shadow:' + boxShadow[0] + 'px ' + boxShadow[1] + 'px ' + boxShadow[2] + 'px ' + boxShadow[3] + 'px ' + N2Color.hex2rgbaCSS(boxShadow[4]) + ';';
        }
        return '';
    };

    Col.prototype.delete = function () {
        if (this.group.container.getLayerCount() > 1) {
            this._delete();
        } else {
            this.group.delete();
        }
    };

    Col.prototype.getHTML = function (base64) {
        var layer = N2Classes.ComponentAbstract.prototype.getHTML.call(this, base64);

        layer.attr('data-rowcolumns', this.group.getColumns());
        return layer;
    };

    Col.prototype.renderModeProperties = function (isReset) {
        this._syncorder();

        N2Classes.ContentAbstract.prototype.renderModeProperties.call(this, isReset);
    };

    Col.prototype.update = function () {

        this.group._syncwrapafter();
        N2Classes.ComponentAbstract.prototype.update.call(this);
    };

    Col.prototype.setPropertystylemode = function () {
        N2Classes.ContentAbstract.prototype.setPropertystylemode.apply(this, arguments);

        this.syncAdvancedField('borderradius');
        this.syncAdvancedField('boxshadow');
        this.syncAdvancedField('borderwidth');
        this.syncAdvancedField('borderstyle');
        this.syncAdvancedField('bordercolor');
    };

    Col.prototype.getOrderedIndex = function () {
        return this.group.getOrderedColumns().indexOf(this);
    };

    return Col;
});
var dependencies = ['Historical', 'LayerDataStorage', 'PluginEditableName'];
N2D('ComponentAbstract', dependencies, function ($, undefined) {
    "use strict";

    var i = 0;
    window.layers = [];

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FragmentEditor} fragmentEditor
     * @param group
     * @param properties
     * @constructor
     * @augments N2Classes.Historical
     * @augments N2Classes.PluginActivatable
     * @augments N2Classes.LayerDataStorage
     * @augments N2Classes.PluginEditableName
     * @augments N2Classes.PluginAnimatable
     * @augments N2Classes.PluginShowOn
     */
    function ComponentAbstract(fragmentEditor, group, properties) {

        this.wraps = {};
        this.counter = i++;
        window.layers[this.counter] = this;
        this.self = this;
        this.originalProperties = properties || {};
        N2Classes.LayerDataStorage.prototype.constructor.call(this);
        this.readyDeferred = $.Deferred();
        this.readyDeferred.done($.proxy(this.onReady, this));
        this.isDeleteStarted = false;
        this.isDeleted = false;

        this._lastClasses = false;

        this.$ = $(this);

        this.proxyRefreshBaseSize = $.proxy(this.refreshBaseSize, this);
        this.proxyRefreshTextAlign = $.proxy(this.refreshTextAlign, this);

        this.status = ComponentAbstract.STATUS.UNDEFINED;

        this.fragmentEditor = fragmentEditor;
        this.group = group;

        this.classElements = [];

        this.localStyleSyncThrottled = NextendThrottle(this.localStyleSync, 50);


        N2Classes.PluginActivatable.prototype.constructor.call(this);

        /** @type {N2Classes.Placement} */
        this.placement = new N2Classes.Placement(this);

        this.readyDeferred.done($.proxy(this.addUILabels, this));

    }

    ComponentAbstract.STATUS = {
        UNDEFINED: 0,
        NORMAL: 1,
        LOCKED: 2,
        HIDDEN: 3
    };

    ComponentAbstract.STATUS_INV = {
        0: 'UNDEFINED',
        1: 'NORMAL',
        2: 'LOCKED',
        3: 'HIDDEN'
    };


    for (var k in N2Classes.PluginActivatable.prototype) {
        ComponentAbstract.prototype[k] = N2Classes.PluginActivatable.prototype[k];
    }

    for (var k in N2Classes.LayerDataStorage.prototype) {
        ComponentAbstract.prototype[k] = N2Classes.LayerDataStorage.prototype[k];
    }

    for (var k in N2Classes.PluginEditableName.prototype) {
        ComponentAbstract.prototype[k] = N2Classes.PluginEditableName.prototype[k];
    }

    for (var k in N2Classes.PluginShowOn.prototype) {
        ComponentAbstract.prototype[k] = N2Classes.PluginShowOn.prototype[k];
    }

    N2Classes.Historical(ComponentAbstract);

    ComponentAbstract.prototype.onSelfChange = function () {
    };

    ComponentAbstract.prototype.addUILabels = function () {
        this.markTimer = null;
        this.uiLabel = $('<div class="n2-ss-layer-ui-label-container"><div class="n2-ss-layer-ui-label n2-ss-layer-ui-label-self">' + this.getUILabel() + '</div></div>')
            .appendTo(this.layer);

        nextend.tooltip.addElement($('<div class="n2-ss-layer-ui-label n2-ss-layer-ui-label-up n2-ss-layer-ui-label-action"><i class="n2-i n2-i-uplevel"/></div>')
            .on({
                mousedown: function (e) {
                    e.stopPropagation();
                },
                click: $.proxy(function (e) {
                    this.up(e);
                }, this)
            })
            .appendTo(this.uiLabel), 'Select parent');

        $('<div class="n2-ss-layer-ui-label n2-ss-layer-ui-label-action"><i class="n2-i n2-i-mini-duplicate"/></div>')
            .on({
                mousedown: function (e) {
                    e.stopPropagation();
                },
                click: $.proxy(function () {
                    this.duplicate();
                }, this)
            })
            .appendTo(this.uiLabel);

        $('<div class="n2-ss-layer-ui-label n2-ss-layer-ui-label-action"><i class="n2-i n2-i-mini-trash"/></div>')
            .on({
                mousedown: function (e) {
                    e.stopPropagation();
                },
                click: $.proxy(function () {
                    this.delete();
                }, this)
            })
            .appendTo(this.uiLabel);
    };

    ComponentAbstract.prototype.getUILabel = function () {
        return this.label;
    };

    ComponentAbstract.prototype.up = function (e) {
        e.stopImmediatePropagation();
        this.group.activate(e);
    };

    ComponentAbstract.prototype.addProperties = function ($layer) {

        this.createProperty('id', null, $layer, this);
        this.createProperty('uniqueclass', null, $layer, this);

        this.createProperty('class', '', $layer);
        this.createProperty('crop', 'visible', $layer);
        this.createProperty('rotation', 0, $layer);
        this.createProperty('parallax', 0, $layer);
        this.createProperty('adaptivefont', 0, $layer);

        this.createDeviceProperty('fontsize', {desktopPortrait: 100}, $layer);
        N2Classes.PluginShowOn.prototype.addProperties.call(this, $layer);
        N2Classes.PluginEditableName.prototype.addProperties.call(this, $layer);
    };

    ComponentAbstract.prototype.getRootElement = function () {
        return this.layer;
    };

    ComponentAbstract.prototype.create = function (cb, useCreatedLayerProperties) {
        useCreatedLayerProperties = useCreatedLayerProperties || false;
        if (!useCreatedLayerProperties) {
            this.addProperties(false);
        }
        if (typeof cb == 'function') {
            this.layer = cb.call(null, this);
        } else {
            this.layer = this._createLayer();
        }

        this.layer.addClass('n2-ss-layer-under-creation');

        if (useCreatedLayerProperties) {
            this.addProperties(this.layer);
        }

        this.layer.data('layerObject', this);
        this.layer.triggerHandler('layerStarted', [this]);


        this.group.container.insert(this);
        this.group.onChildCountChange();

        this.$.triggerHandler('create');

        this._start(true);
    };

    ComponentAbstract.prototype.load = function ($layer, isEditorStart) {

        this.addProperties($layer);

        this.layer = $layer.data('layerObject', this);

        this.layer.triggerHandler('layerStarted', [this]);

        this.$.triggerHandler('load');

        this._start(false);

        var status = $layer.data('status');
        if (status !== null && typeof status != 'undefined') {
            this.changeStatus(status);
        } else {
            this.changeStatus(ComponentAbstract.STATUS.NORMAL);
        }

        if (!isEditorStart) {
            this.regenerateUniqueClass();
        }
    };

    ComponentAbstract.prototype._start = function (isCreate) {
        this.createRow();

        var mask = this.layer.find('> .n2-ss-layer-mask');
        if (mask.length) {
            this.wraps.mask = mask;
        }

        this._synccrop();
        this._syncrotation();

        this.placement.start();
        this.placement.setMode(this.group.container.allowedPlacementMode, this.originalProperties);

        this.setGroup(this.group);


        this.fragmentEditor.$.triggerHandler('layerCreated', this);

        if (isCreate) {
            this.refreshBaseSize();
            this.$.triggerHandler('created');
        }

        setTimeout($.proxy(function () {
            if (!this.isDeleted) {
                this.placement.onResize(true);
                this.layer.css('visibility', '');

                this.layer.removeClass('n2-ss-layer-under-creation');
            }
        }, this), 300);
    };


    ComponentAbstract.prototype._onReady = function () {

        this.originalProperties = {};

        this.readyDeferred.resolve();

        this.layer.on({
            mouseover: $.proxy(this.markOver, this),
            mouseout: $.proxy(this.markOut, this)
        });
    };

    ComponentAbstract.prototype.isReady = function () {
        return this.readyDeferred.state() == 'resolved';
    };

    ComponentAbstract.prototype.getName = function () {
        return this.property.name;
    };

    ComponentAbstract.prototype.setGroup = function (group) {
        this.group.$.off('baseSizeUpdated.sslayer' + this.counter);
        this.group.$.off('textAlignUpdated.sslayer' + this.counter);

        this.group = group;
        this.placement.setMode(group.container.allowedPlacementMode);
        group.container.syncLayerRow(this);

        if (this.isReady()) {
            this.refreshBaseSize();
        }
        this.group.$.on('baseSizeUpdated.sslayer' + this.counter, this.proxyRefreshBaseSize);
        this.group.$.on('textAlignUpdated.sslayer' + this.counter, this.proxyRefreshTextAlign);
    };

    ComponentAbstract.prototype.changeGroup = function (originalIndex, newGroup) {
        var originalGroup = this.group;
        originalGroup.$.off('baseSizeUpdated.sslayer' + this.counter);
        originalGroup.$.off('textAlignUpdated.sslayer' + this.counter);

        this.group = newGroup;
        var originalPlacementData = this.placement.setMode(newGroup.container.allowedPlacementMode);
        newGroup.container.syncLayerRow(this);

        this.refreshBaseSize();
        newGroup.$.on('baseSizeUpdated.sslayer' + this.counter, this.proxyRefreshBaseSize);
        newGroup.$.on('textAlignUpdated.sslayer' + this.counter, this.proxyRefreshTextAlign);

        this.userGroupChange(originalGroup, originalIndex, originalPlacementData, newGroup, this.getIndex());

        originalGroup.update();
    };

    ComponentAbstract.prototype.userGroupChange = function (originalGroup, originalIndex, originalPlacementData, newGroup, newIndex) {
        if (originalGroup == newGroup) {
            this.userIndexChange(originalIndex, newIndex);
        } else {
            var task = N2Classes.History.get().addValue(this, this.historyUserGroupChange, []);

            if (task) {
                task.setValues({
                    historyGroup: originalGroup,
                    index: originalIndex,
                    placementData: originalPlacementData
                }, {
                    historyGroup: newGroup,
                    index: newIndex
                });
            }
        }
    };

    ComponentAbstract.prototype.historyUserGroupChange = function (data) {
        var originalGroup = this.group,
            group = data.historyGroup.getSelf(),
            index = data.index;
        group.container.insertLayerAt(this, index);

        this.group.$.off('baseSizeUpdated.sslayer' + this.counter);
        this.group.$.off('refreshTextAlign.sslayer' + this.counter);

        this.group = group;
        if (data.placementData) {
            this.layer.data(data.placementData);
        }
        this.placement.setMode(group.container.allowedPlacementMode);
        group.container.syncLayerRow(this);

        this.refreshBaseSize();
        this.group.$.on('baseSizeUpdated.sslayer' + this.counter, this.proxyRefreshBaseSize);
        this.group.$.on('refreshTextAlign.sslayer' + this.counter, this.proxyRefreshBaseSize);


        group.onChildCountChange();

        if (data.placementData) {
            this.placement.sync();
        }

        originalGroup.update();
    };

    ComponentAbstract.prototype.userIndexChange = function (originalIndex, newIndex) {

        var task = N2Classes.History.get().addValue(this, this.historyUserIndexChange);
        if (task) {
            task.setValues(originalIndex, newIndex);
        }
        this.group.container.insertLayerAt(this, newIndex);
    };

    ComponentAbstract.prototype.historyUserIndexChange = function (value) {
        this.group.container.insertLayerAt(this, value);
    };


    ComponentAbstract.prototype._createLayerListRow = function (actions) {
        this.layerRow = $('<li class="n2-ss-layerlist-row"></li>')
            .data('layer', this)
            .on({
                mousedown: $.proxy(N2Classes.WindowManager.setMouseDownArea, null, 'layerRowClicked')
            })
            .appendTo(this.group.container.$ul);
        this.layerTitleSpan = $('<span class="n2-ucf">' + this.property.name + '</span>');

        this.makeNameEditable();

        this.layerTitle = $('<div class="n2-ss-layer-title"></div>')
            .on({
                mouseenter: $.proxy(function () {
                    this.fragmentEditor.highlight(this);
                }, this),
                mouseleave: $.proxy(function () {
                    this.fragmentEditor.deHighlight(this);
                }, this),
            })
            .append(this.layerTitleSpan)
            .append(actions)
            .appendTo(this.layerRow)
            .on({
                mouseup: $.proxy(function (e) {
                    if (!nextend.shouldPreventMouseUp && e.target.tagName === 'DIV') {
                        this.activate(e);
                    }
                }, this)
            });

        nextend.tooltip.add(this.layerRow);

        this.layerRow.nUILayerListItem({
            UIManager: this.fragmentEditor.mainContainer.layerListUIManager,
            layer: this,
            $item: this.layerRow
        });

        return this.layerRow;
    };

    ComponentAbstract.prototype.select = function (e) {
        return this.fragmentEditor.selectLayer(this, true);
    };

    ComponentAbstract.prototype.update = function () {
        this.readyDeferred.done($.proxy(this.placement.updatePositionThrottled, this.placement));
    };

    ComponentAbstract.prototype.updateThrottled = function () {
        this.placement.updatePositionThrottled();
    };

    ComponentAbstract.prototype.positionSidebar = function () {
        this.fragmentEditor.layerWindow.show(this, this.layer);
    };

    ComponentAbstract.prototype.showEditor = function () {
        this.fragmentEditor.layerWindow._show();
    };

    ComponentAbstract.prototype.highlight = function (hideInterval) {
        hideInterval = hideInterval || 2000;
        if (this.isHighlighted) {
            clearTimeout(this.isHighlighted);
            this.isHighlighted = false;
        }
        this.layer.addClass('n2-highlight');
        this.isHighlighted = setTimeout($.proxy(function () {
            this.layer.removeClass('n2-highlight');
        }, this), hideInterval);
    };

    ComponentAbstract.prototype.setPropertydesktopPortrait =
        ComponentAbstract.prototype.setPropertydesktopLandscape =
            ComponentAbstract.prototype.setPropertytabletPortrait =
                ComponentAbstract.prototype.setPropertytabletLandscape =
                    ComponentAbstract.prototype.setPropertymobilePortrait =
                        ComponentAbstract.prototype.setPropertymobileLandscape = function (name, value, from) {
                            this._setProperty(name, parseInt(value), from);
                        };

    ComponentAbstract.prototype.getHTML = function (base64) {
        var $layer = this._createLayer();

        for (var k in this.property) {
            if (k != 'width' && k != 'height' && k != 'left' && k != 'top') {
                $layer.attr('data-' + k.toLowerCase(), this.property[k]);
            }
        }

        for (var k in this.deviceProperty) {
            for (var k2 in this.deviceProperty[k]) {
                $layer.attr('data-' + k.toLowerCase() + k2, this.deviceProperty[k][k2]);
            }
        }

        for (var k in this.deviceProperty['desktop']) {
            $layer.css(k, this.deviceProperty['desktop'][k] + 'px');
        }

        if (this.container !== undefined) {
            var $innerContainer = $layer;
            if (this.innerContainer !== undefined) {
                $innerContainer = $layer.find(this.innerContainer);
            }

            $innerContainer.append(this.container.getHTML(base64));
        }

        var id = this.getProperty('id');
        if (id && id != '') {
            $layer.attr('id', id);
        }

        if (this.status > N2Classes.ComponentAbstract.STATUS.NORMAL) {
            $layer.attr('data-status', this.status);
        }

        return $layer;
    };

    ComponentAbstract.prototype.duplicate = function (needActivate) {
        var $component = this.getHTML(false);

        if (this.placement.getType() === 'absolute') {
            var id = $component.attr('id');
            if (id) {
                id = $.fn.uid();
                $component.attr('id', id);
                $component.attr('data-id', id);
            }
            if ($component.attr('data-parentid')) {
                $component.data('desktopportraittop', 0);
                $component.data('desktopportraitleft', 0);
            } else {
                $component.data('desktopportraittop', $component.data('desktopportraittop') + 40);
                $component.data('desktopportraitleft', $component.data('desktopportraitleft') + 40);
            }
            $component.attr('data-parentid', '');

        }

        var newComponent = this.fragmentEditor.insertComponentWithNode(this.group, $component, this.getIndex() + 1, false, true);

        this.layerRow.trigger('mouseleave');

        if (needActivate) {
            newComponent.activate();
        }

        N2Classes.History.get().addSimple(this, this.historyDeleteDuplicated, this.historyDuplicate, [newComponent, newComponent.container ? newComponent.container.getAllLayers() : false]);

        return newComponent;
    };

    ComponentAbstract.prototype.historyDeleteDuplicated = function (historicalNewComponent) {
        historicalNewComponent.getSelf().delete();
    };

    ComponentAbstract.prototype.historyDuplicate = function (historicalNewComponent, historicalAllLayers) {
        var newComponent = this.duplicate(false, false);
        historicalNewComponent.setSelf(newComponent);

        if (historicalAllLayers) {
            var newAllLayers = newComponent.container.getAllLayers();
            for (var i = 0; i < newAllLayers.length; i++) {
                historicalAllLayers[i].setSelf(newAllLayers[i]);
            }
        }
    };

    ComponentAbstract.prototype.historyDelete = function () {
        this.delete();
    };

    ComponentAbstract.prototype.historyRestore = function ($component, historicalGroup, index, historicalAllLayers) {
        var newComponent = this.fragmentEditor.insertComponentWithNode(this.group.getSelf(), $component.clone(), index, false, true);
        this.setSelf(newComponent);

        if (historicalAllLayers) {
            var newAllLayers = newComponent.container.getAllLayers();
            for (var i = 0; i < newAllLayers.length; i++) {
                historicalAllLayers[i].setSelf(newAllLayers[i]);
            }
        }
    };

    ComponentAbstract.prototype.delete = function () {
        N2Classes.PositionDisplay.get().hide();
        nextend.tooltip.onLeave();
        this._delete();
    };

    ComponentAbstract.prototype._delete = function () {

        this.isDeleteStarted = true;

        if (this.fragmentEditor.mainContainer.getSelectedLayer() == this) {
            this.fragmentEditor.layerWindow.hide();
        }

        if (this.isHighlighted) {
            clearTimeout(this.isHighlighted);
            this.isHighlighted = false;
        }

        N2Classes.History.get().startBatch();
        N2Classes.History.get().addSimple(this, this.historyRestore, this.historyDelete, [this.getHTML(false), this.group, this.getIndex(), this.container ? this.container.getAllLayers() : false]);

        this.deActivate();

        if (this.container != undefined) {
            N2Classes.History.get().off();
            var layers = this.container.getSortedLayers();
            for (var i = 0; i < layers.length; i++) {
                layers[i]._delete();
            }
            N2Classes.History.get().on();
        }
        N2Classes.History.get().endBatch();

        if (this.item != undefined) {
            this.item.delete();
        }

        this.placement.delete();

        // If delete happen meanwhile layer dragged or resized, we have to cancel that.
        this.layer.trigger('mouseup');

        this.isDeleted = true;

        this.fragmentEditor.mainContainer.layerDeleted(this);

        this.layer.triggerHandler('LayerDeleted');
        this.getRootElement().remove();
        this.layerRow.remove();

        this.group.update();


        this.group.$.off('baseSizeUpdated.sslayer' + this.counter);
        this.group.$.off('refreshTextAlign.sslayer' + this.counter);
        this.$.trigger('layerDeleted');

        if (this.markTimer) {
            clearTimeout(this.markTimer);
        }

        //delete this.fragmentEditor;
        delete this.layer;
        delete this.itemEditor;
        this.group.onChildCountChange();
    };

    ComponentAbstract.prototype.getData = function (params) {
        var data = {
            type: this.type,
            lastplacement: this.placement.getType()
        };

        if (this.status > N2Classes.ComponentAbstract.STATUS.NORMAL) {
            data.status = this.status;
        }

        var properties = $.extend({}, this.property);

        // store the device based properties
        for (var device in this.deviceProperty) {
            for (var property in this.deviceProperty[device]) {
                delete properties[property];
                var value = this.deviceProperty[device][property];
                if (typeof value === 'undefined') {
                    continue;
                }

                switch (property) {
                    case 'width':
                    case 'height':
                        if (!this.isDimensionPropertyAccepted(value)) {
                            value = parseFloat(value);
                        }
                        break;
                    case 'fontsize':
                    case 'left':
                    case 'top':
                    case 'gutter':
                    case 'wrap':
                        value = parseFloat(value);
                        break;
                }
                data[device.toLowerCase() + property] = value;
            }
        }

        for (var k in properties) {
            data[k.toLowerCase()] = properties[k];
        }

        return data;
    };

    ComponentAbstract.prototype.onChildCountChange = function () {

    };

    /**
     *
     * @param array layersData Contains
     * @param array layers Contains layer objects to be able to track layers in the current copy process to prevent same layer inserted into the clipboard twice when parent picker used.
     * @returns array layersData
     */
    ComponentAbstract.prototype.getDataWithChildren = function (layersData, layers) {
        if ($.inArray(this, layers) == -1) {
            layers.push(this);
            layersData.push(this.getData({
                layersIncluded: true,
                itemsIncluded: true
            }));
            this.layer.triggerHandler('LayerGetDataWithChildren', [layersData, layers]);
        }
        return layersData;
    };

    ComponentAbstract.prototype.markOver = function (e) {
        this.layer.addClass('n2-ss-mouse-over');
        e.stopPropagation();

        this.group.markEnter();

        if (this.markTimer) {
            clearTimeout(this.markTimer);
        }
        this.layer.addClass('n2-ss-mouse-over-delayed');
        this.uiLabel.removeClass('invisible');
    };

    ComponentAbstract.prototype.markOut = function (e) {
        this.layer.removeClass('n2-ss-mouse-over');
        if (e) {
            e.stopPropagation();
        }
        this.group.markLeave();

        if (this.markTimer) {
            clearTimeout(this.markTimer);
        }
        if (!this.isActive) {
            this.uiLabel.addClass('invisible');
        }
        this.markTimer = setTimeout($.proxy(function () {
            this.layer.removeClass('n2-ss-mouse-over-delayed');
            this.uiLabel.removeClass('invisible');
            this.markTimer = null;
        }, this), 10);
    };

    ComponentAbstract.prototype.markEnter = function (e) {
        this.layer.addClass('n2-ss-mouse-hover');
        this.group.markEnter();
    };

    ComponentAbstract.prototype.markLeave = function (e) {
        this.layer.removeClass('n2-ss-mouse-hover');
        this.group.markLeave();
    };


    ComponentAbstract.prototype.formSetname = function (options, value) {

    };

    ComponentAbstract.prototype.formSetnameSynced = function (options, value) {

    };

    ComponentAbstract.prototype.formSetdesktopPortrait = function (options, value) {
        options.currentForm.desktopPortrait.data('field').insideChange(value);
    };

    ComponentAbstract.prototype.formSetdesktopLandscape = function (options, value) {
        options.currentForm.desktopLandscape.data('field').insideChange(value);
    };

    ComponentAbstract.prototype.formSettabletPortrait = function (options, value) {
        options.currentForm.tabletPortrait.data('field').insideChange(value);
    };

    ComponentAbstract.prototype.formSettabletLandscape = function (options, value) {
        options.currentForm.tabletLandscape.data('field').insideChange(value);
    };

    ComponentAbstract.prototype.formSetmobilePortrait = function (options, value) {
        options.currentForm.mobilePortrait.data('field').insideChange(value);
    };

    ComponentAbstract.prototype.formSetmobileLandscape = function (options, value) {
        options.currentForm.mobileLandscape.data('field').insideChange(value);
    };

    ComponentAbstract.prototype.sync = function () {
        this._syncid();
        if (this.container) {
            var layers = this.container.getSortedLayers();
            for (var i = 0; i < layers.length; i++) {
                layers[i].sync();
            }
        }
        this.placement.sync();
    };

    ComponentAbstract.prototype._syncid = function () {
        var value = this.getProperty('id');
        if (!value || value == '') {
            this.layer.removeAttr('id');
        } else {
            this.layer.attr('id', value);
        }
    };

    ComponentAbstract.prototype.requestID = function () {
        var id = this.getProperty('id');
        if (!id) {
            id = $.fn.uid();
            this.setProperty('id', id, 'layer');
        }
        return id;
    };

    ComponentAbstract.prototype.requestUniqueClass = function () {
        var uniqueClass = this.getProperty('uniqueclass');
        if (!uniqueClass) {
            uniqueClass = $.fn.generateUniqueClass('n-uc-');
            this.setProperty('uniqueclass', uniqueClass, 'layer');
        }
        return uniqueClass;
    };

    /**
     * Used when duplicate or paste node to prevent class name conflicts
     */
    ComponentAbstract.prototype.regenerateUniqueClass = function () {
        if (this.getProperty('uniqueclass')) {
            this.setProperty('uniqueclass', $.fn.generateUniqueClass('n-uc-'), 'layer');
        }
    };

    ComponentAbstract.prototype._syncuniqueclass = function () {
        var value = this.getProperty('uniqueclass');

        for (var i = 0; i < this.classElements.length; i++) {
            this.classElements[i].$el
                .removeClass(function (index, className) {
                    return (className.match(/n-uc-[a-z0-9\-]+/gi) || []).join(' ');
                })
                .addClass(value + this.classElements[i].postfix);
        }
    };

    ComponentAbstract.prototype._syncfontsize = function () {
        this.adjustFontSize(this.getProperty('adaptivefont'), this.getProperty('fontsize'), true);
    };

    ComponentAbstract.prototype._syncadaptivefont = function () {
        this.adjustFontSize(this.getProperty('adaptivefont'), this.getProperty('fontsize'), true);
    };

    ComponentAbstract.prototype.adjustFontSize = function (isAdaptive, fontSize, shouldUpdatePosition) {
        fontSize = parseInt(fontSize);
        if (parseInt(isAdaptive)) {
            this.layer.css('font-size', (16 * fontSize / 100) + 'px');
        } else if (fontSize != 100) {
            this.layer.css('font-size', fontSize + '%');
        } else {
            this.layer.css('font-size', '');
        }
        this.refreshBaseSize();
        if (shouldUpdatePosition) {
            this.update();
        }
    };

    ComponentAbstract.prototype.refreshBaseSize = function () {
        var fontSize = this.getFontSize();
        if (this.isAdaptiveFont()) {
            this.baseSize = (16 * fontSize / 100);
        } else {
            this.baseSize = this.group.baseSize * fontSize / 100;
        }
        this.$.triggerHandler('baseSizeUpdated');
    };

    ComponentAbstract.prototype.refreshTextAlign = function () {

        this.$.triggerHandler('textAlignUpdated');
    }

    ComponentAbstract.prototype.getFontSize = function () {
        return parseInt(this.getProperty('fontsize'));
    };

    ComponentAbstract.prototype.isAdaptiveFont = function () {
        return parseInt(this.getProperty('adaptivefont'));
    };

    ComponentAbstract.prototype._synccrop = function () {
        var value = this.getProperty('crop');
        if (value == 'auto') {
            value = 'hidden';
        }

        if (value == 'mask') {
            value = 'hidden';
            this.addWrap('mask', "<div class='n2-ss-layer-mask'></div>");

        } else {
            this.removeWrap('mask');

            this.layer.data('animatableselector', null);
        }
        this.layer.css('overflow', value);
    };

    ComponentAbstract.prototype._syncrotation = function () {
        var rotation = parseFloat(this.getProperty('rotation'));
        if (rotation / 360 != 0) {
            var $el = this.addWrap('rotation', "<div class='n2-ss-layer-rotation'></div>");

            NextendTween.set($el[0], {
                rotationZ: rotation
            });
        } else {
            this.removeWrap('rotation');
        }
    };

    ComponentAbstract.prototype.addWrap = function (key, html) {
        if (this.wraps[key] === undefined) {
            var $el = $(html);
            this.wraps[key] = $el;

            switch (key) {
                case 'mask':
                    $el.appendTo(this.layer);
                    if (this.wraps.rotation !== undefined) {
                        $el.append(this.wraps.rotation);
                    } else {
                        $el.append(this.getContents());
                    }
                    this.layer.data('animatableselector', '.n2-ss-layer-mask:first');
                    break;
                case 'rotation':
                    if (this.wraps.mask !== undefined) {
                        $el.appendTo(this.wraps.mask);
                    } else {
                        $el.appendTo(this.layer);
                    }
                    $el.append(this.getContents());
                    break;
            }
        }
        return this.wraps[key];
    };

    ComponentAbstract.prototype.removeWrap = function (key) {
        if (this.wraps[key] !== undefined) {

            switch (key) {
                case 'mask':
                    if (this.wraps.rotation !== undefined) {
                        this.layer.append(this.wraps.rotation);
                    } else {
                        this.layer.append(this.getContents());
                    }
                    break;
                case 'rotation':
                    if (this.wraps.mask !== undefined) {
                        this.wraps.mask.append(this.getContents());
                    } else {
                        this.layer.append(this.getContents());
                    }
                    break;
            }
            this.wraps[key].remove();
            delete this.wraps[key];
        }
    };

    ComponentAbstract.prototype.getContents = function () {
        return false;
    };

    ComponentAbstract.prototype._syncclass = function () {
        if (this._lastClasses !== false) {
            this.layer.removeClass(this._lastClasses);
        }
        var value = this.fragmentEditor.editor.generator.fill(this.getProperty('class'));

        if (value && value != '') {
            this.layer.addClass(value);
            this._lastClasses = value;
        } else {
            this._lastClasses = false;
        }
    };

    ComponentAbstract.prototype._syncparallax = function () {

    };

    ComponentAbstract.prototype._syncgeneratorvisible = function () {
    };

    ComponentAbstract.prototype._syncmouseenter =
        ComponentAbstract.prototype._syncclick =
            ComponentAbstract.prototype._syncmouseleave =
                ComponentAbstract.prototype._syncplay =
                    ComponentAbstract.prototype._syncpause =
                        ComponentAbstract.prototype._syncstop = function () {
                        };


    ComponentAbstract.prototype.renderModeProperties = function (isReset) {

        N2Classes.LayerDataStorage.prototype.renderModeProperties.call(this);


        this.placement.renderModeProperties(isReset);
    };

    ComponentAbstract.prototype.getIndex = function () {
        return this.group.container.getLayerIndex(this.layer);
    };

    ComponentAbstract.prototype.toString = function () {
        return this.type + ' #' + this.counter;
    };

    ComponentAbstract.prototype.historyStoreOnPlacement = function () {
        var args = Array.prototype.slice.call(arguments);
        args.splice(1, 1);
        this.placement.current[arguments[1]].apply(this.placement.current, args);
    };

    ComponentAbstract.prototype.getDroppable = function () {
        return false;
    };

    ComponentAbstract.prototype.onCanvasUpdate = function (originalIndex, targetGroup, newIndex) {

        if (this.group === targetGroup) {

            if (originalIndex != newIndex) {
                this.userIndexChange(originalIndex, newIndex)
            }
        } else {
            var oldAbsoluteParent;
            if (this.fragmentEditor.isCol(this.group)) {
                oldAbsoluteParent = this;
                while (oldAbsoluteParent && (!oldAbsoluteParent.placement || oldAbsoluteParent.placement.getType() !== 'absolute')) {
                    oldAbsoluteParent = oldAbsoluteParent.group;
                }
            }
            this.changeGroup(originalIndex, targetGroup);

            targetGroup.onChildCountChange();

            // Find the the first absolute element from the layer parents
            var absoluteParent = this;
            while (absoluteParent && (!absoluteParent.placement || absoluteParent.placement.getType() !== 'absolute')) {
                absoluteParent = absoluteParent.group;
            }

            // Update the closest absolute parent's position as the content changed
            if (oldAbsoluteParent && oldAbsoluteParent != absoluteParent) {
                oldAbsoluteParent.placement.updatePosition();
            }
            if (absoluteParent) {
                absoluteParent.placement.updatePosition();
            }
        }
    };

    ComponentAbstract.prototype.setStatusNormal = function () {
        this.changeStatus(ComponentAbstract.STATUS.NORMAL);
    };

    ComponentAbstract.prototype.changeStatus = function (status) {
        var oldStatus = this.status;

        if (status == this.status) {
            status = ComponentAbstract.STATUS.NORMAL;
        }

        switch (this.status) {
            case ComponentAbstract.STATUS.HIDDEN:
                this.getRootElement().removeAttr('data-visibility');
                this.layerRow.removeClass('n2-ss-layer-status-hidden');
                break;
            case ComponentAbstract.STATUS.LOCKED:
                this.layer.removeClass('n2-ss-layer-locked');
                this.layerRow.removeClass('n2-ss-layer-status-locked');
                break;
        }

        this.status = status;

        switch (this.status) {
            case ComponentAbstract.STATUS.HIDDEN:
                this.getRootElement().attr('data-visibility', 'hidden');
                this.layerRow.addClass('n2-ss-layer-status-hidden');
                break;
            case ComponentAbstract.STATUS.LOCKED:
                this.layer.addClass('n2-ss-layer-locked');
                this.layerRow.addClass('n2-ss-layer-status-locked');
                break;
        }

        this.placement.current.changeStatus(oldStatus, this.status);

    };

    ComponentAbstract.prototype.moveX = function (x) {
        if (this.placement.getType() == 'absolute') {
            this.placement.current.moveX(x);
        }
    };

    ComponentAbstract.prototype.moveY = function (y) {
        if (this.placement.getType() == 'absolute') {
            this.placement.current.moveY(y);
        }
    };

    ComponentAbstract.prototype.localStyleSync = function () {
        if (this.localStyle !== undefined) {
            var rulesToDelete = [],
                css = '';
            if (this.$localStyle !== undefined) {
                this.$localStyle.remove();
                delete this.$localStyle;
            }

            for (var i = 0; i < this.localStyle.length; i++) {

                var rule = '@rule' + this.localStyle[i].selector,
                    style = '';
                rulesToDelete.push(rule);

                if (Object.keys(this.localStyle[i].css).length === 1 && this.localStyle[i].css.transition !== undefined) {
                    continue;
                }
                for (var k in this.localStyle[i].css) {
                    style += this.localStyle[i].css[k];
                }
                if (style != '') {
                    css += rule + '{' + style + '}';
                }
            }

            var className = this.getProperty('uniqueclass');
            if (className) {
                // We have to remove all previous rules before adding new ones.
                for (var i = 0; i < rulesToDelete.length; i++) {
                    nextend.css.deleteRule(rulesToDelete[i].replace(/@rule/g, window.nextend.pre + '.' + className));
                }
            }
            if (css != '') {
                if (!className) {
                    className = this.requestUniqueClass();
                }
                this.$localStyle = $("<style>" + css.replace(/@rule/g, window.nextend.pre + '.' + className) + "</style>").appendTo("head");
            }
        }
    };

    ComponentAbstract.prototype.addLocalStyle = function (group, name, style) {
        for (var i = 0; i < this.localStyle.length; i++) {
            if (this.localStyle[i].group === group) {
                if (style === '') {
                    if (this.localStyle[i].css[name] !== undefined) {
                        delete this.localStyle[i].css[name];
                    }
                } else {
                    this.localStyle[i].css[name] = style;
                }
                this.localStyleSyncThrottled();
                break;
            }
        }
    };

    ComponentAbstract.prototype.addClassElement = function ($el, postfix) {
        if (arguments.length < 2) postfix = '';
        this.classElements.push({
            $el: $el,
            postfix: postfix
        });
    };

    ComponentAbstract.prototype.setState = function (name, value) {
    };

    return ComponentAbstract;
});
N2D('Content', ['ContentAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments ComponentAbstract
     */
    function Content(fragmentEditor, group, properties) {
        this.label = n2_('Content');
        this.type = 'content';

        this.innerContainer = '> .n2-ss-layer-content';

        this._defaults = $.extend({verticalalign: 'center'}, this._defaults);


        this.localStyle = [
            {
                group: 'normal', selector: '-inner', css: {
                    transition: 'transition:all .3s;transition-property:border,background-image,background-color,border-radius,box-shadow;'
                }
            },
            {group: 'hover', selector: '-inner:HOVER', css: {}}
        ];

        N2Classes.ContentAbstract.prototype.constructor.call(this, fragmentEditor, group, properties);

        this.placement.allow('content');

        fragmentEditor.setMainContent(this);
    }

    Content.prototype = Object.create(N2Classes.ContentAbstract.prototype);
    Content.prototype.constructor = Content;

    Content.prototype.addUILabels = function () {
        this.markTimer = null;
        this.uiLabel = $('<div class="n2-ss-layer-ui-label-container"><div class="n2-ss-layer-ui-label n2-ss-layer-ui-label-self">' + this.getUILabel() + '</div></div>')
            .appendTo(this.layer);
    };

    Content.prototype.addProperties = function ($layer) {

        N2Classes.ContentAbstract.prototype.addProperties.call(this, $layer);

        this.createDeviceProperty('selfalign', {desktopPortrait: 'inherit'}, $layer);

    };

    Content.prototype.getRootElement = function () {
        return this.layer;
    };

    Content.prototype.getBackgroundElement = function () {
        return this.layer;
    };

    Content.prototype._createLayer = function () {
        return $('<div class="n2-ss-layer n2-ss-content-empty"><div class="n2-ss-section-main-content n2-ss-layer-content"></div></div>')
            .attr('data-sstype', this.type);
    };

    Content.prototype.createRow = function () {

        this.$content = this.layer.find('.n2-ss-layer-content:first');

        this.addClassElement(this.layer);
        this.addClassElement(this.$content, '-inner');


        var status = $('<div class="n2-ss-layer-status"></div>'),
            remove = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Delete layer') + '"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>').on('click', $.proxy(this.delete, this));

        this.container = new N2Classes.LayerContainer(this, $('<ul class="n2-list n2-h4 n2-list-orderable" />'), 'normal', '> .n2-ss-layer', ['row', 'layer']);
        this.container.setLayerContainerElement(this.$content);


        $('<a href="#" class="n2-ss-sc-hide n2-button n2-button-icon n2-button-m"><i class="n2-i n2-i-eye"></i></a>').appendTo(status).on('click', $.proxy(function (e) {
            e.preventDefault();
            if (this.status == N2Classes.ComponentAbstract.STATUS.HIDDEN) {
                this.setStatusNormal();
            } else {
                this.changeStatus(N2Classes.ComponentAbstract.STATUS.HIDDEN);
            }
        }, this));

        this._createLayerListRow([
            $('<div class="n2-actions-left"></div>').append(status),
            $('<div class="n2-actions"></div>').append(remove)
        ]).addClass('n2-ss-layer-content-row');


        this.openerElement = $('<a href="#" class="n2-ss-layer-icon n2-button n2-button-icon n2-button-m"><i class="n2-i n2-i-col"></i></a>').insertBefore(this.layerTitleSpan)
            .on('click', $.proxy(this.switchOpened, this));

        this.container.$ul.appendTo(this.layerRow);

        this.readyDeferred.done($.proxy(this._syncopened, this));
    };

    Content.prototype.create = function () {

        this.originalProperties.adaptivefont = 1;

        N2Classes.ContentAbstract.prototype.create.call(this);

        this._syncselfalign();

        this._onReady();
    };

    Content.prototype.load = function ($layer, isEditorStart) {

        N2Classes.ContentAbstract.prototype.load.call(this, $layer, isEditorStart);

        this._syncselfalign();

        this._onReady();
    };

    Content.prototype._onReady = function () {
        N2Classes.ContentAbstract.prototype._onReady.call(this);
        this.startUISizing();
    };

    Content.prototype.startUISizing = function () {
        this.layer.nUINormalSizing({
            start: $.proxy(function (e, prop) {
                N2Classes.PositionDisplay.get().show('NormalSizing');
                if (prop === 'maxwidth') {
                    this.layer.attr('data-has-maxwidth', '1');
                }
            }, this),
            resizeMaxWidth: $.proxy(function (e, ui) {

                N2Classes.PositionDisplay.get().update(e, 'NormalSizing', 'Max-width: ' + (ui.value == 0 ? 'none' : (ui.value + 'px')));

            }, this),
            stopMaxWidth: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().hide('NormalSizing');
                this.setProperty('maxwidth', ui.value);
            }, this)
        });
    };

    Content.prototype.delete = function () {
        var layers = this.container.getSortedLayers();
        for (var i = 0; i < layers.length; i++) {
            layers[i].delete();
        }
    };

    Content.prototype.remove = function () {
        this._delete();
    };

    Content.prototype.update = function () {
        this.fragmentEditor.editor.getMainContainerElement().triggerHandler('updateSize');
    };

    Content.prototype.onChildCountChange = function () {

        var layers = this.container.getSortedLayers();

        this.layer.toggleClass('n2-ss-content-empty', layers.length == 0);
    };

    Content.prototype.renderModeProperties = function (isReset) {
        N2Classes.ContentAbstract.prototype.renderModeProperties.call(this, isReset);

        this._syncselfalign();
    };

    Content.prototype._syncselfalign = function () {
        this.layer.attr('data-cssselfalign', this.getProperty('selfalign'));
    };

    Content.prototype.duplicate = function (needActivate) {
        console.error('Content can not be duplicated!');
    };

    return Content;
});
N2D('ContentAbstract', ['LayerContainer', 'ComponentAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param fragmentEditor
     * @param group
     * @param properties
     * @constructor
     * @augments ComponentAbstract
     */
    function ContentAbstract(fragmentEditor, group, properties) {

        this._defaults = $.extend({verticalalign: 'flex-start'}, this._defaults);

        this._syncbgThrottled = NextendThrottle(this._syncbgThrottled, 50);

        this.stylemode = '';

        N2Classes.ComponentAbstract.prototype.constructor.call(this, fragmentEditor, group, properties);
    }

    ContentAbstract.prototype = Object.create(N2Classes.ComponentAbstract.prototype);
    ContentAbstract.prototype.constructor = ContentAbstract;

    ContentAbstract.prototype.addProperties = function ($layer) {

        this.createProperty('opened', 1, $layer, this);

        N2Classes.ComponentAbstract.prototype.addProperties.call(this, $layer);

        this.createProperty('bgimage', '', $layer);
        this.createProperty('bgimagex', 50, $layer);
        this.createProperty('bgimagey', 50, $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('bgcolor', '00000000', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('bgcolorgradient', 'off', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('bgcolorgradientend', '00000000', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createProperty('verticalalign', this._defaults.verticalalign, $layer);

        this.createDeviceProperty('maxwidth', {desktopPortrait: 0}, $layer);

        this.createDeviceProperty('inneralign', {desktopPortrait: 'inherit'}, $layer);
        this.createDeviceProperty('padding', {desktopPortrait: '10|*|10|*|10|*|10|*|px+'}, $layer);


        this.$.on('baseSizeUpdated.contentAbstract', $.proxy(this._syncpadding, this));
    };

    ContentAbstract.prototype.getBackgroundElement = function () {
        return this.$content;
    };

    ContentAbstract.prototype.getPaddingElement = function () {
        return this.$content;
    };

    ContentAbstract.prototype.create = function () {
        N2Classes.ComponentAbstract.prototype.create.call(this);

        this.initUI();

        this._syncverticalalign();

        this._syncmaxwidth();
        this._syncpadding();
        this._syncinneralign();
        this._syncbgThrottled();
    };

    ContentAbstract.prototype.load = function ($layer, isEditorStart) {

        N2Classes.ComponentAbstract.prototype.load.call(this, $layer, isEditorStart);

        this.initUI();

        this._syncverticalalign();
        this._syncmaxwidth();
        this._syncpadding();
        this._syncinneralign();
        this._syncbgThrottled();

        this.container.startWithExistingNodes(isEditorStart);
    };

    ContentAbstract.prototype.initUI = function () {

        this.layer.on({
            mousedown: $.proxy(N2Classes.WindowManager.setMouseDownArea, null, 'layerClicked'),
            click: $.proxy(function (e) {
                if (!nextend.shouldPreventMouseUp && this.fragmentEditor.preventActivationBubbling()) {
                    this.activate(e);
                }
            }, this),
            dblclick: $.proxy(function (e) {
                e.stopPropagation();
                $('[data-tab="layer"]').trigger('click');
            }, this)
        });

        this.getPaddingElement().nUISpacing({
            handles: 'n, s, e, w',
            start: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().show('Spacing');
            }, this),
            spacing: $.proxy(function (e, ui) {
                var html = '';
                for (var k in ui.changed) {
                    html += 'Padding ' + k + ': ' + ui.changed[k] + 'px<br>';
                }

                N2Classes.PositionDisplay.get().update(e, 'Spacing', html);
            }, this),
            stop: $.proxy(this.onSpacingStop, this),
        });
    };

    ContentAbstract.prototype.onSpacingStop = function (event, ui) {
        N2Classes.PositionDisplay.get().hide('Spacing');
        var padding = this.getPadding().split('|*|'),
            ratioH = 1,
            ratioV = 1;

        if (padding[padding.length - 1] == 'px+' && Math.abs(parseFloat(this.layer.css('fontSize')) - this.baseSize) > 1) {
            ratioH = this.fragmentEditor.getResponsiveRatioHorizontal();
            ratioV = this.fragmentEditor.getResponsiveRatioVertical();
        }

        for (var k in ui.changed) {
            var value = ui.changed[k];
            switch (k) {
                case 'top':
                    padding[0] = Math.round(value / ratioV);
                    break;
                case 'right':
                    padding[1] = Math.round(value / ratioH);
                    break;
                case 'bottom':
                    padding[2] = Math.round(value / ratioV);
                    break;
                case 'left':
                    padding[3] = Math.round(value / ratioH);
                    break;
            }
        }
        this.setProperty('padding', padding.join('|*|'));
        $('#layercol-padding').data('field').insideChange(padding.join('|*|'));
    };

    ContentAbstract.prototype.switchOpened = function (e) {
        e.preventDefault();
        if (this.getProperty('opened')) {
            this.setProperty('opened', 0);
        } else {
            this.setProperty('opened', 1);
        }
    };

    ContentAbstract.prototype._syncopened = function () {
        if (this.getProperty('opened')) {
            this.openerElement.removeClass('n2-closed');
            this.container.$ul.css('display', '');

            this.layer.triggerHandler('opened');
        } else {
            this.openerElement.addClass('n2-closed');
            this.container.$ul.css('display', 'none');

            this.layer.triggerHandler('closed');
        }
    };

    ContentAbstract.prototype.getPadding = function () {
        return this.getProperty('padding');
    };

    ContentAbstract.prototype._syncpadding = function () {
        var padding = this.getPadding().split('|*|'),
            unit = padding.pop(),
            baseSize = this.baseSize;
        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < padding.length; i++) {
                padding[i] = parseInt(padding[i]) / baseSize;
            }
        }

        var css = padding.join(unit + ' ') + unit;
        this.getPaddingElement().css('padding', css);
        this.update();

        this.getPaddingElement().nUISpacing('option', 'current', css);
    };

    ContentAbstract.prototype._syncmaxwidth = function () {
        var value = parseInt(this.getProperty('maxwidth'));
        if (value <= 0 || isNaN(value)) {
            this.layer.css('maxWidth', '')
                .attr('data-has-maxwidth', '0');
        } else {
            this.layer.css('maxWidth', value + 'px')
                .attr('data-has-maxwidth', '1');
        }

        this.update();
    };

    ContentAbstract.prototype.getInnerAlign = function () {
        return this.getProperty('inneralign');
    };

    ContentAbstract.prototype._syncinneralign = function () {
        this.layer.attr('data-csstextalign', this.getInnerAlign());

        this.refreshTextAlign();
    };

    ContentAbstract.prototype.getVerticalAlign = function () {
        return this.getProperty('verticalalign');
    };

    ContentAbstract.prototype._syncverticalalign = function () {
        this.$content.attr('data-verticalalign', this.getVerticalAlign());
    };

    ContentAbstract.prototype._syncbgimage =
        ContentAbstract.prototype._syncbgimagex =
            ContentAbstract.prototype._syncbgimagey =
                ContentAbstract.prototype._syncbgcolor =
                    ContentAbstract.prototype._syncbgcolorgradient =
                        ContentAbstract.prototype._syncbgcolorgradientend =
                            ContentAbstract.prototype['_syncbgcolor-hover'] =
                                ContentAbstract.prototype['_syncbgcolorgradient-hover'] =
                                    ContentAbstract.prototype['_syncbgcolorgradientend-hover'] = function () {
                                        this._syncbgThrottled();
                                    };


    ContentAbstract.prototype._syncbgThrottled = function () {
        var background = '',
            image = this.fragmentEditor.editor.generator.fill(this.getProperty('bgimage')),
            gradientBackgroundProps = '';
        if (image != '') {
            var x = parseInt(this.getProperty('bgimagex'));
            if (!isFinite(x)) {
                x = 50;
            }
            var y = parseInt(this.getProperty('bgimagey'));
            if (!isFinite(y)) {
                y = 50;
            }
            background += 'URL("' + nextend.imageHelper.fixed(image) + '") ' + x + '% ' + y + '% / cover no-repeat';
            gradientBackgroundProps = ' ' + x + '% ' + y + '% / cover no-repeat'
        }
        var color = this.getProperty('bgcolor'),
            gradient = this.getProperty('bgcolorgradient'),
            colorend = this.getProperty('bgcolorgradientend');

        var normalStyle = this.getBackgroundCSS(color, gradient, colorend, background, gradientBackgroundProps);

        this.addLocalStyle('normal', 'bgcolor', normalStyle);


        var hoverStyle = '',
            isHoverDifferent = false,
            colorHover = this.getProperty('bgcolor-hover'),
            gradientHover = this.getProperty('bgcolorgradient-hover'),
            colorendHover = this.getProperty('bgcolorgradientend-hover');

        if (colorHover !== undefined && colorHover != color) {
            isHoverDifferent = true;
        }
        if (gradientHover !== undefined && gradientHover != gradient) {
            isHoverDifferent = true;
        }
        if (colorendHover !== undefined && colorendHover != colorend) {
            isHoverDifferent = true;
        }

        if (isHoverDifferent) {
            if (colorHover === undefined) {
                colorHover = color;
            }
            if (gradientHover === undefined) {
                gradientHover = gradient;
            }
            if (colorendHover === undefined) {
                colorendHover = colorend;
            }
            hoverStyle = this.getBackgroundCSS(colorHover, gradientHover, colorendHover, background, gradientBackgroundProps);
        }
        this.addLocalStyle('hover', 'bgcolor', hoverStyle);
    };

    ContentAbstract.prototype.getBackgroundCSS = function (color, gradient, colorend, backgroundImage, gradientBackgroundProps) {
        if (N2Color.hex2alpha(color) != 0 || (gradient != 'off' && N2Color.hex2alpha(colorend) != 0)) {
            var after = '';
            if (backgroundImage != '') {
                after = gradientBackgroundProps + ',' + backgroundImage;
            }
            switch (gradient) {
                case 'horizontal':
                    return 'background:linear-gradient(to right, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorend) + ' 100%)' + after + ';';
                case 'vertical':
                    return 'background:linear-gradient(to bottom, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorend) + ' 100%)' + after + ';';
                case 'diagonal1':
                    return 'background:linear-gradient(45deg, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorend) + ' 100%)' + after + ';';
                case 'diagonal2':
                    return 'background:linear-gradient(135deg, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorend) + ' 100%)' + after + ';';
                case 'off':
                default:
                    if (backgroundImage != '') {
                        return "background: linear-gradient(" + N2Color.hex2rgbaCSS(color) + ", " + N2Color.hex2rgbaCSS(color) + ")" + after + ';';
                    }
                    return 'background:' + N2Color.hex2rgbaCSS(color) + ';';
            }
        } else if (backgroundImage != '') {
            return 'background:' + backgroundImage + ';';
        }
        return '';
    };

    ContentAbstract.prototype.getData = function (params) {
        var data = N2Classes.ComponentAbstract.prototype.getData.call(this, params);

        if (params.layersIncluded) {
            data.layers = this.container.getData(params);
        }

        return data;
    };

    ContentAbstract.prototype.onChildCountChange = function () {
        this.layer.toggleClass('n2-ss-content-empty', this.container.getLayerCount() == 0);

        this.update();
    };

    ContentAbstract.prototype.renderModeProperties = function (isReset) {
        N2Classes.ComponentAbstract.prototype.renderModeProperties.call(this, isReset);

        this._syncmaxwidth();

        this._syncpadding();
        this._syncinneralign();
    };

    ContentAbstract.prototype.getDroppable = function () {
        if (!this.layer.is(":visible") || this.status == N2Classes.ComponentAbstract.STATUS.HIDDEN || this.status == N2Classes.ComponentAbstract.STATUS.LOCKED) {
            return 'hidden';
        }
        return {
            $container: this.$content,
            layer: this,
            placement: 'normal',
            axis: 'y'
        }
    };

    ContentAbstract.prototype.getLLDroppable = function (layer) {
        switch (layer.type) {
            case 'layer':
            case 'row':
                return {
                    $container: this.container.$ul,
                    layer: this
                };
                break;
        }
        return false;
    };

    ContentAbstract.prototype.getContents = function () {
        return this.$content;
    };

    ContentAbstract.prototype.setPropertystylemode = function (name, value, from) {
        this.stylemode = value;

        this.syncAdvancedField('bgcolor');
        this.syncAdvancedField('bgcolorgradient');
        this.syncAdvancedField('bgcolorgradientend');
    };

    ContentAbstract.prototype.onSyncFields = function () {
        this.fragmentEditor.layerOptions.updateField('stylemode', this.stylemode);
    };

    return ContentAbstract;
});
N2D('Layer', ['ComponentAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments ComponentAbstract
     */
    function Layer(fragmentEditor, group, properties) {
        this.label = n2_('Layer');
        this.type = 'layer';

        this.parent = false;

        this.itemEditor = fragmentEditor.itemEditor;

        N2Classes.ComponentAbstract.prototype.constructor.call(this, fragmentEditor, group, properties);

        this.placement.allow('absolute');
        this.placement.allow('normal');

        this.$.on('load create', $.proxy(this.startItem, this));
    };

    Layer.prototype = Object.create(N2Classes.ComponentAbstract.prototype);
    Layer.prototype.constructor = Layer;


    Layer.prototype.create = function () {

        N2Classes.ComponentAbstract.prototype.create.apply(this, arguments);

        this.initUI();

        this._onReady();
    };

    Layer.prototype.load = function ($layer, isEditorStart) {

        N2Classes.ComponentAbstract.prototype.load.call(this, $layer, isEditorStart);

        this.initUI();

        this._onReady();
    };

    Layer.prototype.startItem = function () {
        var $item = this.layer.find('.n2-ss-item');

        new N2Classes[this.itemEditor.getItemClass($item.data('item'))]($item, this, this.itemEditor);

        this.layer.nUICanvasItem({
            canvasUIManager: this.fragmentEditor.mainContainer.canvasUIManager,
            layer: this,
            $layer: this.layer
        });

        if (this.item.needSize) {
            this.layer.addClass('n2-ss-layer-needsize');
        }
    };

    Layer.prototype.initUI = function () {

        this.layer.on({
            mousedown: $.proxy(N2Classes.WindowManager.setMouseDownArea, null, 'layerClicked'),
            click: $.proxy(function (e) {
                if (this.fragmentEditor.preventActivationBubbling()) {
                    this.activate(e);
                }
            }, this),
            dblclick: $.proxy(function (e) {
                if (!N2Classes.WindowManager.get().isPreventDblClick) {
                    e.stopPropagation();
                    $('[data-tab="item"]').trigger('click');
                    this.item.itemEditor.focusFirst('dblclick');
                }
            }, this)
        });
    };

    Layer.prototype.getContent = function () {

        var $content = this.layer,
            selector = $content.data('animatableselector');
        if (selector) {
            $content = $content.find(selector);
        }
        return $content;
    };

    Layer.prototype._createLayer = function () {
        return $('<div class="n2-ss-layer"></div>')
            .attr('data-sstype', this.type);
    };

    Layer.prototype.createRow = function () {
        var status = $('<div class="n2-ss-layer-status"></div>'),
            remove = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Delete layer') + '"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>').on('click', $.proxy(this.delete, this)),
            duplicate = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Duplicate layer') + '"><i class="n2-i n2-i-duplicate n2-i-grey-opacity"></i></div>').on('click', $.proxy(function () {
                this.duplicate(true, false)
            }, this));

        $('<a href="#" class="n2-ss-sc-hide n2-button n2-button-icon n2-button-m"><i class="n2-i n2-i-eye"></i></a>').appendTo(status).on('click', $.proxy(function (e) {
            e.preventDefault();
            if (this.status == N2Classes.ComponentAbstract.STATUS.HIDDEN) {
                this.setStatusNormal();
            } else {
                this.changeStatus(N2Classes.ComponentAbstract.STATUS.HIDDEN);
            }
        }, this));


        this._createLayerListRow([
            $('<div class="n2-actions-left"></div>').append(status),
            $('<div class="n2-actions"></div>').append(duplicate).append(remove)
        ])
            .addClass('n2-ss-layer-layer-row');
    };

    /**
     *
     * @param e if provided, the layerWindow will show
     * @param context
     * @param preventExitFromSelection
     */
    Layer.prototype.activate = function (e, context, preventExitFromSelection) {

        N2Classes.PluginActivatable.prototype.activate.call(this, e, context, preventExitFromSelection);

        if (this.item) {
            this.item.activate(null, context);
        } else {
            console.error('The layer do not have item on it!');
        }
    };

    Layer.prototype.getHTML = function (base64) {

        var $node = N2Classes.ComponentAbstract.prototype.getHTML.call(this, base64);

        var $item = this.item.getHTML(base64);
        $node.attr('style', $node.attr('style') + this.getStyleText())
            .append($item);

        return $node;
    };

    Layer.prototype.getData = function (params) {
        var data = N2Classes.ComponentAbstract.prototype.getData.call(this, params);

        if (params.itemsIncluded) {
            data.item = this.item.getData();
        }
        return data;
    };

    Layer.prototype.getStyleText = function () {
        var style = '';
        var crop = this.property.crop;
        if (crop == 'auto' || crop == 'mask') {
            crop = 'hidden';
        }

        style += 'overflow:' + crop + ';';
        return style;
    };

    Layer.prototype.getContents = function () {
        return this.item.$item;
    };

    Layer.prototype.onSelfChange = function () {
        N2Classes.ComponentAbstract.prototype.onSelfChange.call(this);

        this.item.setSelf(this.self.item);
    };

    return Layer;
});
N2D('LayerAdvancedProperty', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param basename
     * @param def
     * @param modesDef
     * @param obj
     * @param propName
     * @constructor
     */
    function LayerAdvancedProperty(basename, def, modesDef, obj, propName) {
        this.basename = basename;
        this.def = def;
        this.modesDef = modesDef;
        this.obj = obj;
        this.propName = propName;
    }

    LayerAdvancedProperty.prototype.getBaseName = function () {
        return this.basename;
    };

    /**
     *
     * @returns {object}
     */
    LayerAdvancedProperty.prototype.getNames = function () {
        var a = {};
        a[this.basename] = this.def;
        for (var k in this.modesDef) {
            a[this.basename + k] = this.modesDef[k];
        }
        return a;
    };

    LayerAdvancedProperty.prototype.getCurrentMode = function () {
        return this.obj[this.propName];
    };

    LayerAdvancedProperty.prototype.getName = function () {
        var currentMode = this.getCurrentMode();
        if (currentMode !== '') {
            return this.basename + currentMode;
        }
        return this.basename;
    };

    LayerAdvancedProperty.prototype.getDefault = function () {
        var currentMode = this.getCurrentMode();
        if (currentMode !== '') {
            return this.modesDef[currentMode];
        }
        return this.def;
    };

    LayerAdvancedProperty.prototype.resetMode = function (name) {
        if (this.propName == name) {
            var currentMode = this.getCurrentMode();
            if (currentMode !== '') {
                var oldValue = this.obj.property[this.basename + currentMode];
                this.obj.property[this.basename + currentMode] = this.modesDef[currentMode];
                this.obj.syncAdvancedField(this.basename);

                this.obj.render(this.basename + currentMode, oldValue, 'manager');
            }
        }
    };

    return LayerAdvancedProperty;
});
N2D('MainContainer', ['LayerContainer'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FragmentEditor} fragmentEditor
     * @constructor
     */
    function MainContainer(fragmentEditor) {

        this.baseSize = 16;

        this.activeLayer = null;

        this.$ = fragmentEditor.$;

        this.isActiveGroupBlurred = true;

        this.isMainGroup = true;
        this.fragmentEditor = fragmentEditor;
        this.layer = fragmentEditor.editor.getMainContainerElement();

        this.layer.nUICanvas({
            mainContainer: this,
            tolerance: 5,
            smartguides: $.proxy(function (context) {
                context.$layer.triggerHandler('LayerParent');
                return this.fragmentEditor.getSnap();
            }, this),
            display: {
                hidden: true,
                show: $.proxy(function () {
                    N2Classes.PositionDisplay.get().show('Canvas');
                }, this),
                update: $.proxy(function (e, position) {
                    N2Classes.PositionDisplay.get().update(e, 'Canvas', 'L: ' + parseInt(position.left | 0) + 'px<br />T: ' + parseInt(position.top | 0) + 'px');

                }, this),
                hide: $.proxy(function () {
                    N2Classes.PositionDisplay.get().hide('Canvas');
                }, this)
            },
            start: $.proxy(function (e, ui) {
                this.fragmentEditor.canvasDragStart(e, ui);
            }, this),
            drag: $.proxy(function (e, ui) {
                this.fragmentEditor.canvasDragMove(e, ui);

                if (ui.layer) ui.layer.placement.current.triggerLayerResized();
            }, this),
            stop: $.proxy(function (e, ui) {
                this.fragmentEditor.canvasDragStop(e, ui);

                if (ui.layer) ui.layer.placement.current.triggerLayerResized();
            }, this)
        });
        this.canvasUIManager = this.layer.nUICanvas('instance');

        this.layer.nUILayerList({
            mainContainer: this,
            $fixed: $('#n2-ss-layers'),
            $scrolled: $('#n2-ss-layer-list')
        });
        this.layerListUIManager = this.layer.nUILayerList('instance');

        this.layer.parent().prepend('<div class="n2-ss-slide-border n2-ss-slide-border-left" /><div class="n2-ss-slide-border n2-ss-slide-border-top" /><div class="n2-ss-slide-border n2-ss-slide-border-right" /><div class="n2-ss-slide-border n2-ss-slide-border-bottom" />');

        this.container = new N2Classes.LayerContainer(this, $('#n2-ss-layer-list').find('ul'), 'absolute', '> .n2-ss-layer, > .n2-ss-layer-group', ['content', 'row', 'layer', 'group']);

        this.layerRow = this.container.$ul;

        this.$.on('layerCreated', $.proxy(function () {
            this.refreshHasLayers();
        }, this));
    }

    MainContainer.prototype.lateInit = function () {

        this.container.startWithExistingNodes(true);

        this.layer.parent().on('click', $.proxy(function () {
            if (this.fragmentEditor.shouldPreventActivationBubble) {
                this.blurActiveGroup();
            } else {
                this.unBlurActiveGroup();
            }
            this.fragmentEditor.allowActivation();
        }, this));
    };

    MainContainer.prototype.onResize = function (ratios) {
        var sortedLayerList = this.getEverySortedLayers();

        for (var i = 0; i < sortedLayerList.length; i++) {
            sortedLayerList[i].placement.doLinearResize(ratios);
        }
    };

    MainContainer.prototype.getEverySortedLayers = function () {
        var list = this.container.getChildLayersRecursive(false),
            children = {};
        for (var i = list.length - 1; i >= 0; i--) {
            if (typeof list[i].property.parentid !== 'undefined' && list[i].property.parentid) {
                if (typeof children[list[i].property.parentid] == 'undefined') {
                    children[list[i].property.parentid] = [];
                }
                children[list[i].property.parentid].push(list[i]);
                list.splice(i, 1);
            }
        }
        for (var i = 0; i < list.length; i++) {
            if (typeof list[i].property.id !== 'undefined' && list[i].property.id && typeof children[list[i].property.id] !== 'undefined') {
                children[list[i].property.id].unshift(0);
                children[list[i].property.id].unshift(i + 1);
                list.splice.apply(list, children[list[i].property.id]);
                delete children[list[i].property.id];
            }
        }
        return list;
    };

    MainContainer.prototype.deleteLayers = function () {
        var layers = this.container.getSortedLayers();
        for (var i = 0; i < layers.length; i++) {
            layers[i].delete();
        }
    };

    MainContainer.prototype.blurActiveGroup = function () {
        this.isActiveGroupBlurred = true;
    };

    MainContainer.prototype.unBlurActiveGroup = function () {
        this.isActiveGroupBlurred = false;
    };

    MainContainer.prototype.getActiveGroup = function () {
        if (this.isActiveGroupBlurred) {
            var group = this,
                activeLayer = this.activeLayer;
            if (this.fragmentEditor.isGroup(activeLayer) || this.fragmentEditor.isCol(activeLayer) || this.fragmentEditor.isContent(activeLayer)) {
                group = activeLayer;
            } else if (this.fragmentEditor.isRow(activeLayer)) {
                group = activeLayer.container.getSortedLayers()[0];
            } else if (activeLayer) {
                group = activeLayer.group;
            }
            switch (this.fragmentEditor.currentEditorMode) {
                case  'content':
                    if (group == this) {
                        group = this.fragmentEditor.mainContent;
                    }
                    break;
                case  'canvas':
                    if (group == this.fragmentEditor.mainContent) {
                        group = this;
                    }
                    break;
            }

            return group;
        }
        switch (this.fragmentEditor.currentEditorMode) {
            case  'content':
                return this.fragmentEditor.mainContent;
        }
        return this;
    };

    MainContainer.prototype.getSelectedLayer = function () {
        if (this.activeLayer == null) {
            return false;
        }
        return this.activeLayer;
    };

    MainContainer.prototype.getLayerData = function (requestedLayers) {
        if (requestedLayers === undefined) {
            return [];
        }
        var layersData = [],
            layers = [];

        for (var i = 0; i < requestedLayers.length; i++) {
            requestedLayers[i].getDataWithChildren(layersData, layers);
        }
        return layersData;
    };

    MainContainer.prototype.layerDeleted = function (layer) {

        var i = this.fragmentEditor.selectedLayers.length;
        while (i--) {
            if (layer == this.fragmentEditor.selectedLayers[i]) {
                this.fragmentEditor.selectedLayers.splice(i, 1);
            }
        }

        this._afterLayerDeletedDeBounced(layer);

        this.refreshHasLayers();
    };

    MainContainer.prototype._afterLayerDeletedDeBounced = NextendDeBounce(function (layer) {

        if (!this.activeLayer || this.activeLayer.isDeleted) {
            this.fragmentEditor.resetActiveLayer();
        }
    }, 50);

    MainContainer.prototype.refreshHasLayers = function () {
        $('body').toggleClass('n2-ss-has-layers', this.container.getLayerCount() > 0);
        nextend.triggerResize();
    };

    MainContainer.prototype.getName = function () {
        return 'Slide';
    };

    MainContainer.prototype.update = function () {

    };

    MainContainer.prototype.onChildCountChange = function () {

    };

    MainContainer.prototype.markEnter = function (e) {

    };

    MainContainer.prototype.markLeave = function (e) {

    };

    MainContainer.prototype.getSelf = function () {
        return this;
    };

    /**
     *
     * @returns {N2Classes.FrontendLayerAnimationManager[]}
     */
    MainContainer.prototype.createLayerAnimations = function () {

        var horizontalRatio = this.fragmentEditor.editor.getHorizontalRatio(),
            verticalRatio = this.fragmentEditor.editor.getVerticalRatio(),
            animations = [],
            children = this.container.getSortedLayers();
        for (var i = 0; i < children.length; i++) {
            animations.push.apply(animations, children[i].createLayerAnimations(horizontalRatio, verticalRatio));
        }
        return animations;
    };

    MainContainer.prototype.getDroppables = function (exclude) {
        var editorMode = this.fragmentEditor.currentEditorMode,
            droppables = [],
            layers;

        if (editorMode == 'canvas') {
            droppables.push(this.getDroppable());
            layers = this.container.getSortedLayers();
            var index = $.inArray(this.fragmentEditor.mainContent, layers);
            if (index > -1) {
                layers.splice(index, 1);
            }
        } else if (editorMode == 'content') {
            layers = [this.fragmentEditor.mainContent]
        }

        for (var i = 0; i < layers.length; i++) {
            if (layers[i] == exclude) continue;
            var droppable = layers[i].getDroppable();
            if (typeof droppable == 'object') {
                droppables.push(droppable);
            }
            if (droppable != 'hidden' && layers[i].container) {
                droppables.push.apply(droppables, layers[i].container.getDroppables(exclude));
            }
        }

        return droppables;
    };

    MainContainer.prototype.getLLDroppables = function (layer) {
        return this.container.getLLDroppables(layer);
    };

    MainContainer.prototype.getDroppable = function () {
        return {
            $container: this.layer,
            layer: this,
            placement: 'absolute'
        }
    };

    MainContainer.prototype.getLLDroppable = function (layer) {
        switch (layer.type) {
            case 'layer':
            case 'row':
            case 'group':
            case 'content':
                return {
                    $container: this.container.$ul,
                    layer: this
                };
                break;
        }
        return false;
    };

    MainContainer.prototype.replaceLayers = function (layersData) {

        this._idTranslation = {};
        var layerNodes = this.dataToLayers($.extend(true, [], layersData).reverse()),
            layers = [];

        this.deleteLayers();

        this.fragmentEditor.mainContent.remove();


        for (var i = 0; i < layerNodes.length; i++) {
            layers.push(this.container.append(layerNodes[i]));
        }

        this.fragmentEditor.refreshMode();

        this.container.layerContainerElement.n2imagesLoaded()
            .always($.proxy(this.fragmentEditor.refreshMode, this.fragmentEditor));

        if (!this.getSelectedLayer()) {
            if (layers.length > 0) {
                layers[0].activate();
            }
        }

        if (N2Classes.History.get().isEnabled()) {
            N2Classes.History.get().addSimple(this, this.historyDeleteAll, this.historyReplaceLayers, [layersData, layers, this.container.getAllLayers()]);
        }

        return layers;
    };

    MainContainer.prototype.historyDeleteAll = function (layersData, historicalLayers) {
        for (var i = 0; i < historicalLayers.length; i++) {
            historicalLayers[i].getSelf().delete();
        }

        this.fragmentEditor.mainContent.getSelf().remove();
    };

    MainContainer.prototype.historyReplaceLayers = function (layersData, historicalLayers, historicalAllLayers) {
        this.replaceLayers(layersData);

        var layers = this.container.getAllLayers();
        for (var i = 0; i < historicalAllLayers.length; i++) {
            historicalAllLayers[i].setSelf(layers[i]);
        }
    };

    MainContainer.prototype.addLayers = function (layersData, group) {

        this._idTranslation = {};
        var layerNodes = this.dataToLayers($.extend(true, [], layersData)),
            layers = [];

        for (var i = 0; i < layerNodes.length; i++) {
            layers.push(group.container.append(layerNodes[i]));
        }

        this.fragmentEditor.refreshMode();

        N2Classes.History.get().addSimple(this, this.historyDeleteLayers, this.historyAddLayers, [layersData, layers, group]);

        return layers;
    };

    MainContainer.prototype.historyDeleteLayers = function (layersData, historicalLayers, historicalGroup) {
        for (var i = 0; i < historicalLayers.length; i++) {
            historicalLayers[i].getSelf().delete();
        }
    };

    MainContainer.prototype.historyAddLayers = function (layersData, historicalLayers, historicalGroup) {
        var layers = this.addLayers(layersData, historicalGroup.getSelf());
        for (var i = 0; i < historicalLayers.length; i++) {
            historicalLayers[i].setSelf(layers[i]);
        }
    };

    MainContainer.prototype.dataToLayers = function (layers, $targetGroupContent) {
        var nodes = [];
        for (var i = 0; i < layers.length; i++) {
            switch (layers[i].type) {
                case 'group':
                    console.error('Group data to layer not implemented!');
                    //new N2Classes.Group(this, this.mainContainer, false, layers[i].data, layers[i]);
                    break;
                case 'row':
                    nodes.push(this.buildRowNode(layers[i], $targetGroupContent));
                    break;
                case 'col':
                    nodes.push(this.buildColNode(layers[i], $targetGroupContent));
                    break;
                case 'content':
                    nodes.push(this.buildContentNode(layers[i], $targetGroupContent));
                    break;
                case 'layer':
                default:
                    nodes.push(this.buildLayerNode(layers[i], $targetGroupContent));
                    break;
            }
        }

        return nodes;
    };

    MainContainer.prototype._buildNodePrepareID = function ($layer, layerData) {
        if (layerData.id) {
            var id = $.fn.uid();

            var deferred = false;
            if (typeof this._idTranslation[layerData.id] == 'object') {
                deferred = this._idTranslation[layerData.id];
            }

            this._idTranslation[layerData.id] = id;
            layerData.id = id;
            $layer.attr('id', id);

            if (deferred) {
                deferred.resolve(layerData.id, id);
            }
        }
        if (layerData.parentid) {
            switch (typeof this._idTranslation[layerData.parentid]) {
                case 'string':
                    layerData.parentid = this._idTranslation[layerData.parentid];
                    break;
                case 'undefined':
                    this._idTranslation[layerData.parentid] = $.Deferred();
                case 'object':
                    this._idTranslation[layerData.parentid].done($.proxy(function ($_layer, originalID, newID) {
                        $_layer.data('parentid', newID);
                    }, this, $layer));
                    break;
                default:
                    layerData.parentid = '';
            }
        }
    };


    MainContainer.prototype.buildContentNode = function (layerData, $targetGroupContent) {

        var $layer = $("<div class='n2-ss-layer' data-sstype='content'/>"),
            $content = $("<div class='n2-ss-section-main-content n2-ss-layer-content' />").appendTo($layer);
        for (var k in layerData) {
            $layer.data(k, layerData[k]);
        }

        if ($targetGroupContent !== undefined) {
            $layer.appendTo($targetGroupContent);
        }

        this.dataToLayers(layerData.layers, $content);

        return $layer;
    };

    MainContainer.prototype.buildRowNode = function (layerData, $targetGroupContent) {

        var $layer = $("<div class='n2-ss-layer' data-sstype='row'/>"),
            $content = $("<div class='n2-ss-layer-row' />").appendTo($layer);

        this._buildNodePrepareID($layer, layerData);
        for (var k in layerData) {
            $layer.data(k, layerData[k]);
        }

        if ($targetGroupContent !== undefined) {
            $layer.appendTo($targetGroupContent);
        }

        this.dataToLayers(layerData.cols, $content);

        return $layer;
    };

    MainContainer.prototype.buildColNode = function (layerData, $targetGroupContent) {

        var $layer = $("<div class='n2-ss-layer' data-sstype='col'/>"),
            $content = $("<div class='n2-ss-layer-col n2-ss-layer-content' />").appendTo($layer);
        for (var k in layerData) {
            $layer.data(k, layerData[k]);
        }

        if ($targetGroupContent !== undefined) {
            $layer.appendTo($targetGroupContent);
        }

        this.dataToLayers(layerData.layers, $content);

        return $layer;
    };

    MainContainer.prototype.buildLayerNode = function (layerData, $targetGroupContent) {

        var $layer = $("<div class='n2-ss-layer' data-sstype='layer'></div>")
            .attr('style', layerData.style);

        var storedIndex = 1;
        if (layerData.zIndex) {
            storedIndex = layerData.zIndex;
        }

        this._buildNodePrepareID($layer, layerData);

        if (layerData.items !== undefined) {
            layerData.item = layerData.items[0];
            delete layerData.items;
        }

        $('<div class="n2-ss-item n2-ss-item-' + layerData.item.type + '"></div>')
            .data('item', layerData.item.type)
            .data('itemvalues', layerData.item.values)
            .appendTo($layer);

        delete layerData.style;
        delete layerData.item;
        for (var k in layerData) {
            $layer.data(k, layerData[k]);
        }

        if ($targetGroupContent !== undefined) {
            $layer.appendTo($targetGroupContent);
        }

        return $layer;
    };

    return MainContainer;
});
N2D('Row', ['LayerContainer', 'ComponentAbstract'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param fragmentEditor
     * @param group
     * @param properties
     * @constructor
     * @augments ComponentAbstract
     */
    function Row(fragmentEditor, group, properties) {
        this.label = n2_('Row');
        this.type = 'row';

        this._syncbgThrottled = NextendThrottle(this._syncbgThrottled, 50);

        this.innerContainer = '> .n2-ss-layer-row > .n2-ss-layer-row-inner';

        this.localStyle = [
            {
                group: 'normal', selector: '-inner', css: {
                    transition: 'transition:all .3s;transition-property:border,background-image,background-color,border-radius,box-shadow;'
                }
            },
            {group: 'hover', selector: '-inner:HOVER', css: {}}
        ];

        this.columnsField = $('#layerrow-columns').data('field');

        this.refreshUI = NextendDeBounce(this.refreshUI, 100);

        this.stylemode = '';

        N2Classes.ComponentAbstract.prototype.constructor.call(this, fragmentEditor, group, properties);

        this.placement.allow('absolute');
        this.placement.allow('normal');
    }

    Row.prototype = Object.create(N2Classes.ComponentAbstract.prototype);
    Row.prototype.constructor = Row;

    Row.prototype.addProperties = function ($layer) {

        this.createProperty('opened', 1, $layer, this);

        N2Classes.ComponentAbstract.prototype.addProperties.call(this, $layer);


        this.createProperty('href', '', $layer);
        this.createProperty('href-target', '_self', $layer);

        this.createProperty('bgimage', '', $layer);
        this.createProperty('bgimagex', 50, $layer);
        this.createProperty('bgimagey', 50, $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('bgcolor', '00000000', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('bgcolorgradient', 'off', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('bgcolorgradientend', '00000000', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('borderradius', 0, {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createAdvancedProperty(new N2Classes.LayerAdvancedProperty('boxshadow', '0|*|0|*|0|*|0|*|00000080', {
            "-hover": undefined
        }, this, "stylemode"), $layer);

        this.createProperty('fullwidth', 1, $layer);
        this.createProperty('stretch', 0, $layer);


        this.createDeviceProperty('inneralign', {desktopPortrait: 'inherit'}, $layer);
        this.createDeviceProperty('padding', {desktopPortrait: '10|*|10|*|10|*|10|*|px+'}, $layer);
        this.createDeviceProperty('gutter', {desktopPortrait: 20}, $layer);
        this.createDeviceProperty('wrapafter', {desktopPortrait: 0, mobilePortrait: 1, mobileLandscape: 1}, $layer);

        this.$.on('baseSizeUpdated.row', $.proxy(this._syncpadding, this));
    };

    Row.prototype.historyDeleteSelf = function () {
        this.delete();
    };

    Row.prototype.historyCreateSelf = function (historyGroup, preset, historyCols) {
        var newLayer = new N2Classes.Row(this.fragmentEditor, historyGroup.getSelf(), {});
        newLayer.create(preset);

        this.setSelf(newLayer);

        var newCols = newLayer.container.getSortedLayers();
        for (var i = 0; i < newCols.length; i++) {
            historyCols[i].setSelf(newCols[i]);
        }
    };

    Row.prototype.create = function (preset) {
        var cb,
            _createRawRow = function (cols) {
                return $("<div class='n2-ss-layer' />")
                    .append($("<div class='n2-ss-layer-row' />")
                        .append($("<div class='n2-ss-layer-row-inner' />")
                            .append(cols)))
                    .attr('data-sstype', 'row');
            },
            _createRawCol = function (inner) {
                return $("<div class='n2-ss-layer' data-sstype='col'/>").append($("<div class='n2-ss-layer-col n2-ss-layer-content' />").append(inner));
            };
        switch (preset) {
            case '2col':
                cb = function (layer) {
                    return _createRawRow([_createRawCol(), _createRawCol()]);
                };
                break;
            case '2col-60-40':
                cb = function (layer) {
                    return _createRawRow([_createRawCol().data('colwidth', '6/10'), _createRawCol().data('colwidth', '4/10')]);
                };
                break;
            case '2col-40-60':
                cb = function (layer) {
                    return _createRawRow([_createRawCol().data('colwidth', '4/10'), _createRawCol().data('colwidth', '6/10')]);
                };
                break;
            case '2col-80-20':
                cb = function (layer) {
                    return _createRawRow([_createRawCol().data('colwidth', '8/10'), _createRawCol().data('colwidth', '2/10')]);
                };
                break;
            case '2col-20-80':
                cb = function (layer) {
                    return _createRawRow([_createRawCol().data('colwidth', '2/10'), _createRawCol().data('colwidth', '8/10')]);
                };
                break;
            case '3col':
                cb = function (layer) {
                    return _createRawRow([_createRawCol(), _createRawCol(), _createRawCol()]);
                };
                break;
            case '3col-20-60-20':
                cb = function (layer) {
                    return _createRawRow([_createRawCol().data('colwidth', '2/10'), _createRawCol().data('colwidth', '6/10'), _createRawCol().data('colwidth', '2/10')]);
                };
                break;
            case '4col':
                cb = function (layer) {
                    return _createRawRow([_createRawCol(), _createRawCol(), _createRawCol(), _createRawCol()]);
                };
                break;

            case "special":
                cb = function (layer) {
                    var $innerRow = _createRawRow([_createRawCol(), _createRawCol()]);
                    return _createRawRow([_createRawCol().data('colwidth', '1/5'), _createRawCol($innerRow).data('colwidth', '4/5')]);
                };
                break;
            default:
                cb = function (layer) {
                    return _createRawRow([_createRawCol()]);
                };
        }

        if (this.group.container.allowedPlacementMode === 'absolute') {
            this.originalProperties = $.extend({
                width: '100%',
                align: 'center',
                valign: 'top',
                top: 20
            }, this.originalProperties);
        }

        N2Classes.ComponentAbstract.prototype.create.call(this, cb, true);

        this.initUI();

        this.container.startWithExistingNodes(false);

        this._syncpadding();
        this._syncinneralign();
        this._syncfullwidth();
        this._syncstretch();
        this._syncbgThrottled();
        this._syncborderradius();
        this._syncboxshadow();


        this.renderModeProperties();
        this.container.renderModeProperties();


        N2Classes.History.get().addSimple(this, this.historyDeleteSelf, this.historyCreateSelf, [this.group, preset, this.container.getSortedLayers()]);

        this._onReady();
    };

    Row.prototype.load = function ($layer, isEditorStart) {

        N2Classes.ComponentAbstract.prototype.load.call(this, $layer, isEditorStart);

        this.initUI();

        this.container.startWithExistingNodes(isEditorStart);

        this._syncpadding();
        this._syncinneralign();
        this._syncfullwidth();
        this._syncstretch();
        this._syncbgThrottled();
        this._syncborderradius();
        this._syncboxshadow();

        this._onReady();
    };

    Row.prototype.initUI = function () {

        this.layer.nUICanvasItem({
            canvasUIManager: this.fragmentEditor.mainContainer.canvasUIManager,
            layer: this,
            $layer: this.layer
        });

        this.layer.on({
            mousedown: $.proxy(N2Classes.WindowManager.setMouseDownArea, null, 'layerClicked'),
            click: $.proxy(function (e) {
                if (!nextend.shouldPreventMouseUp && this.fragmentEditor.preventActivationBubbling()) {
                    this.activate(e);
                }
            }, this),
            dblclick: $.proxy(function (e) {
                e.stopPropagation();
                $('[data-tab="row"]').trigger('click');
            }, this)
        });

        this.$row.nUISpacing({
            handles: 'n, s, e, w',
            start: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().show('Spacing');
            }, this),
            spacing: $.proxy(function (e, ui) {
                var html = '';
                for (var k in ui.changed) {
                    html += 'Padding ' + k + ': ' + ui.changed[k] + 'px<br>';
                }
                N2Classes.PositionDisplay.get().update(e, 'Spacing', html);
            }, this),
            stop: $.proxy(this.____makeLayerResizeableStop, this),
        });

        this.$row.nUIColumns({
            columns: '1',
            gutter: this.getGutter(),
            start: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().show('Columns');
            }, this),
            colwidth: $.proxy(function (e, ui) {
                this.updateColumnWidth(ui.currentPercent);

                N2Classes.PositionDisplay.get().update(e, 'Columns', Math.round(ui.currentPercent[ui.index] * 100) + '% &mdash; ' + Math.round(ui.currentPercent[ui.index + 1] * 100) + '%');


            }, this),
            stop: $.proxy(function (e, ui) {
                N2Classes.PositionDisplay.get().hide('Columns');

                this.setRealColsWidth(ui.currentFractions);
            }, this)
        });

        var context = {};

        this.$rowInner.nUISortableRow({
            distance: 10,
            helper: 'clone_hide',
            forceHelperSize: true,
            forcePlaceholderSize: true,
            items: '> .n2-ss-layer',
            handle: " > .n2-ss-layer-ui-label-container > .n2-ss-layer-ui-label-self",
            start: $.proxy(function (e, ui) {
                context.originalPrevLayer = ui.item.prevAll('.n2-ss-layer').not(ui.placeholder).first()
                    .data('layerObject');

                var parts = this.getColumns().split('+');

                ui.placeholder.css({
                    width: ((new Fraction(parts[ui.item.data('layerObject').getIndex()])).valueOf() * 100) + '%',
                    visibility: 'visible',
                    margin: this.getGutter() + 'px'
                });
                if (ui.helper.hasClass('n2-ss-last-in-row')) {
                    ui.placeholder.addClass('n2-ss-last-in-row');
                }

                ui.placeholder.css('order', ui.helper.css('order'));

                ui.placeholder.attr('data-r', ui.helper.attr('data-r'));

            }, this),
            beforestop: $.proxy(function (e, ui) {
                ui.placeholder.detach();
                context.layer = ui.item.data('layerObject');
                context.oldIndex = context.layer.getOrderedIndex();
            }, this),
            stop: $.proxy(function (e, ui) {
                var layer = context.layer,
                    oldIndex = context.oldIndex,
                    newIndex = 0;

                if (context.originalPrevLayer) {
                    layer.layer.insertAfter(context.originalPrevLayer.layer);
                } else {
                    layer.layer.prependTo(layer.group.container.layerContainerElement);
                }

                switch (ui.lastPosition[1]) {
                    case 'before':
                        newIndex = ui.lastPosition[0].data('layerObject').getOrderedIndex();
                        if (newIndex > oldIndex) {
                            newIndex--;
                        }
                        break;
                    case 'after':
                        newIndex = ui.lastPosition[0].data('layerObject').getOrderedIndex();
                        if (newIndex < oldIndex) {
                            newIndex++;
                        }
                        break;
                }
                if (oldIndex !== newIndex) {
                    this.moveCol(oldIndex, newIndex);
                }
            }, this)
        });
    };

    Row.prototype.____makeLayerResizeableStop = function (event, ui) {
        N2Classes.PositionDisplay.get().hide('Spacing');
        var padding = this.getPadding().split('|*|'),
            ratioH = 1,
            ratioV = 1;

        if (padding[padding.length - 1] == 'px+' && Math.abs(parseFloat(this.layer.css('fontSize')) - this.baseSize) > 1) {
            ratioH = this.fragmentEditor.getResponsiveRatioHorizontal();
            ratioV = this.fragmentEditor.getResponsiveRatioVertical();
        }

        for (var k in ui.changed) {
            var value = ui.changed[k];
            switch (k) {
                case 'top':
                    padding[0] = Math.round(value / ratioV);
                    break;
                case 'right':
                    padding[1] = Math.round(value / ratioH);
                    break;
                case 'bottom':
                    padding[2] = Math.round(value / ratioV);
                    break;
                case 'left':
                    padding[3] = Math.round(value / ratioH);
                    break;
            }
        }
        this.setProperty('padding', padding.join('|*|'));
        $('#layerrow-padding').data('field').insideChange(padding.join('|*|'));
    };

    Row.prototype._createLayer = function () {
        return $('<div class="n2-ss-layer"><div class="n2-ss-layer-row"><div class="n2-ss-layer-row-inner"></div></div></div>')
            .attr('data-sstype', this.type);
    };

    Row.prototype.historyDeleteCol = function (historicalRow, historicalCol) {
        historicalCol.getSelf().delete();
    };

    Row.prototype.historyCreateCol = function (historicalRow, historicalCol) {
        var newCol = historicalRow.getSelf().createCol();
        historicalCol.setSelf(newCol);
    };

    Row.prototype.createCol = function () {

        var col = new N2Classes.Col(this.fragmentEditor, this, {});
        N2Classes.History.get().addSimple(this, this.historyDeleteCol, this.historyCreateCol, [this, col]);
        col.create();
        if (this.isReady()) {
            this.placement.updatePosition();
        }

        return col;
    };

    Row.prototype.createRow = function () {
        this.$row = this.layer.find('.n2-ss-layer-row:first');
        this.$rowInner = this.$row.find('.n2-ss-layer-row-inner:first');

        //Fix for Slide Library 3.2 --> 3.3 change
        if (this.$rowInner.length === 0) {
            this.$rowInner = $('<div class="n2-ss-layer-row-inner"></div>').append(this.$row.find('> *')).appendTo(this.$row);
        }

        this.container = new N2Classes.LayerContainer(this, $('<ul class="n2-list n2-h4 n2-list-orderable" />'), 'default', ' > .n2-ss-layer', ['col']);
        this.container.setLayerContainerElement(this.$rowInner);

        this.addClassElement(this.layer);
        this.addClassElement(this.$row, '-inner');

        var status = $('<div class="n2-ss-layer-status"></div>'),
            remove = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Delete layer') + '"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>').on('click', $.proxy(this.delete, this)),
            duplicate = $('<div class="n2-button n2-button-icon n2-button-m n2-button-m-narrow" data-n2tip="' + n2_('Duplicate layer') + '"><i class="n2-i n2-i-duplicate n2-i-grey-opacity"></i></div>').on('click', $.proxy(function () {
                this.duplicate(true, false)
            }, this));

        $('<a href="#" class="n2-ss-sc-hide n2-button n2-button-icon n2-button-m"><i class="n2-i n2-i-eye"></i></a>').appendTo(status).on('click', $.proxy(function (e) {
            e.preventDefault();
            if (this.status == N2Classes.ComponentAbstract.STATUS.HIDDEN) {
                this.setStatusNormal();
            } else {
                this.changeStatus(N2Classes.ComponentAbstract.STATUS.HIDDEN);
            }
        }, this));

        this._createLayerListRow([
            $('<div class="n2-actions-left"></div>').append(status),
            $('<div class="n2-actions"></div>').append(duplicate).append(remove)
        ]).addClass('n2-ss-layer-row-row');

        this.openerElement = $('<a href="#" class="n2-ss-layer-icon n2-button n2-button-icon n2-button-m"><i class="n2-i n2-i-row"></i></a>').insertBefore(this.layerTitleSpan)
            .on('click', $.proxy(this.switchOpened, this));


        this.container.$ul.appendTo(this.layerRow);

        this.readyDeferred.done($.proxy(this._syncopened, this));
    };

    Row.prototype.activate = function () {
        N2Classes.PluginActivatable.prototype.activate.apply(this, arguments);

        this.columnsField.setRow(this);

        this.$row.nUIColumns('option', 'active', 1);
    };

    Row.prototype.deActivate = function () {

        this.$row.nUIColumns('option', 'active', 0);

        N2Classes.PluginActivatable.prototype.deActivate.apply(this, arguments);
    };

    Row.prototype.switchOpened = function (e) {
        e.preventDefault();
        if (this.getProperty('opened')) {
            this.setProperty('opened', 0);
        } else {
            this.setProperty('opened', 1);
        }
    };

    Row.prototype._syncopened = function () {
        if (this.getProperty('opened')) {
            this.openerElement.removeClass('n2-closed');
            this.container.$ul.css('display', '');

            this.layer.triggerHandler('opened');
        } else {
            this.openerElement.addClass('n2-closed');
            this.container.$ul.css('display', 'none');

            this.layer.triggerHandler('closed');
        }
    };

    Row.prototype.getColumns = function () {
        var layers = this.container.getSortedLayers(),
            columns = [];
        for (var i = 0; i < layers.length; i++) {
            columns.push(layers[i].getProperty('colwidth'));
        }
        return columns.join('+');
    };

    Row.prototype.getColumnsOrdered = function () {
        var layers = this.getOrderedColumns(),
            columns = [];
        for (var i = 0; i < layers.length; i++) {
            columns.push(layers[i].getProperty('colwidth'));
        }
        return columns.join('+');
    };

    Row.prototype._synccolumns = function () {
        var layers = this.container.getSortedLayers();
        for (var i = 0; i < layers.length; i++) {
            layers[i]._synccolwidth();
        }
        this.update();
    };

    Row.prototype.getPadding = function () {
        return this.getProperty('padding');
    };

    Row.prototype._syncpadding = function () {
        var padding = this.getPadding().split('|*|'),
            unit = padding.pop(),
            baseSize = this.baseSize;

        if (unit == 'px+' && baseSize > 0) {
            unit = 'em';
            for (var i = 0; i < padding.length; i++) {
                padding[i] = parseInt(padding[i]) / baseSize;
            }
        }

        var css = padding.join(unit + ' ') + unit;
        this.$row.css('padding', css);
        this.$row.nUISpacing('option', 'current', css);

        this.update();
    };

    Row.prototype.getGutter = function () {
        return this.getProperty('gutter');
    };

    Row.prototype._syncgutter = function () {
        var gutterValue = this.getGutter(),
            sideGutterValue = gutterValue / 2,
            cols = this.container.getSortedLayers();
        if (cols.length > 0) {
            for (var i = cols.length - 1; i >= 0; i--) {
                cols[i].layer
                    .css('margin', sideGutterValue + 'px');
            }
        }

        this.$rowInner.css({
            width: 'calc(100% + ' + (gutterValue + 1) + 'px)',
            margin: -sideGutterValue + 'px'
        });

        this.$row.nUIColumns('option', 'gutter', this.getGutter());

        this._syncwrapafter();

        this.update();
    };

    Row.prototype._syncwrapafter = function () {
        if (!this.isDeleted && !this.isDeleteStarted) {
            var wrapAfter = parseInt(this.getProperty('wrapafter')),
                columns = this.getOrderedColumns(),
                isWrapped = false,
                i;

            for (i = columns.length - 1; i >= 0; i--) {
                if (!columns[i].showsOnCurrent) {
                    columns.splice(i, 1);
                }
            }

            // columnsLength can be 0 if all the columns hidden in the row
            var columnsLength = columns.length;

            if (wrapAfter > 0 && wrapAfter < columnsLength) {
                isWrapped = true;
            }

            this.$row.attr('row-wrapped', isWrapped ? 1 : 0);

            if (isWrapped) {
                var flexLines = [];
                for (i = 0; i < columnsLength; i++) {
                    var row = Math.floor(i / wrapAfter);
                    if (typeof flexLines[row] === 'undefined') {
                        flexLines[row] = [];
                    }
                    flexLines[row].push(columns[i]);
                    columns[i].layer
                        .attr('data-r', row)
                        .toggleClass('n2-ss-last-in-row', (i + 1) % wrapAfter === 0 || i === columnsLength - 1);
                }

                var gutterValue = this.getGutter();
                for (i = 0; i < flexLines.length; i++) {
                    var flexLine = flexLines[i],
                        sumWidth = 0,
                        j;
                    for (j = 0; j < flexLine.length; j++) {
                        sumWidth += flexLine[j].getWidthPercentage();
                    }
                    for (j = 0; j < flexLine.length; j++) {
                        flexLine[j].layer.css('width', 'calc(' + (flexLine[j].getWidthPercentage() / sumWidth * 100) + '% - ' + (n2const.isIE || n2const.isEdge ? gutterValue + 1 : gutterValue) + 'px)');
                    }
                }
            } else {
                var sumWidth = 0;
                for (i = 0; i < columnsLength; i++) {
                    sumWidth += columns[i].getWidthPercentage();
                }
                for (i = 0; i < columnsLength; i++) {
                    columns[i].layer
                        .css('width', (columns[i].getWidthPercentage() / sumWidth * 100) + '%')
                        .removeClass('n2-ss-last-in-row')
                        .attr('data-r', 0);
                }
                if (columnsLength > 0) {
                    columns[columnsLength - 1].layer.addClass('n2-ss-last-in-row');
                }
            }

            this.update();
        }
    };

    Row.prototype.getOrderedColumns = function () {
        return this.container.getSortedLayers().sort(function (a, b) {
            return a.getRealOrder() - b.getRealOrder();
        });
    };

    Row.prototype.getInnerAlign = function () {
        return this.getProperty('inneralign');
    };

    Row.prototype._syncinneralign = function () {
        this.layer.attr('data-csstextalign', this.getInnerAlign());

        this.refreshTextAlign();
    };

    Row.prototype._syncfullwidth = function () {
        this.layer.attr('data-frontend-fullwidth', this.getProperty('fullwidth') == 0 ? '0' : '1')
    };

    Row.prototype._syncstretch = function () {
        this.layer.toggleClass('n2-ss-stretch-layer', this.getProperty('stretch') == 1);
    };

    Row.prototype._syncborderradius =
        Row.prototype['_syncborderradius-hover'] = function () {
            var borderRadius = this.getProperty('borderradius');
            if (borderRadius > 0) {
                this.addLocalStyle('normal', 'borderradius', 'border-radius:' + borderRadius + 'px;');
            }

            var borderRadiusHover = this.getProperty('borderradius-hover');
            if (borderRadiusHover && borderRadiusHover != borderRadius) {
                this.addLocalStyle('hover', 'borderradius', 'border-radius:' + borderRadiusHover + 'px;');
            }
        };

    Row.prototype._syncboxshadow =
        Row.prototype['_syncboxshadow-hover'] = function () {
            var boxShadow = this.getProperty('boxshadow');
            this.addLocalStyle('normal', 'boxshadow', this.getBoxShadowCSS(boxShadow.split('|*|')));

            var hoverStyle = '',
                boxShadowHover = this.getProperty('boxshadow-hover');
            if (boxShadowHover !== undefined && boxShadowHover != boxShadow) {
                hoverStyle = this.getBoxShadowCSS(boxShadowHover.split('|*|'));
            }
            this.addLocalStyle('hover', 'boxshadow', hoverStyle);
        };

    Row.prototype.getBoxShadowCSS = function (boxShadow) {
        if ((boxShadow[0] != 0 || boxShadow[1] != 0 || boxShadow[2] != 0 || boxShadow[3] != 0) && N2Color.hex2alpha(boxShadow[4]) != 0) {
            return 'box-shadow:' + boxShadow[0] + 'px ' + boxShadow[1] + 'px ' + boxShadow[2] + 'px ' + boxShadow[3] + 'px ' + N2Color.hex2rgbaCSS(boxShadow[4]) + ';';
        }
        return '';
    };

    Row.prototype._synchref =
        Row.prototype['_synchref-target'] = function () {
        };

    Row.prototype._syncbgimage =
        Row.prototype._syncbgimagex =
            Row.prototype._syncbgimagey =
                Row.prototype._syncbgcolor =
                    Row.prototype._syncbgcolorgradient =
                        Row.prototype._syncbgcolorgradientend =
                            Row.prototype['_syncbgcolor-hover'] =
                                Row.prototype['_syncbgcolorgradient-hover'] =
                                    Row.prototype['_syncbgcolorgradientend-hover'] = function () {
                                        this._syncbgThrottled();
                                    };


    Row.prototype._syncbgThrottled = function () {
        var background = '',
            image = this.fragmentEditor.editor.generator.fill(this.getProperty('bgimage')),
            gradientBackgroundProps = '';
        if (image != '') {
            var x = parseInt(this.getProperty('bgimagex'));
            if (!isFinite(x)) {
                x = 50;
            }
            var y = parseInt(this.getProperty('bgimagey'));
            if (!isFinite(y)) {
                y = 50;
            }
            background += 'URL("' + nextend.imageHelper.fixed(image) + '") ' + x + '% ' + y + '% / cover no-repeat';
            gradientBackgroundProps = ' ' + x + '% ' + y + '% / cover no-repeat';
        }
        var color = this.getProperty('bgcolor'),
            gradient = this.getProperty('bgcolorgradient'),
            colorend = this.getProperty('bgcolorgradientend');

        var normalStyle = this.getBackgroundCSS(color, gradient, colorend, background, gradientBackgroundProps);

        this.addLocalStyle('normal', 'bgcolor', normalStyle);


        var hoverStyle = '',
            isHoverDifferent = false,
            colorHover = this.getProperty('bgcolor-hover'),
            gradientHover = this.getProperty('bgcolorgradient-hover'),
            colorendHover = this.getProperty('bgcolorgradientend-hover');

        if (colorHover !== undefined && colorHover != color) {
            isHoverDifferent = true;
        }
        if (gradientHover !== undefined && gradientHover != gradient) {
            isHoverDifferent = true;
        }
        if (colorendHover !== undefined && colorendHover != colorend) {
            isHoverDifferent = true;
        }

        if (isHoverDifferent) {
            if (colorHover === undefined) {
                colorHover = color;
            }
            if (gradientHover === undefined) {
                gradientHover = gradient;
            }
            if (colorendHover === undefined) {
                colorendHover = colorend;
            }
            hoverStyle = this.getBackgroundCSS(colorHover, gradientHover, colorendHover, background, gradientBackgroundProps);
        }
        this.addLocalStyle('hover', 'bgcolor', hoverStyle);
    };

    Row.prototype.getBackgroundCSS = function (color, gradient, colorend, backgroundImage, gradientBackgroundProps) {
        if (N2Color.hex2alpha(color) != 0 || (gradient != 'off' && N2Color.hex2alpha(colorend) != 0)) {
            var after = '';
            if (backgroundImage != '') {
                after = gradientBackgroundProps + ',' + backgroundImage;
            }
            switch (gradient) {
                case 'horizontal':
                    return 'background:linear-gradient(to right, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorend) + ' 100%)' + after + ';';
                case 'vertical':
                    return 'background:linear-gradient(to bottom, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorend) + ' 100%)' + after + ';';
                case 'diagonal1':
                    return 'background:linear-gradient(45deg, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorend) + ' 100%)' + after + ';';
                case 'diagonal2':
                    return 'background:linear-gradient(135deg, ' + N2Color.hex2rgbaCSS(color) + ' 0%,' + N2Color.hex2rgbaCSS(colorend) + ' 100%)' + after + ';';
                case 'off':
                default:
                    if (backgroundImage != '') {
                        return "background: linear-gradient(" + N2Color.hex2rgbaCSS(color) + ", " + N2Color.hex2rgbaCSS(color) + ")" + after + ';';
                    }
                    return 'background:' + N2Color.hex2rgbaCSS(color) + ';';
            }
        } else if (backgroundImage != '') {
            return 'background:' + backgroundImage + ';';
        }
        return '';
    };

    Row.prototype.getData = function (params) {
        var data = N2Classes.ComponentAbstract.prototype.getData.call(this, params);

        if (params.itemsIncluded) {
            data.cols = this.container.getData(params);
        }
        return data;
    };

    /**
     * Example: Cols: 0 - 1 - 2
     * oldIndex: 0, newIndex: 2 => 1 - 2 - 0 Moves the col #0 to after the #2 col
     * @param oldIndex
     * @param newIndex
     */
    Row.prototype.moveCol = function (oldIndex, newIndex) {

        if (this.getMode() == 'desktopPortrait') {
            this._moveCol(oldIndex, newIndex);

            var task = N2Classes.History.get().addValue(this, this.historyMoveCol, []);
            if (task) {
                task.setValues({
                    oldIndex: newIndex,
                    newIndex: oldIndex
                }, {
                    oldIndex: oldIndex,
                    newIndex: newIndex
                });
            }
        } else {
            var orderedColumns = this.getOrderedColumns(),
                colToMove = orderedColumns[oldIndex];
            orderedColumns.splice(oldIndex, 1);
            orderedColumns.splice(newIndex, 0, colToMove);
            for (var i = 0; i < orderedColumns.length; i++) {
                orderedColumns[i].setProperty('order', i + 1);
            }
            this.refreshUI();
        }
    };

    Row.prototype._moveCol = function (oldIndex, newIndex) {

        var layers = this.container.getSortedLayers();
        this.container.insertLayerAt(layers[oldIndex], newIndex);

        this.refreshUI();
    };

    Row.prototype.historyMoveCol = function (data) {

        this._moveCol(data.oldIndex, data.newIndex);
    };

    Row.prototype.setColsWidth = function (fractions) {
        var cols = this.container.getSortedLayers();
        for (var i = 0; i < fractions.length; i++) {
            cols[i].setProperty('colwidth', fractions[i].toFraction());
        }

        this._syncwrapafter();
        this.update();

        this.refreshUI();
    };

    Row.prototype.setRealColsWidth = function (fractions) {
        var cols = this.getOrderedColumns();
        for (var i = 0; i < fractions.length; i++) {
            cols[i].setProperty('colwidth', fractions[i].toFraction());
        }

        this._syncwrapafter();
        this.update();

        this.refreshUI();
    };

    Row.prototype.updateColumnWidth = function (widths) {
        var wrapAfter = parseInt(this.getProperty('wrapafter')),
            columns = this.getOrderedColumns(),
            i;

        for (i = columns.length - 1; i >= 0; i--) {
            if (!columns[i].showsOnCurrent) {
                columns.splice(i, 1);
                widths.splice(i, 1);
            }
        }

        var columnsLength = columns.length;

        if (wrapAfter > 0 && wrapAfter < columnsLength) {
            var flexLines = [];
            for (i = 0; i < columnsLength; i++) {
                var row = Math.floor(i / wrapAfter);
                if (typeof flexLines[row] === 'undefined') {
                    flexLines[row] = [];
                }
                columns[i]._tempWidth = widths[i];
                flexLines[row].push(columns[i]);
            }

            var gutterValue = this.getGutter();
            for (i = 0; i < flexLines.length; i++) {
                var flexLine = flexLines[i],
                    sumWidth = 0,
                    j;
                for (j = 0; j < flexLine.length; j++) {
                    sumWidth += flexLine[j]._tempWidth;
                }
                for (j = 0; j < flexLine.length; j++) {
                    flexLine[j].layer.css('width', 'calc(' + (flexLine[j]._tempWidth / sumWidth * 100) + '% - ' + (n2const.isIE || n2const.isEdge ? gutterValue + 1 : gutterValue) + 'px)');
                }
            }
        } else {
            for (i = 0; i < columnsLength; i++) {
                columns[i].layer.css('width', (widths[i] * 100) + '%');
            }
        }

        this.update();
    };

    Row.prototype.activateColumn = function (index, e) {
        this.container.getSortedLayers()[index].activate(e);
    };

    Row.prototype.onChildCountChange = function () {
        if (!this.isDeleted && !this.isDeleteStarted) {
            var layers = this.container.getSortedLayers(),
                colLength = layers.length;
            if (colLength) {
                var currentColumns = this.getColumns().split('+'),
                    add = 0;
                for (var i = 0; i < currentColumns.length; i++) {
                    add = (new Fraction(currentColumns[i])).add(add);
                }
                if (add.valueOf() != 1) {
                    for (var i = 0; i < colLength; i++) {
                        layers[i].setProperty('colwidth', "1/" + colLength);
                    }
                } else {

                    for (var i = 0; i < colLength; i++) {
                        layers[i]._synccolwidth();
                    }
                }
                this.refreshUI();
            }
            this._syncgutter();
        }
    };

    Row.prototype.renderModeProperties = function (isReset) {
        N2Classes.ComponentAbstract.prototype.renderModeProperties.call(this, isReset);

        this._syncpadding();
        this._syncinneralign();
        this._syncgutter();

        if (this.isActive) {
            this.columnsField.setRow(this);
        }
    };

    Row.prototype.hightlightStructure = function (hideInterval) {

        hideInterval = hideInterval || 4000;
        if (this.isStructureHighlighted) {
            clearTimeout(this.isStructureHighlighted);
            this.isStructureHighlighted = false;
        }
        this.layer.addClass('n2-highlight-structure');
        this.isStructureHighlighted = setTimeout($.proxy(function () {
            if (!this.isDeleted) {
                this.layer.removeClass('n2-highlight-structure');
            }
        }, this), hideInterval);
    };

    Row.prototype.refreshUI = function () {
        if (!this.isDeleteStarted) {
            if (this.isActive) {
                this.columnsField.setRow(this);
            }
            this._syncwrapafter();
            this.$row.nUIColumns('option', 'columns', this.getColumnsOrdered());
        }
    };

    Row.prototype.getDroppable = function () {
        if (!this.layer.is(":visible") || this.status == N2Classes.ComponentAbstract.STATUS.HIDDEN || this.status == N2Classes.ComponentAbstract.STATUS.LOCKED) {
            return 'hidden';
        }
        return {
            $container: this.$row,
            layer: this,
            placement: 'normal',
            axis: 'x'
        }
    };

    Row.prototype.getLLDroppable = function (layer) {
        switch (layer.type) {
            case 'col':
                if (layer.group == this) {
                    return {
                        $container: this.container.$ul,
                        layer: this
                    };
                }
                break;
        }
        return false;
    };

    Row.prototype.getContents = function () {
        return this.$row;
    };

    Row.prototype.setPropertystylemode = function (name, value, from) {
        this.stylemode = value;

        this.syncAdvancedField('bgcolor');
        this.syncAdvancedField('bgcolorgradient');
        this.syncAdvancedField('bgcolorgradientend');
        this.syncAdvancedField('borderradius');
        this.syncAdvancedField('boxshadow');
    };

    Row.prototype.onSyncFields = function () {
        this.fragmentEditor.layerOptions.updateField('stylemode', this.stylemode);
    };

    return Row;
});
N2D('ComponentSettings', function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @param {N2Classes.FragmentEditor} fragmentEditor
     * @constructor
     */
    function ComponentSettings(fragmentEditor) {
        this.componentType = 'undefined';
        this.placementType = 'undefined';

        $('html')
            .attr('data-component', '')
            .attr('data-placement', '');

        this.currentForm = {};

        this.forms = {
            'undefined': null,
            placement: {
                absolute: {},
                normal: {},
                default: {}
            },
            component: {
                content: {},
                layer: {},
                row: {},
                col: {},
                group: {}
            },
            global: {
                id: $('#layerid'),
                uniqueclass: $('#layeruniqueclass'),
                desktopPortrait: $('#layershow-desktop-portrait'),
                desktopLandscape: $('#layershow-desktop-landscape'),
                tabletPortrait: $('#layershow-tablet-portrait'),
                tabletLandscape: $('#layershow-tablet-landscape'),
                mobilePortrait: $('#layershow-mobile-portrait'),
                mobileLandscape: $('#layershow-mobile-landscape'),
                class: $('#layerclass'),
                generatorvisible: $('#layergenerator-visible'),
                crop: $('#layercrop'),
                rotation: $('#layerrotation'),
                parallax: $('#layerparallax'),
                fontsize: $('#layerfont-size'),
                adaptivefont: $('#layeradaptive-font'),
                mouseenter: $('#layeronmouseenter'),
                click: $('#layeronclick'),
                mouseleave: $('#layeronmouseleave'),
                play: $('#layeronplay'),
                pause: $('#layeronpause'),
                stop: $('#layeronstop')
            }
        };
        fragmentEditor.editor.generator.registerField(this.forms.global.class);

        this.fragmentEditor = fragmentEditor;

        var availableDeviceModes = fragmentEditor.editor.getAvailableDeviceModes();

        if (!availableDeviceModes.desktopLandscape) {
            this.forms.global.desktopLandscape.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!availableDeviceModes.tabletPortrait) {
            this.forms.global.tabletPortrait.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!availableDeviceModes.tabletLandscape) {
            this.forms.global.tabletLandscape.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!availableDeviceModes.mobilePortrait) {
            this.forms.global.mobilePortrait.closest('.n2-mixed-group').css('display', 'none');
        }
        if (!availableDeviceModes.mobileLandscape) {
            this.forms.global.mobileLandscape.closest('.n2-mixed-group').css('display', 'none');
        }

        this.forms.placement.absolute = {
            parentid: $('#layerparentid'),
            parentalign: $('#layerparentalign'),
            parentvalign: $('#layerparentvalign'),
            left: $('#layerleft'),
            top: $('#layertop'),
            responsiveposition: $('#layerresponsive-position'),
            width: $('#layerwidth'),
            height: $('#layerheight'),
            responsivesize: $('#layerresponsive-size'),
            align: $('#layeralign'),
            valign: $('#layervalign')
        };

        this.forms.placement.normal = {
            margin: $('#layernormal-margin'),
            height: $('#layernormal-height'),
            maxwidth: $('#layernormal-maxwidth'),
            selfalign: $('#layernormal-selfalign')
        };

        this.forms.component.content = {
            maxwidth: $('#layercontent-maxwidth'),
            selfalign: $('#layercontent-selfalign'),
            padding: $('#layercontent-padding'),
            inneralign: $('#layercontent-inneralign'),
            verticalalign: $('#layercontent-verticalalign'),
            stylemode: $('#layercontent-style-mode').on('n2resetmode', $.proxy(this.resetStyleMode, this, 'stylemode')),
            bgcolor: $('#layercontent-background-color'),
            bgimage: $('#layercontent-background-image'),
            bgimagex: $('#layercontent-background-focus-x'),
            bgimagey: $('#layercontent-background-focus-y'),
            bgcolorgradient: $('#layercontent-background-gradient'),
            bgcolorgradientend: $('#layercontent-background-color-end'),
            opened: $('#layercontent-opened')
        };
        fragmentEditor.editor.generator.registerField(this.forms.component.content.bgimage);

        this.forms.component.row = {
            padding: $('#layerrow-padding'),
            gutter: $('#layerrow-gutter'),
            fullwidth: $('#layerrow-fullwidth'),
            stretch: $('#layerrow-stretch'),
            wrapafter: $('#layerrow-wrap-after'),
            inneralign: $('#layerrow-inneralign'),
            href: $('#layerrow-href'),
            'href-target': $('#layerrow-href-target'),
            bgimage: $('#layerrow-background-image'),
            bgimagex: $('#layerrow-background-focus-x'),
            bgimagey: $('#layerrow-background-focus-y'),
            stylemode: $('#layerrow-style-mode').on('n2resetmode', $.proxy(this.resetStyleMode, this, 'stylemode')),
            bgcolor: $('#layerrow-background-color'),
            bgcolorgradient: $('#layerrow-background-gradient'),
            bgcolorgradientend: $('#layerrow-background-color-end'),
            borderradius: $('#layerrow-border-radius'),
            boxshadow: $('#layerrow-boxshadow'),
            opened: $('#layerrow-opened')
        };
        fragmentEditor.editor.generator.registerField(this.forms.component.row.href);
        fragmentEditor.editor.generator.registerField(this.forms.component.row.bgimage);

        this.forms.component.col = {
            maxwidth: $('#layercol-maxwidth'),
            padding: $('#layercol-padding'),
            inneralign: $('#layercol-inneralign'),
            verticalalign: $('#layercol-verticalalign'),
            href: $('#layercol-href'),
            'href-target': $('#layercol-href-target'),
            bgimage: $('#layercol-background-image'),
            bgimagex: $('#layercol-background-focus-x'),
            bgimagey: $('#layercol-background-focus-y'),
            stylemode: $('#layercol-style-mode').on('n2resetmode', $.proxy(this.resetStyleMode, this, 'stylemode')),
            bgcolor: $('#layercol-background-color'),
            bgcolorgradient: $('#layercol-background-gradient'),
            bgcolorgradientend: $('#layercol-background-color-end'),
            borderradius: $('#layercol-border-radius'),
            boxshadow: $('#layercol-boxshadow'),
            borderwidth: $('#layercol-border-width'),
            borderstyle: $('#layercol-border-style'),
            bordercolor: $('#layercol-border-color'),
            opened: $('#layercol-opened'),
            colwidth: $('#layercol-colwidth'),
            order: $('#layercol-order')
        };
        fragmentEditor.editor.generator.registerField(this.forms.component.col.href);
        fragmentEditor.editor.generator.registerField(this.forms.component.col.bgimage);
    }

    ComponentSettings.prototype.changeActiveComponent = function (layer, componentType, placementType, properties) {
        this.currentLayer = layer;

        if (this.componentType != componentType) {

            $('html').attr('data-component', componentType);
            var pane = $('#n2-tabbed-slide-editor-settings').data('pane');

            switch (componentType) {
                case 'content':
                    pane.showTabs(['content', 'animations', 'position']);
                    break;
                case 'layer':
                    pane.showTabs(['item', 'style', 'animations', 'position']);
                    break;
                case 'group':
                    pane.showTabs(['group', 'animations']);
                    break;
                case 'row':
                    pane.showTabs(['row', 'animations', 'position']);
                    break;
                case 'col':
                    pane.showTabs(['column', 'animations', 'position']);
                    break;

            }
            this.componentType = componentType;
        }


        this.changeActiveComponentPlacement(placementType);
        this.syncFields(properties);
    };

    ComponentSettings.prototype.changeActiveComponentPlacement = function (placementType, properties) {

        if (this.placementType != placementType) {
            $('html').attr('data-placement', placementType);
            this.placementType = placementType;
        }

        this.syncFields(properties);
    };

    ComponentSettings.prototype.syncFields = function (properties) {
        if (typeof properties == 'object') {
            this.currentForm = $.extend({}, this.forms.global, this.forms.component[this.componentType], this.forms.placement[this.placementType]);

            for (var name in properties) {
                if (typeof properties[name] !== undefined) {

                    this.updateField(name, properties[name]);
                } else {
                    console.error('Value is undefined for: ' + name);
                }
            }

            this.currentLayer.onSyncFields();

            for (var k in this.currentForm) {
                this.currentForm[k].off('.layeroptions').on('outsideChange.layeroptions', $.proxy(this.activeComponentPropertyChanged, this, k));
            }
        }
    };

    ComponentSettings.prototype.onUpdateField = function (e, name, value) {
        if (e.target == this.currentLayer) {
            this.updateField(name, value);
        }
    };

    ComponentSettings.prototype.updateField = function (name, value) {
        if (typeof this.currentLayer['formSet' + name] === 'function') {
            this.currentLayer['formSet' + name](this, value);
        } else {
            if (this.currentForm[name] !== undefined) {
                var field = this.currentForm[name].data('field');
                if (field !== undefined) {
                    field.insideChange(value);
                }
            }
        }
    };

    ComponentSettings.prototype.activeComponentPropertyChanged = function (name, e) {
        if (this.currentLayer && !this.currentLayer.isDeleted) {
            this.updateLayerProperty(name);
        } else {
            var field = this.currentForm[name].data('field');
            if (typeof field !== 'undefined' && field !== null) {
                field.insideChange('');
            }
        }
    };

    ComponentSettings.prototype.updateLayerProperty = function (name) {
        var value = this.currentForm[name].val();
        this.currentLayer.setProperty(name, value, 'manager');
    };

    ComponentSettings.prototype.startFeatures = function () {
        this.layerFeatures = new N2Classes.LayerFeatures(this.forms.placement.absolute, this.fragmentEditor);

        var globalAdaptiveFont = $('#n2-ss-layer-adaptive-font').on('click', $.proxy(function () {
            this.currentForm.adaptivefont.data('field').onoff.trigger('click');
        }, this));

        this.forms.global.adaptivefont.on('nextendChange', $.proxy(function () {
            if (this.currentForm.adaptivefont.val() == 1) {
                globalAdaptiveFont.addClass('n2-active');
            } else {
                globalAdaptiveFont.removeClass('n2-active');
            }
        }, this));


        new N2Classes.FormElementNumber("n2-ss-layer-font-size", -Number.MAX_VALUE, Number.MAX_VALUE);
        new N2Classes.FormElementNumberSlider("n2-ss-layer-font-size", {
            min: 50,
            max: 300,
            step: 5
        });

        var globalFontSize = $('#n2-ss-layer-font-size').on('outsideChange', $.proxy(function () {
            var value = parseInt(globalFontSize.val());
            this.currentForm.fontsize.val(value).trigger('change');
        }, this));

        this.forms.global.fontsize.on('nextendChange', $.proxy(function () {
            globalFontSize.data('field').insideChange(this.forms.global.fontsize.val());
        }, this));
    };

    ComponentSettings.prototype.resetStyleMode = function (name, e) {
        this.currentLayer.resetStyleMode(name);
    };

    return ComponentSettings;
});
N2D('BgAnimationEditor', ['NextendFragmentEditorController'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function BgAnimationEditor() {
        this.parameters = {
            shiftedBackgroundAnimation: 0
        };

        this.$css = $('<style></style>').appendTo('head');
        this.backgroundAnimations = {
            color: 'eeeeeeff'
        };

        N2Classes.NextendFragmentEditorController.prototype.constructor.call(this, false);

        this.bgAnimationElement = $('.n2-bg-animation');
        this.slides = $('.n2-bg-animation-slide');
        this.bgImages = $('.n2-bg-animation-slide-bg');
        NextendTween.set(this.bgImages, {
            rotationZ: 0.0001
        });

        this.directionTab = new N2Classes.FormElementRadio('n2-background-animation-preview-tabs', ['0', '1']);
        this.directionTab.element.on('nextendChange.n2-editor', $.proxy(this.directionTabChanged, this));

        if (!nModernizr.csstransforms3d || !nModernizr.csstransformspreserve3d) {
            N2Classes.Notification.error('Background animations are not available in your browser. It works if the <i>transform-style: preserve-3d</i> feature available. ')
        }


        this.$colorField = $('#n2-background-animationcolor')
            .on('nextendChange', $.proxy(this.changeColor, this));
    }

    BgAnimationEditor.prototype = Object.create(N2Classes.NextendFragmentEditorController.prototype);
    BgAnimationEditor.prototype.constructor = BgAnimationEditor;

    BgAnimationEditor.prototype.loadDefaults = function () {
        N2Classes.NextendFragmentEditorController.prototype.loadDefaults.call(this);
        this.type = 'backgroundanimation';
        this.current = 0;
        this.animationProperties = false;
        this.direction = 0;
    };

    BgAnimationEditor.prototype.get = function () {
        return null;
    };

    BgAnimationEditor.prototype.load = function (visual, tabs, mode, preview) {
        this.lightbox.addClass('n2-editor-loaded');
    };

    BgAnimationEditor.prototype.setTabs = function (labels) {

    };

    BgAnimationEditor.prototype.directionTabChanged = function () {
        this.direction = parseInt(this.directionTab.element.val());
    };

    BgAnimationEditor.prototype.start = function (data) {
        if (data.color !== undefined) {
            this.$colorField.data('field').insideChange(data.color);
            this.backgroundAnimations.color = data.color;
        } else {
            $('#n2-tab-background-animation-form').remove();
            this.$css.html('.n2-3d-side,.tile-colored-overlay{background: ' + nextend.currentEditor.frontend.parameters.bgAnimationsColor + ';}');
        }
        if (this.animationProperties) {
            if (!this.timeline) {
                this.next();
            } else {
                this.timeline.play();
            }
        }
    };

    BgAnimationEditor.prototype.changeColor = function () {
        this.backgroundAnimations.color = this.$colorField.val();
        this.$css.html('.n2-3d-side,.tile-colored-overlay{background: ' + N2Color.hex2rgbaCSS(this.backgroundAnimations.color) + ';}');
    };

    BgAnimationEditor.prototype.pause = function () {
        if (this.timeline) {
            this.timeline.pause();
        }
    };

    BgAnimationEditor.prototype.next = function () {
        this.timeline = new NextendTimeline({
            paused: true,
            onComplete: $.proxy(this.ended, this)
        });
        var current = this.bgImages.eq(this.current),
            next = this.bgImages.eq(1 - this.current);

        if (nModernizr.csstransforms3d && nModernizr.csstransformspreserve3d) {
            this.currentAnimation = new N2Classes['SmartSliderBackgroundAnimation' + this.animationProperties.type](this, current, next, this.animationProperties, 1, this.direction);

            this.slides.eq(this.current).css('zIndex', 2);
            this.slides.eq(1 - this.current).css('zIndex', 3);

            this.timeline.to(this.slides.eq(this.current), 0.5, {
                opacity: 0
            }, this.currentAnimation.getExtraDelay());

            this.timeline.to(this.slides.eq(1 - this.current), 0.5, {
                opacity: 1
            }, this.currentAnimation.getExtraDelay());


            this.currentAnimation.postSetup();

        } else {

            this.timeline.to(this.slides.eq(this.current), 1.5, {
                opacity: 0
            }, 0);

            this.timeline.to(this.slides.eq(1 - this.current), 1.5, {
                opacity: 1
            }, 0);
        }
        this.current = 1 - this.current;
        this.timeline.play();
    };

    BgAnimationEditor.prototype.ended = function () {
        if (this.currentAnimation) {
            this.currentAnimation.ended();
        }
        this.next();
    };

    BgAnimationEditor.prototype.setAnimationProperties = function (animationProperties) {
        var lastAnimationProperties = this.animationProperties;
        this.animationProperties = animationProperties;
        if (!lastAnimationProperties) {
            this.next();
        }
    };

    return BgAnimationEditor;
});

N2D('BgAnimationManager', ['NextendVisualManagerMultipleSelection'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function BgAnimationManager() {
        this.type = 'backgroundanimation';
        N2Classes.NextendVisualManagerMultipleSelection.prototype.constructor.apply(this, arguments);
    }

    BgAnimationManager.prototype = Object.create(N2Classes.NextendVisualManagerMultipleSelection.prototype);
    BgAnimationManager.prototype.constructor = BgAnimationManager;

    BgAnimationManager.prototype.loadDefaults = function () {
        N2Classes.NextendVisualManagerMultipleSelection.prototype.loadDefaults.apply(this, arguments);
        this.type = 'backgroundanimation';
        this.labels = {
            visual: 'Background animation',
            visuals: 'Background animations'
        };
    };

    BgAnimationManager.prototype.initController = function () {
        return new N2Classes.BgAnimationEditor();
    };

    BgAnimationManager.prototype.createVisual = function (visual, set) {
        return new N2Classes.NextendVisualWithSetRowMultipleSelection(visual, set, this);
    };

    BgAnimationManager.prototype.show = function (data, saveCallback) {
        var controllerParameters = {};

        var $colorField = $('#sliderbackground-animation-color');
        if ($colorField.length) {
            controllerParameters.color = $colorField.val();
        }
        N2Classes.NextendVisualManagerMultipleSelection.prototype.show.call(this, data, saveCallback, controllerParameters);
    };

    BgAnimationManager.prototype.getAsString = function () {

        var $colorField = $('#sliderbackground-animation-color');
        if ($colorField.length) {
            $colorField.val($('#n2-background-animationcolor').val());
        }
        return N2Classes.NextendVisualManagerMultipleSelection.prototype.getAsString.call(this);
    };

    return BgAnimationManager;
});

N2D('ItemButton', ['Item'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments Item
     */
    function ItemButton() {
        this.type = 'button';
        N2Classes.Item.prototype.constructor.apply(this, arguments);
    }

    ItemButton.prototype = Object.create(N2Classes.Item.prototype);
    ItemButton.prototype.constructor = ItemButton;

    ItemButton.needSize = false;

    ItemButton.prototype.added = function () {
        this.needFill = ['content', 'class'];
        this.addedFont('link', 'font');
        this.addedStyle('button', 'style');

        this.generator.registerFields(['#item_buttoncontent', '#item_buttonhref', '#item_buttonclass']);
    };

    ItemButton.prototype.getName = function (data) {
        return data.content;
    };

    ItemButton.prototype.parseAll = function (data) {

        data.classes = '';

        if (parseInt(data.fullwidth)) {
            data.classes += ' n2-ss-fullwidth';
        }

        if (parseInt(data.nowrap)) {
            data.classes += ' n2-ss-nowrap';
        }

        N2Classes.Item.prototype.parseAll.apply(this, arguments);
    };

    ItemButton.prototype._render = function (data) {
        var $node = $('<div class="n2-ss-button-container n2-ow ' + data.fontclass + ' ' + data.classes + '" />'),
            $link = $('<a href="#" onclick="return false;" class="' + data.styleclass + ' ' + data.class + ' n2-ow"></a>').appendTo($node),
            $label = $('<span><span>' + data.content + '</span></span>').appendTo($link);

        this.$item.append($node);
    };

    return ItemButton;
});
N2D('ItemHeading', ['Item'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments Item
     */
    function ItemHeading() {
        this.type = 'heading';
        N2Classes.Item.prototype.constructor.apply(this, arguments);
    }

    ItemHeading.prototype = Object.create(N2Classes.Item.prototype);
    ItemHeading.prototype.constructor = ItemHeading;

    ItemHeading.needSize = false;

    ItemHeading.prototype.getDefault = function () {
        return {
            href: '',
            font: '',
            style: ''
        }
    };

    ItemHeading.prototype.added = function () {
        this.needFill = ['heading', 'class'];

        this.addedFont('hover', 'font');
        this.addedStyle('heading', 'style');

        this.generator.registerFields(['#item_headingheading', '#item_headinghref', '#item_headingclass']);
    };

    ItemHeading.prototype.getName = function (data) {
        return data.heading;
    };

    ItemHeading.prototype.parseAll = function (data) {
        data.uid = $.fn.uid();

        if (parseInt(data.fullwidth)) {
            data.display = 'block';
        } else {
            data.display = 'inline-block';
        }

        data.extrastyle = parseInt(data.nowrap) ? 'white-space: nowrap;' : '';

        data.heading = $('<div>' + data.heading + '</div>').text().replace(/\n/g, '<br />');
        data.priority = 2;
        data.class = '';
    

        N2Classes.Item.prototype.parseAll.apply(this, arguments);

        if (data['href'] == '#' || data['href'] == '') {
            data['afontclass'] = '';
            data['astyleclass'] = '';
        } else {
            data['afontclass'] = data['fontclass'];
            data['fontclass'] = '';
            data['astyleclass'] = data['styleclass'];
            data['styleclass'] = '';
        }
    };

    ItemHeading.prototype._render = function (data) {
        var $node = $('<div class="n2-ow" />'),
            $heading = $('<div id="' + data.uid + '" style="' + data.extrastyle + '"></div>')
                .addClass('n2-ow ' + data.fontclass + ' ' + data.styleclass + ' ' + data.class)
                .css({
                    display: data.display
                }).appendTo($node);

        if (data['href'] == '#' || data['href'] == '') {
            $heading.html(data.heading);
        } else {
            $heading.append($('<a style="display:' + data.display + ';" href="#" class="' + data.afontclass + ' ' + data.astyleclass + ' n2-ow" onclick="return false;">' + data.heading + '</a>'));
        }

        this.$item.append($node);
    };

    return ItemHeading;
});
N2D('ItemImage', ['Item'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments N2Classes.Item
     */
    function ItemImage() {
        this.type = 'image';
        N2Classes.Item.prototype.constructor.apply(this, arguments);
    }

    ItemImage.prototype = Object.create(N2Classes.Item.prototype);
    ItemImage.prototype.constructor = ItemImage;

    ItemImage.needSize = false;

    ItemImage.prototype.getDefault = function () {
        return {
            size: 'auto|*|auto',
            href: '',
            style: ''
        }
    };

    ItemImage.prototype.added = function () {
        this.needFill = ['image', 'cssclass'];

        this.generator.registerFields(['#item_imageimage', '#item_imagealt', '#item_imagetitle', '#item_imagehref', '#item_imagecssclass']);
    };

    ItemImage.prototype.getName = function (data) {
        return data.image.split('/').pop();
    };

    ItemImage.prototype.parseAll = function (data) {
        var size = data.size.split('|*|');
        data.width = size[0];
        data.height = size[1];
        delete data.size;

        N2Classes.Item.prototype.parseAll.apply(this, arguments);

        if (data.image != this.values.image) {
            data.image = nextend.imageHelper.fixed(data.image);

            if (this.layer.placement.getType() == 'absolute') {
                this.resizeLayerToImage(nextend.imageHelper.fixed(data.image));
            }
        } else {
            data.image = nextend.imageHelper.fixed(data.image);
        }

    };

    ItemImage.prototype.fitLayer = function () {
        if (this.layer.placement.getType() == 'absolute') {
            this.resizeLayerToImage(nextend.imageHelper.fixed(this.values.image));
        }
        return true;
    };

    ItemImage.prototype._render = function (data) {
        data.styleclass = '';
    
        var $node = $('<div class="' + data.styleclass + ' n2-ss-img-wrapper n2-ow" style="overflow:hidden"></div>'),
            $a = $node;

        if (data['href'] != '#' && data['href'] != '') {
            $a = $('<a href="#" class="n2-ow" onclick="return false;" style="display: block;background: none !important;"></a>').appendTo($node);
        }

        $('<img class="n2-ow ' + data.cssclass + '" src="' + data.image + '"/>').css({
            display: 'inline-block',
            maxWidth: '100%',
            width: data.width,
            height: data.height
        }).appendTo($a);

        this.$item.append($node);
    };

    return ItemImage;
});
N2D('ItemText', ['Item'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments Item
     */
    function ItemText() {
        this.type = 'text';
        N2Classes.Item.prototype.constructor.apply(this, arguments);
    }

    ItemText.prototype = Object.create(N2Classes.Item.prototype);
    ItemText.prototype.constructor = ItemText;

    ItemText.needSize = false;

    ItemText.prototype.getDefault = function () {
        return {
            contentmobile: '',
            contenttablet: '',
            font: '',
            style: ''
        }
    };

    ItemText.prototype.added = function () {
        this.needFill = ['content', 'contenttablet', 'contentmobile'];

        this.addedFont('paragraph', 'font');
        this.addedStyle('heading', 'style');

        this.generator.registerFields(['#item_textcontent', '#item_textcontenttablet', '#item_textcontentmobile']);
    };

    ItemText.prototype.getName = function (data) {
        return data.content;
    };

    ItemText.prototype.parseAll = function (data) {
        N2Classes.Item.prototype.parseAll.apply(this, arguments);

        data['p'] = _wp_Autop(data['content']);
        data['ptablet'] = _wp_Autop(data['contenttablet']);
        data['pmobile'] = _wp_Autop(data['contentmobile']);
    };


    ItemText.prototype._render = function (data) {
        var $content = $('<div class="n2-ss-desktop n2-ow n2-ow-all">' + data.p + '</div>').appendTo(this.$item);

        if (data['contenttablet'] == '') {
            $content.addClass('n2-ss-tablet');
        } else {
            $content = $('<div class="n2-ss-tablet n2-ow n2-ow-all">' + data.ptablet + '</div>').appendTo(this.$item);
        }

        if (data['contentmobile'] == '') {
            $content.addClass('n2-ss-mobile');
        } else {
            $('<div class="n2-ss-mobile n2-ow n2-ow-all">' + data.pmobile + '</div>').appendTo(this.$item);
        }

        this.$item.find('p').addClass(data.fontclass + ' ' + data.styleclass);

    };

    function _wp_Autop(text) {
        var preserve_linebreaks = false,
            preserve_br = false,
            blocklist = 'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre' +
                '|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section' +
                '|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary';

        // Normalize line breaks.
        text = text.replace(/\r\n|\r/g, '\n') + "\n";

        if (text.indexOf('\n') === -1) {
            return text;
        }

        // Remove line breaks from <object>.
        if (text.indexOf('<object') !== -1) {
            text = text.replace(/<object[\s\S]+?<\/object>/g, function (a) {
                return a.replace(/\n+/g, '');
            });
        }

        // Remove line breaks from tags.
        text = text.replace(/<[^<>]+>/g, function (a) {
            return a.replace(/[\n\t ]+/g, ' ');
        });

        // Preserve line breaks in <pre> and <script> tags.
        if (text.indexOf('<pre') !== -1 || text.indexOf('<script') !== -1) {
            preserve_linebreaks = true;
            text = text.replace(/<(pre|script)[^>]*>[\s\S]*?<\/\1>/g, function (a) {
                return a.replace(/\n/g, '<wp-line-break>');
            });
        }

        if (text.indexOf('<figcaption') !== -1) {
            text = text.replace(/\s*(<figcaption[^>]*>)/g, '$1');
            text = text.replace(/<\/figcaption>\s*/g, '</figcaption>');
        }

        // Keep <br> tags inside captions.
        if (text.indexOf('[caption') !== -1) {
            preserve_br = true;

            text = text.replace(/\[caption[\s\S]+?\[\/caption\]/g, function (a) {
                a = a.replace(/<br([^>]*)>/g, '<wp-temp-br$1>');

                a = a.replace(/<[^<>]+>/g, function (b) {
                    return b.replace(/[\n\t ]+/, ' ');
                });

                return a.replace(/\s*\n\s*/g, '<wp-temp-br />');
            });
        }

        text = text + '\n\n';
        text = text.replace(/<br \/>\s*<br \/>/gi, '\n\n');

        // Pad block tags with two line breaks.
        text = text.replace(new RegExp('(<(?:' + blocklist + ')(?: [^>]*)?>)', 'gi'), '\n\n$1');
        text = text.replace(new RegExp('(</(?:' + blocklist + ')>)', 'gi'), '$1\n\n');
        text = text.replace(/<hr( [^>]*)?>/gi, '<hr$1>\n\n');

        // Remove white space chars around <option>.
        text = text.replace(/\s*<option/gi, '<option');
        text = text.replace(/<\/option>\s*/gi, '</option>');

        // Normalize multiple line breaks and white space chars.
        text = text.replace(/\n\s*\n+/g, '\n\n');

        // Convert two line breaks to a paragraph.
        text = text.replace(/([\s\S]+?)\n\n/g, '<p>$1</p>\n');

        // Remove empty paragraphs.
        text = text.replace(/<p>\s*?<\/p>/gi, '');

        // Remove <p> tags that are around block tags.
        text = text.replace(new RegExp('<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi'), '$1');
        text = text.replace(/<p>(<li.+?)<\/p>/gi, '$1');

        // Fix <p> in blockquotes.
        text = text.replace(/<p>\s*<blockquote([^>]*)>/gi, '<blockquote$1><p>');
        text = text.replace(/<\/blockquote>\s*<\/p>/gi, '</p></blockquote>');

        // Remove <p> tags that are wrapped around block tags.
        text = text.replace(new RegExp('<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)', 'gi'), '$1');
        text = text.replace(new RegExp('(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi'), '$1');

        text = text.replace(/(<br[^>]*>)\s*\n/gi, '$1');

        // Add <br> tags.
        text = text.replace(/\s*\n/g, '<br />\n');

        // Remove <br> tags that are around block tags.
        text = text.replace(new RegExp('(</?(?:' + blocklist + ')[^>]*>)\\s*<br />', 'gi'), '$1');
        text = text.replace(/<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)/gi, '$1');

        // Remove <p> and <br> around captions.
        text = text.replace(/(?:<p>|<br ?\/?>)*\s*\[caption([^\[]+)\[\/caption\]\s*(?:<\/p>|<br ?\/?>)*/gi, '[caption$1[/caption]');

        // Make sure there is <p> when there is </p> inside block tags that can contain other blocks.
        text = text.replace(/(<(?:div|th|td|form|fieldset|dd)[^>]*>)(.*?)<\/p>/g, function (a, b, c) {
            if (c.match(/<p( [^>]*)?>/)) {
                return a;
            }

            return b + '<p>' + c + '</p>';
        });

        // Restore the line breaks in <pre> and <script> tags.
        if (preserve_linebreaks) {
            text = text.replace(/<wp-line-break>/g, '\n');
        }

        // Restore the <br> tags in captions.
        if (preserve_br) {
            text = text.replace(/<wp-temp-br([^>]*)>/g, '<br$1>');
        }

        return text;
    }

    return ItemText;
});
N2D('ItemVimeo', ['Item'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments Item
     */
    function ItemVimeo() {
        this.type = 'vimeo';
        N2Classes.Item.prototype.constructor.apply(this, arguments);
    }

    ItemVimeo.prototype = Object.create(N2Classes.Item.prototype);
    ItemVimeo.prototype.constructor = ItemVimeo;

    ItemVimeo.needSize = true;

    ItemVimeo.prototype.added = function () {
        this.needFill = ['vimeourl'];

        this.generator.registerField('#item_vimeovimeourl');
    };

    ItemVimeo.prototype.getName = function (data) {
        return data.vimeourl;
    };

    ItemVimeo.prototype.parseAll = function (data) {
        var vimeoChanged = this.values.vimeourl != data.vimeourl;

        N2Classes.Item.prototype.parseAll.apply(this, arguments);

        if (data.image == '') {
            data.image = '$system$/images/placeholder/video.png';
        }

        data.image = nextend.imageHelper.fixed(data.image);

        if (vimeoChanged && data.vimeourl != '') {
            var vimeoRegexp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/,
                vimeoMatch = data.vimeourl.match(vimeoRegexp);

            var videoCode = false;
            if (vimeoMatch) {
                videoCode = vimeoMatch[3];
            } else if (data.vimeourl.match(/^[0-9]+$/)) {
                videoCode = data.vimeourl;
            }

            if (videoCode) {
                N2Classes.AjaxHelper.getJSON('https://vimeo.com/api/v2/video/' + encodeURI(videoCode) + '.json').done($.proxy(function (data) {
                    $('#item_vimeoimage').val(data[0].thumbnail_large).trigger('change');
                }, this)).fail(function (data) {
					if (data.privateurl == 0) {
						N2Classes.Notification.error('Video not found or private.');
					}
                });
            } else {
                N2Classes.Notification.error('The provided URL does not match any known Vimeo url or code.');
            }
        }
    };

    ItemVimeo.prototype._render = function (data) {

        var $node = $('<div class="n2-ow"></div>').css({
            width: '100%',
            height: '100%',
            minHeight: '50px',
            background: 'url(' + data.image + ') no-repeat 50% 50%',
            backgroundSize: 'cover'
        });

        $('<div class="n2-ss-layer-player n2-ss-layer-player-cover"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iLjYiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTkuOCAzMmMtLjEyNCAwLS4yNDctLjAyOC0uMzYtLjA4LS4yNjQtLjExNi0uNDM2LS4zNzUtLjQ0LS42NjRWMTYuNzQ0Yy4wMDUtLjI5LjE3Ni0uNTUuNDQtLjY2Ni4yNzMtLjEyNi41OTItLjEuODQuMDdsMTAuNCA3LjI1N2MuMi4xMzIuMzIuMzU1LjMyLjU5NXMtLjEyLjQ2My0uMzIuNTk1bC0xMC40IDcuMjU2Yy0uMTQuMS0uMzEuMTUtLjQ4LjE1eiIvPjwvZz48L3N2Zz4=" /></div>')
            .appendTo($node);

        this.$item.append($node);
    };

    ItemVimeo.prototype.fitLayer = function () {
        return true;
    };

    return ItemVimeo;
});
N2D('ItemYoutube', ['Item'], function ($, undefined) {
    "use strict";

    /**
     * @memberOf N2Classes
     *
     * @constructor
     * @augments Item
     */
    function ItemYoutube() {
        this.type = 'youtube';
        N2Classes.Item.prototype.constructor.apply(this, arguments);
    }

    ItemYoutube.prototype = Object.create(N2Classes.Item.prototype);
    ItemYoutube.prototype.constructor = ItemYoutube;

    ItemYoutube.needSize = true;

    ItemYoutube.prototype.added = function () {
        this.needFill = ['youtubeurl', 'image', 'start'];

        this.generator.registerFields(['#item_youtubeyoutubeurl', '#item_youtubeimage', '#item_youtubestart']);
    };

    ItemYoutube.prototype.getName = function (data) {
        return data.youtubeurl;
    };

    ItemYoutube.prototype.parseAll = function (data) {

        var youTubeChanged = this.values.youtubeurl !== data.youtubeurl;

        N2Classes.Item.prototype.parseAll.apply(this, arguments);

        if (data.image === '') {
            data.image = '$system$/images/placeholder/video.png';
        }

        data.image = nextend.imageHelper.fixed(data.image);

        if (youTubeChanged) {
            var youtubeRegexp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
                youtubeMatch = data.youtubeurl.match(youtubeRegexp);

            if (youtubeMatch) {
                N2Classes.AjaxHelper.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + encodeURI(youtubeMatch[2]) + '&part=snippet&key=AIzaSyC3AolfvPAPlJs-2FgyPJdEEKS6nbPHdSM').done($.proxy(function (_data) {
                    if (_data.items.length) {

                        var thumbnails = _data.items[0].snippet.thumbnails,
                            thumbnail = thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default,
                            url = thumbnail.url;
                        if (this.values.youtubeurl == '{video_url}') {
                            url = url.replace(youtubeMatch[2], '{video_id}');
                        }
                        $('#item_youtubeimage').val(url).trigger('change');
                    }
                }, this)).fail(function (data) {
                    N2Classes.Notification.error(data.error.errors[0].message);
                });
            } else {
                N2Classes.Notification.error('The provided URL does not match any known YouTube url or code!');
            }
        }
    };

    ItemYoutube.prototype.fitLayer = function () {
        return true;
    };

    ItemYoutube.prototype._render = function (data) {

        var $node = $('<div class="n2-ow"></div>').css({
            width: '100%',
            height: '100%',
            minHeight: '50px',
            background: 'url(' + data.image + ') no-repeat 50% 50%',
            backgroundSize: 'cover'
        });

        if (parseInt(data.playbutton)) {
            $('<div class="n2-ss-layer-player n2-ss-layer-player-cover"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iLjYiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTkuOCAzMmMtLjEyNCAwLS4yNDctLjAyOC0uMzYtLjA4LS4yNjQtLjExNi0uNDM2LS4zNzUtLjQ0LS42NjRWMTYuNzQ0Yy4wMDUtLjI5LjE3Ni0uNTUuNDQtLjY2Ni4yNzMtLjEyNi41OTItLjEuODQuMDdsMTAuNCA3LjI1N2MuMi4xMzIuMzIuMzU1LjMyLjU5NXMtLjEyLjQ2My0uMzIuNTk1bC0xMC40IDcuMjU2Yy0uMTQuMS0uMzEuMTUtLjQ4LjE1eiIvPjwvZz48L3N2Zz4=" /></div>')
                .appendTo($node);
        }

        this.$item.append($node);
    };

    return ItemYoutube;
});
N2D('smartslider-backend')