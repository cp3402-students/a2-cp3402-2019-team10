<?php
if (! defined('ABSPATH')) {
    die();
}

$InstaGalleryItems = get_option('insta_gallery_items');
$InstaGallerySetting = get_option('insta_gallery_setting');
?>

<p>
	<a href="<?php echo INSGALLERY_URL_ADMIN_PAGE; ?>&tab=edit" title="<?php _e('Add New Gallery','insta-gallery'); ?>" class="ig-btn"><span
		class="dashicons dashicons-plus"></span><?php _e('Add New Gallery','insta-gallery'); ?></a>
</p>


<?php if( !empty($InstaGalleryItems) && is_array($InstaGalleryItems) ){  ?>
<div>
	<table class="widefat ig-gallery-list">
		<thead>
			<tr>
				<th></th>
				<th><?php _e('Gallery Item','insta-gallery'); ?></th>
				<th><?php _e('Shortcode','insta-gallery'); ?></th>
				<th><?php _e('Action','insta-gallery'); ?></th>
			</tr>
		</thead>
		<tbody>
		<?php $i = 1; foreach($InstaGalleryItems as $k => $IGItem){ ?>
		<tr>
				<td><?php echo $i++; ?></td>
				<td>
			<?php
        
        if ($IGItem['ig_select_from'] == 'username') {
            echo __('Username', 'insta-gallery') . ' / ' . $IGItem['insta_user'];
        } else {
            echo __('Tagname', 'insta-gallery') . ' / ' . $IGItem['insta_tag'];
        }
        ?>
			</td>
				<td><input type="text" onclick="select()" value='[insta-gallery id="<?php echo $k; ?>"]' readonly /></td>
				<td><a href="<?php echo INSGALLERY_URL_ADMIN_PAGE; ?>&tab=edit&ig_item=<?php echo $k; ?>" class="ig-btn"><span class="dashicons dashicons-edit"></span><?php _e('Edit','insta-gallery'); ?> </a>
					<a href="<?php echo INSGALLERY_URL_ADMIN_PAGE; ?>&ig_item_delete=<?php echo $k; ?>" class="ig-btn" onclick="return ig_item_delete();"><span
						class="dashicons dashicons-trash"></span><?php _e('Delete','insta-gallery'); ?></a></td>
			</tr>
		<?php } unset($i); ?>
	</tbody>
	</table>
</div>
<br />
<hr />
<div id="ig_adv-setting-panel">
	<p>
		<button class="ig_adv-setting-toggle ig-btn">
			<span class="dashicons dashicons-plus"></span><span class="dashicons dashicons-minus"></span><?php _e('Additional Setting','insta-gallery'); ?>
		</button>
	</p>
	<div class="ig_adv-setting">
		<form method="post">
			<table class="widefat">
				<tbody>
					<tr>
						<th><?php _e('Gallery Loader Icon','insta-gallery'); ?>:</th>
						<td>
						<?php
    $mid = '';
    $misrc = '';
    if (isset($InstaGallerySetting['igs_spinner_image_id'])) {
        $mid = $InstaGallerySetting['igs_spinner_image_id'];
        $image = wp_get_attachment_image_src($mid);
        if ($image) {
            $misrc = $image[0];
        }
    }
    ?>
						<input type="hidden" name="igs_spinner_image_id" value="<?php echo $mid; ?>" data-misrc="<?php echo $misrc; ?>" />
							<button type='button' class="ig-btn" id="igs-spinner_media_manager" /><?php _e('Update Spinner','insta-gallery'); ?></button>
							<button type='button' class="ig-btn" id="igs-spinner_reset" /><?php _e('Reset Spinner','insta-gallery'); ?></button> <br /> <span
							class="description">
							<?php
    _e('please select the image from media to replace with default Gallery loader icon.', 'insta-gallery');
    ?> </span>

						</td>
						<td rowspan="2">
							<div class="ig-spinner">
								<svg version="1.1" class="ig-spin" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
									viewBox="0 0 551.034 551.034" style="enable-background: new 0 0 551.034 551.034;" xml:space="preserve">
            						<g>
                                		<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.57" x2="275.517" y2="549.72"
										gradientTransform="matrix(1 0 0 -1 0 554)">
                                			<stop offset="0" style="stop-color:#E09B3D" />
                                			<stop offset="0.3" style="stop-color:#C74C4D" />
                                			<stop offset="0.6" style="stop-color:#C21975" />
                                			<stop offset="1" style="stop-color:#7024C4" />
                                		</linearGradient>
                                		<path style="fill:url(#SVGID_1_);"
										d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722
                                		c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156
                                		C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156
                                		c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722
                                		c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z" />
                                		<linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.57" x2="275.517" y2="549.72"
										gradientTransform="matrix(1 0 0 -1 0 554)">
                                			<stop offset="0" style="stop-color:#E09B3D" />
                                			<stop offset="0.3" style="stop-color:#C74C4D" />
                                			<stop offset="0.6" style="stop-color:#C21975" />
                                			<stop offset="1" style="stop-color:#7024C4" />
                                		</linearGradient>
                                		<path style="fill:url(#SVGID_2_);"
										d="M275.517,133C196.933,133,133,196.933,133,275.516s63.933,142.517,142.517,142.517
                                		S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6c-48.095,0-87.083-38.988-87.083-87.083
                                		s38.989-87.083,87.083-87.083c48.095,0,87.083,38.988,87.083,87.083C362.6,323.611,323.611,362.6,275.517,362.6z" />
                                		<linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="418.31" y1="4.57" x2="418.31" y2="549.72"
										gradientTransform="matrix(1 0 0 -1 0 554)">
                                			<stop offset="0" style="stop-color:#E09B3D" />
                                			<stop offset="0.3" style="stop-color:#C74C4D" />
                                			<stop offset="0.6" style="stop-color:#C21975" />
                                			<stop offset="1" style="stop-color:#7024C4" />
                                		</linearGradient>
                                		<circle style="fill:url(#SVGID_3_);" cx="418.31" cy="134.07" r="34.15" />
                                	</g>
                           		</svg>
							</div>
						</td>
					</tr>
					<tr>
						<th><?php _e('Remove everything on uninstall','insta-gallery'); ?>:</th>
						<td><input type="checkbox" name="igs_flush" value="1" onclick="ig_validate_flush(this)"
							<?php if(!empty($InstaGallerySetting['igs_flush'])) echo 'checked';?> /><span class="description"> <?php _e('check this box to remove all data related to this plugin when removing the plugin.','insta-gallery'); ?> </span></td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td colspan="3"><button type="submit" class="ig-btn"><?php _e('Update','insta-gallery'); ?></button> <span class="igf-response"></span></td>
					</tr>
				</tfoot>
			</table>
			<input type="hidden" name="ig_nonce" value="<?php echo wp_create_nonce( 'igfreq_nonce_key' ); ?>" /> <input type="hidden" name="action"
				value="save_igadvs" />
		</form>
	</div>
</div>
<div class="ig_donation-wrap ig-thm-color">
	<p>
		<span class="ig_donation_text"><?php _e('Please Donate now to support the Maintainance and Advancement of this plugin.','insta-gallery'); ?>
	<br /><?php _e('Thank you so much to each and everyone who has already supported me.','insta-gallery'); ?></span> <a class="ig_donation_btn"
			href="https://www.paypal.me/karanpay" target="blank"><?php _e('Donate','insta-gallery'); ?>
			<img src="<?php echo INSGALLERY_URL; ?>/assets/media/paypal-logo.svg" class="ig-logo" /> </a>
	</p>
</div>
<?php } ?>

