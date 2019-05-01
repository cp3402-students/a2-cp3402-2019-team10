<pre>
<?php

var_dump($_POST);
file_put_contents('hook.txt', $_POST);

system('mysqldump staging --password=x --user=cp3402 --single-transaction >/var/backups/base_dump.sql', $output);
var_dump($output);

?>
</pre>