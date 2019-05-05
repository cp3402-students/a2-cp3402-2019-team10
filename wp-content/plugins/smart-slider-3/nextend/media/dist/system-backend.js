(function(){var N=this;N.N2_=N.N2_||{r:[],d:[]},N.N2R=N.N2R||function(){N.N2_.r.push(arguments)},N.N2D=N.N2D||function(){N.N2_.d.push(arguments)}}).call(window);
N2D('NextendVisualManagerModals', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param visualManager
     * @constructor
     */
    function NextendVisualManagerModals(visualManager) {
        this.visualManager = visualManager;
        this.linkedOverwriteOrSaveAs = null;
        this.saveAs = null;
    }

    NextendVisualManagerModals.prototype.getLinkedOverwriteOrSaveAs = function () {
        if (this.linkedOverwriteOrSaveAs == null) {
            var context = this;
            this.linkedOverwriteOrSaveAs = new N2Classes.NextendModal({
                zero: {
                    size: [
                        500,
                        140
                    ],
                    title: '',
                    back: false,
                    close: true,
                    content: '',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-grey n2-uc n2-h4">' + n2_('Save as new') + '</a>', '<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Overwrite current') + '</a>'],
                    fn: {
                        show: function () {
                            this.title.html(n2_printf(n2_('%s changed - %s'), context.visualManager.labels.visual, context.visualManager.activeVisual.name));
                            if (context.visualManager.activeVisual && !context.visualManager.activeVisual.isEditable()) {
                                this.loadPane('saveAsNew');
                            } else {
                                this.controls.find('.n2-button-green')
                                    .on('click', $.proxy(function (e) {
                                        e.preventDefault();
                                        context.visualManager.saveActiveVisual(context.visualManager.activeVisual.name)
                                            .done($.proxy(function () {
                                                this.hide(e);
                                                context.visualManager.setAndClose(context.visualManager.activeVisual.id);
                                                context.visualManager.hide();
                                            }, this));
                                    }, this));

                                this.controls.find('.n2-button-grey')
                                    .on('click', $.proxy(function (e) {
                                        e.preventDefault();
                                        this.loadPane('saveAsNew');
                                    }, this));
                            }
                        }
                    }
                },
                saveAsNew: {
                    size: [
                        500,
                        220
                    ],
                    title: n2_('Save as'),
                    back: 'zero',
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

                            if (context.visualManager.activeVisual) {
                                nameField.val(context.visualManager.activeVisual.name);
                            }

                            button.on('click', $.proxy(function (e) {
                                e.preventDefault();
                                var name = nameField.val();
                                if (name == '') {
                                    N2Classes.Notification.error(n2_('Please fill the name field!'));
                                } else {
                                    context.visualManager._saveAsNew(name)
                                        .done($.proxy(function () {
                                            this.hide(e);
                                            context.visualManager.setAndClose(context.visualManager.activeVisual.id);
                                            context.visualManager.hide();
                                        }, this));
                                }
                            }, this));
                        }
                    }
                }
            }, false);
        }
        return this.linkedOverwriteOrSaveAs;
    };

    NextendVisualManagerModals.prototype.getSaveAs = function () {
        if (this.saveAs === null) {
            var context = this;
            this.saveAs = new N2Classes.NextendModal({
                zero: {
                    size: [
                        500,
                        220
                    ],
                    title: n2_('Save as'),
                    back: false,
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

                            if (context.visualManager.activeVisual) {
                                nameField.val(context.visualManager.activeVisual.name);
                            }

                            button.on('click', $.proxy(function (e) {
                                e.preventDefault();
                                var name = nameField.val();
                                if (name == '') {
                                    N2Classes.Notification.error(n2_('Please fill the name field!'));
                                } else {
                                    context.visualManager._saveAsNew(name)
                                        .done($.proxy(this.hide, this, e));
                                }
                            }, this));
                        }
                    }
                }
            }, false);
        }
        return this.saveAs;
    };

    return NextendVisualManagerModals;
});
N2D('NextendVisualCore', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param visual
     * @param visualManager
     * @constructor
     */
    function NextendVisualCore(visual, visualManager) {
        this.id = visual.id;
        this.visualManager = visualManager;
        this.setValue(visual.value, false);
        this.visual = visual;
        this.visualManager.visuals[this.id] = this;
    }

    NextendVisualCore.prototype.compare = function (value) {

        var length = Math.max(this.value.length, value.length);
        for (var i = 0; i < length; i++) {
            if (!this._compareTab(typeof this.value[i] === 'undefined' ? {} : this.value[i], typeof value[i] === 'undefined' ? {} : value[i])) {
                return false;
            }
        }
        return true;
    };

    NextendVisualCore.prototype._compareTab = function (a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if (a.length === 0 && bProps.length === 0) {
            return true;
        }

        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        return true;
    };

    NextendVisualCore.prototype.setValue = function (value, render) {
        var data = null;
        if (typeof value == 'string') {

            var decoded = value;
            if (decoded[0] != '{') {
                this.base64 = decoded;
                decoded = N2Classes.Base64.decode(decoded)
            } else {
                this.base64 = N2Classes.Base64.encode(decoded);
            }

            data = JSON.parse(decoded);
        } else {
            data = value;
        }
        this.name = data.name;
        this.value = data.data;

        if (render) {
            this.render();
        }
    };

    NextendVisualCore.prototype.isSystem = function () {
        return (this.visual.system == 1);
    };

    NextendVisualCore.prototype.isEditable = function () {
        return (this.visual.editable == 1);
    };

    NextendVisualCore.prototype.activate = function (e, cb) {
        if (e) {
            e.preventDefault();
        }
        this.visualManager.changeActiveVisual(this);
        if (typeof cb == 'function') {
            this.visualManager.controller.asyncVisualData(this.value, this.visualManager.showParameters, cb);
        } else {
            this.visualManager.controller.load(this.value, false, this.visualManager.showParameters);
        }
    };

    NextendVisualCore.prototype.active = function () {
    };

    NextendVisualCore.prototype.notActive = function () {
    };

    NextendVisualCore.prototype.delete = function (e) {
        if (e) {
            e.preventDefault();
        }
        N2Classes.NextendModal.deleteModal('n2-visual', this.name, $.proxy(function () {
            this._delete();
        }, this));
    };
    NextendVisualCore.prototype._delete = function () {

        return N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.visualManager.parameters.ajaxUrl, {
                nextendaction: 'deleteVisual'
            }),
            data: {
                visualId: this.id
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                var visual = response.data.visual;

                if (this.visualManager.activeVisual && this.id == this.visualManager.activeVisual.id) {
                    this.visualManager.changeActiveVisual(null);
                }
                this.removeRules();
                delete this.visualManager.visuals[this.id];
                delete this.set.visuals[this.id];
                this.row.remove();
                this.visualManager.$.trigger('visualDelete', [this.id]);
            }, this));
    };

    NextendVisualCore.prototype.removeRules = function () {

    };

    NextendVisualCore.prototype.render = function () {

    };

    NextendVisualCore.prototype.isUsed = function () {
        return false;
    };

    return NextendVisualCore;
});
N2D('NextendFragmentEditorController', ['NextendFragmentEditorControllerWithEditor'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param previewModesList
     * @constructor
     */
    function NextendFragmentEditorController(previewModesList) {
        N2Classes.NextendFragmentEditorControllerWithEditor.prototype.constructor.apply(this, arguments);

        this.previewModesList = previewModesList;

        this.initPreviewModes();
        if (previewModesList) {

            this.renderer = this.initRenderer();

            this.clearTabButton = this.lightbox.find('.n2-editor-clear-tab')
                .on('click', $.proxy(this.clearCurrentTab, this));


            this.tabField = new N2Classes.FormElementRadio('n2-' + this.type + '-editor-tabs', ['0']);
            this.tabField.element.on('nextendChange.n2-editor', $.proxy(this.tabChanged, this));

            this.previewModeField = new N2Classes.FormElementRadio('n2-' + this.type + '-editor-preview-mode', ['0']);
            this.previewModeField.element.on('nextendChange.n2-editor', $.proxy(this.previewModeChanged, this));

            this.previewModeField.options.eq(0).text(n2_('Current tab'));
        }
    }

    NextendFragmentEditorController.prototype = Object.create(N2Classes.NextendFragmentEditorControllerWithEditor.prototype);
    NextendFragmentEditorController.prototype.constructor = NextendFragmentEditorController;

    NextendFragmentEditorController.prototype.loadDefaults = function () {
        N2Classes.NextendFragmentEditorControllerWithEditor.prototype.loadDefaults.call(this);

        this.currentPreviewMode = '0';
        this.currentTabIndex = 0;
        this._renderTimeout = 0;
        this._delayStart = 0;
    };

    NextendFragmentEditorController.prototype.initPreviewModes = function () {
    };

    NextendFragmentEditorController.prototype.initRenderer = function () {
    };

    NextendFragmentEditorController.prototype._load = function (visual, tabs, parameters) {
        this.currentVisual = [];
        for (var i = 0; i < visual.length; i++) {
            this.currentVisual[i] = $.extend(true, this.getCleanVisual(), visual[i]);
        }

        this.localModePreview = {};
        if (parameters.previewMode === false) {
            this.availablePreviewMode = false;
        } else {
            this.availablePreviewMode = parameters.previewMode;
            if (tabs === false) {
                tabs = this.getTabs();
            }
            for (var i = this.currentVisual.length; i < tabs.length; i++) {
                this.currentVisual[i] = this.getCleanVisual();
            }
            if (parameters.previewHTML !== false && parameters.previewHTML != '') {
                this.localModePreview[parameters.previewMode] = parameters.previewHTML;
            }
        }

        this.currentTabs = tabs;

        if (tabs === false) {
            tabs = [];
            for (var i = 0; i < this.currentVisual.length; i++) {
                tabs.push('#' + i);
            }
        }

        this.setTabs(tabs);
    };

    NextendFragmentEditorController.prototype.asyncVisualData = function (visual, showParameters, cb) {
        if (visual == '') {
            visual = this.getEmptyVisual();
        }
        var tabs = this.previewModesList[showParameters.previewMode].tabs,
            currentVisual = [];
        for (var i = 0; i < visual.length; i++) {
            currentVisual[i] = $.extend(true, this.getCleanVisual(), visual[i]);
        }
        for (var i = currentVisual.length; i < tabs.length; i++) {
            currentVisual[i] = this.getCleanVisual();
        }

        cb(currentVisual, tabs);
    };

    NextendFragmentEditorController.prototype.getCleanVisual = function () {
        return {};
    };

    NextendFragmentEditorController.prototype.getTabs = function () {
        return this.previewModesList[this.availablePreviewMode].tabs;
    };

    NextendFragmentEditorController.prototype.setTabs = function (labels) {
        this.tabField.insideChange('0');
        for (var i = this.tabField.values.length - 1; i > 0; i--) {
            this.tabField.removeTabOption(this.tabField.values[i]);
        }
        this.tabField.options.eq(0).text(labels[0]);
        for (var i = 1; i < labels.length; i++) {
            this.tabField.addTabOption(i + '', labels[i]);
        }

        this.makePreviewModes();
    };

    NextendFragmentEditorController.prototype.tabChanged = function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }

        var tab = this.tabField.element.val();

        this.currentTabIndex = tab;
        if (typeof this.currentVisual[tab] === 'undefined') {
            this.currentVisual[tab] = {};
        }
        var values = $.extend({}, this.currentVisual[0]);
        if (tab != 0) {
            $.extend(values, this.currentVisual[tab]);
            this.clearTabButton.css('display', '');
        } else {
            this.clearTabButton.css('display', 'none');
        }

        this.editor.load(values);
        this._tabChanged();
    };

    NextendFragmentEditorController.prototype._tabChanged = function () {
        this._renderPreview();
    };

    NextendFragmentEditorController.prototype.clearCurrentTab = function (e) {
        if (e) {
            e.preventDefault();
        }
        this.currentVisual[this.currentTabIndex] = {};
        this.tabChanged();
        this._renderPreview();
    };

    NextendFragmentEditorController.prototype.makePreviewModes = function () {
        var modes = [];
        // Show all preview mode for the tab count
        if (this.availablePreviewMode === false) {
            var tabCount = this.tabField.options.length;
            if (typeof this.previewModes[tabCount] !== "undefined") {
                modes = this.previewModes[tabCount];
            }
            this.setPreviewModes(modes);
        } else {
            modes = [this.previewModesList[this.availablePreviewMode]];
            this.setPreviewModes(modes, this.availablePreviewMode);
        }
    };

    NextendFragmentEditorController.prototype.setPreviewModes = function (modes, defaultMode) {
        for (var i = this.previewModeField.values.length - 1; i > 0; i--) {
            this.previewModeField.removeTabOption(this.previewModeField.values[i]);
        }
        for (var i = 0; i < modes.length; i++) {
            this.previewModeField.addTabOption(modes[i].id, n2_('Live'));
        }
        if (typeof defaultMode === 'undefined') {
            defaultMode = '0';
        }
        this.previewModeField.insideChange(defaultMode);
    };

    NextendFragmentEditorController.prototype.previewModeChanged = function () {
        var mode = this.previewModeField.element.val();

        if (this.currentTabs === false) {
            if (mode == 0) {
                for (var i = 0; i < this.currentVisual.length; i++) {
                    this.tabField.options.eq(i).text('#' + i);
                }
            } else {
                var tabs = this.previewModesList[mode].tabs;
                if (tabs) {
                    for (var i = 0; i < this.currentVisual.length; i++) {
                        this.tabField.options.eq(i).text(tabs[i]);
                    }
                }
            }
        }
        this.currentPreviewMode = mode;
        this._renderPreview();

        this.setPreview(mode);
    };

    NextendFragmentEditorController.prototype.setPreview = function (mode) {
    };

    NextendFragmentEditorController.prototype.propertyChanged = function (e, property, value) {
        this.isChanged = true;
        this.currentVisual[this.currentTabIndex][property] = value;
        this.renderPreview();
    };

    NextendFragmentEditorController.prototype.renderPreview = function () {
        var now = $.now();
        if (this._renderTimeout) {
            clearTimeout(this._renderTimeout);
            if (now - this._delayStart > 100) {
                this._renderPreview();
                this._delayStart = now;
            }
        } else {
            this._delayStart = now;
        }
        this._renderTimeout = setTimeout($.proxy(this._renderPreview, this), 33);
    };

    NextendFragmentEditorController.prototype._renderPreview = function () {
        this._renderTimeout = false;
    };

    return NextendFragmentEditorController;
});
N2D('NextendFragmentEditorControllerBase', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendFragmentEditorControllerBase() {
        this.loadDefaults();
        this.lightbox = $('#n2-lightbox-' + this.type);
    }

    NextendFragmentEditorControllerBase.prototype.loadDefaults = function () {
        this.type = '';
        this._style = false;
        this.isChanged = false;
        this.visible = false;
    };

    NextendFragmentEditorControllerBase.prototype.init = function () {
        this.lightbox = $('#n2-lightbox-' + this.type);
    };


    NextendFragmentEditorControllerBase.prototype.pause = function () {

    };

    NextendFragmentEditorControllerBase.prototype.getEmptyVisual = function () {
        return [];
    };

    NextendFragmentEditorControllerBase.prototype.get = function () {
        return this.currentVisual;
    };

    NextendFragmentEditorControllerBase.prototype.load = function (visual, tabs, parameters) {
        this.isChanged = false;
        this.lightbox.addClass('n2-editor-loaded');
        if (visual == '') {
            visual = this.getEmptyVisual();
        }
        this._load(visual, tabs, parameters);
    };

    NextendFragmentEditorControllerBase.prototype._load = function (visual, tabs, parameters) {
        this.currentVisual = $.extend(true, {}, visual);
    };

    NextendFragmentEditorControllerBase.prototype.addStyle = function (style) {
        if (this._style) {
            this._style.remove();
        }
        this._style = $("<style>" + style + "</style>").appendTo("head");
    };

    NextendFragmentEditorControllerBase.prototype.show = function () {
        this.visible = true;
        N2Classes.WindowManager.get().addWindow("visual");
    };

    NextendFragmentEditorControllerBase.prototype.close = function () {
        this.visible = false;
        N2Classes.WindowManager.get().removeWindow();
    };

    return NextendFragmentEditorControllerBase;
});
N2D('NextendFragmentEditorControllerWithEditor', ['NextendFragmentEditorControllerBase'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendFragmentEditorControllerWithEditor() {

        N2Classes.NextendFragmentEditorControllerBase.prototype.constructor.apply(this, arguments);

        this.editor = this.initEditor();
        this.editor.$.on('change', $.proxy(this.propertyChanged, this));
    }


    NextendFragmentEditorControllerWithEditor.prototype = Object.create(N2Classes.NextendFragmentEditorControllerBase.prototype);
    NextendFragmentEditorControllerWithEditor.prototype.constructor = NextendFragmentEditorControllerWithEditor;


    NextendFragmentEditorControllerWithEditor.prototype.initEditor = function () {
        return new N2Classes.NextendFragmentEditor();
    };

    NextendFragmentEditorControllerWithEditor.prototype.propertyChanged = function (e, property, value) {
        this.isChanged = true;
        this.currentVisual[property] = value;
    };

    NextendFragmentEditorControllerWithEditor.prototype._load = function (visual, tabs, parameters) {
        N2Classes.NextendFragmentEditorControllerBase.prototype._load.apply(this, arguments);
        this.loadToEditor();
    };

    NextendFragmentEditorControllerWithEditor.prototype.loadToEditor = function () {
        this.editor.load(this.currentVisual);
    };

    return NextendFragmentEditorControllerWithEditor;
});
N2D('NextendVisualRenderer', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param editorController
     * @constructor
     */
    function NextendVisualRenderer(editorController) {
        this.editorController = editorController;
    }

    NextendVisualRenderer.prototype.deleteRules = function (modeKey, pre, selector) {
        var mode = this.editorController.previewModesList[modeKey],
            rePre = new RegExp('@pre', "g"),
            reSelector = new RegExp('@selector', "g");
        for (var k in mode.selectors) {
            var rule = k
                .replace(rePre, pre)
                .replace(reSelector, selector);
            nextend.css.deleteRule(rule);
        }
    };

    NextendVisualRenderer.prototype.getCSS = function (modeKey, pre, selector, visualTabs, parameters) {
        var css = '',
            mode = this.editorController.previewModesList[modeKey],
            rePre = new RegExp('@pre', "g"),
            reSelector = new RegExp('@selector', "g");

        for (var k in mode.selectors) {
            var rule = k
                .replace(rePre, pre)
                .replace(reSelector, selector);

            css += rule + "{\n" + mode.selectors[k] + "}\n";
            if (typeof parameters.deleteRule !== 'undefined') {
                nextend.css.deleteRule(rule);
            }
        }


        if (modeKey == 0) {
            var visualTab = visualTabs[parameters.activeTab];
            if (parameters.activeTab != 0) {
                visualTab = $.extend({}, visualTabs[0], visualTab);
            }
            css = css.replace(new RegExp('@tab[0-9]*', "g"), this.render(visualTab));
        } else if (mode.renderOptions.combined) {
            for (var i = 0; i < visualTabs.length; i++) {
                css = css.replace(new RegExp('@tab' + i, "g"), this.render(visualTabs[i]));
            }
        } else {
            for (var i = 0; i < visualTabs.length; i++) {
                visualTabs[i] = $.extend({}, visualTabs[i]);
                css = css.replace(new RegExp('@tab' + i, "g"), this.render(visualTabs[i]));
            }
        }
        return css;
    };

    NextendVisualRenderer.prototype.render = function (visualData) {
        var visual = this.makeVisualData(visualData);
        var css = '',
            raw = '';
        if (typeof visual.raw !== "undefined") {
            raw = visual.raw;
            delete visual.raw;
        }
        for (var k in visual) {

            css += this.deCase(k) + ": " + visual[k] + ";\n";
        }
        css += raw;
        return css;
    };

    NextendVisualRenderer.prototype.makeVisualData = function (visualData) {
        var visual = {};
        for (var property in visualData) {
            if (visualData.hasOwnProperty(property) && typeof visualData[property] !== 'function') {
                this['makeStyle' + property](visualData[property], visual);
            }
        }
        return visual;
    };

    NextendVisualRenderer.prototype.deCase = function (s) {
        return s.replace(/[A-Z]/g, function (a) {
            return '-' + a.toLowerCase()
        });
    };

    return NextendVisualRenderer;
});
N2D('NextendFragmentEditor', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendFragmentEditor() {
        this.fields = {};
        this.$ = $(this);
    }

    NextendFragmentEditor.prototype.load = function (values) {
        this._off();
        this._on();
    };

    NextendFragmentEditor.prototype._on = function () {
        for (var id in this.fields) {
            this.fields[id].element.on(this.fields[id].events);
        }
    };

    NextendFragmentEditor.prototype._off = function () {
        for (var id in this.fields) {
            this.fields[id].element.off('.n2-editor');
        }
    };

    NextendFragmentEditor.prototype.trigger = function (property, value) {
        this.$.trigger('change', [property, value]);
    };

    return NextendFragmentEditor;
});
N2D('NextendVisualWithSet', ['NextendVisualCore'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param visual
     * @param set
     * @param visualManager
     * @constructor
     */
    function NextendVisualWithSet(visual, set, visualManager) {
        this.set = set;
        N2Classes.NextendVisualCore.prototype.constructor.call(this, visual, visualManager);
    }

    NextendVisualWithSet.prototype = Object.create(N2Classes.NextendVisualCore.prototype);
    NextendVisualWithSet.prototype.constructor = NextendVisualWithSet;

    NextendVisualWithSet.prototype.active = function () {
        var setId = this.set.set.id;
        this.visualManager.changeSet(setId);

        N2Classes.NextendVisualCore.prototype.active.call(this);
    };

    return NextendVisualWithSet;
});
N2D('NextendVisualWithSetRow', ['NextendVisualWithSet'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendVisualWithSetRow() {
        N2Classes.NextendVisualWithSet.prototype.constructor.apply(this, arguments);
    }

    NextendVisualWithSetRow.prototype = Object.create(N2Classes.NextendVisualWithSet.prototype);
    NextendVisualWithSetRow.prototype.constructor = NextendVisualWithSetRow;


    NextendVisualWithSetRow.prototype.createRow = function () {
        this.row = $('<li></li>')
            .append($('<a href="#"></a>').text(this.name).on('click', $.proxy(this.activate, this)));
        if (!this.isSystem()) {
            this.row.append($('<span class="n2-actions"></span>')
                .append($('<div class="n2-button n2-button-icon n2-button-s" href="#"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>')
                    .on('click', $.proxy(this.delete, this))));
        }
        return this.row;
    };

    NextendVisualWithSetRow.prototype.setValue = function (value, render) {
        N2Classes.NextendVisualWithSet.prototype.setValue.call(this, value, render);

        if (this.row) {
            this.row.find('> a').html(this.name);
        }
    };

    NextendVisualWithSetRow.prototype.active = function () {
        this.row.addClass('n2-active');
        N2Classes.NextendVisualWithSet.prototype.active.call(this);
    };

    NextendVisualWithSetRow.prototype.notActive = function () {
        this.row.removeClass('n2-active');
        N2Classes.NextendVisualWithSet.prototype.notActive.call(this);
    };

    return NextendVisualWithSetRow;
});
N2D('NextendVisualWithSetRowMultipleSelection', ['NextendVisualWithSetRow'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param visual
     * @param set
     * @param visualManager
     * @constructor
     */
    function NextendVisualWithSetRowMultipleSelection(visual, set, visualManager) {
        this.checked = false;
        visual.system = 1;
        visual.editable = 0;
        N2Classes.NextendVisualWithSetRow.prototype.constructor.apply(this, arguments);
    }

    NextendVisualWithSetRowMultipleSelection.prototype = Object.create(N2Classes.NextendVisualWithSetRow.prototype);
    NextendVisualWithSetRowMultipleSelection.prototype.constructor = NextendVisualWithSetRowMultipleSelection;


    NextendVisualWithSetRowMultipleSelection.prototype.createRow = function () {
        var row = N2Classes.NextendVisualWithSetRow.prototype.createRow.call(this);
        this.checkbox = $('<div class="n2-list-checkbox"><i class="n2-i n2-i-tick"></i></div>')
            .on('click', $.proxy(this.checkOrUnCheck, this))
            .prependTo(row.find('a'));

        return row;
    };

    NextendVisualWithSetRowMultipleSelection.prototype.setValue = function (data, render) {
        this.name = data.name;
        this.value = data.data;
        if (this.row) {
            this.row.find('> a').html(this.name);
        }

        if (render) {
            this.render();
        }
    };

    NextendVisualWithSetRowMultipleSelection.prototype.activate = function (e, cb) {
        if (e) {
            e.preventDefault();
        }
        this.visualManager.changeActiveVisual(this);
        this.visualManager.controller.setAnimationProperties(this.value);
    };

    NextendVisualWithSetRowMultipleSelection.prototype.checkOrUnCheck = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.checked) {
            this.unCheck();
        } else {
            this.check();
        }
    };

    NextendVisualWithSetRowMultipleSelection.prototype.check = function () {
        this.checked = true;
        this.checkbox.addClass('n2-active');
        this.activate();
    };

    NextendVisualWithSetRowMultipleSelection.prototype.unCheck = function () {
        this.checked = false;
        this.checkbox.removeClass('n2-active');
        this.activate();
    };

    return NextendVisualWithSetRowMultipleSelection;
});
N2D('NextendVisualSetsManager', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param visualManager
     * @constructor
     */
    function NextendVisualSetsManager(visualManager) {
        this.visualManager = visualManager;
        this.$ = $(this);
    }

    return NextendVisualSetsManager;
});
N2D('NextendVisualSetsManagerEditable', ['NextendVisualSetsManager'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param visualManager
     * @constructor
     */
    function NextendVisualSetsManagerEditable(visualManager) {
        this.modal = null;
        N2Classes.NextendVisualSetsManager.prototype.constructor.apply(this, arguments);

        this.$.on({
            setAdded: function (e, set) {
                new N2Classes.NextendVisualSet(set, visualManager);
            },
            setChanged: function (e, set) {
                visualManager.sets[set.id].rename(set.value);
            },
            setDeleted: function (e, set) {
                visualManager.sets[set.id].delete();
                visualManager.setsSelector.trigger('change');
            }
        });

        this.manageButton = $('#' + visualManager.parameters.setsIdentifier + '-manage')
            .on('click', $.proxy(this.showManageSets, this));

    }

    NextendVisualSetsManagerEditable.prototype = Object.create(N2Classes.NextendVisualSetsManager.prototype);
    NextendVisualSetsManagerEditable.prototype.constructor = NextendVisualSetsManagerEditable;

    NextendVisualSetsManagerEditable.prototype.isSetAllowedToEdit = function (id) {
        if (id == -1 || typeof this.visualManager.sets[id] == 'undefined' || this.visualManager.sets[id].set.editable == 0) {
            return false;
        }
        return true;
    };


    NextendVisualSetsManagerEditable.prototype.createVisualSet = function (name) {
        return N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.visualManager.parameters.ajaxUrl, {
                nextendaction: 'createSet'
            }),
            data: {
                name: name
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                this.$.trigger('setAdded', response.data.set)
            }, this));
    };

    NextendVisualSetsManagerEditable.prototype.renameVisualSet = function (id, name) {
        return N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.visualManager.parameters.ajaxUrl, {
                nextendaction: 'renameSet'
            }),
            data: {
                setId: id,
                name: name
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                this.$.trigger('setChanged', response.data.set);
                N2Classes.Notification.success(n2_('Set renamed'));
            }, this));
    };

    NextendVisualSetsManagerEditable.prototype.deleteVisualSet = function (id) {

        var d = $.Deferred(),
            set = this.visualManager.sets[id],
            deferreds = [];

        $.when(set._loadVisuals())
            .done($.proxy(function () {
                for (var k in set.visuals) {
                    deferreds.push(set.visuals[k]._delete());
                }

                $.when.apply($, deferreds).then($.proxy(function () {
                    N2Classes.AjaxHelper.ajax({
                        type: "POST",
                        url: N2Classes.AjaxHelper.makeAjaxUrl(this.visualManager.parameters.ajaxUrl, {
                            nextendaction: 'deleteSet'
                        }),
                        data: {
                            setId: id
                        },
                        dataType: 'json'
                    })
                        .done($.proxy(function (response) {
                            d.resolve();
                            this.$.trigger('setDeleted', response.data.set);
                        }, this));
                }, this));
            }, this))
            .fail(function () {
                d.reject();
            });
        return d
            .fail(function () {
                N2Classes.Notification.error(n2_('Unable to delete the set'));
            });
    };

    NextendVisualSetsManagerEditable.prototype.showManageSets = function () {
        var visualManager = this.visualManager,
            setsManager = this;
        if (this.modal === null) {
            this.modal = new N2Classes.NextendModal({
                zero: {
                    size: [
                        500,
                        390
                    ],
                    title: n2_('Sets'),
                    back: false,
                    close: true,
                    content: '',
                    controls: ['<a href="#" class="n2-add-new n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Add new') + '</a>'],
                    fn: {
                        show: function () {
                            this.title.html(n2_printf(n2_('%s sets'), visualManager.labels.visual));

                            this.createHeading(n2_('Sets')).appendTo(this.content);
                            var data = [];
                            for (var k in visualManager.sets) {
                                var id = visualManager.sets[k].set.id,
                                    label = $('<span></span>').text(visualManager.sets[k].set.value)
                                if (setsManager.isSetAllowedToEdit(id)) {
                                    data.push([label, $('<div class="n2-button n2-button-normal n2-button-xs n2-radius-s n2-button-grey n2-uc n2-h5">' + n2_('Rename') + '</div>')
                                        .on('click', {id: id}, $.proxy(function (e) {
                                            this.loadPane('rename', false, false, [e.data.id]);
                                        }, this)), $('<div class="n2-button n2-button-normal n2-button-xs n2-radius-s n2-button-red n2-uc n2-h5">' + n2_('Delete') + '</div>')
                                        .on('click', {id: id}, $.proxy(function (e) {
                                            this.loadPane('delete', false, false, [e.data.id]);
                                        }, this))]);
                                } else {
                                    data.push([label, '', '']);
                                }
                            }
                            this.createTable(data, ['width:100%;', '', '']).appendTo(this.createTableWrap().appendTo(this.content));

                            this.controls.find('.n2-add-new')
                                .on('click', $.proxy(function (e) {
                                    e.preventDefault();
                                    this.loadPane('addNew');
                                }, this));
                        }
                    }
                },
                addNew: {
                    title: n2_('Create set'),
                    size: [
                        500,
                        220
                    ],
                    back: 'zero',
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Add') + '</a>'],
                    fn: {
                        show: function () {

                            var button = this.controls.find('.n2-button'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                }).append(this.createInput(n2_('Name'), 'n2-visual-name', 'width: 446px;')),
                                nameField = this.content.find('#n2-visual-name').focus();

                            button.on('click', $.proxy(function (e) {
                                var name = nameField.val();
                                if (name == '') {
                                    N2Classes.Notification.error(n2_('Please fill the name field!'));
                                } else {
                                    setsManager.createVisualSet(name)
                                        .done($.proxy(function (response) {
                                            this.hide(e);
                                            N2Classes.Notification.success(n2_('Set added'));
                                            visualManager.setsSelector.val(response.data.set.id).trigger('change')
                                        }, this));
                                }
                            }, this));
                        }
                    }
                },
                rename: {
                    title: n2_('Rename set'),
                    size: [
                        500,
                        220
                    ],
                    back: 'zero',
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Rename') + '</a>'],
                    fn: {
                        show: function (id) {

                            var button = this.controls.find('.n2-button'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                }).append(this.createInput(n2_('Name'), 'n2-visual-name', 'width: 446px;')),
                                nameField = this.content.find('#n2-visual-name')
                                    .val(visualManager.sets[id].set.value).focus();

                            button.on('click', $.proxy(function () {
                                var name = nameField.val();
                                if (name == '') {
                                    N2Classes.Notification.error(n2_('Please fill the name field!'));
                                } else {
                                    setsManager.renameVisualSet(id, name)
                                        .done($.proxy(this.goBack, this));
                                }
                            }, this));
                        }
                    }
                },
                'delete': {
                    title: n2_('Delete set'),
                    size: [
                        500,
                        190
                    ],
                    back: 'zero',
                    close: true,
                    content: '',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-grey n2-uc n2-h4">' + n2_('Cancel') + '</a>', '<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-red n2-uc n2-h4">' + n2_('Yes') + '</a>'],
                    fn: {
                        show: function (id) {

                            this.createCenteredSubHeading(n2_printf(n2_('Do you really want to delete the set and all associated %s?'), visualManager.labels.visuals)).appendTo(this.content);

                            this.controls.find('.n2-button-grey')
                                .on('click', $.proxy(function (e) {
                                    e.preventDefault();
                                    this.goBack();
                                }, this));

                            this.controls.find('.n2-button-red')
                                .text('Yes, delete "' + visualManager.sets[id].set.value + '"')
                                .on('click', $.proxy(function (e) {
                                    e.preventDefault();
                                    setsManager.deleteVisualSet(id)
                                        .done($.proxy(this.goBack, this));
                                }, this));
                        }
                    }
                }
            }, false);
        }
        this.modal.show(false, [this.visualManager.setsSelector.val()]);
    };

    return NextendVisualSetsManagerEditable;
});
N2D('NextendVisualSet', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param set
     * @param visualManager
     * @constructor
     */
    function NextendVisualSet(set, visualManager) {
        this.set = set;
        this.visualManager = visualManager;

        this.visualList = $('<ul class="n2-list n2-h4"></ul>');


        this.visualManager.sets[set.id] = this;
        if (set.referencekey != '') {
            this.visualManager.setsByReference[set.referencekey] = set;
        }

        this.option = $('<option value="' + set.id + '"></option>').text(set.value)
            .appendTo(this.visualManager.setsSelector);
    }

    NextendVisualSet.prototype.active = function () {
        $.when(this._loadVisuals())
            .done($.proxy(function () {
                this.visualList.appendTo(this.visualManager.visualListContainer);
            }, this));
    };

    NextendVisualSet.prototype.notActive = function () {
        this.visualList.detach();
    };

    NextendVisualSet.prototype.loadVisuals = function (visuals) {
        if (typeof this.visuals === 'undefined') {
            this.visuals = {};
            for (var i = 0; i < visuals.length; i++) {
                this.addVisual(visuals[i]);
            }
        }
    };

    NextendVisualSet.prototype._loadVisuals = function () {
        if (this.visuals == null) {
            return N2Classes.AjaxHelper.ajax({
                type: "POST",
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.visualManager.parameters.ajaxUrl, {
                    nextendaction: 'loadVisualsForSet'
                }),
                data: {
                    setId: this.set.id
                },
                dataType: 'json'
            })
                .done($.proxy(function (response) {
                    this.loadVisuals(response.data.visuals);
                }, this));
        }
        return true;
    };

    NextendVisualSet.prototype.addVisual = function (visual) {
        if (typeof this.visuals[visual.id] === 'undefined') {
            this.visuals[visual.id] = this.visualManager.createVisual(visual, this);
            this.visualList.append(this.visuals[visual.id].createRow());
        }
        return this.visuals[visual.id];
    };

    NextendVisualSet.prototype.rename = function (name) {
        this.set.value = name;
        this.option.text(name);
    };

    NextendVisualSet.prototype.delete = function () {
        this.option.remove();
        delete this.visualManager.sets[this.set.id];
    };

    return NextendVisualSet;
});
N2D('NextendVisualManagerCore', function ($, undefined) {

    /**
     * @memberOf N2Classes
     * 
     * @param parameters
     * @constructor
     */
    function NextendVisualManagerCore(parameters) {
        this.loadDefaults();

        this.$ = $(this);

        window.nextend[this.type + 'Manager'] = this;

        this.modals = this.initModals();

        this.lightbox = $('#n2-lightbox-' + this.type);

        this.notificationStack = new N2Classes.NotificationStack(this.lightbox.find('.n2-top-bar'));

        this.visualListContainer = this.lightbox.find('.n2-lightbox-sidebar-list');

        this.parameters = parameters;

        this.visuals = {};

        this.controller = this.initController();
        if (this.controller) {
            this.renderer = this.controller.renderer;
        }

        this.firstLoadVisuals(parameters.visuals);

        $('.n2-' + this.type + '-save-as-new')
            .on('click', $.proxy(this.saveAsNew, this));

        this.cancelButton = $('#n2-' + this.type + '-editor-cancel')
            .on('click', $.proxy(this.hide, this));

        this.saveButton = $('#n2-' + this.type + '-editor-save')
            .off('click')
            .on('click', $.proxy(this.setVisual, this));
    }

    NextendVisualManagerCore.prototype.setTitle = function (title) {
        this.lightbox.find('.n2-logo').html(title);
    };

    NextendVisualManagerCore.prototype.loadDefaults = function () {
        this.mode = 'linked';
        this.labels = {
            visual: n2_('visual'),
            visuals: n2_('visuals')
        };
        this.visualLoadDeferreds = {};
        this.showParameters = false;
    };


    NextendVisualManagerCore.prototype.initModals = function () {
        return new N2Classes.NextendVisualManagerModals(this);
    };

    NextendVisualManagerCore.prototype.firstLoadVisuals = function (visuals) {

        for (var k in visuals) {
            this.sets[k].loadVisuals(visuals[k]);
        }
    };

    NextendVisualManagerCore.prototype.initController = function () {

    };

    NextendVisualManagerCore.prototype.getVisual = function (id) {
        if (parseInt(id) > 0) {
            if (typeof this.visuals[id] !== 'undefined') {
                return this.visuals[id];
            } else if (typeof this.visualLoadDeferreds[id] !== 'undefined') {
                return this.visualLoadDeferreds[id];
            } else {
                var deferred = $.Deferred();
                this.visualLoadDeferreds[id] = deferred;
                this._loadVisualFromServer(id)
                    .done($.proxy(function () {
                        deferred.resolve(this.visuals[id]);
                        delete this.visualLoadDeferreds[id];
                    }, this))
                    .fail($.proxy(function () {
                        // This visual is Empty!!!
                        deferred.resolve({
                            id: -1,
                            name: n2_('Empty')
                        });
                        delete this.visualLoadDeferreds[id];
                    }, this));
                return deferred;
            }
        } else {
            try {
                var decoded = id;
                if (decoded[0] != '{') {
                    decoded = N2Classes.Base64.decode(decoded)
                }
                JSON.parse(decoded);
                return {
                    id: 0,
                    name: n2_('Static')
                };
            } catch (e) {
                // This visual is Empty!!!
                return {
                    id: -1,
                    name: n2_('Empty')
                };
            }
        }
    };

    NextendVisualManagerCore.prototype._loadVisualFromServer = function (visualId) {
        return N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.parameters.ajaxUrl, {
                nextendaction: 'loadVisual'
            }),
            data: {
                visualId: visualId
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                n2c.error('@todo: load the visual data!');
            }, this));
    };

    NextendVisualManagerCore.prototype.show = function (data, saveCallback, showParameters) {
        N2Classes.Esc.add($.proxy(function () {
            this.hide();
            return true;
        }, this));

        this.notificationStack.enableStack();

        this.showParameters = $.extend({
            previewMode: false,
            previewHTML: false
        }, showParameters);

        $('body').css('overflow', 'hidden');
        this.lightbox.css('display', 'block');
        $(window)
            .on('resize.' + this.type + 'Manager', $.proxy(this.resize, this));
        this.resize();

        this.loadDataToController(data);
        this.controller.show();

        this.$.on('save', saveCallback);

        this._show();
    };

    NextendVisualManagerCore.prototype._show = function () {
        $(':focus').blur();

        $(window).on({
            'keydown.visual': $.proxy(function (e) {
                if (e.target.tagName != 'TEXTAREA' && e.target.tagName != 'INPUT') {
                    if (e.keyCode == 13) {
                        this.saveButton.trigger('click');
                    }
                }
            }, this)
        });
    };

    NextendVisualManagerCore.prototype.setAndClose = function (data) {
        this.$.trigger('save', [data]);
    };

    NextendVisualManagerCore.prototype.hide = function (e) {
        this.controller.pause();
        this.notificationStack.popStack();
        if (typeof e !== 'undefined') {
            e.preventDefault();
            N2Classes.Esc.pop();
        }
        this.controller.close();
        this.$.off('save');
        $(window).off('resize.' + this.type + 'Manager');
        $('body').css('overflow', '');
        this.lightbox.css('display', 'none');

        $(window).off('keydown.visual');
    };

    NextendVisualManagerCore.prototype.resize = function () {
        var h = this.lightbox.height();
        var sidebar = this.lightbox.find('.n2-sidebar');
        sidebar.find('.n2-lightbox-sidebar-list').height(h - 1 - sidebar.find('.n2-logo').outerHeight() - sidebar.find('.n2-sidebar-row').outerHeight() - sidebar.find('.n2-save-as-new-container').parent().height());

        var contentArea = this.lightbox.find('.n2-content-area').addClass('n2-scrollable');
        contentArea.height(h - 1 - contentArea.siblings('.n2-top-bar, .n2-table').outerHeight());
    };


    NextendVisualManagerCore.prototype.getDataFromController = function (data, showParameters, cb) {
        this.showParameters = $.extend({
            previewMode: false,
            previewHTML: false
        }, showParameters);
        return this.loadDataToController(data, cb);
    };

    NextendVisualManagerCore.prototype.loadDataToController = function (data) {
        if (this.isVisualData(data)) {
            $.when(this.getVisual(data)).done($.proxy(function (visual) {
                if (visual.id > 0) {
                    visual.activate();
                } else {
                    console.error(data + ' visual is not found linked');
                }
            }, this));
        } else {
            console.error(data + ' visual not found');
        }
    };

    NextendVisualManagerCore.prototype.isVisualData = function (data) {
        return parseInt(data) > 0;
    };

    NextendVisualManagerCore.prototype.setVisual = function (e) {
        e.preventDefault();
        switch (this.mode) {
            case 0:
                break;
            case 'static':
                this.modals.getLinkedOverwriteOrSaveAs()
                    .show('saveAsNew');
                break;
            case 'linked':
            default:
                if (this.activeVisual) {
                    if (this.activeVisual.compare(this.controller.get('set'))) {
                        //if (this.getBase64(this.activeVisual.name) == this.activeVisual.base64) {
                        this.setAndClose(this.activeVisual.id);
                        this.hide(e);
                    } else {

                        if (this.activeVisual && !this.activeVisual.isEditable()) {
                            this.modals.getLinkedOverwriteOrSaveAs()
                                .show('saveAsNew');
                        } else {
                            this.modals.getLinkedOverwriteOrSaveAs()
                                .show();
                        }
                    }
                } else {
                    this.modals.getLinkedOverwriteOrSaveAs()
                        .show('saveAsNew');
                }
                break;
        }
    };

    NextendVisualManagerCore.prototype.saveAsNew = function (e) {
        e.preventDefault();

        this.modals.getSaveAs()
            .show();
    };

    NextendVisualManagerCore.prototype._saveAsNew = function (name) {
        return N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.parameters.ajaxUrl, {
                nextendaction: 'addVisual'
            }),
            data: {
                setId: this.setsSelector.val(),
                value: N2Classes.Base64.encode(JSON.stringify({
                    name: name,
                    data: this.controller.get('saveAsNew')
                }))
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                var visual = response.data.visual;
                this.changeActiveVisual(this.sets[visual.referencekey].addVisual(visual));
            }, this));
    };

    NextendVisualManagerCore.prototype.saveActiveVisual = function (name) {

        return N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.parameters.ajaxUrl, {
                nextendaction: 'changeVisual'
            }),
            data: {
                visualId: this.activeVisual.id,
                value: this.getBase64(name)
            },
            dataType: 'json'
        }).done($.proxy(function (response) {
            this.activeVisual.setValue(response.data.visual.value, true);
        }, this));
    };

    NextendVisualManagerCore.prototype.changeActiveVisual = function (visual) {
        if (this.activeVisual) {
            this.activeVisual.notActive();
            this.activeVisual = false;
        }
        if (visual /*&& (this.mode == 0 || this.mode == 'linked')*/) {
            if (this.mode == 'static') {
                this.setMode('linked');
            }
            visual.active();
            this.activeVisual = visual;
        }
    };

    NextendVisualManagerCore.prototype.getBase64 = function (name) {

        return N2Classes.Base64.encode(JSON.stringify({
            name: name,
            data: this.controller.get('set')
        }));
    };

    NextendVisualManagerCore.prototype.removeRules = function (mode, visual) {
        this.renderer.deleteRules(mode, this.parameters.renderer.pre, '.' + this.getClass(visual.id, mode));
    };

    return NextendVisualManagerCore;
});

