<?php
if (!defined('ABSPATH'))
  exit;

if (!class_exists('QLIGG_Settings')) {

  class QLIGG_Settings {

    protected static $instance;

    function ajax_dismiss_notice() {

      if ($notice_id = ( isset($_POST['notice_id']) ) ? sanitize_key($_POST['notice_id']) : '') {

        update_user_meta(get_current_user_id(), $notice_id, true);

        wp_send_json($notice_id);
      }

      wp_die();
    }

    function add_action_links($links) {

      $links[] = '<a target="_blank" href="' . QLIGG_PURCHASE_URL . '">' . esc_html__('Premium', 'insta-gallery') . '</a>';

      $links[] = '<a href="' . admin_url('admin.php?page=qligg') . '">' . esc_html__('Settings', 'insta-gallery') . '</a>';

      return $links;
    }

    function settings_header() {

      global $submenu;

      if (isset($submenu[QLIGG_DOMAIN])) {
        $welcome_menu_items = $submenu[QLIGG_DOMAIN];
      }

      if (is_array($welcome_menu_items)) {
        ?>
        <div class="wrap about-wrap full-width-layout qlwrap">

          <h1><?php esc_html_e('Instagram Gallery', 'insta-gallery'); ?></h1>

          <p class="about-text"><?php esc_html_e('Thanks for using Instagram Gallery! We will do our best to offer you the best and improved experience.', 'insta-gallery'); ?></p>

          <p class="about-text">
            <?php printf('<a href="%s" target="_blank">%s</a>', QLIGG_DEMO_URL, esc_html__('Check out our demo', 'insta-gallery')); ?></a>
          </p>

          <?php printf('<a href="%s" target="_blank"><div style="
      background: #006bff url(%s) no-repeat;
      background-position: top center;
      background-size: 130px 130px;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-weight: 600;
      margin: 5px 0 0;
      padding-top: 120px;
      height: 40px;
      display: inline-block;
      width: 140px;
      position: absolute;
      top: 0;
      right: 0;
      " class="ql-badge">%s</div></a>', 'https://quadlayers.com/?utm_source=qligg_admin', plugins_url('/assets/img/quadlayers.jpg', QLIGG_PLUGIN_FILE), esc_html__('QuadLayers', 'insta-gallery')); ?>

        </div>
        <div class="wrap about-wrap full-width-layout qlwrap">
          <h2 class="nav-tab-wrapper">
            <?php
            foreach ($welcome_menu_items as $welcome_menu_item) {
              if (strpos($welcome_menu_item[2], '.php') !== false)
                continue;
              ?>
              <a href="<?php echo admin_url('admin.php?page=' . esc_attr($welcome_menu_item[2])); ?>" class="nav-tab<?php echo (isset($_GET['page']) && $_GET['page'] == $welcome_menu_item[2]) ? ' nav-tab-active' : ''; ?>"><?php echo esc_html($welcome_menu_item[0]); ?></a>
              <?php
            }
            ?>
          </h2>
        </div>
        <?php
      }
    }

    function settings_welcome() {

      global $qligg;
      ?>
      <?php $this->settings_header(); ?>
      <div class="wrap about-wrap full-width-layout">
        <?php include_once('pages/welcome.php'); ?>
      </div>
      <?php
    }

    function settings_documentation() {

      global $qligg;
      ?>
      <?php $this->settings_header(); ?>
      <div class="wrap about-wrap full-width-layout">
        <?php include_once('pages/documentation.php'); ?>
      </div>
      <?php
    }

    function settings_token() {

      global $qligg, $qligg_api;
      ?>
      <?php $this->settings_header(); ?>
      <div class="wrap about-wrap full-width-layout">
        <?php include_once('pages/token.php'); ?>
      </div>
      <?php
    }

    function settings_feeds() {
      global $qligg;
      $instagram_items = get_option('insta_gallery_items', array());
      $instagram_settings = get_option('insta_gallery_setting', array());
      ?>
      <?php $this->settings_header(); ?>
      <div class="wrap about-wrap full-width-layout">
        <?php include_once('pages/views/list.php'); ?>
        <?php
        if (isset($_GET['tab']) && $_GET['tab'] == 'edit') {
          include_once('pages/views/edit.php');
        }
        ?>
        <?php include_once('pages/views/spinner.php'); ?>
      </div>
      <?php
    }

    function add_menu() {
      add_menu_page(QLIGG_PLUGIN_NAME, QLIGG_PLUGIN_NAME, 'manage_options', QLIGG_DOMAIN, array($this, 'settings_welcome'), 'dashicons-camera');
      add_submenu_page(QLIGG_DOMAIN, __('Welcome', 'insta-gallery'), esc_html__('Welcome', 'insta-gallery'), 'manage_options', QLIGG_DOMAIN, array($this, 'settings_welcome'));
      add_submenu_page(QLIGG_DOMAIN, __('Token', 'insta-gallery'), esc_html__('Token', 'insta-gallery'), 'edit_posts', QLIGG_DOMAIN . '_token', array($this, 'settings_token'));
      add_submenu_page(QLIGG_DOMAIN, __('Gallery', 'insta-gallery'), esc_html__('Gallery', 'insta-gallery'), 'edit_posts', QLIGG_DOMAIN . '_feeds', array($this, 'settings_feeds'));
      add_submenu_page(QLIGG_DOMAIN, __('Documentation', 'insta-gallery'), esc_html__('Documentation', 'insta-gallery'), 'edit_posts', QLIGG_DOMAIN . '_documentation', array($this, 'settings_documentation'));
    }

    function add_admin_js($hook) {
      if (isset($_GET['page']) && strpos($_GET['page'], QLIGG_DOMAIN) !== false) {
        wp_enqueue_style('qligg-admin', plugins_url('/assets/css/qligg-admin.min.css', QLIGG_PLUGIN_FILE), null, QLIGG_PLUGIN_VERSION, 'all');
        wp_enqueue_script('qligg-admin', plugins_url('/assets/js/qligg-admin.min.js', QLIGG_PLUGIN_FILE), array('jquery'), QLIGG_PLUGIN_VERSION);

        wp_enqueue_media();
      }
    }

    function init() {
      //add_action('wp_ajax_qligg_dismiss_notice', array($this, 'ajax_dismiss_notice'));
      //add_action('admin_notices', array($this, 'add_notices'));
      add_action('admin_enqueue_scripts', array($this, 'add_admin_js'));
      add_action('admin_menu', array($this, 'add_menu'));
      add_filter('plugin_action_links_' . plugin_basename(QLIGG_PLUGIN_FILE), array($this, 'add_action_links'));
    }

    public static function instance() {
      if (!isset(self::$instance)) {
        self::$instance = new self();
        self::$instance->init();
      }
      return self::$instance;
    }

  }

  QLIGG_Settings::instance();
}
