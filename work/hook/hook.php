<pre>
<?php

class Repository {

    public $id = 0;
    public $name = NULL;
    public $path = NULL;

    public function __construct($id, $name, $path) {
        $this->id   = $id;
        $this->name = $name;
        $this->path = $path;
    }

    public function pull() {
        if( $this->path !== NULL ){
            system('cd ' . $this->path);
        }
        system('git pull > git-pull.out 2> git-pull.err');
    }
}


var_dump($_POST);
file_put_contents('hook.txt', $_POST);

system('mysqldump staging --password=x --user=cp3402 --single-transaction >/var/backups/base_dump.sql', $output);
var_dump($output);

?>
</pre>