jQuery(document).ready(function($){
	
	$('.gs_logo_container').each(function(){
		var options = $(this).data('options');
		$(this).bxSlider(options);
	});
});