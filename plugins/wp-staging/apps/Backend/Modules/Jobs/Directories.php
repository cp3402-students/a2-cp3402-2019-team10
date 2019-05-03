<?php

namespace WPStaging\Backend\Modules\Jobs;

// No Direct Access
if( !defined( "WPINC" ) ) {
    die;
}

use WPStaging\WPStaging;
use WPStaging\Utils\Logger;
use WPStaging\Utils\Strings;
use WPStaging\Iterators\RecursiveDirectoryIterator;
use WPStaging\Iterators\RecursiveFilterExclude;

/**
 * Class Files
 * @package WPStaging\Backend\Modules\Directories
 */
class Directories extends JobExecutable {

    /**
     * @var array
     */
    private $files = array();

    /**
     * Total steps to do
     * @var int
     */
    private $total = 4;

    /**
     * path to the cache file
     * @var string 
     */
    private $filename;

    /**
     * Initialize
     */
    public function initialize() {
        $this->filename = $this->cache->getCacheDir() . "files_to_copy." . $this->cache->getCacheExtension();
    }

    /**
     * Calculate Total Steps in This Job and Assign It to $this->options->totalSteps
     * @return void
     */
    protected function calculateTotalSteps() {

        $this->options->totalSteps = $this->total + count( $this->options->extraDirectories );
    }

    /**
     * Start Module
     * @return object
     */
    public function start() {

        // Execute steps
        $this->run();

        // Save option, progress
        $this->saveProgress();

        return ( object ) $this->response;
    }

    /**
     * Step 0 
     * Get WP Root files
     * Does not collect any sub folders
     */
    private function getWpRootFiles() {

        // open file handle
        $files = $this->open( $this->filename, 'a' );


        try {

            // Iterate over wp root directory
            $iterator = new \DirectoryIterator( \WPStaging\WPStaging::getWPpath() );

            $this->log( "Scanning / for files" );

            // Write path line
            foreach ( $iterator as $item ) {
                if( !$item->isDot() && $item->isFile() ) {
                    if( $this->write( $files, $iterator->getFilename() . PHP_EOL ) ) {
                        $this->options->totalFiles++;

                        // Too much cpu time
                        //$this->options->totalFileSize += $iterator->getSize();
                    }
                }
            }
        } catch ( \Exception $e ) {
            $this->returnException( 'Error: ' . $e->getMessage() );
        } catch ( \Exception $e ) {
            // Skip bad file permissions
        }

        $this->close( $files );
        return true;
    }

    /**
     * Step 2
     * Get WP Content Files
     */
    private function getWpContentFiles() {

        // Skip it
        if( $this->isDirectoryExcluded( WP_CONTENT_DIR ) ) {
            $this->log( "Skip " . \WPStaging\WPStaging::getWPpath() . 'wp-content' . DIRECTORY_SEPARATOR );
            return true;
        }
        // open file handle
        $files = $this->open( $this->filename, 'a' );

        $excludeWpContent = array(
            'cache',
            'wps-hide-login',
            'node_modules'
        );

        try {

            // Iterate over content directory
            $iterator = new \WPStaging\Iterators\RecursiveDirectoryIterator( WP_CONTENT_DIR );

            // Exclude new line file names Do not use this. Leads to error 500 on some systems
            // $iterator = new \WPStaging\Iterators\RecursiveFilterNewLine( $iterator );

            // Exclude uploads, plugins or themes
            $iterator = new \WPStaging\Iterators\RecursiveFilterExclude( $iterator, apply_filters( 'wpstg_clone_excl_folders', $excludeWpContent ) );
            // Recursively iterate over content directory
            $iterator = new \RecursiveIteratorIterator( $iterator, \RecursiveIteratorIterator::LEAVES_ONLY, \RecursiveIteratorIterator::CATCH_GET_CHILD );

            $this->log( "Scanning wp-content folder " . WP_CONTENT_DIR );

            // Write path line
            foreach ( $iterator as $item ) {
                if( $item->isFile() ) {
                    $wpContentDir = str_replace(ABSPATH, '', WP_CONTENT_DIR);
                    if( $this->write( $files, $wpContentDir . '/' . $iterator->getSubPathName() . PHP_EOL ) ) {
                        $this->options->totalFiles++;

                        // Too much cpu time
                        //$this->options->totalFileSize += $iterator->getSize();
                    }
                }
            }
        } catch ( \Exception $e ) {
            $this->returnException( 'Error: ' . $e->getMessage() );
            //throw new \Exception( 'Error: ' . $e->getMessage() );
        }

        // close the file handler
        $this->close( $files );
        return true;
    }

