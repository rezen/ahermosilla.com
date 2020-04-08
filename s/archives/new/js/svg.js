var paper = Raphael($('.pie'), 32, 32);



$('.experience h4').each(function(){
		alert('k');
	});



var attr = {
	'stroke':"#00AEEF" ,
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
//exp.animate({cx: 400,opacity:.1}, 4000);