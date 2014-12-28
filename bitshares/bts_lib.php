<?php
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2011-2014 BitShares
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @param string $url
 * @param string $apiKey
 * @param string $post
 *
 * @return array
 */
function btsCurl($url, $post, $rpcUser, $rpcPass, $rpcPort)
{
	$curl = curl_init($url);
	$length = 0;
	if ($post)
	{
		curl_setopt($curl, CURLOPT_POST, 1);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $post);
		$length = strlen($post);
	}

	$userpass  = base64_encode($rpcUser . ":" . $rpcPass);
	$header = array(
		'Content-Type: application/json',
		"Content-Length: $length",
		"Authorization: Basic $userpass",
		'X-BitShares-Plugin-Info: opencart0.4',
    );

	curl_setopt($curl, CURLOPT_PORT, $rpcPort);
	curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
	curl_setopt($curl, CURLOPT_TIMEOUT, 10);
	curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC ) ;
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 1); // verify certificate
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2); // check existence of CN and verify that it matches hostname
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($curl, CURLOPT_FORBID_REUSE, 1);
	curl_setopt($curl, CURLOPT_FRESH_CONNECT, 1);

	$responseString = curl_exec($curl);
  
    if($responseString === false)
    {
    
    $response['error'] = curl_error($curl);

    }
    else
    {
		$response = json_decode($responseString, true);
		if (!$response)
        {
       
			$response['error'] =  'invalid response: '.$responseString;
        }
    if(is_array($response) && array_key_exists('error', $response) && is_array($response['error']) && array_key_exists('message', $response['error']))
			{
				$response['error'] = $response['error']['message'];
			}        
	}
	curl_close($curl);
	return $response;
}
function btsCreateEHASH($account,$order_id, $price, $asset, $salt)
{
  $string = $account.$order_id.$price.$asset.$salt;
  return substr(md5($string), 0, 12);
}

/**
 * $orderId: Used to display an orderID to the buyer. In the account summary view, this value is used to
 * identify a ledger entry if present.
 *
 * $price: by default, $price is expressed in the currency you set in config.  The currency can be
 * changed in $options.
 *
 * $posData: this field is included in status updates or requests to get an invoice.  It is intended to be used by
 * the merchant to uniquely identify an order associated with an invoice in their system.  Aside from that, Bitshares does
 * not use the data in this field.  The data in this field can be anything that is meaningful to the merchant.
 *
 * $options keys can include any of:
 * ('itemDesc', 'itemCode', 'notificationEmail', 'notificationURL', 'redirectURL', 'apiKey'
 *		'currency', 'physical', 'fullNotifications', 'transactionSpeed', 'buyerName',
 *		'buyerAddress1', 'buyerAddress2', 'buyerCity', 'buyerState', 'buyerZip', 'buyerEmail', 'buyerPhone')
 * If a given option is not provided here, the value of that option will default to what is found in config
 * (see api documentation for information on these options).
 *
 * @param string $orderId
 * @param string $price
 * @param string $posData
 * @param array  $options
 *
 * @return array
 */
function btsCreateInvoice($account, $order_id, $memo)
{
  return 'bitshares/checkout/index.html?accountName='.$account.'&order_id='.$order_id.'&memo='.$memo;
}
function btsGetAssetNameById($assetId, $rpcUser, $rpcPass, $rpcPort)
{
	$post_string = '{"method": "blockchain_get_asset", "params": ["'.$assetId.'"], "id": "0"}';
	$response = btsCurl('http://127.0.0.1/rpc', $post_string, $rpcUser, $rpcPass, $rpcPort);

  if(array_key_exists('error', $response))
  {

	return "";
  }
  return $response['result']['symbol'];
}
function btsCreateMemo($hash)
{
  return 'EHASH:'.$hash;
}
function btsCreatePaymentURL($account, $amount, $asset, $memo)
{
  return 'bts:'.$account.'/transfer/amount/'.$amount.'/asset/'.$asset.'/memo/'.$memo;
}
function btsCurrencyToAsset($currency)
{
  if($currency === 'BTS')
     return $currency;
  if(strlen($currency) > 3 && strncmp($currency,'bit', 3) === 0)
     return 'Bit'.substr($currency, 3);
  return 'Bit'.$currency;
}
/**
 * Call from your notification handler to convert $_POST data to an object containing invoice data
 *
 * @param string $apiKey
 *
 * @return array
 */
