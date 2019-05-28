<a href="<?php echo esc_url($link); ?>" target="_blank" data-title="<?php echo esc_html($caption); ?>" data-iplink="<?php echo esc_url($iplink); ?>" class="nofancybox" data-elementor-open-lightbox="no">
  <img alt="Instagram" class="insta-gallery-image" src="<?php echo esc_url($img_src); ?>"/>
  <?php if ($instagram_item['insta_hover']): ?>
    <?php include($this->template_path('item/mask.php')); ?>
  <?php endif; ?>
</a>