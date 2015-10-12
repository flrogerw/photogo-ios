var FotobarCarousel = function() {

	this.margins = {};
	this.margin2 = 20;
	this.margin = -80;
	this.shrinkPercent = .8;
	this.rotateDuration;
	this.shrinkDuration = 950;
	this.formatShrink = 250;
	this.carouselArray;
	this.animateArray = [];
	this.padleWheel = [];
};

FotobarCarousel.prototype.initialize = function(carousel_elements) {

	this.carouselArray = carousel_elements;
	this.animateArray = Object.keys(carousel_elements);
	this.padleWheel = [];
	
	var padleWheelLength = (this.animateArray.length > 3) ? 3
			: (this.animateArray.length - 1);

	for (var i = 0; i <= padleWheelLength; i++) {
		this.padleWheel.push(i);
	}

	this.drawWheel();

};

FotobarCarousel.prototype.drawWheel = function() {

	switch (true) {

	case (this.animateArray.length == 1):

		var centerRider = $(this.carouselArray).get(this.padleWheel[0])
		this.centerRider(centerRider);
		fotobarUI.setCurrentElements($(centerRider).attr('canvas'));
		fotobarUI.setFormatButtons();
		break;

	case (this.animateArray.length == 2):
		
		var centerRider = $(this.carouselArray).get(this.padleWheel[0]);
		this.centerRider(centerRider);
		this.setRightMargin($(this.carouselArray).get(this.padleWheel[1]));
		fotobarUI.setCurrentElements($(centerRider).attr('canvas'));
		fotobarUI.setFormatButtons();
		break;

	default:

		this.setLeftMargin($(this.carouselArray).get(this.padleWheel[0]));
		this.centerRider($(this.carouselArray).get(this.padleWheel[1]));
		this.setRightMargin($(this.carouselArray).get(this.padleWheel[2]));
		break;
	}
};

FotobarCarousel.prototype.centerRider = function(rider) {

	var centeredMarginLeft = ($(window).width() - $(rider).width()) / 2;

	$(rider).css({
		'display' : 'inline-block',
		'left' : centeredMarginLeft,
		'z-index' : '1000'
	});

};

FotobarCarousel.prototype.setRightMargin = function(rider) {
	
	var shrinkHeight = parseInt($(rider).height()) * this.shrinkPercent;
	var shrinkWidth = parseInt($(rider).width()) * this.shrinkPercent;
	var topMargin = (parseInt($(rider).height()) - shrinkHeight) / 2;
	
	$(rider).css({
		'display' : 'inline-block',
		'left' : ($(window).width() + this.margin) + 'px',
		'z-index' : '1',
		'margin-top' : topMargin
	});

	$(rider).find('div.canvas').height(shrinkHeight + 'px').width(
			shrinkWidth + 'px');

};

FotobarCarousel.prototype.setLeftMargin = function(rider) {

	var shrinkHeight = $(rider).height() * this.shrinkPercent;
	var shrinkWidth = $(rider).width() * this.shrinkPercent;
	var topMargin = ($(rider).height() - shrinkHeight) / 2;

	$(rider).css({
		'display' : 'inline-block',
		'left' : ((shrinkWidth + this.margin) * -1) + 'px',
		'z-index' : '1',
		'margin-top' : topMargin
	});

	$(rider).find('div.canvas').height(shrinkHeight + 'px').width(
			shrinkWidth + 'px');
};

FotobarCarousel.prototype.hideShow = function(imageContainer, currentImage,
		is_swipeLeft) {

	var hideMargin = (is_swipeLeft) ? ((currentImage.canvas_width * this.shrinkPercent) * -1)
			: $(window).width();

	$(imageContainer).animate(
			{
				'left' : hideMargin + 'px',
			},
			this.formatShrink,
			function() {
				fotobarUI.carousel.showNext(imageContainer, currentImage,
						is_swipeLeft);
			});
};

FotobarCarousel.prototype.hideOld = function(imageContainer, currentImage,
		is_swipeLeft) {
	
	var hideMargin = (is_swipeLeft) ? ((currentImage.canvas_width * this.shrinkPercent) * -1)
			: $(window).width();

	$(imageContainer).animate({
		'left' : hideMargin + 'px'
	}, this.shrinkDuration, function() {
		
	});
	
};

