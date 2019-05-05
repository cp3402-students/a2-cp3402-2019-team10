<?php
/*
 * Plugin Name: Instagram Gallery
 * Description: Display pictures gallery on the website from Instagram account.
 * Author: QuadLayers
 * Author URI: https://www.quadlayers.com
 * Requires at least: 3.8
 * Requires PHP: 5.3
 * Tested up to: 5.1
 * Text Domain: insta-gallery
 * Domain Path: /languages/
 * Version: 2.2.0
 */

/*
 * ****** ****** ***** ****** ***** ******
 * min CSS/JS, update ENV, Testing
 * ****** TODO: ****
 *
 *
 */
if (! defined('ABSPATH')) {
    exit(); // Exit if accessed directly.
}

// global constants
define('INSGALLERY_VER', '2.2.0');
define('INSGALLERY_PRODUCTION', true);

define('INSGALLERY_PATH', plugin_dir_path(__FILE__));
define('INSGALLERY_URL', plugins_url('', __FILE__));
define('INSGALLERY_PLUGIN_DIR', plugin_basename(dirname(__FILE__)));

class INSGALLERY
{

    public function __construct()
    {
        register_activation_hook(__FILE__, array(
            $this,
            'activate'
        ));
        register_deactivation_hook(__FILE__, array(
            $this,
            'deactivate'
        ));
        
        if (is_admin()) {
            add_action('admin_menu', array(
                $this,
                'loadMenus'
            ));
            // add setting link
            add_filter('plugin_action_links', array(
                $this,
                'insgal_add_action_plugin'
            ), 10, 5);
            
            // save ig adv. setting
            add_action('wp_ajax_save_igadvs', array(
                $this,
                'save_igadvs'
            ));
            
            // update ig token
            add_action('wp_ajax_igara_update_token', array(
                $this,
                'update_token'
            ));
            
            // generate ig token
            add_action('wp_ajax_igara_generate_token', array(
                $this,
                'generate_token'
            ));
            
            // remove ig token
            add_action('wp_ajax_igara_remove_token', array(
                $this,
                'remove_token'
            ));
            
            // remove ig token
            add_action('admin_init', array(
                $this,
                'admin_init'
            ));
        }
        
        add_action('admin_enqueue_scripts', array(
            $this,
            'load_admin_scripts'
        ));
        
        include_once (INSGALLERY_PATH . 'app/inc/utis.php');
        include_once (INSGALLERY_PATH . 'app/wp-front.php');
        include_once (INSGALLERY_PATH . 'app/wp-widget.php');
        
        // load Translations
        add_action('plugins_loaded', array(
            $this,
            'load_translations_instagal'
        ));
    }

    public function activate()
    {}

    public function deactivate()
    {}

    function save_igadvs()
    {
        if (! isset($_POST['ig_nonce']) || ! wp_verify_nonce($_POST['ig_nonce'], 'igfreq_nonce_key')) {
            wp_send_json_error('Invalid Request.');
        }
        $igs_spinner_image_id = '';
        $igs_flush = (isset($_POST['igs_flush']) && $_POST['igs_flush']) ? true : false;
        if (! empty($_POST['igs_spinner_image_id'])) {
            $igs_spinner_image_id = (int) $_POST['igs_spinner_image_id'];
        }
        $insta_gallery_setting = array(
            'igs_flush' => $igs_flush,
            'igs_spinner_image_id' => $igs_spinner_image_id
        );
        update_option('insta_gallery_setting', $insta_gallery_setting, false);
        
        wp_send_json_success(__('settings updated successfully', 'insta-gallery'));
    }

    function update_token()
    {
        if (! isset($_POST['ig_nonce']) || ! wp_verify_nonce($_POST['ig_nonce'], 'igfreq_nonce_key')) {
            wp_send_json_error('Invalid Request.');
        }
        if (empty($_POST['ig_access_token'])) {
            wp_send_json_error('please enter valid Access Token.');
        }
        $ig_access_token = filter_var($_POST['ig_access_token'], FILTER_SANITIZE_STRING);
        if (! $ig_access_token) {
            wp_send_json_error('please enter valid Access Token.');
        }
        global $insgalleryIAC, $iispi;
        
        $valid = $iispi->isTokenValid($ig_access_token);
        if ($valid !== true) {
            wp_send_json_error($valid);
        }
        
        $insgalleryIAC['access_token'] = $ig_access_token;
        igf_saveIAC();
        
        igf_clearTransients();
        
        wp_send_json_success(__('Token updated successfully', 'insta-gallery'));
    }

