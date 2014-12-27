<?php
require '../../systemfunctions.php';
$memo = $_POST['memo'];
$order_id = $_POST['order_id'];
$response = cancelOrder($memo, $order_id);
die(json_encode($response));
?>