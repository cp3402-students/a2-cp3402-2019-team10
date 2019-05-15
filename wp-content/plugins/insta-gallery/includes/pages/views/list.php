<?php
if (!defined('ABSPATH'))
  exit;
?>
<p>
  <a class="btn-instagram" href="<?php echo admin_url('admin.php?page=qligg_feeds&tab=edit'); ?>" title="<?php _e('Add New Gallery', 'insta-gallery'); ?>">
    <span class="dashicons dashicons-plus"></span>
    <?php _e('Add New Gallery', 'insta-gallery'); ?>
  </a>
</p>
<?php if (count($instagram_items)) : ?>
  <table class="widefat ig-gallery-list">
    <thead>
      <tr>
        <th>#</th>
        <th><?php _e('Gallery', 'insta-gallery'); ?></th>
        <th><?php _e('Shortcode', 'insta-gallery'); ?></th>
        <th><?php _e('Action', 'insta-gallery'); ?></th>
      </tr>
    </thead>
    <tbody>
      <?php
      $i = 1;
      foreach ($instagram_items as $k => $instagram_item) {
        ?>
        <tr>
          <td><?php echo esc_attr($i++); ?></td>
          <td>
            <?php
            if ($instagram_item['ig_select_from'] == 'username') {
              echo __('User', 'insta-gallery') . ' / @' . $instagram_item['insta_user'];
            } else {
              echo __('Tag', 'insta-gallery') . ' / #' . $instagram_item['insta_tag'];
            }
            ?>
          </td>
          <td>
            <input type="text" onclick="select()" value='[insta-gallery id="<?php echo esc_attr($k); ?>"]' readonly />
          </td>
          <td>
            <a href="<?php echo admin_url("admin.php?page=qligg_feeds&tab=edit&item_id={$k}"); ?>" class="btn-instagram">
              <span class="dashicons dashicons-edit"></span><?php _e('Edit', 'insta-gallery'); ?>
            </a>
            <a href="#" data-item_id="<?php echo esc_attr($k); ?>" class="btn-instagram ig-form-item-delete">
              <span class="dashicons dashicons-trash"></span><?php _e('Delete', 'insta-gallery'); ?>
            </a>
            <span class="spinner"></span>
          </td>
        </tr>
      <?php } unset($i); ?>
    </tbody>
  </table>  
<?php endif; ?>