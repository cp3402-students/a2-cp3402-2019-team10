<?php

class N2ElementUrlParams {

    public static function extend($params) {
        $params['labelButton']      = 'WordPress';
        $params['labelDescription'] = n2_(/** @lang text */
            'Select a page or a blog post from your WordPress site.');
        $params['image']            = '/element/link_platform.png';

        return $params;
    }
}