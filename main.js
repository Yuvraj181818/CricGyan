// =============================================
//  CricGyan — main.js
// =============================================

// ---------- PAGE NAVIGATION ----------

function showPage(pageId, clickedLink) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Remove active from all nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    // Show requested page
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    // Load data if needed
    if (pageId === 'records') loadRecords();

    // Mark link active
    if (clickedLink) clickedLink.classList.add('active');

    // Scroll to top so content isn't hidden under navbar
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHome(clickedLink) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show home wrapper
    const homeWrapper = document.getElementById('home-wrapper');
    if (homeWrapper) homeWrapper.classList.add('active');

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if (clickedLink) clickedLink.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- CLOSE DROPDOWN ON OUTSIDE CLICK ----------

document.addEventListener('click', function (event) {
    const statsContainer   = document.querySelector('.stats-search-container');
    const playerResults    = document.getElementById('playerSearchResults');

    if (playerResults && statsContainer && !statsContainer.contains(event.target)) {
        playerResults.classList.remove('show');
    }
});

// =============================================
//  PLAYER SEARCH (Stats page)
// =============================================

let searchTimeout;

function searchPlayers() {
    const input      = document.getElementById('playerSearchInput');
    const searchTerm = input.value.trim();
    const resultsDiv = document.getElementById('playerSearchResults');

    clearTimeout(searchTimeout);

    if (searchTerm.length === 0) {
        resultsDiv.classList.remove('show');
        return;
    }

    searchTimeout = setTimeout(() => fetchPlayerSuggestions(searchTerm), 300);
}

async function fetchPlayerSuggestions(searchTerm) {
    const resultsDiv = document.getElementById('playerSearchResults');

    try {
        const response = await fetch(`search_players.php?term=${encodeURIComponent(searchTerm)}`);
        const players  = await response.json();

        resultsDiv.innerHTML = '';

        if (players.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">No players found</div>';
            resultsDiv.classList.add('show');
            return;
        }

        players.forEach(player => {
            const item = document.createElement('div');
            item.className = 'player-result-item';
            item.innerHTML = `
                <div class="player-result-name">${player.name}</div>
                <div class="player-result-details">
                    ${player.country} &bull; ${player.role} &bull;
                    <span class="player-result-runs">${Number(player.runs).toLocaleString()} runs</span>
                </div>
            `;
            item.onclick = () => showPlayerDetails(player.value);
            resultsDiv.appendChild(item);
        });

        resultsDiv.classList.add('show');

    } catch (error) {
        console.error('Error fetching players:', error);
        resultsDiv.innerHTML = '<div class="no-results">Error loading players</div>';
        resultsDiv.classList.add('show');
    }
}

async function showPlayerDetails(playerId) {
    try {
        const response = await fetch(`get_player_details.php?id=${playerId}`);
        const player   = await response.json();

        if (!player || player.error) { alert('Player not found'); return; }

        const formatNumber  = v => (parseInt(v)   || 0).toLocaleString();
        const formatDecimal = v => (parseFloat(v)  || 0).toFixed(2);

        document.getElementById('playerName').textContent        = player.player_name || 'Unknown';
        document.getElementById('playerCountry').textContent     = player.country     || 'Unknown';
        document.getElementById('playerRole').textContent        = player.role        || 'Unknown';
        document.getElementById('playerRuns').textContent        = formatNumber(player.runs_scored);
        document.getElementById('playerCenturies').textContent   = player.centuries   || '0';
        document.getElementById('playerFours').textContent       = formatNumber(player.fours);
        document.getElementById('playerSixes').textContent       = formatNumber(player.sixes);
        document.getElementById('playerStrikeRate').textContent  = formatDecimal(player.strike_rate);

        document.getElementById('playerCard').style.display = 'block';
        document.getElementById('playerSearchResults').classList.remove('show');

    } catch (error) {
        console.error('Error fetching player details:', error);
        alert('Error loading player details');
    }
}

function closePlayerCard() {
    document.getElementById('playerCard').style.display = 'none';
}

// =============================================
//  RECORDS PAGE
// =============================================

async function loadRecords() {
    const tbody = document.querySelector('#records tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">Loading records…</td></tr>';

    try {
        const response = await fetch('get_records.php?limit=1000&offset=0');
        const data     = await response.json();

        tbody.innerHTML = '';

        if (!data.players || data.players.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No records found</td></tr>';
            return;
        }

        data.players.forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="player-name-link"
                    onclick="viewPlayerFromRecords(${player.player_id})"
                    style="cursor:pointer; color:#3b82f6; text-decoration:underline;">
                    ${player.player_name}
                </td>
                <td>${Number(player.runs_scored).toLocaleString()}</td>
                <td>${Number(player.fours).toLocaleString()}</td>
                <td>${Number(player.sixes).toLocaleString()}</td>
                <td>${player.centuries}</td>
                <td>${player.strike_rate}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading records:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#ef4444;">Error loading data. Please check database connection.</td></tr>';
    }
}

function viewPlayerFromRecords(playerId) {
    showPage('stats', document.querySelector('.nav-link[onclick*="stats"]'));
    setTimeout(() => showPlayerDetails(playerId), 100);
}

// =============================================
//  INIT
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    // Show home on first load
    showHome(document.querySelector('.nav-link'));
});