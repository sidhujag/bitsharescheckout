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
	$response = btsVerifyOpenOrders($orderArray, $accountName, $rpcUser, $rpcPass, $rpcPort, $hashSalt, $demo);
	if(count($response) <= 0)
	{
		return array();
	}
	else
	{
		return json_encode($response);
	}
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
	  return json_encode($ret);
	}

	if ($orderArray[0]['order_id'] !== $order_id) {
		$ret = array();
		$ret['error'] = 'Invalid Order ID. Could not complete your order';
		return json_encode($ret);
	}
	return json_encode($orderArray[0]);
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
	  return json_encode($ret);
	}

	if ($orderArray[0]['order_id'] !== $order_id) {
		$ret = array();
		$ret['error'] = 'Invalid Order ID. Could not complete your order';
		return json_encode($ret);
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
	  return json_encode($ret);
	}
	$response = completeOrderUser($response);
	if(!isset($response['url']))
	{
		return array();
	}
	return json_encode($response);
}
function cancelOrder($memo)
{
	global $baseUrl;
	$orderArray = getOrder($memo);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['url'] = $baseUrl;
	  return json_encode($ret);
	}
	$response = cancelOrderUser($orderArray[0]);
	return json_encode($response);
}
function getPaymentURLFromOrder($memo, $balance)
{
	$orderArray = getOrder($memo);
	if(count($orderArray) <= 0)
	{
	  $ret = array();
	  $ret['error'] = 'Could not find this order in the system, please review the Order ID and Order Hash';
	  return json_encode($ret);
	}
	$order = $orderArray[0];
	return json_encode(btsCreateInvoice($order['account'], $order['order_id'], $balance, $order['total'], $order['asset'], $order['memo']));
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
		return json_encode($response);
	}
	$response = completeOrderUser($response);
	if(!isset($response['url']))
	{
		return array();
	}
	return json_encode($response);
}
?>