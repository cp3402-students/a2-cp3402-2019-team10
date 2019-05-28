<?php
if (!defined('ABSPATH'))
  exit();

$item_selector = "ig-block-{$id}";
$item_url = $this->get_link($instagram_item);
$item_images = $this->get_items($instagram_item);
$item_spacing = $instagram_item['insta_spacing'] / 2;

$igs_frontend = array(
    //'display_type' => $instagram_item['ig_display_type'],
    'popup' => $instagram_item['insta_popup']
);
?>
<style>
<?php
if (!empty($instagram_item['insta_spacing'])) {
  echo "#{$item_selector} .insta-gallery-items {margin: 0 -{$item_spacing}px;}";
}
if (!empty($instagram_item['insta_spacing'])) {
  echo "#{$item_selector} .insta-gallery-items .ig-item {padding: {$item_spacing}px;}";
}
if (!empty($instagram_item['insta_hover-color'])) {
  echo "#{$item_selector} .insta-gallery-items .ig-item a .insta-gallery-image-mask {background: {$instagram_item['insta_hover-color']};}";
}
if (!empty($instagram_item['insta_car-navarrows-color'])) {
  //echo "#{$item_selector} .insta-gallery-items .swiper-button-next svg, #{$item_selector}.insta-gallery-items .swiper-button-prev svg {fill: {$instagram_item['insta_car-navarrows-color']};}";
}
if (!empty($instagram_item['insta_instalink-bgcolor'])) {
  echo "#{$item_selector} .insta-gallery-actions .insta-gallery-button {background: {$instagram_item['insta_instalink-bgcolor']};}";
}
if (!empty($instagram_item['insta_instalink-hvrcolor'])) {
  echo "#{$item_selector} .insta-gallery-actions .insta-gallery-button:hover {background: {$instagram_item['insta_instalink-hvrcolor']};}";
}
?>
</style>
<div id="<?php echo esc_attr($item_selector); ?>" class="insta-gallery-items" data-type="gallery" data-igfs="<?php echo htmlentities(json_encode($igs_frontend), ENT_QUOTES, 'UTF-8'); ?>">
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
    <div class="ig-item cols-<?php echo esc_attr($instagram_item['insta_gal-cols']); ?>" style="width: <?php echo (100 / $instagram_item['insta_gal-cols']); ?>%;">
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
<?php if ($instagram_item['insta_instalink']) { ?>
  <div class="insta-gallery-actions">
    <a href="<?php echo esc_url($item_url); ?>" target="blank" class="insta-gallery-button"><?php echo esc_html($instagram_item['insta_instalink-text']); ?></a>
  </div>
<?php } ?>