    function generate_token()
    {
        if (! isset($_POST['ig_nonce']) || ! wp_verify_nonce($_POST['ig_nonce'], 'igfreq_nonce_key')) {
            wp_send_json_error('Invalid Request.');
        }
        if (empty($_POST['ig_client_id'])) {
            wp_send_json_error('please enter valid Client ID.');
        }
        if (empty($_POST['ig_client_secret'])) {
            wp_send_json_error('please enter valid Client Secret.');
        }
        $ig_client_id = filter_var($_POST['ig_client_id'], FILTER_SANITIZE_STRING);
        $ig_client_secret = filter_var($_POST['ig_client_secret'], FILTER_SANITIZE_STRING);
        if (! $ig_client_id || ! $ig_client_secret) {
            wp_send_json_error('please enter valid details.');
        }
        global $insgalleryIAC;
        $insgalleryIAC['client_id'] = $ig_client_id;
        $insgalleryIAC['client_secret'] = $ig_client_secret;
        igf_saveIAC();
        $link = igf_getCodegURL();
        
        wp_send_json_success($link);
    }

    function remove_token()
    {
        if (! isset($_POST['ig_nonce']) || ! wp_verify_nonce($_POST['ig_nonce'], 'igfreq_nonce_key')) {
            wp_send_json_error('Invalid Request.');
        }
        global $insgalleryIAC;
        $insgalleryIAC['access_token'] = '';
        $insgalleryIAC['client_secret'] = '';
        igf_saveIAC();
        
        wp_send_json_success(__('Token removed successfully', 'insta-gallery'));
    }

    function admin_init()
    {
        if (current_user_can('administrator') && isset($_REQUEST['igigresponse'])) {
            if (! empty($_REQUEST['code'])) {
                $code = filter_var($_REQUEST['code'], FILTER_SANITIZE_STRING);
                if ($code) {
                    global $insgalleryIAC, $iispi;
                    $red_uri = igf_getIGRedURI();
                    $token = $iispi->getAccessToken($insgalleryIAC['client_id'], $insgalleryIAC['client_secret'], $red_uri, $code);
                    if ($token) {
                        $insgalleryIAC['code'] = $code;
                        $insgalleryIAC['access_token'] = $token;
                        igf_saveIAC();
                        igf_clearTransients();
                    }
                }
            }
        }
    }

    function load_translations_instagal()
    {
        load_plugin_textdomain('insta-gallery', false, INSGALLERY_PLUGIN_DIR . '/languages/');
    }

    function load_admin_scripts($hook)
    {
        // Load only on plugin page
        if ($hook != 'settings_page_insta_gallery') {
            return;
        }
        wp_enqueue_style('insta-gallery-admin', INSGALLERY_URL . '/assets/admin-style.css', array(), INSGALLERY_VER);
        
        // Enqueue WordPress media scripts
        wp_enqueue_media();
    }

    function loadMenus()
    {
        add_options_page(__('Instagram Gallery', 'insta-gallery'), __('Instagram Gallery', 'insta-gallery'), 'manage_options', 'insta_gallery', array(
            $this,
            'loadPanel'
        ));
        // add_menu_page();
    }

    function loadPanel()
    {
		if(!current_user_can('administrator')){
			return;
		}
        require_once (INSGALLERY_PATH . 'app/wp-panel.php');
    }

    function insgal_add_action_plugin($actions, $plugin_file)
    {
        static $plugin;
        
        if (! isset($plugin))
            $plugin = plugin_basename(__FILE__);
        if ($plugin == $plugin_file) {
            
            $settings = array(
                'settings' => '<a href="options-general.php?page=insta_gallery">' . __('Settings', 'insta-gallery') . '</a>'
            );
            
            $actions = array_merge($settings, $actions);
        }
        
        return $actions;
    }
}
new INSGALLERY();