N2D('NextendVisualManagerEditableSets', ['NextendVisualManagerVisibleSets'], function ($, undefined) {
    /**
     * Sets are editable
     * Ex.: Layout
     *
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendVisualManagerEditableSets() {
        N2Classes.NextendVisualManagerVisibleSets.prototype.constructor.apply(this, arguments);
    }

    NextendVisualManagerEditableSets.prototype = Object.create(N2Classes.NextendVisualManagerVisibleSets.prototype);
    NextendVisualManagerEditableSets.prototype.constructor = NextendVisualManagerEditableSets;

    NextendVisualManagerEditableSets.prototype.initSetsManager = function () {
        new N2Classes.NextendVisualSetsManagerEditable(this);
    };

    return NextendVisualManagerEditableSets;
});

N2D('NextendVisualManagerMultipleSelection', ['NextendVisualManagerVisibleSets'], function ($, undefined) {
    /**
     * Multiple selection
     * Ex.: Background animation, Post background animation
     *
     * @memberOf N2Classes
     */

    function NextendVisualManagerMultipleSelection(parameters) {

        window.nextend[this.type + 'Manager'] = this;

        // Push the constructor to the first show as an optimization.
        this._lateInit = $.proxy(function (parameters) {
            N2Classes.NextendVisualManagerVisibleSets.prototype.constructor.call(this, parameters);
        }, this, parameters);

    }

    NextendVisualManagerMultipleSelection.prototype = Object.create(N2Classes.NextendVisualManagerVisibleSets.prototype);
    NextendVisualManagerMultipleSelection.prototype.constructor = NextendVisualManagerMultipleSelection;


    NextendVisualManagerMultipleSelection.prototype.lateInit = function () {
        if (!this.inited) {
            this.inited = true;

            this._lateInit();
        }
    };

    NextendVisualManagerMultipleSelection.prototype.show = function (data, saveCallback, controllerParameters) {

        this.lateInit();

        this.notificationStack.enableStack();

        N2Classes.Esc.add($.proxy(function () {
            this.hide();
            return true;
        }, this));

        $('body').css('overflow', 'hidden');
        this.lightbox.css('display', 'block');
        $(window)
            .on('resize.' + this.type + 'Manager', $.proxy(this.resize, this));
        this.resize();

        var i = 0;
        if (data != '') {
            var selected = data.split('||'),
                hasSelected = false;
            for (; i < selected.length; i++) {
                $.when(this.getVisual(selected[i])).done(function (visual) {
                    if (visual && visual.check) {
                        visual.check();
                        if (!hasSelected) {
                            hasSelected = true;
                            visual.activate();
                        }
                    }
                });
            }
        }

        this.$.on('save', saveCallback);

        this.controller.start(controllerParameters);

        if (i == 0) {
            $.when(this.activeSet._loadVisuals())
                .done($.proxy(function () {
                    for (var k in this.activeSet.visuals) {
                        this.activeSet.visuals[k].activate();
                        break;
                    }
                }, this));
        }

        this._show();
    };

    NextendVisualManagerMultipleSelection.prototype.setVisual = function (e) {
        e.preventDefault();
        this.setAndClose(this.getAsString());
        this.hide(e);
    };

    NextendVisualManagerMultipleSelection.prototype.getAsString = function () {
        var selected = [];
        for (var k in this.sets) {
            var set = this.sets[k];
            for (var i in set.visuals) {
                if (set.visuals[i].checked) {
                    selected.push(set.visuals[i].id);
                }
            }
        }
        if (selected.length == 0 && this.activeVisual) {
            selected.push(this.activeVisual.id);
        }
        return selected.join('||');
    };

    NextendVisualManagerMultipleSelection.prototype.hide = function (e) {
        N2Classes.NextendVisualManagerVisibleSets.prototype.hide.apply(this, arguments);

        for (var k in this.sets) {
            var set = this.sets[k];
            for (var i in set.visuals) {
                set.visuals[i].unCheck();
            }
        }
    };

    return NextendVisualManagerMultipleSelection;
});

