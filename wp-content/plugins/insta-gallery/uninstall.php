<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
  die(-1);
}

if (!is_multisite()) {
  $qligg = get_option('insta_gallery_setting');
  if (!empty($qligg['igs_flush'])) {
    delete_option('insta_gallery_setting');
    delete_option('insta_gallery_items');
    delete_option('insta_gallery_token');
    delete_option('insta_gallery_iac');
  }
}
