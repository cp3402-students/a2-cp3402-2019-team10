<a style="margin-bottom:10px;" href="#" onclick="<?php echo \SmartSlider3::sliderSelectAction("jQuery(this).siblings('input')"); ?>return false;" class="button button-primary" title="Select slider">
    Select slider
</a>

<input
        type="text"
        name="{{ param.param_name }}"
        id="{{ param.param_name }}"
        value="{{ option_value }}"
/>
