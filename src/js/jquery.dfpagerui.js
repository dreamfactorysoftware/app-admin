/** Dream Factory Data Page UI Plugin */
(function($){
	
	var template = '<div class="cP1 cH90 cClear">'+
		'<div id="ID_SCROLLER" class="scrollablePane cH98 cClear ui-widget ui-state-default ui-corner-all " align="center">'+
		'<div id="ID_LIST" class="cM1" align="left"></div></div></div><div class="cClear"></div>'+
		'<div id="ID_CTRL" class="cW100 cTM2 cP1" align="center">'+
		'<strong>Sort:&nbsp;</strong><select id="ID_SORT" onchange="$(\'#ID\').dfPagerUI(\'sortBy\',this)" class="ui-widget ui-state-default ui-corner-all selectPadding"></select>'+
		'&nbsp;<select id="ID_LIMITS" onchange="$(\'#ID\').dfPagerUI(\'limit\',this)" class="ui-widget ui-state-default ui-corner-all selectPadding"></select>'+
		'&nbsp;<button id="ID_PREV">Prev</button>'+
		'&nbsp;<input id="ID_PAGENO" type="text" class="ui-widget ui-state-default ui-corner-all fieldPadding" onfocus="this.value=$(\'#ID\').dfPagerUI(\'getPageNo\')" onchange="$(\'#ID\').dfPagerUI(\'gotoPage\',parseInt(this.value))" size="4" value=""/>'+
		'&nbsp;<button id="ID_NEXT">Next</button>'+
		'</div>';
	
	var Methods = {
		disableAll: function() {
			var id = this.attr('id');
			$('#'+id+'_SORT').attr('disabled','disabled');
			$('#'+id+'_LIMITS').attr('disabled','disabled');
			$('#'+id+'_PREV').button({ disabled: true });
			$('#'+id+'_PAGENO').attr('disabled','disabled');
			$('#'+id+'_NEXT').button({ disabled: true });
		},
		enableAll: function() {
			var id = this.attr('id');
			$('#'+id+'_SORT').removeAttr('disabled');
			$('#'+id+'_LIMITS').removeAttr('disabled');
			if(this.dfPagerUI.pagers[id] && this.dfPagerUI.pagers[id].pageNo > 0) {
				$('#'+id+'_PREV').button({ disabled: false });
			}
			$('#'+id+'_PAGENO').val(this.dfPagerUI.pagers[id].pageNo+1+(this.dfPagerUI.pagers[id].pageCount > 0 ? " / "+this.dfPagerUI.pagers[id].pageCount : ""));
			$('#'+id+'_PAGENO').removeAttr('disabled');
			if(this.dfPagerUI.pagers[id].pageCount == 0 || (this.dfPagerUI.pagers[id].pageNo+1) < this.dfPagerUI.pagers[id].pageCount) {
				$('#'+id+'_NEXT').button({ disabled: false });
			}
			return this;
		},
		redrawList: function() {
			return this.dfPager('fetch');
		},
		getPageNo: function() {
			return this.dfPager('getPage')+1;
		},
		gotoPage: function(value) {
			var id = $(this).attr('id');
			if(value > this.dfPagerUI.pagers[id].pageCount) value = this.dfPagerUI.pagers[id].pageCount;
			this.dfPagerUI('disableAll');
			this.dfPager('gotoPage',value-1);
			this.dfPager('fetch');
			return this;
		},
		prevPage: function() {
			this.dfPagerUI('disableAll');
			this.dfPager('prevPage');
			this.dfPager('fetch');
			return this;
		},
		nextPage: function() {
			this.dfPagerUI('disableAll');
			this.dfPager('nextPage');
			this.dfPager('fetch');
			return this;
		},
		limit: function(el) {
			var id = this.attr('id');
			this.dfPagerUI('disableAll');
			var val = $(el).val();
			for(var i in this.dfPagerUI.pagers[id].pageLimits) {
				if(this.dfPagerUI.pagers[id].pageLimits[i] == val) {
					this.dfPager('limit',i);
				}
			}
			this.dfPager('gotoPage',0);
			this.dfPager('fetch');
			return this;
		},
		sortBy: function(el) {
			var id = this.attr('id');
			this.dfPagerUI('disableAll');
			var val = $(el).val();
			for(var i in this.dfPagerUI.pagers[id].orderFields) {
				if(this.dfPagerUI.pagers[id].orderFields[i] == val) {
					this.dfPager('sortBy',i);
				}
			}
			this.dfPager('gotoPage',0);
			this.dfPager('fetch');
			return this;
		},
		dataready: function(json) {
			var id = this.attr('id');
			var container = $('#'+id+'_LIST');
			container.html('');
			$('#'+id).dfPagerUI('enableAll');
			if(this.dfPagerUI.pagers[id].renderer(container,json) < $('#'+id).dfPager('getLimit',id)) {
				$('#'+id+'_NEXT').attr('disabled','disabled');
			}
			return this;
		},
		getUIContainer: function() {
			return $('#'+this.attr('id')+'_LIST');
		},
		dataerror: function(reason) {
			var id = this.attr('id');
			$('#'+id+'_LIST').html(reason);
			$('#'+id).dfPagerUI('enableAll');
			return this;
		},
		reset: function() {
			this.dfPager('gotoPage',0);
			this.dfPager('fetch');
			return this;
		},
		init : function(opts) {
			var id = this.attr('id');
			if(id) {
				this.dfPager(opts);
				var req = this.dfPager("getRequest");
				req.success = function(json) {
					$('#'+id).dfPagerUI('dataready',json);
				};
				req.error = function(err) {
					$('#'+id).dfPagerUI('dataerror',err);
				};
				this.dfPagerUI.pagers[id] = opts;
				$(this).html(template.replace(/ID/g, id));
				$('#'+id+'_PREV').button({
					text: false,
					icons: {
						primary: "ui-icon-seek-prev"
					}
				}).click(function(){
					$('#'+id).dfPagerUI('prevPage');
				});
				$('#'+id+'_NEXT').button({
					text: false,
					icons: {
						secondary: "ui-icon-seek-next"
					}
				}).click(function(){
					$('#'+id).dfPagerUI('nextPage');
				});
				$('#'+id+'_LIST').html('<i>Loading, Please Wait...</i>');
				this.dfPagerUI('disableAll',id);
				for(var i in this.dfPagerUI.pagers[id].orderFields) {
					$('#'+id+'_SORT').append('<option'+(this.dfPagerUI.pagers[id].orderBy == i ? ' selected' : '')+'>'+this.dfPagerUI.pagers[id].orderFields[i]+'</option>');
				}
				for(var i in this.dfPagerUI.pagers[id].pageLimits) {
					$('#'+id+'_LIMITS').append('<option'+(this.dfPagerUI.pagers[id].pageLimit == i ? ' selected' : '')+'>'+this.dfPagerUI.pagers[id].pageLimits[i]+'</option>');
				}
				$('#'+id+'_PAGENO').val(this.dfPagerUI.pagers[id].pageNo+1);
				this.dfPager('fetch',id);
			} else {
				$(this).html('dfPagerUI requires containers to have an ID');
			}
			return this;
		}
	};
	
	$.fn.dfPagerUI = function( method ) {
		if (Methods[method] ) {
			return Methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return Methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.dfPagerUI' );
		}
	};
	
	// These are the defaults
	$.fn.dfPagerUI.defaults = {};
	
	// These are the runtime copies of the default values
	$.fn.dfPagerUI.settings = {};
	
	$.fn.dfPagerUI.pagers = {};
	
	$.fn.dfPagerUI.version = 'dfPagerUI v0.1.50';
	
})(jQuery);