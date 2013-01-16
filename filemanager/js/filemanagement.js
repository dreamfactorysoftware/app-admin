/**
 * 
 */
function resizeUi() {
	var h = $(window).height();
    $("#main_content").css('height', h );
    $("#fileManagerPanel").css('height', h-10);
};

var resizeTimer = null;

$(window).bind('resize', function() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeUi, 100);
});

function getIcon(file) {
	switch (file.contentType) {
	case "image/x-ms-bmp":
		return "gfx/file-bmp.png";
	case "text/html":
		return "gfx/file-htm.png";
	case "text/css":
		return "gfx/file-css.png";
	case "text/javascript":
		return "gfx/file-js.png";
	case "application/javascript":
		return "gfx/file-js.png";
	case "text/js":
		return "gfx/file-js.png";
	case "image/jpeg":
		return "gfx/file-jpg.png";
	case "image/gif":
		return "gfx/file-gif.png";
	case "text/plain":
	case "image/x-icon":
	case "application/octet-stream":
	default:
		return "gfx/file.png";
	}
}

function errorHandler(errs,data){
	var str = '';
	if(errs.length > 1) {
		'The following errors occured;\n';
		for(var i in errs) {
			str += '\n\t'+(i+1)+'. '+errs[i];
		}
	} else {
		str += 'The following error occured; '+errs[0];
	}
	alert(str+="\n\n");
}

var fileio = new DFRequest({
	app: CommonUtilities.getQueryParameter('hostApp'),
	service: "APP",
	resource: "/"+CommonUtilities.getQueryParameter('path')+"/",
	success: function(json,request) {
		try {document.getSelection().removeAllRanges();}catch(e){/* silent! */};
		if(!parseErrors(json,errorHandler)) {
			printLocation();
			if(json.folder && json.folder.length > 0 && json.folder[0].name) {
				buildListingUI(json);
			} else if(json.file && json.file[0] && json.file[0].lastModified) {
				buildListingUI(json);
			} else if(json.file && json.file.length == 0 && json.folder && json.folder.length == 0 ) {
				buildListingUI(json);
			} else {
				fileio.retrieve();
			}
		}
	}
});

function buildItem(path,icon,name,type,editor,extra) {
	return '<div class="fmObject" data-target="'+path+'" data-type="'+type+'">' +
		(editor ? editor : '') +
		'<div class="cLeft fm_icon" align="center"><img src="'+icon+'" border="0"/></div>' +
		'<div class="cLeft cW30"><span class="fm_label">'+name+'</span></div>' +
		(extra ? extra : '') +
		'<div class="cClear"><!-- --></div>' +
	'</div>';
}

function buildEditor(mime,path) {
	if(mime.indexOf('text/') > -1 || mime == "application/javascript") {
		return '<button class="editor cRight" data-mime="'+mime+'" data-path="'+path+'">Edit</button>';
	}
}

function buildFolderControl(path) {
	return '<button class="folder_open cRight" data-path="'+path+'">Open</button>';
}

function buildListingUI(json) {
	var html = '';
	if (json.folder) {
		for ( var i in json.folder) {
			if(json.folder[i].name != ".") {
				var ctrl = buildFolderControl(json.folder[i].path);
				html += buildItem(json.folder[i].path,'gfx/folder-horizontal-open.png',json.folder[i].name,'folder',ctrl);
			}
		}
	}
	if (json.file) {
		for(var i in json.file) {
			var editor = buildEditor(json.file[i].contentType,json.file[i].path);
			var extra = '<div class="cLeft cW5">&nbsp;</div>';
			if(json.file[i].lastModified) {
				extra += '<div class="cLeft cW20 fm_label">'+json.file[i].lastModified+'</div>';
			}
			if(json.file[i].contentType) {
				extra += '<div class="cLeft cW15 fm_label">'+json.file[i].contentType+'</div>';
			}
			if(json.file[i].size) {
				extra += '<div class="cLeft cW10 fm_label">'+json.file[i].size+' bytes</div>';
			}
			html += buildItem(json.file[i].path,getIcon(json.file[i]),json.file[i].name,'file',editor,extra);
		}
	}
	
	$('#listing').html(html);
	
	$('.editor').button({
		text:false,
		icons:{
			primary:"ui-icon-pencil"
		}
	}).click(function(){
		var path = $(this).data('path');
		var mime = $(this).data('mime');
		var w = window.open('editor.html?path='+path+'&mime='+mime+'&',path+" "+mime,'width=800,height=400,toolbars=no,statusbar=no,resizable=no');
		w.focus();
		return false;
	});
	
	$('.folder_open').button({
		text:false,
		icons:{
			primary:"ui-icon-folder-open"
		}
	}).click(function(){
		listDirectory($(this).data('path'));
		return false;
	});
	
	$('.fmObject').dfDropFile({
		hostApp: CommonUtilities.getQueryParameter('hostApp'),
		uploader: fileio
	}).click(function(e){
		var t = $(this);
		var unselect = t.hasClass('highlighted');
		if (!e.ctrlKey) {
			$('.fmObject').each(function(){
				$(this).removeClass('highlighted');
			});
		}
		if(t.hasClass('highlighted')) {
			t.removeClass('highlighted');
		} else if(!unselect) {
			t.addClass('ui-corner-all');
			t.addClass('highlighted');
		}
		document.getSelection().removeAllRanges();
	}).dblclick(function(){
		var target = $(this).data('target');
		var type = $(this).data('type');
		if(type == 'folder') {
			listDirectory(target);
		} else {
			var xurl = target.substring(target.lastIndexOf("/")+1);
			window.location.href = fileio.buildUrl(fileio.request)+xurl+"?download=true&";
		}
	});
}

