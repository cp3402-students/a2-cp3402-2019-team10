<?php

if (!defined('ABSPATH'))
  exit;

if (!class_exists('QLIGG_Options')) {

  class QLIGG_Options {

    protected static $instance;
    public $instagram_item = array(
        'ig_select_from' => 'username',
        'ig_display_type' => 'gallery',
        'insta_tag' => '',
        'insta_username' => '',
        'insta_limit' => 12,
        'insta_spacing' => 10,
        'insta_instalink' => true,
        'insta_instalink-text' => 'View on Instagram',
        'insta_instalink-bgcolor' => '',
        'insta_instalink-hvrcolor' => '',
        'insta_car-autoplay' => true,
        'insta_car-navarrows' => true,
        'insta_car-navarrows-color' => '',
        'insta_car-dots' => true,
        'insta_thumb-size' => 'standard',
        'insta_hover' => true,
        'insta_hover-color' => '',
        'insta_popup' => true,
        'insta_popup-caption' => true,
        'insta_likes' => true,
        'insta_comments' => true
    );

    //public $defaults;

    /* function defaults() {

      $this->defaults = array(
      '3617511663' => '3617511663.6e628e6.b9ce4730be83482f84943bc2cbfdd077',
      );

      return $this->defaults;
      } */

    function options() {

      global $qligg;

      $qligg = get_option('insta_gallery_token', get_option('insta_gallery_iac', array()));

    }

    function rename_insta_gallery_token($qligg = array()) {

      if (isset($qligg['access_token'])) {

        $access_token = base64_decode($qligg['access_token']);

        $access_token_id = explode('.', $access_token);

        $qligg = array(
            $access_token_id[0] => $access_token
        );
      }

      return $qligg;
    }

    function rename_insta_gallery_items($instagram_items = array()) {

      global $qligg;

      // Backward compatibility v2.2.3
      // -----------------------------------------------------------------------

      foreach ($instagram_items as $id => $instagram_item) {

        if (empty($instagram_item['insta_instalink-text'])) {
          $instagram_items[$id]['insta_instalink-text'] = 'View on Instagram';
        }

        if (!isset($instagram_item['insta_username']) && !empty($instagram_item['insta_user'])) {
          $instagram_items[$id]['insta_username'] = key($qligg);
        }

        if (!isset($instagram_item['insta_limit'])) {

          $instagram_items[$id]['insta_limit'] = 12;

          if (isset($instagram_item['ig_select_from']) && $instagram_item['ig_select_from'] == 'username') {
            $instagram_items[$id]['insta_limit'] = absint($instagram_item['insta_user-limit']);
          }

          if (isset($instagram_item['ig_select_from']) && $instagram_item['ig_select_from'] == 'tag') {
            $instagram_items[$id]['insta_limit'] = absint($instagram_item['insta_tag-limit']);
          }
        }

        if (!isset($instagram_item['insta_spacing'])) {

          $instagram_items[$id]['insta_spacing'] = 0;

          if (!empty($instagram_item['insta_gal-spacing']) && $instagram_item['ig_display_type'] == 'gallery') {
            $instagram_items[$id]['insta_spacing'] = 10;
          }

          if (!empty($instagram_item['insta_car-spacing']) && $instagram_item['ig_display_type'] == 'carousel') {
            $instagram_items[$id]['insta_spacing'] = 10;
          }
        }

        if (!isset($instagram_item['insta_hover'])) {

          $instagram_items[$id]['insta_hover'] = true;

          if (isset($instagram_item['insta_gal-hover']) && $instagram_item['ig_display_type'] == 'gallery') {
            $instagram_items[$id]['insta_hover'] = $instagram_item['insta_gal-hover'];
          }

          if (isset($instagram_item['insta_car-hover']) && $instagram_item['ig_display_type'] == 'carousel') {
            $instagram_items[$id]['insta_hover'] = $instagram_item['insta_car-hover'];
          }
        }

        if (!isset($instagram_item['insta_popup'])) {

          $instagram_items[$id]['insta_popup'] = true;

          if (isset($instagram_item['insta_gal-popup']) && $instagram_item['ig_display_type'] == 'gallery') {
            $instagram_items[$id]['insta_popup'] = $instagram_item['insta_gal-popup'];
          }

          if (isset($instagram_item['insta_car-popup']) && $instagram_item['ig_display_type'] == 'carousel') {
            $instagram_items[$id]['insta_popup'] = $instagram_item['insta_car-popup'];
          }
        }
      }

      return $instagram_items;
    }

    function init() {
      add_filter('option_insta_gallery_iac', array($this, 'rename_insta_gallery_token'), 10);
      add_filter('option_insta_gallery_token', array($this, 'rename_insta_gallery_token'), 10);
      add_filter('option_insta_gallery_items', array($this, 'rename_insta_gallery_items'), 10);
      add_action('init', array($this, 'options'));
      //add_filter('default_option_insta_gallery_items', array($this, 'insta_gallery_items'), 10);
    }

    public static function instance() {
      if (!isset(self::$instance)) {
        self::$instance = new self();
        //self::$instance->defaults();
        self::$instance->init();
      }
      return self::$instance;
    }

  }

  QLIGG_Options::instance();
}
