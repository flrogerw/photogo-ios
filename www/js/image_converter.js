/* Image Manipulation   */

var interval = 30;
var max_zoom = 2;
var dragPixels = 20;
var polaroidWidth = 222;
var polaroidHeight = 222;
var fullFrameWidth = 222;
var fullFrameHeight = 267;
var spectraHeight = 170;
var spectraWidth = 267;
var canvasSetWidth = 250
var canvasSetHeight = 295;
var max_text_length = 30;
var frame_margin = {
	x : 14,
	y : 14
};

var polaroid_mask_img = 'images/small-transparent-polaroid.png';
var fullframe_mask_img = 'images/small-transparent-polaroid-full.png';
var h_polaroid_mask_img = 'images/small-transparent-landscape.png';
var h_fullframe_mask_img = 'images/horizontal-small-transparent-polaroid-full.png';

var dragableStartPoint = {};
var isLandscape = false;
var add_text = false;
var current_image_id;
var current_mask_image = new Image();
var current_canvas;
var dragablePageX = 0;
var dragablePageY = 0;
var files;
var intervalTimer;
var images = {};
var lastMouseMove = {
	x : 0,
	y : 0
};
var current_image;
var random_trap = [];

$(document).ready(
		function() {

			// Event Listener for File Selection
			if (document.getElementById('files') !== null) {
				document.getElementById('files').addEventListener('change',
						handleFileSelect, false);
			}

			// Stops Canvas ReDraw Interval
			$(document).on(
					'mouseup',
					function() {
						$("#timer").text('stoped');
						clearInterval(intervalTimer);
						if (typeof current_canvas !== "undefined") {
							$("#listen").text('false');

							current_canvas.removeEventListener('mousemove',
									canvasMouseMove);
						}
					});

			$("#paynow").click(function() {
				postToServer();
			});

			$("#continue_to_checkout").click(function() {
				continueButtonClick();
			});

			$("#dialog").dialog({
				autoOpen : false,
				height : 310,
				width : 360,
				modal : true,
			});

		});

function textBlur() {
	
		images[current_image_id]['text'] = $('#text_' + current_image_id).val();
		$('#text_' + current_image_id).hide();
		drawRotated();	
}

function postToServer() {

	var push_to_server = false;

	var image_payload = jQuery.extend(true, {}, images);

	for (i in image_payload) {

		if (image_payload[i] !== 'undefined') {

			var imageData = image_payload[i].image.src.split(',');
			image_payload[i].base64 = imageData[1];
			delete image_payload[i].image;
			push_to_server = true;

		}
	}

	if (push_to_server) {

		$("#dialog").dialog("open");

		$.ajax({
			xhr : function() {
				var xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener("progress", myProgressHandler,
						false);
				xhr.addEventListener("load", myCompleteHandler, false);
				xhr.addEventListener("error", myErrorHandler, false);
				xhr.addEventListener("abort", myAbortHandler, false);

				return xhr;
			},
			type : "POST",
			url : "upload.php",
			dataType : "html",
			data : image_payload
		});
	}

	image_payload = null;
}

function _(elementID) {
	return document.getElementById(elementID);
}

function myCompleteHandler(event) {
	_("status").innerHTML = event.target.responseText;
	_("progressBar").value = 0;
	$("#continue_to_checkout").removeAttr('disabled');
}
function myErrorHandler(event) {
	_("status").innerHTML = "Upload Failed";
}
function myAbortHandler(event) {
	_("status").innerHTML = "Upload Aborted";
}

