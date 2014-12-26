<?php
require '../../systemfunctions.php';
$response = cronJob($_REQUEST['token']);
die($response);
?>