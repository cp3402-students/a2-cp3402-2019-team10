<?php

/**
 * JCU CNS 2019 SP1 CP3402 A2 Team 10.
 * @author Yvan Burrie
 */

namespace cp3402;

use ErrorException, UnexpectedValueException;

set_error_handler(
    function ( int $type, string $data, string $file = '', int $line = 0 ){
        if( error_reporting() & $type ){
            throw new ErrorException($data, $code = 0, $type, $file, $line);
        }
    }
);

/**
 * @package cp3402
 */
class Configurations {

    /**
     * @var string
     */
    public $output = '';

    /**
     * @var string[]
     */
    public $basePath = [];

    /**
     * @var string
     */
    public $baseName = 'd';

    /**
     * @var int
     */
    public $repoId = 0;

    /**
     * @var string
     */
    public $repoName = '';

    /**
     * @var Developer[]
     */
    public $developers = [];

    /**
     * @param string|null $message
     * @param string[]|null $extras
     * @return static
     */
    public function log( string $message = NULL, string ... $extras ){
        count($params = func_get_args()) ?
            is_string($string = call_user_func_array('sprintf', $params)) &&
            $this->output .= $string :
            $this->output .= "\n";
        return $this;
    }

    /**
     *
     */
    public function flush(){
        echo $this->output;
        $this->output = '';
    }

    /**
     * @param string $path
     * @return array
     */
    public static function convertPath( string $path ){
        return explode('/', str_replace('*', getcwd(), $path));
    }

    /**
     * @param string $fileName
     * @return static
     */
    public static function openIni( string $fileName ){
        $that = new static;
        $data = parse_ini_file($fileName, TRUE, INI_SCANNER_RAW);
        if( is_array($data) ){
            $that->loadIni($data);
        }else{
            $that->log($message = 'Failed to read INI file (%s).', $fileName)->log();
            throw new UnexpectedValueException($message);
        }
        return $that;
    }

    /**
     * @param array $data
     */
    public function loadIni( array $data ){
        $buffer1 = &$data['base_name'];
        $buffer1 !== NULL && $this->baseName = (string)$buffer1;
        $buffer1 = &$data['base_path'];
        $buffer1 !== NULL && $this->basePath = $this::convertPath((string)$buffer1);
        $buffer1 = &$data['repo_id'];
        $buffer1 !== NULL && $this->repoId = (int)$buffer1;
        $buffer1 = &$data['repo_name'];
        $buffer1 !== NULL && $this->repoName = (string)$buffer1;
        $buffer1 = &$data['developers'];
        if( is_array($buffer1) ){
            foreach( $buffer1 as $bufferKey => $bufferVal ){
                if( (int)$bufferVal === 0 ) continue;
                $developer = new Developer($this, (string)$bufferKey);
                $developer->database = new Database($developer);
                $buffer2 =& $data['dev:' . $developer->identifier];
                if( is_array($buffer2) ){
                    $buffer3 = &$buffer2['git_path'];
                    $buffer3 !== NULL && $developer->gitPath = $this::convertPath((string)$buffer3);
                    $buffer3 = &$buffer2['mysql_path'];
                    $buffer3 !== NULL && $developer->mysqlPath = $this::convertPath((string)$buffer3);
                    $buffer3 = &$buffer2['root_path'];
                    $buffer3 !== NULL && $developer->rootPath = $this::convertPath((string)$buffer3);
                    $buffer3 = &$buffer2['db_name'];
                    $buffer3 !== NULL && $developer->database->name = (string)$buffer3;
                    $buffer3 = &$buffer2['db_user'];
                    $buffer3 !== NULL && $developer->database->user = (string)$buffer3;
                    $buffer3 = &$buffer2['db_pass'];
                    $buffer3 !== NULL && $developer->database->pass = (string)$buffer3;
                    $buffer3 = &$buffer2['wp_url'];
                    $buffer3 !== NULL && $developer->wpUrl = (string)$buffer3;
                }
                $this->developers[] = $developer;
            }
        }
    }

