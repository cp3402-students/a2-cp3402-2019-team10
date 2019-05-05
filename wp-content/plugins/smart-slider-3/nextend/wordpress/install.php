<?php
if (class_exists('N2Platform', false)) {
    $role = get_role('administrator');
    if (is_object($role)) {
        $role->add_cap('nextend');
        $role->add_cap('nextend_config');
        $role->add_cap('nextend_visual_edit');
        $role->add_cap('nextend_visual_delete');
    }

    $role = get_role('editor');
    if (is_object($role)) {
        $role->add_cap('nextend');
        $role->add_cap('nextend_config');
        $role->add_cap('nextend_visual_edit');
        $role->add_cap('nextend_visual_delete');
    }
}