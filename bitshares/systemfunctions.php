<?php
require 'config.php';
require 'bts_lib.php';
require 'userfunctions.php';
function debuglog($contents)
{
	error_log($contents);
}
function getFeedPrices()
{
  $assets = explode(',', $_REQUEST['assets']);
  $priceData = btsTodaysOpenPriceWithFeed($assets, rpcUser, rpcPass, rpcPort);
  return $priceData;
}
function verifyAndCompleteOpenOrder($orderArray)
{
	$ret = array();
	$demo = FALSE;
	if(demoMode === "1" || demoMode === 1 || demoMode === TRUE || demoMode === "true")
	{
		$demo = TRUE;
	}
	$response = btsVerifyOpenOrders($orderArray, accountName, rpcUser, rpcPass, rpcPort, hashSalt, $demo);

	if(array_key_exists('error', $response))
	{
	  
	  $ret['error'] = 'Could not verify order. Please try again';
	  return $ret;
	}	
	foreach ($response as $responseOrder) {
		switch($responseOrder['status'])
		{	
			case 'overpayment':
			case 'complete':
				  $ret = completeOrderUser($responseOrder);
				  break; 
			default:
				break;
		} 
	}

	return $ret;	  
}
function verifyOpenOrder($memo, $order_id)
{
	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo. You may get this message if you have already paid/cancelled this order.';
	  return $ret;
	}
	$demo = FALSE;
	if(demoMode === "1" || demoMode === 1 || demoMode === TRUE || demoMode === "true")
	{
		$demo = TRUE;
	}
	return btsVerifyOpenOrders($orderArray, accountName, rpcUser, rpcPass, rpcPort, hashSalt, $demo);
}
function getOrderComplete($memo, $order_id)
{	
  $orders = array();
  $myorder = isOrderCompleteUser($memo, $order_id);
  if($myorder !== FALSE)
  {
    array_push($orders, $myorder);
  }
  return $orders;
}

