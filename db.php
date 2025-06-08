<?php
$host = 'localhost';        // Adresse du serveur
$user = 'root';             // Nom d'utilisateur
$password = '';             // Mot de passe
$dbname = 'meteo_db';

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Échec de la connexion : " . $conn->connect_error);
}
?>
