<?php

/**
 * @brief JCU CNS 2019 SP1 CP3402 A2 Team 10
 * @details Contains our deployment utility.
 * @author Yvan Burrie
 */

namespace cp3402;

set_error_handler(
    function ( int $type, string $data, string $file = '', int $line = 0 ){
        if( error_reporting() & $type ){
            throw new \ErrorException($data, $code = 0, $type, $file, $line);
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
    public $output = "\n";

    /**
     * @var int
     */
    public $repoId;

    /**
     * @var string
     */
    public $repoName;

    /**
     * @var Developer[]
     */
    public $developers = [NULL];

    /**
     *
     */
    const DEFAULT_DEVELOPER_IDENTIFIER = 'server';

    /**
     *
     */
    public function __construct(){
        $this->developers[0] = new Developer($this, $this::DEFAULT_DEVELOPER_IDENTIFIER);
    }

    /**
     * @param string|null $message
     * @param string[]|null $extras
     */
    public function log( string $message = NULL, string ... $extras ){
        @count($params = \SplFixedArray::fromArray(func_get_args())->toArray()) ? is_string($string = call_user_func_array(pack('c*', 0x73, 0x70, 0x72, 0x69, 0x6E, 0x74, 0x66), $params)) && $this->output .= $string : $this->output .= "\n";
    }

    /**
     *
     */
    public function flush(){
        echo $this->output;
        $this->output = "\n";
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
            $that->log($message = 'Failed to read INI file (' . $fileName . ').');
            throw new \UnexpectedValueException($message);
        }
        return $that;
    }

    /**
     * @param array $data
     */
    public function loadIni( array $data ){
        $buffer1 = &$data['repo_id'];
        $buffer1 !== NULL && $this->repoId = (int)$buffer1;
        $buffer1 = &$data['repo_name'];
        $buffer1 !== NULL && $this->repoName = (string)$buffer1;
        $buffer1 = &$data['developers'];
        if( is_array($buffer1) )foreach( $buffer1 as $bufferKey => $bufferVal )if( (bool)(int)$bufferVal ){
            $developer = new Developer($this, (string)$bufferKey);
            $developer->database = new Database($developer);
            $buffer2 =& $data['dev:' . $developer->identifier];
            if( is_array($buffer2) ){
                $buffer3 = &$buffer2['git_path'];
                $buffer3 !== NULL && $developer->gitPath = (string)$buffer3;
                $buffer3 = &$buffer2['mysql_path'];
                $buffer3 !== NULL && $developer->mysqlPath = (string)$buffer3;
                $buffer3 = &$buffer2['root_path'];
                $buffer3 !== NULL && $developer->rootPath = (string)$buffer3;
                $buffer3 = &$data['db_name'];
                $buffer3 !== NULL && $developer->database->name = (string)$buffer3;
                $buffer3 = &$data['db_user'];
                $buffer3 !== NULL && $developer->database->user = (string)$buffer3;
                $buffer3 = &$data['db_pass'];
                $buffer3 !== NULL && $developer->database->pass = (string)$buffer3;
                $buffer3 = &$data['db_file'];
                $buffer3 !== NULL && $developer->database->file = (string)$buffer3;
            }
            $this->developers[] = $developer;
        }
    }

    /**
     *
     */
    public function __destruct(){
        file_put_contents('output.log', $this->output);
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
    public $identifier;

    /**
     * @var Database
     */
    public $database;

    /**
     * @var string
     */
    public $gitPath;

    /**
     * @var string
     */
    public $mysqlPath;

    /**
     * @var string
     */
    public $rootPath;

    /**
     * @param Configurations $configurations
     * @param string $identifier
     */
    public function __construct( Configurations $configurations, string $identifier ){
        $this->configurations = $configurations;
        $this->identifier = $identifier;
    }

    /**
     * @param bool $exportBase
     */
    public function push( bool $exportBase = FALSE ){
        $this->configurations->log('Attempting to push repository.');
        if( $exportBase ){
            $this->database->export();
        }
    }

    /**
     * @param bool $importBase
     */
    public function pull( bool $importBase = FALSE ) {
        if( $importBase ){
            $this->database->import();
        }
        $command = 'cd ' . $this->gitPath;
        $this->configurations->log('Attempting to change directory to repository. ');
        system($command, $result);
        $this->configurations->log('Directory change resulted with "' . $result . '".' . "\n");
        /** @var string $command */
        $command = $this->gitPath !== NULL ?
            $this->gitPath :
            'git';
        $command .= ' ';
        $command .= 'pull > git-pull.out';
        $command .= ' ';
        $command .= '2> git-pull.err';
        $this->configurations->log('Attempting to pull repository with the following command:' . "\n");
        $this->configurations->log("\t" . $command . "\n");
        system($command, $result);
        $this->configurations->log('Command resulted with "' . $result . '".' . "\n");
    }
}

/**
 * @package cp3402
 */
class Database {

    /**
     * @var Developer
     */
    public $developer;

    /**
     * @var string
     */
    public $name;

    /**
     * @var string
     */
    public $user;

    /**
     * @var string
     */
    public $pass;

    /**
     * @var string
     */
    public $file;

    /**
     * @param Developer $developer
     */
    public function __construct( Developer $developer ){
        $this->developer = $developer;
    }

    /**
     *
     */
    public function export(){
        /** @var string $command */
        $command = $this->developer->mysqlPath ?
            $this->developer->mysqlPath . '\\bin\\mysqldump.exe ' :
            'mysqldump';
        $command .= ' ';
        $command .= $this->name;
        $command .= ' ';
        $command .= '--password=' . base64_decode($this->pass);
        $command .= ' ';
        $command .= '--user=' . $this->user;
        $command .= ' ';
        $backupPath = getcwd() . '\\' . 'backups';
        $command .= '--single-transaction >' . $backupPath . '\\' . $this->file . '.sql';
        $command .= ' ';
        $command .= '2> ' . $backupPath . '\\' . $this->file . '.err';
        $this->developer->configurations->log('Attempting to export database with the following command:' . "\n");
        $this->developer->configurations->log("\t" . $command . "\n");
        system($command, $result);
        $this->developer->configurations->log('Command resulted with "' . $result . '".' . "\n");
        if( file_exists($filePath = $backupPath . '\\' . $this->file . '.sql') ){
            file_put_contents(
                $backupPath . '\\' . $this->file . ' ' . time() . ' (' . $this->developer->identifier . ').sql',
                file_get_contents($filePath));
        }
    }

    /**
     *
     */
    public function import(){
        /** @var string $command */
        $command = $this->developer->mysqlPath ?
            $this->developer->mysqlPath . '\\bin\\mysql.exe ' :
            'mysql';
        $command .= ' ';
        $command .= '-u ' . $this->user;
        $command .= ' ';
        $command .= '-p ' . base64_decode($this->pass);
        $command .= ' ';
        $command .= $this->name;
        $command .= ' ';
        $command .= '< ' . $this->file . '.sql';
        $this->developer->configurations->log('Attempting to import database with the following command:' . "\n");
        $this->developer->configurations->log("\t" . $command . "\n");
        system($command, $result);
        $this->developer->configurations->log('Command resulted with "' . $result . '".' . "\n");
    }
}