function getOrder($memo, $order_id)
{
  $orders = array();
  $myorder = doesOrderExistUser($memo, $order_id);
  if($myorder !== FALSE)
  {
    array_push($orders, $myorder);
  }
  return $orders;
}
function lookupOrder($memo, $order_id)
{
	$orderCompleteArray = getOrderComplete($memo, $order_id);
	if(count($orderCompleteArray) > 0)
	{
	  $ret = array();
	  $ret['error'] = 'This order has already been paid';
	  return $ret;
	}

	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo. You may get this message if you have already paid/cancelled this order.';
	  return $ret;
	}

	if ($orderArray[0]['order_id'] !== $order_id) {
		$ret = array();
		$ret['error'] = 'Invalid Order ID';
		return $ret;
	}
  if(NULL !== acceptedAssets)
  {
    $acceptedAssets = explode(',', preg_replace('/\s+/', '', acceptedAssets));
    if (!in_array($orderArray[0]['asset'], $acceptedAssets)) {
	    $ret = array();
	    $ret['error'] = 'The Currency you selected is not accepted by this vendor, please click on cancel to go back to the vendor checkout and try again. Accepted currencies are: ' . acceptedAssets;
	    return $ret;
    }
  }
  if(orderExpiresIn15Minutes === "1" || orderExpiresIn15Minutes === 1 || orderExpiresIn15Minutes === 'TRUE' || orderExpiresIn15Minutes === TRUE || orderExpiresIn15Minutes === "true")
  {
    $defTimezone = date_default_timezone_get();
    date_default_timezone_set("UTC");
    $dateNowObj = new DateTime(null);
    $dateNow = $dateNowObj->getTimestamp();
    $dateAdd = new DateTime($orderArray[0]['date_added']);
    date_default_timezone_set($defTimezone) ; 	
    if($dateAdd)
    {
      $dateExpiry = $dateAdd->getTimestamp() - date('Z') + 15*60; 
      $orderArray[0]['countdown_time'] = ($dateExpiry  - $dateNow);
    } 
  }
        
  if(NULL !== primaryTickerAssets && NULL !== secondaryTickerAssets)
  { 
    $orderArray[0]['primaryTickerAssets'] = preg_replace('/\s+/', '', primaryTickerAssets);
    $orderArray[0]['secondaryTickerAssets'] = preg_replace('/\s+/', '', secondaryTickerAssets);
  }
	return $orderArray[0];
}
function completeOrder($memo, $order_id)
{
	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo. You may get this message if you have already paid/cancelled this order.';
	  $ret['fallbackURL'] = baseURL;
	  return $ret;
	}

	if ($orderArray[0]['order_id'] !== $order_id) {
		$ret = array();
		$ret['error'] = 'Invalid Order ID';
		$ret['fallbackURL'] = baseURL;
		return $ret;
	}  
	$response = verifyAndCompleteOpenOrder($orderArray);
	$response['fallbackURL'] = baseURL;
	return $response;
}
function cancelOrder($memo, $order_id)
{
	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo. You may get this message if you have already paid/cancelled this order.';
	  $ret['fallbackURL'] = baseURL;
	  return $ret;
	}
  $response = verifyAndCompleteOpenOrder($orderArray);
  if(array_key_exists('url', $response))
  {
 	  $response['fallbackURL'] = baseURL;
	  return $response; 
  }
	if ($orderArray[0]['order_id'] !== $order_id) {
	  $ret = array();
	  $ret['error'] = 'Invalid Order ID';
	  $ret['fallbackURL'] = baseURL;
	  return $ret;
	}	  
	$response = cancelOrderUser($orderArray[0]);
	$response['fallbackURL'] = baseURL;
	return $response;
}
function getPaymentURLFromOrder($memo, $order_id)
{
	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo. You may get this message if you have already paid/cancelled this order.';
	  return $ret;
	}
  if(NULL !== acceptedAssets)
  {
    $acceptedAssets = explode(',', preg_replace('/\s+/', '', acceptedAssets));
    if (!in_array($orderArray[0]['asset'], $acceptedAssets)) {
	    $ret = array();
	    $ret['error'] = 'The Currency you selected is not accepted by this vendor, please click on cancel to go back to the vendor checkout and try again. Accepted currencies are: ' . acceptedAssets;
	    return $ret;
    }
  }  
	$order = $orderArray[0];
	$ret = array();
	$demo = FALSE;
	if(demoMode === "1" || demoMode === 1 || demoMode === TRUE || demoMode === "true")
	{
		$demo = TRUE;
	}	
	$response = btsVerifyOpenOrders($orderArray, accountName, rpcUser, rpcPass, rpcPort, hashSalt, $demo);

	if(array_key_exists('error', $response))
	{
	  $ret = array();
	  $ret['error'] = $response['error'];
	  return $ret;
	}
	$balance = $order['total'];
	foreach ($response as $responseOrder) {
		switch($responseOrder['status'])
		{	
			case 'processing':
			case 'overpayment':
			case 'complete':
				$balance -= $responseOrder['amount'];
				break; 
			default:
				break;
		} 
	}
	if($balance <= 0)
	{
		$ret['url'] = '#';
	}
	else
	{	
		$ret['url'] = btsCreatePaymentURL(accountName, $balance, $order['asset'], $memo);
	}
	return $ret;
}

function createOrder()
{
	return createOrderUser();
}
function cronJob($token)
{
	if($token !== cronToken)
	{
		return 'Invalid cronjob token!';
	}
	$openOrderList = getOpenOrdersUser();
	if(count($openOrderList) <= 0)
	{
	  return 'No open orders found!';
	}
	$response = verifyAndCompleteOpenOrder($openOrderList);
	if(array_key_exists('error', $response))
	{	
		return $response;
	}	  
  return cronJobUser();
}
?>