FotobarCarousel.prototype.shrinkCenter = function(imageContainer, currentImage,
		is_swipeLeft) {

	var formatAdjust = (fotobar.contains([ 3, 4 ], currentImage.format)) ? .12
			: 0;

	var leftMargin = (is_swipeLeft) ? (((currentImage.canvas_width * this.shrinkPercent) + this.margins.left) * -1)
			: this.margins.right;

	var canvas = $(imageContainer).find('div.canvas');
	var topMargin = ($("#swipe_panels").height() - (currentImage.canvas_height * (this.shrinkPercent + formatAdjust))) / 2;
	$(imageContainer).css('z-index', '500');

	$(imageContainer)
			.animate(
					{
						left : leftMargin + 'px',
						marginTop : topMargin + 'px',
						height : ($(imageContainer).height() * (this.shrinkPercent + formatAdjust))
								+ 'px',
						width : ($(imageContainer).width() * this.shrinkPercent)
								+ 'px'

					}, this.shrinkDuration, function() {
						$(imageContainer).css({
							'z-index' : '1'
						});
					});
	
	$(canvas).animate({
		
		height : (currentImage.height  * (fotobarUI.carousel.shrinkPercent + formatAdjust)),
		width : (currentImage.width * fotobarUI.carousel.shrinkPercent) ,
	}, this.shrinkDuration, function() {

	});
};

FotobarCarousel.prototype.growNext = function(imageContainer, currentImage,
		is_swipeLeft) {

	var canvas = $(imageContainer).find('div.canvas');
	var topMargin = ($("#swipe_panels").height() - currentImage.canvas_height) / 2;
	$(imageContainer).css({
		'z-index' : '1000'
	});

	$(imageContainer).animate({
		left : this.margins.centered,
		marginTop : topMargin,
		width : currentImage.canvas_width,
		height : currentImage.canvas_height
	}, this.shrinkDuration, function() {

	});

	$(canvas).animate({
		height : currentImage.height,
		width : currentImage.width,
	}, this.shrinkDuration, function() {

	});
};

FotobarCarousel.prototype.showNext = function(imageContainer, currentImage,
		is_swipeLeft) {
	
	var formatAdjust = (fotobar.contains([ 3, 4 ], currentImage.format)) ? .12
			: 0;
	var shrunk = (currentImage.canvas_width * this.shrinkPercent);
	
	//var polaroidContainer = $(imageContainer).find(
			//'div.polaroid-picture-container');
	var canvas = $(imageContainer).find('div.canvas');
	var topMargin = ($("#swipe_panels").height() - (currentImage.canvas_height * (this.shrinkPercent + formatAdjust))) / 2;
	var showMargin = (is_swipeLeft) ? this.margins.right
			: ((shrunk + this.margins.left) * -1);
	var startLocation = (is_swipeLeft) ? $(window).width() : (shrunk * -1);

	$(imageContainer)
			.css(
					{
						'display' : 'inline-block',
						'left' : startLocation + 'px',
						'z-index' : '1',
						'height' : (currentImage.canvas_height * (this.shrinkPercent + formatAdjust))
								+ 'px',
						'width' : (currentImage.canvas_width * this.shrinkPercent)
								+ 'px',
						'margin-top' : topMargin
					});

	$(canvas).height(
			(currentImage.height * (this.shrinkPercent + formatAdjust)))
			.width((currentImage.width * this.shrinkPercent));

	$(imageContainer).animate({
		'left' : showMargin + 'px'

	}, this.formatShrink, function() {

	});

};

FotobarCarousel.prototype.setMargin = function(currentImage) {

	var centeredMargin = (($(window).width() - currentImage.canvas_width) / 2);
	var leftMargin = (centeredMargin - this.margin2) * -1;
	var rightMargin = $(window).width() + leftMargin;

	this.margins = {
		left : leftMargin,
		centered : centeredMargin,
		right : rightMargin
	};
};

FotobarCarousel.prototype.updateFormat = function(imageContainer, currentImage) {

	this.setMargin(currentImage);
	
	var canvas = $(imageContainer).find('div.canvas');
	var topMargin = ($("#swipe_panels").height() - currentImage.canvas_height) / 2;

	$(imageContainer).animate({
		left : this.margins.centered,
		marginTop : topMargin,
		width : currentImage.canvas_width,
		height : currentImage.canvas_height
	}, this.formatShrink, function() {

	});
	
	$(canvas).animate({
		height : currentImage.height,
		width : currentImage.width,
	}, this.formatShrink, function() {

	});

	if (this.animateArray.length == 1) {
		return;
	}

	var leftImage = this.carouselArray[this.padleWheel[0]];
	var rightImage = this.carouselArray[this.padleWheel[2]];

	$(leftImage).animate({
		left : ($(leftImage).width() + this.margins.left) * -1
	}, this.formatShrink, function() {

	});
	$(rightImage).animate({
		left : this.margins.right
	}, this.formatShrink, function() {

	});
};

