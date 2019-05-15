<?php
if (!defined('ABSPATH'))
  exit;

$instagram_item = array(
    'ig_select_from' => 'username',
    'insta_user' => 'calzado.store',
    'insta_tag' => '',
    'insta_user-limit' => '12',
    'insta_tag-limit' => '12',
    'ig_display_type' => 'carousel',
    'insta_gal-cols' => '3',
    'insta_gal-hover' => '',
    'insta_gal-spacing' => '',
    'insta_instalink' => '1',
    'insta_instalink-text' => '',
    'insta_instalink-bgcolor' => '',
    'insta_instalink-hvrcolor' => '',
    'insta_car-slidespv' => '5',
    'insta_car-autoplay' => '1',
    'insta_car-autoplay-interval' => '3000',
    'insta_car-navarrows' => '1',
    'insta_car-navarrows-color' => '',
    'insta_car-dots' => null,
    'insta_car-spacing' => '1',
    'insta_thumb-size' => 'standard',
    'insta_hover-color' => '',
    'insta_gal-popup' => '1',
    'insta_popup-caption' => '',
    'insta_likes' => '1',
    'insta_comments' => '1',
    'ig_item_id' => '0'
);

if (isset($_GET['item_id'])) {

  $ig_item_id = absint($_GET['item_id']);

  if (count($instagram_items)) {
    if (isset($instagram_items[$ig_item_id])) {
      $instagram_item = $instagram_items[$ig_item_id];
      $instagram_item['ig_item_id'] = $ig_item_id;
    }
  }
}
?>
<form method="post" id="ig-update-form">
  <table class="widefat form-table ig-table-edit">
    <tbody>
      <tr>
        <td colspan="2">
          <ul class="ig-list-buttons">
            <li>
              <input type="radio" id="ig_select_from-username" name="ig_select_from" value="username" <?php checked('username', $instagram_item['ig_select_from']); ?>  />
              <label for="ig_select_from-username"><?php _e('User', 'insta-gallery'); ?></label>
              <div class="check"></div>
            </li>
            <li>
              <input type="radio" id="ig_select_from-tag" name="ig_select_from" value="tag" <?php checked('tag', $instagram_item['ig_select_from']); ?>  />
              <label for="ig_select_from-tag"><?php _e('Tag', 'insta-gallery'); ?></label>
              <div class="check"></div>
            </li>
          </ul> 
          <p class="description">
            <?php _e('Please select option to display pictures from Instagram @username or #tag', 'insta-gallery'); ?>
          </p>
        </td>
      </tr>
      <tr id="ig-select-username-wrap" class="ig-tab-content-row <?php if ($instagram_item['ig_select_from'] == 'username') echo 'active'; ?>">
        <td colspan="100%">
          <table>
            <tr>
              <th scope="row"><?php _e('User', 'insta-gallery'); ?></th>
              <td> 
                <?php if (empty($qligg['access_token'])): ?>
                  <p class="ig-thm-color">
                    <strong><?php _e('No Instagram account connected. please connect an account with the website to access Instagram media', 'insta-gallery'); ?></strong></strong>
                  </p>
                  <input name="insta_user" type="hidden" value="nousername" readonly />
                  <?php
                else :
                  $profile_info = qligg_get_user_profile_info();
                  $username = empty($profile_info['username']) ? 'nousername' : $profile_info['username'];
                  ?>
                  <input name="insta_user" type="text" placeholder="myusername" value="<?php echo esc_attr($username); ?>" readonly />
                  <p class="ig-generate-msgs"><?php _e('Please enter Instagram username', 'insta-gallery'); ?></p>
                <?php endif; ?>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Limit', 'insta-gallery'); ?></th>
              <td><input name="insta_user-limit" type="number" min="1" max="50" value="<?php echo!empty($instagram_item['insta_user-limit']) ? $instagram_item['insta_user-limit'] : '12'; ?>" />
                <p class="description"><?php _e('Number of pictures to display', 'insta-gallery'); ?></span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr id="ig-select-tag-wrap" class="ig-tab-content-row <?php if ($instagram_item['ig_select_from'] == 'tag') echo 'active'; ?>">
        <td colspan="100%">
          <table>
            <tr>
              <th scope="row"><?php _e('Tag', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_tag" type="text" placeholder="beautiful" value="<?php echo!empty($instagram_item['insta_tag']) ? $instagram_item['insta_tag'] : ''; ?>" />
                <p class="description">
                  https://www.instagram.com/explore/tags/beautiful
                </p>
                <p class="ig-generate-msgs"><?php _e('Please enter Instagram tag', 'insta-gallery'); ?></p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Limit', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_tag-limit" type="number" min="1" max="30" value="<?php echo!empty($instagram_item['insta_tag-limit']) ? $instagram_item['insta_tag-limit'] : '12'; ?>" />
                <p class="description">
                  <?php _e('Number of pictures to display', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <ul class="ig-list-buttons">
            <li>
              <input type="radio" id="ig_display_type-gallery" name="ig_display_type" value="gallery" <?php checked('gallery', $instagram_item['ig_display_type']); ?> />
              <label for="ig_display_type-gallery"><?php _e('Gallery', 'insta-gallery'); ?></label>
              <div class="check"></div>
            </li>
            <li>
              <input type="radio" id="ig_display_type-carousel" name="ig_display_type" value="carousel" <?php checked('carousel', $instagram_item['ig_display_type']); ?> />
              <label for="ig_display_type-carousel"><?php _e('Carousel', 'insta-gallery'); ?></label>
              <div class="check"></div>
            </li>
          </ul>
        </td>
      </tr>
      <tr id="ig-section-as-galllery" class="ig-tab-content-row <?php if ($instagram_item['ig_display_type'] == 'gallery') echo 'active'; ?>">
        <td colspan="100%">
          <table>
            <tr>
              <th scope="row"><?php _e('Columns', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_gal-cols" type="number" min="1" max="20" value="<?php echo!empty($instagram_item['insta_gal-cols']) ? $instagram_item['insta_gal-cols'] : '3'; ?>" /> 
                <p class="description">
                  <?php _e('Number of pictures in a row', 'insta-gallery'); ?>
                </p>
              </td>
              <td rowspan="3"><img src="<?php echo plugins_url('/assets/img/demo-gallery.jpg', QLIGG_PLUGIN_FILE); ?>" width="500" /></td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Image hover effect', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_gal-hover" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_gal-hover'])) ? '' : 'checked'; ?> />
                <p class="description">
                  <?php _e('Image mouseover effect', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Space between images', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_gal-spacing" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_gal-spacing'])) ? '' : 'checked'; ?> />
                <p class="description">
                  <?php _e('Add blank space between images', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr id="ig-section-as-carousel" class="ig-tab-content-row <?php if ($instagram_item['ig_display_type'] == 'carousel') echo 'active'; ?>">
        <td colspan="100%">
          <table>
            <tr>
              <th scope="row"><?php _e('Slides per view', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_car-slidespv" type="number" min="1" max="10" value="<?php echo!empty($instagram_item['insta_car-slidespv']) ? $instagram_item['insta_car-slidespv'] : '5'; ?>" />
                <p class="description"><?php _e('Number of pictures per slide', 'insta-gallery'); ?></p>
              </td>
              <td rowspan="5"><img src="<?php echo plugins_url('/assets/img/demo-carousel.jpg', QLIGG_PLUGIN_FILE); ?>" alt="demo carousel" width="500" /></td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Autoplay', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_car-autoplay" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_car-autoplay'])) ? '' : 'checked'; ?> />
                <p class="description"><?php _e('autoplay carousel items', 'insta-gallery'); ?></p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Autoplay Interval', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_car-autoplay-interval" type="number" min="1000" max="300000" step="100" value="<?php echo (!empty($instagram_item['insta_car-autoplay-interval'])) ? $instagram_item['insta_car-autoplay-interval'] : '3000'; ?>" />
                <p class="description">
                  <?php _e('Moves to next picture after specified time interval', 'insta-gallery'); ?></p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Navigation arrows', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_car-navarrows" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_car-navarrows'])) ? '' : 'checked'; ?> />
                <p class="description"><?php _e('Display prev-next navigation arrows', 'insta-gallery'); ?></p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Navigation arrows color', 'insta-gallery'); ?></th>
              <td>
                <input id="insta_car-navarrows-color-choose" type="color" value="<?php echo (!empty($instagram_item['insta_car-navarrows-color']) ? $instagram_item['insta_car-navarrows-color'] : '#c32a67'); ?>" />
                <input name="insta_car-navarrows-color" type="text" placeholder="#c32a67" value="<?php echo (!empty($instagram_item['insta_car-navarrows-color']) ? $instagram_item['insta_car-navarrows-color'] : ''); ?>" /> 
                <p class="description"><?php _e('change navigation arrows color here', 'insta-gallery'); ?></p>
              </td>
            </tr>
            <!-- 
            <tr>
              <th scope="row"><?php _e('Dotted navigation', 'insta-gallery'); ?></th>
              <td><input name="insta_car-dots" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_car-dots'])) ? '' : 'checked'; ?> /> <span
                class="description"><?php _e('Display dotted navigation buttons', 'insta-gallery'); ?><br />( <span class="ig-thm-color"><strong><?php
            _e('Deprecated: this option will be removed in the future updates', 'insta-gallery');
            ?></strong></span> )</span></td>
            </tr>
            -->
            <tr>
              <th scope="row"><?php _e('Space between slides', 'insta-gallery'); ?></th>
              <td><input name="insta_car-spacing" type="checkbox" value="1"
                         <?php echo (isset($instagram_item) && empty($instagram_item['insta_car-spacing'])) ? '' : 'checked'; ?> /> <p class="description"><?php _e('add blank space between carousel items', 'insta-gallery'); ?> </span></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr class="ig-tab-content-row active">
        <td colspan="100%">
          <table>
            <tr>
              <th scope="row"><?php _e('Images thumbnail size', 'insta-gallery'); ?></th>
              <td>
                <select name="insta_thumb-size">
                  <option value="standard"><?php _e('Standard', 'insta-gallery'); ?> (640 x auto)</option>
                  <option value="medium" <?php echo (isset($instagram_item['insta_thumb-size']) && ($instagram_item['insta_thumb-size'] == 'medium')) ? 'selected' : ''; ?>><?php _e('Medium', 'insta-gallery'); ?> (320 x auto)</option>
                  <option value="small" <?php echo (isset($instagram_item['insta_thumb-size']) && ($instagram_item['insta_thumb-size'] == 'small')) ? 'selected' : ''; ?>><?php _e('Small', 'insta-gallery'); ?> (150 x 150)</option>
                </select>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Images hover effect color', 'insta-gallery'); ?></th>
              <td><input id="insta_hover-color-choose" type="color" value="<?php echo (!empty($instagram_item['insta_hover-color']) ? $instagram_item['insta_hover-color'] : '#007aff'); ?>" />
                <input name="insta_hover-color" type="text" placeholder="#007aff" value="<?php echo (!empty($instagram_item['insta_hover-color']) ? $instagram_item['insta_hover-color'] : ''); ?>" />
                <p class="description">
                  <?php _e('Color which is displayed when hovered over images', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Popup images on click', 'insta-gallery'); ?></th>
              <td><input name="insta_gal-popup" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_gal-popup'])) ? '' : 'checked'; ?> />
                <p class="description">
                  <?php _e('Display popup gallery by clicking on image thumbnail. else it will open Instagram page', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>
            <tr hidden>
              <th scope="row"><?php _e('Display image caption', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_popup-caption" type="checkbox" readonly value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_popup-caption'])) ? '' : 'checked'; ?> /> <p class="description"><?php _e('Display caption/tags below images when popup', 'insta-gallery'); ?><br />(
                  <span class="ig-thm-color">
                    <?php _e('Deprecated: this option will be removed in the future updates', 'insta-gallery'); ?>
                  </span>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Display likes', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_likes" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_likes'])) ? '' : 'checked'; ?> />
                <p class="description">
                  <?php _e('Display likes count of images', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Display comments', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_comments" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_comments'])) ? '' : 'checked'; ?> />
                <p class="description">
                  <?php _e('Display comments count of images', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr class="ig-tab-content-row active">
        <td colspan="100%">
          <table>
            <tr>
              <th scope="row"><?php _e('Instagram button', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_instalink" type="checkbox" value="1" <?php echo (isset($instagram_item) && empty($instagram_item['insta_instalink'])) ? '' : 'checked'; ?> />
                <p class="description">
                  <?php _e('Display the button to open Instagram site link', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
      <tr id="ig-section-igbtn" class="ig-tab-content-row <?php if (isset($instagram_item) && !empty($instagram_item['insta_instalink'])) echo 'active'; ?>">
        <td colspan="100%">
          <table>
            <tr>
              <th scope="row"><?php _e('Instagram button text', 'insta-gallery'); ?></th>
              <td>
                <input name="insta_instalink-text" type="text" placeholder="Instagram" value="<?php echo (!empty($instagram_item['insta_instalink-text'])) ? $instagram_item['insta_instalink-text'] : ''; ?>" />
                <p class="description">
                  <?php _e('Instagram button text here', 'insta-gallery'); ?>
                </p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Instagram button background', 'insta-gallery'); ?></th>
              <td>
                <input id="insta_instalink-bgcolor-choose" type="color" value="<?php echo (!empty($instagram_item['insta_instalink-bgcolor']) ? $instagram_item['insta_instalink-bgcolor'] : '#c32a67'); ?>" />
                <input name="insta_instalink-bgcolor" type="text" placeholder="#c32a67" value="<?php echo (!empty($instagram_item['insta_instalink-bgcolor']) ? $instagram_item['insta_instalink-bgcolor'] : ''); ?>" />
                <p class="description"><?php _e('Color which is displayed on button background', 'insta-gallery'); ?></p>
              </td>
            </tr>
            <tr>
              <th scope="row"><?php _e('Instagram button hover color', 'insta-gallery'); ?></th>
              <td>
                <input id="insta_instalink-hvrcolor-choose" type="color" value="<?php echo (!empty($instagram_item['insta_instalink-hvrcolor']) ? $instagram_item['insta_instalink-hvrcolor'] : '#da894a'); ?>" />
                <input name="insta_instalink-hvrcolor" type="text" placeholder="#da894a" value="<?php echo (!empty($instagram_item['insta_instalink-hvrcolor']) ? $instagram_item['insta_instalink-hvrcolor'] : ''); ?>" />
                <p class="description"><?php _e('Color which is displayed when hovered over button', 'insta-gallery'); ?></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <?php //if (count($instagram_item['ig_item_id'])) : ?>
  <input type="hidden" name="item_id" value="<?php echo esc_attr($instagram_item['ig_item_id']); ?>" />
  <?php //endif; ?>
  <?php wp_nonce_field('igara_update_form', 'ig_nonce'); ?>
  <p>
    <span class="spinner"></span>
    <button  type="submit" class="btn-instagram secondary"><?php _e('Update', 'insta-gallery'); ?></button>
    <span class="description">
      <?php _e('Update settings and copy/paste generated shortcode in your post/pages or go to Widgets and use Instagram Gallery widget', 'insta-gallery'); ?>
    </span>
  </p>
</form>
<hr/>
<p>
  <a class="btn-instagram" href="<?php echo admin_url('admin.php?page=qligg_feeds'); ?>" title="<?php _e('View Galleries List', 'insta-gallery'); ?>">
    <i class="dashicons dashicons-arrow-left-alt"></i><?php _e('Back to List', 'insta-gallery'); ?>
  </a>
</p>