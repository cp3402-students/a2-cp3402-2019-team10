<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

if (MPCEShortcode::isContentEditor()) {
    remove_shortcode('smartslider3');
}