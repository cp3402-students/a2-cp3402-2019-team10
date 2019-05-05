<?php

function NextendSmartSlider_jetpack_photon_skip_image($val, $src, $tag) {
    if (N2AssetsManager::$image->match($src)) {
        return true;
    }

    return $val;
}


N2Pluggable::addAction('n2_assets_manager_started', function () {
    add_filter('jetpack_photon_skip_image', 'NextendSmartSlider_jetpack_photon_skip_image', 10, 3);
});