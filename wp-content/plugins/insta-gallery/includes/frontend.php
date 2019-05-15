<?php

if (!defined('ABSPATH'))
  exit;

if (!class_exists('QLIGG_Frontend')) {

  class QLIGG_Frontend {

    protected static $instance;

    function add_frontend_js() {

      wp_enqueue_style('insta-gallery', plugins_url('/assets/css/qligg.min.css', QLIGG_PLUGIN_FILE), null, QLIGG_PLUGIN_VERSION);
      wp_enqueue_script('insta-gallery', plugins_url('/assets/js/qligg.min.js', QLIGG_PLUGIN_FILE), array('jquery'), QLIGG_PLUGIN_VERSION, true);
      wp_localize_script('insta-gallery', 'insgalajax', array(
          'ajax_url' => admin_url('admin-ajax.php')
      ));

      wp_enqueue_script('swiper', plugins_url('/assets/swiper/swiper.min.js', QLIGG_PLUGIN_FILE), array('jquery'), null, true);

      wp_enqueue_script('magnific-popup', plugins_url('/assets/magnific-popup/jquery.magnific-popup.min.js', QLIGG_PLUGIN_FILE), array('jquery'), null, true);

      // WP 5 FIX
      //wp_enqueue_script('insta-gallery');
      //wp_enqueue_script('swiper');
      //wp_enqueue_script('magnific-popup');
    }

    function load_ig_item() {
      if (!isset($_REQUEST['insgalid'])) {
        return;
      }
      $gid = (int) $_REQUEST['insgalid'];
      $InstaGalleryItems = get_option('insta_gallery_items');
      if (!isset($InstaGalleryItems[$gid])) {
        return;
      }
      $IGItem = $InstaGalleryItems[$gid];
      $IGItem['gid'] = $gid; // push gallery ID for later use
      global $qligg, $qligg_api;

      // validating options
      if (empty($IGItem['ig_select_from'])) {
        return;
      }
      // backward compatibility v1.5.11
      if (!empty($IGItem['insta_limit'])) {
        $IGItem['insta_user-limit'] = (int) $IGItem['insta_limit'];
        $IGItem['insta_tag-limit'] = (int) $IGItem['insta_limit'];
      } else {
        $IGItem['insta_user-limit'] = (int) $IGItem['insta_user-limit'];
        $IGItem['insta_tag-limit'] = (int) $IGItem['insta_tag-limit'];
      }
      $IGItem['insta_gal-hover'] = filter_var($IGItem['insta_gal-hover'], FILTER_VALIDATE_BOOLEAN);
      $IGItem['insta_gal-spacing'] = filter_var($IGItem['insta_gal-spacing'], FILTER_VALIDATE_BOOLEAN);

      $IGItem['insta_instalink'] = filter_var($IGItem['insta_instalink'], FILTER_VALIDATE_BOOLEAN);
      $IGItem['insta_instalink-text'] = empty($IGItem['insta_instalink-text']) ? __('View on Instagram', 'insta-gallery') : $IGItem['insta_instalink-text'];
      $IGItem['insta_instalink-bgcolor'] = @$IGItem['insta_instalink-bgcolor'];
      $IGItem['insta_instalink-hvrcolor'] = @$IGItem['insta_instalink-hvrcolor'];

      $IGItem['insta_car-autoplay'] = isset($IGItem['insta_car-autoplay']) ? filter_var($IGItem['insta_car-autoplay'], FILTER_VALIDATE_BOOLEAN) : true;
      $IGItem['insta_car-navarrows'] = @filter_var($IGItem['insta_car-navarrows'], FILTER_VALIDATE_BOOLEAN);
      $IGItem['insta_car-navarrows-color'] = @$IGItem['insta_car-navarrows-color'];
      $IGItem['insta_car-dots'] = @filter_var($IGItem['insta_car-dots'], FILTER_VALIDATE_BOOLEAN);
      $IGItem['insta_car-spacing'] = @filter_var($IGItem['insta_car-spacing'], FILTER_VALIDATE_BOOLEAN);

      $IGItem['insta_thumb-size'] = empty($IGItem['insta_thumb-size']) ? 'medium' : $IGItem['insta_thumb-size'];
      $IGItem['insta_hover-color'] = @$IGItem['insta_hover-color'];
      $IGItem['insta_gal-popup'] = filter_var($IGItem['insta_gal-popup'], FILTER_VALIDATE_BOOLEAN);
      $IGItem['insta_popup-caption'] = filter_var($IGItem['insta_popup-caption'], FILTER_VALIDATE_BOOLEAN);
      $IGItem['insta_likes'] = @filter_var($IGItem['insta_likes'], FILTER_VALIDATE_BOOLEAN);
      $IGItem['insta_comments'] = @filter_var($IGItem['insta_comments'], FILTER_VALIDATE_BOOLEAN);

      // continue to results
      $results = '';
      $instaItems = '';
      if ($IGItem['ig_select_from'] == 'username') { // get from username
        $instaItems = qligg_get_user_items($IGItem);
      } else { // continue to tag
        $instaItems = qligg_get_tag_items($IGItem);
      }

      if (!empty($instaItems)) {

        $insta_source = ($IGItem['ig_select_from'] == 'username') ? 'user_' . $IGItem['insta_user'] : 'tag_' . $IGItem['insta_tag'];

        $instaUrl = 'https://www.instagram.com/';
        $instaItemLimit = 12;
        if ($IGItem['ig_select_from'] == 'username') {
          $instaUrl .= $IGItem['insta_user'];
          if (!empty($IGItem['insta_user-limit'])) {
            $instaItemLimit = (int) $IGItem['insta_user-limit'];
          }
        } else {
          $instaUrl .= 'explore/tags/' . $IGItem['insta_tag'];
          if (!empty($IGItem['insta_tag-limit'])) {
            $instaItemLimit = (int) $IGItem['insta_tag-limit'];
          }
        }



        if ($IGItem['ig_display_type'] == 'gallery') {
          ob_start();
          // include (QLIGG_PLUGIN_DIR . 'templates/gallery.php');
          include $this->template_path('gallery.php');
          $results .= ob_get_clean();

          // output dynamic CSS to head
          $IGBSelector = '#ig-block-' . $IGItem['gid']; // Gallery block selector
          $ig_dstyle = '';
          if (!empty($IGItem['insta_hover-color'])) {
            $ig_dstyle .= $IGBSelector . ' .ig-item.ighover a:hover:after, ' . $IGBSelector . ' .swiper-slide a:hover:after {background: ' . $IGItem['insta_hover-color'] . ';}';
          }
          if (!empty($IGItem['insta_instalink-bgcolor'])) {
            $ig_dstyle .= $IGBSelector . ' .instagallery-actions .igact-instalink {background: ' . $IGItem['insta_instalink-bgcolor'] . ';}';
          }
          if (!empty($IGItem['insta_instalink-hvrcolor'])) {
            $ig_dstyle .= $IGBSelector . ' .instagallery-actions .igact-instalink:hover {background: ' . $IGItem['insta_instalink-hvrcolor'] . ';}';
          }
          if (!empty($ig_dstyle)) {
            $results .= "<script>jQuery(function(){jQuery('head').append('<style>$ig_dstyle</style>');});</script>";
          }
        } else if ($IGItem['ig_display_type'] == 'carousel') {
          ob_start();
          // include (QLIGG_PLUGIN_DIR . 'templates/carousel.php');
          include $this->template_path('carousel.php');
          $results .= ob_get_clean();

          // output dynamic CSS to head
          $IGBSelector = '#ig-block-' . $IGItem['gid']; // Gallery block selector
          $ig_dstyle = '';
          if (!empty($IGItem['insta_car-navarrows-color'])) {
            $ig_dstyle .= $IGBSelector . ' .instacarousel .swiper-button-next svg, ' . $IGBSelector . ' .instacarousel .swiper-button-prev svg {fill: ' . $IGItem['insta_car-navarrows-color'] . ';}';
          }
          if (!empty($IGItem['insta_hover-color'])) {
            $ig_dstyle .= $IGBSelector . ' .ig-item.ighover a:hover:after, ' . $IGBSelector . ' .swiper-slide a:hover:after {background: ' . $IGItem['insta_hover-color'] . ';}';
          }
          if (!empty($IGItem['insta_instalink-bgcolor'])) {
            $ig_dstyle .= $IGBSelector . ' .instagallery-actions .igact-instalink {background: ' . $IGItem['insta_instalink-bgcolor'] . ';}';
          }
          if (!empty($IGItem['insta_instalink-hvrcolor'])) {
            $ig_dstyle .= $IGBSelector . ' .instagallery-actions .igact-instalink:hover {background: ' . $IGItem['insta_instalink-hvrcolor'] . ';}';
          }
          if (!empty($ig_dstyle)) {
            $results .= "<script>jQuery(function(){jQuery('head').append('<style>$ig_dstyle</style>');});</script>";
          }
        } else {
          if (current_user_can('administrator')) {
            $results .= '<div class="ig-no-items-msg"><p class="ig_front_msg-color">' . __('ERROR: invalid display type, please check gallery settings.', 'insta-gallery') . '</p></div>';
          }
        }
      } else {
        if (current_user_can('administrator')) {
          $results .= '<div class="ig-no-items-msg"><p class="ig_front_msg-color"><strong>Admin Notice:</strong> unable to get results.</p>';
          $results .= '<ul>';
          if (($IGItem['ig_select_from'] == 'username') && empty($qligg['access_token'])) {
            $results .= '<li>' . __('please update Instagram Access Token in plugin setting.', 'insta-gallery') . '</li>';
          }
          $igsMsg = $qligg_api->get_message();
          if (!empty($igsMsg)) {
            $results .= '<li>' . $igsMsg . '</li>';
          }
          $results .= '</ul></div>';
        }
      }
      // echo $results;
      /*
       * $result = array(
       * 'igsuccess' => true,
       * 'result' => $results
       * );
       * echo json_encode($result);
       * die();
       */
      if (isset($_REQUEST['insgal_ajax']) && !$_REQUEST['insgal_ajax']) {
        return $results;
      } else {
        wp_send_json_success($results);
      }
    }

    function do_shortcode($atts, $content = null) {
      if (empty($atts) || !isset($atts['id'])) {
        return;
      }
      // update/validate attributes
      $atts = shortcode_atts(array(
          'id' => 0,
          'ajax' => true
              ), $atts);
      $atts['ajax'] = filter_var($atts['ajax'], FILTER_VALIDATE_BOOLEAN);

      //disable ajax loading from frontend request
      if (isset($_GET['insgal_ajax']) && ($_GET['insgal_ajax'] == 'false')) {
        $atts['ajax'] = false;
      }

      $gid = (int) $atts['id'];
      $InstaGalleryItems = get_option('insta_gallery_items');
      $InstaGallerySetting = get_option('insta_gallery_setting');
      if (!isset($InstaGalleryItems[$gid])) {
        return;
      }

      $IGItem = $InstaGalleryItems[$gid];

      wp_enqueue_script('insta-gallery');
      if ($IGItem['ig_display_type'] == 'gallery') {
        wp_enqueue_script('magnific-popup');
      } else if ($IGItem['ig_display_type'] == 'carousel') {
        wp_enqueue_script('swiper');
        wp_enqueue_script('magnific-popup');
      }

      $insta_source = ($IGItem['ig_select_from'] == 'username') ? 'user_' . $IGItem['insta_user'] : 'tag_' . $IGItem['insta_tag'];

      $insta_svg = '<svg version="1.1" class="ig-spin" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 551.034 551.034" style="enable-background:new 0 0 551.034 551.034;" xml:space="preserve"><g>
        		<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.57" x2="275.517" y2="549.72" gradientTransform="matrix(1 0 0 -1 0 554)">
        			<stop  offset="0" style="stop-color:#E09B3D"/><stop  offset="0.3" style="stop-color:#C74C4D"/><stop  offset="0.6" style="stop-color:#C21975"/><stop  offset="1" style="stop-color:#7024C4"/>
        		</linearGradient>
        		<path style="fill:url(#SVGID_1_);" d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722
        		c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156
        		C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156
        		c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722
        		c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z"/>
        		<linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.57" x2="275.517" y2="549.72" gradientTransform="matrix(1 0 0 -1 0 554)">
        			<stop  offset="0" style="stop-color:#E09B3D"/><stop  offset="0.3" style="stop-color:#C74C4D"/><stop  offset="0.6" style="stop-color:#C21975"/><stop  offset="1" style="stop-color:#7024C4"/>
        		</linearGradient>
        		<path style="fill:url(#SVGID_2_);" d="M275.517,133C196.933,133,133,196.933,133,275.516s63.933,142.517,142.517,142.517
        		S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6c-48.095,0-87.083-38.988-87.083-87.083
        		s38.989-87.083,87.083-87.083c48.095,0,87.083,38.988,87.083,87.083C362.6,323.611,323.611,362.6,275.517,362.6z"/>
        		<linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="418.31" y1="4.57" x2="418.31" y2="549.72" gradientTransform="matrix(1 0 0 -1 0 554)">
        			<stop  offset="0" style="stop-color:#E09B3D"/><stop  offset="0.3" style="stop-color:#C74C4D"/><stop  offset="0.6" style="stop-color:#C21975"/><stop  offset="1" style="stop-color:#7024C4"/>
        		</linearGradient>
        		<circle style="fill:url(#SVGID_3_);" cx="418.31" cy="134.07" r="34.15"/>
        	</g></svg>';

      $results = '';
      $results .= '<div class="ig-block ' . ((!$atts['ajax']) ? 'ig-block-loaded' : '') . '" id="ig-block-' . $gid . '" data-insgalid="' . $gid . '" data-source="' . $insta_source . '">';
      $results .= '<div class="ig-spinner" ' . ((!$atts['ajax']) ? 'hidden' : '') . '>';
      if (!empty($InstaGallerySetting['igs_spinner'])) {
        // for backward compatibility only
        $results .= '<img src="' . $InstaGallerySetting['igs_spinner'] . '" alt="' . __('Instagram Gallery', 'insta-gallery') . '" class="ig-spin" />';
      } else if (!empty($InstaGallerySetting['igs_spinner_image_id'])) {
        $mid = $InstaGallerySetting['igs_spinner_image_id'];
        $image = wp_get_attachment_image_src($mid);
        if ($image) {
          $results .= '<img src="' . $image[0] . '" alt="' . __('Instagram Gallery', 'insta-gallery') . '" class="ig-spin" />';
        } else {
          $results .= $insta_svg;
        }
      } else {
        $results .= $insta_svg;
      }
      $results .= '</div>';

      // load content with page/shortcode
      if (!$atts['ajax']) {
        $_REQUEST['insgalid'] = $gid;
        $_REQUEST['insgal_ajax'] = $atts['ajax'];
        $results .= $this->load_ig_item();
      }

      $results .= '</div> <!-- // IG BLOCK -->';
      return $results;
    }

    function template_path($template_name) {

      if (file_exists(trailingslashit(get_stylesheet_directory()) . 'insta-gallery/' . $template_name)) {
        return (trailingslashit(get_stylesheet_directory()) . 'insta-gallery/' . $template_name);
      }

      if (file_exists(QLIGG_PLUGIN_DIR . 'templates/' . $template_name)) {
        return (QLIGG_PLUGIN_DIR . 'templates/' . $template_name);
      }
    }

    function init() {
      add_action('wp_ajax_nopriv_load_ig_item', array($this, 'load_ig_item'));
      add_action('wp_ajax_load_ig_item', array($this, 'load_ig_item'));
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