    /**
     * @param array $post
     * @param int $developerId
     * @return bool
     */
    public function handleHook( array $post, int $developerId = 0 ){
        $this->log('Attempting to hook.')->log();
        if( !isset($post['repository']) ||
            !isset($post['pusher']) ||
            !isset($post['organization']) ||
            !isset($post['sender']) ||
            !isset($post['commits']) ){
            $this->log('Invalid hook request.')->log();
            return FALSE;
        }
        $this->log('Verifying repository.')->log();
        if( $this->repoId != $postedRepoId = &$post['repository']['id'] ){
            $this->log('Repository ID (%d) mismatches (%d).', $postedRepoId, $this->repoId)->log();
            return FALSE;
        }
        if( $this->repoName != $postedRepoName = &$post['repository']['name'] ){
            $this->log('Repository name (%s) mismatches (%s).', $postedRepoName, $this->repoName)->log();
            return FALSE;
        }
        $this->log('Verifying server as developer.')->log();
        if( !$developer = &$this->developers[$developerId] ){
            return FALSE;
        }
        if( !is_array($postedCommits = &$post['commits']) ){
            $this->log('Invalid data for committed files.')->log();
            return FALSE;
        }
        if( count($postedCommits) ){
            $developer->pull();
        }
        foreach( $postedCommits as $postedCommitId => $postedCommit ){
            $this->log('Iterating commit %d of %d.', $postedCommitId, count($postedCommits))->log();
            if( !is_array($postedCommit) ) continue;
            $postedCommitFiles = [];
            if( is_array($postedCommitFiles1 = &$postedCommit['modified']) ){
                $postedCommitFiles = array_merge($postedCommitFiles, $postedCommitFiles1);
            }
            if( is_array($postedCommitFiles2 = &$postedCommit['added']) ){
                $postedCommitFiles = array_merge($postedCommitFiles, $postedCommitFiles2);
            }
            foreach( $postedCommitFiles as $postedCommitFileId => $postedCommitFileName ){
                $this->log("\t" . 'Iterating committed file (%s) %d of %d.', $postedCommitFileName, $postedCommitFileId, count($postedCommitFiles))->log();
                $filePath = implode('/', array_merge($developer->rootPath, [$this->baseName . '.sql']));
                $filePath = str_replace(getcwd(), '', $filePath);
                $this->log("\t" . 'Checking %s.', $filePath)->log();
                if( $filePath == $postedCommitFileName ){
                    $this->log("\t" . 'Database dump file was finally found.')->log();
                    $developer->database->import();
                    break 2;
                }
            }
        }
        return TRUE;
    }

    /**
     *
     */
    public function __destruct(){
        file_put_contents(sprintf('output %d.log', time()), $this->output);
        $this->output = '';
    }
}

/**
 * @package cp3402
 */
class Developer {

    /**
     * @var Configurations
     */
    public $configurations;

    /**
     * @var string
     */
    public $identifier = 'unknown';

    /**
     * @var Database
     */
    public $database;

    /**
     * @var string[]|null
     */
    public $gitPath = NULL;

    /**
     * @var string[]|null
     */
    public $mysqlPath = NULL;

    /**
     * @var string[]|null
     */
    public $rootPath = NULL;

    /**
     * @var string
     */
    public $wpUrl = 'http://localhost/';

    /**
     * @param Configurations $configurations
     * @param string $identifier
     */
    public function __construct( Configurations $configurations, string $identifier = NULL ){
        $this->configurations = $configurations;
        $this->identifier = $identifier ?: NULL;
    }

    /**
     * @return bool
     */
    public function push(){
        $fullPath = implode(DIRECTORY_SEPARATOR, $this->rootPath);
        $this->configurations->log('Attempting to redirect to:')->log();
        $this->configurations->log("\t" . '%s', $fullPath)->log();
        $command = 'cd ' . $fullPath;
        system($command, $result);
        if( $result !== 0 ){
            $this->configurations->log('Directory change failed.')->log();
            return FALSE;
        }
        /** @var string $command */
        $command = $this->gitPath !== NULL ?
            '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->gitPath, ['bin', 'git.exe'])) . '"' :
            'git';
        $command .= ' ';
        $command .= 'push origin master';
        $this->configurations->log('Attempting to push repository with the following command:')->log();
        $this->configurations->log("\t" . '%s', $command)->log();
        system($command, $result);
        if( $result === 0 ){
            $this->configurations->log('Command success.')->log();
            return TRUE;
        }else{
            $this->configurations->log('Command failure.')->log();
            return FALSE;
        }
    }

    /**
     * @return bool
     */
    public function pull() {
        $fullPath = implode(DIRECTORY_SEPARATOR, $this->rootPath);
        $this->configurations->log('Attempting to redirect to:')->log();
        $this->configurations->log("\t" . '%s', $fullPath)->log();
        $command = 'cd ' . $fullPath;
        system($command, $result);
        if( $result !== 0 ){
            $this->configurations->log('Directory change failed.')->log();
            return FALSE;
        }
        /** @var string $command */
        $command = $this->gitPath !== NULL ?
            '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->gitPath, ['bin', 'git.exe'])) . '"' :
            'git';
        $command .= ' ';
        $command .= 'pull > git-pull.txt';
        $command .= ' ';
        $command .= '2> git-pull.err';
        $this->configurations->log('Attempting to pull repository with the following command:')->log();
        $this->configurations->log("\t" . '%s', $command)->log();
        system($command, $result);
        if( $result === 0 ){
            $this->configurations->log('Command success.')->log();
            return TRUE;
        }else{
            $this->configurations->log('Command failure.')->log();
            return FALSE;
        }
    }
}

