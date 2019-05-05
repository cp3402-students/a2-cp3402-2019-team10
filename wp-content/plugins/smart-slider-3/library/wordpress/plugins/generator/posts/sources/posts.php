<?php

N2Loader::import('libraries.slider.generator.abstract', 'smartslider');

class N2GeneratorPostsPosts extends N2GeneratorAbstract {

    protected $layout = 'article';

    protected $postType = 'post';

    public function renderFields($form) {
        parent::renderFields($form);

        $filter = new N2Tab($form, 'posts', n2_('Filter'));

        $group = new N2ElementGroup($filter, 'filters', n2_('Filter'));

        new N2ElementWordPressCategories($group, 'postscategory', n2_('Categories'), 0);
        new N2ElementWordPressTags($group, 'posttags', n2_('Tags'), 0);
        new N2ElementWordPressTaxonomies($group, 'postcustomtaxonomy', n2_('Taxonomies'), 0, array(
            'postType' => 'post'
        ));

        $posts = new N2ElementGroup($filter, 'poststickygroup', n2_('Posts'));

        new N2ElementFilter($posts, 'poststicky', n2_('Sticky'), 0);
        new N2ElementOnoff($posts, 'postshortcode', n2_('Remove shortcodes'), 1, array(
            'relatedFields' => array(
                'generatorpostshortcodevariables'
            )
        ));
        new N2ElementText($posts, 'postshortcodevariables', n2_('Remove shortcodes from these variables'), 'description, content, excerpt');

        $date = new N2ElementGroup($filter, 'customvariablegroup', n2_('Customized variables'));

        new N2ElementTextarea($date, 'customdates', n2_('Create custom date variables') . ' (' . n2_('one per line') . ')', "variable||PHP date format\nmodified||Ymd\ndate||F j, Y, g:i a\nstarted||F\nended||D", array(
            'fieldStyle' => 'width:300px;height: 100px;',
            'tip'        => sprintf(n2_('You can write down an existing variable\'s name, then two | signs and lastly any date format (%s) in separate lines and new variables will be created for them. The name of the new variables will be the same as the original variable and "_datetime" will be added to the end of them.'), "http://php.net/manual/en/function.date.php")
        ));

        new N2ElementTextarea($date, 'translatecustomdates', n2_('Translate your custom date variables') . ' (' . n2_('one per line') . ')', "from||to\nMonday||Monday\njan||jan", array(
            'fieldStyle' => 'width:300px;height: 100px;',
            'tip'        => n2_('You can translate the newly created variables. Write the original text, like \'Monday\', then two | signs and the text you want it to be translated to, for example \'Montag\'. Together: Monday||Montag')
        ));

        new N2ElementList($date, 'datefunction', n2_('Date function'), 'date_i18n', array(
            'options' => array(
                'date_i18n' => 'date_i18n',
                'date'      => 'date'
            ),
            'tip'     => n2_('This function will be used to format these custom date variables. Usually the date_i18n works, but if your date will be off a little bit, then try out the other one.')
        ));

        $_order = new N2Tab($form, 'order', n2_('Order by'));
        $order  = new N2ElementMixed($_order, 'postscategoryorder', n2_('Order'), 'post_date|*|desc');

        new N2ElementList($order, 'postscategoryorder-1', n2_('Field'), '', array(
            'options' => array(
                'none'          => n2_('None'),
                'post_date'     => n2_('Post date'),
                'ID'            => 'ID',
                'title'         => n2_('Title'),
                'post_modified' => n2_('Modification date'),
                'rand'          => n2_('Random'),
                'comment_count' => n2_('Comment count'),
                'menu_order'    => n2_('Menu order')
            )
        ));

        new N2ElementRadio($order, 'postscategoryorder-2', n2_('order'), '', array(
            'options' => array(
                'asc'  => n2_('Ascending'),
                'desc' => n2_('Descending')
            )
        ));
    }

    private function translate($from, $translate) {
        if (!empty($translate) && !empty($from)) {
            foreach ($translate AS $key => $value) {
                $from = str_replace($key, $value, $from);
            }
        }

        return $from;
    }

    private function linesToArray($lines) {
        $value = preg_split('/$\R?^/m', $lines);
        $data  = array();
        if (!empty($value)) {
            foreach ($value AS $v) {
                $array = explode('||', $v);
                if (!empty($array) && count($array) == 2) {
                    $data[$array[0]] = trim($array[1]);
                }
            }
        }
        return $data;
    }

    private function isTimeStamp($timestamp) {
        return ((string)(int)$timestamp === $timestamp)
            && ($timestamp <= PHP_INT_MAX)
            && ($timestamp >= ~PHP_INT_MAX);
    }

    public function getPostType() {
        return $this->postType;
    }

    public function filterName($name) {
        return $name . N2Translation::getCurrentLocale();
    }

