<?php
if (! defined('ABSPATH')) {
    die();
}
/**
 * Instagram Gallery
 * WP widget
 */

add_action('widgets_init', function () {
    register_widget('instagal_widget');
});

class instagal_widget extends WP_Widget
{

    public function __construct()
    {
        parent::__construct('instagal_widget', __('Instagram Gallery', 'insta-gallery'), array(
            'classname' => 'instagal-widget',
            'description' => esc_html__('Displays your Instagram Gallery', 'insta-gallery')
        ));
    }

    public function widget($args, $instance)
    {
        $title = empty($instance['title']) ? '' : apply_filters('widget_title', $instance['title']);
        $instagal_id = empty($instance['instagal_id']) ? '' : $instance['instagal_id'];
        
        echo $args['before_widget'];
        
        if (! empty($title)) {
            echo $args['before_title'] . wp_kses_post($title) . $args['after_title'];
        }
        
        if (! empty($instagal_id)) {
            echo do_shortcode('[insta-gallery id="' . $instagal_id . '"]');
        }
        
        echo $args['after_widget'];
    }

    public function form($instance)
    {
        $instance = wp_parse_args( (array) $instance, array(
            'title' => '',
            'instagal_id' => 0,
        ) );
        
        $title = $instance['title'];
        $instagal_id = $instance['instagal_id'];
        $InstaGalleryItems = get_option('insta_gallery_items');
        ?>
<p>
	<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title', 'insta-gallery' ); ?>: <input class="widefat"
		id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text"
		value="<?php echo esc_attr( $title ); ?>" /></label>
</p>

<?php if( !empty($InstaGalleryItems) && is_array($InstaGalleryItems) ):  ?>
<p>
	<label for="<?php echo esc_attr( $this->get_field_id( 'instagal_id' ) ); ?>"><?php esc_html_e( 'Select Instagram Gallery', 'insta-gallery' ); ?>: </label> <select
		id="<?php echo esc_attr( $this->get_field_id( 'instagal_id' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'instagal_id' ) ); ?>" class="widefat">
    <?php
            foreach ($InstaGalleryItems as $k => $IGItem) {
                $label = '';
                if ($IGItem['ig_select_from'] == 'username') {
                    $label = __('Username', 'insta-gallery') . ' / ' . $IGItem['insta_user'];
                } else {
                    $label = __('Tagname', 'insta-gallery') . ' / ' . $IGItem['insta_tag'];
                }
                ?>		
		<option value="<?php echo $k; ?>" <?php selected( $k, $instagal_id ) ?>><?php echo $label; ?></option>
<?php } ?>
	</select>
</p>
<?php else: ?>
<p style="color: #e23565;">
	<?php _e('Please add Gallery item in plugin panel, Then come back and select your Gallery to display.','insta-gallery'); ?>
</p>
<?php endif; ?> 
<p style="text-align: center;" >
	<a href="options-general.php?page=insta_gallery"><?php _e('Add New Gallery','insta-gallery'); ?></a> 
</p>

<?php
    }

    public function update($new_instance, $old_instance)
    {
        $instance = $old_instance;
        $instance['title'] = strip_tags($new_instance['title']);
        $instance['instagal_id'] = trim(strip_tags($new_instance['instagal_id']));
        return $instance;
    }
}
