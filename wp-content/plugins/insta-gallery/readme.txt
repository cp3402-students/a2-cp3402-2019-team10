=== Instagram Feed Gallery ===
Contributors: quadlayers
Tags: instagram, instagram feed, instagram widget, gallery widget, pictures, carousel slider, image gallery, image slider, instagram gallery, instagram pictures
Requires at least: 3.8.0
Requires PHP: 5.3
Tested up to: 5.2
Stable tag: 2.3.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Donate link: https://www.quadlayers.com

Instagram Gallery is an easy way to display your Instagram feeds pictures your website.

== Description ==

Easy and simple way to display your Instagram Feed and Tag Gallery on your website.

Display pictures from your Instagram account as gallery or as carousel Slider. Just press the button to generate your Instagram Access Token and configure gallery settings and display your pictures on your website.

== Installation ==

1. Go to the Plugins Menu in WordPress
2. Search for "Instagram Feed Gallery"
3. Click "Install"
4. Go to Instagram Gallery / Account in your admin dashboard
5. Press the "Add new account" button and generate the access token
6. Go to Instagram Gallery / Gallery and press the "Add new gallery" button
7. Configure your gallery
8. Press "Update" button and copy & paste your shortcode

== Frequently Asked Questions ==

= Why my pictures are not showing on page? =

You have to update valid Instagram access token to display user media.

= Can I display pictures from Instagram Tag? =

Yes, you can.

= How to add gallery to Widget? =

Go to your admin dashboard, and add new gallery, then go to widgets, add Instagram Gallery widget and select the Gallery item from the dropdown list.

= Why there are two popups on image click? =

There may be some other plugins(like: fancybox, elementor) which also uses image links to open popup. Try to disable popup images option in the setting panel of this plugin, which will allow other plugins to work.

= Error: No working transports found =

This error visible sometimes in PHP 7+ installations due to the missing CURL extension.

== Screenshots ==

1. Gallery front-end view
2. Gallery front-end view with image popup
3. Carousel Slider view
4. Plugin backend
5. Gallery Widget

== Changelog ==

= 2.3.1 =
* Fix. Reload on Instagram token removal
* Fix. Show Instagram token even if user profile id is empty
* Fix. Undefined Instagram username

= 2.3.0 =
* Improvement. Instagram token generation simplified
* Improvement. Instagram Gallery settings consistency 
* Improvement. Instagram Carousel settings consistency 
* Improvement. Instagram Gallery CSS consistency
* Improvement. Instagram Carousel CSS consistency
* Improvement. Instagram Gallery JS simplified
* Improvement. Instagram Carousel JS simplified
* Improvement. Instagram backend improvement
* Improvement. Instagram localization fixed

= 2.2.2 =
* Improvement. Instagram token and gallery transients consistency

= 2.2.1 =
* Improvement. Instagram Gallery un-install improvement

= 2.2.0 =
* Noce. Instagram Gallery author change notice

= 2.1.9 =
* Fix. Minor code changes

= 2.1.8 =
* Fix. Double popup issue with elementor plugin
* Fix. Instagram Gallery Swiper carousel library updated
* Fix. minor text changes

= 2.1.7 =
* Fix. Code bug

= 2.1.6 =
* Fix. connection issue on new access token update

= 2.1.5 =
* Fix. Instagram carousel image links
* Fix. Instagram gallery image alignment

= 2.1.4 =
* Fix. Instagram thumbnail imagessizes updated

= 2.1.3 =
* Fix. Code bug

= 2.1.2 =
* Fix. Security fixes

= 2.1.1 =
* Fix. Major update with lots-of changes
* Fix. Instagram API support added
* Fix. Access Token is required to display profile media
* Fix. Instagram pictures limit increased

= 1.6.6 =
* Fix. Code bug

= 1.6.5 =
* Fix. JS files issue with WP5 solved 

= 1.6.4 =
* Fix. speed improvements and small changes

= 1.6.3 =
* Fix. Instagram Carousel autoplay time option
* Fix. Imstagram Carousel dotted nav removed
* Fix. Instagram Carousel removed zoom image on hover

= 1.6.2 =
* Fix. Elementor confliction fixed
* Fix. code optimised
* Fix. IE 8,9 Carousel support dropped

= 1.6.1 =
* Fix. Spanish Translation added
* Fix. Tags picture limit removed
* Fix. Caption option removed
* Fix. Post link added in popup

= 1.5.11 =
* Fix. Code bug

= 1.5.10 =
* Fix. added option to change carousel arrow color

= 1.5.9 =
* Fix. CSS issue fixed

= 1.5.8 =
* Fix. some API code fixes

= 1.5.7 =
* Fix. user media API update

= 1.5.6 =
* Fix. option to hide images caption
* Fix. open Instagram page on image click

= 1.5.5 =
* Fix. Carousel autoplay toggle
* Fix. dashicons removed
* Fix. assets minified

= 1.5.4 =
* Fix. API update for Tags fixed

= 1.5.3 =
* Fix. added FIX for localization code issue

= 1.5.2 =
* Fix. prepared for localization

= 1.5.1 =
* Fix. Gallery widget added
* Fix. Transients support added
* Fix. template customisation added
* Fix. code updated for better performance

= 1.4.6 =
* Fix. Instagram API error quick FIX added

= 1.4.5 =
* Fix. Instagram button color options added
* Fix. two gallery pics in a row in mobile
* Fix. browser online check status removed
* Fix. fetch items via WP built-in option

= 1.4.4 =
* Fix. Carousel spacing bug fixed
* Fix. some CSS updates

= 1.4.3 =
* Fix. Carousel popup bug fixed
* Fix. added version to assets

= 1.4.2 =
* Fix. Gallery image sizes fixed to square display
* Fix. some CSS fixes

= 1.4.1 =
* Fix. Carousel image sizes fixed to square display
* Fix. added caching of images to speedup loading
* Fix. display type Slider removed
* Fix. old-shortcode warning message removed

= 1.3.7 =
* Fix. Instagram profile link/button added in Carousel view
* Fix. wp_nonce removed because of conflicts with cache plugins

= 1.3.6 =
* Fix. Instagram profile link/button added in gallery view
* Fix. added option to choose custom hover color

= 1.3.5 =
* Fix. cURL warning issue fixed

= 1.3.4 =
* Fix. cURL warning added

= 1.3.3 =
* Fix. ajax gallery loading
* Fix. speed optimised
* Fix. clean setting on un-install

= 1.3.2 =
* Fix. display likes and comments
* Fix. old shortcode support ended
* Fix. deprecated Slider view option

= 1.3.1 =
* Fix. Carousel view feature added
* Fix. non-english tag/account supported

= 1.2.4 =
* Fix. IE images issue fixed

= 1.2.3 =
* Fix. Admin Panel UI updated
* Fix. added #tag support
* Fix. shortcode updated

= 1.1.3 =
* Fix. some issues fixed
* Fix. css added to head for removing SEO and HTML validation issues
* Fix. demo pictures added to backend

= 1.1.2 =
* Fix. some issues fixed
* Fix. small modification in plugin backend

= 1.1.1 =
* Fix. Initial Release