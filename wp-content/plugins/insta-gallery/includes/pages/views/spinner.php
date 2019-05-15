<?php
if (!defined('ABSPATH'))
  exit;
?>

<hr/>
<div id="ig_adv-setting-panel">
  <p>
    <button class="ig_adv-setting-toggle btn-instagram">
      <span class="dashicons dashicons-plus"></span>
      <span class="dashicons dashicons-minus"></span><?php _e('Additional Setting', 'insta-gallery'); ?>
    </button>
  </p>
  <div class="ig_adv-setting">
    <form id="ig-adv-setting" method="post">
      <table class="widefat">
        <tbody>
          <tr>
            <th><?php _e('Gallery loader icon', 'insta-gallery'); ?>:</th>
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
              <p class="description">
<?php _e('Please select the image from media to replace with default Gallery loader icon.', 'insta-gallery'); ?>
              </p>
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
            <th><?php _e('Remove everything on uninstall', 'insta-gallery'); ?>:</th>
            <td>
              <input type="checkbox" name="igs_flush" value="1" onclick="ig_validate_flush(this)" <?php if (!empty($instagram_settings['igs_flush'])) echo 'checked'; ?> />
              <span class="description">
<?php _e('Check this box to remove all data related to this plugin when removing the plugin.', 'insta-gallery'); ?>
              </span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">
              <span class="spinner"></span>
              <button type="submit" class="btn-instagram secondary"><?php _e('Update', 'insta-gallery'); ?></button>
            </td>
          </tr>
        </tfoot>
      </table>
<?php wp_nonce_field('igara_save_igadvs', 'ig_nonce'); ?>
    </form>
  </div>
</div>
<script>
  function ig_validate_flush(ele) {
    if (ele.checked) {
      var c = confirm('<?php _e('please make sure every settings will be removed on plugin uninstall.', 'insta-gallery'); ?>');
      if (!c) {
        ele.checked = false;
      }
    }
  }
</script> 