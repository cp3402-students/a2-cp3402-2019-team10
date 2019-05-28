<?php

class FusionSmartSlider3 extends Fusion_Element {

    /**
     * An array of the shortcode arguments.
     *
     * @access protected
     * @since  1.0
     * @var array
     */
    protected $args;

    /**
     * Constructor.
     *
     * @access public
     * @since  1.0
     */
    public function __construct() {
        parent::__construct();

        add_shortcode('fusion_smartslider3', array(
            $this,
            'render'
        ));
    }

    public function render($args, $content = '') {

        return do_shortcode('[smartslider3 slider="' . $args['slider'] . '"]');
    }
}

new FusionSmartSlider3();

function fusion_element_smartslider3() {

    fusion_builder_map(array(
        'name'            => 'Smart Slider 3',
        'shortcode'       => 'fusion_smartslider3',
        'icon'            => 'fusiona-uniF61C',
        'allow_generator' => true,
        'params'          => array(
            array(
                'type'       => 'smartslider3',
                'heading'    => 'Slider',
                'param_name' => 'slider',
                'value'      => '',
            )
        ),
    ));
}

add_action('fusion_builder_before_init', 'fusion_element_smartslider3');


add_filter('fusion_builder_fields', function ($fields) {

    $fields[] = array(
        'smartslider3',
        dirname(__FILE__) . '/fields/smartslider3.php'
    );


    return $fields;
});