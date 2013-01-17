(function($){
	
	//$(document).ajaxStart($.blockUI).ajaxStop($.unblockUI);
	
	function orderByGadget(id) {
		var orb = $().dfSearchWidget.activeSearches[id].orderBy;
		if(orb) {
			var orderBy = $('<select/>');
			orderBy.attr("id","orderBy_"+id);
			orderBy.addClass("cW35");
			orderBy.addClass("cLM1");
			for(var i in orb) {
				orderBy.append($("<option/>").attr("value",orb[i].value).text(orb[i].label));
			}
			orderBy.change(function(){
				$("#pageCount_"+id).data("currentPage",0);
				$("#"+id).dfSearchWidget("go");
			});
			return orderBy;
		}

	}
	
	function limitGadget(id) {
		var pageSize = $('<select/>');
		pageSize.attr("id","pageSize_"+id);
		pageSize.addClass("cW35");
		pageSize.append($("<option/>").attr("value","5").text("5"));
		pageSize.append($("<option/>").attr("value","10").text("10"));
		pageSize.append($("<option/>").attr("value","20").text("20"));
		pageSize.append($("<option/>").attr("value","50").text("50"));
		pageSize.append($("<option/>").attr("selected",true).attr("value","100").text("[Limit to 100]"));
		pageSize.change(function(){
			$("#"+id).dfSearchWidget("changePageSize");
		});
		
		return pageSize;
	}
	
	
	
	function createSearchContainer(container) {
		
		var id = container.attr('id');
		
		if(!$().dfSearchWidget.activeSearches[id].noSearchTerm) {
			var ctrl = $('<div class="confinedPane cClear ui-widget ui-state-default ui-corner-top" align="left"/>');
			ctrl.attr("id","searchContainerCtrl_"+id);
			container.append(ctrl);
			
			var ctrlSearch = $('<input/>');
			ctrlSearch.attr("type","text");
			ctrlSearch.attr("id","searchInput_"+id);
			ctrlSearch.addClass("cW98");
			ctrl.append(ctrlSearch);
			
			var line2 = $('<div/>');
			line2.addClass("cTM1");
			ctrl.append(line2);
			
			var ctrlBtn = $('<button class="cRight">GO</button>');
			ctrlBtn.attr("id","searchGoBtn_"+id);
			line2.append(ctrlBtn);

			line2.append(limitGadget(id));
			line2.append(orderByGadget(id));
			
		}
		
		var searchScroller = $('<div class="scrollablePane cClear ui-widget ui-state-default whitebg" align="center"/>');
		searchScroller.attr("id","searchScroller_"+id);
		container.append(searchScroller);
		
		if($().dfSearchWidget.activeSearches[id].noSearchTerm) {
			searchScroller.addClass("ui-corner-top");
			searchScroller.addClass("ui-corner-bottom");
		} else {
			searchScroller.css("border-top","0px");
			searchScroller.css("border-bottom","0px");
			
			var statusBar = $('<div class="confinedPane cClear ui-widget ui-state-default ui-corner-bottom" align="center"/>');
			statusBar.attr("id","statusBar_"+id);
			statusBar.css("font-weight","bolder");
			statusBar.text("Initializing... please wait!");
			
			container.append(statusBar);
		}
		
		
		
		var searchScrollerList = $('<div align="left"/>');
		searchScrollerList.attr("id","searchScrollerList_"+id);
		searchScroller.append(searchScrollerList);
		
		$("#searchGoBtn_"+id).button({text:true,icons:{secondary:"ui-icon-play"}}).click(function(){
			$("#pageCount_"+id).data("currentPage",0);
			$("#"+id).dfSearchWidget("go");
		});

		$("#searchInput_"+id).keydown(function (e){
			if(e.keyCode == 13){
				$("#pageCount_"+id).data("currentPage",0);
				$("#"+id).dfSearchWidget("go");
			}
		});
		
		function SearchContainerSize() {
			$("#searchScroller_"+id).css("height","250px");
			var newHeight = container.parent().height();
			if(!$().dfSearchWidget.activeSearches[id].noSearchTerm) {
				newHeight -= $("#searchContainerCtrl_"+id).outerHeight(true);
				newHeight -= $("#statusBar_"+id).outerHeight(true);
			}

			if(!$().dfSearchWidget.activeSearches[id].noPaging) {
				newHeight -= $("#pageControl_"+id).outerHeight(true);
			}
			newHeight -= $().dfSearchWidget.activeSearches[id].offsetHeight;
			$("#searchScroller_"+id).css("height",newHeight);
		};
		
		var resizeTimer = null;
		
		$(window).bind('resize', function() {
			if(resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout(SearchContainerSize, 100);
		});
		
		$().dfSearchWidget.resize[id] = SearchContainerSize;
		
		SearchContainerSize();
	}
	
	/** Our methods as per spec */
	var Methods = {
		go: function() {
			var id = this.attr('id');
			var tsearch = null;
			if(!$().dfSearchWidget.activeSearches[id].noSearchTerm) {
				tsearch = this.dfSearchWidget.activeSearches[id].filter($("#searchBy_"+id).val(),$("#searchInput_"+id).val());
			} else if($().dfSearchWidget.activeSearches[id].params) {
				tsearch = $.extend({}, null, $().dfSearchWidget.activeSearches[id].params);
			} else {
				tsearch = {};
			}
			
			tsearch.offset = 0;
			tsearch.limit = $(this).dfSearchWidget("getMaxPerPage");
			if(tsearch.limit.toString() == "NaN") delete tsearch.limit;
			if($().dfSearchWidget.activeSearches[id].orderBy) {
				tsearch.order = $("#orderBy_"+id).val();
			}
			
			
			this.dfSearchWidget.ioapi[id].retrieve(tsearch);
			return this;
		},
		refresh: function() {
			var id = this.attr('id');
			$("#searchScrollerList_"+id).html("");
			$().dfSearchWidget.activeSearches[id].renderer($("#searchScrollerList_"+id),$().dfSearchWidget.data[id]);
			return this;
		},
		prev: function() {
			var id = this.attr('id');
			var p = $("#pageCount_"+id).data("currentPage");
			if(p > 0) {
				p--;
				$("#pageCount_"+id).data("currentPage",p);
				$(this).dfSearchWidget("go");
			} else {
				p = 0;
				$("#pageCount_"+id).data("currentPage",p);
			}
			return this;
		},
		next: function() {
			var id = this.attr('id');
			var p = $("#pageCount_"+id).data("currentPage");
			p++;
			if(p < $(this).dfSearchWidget("getTotalPages")) {
				$("#pageCount_"+id).data("currentPage",p);
				$(this).dfSearchWidget("go");
			}
			return this;
		},
		makePageDisplay: function() {
			var id = this.attr('id');
			$("#pageCount_"+id).val(($("#pageCount_"+id).data("currentPage")+1)+" / "+$(this).dfSearchWidget("getTotalPages"));
			return this;
		},
		focus: function(input) {
			var id = this.attr('id');
			$("#pageCount_"+id).val($("#pageCount_"+id).data("currentPage")+1);
			return this;
		},
		blur: function(input) {
			var id = this.attr('id');
			$(this).dfSearchWidget("makePageDisplay");
			return this;
		},
		change: function(input) {
			var id = this.attr('id');
			var pc = $("#pageCount_"+id).val();
			if(pc > 0) {
				pc--;
			} else {
				pc = 0;
			}
			if(pc >=  $(this).dfSearchWidget("getTotalPages")-1) {
				pc =  $(this).dfSearchWidget("getTotalPages")-1;
			}
			$("#pageCount_"+id).data("currentPage",pc);
			$(this).dfSearchWidget("go");
			return this;
		},
		changePageSize: function() {
			//var id = this.attr('id');
			//$("#pageCount_"+id).data("currentPage",0);
			$(this).dfSearchWidget("go");
			return this;
		},
		getMaxPerPage: function() {
			var id = this.attr('id');
			return parseInt($("#pageSize_"+id).val());
		},
		getTotalPages: function() {
			var id = this.attr('id');
			return Math.ceil($("#pageCount_"+id).data("total")/parseInt($("#pageSize_"+id).val()));
		},
		getTotal: function() {
			var id = this.attr('id');
			return parseInt($("#pageCount_"+id).data("total"));
		},
		setTotal: function(value) {
			var id = this.attr('id');
			parseInt($("#pageCount_"+id).data("total",value));
			return this;
		},
		init: function(args) {
			var id = this.attr('id');
			args.success = function(json,request) {
				var dfs = $().dfSearchWidget;
				if(!parseErrors(json,function(errs,data){
					var str = '';
					if(errs.length > 1) {
						'The following errors occured;\n';
						for(var i in errs) {
							str += '\n\t'+(i+1)+'. '+errs[i];
						}
					} else {
						if(errs[0].indexOf("INVALIDSESSION") != -1 && top.parent.relogin) {
							top.parent.relogin();
							return;
						} else {
							str += 'The following error occured; '+errs[0];
						}
					}
					alert(str+="\n\n");
				})) {
					if(request) {
						switch(request.action) {
							case DFRequestActions.UPDATE: break;
							case DFRequestActions.CREATE: break;
							case DFRequestActions.DELETE: break;
							case DFRequestActions.RETRIEVE:
								
								dfs.data[id] = CommonUtilities.flattenResponse(json);
								
								if(json.meta && json.meta.total) {
									$("#pageCount_"+id).data("currentPage",0);
									$("#pageCount_"+id).data("total",json.meta.total);
									
									if(dfs.data[id].length == 0 && json.meta.total == 0) {
										$("#statusBar_"+id).text("No records matching search terms found...");
									} else {
										$("#statusBar_"+id).text("Showing "+dfs.data[id].length+" of "+json.meta.total+" records...");
									}
									
									
								}
								
								$("#"+id).dfSearchWidget("makePageDisplay");
								
								
								$("#searchScrollerList_"+id).html("");
								dfs.activeSearches[id].renderer($("#searchScrollerList_"+id),dfs.data[id],request);
								dfs.resize[id]();
								
								break;
							default: break;
						}
					}
				}
			};
			
			this.dfSearchWidget.activeSearches[id] = args;
			this.dfSearchWidget.ioapi[id] = new DFRequest(args);
			createSearchContainer(this);
			
			$(this).dfSearchWidget("go");
			
			return this;
		}
	};
	
	/** The plugin def */
	$.fn.dfSearchWidget = function( method ) {
		if (Methods[method] ) {
			return Methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return Methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.dfSearchWidget' );
		}
	};
	
	/** Our holder of currently active widgets on this page */
	$.fn.dfSearchWidget.activeSearches = {};
	$.fn.dfSearchWidget.ioapi = {};
	$.fn.dfSearchWidget.data = {};
	$.fn.dfSearchWidget.resize = {};
	
})(jQuery);