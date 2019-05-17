<?php 
/**
 * Adds a box to the main column on the Post and Page edit screens.
 */
function gs_logo_slider_add_meta_box() {

		add_meta_box(
			'gs_logo_slider_sectionid',
			__( "Client's URL" , 'gslogo' ),
			'gs_logo_slider_meta_box_callback',
			'gs-logo-slider'
		);
}
add_action( 'add_meta_boxes', 'gs_logo_slider_add_meta_box' );

/**
 * Prints the box content.
 * 
 * @param WP_Post $post The object for the current post/page.
 */
function gs_logo_slider_meta_box_callback( $post ) {

	// Add an nonce field so we can check for it later.
	wp_nonce_field( 'gs_logo_slider_meta_box', 'gs_logo_slider_meta_box_nonce' );

	/*
	 * Use get_post_meta() to retrieve an existing value
	 * from the database and use the value for the form.
	 */
	$value = get_post_meta( $post->ID, 'client_url', true );

	echo '<label for="gs_logo_slider_url_field">';
	_e( 'Enter Site URL', 'gslogo' );
	echo '</label> ';
	echo '<input type="text" id="gs_logo_slider_url_field" name="gs_logo_slider_url_field" value="' . esc_attr( $value ) . '" size="25" />';
}

/**
 * When the post is saved, saves our custom data.
 *
 * @param int $post_id The ID of the post being saved.
 */
function gs_logo_slider_save_meta_box_data( $post_id ) {

	/*
	 * We need to verify this came from our screen and with proper authorization,
	 * because the save_post action can be triggered at other times.
	 */

	// Check if our nonce is set.
	if ( ! isset( $_POST['gs_logo_slider_meta_box_nonce'] ) ) {
		return;
	}

	// Verify that the nonce is valid.
	if ( ! wp_verify_nonce( $_POST['gs_logo_slider_meta_box_nonce'], 'gs_logo_slider_meta_box' ) ) {
		return;
	}

	// If this is an autosave, our form has not been submitted, so we don't want to do anything.
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	// Check the user's permissions.
	if ( isset( $_POST['post_type'] ) && 'page' == $_POST['post_type'] ) {

		if ( ! current_user_can( 'edit_page', $post_id ) ) {
			return;
		}

	} else {

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
	}

	/* OK, it's safe for us to save the data now. */
	
	// Make sure that it is set.
	if ( ! isset( $_POST['gs_logo_slider_url_field'] ) ) {
		return;
	}

	// Sanitize user input.
	$gs_logo = sanitize_text_field( $_POST['gs_logo_slider_url_field'] );

	// Update the meta field in the database.
	update_post_meta( $post_id, 'client_url', $gs_logo );
}
add_action( 'save_post', 'gs_logo_slider_save_meta_box_data' );


// Ad for PRO version

function gs_logo_pro_add_meta_box() {

		add_meta_box(
			'gs_logo_sectionid_pro',
			__( "GS Logo Slider - PRO" , 'gslogo' ),
			'gs_logo_meta_box_pro',
			'gs-logo-slider'
		);
}
add_action( 'add_meta_boxes', 'gs_logo_pro_add_meta_box' );

function gs_logo_meta_box_pro() {  ?>
	
	<p>
	<h3 style="padding-left:0">Available features at GS Logo Slider - PRO</h3>
    <ol class="">
    	<li>Advance settings panel with all necessary options.</li>
		<li>Multiple sliders can be shown from different Logo categories.</li>
		<li>Slider sliding speed, autoplay pause, navigation, pagination, color settings.</li>
		<li>Display Logos horizontally or vertically.</li>
		<li>Control Logo sliding speed.</li>
		<li>Enable / disable infinite loop.</li>
		<li>Slide Logos in ticker mode (similar to news scroll).</li>
		<li>Logo grayscale feature.</li>
		<li>Logo image size control.</li>
		<li>Stop on hover control.</li>
		<li>Display Logo including / excluding Title.</li>
		<li>Specify target to load the Links</li>
		<li>Number of logos to move on transition.</li>
		<li>Tons of shortcode parameters</li>
		<li>Category wise Logos</li>
		<li>Great Settings Panel</li>
		<li>Works with any WordPress Theme.</li>
		<li>Easy and user-friendly setup.</li>
		<li>Well documentation and support.</li>
    	<li>And many more.</li>
    </ol>
  </p>
  <p><a class="button button-primary button-large" href="http://www.gsamdani.com/product/gs-logo-slider" target="_blank">Go for PRO</a></p>
<?php
}


// SIDEBAR Ad for PRO version

function gs_logo_pro_sidebar_add_meta_box() {

		add_meta_box(
			'gs_logo_sectionid_pro_sidebar',
			__( "Other Info" , 'gslogo' ),
			'gs_logo_meta_box_pro_sidebar',
			'gs-logo-slider',
			'side',
			'low'
		);
}
add_action( 'add_meta_boxes', 'gs_logo_pro_sidebar_add_meta_box' );

function gs_logo_meta_box_pro_sidebar() { ?>
	<a href="http://logo.gsamdani.com" target="_blank" style="text-decoration: none;width:97%;overflow:hidden;margin:5px;background: #ffffff;border: 1px solid #eeeeee;display: block;float: left;text-align: center;-webkit-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px; outline: 0!important;" ><h3 style="margin: 0px;background: #eeeeee;-webkit-border-top-left-radius: 3px;-webkit-border-top-right-radius: 3px;-moz-border-radius-topleft: 3px;-moz-border-radius-topright: 5px;border-top-left-radius: 3px;border-top-right-radius: 3px;padding:5px;text-decoration: none;color:#333">GS Logo Slider - DEMO</h3><img style="max-width: 100%;height:auto; border-radius: 50%; margin: 5px 0 2px;" src="<?php echo plugins_url('gs-logo-slider/gsl-files/img/gsl.png'); ?>" /></a>

	<a href="http://testimonial.gsamdani.com/" target="_blank" style="text-decoration: none;width:97%;overflow:hidden;margin:5px;background: #ffffff;border: 1px solid #eeeeee;display: block;float: left;text-align: center;-webkit-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px; outline: 0!important;" ><h3 style="margin: 0px;background: #eeeeee;-webkit-border-top-left-radius: 3px;-webkit-border-top-right-radius: 3px;-moz-border-radius-topleft: 3px;-moz-border-radius-topright: 5px;border-top-left-radius: 3px;border-top-right-radius: 3px;padding:5px;text-decoration: none;color:#333">GS Testimonial Slider - DEMO</h3><img style="max-width: 100%;height:auto; border-radius: 50%; margin: 5px 0 2px;" src="<?php echo plugins_url('gs-logo-slider/gsl-files/img/gs-testimonial-slider.png'); ?>" /></a>

	<div style="clear:both"></div>
<?php
}