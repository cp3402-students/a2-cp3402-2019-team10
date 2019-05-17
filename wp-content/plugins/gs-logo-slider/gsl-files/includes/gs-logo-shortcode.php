<?php 

//--------- Getting values from setting panel ---------------- //

function gs_l_get_option( $option, $section, $default = '' ) {

    $options = get_option( $section );
 
    if ( isset( $options[$option] ) ) {
        return $options[$option];
    }
 
    return $default;
}

//add_action('wp_footer','gs_ls_slider_trigger');

function gs_ls_slider_trigger(){

	$gs_l_ctrl = gs_l_get_option( 'gs_l_ctrl', 'gs_l_control', 'on' );
	$gs_l_ctrl = ($gs_l_ctrl === 'off' ? 0 : 1);
	$gs_l_slide_speed = gs_l_get_option( 'gs_l_slide_speed', 'gs_l_general', '500' );
	$gs_l_inf_loop = gs_l_get_option( 'gs_l_inf_loop', 'gs_l_general', 'on' );
	$gs_l_inf_loop = ($gs_l_inf_loop === 'off' ? 0 : 1);
	$gs_l_move_logo = gs_l_get_option( 'gs_l_move_logo', 'gs_l_styling', '1' );
	$gs_l_max_logo = gs_l_get_option( 'gs_l_max_logo', 'gs_l_styling', '5' );
	$gs_l_min_logo = gs_l_get_option( 'gs_l_min_logo', 'gs_l_styling', '1' );
?>
<script type="text/javascript">
jQuery(document).ready(function(){
  jQuery('.gs_logo_container').bxSlider({
  	slideWidth: 200,
    minSlides: <?php echo $gs_l_min_logo;?>,
    maxSlides: <?php echo $gs_l_max_logo;?>,
    slideMargin: 10,
  	moveSlides:  <?php echo $gs_l_move_logo;?>,
  	speed: <?php echo $gs_l_slide_speed;?>,
  	controls: <?php echo $gs_l_ctrl;?>,
  	autoHover: true,
  	pager: false,
  	auto: <?php echo $gs_l_inf_loop;?>
  });
 
});
</script>
<?php
}


// ---------- Shortcode [gs_logo] -------------

add_shortcode( 'gs_logo', 'gs_logo_shortcode' );

function gs_logo_shortcode( $atts ) {

	$gs_l_title = gs_l_get_option( 'gs_l_title', 'gs_l_control', 'no' );
	$gs_l_theme = gs_l_get_option( 'gs_l_theme', 'gs_l_general', 'slider1' );
	$gs_l_max_logo = gs_l_get_option( 'gs_l_max_logo', 'gs_l_styling', '5' );
	$gs_l_min_logo = gs_l_get_option( 'gs_l_min_logo', 'gs_l_styling', '1' );
	$gs_l_ctrl = gs_l_get_option( 'gs_l_ctrl', 'gs_l_control', 'on' );
	$gs_l_ctrl = ($gs_l_ctrl === 'off' ? 0 : 1);
	$gs_l_slide_speed = gs_l_get_option( 'gs_l_slide_speed', 'gs_l_general', '500' );
	$gs_l_inf_loop = gs_l_get_option( 'gs_l_inf_loop', 'gs_l_general', 'on' );
	$gs_l_inf_loop = ($gs_l_inf_loop === 'off' ? 0 : 1);
	$gs_l_move_logo = gs_l_get_option( 'gs_l_move_logo', 'gs_l_styling', '1' );

	extract(shortcode_atts( 
			array(
			'posts' 	=> 20,
			'order'		=> 'DESC',
			'orderby'   => 'date',
			'title'		=> $gs_l_title,
			'theme'		=> $gs_l_theme,
			'speed'		=> $gs_l_slide_speed,
			'inf_loop'	=> $gs_l_inf_loop,
			// 'theme'		=> $gs_l_theme,
			'max_logo'  => $gs_l_max_logo
			), $atts 
		));

	$gsl = new WP_Query(
	array(
		'post_type'	=> 'gs-logo-slider',
		'order'		=> $order,
		'orderby'	=> $orderby,
		'posts_per_page'	=> $posts
		)
	);

	$output = '';
        $output .= '<div class="gs_logo_area '.$theme.'">';

	        if ( $theme == 'slider1') {
	            include GSL_FILES_DIR . '/includes/templates/gsl_theme1_slider1.php';
	        }
	        
	        if ( $theme == 'grid1') {
	            include GSL_FILES_DIR . '/includes/templates/gsl_theme_grid1.php';
	        }
	       
	        if ( $theme == 'list1') {
	            include GSL_FILES_DIR . '/includes/templates/gsl_theme1_list1.php';
	        }
	           
	        if ( $theme == 'table1') {
	            include GSL_FILES_DIR . '/includes/templates/gsl_theme_table1.php';
	        } 

        $output .= '</div>'; // end wrap
    return $output;	
}


function logo_gutenberg_boilerplate_block() {

    if ( !function_exists( 'register_block_type' ) ) {
		return;
	}

    wp_register_script(
        'gs-logo-gutenberg-editor_scripts',
        GSL_FILES_URI . '/admin/js/gsl.block.js',
        array( 'wp-blocks', 'wp-components', 'wp-element', 'wp-i18n', 'wp-editor' )
    );
    register_block_type( 'gs-logo/shortcode-script', array(
        'editor_script' => 'gs-logo-gutenberg-editor_scripts',
    ));
    register_block_type( 'gs-logo/shortcodeblock', array(
    'render_callback' => 'gs_logo_gutenberg_render'
	));
}
add_action( 'init', 'logo_gutenberg_boilerplate_block' );

function gs_logo_gutenberg_render( $attributes ) {  
    $themes =isset( $attributes['themes'] )? $attributes['themes']: 'slider1';
    $Speed = isset( $attributes['Speed']) ? $attributes['Speed']:'500';
    $numb = isset( $attributes['numberAttribute']) ? $attributes['numberAttribute']:10;
    $ordersby = isset( $attributes['ordersby']) ? $attributes['ordersby']:'date';
    $orders = isset( $attributes['orders']) ? $attributes['orders']:'DESC';
    $title = isset( $attributes['title']) && $attributes['title']==1  ? 'yes': ' ';
    $inf_loop = isset( $attributes['inf_loop']) && $attributes['inf_loop']==1  ? 1:0;
   
    return '[gs_logo theme="'.$themes.'" speed="'.$Speed.'" title="'.$title.'" orderby="'.$ordersby.'" order="'.$orders.'" posts="'.$numb.'" inf_loop="'.$inf_loop.'"]';
}