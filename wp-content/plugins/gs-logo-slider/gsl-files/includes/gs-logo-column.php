<?php 
/**
* ============== Displaying Additional Columns ===============
*/

add_filter( 'manage_edit-gs-logo-slider_columns', 'gs_logo_screen_columns' );

function gs_logo_screen_columns( $columns ) {
	unset( $columns['date'] );
    $columns['gsl_featured_image'] = 'Logo';
    $columns['gs_logo_slider_url_field'] = 'URL';
    $columns['date'] = 'Date';
    return $columns;
}

// GET FEATURED IMAGE
function gs_logo_featured_image($post_ID) {
    $post_thumbnail_id = get_post_thumbnail_id($post_ID);
    if ($post_thumbnail_id) {
        $post_thumbnail_img = wp_get_attachment_image_src($post_thumbnail_id);
        return $post_thumbnail_img[0];
    }
}

add_action('manage_posts_custom_column', 'gs_logo_columns_content', 10, 2);
// SHOW THE FEATURED IMAGE
function gs_logo_columns_content($column_name, $post_ID) {
    if ($column_name == 'gsl_featured_image') {
        $post_featured_image = gs_logo_featured_image($post_ID);
        if ($post_featured_image) {
            echo '<img src="' . $post_featured_image . '" width="34"/>';
        }
    }
}

//Populating the Columns

add_action( 'manage_posts_custom_column', 'populate_columns' );

function populate_columns( $column ) {

    if ( 'gs_logo_slider_url_field' == $column ) {
        $client_url = get_post_meta( get_the_ID(), 'client_url', true );
        echo $client_url;
    }
}


// Columns as Sortable
add_filter( 'manage_edit-gs-logo-slider_sortable_columns', 'gs_logo_sort' );

function gs_logo_sort( $columns ) {
    $columns['gs_logo_slider_url_field'] = 'gs_logo_slider_url_field';
 
    return $columns;
}