    function GetURLParameter(sParam)
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) 
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) 
            {
                return sParameterName[1];
            }
        }
    }
    function btsStartTicker(primaryAssets, secondaryAssets)
    {
      $('.bitsharesticker').bitsharesticker({
          title : 'Bitshares Checkout Live Ticker',
          source: 'callbacks/callback_getfeedprices.php',
          currencyPrimary: primaryAssets,
          currencySecondary: secondaryAssets
      });
    
    }
    function btsStartPaymentTracker(serializedData)
    {
        if(globalScanInProgress)
        {
            return;
        }    
        btsUpdateUIScan();      
        if(globalPaymentTimer)
            clearInterval(globalPaymentTimer);
        ajaxScanChain(serializedData);    
        globalPaymentTimer = setInterval(function() {
            ajaxScanChain(serializedData);  
        }, 10000); 
    }    
    $( document ).ready(function() {      
        var accountName = GetURLParameter('accountName');
        var order_id = GetURLParameter('order_id');
        var memo= GetURLParameter('memo');
        $('#accountName').val(accountName);
        $('#accountNameDisplay').text(accountName);
        $('#order_id').val(order_id);
        $('#memo').val(memo);
        $('#payTo').val(accountName);
        var subject = "Bitshares payment URL for order "+memo;
        var url = encodeURIComponent(window.location.href);
        $('#socialMail').attr('href', "mailto:?subject="+subject+"&body="+url);
        $('#socialGoogle').attr('href', "https://plus.google.com/share?url="+url );
        $('#socialFacebook').attr('href', "http://www.facebook.com/sharer.php?m2w&s=100&p[url]="+url+"&p[images][0]=http://bitshares.org/wp-content/uploads/2014/11/bts-logo-white.png&p[title]=Bitshares payment gateway&p[summary]="+subject);
        $('#socialTwitter').attr('href', "http://twitter.com/intent/tweet?source=sharethiscom&text="+subject+"&url="+url );
        ajaxLookup($('#btsForm').serialize());
       
    }); 
    function btsShowSuccess()
    {
        globalRedirectDialog.open();  
        var countdown = 10;
        if(globalRedirectCountdownTimer)
        {
            clearInterval(globalRedirectCountdownTimer);
        }    
        globalRedirectCountdownTimer = setInterval(function() {
            countdown--;
            
            $('#redirectCountdown').html("You will now be automatically redirected back to the merchant site within " + countdown + " seconds...<br /><br />");
            if(countdown <= 0)
            { 
                clearInterval(globalRedirectCountdownTimer);       
                ajaxSuccess("callbacks/callback_success.php", $('#btsForm').serialize());
            }
            
        }, 1000); 
    }  
    function btsStartPaymentCountdown(countDownTime)
    {
       $('.paymentCountdown').FlipClock(countDownTime, {
		    clockFace: 'MinuteCounter',
		    countdown: true,
            callbacks: {
		        	stop: function() {
		        	    if(!globalPaid)
		        	    {
		        		    btsCancelPaymentByCountdown();
		        		}
		        	}
		        }		    
	    });
    } 
    function btsPaymentComplete()
    {
        globalPaid = true;
        $('.paymentCountdown').stop();
        btsShowSuccess();
    }
   
    function btsExportPaymentTableToCSV() {
        window.location.href = '../exportCSV.php?memo='+$('#memo').val()+'&order_id='+$('#order_id').val();
    }    
    function btsShowPaymentStatus()
    {
        $('#exportCSV').removeClass('invisible');
        $('#paymentStatus').removeClass('hidden');
        btsStartPaymentTracker($('#btsForm').serialize()); 
    }
    
    function btsUpdateOnChange()
    {
        if(globalScanInProgress)
        {
            BootstrapDialog.warning('You have cancelled the current payment scan!');        
        }
        btsUpdateUIScanClear();    
    }    
    function btsCancelPaymentByCountdown()
    {
        var n = noty({
            text: 'This order has expired!',
            type: 'error'
        }); 
        ajaxCancel("callbacks/callback_cancel.php", $('#btsForm').serialize()); 
    }
    function btsPayClick() {
                
        if(globalPaid)
        {
            BootstrapDialog.danger('This order has already been paid for!');
        }
        else if(globalAmountReceived > 0)
        { 
     
            BootstrapDialog.confirm('There are partial payment(s) on this order. Would you like to pay the remaining balance of ' + $("#paymentBalance").text() + '?', function(result){
                if(result) {
                    ajaxPay($('#btsForm').serialize());
                }
            });         
        }                  
        else
        {
            ajaxPay($('#btsForm').serialize());
        }    

    }  
    $("input[type='text'], input[type='number']" ).change(function(e) {
      btsUpdateOnChange();
    });  
    $('.paymentCountdown').click(function (e) {
       BootstrapDialog.warning('This is a time sensitive order. The price at which you pay for this order is locked for up to 15 minutes. You must pay and confirm this order within that time or it will be cancelled and you will be redirected back to the merchant site.'); 
    });              
    $('#exportCSV').click(function (e) {
        if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
        btsExportPaymentTableToCSV();
    });   	
    $('#btsForm').submit(function(e) {
        if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; } 
             
        btsPayClick();

    });
    
    $('#paymentStatus').click(function (e) {
        if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
        btsShowPaymentStatus();
    }); 	   
     
    $('#return').click(function (e) { 
        if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }       
      
        if(globalPaid)
        {
            ajaxSuccess("callbacks/callback_success.php", $('#btsForm').serialize());
        }
        else
        {
            BootstrapDialog.confirm('This will cancel your order. Are you sure?', function(result){
                if(result) {
                    ajaxCancel("callbacks/callback_cancel.php", $('#btsForm').serialize());
                }else {
                    
                }
            });            
        }
          
		
	});