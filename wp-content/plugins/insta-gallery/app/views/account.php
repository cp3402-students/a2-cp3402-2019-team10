<?php
if (! defined('ABSPATH')) {
    die();
}

global $insgalleryIAC;

?>

<div class="ig-account-section">
	<header>
		<h3>
			<?php _e('Instagram account connection','insta-gallery'); ?> &nbsp; &nbsp; &nbsp; <a
				href="<?php echo INSGALLERY_URL_ADMIN_PAGE; ?>&tab=documentation" target="_blank" class="button-link" style="font-size: 14px;"><?php _e('How to connect?','insta-gallery'); ?></a>
		</h3>
	</header>
	<?php 
	if(isset($_GET['code']) && isset($_GET['igigresponse'])){
	    global $iispi;
	    $msg = $iispi->getMessage();
	    if(!empty($msg)){ ?>
	        <div class="notice notice-warning">
        		<p><strong><?php echo $msg; ?></strong></p>
        	</div>
	    <?php }
	}
	?>
	<?php if(empty($insgalleryIAC['access_token'])): ?>
	<?php
    $ig_client_id = empty($insgalleryIAC['client_id']) ? '' : $insgalleryIAC['client_id'];
    $ig_client_secret = empty($insgalleryIAC['client_secret']) ? '' : $insgalleryIAC['client_secret'];
    ?>
	<div class="notice notice-warning">
		<p>
			<?php _e('No Instagram account connected. please connect an account with the website to access Instagram feed.','insta-gallery'); ?><br /> <strong
				style="font-style: italic;"><?php _e('valid Instagram access token is required to connect.','insta-gallery'); ?></strong>
		</p>
	</div>

	<div class="ig-account-cards">
		<form method="post" class="ig-account-card" id="ig-generate-token">
			<h4>Generate new access token.</h4>
			<p class="field-item">
				<input name="ig_client_id" type="text" maxlength="200" placeholder="Instagram Client ID" value="<?php echo $ig_client_id; ?>" required />
			</p>
			<p class="field-item">
				<input name="ig_client_secret" type="text" maxlength="200" placeholder="Instagram Client Secret" value="<?php echo $ig_client_secret; ?>" required />
			</p>
			<button type="submit" class="button button-primary">Generate Token</button>
			<input type="hidden" name="action" value="igara_generate_token" /> <input type="hidden" name="ig_nonce"
				value="<?php echo wp_create_nonce( 'igfreq_nonce_key' ); ?>" />
			<div class="igf-response"></div>
			<p>
				<a href="<?php echo INSGALLERY_URL_ADMIN_PAGE; ?>&tab=documentation" target="_blank" class="button-link" style="font-size: 14px;"><?php _e('click here','insta-gallery'); ?></a>
				for instructions on how to generate these credentials.
			</p>
		</form>
		<form method="post" class="ig-account-card" id="ig-update-token">
			<h4>Already have access token?</h4>
			<p class="field-item">
				<input name="ig_access_token" type="text" maxlength="200" placeholder="Enter a valid Access Token" required />
			</p>
			<button type="submit" class="button button-primary">Update Token</button>
			<div class="igf-response"></div>
			<input type="hidden" name="action" value="igara_update_token" /> <input type="hidden" name="ig_nonce"
				value="<?php echo wp_create_nonce( 'igfreq_nonce_key' ); ?>" />
		</form>
	</div>					
	<?php endif; ?>
	
	<?php if(!empty($insgalleryIAC['access_token'])): ?>
    <div class="ig-account-cards ig-ac-have-token">
	<?php
    $token = filter_var($insgalleryIAC['access_token'], FILTER_SANITIZE_STRING);
    global $iispi;
    $profileInfo = igf_getUserProfileInfo();
    ?>
    <div class="ig-account-card">
    <?php if($profileInfo): ?>
    	<figure>
				<img src="<?php echo $profileInfo['profile_picture']; ?>" width="150" />
				<figcaption>
					<strong style="color: #e23565;">Connected: </strong> <?php echo $profileInfo['full_name']; ?></figcaption>
			</figure>
    <?php  else : ?>
         <?php $msg = $iispi->getMessage();
	    if(!empty($msg)){ ?>
	        <div class="notice notice-warning">
        		<p><strong><?php echo $msg; ?></strong></p>
        	</div>
	    <?php } ?>
	<?php endif; ?>
		<div style="text-align: center;">
				<button type="submit" data-igtoggle="#ig-remove-token" class="button">Disconnect</button>
			</div>
		</div>
		<form method="post" class="ig-account-card" id="ig-remove-token">
			<p class="field-item">
				<label>Active access token:</label> <input name="ig_access_token" type="text" maxlength="200"
					value="x x x x x x <?php echo substr($token,-10); ?>" readonly />
			</p>
			<button type="submit" class="button button-primary">Remove Token</button>
			<span class="igf-response"></span> <input type="hidden" name="action" value="igara_remove_token" /> <input type="hidden" name="ig_nonce"
				value="<?php echo wp_create_nonce( 'igfreq_nonce_key' ); ?>" />

			<p>
				note: it will remove <strong>access token</strong> and <strong>client secret</strong>.
			</p>
			<p>
				you can also Login to <a href="https://www.instagram.com/developer/clients/manage/" rel="noreferrer nofollow noopener"
					target="_blank">Instagram Developer Web page</a> and can delete the registered App.
			</p>
		</form>
	</div>
	<?php endif; ?>			
	
