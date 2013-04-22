var Color = net.brehaut.Color;
	
var replacements = {
	primary : [
		'#6600cc',
		'#ff00ff',
		'#ff9bff'
	],
	secondary : [
		'#f44800',
		'#fb8b00',
		'#f0a513'
	]
};
	
var windowColors = {
	day : '#b3defd',
	nightRandom : '#ffff99',
	nightLight : '#ffff91',
	nightDark : '#3A4770',
	nightOnly : '#ffff92'
}

var neonColors = {
	on : "#98fc66",
	off : "#658A53",
	blink : "#ccff99",
}

function recolour(svg,type,newBase){
	
	var makeReplacement = function(haystack,type,before,after){
		var search = new RegExp(type+':'+before,'g');
		return haystack.replace(search,type+':'+after);
	}
	
	var baseColor = Color(newBase);
	var fills = {
		fill : [
			baseColor.darkenByRatio(.2).toCSS(),
			baseColor.toCSS(),
			baseColor.lightenByRatio(.2).toCSS()
		],
		stroke : [
			baseColor.darkenByRatio(.3).toCSS(),
			baseColor.darkenByRatio(.1).toCSS(),
			baseColor.lightenByRatio(.3).toCSS()
		]
	}
	
	for(var i=0; i<=2; i++){
		svg = makeReplacement(svg,'fill',replacements[type][i],fills.fill[i]);
		svg = makeReplacement(svg,'stop-color',replacements[type][i],fills.fill[i]);
		svg = makeReplacement(svg,'stroke',replacements[type][i],fills.stroke[i]);
	}
	
	return svg
}

function colorEq(a,b){
	if(typeof a == 'undefined' || typeof b == 'undefined') return false;
	return a.toUpperCase() == b.toUpperCase();
}

function numberBetween(a,b,c){
	return a < c && b > c;
}

function recolorEvening(str,oldColor,time,opts){
	
	if(colorEq(oldColor,neonColors.on)){
		return oldColor+';';
	} else if(colorEq(oldColor,neonColors.blink)){
		return time*10000%2 == 0 ? neonColors.on+';' : neonColors.off+';';
	}
	
	if(colorEq(oldColor,windowColors.nightOnly)){
		if(numberBetween(6,20,time)) {
			return 'rgba(0,0,0,0);';
		}
		return windowColors.nightLight;
		
	} else 	if(colorEq(oldColor,windowColors.nightLight) || colorEq(oldColor,windowColors.nightRandom)){
		if(numberBetween(6,20,time)) {
			return windowColors.day+';';
		}
		
		if(typeof opts.alwayslightup != 'undefined' && opts.alwayslightup || colorEq(oldColor,windowColors.nightLight)){
			return windowColors.nightLight+';';
		}
		
		var lightsChance = Math.abs(time - 12)/24;
		return Math.random() > lightsChance ? windowColors.nightLight+';' : windowColors.nightDark+';';
	}
	
	var color = Color(oldColor);
	if(numberBetween(5,6.1,time) || numberBetween(17,18.1,time)){
		color = color
			.darkenByRatio(0.05)
			.blend(Color('#FF8800'),.1);
	} else if(numberBetween(4,5.1,time) || numberBetween(18,19.1,time)){
		color = color
			.darkenByRatio(0.1)
			.blend(Color('#FF4400'),.1);
	} else if(numberBetween(3,4.1,time) || numberBetween(19,20.1,time)){
		color = color
			.darkenByRatio(0.2)
			.desaturateByRatio(.2)
			.blend(Color('#8800FF'),.1);
	} else if(numberBetween(20,24,time) || numberBetween(-1,6.1,time)){
		// From 9 PM until 6 AM
		color = color
			.darkenByRatio(.2)
			.desaturateByRatio(.5)
			.blend(Color('#0000ff'),.2)
	}
	return color.toCSS()+';';
}

function recolourAll(opts){
	
	opts.svg = recolour(opts.svg,'primary',opts.primary);
	opts.svg = recolour(opts.svg,'secondary',opts.secondary);
	
	opts.svg = opts.svg.replace(/(#[a-fA-F0-9]{6});/g,function(a,b){
		return recolorEvening(a,b,opts.time,opts);
	});
	
	return opts.svg;
	
}

function createImageFromSvg(data,callback){
	var img = new Image();
	base64.settings.ascii = true;
	var base = base64.encode(data);
	var url = 'data:image/svg+xml;charset=utf-8;base64,'+base;
	
	img.onload = function() {
		if(typeof callback != 'undefined'){
			callback(img);
		}
	};
	img.src = url;
	return img;
}

window.onload = function(){
	var templates = {
		
	};
	
	
	var submit = function(){
		var template = $('#template').val();
		if(typeof templates[template] == 'undefined'){
			alert('Template broken or still loading. Try again in a sec.');
		}
		
		var time = $('#time').val()/10000;
		console.log(time);
		
		var svg = recolourAll({
			svg : templates[template],
			primary : $('#col1').val(),
			secondary : $('#col2').val(),
			time : time
		})
		
		$('.render img').remove();
		$('.render')
			.append(createImageFromSvg(svg))
			.attr('class','render time-'+Math.round(time))
			.fadeIn();
			
		var hours = Math.round(time);
		var minutes = Math.round(60*((time*10000) % 10000)/10000);
		
		hours = hours < 10 ? "0"+hours : hours;
		minutes = minutes < 10 ? "0"+minutes : minutes
		$('.clock').text(hours+':'+minutes);
			
		return false;	
	}
	$('form').submit(submit);
	$('form input,form select').change(submit);
	
	$.ajax({
		url : '../img/diner.svgz',
		dataType : 'html',
		success : function(a){
			templates['diner.svgz'] = a;
		}
	});
	$.ajax({
		url : '../img/industrial-housing.svgz',
		dataType : 'html',
		success : function(a){
			templates['industrial-housing.svgz'] = a;
		}
	});
	$.ajax({
		url : '../img/shed.svgz',
		dataType : 'html',
		success : function(a){
			templates['shed.svgz'] = a;
		}
	});
	$.ajax({
		url : '../img/mill-accomodation.svgz',
		dataType : 'html',
		success : function(a){
			templates['mill-accomodation.svgz'] = a;
		}
	});
	$.ajax({
		url : '../img/farnsworth-house.svgz',
		dataType : 'html',
		success : function(a){
			templates['farnsworth-house.svgz'] = a;
		}
	});
	$.ajax({
		url : '../img/pritchard-house.svgz',
		dataType : 'html',
		success : function(a){
			templates['pritchard-house.svgz'] = a;
		}
	});
	$.ajax({
		url : '../img/market.svgz',
		dataType : 'html',
		success : function(a){
			templates['market.svgz'] = a;
		}
	});
	$.ajax({
		url : '../img/shopping-centre.svgz',
		dataType : 'html',
		success : function(a){
			templates['shopping-centre.svgz'] = a;
		}
	});
}

