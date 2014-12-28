<?php
echo 'Redirecting to Bitshares payment gateway...'.PHP_EOL;
require 'systemfunctions.php';

$response = createOrder();
if(isset($response['accountName']))
{
	$post = array(
		'accountName'     => $response['accountName'],
		'order_id'     => $response['order_id'],
		'memo'     => $response['memo']
	);

	$rbimg = 'checkout/img/robohash.png';
	if(!file_exists($img))
	{
	  $rbUrl = 'http://robohash.org/'.$response['accountName'].'?size=100x100';
	  file_put_contents($rbimg, file_get_contents($rbUrl));
	}    


	$urlParams = '?';
	$index = 0;
	foreach ($post as $key => $value) {
		$index++;
		if($index > 1)
		{
			$urlParams .= '&';
		}
		$urlParams .= $key.'='.$value;
	}
	header('refresh:3;url=checkout/index.html'.$urlParams );
}
else
{
	echo 'There was a problem creating a new order!'.PHP_EOL;
}
?>