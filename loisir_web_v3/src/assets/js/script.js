(function($){
	'use script';
    $(window).on('load', function(event) {
        $('#preloader').delay(500).fadeOut(500);
    });
	// WOW JS
	new WOW().init();
	// Scroll Area
	$(document).ready(function(){
	    $('.scroll-area').click(function(){
	      	$('html').animate({
	        	'scrollTop' : 0,
	      	},700);
	      	return false;
	    });
	    $(window).on('scroll',function(){
	      	var a = $(window).scrollTop();
	      	if(a>400){
	            $('.scroll-area').slideDown(300);
	        }else{
	            $('.scroll-area').slideUp(200);
	        }
	    });
	});
	// Nice Select
	$('select').niceSelect();
	// Search
	$('.header-search-icon i').click(function(){
      $('.f_header_search_canvas, .off_canvars_overlay').addClass('active');
   });
   $('.search_close, .off_canvars_overlay').click(function(){
      $('.f_header_search_canvas, .off_canvars_overlay').removeClass('active');
   });
   // MinCart
	$('.mini-cart-icon').on('click', function(){
        $('.off_canvars_overlay, .mini-cart-area').addClass('active')
    });
    $('.mini-cart-close,.off_canvars_overlay').on('click', function(){
        $('.mini-cart-area,.off_canvars_overlay').removeClass('active')
    });
 	 // /*---slider activation---*/
    var $HeroSlider = $('.hero-slider-full');
    if($HeroSlider.length > 0){
        $HeroSlider.owlCarousel({
            loop: true,
            dots:false,
            autoplay: true,
            autoplayTimeout: 20000,
            items: 1,
            nav:true,
            animateOut: 'fadeOut',
            smartSpeed: 500,
            navText:['<span class="hero-slider-nav"><i class="bi bi-arrow-left"></i></span>','<span class="hero-slider-nav"><i class="bi bi-arrow-right"></i></span>'],
            responsive:{
                    0:{
                    dots:true,
                },
                577:{
                    dots:false,
                },
            }
        });
    }
 	 // /*---slider activation---*/
    var $HeroSlider2 = $('.hero-slider-full2');
    if($HeroSlider2.length > 0){
        $HeroSlider2.owlCarousel({
            loop: true,
            dots:true,
            autoplay: true,
            autoplayTimeout: 20000,
            items: 1,
            nav:false,
            animateOut: 'fadeOut',
            smartSpeed: 500,
        });
    }
 	 // /*---slider activation---*/
    var $dEALpSlider = $('.deal_product_slider');
    if($dEALpSlider.length > 0){
        $dEALpSlider.owlCarousel({
            loop: true,
            dots:false,
            autoplay: true,
            autoplayTimeout: 20000,
            items: 1,
            nav:true,
            smartSpeed: 500,
            navText:['<span class="DEAL-slider-nav"><i class="bi bi-arrow-left"></i></span>','<span class="DEAL-slider-nav"><i class="bi bi-arrow-right"></i></span>'],
        });
    }
    // /*---QuickView Gallery---*/
    var $QuickViewGallery = $('.quick_view_gallery');
        if($QuickViewGallery.length > 0){
        $('.quick_view_gallery').owlCarousel({
            autoplay: true,
            loop: false,
            nav: true,
            autoplay: false,
            autoplayTimeout: 8000,
            items: 4,
            margin:10,
            dots:false,
            navText:['<span class="quick-slider-nav"><i class="bi bi-chevron-left"></i></span>','<span class="quick-slider-nav"><i class="bi bi-chevron-right"></i></span>'],
            responsiveClass:true,
            responsive:{
                    0:{
                    items: 2,
                    stagePadding: 0,
                    margin: 0,
                },
                600:{
                    items:2,
                },
                876:{
                    items:3,
                },
                991:{
                    items:4,
                },
            }
        });
    }
     /*---Featured Products---*/
    var $FeaturedProductSlider = $('.feature-product-slider');
        if($FeaturedProductSlider.length > 0){
        $('.feature-product-slider').owlCarousel({
            autoplay: true,
            loop: false,
            nav: true,
            autoplay: false,
            autoplayTimeout: 8000,
            items: 4,
            margin:30,
            dots:false,
            navText:['<span class="feature-slider-nav"><i class="bi bi-arrow-left"></i></span>','<span class="feature-slider-nav"><i class="bi bi-arrow-right"></i></span>'],
            responsiveClass:true,
            responsive:{
                    0:{
                    items: 1,
                    stagePadding: 0,
                    margin: 0,
                },
                400:{
                    items:2,
                },
                876:{
                    items:3,
                },
                991:{
                    items:4,
                },
            }
        });
    } 
     /*---Featured Products---*/
    var $RelatedProductSlider = $('.related-product-slider');
        if($RelatedProductSlider.length > 0){
        $('.related-product-slider').owlCarousel({
            autoplay: true,
            loop: false,
            nav: true,
            autoplay: false,
            autoplayTimeout: 8000,
            items: 4,
            margin:30,
            dots:false,
            navText:['<span class="related-slider-nav"><i class="bi bi-arrow-left"></i></span>','<span class="related-slider-nav"><i class="bi bi-arrow-right"></i></span>'],
            responsiveClass:true,
            responsive:{
                    0:{
                    items: 1,
                    stagePadding: 0,
                    margin: 0,
                },
                400:{
                    items:2,
                },
                876:{
                    items:3,
                },
                991:{
                    items:4,
                },
            }
        });
    } 
    // /*---slider activation---*/
    var $TestimonialSlider = $('.testimonial-full');
    if($TestimonialSlider.length > 0){
        $TestimonialSlider.owlCarousel({
            loop: true,
            dots:true,
            autoplay: true,
            autoplayTimeout: 20000,
            items: 3,
            nav:false,
            margin:30,
            smartSpeed: 1500,
           	responsive: {
                0: {
                    items: 1,
                    stagePadding: 0,
                    margin: 0,
                },
                767: {
                    items: 1
                },
                992: {
                    items: 2
                },
            }
        });
    }
    //PopuP
    $('a[data-rel^=lightcase]').lightcase({
        transition: 'elastic', /* none, fade, fadeInline, elastic, scrollTop, scrollRight, scrollBottom, scrollLeft, scrollHorizontal and scrollVertical */
        swipe: true,
        maxWidth: 1170,
        maxHeight: 600,
    });
    // Quantity
    jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up">+</div><div class="quantity-button quantity-down">-</div></div>').insertAfter('.quantity input');
    jQuery('.quantity').each(function() {
      var spinner = jQuery(this),
        input = spinner.find('input[type="number"]'),
        btnUp = spinner.find('.quantity-up'),
        btnDown = spinner.find('.quantity-down'),
        min = input.attr('min'),
        max = input.attr('max');

      btnUp.click(function() {
        var oldValue = parseFloat(input.val());
        if (oldValue >= max) {
          var newVal = oldValue;
        } else {
          var newVal = oldValue + 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
      });

      btnDown.click(function() {
        var oldValue = parseFloat(input.val());
        if (oldValue <= min) {
          var newVal = oldValue;
        } else {
          var newVal = oldValue - 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
      });

    });

	// Sticky Menu
	$(document).ready(function(){
		$(window).on('scroll',function(){
			var scroll = $(window).scrollTop();
			if(scroll < 150){
				$('.sticky-header').removeClass('sticky');
			}else{
				$('.sticky-header').addClass('sticky');
			}
		});
	});
}(jQuery));