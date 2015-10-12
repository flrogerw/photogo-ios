
var FotobarFileReader = function() {

	this.file;
	this.result;
};

FotobarFileReader.prototype.initialize = function(file, file_directory) {
	
	this.file = "./" + file;
	var self = this;
	
	return $.Deferred(function() {

		var that = self.promise = this;
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(
				fileSystem) {
			
			 fileSystem.root.getDirectory(file_directory, {create: false}, function(dirEntry){
			
				 dirEntry.getFile(self.file, null, function(fileEntry) {

				fileEntry.file(function(file) {
					
					that.resolve(file);
				},function(e){ that.reject({type:'error',text:'Could not read file'});});
			}, function(e){ that.reject({type:'error',text:'File not found'});});
			 }, function(e){ that.reject({type:'error',text:'Could not get directory'});});
		}, function(e){ that.reject({type:'error',text:'Could not get file system'});});
	});
};

FotobarFileReader.prototype.readFile = function( file ) {
	
	var self = this;
	return $.Deferred(function() {

		var that = this;
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			
			that.resolve(evt.target.result);	
		};
		reader.readAsText(file);
	});
};

FotobarFileReader.prototype.readAsDataURL = function(file) {

	var reader = new FileReader();
	var returnString;

	reader.onloadend = function(evt) {
		returnString = evt.target.result;
	};
	reader.readAsDataURL(file);
};

