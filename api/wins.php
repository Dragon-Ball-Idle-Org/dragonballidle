<?php
// public_html/api/wins.php

// Timezone para “virar” meia-noite em BRT
date_default_timezone_set('America/Sao_Paulo');

// CORS básico (se tudo roda no mesmo domínio, pode remover)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// Força no-cache (evita CDN/Browser manter valor velho)
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// pasta onde salvaremos os contadores diários
$baseDir = __DIR__ . '/../data/wins';
if (!is_dir($baseDir)) {
  @mkdir($baseDir, 0755, true);
}

// data “chave do dia” (YYYY-MM-DD) — aceita query ?date=2025-10-07, senão usa hoje
$date = isset($_GET['date']) ? $_GET['date'] : null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $raw = file_get_contents('php://input');
  $json = json_decode($raw ?: '{}', true);
  if (isset($json['date'])) $date = $json['date'];
}

if (!$date) $date = date('Y-m-d');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid date']);
  exit;
}

$file = $baseDir . '/' . $date . '.json';

function readWins($file) {
  if (!file_exists($file)) return 0;
  $data = @file_get_contents($file);
  if ($data === false) return 0;
  $obj = json_decode($data, true);
  return isset($obj['wins']) ? intval($obj['wins']) : 0;
}

function writeWinsAtomic($file, $wins) {
  $tmp = $file . '.tmp';
  $payload = json_encode(['date' => basename($file, '.json'), 'wins' => $wins], JSON_UNESCAPED_UNICODE);
  // grava atômico: write tmp -> rename
  if (file_put_contents($tmp, $payload, LOCK_EX) === false) return false;
  return rename($tmp, $file);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $wins = readWins($file);
  echo json_encode(['date' => $date, 'wins' => $wins], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // delta padrão = +1
  $raw = file_get_contents('php://input');
  $json = json_decode($raw ?: '{}', true);
  $delta = isset($json['delta']) ? intval($json['delta']) : 1;

  // file lock cooperativo
  $fp = fopen($file, 'c+'); // cria se não existir
  if ($fp === false) {
    http_response_code(500);
    echo json_encode(['error' => 'cannot open']);
    exit;
  }
  // trava exclusiva
  if (flock($fp, LOCK_EX)) {
    // lê o conteúdo atual direto do disco
    $current = readWins($file);
    $new = max(0, $current + $delta);

    // grava de forma atômica (fora do handle travado)
    $ok = writeWinsAtomic($file, $new);

    // libera lock
    flock($fp, LOCK_UN);
    fclose($fp);

    if (!$ok) {
      http_response_code(500);
      echo json_encode(['error' => 'write failed']);
      exit;
    }

    echo json_encode(['date' => $date, 'wins' => $new], JSON_UNESCAPED_UNICODE);
    exit;
  } else {
    fclose($fp);
    http_response_code(423);
    echo json_encode(['error' => 'locked']);
    exit;
  }
}

// Se cair aqui:
http_response_code(405);
echo json_encode(['error' => 'method not allowed']);
