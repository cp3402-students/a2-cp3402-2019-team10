<?php
/**
 * The Template for displaying Carousel
 *
 * This template can be overridden by copying it to yourtheme/insta-gallery/carousel.php.
 *
 * HOWEVER, on occasion will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen.
 *
 * @package 	insta-gallery/templates
 * @version     1.1.3
 */
if (! defined('ABSPATH')) {
    exit();
}

// $insta_source : gallery source like user or tag
// $IGItem : array of gallery item setting
// $instaItems : array of gallery items

$JSICSelector = '#instagal-' . $IGItem['gid']; // Gallery selector
                                               // setting for frontend(JS)
$igs_frontend = array(
    'display_type' => $IGItem['ig_display_type'],
    'autoplay' => $IGItem['insta_car-autoplay'],
    'autoplay_interval' => $IGItem['insta_car-autoplay-interval'],
    'dots' => $IGItem['insta_car-dots'],
    'navarrows' => $IGItem['insta_car-navarrows'],
    'spacing' => $IGItem['insta_car-spacing'],
    'slidespv' => $IGItem['insta_car-slidespv'],
    'popup' => $IGItem['insta_gal-popup']
);
?>
<div class="swiper-container instacarousel" data-source="<?php echo $insta_source; ?>" id="instagal-<?php echo $IGItem['gid']; ?>"
	data-igfs="<?php echo htmlentities(json_encode($igs_frontend), ENT_QUOTES, 'UTF-8'); ?>">
	<div class="swiper-wrapper">
						
<?php
$i = 1;
foreach ($instaItems as $item) {
    if (! empty($item['img_low']) && ! empty($item['img_standard']) && ! empty($item['img_thumb'])) {
		$img_src = $item['img_standard'];
		if($IGItem['insta_thumb-size'] == 'small'){
			$img_src = $item['img_thumb'];
		}
		if($IGItem['insta_thumb-size'] == 'medium'){
			$img_src = $item['img_low'];
		}
        $link = $iplink = 'https://www.instagram.com/p/' . $item['code'] . '/';
        if(!empty($item['link'])){
            $link = $iplink = $item['link'];
        }
        if ($IGItem['insta_gal-popup']) {
            $link = $item['img_standard'];
        }
        $caption = '';
        if ($IGItem['insta_popup-caption'] && $IGItem['insta_gal-popup']) {
            $caption = $item['caption'];
        }
        ?>
        <div class="swiper-slide">
			<a href="<?php echo $link; ?>" target="blank" data-title="<?php echo $caption; ?>" data-iplink="<?php echo $iplink; ?>" class="nofancybox" data-elementor-open-lightbox="no" > <img alt="instagram"
				class="instacarousel-image" src="<?php echo $img_src; ?>" />
        <?php
        if ($IGItem['insta_likes'] || $IGItem['insta_comments']) {
            echo '<span class="ic-likes-comments">';
            if ($IGItem['insta_likes'] && ((int) $item['likes'] != 0)) {
                echo '<span><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M377.594 32c-53.815 0-100.129 43.777-121.582 89.5-21.469-45.722-67.789-89.5-121.608-89.5-74.191 0-134.404 60.22-134.404 134.416 0 150.923 152.25 190.497 256.011 339.709 98.077-148.288 255.989-193.603 255.989-339.709 0-74.196-60.215-134.416-134.406-134.416z" fill="#fff"></path>Likes </svg>' . $item['likes'] . '</span>';
            }
            if ($IGItem['insta_comments'] && ((int) $item['comments'] != 0)) {
                echo '<span><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M256 32c-141.385 0-256 93.125-256 208s114.615 208 256 208c13.578 0 26.905-0.867 39.912-2.522 54.989 54.989 120.625 64.85 184.088 66.298v-13.458c-34.268-16.789-64-47.37-64-82.318 0-4.877 0.379-9.665 1.082-14.348 57.898-38.132 94.918-96.377 94.918-161.652 0-114.875-114.615-208-256-208z" fill="#fff"></path>Comments </svg>' . $item['comments'] . '</span>';
            }
            echo '</span>';
        }
        ?>
        </a>
		</div>
    <?php
    }
    $i ++;
    if (($instaItemLimit != 0) && ($i > $instaItemLimit)) {
        break;
    }
}
?>
</div>
	<!-- <div class="swiper-pagination"></div> -->
<?php if ($IGItem['insta_car-navarrows']) { ?>
    <div class="swiper-button-prev">
		<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 477.175 477.175">
			<path
				d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225
		c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z" />Prev</svg>
	</div>
	<div class="swiper-button-next">
		<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 477.175 477.175">
			<path
				d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z" />Next</svg>
	</div>
<?php } ?>
</div>
<?php if($IGItem['insta_instalink']){ ?>
<div class="instagallery-actions">
	<a href="<?php echo $instaUrl; ?>" target="blank" class="igact-instalink"><?php echo $IGItem['insta_instalink-text']; ?></a>
</div>
<?php } ?>
