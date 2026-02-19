<?php
header('Content-Type: application/json');
require_once 'config.php';

$conn = getDBConnection();

$search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
$limit  = isset($_GET['limit'])  ? intval($_GET['limit'])  : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

$sql = "SELECT 
            p.player_id,
            p.player_name,
            p.country,
            p.role,
            r.runs_scored,
            r.fours,
            r.sixes,
            r.strike_rate,
            r.centuries
        FROM players p
        INNER JOIN runs r ON p.player_id = r.player_id";

if ($search != '') {
    $sql .= " WHERE p.player_name LIKE '%" . $conn->real_escape_string($search) . "%' 
              OR p.country LIKE '%" . $conn->real_escape_string($search) . "%'";
}

$sql .= " ORDER BY r.runs_scored DESC";
$sql .= " LIMIT $limit OFFSET $offset";

$result = $conn->query($sql);

$players = array();
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $players[] = $row;
    }
}

$countSql = "SELECT COUNT(*) as total FROM players p INNER JOIN runs r ON p.player_id = r.player_id";
if ($search != '') {
    $countSql .= " WHERE p.player_name LIKE '%" . $conn->real_escape_string($search) . "%' 
                   OR p.country LIKE '%" . $conn->real_escape_string($search) . "%'";
}
$countResult = $conn->query($countSql);
$totalCount  = $countResult ? $countResult->fetch_assoc()['total'] : 0;

echo json_encode([
    'players' => $players,
    'total'   => $totalCount,
    'showing' => count($players),
    'offset'  => $offset,
    'hasMore' => ($offset + count($players)) < $totalCount
]);

$conn->close();
?>