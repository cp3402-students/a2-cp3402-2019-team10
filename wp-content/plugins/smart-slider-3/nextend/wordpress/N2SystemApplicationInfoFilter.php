<?php

class N2SystemApplicationInfoFilter {

    /**
     * @param $info N2ApplicationInfo
     */
    public static function filter($info) {
        $info->setUrl(admin_url("admin.php?page=nextend"));
    }
}