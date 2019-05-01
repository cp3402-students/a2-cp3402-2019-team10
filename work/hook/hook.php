<?php

var_dump($_POST);

file_put_contents('hook.txt', $_POST);
