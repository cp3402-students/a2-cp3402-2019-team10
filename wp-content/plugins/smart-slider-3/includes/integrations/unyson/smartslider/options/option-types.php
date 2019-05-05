<?php

class FW_Option_Type_SmartSliderChooser extends FW_Option_Type_Select {

    protected function _enqueue_static($id, $option, $data) {
        N2SSShortcodeInsert::addForced();
    }

    public function get_type() {
        return 'smartsliderchooser';
    }

    protected function _render($id, $option, $data) {

        N2base::getApplication('smartslider')
              ->getApplicationType('backend');
        N2Loader::import("models.Sliders", "smartslider");

        $slidersModel = new N2SmartsliderSlidersModel();

        $choices = array();
        foreach ($slidersModel->getAll(0) AS $slider) {
	        if ($slider['type'] == 'group') {

		        $subChoices                = array();
		        if(!empty($slider['alias'])){
			        $subChoices[$slider['alias']] = n2_('Whole group') . ' - ' . $slider['title'] . ' #Alias: ' . $slider['alias'];
		        }
		        $subChoices[$slider['id']] = n2_('Whole group') . ' - ' . $slider['title'] . ' #' . $slider['id'];
		        foreach ($slidersModel->getAll($slider['id']) AS $_slider) {
			        if(!empty($_slider['alias'])){
				        $subChoices[$_slider['alias']] = $_slider['title'] . ' #Alias: ' . $_slider['alias'];
			        }
			        $subChoices[$_slider['id']] = $_slider['title'] . ' #' . $_slider['id'];
		        }

		        $choices[$slider['id']] = array(
			        'label'   => $slider['title'] . ' #' . $slider['id'],
			        'choices' => $subChoices
		        );
	        } else {
		        if(!empty($slider['alias'])){
			        $choices[$slider['alias']] = $slider['title'] . ' #Alias: ' . $slider['alias'];
		        }
		        $choices[$slider['id']] = $slider['title'] . ' #' . $slider['id'];
	        }
        }

        $option['choices'] = $choices;

        $option['attr']['style'] = 'width:240px;vertical-align: middle';

        return N2Html::tag('div', array(), N2Html::link(n2_('Select slider'), '#', array(
                'style'   => 'vertical-align:middle;',
                'class'   => 'button button-primary',
                'onclick' => SmartSlider3::sliderSelectAction("jQuery('#fw-edit-options-modal-id')") . 'return false;'
            )) . '<span style="margin: 0 10px;vertical-align:middle;text-transform: uppercase;">' . n2_('or') . '</span>' . parent::_render($id, $option, $data));
    }

    protected function _get_value_from_input($option, $input_value) {
        if (is_null($input_value)) {
            return $option['value'];
        }

        return (string)$input_value;
    }

}

FW_Option_Type::register('FW_Option_Type_SmartSliderChooser');