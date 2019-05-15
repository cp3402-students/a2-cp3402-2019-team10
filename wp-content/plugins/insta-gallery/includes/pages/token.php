<?php
if (!defined('ABSPATH'))
  exit;

if (isset($_GET['code']) && isset($_GET['igigresponse'])) {
  if ($message = $qligg_api->get_message()) {
    ?>
    <script>
      (function ($) {
        alert("<?php echo esc_html($message); ?>");
      })(jQuery);
    </script>
    <?php
  }
}
?>
<div class="ig-account-section">
  <?php if (empty($qligg['access_token'])): ?>
    <?php
    $ig_client_id = isset($qligg['client_id']) ? trim($qligg['client_id']) : '';
    $ig_client_secret = isset($qligg['client_secret']) ? trim($qligg['client_secret']) : '';
    ?>
    <div class="ig-account-cards">
      <form method="post" class="ig-account-card" id="ig-generate-token">
        <h4><?php _e('Generate new access token', 'insta-gallery'); ?></h4>
        <p class="field-item">
          <input name="ig_client_id" type="text" maxlength="200" placeholder="<?php _e('Instagram Client ID', 'insta-gallery'); ?>" value="<?php echo esc_attr($ig_client_id); ?>" required />
        </p>
        <p class="field-item">
          <input name="ig_client_secret" type="text" maxlength="200" placeholder="<?php _e('Instagram Client Secret', 'insta-gallery'); ?>" value="<?php echo esc_html($ig_client_secret); ?>" required />
        </p>
        <span class="spinner"></span>
        <button type="submit" class="btn-instagram secondary"><?php _e('Generate Token', 'insta-gallery'); ?></button>
        <a href="<?php echo admin_url('admin.php?page=qligg_documentation'); ?>" class="btn-instagram"><?php _e('Instructions', 'insta-gallery'); ?></a>
        <?php wp_nonce_field('igara_generate_token', 'ig_nonce'); ?>
      </form>
      <form method="post" class="ig-account-card" id="ig-update-token">
        <h4><?php _e('Already have access token?', 'insta-gallery'); ?></h4>
        <p class="field-item">
          <input name="ig_access_token" type="text" maxlength="200" placeholder="<?php _e('Enter a valid Access Token', 'insta-gallery'); ?>" required />
        </p>
        <span class="spinner"></span>
        <button type="submit" class="btn-instagram secondary"><?php _e('Update Token', 'insta-gallery'); ?></button>
        <?php wp_nonce_field('igara_update_token', 'ig_nonce'); ?>
      </form>
    </div>					
  <?php else: ?>
    <div class="ig-account-cards ig-ac-have-token">
      <?php
      $token = filter_var($qligg['access_token'], FILTER_SANITIZE_STRING);
      $profile_info = qligg_get_user_profile_info();
      ?>
      <?php if ($profile_info): ?>
        <div class="ig-account-card">
          <figure>
            <img src="<?php echo esc_url($profile_info['profile_picture']); ?>" width="150" />
            <figcaption>
              <?php echo esc_html($profile_info['full_name']); ?>
            </figcaption>
          </figure>
        </div>
      <?php endif; ?>
      <form method="post" class="ig-account-card" id="ig-remove-token">
        <p class="field-item">
        <h4><?php _e('Active access token', 'insta-gallery'); ?></h4>
        <input name="ig_access_token" type="text" maxlength="200" value="<?php echo esc_attr($token); ?>" readonly />
        </p>
        <span class="spinner"></span>
        <button type="submit" class="btn-instagram"><?php _e('Remove Token', 'insta-gallery'); ?></button>
        <?php wp_nonce_field('igara_remove_token', 'ig_nonce'); ?>
        <p>
          <?php _e('This will remove access token and client secret', 'insta-gallery'); ?>
        </p>
      </form>
    </div>
  <?php endif;
  ?>			
</div>
<div class="ig_donation-wrap ig-thm-color">
  <p>
    <span class="ig_donation_text"><?php _e('Please Donate now to support the Maintainance and Advancement of this plugin.', 'insta-gallery'); ?>
      <br />
      <?php _e('Thank you so much to each and everyone who has already supported me.', 'insta-gallery'); ?>
    </span> 
    <a class="ig_donation_btn" href="https://www.paypal.me/karanpay" target="_blank">
      <img src="<?php echo plugins_url('/assets/img/paypal-logo.svg', QLIGG_PLUGIN_FILE); ?>" class="ig-logo" />
    </a>
  </p>
</div>