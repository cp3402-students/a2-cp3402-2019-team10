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
            if( $repo->id != $post_repository_id || $repo->name != $post_repository_name ) continue;
            $post_repository_pusher = &$post_repository['pusher'];
            if( is_array($post_repository_pusher) ){
                $repo->pull();
            }
        }
        /*
        var_dump($_POST);
        file_put_contents('hook.txt', $_POST);

        system('mysqldump staging --password=CoffeeCan.3402 --user=cp3402 --single-transaction >/var/www/html/staging/base_dump.sql 2> /var/www/html/staging/base_dump.err', $output);
        var_dump($output);
        */
    }
}

?>
</pre>