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
	 * @param string $identifier
	 * @return Developer|null
	 */
    public function getDeveloperByIdentifier( string $identifier ): Developer {
    	foreach( $this->developers as $developer ){
    		if( $developer->identifier == $identifier ){
    			return $developer;
		    }
	    }
    	return NULL;
	}

    /**
     * @var string
     */
    public $wpPrefix = 'wp_';

    /**
     * @param string|null $message
     * @param string[]|null $extras
     * @return self
     */
    public function log( string $message = NULL, string ... $extras ): self {
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
    public static function openIni( string $fileName ): self {
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
     * @param array $buffer0
     */
    public function loadIni( array $buffer0 ){
        /** @var mixed $buffer1 */
        $buffer1 = &$buffer0['base_name'];
        $buffer1 !== NULL && $this->baseName = (string)$buffer1;
        $buffer1 = &$buffer0['base_path'];
        $buffer1 !== NULL && $this->basePath = $this::convertPath((string)$buffer1);
        $buffer1 = &$buffer0['repo_id'];
        $buffer1 !== NULL && $this->repoId = (int)$buffer1;
        $buffer1 = &$buffer0['repo_name'];
        $buffer1 !== NULL && $this->repoName = (string)$buffer1;
        $buffer1 = &$buffer0['wp_prefix'];
        $buffer1 !== NULL && $this->wpPrefix = (string)$buffer1;
        $buffer1 = &$buffer0['base_msg'];
        $buffer1 !== NULL && $this->baseMsg = (string)$buffer1;
        $buffer1 = &$buffer0['developers'];
        /** @var Developer $developer */
        if( TRUE === is_array($buffer1) ){
        	/**
	         * @var string $bufferKey
	         * @var mixed $bufferVal
	         */
	        foreach( $buffer1 as $bufferKey => $bufferVal ){
                if( 0 === $bufferVal ){
                	continue;
                }
                $developer = new Developer($this, (string)$bufferKey, (int)$bufferVal);
                $developer->database = new MySqlDb($developer);
                /** @var array|null $buffer2 */
                $buffer2 = &$buffer0[ 'dev:' . $developer->identifier];
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
                    $buffer3 = &$buffer2['repo_branch'];
                    $buffer3 !== NULL && $developer->repoBranch = (string)$buffer3;
                }
                $this->developers[] = $developer;
            }
        }
    }

    /**
     * @param array $post
     * @return bool
     */
    public function handleHook( array $post ): bool {
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
        $this->log('Verifying suitable developer as publisher.')->log();
	    /** @var Developer $developer */
        foreach( $this->developers as $developer ){
        	if( $developer->type === Developer::TYPE_SERVER ){
        		if( $developer->repoBranch == $post['repository']['default_branch'] ?? NULL ){
        			break;
		        }
	        }
        }
        if( NULL === $developer ){
        	$this->log('Could not find developer with correct publication branch.')->log();
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
	 * @var string
	 */
    public $repoBranch = 'master';

	/**
	 * @var int
	 */
    public $type = 0;

	const TYPE_LOCAL = 1;
	const TYPE_SERVER = 2;

	/**
	 * @param Configurations $configurations
	 * @param string|null $identifier
	 * @param int $type
	 */
    public function __construct( Configurations $configurations, string $identifier = NULL, int $type = NULL ){
        $this->configurations = $configurations;
        if( NULL !== $identifier ){
        	$this->identifier = $identifier;
        }
        if( NULL === $type ){
        	$this->type = $type;
        }
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
	 * @param array $fileNames
	 * @param string $message
	 * @return bool
	 */
    public function commit( array $fileNames, string $message ){
        /** @var string $path */
        $path = implode(DIRECTORY_SEPARATOR, $this->rootPath);
        if( FALSE === $this->{'cd'} = $path ){
            return FALSE;
        }
        $command = 'add "' . implode('" "', $fileNames) . '"';
        if( FALSE === $this->{'git'} = $command ){
            return FALSE;
        }
        $command = 'commit -m "' . str_replace('"', '\"', $message) . '"';
        if( FALSE === $this->{'git'} = $command ){
            return FALSE;
        }
        return TRUE;
    }

    /**
     * @return bool
     */
    public function commitLastBases(){
	    if( count($this->configurations->lastBases) > 0 ){
	    	if( FALSE === $this->commit($this->configurations->lastBases, $this->configurations->baseMsg) ){
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
        }
        /** @var string $command */
        $command = 'push origin ' . $this->repoBranch;
        return $this->{'git'} = $command;
    }

    const GIT_PULL_NAME = 'git-pull';

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
        $command = 'pull origin ' . $this->repoBranch . ' > ' . $this::GIT_PULL_NAME . '.txt 2> ' . $this::GIT_PULL_NAME . '.err';
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
        /** @var string $path2 */
        $path1 = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$baseName . '.sql']));
        if( FALSE === file_exists($path1) ){
            $this->configurations->log('Latest database backup file (%s) inexistent.', $path1)->log();
            return FALSE;
        }
        /** @var string $data */
	    $data = file_get_contents($path1);
        if( FALSE === $data ){
		    $this->configurations->log('Latest database backup file (%s) could not be opened.', $path1)->log();
		    return FALSE;
	    }
        $developer1 = $this->developer;
        foreach( $this->configurations->developers as $developer2 ){
        	if( $developer2->wpUrl === $developer1->wpUrl ){
        		continue;
	        }
	        $data = str_replace($developer2->wpUrl, $developer1->wpUrl, $data);
        }
        /** @var string $path2 */
        $path2 = implode(DIRECTORY_SEPARATOR, array_merge($this->configurations->basePath, [$baseName . ' (import).sql']));
        file_put_contents($path2, $data);
        /** @var string $command */
        $command = '-u ' . $this->user . ' ';
        if( NULL !== $this->pass ){
            $command .= '-p' . base64_decode($this->pass) . ' ';
        }
        $command .= $this->name . ' ';
        $command .= '< "' . $path2 . '"';
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
