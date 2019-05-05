<?php


if (!function_exists('smartslider3_fail_php_version')) {
    function smartslider3_fail_php_version() {
        $html_message = sprintf('<div class="error">%s</div>', wpautop(sprintf('Smart Slider 3 requires PHP version 5.4+, plugin is currently NOT RUNNING. Current PHP version: %s', PHP_VERSION)));
        echo wp_kses_post($html_message);
    }
}

if (!function_exists('smartslider3_fail_wp_version')) {
    function smartslider3_fail_wp_version() {
        $html_message = sprintf('<div class="error">%s</div>', wpautop('Smart Slider 3 requires WordPress version 4.6+. Because you are using an earlier version, the plugin is currently NOT RUNNING.'));
        echo wp_kses_post($html_message);
    }
}

if (!class_exists('NextendSmartSlider3Fail', false)) {
    class NextendSmartSlider3Fail {

        public function __construct() {
            add_action('admin_menu', array(
                $this,
                'admin_menu'
            ));
        }

        public function admin_menu() {
            add_menu_page('Smart Slider', 'Smart Slider', 'smartslider', NEXTEND_SMARTSLIDER_3_URL_PATH, array(
                $this,
                'display_page'
            ), 'dashicons-welcome-learn-more');
        }

        public function display_page() {

        }
    }


    new NextendSmartSlider3Fail();
}