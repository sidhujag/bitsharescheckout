
    var globalNeedScan = true;
    var globalPaid = false;
    var globalPaymentTimer = null;
    var globalScanInProgress = false;
    var globalRedirectCountdownTimer = null;
    var globalInitDialog = null;
    var globalRedirectDialog = null;
    var globalLoadingDialog = null;
    var globalAmountReceived = 0;
    var globalTotal = 0;
    var globalAsset = "";
    function InitGlobals()
    {
        $.noty.defaults.layout = "topRight";
        $.noty.defaults.theme = "relax";
        $.noty.defaults.timeout = 10000;
        $.noty.defaults.animation.open = "animated flipInX";
        $.noty.defaults.animation.close = "animated flipOutX";
        $.noty.defaults.animation.easing = "swing"; 
        globalInitDialog = new BootstrapDialog({
            title: 'Initializing',
            message: 'Please wait a moment while we set things up...',
            autodestroy: false,
            closable: false,                
            buttons: []    
        });   
        globalLoadingDialog = new BootstrapDialog({
            title: 'Loading',
            message: 'Please wait a moment...',
            autodestroy: false,
            closable: false,                
            buttons: []    
        });
            
        globalInitDialog.open();
        globalRedirectDialog = new BootstrapDialog({
            title: 'Payment Complete',
            message: $('<div></div>').load('template/success.html'),
            autodestroy: false,
            closable: false,  
            closeByBackdrop: false,              
            buttons: [
                {         
                label: 'Cancel',
                cssClass: 'btn-primary',
                action: function(dialogItself){
                    if(globalRedirectCountdownTimer)
                    {
                        clearInterval(globalRedirectCountdownTimer);
                        globalRedirectCountdownTimer = null;
                    } 
               
                    dialogItself.close();
                }
            }]    
        });  
    
    }   
              
    


