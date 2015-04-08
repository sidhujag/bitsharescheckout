/*
	jQuery Scrolling Price Ticker for Bitshares decentralized exchange asset prices v1.0
	BTS Delegate: dev.sidhujag
	
	==============================================================================
	Basic Usage
	==============================================================================
      jQuery('.bitsharesticker').bitsharesticker({
          title : 'Bitshares Checkout Live Ticker',
          source: 'bitshares/checkout/callbacks/callback_getfeedprices.php',
          currencyTemplateSource: 'bitshares/checkout/Common-Currency.json',
          currencyPrimary: primaryAssets,
          currencySecondary: secondaryAssets
      });
      example for currencies:
        primaryAssets = 'GOLD, SILVER, BTC';
        secondaryAssets = 'USD, EUR, GBP';
	*For additional documentation please reference github http://github.com/sidhujag/bitshares-ticker
*/
(function (jQuery) {
	jQuery.fn.bitsharesticker = function (options) {
        var currencyIsoCodes = null;
		var options = jQuery.extend({},
		jQuery.fn.bitsharesticker.defaults, options);
		var bitsharesticker;
		var feedsList;
		var overflowContainer;
		var appendThreshhold;
		var currentfeed;
		var listWidth;
		var currentRate = options.normalRate;
		var currencyUniqueList = '';
        var currencyMap = buildCurrencyMap();
        var firstLoadUpdateInterval = 5;
        var firstLoad = true;
		return this.each(function () {
			if (options.tickerOnly == false) {
				bitsharesticker = build();
			} else {
				bitsharesticker = jQuery('<div class="bitsharesticker"><div class="bitsharesticker-replace"></div></div>');
			}
			jQuery(this).append(bitsharesticker);
			var text = "Loading... Please wait.";
			feedsList = jQuery('<ul class="bitsharesticker-feeds-list"><li class="bitsharesticker-feed">' + text + '</li></ul>');
			overflowContainer = jQuery('<div class="bitsharesticker-overflow-container"></div>');
			bitsharesticker.find('div.bitsharesticker-username a').attr('href', 'http://bitshares.org').html(options.title);
			overflowContainer.wrapInner(feedsList);
			bitsharesticker.find('div.bitsharesticker-replace').replaceWith(overflowContainer);


			
			overflowContainer.mouseover(function () {
				currentRate = options.hoverRate;
			})
			overflowContainer.mouseout(function () {
				currentRate = options.normalRate;
			});
			feedsList.css('left', overflowContainer.width());
			animationLoop();
			getCurrencyCodes();
		});
        function decimalAdjust(type, value, exp) {
            // If the exp is undefined or zero...
            if (typeof exp === 'undefined' || +exp === 0) {
              return Math[type](value);
            }
            value = +value;
            exp = +exp;
            // If the value is not a number or the exp is not an integer...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
              return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            // Shift back
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
          }

          // Decimal round
          
          function round10(value, exp) {
            return decimalAdjust('round', value, -1*exp);
          }
          		
		function updater(){
            jQuery.ajax({
                url: options.source + '?assets=' + currencyUniqueList,
                type: 'get',
                dataType: 'json',
                timeout: 15000, 
                error:function(jqXHR, textStatus, errorThrown){
                    firstLoad = true;
                    jQuery('.bitsharesticker-feed').html("<span><font color='red'>Error!</font> Could not download price data. Trying again in 5 seconds...</span>");                  
                },
                complete:function(){
                    var timeout = firstLoadUpdateInterval;
                    if(!firstLoad)
                    {
                        timeout = options.updateInterval;
                    }		
		            setTimeout(function(){ updater(); }, timeout*1000);               
                },                                        
                success: function(response, textStatus, jqXHR) {
                    if(response)
                    {
                        var data = formatJSONCurrencyData(response);
                        if(firstLoad){
                            firstLoad = false;
                            var myhtml = buildScrollingText(data);
                            jQuery('.bitsharesticker-feed').html(myhtml);
                        }
                        else{
                            updateScrollingText(data);
                        }

			        }                                             
                }
            }); 
		}
		function animationLoop() {
		    var pos = feedsList.position().left;
		    if(pos < (-1*feedsList.width()))
		    {
		        feedsList.css('left', overflowContainer.width());
		    }
			if (currentRate > 0) {
				feedsList.animate({
					'left': '-=1px'
				},
				currentRate, 'linear', animationLoop);
			} else {
				animationLoop();
			}

		}
	    function buildCurrencyMap()
	    {
	        var tmpMap =  new Array();
	        var currencyMap = new Array();
	        currencyUniqueList = "";
	        var formattedPrimary = options.currencyPrimary.replace(/\s/g, '');
	        var currencyPrimaryArray =  formattedPrimary.split(',');
	        var formattedSecondary = options.currencySecondary.replace(/\s/g, '');
	        var currencySecondaryArray =  options.currencySecondary.split(',');
	        for(var i =0;i<currencyPrimaryArray.length;i++)
	        {
                if(currencyUniqueList.indexOf(currencyPrimaryArray[i]) === -1)
                {
                    currencyUniqueList += currencyPrimaryArray[i] + ',';
                } 	        
	            for(var j =0;j<currencySecondaryArray.length;j++)
	            {
	                if(currencyUniqueList.indexOf(currencySecondaryArray[j]) === -1)
	                {
	                    currencyUniqueList += currencySecondaryArray[j] + ',';
	                } 
	                var currencyString = currencyPrimaryArray[i]+currencySecondaryArray[j];
	                var reverseCurrencyString = currencySecondaryArray[j]+currencyPrimaryArray[i];
	                if(!tmpMap[reverseCurrencyString] && !tmpMap[currencyString])
	                {
	                    tmpMap[currencyString] = 1;
	                    currencyMap.push({ primary : currencyPrimaryArray[i], secondary : currencySecondaryArray[j] }); 
	                }
	            }
	        }
	        if(currencyUniqueList.length > 0)
	        {
	            currencyUniqueList = currencyUniqueList.slice(0,-1);
	        }
	        return currencyMap;
	    }
	    function formatJSONCurrencyData(response)
	    {
	        var data = [];
	        for(var i =0;i<response.length;i++)
	        {
	            var currencyObj = [];
	            if(!response[i].opening_price)
	            {
	                currencyObj.open_price = response[i].median_price;
	            }
	            else{
	                currencyObj.open_price = response[i].opening_price;
	            }
	            currencyObj.median_price = response[i].median_price;
	            data[response[i].asset] = currencyObj;
	        }
	        return data;
	    }
	    function updateScrollingText(data){
	        var d = new Date();
	        jQuery('#date').text(d.toString());
	        jQuery.each( currencyMap, function( key, value ) {
	          var divKey =  value.primary + value.secondary;
              var isoCodeMap = currencyIsoCodes[value.secondary];
              var precision = 2;
              if(isoCodeMap)
              {
                precision = isoCodeMap.decimal_digits;
              }
              var median_price = 0;
              if(value.primary === "BTS")
              {
                median_price = data[value.secondary].median_price;
                precision = currencyIsoCodes[value.primary].decimal_digits;
              }
              else if(value.secondary === "BTS")
              {
                median_price = 1/data[value.primary].median_price;
                precision = currencyIsoCodes[value.secondary].decimal_digits;
              }
              else if(data[value.primary] && data[value.secondary])
              {             
                median_price = data[value.secondary].median_price/data[value.primary].median_price;  
              }                 
             
              var median_priceRounded = round10(median_price, precision);
              
              var medianRounded = round10(parseFloat(jQuery('#'+divKey+' #value').text()), precision);
              if(medianRounded != median_priceRounded)
              {
                  var open_price = 0;
                  if(value.primary === "BTS")
                  {
                    open_price = data[value.secondary].open_price;
                  }
                  else if(value.secondary === "BTS")
                  {
                    open_price = 1/data[value.primary].open_price;
                  }
                  else if(data[value.primary] && data[value.secondary])
                  {            
                    open_price = data[value.secondary].open_price/data[value.primary].open_price;
                  }                      
   
                  var difference = median_price - open_price;
                  var pct = round10((difference / open_price)*100, 2);
                  var symbol = "";
                  if(isoCodeMap)
                  {
                    symbol = isoCodeMap.symbol;
                  }
                  var build = value.primary + "/" + value.secondary + ' ' + symbol + '<b id="value">'+median_priceRounded+'</b>';
                  if(difference > 0)
                  {
                    build += '<b class="up">&nbsp;<b class="change">&nbsp;'+round10(difference, precision)+ '</b><b class="pct">&nbsp;(' + pct + '%)</b>&nbsp;<i class="fa fa-caret-up"></i></b>';
                  }
                  else if(difference < 0)
                  {
                    build += '<b class="down">&nbsp;<b class="change">&nbsp;'+round10(difference, precision)+ '</b><b class="pct">&nbsp;(' + pct + '%)</b>&nbsp;<i class="fa fa-caret-down"></i></b>';
                  }
                  build += '&nbsp;&nbsp;';
                  jQuery('#'+divKey).html(build);
              }
	        });
	    }
	    function getCurrencyCodes()
	    {
            jQuery.ajax({
                url: options.currencyTemplateSource,
                type: 'get',
                dataType: 'json',
                timeout: 15000, 
                 error:function(jqXHR, textStatus, errorThrown){
                    jQuery('.bitsharesticker-feed').html("<span><font color='red'>Error!</font> Could not download Currency template file. Please refresh your browser to try again...</span>");                  
                },                                      
                success: function(response, textStatus, jqXHR) {
                    if(response)
                    {   
                        currencyIsoCodes = response;
			            setTimeout(function(){ updater(); }, firstLoadUpdateInterval*1000);              
    			    }                                            
                }
            }); 	    
	    }
		function buildScrollingText(data) {
			var build = '';
			var d = new Date();
			build += "<span><span id='date'>"+d.toString() + '</span>&nbsp;&nbsp;';
            jQuery.each( currencyMap, function( key, value ) {
	          var isoCodeMap = currencyIsoCodes[value.secondary];
	          var precision = 2;
	          if(isoCodeMap)
	          {
	            precision = isoCodeMap.decimal_digits;
	          }            
              build += '<span id="'+value.primary+value.secondary+'">';
              var median_price = 0;
              if(value.primary === "BTS")
              {
                median_price = data[value.secondary].median_price;
                precision = currencyIsoCodes[value.primary].decimal_digits;
              }
              else if(value.secondary === "BTS")
              {
                median_price = 1/data[value.primary].median_price;
                precision = currencyIsoCodes[value.secondary].decimal_digits;
              }
              else if(data[value.primary] && data[value.secondary])
              {             
                median_price = data[value.secondary].median_price/data[value.primary].median_price;  
              }  
              var open_price = 0;
              if(value.primary === "BTS")
              {
                open_price = data[value.secondary].open_price;
              }
              else if(value.secondary === "BTS")
              {
                open_price = 1/data[value.primary].open_price;
              }
              else if(data[value.primary] && data[value.secondary])
              {            
                open_price = data[value.secondary].open_price/data[value.primary].open_price;
              }  
              var difference = 0;
              var pct = 0.00;
              if(open_price > 0 && median_price > 0)
              {
                difference = median_price - open_price;
                pct = round10((difference / open_price)*100, 2);
              }
              var symbol = "";
              if(isoCodeMap)
              {
                symbol = isoCodeMap.symbol;
              }
              build += value.primary + "/" + value.secondary + ' ' + symbol + '<b id="value">'+round10(median_price,precision)+'</b>';
              if(difference > 0)
              {
                build += '<b class="up">&nbsp;<b class="change">&nbsp;'+round10(difference,precision)+ '</b><b class="pct">&nbsp;(' + pct + '%)</b>&nbsp;<i class="fa fa-caret-up"></i></b>';
              }
              else if(difference < 0)
              {
                build += '<b class="down">&nbsp;<b class="change">&nbsp;'+round10(difference,precision)+ '</b><b class="pct">&nbsp;(' + pct + '%)</b>&nbsp;<i class="fa fa-caret-down"></i></b>';
              }              
              build += '&nbsp;&nbsp;</span>';
            });			
			build += 'Rates updated every 5 minutes&nbsp;&nbsp;';	
		    build += 'Powered by <a href="http://bitshares.org" target="_blank">Bitshares.org</a>...&nbsp;&nbsp;</span>';
			return jQuery(build);
		}		
		function build() {
			var build = '';
			build += '<div class="bitsharesticker">';
			build += '<div class="bitsharesticker-container">';
			build += '<div class="bitsharesticker-container-left"></div>';
			build += '<div class="bitsharesticker-container-content">';
			build += '<div class="bitsharesticker-username"><a href="#">Bitshares Ticker</a></div>';
			build += '<div class="bitsharesticker-bitshares-link"><a href="http://bitshares.org" target="_blank">Bitshares.org</a></div>';
			build += '<div class="bitsharesticker-feedbox">';
			build += '<div class="bitsharesticker-feedbox-content">';
			build += '<div class="bitsharesticker-replace"></div>';
			build += '</div>';
			build += '</div>';
			build += '</div>';
			build += '<div class="bitsharesticker-container-right"></div>';
			build += '</div>';
			build += '</div>';
			return jQuery(build);
		}
	};
	jQuery.fn.bitsharesticker.defaults = {
		title: '',
		normalRate: 15,
		hoverRate: 100,
		tickerOnly: false,
		source: '',
		currencyTemplateSource: '',
		currencyPrimary: '',
		currencySecondary: '',
		updateInterval: 300

	};
})(jQuery);