<?php

class N2Form extends N2FormAbstract {

    public static function tokenize() {
        return '<input type="hidden" name="nextend_nonce" value="' . wp_create_nonce('nextend_security') . '" />';
    }

    public static function tokenizeUrl() {
        $a                  = array();
        $a['nextend_nonce'] = wp_create_nonce('nextend_security');

        return $a;
    }

    public static function checkToken() {
        return wp_verify_nonce(N2Request::getVar('nextend_nonce'), 'nextend_security');
    }
}
