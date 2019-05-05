<?php

class N2Platform {

    public static $isAdmin = false;

    public static $hasPosts = true, $isJoomla = false, $isWordpress = false, $isMagento = false, $isNative = false;

    public static $name;

    private static $needCredentials = false;

    public static function init() {
        self::$isWordpress = get_bloginfo('version');
        if (basename($_SERVER['PHP_SELF']) == 'admin.php') {
            self::$isAdmin = true;
        }
    }

    public static function getSiteUrl() {
        return str_replace(array(
            'http://',
            'https://'
        ), '//', site_url('/'));
    }

    public static function getPlatform() {
        return 'wordpress';
    }

    public static function getPlatformName() {
        return 'WordPress';
    }

    public static function getPlatformVersion() {
        global $wp_version;

        return $wp_version;
    }

    public static function getCharset() {
        return get_option('blog_charset');
    }

    public static function getDate() {
        return current_time('mysql');
    }

    public static function getTime() {
        return current_time('timestamp');
    }

    public static function getPublicDir() {
        $upload_dir = wp_upload_dir();

        return N2Filesystem::fixPathSeparator(str_replace('//', '/', $upload_dir['basedir']));
    }

    public static function getUserEmail() {
        return wp_get_current_user()->user_email;
    }

    public static function needStrongerCSS() {
        static $need = null;
        if ($need === null) {
            if (!N2Platform::$isAdmin && function_exists('et_is_builder_plugin_active') && et_is_builder_plugin_active()) {
                $need = true;
            }
            if ($need === null) {
                $need = false;
            }
        }

        return $need;
    }

    public static function adminHideCSS() {
        echo '
            html {
                background: #ffffff;
            }

            html.wp-toolbar {
                padding: 0;
            }

            #wpadminbar,
            #adminmenuwrap,
            #adminmenuback,
            .update-nag{
                display: none !important;
            }

            #wpcontent {
                margin: 0 !important;
                padding-left: 0;
                padding-right: 0;
            }
        ';
    }

    public static function updateFromZip($fileRaw, $updateInfo) {

        add_filter('fs_ftp_connection_types', array(
            'N2Platform',
            'isFTPCredentialsNeeded'
        ));

        N2Loader::import('libraries.zip.reader');

        $tmpHandle = tmpfile();
        fwrite($tmpHandle, $fileRaw);
        $metaData    = stream_get_meta_data($tmpHandle);
        $tmpFilename = $metaData['uri'];

        $_GET['plugins'] = $updateInfo['plugin'];
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        $upgrader = new Plugin_Upgrader(new Plugin_Upgrader_Skin(compact('title', 'nonce', 'url', 'plugin')));

        $upgrader->init();
        $upgrader->upgrade_strings();

        add_filter('upgrader_pre_install', array(
            $upgrader,
            'deactivate_plugin_before_upgrade'
        ), 10, 2);
        add_filter('upgrader_clear_destination', array(
            $upgrader,
            'delete_old_plugin'
        ), 10, 4);

        $upgrader->run(array(
            'package'           => $tmpFilename,
            'destination'       => WP_PLUGIN_DIR,
            'clear_destination' => true,
            'clear_working'     => true,
            'hook_extra'        => array(
                'plugin' => $updateInfo['plugin'],
                'type'   => 'plugin',
                'action' => 'update',
            ),
        ));

        // Cleanup our hooks, in case something else does a upgrade on this connection.
        remove_filter('upgrader_pre_install', array(
            $upgrader,
            'deactivate_plugin_before_upgrade'
        ));
        remove_filter('upgrader_clear_destination', array(
            $upgrader,
            'delete_old_plugin'
        ));

        if (self::$needCredentials) {
            fclose($tmpHandle);

            return 'CREDENTIALS';
        }

        // Force refresh of plugin update information
        wp_clean_plugins_cache(true);
        fclose($tmpHandle);

        include(ABSPATH . 'wp-admin/admin-footer.php');

        return true;
    }

    public static function isFTPCredentialsNeeded($types) {
        self::$needCredentials = true;

        return $types;
    }

    public static function getDebug() {
        $debug = array('');


        $debug[] = 'Path to uri:';
        $uris    = N2Uri::getUris();
        $paths   = N2Filesystem::getPaths();
        foreach ($uris AS $i => $uri) {
            $debug[] = $paths[$i] . ' => ' . $uri;
        }

        $debug[] = '';
        $debug[] = 'wp_upload_dir() => ';
        foreach (wp_upload_dir() AS $k => $v) {
            $debug[] = $k . ': ' . $v;
        }
        $debug[] = '<=';
        $debug[] = '';

        $theme       = wp_get_theme();
        $parentTheme = $theme->parent();
        if ($parentTheme) {
            $debug[] = 'Parent theme: ' . $theme->get('Name') . " is version " . $theme->get('Version');
        }
        $debug[] = 'Theme: ' . $theme->get('Name') . " is version " . $theme->get('Version');


        $plugins   = get_plugins();
        $notActive = array();

        $debug[] = '';
        $debug[] = 'Activated Plugins:';
        foreach ($plugins AS $plugin => $pluginData) {
            if (is_plugin_active($plugin)) {
                $debug[] = ' - ' . $plugin . ' - ' . $pluginData['Version'] . ' - ' . $pluginData['Name'];
            } else {
                $notActive[$plugin] = $pluginData;
            }
        }

        $debug[] = '';
        $debug[] = '';
        $debug[] = 'NOT Activated Plugins:';
        foreach ($notActive AS $plugin => $pluginData) {
            $debug[] = ' - ' . $plugin . ' - ' . $pluginData['Version'] . ' - ' . $pluginData['Name'];
        }

        return $debug;
    }

}

N2Platform::init();
