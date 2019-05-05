<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function n2_visualcomposer_force_iframe() {
    N2SS3Shortcode::forceIframe('visualcomposer');
}

class NextendSmartSlider3VisualComposer {

    public static function init() {
        self::vc_add_element();

        add_action('vc_frontend_editor_render', 'n2_visualcomposer_force_iframe');
        add_action('vc_front_load_page_', 'n2_visualcomposer_force_iframe');
        add_action('vc_load_shortcode', 'n2_visualcomposer_force_iframe');


        add_action('vc_before_init_base', 'NextendSmartSlider3VisualComposer::vc_before_init_base');
    }

    public static function vc_before_init_base() {
        add_filter('the_excerpt', 'NextendSmartSlider3VisualComposer::vc_before_the_excerpt', -10000);

        add_filter('the_excerpt', 'NextendSmartSlider3VisualComposer::vc_after_the_excerpt', 10000);
    }

    public static function vc_before_the_excerpt($output) {
        N2SS3Shortcode::shortcodeModeToNoop();

        return $output;
    }

    public static function vc_after_the_excerpt($output) {
        N2SS3Shortcode::shortcodeModeToNormal();

        return $output;
    }

    public static function vc_add_element() {
        vc_add_shortcode_param('smartslider', 'NextendSmartSlider3VisualComposer::vc_add_form_field_smartslider');

        vc_map(array(
            "name"     => "Smart Slider 3",
            "base"     => "smartslider3",
            "category" => __('Content'),
            "params"   => array(
                array(
                    'type'        => 'smartslider',
                    'heading'     => 'Slider ID or Alias',
                    'param_name'  => 'slider',
                    'save_always' => true,
                    'description' => 'Select a slider to add it to your post or page.',
                    'admin_label' => true,
                )
            )
        ));

        add_action('admin_footer', 'NextendSmartSlider3VisualComposer::add_admin_icon');
    }

    public static function add_admin_icon() {
        ?>
        <style type="text/css">
            .wpb_smartslider3 .vc_element-icon {
                background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAYFBMVEUTr+8YnOQPxPkYnOQUsO8PxPkYnOQTr+5hp8Uoncg1kryMwtqh0ePT6PFvude83ers9vlFqc4Vi8EQo9kSls4Xo+j///8XoOcYm+QVp+oQwPcStPARuvQYneUUrewPxPkMc7TJAAAACHRSTlNt9G1uG8vNAnToTbkAAAFrSURBVHgBfZPr0qowDEXrBVB6b0KgUMv7v+UJ2MFy5tOVdIbuvXT0B6Lrumszr38wN1cuRXdv1q80dxa4/2F04srftc7zdtZqSrZeRTOfWc7XRqS5BtAj1E4SdZ3ROHLq5Ig5zem9Gbymjd1JJRXvBz7gLXdaKWXJWb+UQqTC4h3XVjurjEfIqXAICczTP7SUVlsDR8rCkpZ9wQD2ypG1RE++lxULkxYGDBoi+cTnLpR+Ewqoe0cSsnek4EhrwT6IQs7emhBrIZeB4IkMZED+fD5G5A9BE6kA+UQtwJMN5zF+E0YIiohkOAkx5n0jBO8BvSMyWLLtiFhAr0mHiD2RC/HgEMbebT8wxqD/E4a4D0rOETEYIhs4KcPCG9wKaeT2P/pp+CCGcdh2CJLe2B45OVaMhQnDQypp+jCNNeI1HoMYELl+VXMR7esnrbj9Fm6ia6fyPB3zod1e3nb6Sntnoetu7eWv9tLeuPwHrqBewxDhYIoAAAAASUVORK5CYII=);
            }
        </style>
        <?php
    }


    public static function vc_add_form_field_smartslider($settings, $value) {
        $value = htmlspecialchars($value);

        N2SSShortcodeInsert::addForced();

        return '<input name="' . $settings['param_name'] . '" class="wpb_vc_param_value wpb-textinput ' . $settings['param_name'] . ' ' . $settings['type'] . '" type="text" value="' . $value . '" style="width:100px;vertical-align:middle;"/>
    <a href="#" onclick="' . SmartSlider3::sliderSelectAction("jQuery(this).siblings('input')") . 'return false;" class="vc_general vc_ui-button vc_ui-button-default vc_ui-button-shape-rounded vc_ui-button-fw" title="Select slider">Select slider</a>';
    }
}

NextendSmartSlider3VisualComposer::init();