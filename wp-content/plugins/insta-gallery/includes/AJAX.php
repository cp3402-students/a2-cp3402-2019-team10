<?php

if (!defined('ABSPATH'))
  exit;

if (!class_exists('QLIGG_AJAX')) {

  class QLIGG_AJAX {

    protected static $instance;

    function save_igadvs() {

      if (!empty($_REQUEST) && check_admin_referer('qligg_save_igadvs', 'ig_nonce')) {

        $igs_flush = isset($_REQUEST['igs_flush']) && $_REQUEST['igs_flush'] ? true : false;
        $igs_spinner_image_id = isset($_REQUEST['igs_spinner_image_id']) ? absint($_REQUEST['igs_spinner_image_id']) : '';

        $insta_gallery_setting = array(
            'igs_flush' => $igs_flush,
            'igs_spinner_image_id' => $igs_spinner_image_id
        );

        update_option('insta_gallery_setting', $insta_gallery_setting, false);

        wp_send_json_success(__('Settings updated successfully', 'insta-gallery'));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
    }

    function generate_token() {

      global $qligg, $qligg_api;

      if (!empty($_REQUEST) && check_admin_referer('qligg_generate_token', 'ig_nonce')) {

        if (empty($_REQUEST['ig_access_token'])) {
          wp_send_json_error(__('Invalid access token', 'insta-gallery'));
        }

        $access_token = sanitize_text_field($_REQUEST['ig_access_token']);

        if (count($access_token_id = explode('.', $access_token)) == 1) {
          wp_send_json_error(__('Invalid access token', 'insta-gallery'));
        }

        if (!$qligg_api->validate_token($access_token)) {
          wp_send_json_error(__('Invalid access token', 'insta-gallery'));
        }

        if (isset($qligg[$access_token_id[0]]) && $qligg[$access_token_id[0]] == $access_token) {
          wp_send_json_error(__('Account already connected. To connect a new account logout from Instagram in this browser.', 'insta-gallery'));
        }

        $qligg[$access_token_id[0]] = $access_token;

        qligg_save_options();

        /* if ($profile_info = $qligg_api->get_user_profile($ig_user_token)) {
          ob_start();
          include_once QLIGG_PLUGIN_DIR . 'includes/pages/views/user-profile.php';
          wp_send_json_success(ob_get_clean());
          //wp_send_json_success(include_once QLIGG_PLUGIN_DIR . 'includes/pages/views/user-profile.php');
          } */

        wp_send_json_success(__('Access token created', 'insta-gallery'));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
    }

    /* function update_token() {

      global $qligg, $qligg_api;

      if (!empty($_REQUEST) && check_admin_referer('qligg_update_token', 'ig_nonce')) {

      $ig_access_token = filter_var($_REQUEST['ig_access_token'], FILTER_SANITIZE_STRING);

      if (!$qligg_api->validate_token($ig_access_token)) {
      wp_send_json_error($qligg_api->get_message());
      }

      $qligg['access_token'] = $ig_access_token;

      qligg_save_options();

      wp_send_json_success(__('Token removed successfully', 'insta-gallery'));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
      } */

    function remove_token() {

      global $qligg;

      if (!empty($_REQUEST) && check_admin_referer('qligg_generate_token', 'ig_nonce')) {

        if (!isset($_REQUEST['item_id'])) {
          wp_send_json_error(__('Invalid item id', 'insta-gallery'));
        }

        $item_id = sanitize_text_field($_REQUEST['item_id']);

        unset($qligg[$item_id]);

        qligg_save_options();

        wp_send_json_success(__('Token removed successfully', 'insta-gallery'));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
    }

    function update_form() {

      global $qligg, $qligg_api;

      if (!empty($_REQUEST) && check_admin_referer('qligg_update_form', 'ig_nonce')) {

        $item_id = isset($_REQUEST['item_id']) ? absint($_REQUEST['item_id']) : 0;

        if (empty($item_type = $_REQUEST['ig_select_from'])) {
          wp_send_json_error(__('Select gallery item type', 'insta-gallery'));
        }
        if ($item_type == 'username' && empty($_REQUEST['insta_username'])) {
          wp_send_json_error(__('Username is empty', 'insta-gallery'));
        }
        if ($item_type == 'tag' && empty($_REQUEST['insta_tag'])) {
          wp_send_json_error(__('Tag is empty', 'insta-gallery'));
        }

        $instagram_item = array();

        $instagram_item['ig_select_from'] = $_REQUEST['ig_select_from'];
        $instagram_item['ig_display_type'] = $_REQUEST['ig_display_type'];
        $instagram_item['insta_username'] = $_REQUEST['insta_username'];
        $instagram_item['insta_tag'] = $_REQUEST['insta_tag'];
        $instagram_item['insta_limit'] = $_REQUEST['insta_limit'];
        $instagram_item['insta_gal-cols'] = $_REQUEST['insta_gal-cols'];
        $instagram_item['insta_spacing'] = @$_REQUEST['insta_spacing'];
        $instagram_item['insta_instalink'] = @$_REQUEST['insta_instalink'];
        $instagram_item['insta_instalink-text'] = trim(esc_html(@$_REQUEST['insta_instalink-text']));
        $instagram_item['insta_instalink-bgcolor'] = sanitize_text_field(@$_REQUEST['insta_instalink-bgcolor']);
        $instagram_item['insta_instalink-hvrcolor'] = sanitize_text_field(@$_REQUEST['insta_instalink-hvrcolor']);
        $instagram_item['insta_car-slidespv'] = $_REQUEST['insta_car-slidespv'];
        $instagram_item['insta_car-autoplay'] = isset($_REQUEST['insta_car-autoplay']) ? $_REQUEST['insta_car-autoplay'] : 0;
        $instagram_item['insta_car-autoplay-interval'] = $_REQUEST['insta_car-autoplay-interval'];
        $instagram_item['insta_car-navarrows'] = @$_REQUEST['insta_car-navarrows'];
        $instagram_item['insta_car-navarrows-color'] = sanitize_text_field(@$_REQUEST['insta_car-navarrows-color']);
        $instagram_item['insta_car-dots'] = @$_REQUEST['insta_car-dots'];
        $instagram_item['insta_thumb-size'] = @$_REQUEST['insta_thumb-size'];
        $instagram_item['insta_hover'] = @$_REQUEST['insta_hover'];
        $instagram_item['insta_hover-color'] = sanitize_text_field(@$_REQUEST['insta_hover-color']);
        $instagram_item['insta_popup'] = @$_REQUEST['insta_popup'];
        $instagram_item['insta_popup-caption'] = @$_REQUEST['insta_popup-caption'];
        $instagram_item['insta_likes'] = @$_REQUEST['insta_likes'];
        $instagram_item['insta_comments'] = @$_REQUEST['insta_comments'];

        // removing @, # and trimming input
        // ---------------------------------------------------------------------
        $instagram_item['insta_username'] = trim($instagram_item['insta_username']);
        $instagram_item['insta_username'] = str_replace('@', '', $instagram_item['insta_username']);
        $instagram_item['insta_username'] = str_replace('#', '', $instagram_item['insta_username']);
        $instagram_item['insta_tag'] = trim($instagram_item['insta_tag']);
        $instagram_item['insta_tag'] = str_replace('@', '', $instagram_item['insta_tag']);
        $instagram_item['insta_tag'] = str_replace('#', '', $instagram_item['insta_tag']);

        $instagram_items = get_option('insta_gallery_items', array());

        if ($item_id > 0) {
          $instagram_items[$item_id] = $instagram_item;
        } else {
          $instagram_items[] = $instagram_item;
          if (isset($instagram_items[0])) {
            $instagram_items[] = $instagram_items[0];
            unset($instagram_items[0]);
          }
        }

        update_option('insta_gallery_items', $instagram_items);

        // 1326
        // check if remove transients is neccesary


        wp_send_json_success(__('Gallery item updated successfully', 'insta-gallery'));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
    }

    function form_item_delete() {

      if (isset($_REQUEST['item_id'])) {

        $instagram_items = get_option('insta_gallery_items');

        $item_id = absint($_REQUEST['item_id']);

        if (isset($instagram_items[$item_id])) {

          unset($instagram_items[$item_id]);

          update_option('insta_gallery_items', $instagram_items, false);
        }

        wp_send_json_success(__('Gallery item deleted successfully.', 'insta-gallery'));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
    }

    function init() {
      // Settings
      add_action('wp_ajax_qligg_save_igadvs', array($this, 'save_igadvs'));

      // Token
      // -----------------------------------------------------------------------
      //add_action('wp_ajax_qligg_update_token', array($this, 'update_token'));
      add_action('wp_ajax_qligg_generate_token', array($this, 'generate_token'));
      add_action('wp_ajax_qligg_remove_token', array($this, 'remove_token'));

      // Settings
      // -----------------------------------------------------------------------
      add_action('wp_ajax_qligg_update_form', array($this, 'update_form'));
      add_action('wp_ajax_qligg_form_item_delete', array($this, 'form_item_delete'));


      //add_action('admin_init', array($this, 'admin_init'));
    }

    public static function instance() {
      if (!isset(self::$instance)) {
        self::$instance = new self();
        self::$instance->init();
      }
      return self::$instance;
    }

  }

  QLIGG_AJAX::instance();
}
