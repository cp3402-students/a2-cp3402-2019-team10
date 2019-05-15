<?php

if (!defined('ABSPATH'))
  exit;

if (!class_exists('QLIGG_AJAX')) {

  class QLIGG_AJAX {

    protected static $instance;

    function admin_init() {

      global $qligg, $qligg_api;

      if (current_user_can('administrator') && isset($_REQUEST['igigresponse']) && isset($_REQUEST['code'])) {

        if (empty($qligg['code']) || ($qligg['code'] !== $_REQUEST['code'])) {

          if ($code = filter_var($_REQUEST['code'], FILTER_SANITIZE_STRING)) {

            $url = admin_url('admin.php?page=qligg_token&igigresponse=1');

            if ($token = $qligg_api->get_access_token($qligg['client_id'], $qligg['client_secret'], $url, $code)) {

              $qligg['code'] = $code;
              $qligg['access_token'] = $token;

              qligg_save_options();
              qligg_clear_transients();
            }
          }
        }
      }
    }

    function save_igadvs() {

      if (!empty($_REQUEST) && check_admin_referer('igara_save_igadvs', 'ig_nonce')) {

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

      if (!empty($_REQUEST) && check_admin_referer('igara_generate_token', 'ig_nonce')) {

        if (empty($_REQUEST['ig_client_id'])) {
          wp_send_json_error(__('Please enter valid Client ID', 'insta-gallery'));
        }
        if (empty($_REQUEST['ig_client_secret'])) {
          wp_send_json_error(__('Please enter valid Client Secret', 'insta-gallery'));
        }

        $ig_client_id = filter_var($_REQUEST['ig_client_id'], FILTER_SANITIZE_STRING);

        $ig_client_secret = filter_var($_REQUEST['ig_client_secret'], FILTER_SANITIZE_STRING);

        $qligg['client_id'] = $ig_client_id;
        $qligg['client_secret'] = $ig_client_secret;

        qligg_save_options();

        wp_send_json_success($qligg_api->get_access_code($ig_client_id));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
    }

    function remove_token() {

      global $qligg;

      if (!empty($_REQUEST) && check_admin_referer('igara_remove_token', 'ig_nonce')) {

        $qligg['access_token'] = '';
        $qligg['client_secret'] = '';

        qligg_save_options();

        wp_send_json_success(__('Token removed successfully', 'insta-gallery'));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
    }

    function update_token() {

      global $qligg, $qligg_api;

      if (!empty($_REQUEST) && check_admin_referer('igara_update_token', 'ig_nonce')) {

        $ig_access_token = filter_var($_REQUEST['ig_access_token'], FILTER_SANITIZE_STRING);

        if (!$qligg_api->validate_token($ig_access_token)) {
          wp_send_json_error($qligg_api->get_message());
        }

        $qligg['access_token'] = $ig_access_token;

        qligg_save_options();

        qligg_clear_transients();

        wp_send_json_success(__('Token removed successfully', 'insta-gallery'));
      }

      wp_send_json_error(__('Invalid Request', 'insta-gallery'));
    }

    function update_form() {

      global $qligg, $qligg_api;

      if (!empty($_REQUEST) && check_admin_referer('igara_update_form', 'ig_nonce')) {

        $item_id = isset($_REQUEST['item_id']) ? absint($_REQUEST['item_id']) : 0;

        if (empty($item_type = $_REQUEST['ig_select_from'])) {
          wp_send_json_error(__('Select gallery item type', 'insta-gallery'));
        }
        if ($item_type == 'username' && empty($_REQUEST['insta_user'])) {
          wp_send_json_error(__('Username is empty', 'insta-gallery'));
        }
        if ($item_type == 'tag' && empty($_REQUEST['insta_tag'])) {
          wp_send_json_error(__('Tag is empty', 'insta-gallery'));
        }

        $instagram_item = array();

        $instagram_item['ig_select_from'] = $_REQUEST['ig_select_from'];
        $instagram_item['insta_user'] = $_REQUEST['insta_user'];
        $instagram_item['insta_tag'] = $_REQUEST['insta_tag'];
        $instagram_item['insta_user-limit'] = $_REQUEST['insta_user-limit'];
        $instagram_item['insta_tag-limit'] = $_REQUEST['insta_tag-limit'];
        $instagram_item['ig_display_type'] = $_REQUEST['ig_display_type'];
        $instagram_item['insta_gal-cols'] = $_REQUEST['insta_gal-cols'];
        $instagram_item['insta_gal-hover'] = @$_REQUEST['insta_gal-hover'];
        $instagram_item['insta_gal-spacing'] = @$_REQUEST['insta_gal-spacing'];
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
        $instagram_item['insta_car-spacing'] = @$_REQUEST['insta_car-spacing'];
        $instagram_item['insta_thumb-size'] = @$_REQUEST['insta_thumb-size'];
        $instagram_item['insta_hover-color'] = sanitize_text_field(@$_REQUEST['insta_hover-color']);
        $instagram_item['insta_gal-popup'] = @$_REQUEST['insta_gal-popup'];
        $instagram_item['insta_popup-caption'] = @$_REQUEST['insta_popup-caption'];
        $instagram_item['insta_likes'] = @$_REQUEST['insta_likes'];
        $instagram_item['insta_comments'] = @$_REQUEST['insta_comments'];

        // removing @, # and trimming input
        // ---------------------------------------------------------------------
        $instagram_item['insta_user'] = trim($instagram_item['insta_user']);
        $instagram_item['insta_tag'] = trim($instagram_item['insta_tag']);
        $instagram_item['insta_user'] = str_replace('@', '', $instagram_item['insta_user']);
        $instagram_item['insta_user'] = str_replace('#', '', $instagram_item['insta_user']);
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

        qligg_clear_transients('instagallery_user_feed');

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
      add_action('wp_ajax_igara_save_igadvs', array($this, 'save_igadvs'));

      // Token
      // -----------------------------------------------------------------------
      add_action('wp_ajax_igara_update_token', array($this, 'update_token'));
      add_action('wp_ajax_igara_generate_token', array($this, 'generate_token'));
      add_action('wp_ajax_igara_remove_token', array($this, 'remove_token'));

      // Settings
      // -----------------------------------------------------------------------
      add_action('wp_ajax_igara_update_form', array($this, 'update_form'));
      add_action('wp_ajax_igara_form_item_delete', array($this, 'form_item_delete'));


      add_action('admin_init', array($this, 'admin_init'));
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