    function get_string_between($str, $startDelimiter, $endDelimiter) {
        $contents             = array();
        $startDelimiterLength = strlen($startDelimiter);
        $endDelimiterLength   = strlen($endDelimiter);
        $startFrom            = $contentStart = $contentEnd = 0;
        while (false !== ($contentStart = strpos($str, $startDelimiter, $startFrom))) {
            $contentStart += $startDelimiterLength;
            $contentEnd   = strpos($str, $endDelimiter, $contentStart);
            if (false === $contentEnd) {
                break;
            }
            $contents[] = substr($str, $contentStart, $contentEnd - $contentStart);
            $startFrom  = $contentEnd + $endDelimiterLength;
        }

        return $contents;
    }

    var $ElementorCount      = 0;
    var $ElementorWidgetType = '';

    function getElementorTextEditors($array) {
        $datas = array();
        if (!is_array($array)) {
            $array = (array)$array;
        }
        foreach ($array as $key => $value) {
            if (is_array($value) || is_object($value)) {
                $datas = array_merge($datas, $this->getElementorTextEditors($value, $key));
            } else {
                if (isset($array['widgetType'])) {
                    $this->ElementorWidgetType = $array['widgetType'];
                }
                if ($key == 'editor' && $this->ElementorWidgetType == 'text-editor') {
                    $this->ElementorCount++;
                    $datas[$key . $this->ElementorCount] = $value;
                }
            }
        }

        return $datas;
    }

    function removeShortcodes($variable) {
        return preg_replace('#\[[^\]]+\]#', '', $variable);
    }

