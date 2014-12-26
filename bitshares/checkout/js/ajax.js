    function ajaxLookup(serializedData)
    {
        
        $.ajax({
            url: "callbacks/callback_lookup.php",
            type: 'post',
            dataType: 'json',
            data: serializedData,
            beforeSend:function(){ 
                globalLoadingDialog.open();
            },
            complete:function(){
                globalLoadingDialog.close();
            },   
            error:function(jqXHR, textStatus, errorThrown){
                var res = textStatus;
                if(jqXHR.responseText !== "")
                {
                    res = jqXHR.responseText;
                }
                var n = noty({
                    text: res,
                    type: 'error'
                });
                btsUpdateUIPaymentFail();                 
            },                              
            success: function(response, textStatus, jqXHR) {
                if(response)
                {
                    if(response.error)
                    {
                       var n = noty({
                            text: response.error,
                            type: 'error'
                        });
                        btsUpdateUIPaymentFail();                                             
                    }
                    else 
                    {
                        if(globalTotal == 0 && globalAsset === "")
                        {
                            $('#balance').val(response.total);
                            globalTotal = response.total;
                            globalAsset = response.asset;
                        }

                        btsShowPaymentStatus();                                 
                    }
			    }
			    else
			    {
                    btsUpdateUIPaymentFail(); 
			    }
			                                                
            }
        });    
    }
    function ajaxPay(serializedData)
    {
        
        $.ajax({
            url: "callbacks/callback_pay.php",
            type: 'post',
            dataType: 'json',
            data: serializedData,
            beforeSend:function(){ 
                globalLoadingDialog.open();
               
            },
            complete:function(){
                globalLoadingDialog.close();
            },   
            error:function(jqXHR, textStatus, errorThrown){
                var res = textStatus;
                if(jqXHR.responseText !== "")
                {
                    res = jqXHR.responseText;
                }
                var n = noty({
                    text: res,
                    type: 'error'
                });
                btsUpdateUIPaymentFail();                 
            },                              
            success: function(response, textStatus, jqXHR) {
                var textresponse = "Payment processing..."

                if(response)
                {
                    if(response.error)
                    {
                       var n = noty({
                            text: response.error,
                            type: 'error'
                        });
                        btsUpdateUIPaymentFail();                                             
                    }
                    else if(response.url)
                    {
                       var n = noty({
                            text: textresponse,
                            type: 'success',
                        });
                        window.location.href =  response.url;
			            btsStartPaymentTracker(serializedData, PaymentScanEnum.FULLSCAN);                                   
                    }

			    }
			    else
			    {
                    btsUpdateUIPaymentFail(); 
			    }
			                                                
            }
        });    
    }
    function ajaxCancel(myurl, serializedData)
    {      
        $.ajax({
            url: myurl,
            type: 'post',
            dataType: 'json',
            data: serializedData,
            beforeSend:function(){
                globalLoadingDialog.open();
            },
            complete:function(){
                globalLoadingDialog.close();
            },   
            error:function(jqXHR, textStatus, errorThrown){
                var res = textStatus;
                if(jqXHR.responseText !== "")
                {
                    res = jqXHR.responseText;
                }
                var n = noty({
                    text: res,
                    type: 'error'
                });

		        btsUpdateUIReturnError();                                 
            },                              
            success: function(response, textStatus, jqXHR) {
               if(response)
               { 
                   var textresponse = "Returning to checkout...If you are not redirected click <a href='"+response.url+"'>here</a>";
                   var n = noty({
                        text: textresponse,
                        type: 'success',
                        timeout: false
                    }); 
                    if(response.url)
                    {
                        window.location.href =  response.url;                 
                    }                                  
                }
                                                  
            }
        });     
    }
    function ajaxSuccess(myurl, serializedData)
    {      
        $.ajax({
            url: myurl,
            type: 'post',
            dataType: 'json',
            data: serializedData,
            beforeSend:function(){
                globalLoadingDialog.open();
            },
            complete:function(){
                globalLoadingDialog.close();
            },   
            error:function(jqXHR, textStatus, errorThrown){
                var res = textStatus;
                if(jqXHR.responseText !== "")
                {
                    res = jqXHR.responseText;
                }
                var n = noty({
                    text: res,
                    type: 'error'
                });

		        btsUpdateUIReturnError();                                 
            },                              
            success: function(response, textStatus, jqXHR) {
               if(response)
               { 
                   var textresponse = "Returning to checkout...If you are not redirected click <a href='"+response.url+"'>here</a>";
                   var n = noty({
                        text: textresponse,
                        type: 'success',
                        timeout: false
                    }); 
                    if(response.error)
                    {
                       var n = noty({
                            text: response.error,
                            type: 'error'
                        });                    
                    }
                    if(response.url)
                    {
                        window.location.href =  response.url;                 
                    }                                  
                }
                                                  
            }
        });     
    }
    function ajaxScanChain(serializedData, progressToUpdate, scanMode)
    {
        if(progressToUpdate < 20)
            progressToUpdate = 20;
        if(progressToUpdate > 100)
            progressToUpdate = 100;    
        $.ajax({
            url: "callbacks/callback_verifysingleorder.php",
            type: 'post',
            dataType: 'json',
            data: serializedData,
            beforeSend:function(){
                if(scanMode == PaymentScanEnum.QUICKSCAN)
                    btsUpdateUIQuickScan();            
            },
            complete:function(){
      
            },   
            error:function(jqXHR, textStatus, errorThrown){
                var res = textStatus;
                if(jqXHR.responseText !== "")
                {
                    res = jqXHR.responseText;
                }
                var n = noty({
                    text: res,
                    type: 'error'
                });
                clearInterval(globalPaymentTimer);               
            },                              
            success: function(response, textStatus, jqXHR) {
                var textresponse = "Payment recieved...";
                if(!response)
                { 
                    return;
                }
                if(response.error)
                {
                   var n = noty({
                        text: response.error,
                        type: 'error'
                    });                    
                }
                else 
                {
                    btsUpdateUIScanProgress(progressToUpdate);
                    if(response.length > 0)
                    {       
                        $("#paymentStatusTable tbody").empty(); 
                    }
                  
                    var totalAmountReceived = 0;
                 
                    var complete = false;
                    var processing = false;
                    for (var i=0;i<response.length;i++)
                    {
                        processing = true;
                        if(response[i].status === "complete" || response[i].status === "overpaid")
                        {
                            complete = true;
                            processing = false;
                        }    
                   
                        totalAmountReceived += parseFloat(parseFloat(response[i].amount));

                        
                        $("#paymentStatusTable").find('tbody')
                        .append($('<tr>')
                            .append($('<td>')
                                .text((i+1))
                            )    
                            .append($('<td>')
                                .append($('<a>')
                                    .attr('href', 'bts:Trx/' + response[i].trx_id)
                                    .text(response[i].trx_id.substr(0,10) + "...")
                                )
                            )
                             .append($('<td>')
                                .text(response[i].order_id)
                            )   

                             .append($('<td>')
                                .attr('class', 'text-right')
                                .text(parseFloat(response[i].amount).toFixed(2) + " " + response[i].asset)
                            )                                                                                             
                        );
                    }
                    if(totalAmountReceived > 0)
                    {
                        globalAmountReceived = totalAmountReceived;
                        var newbalance = globalTotal - totalAmountReceived;
                        if(newbalance < 0)
                            newbalance = 0;
                        $('#balance').val(newbalance);
                    }
                    if(scanMode == PaymentScanEnum.QUICKSCAN)
                        btsUpdateUIScanComplete();                     
                    if(complete)
                    {
                        setTimeout(function(){ btsShowPaymentComplete(); }, 5000); 
                        clearInterval(globalPaymentTimer);
                        btsUpdateUIFullPayment();  
                    }
                    else if(processing)
                    {
                        btsUpdateUIPartialPayment();
                    }                  
                }                                  
            }
        });
 
    }
    
       
  





    


