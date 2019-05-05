<?php
/*
 * @package Instagram Gallery
 * @version 1
 * some usefull application utilities
 */
if (! defined('INSGALLERY_PATH')) {
    return;
}
global $insgalleryIAC, $iispi;

// some global instagram galley functions

// save account info
function igf_saveIAC()
{
    global $insgalleryIAC;
    $option = $insgalleryIAC;
    $option = array_map(function ($value) {
        return base64_encode($value);
    }, $option);
    update_option('insta_gallery_iac', $option, false);
}

// clear old cache
function igf_clearTransients($tk = false)
{
    if ($tk) {
        delete_transient($tk);
    } else {
        delete_transient('instagallery_user_profile_info');
        delete_transient('instagallery_user_feed');
    }
}

// initialise account info
function igf_initIAC()
{
    global $insgalleryIAC;
    $option = get_option('insta_gallery_iac');
    if ($option && is_array($option)) {
        $option = array_map(function ($value) {
            return base64_decode($value);
        }, $option);
        $insgalleryIAC = $option;
    }
}

// generate code generation url
function igf_getCodegURL()
{
    $redtURL = 'https://api.instagram.com/oauth/authorize/';
    global $insgalleryIAC;
    $red_uri = urlencode(igf_getIGRedURI());
    $redtURL .= "?client_id={$insgalleryIAC ['client_id']}&response_type=code&scope=public_content&redirect_uri={$red_uri}";
    return $redtURL;
}

// generate code generation url
function igf_getIGRedURI()
{
    return admin_url('options-general.php?page=insta_gallery&igigresponse=1');
}

// return profile info
function igf_getUserProfileInfo()
{
    $profileInfo = false;
    global $insgalleryIAC, $iispi;
    $tk = 'instagallery_user_profile_info';
    
    if (false === ($profileInfo = get_transient($tk))) {
        $profileInfo = $iispi->getUserProfileInfo($insgalleryIAC['access_token']);
        if (! empty($profileInfo)) {
            set_transient($tk, $profileInfo, HOUR_IN_SECONDS);
        }
    }
    return $profileInfo;
}

// get user feed
function igf_getUserItems($IGItem)
{
    $instaItems = '';
    $limit = empty($IGItem['insta_user-limit']) ? 12 : (int) $IGItem['insta_user-limit'];
    global $insgalleryIAC, $iispi;
    
    if (empty($insgalleryIAC['access_token'])) {
        return '';
    }
    $tk = 'instagallery_user_feed'; // transient key
    $tkart = $tk . '_artimeout'; // transient key admin request timeout
    if (current_user_can('administrator') && (false === get_transient($tkart))) {
        $instaItems = $iispi->getUserMedia($insgalleryIAC['access_token'], $limit);
        if (! empty($instaItems)) {
            set_transient($tk, $instaItems, 2 * HOUR_IN_SECONDS);
            set_transient($tkart, true, 5 * MINUTE_IN_SECONDS);
        }
    } else {
        // Get any existing copy of our transient data
        if (false === ($instaItems = get_transient($tk))) {
            $instaItems = $iispi->getUserMedia($insgalleryIAC['access_token'], $limit);
            if (! empty($instaItems)) {
                set_transient($tk, $instaItems, 2 * HOUR_IN_SECONDS);
            }
        }
    }
    
    return $instaItems;
}

// get Tag Items
function igf_getTagItems($IGItem)
{
    $instaItems = '';
    global $insgalleryIAC, $iispi;
    
    if (empty($IGItem['insta_tag'])) {
        return '';
    }
    $tk = 'instagallery_tag_' . $IGItem['insta_tag']; // transient key
    $tkart = $tk . '_artimeout'; // transient key admin request timeout
    if (current_user_can('administrator') && (false === get_transient($tkart))) {
        $instaItems = $iispi->getTagItems($IGItem['insta_tag']);
        if (! empty($instaItems)) {
            set_transient($tk, $instaItems, 2 * HOUR_IN_SECONDS);
            set_transient($tkart, true, 5 * MINUTE_IN_SECONDS);
        }
    } else {
        // Get any existing copy of our transient data
        if (false === ($instaItems = get_transient($tk))) {
            $instaItems = $iispi->getTagItems($IGItem['insta_tag']);
            if (! empty($instaItems)) {
                set_transient($tk, $instaItems, 2 * HOUR_IN_SECONDS);
            }
        }
    }
    
    return $instaItems;
}
// --------------------------------------------------
igf_initIAC();
include_once (INSGALLERY_PATH . 'app/inc/IGIASpi.php');
$iispi = new IGIASpi();