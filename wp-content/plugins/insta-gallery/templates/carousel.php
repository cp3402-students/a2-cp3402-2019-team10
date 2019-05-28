<?php
if (!defined('ABSPATH'))
  exit();

$item_selector = "ig-block-{$id}";
$item_url = $this->get_link($instagram_item);
$item_images = $this->get_items($instagram_item);
$item_spacing = $instagram_item['insta_spacing'] / 2;

$igs_frontend = array(
    //'display_type' => $instagram_item['ig_display_type'],
    'autoplay' => $instagram_item['insta_car-autoplay'],
    'autoplay_interval' => $instagram_item['insta_car-autoplay-interval'],
    'dots' => $instagram_item['insta_car-dots'],
    'navarrows' => $instagram_item['insta_car-navarrows'],
    'slides' => $instagram_item['insta_car-slidespv'],
    'popup' => $instagram_item['insta_popup'],
    'spacing' => $item_spacing,
);
?>
<style>
<?php
if (!empty($instagram_item['insta_spacing'])) {
  //echo "#{$item_selector} .insta-gallery-items .ig-item {padding: {$instagram_item['insta_spacing']}px;}";
}
if (!empty($instagram_item['insta_hover-color'])) {
  echo "#{$item_selector} .insta-gallery-items .ig-item a .insta-gallery-image-mask {background: {$instagram_item['insta_hover-color']};}";
}
if (!empty($instagram_item['insta_car-navarrows-color'])) {
  echo "#{$item_selector} .insta-gallery-items .swiper-button-next svg, #{$item_selector}.insta-gallery-items .swiper-button-prev svg {fill: {$instagram_item['insta_car-navarrows-color']};}";
}
if (!empty($instagram_item['insta_instalink-bgcolor'])) {
  echo "#{$item_selector} .insta-gallery-actions .insta-gallery-button {background: {$instagram_item['insta_instalink-bgcolor']};}";
}
if (!empty($instagram_item['insta_instalink-hvrcolor'])) {
  echo "#{$item_selector} .insta-gallery-actions .insta-gallery-button:hover {background: {$instagram_item['insta_instalink-hvrcolor']};}";
}
?>
</style>
<div id="ig-block-<?php echo esc_attr($id); ?>" class="insta-gallery-items swiper-container" data-type="<?php echo esc_attr($instagram_item['ig_display_type']); ?>" data-igfs="<?php echo htmlentities(json_encode($igs_frontend), ENT_QUOTES, 'UTF-8'); ?>">
  <div class="swiper-wrapper">
    <?php
    $i = 1;
    foreach ($item_images as $item) {

      $img_src = $item['img_standard'];

      if ($instagram_item['insta_thumb-size'] == 'small') {
        $img_src = $item['img_thumb'];
      }

      if ($instagram_item['insta_thumb-size'] == 'medium') {
        $img_src = $item['img_low'];
      }

      $link = $iplink = "https://www.instagram.com/p/{$item['code']}/";

      if (!empty($item['link'])) {
        $link = $iplink = $item['link'];
      }

      if ($instagram_item['insta_popup']) {
        $link = $item['img_standard'];
      }

      $caption = '';

      if ($instagram_item['insta_popup-caption'] && $instagram_item['insta_popup']) {
        $caption = $item['caption'];
      }
      ?>
      <div class="ig-item swiper-slide">
        <?php include($this->template_path('item/image.php')); ?>
      </div>
      <?php
      $i ++;
      if (($instagram_item['insta_limit'] != 0) && ($i > $instagram_item['insta_limit'])) {
        break;
      }
    }
    ?>
  </div>
  <!-- <div class="swiper-pagination"></div> -->
  <?php if ($instagram_item['insta_car-navarrows']) { ?>
    <div class="swiper-button-prev">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 477.175 477.175"><path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z" />Prev</svg>
    </div>
    <div class="swiper-button-next">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 477.175 477.175"><path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z" />Next</svg>
    </div>
  <?php } ?>
</div>
<?php if ($instagram_item['insta_instalink']) { ?>
  <div class="insta-gallery-actions">
    <a href="<?php echo esc_url($item_url); ?>" target="blank" class="insta-gallery-button"><?php echo esc_html($instagram_item['insta_instalink-text']); ?></a>
  </div>
<?php } ?>
