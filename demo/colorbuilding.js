var Color = net.brehaut.Color;

var replacements = {
    primary: [
        '#6600cc', // dark
        '#ff00ff', // medium
        '#ff9bff'  // light
    ],
    secondary: [
        '#f44800',
        '#fb8b00',
        '#f0a513'
    ],
    primaryAlt: [
        '#ff00ff',
        '#6600cc',
        '#ff9bff'
    ],
    secondaryAlt: [
        '#fb8b00',
        '#f44800',
        '#f0a513'
    ],
};

var windowColors = {
    day: '#b3defd',
    nightRandom: '#ffff99',
    nightLight: '#ffff91',
    nightDark: '#3A4770',
    nightOnly: '#ffff92'
}

var neonColors = {
    on: "#98fc66",
    off: "#658A53",
    blink: "#ccff99",
}

    function recolour(svg, type, newBase) {

        var makeReplacement = function(haystack, type, before, after) {
            var search = new RegExp(type + ':' + before, 'g');
            return haystack.replace(search, type + ':' + after);
        }

        var baseColor = Color(newBase);
        var fills = {
            fill: [
                baseColor.darkenByRatio(.2).toCSS(),
                baseColor.toCSS(),
                baseColor.lightenByRatio(.2).toCSS()
            ],
            stroke: [
                baseColor.darkenByRatio(.3).toCSS(),
                baseColor.darkenByRatio(.1).toCSS(),
                baseColor.lightenByRatio(.3).toCSS()
            ]
        }

        for (var i = 0; i <= 2; i++) {
            svg = makeReplacement(svg, 'fill', replacements[type][i], fills.fill[i]);
            svg = makeReplacement(svg, 'stop-color', replacements[type][i], fills.fill[i]);
            svg = makeReplacement(svg, 'stroke', replacements[type][i], fills.stroke[i]);
        }

        return svg
    }

    function colorEq(a, b) {
        if (typeof a == 'undefined' || typeof b == 'undefined') return false;
        return a.toUpperCase() == b.toUpperCase();
    }

    function numberBetween(a, b, c) {
        return a < c && b > c;
    }

    function recolorEvening(str, oldColor, time, opts) {

        if (colorEq(oldColor, neonColors.on)) {
            return oldColor + ';';
        } else if (colorEq(oldColor, neonColors.blink)) {
            return time * 10000 % 2 == 0 ? neonColors.on + ';' : neonColors.off + ';';
        }

        if (colorEq(oldColor, windowColors.nightOnly)) {
            if (numberBetween(6, 20, time)) {
                return 'rgba(0,0,0,0);';
            }
            return windowColors.nightLight;

        } else if (colorEq(oldColor, windowColors.nightLight) || colorEq(oldColor, windowColors.nightRandom)) {
            if (numberBetween(6, 20, time)) {
                return windowColors.day + ';';
            }

            if (typeof opts.alwayslightup != 'undefined' && opts.alwayslightup || colorEq(oldColor, windowColors.nightLight)) {
                return windowColors.nightLight + ';';
            }

            var lightsChance = Math.abs(time - 12) / 24;
            return Math.random() > lightsChance ? windowColors.nightLight + ';' : windowColors.nightDark + ';';
        }

        var color = Color(oldColor);
        if (numberBetween(5, 6.1, time) || numberBetween(17, 18.1, time)) {
            color = color
                .darkenByRatio(0.05)
                .blend(Color('#FF8800'), .1);
        } else if (numberBetween(4, 5.1, time) || numberBetween(18, 19.1, time)) {
            color = color
                .darkenByRatio(0.1)
                .blend(Color('#FF4400'), .1);
        } else if (numberBetween(3, 4.1, time) || numberBetween(19, 20.1, time)) {
            color = color
                .darkenByRatio(0.2)
                .desaturateByRatio(.2)
                .blend(Color('#8800FF'), .1);
        } else if (numberBetween(20, 24, time) || numberBetween(-1, 6.1, time)) {
            // From 9 PM until 6 AM
            color = color
                .darkenByRatio(.2)
                .desaturateByRatio(.5)
                .blend(Color('#0000ff'), .2)
        }
        return color.toCSS() + ';';
    }

    function recolourAll(opts) {
    	var flipped = opts.flip ? 'Alt' : '';
        opts.svg = recolour(opts.svg, 'primary'+flipped, opts.primary);
        opts.svg = recolour(opts.svg, 'secondary'+flipped, opts.secondary);

        opts.svg = opts.svg.replace(/(#[a-fA-F0-9]{6});/g, function(a, b) {
            return recolorEvening(a, b, opts.time, opts);
        });

        return opts.svg;

    }

    function createImageFromSvg(data, callback) {
        var img = new Image();
        base64.settings.ascii = true;
        var base = base64.encode(data);
        var url = 'data:image/svg+xml;charset=utf-8;base64,' + base;

        img.onload = function() {
            if (typeof callback != 'undefined') {
                callback(img);
            }
        };
        img.src = url;
        return img;
    }
