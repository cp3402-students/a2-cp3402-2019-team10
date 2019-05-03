<?php

namespace WPStaging\Backend\Modules\Jobs;

use WPStaging\WPStaging;

/**
 * Class Finish
 * @package WPStaging\Backend\Modules\Jobs
 */
class Finish extends Job {

    /**
     * Clone Key
     * @var string 
     */
    private $clone = '';

    /**
     * Start Module
     * @return object
     */
    public function start() {
        // sanitize the clone name before saving
        $this->clone = preg_replace( "#\W+#", '-', strtolower( $this->options->clone ) );

        // Delete Cache Files
        $this->deleteCacheFiles();

        // Prepare clone records & save scanned directories for delete job later
        $this->prepareCloneDataRecords();

        $this->options->isRunning = false;

        $return = array(
            "directoryName" => $this->options->cloneDirectoryName,
            "path"          => trailingslashit( $this->options->destinationDir ),
            "url"           => $this->getDestinationUrl(),
            "number"        => $this->options->cloneNumber,
            "version"       => \WPStaging\WPStaging::VERSION,
            "status"        => 'finished',
            "prefix"        => $this->options->prefix,
            "last_msg"      => $this->logger->getLastLogMsg(),
            "job"           => $this->options->currentJob,
            "percentage"    => 100
        );

        //$this->flush();

        return ( object ) $return;
    }

    /**
     * Delete Cache Files
     */
    protected function deleteCacheFiles() {
        $this->log( "Finish: Deleting clone job's cache files..." );

        // Clean cache files
        $this->cache->delete( "clone_options" );
        $this->cache->delete( "files_to_copy" );

        $this->log( "Finish: Clone job's cache files have been deleted!" );
    }

    /**
     * Prepare clone records
     * @return bool
     */
    protected function prepareCloneDataRecords() {
        // Check if clones still exist
        $this->log( "Finish: Verifying existing clones..." );

        // Clone data already exists
        if( isset( $this->options->existingClones[$this->options->clone] ) ) {
            $this->options->existingClones[$this->options->clone]['datetime'] = time();
            update_option( "wpstg_existing_clones_beta", $this->options->existingClones );
            $this->log( "Finish: The job finished!" );
            return true;
        }

        // Save new clone data
        $this->log( "Finish: {$this->options->clone}'s clone job's data is not in database, generating data" );

        // sanitize the clone name before saving
        //$clone = preg_replace("#\W+#", '-', strtolower($this->options->clone));

        $this->options->existingClones[$this->clone] = array(
            "directoryName"    => $this->options->cloneDirectoryName,
            "path"             => trailingslashit( $this->options->destinationDir ),
            "url"              => $this->getDestinationUrl(),
            "number"           => $this->options->cloneNumber,
            "version"          => \WPStaging\WPStaging::VERSION,
            "status"           => false,
            "prefix"           => $this->options->prefix,
            "datetime"         => time(),
            "databaseUser"     => $this->options->databaseUser,
            "databasePassword" => $this->options->databasePassword,
            "databaseDatabase" => $this->options->databaseDatabase,
            "databaseServer"   => $this->options->databaseServer,
            "databasePrefix"   => $this->options->databasePrefix
        );

        if( false === update_option( "wpstg_existing_clones_beta", $this->options->existingClones ) ) {
            $this->log( "Finish: Failed to save {$this->options->clone}'s clone job data to database'" );
            return false;
        }

        return true;
    }

    /**
     * Get destination Hostname depending on wheather WP has been installed in sub dir or not
     * @return type
     */
    private function getDestinationUrl() {

        if( !empty( $this->options->cloneHostname ) ) {
            return $this->options->cloneHostname;
}

        return trailingslashit( get_site_url() ) . $this->options->cloneDirectoryName;
    }
}
