<?php
if (!defined('ABSPATH'))
  exit;

if (!class_exists('QLIGG_Frontend')) {

  class QLIGG_Frontend {

    protected static $instance;

    function add_frontend_js() {

      wp_register_style('insta-gallery', plugins_url('/assets/css/qligg.min.css', QLIGG_PLUGIN_FILE), null, QLIGG_PLUGIN_VERSION);
      wp_register_script('insta-gallery', plugins_url('/assets/js/qligg.min.js', QLIGG_PLUGIN_FILE), array('jquery'), QLIGG_PLUGIN_VERSION, true);

      wp_localize_script('insta-gallery', 'qligg', array(
          'ajax_url' => admin_url('admin-ajax.php')
      ));

      // Swiper
      // -----------------------------------------------------------------------
      wp_register_style('swiper', plugins_url('/assets/swiper/swiper.min.css', QLIGG_PLUGIN_FILE), null, QLIGG_PLUGIN_VERSION);
      wp_register_script('swiper', plugins_url('/assets/swiper/swiper.min.js', QLIGG_PLUGIN_FILE), array('jquery'), QLIGG_PLUGIN_VERSION, true);

      // Popup
      // -----------------------------------------------------------------------
      wp_register_style('magnific-popup', plugins_url('/assets/magnific-popup/magnific-popup.min.css', QLIGG_PLUGIN_FILE), null, QLIGG_PLUGIN_VERSION);
      wp_register_script('magnific-popup', plugins_url('/assets/magnific-popup/jquery.magnific-popup.min.js', QLIGG_PLUGIN_FILE), array('jquery'), QLIGG_PLUGIN_VERSION, true);
    }

    function get_items($instagram_item = false) {

      if (isset($instagram_item['ig_select_from'])) {

        if ($instagram_item['ig_select_from'] == 'username') {
          return qligg_get_user_items($instagram_item);
        }

        if ($instagram_item['ig_select_from'] == 'tag') {
          return qligg_get_tag_items($instagram_item);
        }
      }

      return false;
    }

    function get_link($instagram_item = false) {

      $url = 'https://www.instagram.com';

      if (isset($instagram_item['ig_select_from'])) {

        if ($instagram_item['ig_select_from'] == 'username') {

          $profile_info = qligg_get_user_profile($instagram_item['insta_username']);

          return "{$url}/{$profile_info['username']}";
        } else {

          return "{$url}/explore/tags/{$instagram_item['insta_tag']}";
        }
      }

      return false;
    }

    function get_limit($instagram_item = false) {

      // Backward compatibility v2.2.4
      // -----------------------------------------------------------------------

      if (empty($instagram_item['insta_limit'])) {

        $instagram_item['insta_limit'] = 12;

        if ($instagram_item['ig_select_from'] == 'username') {
          $instagram_item['insta_limit'] = absint($instagram_item['insta_user-limit']);
        }

        if ($instagram_item['ig_select_from'] == 'tag') {
          $instagram_item['insta_limit'] = absint($instagram_item['insta_tag-limit']);
        }
      }

      return $instagram_item['insta_limit'];
    }

    function template_path($template_name) {

      if (file_exists(trailingslashit(get_stylesheet_directory()) . "insta-gallery/{$template_name}")) {
        return trailingslashit(get_stylesheet_directory()) . "insta-gallery/{$template_name}";
      }

      if (file_exists(QLIGG_PLUGIN_DIR . "templates/{$template_name}")) {
        return QLIGG_PLUGIN_DIR . "templates/{$template_name}";
      }
    }

    function load_item() {

      global $qligg, $qligg_api;

      if (!isset($_REQUEST['item_id'])) {
        wp_send_json_error(__('Invalid item id', 'insta-gallery'));
      }

      if (!$instagram_items = get_option('insta_gallery_items')) {
        wp_send_json_error(__('Create your first gallery', 'insta-gallery'));
      }

      $id = absint($_REQUEST['item_id']);

      if (!isset($instagram_items[$id])) {
        wp_send_json_error(__('Invalid item id', 'insta-gallery'));
      }

      $instagram_item = $instagram_items[$id];

      // Template
      // -----------------------------------------------------------------------
      
      //$instagram_item['ig_display_type'] = 'masonry';

      if ($instagram_item['ig_display_type']) {

        ob_start();

        include($this->template_path("{$instagram_item['ig_display_type']}.php"));

        wp_send_json_success(ob_get_clean());
      }

      if (($instagram_item['ig_select_from'] == 'username') && !$qligg_api->validate_token($instagram_item['insta_username'])) {

        $messages = array(
            __('Please update Instagram Access Token in plugin setting.', 'insta-gallery')
        );
      } else {

        $messages = array(
            __('Unknow error', 'insta-gallery')
        );
      }

      ob_start();

      include_once($this->template_path('alert.php'));

      wp_send_json_success(ob_get_clean());
    }

    function do_shortcode($atts, $content = null) {

      $atts = shortcode_atts(array(
          'id' => 0,
          'ajax' => true), $atts);

      // Disable ajax loading from frontend request
      // -----------------------------------------------------------------------

      if (isset($_GET['insgal_ajax']) && ($_GET['insgal_ajax'] == 'false')) {
        $atts['ajax'] = false;
      }

      // Start loading
      // -----------------------------------------------------------------------

      if ($id = absint($atts['id'])) {

        //if (count($instagram_items = get_option('insta_gallery_items'))) {
        //if (isset($instagram_item) && ($instagram_item = $instagram_item)) {

        wp_enqueue_style('insta-gallery');
        wp_enqueue_script('insta-gallery');

        wp_enqueue_style('magnific-popup');
        wp_enqueue_script('magnific-popup');

        //if ($instagram_item['ig_display_type'] == 'carousel') {
        wp_enqueue_style('swiper');
        wp_enqueue_script('swiper');
        //}

        if ($instagram_settings = get_option('insta_gallery_setting')) {
          if (!empty($instagram_settings['igs_spinner_image_id'])) {
            $image = wp_get_attachment_image_src($instagram_settings['igs_spinner_image_id']);
          }
        }

        ob_start();
        ?>
        <div id="ig-block-<?php echo esc_attr($id); ?>" class="ig-block <?php echo!$atts['ajax'] ? 'ig-block-loaded' : ''; ?>" data-item_id="<?php echo esc_attr($id); ?>">
          <div class="ig-spinner" <?php echo!empty($image[0]) ? 'style="background-image:url(' . esc_url($image[0]) . ')"' : ''; ?>></div>
          <?php
          if (!$atts['ajax']) {
            $_REQUEST['item_id'] = $id;
            $this->load_item();
          }
          ?>
        </div>
        <?php
        return ob_get_clean();
        //}
        //}
      }
    }

    function init() {
      add_action('wp_ajax_nopriv_qligg_load_item', array($this, 'load_item'));
      add_action('wp_ajax_qligg_load_item', array($this, 'load_item'));
      add_action('wp_enqueue_scripts', array($this, 'add_frontend_js'));
      add_shortcode('insta-gallery', array($this, 'do_shortcode'));
    }

    public static function instance() {
      if (!isset(self::$instance)) {
        self::$instance = new self();
        self::$instance->init();
      }
      return self::$instance;
    }

  }

  QLIGG_Frontend::instance();
}