/**
 * @package cp3402
 */
class Database {

    /**
     * @var Configurations
     */
    public $configurations;

    /**
     * @var Developer
     */
    public $developer;

    /**
     * @var string
     */
    public $name = 'n';

    /**
     * @var string
     */
    public $user = 'u';

    /**
     * @var string|null
     */
    public $pass = NULL;

    /**
     * @param Developer $developer
     */
    public function __construct( Developer $developer ){
        $this->developer = $developer;
        $this->configurations = $developer->configurations;
    }

    /**
     * @return bool
     */
    public function export(){
        /** @var string $command */
        $command = $this->developer->mysqlPath ?
            '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->developer->mysqlPath, ['bin', 'mysqldump.exe'])) . '"' :
            'mysqldump';
        $command .= ' ';
        $command .= $this->name;
        $command .= ' ';
        if( $this->pass !== NULL ){
            $command .= '--password=' . base64_decode($this->pass);
            $command .= ' ';
        }
        $command .= '--user=' . $this->user;
        $command .= ' ';
        $filePath = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$this->configurations->baseName . '.sql']));
        $command .= '--single-transaction >' . $filePath;
        $command .= ' ';
        $command .= '2> ' . implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$this->configurations->baseName . '.err']));
        $this->configurations->log('Attempting to export database with the following command:')->log();
        $this->configurations->log('%s%s', "\t", $command)->log();
        system($command, $result);
        if( $result === 0 ){
            $this->configurations->log('Command success.')->log();
            if( file_exists($filePath) ){
                file_put_contents(
                    $filePath2 = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$this->configurations->baseName . ' ' . time() . ' (' . $this->developer->identifier . ').sql'])),
                    file_get_contents($filePath));
            }
            return TRUE;
        }else{
            $this->configurations->log('Command failure.')->log();
            return FALSE;
        }
    }

    /**
     * @return bool
     */
    public function import(){
        $filePath = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$this->configurations->baseName . '.sql']));
        if( FALSE === file_exists($filePath) ){
            $this->configurations->log('Latest database backup file (%s) inexistent.', $filePath)->log();
            return FALSE;
        }
        /** @var string $command */
        $command = $this->developer->mysqlPath ?
            '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->developer->mysqlPath, ['bin', 'mysql.exe'])) . '"' :
            'mysql';
        $command .= ' ';
        $command .= '-u ' . $this->user;
        $command .= ' ';
        if( $this->pass !== NULL ){
            $command .= '-p ' . base64_decode($this->pass);
            $command .= ' ';
        }
        $command .= $this->name;
        $command .= ' ';
        $command .= '< ' . $filePath;
        $this->configurations->log('Attempting to import database with the following command:')->log();
        $this->configurations->log('%s%s', "\t", $command)->log();
        system($command, $result);
        if( $result === 0 ){
            $this->configurations->log('Command success.')->log();
            return TRUE;
        }else{
            $this->configurations->log('Command failure.')->log();
            return FALSE;
        }
    }

    /**
     * @return bool
     */
    public function modifyWpHost(){
        $queries = [
            'UPDATE `wp_options` SET `option_value` = \'' . $this->developer->wpUrl . '\' WHERE `option_name` = \'siteurl\'',
            'UPDATE `wp_options` SET `option_value` = \'' . $this->developer->wpUrl . '\' WHERE `option_name` = \'home\'',
        ];
        /** @var string $command */
        $command = $this->developer->mysqlPath ?
            '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->developer->mysqlPath, ['bin', 'mysql.exe'])) . '"' :
            'mysql';
        $command .= ' ';
        $command .= '-u ' . $this->user;
        $command .= ' ';
        if( $this->pass !== NULL ){
            $command .= '-p ' . base64_decode($this->pass);
            $command .= ' ';
        }
        $command .= ' ';
        $command .= $this->name;
        $command .= ' ';
        $command .= '-e "' . implode('; ', $queries) . ';"';
        $this->configurations->log('Attempting to modify WP host with the following command:')->log();
        $this->configurations->log("%s%s", "\t", $command)->log();
        system($command, $result);
        if( $result === 0 ){
            $this->configurations->log('Command success.')->log();
            return TRUE;
        }else{
            $this->configurations->log('Command failure.')->log();
            return FALSE;
        }
    }
}
