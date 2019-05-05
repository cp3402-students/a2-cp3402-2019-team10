<?php

class N2SmartSliderHelper {

    /**
     * @var N2Application
     */
    private $application;

    public function __construct($application) {
        $this->application = $application;
    }

    /**
     * @return N2SmartSliderHelper
     */
    public static function getInstance() {
        static $instance = null;
        if ($instance === null) {
            $instance = new self(N2Base::getApplication('smartslider'));
        }
        return $instance;
    }

    public function isSliderChanged($sliderId, $value = 1) {
        return intval($this->application->storage->get('sliderChanged', $sliderId, $value));
    }

    public function setSliderChanged($sliderId, $value = 1) {
        $this->application->storage->set('sliderChanged', $sliderId, $value);
	    $changedSliders = array($sliderId);

        $xref = new N2SmartsliderSlidersXrefModel();
        foreach ($xref->getGroups($sliderId) AS $row) {
            $this->application->storage->set('sliderChanged', $row['group_id'], $value);
	        $changedSliders[] = $row['group_id'];
        }
    	$sliderModel = new N2SmartsliderSlidersModel();
    	$relatedPosts = array();
    	foreach($changedSliders AS $id){

    		do_action('smartslider3_slider_changed', $id);

	        $slider = $sliderModel->get($id);
	        if($slider) {
		        $sliderData = new N2Data( $slider['params'], true );
		        $relatedPostsRaw = $sliderData->get('related-posts');
		        if(!empty($relatedPostsRaw)){
			        $relatedPostsRaw = explode("\n", str_replace(array("\r\n","\n\r","\r"),"\n",$relatedPostsRaw));
			        foreach($relatedPostsRaw AS $relatedPostID){
			        	if($relatedPostID > 0){
			        		$relatedPosts[] = $relatedPostID;
				        }
			        }
		        }
	        }
        }
        if(count($relatedPosts) > 0){
	        $relatedPosts = array_unique($relatedPosts);
    		foreach($relatedPosts AS $postID){
    			$post = WP_Post::get_instance($postID);
    			if($post) {
			        do_action( 'edit_post', $postID, $post );
			        do_action( 'save_post', $postID, $post );
		        }
	        }
        }
    
    }
}