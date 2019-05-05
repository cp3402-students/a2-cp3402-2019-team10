<?php

class N2BackendController extends N2Controller {

    public function initialize() {
        // Prevent browser from cache on backward button.
        header("Cache-Control: no-store");

        parent::initialize();

        N2AssetsPredefined::frontend();
        N2AssetsPredefined::backend();

        $this->appType->app->info->assetsBackend();

    }
}

class N2BackendControllerAjax extends N2ControllerAjax {

}