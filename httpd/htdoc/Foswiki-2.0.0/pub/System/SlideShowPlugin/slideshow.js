(function($){function switchSlide(incr){var hash=window.location.hash,slideNumber,slide,lastSlide=$(".slideShowLastSlide"),maxSlideNumber=parseInt(lastSlide.attr("id").replace(/GoSlide/,""),10);if(!hash.match(/^#GoSlide\d+$/)){return}if(incr===Number.MAX_VALUE){slide=lastSlide;hash="#GoSlide"+maxSlideNumber}else if(incr===0){hash="#GoSlide1";slide=$("div"+hash)}else{slideNumber=parseInt(hash.replace(/^#GoSlide/,"","g"),10);if(isNaN(slideNumber)){return}slideNumber+=incr;if(slideNumber<1){slideNumber=1}if(slideNumber>maxSlideNumber){slideNumber=maxSlideNumber}hash="#GoSlide"+slideNumber;slide=$("div"+hash)}if(slide.length){window.location.hash=hash}}$(function(){$(document).on("keydown",function(ev){switch(ev.keyCode){case 27:window.location.href=window.location.href.replace(/\?.*$/,"");return false;case 33:switchSlide(-10);return false;case 34:switchSlide(10);return false;case 35:switchSlide(Number.MAX_VALUE);return false;case 36:switchSlide(0);return false;case 37:switchSlide(-1);return false;case 39:switchSlide(1);return false;default:break}})})})(jQuery);