<?php
global $conn;
require 'db.php';

$conn->query("DELETE FROM historique");

echo "Historique effacé.";

$conn->close();
?>