N2D('NextendVisualManagerSetsAndMore', ['NextendVisualManagerEditableSets'], function ($, undefined) {
    /**
     * Static and linked mode
     * Ex.: Style, Fonts, Animation
     *
     * @memberOf N2Classes
     */

    function NextendVisualManagerSetsAndMore() {
        N2Classes.NextendVisualManagerEditableSets.prototype.constructor.apply(this, arguments);

        this.linkedButton = $('#n2-' + this.type + '-editor-set-as-linked');
        this.setMode(0);
    }

    NextendVisualManagerSetsAndMore.prototype = Object.create(N2Classes.NextendVisualManagerEditableSets.prototype);
    NextendVisualManagerSetsAndMore.prototype.constructor = NextendVisualManagerSetsAndMore;


    NextendVisualManagerSetsAndMore.prototype.setMode = function (newMode) {
        if (newMode == 'static') {
            this.changeActiveVisual(null);
        }
        if (this.mode != newMode) {
            switch (newMode) {
                case 0:
                    //this.modeRadio.parent.css('display', 'none');
                    this.cancelButton.css('display', 'none');
                    this.saveButton
                        .off('click');
                    break;

                case 'static':
                default:
                    this.cancelButton.css('display', 'inline-block');
                    this.saveButton
                        .off('click')
                        .on('click', $.proxy(this.setVisualAsStatic, this));
                    this.linkedButton
                        .off('click')
                        .on('click', $.proxy(this.setVisualAsLinked, this));
                    break;
            }
            this.mode = newMode;
        }
    };

    NextendVisualManagerSetsAndMore.prototype.loadDataToController = function (data, cb) {
        if (parseInt(data) > 0) {
            $.when(this.getVisual(data)).done($.proxy(function (visual) {
                if (visual.id > 0) {
                    this.setMode('linked');

                    visual.activate(false, cb);
                } else {
                    this.setMode('static');
                    if (typeof cb == 'function') {
                        this.controller.asyncVisualData('', this.showParameters, cb);
                    } else {
                        this.controller.load('', false, this.showParameters);
                    }
                }
            }, this));
        } else {
            var visualData = '';
            this.setMode('static');
            try {
                visualData = this.getStaticData(data);
            } catch (e) {
                // This visual is Empty!!!
            }
            if (typeof cb == 'function') {
                this.controller.asyncVisualData(visualData, this.showParameters, cb);
            } else {
                this.controller.load(visualData, false, this.showParameters);
            }
        }
    };

    NextendVisualManagerSetsAndMore.prototype.getStaticData = function (data) {

        var decoded = data;
        if (decoded[0] != '{') {
            decoded = N2Classes.Base64.decode(decoded)
        }

        var d = JSON.parse(decoded).data;
        if (typeof d === 'undefined') {
            return '';
        }
        return d;
    };

    NextendVisualManagerSetsAndMore.prototype.setVisualAsLinked = function (e) {
        this.setVisual(e);
    };

    NextendVisualManagerSetsAndMore.prototype.setVisualAsStatic = function (e) {
        e.preventDefault();
        this.setAndClose(this.getBase64(n2_('Static')));
        this.hide(e);
    };

    return NextendVisualManagerSetsAndMore;
});
N2D('NextendVisualManagerVisibleSets', ['NextendVisualManagerCore'], function ($, undefined) {
    /**
     * Sets are visible
     *
     * @memberOf N2Classes
     */
    function NextendVisualManagerVisibleSets() {
        N2Classes.NextendVisualManagerCore.prototype.constructor.apply(this, arguments);
    }

    NextendVisualManagerVisibleSets.prototype = Object.create(N2Classes.NextendVisualManagerCore.prototype);
    NextendVisualManagerVisibleSets.prototype.constructor = NextendVisualManagerVisibleSets;

    NextendVisualManagerVisibleSets.prototype.firstLoadVisuals = function (visuals) {
        this.sets = {};
        this.setsByReference = {};

        this.setsSelector = $('#' + this.parameters.setsIdentifier + 'sets_select');
        for (var i = 0; i < this.parameters.sets.length; i++) {
            this.newVisualSet(this.parameters.sets[i]);
        }
        this.initSetsManager();
        for (var k in visuals) {
            this.sets[k].loadVisuals(visuals[k])
        }

        this.activeSet = this.sets[this.setsSelector.val()];
        this.activeSet.active();

        this.setsSelector.on('change', $.proxy(function () {
            this.activeSet.notActive();
            this.activeSet = this.sets[this.setsSelector.val()];
            this.activeSet.active();
        }, this));
    };


    NextendVisualManagerVisibleSets.prototype.initSetsManager = function () {
        new N2Classes.NextendVisualSetsManager(this);
    };

    NextendVisualManagerVisibleSets.prototype._loadVisualFromServer = function (visualId) {
        return N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.parameters.ajaxUrl, {
                nextendaction: 'loadSetByVisualId'
            }),
            data: {
                visualId: visualId
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                this.sets[response.data.set.setId].loadVisuals(response.data.set.visuals);

            }, this));
    };

    NextendVisualManagerVisibleSets.prototype.changeSet = function (setId) {
        if (this.setsSelector.val() != setId) {
            this.setsSelector.val(setId)
                .trigger('change');
        }
    };

    NextendVisualManagerVisibleSets.prototype.changeSetById = function (id) {
        if (typeof this.sets[id] !== 'undefined') {
            this.changeSet(id);
        }
    };

    NextendVisualManagerVisibleSets.prototype.newVisualSet = function (set) {
        return new N2Classes.NextendVisualSet(set, this);
    };

    return NextendVisualManagerVisibleSets;
});