function myProgressHandler(event) {
	_("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of "
			+ event.total;
	var percent = (event.loaded / event.total) * 100;
	_("progressBar").value = Math.round(percent);
	_("status").innerHTML = Math.round(percent) + "% uploaded... please wait";
}

function continueButtonClick() {

	$("#dialog").dialog("close");
	$("#two").hide();
	$("#three").show();

}

function textButtonClick() {
	textBlur( $(this) );
	current_image_id = $(this).attr('canvas');
	current_canvas = _(current_image_id);
	current_image = images[current_image_id];

	$('#text_' + current_image_id).show().focus();

}

function deleteButtonClick() {

	var container = document.getElementById("container_"
			+ $(this).attr('canvas'));
	container.parentNode.removeChild(container);
	delete images[$(this).attr('canvas')];

}

function zoomButtonClick() {

	current_image_id = $(this).attr('canvas');
	current_canvas = _(current_image_id);
	current_image = images[current_image_id];

	var zoom_factor = ($(this).attr('class') == 'zoom_in_button') ? current_image.zoom + .1
			: current_image.zoom + -.1;
	current_image.zoom = (zoom_factor >= 1 && zoom_factor <= max_zoom) ? zoom_factor
			: current_image.zoom;
	// current_image.zoom = (Math.round( current_image.zoom * 10) /
	// 10).toFixed(1);

	// setRotation();
	setImageCords(null);
	drawRotated();
}

function rotateButtonClick(event) {

	current_image_id = $(this).attr('canvas');
	current_canvas = _(current_image_id);
	current_image = images[current_image_id];

	current_image.rotation += ($(this).attr('class') == 'cw_button') ? 90 : -90;
	current_image.rotation = (current_image.rotation < 0) ? 360 + current_image.rotation
			: current_image.rotation;

	current_image.rotation = (current_image.rotation == 360) ? 0
			: current_image.rotation;

	setRotation();
	setImageCords(null);
	drawRotated();
}

function setRotation() {

	var sfbButton = _("sfb_" + current_image_id);

	switch (true) {

	case (current_image.is_spectra
			&& contains([ 0, 180 ], current_image.rotation) && current_image.is_landscape):
	case (current_image.is_spectra
			&& contains([ 90, 270 ], current_image.rotation) && !current_image.is_landscape):

		current_image.is_spectra = true;
		current_image.format = 4;
		sfbButton.disabled = false;
		break;

	case (current_image.is_spectra
			&& contains([ 90, 270 ], current_image.rotation) && current_image.is_landscape):
	case (current_image.is_spectra
			&& contains([ 0, 180 ], current_image.rotation) && !current_image.is_landscape):

		current_image.format = 2;
		current_image.is_spectra = false;
		sfbButton.disabled = true;
		break;

	case (contains([ 0, 180 ], current_image.rotation) && !current_image.is_landscape):
		current_image.format = (current_image.is_polaroid) ? 1 : 2;
		sfbButton.disabled = true;
		break;

	case (contains([ 90, 270 ], current_image.rotation) && current_image.is_landscape):

		current_image.format = (current_image.is_polaroid) ? 1 : 2;
		sfbButton.disabled = true;
		break;

	case (contains([ 90, 270 ], current_image.rotation) && contains(
			[ 1, 2, 4 ], current_image.format)):
		current_image.format = (current_image.is_polaroid) ? 1 : 3,
				sfbButton.disabled = false;
		break;

	case (contains([ 90, 270 ], current_image.rotation) && contains([ 3, 4 ],
			current_image.format)):
		current_image.format = (current_image.is_polaroid) ? 1 : 3,
				sfbButton.disabled = false;
		break;

	case (contains([ 0, 180 ], current_image.rotation)
			&& current_image.is_landscape && contains([ 1, 2, 3 ],
			current_image.format)):
		current_image.format = (current_image.is_polaroid) ? 1 : 3;
		sfbButton.disabled = false;
		break;

	case (contains([ 0, 180 ], current_image.rotation)
			&& current_image.is_landscape && contains([ 4 ],
			current_image.format)):
		current_image.format = (current_image.rotation == 0) ? 4 : 3;
		sfbButton.disabled = false;
		break;

	}
}

function frameButtonClick(event) {

	current_image_id = $(this).attr('canvas');
	current_canvas = _(current_image_id);
	current_image = images[current_image_id];

	switch ($(this).attr('class')) {

	case ('full_frame_button'):
		current_image.is_polaroid = false;
		current_image.is_spectra = false;
		break;

	case ('spectra_frame_button'):
		current_image.is_polaroid = false;
		current_image.is_spectra = true;
		break;

	default:
		current_image.is_polaroid = true;
		current_image.is_spectra = false;
		break;
	}

	setRotation();
	setImageCords(null);
	drawRotated();
}

/*
 * Formats: 1 Portrait Polaroid 2 Portrait Full 3 Landscape Full 4 Landscape
 * Polaroid
 */

function setImageCords(imageObj, fileName) {

	if (typeof images[current_image_id] === "undefined") {

		images[current_image_id] = {
			tx : 0,
			ty : 0,
			bx : 0,
			by : 0,
			plot_x : 0,
			plot_y : 0,
			rotation : 0,
			is_landscape : isLandscape,
			is_spectra : false,
			is_polaroid : true,
			is_dragable : true,
			zoom : 1,
			format : 1,
			base64 : null,
			name : fileName,
			text : '',
			image : imageObj
		};
	}

	current_mask_image = new Image();
	current_image = images[current_image_id];

	setImageParams();

	var cropCords = {
		image_width : (current_image.is_landscape) ? current_image.image.height
				: current_image.image.width,
		image_height : (current_image.is_landscape) ? current_image.image.width
				: current_image.image.height,
		print_width : (current_image.is_landscape) ? current_image.height
				: current_image.width,
		print_height : (current_image.is_landscape) ? current_image.width
				: current_image.height,
	};

	var ratio = cropCords.print_height / cropCords.print_width;

	current_image.plot_x = -(cropCords.print_width / 2);
	current_image.plot_y = -(cropCords.print_height / 2);
	current_image.plot_width = cropCords.print_width;
	current_image.plot_height = cropCords.print_height;

	switch (true) {

	case (contains([ 90, 270 ], current_image.rotation) && !current_image.is_spectra):
		ratio = cropCords.print_width / cropCords.print_height;
		swapPlots();
		break;

	case (current_image.is_spectra && !current_image.is_landscape):
		cropCords.image_width = [ cropCords.image_height,
				cropCords.image_height = cropCords.image_width ][0];
		break;
	}

	current_image.tx = 0;
	current_image.ty = Math
			.round((cropCords.image_height - (ratio * cropCords.image_width)) / 2);
	current_image.bx = cropCords.image_width;
	current_image.by = Math.round(ratio * cropCords.image_width);

	if (current_image.is_landscape || current_image.is_spectra) {

		current_image.tx = [ current_image.ty,
				current_image.ty = current_image.tx ][0];
		current_image.bx = [ current_image.by,
				current_image.by = current_image.bx ][0];
		swapPlots();
	}

}

function drawRotated() {

	var context = current_canvas.getContext('2d');

	context.clearRect(0, 0, current_canvas.width, current_canvas.height);
	context.drawImage(current_mask_image, 0, 0);
	context.save();

	context.translate((current_image.width / 2) + frame_margin.x,
			(current_image.height / 2) + frame_margin.y);
	context.rotate(current_image.rotation * Math.PI / 180);

	context.drawImage(current_image.image,
			(current_image.tx / current_image.zoom),
			(current_image.ty / current_image.zoom),
			(current_image.bx / current_image.zoom),
			(current_image.by / current_image.zoom), current_image.plot_x,
			current_image.plot_y, current_image.plot_width,
			current_image.plot_height);

	context.restore();
	drawText(context);

	debugObject();
}

function drawText(context) {

	if (current_image.text.length > 0
			&& current_image.text.length < max_text_length) {

		// var text_x = 125 - Math.round( current_image.text.length / 2 );
		context.font = "28px marydaleregular";
		context.textAlign = "center";
		context.fillText(current_image.text, 125, 272);
	}
}

function getRandom() {

	var random = Math.floor((Math.random() * 10000) + 1);

	if (random_trap.indexOf(random) < 0) {

		random_trap.push(random);
		return (random);
	}

	getRandom();
}

function createImageContainer(image_id, is_new_order) {

	current_canvas = document.createElement("canvas");
	current_canvas.height = canvasSetHeight;
	current_canvas.width = canvasSetWidth;
	current_canvas.className = 'canvas';
	current_canvas.addEventListener('mousedown', canvasMouseDown, false);
	current_image_id = image_id;
	current_canvas.id = current_image_id;
	current_canvas.setAttribute('canvas', current_image_id);

	var image_container = document.createElement('div');
	image_container.className = "image_container";
	image_container.setAttribute('id', 'container_' + current_image_id);

	var fotodiv = document.createElement('div');

	fotodiv.className = "polaroid-picture-container";
	fotodiv.appendChild(current_canvas);
	image_container.appendChild(fotodiv);

	if (is_new_order) {

		var cw_button = document.createElement('button');
		cw_button.addEventListener('click', rotateButtonClick, false);
		cw_button.className = "cw_button";
		cw_button.innerHTML = "CW";
		cw_button.setAttribute('canvas', current_image_id);

		var ccw_button = document.createElement('button');
		ccw_button.addEventListener('click', rotateButtonClick, false);
		ccw_button.className = "ccw_button";
		ccw_button.innerHTML = "CCW";
		ccw_button.setAttribute('canvas', current_image_id);

		var full_frame_button = document.createElement('button');
		full_frame_button.addEventListener('click', frameButtonClick, false);
		full_frame_button.className = "full_frame_button";
		full_frame_button.setAttribute("id", "ffb_" + current_image_id);
		full_frame_button.innerHTML = "80-Series";
		full_frame_button.setAttribute('canvas', current_image_id);

		var spectra_frame_button = document.createElement('button');
		spectra_frame_button.addEventListener('click', frameButtonClick, false);
		spectra_frame_button.className = "spectra_frame_button";
		spectra_frame_button.setAttribute("id", "sfb_" + current_image_id);
		spectra_frame_button.disabled = (isLandscape) ? false : true;
		spectra_frame_button.innerHTML = "Spectra";
		spectra_frame_button.setAttribute('canvas', current_image_id);

		var zoom_in_button = document.createElement('button');
		zoom_in_button.addEventListener('click', zoomButtonClick, false);
		zoom_in_button.className = "zoom_in_button";
		zoom_in_button.innerHTML = "Zoom In";
		zoom_in_button.setAttribute('canvas', current_image_id);

		var zoom_out_button = document.createElement('button');
		zoom_out_button.addEventListener('click', zoomButtonClick, false);
		zoom_out_button.className = "zoom_out_button";
		zoom_out_button.innerHTML = "Zoom Out";
		zoom_out_button.setAttribute('canvas', current_image_id);

		var polaroid_frame_button = document.createElement('button');
		polaroid_frame_button
				.addEventListener('click', frameButtonClick, false);
		polaroid_frame_button.className = "polaroid_frame_button";
		polaroid_frame_button.innerHTML = "SX-70";
		polaroid_frame_button.setAttribute('canvas', current_image_id);

		var delete_button = document.createElement('button');
		delete_button.addEventListener('click', deleteButtonClick, false);
		delete_button.className = "delete_button";
		delete_button.innerHTML = "Delete";
		delete_button.setAttribute('canvas', current_image_id);

		var add_text_button = document.createElement('button');
		add_text_button.addEventListener('click', textButtonClick, false);
		add_text_button.className = "add_text_button";
		add_text_button.innerHTML = "Add Text";
		add_text_button.setAttribute('canvas', current_image_id);

		var input_text = document.createElement('input');
		input_text.addEventListener('blur', textBlur, false);
		input_text.className = "none";
		input_text.setAttribute("id", "text_" + current_image_id);

		image_container.appendChild(cw_button);
		image_container.appendChild(ccw_button);
		image_container.appendChild(polaroid_frame_button);
		image_container.appendChild(full_frame_button);
		image_container.appendChild(spectra_frame_button);
		image_container.appendChild(zoom_in_button);
		image_container.appendChild(zoom_out_button);
		image_container.appendChild(add_text_button);
		image_container.appendChild(delete_button);
		image_container.appendChild(input_text);
	}

	document.getElementById('list').insertBefore(image_container, null);

}

function setCanvasRotation(imageObj) {

	isLandscape = (imageObj.height < imageObj.width) ? true : false;
}

function handleFileSelect(evt) {

	files = evt.target.files;

	for ( var i = 0, f; f = files[i]; i++) {

		if (!f.type.match('image.*')) {
			continue;
		}

		var reader = new FileReader();
		reader.onloadend = (function(file) {
			return function(e) {

				var fileName = file.name.replace(' ', '_');
				var imageObj = new Image();
				imageObj.src = e.target.result;
				imageObj.onload = function() {

					setCanvasRotation(imageObj);
					createImageContainer(getRandom(), true);
					setImageCords(imageObj, fileName);
					// drawFirst();
					drawRotated()
				};
			};
		})(f);

		reader.readAsDataURL(f);

	}
	$('#first').hide();
	$('#two').show();
}

function canvasMouseMove(event) {

	if (current_image.is_dragable) {
		setPrintCords(event);
	}
}

function contains(haystack, needle) {

	var i = haystack.length;
	while (i--) {
		if (haystack[i] === needle) {
			return true;
		}
	}
	return false;
}

function canvasMouseDown(event) {

	dragablePageY = event.pageY;
	dragablePageX = event.pageX;
	lastMouseMove = {
		x : 0,
		y : 0
	};

	current_image_id = $(this).attr('canvas');
	current_canvas = document.getElementById(current_image_id);
	current_canvas.addEventListener('mousemove', canvasMouseMove, false);
	current_image = images[current_image_id];

	dragableStartPoint = {
		tx : current_image.tx,
		ty : current_image.ty,
		bx : current_image.bx,
		by : current_image.by
	};

	intervalTimer = setInterval(function() {
		$("#timer").text('running');
		drawRotated();
	}, interval);
}

function getMouseMove(event) {

	var mouseMove = {
		x : 0,
		y : 0
	};
	var moveX = (dragablePageX - event.pageX);
	var moveY = (dragablePageY - event.pageY);

	if (moveX != lastMouseMove.x) {
		mouseMove.x = (moveX > lastMouseMove.x) ? dragPixels : -dragPixels;
	}

	if (moveY != lastMouseMove.y) {
		mouseMove.y = (moveY > lastMouseMove.y) ? dragPixels : -dragPixels;
	}

	lastMouseMove = {
		x : moveX,
		y : moveY
	};

	return (mouseMove);
}

function setPrintCords(event) {

	var newDragPosition = {
		tx : 0,
		ty : 0,
		bx : 0,
		by : 0
	};

	var canvasDrag = getMouseMove(event);

	switch (true) {

	case (contains([ 0 ], current_image.rotation) && current_image.is_landscape):
		canvasDrag.x *= -1;
		canvasDrag.y *= -1;
	case (contains([ 180 ], current_image.rotation) && current_image.is_landscape):

		newDragPosition.tx = current_image.tx - canvasDrag.x;
		newDragPosition.ty = current_image.ty - canvasDrag.y;
		newDragPosition.bx = current_image.image.height;
		newDragPosition.by = Math
				.round((current_image.height / current_image.width)
						* current_image.image.width);
		// swapPlots();
		break;

	case (contains([ 90 ], current_image.rotation) && current_image.is_landscape):
		canvasDrag.x *= -1;
		canvasDrag.y *= -1;
	case (contains([ 270 ], current_image.rotation) && current_image.is_landscape):

		newDragPosition.tx = current_image.tx - canvasDrag.y;
		newDragPosition.ty = current_image.ty - canvasDrag.x;
		newDragPosition.bx = current_image.image.height;
		newDragPosition.by = Math
				.round((current_image.height / current_image.width)
						* current_image.image.width);

		break;

	case (contains([ 0 ], current_image.rotation) && !current_image.is_landscape):
		canvasDrag.x *= -1;
		canvasDrag.y *= -1;
	case (contains([ 180 ], current_image.rotation) && !current_image.is_landscape):

		newDragPosition.tx = current_image.tx - canvasDrag.x;
		newDragPosition.ty = current_image.ty - canvasDrag.y;
		newDragPosition.bx = current_image.image.width;
		newDragPosition.by = Math
				.round((current_image.height / current_image.width)
						* current_image.image.width);
		break;

	case (contains([ 270 ], current_image.rotation) && !current_image.is_landscape):
		canvasDrag.x *= -1;
		canvasDrag.y *= -1;
	case (contains([ 90, 270 ], current_image.rotation) && !current_image.is_landscape):

		newDragPosition.tx = current_image.tx + canvasDrag.y;
		newDragPosition.ty = current_image.ty - canvasDrag.x;
		newDragPosition.bx = current_image.image.width;
		newDragPosition.by = Math
				.round((current_image.width / current_image.height)
						* current_image.image.width);
		// swapPlots();
		break;
	}

	if ((newDragPosition.tx <= (current_image.image.width * current_image.zoom)
			- newDragPosition.bx)
			&& newDragPosition.tx >= 0
			&& (newDragPosition.bx <= (current_image.image.width * current_image.zoom))) {
		current_image.tx = newDragPosition.tx;
		current_image.bx = newDragPosition.bx;
	}

	if ((newDragPosition.ty <= (current_image.image.height * current_image.zoom)
			- newDragPosition.by)
			&& newDragPosition.ty >= 0
			&& (newDragPosition.by <= (current_image.image.height * current_image.zoom))) {

		current_image.ty = newDragPosition.ty;
		current_image.by = newDragPosition.by;
	}
}

function setImageParams() {

	switch (current_image.format) {

	case (1):
		current_mask_image.src = polaroid_mask_img;
		current_image.height = polaroidHeight;
		current_image.width = polaroidWidth;
		current_canvas.width = canvasSetWidth;
		current_canvas.height = canvasSetHeight;
		current_canvas.parentElement.setAttribute('class',
				"polaroid-picture-container");
		break;

	case (2):
		current_mask_image.src = fullframe_mask_img;
		current_image.height = fullFrameHeight;
		current_image.width = fullFrameWidth;
		current_canvas.width = canvasSetWidth;
		current_canvas.height = canvasSetHeight;
		current_canvas.parentElement.setAttribute('class',
				"polaroid-picture-container");
		break;

	case (3):
		current_mask_image.src = h_fullframe_mask_img;
		current_image.width = fullFrameHeight;
		current_image.height = fullFrameWidth;
		current_canvas.width = canvasSetHeight;
		current_canvas.height = canvasSetWidth;
		current_canvas.parentElement.setAttribute('class',
				"h_polaroid-picture-container");
		break;

	case (4):
		current_mask_image.src = h_polaroid_mask_img;
		current_image.width = spectraWidth;
		current_image.height = spectraHeight;
		current_canvas.width = canvasSetHeight;
		current_canvas.height = canvasSetWidth;
		current_canvas.parentElement.setAttribute('class',
				"h_polaroid-picture-container");
		break;
	}

}

function swapPlots() {

	current_image.plot_height = [ current_image.plot_width,
			current_image.plot_width = current_image.plot_height ][0];
	current_image.plot_x = [ current_image.plot_y,
			current_image.plot_y = current_image.plot_x ][0];
}

function debugObject() {

	$("#obj").empty();
	for (k in current_image) {

		switch (true) {

		case (k == 'image'):
			continue;
			break;

		case (k == 'zoom'):

			// current_image[k] = parseFloat(current_image.zoom).toFixed(1);
			break;
		}

		$("#obj").append("<br>" + k + ":" + current_image[k]);
	}
}