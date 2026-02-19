<?php
header('Content-Type: application/json');

require_once 'config.php';

$conn = getDBConnection();

$searchTerm = isset($_GET['term']) ? trim($_GET['term']) : '';

if (empty($searchTerm)) {
    echo json_encode([]);
    exit();
}

$searchPattern = '%' . $conn->real_escape_string($searchTerm) . '%';

$sql = "SELECT p.player_name as label, p.player_id as value, p.country, p.role, r.runs_scored FROM players p LEFT JOIN runs r ON p.player_id = r.player_id WHERE p.player_name LIKE '$searchPattern' OR p.country LIKE '$searchPattern' ORDER BY r.runs_scored DESC LIMIT 10";

$result = $conn->query($sql);

$suggestions = array();

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $suggestions[] = array(
            'label' => $row['label'] . ' (' . $row['country'] . ')',
            'value' => $row['value'],
            'name' => $row['label'],
            'country' => $row['country'],
            'role' => $row['role'],
            'runs' => $row['runs_scored']
        );
    }
}

echo json_encode($suggestions);

$conn->close();
?>