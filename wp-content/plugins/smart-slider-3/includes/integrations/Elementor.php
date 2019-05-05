<?php

namespace Elementor;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function n2_elementor_force_iframe() {
    \N2SS3Shortcode::forceIframe('elementor');
}

add_action('template_redirect', function () {
    if (\Elementor\Plugin::instance()->editor->is_edit_mode() || \Elementor\Plugin::instance()->preview->is_preview_mode()) {
        n2_elementor_force_iframe();
    }
}, -1);

add_action('admin_action_elementor', function () {
    n2_elementor_force_iframe();
}, -10000);

add_action('wp_ajax_elementor_ajax', '\Elementor\n2_elementor_force_iframe', -1);

add_action('wp_ajax_elementor_render_widget', '\Elementor\n2_elementor_force_iframe', -1);


add_action('elementor/editor/before_enqueue_styles', function () {
    wp_register_style('smart-slider-editor', plugin_dir_url(NEXTEND_SMARTSLIDER_3__FILE__) . 'editor/editor.min.css', array(), '3.22', 'screen');

    wp_enqueue_style('smart-slider-editor');
});

add_action('elementor/editor/before_enqueue_scripts', 'N2SSShortcodeInsert::addForcedFrontend');

add_action('elementor/widgets/widgets_registered', function () {
    $widget_manager = \Elementor\Plugin::$instance->widgets_manager;
    $widget_manager->register_widget_type(new \Elementor\Nextend_Widget_SmartSlider());
}, 100);


class Nextend_Widget_SmartSlider extends \Elementor\Widget_Base {

    public function get_name() {
        return 'smartslider';
    }

    public function get_title() {
        return 'Smart Slider';
    }

    public function get_icon() {
        return 'eicon-slider-3d';
    }

    protected function _register_controls() {

        $this->start_controls_section('section_smart_slider_elementor', [
            'label' => esc_html('Smart Slider'),
        ]);

        $this->add_control('smartsliderid', [
            'label'   => 'Slider ID or Alias',
            'type'    => 'smartsliderfield',
            'default' => '',
            'title'   => 'Slider ID or Alias',
        ]);

        $this->end_controls_section();

    }

    protected function render() {
        if (\Elementor\Plugin::instance()->editor->is_edit_mode() || \Elementor\Plugin::instance()->preview->is_preview_mode()) {
            echo \N2SS3Shortcode::renderIframe($this->get_settings('smartsliderid'));
        } else {
            $sliderIDorAlias = $this->get_settings('smartsliderid');
            if (is_numeric($sliderIDorAlias)) {
                echo do_shortcode('[smartslider3 slider=' . $sliderIDorAlias . ']');
            } else {
                echo do_shortcode('[smartslider3 alias="' . $sliderIDorAlias . '"]');
            }
        }
    }

    /**
     * Must be declared as empty method to prevent issues with SEO plugins.
     */
    public function render_plain_content() {
    }

    protected function _content_template() {
        echo \N2SS3Shortcode::renderIframe('{{{settings.smartsliderid}}}');
    }

}


add_action('elementor/controls/controls_registered', function ($controls_manager) {

    if (class_exists('\Elementor\Base_Data_Control')) {

        abstract class NextendElementorFieldAbstract extends Base_Data_Control {

        }
    } else {

        abstract class NextendElementorFieldAbstract extends Control_Base {

        }
    }

    class_exists('\Elementor\Group_Control_Background');

    class Control_SmartSliderField extends \Elementor\NextendElementorFieldAbstract {

        public function get_type() {
            return 'smartsliderfield';
        }

        public function content_template() {
            ?>
            <div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
                <a style="margin-bottom:10px;" href="#" onclick="<?php echo \SmartSlider3::sliderSelectAction("jQuery(this).siblings('input')"); ?>return false;" class="button button-primary elementor-button elementor-button-smartslider" title="Select slider">Select slider</a>
				<input type="{{ data.input_type }}" title="{{ data.title }}" data-setting="{{ data.name }}""/>
			</div>
		</div>
            <# if(data.controlValue == ''){NextendSmartSliderSelectModal(function(){return jQuery('[data-setting="smartsliderid"]')})} #>
            <?php
        }

        public function get_default_settings() {
            return [
                'input_type' => 'text',
            ];
        }
    }

    $controls_manager->register_control('smartsliderfield', new Control_SmartSliderField());
});
