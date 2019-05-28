<?php

if (!defined('ABSPATH'))
  exit;

global $qligg, $qligg_api;

// Save account info
// -----------------------------------------------------------------------------
function qligg_save_options() {
  global $qligg;
  $option = $qligg;
  //$option = array_map(function ($value) {
  //  return base64_encode($value);
  //}, $option);
  update_option('insta_gallery_token', $option, false);
  delete_option('insta_gallery_iac');
  delete_transient('insta_gallery_user_profile');
}

// Return profile info
// -----------------------------------------------------------------------------
function qligg_get_user_profile($id = null) {

  global $qligg, $qligg_api;

  $profile_info = array();

  $defaults = array(
      'username' => 'nousername',
      'full_name' => __('Something went wrong, remove this token', 'insta-gallery'),
      'profile_picture' => 'http://2.gravatar.com/avatar/b642b4217b34b1e8d3bd915fc65c4452?s=96&d=mm&r=g',
  );

  $tk = "insta_gallery_user_profile"; // transient key

  if (!QLIGG_PRODUCTION || false === ($profile_info = get_transient($tk))) {

    if (empty($id) || !isset($qligg[$id])) {
      return $defaults;
    }

    if ($profile_info[$id] = $qligg_api->get_user_profile($qligg[$id])) {
      set_transient($tk, $profile_info, 2 * HOUR_IN_SECONDS);
    }
  }

  return wp_parse_args($profile_info[$id], $defaults);
}

// Get user feed
// -----------------------------------------------------------------------------
function qligg_get_user_items($item = array()) {

  global $qligg, $qligg_api;

  if (!isset($item['insta_username'])) {
    return;
  }

  if (empty($qligg[$item['insta_username']])) {
    return;
  }

  $limit = isset($item['insta_user-limit']) ? absint($item['insta_user-limit']) : 12;

  $tk = 'insta_gallery_user_items'; // transient key
  // Get any existing copy of our transient data
  if (!QLIGG_PRODUCTION || false === ($instagram_items = get_transient($tk))) {
    if ($instagram_items = $qligg_api->get_user_items($qligg[$item['insta_username']], $limit)) {
      set_transient($tk, $instagram_items, 2 * HOUR_IN_SECONDS);
    }
  }

  return $instagram_items;
}

// Get tag items
// -----------------------------------------------------------------------------
function qligg_get_tag_items($item = array()) {

  global $qligg, $qligg_api;

  if (empty($item['insta_tag'])) {
    return;
  }

  $tk = "insta_gallery_tag_items_{$item['insta_tag']}"; // transient key
  // Get any existing copy of our transient data
  if (!QLIGG_PRODUCTION || false === ($instagram_items = get_transient($tk))) {
    if (!empty($instagram_items = $qligg_api->get_tag_items($item['insta_tag']))) {
      set_transient($tk, $instagram_items, 2 * HOUR_IN_SECONDS);
    }
  }

  return $instagram_items;
}
