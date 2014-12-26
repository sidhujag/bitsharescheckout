<?php
require '../../systemfunctions.php';
$memo = $_POST['memo'];
$balance = $_POST['balance'];
$response = getPaymentURLFromOrder($memo, $balance);
die($response);
?>