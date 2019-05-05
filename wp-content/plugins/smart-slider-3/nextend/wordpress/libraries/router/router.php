<?php

class N2Router extends N2RouterAbstract {

    private $tmpBaseUrl = '';

    public function setMultiSite() {
        if (is_multisite()) {
            $this->tmpBaseUrl = $this->baseUrl;
            $this->baseUrl    = network_admin_url("admin.php?page=" . NEXTEND_SMARTSLIDER_3_URL_PATH);
        }

        return $this;
    }

    public function unSetMultiSite() {
        if (is_multisite()) {
            $this->baseUrl = $this->tmpBaseUrl;
        }

        return $this;
    }
}