<?php

N2Loader::import('libraries.form.elements.list');

class N2ElementWordPressTaxonomies extends N2ElementList {

    protected $isMultiple = true;

    protected $size = 10;

    protected $postType = '';

    protected $postSeparator = '_x_';

    public function __construct($parent, $name = '', $label = '', $default = '', array $parameters = array()) {
        parent::__construct($parent, $name, $label, $default, $parameters);

        $this->options['0'] = n2_('All');

        $taxonomyNames = get_object_taxonomies($this->postType);

        $skip = array(
            'category',
            'post_tag'
        );

        foreach ($taxonomyNames as $taxonomyName) {
            if (($this->postType == 'post' && !in_array($taxonomyName, $skip)) || $this->postType != 'post') {
                $terms = get_terms(array(
                    'taxonomy' => $taxonomyName
                ));
                if (count($terms)) {
                    $taxonomy = get_taxonomy($taxonomyName);
                    $options  = array();
                    foreach ($terms AS $term) {
                        $options[$taxonomy->name . $this->postSeparator . $term->term_id] = '- ' . $term->name;
                    }
                    $this->optgroup[$taxonomy->label] = $options;
                }
            }
        }
    }

    /**
     * @param string $postType
     */
    public function setPostType($postType) {
        $this->postType = $postType;
    }

    public function setPostSeparator($postSeparator) {
        $this->postSeparator = $postSeparator;
    }

}
