/*
 * jQuery Tabpane plugin 1.2
 *
 * Copyright (c) 2008-2015 Foswiki Contributors http://foswiki.org
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
var bottomBarHeight = -1;
(function($) {

$.tabpane = {

  /***************************************************************************
   * plugin definition 
   */
  build: function(options) {
    // build main options before element iteration
    var opts = $.extend({}, $.tabpane.defaults, options), prevHash;

    // iterate and reformat each matched element
    return this.each(function() {
      var $thisPane = $(this),
          thisOpts = $.extend({}, opts, $thisPane.metadata()),
          $tabContainer, $tabGroup, index;

      function initCurrentTab() {
        var currentHash = window.location.hash.replace(/^.*#/, "");

        if (typeof(prevHash) !== undefined && prevHash == currentHash) {
          return;
        }

        //$.log("TABPANE: initCurrentTab, currentHash="+currentHash+", prevHash="+prevHash);
        prevHash = currentHash;

        $thisPane.find("> .jqTab").filter(function(index) {
          if (currentHash == '') {
            return (index+1 == thisOpts.select || $(this).hasClass(thisOpts.select));
          } else {
            return ('!'+this.id == currentHash);
          }
        }).each(function() {
          $.tabpane.switchTab($thisPane, thisOpts, this.id);
        });
      }

      if (!$thisPane.is(".jqTabPaneInitialized")) {
        $thisPane.addClass("jqTabPaneInitialized");

        // create tab group
        $tabContainer = $thisPane;
        $('<span class="foswikiClear"></span>').prependTo($thisPane);
        $tabGroup = $('<ul class="jqTabGroup"></ul>').prependTo($thisPane);

        // get all headings and create tabs
        index = 1;
        $thisPane.find("> .jqTab").each(function() {
          var $this = $(this),
              title = $this.find('h2:first').remove().html();
          $tabGroup.append('<li><a href="#" data="'+this.id+'">'+title+'</a></li>');
          $this.data("hash", '!'+this.id);
          if(index == thisOpts.select || $(this).hasClass(thisOpts.select)) {
            $.tabpane.switchTab($thisPane, thisOpts, this.id);
          }
          index++;
        });

        
        /* establish auto max expand */
        if (thisOpts.autoMaxExpand) {
          $.tabpane.autoMaxExpand($thisPane, thisOpts);
        }

        $thisPane.find(".jqTabGroup > li > a").click(function() {
          var newTabId = $(this).attr('data');
          $(this).blur();

          if (newTabId != thisOpts.currentTabId) {
            $.tabpane.switchTab($thisPane, thisOpts, newTabId);
            
            // set hash
/* DISABLED for performance reasons: see http://foswiki.org/Tasks/Item13018
            var newHash = $("#"+newTabId).data("hash"), oldHash = window.location.hash.replace(/^.*#/, "");
            if (newHash != oldHash) {
              window.location.hash = newHash;
            }
*/
          }
          return false;
        });

        initCurrentTab();
        $(window).bind("hashchange", function() {
          //$.log("TABPANE: got hashchange event");
          initCurrentTab();
        });
      }
    });
  },

  /***************************************************************************
   * switching from tab1 to tab2
   */
  switchTab: function($thisPane, thisOpts, newTabId) {
    var oldTabId = thisOpts.currentTabId,
        $newTab  = $("#"+newTabId),
        $oldTab = $("#"+oldTabId),
        $newContainer = $newTab.find('.jqTabContents:first'),
        $oldContainer = $oldTab.find('.jqTabContents:first'),
        oldHeight = $oldContainer.height(), // why does the container not work
        data, $innerContainer, isInnerContainer;

    if (oldTabId == newTabId) {
      return;
    }

    //$.log("TABPANE: switching from "+oldTabId+" to "+newTabId);

    $oldTab.removeClass("current");
    $newTab.addClass("current");
    $thisPane.find("li a[data="+oldTabId+"]").parent().removeClass("current"); 
    $thisPane.find("li a[data="+newTabId+"]").parent().addClass("current"); 

    if (!thisOpts[newTabId]) {
      thisOpts[newTabId] = $newTab.metadata();
    }
    data = thisOpts[newTabId];

    // before click handler
    if (typeof(data.beforeHandler) == "function") {
      data.beforeHandler.call(this, oldTabId, newTabId);
    }

    if ((thisOpts.animate || thisOpts.autoMaxExpand) && oldHeight > 0) {
      //$.log("TABPANE: setting height to "+oldHeight);
      $newContainer.height(oldHeight);
    }

    $innerContainer = $newContainer;
    isInnerContainer = false;
    if(typeof(data.container) != "undefined") {
      $innerContainer = $newContainer.find(data.container);
      if ($innerContainer.length) {
	isInnerContainer = true;
      } else {
	$innerContainer = $newContainer;
      }
    }

    function _finally () {
      var effect = 'none', newHeight;

      if (oldHeight > 0) {
        effect = 'easeInOutQuad';
      }

      // adjust height of the current tab
      if (thisOpts.autoMaxExpand) {
        if(thisOpts.animate && effect != 'none') {
          $innerContainer.css({opacity:0.0}).animate({
            opacity: 1.0
          }, 300);
        }
      } else {
        // animate height
        if (thisOpts.animate) {
          if (effect != 'none') {
            $newContainer.height('auto');
            newHeight = $newContainer.height();
            if (isInnerContainer) {
              $newContainer.height(oldHeight).animate({
                height: newHeight
              }, 300, effect, function() {
                $newContainer.height('auto');
              });
              $innerContainer.css({opacity:0.0}).animate({
                opacity: 1.0
              }, 300, effect);
            } else {
              $newContainer.height(oldHeight).css({opacity:0.0}).animate({
                opacity: 1.0,
                height: newHeight
              }, 300, effect, function() {
                $newContainer.height('auto');
              });
            }
          }
        }
      }
      $(window).trigger("resize");
      
      // after click handler
      if (typeof(data.afterHandler) == "function") {
        //$.log("exec "+data.afterHandler);
        data.afterHandler.call(this, oldTabId, newTabId);
      }

      thisOpts.currentTabId = newTabId;
    }

    // async loader
    if (typeof(data.url) != "undefined") {
      $innerContainer.load(data.url, undefined, function() {
        if (typeof(data.afterLoadHandler) == "function") {
          //$.log("after load handler "+command);
          data.afterLoadHandler.call(this, oldTabId, newTabId);
        }
        _finally();
      });
      delete thisOpts[newTabId].url;
    } else {
      _finally();
    }
    

  },

  /*************************************************************************
   * handler to listen to window-resize event to fire the fixHeight()
   * method
   */
  autoMaxExpand: function($thisPane, opts) {
    window.setTimeout(function() {
      $.tabpane.fixHeight($thisPane, opts);
      $(window).one("resize.tabpane", function() {
        $.tabpane.autoMaxExpand($thisPane, opts);
      });
    }, 100);
  },

  /*************************************************************************
   * adjust height of pane to window height
   */
  fixHeight: function($thisPane, opts) {
    var $container = $thisPane.find("> .jqTab.current .jqTabContents:first"),
        paneOffset = $container.offset(),
        paneTop, windowHeight, height, $debug;

    //$.log("TABPANE: called fixHeight()");

    if (typeof(paneOffset) == 'undefined') {
      return;
    }

    paneTop = paneOffset.top; // || $container[0].offsetTop;
    if (bottomBarHeight <= 0) {
      bottomBarHeight = $('.natEditBottomBar').outerHeight(true) + parseInt($container.css('padding-bottom'), 10) *2.5;
    }

    windowHeight = $(window).height();
    if (!windowHeight) {
      windowHeight = window.innerHeight; // woops, jquery, whats up for konqi
    }

    height = windowHeight - paneTop - bottomBarHeight;
    $debug = $("#DEBUG");
    if ($debug.length) {
      height -= $debug.outerHeight(true);
    }
    if (opts && opts.minHeight && height < opts.minHeight) {
      //$.log("tabpane: minHeight reached");
      height = opts.minHeight;
    }

    if (height < 0) {
      return;
    }

    $.log("TABPANE: fixHeight height=",height);
    $container.height(height);
  },

  /***************************************************************************
   * plugin defaults
   */
  defaults: {
    select: 1,
    animate: false,
    autoMaxExpand: false,
    minHeight: 230
  }

};

$.fn.tabpane = $.tabpane.build;

$(function() {
  $(".jqTabPane:not(.jqInitedTabpane)").livequery(function() {
    var $this = $(this);
    $this.addClass("jqInitedTabpane");
    $this.tabpane();
  });
});

})(jQuery);
