<?php
require '../../systemfunctions.php';
$memo = $_POST['memo'];
$response = cancelOrder($memo);
die($response);
?>