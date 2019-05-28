(function ($) {
//https://w3bits.com/flexbox-masonry/
  var swiper_index = 0, $swipers = {};

  // Carousel
  // ---------------------------------------------------------------------------
  function add_insta_gallery_carousel($item) {

    var $wrap = $('.insta-gallery-items', $item),
            options = $wrap.data('igfs');

    if ($wrap.data('type') == 'carousel') {
      swiper_index++;

      // resize images to square
      /*var instacarouselImages = $wrap.find('img.insta-gallery-image');
       if (instacarouselImages.length) {
       var images = instacarouselImages.length, loaded = 0, minheight = 0;
       instacarouselImages.load(function () {
       loaded++;
       if (minheight == 0)
       minheight = $(this).height();
       // if(minheight > $(this).height())minheight =
       // $(this).height();
       if (($(this).width() == $(this).height()))
       minheight = $(this).height();
       if (loaded >= images) {
       $wrap.find('img.insta-gallery-image').each(function () {
       var i = $(this);
       var th = i.height();
       if (minheight < th) {
       var m = (th - minheight) / 2;
       $(this).css('margin-top', '-' + m + 'px');
       $(this).css('margin-bottom', '-' + m + 'px');
       }
       });
       $swipers[swiper_index].update();
       }
       });
       }*/

      $swipers[swiper_index] = new Swiper($wrap, {
        //direction: 'vertical',
        loop: true,
        autoHeight: true,
        observer: true,
        observeParents: true,
        spaceBetween: parseInt(options.spacing),
        slidesPerView: parseInt(options.slides),
        autoplay: {
          delay: parseInt(options.autoplay_interval),
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          420: {
            slidesPerView: 1,
            spaceBetween: 2,
          },
          767: {
            slidesPerView: Math.min(2, options.slides)
          },
          1023: {
            slidesPerView: Math.min(3, options.slides)
          }
        }
      });
    }
  }

  // Masonry Vertical
  // ---------------------------------------------------------------------------
  function add_insta_gallery_masonry($item) {

    var $wrap = $('.insta-gallery-items', $item),
            options = $wrap.data('igfs');

    if ($wrap.data('type') == 'masonry') {

      var breakpoints = {
        420: {
          slidesPerView: 1,
          spaceBetween: 2,
        },
        767: {
          slidesPerView: Math.min(2, options.slides)
        },
        1023: {
          slidesPerView: Math.min(3, options.slides)
        }
      };

      var g = $wrap,
              gc = document.querySelectorAll('.ig-item'),
              $images = $wrap.find('img.insta-gallery-image'),
              gcLength = gc.length, // Total number of cells in the masonry
              gHeight = 0, // Initial height of our masonry
              gridGutter = 0,
              dGridCol = options.columns,
              tGridCol = 2,
              mGridCol = 1,
              //dWidth = Math.round($wrap.width() / $wrap.find('.ig-item')),
              i; // Loop counter

      if ($images.length) {

        var images = $images.length, loaded = 0;

        $images.load(function (e) {
          loaded++;

          if (loaded >= images) {

            setTimeout(function () {
              // Calculate the net height of all the cells in the masonry
              for (i = 0; i < gcLength; ++i) {
                gHeight += gc[i].offsetHeight + parseInt(gridGutter);
              }

              //$wrap.css({'height': gHeight / dWidth + gHeight / (gcLength + 1) + "px", 'display': 'flex'});

              if (window.screen.width >= 1024) {
                $wrap.css({'height': gHeight / dGridCol + gHeight / (gcLength + 1) + "px", 'display': 'flex'});
              } else if (window.screen.width < 1024 && window.screen.width >= 768) {
                $wrap.css({'height': gHeight / tGridCol + gHeight / (gcLength + 1) + "px", 'display': 'flex'});
              } else {
                $wrap.css({'height': gHeight / mGridCol + gHeight / (gcLength + 1) + "px", 'display': 'flex'});
              }

            }, 200);
          }
        });
      }
      //});
    }

  }

  // Initializing the carousel
  // ---------------------------------------------------------------------------
  function add_insta_gallery_popup($item) {

    var $wrap = $('.insta-gallery-items', $item),
            options = $wrap.data('igfs');

    if (options.popup) {

      $wrap.find('.ig-item > a').magnificPopup({
        type: 'image',
        mainClass: 'mfp-with-zoom',
        zoom: {
          enabled: true,
          duration: 300,
          easing: 'ease-in-out',
          opener: function (openerElement) {
            return openerElement.is('img') ? openerElement
                    : openerElement.find('img');
          }
        },
        gallery: {
          enabled: true
        },
        image: {
          titleSrc: function (item) {
            return item.el.attr('data-title')
                    + '<small><a href="'
                    + item.el.attr('data-iplink')
                    + '" target="blank" title="view on Instagram"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path style=" " d="M 5 3 C 3.898438 3 3 3.898438 3 5 L 3 19 C 3 20.101563 3.898438 21 5 21 L 19 21 C 20.101563 21 21 20.101563 21 19 L 21 13 L 19 11 L 19 19 L 5 19 L 5 5 L 13 5 L 11 3 Z M 14 3 L 16.65625 5.65625 L 9.15625 13.15625 L 10.84375 14.84375 L 18.34375 7.34375 L 21 10 L 21 3 Z "/>Link</svg></a></small>';
          }
        }
      });
    }
  }

  /*function add_insta_gallery_resizes($item, options) {
   
   var $wrap = $('.insta-gallery-items', $item),
   $images = $wrap.find('.ig-item .insta-gallery-image'),
   images = $images.length,
   loaded = 0,
   minheight = 0;
   
   if ($images.length) {
   
   $images.load(function (e) {
   loaded++;
   
   if (minheight == 0) {
   minheight = $(this).height();
   }
   if (($(this).width() == $(this).height())) {
   minheight = $(this).height();
   }
   if (loaded >= images) {
   $images.each(function (index) {
   console.log('init resizes 2');
   var th = $(this).height();
   console.log(th);
   console.log(minheight);
   //if (minheight < th) {
   console.log('init resizes 3');
   var m = (th - minheight) / 2;
   console.log(m);
   $(this).css('margin-top', '-' + m + 'px');
   $(this).css('margin-bottom', '-' + m + 'px');
   //}
   });
   }
   });
   }
   
   }*/

  /*function ig_lazy_load($wrap, igfs) {
   var lazyImages = [].slice.call($wrap.find('img.ig-lazy'));
   var active = false;
   
   var lazyLoadImages = function () {
   if (active === false) {
   active = true;
   
   setTimeout(
   function () {
   lazyImages
   .forEach(function (lazyImage) {
   if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage
   .getBoundingClientRect().bottom >= 0)
   && getComputedStyle(lazyImage).display !== "none") {
   lazyImage.src = lazyImage.dataset.src;
   lazyImage.classList.remove("lazy");
   
   lazyImages = lazyImages
   .filter(function (image) {
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
   }*/

  // IE8
  // ---------------------------------------------------------------------------

  if (navigator.appVersion.indexOf("MSIE 8.") != -1) {
    document.body.className += ' ' + 'instagal-ie-8';
  }
  if (navigator.appVersion.indexOf("MSIE 9.") != -1) {
    document.body.className += ' ' + 'instagal-ie-9';
  }

  $(document).on('ready', function (e) {

    $('.ig-block').each(function (index, item) {

      var $item = $(item);

      if ($item.hasClass('ig-block-loaded')) {
        return true;
      }

      if (!$item.data('item_id')) {
        return false;
      }

      $item.addClass('ig-block-loaded');

      var $spinner = $item.find('.ig-spinner'),
              item_id = parseInt($item.data('item_id'));

      $.ajax({
        url: qligg.ajax_url,
        type: 'post',
        data: {
          action: 'qligg_load_item',
          item_id: item_id
        },
        beforeSend: function () {
          //$spinner.show();
        },
        success: function (response) {

          if (response.success !== true) {
            console.log(response.data);
            return;
          }

          $item.append($(response.data));

          add_insta_gallery_carousel($item);
          //add_insta_gallery_masonry($item);
          //add_insta_gallery_resizes($item);
          add_insta_gallery_popup($item);

        },
        complete: function () {
          $spinner.hide();
          //if ($item.find('.insta-gallery-actions').length) {
          //  $spinner.prependTo($item.find('.insta-gallery-actions'));
          //}
        },
        error: function (jqXHR, textStatus) {
          console.log(textStatus);
        }
      });
    });
  });

})(jQuery);
