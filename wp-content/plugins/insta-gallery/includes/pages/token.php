<?php
if (!defined('ABSPATH'))
  exit;
?>
<?php if (!count($qligg)) : ?>
  <div id="ig-generate-token">
    <p>
      <a class="btn-instagram" target="_self" href="https://instagram.com/oauth/authorize/?client_id=6e628e63145746bcb684912009514665&scope=basic+public_content&redirect_uri=https://instagram.quadlayers.com/index.php?return_uri=<?php echo admin_url('admin.php?page-qligg_token'); ?>&response_type=token&state=<?php echo admin_url('admin.php?page-qligg_token'); ?>&hl=en" title="<?php _e('Add New Account', 'insta-gallery'); ?>">
        <span class="dashicons dashicons-plus"></span>
        <?php _e('Add New Account', 'insta-gallery'); ?>
      </a>
      <span style="float: none; margin-top: 0;" class="spinner"></span>
      <a data-qligg-toggle="#ig-update-token" href="#"><?php _e('Button not working?', 'insta-gallery'); ?></a>
    </p>
    <form id="ig-update-token" class="qligg-box hidden" method="post">
      <h4><?php _e('Manually connect an account', 'insta-gallery'); ?></h4>
      <p class="field-item">
        <input class="widefat" name="ig_access_token" type="text" maxlength="200" placeholder="<?php _e('Enter a valid Access Token', 'insta-gallery'); ?>" required />
      </p>
      <button type="submit" class="btn-instagram secondary"><?php _e('Update', 'insta-gallery'); ?></button>    
      <span style="float: none; margin-top: 0;" class="spinner"></span>
      <a target="_blank" href="https://quadlayers.com/insta-token/"><?php _e('Get access token', 'insta-gallery'); ?></a>
      <?php wp_nonce_field('qligg_update_token', 'ig_nonce'); ?>
    </form>
  </div>
<?php endif; ?>
<?php if (count($qligg)) : ?>
  <table class="widefat ig-table">
    <thead>
      <tr>
        <th><?php _e('Image', 'insta-gallery'); ?></th>
        <th><?php _e('ID', 'insta-gallery'); ?></th>
        <th><?php _e('User', 'insta-gallery'); ?></th>
        <th><?php _e('Name', 'insta-gallery'); ?></th>
        <th><?php _e('Token', 'insta-gallery'); ?></th>
        <th><?php _e('Action', 'insta-gallery'); ?></th>
      </tr>
    </thead>
    <tbody>
      <?php
      foreach ($qligg as $id => $access_token) {
        $profile_info = qligg_get_user_profile($id);        
        ?>
        <tr>
          <td class="profile-picture"><img src="<?php echo esc_url($profile_info['profile_picture']); ?>" width="30" /></td>
          <td><?php echo esc_attr($id); ?></td>
          <td>@<?php echo esc_html($profile_info['username']); ?></td>
          <td><?php echo esc_html($profile_info['full_name']); ?></td>
          <td>
            <input id="<?php echo esc_attr($id); ?>-access-token" type="text" value="<?php echo esc_attr($access_token); ?>" readonly />
          </td>
          <td>
            <a data-qligg-copy="#<?php echo esc_attr($id); ?>-access-token" href="#" class="btn-instagram">
              <span class="dashicons dashicons-edit"></span><?php _e('Copy', 'insta-gallery'); ?>
            </a>
            <a href="#" data-item_id="<?php echo esc_attr($id); ?>" class="btn-instagram ig-remove-token">
              <span class="dashicons dashicons-trash"></span><?php _e('Delete', 'insta-gallery'); ?>
            </a>
            <span class="spinner"></span>
          </td>
        </tr>
        <?php
      }
      ?>
    </tbody>
  </table>  
<?php endif; ?>
<form id="ig-adv-setting" method="post">
  <table class="widefat form-table ig-table">
    <tbody>
      <tr>
        <td colspan="100%">
          <table>
            <tbody>
              <tr>
                <th><?php _e('Loader icon', 'insta-gallery'); ?></th>
                <td>
                  <?php
                  $mid = '';
                  $misrc = '';
                  if (isset($instagram_settings['igs_spinner_image_id'])) {
                    $mid = $instagram_settings['igs_spinner_image_id'];
                    $image = wp_get_attachment_image_src($mid);
                    if ($image) {
                      $misrc = $image[0];
                    }
                  }
                  ?>
                  <input type="hidden" name="igs_spinner_image_id" value="<?php echo esc_attr($mid); ?>" data-misrc="<?php echo esc_attr($misrc); ?>" />
                  <a class="btn-instagram" id="igs-spinner_media_manager" /><?php _e('Upload', 'insta-gallery'); ?></a>
                  <a class="btn-instagram" id="igs-spinner_reset" /><?php _e('Reset Spinner', 'insta-gallery'); ?></a> 
                  <span class="description">
                    <?php _e('Please select the image from media to replace with default loader icon.', 'insta-gallery'); ?>
                  </span>
                </td>
                <td rowspan="2">
                  <div class="ig-spinner">
                  </div>
                </td>
              </tr>
              <tr>
                <th><?php _e('Remove data on uninstall', 'insta-gallery'); ?></th>
                <td>
                  <input id="ig-remove-data" type="checkbox" name="igs_flush" value="1" <?php if (!empty($instagram_settings['igs_flush'])) echo 'checked'; ?> />
                  <span class="description">
                    <?php _e('Check this box to remove all data related to this plugin when removing the plugin.', 'insta-gallery'); ?>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">
          <span class="spinner"></span>
          <button  type="submit" class="btn-instagram secondary"><?php _e('Update', 'insta-gallery'); ?></button>
          <span class="description">
            <?php //_e('Update settings and copy/paste generated shortcode in your post/pages or go to Widgets and use Instagram Gallery widget', 'insta-gallery');  ?>
          </span>
        </td>
      </tr>
    </tfoot>
  </table>
  <?php wp_nonce_field('qligg_save_igadvs', 'ig_nonce'); ?>
</form>