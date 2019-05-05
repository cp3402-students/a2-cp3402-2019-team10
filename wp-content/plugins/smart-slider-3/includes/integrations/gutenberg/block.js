(function (blocks, editor, i18n, element, components, _) {
    var el = element.createElement;

    blocks.registerBlockType('nextend/smartslider3', {
        title: 'Smart Slider 3',
        icon: 'welcome-learn-more',
        category: 'common',
        attributes: {
            slider: {
                type: 'string'
            }
        },
        edit: function (props) {
            var attributes = props.attributes;

            return (
                el('div', {
                        className: props.className + (attributes.slider ? '' : ' wp-block-nextend-smartslider3-no-slider'),
                        onClick: function () {
                            NextendSmartSliderSelectModalCallback(function (isOrAlias) {
                                return props.setAttributes({
                                    slider: isOrAlias
                                });
                            });
                        }
                    },
                    attributes.slider ? el(element.RawHTML, null, window.gutenberg_smartslider3.template.replace(/\{\{\{slider\}\}\}/g, attributes.slider)) : null,
                    el('div', {
                        className: 'wp-block-nextend-smartslider3-overlay'
                    }, el(components.Button, null, 'Select Slider'))
                )
            );
        },
        save: function (props) {
            var attributes = props.attributes;

            if (attributes.slider) {

                return el('div', {className: props.className}, '[smartslider3 slider="' + attributes.slider + '"]');
            }

            return null;
        },
        deprecated: [
            {
                attributes: {
                    slider: {
                        type: 'string'
                    }
                },
                save: function (props) {
                    var attributes = props.attributes;
                    return (
                        attributes.slider && el('div', {className: props.className + ' gutenberg-smartslider3'}, '[smartslider3 slider="' + attributes.slider + '"]')
                    );
                }
            }
        ]
    });

})(
    window.wp.blocks,
    window.wp.editor,
    window.wp.i18n,
    window.wp.element,
    window.wp.components,
    window._
);