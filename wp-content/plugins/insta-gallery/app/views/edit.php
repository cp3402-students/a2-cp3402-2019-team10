<?php
if (! defined('ABSPATH')) {
    die();
}
global $insgalleryIAC;
$InstaGalleryItem = null;
if (isset($_GET['ig_item']) && ! empty($_GET['ig_item'])) {
    $ig_item_id = (int) $_GET['ig_item'];
    $InstaGalleryItems = get_option('insta_gallery_items');
    if (isset($InstaGalleryItems[$ig_item_id])) {
        $InstaGalleryItem = $InstaGalleryItems[$ig_item_id];
        $InstaGalleryItem['ig_item_id'] = $ig_item_id;
    }
}

$active_username = true;
$active_tag = false;
if (isset($InstaGalleryItem['ig_select_from'])) {
    if ($InstaGalleryItem['ig_select_from'] != 'username') {
        $active_username = false;
        $active_tag = true;
    }
}

$active_gallery = true;
$active_carousel = false;
if (isset($InstaGalleryItem['ig_display_type'])) {
    if ($InstaGalleryItem['ig_display_type'] == 'carousel') {
        $active_gallery = false;
        $active_carousel = true;
    }
}

?>
<p>
	<a href="<?php echo INSGALLERY_URL_ADMIN_PAGE; ?>" title="<?php _e('View Galleries List','insta-gallery'); ?>" class="ig-btn"><span
		class="dashicons dashicons-arrow-left-alt"></span><?php _e('Back to List','insta-gallery'); ?></a>
</p>

<!-- Fix: Exifography plugin drag-n-drop rows issue -->
<div class="form-table"></div>

