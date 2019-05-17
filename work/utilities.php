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
     * @var string[]
     */
    public $output = [];

    /**
     * @var string[]
     */
    public $basePath = [];

    /**
     * @var string
     */
    public $baseName = 'd';

    /**
     * @var string
     */
    public $baseMsg = 'Update database';

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
     * @var string
     */
    public $wpPrefix = 'wp_';

    /**
     * @param string|null $message
     * @param string[]|null $extras
     * @return static
     */
    public function log( string $message = NULL, string ... $extras ){
        count($params = func_get_args()) ? is_string($string = call_user_func_array('sprintf', $params)) &&
            $this->output[] = $string :
            $this->output[] = "\n";
        return $this;
    }

    /**
     *
     */
    public function flush(){
        echo implode('', $this->output);
        $this->output = [];
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
        if( TRUE === is_array($data) ){
            $that->loadIni($data);
        }else{
            $that->log('Failed to read INI file (%s).', $fileName);
            $message = end($that->output);
            $that->log();
            throw new UnexpectedValueException($message);
        }
        return $that;
    }

    /**
     * @param array $data
     */
    public function loadIni( array $data ){
        /** @var mixed $buffer1 */
        $buffer1 = &$data['base_name'];
        $buffer1 !== NULL && $this->baseName = (string)$buffer1;
        $buffer1 = &$data['base_path'];
        $buffer1 !== NULL && $this->basePath = $this::convertPath((string)$buffer1);
        $buffer1 = &$data['repo_id'];
        $buffer1 !== NULL && $this->repoId = (int)$buffer1;
        $buffer1 = &$data['repo_name'];
        $buffer1 !== NULL && $this->repoName = (string)$buffer1;
        $buffer1 = &$data['wp_prefix'];
        $buffer1 !== NULL && $this->wpPrefix = (string)$buffer1;
        $buffer1 = &$data['base_msg'];
        $buffer1 !== NULL && $this->baseMsg = (string)$buffer1;
        $buffer1 = &$data['developers'];
        if( TRUE === is_array($buffer1) ){
            foreach( $buffer1 as $bufferKey => $bufferVal ){
                if( FALSE === (bool)(int)$bufferVal ) continue;
                $developer = new Developer($this, (string)$bufferKey);
                $developer->database = new MySqlDb($developer);
                /** @var array|null $buffer2 */
                $buffer2 = &$data['dev:' . $developer->identifier];
                if( TRUE === is_array($buffer2) ){
                    /** @var mixed $buffer3 */
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
        if( FALSE === isset($post['repository']) ||
            FALSE === isset($post['pusher']) ||
            FALSE === isset($post['organization']) ||
            FALSE === isset($post['sender']) ||
            FALSE === isset($post['commits']) ){
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
        if( NULL === $developer = &$this->developers[$developerId] ){
            return FALSE;
        }
        if( FALSE === is_array($postedCommits = &$post['commits']) ){
            $this->log('Invalid data for committed files.')->log();
            return FALSE;
        }
        if( count($postedCommits) > 0 ){
            if( FALSE === $developer->pull() ){
                return FALSE;
            }
        }
        foreach( $postedCommits as $postedCommitId => $postedCommit ){
            $this->log('Iterating commit %d of %d.', $postedCommitId, count($postedCommits))->log();
            if( FALSE === is_array($postedCommit) ){
                continue;
            }
            $postedCommitFiles = [];
            if( TRUE === is_array($postedCommitFiles1 = &$postedCommit['modified']) ){
                $postedCommitFiles = array_merge($postedCommitFiles, $postedCommitFiles1);
            }
            if( TRUE === is_array($postedCommitFiles2 = &$postedCommit['added']) ){
                $postedCommitFiles = array_merge($postedCommitFiles, $postedCommitFiles2);
            }
            foreach( $postedCommitFiles as $postedCommitFileId => $postedCommitFileName ){
                $this->log("\t" . 'Iterating committed file (%s) %d of %d.', $postedCommitFileName, $postedCommitFileId, count($postedCommitFiles))->log();
                $path = str_replace(getcwd(), '', implode('/', array_merge($developer->rootPath, [$this->baseName . '.sql'])));
                $this->log("\t" . 'Checking %s.', $path)->log();
                if( $path == $postedCommitFileName ){
                    $this->log("\t" . 'Database dump file was finally found.')->log();
                    if( FALSE === $developer->database->import(FALSE) ){
                        return FALSE;
                    }
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
        file_put_contents(sprintf('output %d.log', time()), implode('', $this->output));
        $this->output = [];
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
     * @param string|null $identifier
     */
    public function __construct( Configurations $configurations, string $identifier = NULL ){
        $this->configurations = $configurations;
        $this->identifier = $identifier;
    }

    /**
     * @param string $entry
     * @return string
     */
    public function __get( string $entry ): string {
        switch( $entry ){
            case 'git':
                if( NULL === $this->gitPath ){
                    return 'git';
                }else{
                    return '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->gitPath, ['bin', 'git.exe'])) . '"';
                }
            case 'mysql':
                if( NULL === $this->mysqlPath ){
                    return 'mysql';
                }else{
                    return '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->mysqlPath, ['bin', 'mysql.exe'])) . '"';
                }
            case 'mysqldump':
                if( NULL === $this->mysqlPath ){
                    return 'mysqldump';
                }else{
                    return '"' . implode(DIRECTORY_SEPARATOR, array_merge($this->mysqlPath, ['bin', 'mysqldump.exe'])) . '"';
                }
            default:
                if( error_reporting() ){
                    throw new UnexpectedValueException;
                }
                return $entry;
        }
    }

    /**
     * @param string $entry
     * @param string $input
     * @return bool
     */
    public function __set( string $entry, string $input ): bool {
        /** @var string $command */
        /** @var int $result */
        switch( $entry ){
            case 'cd':
                $path = &$input;
                $this->configurations->log('Attempting to redirect to:')->log();
                $this->configurations->log("\t" . $path)->log();
                $command = 'cd ' . $path;
                system($command, $result);
                if( 0x00 === $result ){
                    $this->configurations->log('Directory change success.')->log();
                    return FALSE;
                }else{
                    $this->configurations->log('Directory change failure.')->log();
                    return TRUE;
                }
            default:
                $command = $this->{$entry} . ' ' . $input;
                $this->configurations->log('Attempting to run the following command:')->log();
                $this->configurations->log("\t" . $command)->log();
                system($command, $result);
                if( 0x00 === $result ){
                    $this->configurations->log('Command success.')->log();
                    return TRUE;
                }else{
                    $this->configurations->log('Command failure.')->log();
                    return FALSE;
                }
        }
    }

    /**
     * @return bool
     */
    public function commitLastBases(){
        /** @var string $path */
        $path = implode(DIRECTORY_SEPARATOR, $this->rootPath);
        if( FALSE === $this->{'cd'} = $path ){
            return FALSE;
        }
        if( count($this->configurations->lastBases) > 0 ){
            $command = 'add "' . implode('" "', $this->configurations->lastBases) . '"';
            if( FALSE === $this->{'git'} = $command ){
                return FALSE;
            }
            $command = 'commit -m "' . $this->configurations->baseMsg . '"';
            if( FALSE === $this->{'git'} = $command ){
                return FALSE;
            }
            $this->configurations->lastBases = [];
        }
        return TRUE;
    }

    /**
     * @return bool
     */
    public function push(): bool {
        /** @var string $path */
        $path = implode(DIRECTORY_SEPARATOR, $this->rootPath);
        if( FALSE === $this->{'cd'} = $path ){
            return FALSE;
        }return TRUE;
        /** @var string $command */
        $command = 'push origin master';
        return $this->{'git'} = $command;
    }

    /**
     * @return bool
     */
    public function pull(): bool {
        /** @var string $path */
        $path = implode(DIRECTORY_SEPARATOR, $this->rootPath);
        if( FALSE === $this->{'cd'} = $path ){
            return FALSE;
        }
        /** @var string $command */
        $command = 'pull > git-pull.txt 2> git-pull.err';
        return $this->{'git'} = $command;
    }
}

/**
 * @package cp3402
 */
abstract class Database {

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
     * @param string|null $baseName
     * @return bool
     */
    abstract public function export( bool $overwrite = FALSE, string $baseName = NULL ): bool;

    /**
     * @param string|null $baseName
     * @param bool $modifyWpUrl
     * @return bool
     */
    abstract public function import( string $baseName = NULL, bool $modifyWpUrl = FALSE ): bool;

    /**
     * @return bool
     */
    abstract public function modifyWpUrl(): bool;
}

/**
 * @package cp3402
 */
class MySqlDb extends Database {

    /**
     * @param bool $overwrite
     * @param string|null $baseName
     * @return bool
     */
    public function export( bool $overwrite = FALSE, string $baseName = NULL ): bool {
        if( NULL === $baseName ){
            $baseName = $this->configurations->baseName;
        }
        /** @var string $path1 */
        $path1 = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$baseName . '.sql']));
        /** @var string $path2 */
        $path2 = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$baseName . ' ' . time() . ' (' . $this->developer->identifier . ').sql']));
        /** @var string $command */
        $command = $this->name . ' ';
        if( NULL !== $this->pass ){
            $command .= '--password=' . base64_decode($this->pass) . ' ';
        }
        $command .= '--user=' . $this->user . ' ';
        $command .= '--single-transaction > "' . $path2 . '" ';
        $command .= '2> "' . implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$baseName . '.err"']));
        if( FALSE === $this->developer->{'mysqldump'} = $command ){
            return FALSE;
        }
        if( TRUE === file_exists($path2) ){
            $this->configurations->log('Database file (%s) exists.', $path2)->log();
            if( TRUE === $overwrite ){
                if( FALSE !== file_put_contents($path1, file_get_contents($path2)) &&
                    TRUE === file_exists($path1) ){
                    $this->configurations->lastBases[] = $path1;
                    $this->configurations->log('Database file (%s) exists.', $path1)->log();
                }else{
                    $this->configurations->log('Could not overwrite database file.')->log();
                }
            }
        }
        return TRUE;
    }

    /**
     * @param string|null $baseName
     * @param bool $modifyWpUrl
     * @return bool
     */
    public function import( string $baseName = NULL, bool $modifyWpUrl = FALSE ): bool {
        if( NULL === $baseName ){
            $baseName = $this->configurations->baseName;
        }
        /** @var string $path */
        $path = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$baseName . '.sql']));
        if( FALSE === file_exists($path) ){
            $this->configurations->log('Latest database backup file (%s) inexistent.', $path)->log();
            return FALSE;
        }
        /** @var string $command */
        $command = '-u ' . $this->user . ' ';
        if( NULL !== $this->pass ){
            $command .= '-p' . base64_decode($this->pass) . ' ';
        }
        $command .= $this->name . ' ';
        $command .= '< "' . $path . '"';
        if( FALSE === $this->developer->{'mysql'} = $command ){
            return FALSE;
        }
        if( TRUE === $modifyWpUrl ){
            return $this->modifyWpUrl();
        }
        return TRUE;
    }

    /**
     * @return bool
     */
    public function modifyWpUrl(): bool {
        /** @var string[] $queries */
        $queries = [
            'UPDATE ' . $this->configurations->wpPrefix . 'options SET option_value=\'' . $this->developer->wpUrl . '\' WHERE option_name=\'siteurl\'',
            'UPDATE ' . $this->configurations->wpPrefix . 'options SET option_value=\'' . $this->developer->wpUrl . '\' WHERE option_name=\'home\'',
        ];
        /** @var string $command */
        $command = '-u ' . $this->user . ' ';
        if( NULL !== $this->pass ){
            $command .= '-p' . base64_decode($this->pass) . ' ';
        }
        $command .= $this->name . ' ';
        $command .= '-e "' . implode('; ', $queries) . ';"';
        return $this->developer->{'mysql'} = $command;
    }
}
