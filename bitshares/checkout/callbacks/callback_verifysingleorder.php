<?php
require '../../systemfunctions.php';
$memo = $_POST['memo'];
$response = verifyOpenOrder($memo);
die(json_encode($response));
?>