var FotoSelect = function() {
	this.images = [];
};



FotoSelect.prototype.getImages = function(fotoselect, max_selections) {
    
	return $.Deferred(function() {

		var self = this;

		window.imagePicker.getPictures(function(results) {

			if (results.length == 0) {
				self.reject();
			}
                                       

			for (var i = 0; i < results.length; i++) {
                                       
				var imageURIs = results[i];
				fotoselect.images.push(imageURIs);
			}
  
			self.resolve();

		}, function(error) {
            
                    fotobarUI.alertUser({type:'error', text: 'Image Select Error: ' + error});
		}, {
			maximumImagesCount : max_selections,
			quality : 70
		// width: 800
 
		});
	});
};
