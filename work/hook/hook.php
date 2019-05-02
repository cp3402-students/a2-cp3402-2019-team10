<pre>
<?php

class Repository {

    public $id = 0;
    public $name = NULL;
    public $path = NULL;
    public $base = NULL;

    public function __construct($id, $name, $path, $base) {
        $this->id   = $id;
        $this->name = $name;
        $this->path = $path;
        $this->base = $base;
    }

    public function pull() {
        if( $this->path !== NULL ){
            system('cd ' . $this->path);
        }
        system('git pull > git-pull.out 2> git-pull.err');
    }
}

$REPOSITORIES = new SplDoublyLinkedList();
$REPOSITORIES.add(new Repository(
    180477181,
    "a2-cp3402-2019-team10",
    '/var/www/html/staging/wp-content'));

$post_repository = &$_POST['repository'];
if( is_array($post_repository) ){
    $post_repository_id   = &$post_repository['id'];
    $post_repository_name = &$post_repository['name'];
    if( is_integer($post_repository_id) && is_string($post_repository_name) ){
        foreach( $REPOSITORIES as $repo ){
            /* Verify whether the request matches any repos: */
            if( $repo->id != $post_repository_id || $repo->name != $post_repository_name ) continue;
            /* Pull repo upon push request: */
            $post_repository_pusher = &$post_repository['pusher'];
            if( is_array($post_repository_pusher) ){
                $repo->pull();
            }
            $base_found = false;
            /* Iterate all committed files: */
            $post_repository_commits = &$post_repository['commits'];
            if( is_array($post_repository_commits) ){
                foreach( $post_repository_commits as $post_repository_commit ){
                    if( !is_array($post_repository_commit) ) continue;
                    $post_repository_commit_files = &$post_repository_commit['modified'];
                    if( !is_array($post_repository_commit_files) ){
                        $post_repository_commit_files = &$post_repository_commit['added'];
                    }
                    foreach( $post_repository_commit_files as $post_repository_commit_file ){
                        /* Check if the file is the SQL backup file: */
                        if( !$base_found && $repo->base == $post_repository_commit_file ){
                            $base_found = true;
                            system('mysqldump staging --password=CoffeeCan.3402 --user=cp3402 --single-transaction >/var/www/html/staging/base_dump.sql 2> /var/www/html/staging/base_dump.err', $output);
                        }
                    }
                }
            }
        }
    }
}

?>
</pre>
