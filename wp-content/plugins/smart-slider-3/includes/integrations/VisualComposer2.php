<?php

namespace VisualComposer\Modules\Vendors;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Request;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Helpers\Traits\WpFiltersActions;

class SmartSlider3Controller extends Container implements Module {

    use WpFiltersActions;
    use EventsFilters;

    public function __construct() {
        $this->wpAddAction('plugins_loaded', 'initialize', 16);
    }

    protected function initialize(Request $requestHelper) {
        if ($requestHelper->isAjax()) {
            $this->addFilter('vcv:ajax:elements:ajaxShortcode:adminNonce', 'addFilters', -1);
        }
    }

    protected function addFilters($response) {
        \N2SS3Shortcode::forceIframe('VisualComposer2');

        return $response;
    }
}

new SmartSlider3Controller();

add_action('wp_ajax_vcv:admin:ajax', function () {
    \N2SS3Shortcode::forceIframe('VisualComposer2');
});