N2D('NextendFontEditor', ['NextendFragmentEditor'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendFontEditor() {
        N2Classes.NextendFragmentEditor.prototype.constructor.apply(this, arguments);

        this.fields = {
            family: {
                element: $('#n2-font-editorfamily'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeFamily, this)
                }
            },
            color: {
                element: $('#n2-font-editorcolor'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeColor, this)
                }
            },
            size: {
                element: $('#n2-font-editorsize'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeSize, this)
                }
            },
            lineHeight: {
                element: $('#n2-font-editorlineheight'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeLineHeight, this)
                }
            },
            weight: {
                element: $('#n2-font-editorweight'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeWeight, this)
                }
            },
            decoration: {
                element: $('#n2-font-editordecoration'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeDecoration, this)
                }
            },
            align: {
                element: $('#n2-font-editortextalign'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeAlign, this)
                }
            },
            shadow: {
                element: $('#n2-font-editortshadow'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeShadow, this)
                }
            },
            letterSpacing: {
                element: $('#n2-font-editorletterspacing'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeLetterSpacing, this)
                }
            },
            wordSpacing: {
                element: $('#n2-font-editorwordspacing'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeWordSpacing, this)
                }
            },
            textTransform: {
                element: $('#n2-font-editortexttransform'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeTextTransform, this)
                }
            },
            css: {
                element: $('#n2-font-editorextracss'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeCSS, this)
                }
            }
        };
    }

    NextendFontEditor.prototype = Object.create(N2Classes.NextendFragmentEditor.prototype);
    NextendFontEditor.prototype.constructor = NextendFontEditor;

    NextendFontEditor.prototype.load = function (values) {
        this._off();
        var family = values.afont.split('||'); // split for a while for compatibility
        this.fields.family.element.data('field').insideChange(family[0]);

        this.fields.color.element.data('field').insideChange(values.color);
        this.fields.size.element.data('field').insideChange(values.size
            .split('||')
            .join('|*|')
        );

        this.fields.lineHeight.element.data('field').insideChange(values.lineheight);
        this.fields.weight.element.data('field').insideChange(values.weight);
        this.fields.decoration.element.data('field').insideChange([
            values.italic == 1 ? 'italic' : '',
            values.underline == 1 ? 'underline' : ''
        ].join('||'));

        this.fields.align.element.data('field').insideChange(values.align);
        this.fields.shadow.element.data('field').insideChange(values.tshadow.replace(/\|\|px/g, ''));
        this.fields.letterSpacing.element.data('field').insideChange(values.letterspacing);
        this.fields.wordSpacing.element.data('field').insideChange(values.wordspacing);
        this.fields.textTransform.element.data('field').insideChange(values.texttransform);
        this.fields.css.element.data('field').insideChange(values.extra);

        this._on();
    };

    NextendFontEditor.prototype.changeFamily = function () {
        this.trigger('afont', this.fields.family.element.val());
    };

    NextendFontEditor.prototype.changeColor = function () {
        this.trigger('color', this.fields.color.element.val());
    };

    NextendFontEditor.prototype.changeSize = function () {
        this.trigger('size', this.fields.size.element.val().replace('|*|', '||'));
    };

    NextendFontEditor.prototype.changeLineHeight = function () {
        this.trigger('lineheight', this.fields.lineHeight.element.val());
    };

    NextendFontEditor.prototype.changeWeight = function () {
        this.trigger('weight', this.fields.weight.element.val());
    };

    NextendFontEditor.prototype.changeDecoration = function () {
        var value = this.fields.decoration.element.val();

        var italic = 0;
        if (value.indexOf('italic') != -1) {
            italic = 1;
        }
        this.trigger('italic', italic);

        var underline = 0;
        if (value.indexOf('underline') != -1) {
            underline = 1;
        }
        this.trigger('underline', underline);
    };

    NextendFontEditor.prototype.changeAlign = function () {
        this.trigger('align', this.fields.align.element.val());
    };

    NextendFontEditor.prototype.changeShadow = function () {
        this.trigger('tshadow', this.fields.shadow.element.val());
    };

    NextendFontEditor.prototype.changeLetterSpacing = function () {
        this.trigger('letterspacing', this.fields.letterSpacing.element.val());
    };

    NextendFontEditor.prototype.changeWordSpacing = function () {
        this.trigger('wordspacing', this.fields.wordSpacing.element.val());
    };

    NextendFontEditor.prototype.changeTextTransform = function () {
        this.trigger('texttransform', this.fields.textTransform.element.val());
    };

    NextendFontEditor.prototype.changeCSS = function () {
        this.trigger('extra', this.fields.css.element.val());
    };

    return NextendFontEditor;
});
N2D('NextendFontEditorController', ['NextendFragmentEditorController'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param previewModesList
     * @param defaultFamily
     * @constructor
     */
    function NextendFontEditorController(previewModesList, defaultFamily) {
        this.defaultFamily = defaultFamily;
        N2Classes.NextendFragmentEditorController.prototype.constructor.apply(this, arguments);

        this.fontSize = 16;
        this.preview = $('#n2-font-editor-preview').css('fontSize', '16px');

        this.initBackgroundColor();
    }

    NextendFontEditorController.prototype = Object.create(N2Classes.NextendFragmentEditorController.prototype);
    NextendFontEditorController.prototype.constructor = NextendFontEditorController;

    NextendFontEditorController.prototype.loadDefaults = function () {
        N2Classes.NextendFragmentEditorController.prototype.loadDefaults.call(this);
        this.type = 'font';
        this.preview = null;
        this.fontSize = 14;
    };

    NextendFontEditorController.prototype.initPreviewModes = function () {

        this.previewModes = {
            1: [this.previewModesList['simple']],
            2: [this.previewModesList['link'], this.previewModesList['hover'], this.previewModesList['accordionslidetitle']],
            3: [this.previewModesList['paragraph'], this.previewModesList['list']]
        };
    };

    NextendFontEditorController.prototype.initRenderer = function () {
        return new N2Classes.NextendFontRenderer(this);
    };

    NextendFontEditorController.prototype.initEditor = function () {
        return new N2Classes.NextendFontEditor();
    };

    NextendFontEditorController.prototype._load = function (visual, tabs, parameters) {
        if (visual.length) {
            visual = this.fixBold(visual);
            visual[0] = $.extend({}, this.getEmptyFont(), visual[0]);
        }

        N2Classes.NextendFragmentEditorController.prototype._load.call(this, visual, tabs, parameters);
    };

    NextendFontEditorController.prototype.asyncVisualData = function (visual, showParameters, cb) {
        if (visual.length) {
            visual = this.fixBold(visual);
            visual[0] = $.extend({}, this.getEmptyFont(), visual[0]);
        }

        N2Classes.NextendFragmentEditorController.prototype.asyncVisualData.call(this, visual, showParameters, cb);
    };

    NextendFontEditorController.prototype.fixBold = function (visual) {
        for (var i = 0; i < visual.length; i++) {
            if (visual[i].bold !== undefined) {
                if (visual[i].weight !== undefined) {
                    delete visual[i].bold;
                } else {
                    if (visual[i].bold == 1) {
                        visual[i].weight = 700;
                    } else if (visual[i].bold > 0) {
                        visual[i].weight = visual[i].bold;
                    }
                    delete visual[i].bold;
                }
            }
        }

        return visual;
    }

    NextendFontEditorController.prototype.getEmptyFont = function () {
        return {
            color: "000000ff",
            size: "14||px",
            tshadow: "0|*|0|*|0|*|000000ff",
            afont: this.defaultFamily,
            lineheight: "1.5",
            weight: 400,
            italic: 0,
            underline: 0,
            align: "left",
            letterspacing: "normal",
            wordspacing: "normal",
            texttransform: "none",
            extra: ""
        };
    };

    NextendFontEditorController.prototype.getCleanVisual = function () {
        return {
            extra: ''
        };
    };

    NextendFontEditorController.prototype.getEmptyVisual = function () {
        return [this.getEmptyFont()];
    };

    NextendFontEditorController.prototype.initBackgroundColor = function () {

        new N2Classes.FormElementText("n2-font-editor-background-color");
        new N2Classes.FormElementColor("n2-font-editor-background-color", 0);

        var box = this.lightbox.find('.n2-editor-preview-box');
        $('#n2-font-editor-background-color').on('nextendChange', function () {
            box.css('background', '#' + $(this).val());
        });
    };

    NextendFontEditorController.prototype._renderPreview = function () {
        N2Classes.NextendFragmentEditorController.prototype._renderPreview.call(this);
        this.addStyle(this.renderer.getCSS(this.currentPreviewMode, '', '.' + this.getPreviewCssClass(), this.currentVisual, {
            activeTab: this.currentTabIndex
        }));
    };

    NextendFontEditorController.prototype.setPreview = function (mode) {

        var html = '';
        if (typeof this.localModePreview[mode] !== 'undefined') {
            html = this.localModePreview[mode];
        } else {
            html = this.previewModesList[mode].preview;
        }

        var fontClassName = this.getPreviewCssClass(),
            styleClassName = nextend.fontManager.styleClassName,
            styleClassName2 = nextend.fontManager.styleClassName2;

        html = html.replace(/\{([^]*?)\}/g, function (match, script) {
            return eval(script);
        });

        this.preview.html(html);
    };

    NextendFontEditorController.prototype.getPreviewCssClass = function () {
        return 'n2-' + this.type + '-editor-preview';
    };

    return NextendFontEditorController;
});
N2D('NextendFont', ['NextendVisualWithSetRow'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendFont() {
        N2Classes.NextendVisualWithSetRow.prototype.constructor.apply(this, arguments);
    }

    NextendFont.prototype = Object.create(N2Classes.NextendVisualWithSetRow.prototype);
    NextendFont.prototype.constructor = NextendFont;

    NextendFont.prototype.removeRules = function () {
        var used = this.isUsed();
        if (used) {
            for (var i = 0; i < used.length; i++) {
                this.visualManager.removeRules(used[i], this);
            }
        }
    };

    NextendFont.prototype.render = function () {
        var used = this.isUsed();
        if (used) {
            for (var i = 0; i < used.length; i++) {
                this.visualManager.renderLinkedFont(used[i], this);
            }
        }
    };

    NextendFont.prototype.isUsed = function () {
        if (typeof this.visualManager.parameters.renderer.usedFonts[this.id] !== 'undefined') {
            return this.visualManager.parameters.renderer.usedFonts[this.id];
        }
        return false;
    };

    return NextendFont;
});
N2D('NextendFontManager', ['NextendVisualManagerSetsAndMore'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendFontManager() {
        N2Classes.NextendVisualManagerSetsAndMore.prototype.constructor.apply(this, arguments);
    }

    NextendFontManager.prototype = Object.create(N2Classes.NextendVisualManagerSetsAndMore.prototype);
    NextendFontManager.prototype.constructor = NextendFontManager;

    NextendFontManager.prototype.loadDefaults = function () {
        N2Classes.NextendVisualManagerSetsAndMore.prototype.loadDefaults.apply(this, arguments);
        this.type = 'font';
        this.labels = {
            visual: n2_('font'),
            visuals: n2_('fonts')
        };

        this.styleClassName = '';
        this.styleClassName2 = '';
    };

    NextendFontManager.prototype.initController = function () {
        return new N2Classes.NextendFontEditorController(this.parameters.renderer.modes, this.parameters.defaultFamily);
    };

    NextendFontManager.prototype.addVisualUsage = function (mode, fontValue, pre) {
        /**
         * if fontValue is numeric, then it is a linked font!
         */
        if (parseInt(fontValue) > 0) {
            return this._addLinkedFont(mode, fontValue, pre);
        } else {
            try {
                this._renderStaticFont(mode, fontValue, pre);
                return true;
            } catch (e) {
                // Empty font
                return false;
            }
        }
    };

    NextendFontManager.prototype._addLinkedFont = function (mode, fontId, pre) {
        var used = this.parameters.renderer.usedFonts,
            d = $.Deferred();
        $.when(this.getVisual(fontId))
            .done($.proxy(function (font) {
                if (font.id > 0) {
                    if (typeof pre === 'undefined') {
                        if (typeof used[font.id] === 'undefined') {
                            used[font.id] = [mode];
                            this.renderLinkedFont(mode, font, pre);
                        } else if ($.inArray(mode, used[font.id]) == -1) {
                            used[font.id].push(mode);
                            this.renderLinkedFont(mode, font, pre);
                        }
                    } else {
                        this.renderLinkedFont(mode, font, pre);
                    }
                    d.resolve(true);
                } else {
                    d.resolve(false);
                }
            }, this))
            .fail(function () {
                d.resolve(false);
            });
        return d;
    };

    NextendFontManager.prototype.renderLinkedFont = function (mode, font, pre) {
        if (typeof pre === 'undefined') {
            pre = this.parameters.renderer.pre;
        }
        nextend.css.add(this.renderer.getCSS(mode, pre, '.' + this.getClass(font.id, mode), font.value, {
            deleteRule: true
        }));

    };

    NextendFontManager.prototype._renderStaticFont = function (mode, fontJsonOrBase64, pre) {
        if (typeof pre === 'undefined') {
            pre = this.parameters.renderer.pre;
        }
        var jsonFont = fontJsonOrBase64;
        if (jsonFont[0] != '{') {
            jsonFont = N2Classes.Base64.decode(jsonFont);
        }
        nextend.css.add(this.renderer.getCSS(mode, pre, '.' + this.getClass(fontJsonOrBase64, mode), JSON.parse(jsonFont).data, {}));
    };

    /**
     * We should never use this method as we do not track if a font used with the same mode multiple times.
     * So there is no sync and if we delete a used font, other usages might fail to update correctly in
     * special circumstances.
     * @param mode
     * @param fontId
     */
    NextendFontManager.prototype.removeUsedFont = function (mode, fontId) {
        var used = this.parameters.renderer.usedFonts;
        if (typeof used[fontId] !== 'undefined') {
            var index = $.inArray(mode, used[fontId]);
            if (index > -1) {
                used[fontId].splice(index, 1);
            }
        }
    };

    NextendFontManager.prototype.getClass = function (font, mode) {
        if (parseInt(font) > 0) {
            return 'n2-font-' + font + '-' + mode;
        } else if (font == '') {
            // Empty font
            return '';
        } else if (font == '{') {
            font = N2Classes.Base64.encode(font);
        }
        // Font might be empty with this class too, but we do not care as nothing wrong if it has an extra class
        // We could do try catch to JSON.parse(N2Classes.Base64.decode(font)), but it is wasting resource
        return 'n2-font-' + md5(font) + '-' + mode;
    };

    NextendFontManager.prototype.createVisual = function (visual, set) {
        return new N2Classes.NextendFont(visual, set, this);
    };

    NextendFontManager.prototype.setConnectedStyle = function (styleId) {
        this.styleClassName = $('#' + styleId).data('field').renderStyle();
    };

    NextendFontManager.prototype.setConnectedStyle2 = function (styleId) {
        this.styleClassName2 = $('#' + styleId).data('field').renderStyle();
    };

    return NextendFontManager;

});
N2D('NextendFontRenderer', ['NextendVisualRenderer'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendFontRenderer() {
        N2Classes.NextendVisualRenderer.prototype.constructor.apply(this, arguments);
    }

    NextendFontRenderer.prototype = Object.create(N2Classes.NextendVisualRenderer.prototype);
    NextendFontRenderer.prototype.constructor = NextendFontRenderer;


    NextendFontRenderer.prototype.getCSS = function (modeKey, pre, selector, visualTabs, parameters) {
        visualTabs = $.extend([], visualTabs);
        visualTabs[0] = $.extend(this.editorController.getEmptyFont(), visualTabs[0]);
        if (this.editorController.previewModesList[modeKey].renderOptions.combined) {
            for (var i = 1; i < visualTabs.length; i++) {
                visualTabs[i] = $.extend({}, visualTabs[i - 1], visualTabs[i]);
                if (visualTabs[i].size === visualTabs[0].size) {
                    visualTabs[i].size = '100||%';
                } else {
                    var size1 = visualTabs[0].size.split('||'),
                        size2 = visualTabs[i].size.split('||');
                    if (size1.length === 2 && size2.length === 2 && size1[1] === 'px' && size2[1] === 'px') {
                        visualTabs[i].size = Math.round(size2[0] / size1[0] * 100) + '||%';
                    }
                }
            }
        }
        return N2Classes.NextendVisualRenderer.prototype.getCSS.call(this, modeKey, pre, selector, visualTabs, parameters);
    };

    NextendFontRenderer.prototype.makeStylecolor = function (value, target) {
        target.color = '#' + value.substr(0, 6) + ";\ncolor: " + N2Color.hex2rgbaCSS(value);
    };

    NextendFontRenderer.prototype.makeStylesize = function (value, target) {
        var fontSize = value.split('||');
        if (fontSize[1] == 'px') {
            target.fontSize = (fontSize[0] / this.editorController.fontSize * 100) + '%';
        } else {
            target.fontSize = value.replace('||', '');
        }
    };

    NextendFontRenderer.prototype.makeStyletshadow = function (value, target) {
        var ts = value.split('|*|');
        if (ts[0] == '0' && ts[1] == '0' && ts[2] == '0') {
            target.textShadow = 'none';
        } else {
            target.textShadow = ts[0] + 'px ' + ts[1] + 'px ' + ts[2] + 'px ' + N2Color.hex2rgbaCSS(ts[3]);
        }
    };

    NextendFontRenderer.prototype.makeStyleafont = function (value, target) {
        var families = value.split(',');
        for (var i = 0; i < families.length; i++) {
            families[i] = this.getFamily(families[i]
                .replace(/^\s+|\s+$/gm, '')
                .replace(/"|'/gm, ''));
        }
        target.fontFamily = families.join(',');
    };

    NextendFontRenderer.prototype.getFamily = function (family) {
        var translatedFamily = $(window).triggerHandler('n2Family', [family]);
        if (translatedFamily === undefined) {
            translatedFamily = family;
        }
        return "'" + translatedFamily + "'";
    };

    NextendFontRenderer.prototype.makeStylelineheight = function (value, target) {

        target.lineHeight = value;
    };

    NextendFontRenderer.prototype.makeStyleweight =
        NextendFontRenderer.prototype.makeStylebold = function (value, target) {
            if (value == 1) {
                target.fontWeight = 'bold';
            } else if (value > 1) {
                target.fontWeight = value;
            } else {
                target.fontWeight = 'normal';
            }
        };

    NextendFontRenderer.prototype.makeStyleitalic = function (value, target) {
        if (value == 1) {
            target.fontStyle = 'italic';
        } else {
            target.fontStyle = 'normal';
        }
    };

    NextendFontRenderer.prototype.makeStyleunderline = function (value, target) {
        if (value == 1) {
            target.textDecoration = 'underline';
        } else {
            target.textDecoration = 'none';
        }
    };

    NextendFontRenderer.prototype.makeStylealign = function (value, target) {

        target.textAlign = value;
    };

    NextendFontRenderer.prototype.makeStyleletterspacing = function (value, target) {
        target.letterSpacing = value;
    };

    NextendFontRenderer.prototype.makeStylewordspacing = function (value, target) {
        target.wordSpacing = value;
    };

    NextendFontRenderer.prototype.makeStyletexttransform = function (value, target) {
        target.textTransform = value;
    };

    NextendFontRenderer.prototype.makeStyleextra = function (value, target) {

        target.raw = value;
    };

    return NextendFontRenderer;
});
N2D('NextendImageEditor', ['NextendFragmentEditor'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendImageEditor() {
        this.previews = null;
        this.desktopImage = '';

        N2Classes.NextendFragmentEditor.prototype.constructor.apply(this, arguments);

        this.fields = {
            'desktop-size': {
                element: $('#n2-image-editordesktop-size'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeSize, this, 'desktop')
                }
            },
            'desktop-retina-image': {
                element: $('#n2-image-editordesktop-retina-image'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeImage, this, 'desktop-retina')
                }
            },
            'desktop-retina-size': {
                element: $('#n2-image-editordesktop-retina-size'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeSize, this, 'desktop-retina')
                }
            },
            'tablet-image': {
                element: $('#n2-image-editortablet-image'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeImage, this, 'tablet')
                }
            },
            'tablet-size': {
                element: $('#n2-image-editortablet-size'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeSize, this, 'tablet')
                }
            },
            'tablet-retina-image': {
                element: $('#n2-image-editortablet-retina-image'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeImage, this, 'tablet-retina')
                }
            },
            'tablet-retina-size': {
                element: $('#n2-image-editortablet-retina-size'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeSize, this, 'tablet-retina')
                }
            },
            'mobile-image': {
                element: $('#n2-image-editormobile-image'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeImage, this, 'mobile')
                }
            },
            'mobile-size': {
                element: $('#n2-image-editormobile-size'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeSize, this, 'mobile')
                }
            },
            'mobile-retina-image': {
                element: $('#n2-image-editormobile-retina-image'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeImage, this, 'mobile-retina')
                }
            },
            'mobile-retina-size': {
                element: $('#n2-image-editormobile-retina-size'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeSize, this, 'mobile-retina')
                }
            }
        };

        this.previews = {
            desktop: $('#n2-image-editordesktop-preview'),
            'desktop-retina': $('#n2-image-editordesktop-retina-preview'),
            tablet: $('#n2-image-editortablet-preview'),
            'tablet-retina': $('#n2-image-editortablet-retina-preview'),
            mobile: $('#n2-image-editormobile-preview'),
            'mobile-retina': $('#n2-image-editormobile-retina-preview')
        };

        var generateTablet = $(this.buttonGenerate())
            .on('click', $.proxy(this.generateImage, this, 'tablet'))
            .insertAfter(this.fields['tablet-image'].element.parent());

        var generateMobile = $(this.buttonGenerate())
            .on('click', $.proxy(this.generateImage, this, 'mobile'))
            .insertAfter(this.fields['mobile-image'].element.parent());
    }

    NextendImageEditor.prototype = Object.create(N2Classes.NextendFragmentEditor.prototype);
    NextendImageEditor.prototype.constructor = NextendImageEditor;

    NextendImageEditor.prototype.load = function (image, values) {
        this._off();
        for (var k in this.fields) {
            var keys = [k.substring(0, k.lastIndexOf("-")), k.substring(k.lastIndexOf("-") + 1)];
            this.fields[k].element.data('field').insideChange(values[keys[0]][keys[1]]);
        }
        this.desktopImage = image;
        this.makePreview('desktop', image);

        if (values.desktop.size == '0|*|0') {
            this.getImageSize(image)
                .done($.proxy(function (width, height) {
                    this.fields['desktop-size'].element.data('field').insideChange(width + '|*|' + height);
                }, this));
        }

        for (var k in values) {
            if (typeof values[k].image != 'undefined') {
                this.makePreview(k, values[k].image);
            }
        }
        this._on();
    };

    NextendImageEditor.prototype.changeImage = function (device, e, field) {
        var image = field.element.val();
        if (this.makePreview(device, image)) {
            this.getImageSize(image)
                .done($.proxy(function (width, height) {
                    this.fields[device + '-size'].element.data('field').insideChange(width + '|*|' + height);
                }, this));
        } else {
            this.fields[device + '-size'].element.data('field').insideChange('0|*|0');
        }

        this.trigger(device, 'image', image);
    };

    NextendImageEditor.prototype.changeSize = function (device, e, field) {
        this.trigger(device, 'size', field.element.val());
    };

    NextendImageEditor.prototype.makePreview = function (device, image) {
        if (image) {
            this.previews[device].html('<img style="max-width:100%; max-height: 300px;" src="' + nextend.imageHelper.fixed(image) + '" />');
            return true;
        } else {
            this.previews[device].html('');
            return false;
        }
    };
    NextendImageEditor.prototype.getImageSize = function (image) {
        var deferred = $.Deferred(),
            newImage = new Image();

        newImage.onload = function () {
            deferred.resolve(newImage.width, newImage.height);
        };

        newImage.src = nextend.imageHelper.fixed(image);
        if (newImage.complete || newImage.readyState === 4) {
            newImage.onload();
        }
        return deferred;
    };

    NextendImageEditor.prototype.buttonGenerate = function () {
        return '<a href="#" class="n2-button n2-button-normal n2-button-m n2-radius-s n2-button-grey n2-h5 n2-uc">' + n2_('Generate') + '</a>';
    };

    NextendImageEditor.prototype.generateImage = function (device) {
        var image = this.desktopImage;
        if (image == '') {
            N2Classes.Notification.error(n2_('Desktop image is empty!'), {
                timeout: 3
            });
            return false;
        } else {
            return N2Classes.AjaxHelper.ajax({
                type: "POST",
                url: N2Classes.AjaxHelper.makeAjaxUrl(nextend.imageManager.parameters.ajaxUrl, {
                    nextendaction: 'generateImage'
                }),
                data: {
                    device: device,
                    image: image
                },
                dataType: 'json'
            }).done($.proxy(function (response) {
                var image = response.data.image;
                this.fields[device + '-image'].element.data('field').insideChange(nextend.imageHelper.make(image));
            }, this));
        }
    };

    NextendImageEditor.prototype.trigger = function (device, property, value) {
        this.$.trigger('change', [device, property, value]);
    };

    return NextendImageEditor;
});
N2D('NextendImageEditorController', ['NextendFragmentEditorControllerWithEditor'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendImageEditorController() {
        N2Classes.NextendFragmentEditorControllerWithEditor.prototype.constructor.apply(this, arguments);
    }

    NextendImageEditorController.prototype = Object.create(N2Classes.NextendFragmentEditorControllerWithEditor.prototype);
    NextendImageEditorController.prototype.constructor = NextendImageEditorController;

    NextendImageEditorController.prototype.loadDefaults = function () {
        N2Classes.NextendFragmentEditorControllerWithEditor.prototype.loadDefaults.call(this);
        this.type = 'image';
        this.currentImage = '';
    };

    NextendImageEditorController.prototype.get = function (type) {
        return this.currentVisual;
    };

    NextendImageEditorController.prototype.getEmptyVisual = function () {
        return {
            desktop: {
                size: '0|*|0'
            },
            'desktop-retina': {
                image: '',
                size: '0|*|0'
            },
            tablet: {
                image: '',
                size: '0|*|0'
            },
            'tablet-retina': {
                image: '',
                size: '0|*|0'
            },
            mobile: {
                image: '',
                size: '0|*|0'
            },
            'mobile-retina': {
                image: '',
                size: '0|*|0'
            }
        };
    };

    NextendImageEditorController.prototype.initEditor = function () {
        return new N2Classes.NextendImageEditor();
    };

    NextendImageEditorController.prototype._load = function (visual, tabs, parameters) {
        this.currentImage = visual.visual.image;
        N2Classes.NextendFragmentEditorControllerWithEditor.prototype._load.call(this, visual.value, tabs, parameters);
    };

    NextendImageEditorController.prototype.loadToEditor = function () {
        this.currentVisual = $.extend({}, this.getEmptyVisual(), this.currentVisual);
        this.editor.load(this.currentImage, this.currentVisual);
    };

    NextendImageEditorController.prototype.propertyChanged = function (e, device, property, value) {
        this.isChanged = true;
        this.currentVisual[device][property] = value;
    };

    return NextendImageEditorController;
});
N2D('NextendImage', ['NextendVisualCore'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendImage() {
        N2Classes.NextendVisualCore.prototype.constructor.apply(this, arguments);
    }

    NextendImage.prototype = Object.create(N2Classes.NextendVisualCore.prototype);
    NextendImage.prototype.constructor = NextendImage;

    NextendImage.prototype.setValue = function (value, render) {
        this.base64 = value;
        this.value = JSON.parse(N2Classes.Base64.decode(value));
    };

    NextendImage.prototype.activate = function (e) {
        if (typeof e !== 'undefined') {
            e.preventDefault();
        }
        this.visualManager.changeActiveVisual(this);
        this.visualManager.controller.load(this, false, this.visualManager.showParameters);
    };

    return NextendImage;

});
N2D('NextendImageManager', ['NextendVisualManagerCore'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendImageManager() {
        this.referenceKeys = {};
        N2Classes.NextendVisualManagerCore.prototype.constructor.apply(this, arguments);
    }

    NextendImageManager.prototype = Object.create(N2Classes.NextendVisualManagerCore.prototype);
    NextendImageManager.prototype.constructor = NextendImageManager;

    NextendImageManager.prototype.loadDefaults = function () {
        N2Classes.NextendVisualManagerCore.prototype.loadDefaults.apply(this, arguments);
        this.type = 'image';
        this.labels = {
            visual: n2_('image'),
            visuals: n2_('images')
        };

        this.fontClassName = '';
    };


    NextendImageManager.prototype.initController = function () {
        return new N2Classes.NextendImageEditorController();
    };

    NextendImageManager.prototype.createVisual = function (visual) {
        return new N2Classes.NextendImage(visual, this);
    };

    NextendImageManager.prototype.firstLoadVisuals = function (visuals) {
        for (var i = 0; i < visuals.length; i++) {
            this.referenceKeys[visuals[i].hash] = this.visuals[visuals[i].id] = this.createVisual(visuals[i]);
        }
    };

    NextendImageManager.prototype.getVisual = function (image) {
        if (image == '') {
            N2Classes.Notification.error(n2_('The image is empty'), {
                timeout: 3
            });
        } else {
            var referenceKey = md5(image);
            if (typeof this.referenceKeys[referenceKey] !== 'undefined') {
                return this.referenceKeys[referenceKey];
            } else if (typeof this.visualLoadDeferreds[referenceKey] !== 'undefined') {
                return this.visualLoadDeferreds[referenceKey];
            } else {
                var deferred = $.Deferred();
                this.visualLoadDeferreds[referenceKey] = deferred;
                this._loadVisualFromServer(image)
                    .done($.proxy(function () {
                        deferred.resolve(this.referenceKeys[referenceKey]);
                        delete this.visualLoadDeferreds[referenceKey];
                    }, this))
                    .fail($.proxy(function () {
                        // This visual is Empty!!!
                        deferred.resolve({
                            id: -1,
                            name: n2_('Empty')
                        });
                        delete this.visualLoadDeferreds[referenceKey];
                    }, this));
                return deferred;
            }
        }
    };

    NextendImageManager.prototype._loadVisualFromServer = function (image) {
        return N2Classes.AjaxHelper.ajax({
            type: "POST",
            url: N2Classes.AjaxHelper.makeAjaxUrl(this.parameters.ajaxUrl, {
                nextendaction: 'loadVisualForImage'
            }),
            data: {
                image: image
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                var visual = response.data.visual;
                this.referenceKeys[visual.hash] = this.visuals[visual.id] = this.createVisual(visual);
            }, this));
    };

    NextendImageManager.prototype.isVisualData = function (data) {
        return data != '';
    };

    NextendImageManager.prototype.setVisual = function (e) {
        e.preventDefault();
        if (this.controller.isChanged) {
            this.saveActiveVisual(this.activeVisual.name)
                .done($.proxy(function (response) {
                    $(window).trigger(response.data.visual.hash, this.activeVisual.value);
                    this.hide(e);
                }, this));
        } else {
            this.hide(e);
        }
    };

    NextendImageManager.prototype.getBase64 = function () {

        return N2Classes.Base64.encode(JSON.stringify(this.controller.get('set')));
    };

    NextendImageManager.prototype.loadDataToController = function (data) {
        if (this.isVisualData(data)) {
            $.when(this.getVisual(data)).done($.proxy(function (visual) {
                if (visual.id > 0) {
                    visual.activate();
                } else {
                    console.error(data + ' visual is not found linked');
                }
            }, this));
        } else {
            this.hide();
            N2Classes.Notification.error(n2_('Image field can not be empty!'));
        }
    };

    return NextendImageManager;
});
N2D('NextendStyleEditor', ['NextendFragmentEditor'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendStyleEditor() {

        N2Classes.NextendFragmentEditor.prototype.constructor.apply(this, arguments);

        this.fields = {
            backgroundColor: {
                element: $('#n2-style-editorbackgroundcolor'),
                events: {
                    'nextendChange.n2-editor': $.proxy(this.changeBackgroundColor, this)
                }
            },
            opacity: {
                element: $('#n2-style-editoropacity'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeOpacity, this)
                }
            },
            padding: {
                element: $('#n2-style-editorpadding'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changePadding, this)
                }
            },
            boxShadow: {
                element: $('#n2-style-editorboxshadow'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeBoxShadow, this)
                }
            },
            border: {
                element: $('#n2-style-editorborder'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeBorder, this)
                }
            },
            borderRadius: {
                element: $('#n2-style-editorborderradius'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeBorderRadius, this)
                }
            },
            extracss: {
                element: $('#n2-style-editorextracss'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeExtraCSS, this)
                }
            }
        };
    }

    NextendStyleEditor.prototype = Object.create(N2Classes.NextendFragmentEditor.prototype);
    NextendStyleEditor.prototype.constructor = NextendStyleEditor;

    NextendStyleEditor.prototype.load = function (values) {
        this._off();
        this.fields.backgroundColor.element.data('field').insideChange(values.backgroundcolor);
        this.fields.opacity.element.data('field').insideChange(values.opacity);
        this.fields.padding.element.data('field').insideChange(values.padding);
        this.fields.boxShadow.element.data('field').insideChange(values.boxshadow);
        this.fields.border.element.data('field').insideChange(values.border);
        this.fields.borderRadius.element.data('field').insideChange(values.borderradius);
        this.fields.extracss.element.data('field').insideChange(values.extra);
        this._on();
    };

    NextendStyleEditor.prototype.changeBackgroundColor = function () {
        this.trigger('backgroundcolor', this.fields.backgroundColor.element.val());

    };

    NextendStyleEditor.prototype.changeOpacity = function () {
        this.trigger('opacity', this.fields.opacity.element.val());
    };

    NextendStyleEditor.prototype.changePadding = function () {
        this.trigger('padding', this.fields.padding.element.val());
    };

    NextendStyleEditor.prototype.changeBoxShadow = function () {
        this.trigger('boxshadow', this.fields.boxShadow.element.val());
    };

    NextendStyleEditor.prototype.changeBorder = function () {
        this.trigger('border', this.fields.border.element.val());
    };

    NextendStyleEditor.prototype.changeBorderRadius = function () {
        this.trigger('borderradius', this.fields.borderRadius.element.val());
    };

    NextendStyleEditor.prototype.changeExtraCSS = function () {
        this.trigger('extra', this.fields.extracss.element.val());
    };

    return NextendStyleEditor;
});
N2D('NextendStyleEditorController', ['NextendFragmentEditorController'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendStyleEditorController() {
        N2Classes.NextendFragmentEditorController.prototype.constructor.apply(this, arguments);

        this.preview = $('#n2-style-editor-preview')
            .css('fontSize', '16px');

        this.initBackgroundColor();
    }

    NextendStyleEditorController.prototype = Object.create(N2Classes.NextendFragmentEditorController.prototype);
    NextendStyleEditorController.prototype.constructor = NextendStyleEditorController;

    NextendStyleEditorController.prototype.loadDefaults = function () {
        N2Classes.NextendFragmentEditorController.prototype.loadDefaults.call(this);
        this.type = 'style';
        this.preview = null;
    };

    NextendStyleEditorController.prototype.initPreviewModes = function () {

        this.previewModes = {
            2: [this.previewModesList['button'], this.previewModesList['box']],
            3: [this.previewModesList['paragraph']]
        };
    };

    NextendStyleEditorController.prototype.initRenderer = function () {
        return new N2Classes.NextendStyleRenderer(this);
    };

    NextendStyleEditorController.prototype.initEditor = function () {
        return new N2Classes.NextendStyleEditor();
    };

    NextendStyleEditorController.prototype._load = function (visual, tabs, parameters) {
        if (visual.length) {
            visual[0] = $.extend({}, this.getEmptyStyle(), visual[0]);
        }

        N2Classes.NextendFragmentEditorController.prototype._load.call(this, visual, tabs, parameters);
    };

    NextendStyleEditorController.prototype.asyncVisualData = function (visual, showParameters, cb) {
        if (visual.length) {
            visual[0] = $.extend({}, this.getEmptyStyle(), visual[0]);
        }

        N2Classes.NextendFragmentEditorController.prototype.asyncVisualData.call(this, visual, showParameters, cb);
    };

    NextendStyleEditorController.prototype.getEmptyStyle = function () {
        return {
            backgroundcolor: 'ffffff00',
            opacity: 100,
            padding: '0|*|0|*|0|*|0|*|px',
            boxshadow: '0|*|0|*|0|*|0|*|000000ff',
            border: '0|*|solid|*|000000ff',
            borderradius: '0',
            extra: ''
        };
    };

    NextendStyleEditorController.prototype.getCleanVisual = function () {
        return {
            extra: ''
        };
    };

    NextendStyleEditorController.prototype.getEmptyVisual = function () {
        return [this.getEmptyStyle()];
    };

    NextendStyleEditorController.prototype.initBackgroundColor = function () {

        new N2Classes.FormElementText("n2-style-editor-background-color");
        new N2Classes.FormElementColor("n2-style-editor-background-color", 0);

        var box = this.lightbox.find('.n2-editor-preview-box');
        $('#n2-style-editor-background-color').on('nextendChange', function () {
            box.css('background', '#' + $(this).val());
        });
    };

    NextendStyleEditorController.prototype._renderPreview = function () {
        N2Classes.NextendFragmentEditorController.prototype._renderPreview.call(this);

        this.addStyle(this.renderer.getCSS(this.currentPreviewMode, '', '.' + this.getPreviewCssClass(), this.currentVisual, {
            activeTab: this.currentTabIndex
        }));
    };

    NextendStyleEditorController.prototype.setPreview = function (mode) {

        var html = '';
        if (typeof this.localModePreview[mode] !== 'undefined' && this.localModePreview[mode] != '') {
            html = this.localModePreview[mode];
        } else {
            html = this.previewModesList[mode].preview;
        }

        var styleClassName = this.getPreviewCssClass(),
            fontClassName = nextend.styleManager.fontClassName,
            fontClassName2 = nextend.styleManager.fontClassName2,
            styleClassName2 = nextend.styleManager.styleClassName2;

        html = html.replace(/\{([^]*?)\}/g, function (match, script) {
            return eval(script);
        });

        this.preview.html(html);
    };

    NextendStyleEditorController.prototype.getPreviewCssClass = function () {
        return 'n2-' + this.type + '-editor-preview';
    };

    return NextendStyleEditorController;
});
N2D('NextendStyleManager', ['NextendVisualManagerSetsAndMore'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendStyleManager() {
        N2Classes.NextendVisualManagerSetsAndMore.prototype.constructor.apply(this, arguments);
    }

    NextendStyleManager.prototype = Object.create(N2Classes.NextendVisualManagerSetsAndMore.prototype);
    NextendStyleManager.prototype.constructor = NextendStyleManager;

    NextendStyleManager.prototype.loadDefaults = function () {
        N2Classes.NextendVisualManagerSetsAndMore.prototype.loadDefaults.apply(this, arguments);
        this.type = 'style';
        this.labels = {
            visual: n2_('style'),
            visuals: n2_('styles')
        };

        this.styleClassName2 = '';
        this.fontClassName = '';
        this.fontClassName2 = '';
    };


    NextendStyleManager.prototype.initController = function () {
        return new N2Classes.NextendStyleEditorController(this.parameters.renderer.modes);
    };

    NextendStyleManager.prototype.addVisualUsage = function (mode, styleValue, pre) {
        /**
         * if styleValue is numeric, then it is a linked style!
         */
        if (parseInt(styleValue) > 0) {
            return this._addLinkedStyle(mode, styleValue, pre);
        } else {
            try {
                this._renderStaticStyle(mode, styleValue, pre);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    NextendStyleManager.prototype._addLinkedStyle = function (mode, styleId, pre) {
        var used = this.parameters.renderer.usedStyles,
            d = $.Deferred();
        $.when(this.getVisual(styleId))
            .done($.proxy(function (style) {
                if (style.id > 0) {
                    if (typeof pre === 'undefined') {
                        if (typeof used[style.id] === 'undefined') {
                            used[style.id] = [mode];
                            this.renderLinkedStyle(mode, style, pre);
                        } else if ($.inArray(mode, used[style.id]) == -1) {
                            used[style.id].push(mode);
                            this.renderLinkedStyle(mode, style, pre);
                        }
                    } else {
                        this.renderLinkedStyle(mode, style, pre);
                    }
                    d.resolve(true);
                } else {
                    d.resolve(false);
                }
            }, this))
            .fail(function () {
                d.resolve(false);
            });
        return d;
    };

    NextendStyleManager.prototype.renderLinkedStyle = function (mode, style, pre) {
        if (typeof pre === 'undefined') {
            pre = this.parameters.renderer.pre;
        }
        nextend.css.add(this.renderer.getCSS(mode, pre, '.' + this.getClass(style.id, mode), style.value, {
            deleteRule: true
        }));

    };

    NextendStyleManager.prototype._renderStaticStyle = function (mode, styleJsonOrBase64, pre) {
        if (typeof pre === 'undefined') {
            pre = this.parameters.renderer.pre;
        }
        var jsonStyle = styleJsonOrBase64;
        if (jsonStyle[0] != '{') {
            jsonStyle = N2Classes.Base64.decode(jsonStyle);
        }
        nextend.css.add(this.renderer.getCSS(mode, pre, '.' + this.getClass(styleJsonOrBase64, mode), JSON.parse(jsonStyle).data, {}));
    };

    /**
     * We should never use this method as we do not track if a style used with the same mode multiple times.
     * So there is no sync and if we delete a used style, other usages might fail to update correctly in
     * special circumstances.
     * @param mode
     * @param styleId
     */
    NextendStyleManager.prototype.removeUsedStyle = function (mode, styleId) {
        var used = this.parameters.renderer.usedStyles;
        if (typeof used[styleId] !== 'undefined') {
            var index = $.inArray(mode, used[styleId]);
            if (index > -1) {
                used[styleId].splice(index, 1);
            }
        }
    };

    NextendStyleManager.prototype.getClass = function (style, mode) {
        if (parseInt(style) > 0) {
            return 'n2-style-' + style + '-' + mode;
        } else if (style == '') {
            return '';
        }
        // style might by empty with this class too, but we do not care as nothing wrong if it has an extra class
        // We could do try catch to JSON.parse(N2Classes.Base64.decode(style)), but it is wasting resource
        return 'n2-style-' + md5(style) + '-' + mode;
    };

    NextendStyleManager.prototype.createVisual = function (visual, set) {
        return new N2Classes.NextendStyle(visual, set, this);
    };

    NextendStyleManager.prototype.setConnectedStyle = function (styleId) {
        this.styleClassName2 = $('#' + styleId).data('field').renderStyle();
    };

    NextendStyleManager.prototype.setConnectedFont = function (fontId) {
        this.fontClassName = $('#' + fontId).data('field').renderFont();
    };

    NextendStyleManager.prototype.setConnectedFont2 = function (fontId) {
        this.fontClassName2 = $('#' + fontId).data('field').renderFont();
    };

    return NextendStyleManager;
});
N2D('NextendStyleRenderer', ['NextendVisualRenderer'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendStyleRenderer() {
        N2Classes.NextendVisualRenderer.prototype.constructor.apply(this, arguments);
    }

    NextendStyleRenderer.prototype = Object.create(N2Classes.NextendVisualRenderer.prototype);
    NextendStyleRenderer.prototype.constructor = NextendStyleRenderer;


    NextendStyleRenderer.prototype.getCSS = function (modeKey, pre, selector, visualTabs, parameters) {
        visualTabs[0] = $.extend(this.editorController.getEmptyStyle(), visualTabs[0]);
        return N2Classes.NextendVisualRenderer.prototype.getCSS.call(this, modeKey, pre, selector, visualTabs, parameters);
    };

    NextendStyleRenderer.prototype.makeStylebackgroundcolor = function (value, target) {
        target.background = '#' + value.substr(0, 6) + ";\n\tbackground: " + N2Color.hex2rgbaCSS(value);
    };

    NextendStyleRenderer.prototype.makeStyleopacity = function (value, target) {
        target.opacity = parseInt(value) / 100;
    };

    NextendStyleRenderer.prototype.makeStylepadding = function (value, target) {
        var padding = value.split('|*|'),
            unit = padding.pop();
        for (var i = 0; i < padding.length; i++) {
            padding[i] += unit;
        }
        target.padding = padding.join(' ');
    };

    NextendStyleRenderer.prototype.makeStyleboxshadow = function (value, target) {
        var s = value.split('|*|');
        if (s[0] == '0' && s[1] == '0' && s[2] == '0' && s[3] == '0') {
            target.boxShadow = 'none';
        } else {
            target.boxShadow = s[0] + 'px ' + s[1] + 'px ' + s[2] + 'px ' + s[3] + 'px ' + N2Color.hex2rgbaCSS(s[4]);
        }
    };

    NextendStyleRenderer.prototype.makeStyleborder = function (value, target) {
        var border = value.split('|*|');

        target.borderWidth = border[0] + 'px';
        target.borderStyle = border[1];
        target.borderColor = '#' + border[2].substr(0, 6) + ";\n\tborder-color:" + N2Color.hex2rgbaCSS(border[2]);
    };

    NextendStyleRenderer.prototype.makeStyleborderradius = function (value, target) {
        var radius = value.split('|*|');
        radius.push('');
        target.borderRadius = value + 'px';
    };

    NextendStyleRenderer.prototype.makeStyleextra = function (value, target) {

        target.raw = value;
    };

    return NextendStyleRenderer;
});
N2D('NextendStyle', ['NextendVisualWithSetRow'], function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function NextendStyle() {
        N2Classes.NextendVisualWithSetRow.prototype.constructor.apply(this, arguments);
    }

    NextendStyle.prototype = Object.create(N2Classes.NextendVisualWithSetRow.prototype);
    NextendStyle.prototype.constructor = NextendStyle;


    NextendStyle.prototype.removeRules = function () {
        var used = this.isUsed();
        if (used) {
            for (var i = 0; i < used.length; i++) {
                this.visualManager.removeRules(used[i], this);
            }
        }
    };

    NextendStyle.prototype.render = function () {
        var used = this.isUsed();
        if (used) {
            for (var i = 0; i < used.length; i++) {
                this.visualManager.renderLinkedStyle(used[i], this);
            }
        }
    };

    NextendStyle.prototype.isUsed = function () {
        if (typeof this.visualManager.parameters.renderer.usedStyles[this.id] !== 'undefined') {
            return this.visualManager.parameters.renderer.usedStyles[this.id];
        }
        return false;
    };

    return NextendStyle;
});

N2D('NextendBrowse', function ($, undefined) {

    var cache = {};

    /**
     * @memberOf N2Classes
     *
     * @param url
     * @param uploadAllowed
     * @constructor
     */
    function NextendBrowse(url, uploadAllowed) {
        this.url = url;
        this.uploadAllowed = parseInt(uploadAllowed);
        this.currentPath = $.jStorage.get('browsePath', '');
        var timeout = null;
        this.node = $('<div class="n2-browse-container"/>').on('dragover', function (e) {
            if (timeout !== null) {
                clearTimeout(timeout);
                timeout = null;
            } else {
                $(e.currentTarget).addClass('n2-drag-over');
            }
            timeout = setTimeout(function () {
                $(e.currentTarget).removeClass('n2-drag-over');
                timeout = null;
            }, 400);

        });
        nextend.browse = this;
    }

    NextendBrowse.prototype.clear = function () {
        if (this.uploadAllowed) {
            this.node.find('#n2-browse-upload').nUIFileUpload('destroy');
        }
        this.node.empty();
    };

    NextendBrowse.prototype.getNode = function (mode, callback) {
        this.clear();
        this.mode = mode;
        if (mode == 'multiple') {
            this.selected = [];
        }
        this.callback = callback;
        this._loadPath(this.getCurrentFolder(), $.proxy(this._renderBoxes, this));
        return this.node;
    };

    NextendBrowse.prototype._renderBoxes = function (data) {
        this.clear();

        if (this.uploadAllowed) {
            this.node.append($('<div class="n2-browse-box n2-browse-upload"><div class="n2-h4">' + n2_('Drop files anywhere to upload or') + ' <br> <a class="n2-button n2-button-normal n2-button-m n2-radius-s n2-button-grey n2-uc n2-h4" href="#">' + n2_('Select files') + '</a></div><input id="n2-browse-upload" type="file" name="image" multiple></div>'));

            this.node.find('#n2-browse-upload').nUIFileUpload({
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.url, {
                    nextendaction: 'upload'
                }),
                sequentialUploads: true,
                dropZone: this.node,
                pasteZone: false,
                dataType: 'json',
                paramName: 'image',
                add: $.proxy(function (e, data) {

                    var box = $('<div class="n2-browse-box n2-browse-image"><div class="n2-button n2-button-icon n2-button-s n2-button-blue n2-radius-s"><i class="n2-i n2-it n2-i-tick"></i></div><div class="n2-browse-title">0%</div></div>');

                    var images = this.node.find('.n2-browse-image');
                    if (images.length > 0) {
                        box.insertBefore(images.eq(0));
                    } else {
                        box.appendTo(this.node);
                    }
                    data.box = box;


                    data.formData = {path: this.currentPath};
                    data.submit();
                }, this),
                progress: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    data.box.find('.n2-browse-title').html(progress + '%');
                },
                done: $.proxy(function (e, data) {
                    var response = data.result;

                    if (response.data && response.data.name) {
                        cache[response.data.path].data.files[response.data.name] = response.data.url;

                        data.box
                            .on('click', $.proxy(this.clickImage, this, response.data.url))
                            .find('.n2-browse-title').html(response.data.name);

                        var ext = response.data.url.split('.').pop();
                        if (ext != 'mp4' && ext != 'mp3') {
                            data.box.css('background-image', 'url(' + encodeURI(nextend.imageHelper.fixed(response.data.url)) + ')');
                        }

                        if (this.mode == 'multiple') {
                            this.selected.push(response.data.url);
                            data.box.addClass('n2-active');
                        }
                    } else {
                        data.box.destroy();
                    }

                    N2Classes.AjaxHelper.notification(response);

                }, this),
                fail: $.proxy(function (e, data) {
                    data.box.remove();
                    N2Classes.AjaxHelper.notification(data.jqXHR.responseJSON);
                }, this)
            });

            $.jStorage.set('browsePath', this.getCurrentFolder());
        }

        if (data.path != '') {
            this.node.append($('<div class="n2-browse-box n2-browse-directory"><i class="n2-i n2-it n2-i-up"></i></div>').on('click', $.proxy(function (directory) {
                this._loadPath(directory, $.proxy(this._renderBoxes, this))
            }, this, data.path + '/..')));
        }
        for (var k in data.directories) {
            if (data.directories.hasOwnProperty(k)) {
                this.node.append($('<div class="n2-browse-box n2-browse-directory"><i class="n2-i n2-it n2-i-folder"></i><div class="n2-browse-title">' + k + '</div></div>').on('click', $.proxy(function (directory) {
                    this._loadPath(directory, $.proxy(this._renderBoxes, this))
                }, this, data.directories[k])));
            }
        }
        for (var k in data.files) {
            if (data.files.hasOwnProperty(k)) {
                var box = $('<div class="n2-browse-box n2-browse-image" title="' + k + '"><div class="n2-button n2-button-icon n2-button-s n2-button-blue n2-radius-s"><i class="n2-i n2-it n2-i-tick"></i></div><div class="n2-browse-title">' + k + '</div></div>')
                    .on('click', $.proxy(this.clickImage, this, data.files[k]));

                var ext = data.files[k].split('.').pop();
                if (ext != 'mp4' && ext != 'mp3') {
                    box.css('background-image', 'url(' + encodeURI(nextend.imageHelper.fixed(data.files[k])) + ')');
                }

                this.node.append(box);

                if (this.mode == 'multiple') {
                    if ($.inArray(data.files[k], this.selected) != -1) {
                        box.addClass('n2-active');
                    }
                }
            }
        }
    };


    NextendBrowse.prototype._loadPath = function (path, callback) {
        if (typeof cache[path] === 'undefined') {
            cache[path] = N2Classes.AjaxHelper.ajax({
                type: "POST",
                url: N2Classes.AjaxHelper.makeAjaxUrl(this.url),
                data: {
                    path: path
                },
                dataType: 'json'
            });
        }
        $.when(cache[path]).done($.proxy(function (response) {
            this.currentPath = response.data.path;
            cache[response.data.path] = response;
            cache[path] = response;
            callback(response.data);
        }, this));

    };

    NextendBrowse.prototype.clickImage = function (image, e) {
        if (this.mode == 'single') {
            this.callback(image);
        } else if (this.mode == 'multiple') {
            var i = $.inArray(image, this.selected);
            if (i == -1) {
                $(e.currentTarget).addClass('n2-active');
                this.selected.push(image);
            } else {
                $(e.currentTarget).removeClass('n2-active');
                this.selected.splice(i, 1);
            }
        }
    };

    NextendBrowse.prototype.getSelected = function () {
        return this.selected;
    };

    NextendBrowse.prototype.getCurrentFolder = function () {
        return this.currentPath;
    };


    return NextendBrowse;
});
N2D('IconPack', function ($, undefined) {
    /**
     * @memberOf N2Classes
     *
     * @constructor
     */
    function IconPack(manager, data) {
        this.currentQuery = '';

        this.manager = manager;
        this.data = data;
        this.$li = $('<li><a href="#">' + data.label + '</a></li>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();
                this.activate();
            }, this))
            .appendTo(this.manager.$ul);
    }

    IconPack.prototype.load = function () {

        if (this.data.isLoaded === undefined) {
            $("head").append("<link rel='stylesheet' href='" + this.data.css + "' type='text/css' media='screen'>");
            this.data.isLoaded = true;
        }
    };

    IconPack.prototype.render = function () {
        if (this.data.$tab === undefined) {

            var $tab = $('<div class="n2-form-tab "></div>').appendTo(this.manager.$content);
            $tab.append('<div class="n2-h2 n2-content-box-title-bg">' + this.data.label + '</div>');

            var $desc = $('<div class="n2-description"></div>').appendTo($tab);

            for (var icon in this.data.data) {
                $('<div class="n2-icon" data-identifier="' + this.data.id + ':' + icon + '" data-kw="' + this.data.data[icon].kw.toLowerCase() + '">' + this._render(icon) + '</div>')
                    .on('click', $.proxy(function (e) {
                        this.manager.selectIcon($(e.currentTarget).data('identifier'), e);
                    }, this)).appendTo($desc);
            }

            this.data.$tab = $tab;

            this.$icons = $tab.find('.n2-icon');
        }
    };

    IconPack.prototype.activate = function () {
        this.manager.activate(this);

        this.$li.addClass('n2-active');
        this.load();
        this.render();


        this.search(this.manager.getQuery());

        this.manager.$content.append(this.data.$tab);
    };

    IconPack.prototype.search = function (query) {

        if (this.currentQuery !== query) {
            if (query.length <= 1) {
                this.$icons.css('display', '');
            } else {
                var $matched = this.$icons.filter("[data-kw*='" + query + "']");
                this.$icons.not($matched).css('display', 'none');
                $matched.css('display', '');
            }
        }

        this.currentQuery = query;
    };

    IconPack.prototype.deActivate = function () {
        this.$li.removeClass('n2-active');
        this.data.$tab.detach();
    };

    IconPack.prototype._render = function (icon) {

        if (this.data.isLigature) {
            return '<i class="n2i ' + this.data.class + '">' + icon + '</i>';
        }

        return '<i class="n2i ' + this.data.class + " " + this.data.prefix + icon + '"></i>';
    };

    IconPack.prototype.getIcon = function(icon) {
        if (this.data.isLigature) {

            return {
                "class": this.data.class,
                "ligature": icon
            };
        }

        return {
            "class": this.data.class + " " + this.data.prefix + icon,
            "ligature": ""
        };
    };

    return IconPack;
});
N2D('Icons', function ($, undefined) {

    /**
     * @memberOf N2Classes
     *
     * @param data
     * @constructor
     */
    function Icons(data) {
        N2Classes.Icons = this;

        this.data = data;

        this.$ul = $('<ul class="n2-list"/>');
        this.iconPacks = {};

        for (var k in this.data) {

            this.iconPacks[this.data[k].id] = new N2Classes.IconPack(this, this.data[k]);
        }

        for (this.defaultId in this.iconPacks) {
            break
        }
    }

    Icons.prototype.render = function (key) {
        var parts = key.split(':');
        if (parts.length !== 2) {
            return false;
        }
        var id = parts[0],
            icon = parts[1];
        if (this.iconPacks[id] === undefined) {
            return false;
        }

        var iconPack = this.iconPacks[id];
        if (iconPack.data.data[icon] === undefined) {
            return false;
        }

        iconPack.load();

        return iconPack.getIcon(icon);
    };

    Icons.prototype.showModal = function (cb, value) {
        this.callback = cb;

        var isCreate = false;
        if (this.modal === undefined) {
            isCreate = true;
            this.startModal();
        }

        var hasActive = false;
        var selected = value.split(':');
        if (this.iconPacks[selected[0]] !== undefined) {
            this.iconPacks[selected[0]].activate();
            hasActive = true;
        }

        if (isCreate && !hasActive) {
            this.iconPacks[this.defaultId].activate();
        }

        this.modal.show();
    };

    Icons.prototype.selectIcon = function (icon, e) {
        this.callback(icon);

        this.modal.hide(e);
    };

    Icons.prototype.startModal = function () {
        var $container = $('<div class="n2-modal-content-with-sidebar"></div>'),
            $sidebar = $('<div class="n2-modal-sidebar"></div>').appendTo($container);

        this.$content = $('<div class="n2-modal-right-content"></div>').appendTo($container);


        var $sidebarContainer = $('<div />').appendTo($sidebar);

        this.$search = $('<input class="n2-h5" placeholder="' + n2_("Search") + '" type="text" name="search-icon" value="" style="width:166px;"/>')
            .on('keyup', $.proxy(function (e) {
                var query = $(e.target).val();
                this.activePack.search(query);
            }, this))
            .appendTo($('<div class="n2-form-element-text n2-border-radius" style="margin: 15px 10px;"/>').appendTo($sidebarContainer));

        this.$ul.appendTo($sidebarContainer);

        this.modal = new N2Classes.NextendModal({
            zero: {
                size: [
                    1200,
                    600
                ],
                fit: true,
                title: n2_('Icons'),
                back: false,
                close: true,
                content: $container
            }
        }, false);
        this.modal.setCustomClass('n2-icons-modal');
    };

    Icons.prototype.activate = function (iconPack) {
        if (this.activePack !== undefined) {
            this.activePack.deActivate();
        }

        this.activePack = iconPack;
    };

    Icons.prototype.getQuery = function () {
        return this.$search.val();
    };

    return Icons;
});
N2D('NextendFontServiceGoogle', function ($) {

    /**
     * @memberOf N2Classes
     *
     * @param style
     * @param subset
     * @param fonts
     * @constructor
     */
    function NextendFontServiceGoogle(style, subset, fonts) {
        this.style = style;
        this.subset = subset;
        this.fonts = fonts;
        $(window).on('n2Family', $.proxy(this.loadFamily, this));
    }

    NextendFontServiceGoogle.prototype.loadFamily = function (e, family) {
        var familyLower = family.toLowerCase();
        if (typeof this.fonts[familyLower] !== 'undefined') {
            $('<link />').attr({
                rel: 'stylesheet',
                type: 'text/css',
                href: '//fonts.googleapis.com/css?family=' + encodeURIComponent(this.fonts[familyLower] + ':' + this.style) + '&subset=' + encodeURIComponent(this.subset)
            }).appendTo($('head'));

            return this.fonts[familyLower];
        }
        return family;
    };

    return NextendFontServiceGoogle;
});
N2D('system-backend')