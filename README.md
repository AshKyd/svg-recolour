A SVG recolouration demo, showing the power of vector graphics.

What is it?
===========
SVG is an XML-based vector graphics language. This makes it easy for us
to manipulate attributes such as individual colours and lines within the
graphic.

This demo manipulates a SVG using a particular colour map in order to
create many colour variations of the same sprite. Furthermore, the demo
manages a filter over the overall colours in order to create night and
day variations.

![The screenshot shows a number of colour variations and a night/day sample](screenshot.png)

The Code
========
To illustrate my point, you can create a variation with the following
code:

	var svg = recolourAll({
		svg : aStringContainingSVGSource,
		primary : '#ff0000',
		secondary : '#0000ff',
		time : 13
	});
		
This demo recolours one of the image templates to be a primarily red
sprite with blue highlight colours as it would appear at 1 PM.

You can then add the SVG to the DOM the following code, for instance:

	$('body').append(svg);

The future
==========
This demo uses string replacement to change colours in an image which is
fast but has limitations in terms of functionality.

In the future I may implement an XML parsing version in order to
introduce advanced functionality such as manipulating attributes and
creating lighting effects.

See Also
========
Check out [isoCan](http://isocan.kyd.com.au/), an experimental isometric
HTML5 rendering engine.
