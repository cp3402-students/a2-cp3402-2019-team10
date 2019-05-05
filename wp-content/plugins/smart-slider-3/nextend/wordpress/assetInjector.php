<?php

class N2WordpressAssetInjector {

    private static $nextend_js = '';
    private static $nextend_css = '';

    private static $priority = 100;

    public static function init() {

        /**
         * Borlabs cache
         * @url https://borlabs.io/download/
         */
        if (defined('BORLABS_CACHE_SLUG') && !is_admin()) {
            add_action('template_redirect', 'N2WordpressAssetInjector::outputStart', -1 * self::$priority);
            add_action('shutdown', 'N2WordpressAssetInjector::closeOutputBuffers', -1 * self::$priority);

        } else {
            add_action('init', 'N2WordpressAssetInjector::outputStart', self::$priority);
            add_action('shutdown', 'N2WordpressAssetInjector::closeOutputBuffers', -1 * self::$priority);

            add_action('pp_end_html', 'N2WordpressAssetInjector::closeOutputBuffers', -10000); // ProPhoto 6 theme: we must close the buffer before the cache
            add_action('headway_html_close', 'N2WordpressAssetInjector::closeOutputBuffers', self::$priority); // Headway theme
        }


        add_action('wp_print_scripts', 'N2WordpressAssetInjector::injectCSSComment');

        /**
         * Fix for Gravity Forms MC Unique ID Generator Field
         * @url https://wordpress.org/plugins/gf-mc-unique-id-generator-field/
         */
        if (defined('MCGFUIDGEN_PLUGIN_VERSION')) {
            remove_action('init', 'mcgfuidgen_head', 0);
            add_action('init', 'mcgfuidgen_head', 1000000);
        }

        /**
         * Fix for KeyCDN cache enabled
         * @url https://wordpress.org/plugins/cache-enabler/
         */
        if (class_exists('Cache_Enabler', false)) {
            add_action('template_redirect', function () {
                ob_start("N2WordpressAssetInjector::output_callback");
            }, 0);
        }

        /**
         * Fix for Hyper Cache
         * @url https://wordpress.org/plugins/hyper-cache/
         */
        if (function_exists('hyper_cache_callback')) {
            add_filter('cache_buffer', 'N2WordpressAssetInjector::platformRenderEnd');
        }
    }

    public static function outputStart() {
        static $started = false;
        if ($started) {
            return true;
        }

        $started = true;

        if (defined('AUTOPTIMIZE_PLUGIN_DIR')) {
            add_filter('autoptimize_filter_html_before_minify', array(
                'N2WordpressAssetInjector',
                'platformRenderEnd'
            ));
        }

        /**
         * Gantry 4 improvement to use the inbuilt output filter
         */
        if (defined('GANTRY_VERSION') && version_compare(GANTRY_VERSION, '4.0.0', '>=') && version_compare(GANTRY_VERSION, '5.0.0', '<')) {
            if (!is_admin()) {
                add_filter('gantry_before_render_output', array(
                    'N2WordpressAssetInjector',
                    'platformRenderEnd'
                ));
                remove_action('shutdown', 'N2WordpressAssetInjector::closeOutputBuffers', -1 * self::$priority);

                return true;
            }
        }

        ob_start("N2WordpressAssetInjector::output_callback");

        if (defined('SMART_SLIDER_OB_START')) {
            for ($i = 0; $i < SMART_SLIDER_OB_START; $i++) {
                ob_start();
            }
        }

        /**
         * Ultimate reviews open a buffer on init and tries to close it on wp_footer.
         * To prevent that, lets open a new buffer which can be closed on wp_footer.
         *
         * @bug install Speed Contact Bar + Ultimate Reviews
         * @see https://wordpress.org/plugins/ultimate-reviews/
         */
        if (function_exists('EWD_URP_add_ob_start')) {
            ob_start();
        }

        /**
         * Cart66 closes our output buffer in forceDownload method
         * @url http://www.cart66.com
         */
        if (class_exists('Cart66')) {
            ob_start();
        }

        return true;
    }

    public static function closeOutputBuffers() {

        $handlers = ob_list_handlers();
        if (in_array('N2WordpressAssetInjector::output_callback', $handlers)) {
            for ($i = count($handlers) - 1; $i >= 0; $i--) {
                ob_end_flush();

                if ($handlers[$i] === 'N2WordpressAssetInjector::output_callback') {
                    break;
                }
            }
        }
    }

    public static function output_callback($buffer, $phase) {
        if ($phase & PHP_OUTPUT_HANDLER_FINAL || $phase & PHP_OUTPUT_HANDLER_END) {
            return self::platformRenderEnd($buffer);
        }

        return $buffer;
    }

    public static function platformRenderEnd($buffer) {
        static $once = false;
        if (!$once) {
            $once = true;
            self::finalizeCssJs();

            if (self::$nextend_css != '' && strpos($buffer, '<!--n2css-->') !== false) {
                $buffer = str_replace('<!--n2css-->', self::$nextend_css, $buffer);

                self::$nextend_css = '';
            }

            if (self::$nextend_css != '' || self::$nextend_js != '') {
                $parts = preg_split('/<\/head[\s]*>/', $buffer, 2);

                return implode(self::$nextend_css . self::$nextend_js . '</head>', $parts);
            }
        }

        return $buffer;
    }

    public static function finalizeCssJs() {
        static $finalized = false;
        if (!$finalized) {
            $finalized = true;

            if (defined('N2LIBRARY')) {
                if (class_exists('N2AssetsManager')) {
                    self::$nextend_css = N2AssetsManager::getCSS();
                }

                if (class_exists('N2AssetsManager')) {
                    self::$nextend_js = N2AssetsManager::getJs();
                }

            }
        }

        return true;
    }

    public static function injectCSSComment() {
        static $once;
        if (!$once) {
            echo "<!--n2css-->";
            $once = true;
        }
    }
}

N2WordpressAssetInjector::init();