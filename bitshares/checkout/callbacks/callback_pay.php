<?php
require '../../systemfunctions.php';
$memo = $_POST['memo'];
$balance = $_POST['balance'];
$order_id = $_POST['order_id'];
$response = getPaymentURLFromOrder($memo, $order_id, $balance);
die(json_encode($response));
?>