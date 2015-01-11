    function ajaxLookup(serializedData)
    {
        $.ajax({
            url: "callbacks/callback_lookup.php",
            type: 'post',
            dataType: 'json',
            timeout: 15000,
            data: serializedData,
            beforeSend:function(){ 
            },
            complete:function(){
                globalInitDialog.close();
                $("#payNow").focus();
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
                        if(globalTotal === 0 && globalAsset === "")
                        {
                            globalTotal = response.total;
                            globalAsset = response.asset;
                            $('#amount').val(globalTotal + " " + globalAsset);
                        }                          
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
            timeout: 15000,
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
                var textresponse = "Payment processing...";

                if(response)
                {
                    if(response.error)
                    {
                       noty({
                            text: response.error,
                            type: 'error'
                        });
                        btsUpdateUIPaymentFail();                                             
                    }
                    else if(response.url)
                    {
                        noty({
                            text: textresponse,
                            type: 'success'
                        });
                        if(response.url.length > 1)
                        {
                            window.location.href =  response.url;
                        }
			            btsStartPaymentTracker(serializedData);
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
    function ajaxCancel(myurl, serializedData)
    {      
        $.ajax({
            url: myurl,
            type: 'post',
            dataType: 'json',
            timeout: 15000,
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
                   if(response.fallbackURL)
                   { 
                       var textresponse = "Returning to checkout...If you are not redirected click <a href='"+response.fallbackURL+"'>here</a>";
                       var n = noty({
                            text: textresponse,
                            type: 'success',
                            timeout: false
                        });
                    }               
                    if(response.error)
                    {
                       noty({
                            text: response.error,
                            type: 'error'
                        });                                           
                    }
                    else if(response.url)
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
            timeout: 15000,
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
                   if(response.fallbackURL)
                   { 
                       var textresponse = "Returning to checkout...If you are not redirected click <a href='"+response.fallbackURL+"'>here</a>";
                       var n = noty({
                            text: textresponse,
                            type: 'success',
                            timeout: false
                        });
                    }               
                    if(response.error)
                    {
                       noty({
                            text: response.error,
                            type: 'error'
                        });                                           
                    }
                    else if(response.url)
                    {                                  

                       window.location.href =  response.url;                 
                        
                    }
                                                      
                }
                                                  
            }
        });     
    }
    function ajaxScanChain(serializedData)
    { 
        $.ajax({
            url: "callbacks/callback_verifysingleorder.php",
            type: 'post',
            timeout: 15000,
            dataType: 'json',
            data: serializedData,
            beforeSend:function(){
         
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
                                    .attr('class', 'trxLink')
                                    .attr('href', 'bts:Trx/' + response[i].trx_id)
                                    .text(response[i].trx_id.substr(0,10) + "...")
                                )
                            )
                             .append($('<td>')
                                .attr('class', 'text-right')
                                .text(parseFloat(response[i].amount).toFixed(2) + " " + response[i].asset)
                            )                                                                                             
                        );
                    }
                   $('a.trxLink').click(function(e) {
                        if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
                        window.location.href = $(this).attr("href");
                    });      
                    if(totalAmountReceived > 0)
                    {
                        globalAmountReceived = totalAmountReceived;

                    }                  
                    if(complete)
                    {
                        setTimeout(function(){ btsPaymentComplete(); }, 5000); 
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