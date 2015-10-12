var Polaroid = function(image) {

	this.image = image;
	this.id = image.id;
	this.is_landscape = false;
	this.is_square = false;
	this.name = image.name;
	this.height = 0;
	this.width = 0;
	this.canvas_width;
	this.canvas_height;
	this.tx = 0;
	this.ty = 0;
	this.bx = 0;
	this.by = 0;
	this.is_spectra = false;
	this.is_polaroid = true;
	this.zoom = 1;
	this.format = 1;
	this.effect = null;
	this.text = '';
	this.location_url;
	this.is_remote = true;
};
