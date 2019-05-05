<?php

class N2ModelsContent {

    public static function search($keyword) {

        $the_query = new WP_Query('posts_per_page=20&post_status=publish&s=' . $keyword);

        $links = array();
        if ($the_query->have_posts()) {
            while ($the_query->have_posts()) {
                $the_query->the_post();
                $links[] = array(
                    'title'       => get_the_title(),
                    'description' => get_the_excerpt(),
                    'image'       => wp_get_attachment_url(get_post_thumbnail_id(get_the_ID())),
                    'link'        => get_the_permalink(),
                    'info'        => get_post_type_object(get_post_type())->labels->singular_name
                );
            }
        }
        /* Restore original Post Data */
        wp_reset_postdata();

        return $links;
    }
}