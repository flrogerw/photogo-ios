var Fotobar = function() {

	this.ouput_file_type = 'jpg'; // 'png'
	this.images = {};
	this.random_trap = [];
	this.current_id;
	this.canvasSetHeight = Math.floor($(window).width() * .8);// 295
	this.canvasSetWidth = Math.floor(this.canvasSetHeight * .8474);// 250
	this.polaroidWidth = Math.ceil(this.canvasSetWidth * .89); // 222
	this.polaroidHeight = this.polaroidWidth; // 222
	this.fullFrameWidth = this.polaroidWidth; // 222
	this.fullFrameHeight = Math.ceil(this.fullFrameWidth * 1.2027); // 267
	this.spectraWidth = this.fullFrameHeight;// 267
	this.spectraHeight = Math.ceil(this.spectraWidth * .6367);// 170
	this.frame_margin = {
		x : Math.floor(this.canvasSetWidth * .056),
		y : Math.floor(this.canvasSetWidth * .056)
	};
	this.add_text = false;

};

Fotobar.prototype.deleteCurrentImages = function() {

	fotobar.images = {};

	var writer = new FotobarFileWriter();
	var deleteFolderContents = writer
			.deleteFolderContents(fotobarConfig.root_directory + '/cache');

	deleteFolderContents.fail(function(err) {

		fotobarUI.alertUser(err);
	});
};

Fotobar.prototype.getImagesOrderString = function(imageIdArray) {

	var returnArray = [];

	for (index in imageIdArray) {

		var imageStringObj = {};
		var current_image = this.images[imageIdArray[index]];

		for (param in current_image) {

			switch (param) {

			case ('image'):
				break;

			default:
				imageStringObj[param] = current_image[param];
				break;
			}
		}
		returnArray.push(imageStringObj);
	}

	return (returnArray);
};

