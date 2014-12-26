<?php
require '../../systemfunctions.php';
$order_id = $_POST['order_id'];
$memo = $_POST['memo'];
$response = completeOrder($memo, $order_id);
die($ret);
?>