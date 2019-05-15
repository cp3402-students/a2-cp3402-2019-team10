<?php

if (!defined('ABSPATH'))
  exit;

global $qligg, $qligg_api;

// Save account info
// -----------------------------------------------------------------------------
function qligg_save_options() {
  global $qligg;
  $option = $qligg;
  $option = array_map(function ($value) {
    return base64_encode($value);
  }, $option);
  update_option('insta_gallery_iac', $option, false);
}

// clear old cache
function qligg_clear_transients($tk = false) {
  if ($tk) {
    delete_transient($tk);
  } else {
    delete_transient('instagallery_user_profile_info');
    delete_transient('instagallery_user_feed');
  }
}

// Return profile info
// -----------------------------------------------------------------------------
function qligg_get_user_profile_info() {

  global $qligg, $qligg_api;

  if (!$profile_info = get_transient('instagallery_user_profile_info')) {
    if ($profile_info = $qligg_api->get_user_profile_info($qligg['access_token'])) {
      set_transient('instagallery_user_profile_info', $profile_info, HOUR_IN_SECONDS);
    }
  }

  return $profile_info;
}

// Get user feed
// -----------------------------------------------------------------------------
function qligg_get_user_items($item = array()) {

  global $qligg, $qligg_api;

  $instagram_items = '';

  $limit = isset($item['insta_user-limit']) ? absint($item['insta_user-limit']) : 12;

  if (empty($qligg['access_token'])) {
    return '';
  }
  
  $tk = 'instagallery_user_feed'; // transient key
  
  $tkart = $tk . '_artimeout'; // transient key admin request timeout
  
  if (!QLIGG_PRODUCTION || (current_user_can('administrator') && (false === get_transient($tkart)))) {
    
    $instagram_items = $qligg_api->get_user_media($qligg['access_token'], $limit);
    
    if (!empty($instagram_items)) {
      set_transient($tk, $instagram_items, 2 * HOUR_IN_SECONDS);
      set_transient($tkart, true, 5 * MINUTE_IN_SECONDS);
    }
    
  } else {
    // Get any existing copy of our transient data
    if (false === ($instagram_items = get_transient($tk))) {
      
      $instagram_items = $qligg_api->get_user_media($qligg['access_token'], $limit);
      
      if (!empty($instagram_items)) {
        set_transient($tk, $instagram_items, 2 * HOUR_IN_SECONDS);
      }
    }
  }

  return $instagram_items;
}

// Get tag items
// -----------------------------------------------------------------------------
function qligg_get_tag_items($item) {
  global $qligg_api;

  $instagram_items = '';

  if (empty($item['insta_tag'])) {
    return '';
  }

  $tk = 'instagallery_tag_' . $item['insta_tag']; // transient key

  $tkart = $tk . '_artimeout'; // transient key admin request timeout

  if (!QLIGG_PRODUCTION || (current_user_can('administrator') && (false === get_transient($tkart)))) {

    $instagram_items = $qligg_api->get_tag_items($item['insta_tag']);

    if (!empty($instagram_items)) {
      set_transient($tk, $instagram_items, 2 * HOUR_IN_SECONDS);
      set_transient($tkart, true, 5 * MINUTE_IN_SECONDS);
    }
  } else {
    // Get any existing copy of our transient data
    if (false === ($instagram_items = get_transient($tk))) {
      $instagram_items = $qligg_api->get_tag_items($item['insta_tag']);
      if (!empty($instagram_items)) {
        set_transient($tk, $instagram_items, 2 * HOUR_IN_SECONDS);
      }
    }
  }

  return $instagram_items;
}
