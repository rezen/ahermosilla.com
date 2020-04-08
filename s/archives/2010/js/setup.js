$(function(){
	$("#slides").slides({
		play: 5000,
		pause: 2500,
		crossfade: true,
		effect: 'fade',
		hoverPause: true
	});

	$('#flickr-feed').jflickrfeed({
		limit: 10,
		qstrings: {
			id: '26901611@N03'
		},
		itemTemplate: '<li>'+
						'<a rel="colorbox" href="{{image}}" title="{{title}}">' +
							'<img src="{{image_s}}" alt="{{title}}" />' +
						'</a>' +
					  '</li>'
	}, function(data) {
		$('#flickr-feed a').fancybox({
			padding:0,
			overlayColor:'#000'
		});
	});
	$('.email').each(function(i) {
		var $this = $(this);
		var	span =  $this.find('span');
        var text = span.text();
        	text = text.replace(" at ", "@");

         $this.attr('href', 'mailto:' + text);
         span.text(text);
     });
});