FotobarCarousel.prototype.rotateWheel = function(ev_type) {
	
	var is_swipeLeft;
	var hideContainer;
	var hideImage;
	var shrinkContainer;
	var shrinkImage;
	var growContainer;
	var growImage;
	var showContainer;
	var showImage;
	var nextCurrent;

	switch (true) {

	case (this.animateArray.length == 1):
		return;
		break;

	case (this.animateArray.length == 2):

		is_swipeLeft = (ev_type == 'swipeleft') ? true : false;
		growContainer = $(this.carouselArray).get(this.padleWheel[1]);
		growImage = fotobar.images[$(growContainer).attr('canvas')];
		shrinkContainer = $(this.carouselArray).get(this.padleWheel[0]);
		shrinkImage = fotobar.images[$(shrinkContainer).attr('canvas')];
		nextCurrent = $(growContainer).attr('canvas');
		fotobarUI.setCurrentElements(nextCurrent);
		fotobarUI.setFormatButtons();
		this.setMargin(growImage);
		this.shrinkCenter(shrinkContainer, shrinkImage, is_swipeLeft);
		this.growNext(growContainer, growImage, is_swipeLeft);
		break;

	case (this.animateArray.length == 3):

		switch (true) {

		case (ev_type == 'swiperight'):

			is_swipeLeft = false;
			hideContainer = $(this.carouselArray).get(this.padleWheel[2])
			hideImage = fotobar.images[$(hideContainer).attr('canvas')];
			growContainer = $(this.carouselArray).get(this.padleWheel[0]);
			growImage = fotobar.images[$(growContainer).attr('canvas')];
			break;

		case (ev_type == 'swipeleft'):
		default:

			is_swipeLeft = true;
			hideContainer = $(this.carouselArray).get(this.padleWheel[0])
			hideImage = fotobar.images[$(hideContainer).attr('canvas')];
			growContainer = $(this.carouselArray).get(this.padleWheel[2]);
			growImage = fotobar.images[$(growContainer).attr('canvas')];
			showContainer = $(this.carouselArray).get(this.padleWheel[1])
			showImage = fotobar.images[$(showContainer).attr('canvas')];
			break;
		}

		shrinkContainer = $(this.carouselArray).get(this.padleWheel[1]);
		shrinkImage = fotobar.images[$(shrinkContainer).attr('canvas')];

		this.setMargin(growImage);
		nextCurrent = $(growContainer).attr('canvas');
		fotobarUI.setCurrentElements(nextCurrent);
		fotobarUI.setFormatButtons();
		this.hideShow(hideContainer, hideImage, is_swipeLeft);
		this.shrinkCenter(shrinkContainer, shrinkImage, is_swipeLeft);
		this.growNext(growContainer, growImage, is_swipeLeft);
		break;

	default:

		switch (true) {

		case (ev_type == 'swiperight'):

			is_swipeLeft = false;
			hideContainer = $(this.carouselArray).get(this.padleWheel[2])
			hideImage = fotobar.images[$(hideContainer).attr('canvas')];
			growContainer = $(this.carouselArray).get(this.padleWheel[0]);
			growImage = fotobar.images[$(growContainer).attr('canvas')];
			break;

		case (ev_type == 'swipeleft'):
		default:

			is_swipeLeft = true;
			hideContainer = $(this.carouselArray).get(this.padleWheel[0])
			hideImage = fotobar.images[$(hideContainer).attr('canvas')];
			growContainer = $(this.carouselArray).get(this.padleWheel[2]);
			growImage = fotobar.images[$(growContainer).attr('canvas')];
			break;
		}

		shrinkContainer = $(this.carouselArray).get(this.padleWheel[1]);
		shrinkImage = fotobar.images[$(shrinkContainer).attr('canvas')];
		showContainer = $(this.carouselArray).get(this.padleWheel[3])
		showImage = fotobar.images[$(showContainer).attr('canvas')];

		this.setMargin(growImage);
		nextCurrent = $(growContainer).attr('canvas');
		fotobarUI.setCurrentElements(nextCurrent);
		fotobarUI.setFormatButtons();
		this.hideOld(hideContainer, hideImage, is_swipeLeft);
		this.shrinkCenter(shrinkContainer, shrinkImage, is_swipeLeft);
		this.growNext(growContainer, growImage, is_swipeLeft);
		this.showNext(showContainer, showImage, is_swipeLeft);
		break;
	}

	this.setPadleWheel(is_swipeLeft);

};

FotobarCarousel.prototype.setPadleWheel = function(is_swipeLeft) {

	this.padleWheel = [];

	if (is_swipeLeft) {

		this.animateArray.push(this.animateArray.shift());

	} else {
		this.animateArray.unshift(this.animateArray.pop());
	}

	for (var i = 0; i <= 3; i++) {
		this.padleWheel.push(this.animateArray[i]);
	}
	// alert('wheel: '+this.padleWheel)
};
