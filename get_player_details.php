<?php
header('Content-Type: application/json');
require_once 'config.php';

$conn = getDBConnection();

$playerId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($playerId === 0) {
    echo json_encode(['error' => 'Invalid player ID']);
    exit();
}

$stmt = $conn->prepare("SELECT p.player_id, p.player_name, p.country, p.role, r.runs_scored, r.fours, r.sixes, r.strike_rate, r.centuries FROM players p INNER JOIN runs r ON p.player_id = r.player_id WHERE p.player_id = ?");
$stmt->bind_param("i", $playerId);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $player = $result->fetch_assoc();
    echo json_encode($player);
} else {
    echo json_encode(['error' => 'Player not found']);
}

$conn->close();
?>