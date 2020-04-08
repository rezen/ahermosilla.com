var gear = Raphael('gear', 200, 200) , 
		cr = [];

var gearO = gear.set();

var teeth = gear.path("M159.476,76.753c-0.264,0-0.264,0-0.264,0c-0.29,0.007-1.549-3.15-2.8-7.019c-1.249-3.865-5.932-13.334-5.719-13.536"+
			"c0,0,0,0,0.191-0.189c8.014-8.016,9.747-19.276,3.871-25.154c-5.878-5.878-17.14-4.146-25.155,3.868"+
			"c-0.189,0.191-0.189,0.191-0.189,0.191c-0.203,0.214-3.28-1.121-6.84-2.963c-3.558-1.844-13.724-5.264-13.717-5.554"+
			"c0,0,0,0,0-0.266c0-11.333-6.737-20.523-15.049-20.523c-8.312,0-15.051,9.19-15.051,20.523c0,0.266,0,0.266,0,0.266"+
			"c0.009,0.291-3.149,1.549-7.018,2.8c-3.868,1.249-13.334,5.932-13.537,5.718c0,0,0,0-0.19-0.188"+
			"c-8.014-8.017-19.277-9.749-25.154-3.871c-5.877,5.878-4.145,17.138,3.869,25.154c0.192,0.189,0.192,0.189,0.192,0.189"+
			"c0.213,0.202-1.121,3.28-2.964,6.838c-1.844,3.558-5.265,13.724-5.555,13.717c0,0,0,0-0.266,0"+
			"c-11.334,0-20.523,6.739-20.523,15.052c0,8.31,9.188,15.047,20.523,15.047c0.266,0,0.266,0,0.266,0"+
			"c0.291-0.007,1.549,3.151,2.798,7.019c1.25,3.869,5.933,13.336,5.72,13.538c0,0,0,0-0.191,0.19"+
			"c-8.015,8.015-9.748,19.277-3.869,25.155c5.876,5.876,17.138,4.143,25.154-3.871c0.189-0.19,0.189-0.19,0.189-0.19"+
			"c0.203-0.214,3.279,1.119,6.839,2.963c3.558,1.844,13.725,5.264,13.716,5.554c0,0,0,0,0,0.265c0,11.335,6.74,20.523,15.051,20.523"+
			"c8.312,0,15.049-9.188,15.049-20.523c0-0.265,0-0.265,0-0.265c-0.007-0.291,3.151-1.549,7.019-2.8"+
			"c3.868-1.248,13.334-5.932,13.538-5.718c0,0,0,0,0.191,0.19c8.014,8.014,19.277,9.747,25.154,3.871"+
			"c5.876-5.878,4.145-17.14-3.869-25.155c-0.192-0.188-0.192-0.188-0.192-0.188c-0.213-0.203,1.12-3.281,2.964-6.841"+
			"c1.843-3.559,5.264-13.725,5.554-13.717c0,0,0,0,0.264,0c11.336,0,20.524-6.737,20.524-15.047"+
			"C180,83.492,170.812,76.753,159.476,76.753z");
gearO.push(
	cr[0] = gear.circle(93.803, 91.805, 39.41).attr({stroke:"#27AAE1"}),
	cr[1] = cr[0].clone().attr({r:29.064}),
	teeth

			
			);
			
gearO.attr({
	'stroke':"#C82258",
	'stroke-width':2.2,
	'stroke-linecap':"round" ,
	'stroke-linejoin':"round",
	'stroke-miterlimit':10,
	

	
});	





var bubble = Raphael('bubble', 180, 140);
var bub = bubble.set();
bub.push(
    cr[0] = bubble.circle(43.43, 64.534, 3.552).attr({'stroke':"#00AEEF", 'stroke-width':2, 'stroke-linecap':"round", 'stroke-linejoin':"round", 'stroke-miterlimit':10}),
		cr[1] = cr[0].clone().attr({cx:58.551}),
		cr[2] = cr[0].clone().attr({cx:73.175}),
		bubble.path("M36.13,82.772c2.632,0.585,5.368,0.895,8.176,0.895h15.93l10.736,21.711l10.693-21.711h15.916"+
		"c20.706,0,37.491-16.785,37.491-37.491c0-20.705-16.785-37.49-37.491-37.49H44.307c-20.706,0-37.491,16.785-37.491,37.49"+
		"c0,11.704,5.363,22.153,13.765,29.029").attr({'stroke':"#00AEEF", 'stroke-width':2, 'stroke-linecap':"round", 'stroke-linejoin':"round", 'stroke-miterlimit':10})

)
	 

