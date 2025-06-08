<?php
global $conn;
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ville = $_POST['ville'] ?? '';
    $description = $_POST['description'] ?? '';
    $temperature = $_POST['temperature'] ?? '';
    $pression = $_POST['pression'] ?? '';
    $humidite = $_POST['humidite'] ?? '';

    $stmt = $conn->prepare("INSERT INTO historique (ville, description, temperature, pression, humidite, date_recherche) VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssddd", $ville, $description, $temperature, $pression, $humidite);
    $stmt->execute();
    $stmt->close();
}

$conn->close();
?>
