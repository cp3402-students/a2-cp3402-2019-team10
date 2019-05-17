<?php 

$output .= '<div class="gs_logo_table1 gs-logos-table clearfix">';

	$output .= '<div class="gs-logos-table-row gsc-table-head">'; // start gsc-table-head
       $output .= '<div class="gs-logos-table-cell">Image</div>';
       $output .= '<div class="gs-logos-table-cell">Name</div>';
       $output .= '<div class="gs-logos-table-cell">Description</div>';
    $output .= '</div>'; // end gsc-table-head

	// The Loop
	if ( $gsl->have_posts() ) {
		while ( $gsl->have_posts() ) {
			$gsl->the_post();

				$gsl_post_id = get_the_ID();
				$gs_logo_id = get_post_thumbnail_id($gsl_post_id);
				$gs_logo_url = wp_get_attachment_image_src($gs_logo_id, 'full', true);
				$meta = get_post_meta( get_the_id() );
				// $gs_logo = aq_resize_gsl( $gs_logo_url[0], $gs_l_width, $gs_l_height, true );
				$gs_logo = $gs_logo_url[0];
				$gs_logo_alt = get_post_meta($gs_logo_id,'_wp_attachment_image_alt',true);
				$gs_logo_details = get_the_content();

			$output .= '<div class="gs-logos-table-row">'; // start gs-logos-table-row
                $output .= '<div class="gs-logos-table-cell gsc-image">';
                    if ($meta['client_url'][0]) :
				 		$output .= '<a href="'. $meta['client_url'][0] .'" target="_blank">';
				 	endif;

				 	if ($gs_logo) :
						$output .= '<img src="'.$gs_logo.'" alt="'.$gs_logo_alt.'" >';
					endif;

					if ($meta['client_url'][0]) :
						$output .= '</a>';
					endif;
                $output .= '</div>';

                $output .= '<div class="gs-logos-table-cell gsc-name">';
                    if ( $title == "yes" ) :
						$output .= '<h3 class="gs_logo_title">'. get_the_title() .'</h3>';
					endif;
                $output .= '</div>';

                $output .= '<div class="gs-logos-table-cell gsc-desc">';
                    $output.= '<div class="gs-logo-details">'. $gs_logo_details .'</div>';
                $output .= '</div>';
            $output .= '</div>'; // end gs-logos-table-row

		} // end while loop
	} else {
		$output .= "No Logo Added!";
	}
	// Restore original Post Data
	wp_reset_postdata();

$output .= '</div>';
return $output;