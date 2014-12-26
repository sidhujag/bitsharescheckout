    // states
    function btsUpdateUIDefault()
    {
        $('#myForm .fa-robo').removeClass('success fail');
	    $('#myForm').removeClass('fail animated');
	    $('#paymentMessage').html("Scanning for payments on the blockchain for this order...<br /><br />");  	    
	    $('#return').text("Cancel and return to checkout");
        $('#paymentProgress').css('width', "20%");
        $('#paymentProgress').attr('aria-valuenow', 20); 	    
	    $('#paymentProgressOuter').addClass("active");
	    $('#lookupStatusIcon').removeClass('fa-refresh fa-spin').addClass('fa-search');
	    $('#scanIcon').removeClass('fa-refresh fa-spin').addClass('fa-qrcode');
        var balance = parseFloat($('#balance').val()).toFixed(2);
        $("#paymentBalance").text(balance + " " + globalAsset);

        var amount = parseFloat(globalAmountReceived).toFixed(2);
        $("#paymentTotalReceived").text(amount+ " "+ globalAsset);
        $('#pay').html('<i class="fa fa-credit-card"></i>&nbsp;Pay ' + $('#balance').val() + ' ' + globalAsset);
        $('#scan').html('<i class="fa fa-qrcode"></i>&nbsp;Scan Again');
        $('#pay').removeAttr('disabled');
        $('#scan').removeAttr('disabled');
    }
    function btsUpdateUIPaymentFail()
    {
        $('#myForm .fa-robo').removeClass('success').addClass('fail');
	    $('#myForm').addClass('fail');
	        
    }
    function btsUpdateUIScanClear()
    {
        globalAmountReceived = 0; 
        globalTotal = 0;
        globalAsset = "";
        btsUpdateUIDefault();
        if(globalScanInProgress)
            btsUpdateUIScanCancelled();
        globalPaid = false;
        
    } 
    function btsUpdateUIScanCancelled()
    {
        btsUpdateUIScanComplete();   
        $('#paymentMessage').text("Scan cancelled by user");
              
    }     
    function btsUpdateUIScanComplete()
    {
        globalNeedScan = false;
        globalScanInProgress = false;
        $('#paymentMessage').text("Scan complete");
        $('#paymentProgressOuter').removeClass("active");
        $('#paymentProgress').css('width', "100%");
        $('#paymentProgress').attr('aria-valuenow', 100);
        $('#lookupStatusIcon').removeClass('fa-refresh fa-spin').addClass('fa-search'); 
        var balance = parseFloat($("#balance").val()).toFixed(2);
        $('#pay').html('<i class="fa fa-credit-card"></i>&nbsp;Pay ' + balance + ' ' + globalAsset);
        $('#scan').html('<i class="fa fa-qrcode"></i>&nbsp;Scan Again');           
        $('#pay').removeAttr('disabled');
    } 
       
    function btsUpdateUIScan()
    {
        globalScanInProgress = true;
        btsUpdateUIDefault();
        var myform = $('#btsForm');
        
        $('#lookupStatusIcon').removeClass('fa-search').addClass('fa-refresh fa-spin');       
        $('#paymentProgressOuter').addClass("active");
        $('#paymentProgress').css('width', "20%");
        $('#paymentProgress').attr('aria-valuenow', 20);  
        $('#pay').html('<i class="fa fa-credit-card"></i>&nbsp;Please Wait'); 
        $('#scan').html('<i class="fa fa-refresh fa-spin"></i>&nbsp;Cancel Scan'); 
        $('#pay').attr('disabled', 'disabled'); 
               
    }
   
    function btsUpdateUIFullScan()
    {
        btsUpdateUIScan();
        $('#paymentMessage').html("Scanning for payments on the blockchain for this order...<br /> This may take up to 3 minutes <br /><br />");  
    }
    function btsUpdateUIQuickScan()
    {
        btsUpdateUIScan();
    }  
     
    function btsUpdateUIPayment()
    {
       var amountReceived = parseFloat(globalAmountReceived).toFixed(2);
       var balance = parseFloat($("#balance").val()).toFixed(2);
       $("#paymentBalance").text(balance + " " + globalAsset); 
       $("#paymentTotalReceived").text(amountReceived + " " + globalAsset);                         
       $("#payButtonMessage").text("Pay " + balance + " " + globalAsset);
       $('#pay').html('<i class="fa fa-credit-card"></i>&nbsp;Pay ' + balance + ' ' + globalAsset);                    
    }
    function btsUpdateUIScanProgress(progress)
    {
        $('#paymentProgress').css('width', progress + "%");
        $('#paymentProgress').attr('aria-valuenow', progress);      
    }
    function btsUpdateUIPartialPayment()
    {
        btsUpdateUIPayment();
        var paymentmessage = "Payment found. You still have a balance. ";
        if(globalScanInProgress)
        {
            paymentmessage += "Scanning further for any remaining payments...";
        }
        else
        {
            paymentmessage += "Please click 'Scan Again' to keep looking for more payments...";
        }
        
        paymentmessage += "<br /><br />";
        $('#paymentMessage').html(paymentmessage);           
    }    
    function btsUpdateUIFullPayment()
    {
        btsUpdateUIPayment();
        btsUpdateUIScanComplete();
        $('#myForm .fa-robo').removeClass('fail').addClass('success');
	    $('#myForm').removeClass('fail').removeClass('animated');   
        $('#return').text("I'm done! Return to checkout");
  
        $('#returnIcon').removeClass('fail').addClass('success shake');

        $('#paymentMessage').html("Payment complete...<br /><br />");
        $('#pay').attr('disabled', 'disabled'); 
        $('#scan').attr('disabled', 'disabled'); 
           
    } 
    function btsUpdateUIRedirectCancel()
    {
    } 
    function btsUpdateUIReturnError()
    {
        $('#returnIcon').removeClass('success').addClass('fail');   
    }     