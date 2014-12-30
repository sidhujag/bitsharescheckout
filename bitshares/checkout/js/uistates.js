    // states
    function btsUpdateUIDefault()
    {
        $('#myForm .fa-robo').removeClass('success fail');
	    $('#myForm').removeClass('fail animated');
	    $('#paymentMessage').html("Scanning for payments on the blockchain for this order...<br /><br />");  	    
	    $('#return').text("Cancel and return to merchant");    
	    $('#paymentProgressOuter').addClass("active");
        var balance = globalTotal - globalAmountReceived;
        if(balance < 0)
            balance = 0;	    
        balance = parseFloat(balance).toFixed(2);
        $("#paymentBalance").text(balance + " " + globalAsset);

        var amount = parseFloat(globalAmountReceived).toFixed(2);
        $("#paymentTotalReceived").text(amount+ " "+ globalAsset);

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
        globalPaid = false;
        
    } 
    
    function btsUpdateUIScanComplete()
    {
        globalNeedScan = false;
        globalScanInProgress = false;
        $('#paymentMessage').text("Scan complete");
        $('#paymentProgressOuter').removeClass("active");

    } 
       
    function btsUpdateUIScan()
    {
        globalScanInProgress = true;
        btsUpdateUIDefault();          
        $('#paymentProgressOuter').addClass("active");
        $('#paymentMessage').html("Scanning for payments on the blockchain for this order...<br /><br />");                   
    }
   
    function btsUpdateUIPayment()
    {
       var amountReceived = parseFloat(globalAmountReceived).toFixed(2);
        var balance = globalTotal - globalAmountReceived;
        if(balance < 0)
            balance = 0;	    
        balance = parseFloat(balance).toFixed(2);
       $("#paymentBalance").text(balance + " " + globalAsset); 
       $("#paymentTotalReceived").text(amountReceived + " " + globalAsset);                         
                       
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
        $('#return').text("I'm done! Return to merchant");
  
        $('#returnIcon').removeClass('fail').addClass('success shake');

        $('#paymentMessage').html("Payment complete...<br /><br />");
   
    } 
    function btsUpdateUIReturnError()
    {
        $('#returnIcon').removeClass('success').addClass('fail');   
    }     