<script>
function ig_item_delete(){
	var c = confirm('<?php _e('Are you sure want to delete this item?','insta-gallery'); ?>');
	if(!c){
		return false;
	}	
}
function ig_change_spinner(link){
	if(link){
		if(!jQuery('.ig_adv-setting .ig-spinner img').length){
			var img = '<img src="'+link+'" class="ig-spin" />';
			jQuery('.ig_adv-setting .ig-spinner').append(img);
		}else{
			jQuery('.ig_adv-setting .ig-spinner img').attr('src',link);
		}
		jQuery('.ig_adv-setting .ig-spinner .ig-spin').hide();
		jQuery('.ig_adv-setting .ig-spinner img').show();
	} else {
		jQuery('.ig_adv-setting .ig-spinner .ig-spin').show();
		jQuery('.ig_adv-setting .ig-spinner img').remove();
	}
	
}
function ig_validate_flush(ele){
	if(ele.checked){
	var c = confirm('<?php _e('please make sure every settings will be removed on plugin uninstall.','insta-gallery'); ?>');
    	if(!c){
    		ele.checked = false;
    	}
	}
}
jQuery(function($){
	var $igs_image_id = jQuery('input[name="igs_spinner_image_id"]');
	var $igs_reset = jQuery('#igs-spinner_reset');
	
	$('.ig_adv-setting input[name="igs-spinner"]').trigger('change');
    jQuery('.ig_adv-setting-toggle').on('click',function(){
    	$(this).toggleClass('active');
    	$('.ig_adv-setting').slideToggle();
    });
    $('.ig_adv-setting form').on('submit',function(ev){
    	ev.preventDefault();
    	$f = $(this);
    	var $fresponse = $f.find('.igf-response');
    	jQuery.ajax({
			url : ajaxurl,
			type : 'post',
            dataType: 'JSON',
			data : $f.serialize(),
			beforeSend : function()
			{
				$fresponse.empty();
			},
			success : function( response ) {
				if ((typeof response === 'object') && response.hasOwnProperty('success')) {
					$fresponse.html(response.data);
                }
			}
		}).fail(function (jqXHR, textStatus) {
            console.log(textStatus);
        }).always(function()
		{
		});
    });

	// reset spinner to default
	$igs_reset.click(function(){
		$igs_image_id.val('');
		ig_change_spinner();
		jQuery(this).hide();
	});

	if($igs_image_id.val() == '')$igs_reset.hide();
	if($igs_image_id.data('misrc') != '') ig_change_spinner($igs_image_id.data('misrc'));
	
	// select media image
    jQuery('#igs-spinner_media_manager').click(function(e) {

        e.preventDefault();
        var image_frame;
        if(image_frame){
            image_frame.open();
        }
        // Define image_frame as wp.media object
        image_frame = wp.media({
                      title: 'Select Media',
                      multiple : false,
                      library : {
                           type : 'image',
                       }
                  });

                  image_frame.on('close',function() {
                     // On close, get selections and save to the hidden input
                     // plus other AJAX stuff to refresh the image preview
                     var selection =  image_frame.state().get('selection');
                     if(selection.length){
                         var gallery_ids = new Array();
                         var i = 0,attachment_url;
                         selection.each(function(attachment) {
                            gallery_ids[i] = attachment['id'];
                            attachment_url = attachment.attributes.url;
                            i++;
                         });
                     	var ids = gallery_ids.join(",");
                     	$igs_image_id.val(ids);
                         ig_change_spinner(attachment_url)
                     }

                     // toggle reset button
                     if($igs_image_id.val() == ''){
                    	 $igs_reset.hide();
              		}else{
              			$igs_reset.show();
              		}
                     
                  });

                 image_frame.on('open',function() {
                   // On open, get the id from the hidden input
                   // and select the appropiate images in the media manager
                   var selection =  image_frame.state().get('selection');
                   ids = $igs_image_id.val().split(',');
                   ids.forEach(function(id) {
                     attachment = wp.media.attachment(id);
                     attachment.fetch();
                     selection.add( attachment ? [ attachment ] : [] );
                   });
					
                 });

               image_frame.open();
	});
});
</script>