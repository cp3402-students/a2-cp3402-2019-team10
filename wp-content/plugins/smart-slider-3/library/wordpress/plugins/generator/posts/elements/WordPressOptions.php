<?php

N2Loader::import('libraries.form.elements.list');

class N2ElementWordPressOptions extends N2ElementList {

    public function __construct($parent, $name = '', $label = '', $default = '', array $parameters = array()) {
        parent::__construct($parent, $name, $label, $default, $parameters);

        $options = wp_load_alloptions();

        $this->options['0'] = n2_('Nothing');
        foreach ($options AS $option => $value) {
            $this->options[$option] = $option;
        }
    }
}