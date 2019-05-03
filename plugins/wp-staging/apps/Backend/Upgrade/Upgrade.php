<?php

namespace WPStaging\Backend\Upgrade;

use WPStaging\WPStaging;
use WPStaging\Utils\Logger;
use WPStaging\Utils\Helper;
use WPStaging\Utils\IISWebConfig;
use WPStaging\Utils\Htaccess;
use WPStaging\Utils\Filesystem;

/**
 * Upgrade Class
 * This must be loaded on every page init to ensure all settings are 
 * adjusted correctly and to run any upgrade process if necessary.
 */
// No Direct Access
if( !defined( "WPINC" ) ) {
    die;
}

class Upgrade {

    /**
     * Previous Version number
     * @var string 
     */
    private $previousVersion;

    /**
     * Clone data
     * @var obj 
     */
    private $clones;

    /**
     * Global settings
     * @var type obj
     */
    private $settings;

    /**
     * Cron data
     * @var obj
     */
    private $cron;

    /**
     * Logger
     * @var obj 
     */
    private $logger;

    /**
     * db object
     * @var obj 
     */
    private $db;

    public function __construct() {

        // add wpstg_weekly_event to cron events
        $this->cron = new \WPStaging\Cron\Cron;

        // Previous version
        $this->previousVersion = preg_replace( '/[^0-9.].*/', '', get_option( 'wpstg_version' ) );

        $this->settings = ( object ) get_option( "wpstg_settings", array() );

        // Logger
        $this->logger = new Logger;

        // db
        $this->db = WPStaging::getInstance()->get( "wpdb" );
    }

    public function doUpgrade() {
        $this->upgrade2_0_3();
        $this->upgrade2_1_2();
        $this->upgrade2_2_0();
        $this->upgrade2_4_4();

        $this->setVersion();
    }

    private function upgrade2_4_4() {
        // Previous version lower than 2.4.4
        if( version_compare( $this->previousVersion, '2.4.4', '<' ) ) {
            // Add htaccess to wp staging uploads folder
            $htaccess = new Htaccess();
            $htaccess->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . '.htaccess' );
            $htaccess->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'logs/.htaccess' );

            // Add litespeed htaccess to wp root folder
            if( extension_loaded( 'litespeed' ) ) {
                $htaccess->createLitespeed( ABSPATH . '.htaccess' );
            }

