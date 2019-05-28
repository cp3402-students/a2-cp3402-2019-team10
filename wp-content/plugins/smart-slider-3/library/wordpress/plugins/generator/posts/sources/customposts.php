<?php
N2Loader::import('libraries.slider.generator.abstract', 'smartslider');

class N2GeneratorPostsCustomPosts extends N2GeneratorAbstract {

    protected $layout = 'article';

    protected $postType;

    public function __construct($group, $name, $post_type, $label) {
        $this->postType = $post_type;
        parent::__construct($group, $name, $label);
    }

    public function getPostType() {
        return $this->postType;
    }

    private function checkKeywords($variable) {
        switch ($variable) {
            case 'current_date':
                $variable = current_time('mysql');
                break;
            case 'current_date_timestamp':
                $variable = current_time('timestamp');
                break;
            default:
                break;
        }
        return $variable;
    }


    public function renderFields($form) {
        parent::renderFields($form);

        $filter = new N2Tab($form, 'posts', n2_('Filter'));

        $group = new N2ElementGroup($filter, 'taxonomies_group', n2_('Taxonomies'));

        new N2ElementWordPressTaxonomies($group, 'taxonomies', n2_('Taxonomies'), 0, array(
            'postType'      => $this->postType,
            'postSeparator' => '|*|'
        ));

        new N2ElementList($group, 'taxonomies_relation', n2_('Relation'), 'OR', array(
            'options' => array(
                'OR'  => 'OR',
                'AND' => 'AND'
            )
        ));

        $group = new N2ElementGroup($filter, 'id_group', n2_('IDs (one per line)'));

        new N2ElementTextarea($group, 'ids', n2_('Only display these posts'), '', array(
            'fieldStyle' => 'width:150px;height:150px;'
        ));

        new N2ElementTextarea($group, 'exclude_ids', n2_('Exclude posts'), '', array(
            'fieldStyle' => 'width:150px;height:150px;'
        ));

        $group = new N2ElementGroup($filter, 'post_meta', n2_('Post custom fields'), array(
            'tip' => n2_('Only show posts, where the given meta key is equal to the given meta value.')
        ));

        new N2ElementWordPressCustomFields($group, 'postmetakey', n2_('Field name'), 0, array(
            'postType' => $this->postType
        ));

        new N2ElementList($group, 'postmetacompare', n2_('Compare method'), '=', array(
            'options' => array(
                '='           => '=',
                '!='          => '!=',
                '>'           => '>',
                '>='          => '>=',
                '<'           => '<',
                '<='          => '<=',
                'LIKE'        => 'LIKE',
                'NOT LIKE'    => 'NOT LIKE',
                'IN'          => 'IN',
                'NOT IN'      => 'NOT IN',
                'BETWEEN'     => 'BETWEEN',
                'NOT BETWEEN' => 'NOT BETWEEN',
                'REGEXP'      => 'REGEXP',
                'NOT REGEXP'  => 'NOT REGEXP',
                'RLIKE'       => 'RLIKE',
                'EXISTS'      => 'EXISTS',
                'NOT EXISTS'  => 'NOT EXISTS'
            )
        ));

        new N2ElementText($group, 'postmetavalue', n2_('Field value'));

        $group = new N2ElementGroup($filter, 'post_meta_more', n2_('More post custom fields'), array(
            'tip' => n2_('Same as the previous option, just you can write down more comparisons. Read the "Field name" and "Compare method" out from the previous option.')
        ));

        new N2ElementTextarea($group, 'postmetakeymore', n2_('One per line'), 'field_name||compare_method||field_value', array(
            'fieldStyle' => 'width:300px;height: 100px;',
            'tip'        => n2_('Example: published||=||yes')
        ));

        $status = new N2ElementGroup($filter, 'poststatusgroup', n2_('Post status'));

        $statuses = get_post_stati();
        $statuses += array(
            'any'   => 'any',
            'unset' => 'unset',
        );

        new N2ElementList($status, 'poststatus', n2_('Post status'), 'publish', array(
            'options' => $statuses
        ));

        $option = new N2ElementGroup($filter, 'postoptiongroup', n2_('Post option'));

        new N2ElementWordPressOptions($option, 'postoption', n2_('Post option'), '0');

        new N2ElementList($option, 'postoptionin', n2_('Post relationship with selected option'), '0', array(
            'options' => array(
                0 => 'IN',
                1 => 'NOT IN'
            )
        ));

        $group = new N2ElementGroup($filter, 'datetimegroup', n2_('Date & time'));
        new N2ElementOnOff($group, 'identifydatetime', n2_('Identify datetime'), 0);
        new N2ElementText($group, 'datetimeformat', n2_('Datetime format'), 'm-d-Y H:i:s', array(
            'tip' => sprintf(n2_('Any PHP date format can be used: %s'), "http://php.net/manual/en/function.date.php")
        ));
        new N2ElementTextarea($group, 'translatedate', n2_('Translate dates'), "from||to\nMonday||Monday\njan||jan", array(
            'fieldStyle' => 'width:300px;height: 100px;',
            'tip'        => n2_('One per line: from||to')
        ));

        $group = new N2ElementGroup($filter, 'modifyvariables', n2_('Variable based modification'));
        new N2ElementText($group, 'timestampvariables', n2_('Replace these timestamp variables'), '', array(
            'tip' => n2_('The "Datetime format" will be used to create dates from the given timestamp containing variables. Separate them with comma.')
        ));

        new N2ElementText($group, 'filevariables', n2_('Replace these file variables'), '', array(
            'tip' => n2_('If you have IDs of files, you can replace those variables with the urls of the files instead. Separate them with comma.')
        ));

        new N2ElementText($group, 'uniquevariable', n2_('Remove duplicate results'), '', array(
            'tip' => n2_('You can remove results based on one variable\'s uniqueness. For example if you want the images to be unique, you could write this variable into the "Unique variable" field: image')
        ));

        $_order = new N2Tab($form, 'order', n2_('Order by'));
        $order  = new N2ElementMixed($_order, 'postsorder', n2_('Order'), 'post_date|*|desc');

        new N2ElementList($order, 'postsorder-1', n2_('Field'), '', array(
            'options' => array(
                'none'          => n2_('None'),
                'post_date'     => n2_('Post date'),
                'ID'            => 'ID',
                'title'         => n2_('Title'),
                'post_modified' => n2_('Modification date'),
                'rand'          => n2_('Random'),
                'post__in'      => n2_('Given IDs'),
                'menu_order'    => n2_('Menu order')
            )
        ));

        new N2ElementRadio($order, 'postsorder-2', n2_('Order'), '', array(
            'options' => array(
                'asc'  => n2_('Ascending'),
                'desc' => n2_('Descending')
            )
        ));

        $order2 = new N2ElementGroup($_order, 'meta_order', n2_('Order by custom field'), array(
            'tip' => n2_('If it\'s set, this will be used instead of the \'Field\' value.')
        ));

        new N2ElementWordPressCustomFields($order2, 'meta_order_key', n2_('Custom field name'), 0, array(
            'postType' => $this->postType
        ));

        new N2ElementRadio($order2, 'meta_orderby', n2_('Order'), 'meta_value_num', array(
            'options' => array(
                'meta_value_num' => n2_('Numeric'),
                'meta_value'     => n2_('Alphabetic')
            )
        ));
    }

