<ul id="wpstg-steps">
    <li class="wpstg-current-step">
        <span class="wpstg-step-num">1</span>
        <?php echo __("Overview", "wp-staging")?>
    </li>
    <li>
        <span class="wpstg-step-num">2</span>
        <?php echo __("Scanning", "wp-staging")?>
    </li>
    <li>
        <span class="wpstg-step-num">3</span>
        <?php echo __("Cloning", "wp-staging")?>
    </li>
    <li>
        <button type="button" id="wpstg-report-issue-button" class="wpstg-button">
            <i class="wpstg-icon-issue"></i><?php echo __("Report Issue", "wp-staging"); ?>
        </button>
    </li>
    <li>
        <span id="wpstg-loader" style="display:none;"></span>
    </li>
</ul>

<div id="wpstg-workflow"></div>
<div id="wpstg-sidebar">
    <div style="text-align: center;"><span style="display:block;margin-bottom: 20px;color:#abc116;"><a href="https://wordpress.org/support/plugin/wp-staging/reviews/?filter=5" target="_blank" rel="external noopener" style="text-decoration: none;color:#abc116;">Give Feedback ★★★</a></span></div>
    <a href="https://wp-staging.com/?utm_source=tryout&utm_medium=plugin&utm_campaign=tryout&utm_term=tryout" target="_new"><img src="<?php echo WPSTG_PLUGIN_URL . '/apps/Backend/public/img/wpstaging-banner200x400-tryout.gif'; ?>"></a>
</div>