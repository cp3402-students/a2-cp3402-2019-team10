<?php

function gs_logo_help_menu() {

	add_submenu_page( 
	    'edit.php?post_type=gs-logo-slider', 
	    'Help', 
	    'Help & Usage', 
	    'manage_options', 
	    'gs-logo-help', 
	    'gs_logo_help_menu_cb'
	);
}

add_action('admin_menu', 'gs_logo_help_menu');

function gs_logo_help_menu_cb() {
	?>

    <div class="gs-wrap">
        
    	<div class="gs_team_wrap gs_team_help" style="width: 845px; float: left; margin-top: 20px; text-align: center;">
	        <h1>GS Logo Slider by GS Plugins</h1>
			<div class="help-link">
    			<a class="gstm-hlp-btn gstm-btn-1" href="https://www.gsamdani.com/product/gs-logo-slider" target="_blank">Plugin Home</a>
    			<a class="gstm-hlp-btn gstm-btn-2" href="http://www.logo.gsamdani.com" target="_blank">Live Demo</a>
    			<a class="gstm-hlp-btn gstm-btn-3" href="http://www.logo.gsamdani.com/documentation" target="_blank">Documentation</a>
    			<a class="gstm-hlp-btn gstm-btn-4" href="http://www.logo.gsamdani.com/documentation/#GS_Logo_slider8217s_shortcode_usage" target="_blank">Shortcode Usage</a>
    			<a class="gstm-hlp-btn gstm-btn-5" href="https://www.gsamdani.com/support" target="_blank">Support</a>
    			<a class="gstm-hlp-btn gstm-btn-6" href="https://profiles.wordpress.org/samdani/#content-plugins" target="_blank">Free Plugins</a>
            </div>
            <div class="hire-ad">
                <h3>Hire Me</h3>
                <p>Hey, I'm Golam Samdani, a professional WordPress Theme & Plugin Developer with great expertise on Genesis Child Theme development. You can hire me for your projects.<br><br>Email Me : samdani1997@gmail.com <br> Skype : samdani1997 <br> Recent Projects : <a href="https://www.gsamdani.com/recent-works/" target="_blank">Works</a></p>
            </div>

            <!-- <h2 class="video-title">Watch the video for Installation, Features & Usage</h2>
            <iframe width="825" height="480" src="https://www.youtube.com/embed/9u_Ol5OPIOc?rel=0" frameborder="0" allowfullscreen></iframe> -->
        </div>

        
        <div class="gswps-admin-sidebar" style="width: 277px; float: left; margin-top: 20px;">
            <div class="postbox">
                <h3 class="hndle"><span><?php _e( 'Support / Report a bug' ) ?></span></h3>
                <div class="inside centered">
                    <p>Please feel free to let me know if you got any bug to report. Your report / suggestion can make the plugin awesome!</p>
                    <p style="margin-bottom: 1px! important;"><a href="https://www.gsamdani.com/support" target="_blank" class="button button-primary">Get Support</a></p>
                </div>
            </div>
            <div class="postbox">
                <h3 class="hndle"><span><?php _e( 'Buy me a coffee' ) ?></span></h3>
                <div class="inside centered">
                    <p>If you like the plugin, please buy me a coffee to inspire me to develop further.</p>
                    <p style="margin-bottom: 1px! important;"><a href='https://www.2checkout.com/checkout/purchase?sid=202460873&quantity=1&product_id=8' class="button button-primary" target="_blank">Donate</a></p>
                </div>
            </div>

            <div class="postbox">
                <h3 class="hndle"><span><?php _e( 'Join GS Plugins on facebook' ) ?></span></h3>
                <div class="inside centered">
                    <iframe src="//www.facebook.com/plugins/likebox.php?href=https://www.facebook.com/gsplugins&amp;width&amp;height=258&amp;colorscheme=dark&amp;show_faces=true&amp;header=false&amp;stream=false&amp;show_border=false&amp;appId=723137171103956" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:250px; height:220px;" allowTransparency="true"></iframe>
                </div>
            </div>

            <div class="postbox">
                <h3 class="hndle"><span><?php _e( 'Follow GS Plugins on twitter' ) ?></span></h3>
                <div class="inside centered">
                    <a href="https://twitter.com/gsplugins" target="_blank" class="button button-secondary">Follow @gsplugins<span class="dashicons dashicons-twitter" style="position: relative; top: 3px; margin-left: 3px; color: #0fb9da;"></span></a>
                </div>
            </div>
        </div>    
    </div>

    <?php
}