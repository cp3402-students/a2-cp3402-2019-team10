( function( blocks, components, i18n, element ) {
var el = wp.element.createElement,
    registerBlockType = wp.blocks.registerBlockType,
    InspectorControls = wp.editor.InspectorControls,
    blockStyle = { backgroundColor: '#fff', color: '#000' };
    var TextControl = wp.components.TextControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var {__} = wp.i18n;


registerBlockType( 'gs-logo/shortcodeblock', {
    title: 'GS Logo Slider Block',
 
    icon: 'screenoptions',
 
    category: 'layout',

    keywords: [ __( 'logo','gslogo' ), __( 'slider','gslogo' ), __( 'gs','gslogo' ) ],
 
    attributes: {
        
        themes: {
            type: 'select',
            default: 'slider1'
        },
        Speed: {
            type: 'text',
            default: '500'
        },
        numberAttribute: {
            type: 'text',
            default: 10
        },
        orders: {
            type: 'select',
            default: 'DESC'
        },
        ordersby: {
            type: 'select',
            default: 'date'
        },
        title:{
            type: 'checkbox',
        },
        inf_loop : {
            type: 'checkbox',
        },    
    },
 
    edit: function( props ) {
        var focus = props.focus;
        var numberAttribute = props.attributes.numberAttribute;
        var Speed = props.attributes.Speed;
        var title = props.attributes.title;
        var inf_loop = props.attributes.inf_loop;
        var themes = props.attributes.themes;
        var orders = props.attributes.orders;
        var ordersby = props.attributes.ordersby;
        blockStyle['width'] = '100%';
       
        function onChangetms( newThemes ) {
            props.setAttributes( { themes: newThemes } );
        }
        function onChangeOrders( newOrders ) {
            props.setAttributes( { orders: newOrders } );
        }
        function onChangeOrdersby( newOrdersby ) {
            props.setAttributes( { ordersby: newOrdersby } );
        }
         
        return [ 
            el( 'p', { style: blockStyle }, 'GS Logo Slider Shortcode Block' ), 
            el( InspectorControls, { key: 'inspector' }, // Display the block options in the inspector panel.
                el( components.PanelBody, {
                        title: i18n.__( 'GS Logo Shortcode Attributes ' ),
                        className: 'block-logo-attribute',
                        initialOpen: true,
                    },
                    el(
                        SelectControl,
                        {
                            label: i18n.__( 'Select Theme ' ),
                            value: themes,
                            onChange: onChangetms,
                            options: [
                              { value: 'slider1', label: i18n.__( 'Slider - 1' ) },
                              { value: 'grid1', label: i18n.__( 'Grid - 1' ) },
                              { value: 'list1', label: i18n.__( 'List - 1' ) },
                              { value: 'table1', label: i18n.__( 'Table - 1' ) },                  
                            ],
                        }
                    ),
                ),
                el( TextControl, {
                    type: 'number',
                    label: i18n.__( 'Number Of Logos' ),
                    min:1,
                    max:200,
                    value: numberAttribute,
                    onChange: function( newNumb) {
                        props.setAttributes( { numberAttribute: newNumb } );
                    },
                } ),
                el(
                    SelectControl,
                    {
                        label: i18n.__( 'Select Order' ),
                        value: orders,
                        onChange: onChangeOrders,
                        options: [
                          { value: 'DESC', label: i18n.__( 'DESC' ) },
                          { value: 'ASC', label: i18n.__( 'ASC' ) },                  
                        ],
                    }
                ),
                el(
                    SelectControl,
                    {
                        label: i18n.__( 'Select Order By' ),
                        value: ordersby,
                        onChange: onChangeOrdersby,
                        options: [
                          { value: 'date', label: i18n.__( 'Date' ) },
                          { value: 'ID', label: i18n.__( 'ID' ) },
                          { value: 'title', label: i18n.__( 'Title' ) },
                          { value: 'modified', label: i18n.__( 'Modified' ) },
                          { value: 'random', label: i18n.__( 'Random' ) },                  
                        ],
                    }
                ),
                el( ToggleControl, {
                    //type: 'text',
                    label: i18n.__( 'Logo Title' ),
                    checked: title,
                    onChange: function( newTitle ) {
                        props.setAttributes( { title:newTitle } );
                    },
                } ),
                el( 'p', { style: blockStyle }, 'Display Logo including / excluding Title.' ),

                el( ToggleControl, {
                    //type: 'text',
                    label: i18n.__( 'Infinite Loop' ),
                    checked: inf_loop,
                    onChange: function( newInf_loop ) {
                        props.setAttributes( { inf_loop:newInf_loop } );
                    },
                } ),
                el( 'p', { style: blockStyle }, 'If ON, clicking "Next" while on the last slide will transition to the first slide and vice-versa' ),

                el( TextControl, {
                    type: 'text',
                    label: i18n.__( 'Sliding Speed' ),
                    value: Speed,
                    onChange: function( newSpeed ) {
                        props.setAttributes( { Speed:newSpeed } );
                    },
                } ),
                el( 'p', { style: blockStyle }, 'You can increase / decrease sliding speed. Set the speed in millisecond. Default 500. To disable autoplay just set the speed 0' ),         
            ),        
        ];
    },
 
    save: function( props ) {
        return null;
    },
} );

} )(
    window.wp.blocks,
    window.wp.components,
    window.wp.i18n,
    window.wp.element,
);