    protected function _getData($count, $startIndex) {
        global $post, $wp_the_query;
        $tmpPost         = $post;
        $tmpWp_the_query = $wp_the_query;
        $wp_the_query    = null;
        if (has_filter('the_content', 'siteorigin_panels_filter_content')) {
            $siteorigin_panels_filter_content = true;
            remove_filter('the_content', 'siteorigin_panels_filter_content');
        } else {
            $siteorigin_panels_filter_content = false;
        }

        $taxonomies = array_diff(explode('||', $this->data->get('taxonomies', '')), array(
            '',
            0
        ));

        if (count($taxonomies)) {
            $tax_array = array();
            foreach ($taxonomies AS $tax) {
                $parts = explode('|*|', $tax);
                if (!is_array(@$tax_array[$parts[0]]) || !in_array($parts[1], $tax_array[$parts[0]])) {
                    $tax_array[$parts[0]][] = $parts[1];
                }
            }

            $tax_query = array();
            foreach ($tax_array AS $taxonomy => $terms) {
                $tax_query[] = array(
                    'taxonomy' => $taxonomy,
                    'terms'    => $terms,
                    'field'    => 'id'
                );
            }
            $tax_query['relation'] = $this->data->get('taxonomies_relation', 'OR');
        } else {
            $tax_query = '';
        }

        list($orderBy, $order) = N2Parse::parse($this->data->get('postsorder', 'post_date|*|desc'));

        $compare       = array();
        $compare_value = $this->data->get('postmetacompare', '');
        if (!empty($compare_value)) {
            $compare = array('compare' => $compare_value);
        }

        $postMetaKey = $this->data->get('postmetakey', '0');
        if (!empty($postMetaKey)) {
            $postMetaValue = $this->data->get('postmetavalue', '');
            $postMetaValue = $this->checkKeywords($postMetaValue);
            $getPostMeta   = array(
                'meta_query' => array(
                    array(
                        'key'   => $postMetaKey,
                        'value' => $postMetaValue,
                    ) + $compare
                )
            );
        } else {
            $getPostMeta = array();
        }
        $metaMore = $this->data->get('postmetakeymore', '');
        if (!empty($metaMore) && $metaMore != 'field_name||compare_method||field_value') {
            $metaMoreValues = explode(PHP_EOL, $metaMore);
            foreach ($metaMoreValues AS $metaMoreValue) {
                $metaMoreValue = trim($metaMoreValue);
                if ($metaMoreValue != 'field_name||compare_method||field_value') {
                    $metaMoreArray = explode('||', $metaMoreValue);
                    if (count($metaMoreArray) >= 2) {
                        $compare = array('compare' => $metaMoreArray[1]);
                        
                        $key_query = array(
                            'key' => $metaMoreArray[0]
                        );

                        if (!empty($metaMoreArray[2])) {
                            $key_query += array(
                                'value' => $metaMoreArray[2]
                            );
                        }

                        $getPostMeta['meta_query'][] = $key_query + $compare;
                    }
                }
            }
        }

        $post_status = explode(",", $this->data->get('poststatus', 'publish'));

        $meta_order_key = $this->data->get('meta_order_key');
        $meta_key       = '';
        if (!empty($meta_order_key)) {
            $orderBy  = $this->data->get('meta_orderby', 'meta_value_num');
            $meta_key = $meta_order_key;
        }

        $getPosts = array(
            'include'          => '',
            'exclude'          => '',
            'meta_key'         => $meta_key,
            'meta_value'       => '',
            'post_type'        => $this->postType,
            'post_mime_type'   => '',
            'post_parent'      => '',
            'post_status'      => $post_status,
            'suppress_filters' => false,
            'offset'           => $startIndex,
            'posts_per_page'   => $count,
            'tax_query'        => $tax_query
        );

        if ($orderBy != 'none') {
            $getPosts += array(
                'orderby'            => $orderBy,
                'order'              => $order,
                'ignore_custom_sort' => true
            );
        }

        $getPosts = array_merge($getPosts, $getPostMeta);

        $ids = array_diff($this->getIDs(), array(0));

        if (count($ids) > 0) {
            $getPosts += array(
                'post__in' => $ids
            );
        }

        $exclude_ids = array_diff($this->getIDs('exclude_ids'), array(0));

        if (count($exclude_ids) > 0) {
            $getPosts += array(
                'post__not_in' => $exclude_ids
            );
        }

        $post_option = $this->data->get('postoption', 0);
        if (!empty($post_option)) {
            $post_option_in = $this->data->get('postoptionin', 0);
            switch ($post_option_in) {
                case 0:
                    $getPosts += array(
                        'post__in' => get_option($post_option)
                    );
                    break;
                case 1:
                    $getPosts += array(
                        'post__not_in' => get_option($post_option)
                    );
                    break;
            }
        }

        $posts = get_posts($getPosts);

        $data = array();

        $timestampVariables = array_map('trim', explode(',', $this->data->get('timestampvariables', '')));
        $fileVariables      = array_map('trim', explode(',', $this->data->get('filevariables', '')));
        $datetimeformat     = $this->data->get('datetimeformat', 'm-d-Y H:i:s');

        for ($i = 0; $i < count($posts); $i++) {
            $record = array();

            $post = $posts[$i];
            setup_postdata($post);

            $record['id'] = $post->ID;

            $record['url']         = get_permalink();
            $record['title']       = apply_filters('the_title', get_the_title(), $post->ID);
            $record['content']     = get_the_content();
            $record['description'] = preg_replace('#\[[^\]]+\]#', '', $record['content']);
            $record['author_name'] = $record['author'] = get_the_author();
            $record['author_url']  = get_the_author_meta('url');
            $record['date']        = get_the_date();
            $record['modified']    = get_the_modified_date();

            $thumbnail_id             = get_post_thumbnail_id($post->ID);
            $record['featured_image'] = wp_get_attachment_url($thumbnail_id);
            if (!$record['featured_image']) {
                $record['featured_image'] = '';
            } else {
                $thumbnail_meta = get_post_meta($thumbnail_id, '_wp_attachment_metadata', true);
                if (isset($thumbnail_meta['sizes'])) {
                    $sizes  = $this->getImageSizes($thumbnail_id, $thumbnail_meta['sizes']);
                    $record = array_merge($record, $sizes);
                }
                $record['alt'] = '';
                $alt           = get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true);
                if (isset($alt)) {
                    $record['alt'] = $alt;
                }
            }

            $record['thumbnail'] = $record['image'] = $record['featured_image'];
            $record['url_label'] = 'View';

            $post_meta = get_post_meta($post->ID);
            if (count($post_meta) && is_array($post_meta) && !empty($post_meta)) {
                foreach ($post_meta AS $key => $value) {
                    if (count($value) && is_array($value) && !empty($value)) {
                        foreach ($value AS $v) {
                            if (!empty($v) && !is_array($v) && !is_object($v)) {
                                $key = str_replace(array(
                                    '_',
                                    '-'
                                ), array(
                                    '',
                                    ''
                                ), $key);
                                if (array_key_exists($key, $record)) {
                                    $key = 'meta' . $key;
                                }
                                if (is_serialized($v)) {
                                    $unserialize_values = unserialize($v);
                                    $unserialize_count  = 1;
                                    if (!empty($unserialize_values) && is_array($unserialize_values)) {
                                        foreach ($unserialize_values AS $unserialize_value) {
                                            if (!empty($unserialize_value) && is_string($unserialize_value)) {
                                                $record['us_' . $key . $unserialize_count] = $unserialize_value;
                                                $unserialize_count++;
                                            } else if (is_array($unserialize_value)) {
                                                foreach ($unserialize_value AS $u_v) {
                                                    if (is_string($u_v)) {
                                                        $record['us_' . $key . $unserialize_count] = $u_v;
                                                        $unserialize_count++;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    $record[$key] = $v;
                                }
                            }
                        }
                    }
                }
            }

            $taxonomies = get_post_taxonomies($post->ID);
            foreach ($taxonomies AS $taxonomy) {
                $post_terms = wp_get_post_terms($post->ID, $taxonomy);
                for ($j = 0; $j < count($post_terms); $j++) {
                    $record[$taxonomy . '_' . ($j + 1)]                  = $post_terms[$j]->name;
                    $record[$taxonomy . '_' . ($j + 1) . '_ID']          = $post_terms[$j]->term_id;
                    $record[$taxonomy . '_' . ($j + 1) . '_description'] = $post_terms[$j]->description;
                }
            }

            if (class_exists('acf')) {
                $fields = get_fields($post->ID);
                if (is_array($fields) && !empty($fields) && count($fields)) {
                    foreach ($fields AS $k => $v) {
                        $type = $this->getACFType($k, $post->ID);
                        $k    = str_replace('-', '', $k);

                        while (isset($record[$k])) {
                            $k = 'acf_' . $k;
                        };
                        if (!is_array($v) && !is_object($v)) {
                            if ($type['type'] == "image" && is_numeric($type["value"])) {
                                $thumbnail_meta = wp_get_attachment_metadata($type["value"]);
                                $src            = wp_get_attachment_image_src($v, $thumbnail_meta['file']);
                                $v              = $src[0];
                            }
                            $record[$k] = $v;
                        } else if (!is_object($v)) {
                            if (isset($v['url'])) {
                                $record[$k] = $v['url'];
                            } else if (is_array($v)) {
                                foreach ($v AS $v_v => $k_k) {
                                    if (is_array($k_k) && isset($k_k['url'])) {
                                        $record[$k . $v_v] = $k_k['url'];
                                    }
                                }
                            }
                        }
                        if ($type['type'] == "image" && (is_numeric($type["value"]) || is_array($type['value']))) {
                            if (is_array($type['value'])) {
                                $sizes = $this->getImageSizes($type["value"]["id"], $type["value"]["sizes"], $k);
                            } else {
                                $thumbnail_meta = wp_get_attachment_metadata($type["value"]);
                                $sizes          = $this->getImageSizes($type["value"], $thumbnail_meta['sizes'], $k);
                            }
                            $record = array_merge($record, $sizes);
                        }
                    }
                }
            }
            if (isset($record['primarytermcategory'])) {
                $primary                         = get_category($record['primarytermcategory']);
                $record['primary_category_name'] = $primary->name;
                $record['primary_category_link'] = get_category_link($primary->cat_ID);
            }
            $record['excerpt'] = get_the_excerpt();

            if (!empty($timestampVariables)) {
                foreach ($timestampVariables AS $timestampVariable) {
                    if (isset($record[$timestampVariable])) {
                        $record[$timestampVariable] = date($datetimeformat, intval($record[$timestampVariable]));
                    }
                }
            }

            if (!empty($fileVariables)) {
                foreach ($fileVariables AS $fileVariable) {
                    if (isset($record[$fileVariable])) {
                        $record[$fileVariable] = wp_get_attachment_url($record[$fileVariable]);
                    }
                }
            }

            $record = apply_filters('smartslider3_posts_customposts_data', $record);

            $data[$i] = &$record;
            unset($record);
        }

        $unique_variable = $this->data->get('uniquevariable', '');
        if (!empty($unique_variable)) {
            $count         = count($data);
            $unique_helper = array();
            for ($i = 0; $i < $count; $i++) {
                if (!in_array($data[$i][$unique_variable], $unique_helper)) {
                    $unique_helper[] = $data[$i][$unique_variable];
                } else {
                    unset($data[$i]);
                }
            }
            $data = array_values($data);
        }

        if ($siteorigin_panels_filter_content) {
            add_filter('the_content', 'siteorigin_panels_filter_content');
        }

        $wp_the_query = $tmpWp_the_query;

        wp_reset_postdata();
        $post = $tmpPost;
        if ($post) setup_postdata($post);
        if ($this->data->get('identifydatetime', 0)) {
            $translate_dates = $this->data->get('translatedate', '');
            $translateValue  = explode(PHP_EOL, $translate_dates);
            $translate       = array();
            if (!empty($translateValue)) {
                foreach ($translateValue AS $tv) {
                    $translateArray = explode('||', $tv);
                    if (!empty($translateArray) && count($translateArray) == 2) {
                        $translate[$translateArray[0]] = $translateArray[1];
                    }
                }
            }
            for ($i = 0; $i < count($data); $i++) {
                foreach ($data[$i] AS $key => $value) {
                    if ($this->isDate($value)) {
                        $data[$i][$key] = $this->translate($this->formatDate($value, $datetimeformat), $translate);
                    }
                }
            }
        }

        return $data;
    }

    protected function isDate($value) {
        if (!$value) {
            return false;
        } else {
            $date = date_parse($value);
            if ($date['error_count'] == 0 && $date['warning_count'] == 0) {
                return checkdate($date['month'], $date['day'], $date['year']);
            } else {
                return false;
            }
        }
    }

    protected function formatDate($date, $format) {
        return date($format, strtotime($date));
    }

    protected function translate($from, $translate) {
        if (!empty($translate) && !empty($from)) {
            foreach ($translate AS $key => $value) {
                $from = str_replace($key, trim($value), $from);
            }
        }

        return $from;
    }

    protected function getImageSizes($thumbnail_id, $sizes, $prefix = false) {
        $data = array();
        if (!$prefix) {
            $prefix = "";
        } else {
            $prefix = $prefix . "_";
        }
        foreach ($sizes AS $size => $image) {
            $imageSrc                                               = wp_get_attachment_image_src($thumbnail_id, $size);
            $data[$prefix . 'image_' . $this->clearSizeName($size)] = $imageSrc[0];
        }

        return $data;
    }

    protected function clearSizeName($size) {
        return preg_replace("/-/", "_", $size);
    }

    protected function getACFType($key, $post_id) {
        $type = get_field_object($key, $post_id);

        return $type;
    }
}
