var FotobarInstagram = function() {

	this.paginationUrl;
	this.api = new FotobarRest(fotobarConfig.ig_api_url);
};

FotobarInstagram.prototype.login = function() {

	return $.Deferred(function() {

		var self = this;
		var login_url = fotobarConfig.ig_auth_url + '?' + $.param({
			client_id : fotobarConfig.ig_app_id,
			redirect_uri : fotobarConfig.ig_redirect,
			response_type : 'token'
		});
		
		window.cookies.clear(function() {
		    console.log('Cookies cleared!');
		});

		var loginWindow = window.open(login_url, '_blank', "location=no"); // only android
		

		var responceCount = 0; // closes window in case of 404

		$(loginWindow).on('loadstart', function(e) {
			
			responceCount++;
			var url = e.originalEvent.url;
			var access_token = url.split("access_token=")[1] || null;
			var error = url.split("error=")[1] || null;

			switch (true) {

			case (access_token != null):

				$(loginWindow).off();
				loginWindow.close();
				self.resolve(access_token);
				break;

			case (error != null):
			case (responceCount > 5): // closes window in case of 404
				
				loginWindow.close();
				self.reject(error);
				break;
			}
		});

		$(loginWindow).on('loaderror', function(e) {
			self.reject(e);
		});
	});
};


FotobarInstagram.prototype.pagination = function(access_token) {
	
	return $.Deferred(function() {
		
		var igImages = [];
		
		if(fotobarUI.instagram.paginationUrl == null ){
			self.resolve(igImages);
		}

		var self = this;
		var getIgPhotos = fotobarUI.instagram.api.getCall(fotobarUI.instagram.paginationUrl);

		getIgPhotos.done(function(photos) {
			
			for (count in photos.data) {
				
				imageData = {
					id : photos.data[count].id,
					url : photos.data[count].images.standard_resolution.url
				}

				igImages.push(imageData);
			}

			

				//alert('media: '+fotobarUI.current_social_media);
			fotobarUI.instagram.paginationUrl = (photos.pagination.next_url == null )? null:photos.pagination.next_url.split('/').splice(4).join('/');
	
			if( photos.pagination.next_url == null ){
				$('#show_more').hide();
			}
			self.resolve(igImages);
		});

		getIgPhotos.fail(function(err) {
			//alert(err);
			self.reject(err);
		});
	});
};


FotobarInstagram.prototype.getPhotos = function(access_token) {

	return $.Deferred(function() {

		var self = this;
		var endpoint = 'users/self/media/recent/?access_token=' + access_token + "&count=" + fotobarUI.photo_limit;
		var getIgPhotos = fotobarUI.instagram.api.getCall(endpoint);

		getIgPhotos.done(function(photos) {

			var igImages = [];
			for (count in photos.data) {

				imageData = {
					id : photos.data[count].id,
					url : photos.data[count].images.standard_resolution.url
				}

				igImages.push(imageData);
			}

			fotobarUI.instagram.paginationUrl = (photos.pagination.next_url == null )? null:photos.pagination.next_url.split('/').splice(4).join('/');
			fotobarUI.current_social_media = 'ig';
			if( photos.pagination.next_url == null ){
				$('#show_more').hide();
			}
			
			self.resolve(igImages);
		});

		getIgPhotos.fail(function(err) {
			//alert(err);
			self.reject(err);
		});
	});
};


FotobarInstagram.prototype.isLoggedIn = function() {

	var isLoggedIn = ( fotobarConfig.user.ig_oauth == null )? false: true;
	return( isLoggedIn );
};

FotobarInstagram.prototype.logout = function() {

	fotobarConfig.setUserParam('ig_oauth', null);
};