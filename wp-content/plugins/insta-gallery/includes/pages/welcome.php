<?php
if (!defined('ABSPATH'))
  exit;
?>
<div class="two-col">
  <div class="col" style="min-width: 60%;">
    <div class="qligg-welcome-header">
      <h1><?php echo QLIGG_PLUGIN_NAME; ?> <span style="font-size: 24px;color: #555;">v<?php echo QLIGG_PLUGIN_VERSION; ?></span></h1>
      <div class="about-text">
        <?php esc_html_e('Hello we\'re QuadLayers! We\'ve recently acquired this plugin and this is the first update. We will do our absolute best to support it and fix all the issues.', 'insta-gallery'); ?>
      </div>
    </div>
    <hr/>
    <div class="feature-section one-col is-wide wp-clearfix">
      <h3><?php esc_html_e('Community', 'insta-gallery'); ?></h3>
      <p>
        <?php esc_html_e('If you want to get in touch with other Instagram Gallery users or be aware of our promotional discounts join our community now.', 'insta-gallery'); ?>
      </p>
      <a style="background-color: #ffffff;color: #626262;text-decoration: none;padding: 10px 30px;border-radius: 30px;margin: 10px 0 0 0;display: inline-block;" target="_blank" href="<?php echo QLIGG_GROUP_URL; ?>"><?php esc_html_e('Join us', 'insta-gallery'); ?></a>
    </div>
    <!--<div class="feature-section one-col is-wide wp-clearfix">
      <h3><?php esc_html_e('Demo', 'insta-gallery'); ?></h3>
      <p>
        <?php esc_html_e('Thank you for choosing our Instagram Gallery plugin for WordPress! Here you can see our demo and a description about the features we offer in the premium version.', 'insta-gallery'); ?>      
      </p>
      <a style="background-color: #006cff;color: #ffffff;text-decoration: none;padding: 10px 30px;border-radius: 30px;margin: 10px 0 0 0;display: inline-block;" target="_blank" href="<?php echo QLIGG_DEMO_URL; ?>"><?php esc_html_e('View demo', 'insta-gallery'); ?></a>
    </div>-->
    <div class="feature-section one-col is-wide wp-clearfix">
      <h3><?php esc_html_e('Support', 'insta-gallery'); ?></h3>
      <p>
        <?php esc_html_e('If you have any doubt or you find any issue don\'t hesitate to contact us through our ticket system or join our community to meet other Instagram Gallery users.', 'insta-gallery'); ?>
      </p>
      <a style="background-color: #006cff;color: #ffffff;text-decoration: none;padding: 10px 30px;border-radius: 30px;margin: 10px 0 0 0;display: inline-block;" target="_blank" href="<?php echo QLIGG_SUPPORT_URL; ?>"><?php esc_html_e('Submit ticket', 'insta-gallery'); ?></a>
    </div>    
  </div>
  <div class="col" style="max-width: 33%;min-width: 33%;">
    <img src="<?php echo plugins_url('/assets/img/gallery.jpg', QLIGG_PLUGIN_FILE); ?>">
  </div>
</div>