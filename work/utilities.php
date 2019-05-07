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
     * @var array
     */
    public $lastBases = [];

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
    public static function convertPath( string $path ): array {
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
    public function handleHook( array $post, int $developerId = 0 ): bool {
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
     * @param string $input
     * @return bool
     */
    public function doCommand( string $input ): bool {
        $this->configurations->log('Attempting to run the following command:')->log();
        $this->configurations->log("\t" . '%s', $input)->log();
        system($input, $result);
        if( 0 === $result ){
            $this->configurations->log('Command success.')->log();
            return TRUE;
        }else{
            $this->configurations->log('Command failure.')->log();
            return FALSE;
        }
    }

    /**
     * @param string $path
     * @return bool
     */
    public function doRedirect( string $path ): bool {
        $this->configurations->log('Attempting to redirect to:')->log();
        $this->configurations->log("\t" . '%s', $path)->log();
        $command = 'cd ' . $path;
        system($command, $result);
        if( 0 === $result ){
            $this->configurations->log('Directory change success.')->log();
            return FALSE;
        }else{
            $this->configurations->log('Directory change failure.')->log();
            return TRUE;
        }
    }

    /**
     * @return string
     */
    public function getGitCommandEntry(): string {
        if( $this->gitPath === NULL ){
            return 'git';
        }else{
            return '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->gitPath, ['bin', 'git.exe'])) . '"';
        }
    }

    /**
     * @param bool $dbExport
     * @return bool
     */
    public function push( bool $dbExport = FALSE ): bool {
        $path = implode(DIRECTORY_SEPARATOR, $this->rootPath);
        if( $dbExport ){
            if( FALSE === $this->database->export(TRUE) ||
                FALSE === $this->doRedirect($path) ){
                return FALSE;
            }
            if( count($this->configurations->lastBases) ){
                $command = $this->getGitCommandEntry() . ' ';
                $command .= 'add "' . implode('" "', $this->configurations->lastBases) . '"';
                if( FALSE === $this->doCommand($command) ){
                    return FALSE;
                }
                $command = $this->getGitCommandEntry() . ' ';
                $command .= 'commit -m "Update database"';
                if( FALSE === $this->doCommand($command) ){
                    return FALSE;
                }
            }
        }
        if( FALSE === $this->doRedirect($path) ){
            return FALSE;
        }
        $command = $this->getGitCommandEntry() . ' ';
        $command .= 'push origin master';
        return $this->doCommand($command);
    }

    /**
     * @return bool
     */
    public function pull(): bool {
        $path = implode(DIRECTORY_SEPARATOR, $this->rootPath);
        if( FALSE === $this->doRedirect($path) ){
            return FALSE;
        }
        /** @var string $command */
        $command = $this->getGitCommandEntry() . ' ';
        $command .= 'pull > git-pull.txt';
        $command .= ' ';
        $command .= '2> git-pull.err';
        return $this->doCommand($command);
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
     * @param bool $overwrite
     * @return bool
     */
    public function export( bool $overwrite = FALSE ): bool {
        $filePath1 = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$this->configurations->baseName . '.sql']));
        $filePath2 = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$this->configurations->baseName . ' ' . time() . ' (' . $this->developer->identifier . ').sql']));
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
        $command .= '--single-transaction >' . $filePath2;
        $command .= ' ';
        $command .= '2> ' . implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$this->configurations->baseName . '.err']));
        if( FALSE === $this->developer->doCommand($command) ){
            return FALSE;
        }
        if( file_exists($filePath2) ){
            $this->configurations->log('Database file (%s) exists.', $filePath2)->log();
            if( $overwrite ){
                file_put_contents(
                    $filePath1,
                    file_get_contents($filePath2));
                if( file_exists($filePath1) ){
                    $this->configurations->lastBases[] = $filePath1;
                }
            }
        }
        return TRUE;
    }

    /**
     * @param bool $export
     * @param bool $modifyWpUrl
     * @return bool
     */
    public function import( bool $export = FALSE, bool $modifyWpUrl = FALSE ): bool {
        if( $export ){
            if( FALSE === $this->export(FALSE) ){
                return FALSE;
            }
        }
        $path = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$this->configurations->baseName . '.sql']));
        if( FALSE === file_exists($path) ){
            $this->configurations->log('Latest database backup file (%s) inexistent.', $path)->log();
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
        $command .= '< ' . $path;
        if( FALSE === $this->developer->doCommand($command) ){
            return FALSE;
        }
        if( $modifyWpUrl ){
            return $this->modifyWpUrl();
        }else{
            return TRUE;
        }
    }

    /**
     * @return bool
     */
    public function modifyWpUrl(): bool {
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
        return $this->developer->doCommand($command);
    }
}
