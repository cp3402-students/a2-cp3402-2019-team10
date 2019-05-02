<pre>
<?php

class Repository {

    public $id = 0;
    public $name = NULL;
    public $path = NULL;
    public $base = NULL;
    public $db_name = NULL;
    public $db_user = NULL;
    public $db_pass = NULL;
    public $db_dump = NULL;

    public function __construct($id, $name, $path, $base, $db_name, $db_user, $db_pass, $db_dump) {
        $this->id   = $id;
        $this->name = $name;
        $this->path = $path;
        $this->base = $base;
        $this->db_name = $db_name;
        $this->db_user = $db_user;
        $this->db_pass = $db_pass;
        $this->db_dump = $db_dump;
    }

    public function pull() {
        /* Redirect to repo path: */
        if( $this->path !== NULL ){
            system('cd ' . $this->path);
        }
        /* Run pull command: */
        system('git pull > git-pull.out 2> git-pull.err');
    }

    public function pullSql() {
        /* Export old database: */
        system('mysqldump ' . $this->db_name . ' --password=' . base64_decode($this->db_pass) . ' --user=' . $this->db_user . ' --single-transaction >' . $this->db_dump . '.sql 2> ' . $this->db_dump . '.err', $output);
        return;
        /* Import new database: */
        system('mysql -u ' . $this->db_user . ' -p ' . base64_decode($this->db_pass) . ' ' . $this->db_name . ' < ' . $this->db_dump . '.sql', $output);
    }
}

$REPOSITORIES = new SplDoublyLinkedList();
$REPOSITORIES.add(new Repository(
    180477181,
    'a2-cp3402-2019-team10',
    '/var/www/html/staging/wp-content',
    'dbdump.sql',
    'staging',
    'cp3402',
    'Q29mZmVlQ2FuLjM0MDI=',
    '/var/www/html/staging/base_dump'));

$repository = &$_POST['repository'];
if( is_array($repository) ){
    $repository_id   = &$repository['id'];
    $repository_name = &$repository['name'];
    if( is_integer($repository_id) && is_string($repository_name) ){
        foreach( $REPOSITORIES as $repo ){
            /* Verify whether the request matches any repos: */
            if( $repo->id != $repository_id || $repo->name != $repository_name ) continue;
            /* Pull repo upon push request: */
            $pusher = &$_POST['pusher'];
            if( is_array($pusher) ){
                $repo->pull();
            }
            $base_found = false;
            /* Iterate all committed files: */
            $commits = &$_POST['commits'];
            if( is_array($commits) ){
                foreach( $commits as $commit ){
                    if( !is_array($commit) ) continue;
                    $commit_files = &$commit['modified'];
                    if( !is_array($commit_files) ){
                        $commit_files = &$commit['added'];
                    }
                    foreach( $commit_files as $commit_file ){
                        if( !is_string($commit_file) ) continue;
                        /* Check if the file is the SQL backup file: */
                        if( !$base_found && $repo->base == $commit_file ){
                            $base_found = true;
                            $repo->pullSql();
                        }
                    }
                }
            }
        }
    }
}

?>
</pre>
