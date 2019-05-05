<?php
if (! defined('ABSPATH')) {
    die();
}
/*
 * Instagram Gallery
 * WP admin panel plugin page
 */

// current page url
define('INSGALLERY_URL_ADMIN_PAGE', menu_page_url('insta_gallery', false));

$InstaGalleryItems = get_option('insta_gallery_items');
$InstaGallerySetting = get_option('insta_gallery_setting');

$ig_page_msgs = array();
// add/update gallery item
if (isset($_POST['ig-form-update']) && isset($_POST['ig_nonce']) && wp_verify_nonce($_POST['ig_nonce'], 'igfreq_nonce_key')) {
    // filtering data
    $POSTDATA = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
    $IGItem = array();
    $IGItem['ig_select_from'] = $POSTDATA['ig_select_from'];
    $IGItem['insta_user'] = (string) $POSTDATA['insta_user'];
    $IGItem['insta_tag'] = (string) $POSTDATA['insta_tag'];
    $IGItem['insta_user-limit'] = $POSTDATA['insta_user-limit'];
    $IGItem['insta_tag-limit'] = $POSTDATA['insta_tag-limit'];
    $IGItem['ig_display_type'] = $POSTDATA['ig_display_type'];
    $IGItem['insta_gal-cols'] = $POSTDATA['insta_gal-cols'];
    $IGItem['insta_gal-hover'] = @$POSTDATA['insta_gal-hover'];
    $IGItem['insta_gal-spacing'] = @$POSTDATA['insta_gal-spacing'];
    $IGItem['insta_instalink'] = @$POSTDATA['insta_instalink'];
    $IGItem['insta_instalink-text'] = trim(esc_html(@$POSTDATA['insta_instalink-text']));
    $IGItem['insta_instalink-bgcolor'] = sanitize_text_field(@$POSTDATA['insta_instalink-bgcolor']);
    $IGItem['insta_instalink-hvrcolor'] = sanitize_text_field(@$POSTDATA['insta_instalink-hvrcolor']);
    $IGItem['insta_car-slidespv'] = $POSTDATA['insta_car-slidespv'];
    $IGItem['insta_car-autoplay'] = isset($POSTDATA['insta_car-autoplay']) ? $POSTDATA['insta_car-autoplay'] : 0;
    $IGItem['insta_car-autoplay-interval'] = $POSTDATA['insta_car-autoplay-interval'];
    $IGItem['insta_car-navarrows'] = @$POSTDATA['insta_car-navarrows'];	
    $IGItem['insta_car-navarrows-color'] = sanitize_text_field(@$POSTDATA['insta_car-navarrows-color']);
    $IGItem['insta_car-dots'] = @$POSTDATA['insta_car-dots'];
    $IGItem['insta_car-spacing'] = @$POSTDATA['insta_car-spacing'];
    $IGItem['insta_thumb-size'] = @$POSTDATA['insta_thumb-size'];
    $IGItem['insta_hover-color'] = sanitize_text_field(@$POSTDATA['insta_hover-color']);
    $IGItem['insta_gal-popup'] = @$POSTDATA['insta_gal-popup'];
    $IGItem['insta_popup-caption'] = @$POSTDATA['insta_popup-caption'];
    $IGItem['insta_likes'] = @$POSTDATA['insta_likes'];
    $IGItem['insta_comments'] = @$POSTDATA['insta_comments'];
    
    // removing @, # and trimming input
    $IGItem['insta_user'] = trim($IGItem['insta_user']);
    $IGItem['insta_tag'] = trim($IGItem['insta_tag']);
    $IGItem['insta_user'] = str_replace( '@', '', $IGItem['insta_user'] );
    $IGItem['insta_user'] = str_replace( '#', '', $IGItem['insta_user'] );
    $IGItem['insta_tag'] = str_replace( '@', '', $IGItem['insta_tag'] );
    $IGItem['insta_tag'] = str_replace( '#', '', $IGItem['insta_tag'] );
    
    if (isset($POSTDATA['igitem_id'])) {
        $InstaGalleryItems[(int) $POSTDATA['igitem_id']] = $IGItem;
    } else {
        $InstaGalleryItems[] = $IGItem;
        if (isset($InstaGalleryItems[0])) { // for preventing 0 key generation
            $InstaGalleryItems[] = $InstaGalleryItems[0];
            unset($InstaGalleryItems[0]);
        }
    }
    update_option('insta_gallery_items', $InstaGalleryItems, false);
    igf_clearTransients('instagallery_user_feed');
    
    $ig_page_msgs[] = __('Gallery item updated successfully.', 'insta-gallery');
}

// delete gallery item
if (isset($_GET['ig_item_delete'])) {
    $item_id = (int) $_GET['ig_item_delete'];
    if (isset($InstaGalleryItems[$item_id])) {
        unset($InstaGalleryItems[$item_id]);
        update_option('insta_gallery_items', $InstaGalleryItems, false);
    }
    $ig_page_msgs[] = __('Gallery item deleted successfully.', 'insta-gallery');
}


?>
<div id="ig-page" class="">
	<div class="wrap">
		<header class="ig-page-header">
			<h3><?php _e('Instagram Gallery','insta-gallery'); ?></h3>
		</header>
		<hr />
		<div class="ig-page-content">
			<?php
if (! empty($ig_page_msgs)) {
    foreach ($ig_page_msgs as $ig_page_msg) {
        echo '<div class="notice updated my-acf-notice is-dismissible ig_page_msg" ><p>' . $ig_page_msg . '</p></div>';
    }
}
?>
<?php
if (isset($_GET['tab']) && ! empty($_GET['tab'])) {
    $tab = (string) $_GET['tab'];
    switch ($tab) {
        case 'edit':
            include 'views/edit.php';
            break;
        case 'documentation':
            include 'views/documentation.php';
            break;
        default:
            break;
    }
} else {
    include 'views/account.php';
    include 'views/list.php';
}
?>
		</div>
		<hr />
	</div>
</div>