Fotobar.prototype.getRemoteImage = function(remote_url) {

	return $.Deferred(function() {

		var self = this;
		var writer = new FotobarFileWriter();
		var download_link = encodeURI(remote_url);
		var filename = remote_url.split('/').pop().split(/[?#]/)[0];// .replace(/\.[^/.]+$/,
		// "");

		var getFileSystem = writer.getDownloadDir(fotobarConfig.root_directory
				+ '/cache');

		getFileSystem.done(function(fileSystem) {

			var base = fileSystem.root;
			var rootdir = base.toURL();
			var filePath = rootdir + fotobarConfig.root_directory + '/cache/'
					+ filename;
			var fileTransfer = new FileTransfer();

			fileTransfer.download(download_link, filePath, function(entry) {

				self.resolve(entry.toURL());
			}, function(err) {

				self.reject(err);
			});
		});

		getFileSystem.fail(function(err) {

			fotobarUI.alertUser(err);
		});
	});
};

Fotobar.prototype.getImageUpload = function(imageId) {

	return $.Deferred(function() {

		var self = this;
		var imageSrc = fotobar.images[imageId].image.org_uri;

		window.resolveLocalFileSystemURL(imageSrc, function(fileEntry) {

			fileEntry.file(function(file) {

				var reader = new FileReader();
				reader.onloadend = function(e) {
					var blob = new Blob([ e.target.result ], {
						type : "image/jpeg"
					});
					//var reader = null;
					self.resolve(blob);
				}
				reader.readAsArrayBuffer(file);
			});
		}, function(err) {

			alert(JSON.stringify(err));
		});
	});
};

Fotobar.prototype.factory = function(imageArray) {

	return $.Deferred(function() {

		var self = this;
		var imageArrayLength = imageArray.length;

		for (var i = 0; i < imageArrayLength; i++) {
			
			if( typeof( imageArray[i] ) == 'string' ){
				
				imageArray[i] = [ imageArray[i], imageArray[i] ];			
			}
					
			var org_uri = imageArray[i][0];
			var newImage = new Image();
			newImage.onload = function() {
				this.tmpImage = {};
				this.id = this.tmpImage.id = fotobar.getRandom();
				this.tmpImage.src = this.src;
				this.tmpImage.width = this.width;
				this.tmpImage.height = this.height;
				this.tmpImage.name = this.src.split('/').pop().split(/[?#]/)[0]
						.replace(/\.[^/.]+$/, "");
				this.tmpImage.name = this.tmpImage.id + '_'
						+ this.tmpImage.name + '.' + fotobar.ouput_file_type;
				fotobar.images[this.id] = new Polaroid(this.tmpImage);
				fotobar.setCanvasRotation(this);
				fotobarUI.initialize(this, true);
				fotobar.setImageParams(fotobar.images[this.id]);

				var imageURIs = imageArray.shift();
				fotobar.images[this.id].image.org_uri = imageURIs[0];
					
				fotobarCart.updateQuantity(fotobarUI.defaultSku, 1, this.id);

				if (imageArray.length == 0) {

					newImage = null;
					self.resolve();
				}
			}
			newImage.src = imageArray[i][1];
		}
	});
};

Fotobar.prototype.imageCount = function() {

	return (Object.keys(fotobar.images).length);
};

Fotobar.prototype.deleteImage = function(current_image) {

	delete fotobar.images[current_image.id];
};

Fotobar.prototype.setImageParams = function(current_image) {

	var image_container = document.getElementById('container_'
			+ current_image.id);
	var current_canvas = document.getElementById(current_image.id);

	switch (current_image.format) {

	case (1):
		
		$(current_canvas).height(this.polaroidHeight);
		current_image.height = this.polaroidHeight;
		$(current_canvas).width(this.polaroidWidth);
		$(current_canvas).css({
			"top" : this.frame_margin.x,
			"left" : this.frame_margin.y
		});
		current_image.width = this.polaroidWidth;
		$(image_container).width(this.canvasSetWidth);
		$(image_container).height(this.canvasSetHeight);
		
		current_image.canvas_width = current_image.width;
		current_image.canvas_height = current_image.width * current_image.aspect_ratio;
		
		if(current_image.is_landscape){
			current_image.canvas_width = [current_image.canvas_height, current_image.canvas_height = current_image.canvas_width][0];
		}
		break;

	case (2):
		
		$(current_canvas).height(this.fullFrameHeight);
		$(current_canvas).width(this.fullFrameWidth);
		$(current_canvas).css({
			"top" : this.frame_margin.x,
			"left" : this.frame_margin.y
		});
		current_image.height = this.fullFrameHeight;
		current_image.width = this.fullFrameWidth;
		$(image_container).width(this.canvasSetWidth);
		$(image_container).height(this.canvasSetHeight);
		current_image.canvas_width = current_image.width;
		current_image.canvas_height = current_image.width * current_image.aspect_ratio;
		break;

	case (3):
		
		$(current_canvas).height(this.fullFrameWidth);
		$(current_canvas).width(this.fullFrameHeight);
		$(current_canvas).css({
			"top" : this.frame_margin.x,
			"left" : this.frame_margin.y
		});
		current_image.width = this.fullFrameHeight;
		current_image.height = this.fullFrameWidth;
		$(image_container).width(this.canvasSetHeight);
		$(image_container).height(this.canvasSetWidth);
		current_image.canvas_width = current_image.width * current_image.aspect_ratio;
		current_image.canvas_height = current_image.width;
		break;

	case (4):
		
		$(current_canvas).height(this.spectraHeight);
		$(current_canvas).width(this.spectraWidth);
		$(current_canvas).css({
			"top" : this.frame_margin.x,
			"left" : this.frame_margin.y
		});
		current_image.width = this.spectraWidth;
		current_image.height = this.spectraHeight;
		$(image_container).width(this.canvasSetHeight);
		$(image_container).height(this.canvasSetWidth);
		current_image.canvas_width = current_image.width * current_image.aspect_ratio;
		current_image.canvas_height = current_image.width;
		break;
	}
};

Fotobar.prototype.getRandom = function() {

	var random = Math.floor((Math.random() * 10000) + 1);

	if (this.random_trap.indexOf(random) < 0) {

		this.random_trap.push(random);
		return ((new Date).getTime() +'_'+ random);
	}

	this.getRandom();
};

Fotobar.prototype.contains = function(haystack, needle) {

	var i = haystack.length;
	while (i--) {
		if (haystack[i] === needle) {
			return true;
		}
	}
	return false;
};

Fotobar.prototype.setCanvasRotation = function(current_image) {

	fotobar.images[current_image.id].aspect_ratio = current_image.height
	/ current_image.width;
	
	switch (true) {

	case (current_image.height < current_image.width):

		fotobar.images[current_image.id].is_landscape = true;
		fotobar.images[current_image.id].aspect_ratio = current_image.width / current_image.height;
	
		break;

	case (current_image.height == current_image.width):

		fotobar.images[current_image.id].is_square = true;
		fotobar.images[current_image.id].aspect_ratio = 1;
		break;
	}
	
};