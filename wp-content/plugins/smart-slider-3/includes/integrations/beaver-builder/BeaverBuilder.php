<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function n2_fl_builder_force_iframe() {
    N2SS3Shortcode::forceIframe('beaverbuilder');
}

add_action('fl_builder_editing_enabled', 'n2_fl_builder_force_iframe');
add_action('fl_builder_editing_enabled', "N2SSShortcodeInsert::addForcedFrontend");


add_action('fl_ajax_before_render_new_module', 'n2_fl_builder_force_iframe');
add_action('fl_ajax_before_render_layout', 'n2_fl_builder_force_iframe');
add_action('fl_ajax_before_render_module_settings', 'n2_fl_builder_force_iframe');
add_action('fl_ajax_before_save_settings', 'n2_fl_builder_force_iframe');
add_action('fl_ajax_before_copy_module', 'n2_fl_builder_force_iframe');

/**
 * Fix for Beaver Builder 1.5
 */
add_action('fl_ajax_fl_builder_render_new_module_settings', function () {
    remove_action('wp_print_scripts', 'N2WordpressAssetInjector::injectCSSComment');
}, 0);
add_action('fl_ajax_fl_builder_save', function(){
    remove_action('wp_print_scripts', 'N2WordpressAssetInjector::injectCSSComment');
}, 0);

/**
 * Custom modules
 */
function n2_fl_load_module_smart_slider() {
    if (class_exists('FLBuilder')) {
        require_once dirname(__FILE__) . '/beaver-builder-module.php';
    }
}

add_action('init', 'n2_fl_load_module_smart_slider');

function n2_fl_smart_slider_field($name, $value, $field) {

    N2base::getApplication('smartslider')
          ->getApplicationType('backend');
    N2Loader::import("models.Sliders", "smartslider");

    $slidersModel = new N2SmartsliderSlidersModel();

    $choices = array();
    foreach ($slidersModel->getAll(0) AS $slider) {
        if ($slider['type'] == 'group') {

            $subChoices = array();
            if (!empty($slider['alias'])) {
                $subChoices[$slider['alias']] = n2_('Whole group') . ' - ' . $slider['title'] . ' #Alias: ' . $slider['alias'];
            }
            $subChoices[$slider['id']] = n2_('Whole group') . ' - ' . $slider['title'] . ' #' . $slider['id'];
            foreach ($slidersModel->getAll($slider['id']) AS $_slider) {
                if (!empty($_slider['alias'])) {
                    $subChoices[$_slider['alias']] = $_slider['title'] . ' #Alias: ' . $_slider['alias'];
                }
                $subChoices[$_slider['id']] = $_slider['title'] . ' #' . $_slider['id'];
            }

            $choices[$slider['id']] = array(
                'label'   => $slider['title'] . ' #' . $slider['id'],
                'choices' => $subChoices
            );
        } else {
            if (!empty($slider['alias'])) {
                $choices[$slider['alias']] = $slider['title'] . ' #Alias: ' . $slider['alias'];
            }
            $choices[$slider['id']] = $slider['title'] . ' #' . $slider['id'];
        }
    }
    ?>
    <select name="<?php echo $name; ?>">
        <option value=""><?php n2_e('None'); ?></option>
        <?php
        foreach ($choices AS $id => $choice) {
            if (is_array($choice)) {
                ?>
                <optgroup label="<?php echo $choice['label']; ?>">
                    <?php
                    foreach ($choice['choices'] AS $_id => $_choice) {
                        ?>
                        <option <?php if ($_id == $value){ ?>selected <?php } ?>value="<?php echo $_id; ?>"><?php echo $_choice; ?></option>
                        <?php
                    }
                    ?>
                </optgroup>
                <?php
            } else {
                ?>
                <option <?php if ($id == $value){ ?>selected <?php } ?>value="<?php echo $id; ?>"><?php echo $choice; ?></option>
                <?php
            }
        }
        ?>
    </select>
    <div style="line-height:2;padding:10px;"><?php n2_e('OR'); ?></div>

    <a href="#" onclick="<?php echo SmartSlider3::sliderSelectAction("jQuery(this).siblings('select')"); ?>return false;" class="fl-builder-smart-slider-select fl-builder-button fl-builder-button-small fl-builder-button-primary" title="Select slider"><?php echo n2_('Select slider'); ?></a>
    <script type="text/javascript">
        (function ($) {
            var value = $('select[name="<?php echo $name; ?>"]').val();
            if (value == '' || value == '0') {
                $('.fl-builder-smart-slider-select').trigger('click');
            }
        })(jQuery);
    </script>
    <?php
}

add_action('fl_builder_control_smart-slider', 'n2_fl_smart_slider_field', 1, 3);