    /**
     * Step 2
     * @return boolean
     * @throws \Exception
     */
    private function getWpIncludesFiles() {

        // Skip it
        if( $this->isDirectoryExcluded( \WPStaging\WPStaging::getWPpath() . 'wp-includes' . DIRECTORY_SEPARATOR ) ) {
            $this->log( "Skip " . \WPStaging\WPStaging::getWPpath() . 'wp-includes' . DIRECTORY_SEPARATOR );
            return true;
        }

        // open file handle and attach data to end of file
        $files = $this->open( $this->filename, 'a' );

        try {

            // Iterate over wp-admin directory
            $iterator = new \WPStaging\Iterators\RecursiveDirectoryIterator( \WPStaging\WPStaging::getWPpath() . 'wp-includes' . DIRECTORY_SEPARATOR );

            // Exclude new line file names Do not use this. Leads to error 500 on some systems
            // $iterator = new \WPStaging\Iterators\RecursiveFilterNewLine( $iterator );

            // Recursively iterate over wp-includes directory
            $iterator = new \RecursiveIteratorIterator( $iterator, \RecursiveIteratorIterator::LEAVES_ONLY, \RecursiveIteratorIterator::CATCH_GET_CHILD );

            $this->log( "Scanning /wp-includes for its sub-directories and files" );

            // Write files
            foreach ( $iterator as $item ) {
                if( $item->isFile() ) {
                    if( $this->write( $files, 'wp-includes' . DIRECTORY_SEPARATOR . $iterator->getSubPathName() . PHP_EOL ) ) {
                        $this->options->totalFiles++;

                        // Too much cpu time
                        //$this->options->totalFileSize += $iterator->getSize();
                    }
                }
            }
        } catch ( \Exception $e ) {
            //$this->returnException('Out of disk space.');
            throw new \Exception( 'Error: ' . $e->getMessage() );
        } catch ( \Exception $e ) {
            // Skip bad file permissions
        }

        // close the file handler
        $this->close( $files );
        return true;
    }

    /**
     * Step 3
     * @return boolean
     * @throws \Exception
     */
    private function getWpAdminFiles() {

        // Skip it
        if( $this->isDirectoryExcluded( \WPStaging\WPStaging::getWPpath() . 'wp-admin' . DIRECTORY_SEPARATOR ) ) {
            $this->log( "Skip " . \WPStaging\WPStaging::getWPpath() . 'wp-admin' . DIRECTORY_SEPARATOR );
            return true;
        }

        // open file handle and attach data to end of file
        $files = $this->open( $this->filename, 'a' );

        try {

            // Iterate over wp-admin directory
            $iterator = new \WPStaging\Iterators\RecursiveDirectoryIterator( \WPStaging\WPStaging::getWPpath() . 'wp-admin' . DIRECTORY_SEPARATOR );

            // Exclude new line file names Do not use this. Leads to error 500 on some systems
            // $iterator = new \WPStaging\Iterators\RecursiveFilterNewLine( $iterator );

            // Recursively iterate over content directory
            $iterator = new \RecursiveIteratorIterator( $iterator, \RecursiveIteratorIterator::LEAVES_ONLY, \RecursiveIteratorIterator::CATCH_GET_CHILD );

            $this->log( "Scanning /wp-admin for its sub-directories and files" );

            // Write path line
            foreach ( $iterator as $item ) {
                if( $item->isFile() ) {
                    if( $this->write( $files, 'wp-admin' . DIRECTORY_SEPARATOR . $iterator->getSubPathName() . PHP_EOL ) ) {
                        $this->options->totalFiles++;
                        // Too much cpu time
                        //$this->options->totalFileSize += $iterator->getSize();
                    }
                }
            }
        } catch ( \Exception $e ) {
            $this->returnException( 'Error: ' . $e->getMessage() );
        } catch ( \Exception $e ) {
            // Skip bad file permissions
        }

        // close the file handler
        $this->close( $files );
        return true;
    }

    /**
     * Step 4 - x 
     * Get extra folders of the wp root level
     * Does not collect wp-includes, wp-admin and wp-content folder
     */
    private function getExtraFiles( $folder ) {

        if( !is_dir( $folder ) ) {
            return true;
        }

        // open file handle and attach data to end of file
        $files = $this->open( $this->filename, 'a' );

        try {

            // Iterate over extra directory
            $iterator = new \WPStaging\Iterators\RecursiveDirectoryIterator( $folder );

            // Exclude new line file names Do not use this. Leads to error 500 on some systems
            // $iterator = new \WPStaging\Iterators\RecursiveFilterNewLine( $iterator );

            $exclude = array();

            $iterator = new \WPStaging\Iterators\RecursiveFilterExclude( $iterator, $exclude );
            // Recursively iterate over content directory
            $iterator = new \RecursiveIteratorIterator( $iterator, \RecursiveIteratorIterator::LEAVES_ONLY, \RecursiveIteratorIterator::CATCH_GET_CHILD );

            $strings = new Strings();
            $this->log( "Scanning {$strings->getLastElemAfterString( '/', $folder )} for its sub-directories and files" );

            // Write path line
            foreach ( $iterator as $item ) {
                if( $item->isFile() ) {
                    //if( $this->write( $files, $strings->getLastElemAfterString( '/', $folder ) . DIRECTORY_SEPARATOR . $iterator->getSubPathName() . PHP_EOL ) ) {
                    if( $this->write( $files, str_replace( \WPStaging\WPStaging::getWPpath(), '', $folder ) . DIRECTORY_SEPARATOR . $iterator->getSubPathName() . PHP_EOL ) ) {
                        $this->options->totalFiles++;
                        // Too much cpu time
                        //$this->options->totalFileSize += $iterator->getSize();
                    }
                }
            }
        } catch ( \Exception $e ) {
            $this->returnException( 'Error: ' . $e->getMessage() );
        } catch ( \Exception $e ) {
            // Skip bad file permissions
        }

        // close the file handler
        $this->close( $files );
        return true;
    }

