<?php

N2Loader::import('libraries.form.elements.list');

class N2ElementWordPressTags extends N2ElementList {

    protected $isMultiple = true;

    protected $size = 10;

    public function __construct($parent, $name = '', $label = '', $default = '', array $parameters = array()) {
        parent::__construct($parent, $name, $label, $default, $parameters);

        $this->options['0'] = n2_('All');

        $terms = get_terms('post_tag');

        if (count($terms)) {
            foreach ($terms AS $term) {
                $this->options[$term->term_id] = '- ' . $term->name;
            }
        }
    }

}
