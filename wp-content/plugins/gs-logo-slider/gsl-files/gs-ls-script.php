<?php
//--- Enqueue Latest jQuery ---
function gs_ls_jquery() {
	wp_enqueue_script('jquery');
}
add_action('init', 'gs_ls_jquery');


//--- Include js files ---
function gs_ls_enq_scripts() {
	if (!is_admin()) {
		wp_register_script('bxslider-js', GSL_FILES_URI . '/js/jquery.bxslider.min.js', array('jquery'), GSL_VERSION, true);
		wp_register_script('jq-easing-js', GSL_FILES_URI . '/js/jquery.easing.1.3.js', array('jquery'), GSL_VERSION, true);		
		wp_enqueue_script('bxslider-js');
		wp_enqueue_script('jq-easing-js');
		wp_enqueue_script('jq-cus-js', GSL_FILES_URI . '/js/gs-logo-custom.js', array('jquery'), GSL_VERSION, true);	
	}
}
add_action( 'wp_enqueue_scripts', 'gs_ls_enq_scripts' ); 


//--- Include css files ---
function gs_ls_adding_style() {
	if (!is_admin()) {
		
		$media = 'all';
		wp_register_style('bxslider-style', GSL_FILES_URI . '/css/jquery.bxslider.css', '', GSL_VERSION, $media );
		wp_register_style('gs-main-style', GSL_FILES_URI . '/css/gs-main.css', '', GSL_VERSION, $media );				
		wp_enqueue_style('bxslider-style');
		wp_enqueue_style('gs-main-style');	
	}
}
add_action( 'init', 'gs_ls_adding_style' );


if ( !function_exists('gs_logo_enqueue_admin_styles') ) {
    function gs_logo_enqueue_admin_styles() {
        
        wp_enqueue_style('gs-logo-admin', GSL_FILES_URI . '/css/gs-logo-admin.css','', GSL_VERSION, 'all'  );
        wp_enqueue_style('gsl-free-plugins', GSL_FILES_URI . '/admin/css/gs_free_plugins.css','', GSL_VERSION, 'all'  );
    }
    add_action( 'admin_enqueue_scripts', 'gs_logo_enqueue_admin_styles' );
}