</div>
<hr />


<script>
	jQuery(function($){	
		// update Token handling
		$('#ig-update-token').on('submit',function(ev){
			ev.preventDefault();
			$f = $(this);
			var $fresponse = $f.find('.igf-response');
			var spinner = '<span class="spinner" style="float: none; margin: 0 3px; visibility: visible;"></span>';
			jQuery.ajax({
				url : ajaxurl,
				type : 'post',
				dataType: 'JSON',
				data : $f.serialize(),
				beforeSend : function()
				{
					$fresponse.html(spinner);
				},
				success : function( response ) {
					if ((typeof response === 'object') && response.hasOwnProperty('success')) {
						$fresponse.html(response.data);
						if(response.success){
		                    setTimeout(function(){
		                    	window.location.href = window.location.href;
		                    },3000);
						}
					}else{
						$fresponse.html('invalid response.');
					}
				}
				}).fail(function (jqXHR, textStatus) {
				console.log(textStatus);
			}).always(function()
			{
				if($fresponse.find('.spinner').length){
					$fresponse.empty();
				}
			});
		});

		// generate Token handling
		$('#ig-generate-token').on('submit',function(ev){
			ev.preventDefault();
			$f = $(this);
			var $fresponse = $f.find('.igf-response');
			var spinner = '<span class="spinner" style="float: none; margin: 0 3px; visibility: visible;"></span>';
			jQuery.ajax({
				url : ajaxurl,
				type : 'post',
				dataType: 'JSON',
				data : $f.serialize(),
				beforeSend : function()
				{
					$fresponse.html(spinner);
				},
				success : function( response ) {
					if ((typeof response === 'object') && response.hasOwnProperty('success')) {
						
						if(response.success){							
		                  window.location.href = response.data;
							//$fresponse.html(response.data);
						}else{
							$fresponse.html(response.data);
						}
					}else{
						$fresponse.html('invalid response.');
					}
				}
				}).fail(function (jqXHR, textStatus) {
				console.log(textStatus);
			}).always(function()
			{
				if($fresponse.find('.spinner').length){
					$fresponse.empty();
				}
			});
		});
		
		// remove Token handling
		$('#ig-remove-token').on('submit',function(ev){
			ev.preventDefault();
			var c = confirm('<?php _e('Are you sure want to delete this Token?','insta-gallery'); ?>');
			if(!c){
				return false;
			}
			$f = $(this);
			var $fresponse = $f.find('.igf-response');
			var spinner = '<span class="spinner" style="float: none; margin: 0 3px; visibility: visible;"></span>';
			jQuery.ajax({
				url : ajaxurl,
				type : 'post',
				dataType: 'JSON',
				data : $f.serialize(),
				beforeSend : function()
				{
					$fresponse.html(spinner);
				},
				success : function( response ) {
					if ((typeof response === 'object') && response.hasOwnProperty('success')) {
						$fresponse.html(response.data);
						if(response.success){
		                    setTimeout(function(){
		                    	window.location.href = window.location.href;
		                    },3000);
						}
					}else{
						$fresponse.html('invalid response.');
					}
				}
				}).fail(function (jqXHR, textStatus) {
				console.log(textStatus);
			}).always(function()
			{
				if($fresponse.find('.spinner').length){
					$fresponse.empty();
				}
			});
		});

		// toggler
		jQuery('[data-igtoggle]').on('click',function(ev){
			var $e = $(this);
			var target = $e.data('igtoggle');
			if($(target).length){
				ev.preventDefault();
				$(target).fadeToggle();
			}
		});
	});
</script>
