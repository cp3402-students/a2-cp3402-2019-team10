<?php

namespace WPStaging;

use WPStaging\WPStaging;
use WPStaging\Backend\Optimizer\Optimizer;
use WPStaging\Cron\Cron;
use WPStaging\Utils\IISWebConfig;
use WPStaging\Utils\Htaccess;
use WPStaging\Utils\Filesystem;


// Exit if accessed directly
if( !defined( 'ABSPATH' ) )
    exit;

/**
 * Install Class
 *
 */

class Install {
        
    public function __construct() {
        register_activation_hook( __DIR__ . DIRECTORY_SEPARATOR . WPSTG_PLUGIN_SLUG . '.php', array($this, 'activation') );
    }

    public static function activation() {
        $install = new Install();
        
        $install->installOptimizer();
        $install->createHtaccess();
        $install->createIndex();
        $install->createWebConfig();
    }

    private function installOptimizer() {
        // Register cron job.
        $cron = new \WPStaging\Cron\Cron;
        $cron->schedule_event();

        // Install Optimizer 
        $optimizer = new Optimizer();
        $optimizer->installOptimizer();

        // Add the transient to redirect for class Welcome (not for multisites)
        set_transient( 'wpstg_activation_redirect', true, 3600 );
    }

    private function createHtaccess() {
        $htaccess = new Htaccess();
        $htaccess->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . '.htaccess' );
        $htaccess->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'logs/.htaccess' );

        if( extension_loaded( 'litespeed' ) ) {
            $htaccess->createLitespeed( ABSPATH . '.htaccess' );
        }
    }

    private function createIndex() {
        $filesystem = new Filesystem();
        $filesystem->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'index.php', "<?php // silence" );
        $filesystem->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'logs/index.php', "<?php // silence" );
    }

    private function createWebConfig() {
        $webconfig = new IISWebConfig();
        $webconfig->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'web.config' );
        $webconfig->create( trailingslashit( \WPStaging\WPStaging::getContentDir() ) . 'logs/web.config' );
    }

}

new Install();
