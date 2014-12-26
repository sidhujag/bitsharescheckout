<?php
require '../../systemfunctions.php';
$memo = $_POST['memo'];
$order_id = $_POST['order_id'];
$order = lookupOrder($memo, $order_id);
die($order);  
?>