<?php
if (class_exists('N2Platform', false)) {
    $role = get_role('administrator');
    if (is_object($role)) {
        $role->add_cap('smartslider');
        $role->add_cap('smartslider_config');
        $role->add_cap('smartslider_edit');
        $role->add_cap('smartslider_delete');
    }

    $role = get_role('editor');
    if (is_object($role)) {
        $role->add_cap('smartslider');
        $role->add_cap('smartslider_config');
        $role->add_cap('smartslider_edit');
        $role->add_cap('smartslider_delete');
    }
}