<div class="form-table"></div>
<!-- Exifography sortable fix  -->
<form method="post" id="ig-form-update" action="<?php if(empty($InstaGalleryItem))  echo INSGALLERY_URL_ADMIN_PAGE; ?>">
	<table class="form-table ig-table-edit">
		<tbody>
			<tr>
				<th scope="row"><?php _e('Display Instagram Gallery from','insta-gallery'); ?>:</th>
				<td>
					<ul class="ig-list-buttons">
						<li><input type="radio" id="ig_select_from-username" name="ig_select_from" value="username" <?php if($active_username) echo 'checked';?> /><label
							for="ig_select_from-username"><?php _e('My Account','insta-gallery'); ?></label>
							<div class="check"></div></li>
						<li><input type="radio" id="ig_select_from-tag" name="ig_select_from" value="tag" <?php if($active_tag) echo 'checked';?> /> <label
							for="ig_select_from-tag"><?php _e('Tagname','insta-gallery'); ?></label>
							<div class="check"></div></li>
					</ul> <span class="description"> (<?php _e('Please select option to display pictures from Instagram Username OR # Tag.','insta-gallery'); ?>)</span>

				</td>
			</tr>
			<tr id="ig-select-username-wrap" class="ig-tab-content-row <?php if($active_username) echo 'active';?>">
				<td colspan="100%">
					<table>
						<tr>
							<th scope="row"><?php _e('Instagram Username','insta-gallery'); ?>:</th>
							<td> 
							<?php if(empty($insgalleryIAC['access_token'])): ?>
								<p class="ig-thm-color">
									<strong><?php _e('No Instagram account connected. please connect an account with the website to access Instagram media.','insta-gallery'); ?></strong></strong>
								</p>
								<input name="insta_user" type="hidden" value="nousername" readonly />
							<?php    
							else :
								$profileInfo = igf_getUserProfileInfo();
								$username = empty($profileInfo['username']) ? 'nousername' : $profileInfo['username'];
								?>
								<input name="insta_user" type="text" placeholder="myusername" value="<?php echo $username; ?>" readonly /> <span class="description"></span>
									<p class="ig-generate-msgs"><?php _e('Please enter Instagram Username.','insta-gallery'); ?></p>
							<?php endif; ?>
								</td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Pictures Limit','insta-gallery'); ?>:</th>
							<td><input name="insta_user-limit" type="number" min="1" max="50"
								value="<?php if(!empty($InstaGalleryItem['insta_user-limit'])){echo $InstaGalleryItem['insta_user-limit']; } else {echo '12'; }?>" /> <span
								class="description"><?php _e('number of pictures to display','insta-gallery'); ?></span></td>
						</tr>
					</table>
				</td>
			</tr>
			<tr id="ig-select-tag-wrap" class="ig-tab-content-row  <?php if($active_tag) echo 'active';?>">
				<td colspan="100%">
					<table>
						<tr>
							<th scope="row"><?php _e('Instagram Tagname','insta-gallery'); ?>:</th>
							<td><input name="insta_tag" type="text" placeholder="beautiful"
								value="<?php if(!empty($InstaGalleryItem['insta_tag'])){echo $InstaGalleryItem['insta_tag']; }?>" /> <span class="description">e.g. <strong
									style="font-size: 120%; color: #e23565;">beautiful</strong><br /> <small>https://www.instagram.com/explore/tags/<strong
										style="font-size: 120%; color: #e23565;">beautiful</strong>/
								</small>
							</span>
								<p class="ig-generate-msgs"><?php _e('Please enter Instagram Tagname.','insta-gallery'); ?></p></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Pictures Limit','insta-gallery'); ?>:</th>
							<td><input name="insta_tag-limit" type="number" min="1" max="30"
								value="<?php if(!empty($InstaGalleryItem['insta_tag-limit'])){echo $InstaGalleryItem['insta_tag-limit']; } else {echo '12'; }?>" /> <span
								class="description"><?php _e('number of pictures to display.','insta-gallery'); ?></span></td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php _e('Show As','insta-gallery'); ?>:</th>
				<td>
					<ul class="ig-list-buttons">
						<li><input type="radio" id="ig_display_type-gallery" name="ig_display_type" value="gallery" <?php if($active_gallery) echo 'checked';?> /><label
							for="ig_display_type-gallery"><?php _e('Gallery','insta-gallery'); ?></label>
							<div class="check"></div></li>
						<li><input type="radio" id="ig_display_type-carousel" name="ig_display_type" value="carousel" <?php if($active_carousel) echo 'checked';?> /><label
							for="ig_display_type-carousel"><?php _e('Carousel','insta-gallery'); ?></label>
							<div class="check"></div></li>
					</ul>
				</td>
			</tr>
			<tr id="ig-section-as-galllery" class="ig-tab-content-row <?php if($active_gallery) echo 'active';?>">
				<td colspan="100%">
					<p>
						<strong><?php _e('Pictures will be displayed as Grid.','insta-gallery'); ?></strong>
					</p>
					<table>
						<tr>
							<th scope="row"><?php _e('No. of Grid Columns','insta-gallery'); ?>:</th>
							<td><input name="insta_gal-cols" type="number" min="1" max="20"
								value="<?php if(!empty($InstaGalleryItem['insta_gal-cols'])){echo $InstaGalleryItem['insta_gal-cols']; } else {echo 3;}?>" /> <span
								class="description"><?php _e('number of pictures in a row','insta-gallery'); ?>. </span></td>
							<td rowspan="3"><img src="<?php echo INSGALLERY_URL; ?>/assets/media/demo-gallery.jpg" alt="demo gallery" width="500" /></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Image hover effect','insta-gallery'); ?>:</th>
							<td><input name="insta_gal-hover" type="checkbox" value="1"
								<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_gal-hover'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('mouseover animation effect on image','insta-gallery'); ?> </span></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Space between images','insta-gallery'); ?>:</th>
							<td><input name="insta_gal-spacing" type="checkbox" value="1"
								<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_gal-spacing'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('add blank space between images','insta-gallery'); ?> </span></td>
						</tr>
					</table>
				</td>
			</tr>
			<tr id="ig-section-as-carousel" class="ig-tab-content-row <?php if($active_carousel) echo 'active';?>">
				<td colspan="100%">
					<p>
						<strong><?php _e('Pictures will be displayed as Carousel slider.','insta-gallery'); ?></strong>
					</p>
					<table>
						<tr>
							<th scope="row"><?php _e('Slides per view','insta-gallery'); ?>:</th>
							<td><input name="insta_car-slidespv" type="number" min="1" max="10"
								value="<?php if(!empty($InstaGalleryItem['insta_car-slidespv'])){echo $InstaGalleryItem['insta_car-slidespv']; } else {echo 5;}?>" /> <span
								class="description"><?php _e('display number of pictures per slide view.','insta-gallery'); ?> </span></td>
							<td rowspan="5"><img src="<?php echo INSGALLERY_URL; ?>/assets/media/demo-carousel.jpg" alt="demo carousel" width="500" /></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Autoplay','insta-gallery'); ?>:</th>
							<td><input name="insta_car-autoplay" type="checkbox" value="1"
								<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_car-autoplay'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('autoplay carousel items.','insta-gallery'); ?> </span></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Autoplay Interval','insta-gallery'); ?>:</th>
							<td><input name="insta_car-autoplay-interval" type="number" min="1000" max="300000" step="100"
								value="<?php if(!empty($InstaGalleryItem['insta_car-autoplay-interval'])){echo $InstaGalleryItem['insta_car-autoplay-interval']; } else {echo 3000;}?>" />
								<span class="description"><?php _e('moves to next picture after specified time interval.','insta-gallery'); ?> <br />( <span
									class="ig-thm-color"><?php _e('Interval is in milliseconds','insta-gallery'); ?>
						</span> ) </span></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Navigation arrows','insta-gallery'); ?>:</th>
							<td><input name="insta_car-navarrows" type="checkbox" value="1"
								<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_car-navarrows'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('show prev-next navigation arrows.','insta-gallery'); ?> </span></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Navigation arrows color','insta-gallery'); ?>:</th>
							<td><input id="insta_car-navarrows-color-choose" type="color"
								value="<?php echo (!empty($InstaGalleryItem['insta_car-navarrows-color']) ? $InstaGalleryItem['insta_car-navarrows-color'] : '#c32a67'); ?>" />
								<input name="insta_car-navarrows-color" type="text" placeholder="#c32a67"
								value="<?php echo (!empty($InstaGalleryItem['insta_car-navarrows-color']) ? $InstaGalleryItem['insta_car-navarrows-color'] : ''); ?>" /> <span
								class="description"><?php _e('change navigation arrows color here.','insta-gallery'); ?></span></td>
						</tr>


						<!-- 
						<tr>
							<th scope="row"><?php _e('Dotted navigation','insta-gallery'); ?>:</th>
							<td><input name="insta_car-dots" type="checkbox" value="1" <?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_car-dots'])) ? '' : 'checked'; ?> /> <span
								class="description"><?php _e('show dotted navigation buttons.','insta-gallery'); ?><br />( <span class="ig-thm-color"><strong><?php
        _e('Deprecated: this option will be removed in the future updates.', 'insta-gallery');
        ?></strong></span> )</span></td>
						</tr>
						 -->


						<tr>
							<th scope="row"><?php _e('Space between slides','insta-gallery'); ?>:</th>
							<td><input name="insta_car-spacing" type="checkbox" value="1"
								<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_car-spacing'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('add blank space between carousel items.','insta-gallery'); ?> </span></td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<th scope="row"><?php _e('Images thumbnail size','insta-gallery'); ?>:</th>
				<td><select name="insta_thumb-size">
						<option value="standard"><?php _e('Standard','insta-gallery'); ?> (640 x auto)</option>
						<option value="medium" <?php echo (isset($InstaGalleryItem['insta_thumb-size']) && ($InstaGalleryItem['insta_thumb-size'] == 'medium')) ? 'selected' : ''; ?>><?php _e('Medium','insta-gallery'); ?> (320 x auto)</option>
						<option value="small"
							<?php echo (isset($InstaGalleryItem['insta_thumb-size']) && ($InstaGalleryItem['insta_thumb-size'] == 'small')) ? 'selected' : ''; ?>><?php _e('Small','insta-gallery'); ?> (150
					x 150)</option>
				</select></td>
			</tr>
			<tr>
				<th scope="row"><?php _e('Images hover effect color','insta-gallery'); ?>:</th>
				<td><input id="insta_hover-color-choose" type="color"
					value="<?php echo (!empty($InstaGalleryItem['insta_hover-color']) ? $InstaGalleryItem['insta_hover-color'] : '#007aff'); ?>" /> <input
					name="insta_hover-color" type="text" placeholder="#007aff"
					value="<?php echo (!empty($InstaGalleryItem['insta_hover-color']) ? $InstaGalleryItem['insta_hover-color'] : ''); ?>" /> <span
					class="description"><?php _e('select color which is displayed when hovered over images.','insta-gallery'); ?><br />( <span class="ig-thm-color"><?php _e('color name should be in Hexadecimal notation. e.g. #dddddd','insta-gallery'); ?>
						</span> ) </span></td>
			</tr>
			<tr>
				<th scope="row"><?php _e('Popup images on click','insta-gallery'); ?>:</th>
				<td><input name="insta_gal-popup" type="checkbox" value="1"
					<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_gal-popup'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('show popup gallery by clicking on image thumbnail. else it will open Instagram page.','insta-gallery'); ?> <br />(
						<span class="ig-thm-color"><?php
    _e('uncheck this if it conflicts with other plugins, like: fancybox, prettyphoto, elementor etc.', 'insta-gallery');
    ?></span> ) </span></td>
			</tr>
			<tr hidden>
				<th scope="row"><?php _e('Display image caption','insta-gallery'); ?>:</th>
				<td><input name="insta_popup-caption" type="checkbox" readonly value="1"
					<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_popup-caption'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('Display caption/tags below images when popup.','insta-gallery'); ?><br />(
						<span class="ig-thm-color"><strong><?php
    _e('Deprecated: this option will be removed in the future updates.', 'insta-gallery');
    ?></strong></span> ) </span></td>
			</tr>
			<tr>
				<th scope="row"><?php _e('Display Likes','insta-gallery'); ?>:</th>
				<td><input name="insta_likes" type="checkbox" value="1"
					<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_likes'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('display likes count of images.','insta-gallery'); ?> </span></td>
			</tr>
			<tr>
				<th scope="row"><?php _e('Display Comments','insta-gallery'); ?>:</th>
				<td><input name="insta_comments" type="checkbox" value="1"
					<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_comments'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('display comments count of images.','insta-gallery'); ?> </span></td>
			</tr>
			<tr>
				<th scope="row"><?php _e('Display Instagram Link Button','insta-gallery'); ?>:</th>
				<td><input name="insta_instalink" type="checkbox" value="1"
					<?php echo (isset($InstaGalleryItem) && empty($InstaGalleryItem['insta_instalink'])) ? '' : 'checked'; ?> /> <span class="description"><?php _e('show the button to open Instagram site link','insta-gallery'); ?> </span></td>
			</tr>
			<tr id="ig-section-igbtn"
				class="ig-tab-content-row <?php if(isset($InstaGalleryItem) && !empty($InstaGalleryItem['insta_instalink'])) echo 'active';?>">
				<td colspan="100%">
					<table>
						<tr>
							<th scope="row"><?php _e('Instagram Button Text','insta-gallery'); ?>:</th>
							<td><input name="insta_instalink-text" type="text" placeholder="view on Instagram"
								value="<?php if(!empty($InstaGalleryItem['insta_instalink-text'])){echo $InstaGalleryItem['insta_instalink-text']; }?>" /> <span
								class="description"><?php _e('update Instagram button text here.','insta-gallery'); ?></span></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Button Background Color','insta-gallery'); ?>:</th>
							<td><input id="insta_instalink-bgcolor-choose" type="color"
								value="<?php echo (!empty($InstaGalleryItem['insta_instalink-bgcolor']) ? $InstaGalleryItem['insta_instalink-bgcolor'] : '#c32a67'); ?>" /> <input
								name="insta_instalink-bgcolor" type="text" placeholder="#c32a67"
								value="<?php echo (!empty($InstaGalleryItem['insta_instalink-bgcolor']) ? $InstaGalleryItem['insta_instalink-bgcolor'] : ''); ?>" /> <span
								class="description"><?php _e('color which is displayed on button background.','insta-gallery'); ?></span></td>
						</tr>
						<tr>
							<th scope="row"><?php _e('Button Hover Color','insta-gallery'); ?>:</th>
							<td><input id="insta_instalink-hvrcolor-choose" type="color"
								value="<?php echo (!empty($InstaGalleryItem['insta_instalink-hvrcolor']) ? $InstaGalleryItem['insta_instalink-hvrcolor'] : '#da894a'); ?>" />
								<input name="insta_instalink-hvrcolor" type="text" placeholder="#da894a"
								value="<?php echo (!empty($InstaGalleryItem['insta_instalink-hvrcolor']) ? $InstaGalleryItem['insta_instalink-hvrcolor'] : ''); ?>" /> <span
								class="description"><?php _e('color which is displayed when hovered over button.','insta-gallery'); ?></span></td>
						</tr>
					</table>
				</td>
			</tr>
		</tbody>
	</table>
	<div>
		<button class="button-primary ig-add-update" type="submit">
			<?php _e('Update','insta-gallery'); ?> 
		</button>
		<p class="description"><?php _e('update settings and copy/paste generated shortcode in your post/pages or goto Widgets and use Instagram Gallery widget.','insta-gallery'); ?></p>
	</div>
	<input type="hidden" name="ig-form-update" value="true" />
	<input type="hidden" name="ig_nonce" value="<?php echo wp_create_nonce( 'igfreq_nonce_key' ); ?>" />
	<?php if(!empty($InstaGalleryItem['ig_item_id'])) {?>
		<input type="hidden" name="igitem_id" value="<?php echo $InstaGalleryItem['ig_item_id']; ?>" />
	<?php } ?>