function btsVerifyOpenOrders($orderList, $account, $rpcUser, $rpcPass, $rpcPort, $hashSalt, $demoMode)
{
   $retArray = array();
   $response =  btsGetTransactions($orderList, $rpcUser, $rpcPass, $rpcPort);
   if(array_key_exists('error', $response))
   {
    return $response;
   }
    foreach ($orderList as $order) {
      $order_id = $order['order_id'];
      $priceToPay = $order['total'];
      $asset = $order['asset'];
      $orderTime = $order['date_added'];
      $timeStamp = 0;
      $trx_id = 0;
      $orderEHASH = btsCreateEHASH($account, $order_id, $priceToPay, $asset, $hashSalt);
      $openOrderMemo = btsCreateMemo($orderEHASH);
      $accumulatedAmountPaid = 0;
      
      if(!array_key_exists('result', $response))
      {
        continue;
      }
	
      foreach($response['result'] as $txinfo)
      {
        $amount = 0;
        // make sure the order was placed before it was paid on the blockchain, sanity check incase hash's match but tx is for wrong order.
        // also make sure this tx is confirmed on the blockchain before processing it
        if($txinfo['is_confirmed'] === true)
        {
	      $timeStamp = $txinfo['timestamp'];
          $trx_id = $txinfo['trx_id'];
          foreach($txinfo['ledger_entries'] as $tx) {
	
	          //$txTime = strtotime($tx['timestamp']);
            // echo 'time: ' . $txTime;	
            $toaccount = $tx['to_account'];
	
	          $txSymbol = btsGetAssetNameById($tx['amount']['asset_id'], $rpcUser, $rpcPass, $rpcPort);
            $memo = $tx['memo'];
	          if($txSymbol != $asset && !$demoMode)
		        {
			        continue;
		        }
            // sanity check, tx to account should match your configured account in admin settings
            if($toaccount != $account)
            {
              continue;
            }
            // order memo must match this memo
            if($memo != $openOrderMemo)
            {
              continue;
            }
            $amount += ($tx['amount']['amount']/100000);
            
          }
          $accumulatedAmountPaid += $amount;
        }
        if($amount > 0)
        {
	        $ret = array();
    	
          $ret['order_id'] = $order_id;
          $ret['asset'] = $asset;
          $ret['amount'] = $amount;
          $ret['total'] = $priceToPay;
          $ret['hash'] = $orderEHASH;
          $ret['memo'] = btsCreateMemo($orderEHASH);
          $ret['trx_id'] = $trx_id;
          // payment within 5 units of the price, ie: price = 5 BitUSD, overpayment is when 11 BitUSD is received or more.
          if($accumulatedAmountPaid > ($priceToPay+5.0))
          {
            $ret['status'] = 'overpayment';
            $ret['amountOverpaid'] = ($accumulatedAmountPaid-$priceToPay);
          }
          else if($accumulatedAmountPaid >= ($priceToPay-0.01))
          {
            $ret['status'] = 'complete';
          }
          else
          {
            $ret['status'] = 'processing';
            $ret['url'] = btsCreateInvoice($account,$asset,$orderEHASH);
          }
        
          array_push($retArray, $ret);
       }        
      }  
      
    }


   
   return $retArray;

}
function btsValidateRPC($account, $rpcUser, $rpcPass, $rpcPort)
{

  $post_string = '{"method": "wallet_account_balance", "params": ["'.$account.'"], "id": "0"}';
	$response = btsCurl('http://127.0.0.1/rpc', $post_string, $rpcUser, $rpcPass, $rpcPort);  
  
  
  return $response;
}

/**
 *
 * @param string $invoiceId
 * @param atring $apiKey
 *
 * @return array
 */
function btsGetTransactions($orderList, $rpcUser, $rpcPass, $rpcPort)
{

	$post_string = '{"method": "wallet_account_transaction_history", "params": [], "id": "0"}';
	$response = btsCurl('http://127.0.0.1/rpc', $post_string, $rpcUser, $rpcPass, $rpcPort);	
	
	return $response;
}
?>