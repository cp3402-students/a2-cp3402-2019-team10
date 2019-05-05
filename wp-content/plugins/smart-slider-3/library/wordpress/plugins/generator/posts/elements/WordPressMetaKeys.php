<?php

N2Loader::import('libraries.form.elements.list');

class N2ElementWordPressMetaKeys extends N2ElementList {

    public function __construct($parent, $name = '', $label = '', $default = '', array $parameters = array()) {
        parent::__construct($parent, $name, $label, $default, $parameters);

        $this->options['0'] = n2_('Nothing');

        $metaKeys = $this->generate_meta_keys();
        foreach ($metaKeys AS $metaKey) {
            $this->options[$metaKey] = $metaKey;
        }
    }

    function generate_meta_keys() {
        global $wpdb;
        $query     = "SELECT DISTINCT($wpdb->postmeta.meta_key) FROM $wpdb->posts
            LEFT JOIN $wpdb->postmeta ON $wpdb->posts.ID = $wpdb->postmeta.post_id";
        $meta_keys = $wpdb->get_results($query, ARRAY_A);
        $return = array();
        foreach($meta_keys AS $num => $array){
            if(!empty($array['meta_key'])){
                $return[] = $array['meta_key'];
            }
        }

        return $return;
    }
}