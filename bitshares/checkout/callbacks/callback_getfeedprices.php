<?php
require '../../systemfunctions.php';
$response = getFeedPrices();
die(json_encode($response));
?>