var FotobarFileWriter = function() {
	
	this.file;
};


FotobarFileWriter.prototype.deleteFolderContents = function(file_dir) {
	
	var self = this;

	return $.Deferred(function() {

		var that = self.promise = this;
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {	
		 fileSystem.root.getDirectory(file_dir, {create: true}, function(dirEntry){
			 dirEntry.removeRecursively(function() {
				 that.resolve();
			 }, function(e){ that.reject({type:'error',text:'Could not delete cached files.'});});
		}, function(e){ that.reject({type:'error',text:'Could not get directory.'});});
		}, function(e){ that.reject({type:'error',text:'Could not get file system'});});
	});	
};


FotobarFileWriter.prototype.getDownloadDir = function(file_dir) {
	
	var self = this;

	return $.Deferred(function() {

		var that = self.promise = this;
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {	
		 fileSystem.root.getDirectory(file_dir, {create: true}, function(dirEntry){
		
			 that.resolve(fileSystem);
		}, function(e){ that.reject({type:'error',text:'Could not get directory.'});});
		}, function(e){ that.reject({type:'error',text:'Could not get file system'});});
	});	
};


FotobarFileWriter.prototype.initialize = function(file, file_dir) {
	
this.file = file;
var self = this;

return $.Deferred(function() {

	var that = self.promise = this;
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {	
	 fileSystem.root.getDirectory(file_dir, {create: true}, function(dirEntry){
		 dirEntry.getFile(self.file, {
			create : true,
			exclusive : false
		}, function(fileEntry) {

			fileEntry.createWriter(function(writer) {

				that.resolve(writer);
			},function(e){ that.reject({type:'error',text:'Could not create file writer'});});
		}, function(e){ that.reject({type:'error',text:'Could not create file.'});});
	}, function(e){ that.reject({type:'error',text:'Could not get directory.'});});
	}, function(e){ that.reject({type:'error',text:'Could not get file system'});});
});

};

FotobarFileWriter.prototype.writeFile = function(writer, fileText) {

	var self = this;
	
	return $.Deferred(function() {
		
	var that = this;	
	writer.onwriteend = function(evt) {
		
		that.resolve(evt.target.result);
	};
	//alert('wrote this:'+self.fileText);
	writer.write(fileText);
	});
};