window.onerror = function(a, b, c) {
    alert(a);
}

window.onload = function() {
    var templates = {

    };

    var droppedFile = false;
    var $render = $('.render');
    var isRendering = false;

    function update(template) {
    	if(isRendering){
    		isRendering = 'blocked';
    		return;
    	}
    	isRendering = true;
        var time = $('#time').val() / 10000;
        var flip = $('#flipped').is(':checked');

        $render.attr('data-status','rendering');

        window.requestAnimationFrame(function(){
	        var svg = recolourAll({
	            svg: template,
	            primary: $('#col1').val(),
	            secondary: $('#col2').val(),
	            flip: flip,
	            time: time
	        });

	        $('.render img').remove();
	        $('.render')
	            .append(createImageFromSvg(svg))
	            .attr('class', 'render time-' + Math.round(time))
	            .fadeIn();

	        if(flip){
	        	$('.render img').addClass('flip');
	        } else {
	        	$('.render img').removeClass('flip');
	        }

	        var hours = Math.round(time);
	        var minutes = Math.round(60 * ((time * 10000) % 10000) / 10000);

	        hours = hours < 10 ? "0" + hours : hours;
	        minutes = minutes < 10 ? "0" + minutes : minutes;
	        $('.clock').text(hours + ':' + minutes);

	        $render.attr('data-status','');
	        if(isRendering == 'blocked'){
	        	isRendering = false;
	        	update(template);
	        }
	        isRendering = false;
        });
    }


    var submit = function() {
        var template = $('#template').val();
        if (droppedFile) {
            update(droppedFile);
        } else if (templates[template]) {
            update(templates[template]);
        } else {
        	$render.attr('data-status','downloading');
            $.ajax({
                url: '../img/' + template + '.svg',
                dataType: 'html',
                success: function(a) {
                    templates[template] = a;
                    update(a);
                }
            });
        }
        return false;
    };

    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                droppedFile = e.target.result;
                update(droppedFile);
            };
        })(files[0]);

        // Read in the image file as a data URL.
        reader.readAsText(files[0]);
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    // Setup the dnd listeners.
    var dropZone = document.getElementsByTagName('body')[0];
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    $('form').submit(submit);
    $('form input').change(submit);
    $('form select').change(function() {
        droppedFile = false;
        submit.call(this);
    });

    [
        'diner', '1x1-industrial-housing', 'shed', 'mill-accomodation',
        'farnsworth-house', 'pritchard-house', '1x1-market',
        'streetside-shop-nw','1x1-house','1x1-house-2', '1x2-house',
        '2x2-apartment','2x2-commercial','3x3-commercial-2','4x4-office-building'

    ].forEach(function(item) {
        $('#template').append($('<option>').text(item));
    });
}