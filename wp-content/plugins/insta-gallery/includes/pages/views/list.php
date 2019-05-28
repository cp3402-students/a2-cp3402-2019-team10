<?php
if (!defined('ABSPATH'))
  exit;
?>
<div id="ig-create-gallery">
  <p>
    <a class="btn-instagram" href="<?php echo admin_url('admin.php?page=qligg_feeds&tab=edit'); ?>" title="<?php _e('Add New Gallery', 'insta-gallery'); ?>">
      <span class="dashicons dashicons-plus"></span>
      <?php _e('Add New Gallery', 'insta-gallery'); ?>
    </a>
  </p>
</div>
<?php if (count($instagram_items)) : ?>
  <table class="widefat ig-table">
    <thead>
      <tr>
        <th>#</th>
        <th><?php _e('Gallery', 'insta-gallery'); ?></th>
        <th><?php _e('Type', 'insta-gallery'); ?></th>
        <th><?php _e('Shortcode', 'insta-gallery'); ?></th>
        <th><?php _e('Action', 'insta-gallery'); ?></th>
      </tr>
    </thead>
    <tbody>
      <?php
      $i = 1;
      foreach ($instagram_items as $id => $instagram_item) {
        ?>
        <tr>
          <td><?php echo esc_attr($i++); ?></td>
          <td>
            <?php
            if ($instagram_item['ig_select_from'] == 'username') {

              $profile_info = qligg_get_user_profile($instagram_item['insta_username']);

              echo __('User', 'insta-gallery') . ' / @' . $profile_info['username'];
            } else {
              echo __('Tag', 'insta-gallery') . ' / #' . $instagram_item['insta_tag'];
            }
            ?>
          </td>
          <td>
            <?php echo esc_html(ucfirst($instagram_item['ig_display_type'])); ?>
          </td>
          <td>
            <input id="<?php echo esc_attr($id); ?>-gallery-item" type="text" data-qligg-copy="#<?php echo esc_attr($id); ?>-gallery-item" value='[insta-gallery id="<?php echo esc_attr($id); ?>"]' readonly />
          </td>
          <td>
            <a href="<?php echo admin_url("admin.php?page=qligg_feeds&tab=edit&item_id={$id}"); ?>" class="btn-instagram">
              <span class="dashicons dashicons-edit"></span><?php _e('Edit', 'insta-gallery'); ?>
            </a>
            <a href="#" data-item_id="<?php echo esc_attr($id); ?>" class="btn-instagram ig-form-item-delete">
              <span class="dashicons dashicons-trash"></span><?php _e('Delete', 'insta-gallery'); ?>
            </a>
            <span class="spinner"></span>
          </td>
        </tr>
      <?php } unset($i); ?>
    </tbody>
  </table>  
<?php endif; ?>