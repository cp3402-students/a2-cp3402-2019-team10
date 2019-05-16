<?php
/**
 *
 * @package   GS_Logo_Slider
 * @author    Golam Samdani <samdani1997@gmail.com>
 * @license   GPL-2.0+
 * @link      https://www.gsamdani.com
 * @copyright 2014 Golam Samdani
 *
 * @wordpress-plugin
 * Plugin Name:			GS Logo Slider
 * Plugin URI:			https://www.gsamdani.com/wordpress-plugins
 * Description:       	Best Responsive Logo slider to display partners, clients or sponsors Logo on Wordpress site. Display anywhere at your site using shortcode like [gs_logo] Check more shortcode examples and documention at <a href="https://logo.gsamdani.com">GS Logo Slider Docs</a> 
 * Version:           	1.8.2
 * Author:       		Golam Samdani
 * Author URI:       	https://www.gsamdani.com
 * Text Domain:       	gslogo
 * License:           	GPL-2.0+
 * License URI:       	http://www.gnu.org/licenses/gpl-2.0.txt
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Defining constants
 */
if( ! defined( 'GSL_VERSION' ) ) define( 'GSL_VERSION', '1.8.2' );
if( ! defined( 'GSL_MENU_POSITION' ) ) define( 'GSL_MENU_POSITION', 33 );
if( ! defined( 'GSL_PLUGIN_DIR' ) ) define( 'GSL_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
if( ! defined( 'GSL_PLUGIN_URI' ) ) define( 'GSL_PLUGIN_URI', plugins_url( '', __FILE__ ) );
if( ! defined( 'GSL_FILES_DIR' ) ) define( 'GSL_FILES_DIR', GSL_PLUGIN_DIR . 'gsl-files' );
if( ! defined( 'GSL_FILES_URI' ) ) define( 'GSL_FILES_URI', GSL_PLUGIN_URI . '/gsl-files' );

require_once GSL_FILES_DIR . '/includes/gs-logo-cpt.php';
require_once GSL_FILES_DIR . '/includes/gs-logo-metabox.php';
require_once GSL_FILES_DIR . '/includes/gs-logo-column.php';
require_once GSL_FILES_DIR . '/includes/gs-logo-shortcode.php';
require_once GSL_FILES_DIR . '/gs-ls-script.php';
require_once GSL_FILES_DIR . '/admin/class.settings-api.php';
require_once GSL_FILES_DIR . '/admin/gs_logo_options_config.php';
require_once GSL_FILES_DIR . '/includes/gs-plugins/gs-plugins.php';
require_once GSL_FILES_DIR . '/includes/gs-plugins/gs-plugins-free.php';
require_once GSL_FILES_DIR . '/includes/gs-plugins/gs-logo-help.php';

add_action('do_meta_boxes', 'gsl_fea_img_box');
function gsl_fea_img_box() {
    remove_meta_box( 'postimagediv', 'gs-logo-slider', 'side' );
    add_meta_box('postimagediv', __('Company Logo'), 'post_thumbnail_meta_box', 'gs-logo-slider', 'normal', 'high');
}

//add_action('do_meta_boxes', 'change_image_box2');
function change_image_box2() {
    remove_meta_box( 'postimagediv', 'gs-logo-slider', 'side' );
    add_meta_box(
        'postimagediv',             // id
        __('Company Logo'),         // title
        'post_thumbnail_meta_boxes',  // callback
        'gs-logo-slider',           // screen
        'advance',                  // context 
        'high'                      // priority
    );
}

if ( ! function_exists('gs_logo_pro_link') ) {
    function gs_logo_pro_link( $gsLogo_links ) {
        $gsLogo_links[] = '<a style="color: red; font-weight: bold;" class="gs-pro-link" href="https://www.gsamdani.com/product/gs-logo-slider" target="_blank">Go Pro!</a>';
        $gsLogo_links[] = '<a href="https://www.gsamdani.com/wordpress-plugins" target="_blank">GS Plugins</a>';
        return $gsLogo_links;
    }
    add_filter( 'plugin_action_links_' .plugin_basename(__FILE__), 'gs_logo_pro_link' );
}

/**
 * Initialize the plugin tracker
 *
 * @return void
 */
function appsero_init_tracker_gs_logo_slider() {

    if ( ! class_exists( 'AppSero\Insights' ) ) {
        require_once GSL_FILES_DIR . '/client-master/src/insights.php';
    }

    $insights = new AppSero\Insights( '2f95117b-b1c6-4486-88c0-6b6d815856bf', 'GS Logo Slider', __FILE__ );
    $insights->init_plugin();
}

add_action( 'init', 'appsero_init_tracker_gs_logo_slider' );


/**
 * Activation redirects
 *
 * @since v1.0.0
 */
function gslogo_activate() {
    add_option('gslogo_activation_redirect', true);
}
register_activation_hook(__FILE__, 'gslogo_activate');

/**
 * Redirect to options page
 *
 * @since v1.0.0
 */
function gslogo_redirect() {
    if (get_option('gslogo_activation_redirect', false)) {
        delete_option('gslogo_activation_redirect');
        if(!isset($_GET['activate-multi']))
        {
            
            wp_redirect("edit.php?post_type=gs-logo-slider&page=gs-logo-help");
        }
    }
}
add_action('admin_init', 'gslogo_redirect');


/**
 * @review_dismiss()
 * @review_pending()
 * @gslogo_review_notice_message()
 * Make all the above functions working.
 */
function gslogo_review_notice(){

    review_dismiss();
    review_pending();

    $activation_time    = get_site_option( 'gslogo_active_time' );
    $review_dismissal   = get_site_option( 'gslogo_review_dismiss' );
    $maybe_later        = get_site_option( 'gslogo_maybe_later' );

    if ( 'yes' == $review_dismissal ) {
        return;
    }

    if ( ! $activation_time ) {
        add_site_option( 'gslogo_active_time', time() );
    }
    
    $daysinseconds = 259200; // 3 Days in seconds.
   
    if( 'yes' == $maybe_later ) {
        $daysinseconds = 604800 ; // 7 Days in seconds.
    }

    if ( time() - $activation_time > $daysinseconds ) {
        add_action( 'admin_notices' , 'gslogo_review_notice_message' );
    }
}
add_action( 'admin_init', 'gslogo_review_notice' );

/**
 * For the notice preview.
 */
function gslogo_review_notice_message(){
    $scheme      = (parse_url( $_SERVER['REQUEST_URI'], PHP_URL_QUERY )) ? '&' : '?';
    $url         = $_SERVER['REQUEST_URI'] . $scheme . 'gslogo_review_dismiss=yes';
    $dismiss_url = wp_nonce_url( $url, 'gslogo-review-nonce' );

    $_later_link = $_SERVER['REQUEST_URI'] . $scheme . 'gslogo_review_later=yes';
    $later_url   = wp_nonce_url( $_later_link, 'gslogo-review-nonce' );
    ?>
    
    <div class="gslogo-review-notice">
        <div class="gslogo-review-thumbnail">
            <img src="<?php echo plugins_url('gs-logo-slider/gsl-files/img/gsl.png') ?>" alt="">
        </div>
        <div class="gslogo-review-text">
            <h3><?php _e( 'Leave A Review?', 'gslogo' ) ?></h3>
            <p><?php _e( 'We hope you\'ve enjoyed using <b>GS Logo Slider</b>! Would you consider leaving us a review on WordPress.org?', 'gslogo' ) ?></p>
            <ul class="gslogo-review-ul">
                <li>
                    <a href="https://wordpress.org/support/plugin/gs-logo-slider/reviews/" target="_blank">
                        <span class="dashicons dashicons-external"></span>
                        <?php _e( 'Sure! I\'d love to!', 'gslogo' ) ?>
                    </a>
                </li>
                <li>
                    <a href="<?php echo $dismiss_url ?>">
                        <span class="dashicons dashicons-smiley"></span>
                        <?php _e( 'I\'ve already left a review', 'gslogo' ) ?>
                    </a>
                </li>
                <li>
                    <a href="<?php echo $later_url ?>">
                        <span class="dashicons dashicons-calendar-alt"></span>
                        <?php _e( 'Maybe Later', 'gslogo' ) ?>
                    </a>
                </li>
                <li>
                    <a href="https://www.gsamdani.com/support/" target="_blank">
                        <span class="dashicons dashicons-sos"></span>
                        <?php _e( 'I need help!', 'gslogo' ) ?>
                    </a>
                </li>
                <li>
                    <a href="<?php echo $dismiss_url ?>">
                        <span class="dashicons dashicons-dismiss"></span>
                        <?php _e( 'Never show again', 'gslogo' ) ?>
                    </a>
                </li>
            </ul>
        </div>
    </div>
    
    <?php
}

/**
 * For Dismiss! 
 */
function review_dismiss(){

    if ( ! is_admin() ||
        ! current_user_can( 'manage_options' ) ||
        ! isset( $_GET['_wpnonce'] ) ||
        ! wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_wpnonce'] ) ), 'gslogo-review-nonce' ) ||
        ! isset( $_GET['gslogo_review_dismiss'] ) ) {

        return;
    }

    add_site_option( 'gslogo_review_dismiss', 'yes' );   
}

/**
 * For Maybe Later Update.
 */
function review_pending() {

    if ( ! is_admin() ||
        ! current_user_can( 'manage_options' ) ||
        ! isset( $_GET['_wpnonce'] ) ||
        ! wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_wpnonce'] ) ), 'gslogo-review-nonce' ) ||
        ! isset( $_GET['gslogo_review_later'] ) ) {

        return;
    }
    // Reset Time to current time.
    update_site_option( 'gslogo_active_time', time() );
    update_site_option( 'gslogo_maybe_later', 'yes' );

}

/**
 * Remove Reviews Metadata on plugin Deactivation.
 */
function gslogo_deactivate() {
    delete_option('gslogo_active_time');
    delete_option('gslogo_maybe_later');
}
register_deactivation_hook(__FILE__, 'gslogo_deactivate');



/**
 * Admin Notice
 *
 * @since v1.0.0
 */
function gslogo_admin_notice() {
  if ( current_user_can( 'install_plugins' ) ) {
    global $current_user ;
    $user_id = $current_user->ID;
    /* Check that the user hasn't already clicked to ignore the message */
    if ( ! get_user_meta($user_id, 'gslogo_ignore_notice279') ) {
      echo '<div class="gslogo-admin-notice updated" style="display: flex; align-items: center; padding-left: 0; border-left-color: #EF4B53"><p style="width: 32px;">';
      echo '<img style="width: 100%; display: block;"  src="' . plugins_url('gs-logo-slider/gsl-files/img/gsl.png'). '" ></p><p> ';
      printf(__('<strong>GS Logo Slider</strong> now powering <strong>10,000+</strong> websites. Use the coupon code <strong>CELEBRATE10K</strong> to redeem a <strong>25&#37; </strong> discount on Pro. <a href="https://www.gsamdani.com/product/gs-logo-slider/" target="_blank" style="text-decoration: none;"><span class="dashicons dashicons-smiley" style="margin-left: 10px;"></span> Apply Coupon</a>
        <a href="%1$s" style="text-decoration: none; margin-left: 10px;"><span class="dashicons dashicons-dismiss"></span> I\'m good with free version</a>'),  admin_url( 'edit.php?post_type=gs-logo-slider&page=logo-settings&gslogo_nag_ignore=0' ));
      echo "</p></div>";
    }
  }
}
add_action('admin_notices', 'gslogo_admin_notice');

/**
 * Nag Ignore
 */
function gslogo_nag_ignore() {
  global $current_user;
        $user_id = $current_user->ID;
        /* If user clicks to ignore the notice, add that to their user meta */
        if ( isset($_GET['gslogo_nag_ignore']) && '0' == $_GET['gslogo_nag_ignore'] ) {
             add_user_meta($user_id, 'gslogo_ignore_notice279', 'true', true);
  }
}
add_action('admin_init', 'gslogo_nag_ignore');