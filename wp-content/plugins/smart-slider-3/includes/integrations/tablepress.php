<?php

class SmartSliderTablePressFix {

    private $level = 0;

    public function __construct() {
        add_filter('pre_do_shortcode_tag', array(
            $this,
            'before'
        ), 10, 2);
        add_filter('do_shortcode_tag', array(
            $this,
            'after'
        ), 10, 2);

    }

    public function before($ret, $tag) {

        if ($tag == 'table') {
            $this->level++;
            if ($this->level == 1) {
                N2SS3Shortcode::shortcodeModeToSkip();
            }
        }

        return $ret;
    }

    public function after($output, $tag) {

        if ($tag == 'table') {
            $this->level--;
            if ($this->level <= 0) {
                N2SS3Shortcode::shortcodeModeRestore();

                global $shortcode_tags;
                $tmp            = $shortcode_tags;
                $shortcode_tags = array(
                    'smartslider3' => 'N2SS3Shortcode::doShortcode'
                );

                $output = do_shortcode($output);

                $shortcode_tags = $tmp;
            }
        }

        return $output;
    }
}

new SmartSliderTablePressFix();