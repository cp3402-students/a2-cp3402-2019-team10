<?php

class N2SmartsliderApplicationInfoFilter
{

    /**
     * @param $info N2ApplicationInfo
     */
    public static function filter($info) {
        $info->setUrl(admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH));
    }
}