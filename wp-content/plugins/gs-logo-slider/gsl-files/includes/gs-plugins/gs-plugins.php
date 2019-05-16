<?php

if( ! class_exists( 'GSPlugins' ) ){
    
    class GSPlugins{
        
        /**
         * Singleton Instance
         *
         * @access private static
         */
        private static $_instance;
        
        public function __construct() {
            add_action( 'admin_menu', array( $this, 'gs_main_menu' ) );
        }
        
        /**
         * Get class singleton instance
         *
         * @return Class Instance
         */
        public static function get_instance() {
            if ( ! self::$_instance instanceof GSPlugins ) {
                self::$_instance = new GSPlugins();
            }
            
            return self::$_instance;
        }
                
        public function gs_main_menu() {

            add_submenu_page( 
                'edit.php?post_type=gs-logo-slider', 
                'GS Plugins', 
                'GS Plugins', 
                'manage_options', 
                'gs-add-ons', 
                array( $this, 'gs_main_menu_cb' )
                );
        }
        
        public function gs_main_menu_cb() {
            $protocol = is_ssl() ? 'https' : 'http';
            $promo_content = wp_remote_get( $protocol . '://www.gsamdani.com/gs_plugins_list/index.php' );
            echo $promo_content['body'];
        }
        
    }
    
    $tmev = GSPlugins::get_instance();  
}