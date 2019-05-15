<?php

if (!defined('ABSPATH'))
  exit;

if (!class_exists('QLIGG_Options')) {

  class QLIGG_Options {

    protected static $instance;
    //public $defaults;

    /*function defaults() {
      $this->defaults = array(
      );

      return $this->defaults;
    }*/

    function options() {

      global $qligg;

      //$options = get_option(QLIGG_DOMAIN);
      //$qligg = $this->wp_parse_args($options, $this->defaults());

      $option = get_option('insta_gallery_iac');

      if ($option && is_array($option)) {
        $qligg = array_map(function ($value) {
          return base64_decode($value);
        }, $option);
      }
    }

    /* function wp_parse_args(&$a, $b) {
      $a = (array) $a;
      $b = (array) $b;
      $result = $b;
      foreach ($a as $k => &$v) {
      if (is_array($v) && isset($result[$k])) {
      $result[$k] = $this->wp_parse_args($v, $result[$k]);
      } else {
      $result[$k] = $v;
      }
      }
      return $result;
      } */

    function init() {
      add_action('init', array($this, 'options'));
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