</form>
<script>
    jQuery(document).ready(function($){
        // by username/tag toggle
    	$('input[name="ig_select_from"]').on('change',function(){
			if(this.value == 'username'){
				$('#ig-select-tag-wrap').hide(500, function() {
					$('#ig-select-username-wrap').show( ).addClass('active');
				}).removeClass('active');
				}else{
				$('#ig-select-username-wrap').hide(500, function() {
					$('#ig-select-tag-wrap').show( ).addClass('active');
				}).removeClass('active');
			}				
		});
		
        // gallery, carousel toggle
        $('input[name="ig_display_type"]').on('change',function(){
            
			if(this.value == 'gallery'){
				$('#ig-section-as-carousel').hide(500, function() {
					$('#ig-section-as-galllery').show(  ).addClass('active');
				}).removeClass('active');
				}else if(this.value == 'carousel'){
				$('#ig-section-as-galllery').hide(500, function() {
					$('#ig-section-as-carousel').show( ).addClass('active');
				}).removeClass('active');
			}
			
		});
        
        $('#ig-form-update').on('submit',function(ev){
            var select_from = $('input[name="ig_select_from"]:checked').val(); 
            var $insta_user = $('input[name="insta_user"]');
            var $insta_tag = $('input[name="insta_tag"]');
            var valid = true;
            if(select_from == 'username'){
            	if($insta_user.val() == ''){
                	valid = false;
            		$('#ig-select-username-wrap').addClass('error');
					}else{
            		if ($insta_user.val().indexOf("instagram.com/") >= 0){
						alert('Please enter username only(e.g. myusername), do not enter the complete url.');
						$insta_user.focus();
						return false;
					}
				}
				}else  if(select_from == 'tag'){
                if($insta_tag.val() == ''){
            		valid = false;
            		$('#ig-select-tag-wrap').addClass('error');
					}else{
                	if ($insta_tag.val().indexOf("instagram.com/") >= 0){
						alert('Please enter tagname only(e.g. beautiful), do not enter the complete url.');
						$insta_tag.focus();
						return false;
					}
				}
			}
            if( !valid ){
            	
            	setTimeout(function(){$('#ig-select-tag-wrap,#ig-select-username-wrap').removeClass('error');},5000);
                $('html, body').animate({
        	        scrollTop: 100
				}, 500);
                ev.preventDefault();
    			return false;
			} 
		});
		
        // gallery color sync
        $('#insta_hover-color-choose').on('change',function(){
			$('input[name="insta_hover-color"]').val($(this).val());
		});
        $('input[name="insta_hover-color"]').on('change',function(){
            var hvcolor = $(this).val();
            if(hvcolor != ''){
                var isOk  = /^#[0-9A-F]{6}$/i.test(hvcolor);
                if(!isOk){
    				alert('please enter valid color code');
    				$(this).val('');
    				return;
				}
                $('#insta_hover-color-choose').val($(this).val());
				}else {
            	$('#insta_hover-color-choose').val('#007aff');
			}			
		});
		
        // instagram link button toggle
        $('input[name="insta_instalink"]').on('change',function(){
        	if(this.checked){
            	$('#ig-section-igbtn').show('slow').addClass('active');
				}else{
            	$('#ig-section-igbtn').hide('slow').removeClass('active');
			}
		});
		
        // nav arrows color sync
        $('#insta_car-navarrows-color-choose').on('change',function(){
			$('input[name="insta_car-navarrows-color"]').val($(this).val());
		});
        $('input[name="insta_car-navarrows-color"]').on('change',function(){
            var hvcolor = $(this).val();
            if(hvcolor != ''){
                var isOk  = /^#[0-9A-F]{6}$/i.test(hvcolor);
                if(!isOk){
    				alert('please enter valid color code');
    				$(this).val('');
    				return;
				}
                $('#insta_car-navarrows-color-choose').val($(this).val());
				}else {
            	$('#insta_car-navarrows-color-choose').val('#c32a67');
			}			
		});
		
		
        // button bgcolor sync
        $('#insta_instalink-bgcolor-choose').on('change',function(){
			$('input[name="insta_instalink-bgcolor"]').val($(this).val());
		});
        $('input[name="insta_instalink-bgcolor"]').on('change',function(){
            var hvcolor = $(this).val();
            if(hvcolor != ''){
                var isOk  = /^#[0-9A-F]{6}$/i.test(hvcolor);
                if(!isOk){
    				alert('please enter valid color code');
    				$(this).val('');
    				return;
				}
                $('#insta_instalink-bgcolor-choose').val($(this).val());
				}else {
            	$('#insta_instalink-bgcolor-choose').val('#c32a67');
			}			
		});
		
        // button hover color sync
        $('#insta_instalink-hvrcolor-choose').on('change',function(){
			$('input[name="insta_instalink-hvrcolor"]').val($(this).val());
		});
        $('input[name="insta_instalink-hvrcolor"]').on('change',function(){
            var hvcolor = $(this).val();
            if(hvcolor != ''){
                var isOk  = /^#[0-9A-F]{6}$/i.test(hvcolor);
                if(!isOk){
    				alert('please enter valid color code');
    				$(this).val('');
    				return;
				}
                $('#insta_instalink-hvrcolor-choose').val($(this).val());
				}else {
            	$('#insta_instalink-hvrcolor-choose').val('#da894a');
			}			
		});
	});
</script>