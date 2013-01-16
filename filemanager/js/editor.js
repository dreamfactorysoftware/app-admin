/**
 * editor.js
 */
document.write('<title>Editing: '+CommonUtilities.getQueryParameter('path')+'</title>');


function setSelectionRange(input, selectionStart, selectionEnd) {
	if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	} else if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

function replaceSelection (input, replaceString) {
	if (input.setSelectionRange) {
		var selectionStart = input.selectionStart;
		var selectionEnd = input.selectionEnd;
		input.value = input.value.substring(0, selectionStart)+ replaceString + input.value.substring(selectionEnd);
  
		if (selectionStart != selectionEnd){ 
			setSelectionRange(input, selectionStart, selectionStart + 	replaceString.length);
		} else {
			setSelectionRange(input, selectionStart + replaceString.length, selectionStart + replaceString.length);
		}
	} else if (document.selection) {
		var range = document.selection.createRange();
		
		if (range.parentElement() == input) {
			var isCollapsed = range.text == '';
			range.text = replaceString;

			if (!isCollapsed)  {
				range.moveStart('character', -replaceString.length);
				range.select();
			}
		}
	}
}

function catchTab(item,e){
	if(navigator.userAgent.match("Gecko")){
		c=e.which;
	} else {
		c=e.keyCode;
	}
	
	if(c==9){
		replaceSelection(item,String.fromCharCode(9));
		return false;
	}	    
}


var fileio = new DFRequest({
	app: CommonUtilities.getQueryParameter('hostApp'),
	service: "APP",
	dataType: 'text',
	contentType: 'text/html',
	resource: "/"+CommonUtilities.getQueryParameter('path'),
	success: function(txt,request) {
		try {
			var json = JSON.parse(txt);
			var err = checkFailure(json);
			if(err) {
				$('#errorMsg').html(err);
				$('#errorDialog').dialog('open');
			} else {
				// TODO: display something to demostrate the save is done...
			}
		} catch (e) {
			$("#editor").val(txt);
		}
	}
});

$(document).ready(function(){
	$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	fileio.retrieve();
	
	$("#errorDialog").dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		closeOnEscape: true,
		buttons: {	}
	});
	
	$("#save").button({icons:{primary:"ui-icon-disk"}}).click(function(){
		var value = $('#editor').val();
		var name = fileio.request.resource;
		name = name.substring(name.lastIndexOf('/')+1);
		if(name.toLowerCase().indexOf('.html')) {
			fileio.upload({"name": name,"raw":value},null,null,true);
		}
	});
	
	$("#close").button({icons:{primary:"ui-icon-close"}}).click(function(){
		window.close();
	});
	
});