<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class FLSmartSliderModule extends FLBuilderModule {

    public function __construct() {
        parent::__construct(array(
            'name'          => 'Smart Slider',
            'description'   => 'Display the selected slider from Smart Slider plugin.',
            'category'      => __('Basic Modules', 'fl-builder'),
            'dir'           => plugin_dir_path(__FILE__),
            'url'           => plugins_url('/', __FILE__),
            'editor_export' => true,
            'enabled'       => true,
        ));
    }
}

FLBuilder::register_module('FLSmartSliderModule', array(
    'general' => array(
        'title'    => __('General', 'fl-builder'),
        'sections' => array(
            'general' => array(
                'title'  => "",
                'fields' => array(
                    'sliderid' => array(
                        'type'    => 'smart-slider',
                        'label'   => 'Slider ID or Alias',
                        'default' => ''
                    ),
                )
            )
        )
    )
));