    /**
     * Closes a file handle
     *
     * @param  resource $handle File handle to close
     * @return boolean
     */
    public function close( $handle ) {
        return @fclose( $handle );
    }

    /**
     * Opens a file in specified mode
     *
     * @param  string   $file Path to the file to open
     * @param  string   $mode Mode in which to open the file
     * @return resource
     * @throws Exception
     */
    public function open( $file, $mode ) {

        $file_handle = @fopen( $file, $mode );
        if( false === $file_handle ) {
            $this->returnException( sprintf( __( 'Unable to open %s with mode %s', 'wp-staging' ), $file, $mode ) );
            //throw new Exception(sprintf(__('Unable to open %s with mode %s', 'wp-staging'), $file, $mode));
        }

        return $file_handle;
    }

    /**
     * Write contents to a file
     *
     * @param  resource $handle  File handle to write to
     * @param  string   $content Contents to write to the file
     * @return integer
     * @throws Exception
     * @throws Exception
     */
    public function write( $handle, $content ) {
        $write_result = @fwrite( $handle, $content );
        if( false === $write_result ) {
            if( ( $meta = \stream_get_meta_data( $handle ) ) ) {
                //$this->returnException(sprintf(__('Unable to write to: %s', 'wp-staging'), $meta['uri']));
                throw new \Exception( sprintf( __( 'Unable to write to: %s', 'wp-staging' ), $meta['uri'] ) );
            }
        } elseif( strlen( $content ) !== $write_result ) {
            //$this->returnException(__('Out of disk space.', 'wp-staging'));
            throw new \Exception( __( 'Out of disk space.', 'wp-staging' ) );
        }

        return $write_result;
    }

    /**
     * Execute the Current Step
     * Returns false when over threshold limits are hit or when the job is done, true otherwise
     * @return bool
     */
    protected function execute() {

        // No job left to execute
        if( $this->isFinished() ) {
            $this->prepareResponse( true, false );
            return false;
        }


        if( $this->options->currentStep == 0 ) {
            $this->getWpRootFiles();
            $this->prepareResponse( false, true );
            return false;
        }

        if( $this->options->currentStep == 1 ) {
            $this->getWpContentFiles();
            $this->prepareResponse( false, true );
            return false;
        }

        if( $this->options->currentStep == 2 ) {
            $this->getWpIncludesFiles();
            $this->prepareResponse( false, true );
            return false;
        }

        if( $this->options->currentStep == 3 ) {
            $this->getWpAdminFiles();
            $this->prepareResponse( false, true );
            return false;
        }

        if( isset( $this->options->extraDirectories[$this->options->currentStep - $this->total] ) ) {
            $this->getExtraFiles( $this->options->extraDirectories[$this->options->currentStep - $this->total] );
            $this->prepareResponse( false, true );
            return false;
        }


        // Prepare response
        $this->prepareResponse( false, true );
        // Not finished
        return true;
    }

    /**
     * Checks Whether There is Any Job to Execute or Not
     * @return bool
     */
    protected function isFinished() {
        if( $this->options->currentStep >= $this->options->totalSteps ) {
            return true;
        }
    }

    /**
     * Save files
     * @return bool
     */
    protected function saveProgress() {
        return $this->saveOptions();
    }

    /**
     * Get files
     * @return void
     */
    protected function getFiles() {
        $fileName = $this->cache->getCacheDir() . "files_to_copy." . $this->cache->getCacheExtension();

        if( false === ($this->files = @file_get_contents( $fileName )) ) {
            $this->files = array();
            return;
        }

        $this->files = explode( PHP_EOL, $this->files );
    }

    /**
     * Replace forward slash with current directory separator
     *
     * @param string $path Path
     *
     * @return string
     */
    private function sanitizeDirectorySeparator( $path ) {
        $string = str_replace( "/", "\\", $path );
        return str_replace( '\\\\', '\\', $string );
    }

    /**
     * Check if directory is excluded
     * @param string $directory
     * @return bool
     */
    protected function isDirectoryExcluded( $directory ) {
        $directory = $this->sanitizeDirectorySeparator( $directory );
        foreach ( $this->options->excludedDirectories as $excludedDirectory ) {
            $excludedDirectory = $this->sanitizeDirectorySeparator( $excludedDirectory );
            if( strpos( trailingslashit( $directory ), trailingslashit( $excludedDirectory ) ) === 0 ) {
                return true;
            }
        }

        return false;
    }

}
