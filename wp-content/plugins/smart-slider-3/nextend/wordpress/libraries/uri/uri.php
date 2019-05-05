<?php

class N2Uri extends N2UriAbstract {

    public $uris = array();

    function __construct() {

        $this->uris[] = WP_PLUGIN_URL;

        $this->_baseuri = content_url();

        if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) != 'off') {
            $this->_baseuri = str_replace('http://', 'https://', $this->_baseuri);
        }
        self::$scheme = parse_url($this->_baseuri, PHP_URL_SCHEME);

        $this->uris[] = $this->_baseuri;


        $wp_upload_dir = wp_upload_dir();
        $uploadUri     = rtrim($wp_upload_dir['baseurl'], "/\\");
        if (strpos($this->_baseuri, $uploadUri) !== 0) {
            if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) != 'off') {
                $uploadUri = str_replace('http://', 'https://', $uploadUri);
            }
            $this->uris[] = $uploadUri;
        }

    }

    public static function ajaxUri($query = '', $magento = 'nextendlibrary') {
        return site_url('/wp-admin/admin-ajax.php?action=' . $query);
    }

    public static function getUris() {
        $i = N2Uri::getInstance();

        return $i->uris;
    }

    static function pathToUri($path, $protocol = true) {
        $paths = N2Filesystem::getPaths();

        foreach ($paths AS $i => $_path) {
            if (substr($path, 0, strlen($_path)) == $_path) {
                $ins = N2Uri::getInstance();

                return $ins->getUriByIndex($i, $protocol) . str_replace(array(
                        $_path,
                        DIRECTORY_SEPARATOR
                    ), array(
                        '',
                        '/'
                    ), str_replace('/', DIRECTORY_SEPARATOR, $path));
            }
        }
        if (substr($path, 0, 1) == '/') {
            return N2Uri::getBaseUri() . $path;
        }

        return $path;
    }

    public function getUriByIndex($i, $protocol = true) {
        if (!$protocol) {
            return preg_replace('/^http:/', '', $this->uris[$i]);
        }

        return $this->uris[$i];
    }
}