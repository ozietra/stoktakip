<?php
/**
 * Backend Başlatma Helper
 * PM2 ile backend'i otomatik başlatır
 */

header('Content-Type: application/json');

$response = ['success' => false, 'message' => '', 'output' => ''];

try {
    $backendDir = __DIR__ . '/backend';

    // Backend dizininin varlığını kontrol et
    if (!is_dir($backendDir)) {
        throw new Exception('Backend dizini bulunamadı!');
    }

    // Node.js ve npm kontrolü
    exec('node --version 2>&1', $nodeOutput, $nodeReturn);
    if ($nodeReturn !== 0) {
        throw new Exception('Node.js kurulu değil! Lütfen Node.js kurun: https://nodejs.org');
    }

    exec('npm --version 2>&1', $npmOutput, $npmReturn);
    if ($npmReturn !== 0) {
        throw new Exception('NPM kurulu değil!');
    }

    // PM2 kontrolü
    exec('pm2 --version 2>&1', $pm2Output, $pm2Return);
    if ($pm2Return !== 0) {
        // PM2 kurulu değilse global olarak kur
        $response['message'] = 'PM2 kuruluyor... (Bu işlem birkaç dakika sürebilir)';
        exec('npm install -g pm2 2>&1', $installOutput, $installReturn);

        if ($installReturn !== 0) {
            throw new Exception('PM2 kurulumu başarısız! Manuel olarak kurun: npm install -g pm2');
        }
    }

    // Backend dependencies kontrolü
    if (!file_exists($backendDir . '/node_modules')) {
        $response['message'] = 'Backend bağımlılıkları kuruluyor...';
        chdir($backendDir);
        exec('npm install --production 2>&1', $installOutput, $installReturn);

        if ($installReturn !== 0) {
            throw new Exception('NPM paketleri kurulamadı! Manuel olarak kurun: cd backend && npm install');
        }
    }

    // Logs klasörünü oluştur
    $logsDir = $backendDir . '/logs';
    if (!is_dir($logsDir)) {
        mkdir($logsDir, 0755, true);
    }

    // PM2 ile backend'i başlat/restart
    chdir($backendDir);

    // Önce mevcut process'i durdur (varsa)
    exec('pm2 delete stok-yonetim-backend 2>&1', $deleteOutput);

    // Yeni process'i başlat
    exec('pm2 start ecosystem.config.js 2>&1', $output, $return);

    if ($return !== 0) {
        throw new Exception('PM2 başlatma hatası: ' . implode("\n", $output));
    }

    // PM2'yi kaydet (sistem yeniden başladığında otomatik başlasın)
    exec('pm2 save 2>&1', $saveOutput);

    // Startup script oluştur (opsiyonel - root gerektirir)
    // exec('pm2 startup 2>&1', $startupOutput);

    sleep(2); // Backend'in başlaması için bekle

    // Backend'in çalışıp çalışmadığını kontrol et
    $ch = curl_init('http://localhost:5001/api/health');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $healthCheck = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $response['success'] = true;
        $response['message'] = 'Backend başarıyla başlatıldı!';
        $response['output'] = implode("\n", $output);
    } else {
        // Backend başlamış olabilir ama henüz hazır değil
        $response['success'] = true;
        $response['message'] = 'Backend başlatılıyor... (Birkaç saniye içinde hazır olacak)';
        $response['output'] = implode("\n", $output);
        $response['warning'] = 'Backend henüz tam olarak hazır değil. Lütfen birkaç saniye bekleyin.';
    }

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
