<?php
/**
 * This page shows the procedural or functional example
 * OOP way example is given on the main plugin file.
 * @author Tareq Hasan <tareq@weDevs.com>
 */
 
/**
 * WordPress settings API demo class
 * @author Tareq Hasan
 */
 
if ( !class_exists('GS_logo_Settings_Config' ) ):
class GS_logo_Settings_Config {

    private $settings_api;

    function __construct() {
        $this->settings_api = new GS_Logo_WeDevs_Settings_API;

        add_action( 'admin_init', array($this, 'admin_init') );
        add_action( 'admin_menu', array($this, 'admin_menu') );
    }

    function admin_init() {

        //set the settings
        $this->settings_api->set_sections( $this->get_settings_sections() );
        $this->settings_api->set_fields( $this->get_settings_fields() );

        //initialize settings
        $this->settings_api->admin_init();
    }

    function admin_menu() {
	
		add_submenu_page( 'edit.php?post_type=gs-logo-slider', 'Logo Settings', 'Logo Settings', 'delete_posts', 'logo-settings', array($this, 'plugin_page')); 
    }

    function get_settings_sections() {
        $sections = array(
            array(
                'id' 	=> 'gs_l_general',
                'title' => __( 'General Settings', 'gslogo' )
            ),
            array(
                'id'    => 'gs_l_control',
                'title' => __( 'Control Settings', 'gslogo' )
            ),
            array(
                'id' 	=> 'gs_l_styling',
                'title' => __( 'Style Settings', 'gslogo' )
            )
        );
        return $sections;
    }

