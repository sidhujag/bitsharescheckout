<?php
require 'config.php';
require 'bts_lib.php';
require 'userfunctions.php';
function debuglog($contents)
{
	error_log($contents);
}
function verifyOpenOrder($memo)
{
	global $accountName;
	global $rpcUser;
	global $rpcPass;
	global $rpcPort;
	global $demoMode;
	global $hashSalt;
	$orderArray = getOrder($memo);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Order Hash';
	  return $ret;
	}
	$demo = FALSE;
	if($demoMode === "1" || $demoMode === 1 || $demoMode === TRUE || $demoMode === "true")
	{
		$demo = TRUE;
	}
	return btsVerifyOpenOrders($orderArray, $accountName, $rpcUser, $rpcPass, $rpcPort, $hashSalt, $demo);
}
function lookupOrder($memo, $order_id)
{
	$orderCompleteArray = getOrderComplete($memo);
	if(count($orderCompleteArray) > 0)
	{
	  $ret = array();
	  $ret['error'] = 'This order has already been paid';
	  return $ret;
	}

	$orderArray = getOrder($memo);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Order Hash';
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
	global $relayUrl;
	global $accountName;
	global $rpcUser;
	global $rpcPass;
	global $rpcPort;
	global $demoMode;
	global $hashSalt;
	$orderArray = getOrder($memo);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Order Hash';
	  return $ret;
	}

	if ($orderArray[0]['order_id'] !== $order_id) {
		$ret = array();
		$ret['error'] = 'Invalid Order ID';
		return $ret;
	}
	$demo = FALSE;
	if($demoMode === "1" || $demoMode === 1 || $demoMode === TRUE || $demoMode === "true")
	{
		$demo = TRUE;
	}
	$response = btsVerifyOpenOrders($orderArray, $accountName, $rpcUser, $rpcPass, $rpcPort, $hashSalt, $demo);

	if(array_key_exists('error', $response))
	{
	  $ret = array();
	  $ret['error'] = 'Could not verify order. Please try again';
	  return $ret;
	}
	return completeOrderUser($response);
}
function cancelOrder($memo)
{
	global $baseURL;
	$orderArray = getOrder($memo);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['url'] = $baseURL;
	  return $ret;
	}
	$response = cancelOrderUser($orderArray[0]);
	return $response;
}
function getPaymentURLFromOrder($memo, $balance)
{
	global $accountName;
	$orderArray = getOrder($memo);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Order Hash';
	  return $ret;
	}
	$order = $orderArray[0];
	return btsCreateInvoice($accountName, $order['order_id'], $balance, $order['total'], $order['asset'], $order['memo']);
}

function createOrder()
{
	return createOrderUser();
}
function cronJob($token)
{
	global $relayUrl;
	global $accountName;
	global $rpcUser;
	global $rpcPass;
	global $rpcPort;
	global $demoMode;
	global $hashSalt;
	global $cronToken;
	if($token !== $cronToken)
	{
		return 'Invalid cronjob token!';
	}
	$openOrderList = getOpenOrders();
	if(count($openOrderList) <= 0)
	{
	  return 'No open orders found!';
	}

	$demo = FALSE;
	if($demoMode === "1" || $demoMode === 1 || $demoMode === TRUE || $demoMode === "true")
	{
		$demo = TRUE;
	}
	$response   = btsVerifyOpenOrders($openOrderList, $accountName, $rpcUser, $rpcPass, $rpcPort, $hashSalt, $demo);
	if(array_key_exists('error', $response))
	{
		return $response;
	}
	return completeOrderUser($response);
}
?>