            // Create empty index.php in wp staging uploads folder
            $filesystem = new Filesystem();
            $filesystem->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'index.php', "<?php // silence" );
            $filesystem->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'logs/index.php', "<?php // silence" );

            // create web.config file for IIS in wp staging uploads folder
            $webconfig = new IISWebConfig();
            $webconfig->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'web.config' );
            $webconfig->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'logs/web.config' );
        }
    }

    /**
     * Upgrade method 2.2.0
     */
    public function upgrade2_2_0() {
        // Previous version lower than 2.2.0
        if( version_compare( $this->previousVersion, '2.2.0', '<' ) ) {
            $this->upgradeElements();
        }
    }

    /**
     * Add missing elements
     */
    private function upgradeElements() {
        // Current options
        $sites = get_option( "wpstg_existing_clones_beta", array() );

        if( false === $sites || count( $sites ) === 0 ) {
            return;
        }

        // Check if key prefix is missing and add it
        foreach ( $sites as $key => $value ) {
            if( empty( $sites[$key]['directoryName'] ) ) {
                continue;
            }
            //!empty( $sites[$key]['prefix'] ) ? $sites[$key]['prefix'] = $value['prefix'] : $sites[$key]['prefix'] = $key . '_';        
            !empty( $sites[$key]['prefix'] ) ?
                            $sites[$key]['prefix'] = $value['prefix'] :
                            $sites[$key]['prefix'] = $this->getStagingPrefix( $sites[$key]['directoryName'] );
        }

        if( !empty( $sites ) ) {
            update_option( 'wpstg_existing_clones_beta', $sites );
        }
    }

    /**
     * Check and return prefix of the staging site
     * @param string $directory
     * @return string
     */
    private function getStagingPrefix( $directory ) {
        // Try to get staging prefix from wp-config.php of staging site

        $path    = ABSPATH . $directory . "/wp-config.php";
        if( false === ($content = @file_get_contents( $path )) ) {
            $prefix = "";
        } else {
            // Get prefix from wp-config.php
            preg_match( "/table_prefix\s*=\s*'(\w*)';/", $content, $matches );

            if( !empty( $matches[1] ) ) {
                $prefix = $matches[1];
            } else {
                $prefix = "";
            }
        }
        // return result: Check if staging prefix is the same as the live prefix
        if( $this->db->prefix != $prefix ) {
            return $prefix;
        } else {
            return "";
        }
    }

    /**
     * NEW INSTALLATION
     * Upgrade method 2.0.3
     */
    public function upgrade2_0_3() {
        // Previous version lower than 2.0.2 or new install
        if( false === $this->previousVersion || version_compare( $this->previousVersion, '2.0.2', '<' ) ) {
            $this->upgradeOptions();
            $this->upgradeClonesBeta();
            $this->upgradeNotices();
        }
    }

    /**
     * Upgrade method 2.1.2
     * Sanitize the clone key value.
     */
    private function upgrade2_1_2() {

        // Current options
        $this->clonesBeta = get_option( "wpstg_existing_clones_beta", array() );

        if( false === $this->previousVersion || version_compare( $this->previousVersion, '2.1.7', '<' ) ) {
            foreach ( $this->clonesBeta as $key => $value ) {
                unset( $this->clonesBeta[$key] );
                $this->clonesBeta[preg_replace( "#\W+#", '-', strtolower( $key ) )] = $value;
            }
            if( empty( $this->clonesBeta ) )
                return false;

            update_option( 'wpstg_existing_clones_beta', $this->clonesBeta );
        }
    }

    /**
     * Upgrade routine for new install
     */
    private function upgradeOptions() {
        // Write some default vars
        add_option( 'wpstg_installDate', date( 'Y-m-d h:i:s' ) );
        $this->settings->optimizer = 1;
        update_option( 'wpstg_settings', $this->settings );
    }

    /**
     * Write new version number into db
     * return bool
     */
    private function setVersion() {
        // Check if version number in DB is lower than version number in current plugin
        if( version_compare( $this->previousVersion, \WPStaging\WPStaging::VERSION, '<' ) ) {
            // Update Version number
            update_option( 'wpstg_version', preg_replace( '/[^0-9.].*/', '', \WPStaging\WPStaging::VERSION ) );
            // Update "upgraded from" version number
            update_option( 'wpstg_version_upgraded_from', preg_replace( '/[^0-9.].*/', '', $this->previousVersion ) );

            return true;
        }
        return false;
    }

    /**
     * Create a new db option for beta version 2.0.2
     * @return bool
     */
    private function upgradeClonesBeta() {


        $new = array();

        if( empty( $this->clones ) || count( $this->clones ) === 0 ) {
            return false;
        }


        foreach ( $this->clones as $key => &$value ) {

            // Skip the rest of the loop if data is already compatible to wpstg 2.0.2
            if( isset( $value['directoryName'] ) || !empty( $value['directoryName'] ) ) {
                continue;
            }

            $new[$value]['directoryName'] = $value;
            $new[$value]['path']          = get_home_path() . $value;
            $helper                       = new Helper();
            $new[$value]['url']           = $helper->get_home_url() . "/" . $value;
            $new[$value]['number']        = $key + 1;
            $new[$value]['version']       = $this->previousVersion;
            //$new[$value]['prefix'] = $value;
        }
        unset( $value );

        if( empty( $new ) || false === update_option( 'wpstg_existing_clones_beta', $new ) ) {
            $this->logger->log( 'Failed to upgrade clone data from ' . $this->previousVersion . ' to ' . \WPStaging\WPStaging::VERSION );
        }
    }

    /**
     * Upgrade Notices db options from wpstg 1.3 -> 2.0.1
     * Fix some logical db options
     */
    private function upgradeNotices() {
        $poll   = get_option( "wpstg_start_poll", false );
        $beta   = get_option( "wpstg_hide_beta", false );
        $rating = get_option( "wpstg_RatingDiv", false );

        if( $poll && $poll === "no" ) {
            update_option( 'wpstg_poll', 'no' );
        }
        if( $beta && $beta === "yes" ) {
            update_option( 'wpstg_beta', 'no' );
        }
        if( $rating && $rating === 'yes' ) {
            update_option( 'wpstg_rating', 'no' );
        }
    }

    /**
     * Throw a errror message via json and stop further execution
     * @param string $message
     */
    private function returnException( $message = '' ) {
        wp_die( json_encode( array(
            'job'     => isset( $this->options->currentJob ) ? $this->options->currentJob : '',
            'status'  => false,
            'message' => $message,
            'error'   => true
        ) ) );
    }

}
