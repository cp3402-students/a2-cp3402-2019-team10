<div class="ig-alert">
  <b><?php esc_html_e('Unable to get results', 'insta-gallery'); ?></b>
  <?php if ($messages) : ?>
    <ul>
      <?php foreach ($messages as $id => $message) : ?>
        <li><?php esc_html_e($message); ?></li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</div>