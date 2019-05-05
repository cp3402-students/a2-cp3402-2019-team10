<?php


class N2Translation extends N2TranslationAbstract {

    public static function _($text) {
        return apply_filters('nextend_translation', $text);
    }

    public static function getCurrentLocale() {
        return is_admin() && function_exists('get_user_locale') ? get_user_locale() : get_locale();
    }
}

if (defined('QTRANSLATE_FILE')) {
    add_filter('nextend_translation', 'qtranxf_useCurrentLanguageIfNotFoundShowAvailable', 0);
}