<?php

class N2Localization extends N2LocalizationAbstract {

    static function getLocale() {

        return is_admin() && function_exists('get_user_locale') ? get_user_locale() : get_locale();
    }
}
