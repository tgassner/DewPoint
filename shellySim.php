<?php

if (isset($_GET["d"]) && $_GET["d"] != "") {
    header('Content-Type: application/json; charset=utf-8');
    $d = $_GET["d"];
    switch($d) {
        case "TO" : echo("{\"tC\":" . (rand(-100, 400) / 10) . "}");
                    break;
        case "TI" : echo("{\"tC\":" . (rand(0, 250) / 10) . "}");
                    break;
        case "HO" : echo("{\"rh\":" . (rand(100, 800) / 10) . "}");
                    break;
        case "HI" : echo("{\"rh\":" . (rand(100, 800) / 10) . "}");
                    break;
        default: echo("Gnade dir Gott deluxe!!");
                    break;
    }

} else {
    echo("gnade dir Gott!!");
}

?>