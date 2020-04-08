$(window).load(function(){
	//for each descriptionWrap div...
	$('div.descriptionWrap').each(function(){
		//...set the opacity to 0...
		$(this).css('opacity', 0);
		//..set width same as the image...
		$(this).css('width', $(this).siblings('img').width());
		//...get the parent (the thumbWrap) and set it's width same as the image width... '
		$(this).parent().css('width', $(this).siblings('img').width());
		//...set the display to block
		$(this).css('display', 'block');
	});
	
	$('div.thumbWrap').hover(function(){
		//when mouse hover over the thumbWrap div
		//get it's children elements with class descriptio
		//and show it using fadeTo
		$(this).children('.descriptionWrap').stop().fadeTo(500, 0.8);
	},function(){
		//when mouse out of the thumbWrap div
		//use fadeTo to hide the div
		$(this).children('.descriptionWrap').stop().fadeTo(500, 0);
	});
	
});
  
