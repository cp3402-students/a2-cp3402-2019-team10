<?php

class Nextend_SmartSlider3 extends ET_Builder_Module {

    public $slug = 'et_pb_nextend_smart_slider_3';
    public $vb_support = 'on';

    protected $module_credits = array(
        'module_uri' => 'https://smartslider3.com',
        'author'     => 'Nextendweb',
        'author_uri' => 'https://nextendweb.com',
    );

    public function init() {
        $this->name = 'Smart Slider 3';


        $this->settings_modal_toggles = array(
            'general' => array(
                'toggles' => array(
                    'content' => esc_html__('Content', 'et_builder')
                ),
            ),
        );
    }

    public function add_styles_scripts() {
        ?>
        <script type="text/javascript">
            window.SmartSlider3IframeUrl = <?php echo json_encode(site_url('/') . '?n2prerender=1&n2app=smartslider&n2controller=slider&n2action=iframe&h=' . sha1(NONCE_SALT . date('Y-m-d'))); ?>;

            <?php
            echo file_get_contents(NEXTEND_SMARTSLIDER_3 . '/includes/iframe.min.js');
        
            ?>
        </script>
        <?php
    }

    public function get_fields() {

        if (et_core_is_fb_enabled()) {
            add_action('wp_footer', array(
                $this,
                'add_styles_scripts'
            ));
        }

        N2base::getApplication('smartslider')
              ->getApplicationType('backend');
        N2Loader::import("models.Sliders", "smartslider");

        $slidersModel = new N2SmartsliderSlidersModel();

        $options = array();
        foreach ($slidersModel->getAll(0) AS $slider) {
            if ($slider['type'] == 'group') {
                if (!empty($slider['alias'])) {
                    $options[$slider['alias']] = '[' . strtoupper(n2_('Group')) . '] - ' . $slider['title'] . ' #Alias: ' . $slider['alias'];
                }
                $options[$slider['id']] = '[' . strtoupper(n2_('Group')) . '] - ' . $slider['title'] . ' #' . $slider['id'];
                foreach ($slidersModel->getAll($slider['id']) AS $_slider) {
                    if (!empty($_slider['alias'])) {
                        $options[$_slider['alias']] = '----' . $_slider['title'] . ' #Alias: ' . $_slider['alias'];
                    }
                    $options[$_slider['id']] = '----' . $_slider['title'] . ' #' . $_slider['id'];
                }
            } else {
                if (!empty($slider['alias'])) {
                    $options[$slider['alias']] = $slider['title'] . ' #Alias: ' . $slider['alias'];
                }
                $options[$slider['id']] = $slider['title'] . ' #' . $slider['id'];
            }
        }
        reset($options);

        return array(
            'slider' => array(
                'default'         => key($options),
                'label'           => 'Slider',
                'option_category' => 'basic_option',
                'type'            => 'select',
                'options'         => $options,

                'description'   => esc_html__('Here you can create the content that will be used within the module.', 'et_builder'),
                'is_fb_content' => true,
                'toggle_slug'   => 'content',
            ),
        );
    }

    public function render($attrs, $content = null, $render_slug) {
        if (is_numeric($this->props['slider'])) {
            return do_shortcode('[smartslider3 slider=' . $this->props['slider'] . ']');
        }

        return do_shortcode('[smartslider3 alias="' . $this->props['slider'] . '"]');
    }

    public function get_advanced_fields_config() {
        return false;
    }
}

new Nextend_SmartSlider3;