bub.scale(1.3,1.3,-8,-8);
/* bub.glow({width:4,opacity:0.2}); */
$(function(){
	$('.experience h4').each(function(i){
		var $this = $(this);
		 $this.append('<div class="pie" id="pie-'+i+'"></div>');
		 var paper = Raphael('pie-'+i, 32, 32);
		 
		 var attr = {
	'stroke':"#"+$this.attr('data-hex'),
	'stroke-width':1.5,
	'stroke-linecap':"round" ,
	'stroke-linejoin':"round",
	'stroke-miterlimit':10,
	x:90,
	y:90,
	cx:90,
	cy:90
	
}

var exp = paper.set();

exp.push(	
	paper.path("M2.648,15.27c1.644,4.158,6.107,6.749,10.534,6.131,M21.486,10.352c-0.746-5.362-5.699-9.104-11.06-8.357c-0.87,0.12-1.696,0.354-2.466,0.68C3.969,4.358,1.443,8.563,2.069,13.056l9.708-1.353l3.818,9.029C19.586,19.049,22.111,14.844,21.486,10.352z").attr(attr)
	//paper.path("").attr(attr)
)    

exp.scale(1.3,1.3,-8,-8);
		 
	});
	
	$('.showcase').masonry({
  itemSelector: '.item'});

$('#tweets').tweetable({username: 'dandr3ss',limit:12});
	


});

/*
 var c = 0;
      
setInterval(function(){
	c++;
	if(c===6){
		c = 0;
	}
	var text = '_'; 
	for (var z = 0; c > z; z++ ){
		text += '_';
	}
	
	$('#look-for em').text(text);
	},600);
*/


var app = {
	title :{prefix:'ANDRES HERMOSILLA // '},
	current : {class:'home',section:$('#home')},
	old:{},
	changesection : function(p){
		var base = this;
		document.title = base.title.prefix+p.toUpperCase();
		$('body').removeClass(this.current.class).addClass(p);
		this.current.class = p;
		base.old = this.current.section;
		this.current.section.removeClass('current').addClass('moving');
		var out = setTimeout(function(){
			base.old.removeClass('moving')
		},2000);
		$('#'+p).addClass('current');
		this.current.section = $('#'+p);
		
		console.log(p )
	},
	actions:{}
}



$('#last-fm').lastplayed({
	apikey:		'37513d698ad5a86a19b6f76b11b39545',
	username:	'dandress',
	limit:7
});


 $.getJSON('https://api.github.com/users/rezen/repos?callback=?', function(resp) {
	 console.log(resp);
        if (resp.data.length > 0) {
            $('#github-repos').append('<ul></ul>');
	
            $.each($(resp.data), function(i, val) {
                $('#github > ul').append(
                    '<li><a href="'+val['html_url']+'">'+val['name']+' <span>'+val['watchers']+'</span></a><p>'+((val['description']) ? val['description'] : '(No description.)')+'</p></li>'
                );
            });
        }
        else {
            $('#github-repos').append('<p>No public repositories.</p>');
        }
    });



app.actions['default'] = function(){
	
}

app.actions['404'] = function(){
		
}
app.actions['about'] = function(){
	
}
app.actions['home'] = function(){
	
}

app.actions['web-development'] = function(){
	teeth.animate({"90%":{rotation:800},"100%":{rotation:845}},5000);
}

var $sitewrap = $('#sitewrap');

Path.map("#/x/:page").to(function(){
		var page = this.params['page'];
         app.changesection(page);
	
				if(app.actions.hasOwnProperty(page)){
					app.actions[page]();
				} else {
					app.actions['default']();
				}
});


Path.root("#/x/home");
Path.rescue(function(){
    actions['404']();
});

window.onload = function () {
//	Cufon.replace('h1,h2,h3');

Path.listen();
setTimeout(function(){
	$('.skills li').eq(0).children('span').addClass('active');
	
	$('body').removeClass('preload');
	
	},700);

	}