function printLocation() {
	var url = fileio.buildUrl(fileio.request);
	var path = url.split('/');
	var builder = '/';
	var text = '';
	var usable = false;
	for(var i in path) {
		if(path[i].length < 1) continue;
		if(usable) {
			builder += path[i]+'/';
			text += '/<a href="javascript: listDirectory(\''+builder+'\')">'+path[i]+'</a>';
		}
		if(!usable && path[i] == 'APP') {
			usable = true;
		}
	}
	$('#breadcrumbs').html(text);
}

function listDirectory(dir) {
	if(dir && !dir.indexOf('/') == 0) {
		dir = '/'+dir;
	}
	if(dir) fileio.request.resource = dir;
	fileio.retrieve();
}

function getSelectedItems() {
	var folders = [];
	var files = [];
	$('.highlighted').each(function(){
		var target = $(this).data('target');
		if($(this).data('type') == 'folder') {
			folders[folders.length] = {path:target};
		} else {
			files[files.length] = {path:target};
		}
	});
	return {
		"folder": folders,
		"file": files
	};
}

function checkResults(iframe) {
	var that = $(iframe);
	var str = that.contents().text();
	if(str && str.length > 0) {
		try {
			str = JSON.parse(str);
			var result = parseErrors(str,errorHandler);
			if(result == undefined) {
				listDirectory();
			}
		} catch (e) {
			alert(e);
		}
	}
}

$(document).ready(function() {
	$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	resizeUi();
	
	$('#editPanel').hide();
	$('#fileControl').hide();
	
	$("#dndPanel").dfDropFile({
		hostApp: CommonUtilities.getQueryParameter('hostApp'),
		uploader: fileio
	});
	
	$("#errorDialog").dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		closeOnEscape: true,
		buttons: {	}
	});
	
	var selectedItems = null;
	var action = null;
	
	$("#cut").button({text:false,icons:{primary:"ui-icon-scissors"}}).click(function(){
		selectedItems = getSelectedItems();
		action = "cut";
	});
	
	$("#copy").button({text:false,icons:{primary:"ui-icon-copy"}}).click(function(){
		selectedItems = getSelectedItems();
		action = "copy";
	});
	
	function structureRequest(array,del) {
		for(var i in array) {
			var tx = array[i];
			array[i] = {
				source_path: tx.path,
				delete_source: del
			};
		}
	}
	
	$("#paste").button({text:false,icons:{primary:"ui-icon-clipboard"}}).click(function(){
		if(action && selectedItems) {
			
			var x = getSelectedItems();
			
			if(x.folder && x.folder.length == 1 && x.file && x.file.length == 0) {
				x = x.folder[0].path;
			} else {
				x = null;
			}
			
			var tmp = selectedItems;
			structureRequest(tmp.folder,action == "cut");
			structureRequest(tmp.file,action == "cut");
			fileio.post(JSON.stringify(tmp),null,x);
			selectedItems = null;
		}
	});
	
	$("#mkdir").button({icons:{primary:"ui-icon-folder-collapsed"}}).click(function(){
		var name = prompt("Enter name for new folder");
		if(name) {
			fileio.mkdir(name);
		}
	});
	
	$("#rm").button({icons:{primary:"ui-icon-trash"}}).click(function(){
		
		var sel = getSelectedItems();
		
		var folders = sel.folder;
		var files = sel.file;
		
		if(folders.length > 0 || files.length > 0) {
			var msg = "You are about to permantely delete the following;\n\n";
			if(folders.length>0) {
				msg += "\t"+folders.length+" folders\n";
			}
			if(files.length>0) {
				msg += "\t"+files.length+" files\n";
			}
			msg += "\nAre you sure you want to delete these selected files?";
			if(confirm(msg)) {
				fileio.rm(folders.length>0?folders:null, files.length>0?files:null);
			}
		}
	});
	
	$("#exit").button({text:false,icons:{primary:"ui-icon-close"}}).click(function(){
		window.location = CommonUtilities.getQueryParameter('returnUrl');
	});
	
	$("#exitEditor").button({icons:{primary:"ui-icon-close"}}).click(function(){
		$('#editPanel').hide();
		$('#fileControl').hide();
		$('#browserControl').show();
		$('#dndPanel').show();
	});
	
	
	$("#uzip").button({icons: {primary: "ui-icon-circle-arrow-n"}}).click(function(){
		$("#uploadFileForm").attr("action",fileio.buildUrl(fileio.request));
		$("#uploadFileInput").trigger("click");
	});
	
	
	listDirectory();
	
});

