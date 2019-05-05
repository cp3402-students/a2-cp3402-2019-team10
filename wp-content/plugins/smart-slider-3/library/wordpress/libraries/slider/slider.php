<?php

class N2SmartSlider extends N2SmartSliderAbstract {

    public function parseSlider($slider) {
        // TODO: Implement parseSlider() method.
        return $slider;
    }

    public static function addCMSFunctions($text) {

        $text = apply_filters('translate_text', do_shortcode(preg_replace('/\[smartslider3 slider=[0-9]+\]/', '', preg_replace('/\[smartslider3 slider="[0-9]+"\]/', '', $text))));

        return $text;
    }


} 