var FotobarRest = function(server) {

	this.server = server;
};

FotobarRest.prototype.getCall = function(endpoint, dataObj) {

	return $.ajax({
		type : "GET",
		headers : {
			"Content-Location" : fotobarConfig.gps
		},
		url : this.server + endpoint,
		timeout : 5000,
		data : dataObj,
		dataType : "json"
	});
};
/*
 * FotobarRest.prototype.putCall = function(endpoint, dataObj) {
 * 
 * return $.ajax({ type : "PUT", url : this.server + endpoint, timeout : 5000,
 * headers: { "Content-Location": fotobarConfig.timestamp }, dataType : "json",
 * data : dataObj
 * 
 * }); };
 */
FotobarRest.prototype.postCall = function(endpoint, dataObj) {
	
	return $.ajax({
		type : "POST",
		url : this.server + endpoint,
		headers : {
			"Content-Location" : fotobarConfig.gps,
			'Authorization-Token' : fotobarConfig.tokens.access,
			'Authorization-Key' : fotobarConfig.tokens.key,
			'Content-Storage' : fotobarConfig.aws_container
		},
		timeout : 5000,
		dataType : "json",
		data : dataObj

	});
};

FotobarRest.prototype.postForm = function(endpoint, dataObj) {

	var self = this;

	return $.ajax({
		xhr : function() {
			var xhr = new window.XMLHttpRequest();

			xhr.upload
					.addEventListener("progress", self.progressHandler, false);
			xhr.addEventListener("load", self.loadHandler, false);
			xhr.addEventListener("error", self.errorHandler, false);
			xhr.addEventListener("abort", self.abortHandler, false);
			return xhr;
		},
		type : "POST",
		url : this.server + endpoint,
		headers : {
			"Content-Location" : fotobarConfig.gps,
			'Authorization-Token' : fotobarConfig.tokens.access,
			'Authorization-Key' : fotobarConfig.tokens.key,
			'Content-Storage' : fotobarConfig.aws_container,
		},
		dataType : 'html',
		data : dataObj,
		processData : false,
		contentType : false,
		//timeout : 5000,
	});

	//

};

FotobarRest.prototype.progressHandler = function(event) {

	var percent = (event.loaded / event.total) * 100;
	$("#status").html("... " + Math.round(percent) + "%");
};

FotobarRest.prototype.errorHandler = function(event) {
	
	fotobarUI.alertUser({type:'error', text:'Could not complete your request'});
};

FotobarRest.prototype.loadHandler = function(event) {
	// alert(event);
};

FotobarRest.prototype.abortHandler = function(event) {
	
	fotobarUI.alertUser({type:'error', text:'Could not complete your request'});
};
