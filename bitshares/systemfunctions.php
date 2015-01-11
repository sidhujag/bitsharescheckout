<?php
require 'config.php';
require 'bts_lib.php';
require 'userfunctions.php';
function debuglog($contents)
{
	error_log($contents);
}
function verifyAndCompleteOpenOrder($orderArray)
{
	global $baseURL;
	global $relayURL;
	global $accountName;
	global $rpcUser;
	global $rpcPass;
	global $rpcPort;
	global $demoMode;
	global $hashSalt;
	$ret = array();
	$demo = FALSE;
	if($demoMode === "1" || $demoMode === 1 || $demoMode === TRUE || $demoMode === "true")
	{
		$demo = TRUE;
	}
	$response = btsVerifyOpenOrders($orderArray, $accountName, $rpcUser, $rpcPass, $rpcPort, $hashSalt, $demo);

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
	global $accountName;
	global $rpcUser;
	global $rpcPass;
	global $rpcPort;
	global $demoMode;
	global $hashSalt;
	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo';
	  return $ret;
	}
	$demo = FALSE;
	if($demoMode === "1" || $demoMode === 1 || $demoMode === TRUE || $demoMode === "true")
	{
		$demo = TRUE;
	}
	return btsVerifyOpenOrders($orderArray, $accountName, $rpcUser, $rpcPass, $rpcPort, $hashSalt, $demo);
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
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo';
	  return $ret;
	}

	if ($orderArray[0]['order_id'] !== $order_id) {
		$ret = array();
		$ret['error'] = 'Invalid Order ID';
		return $ret;
	}
	return $orderArray[0];
}
function completeOrder($memo, $order_id)
{
	global $baseURL;
	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo';
	  $ret['fallbackURL'] = $baseURL;
	  return $ret;
	}

	if ($orderArray[0]['order_id'] !== $order_id) {
		$ret = array();
		$ret['error'] = 'Invalid Order ID';
		$ret['fallbackURL'] = $baseURL;
		return $ret;
	}  
	$response = verifyAndCompleteOpenOrder($orderArray);
	$response['fallbackURL'] = $baseURL;
	return $response;
}
function cancelOrder($memo, $order_id)
{
	global $baseURL;
	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo';
	  $ret['fallbackURL'] = $baseURL;
	  return $ret;
	}

	if ($orderArray[0]['order_id'] !== $order_id) {
	  $ret = array();
	  $ret['error'] = 'Invalid Order ID';
	  $ret['fallbackURL'] = $baseURL;
	  return $ret;
	}	  
	$response = cancelOrderUser($orderArray[0]);
	$response['fallbackURL'] = $baseURL;
	return $response;
}
function getPaymentURLFromOrder($memo, $order_id)
{

	global $accountName;
	global $rpcUser;
	global $rpcPass;
	global $rpcPort;
	global $demoMode;
	global $hashSalt;
	$orderArray = getOrder($memo, $order_id);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Memo';
	  return $ret;
	}
	$order = $orderArray[0];
	$ret = array();
	$demo = FALSE;
	if($demoMode === "1" || $demoMode === 1 || $demoMode === TRUE || $demoMode === "true")
	{
		$demo = TRUE;
	}	
	$response = btsVerifyOpenOrders($orderArray, $accountName, $rpcUser, $rpcPass, $rpcPort, $hashSalt, $demo);

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
		$ret['url'] = btsCreatePaymentURL($accountName, $balance, $order['asset'], $memo);
	}
	return $ret;
}

function createOrder()
{
	return createOrderUser();
}
function cronJob($token)
{
	global $cronToken;
	if($token !== $cronToken)
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