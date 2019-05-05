<?php

N2Loader::import('libraries.form.elements.list');

class N2ElementWordPressPostTypes extends N2ElementList {

    public function __construct($parent, $name = '', $label = '', $default = '', $parameters = array()) {
        parent::__construct($parent, $name, $label, $default, $parameters);


        $this->options['0'] = n2_('All');

        $postTypes = get_post_types();
        foreach ($postTypes AS $postType) {
            $this->options[$postType] = $postType;
        }

    }
}