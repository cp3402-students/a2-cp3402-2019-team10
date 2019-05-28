<?php
define('NEXTEND_SMARTSLIDER_3_URL', plugins_url(NEXTEND_SMARTSLIDER_3_URL_PATH));

if (!class_exists('N2WP', false)) {
    require_once(dirname(NEXTEND_SMARTSLIDER_3__FILE__) . '/nextend/nextend.php');
    require_once(dirname(NEXTEND_SMARTSLIDER_3__FILE__) . '/library/smartslider/smartslider3.php');
}

class SmartSlider3 {

    public static function init() {

        SmartSlider3::registerApplication();

        if (get_option("n2_ss3_version") != N2SS3::$completeVersion) {
            self::install();
        } else if (isset($_REQUEST['repairss3']) && current_user_can('manage_options') && check_admin_referer('repairss3')) {
            self::install();
            wp_redirect(admin_url('admin.php?page=' . NEXTEND_SMARTSLIDER_3_URL_PATH));
            exit;
        }
        require_once dirname(__FILE__) . '/summersale.php';
    
    

        add_action('widgets_init', 'SmartSlider3::widgets_init', 11);
        add_action('widgets_admin_page', 'SmartSlider3::widgets_admin_page');

        add_action('init', 'SmartSlider3::_init');

        add_action('init', 'SmartSlider3::preRender', 1000000);

        add_action('load-toplevel_page_' . NEXTEND_SMARTSLIDER_3_URL_PATH, 'SmartSlider3::removeEmoji');

        add_action('admin_menu', 'SmartSlider3::nextendAdminInit');

        add_action('network_admin_menu', 'SmartSlider3::nextendNetworkAdminInit');

        add_filter('plugin_action_links', 'SmartSlider3::plugin_action_links', 10, 2);

        add_action('delete_blog', 'SmartSlider3::delete_blog', 10, 2);

        add_action('save_post', 'SmartSlider3::clear_slider_cache');
        add_action('wp_untrash_post', 'SmartSlider3::clear_slider_cache');

        require_once dirname(NEXTEND_SMARTSLIDER_3__FILE__) . DIRECTORY_SEPARATOR . 'includes/shortcode.php';
        require_once dirname(NEXTEND_SMARTSLIDER_3__FILE__) . DIRECTORY_SEPARATOR . 'includes/widget.php';
        require_once dirname(NEXTEND_SMARTSLIDER_3__FILE__) . DIRECTORY_SEPARATOR . 'editor' . DIRECTORY_SEPARATOR . 'shortcode.php';

        if (class_exists('acf', false)) {
            require_once dirname(__FILE__) . '/integrations/acf.php';
        }

        add_action('et_builder_ready', 'SmartSlider3::divi_et_builder_ready');
        add_action('divi_extensions_init', 'SmartSlider3::divi_extensions_init');

        add_action('vc_after_set_mode', 'SmartSlider3::visualComposer');

        add_action('vcv:boot', 'SmartSlider3::visualComposer2');

        if (class_exists('FLBuilderModel', false)) {
            SmartSlider3::beaverBuilder();
        }

        add_action('elementor/init', 'SmartSlider3::elementor');

        add_action('tailor_init', 'SmartSlider3::tailor');

        add_filter('fw_extensions_locations', 'SmartSlider3::unyson_extension');

        if (class_exists('MPCEShortcode', false)) {
            SmartSlider3::motoPressCE();
        }

        if (isset($_GET['pswLoad']) && $_GET['pswLoad'] == 1) {
            N2SS3Shortcode::forceIframe('psw');
        }

        if (defined('JETPACK__VERSION')) {
            require_once dirname(__FILE__) . '/integrations/jetpack.php';
        }

        require_once dirname(__FILE__) . '/integrations/gutenberg/block.php';


        if (defined('TABLEPRESS_ABSPATH')) {
            require_once dirname(__FILE__) . '/integrations/tablepress.php';
        }

        add_action('fusion_builder_shortcodes_init', function () {
            require_once dirname(__FILE__) . '/integrations/Fusion/Fusion.php';
        });

        /**
         * Fix for NextGenGallery and Divi live editor bug
         */
        add_filter('run_ngg_resource_manager', function ($ret) {
            if (isset($_GET['n2prerender']) && isset($_GET['n2app'])) {
                $ret = false;
            }

            return $ret;
        }, 1000000);


        /**
         * For ajax based page loaders
         */
        if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest') {

            N2Loader::import('libraries.settings.settings', 'smartslider');
            if (intval(N2SmartSliderSettings::get('wp-ajax-iframe-slider', 0))) {
                N2SS3Shortcode::forceIframe('ajax');
            }
        }
    }

    public static function plugin_action_links($links, $file) {
        if ($file === NEXTEND_SMARTSLIDER_3_BASENAME && current_user_can('manage_options')) {
            if (!is_array($links)) {
                $links = array();
            }
            $links[] = sprintf('<a href="%s">%s</a>', wp_nonce_url(admin_url('admin.php?page=' . NEXTEND_SMARTSLIDER_3_URL_PATH . '&repairss3=1'), 'repairss3'), 'Reactivate');
        }

        return $links;
    }

    public static function clear_slider_cache() {
        N2Loader::import(array(
            'models.Sliders'
        ), 'smartslider');

        $slidersModel = new N2SmartsliderSlidersModel();
        $slidersModel->invalidateCache();
    }

    public static function removeEmoji() {

        remove_action('wp_head', 'print_emoji_detection_script', 7);
        remove_action('admin_print_scripts', 'print_emoji_detection_script');
    }

    public static function unyson_extension($locations) {
        if (version_compare(fw()->manifest->get_version(), '2.6.0', '>=')) {
            $path             = dirname(__FILE__) . '/integrations/unyson';
            $locations[$path] = plugin_dir_url(__FILE__) . 'integrations/unyson';
        }

        return $locations;
    }

    public static function wpseo_xml_sitemap_post_url($permalink, $post) {
        global $shortcode_tags;
        $_shortcode_tags    = $shortcode_tags;
        $shortcode_tags     = array("smartslider3" => "N2SS3Shortcode::doShortcode");
        $post->post_content = do_shortcode($post->post_content);
        $shortcode_tags     = $_shortcode_tags;

        return $permalink;
    }

    public static function registerApplication() {

        N2Base::registerApplication(dirname(NEXTEND_SMARTSLIDER_3__FILE__) . '/library/smartslider/N2SmartsliderApplicationInfo.php');
    }

    public static function _init() {
        N2Loader::import('libraries.settings.settings', 'smartslider');
        if (current_user_can('smartslider_edit') && intval(N2SmartSliderSettings::get('wp-adminbar', 1))) {
            add_action('admin_bar_menu', 'SmartSlider3::admin_bar_menu', 81);
        }

        if (N2SmartSliderSettings::get('yoast-sitemap', 1)) {
            add_filter('wpseo_xml_sitemap_post_url', 'SmartSlider3::wpseo_xml_sitemap_post_url', 10, 2);
        }
    }

    public static function widgets_init() {
        N2Loader::import('libraries.settings.settings', 'smartslider');
        $widgetAreas = intval(N2SmartSliderSettings::get('wordpress-widget-areas', 1));
        if ($widgetAreas > 0) {
            for ($i = 1; $i <= $widgetAreas; $i++) {

                register_sidebar(array(
                    'name'          => 'Custom Widget Area - #' . $i,
                    'description'   => '',
                    'id'            => 'smartslider_area_' . $i,
                    'before_widget' => '',
                    'after_widget'  => '',
                    'before_title'  => '<div style="display:none;">',
                    'after_title'   => '</div>',
                ));
            }
        }
    }

    public static function widgets_admin_page() {
        add_action('dynamic_sidebar_before', 'SmartSlider3::dynamic_sidebar_before');
    }

    public static function dynamic_sidebar_before($index) {
        if (substr($index, 0, strlen('smartslider_area_')) === 'smartslider_area_') {
            echo '<div class="description">Display this widget area in your theme with: <pre style="white-space: pre-wrap;overflow:hidden;">&lt;?php dynamic_sidebar(\'' . $index . '\'); ?&gt;</pre></div>';
        }

    }

    public static function preRender() {

        if (isset($_GET['n2prerender']) && isset($_GET['n2app'])) {
            if (current_user_can('smartslider') || (!empty($_GET['h']) && ($_GET['h'] === sha1(NONCE_SALT . date('Y-m-d')) || $_GET['h'] === sha1(NONCE_SALT . date('Y-m-d', time() - 60 * 60 * 24))))) {
                try {
                    N2Base::getApplication($_GET['n2app'])
                          ->getApplicationType(N2Platform::$isAdmin ? 'backend' : 'frontend')
                          ->setCurrent()
                          ->render(array(
                              "prerender"  => true,
                              "controller" => $_GET['n2controller'],
                              "action"     => $_GET['n2action']
                          ));
                    n2_exit(true);
                } catch (Exception $e) {
                    exit;
                }
            } else if (isset($_GET['sliderid']) && isset($_GET['hash']) && md5($_GET['sliderid'] . NONCE_SALT) == $_GET['hash']) {
                try {
                    N2Base::getApplication('smartslider')
                          ->getApplicationType('frontend')
                          ->setCurrent()
                          ->render(array(
                              "prerender"  => true,
                              "controller" => 'slider',
                              "action"     => 'iframe'
                          ));
                    n2_exit(true);
                } catch (Exception $e) {
                    exit;
                }
            }
        }
    }

    public static function nextendAdminInit() {

        add_menu_page('Smart Slider', 'Smart Slider', 'smartslider', NEXTEND_SMARTSLIDER_3_URL_PATH, 'SmartSlider3::application', 'dashicons-welcome-learn-more');

    }

    public static function nextendNetworkAdminInit() {
        add_menu_page('Smart Slider Update', 'Smart Slider Update', 'smartslider', NEXTEND_SMARTSLIDER_3_URL_PATH, 'SmartSlider3::networkUpdate', 'dashicons-welcome-learn-more');

        function nextend_smart_slider_admin_menu() {
            echo '<style type="text/css">#adminmenu .toplevel_page_' . NEXTEND_SMARTSLIDER_3_URL_PATH . '{display: none;}</style>';
        }

        add_action('admin_head', 'nextend_smart_slider_admin_menu');
    }

    public static function networkUpdate() {
        N2Base::getApplication("smartslider")
              ->getApplicationType('backend')
              ->setCurrent()
              ->render(array(
                  "controller" => 'update',
                  "action"     => 'update'
              ));
        n2_exit();
    }

    public static function application($dummy, $controller = 'sliders', $action = 'index') {

        N2Base::getApplication("smartslider")
              ->getApplicationType('backend')
              ->setCurrent()
              ->render(array(
                  "controller" => $controller,
                  "action"     => $action
              ));
        n2_exit();
    }

    public static function install() {

        N2WP::install();

        N2Base::getApplication("smartslider")
              ->getApplicationType('backend')
              ->render(array(
                  "controller" => "install",
                  "action"     => "index",
                  "useRequest" => false
              ), array(true));

        update_option("n2_ss3_version", N2SS3::$completeVersion);


        return true;
    }

    public static function delete_blog($blog_id, $drop) {
        N2WP::delete_blog($blog_id, $drop);

        if ($drop) {
            global $wpdb;
            $prefix = $wpdb->get_blog_prefix($blog_id);
            $wpdb->query('DROP TABLE IF EXISTS ' . $prefix . 'nextend2_smartslider3_generators, ' . $prefix . 'nextend2_smartslider3_sliders,	' . $prefix . 'nextend2_smartslider3_slides, ' . $prefix . 'nextend2_smartslider3_sliders_xref;');

        }
    }

    public static function import($file) {
        N2Base::getApplication("smartslider")
              ->getApplicationType('backend');

        N2Loader::import(array(
            'models.Sliders',
            'models.Slides'
        ), 'smartslider');

        N2Loader::import('libraries.import', 'smartslider');

        $import   = new N2SmartSliderImport();
        $sliderId = $import->import($file);

        if ($sliderId !== false) {
            return $sliderId;
        }

        return false;
    }

    public static function divi_et_builder_ready() {
        if (version_compare(ET_CORE_VERSION, '3.1', '<')) {
            require_once dirname(__FILE__) . '/integrations/Divi.php';
        }
    }

    public static function divi_extensions_init() {
        if (version_compare(ET_CORE_VERSION, '3.1', '>=')) {
            require_once dirname(__FILE__) . '/integrations/Divi/SmartSlider3Extension.php';
        }
    }

    public static function visualComposer() {
        require_once dirname(__FILE__) . '/integrations/VisualComposer.php';
    }

    public static function visualComposer2() {
        require_once dirname(__FILE__) . '/integrations/VisualComposer2.php';
    }

    public static function elementor() {
        require_once dirname(__FILE__) . '/integrations/Elementor.php';
    }

    public static function beaverBuilder() {
        require_once dirname(__FILE__) . '/integrations/beaver-builder/BeaverBuilder.php';
    }

    public static function tailor() {
        require_once dirname(__FILE__) . '/integrations/tailor.php';
    }

    public static function motoPressCE() {
        require_once dirname(__FILE__) . '/integrations/MotoPressCE.php';
    }

    /**
     * @param WP_Admin_Bar $wp_admin_bar
     */
    public static function admin_bar_menu($wp_admin_bar) {
        global $wpdb;

        $wp_admin_bar->add_node(array(
            'id'     => 'new_content_smart_slider',
            'parent' => 'new-content',
            'title'  => 'Slider [Smart Slider 3]',
            'href'   => admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH . '#createslider')
        ));

        $wp_admin_bar->add_node(array(
            'id'    => 'smart_slider_3',
            'title' => 'Smart Slider',
            'href'  => admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH)
        ));

        $wp_admin_bar->add_node(array(
            'id'     => 'smart_slider_3_dashboard',
            'parent' => 'smart_slider_3',
            'title'  => 'Dashboard',
            'href'   => admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH)
        ));

        $wp_admin_bar->add_node(array(
            'id'     => 'smart_slider_3_create_slider',
            'parent' => 'smart_slider_3',
            'title'  => 'Create slider',
            'href'   => admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH . '#createslider')
        ));


        $query   = 'SELECT sliders.title, sliders.id, slides.thumbnail
            FROM ' . $wpdb->prefix . 'nextend2_smartslider3_sliders AS sliders
            LEFT JOIN ' . $wpdb->prefix . 'nextend2_smartslider3_slides AS slides ON slides.id = (SELECT id FROM ' . $wpdb->prefix . 'nextend2_smartslider3_slides WHERE slider = sliders.id AND published = 1 AND generator_id = 0 AND thumbnail NOT LIKE \'\' ORDER BY ordering DESC LIMIT 1)
            ORDER BY time DESC LIMIT 10';
        $sliders = $wpdb->get_results($query, ARRAY_A);

        if (count($sliders)) {

            $wp_admin_bar->add_node(array(
                'id'     => 'smart_slider_3_edit',
                'parent' => 'smart_slider_3',
                'title'  => 'Edit slider',
                'href'   => admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH)
            ));

            foreach ($sliders AS $slider) {
                $wp_admin_bar->add_node(array(
                    'id'     => 'smart_slider_3_slider_' . $slider['id'],
                    'parent' => 'smart_slider_3_edit',
                    'title'  => '#' . $slider['id'] . ' - ' . $slider['title'],
                    'href'   => admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH . '&nextendcontroller=slider&nextendaction=edit&sliderid=' . $slider['id'])
                ));
            }

            if (count($sliders) == 10) {
                $wp_admin_bar->add_node(array(
                    'id'     => 'smart_slider_3_slider_view_all',
                    'parent' => 'smart_slider_3_edit',
                    'title'  => 'View all',
                    'href'   => admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH)
                ));
            }
        }

        /*
        $wp_admin_bar->add_node(array(
            'id'     => 'smart_slider_3_clear_cache',
            'parent' => 'smart_slider_3',
            'title'  => 'Clear cache',
            'href'   => N2Base::getApplication('smartslider')->router->createUrl(array(
                'settings/clearcache'
            ), true)
        ));
        */
    }

    public static function sliderSelectAction($jQueryNode) {
        return 'NextendSmartSliderSelectModal(' . $jQueryNode . ');';
    }
}

SmartSlider3::init();