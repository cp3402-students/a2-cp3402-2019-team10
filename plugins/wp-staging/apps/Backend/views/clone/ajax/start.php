<div class=successfullying-section">
    <h2 id="wpstg-processing-header"><?php echo __("Processing, please wait...", "wp-staging")?></h2>
    <div class="wpstg-progress-bar">
        <div class="wpstg-progress" id="wpstg-progress-db" style="width:0;overflow: hidden;"></div>
        <div class="wpstg-progress" id="wpstg-progress-sr" style="width:0;background-color:#3c9ee4;overflow: hidden;"></div>
        <div class="wpstg-progress" id="wpstg-progress-dirs" style="width:0;background-color:#3a96d7;overflow: hidden;"></div>
        <div class="wpstg-progress" id="wpstg-progress-files" style="width:0;background-color:#378cc9;overflow: hidden;"></div>
    </div>
    <div style="clear:both;">
        <div id="wpstg-processing-status"></div>
        <div id="wpstg-processing-timer"></div>
    </div>
    <div style="clear: both;"></div>
</div>

<button type="button" id="wpstg-cancel-cloning" class="wpstg-link-btn button-primary">
    <?php echo __("Cancel", "wp-staging")?>
</button>

<button type="button" id="wpstg-resume-cloning" class="wpstg-link-btn button-primary">
    <?php echo __("Resume", "wp-staging")?>
</button>

<button type="button" id="wpstg-show-log-button" class="button" data-clone="<?php echo $cloning->getOptions()->clone?>" style="margin-top: 5px;display:none;">
    <?php _e('Display working log', 'wp-staging')?>
</button>

<div>
    <span id="wpstg-cloning-result"></span>
</div>

<div id="wpstg-finished-result">
    <h3>Congratulations
    </h3>
    <?php
    $subDirectory = str_replace( get_home_path(), '', ABSPATH ); 
    $helper = new \WPStaging\Utils\Helper();
    $url = $helper->get_home_url() . str_replace('/', '', $subDirectory);
    echo sprintf( __( 'WP Staging successfully created a staging site in a sub-directory of your main site accessable from:<br><strong><a href="%1$s" target="_blank" id="wpstg-clone-url-1">%1$s</a></strong>', 'wp-staging' ), $url );
    ?>
    <br>
    <?php //echo __('Open and access the staging site: ', 'wp-staging')?>
    <br>
    <a href="<?php echo $url; ?>" id="wpstg-clone-url" target="_blank" class="wpstg-link-btn button-primary">
        Open staging site <span style="font-size: 10px;">(login with your admin credentials)</span>
    </a>
    <!--<a href="" class="wpstg-link-btn button-primary" id="wpstg-remove-cloning">
        <?php //echo __("Remove", "wp-staging")?>
    </a>//-->
    <a href="" class="wpstg-link-btn button-primary" id="wpstg-home-link">
        <?php echo __("Start again", "wp-staging")?>
    </a>
    <div id="wpstg-success-notice">
        <h3 style="margin-top:0px;">
            <?php _e("Important Notes:", "wp-staging")?>
        </h3>
        <ul>
            <li>
                <strong>1. Search friendly permalinks on your <span style="font-style:italic;">staging site</span> have been disabled as default option for technical reasons. </strong>
                <br>
                Usually that's perfectly okay for a staging website. In 99% of all cases you do not need to activate permalinks.
                <br>
                <p>
                    If Apache runs on your webserver there is a good chance that permalinks still work. Try to activate the permalinks from <br/>
                    <br>
                    <strong>Staging Site > wp-admin > Settings > Permalinks</strong></a>
                    <br/><br/>
                    If that does not work or you are using Nginx webserver there are modifications needed in the .htaccess (Apache) or *.conf (Nginx).
                </p>
                <p>
                    <strong><a href="https://wp-staging.com/docs/activate-permalinks-staging-site/?utm_source=wpstg_admin&utm_medium=finish_screen&utm_campaign=tutorial" target="_blank">Read here</a> to see that modifications and learn how to enable permalinks on the staging site.</strong>
                </p>
            </li>
            <li>
                <strong>2. Verify that you are REALLY working on your staging site and NOT on your production site if you are uncertain! </strong>
                <br>
                Your main and your staging site are both reachable under the same domain so
                <br>
                it´s easy to get confused.
                <p>
                    To assist you we changed the color of the admin bar:
                    <br><br>
                    <img src="<?php echo $this->url . "/img/admin_dashboard.png" ?>">
                    <br>
                    On the fronpage the name also changed to <br>
                    <strong style="font-style:italic;">
                        "STAGING - <span class="wpstg-clone-name"><?php echo get_bloginfo("name")?></span>"
                    </strong>.
                </p>
            </li>
        </ul>
    </div>
</div>

<div id="wpstg-error-wrapper">
    <div id="wpstg-error-details"></div>
</div>

<div id="wpstg-log-details"></div>