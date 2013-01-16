/** Dream Factory Drag-n-Drop File Uploader */
(function($){

	/**
	 * May be a better way to do this...
	 */
	function processEvent(e) {
		e.originalEvent.stopPropagation();
		e.originalEvent.preventDefault();
		return e.originalEvent;
	}
	
	/**
	 * 
	 */
	function handleFileSelect(evt) {
		var e = processEvent(evt);
		$(e.currentTarget).dfDropFile('sendFiles',e.dataTransfer.files);
	}
	
	/**
	 * 
	 */
	function handleDragOver(evt) {
		processEvent(evt).dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	}

	function doesNameExist(name,list) {
		var exists = false;
		if(list) {
			for(var i in list) {
				if(list[i].name == name) {
					exists = true;
					break;
				}
			}
		} else {
			$(".fmObject").each(function(){
				var $this = $(this);
				if($this.data("target").endsWith(name)) {
					exists = true;
				}
			});
		}
		return exists;
	}

	String.prototype.endsWith = function(suffix) {
	    return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};

	var options = null;
	
	function doPreprocessing(type,target,files) {
		
		var path = null;
		
		if(target != "??CURRENT??") {
			path = "/"+target;
		}
		
		var def = options.uploader.prepareRequest(null,path,null,function(data,this_request){
			var list = null;
			if(data && data.file) list = data.file;
			
			var fileToSend = [];
			
			for(var i = 0; i < files.length ; i++) {
				var tmp_file = {
					file: files[i],
					unpak: false,
					update: false
				};
				
				if(files[i].name.indexOf(".zip") != -1) {
					if(confirm("Do you want to expand "+files[i].name+" on upload?")) {
						tmp_file.unpak = true;
					}
				}
				
				if(doesNameExist(files[i].name,list) && !tmp_file.unpak) {
					if(confirm("Do you want to overwrite "+files[i].name+" on upload?")) {
						tmp_file.update = true;
						fileToSend[fileToSend.length] = tmp_file;
					}
				} else {
					fileToSend[fileToSend.length] = tmp_file;
				}
			}
	
			for(var i = 0; i < fileToSend.length ; i++) {
				var tmp = fileToSend[i];
				uploadFile(tmp.file,type,target,tmp_file.unpak,tmp_file.update);
			}
		});
		
		options.uploader.retrieve(null,null,def);
	}
	
	function uploadFile(file,type,target,unpak,overwrite) {
		var params = null;
		if(unpak) {
			params = {
					expand: true	
			};
		}
		
		if(type == 'folder') {
			if(target == "??CURRENT??") {
				options.uploader.upload(file,params,null,overwrite);
			} else {
				options.uploader.upload(file,params,"/"+target,overwrite);
			}
		} else {
			options.uploader.upload(file,params,null,overwrite);
		}
		
	}
	
	/**
	 * 
	 */
	var Methods = {
		/**
		 * 
		 * @param files
		 * @returns {___anonymous585_1654}
		 */
		sendFiles: function(files) {
			
			var target = $(this).data('target');
			var type = $(this).data('type');
			
			doPreprocessing(type,target,files);

			return this;
		},
		/**
		 * 
		 * @param opts
		 * @returns
		 */
		init : function(opts) {
			if(opts) options = opts;
			existsHandler = options.existsHandler;
			return $(this).bind('dragover',handleDragOver).bind('drop',handleFileSelect);
		}
	};
	$.fn.dfDropFile = function( method ) {
		if (Methods[method] ) {
			return Methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return Methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.dfDropFile' );
		}
	};
})(jQuery);