    protected function _getData($count, $startIndex) {
        global $post, $wp_the_query;
        $tmpPost         = $post;
        $tmpWp_the_query = $wp_the_query;
        $wp_the_query    = null;

        list($orderBy, $order) = N2Parse::parse($this->data->get('postscategoryorder', 'post_date|*|desc'));

        $allTags   = $this->data->get('posttags', '');
        $tax_query = '';
        if (!empty($allTags)) {
            $tags = explode('||', $allTags);
            if (!in_array('0', $tags)) {
                $tax_query = array(
                    array(
                        'taxonomy' => 'post_tag',
                        'terms'    => $tags,
                        'field'    => 'id'
                    )
                );
            }
        }

        $allTerms = $this->data->get('postcustomtaxonomy', '');
        if (!empty($allTerms)) {
            $terms = explode('||', $allTerms);
            if (!in_array('0', $terms)) {
                $termarray = array();
                foreach ($terms as $key => $value) {
                    $term = explode("_x_", $value);
                    if (array_key_exists($term[0], $termarray)) {
                        $termarray[$term[0]][] = $term[1];
                    } else {
                        $termarray[$term[0]]   = array();
                        $termarray[$term[0]][] = $term[1];
                    }
                }

                $term_helper = array();
                foreach ($termarray as $taxonomy => $termids) {
                    $term_helper[] = array(
                        'taxonomy' => $taxonomy,
                        'terms'    => $termids,
                        'field'    => 'id'
                    );
                }
                if (!empty($tax_query)) {
                    array_unshift($tax_query, array( 'relation' => 'AND' ));
                } else {
                    $tax_query = array( 'relation' => 'AND' );
                }
                $tax_query = array_merge($tax_query, $term_helper);
            }
        }

        $postsFilter = array(
            'include'          => '',
            'exclude'          => '',
            'meta_key'         => '',
            'meta_value'       => '',
            'post_type'        => 'post',
            'post_mime_type'   => '',
            'post_parent'      => '',
            'post_status'      => 'publish',
            'suppress_filters' => false,
            'offset'           => $startIndex,
            'posts_per_page'   => $count,
            'tax_query'        => $tax_query
        );

        if ($orderBy != 'none') {
            $postsFilter += array(
                'orderby'            => $orderBy,
                'order'              => $order,
                'ignore_custom_sort' => true
            );
        }

        $categories = (array)N2Parse::parse($this->data->get('postscategory'));
        if (!in_array(0, $categories)) {
            $postsFilter['category'] = implode(',', $categories);
        }

        $poststicky = $this->data->get('poststicky');
        switch ($poststicky) {
            case 1:
                $postsFilter += array(
                    'post__in' => get_option('sticky_posts')
                );
                break;
            case -1:
                $postsFilter += array(
                    'post__not_in' => get_option('sticky_posts')
                );
                break;
        }

        if (has_filter('the_content', 'siteorigin_panels_filter_content')) {
            $siteorigin_panels_filter_content = true;
            remove_filter('the_content', 'siteorigin_panels_filter_content');
        } else {
            $siteorigin_panels_filter_content = false;
        }

        $posts = get_posts($postsFilter);

        $prev_timezone   = date_default_timezone_get();
        $timezone_string = get_option('timezone_string');
        if ($timezone_string !== '') {
            date_default_timezone_set($timezone_string);
        }

        $custom_dates  = $this->linesToArray($this->data->get('customdates', ''));
        $translate     = $this->linesToArray($this->data->get('translatecustomdates', ''));
        $date_function = $this->data->get('datefunction', 'date_i18n');

        if ($this->data->get('postshortcode', 1)) {
            $remove_shortcode = array_map('trim', explode(',', $this->data->get('postshortcodevariables', 'description, content, excerpt')));
        } else {
            $remove_shortcode = null;
        }

        $data = array();
        for ($i = 0; $i < count($posts); $i++) {
            $this->ElementorCount = 0;
            $record               = array();

            $post = $posts[$i];
            setup_postdata($post);

            $record['id']          = $post->ID;
            $record['url']         = get_permalink();
            $record['title']       = apply_filters('the_title', get_the_title(), $post->ID);
            $record['content']     = get_the_content();
            $record['description'] = $record['content'];
            if (class_exists('ET_Builder_Plugin')) {
                if (strpos($record['description'], 'et_pb_slide background_image') !== false) {
                    $et_slides = $this->get_string_between($record['description'], 'et_pb_slide background_image="', '"');
                    for ($j = 0; $j < count($et_slides); $j++) {
                        $record['et_slide' . $j] = $et_slides[$j];
                    }
                }
                if (strpos($record['description'], 'background_url') !== false) {
                    $et_backgrounds = $this->get_string_between($record['description'], 'background_url="', '"');
                    for ($j = 0; $j < count($et_backgrounds); $j++) {
                        $record['et_background' . $j] = $et_backgrounds[$j];
                    }
                }
                if (strpos($record['description'], 'logo_image_url') !== false) {
                    $et_logoImages = $this->get_string_between($record['description'], 'logo_image_url="', '"');
                    for ($j = 0; $j < count($et_logoImages); $j++) {
                        $record['et_logoImage' . $j] = $et_logoImages[$j];
                    }
                }
                if (strpos($record['description'], 'slider-content') !== false) {
                    $et_contents = $this->get_string_between($record['description'], 'slider-content">', '</p>');
                    for ($j = 0; $j < count($et_contents); $j++) {
                        $record['et_content' . $j] = $et_contents[$j];
                    }
                }
            }
            $record['author_name']   = $record['author'] = get_the_author();
            $record['author_url']    = get_the_author_meta('url');
            $userID                  = get_the_author_meta('ID');
            $record['author_avatar'] = get_avatar_url($userID);
            $record['date']          = get_the_date();
            $record['modified']      = get_the_modified_date();

            $category = get_the_category($post->ID);
            if (isset($category[0])) {
                $record['category_name'] = $category[0]->name;
                $record['category_link'] = get_category_link($category[0]->cat_ID);
            } else {
                $record['category_name'] = '';
                $record['category_link'] = '';
            }
            $j = 0;
            if (is_array($category) && count($category) > 1) {
                foreach ($category AS $cat) {
                    $record['category_name_' . $j] = $cat->name;
                    $record['category_link_' . $j] = get_category_link($cat->cat_ID);
                    $j++;
                }
            } else {
                $record['category_name_0'] = $record['category_name'];
                $record['category_link_0'] = $record['category_link'];
            }

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
            $record['url_label'] = 'View post';

            $tags = wp_get_post_tags($post->ID);
            for ($j = 0; $j < count($tags); $j++) {
                $record['tag_' . ($j + 1)] = $tags[$j]->name;
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
                if (!empty($record['elementordata'])) {
                    $elementordatas = json_decode($record['elementordata']);
                    foreach ($elementordatas AS $elementordata) {
                        foreach ($this->getElementorTextEditors($elementordata) AS $elementorKey => $elementorVal) {
                            $record[$elementorKey] = $elementorVal;
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

            if (!empty($custom_dates)) {
                foreach ($custom_dates AS $custom_date_key => $custom_date_format) {
                    if (array_key_exists($custom_date_key, $record)) {
                        if ($this->isTimeStamp($record[$custom_date_key])) {
                            $date = $record[$custom_date_key];
                        } else {
                            $date = strtotime($record[$custom_date_key]);
                        }

                        if ($date_function == 'date_i18n') {
                            $record[$custom_date_key . '_datetime'] = $this->translate(date_i18n($custom_date_format, $date), $translate);
                        } else {
                            $record[$custom_date_key . '_datetime'] = $this->translate(date($custom_date_format, $date), $translate);
                        }
                    }
                }
            }

            if (!empty($remove_shortcode)) {
                foreach ($remove_shortcode AS $variable) {
                    if (isset($record[$variable])) {
                        $record[$variable] = $this->removeShortcodes($record[$variable]);
                    }
                }
            }

            $record = apply_filters('smartslider3_posts_posts_data', $record);

            $data[$i] = &$record;
            unset($record);
        }

        if ($siteorigin_panels_filter_content) {
            add_filter('the_content', 'siteorigin_panels_filter_content');
        }

        $wp_the_query = $tmpWp_the_query;

        wp_reset_postdata();
        $post = $tmpPost;
        if ($post) setup_postdata($post);

        if ($timezone_string !== '') {
            date_default_timezone_set($prev_timezone);
        }
        return $data;
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