    /**
     * Returns all the settings fields
     *
     * @return array settings fields
     */
    function get_settings_fields() {
        $settings_fields = array(
            'gs_l_general' => array(
                // Direction
                array(
                    'name'      => 'gs_l_mode',
                    'label'     => __( 'Direction', 'gslogo' ),
                    'desc'      => __( 'Select Direction mode to slide Logos', 'gslogo' ),
                    'type'      => 'select',
                    
                    'default'   => 'horizontal',
                    'options'   => array(
                        'horizontal'    => 'Horizontal',
                        'vertical'      => 'Vertical (Pro)'
                    )
                ),
                // Logo theme
                array(
                    'name'  => 'gs_l_theme',
                    'label' => __( 'Style & Theming', 'gslogo' ),
                    
                    'desc'  => __( 'Select preffered Style & Theme', 'gslogo' ),
                    'type'  => 'select',
                    'default'   => 'slider1',
                    'options'   => array(
                        'slider1'           => 'Slider1',
                        'grid1'             => 'Grid - 1 ',
                        'list1'             => 'List - 1 ',
                        'table1'            => 'Table - 1 ',
                        'ticker1'           => 'Ticker1 (Pro)',
                        'grid2'             => 'Grid - 2 (Pro)',
                        'grid3'             => 'Grid - 3 (Pro)',
                        'list2'             => 'List - 2 (Pro)',
                        'list3'             => 'List - 3 (Pro)',
                        'table2'            => 'Table - 2 (Pro)',
                        'table3'            => 'Table - 3 (Pro)',
                        'vslider1'          => 'Vertical Slider (Pro)',
                        'filter1'           => 'Filter - 1 (Pro)',
                        'filter2'           => 'Filter - 2 (Pro)',
                        'filter3'           => 'Filter - 3 (Pro)',
                        'filterlive1'       => 'Live Filter - 1 (Pro)',
                        'filterlive2'       => 'Live Filter - 2 (Pro)',
                        'filterlive3'       => 'Live Filter - 3 (Pro)',
                        'slider_fullwidth'  => 'Full Width Slider (Pro)',
                        'center'            => 'Center Mode (Pro)',
                        'vwidth'            => 'Variable Width (Pro)',
                        'verticalcenter'    => 'Vertical Center (Pro)',
                        'verticalticker'    => 'Vertical Ticker Up (Pro)',
                        'verticaltickerdown' => 'Vertical Ticker Down (Pro)',
                        '2rows'             => '2 Rows Slider (Pro)',
                    )
                ),
                // Sliding Speed
                array(
                    'name' => 'gs_l_slide_speed',
                    'label' => __( 'Sliding Speed', 'gslogo' ),
                    'desc' => __( 'You can increase / decrease sliding speed. Set the speed in <b>millisecond</b>. Default 500. <br>To disable autoplay just set the speed <b>0</b>', 'gslogo' ),
                    'type' => 'range',
                    'sanitize_callback' => 'intval',
                    'range_min' => 0,
                    'range_max' => 20000,
                    'range_step' => 50,
                    'default' => 500
                ), 
                // Autoplay Pause
                array(
                    'name' => 'gs_l_autop_pause',
                    'label' => __( 'Autoplay Pause', 'gslogo' ),
                    'desc' => __( 'You can increase / decrease the amount of time (in ms) between each auto transition. Default 4000 <strong>( Pro Feature ) </strong>', 'gslogo' ),
                    'type' => 'range',
                    
                    'sanitize_callback' => 'intval',
                    'range_min' => 1000,
                    'range_max' => 10000,
                    'range_step' => 1000,
                    'default' => 4000
                ), 
                //Infinite Loop
                array(
                    'name'      => 'gs_l_inf_loop',
                    'label'     => __( 'Infinite Loop', 'gslogo' ),
                    'desc'      => __( 'If ON, clicking "Next" while on the last slide will transition to the first slide <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;and vice-versa', 'gslogo' ),
                    'type'      => 'switch',
                    'switch_default' => 'OFF'
                ),
                
                // Slider Stop on mouse hover
                array(
                    'name'      => 'gs_l_slider_stop',
                    'label'     => __( 'Stop on hover', 'gslogo' ),
                    'desc'      => __( 'Auto show will pause when mouse hovers over Logo. Default On <strong>( Pro Feature ) </strong>', 'gslogo' ),
                    'type'      => 'switch',
                    
                    'switch_default' => 'ON'
                ),
                // Ticker Mode
                array(
                    'name'      => 'gs_l_tk_mode',
                    'label'     => __( 'Ticker Mode', 'gslogo' ),
                    'desc'      => __( 'Slide Logos in ticker mode (similar to a news ticker). Default Off. <strong>( Pro Feature ) </strong> <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;In order to make the ticker appear slower, the Speed value must be raised.', 'gslogo' ),
                    'type'      => 'switch',
                   
                    'switch_default' => 'OFF'
                ),
                // Pause Ticker on Hover
                array(
                    'name'      => 'gs_l_stp_tkr',
                    'label'     => __( 'Pause Ticker on Hover', 'gslogo' ),
                    'desc'      => __( 'Ticker will pause when mouse hovers over slider. <strong>( Pro Feature ) </strong> <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Note: this functionality does NOT work if using CSS transitions!. Default Off', 'gslogo' ),
                    'type'      => 'switch',
                    
                    'switch_default' => 'OFF'
                ),
                //slick theme
                array(
                    'name'      => 'gs_slick_dislay',
                    'label'     => __( 'Enqueue Slick', 'gslogo' ),
                    'desc'      => __( 'Enqueue Slick <strong>( Pro Feature ) </strong> ', 'gslogo' ),
                    'type'      => 'switch',
                    
                    'switch_default' => 'ON'
                ),
            ),
            // GS Logo control settings
            'gs_l_control' => array(
                // nxt / prev control
                array(
                    'name'      => 'gs_l_ctrl',
                    'label'     => __( 'Next / Previous', 'gslogo' ),
                    'desc'      => __( 'Next / Previous control for Logo slider. Default On <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Controls are not available when Ticker Mode is enabled', 'gslogo' ),
                    'type'      => 'switch',
                    'switch_default' => 'ON'
                ),
                // Pagination
                array(
                    'name'      => 'gs_l_pagi',
                    'label'     => __( 'Pagination', 'gslogo' ),
                    'desc'      => __( 'Pagination control bellow the Logo slider. Default OFF <strong>( Pro Feature ) </strong>', 'gslogo' ),
                    'type'      => 'switch',
                    'switch_default' => 'OFF'
                ),
                // Play Pause
                array(
                    'name'      => 'gs_l_play_pause',
                    'label'     => __( 'Play Pause', 'gslogo' ),
                    'desc'      => __( 'Play Pause control bellow the Logo slider. Default OFF <strong>( Pro Feature ) </strong>', 'gslogo' ),
                    'type'      => 'switch',
                    'switch_default' => 'OFF'
                ),   
                // Logo Title
                array(
                    'name'      => 'gs_l_title',
                    'label'     => __( 'Logo Title', 'gslogo' ),
                    'desc'      => __( 'Display Logo including / excluding Title. Default OFF', 'gslogo' ),
                    'type'      => 'select',
                    'default'   => 'no',
                    'options'   => array(
                        'no'    => 'No',
                        'yes'   => 'Yes'
                    )
                ),        
                // Clickable Logos
                array(
                    'name'      => 'gs_l_clkable',
                    'label'     => __( 'Clickable Logos', 'gslogo' ),
                    'desc'      => __( 'Specify target to load the Links, Default New Tab', 'gslogo' ),
                    'type'      => 'select',
                    'default'   => '_blank',
                    'options'   => array(
                        '_blank'    => 'New Tab',
                        '_self'     => 'Same Window (Pro)'
                    )
                )

            ),
			// GS Logo Style settings
            'gs_l_styling' => array(
                // Logo Width
                // array(
                //     'name'  => 'gs_l_width',
                //     'label' => __( 'Logo Width (px)', 'gslogo' ),
                //     'desc'  => __( 'Increase / decrease Logo size in width. Default 200, max 550.', 'gslogo' ),
                //     'type'  => 'number',
                //     'min'   => 0,
                //     'max'   => 550,
                //     'default' => 200
                // ), 
                // Logo height
                // array(
                //     'name'  => 'gs_l_height',
                //     'label' => __( 'Logo Height (px)', 'gslogo' ),
                //     'desc'  => __( 'Increase / decrease Logo size in height. Default 200, max 550.', 'gslogo' ),
                //     'type'  => 'number',
                //     'min'   => 0,
                //     'max'   => 550,
                //     'default' => 200
                // ),
                // Logos style
                array(
                    'name'      => 'gs_l_gray',
                    'label'     => __( 'Logos Style', 'gslogo' ),
                    'desc'      => __( 'Logo grayscale feature works only in modern browsers.. <br>like Chrome, Firefox and Safari', 'gslogo' ),
                    'type'      => 'select',
                    'default'   => '',
                    'options'   => array(
                        ''      => 'Default',
                        'gray'  => 'Grayscale (Pro)',
                        'gray_to_def' => 'Gray to Default (Pro)',
                        'def_to_gray' => 'Default to Gray (Pro)'
                    )
                ),

                // Logos style
                array(
                    'name'      => 'gs_l_tooltip',
                    'label'     => __( 'Tooltip', 'gslogo' ),
                    'desc'      => __( 'Enable / disable Tooltip option.', 'gslogo' ),
                    'type'      => 'select',
                    'default'   => '',
                    'options'   => array(
                        ''      => 'No',
                        'tooltip'  => 'Yes (Pro)'
                    )
                ),
                // Logo Margin
                array(
                    'name'  => 'gs_l_margin',
                    'label' => __( 'Logo Margin (px)', 'gslogo' ),
                    'desc'  => __( 'Increase / decrease Margin between each Logo. <br>Default 10, max 30. <strong>( Pro Feature ) </strong>', 'gslogo' ),
                    'type'  => 'number',
                    'min'   => 0,
                    'max'   => 30,
                    'default' => 10
                ),
                // Slide Width
                array(
                    'name'  => 'gs_l_slide_w',
                    'label' => __( 'Slide Width (px)', 'gslogo' ),
                    'desc'  => __( 'The width of each slide. This setting is required for horizontal carousels!. <br>Default 200, max 500. <strong>( Pro Feature ) </strong>', 'gslogo' ),
                    'type'  => 'number',
                    'min'   => 0,
                    'max'   => 500,
                    'default' => 200
                ),
                // Min Logos
                array(
                    'name'  => 'gs_l_min_logo',
                    'label' => __( 'Minimum Logos', 'gslogo' ),
                    'desc'  => __( 'The minimum number of logos to be shown. Default 1, max 10.', 'gslogo' ),
                    'type'  => 'number',
                    'min'   => 1,
                    'max'   => 10,
                    'default' => 1
                ),
                // Max Logos
                array(
                    'name'  => 'gs_l_max_logo',
                    'label' => __( 'Maximum Logos', 'gslogo' ),
                    'desc'  => __( 'The maximum number of logos to be shown. Default 5, max 10.', 'gslogo' ),
                    'type'  => 'number',
                    'min'   => 1,
                    'max'   => 10,
                    'default' => 5
                ),
                // Move Logos
                array(
                    'name'  => 'gs_l_move_logo',
                    'label' => __( 'Move Logos', 'gslogo' ),
                    'desc'  => __( 'The number of logos to move on transition. Default 1, max 10.', 'gslogo' ),
                    'type'  => 'number',
                    'min'   => 0,
                    'max'   => 10,
                    'default' => 1
                ),
                // All filter Name
                array(
                   'name'    => 'gs_logo_filter_name',
                   'label'   => __( 'All Filter Name', 'gslogo' ),
                   'desc'    => __( 'Replace preffered text instead of "All" for <b> Filter Theme</b> <strong>( Pro Feature ) </strong>.', 'gslogo' ),
                    'default'   => 'All',
                    'type'    => 'text'
                ),
                // Filter name Align
                array(
                   'name'    => 'gs_logo_filter_align',
                   'label'   => __( 'Filter Name Align', 'gslogo' ),
                   'desc'    => __( 'Filter Categories alignment for <b> Filter Theme</b>. <strong>( Pro Feature ) </strong>', 'gslogo' ),
                   'type'      => 'select',
                    'default'   => 'center',
                    'options'   => array(
                        'center' => 'Center',
                        'left'  => 'Left',
                        'right' => 'Right'
                    )
                ),
                				
            )
        );

        return $settings_fields;
    }

    // function plugin_page() {
    //     echo '<div class="wrap gs_t_wrap">';

    //     $this->settings_api->show_navigation();
    //     $this->settings_api->show_forms();

    //     echo '</div>';
    // }

    function plugin_page() {
        settings_errors();
        echo '<div class=" gs_logo_wrap" style="width: 845px; float: left;">';
        // echo '<div id="post-body-content">';

        $this->settings_api->show_navigation();
        $this->settings_api->show_forms();

        echo '</div>';

        ?>
            <div class="gswps-admin-sidebar" style="width: 277px; float: left; margin-top: 62px;">
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
        <?php
    }


    /**
     * Get all the pages
     *
     * @return array page names with key value pairs
     */
    function get_pages() {
        $pages = get_pages();
        $pages_options = array();
        if ( $pages ) {
            foreach ($pages as $page) {
                $pages_options[$page->ID] = $page->post_title;
            }
        }

        return $pages_options;
    }

}
endif;

$settings = new GS_logo_Settings_Config();