<?php
global $conn;
require 'db.php';

$result = $conn->query("SELECT * FROM historique ORDER BY date_recherche DESC LIMIT 7");

$donnees = [];

while ($row = $result->fetch_assoc()) {
    $donnees[] = $row;
}

header('Content-Type: application/json');
echo json_encode($donnees);

$conn->close();
?>
