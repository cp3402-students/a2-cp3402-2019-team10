/**
 * Instagram Gallery script for insta-gallery wp plugin
 * 
 */

(function($) {

	var swiperCounter = 0, IGSwipers = {};
	// load insta gallery content
	function load_ig_gallery() {
		$('.ig-block').each(
				function() {
					var $e = $(this);
					if ($e.hasClass('ig-block-loaded')) {
						return true;
					} else {
						$e.addClass('ig-block-loaded');
					}
					var $spinner = $e.find('.ig-spinner');
					var insgalid = parseInt($e.data('insgalid'));
					if (!$spinner.length || isNaN(insgalid)) {
						return;
					}

					jQuery.ajax(
							{
								url : insgalajax.ajax_url,
								type : 'post',
								dataType : 'JSON',
								data : {
									action : 'load_ig_item',
									insgalid : insgalid
								},
								beforeSend : function() {
									$spinner.show();
								},
								success : function(response) {
									if ((typeof response == 'undefined')
											|| (response == null)
											|| (response == 0))
										return;
									if ((typeof response === 'object')
											&& response.success) {
										if (response.data) {
											$e.append(response.data);
											handle_ig_gallery($e);
										}
									}
								}
							}).fail(function(jqXHR, textStatus) {
						console.log(textStatus);
					}).always(
							function() {
								$spinner.hide();
								if ($e.find('.instagallery-actions').length) {
									$spinner.prependTo($e
											.find('.instagallery-actions'));
								}
							});
				});
	}

	// initializing the gallery
	function handle_ig_gallery($c) {
		if (!$c.find('[data-igfs]').length) {
			return;
		}
		var $igc = $c.find('[data-igfs]');
		var igfs = $igc.data('igfs');
		if (igfs.display_type == 'gallery') {
			init_ig_gallery($igc, igfs)
		} else if (igfs.display_type == 'carousel') {
			init_ig_carousel($igc, igfs)
		}
	}

	// initializing the gallery
	function init_ig_gallery($igc, igfs) {

		// resize images to square
		var instagalleryImages = $igc.find('.ig-item img.instagallery-image');
		if (instagalleryImages.length) {
			var totalImages = instagalleryImages.length, imagesLoaded = 0, minHeight = 0;
			instagalleryImages.load(function() {
				imagesLoaded++;
				if (minHeight == 0)
					minHeight = jQuery(this).height();
				// if(minHeight > jQuery(this).height())minHeight =
				// jQuery(this).height();
				if ((jQuery(this).width() == jQuery(this).height()))
					minHeight = jQuery(this).height();
				if (imagesLoaded >= totalImages) {
					$igc.find('.ig-item img.instagallery-image').each(
							function() {
								var i = jQuery(this);
								var th = i.height();
								if (minHeight < th) {
									var m = (th - minHeight) / 2;
									jQuery(this).css('margin-top',
											'-' + m + 'px');
									jQuery(this).css('margin-bottom',
											'-' + m + 'px');
								}
							});
				}
			});
		}		

		if (!igfs.popup) {
			return;
		}

		$igc
				.find('.ig-item a')
				.magnificPopup(
						{
							type : 'image',
							mainClass : 'mfp-with-zoom',
							zoom : {
								enabled : true,
								duration : 300,
								easing : 'ease-in-out',
								opener : function(openerElement) {
									return openerElement.is('img') ? openerElement
											: openerElement.find('img');
								}
							},
							gallery : {
								enabled : true
							},
							image : {
								titleSrc : function(item) {
									return item.el.attr('data-title')
											+ '<small><a href="'
											+ item.el.attr('data-iplink')
											+ '" target="blank" title="view on Instagram"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path style=" " d="M 5 3 C 3.898438 3 3 3.898438 3 5 L 3 19 C 3 20.101563 3.898438 21 5 21 L 19 21 C 20.101563 21 21 20.101563 21 19 L 21 13 L 19 11 L 19 19 L 5 19 L 5 5 L 13 5 L 11 3 Z M 14 3 L 16.65625 5.65625 L 9.15625 13.15625 L 10.84375 14.84375 L 18.34375 7.34375 L 21 10 L 21 3 Z "/>Link</svg></a></small>';
								}
							}
						});
	}

	// initializing the carousel
	function init_ig_carousel($igc, igfs) {
		swiperCounter++;
		
		// resize images to square
		var instacarouselImages = $igc.find('img.instacarousel-image');
		if (instacarouselImages.length) {
			var totalImages = instacarouselImages.length, imagesLoaded = 0, minHeight = 0;
			instacarouselImages.load(function() {
				imagesLoaded++;
				if (minHeight == 0)
					minHeight = jQuery(this).height();
				// if(minHeight > jQuery(this).height())minHeight =
				// jQuery(this).height();
				if ((jQuery(this).width() == jQuery(this).height()))
					minHeight = jQuery(this).height();
				if (imagesLoaded >= totalImages) {
					$igc.find('img.instacarousel-image').each(function() {
						var i = jQuery(this);
						var th = i.height();
						if (minHeight < th) {
							var m = (th - minHeight) / 2;
							jQuery(this).css('margin-top', '-' + m + 'px');
							jQuery(this).css('margin-bottom', '-' + m + 'px');
						}
					});
					IGSwipers[swiperCounter].update();
				}
			});
		}

		var soptions = {
			loop : true,
			autoHeight : true,
			observer : true,
			observeParents : true,
		};
		if (igfs.autoplay) {
			var interval = igfs.autoplay_interval ? parseInt(igfs.autoplay_interval) : 3000;
			soptions.autoplay = {
				delay : interval
			};
		}
		/*
		if (igfs.dots) {
			soptions.pagination = {
				el : '.swiper-pagination',
				type : 'bullets',
				clickable : true,
			};
		}
		*/
		if (igfs.navarrows) {
			soptions.navigation = {
				nextEl : '.swiper-button-next',
				prevEl : '.swiper-button-prev',
			};
		}
		if (igfs.spacing) {
			soptions.spaceBetween = 20;
		}
		soptions.slidesPerView = igfs.slidespv;
		soptions.breakpoints = {};

		if (igfs.slidespv > 3) {
			soptions.breakpoints[1023] = {
				slidesPerView : 3,
				spaceBetween : 20
			};
		}
		if (igfs.slidespv > 2) {
			soptions.breakpoints[767] = {
				slidesPerView : 2,
				spaceBetween : 15
			};
		}
		soptions.breakpoints[420] = {
			slidesPerView : 1
		};

		IGSwipers[swiperCounter] = new Swiper($igc, soptions);

		if (igfs.popup) {
			$igc
					.find('.swiper-slide>a')
					.magnificPopup(
							{
								type : 'image',
								mainClass : 'mfp-with-zoom',
								zoom : {
									enabled : true,
									duration : 300,
									easing : 'ease-in-out',
									opener : function(openerElement) {
										return openerElement.is('img') ? openerElement
												: openerElement.find('img');
									}
								},
								gallery : {
									enabled : true
								},
								image : {
									titleSrc : function(item) {
										return item.el.attr('data-title')
												+ '<small><a href="'
												+ item.el.attr('data-iplink')
												+ '" target="blank" title="view on Instagram"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path style=" " d="M 5 3 C 3.898438 3 3 3.898438 3 5 L 3 19 C 3 20.101563 3.898438 21 5 21 L 19 21 C 20.101563 21 21 20.101563 21 19 L 21 13 L 19 11 L 19 19 L 5 19 L 5 5 L 13 5 L 11 3 Z M 14 3 L 16.65625 5.65625 L 9.15625 13.15625 L 10.84375 14.84375 L 18.34375 7.34375 L 21 10 L 21 3 Z "/>Link</svg></a></small>';
									}
								}
							});
		}


	}

	// lazy images // draft
	function ig_lazy_load($igc,igfs) {
		var lazyImages = [].slice.call($igc.find('img.ig-lazy'));
		var active = false;

		var lazyLoadImages = function() {
			if (active === false) {
				active = true;

				setTimeout(
						function() {
							lazyImages
									.forEach(function(lazyImage) {
										if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage
												.getBoundingClientRect().bottom >= 0)
												&& getComputedStyle(lazyImage).display !== "none") {
											lazyImage.src = lazyImage.dataset.src;
											lazyImage.classList.remove("lazy");

											lazyImages = lazyImages
													.filter(function(image) {
														return image !== lazyImage;
													});

											if (lazyImages.length === 0) {
												document.removeEventListener(
														"scroll",
														lazyLoadImages);
												document.removeEventListener(
														"touchmove",
														lazyLoadImages);
												window.removeEventListener(
														"resize",
														lazyLoadImages);
												window.removeEventListener(
														"orientationchange",
														lazyLoadImages);
											}
										}
									});

							active = false;
						}, 200);
			}
		};

		document.addEventListener("scroll", lazyLoadImages);
		document.addEventListener("touchmove", lazyLoadImages);
		window.addEventListener("resize", lazyLoadImages);
		window.addEventListener("orientationchange", lazyLoadImages);
		lazyLoadImages();
	}
	

	// ie8 test
	function insgal_ieTest() {
		if (navigator.appVersion.indexOf("MSIE 8.") != -1) {
			document.body.className += ' ' + 'instagal-ie-8';
		}
		if (navigator.appVersion.indexOf("MSIE 9.") != -1) {
			document.body.className += ' ' + 'instagal-ie-9';
		}
	}

	// start loading as the script loaded
	if ($('.ig-block').length) {
		load_ig_gallery();
	}

	jQuery(function($) {
		load_ig_gallery();
		insgal_ieTest();
	});

})(jQuery);
