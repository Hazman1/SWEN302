(function($){$.wikiword={build:function(options){var opts;if(typeof options==="string"){options={source:options}}opts=$.extend({},$.wikiword.defaults,options);return this.each(function(){var $this=$(this),thisOpts=$.extend({},opts,$this.data(),$this.metadata()),$source;if(typeof thisOpts.source==="string"){$source=$(thisOpts.source)}else{$source=thisOpts.source}if(typeof thisOpts.allowedRegex==="string"){thisOpts.allowedRegex=new RegExp(thisOpts.allowedRegex,"g")}if(typeof thisOpts.forbiddenRegex==="string"){thisOpts.forbiddenRegex=new RegExp(thisOpts.forbiddenRegex,"g")}$source.change(function(){$.wikiword.handleChange($source,$this,thisOpts)}).keyup(function(){$.wikiword.handleChange($source,$this,thisOpts)}).change()})},handleChange:function(source,target,opts){var result=[];source.each(function(){result.push($(this).is(":input")?$(this).val():$(this).text())});result=result.join(" ");if(result||!opts.initial){result=$.wikiword.wikify(result,opts);if(opts.suffix&&result.indexOf(opts.suffix,result.length-opts.suffix.length)==-1){result+=opts.suffix}if(opts.prefix&&result.indexOf(opts.prefix)!==0){result=opts.prefix+result}}else{result=opts.initial}target.each(function(){if($(this).is(":input")){$(this).val(result)}else{$(this).text(result)}})},wikify:function(source,opts){var result="",c,i;opts=opts||$.wikiword.defaults;result=source.replace(opts.allowedRegex,function(a){return a.charAt(0).toLocaleUpperCase()+a.substr(1)});result=result.replace(opts.forbiddenRegex,"");return result},defaults:{suffix:"",prefix:"",initial:"",allowedRegex:"["+foswiki.RE.alnum+"]+",forbiddenRegex:"[^"+foswiki.RE.alnum+"]+"}};$.fn.wikiword=$.wikiword.build;$(function(){$(".jqWikiWord:not(.jqInitedWikiWord)").livequery(function(){$(this).addClass("jqInitedWikiWord").wikiword()})})})(jQuery);