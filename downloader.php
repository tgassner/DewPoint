<?php
// very dangerous!!!!!!
$url = (isset($_GET['url']) && !empty($_GET['url'])) ? $_GET['url'] : die;
$json = file_get_contents($url);
echo($json);
?>


