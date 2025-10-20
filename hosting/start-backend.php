<?php
/**
 * Backend Başlatma Helper - SQLite Version
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

    // Install lock kontrolü kaldırıldı - kurulum sonrası install.php silinecek

    // Node.js ve npm kontrolü
    exec('node --version 2>&1', $nodeOutput, $nodeReturn);
    if ($nodeReturn !== 0) {
        throw new Exception('Node.js kurulu değil! Lütfen Node.js kurun: https://nodejs.org');
    }

    exec('npm --version 2>&1', $npmOutput, $npmReturn);
    if ($npmReturn !== 0) {
        throw new Exception('NPM kurulu değil!');
    }

    // PM2 kontrolü ve kurulumu
    exec('pm2 --version 2>&1', $pm2Output, $pm2Return);
    if ($pm2Return !== 0) {
        $response['message'] = 'PM2 kuruluyor... (Bu işlem birkaç dakika sürebilir)';
        exec('npm install -g pm2 2>&1', $installOutput, $installReturn);

        if ($installReturn !== 0) {
            // PM2 global kurulum başarısız, local kurulum dene
            chdir($backendDir);
            exec('npm install pm2 2>&1', $localInstallOutput, $localInstallReturn);
            
            if ($localInstallReturn !== 0) {
                throw new Exception('PM2 kurulumu başarısız! Manuel olarak kurun: npm install -g pm2');
            }
            
            // Local PM2 kullan
            $pm2Command = './node_modules/.bin/pm2';
        } else {
            $pm2Command = 'pm2';
        }
    } else {
        $pm2Command = 'pm2';
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
    exec("$pm2Command delete stok-yonetim-backend 2>&1", $deleteOutput);

    // SQLite için environment variables ayarla
    $envVars = [
        'NODE_ENV=production',
        'DB_TYPE=sqlite',
        'PORT=5001'
    ];

    // Ecosystem config dosyası var mı kontrol et
    if (file_exists('ecosystem.config.js')) {
        // Ecosystem config ile başlat
        exec("$pm2Command start ecosystem.config.js 2>&1", $output, $return);
    } else {
        // Direkt server.js ile başlat
        $envString = implode(' ', $envVars);
        exec("$envString $pm2Command start server.js --name stok-yonetim-backend 2>&1", $output, $return);
    }

    if ($return !== 0) {
        // PM2 başarısız, nohup ile dene
        $response['message'] = 'PM2 başarısız, alternatif yöntem deneniyor...';
        
        $envString = implode(' ', $envVars);
        exec("$envString nohup node server.js > logs/backend.log 2>&1 & echo $!", $nohupOutput, $nohupReturn);
        
        if ($nohupReturn === 0) {
            $output = array_merge($output, $nohupOutput);
            $response['message'] = 'Backend nohup ile başlatıldı (PID: ' . trim($nohupOutput[0]) . ')';
        } else {
            throw new Exception('Backend başlatma hatası: ' . implode("\n", $output));
        }
    } else {
        // PM2'yi kaydet (sistem yeniden başladığında otomatik başlasın)
        exec("$pm2Command save 2>&1", $saveOutput);
    }

    sleep(3); // Backend'in başlaması için bekle

    // Backend'in çalışıp çalışmadığını kontrol et
    $healthUrls = [
        'http://localhost:5001/api/health',
        'http://127.0.0.1:5001/api/health',
        'http://localhost:5001/',
        'http://127.0.0.1:5001/'
    ];

    $backendRunning = false;
    foreach ($healthUrls as $url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
        $healthCheck = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 || $httpCode === 404) { // 404 da kabul edilebilir (route yok ama server çalışıyor)
            $backendRunning = true;
            break;
        }
    }

    if ($backendRunning) {
        $response['success'] = true;
        $response['message'] = 'Backend başarıyla başlatıldı ve Port 5001\'de çalışıyor!';
        $response['output'] = implode("\n", $output);
    } else {
        // Backend başlamış olabilir ama henüz hazır değil
        $response['success'] = true;
        $response['message'] = 'Backend başlatıldı, hazır olmaya devam ediyor...';
        $response['output'] = implode("\n", $output);
        $response['warning'] = 'Backend henüz tam olarak hazır değil. Lütfen 10-15 saniye bekleyin ve sayfayı yenileyin.';
    }

    // Process listesini ekle
    exec("$pm2Command list 2>&1", $listOutput);
    if (!empty($listOutput)) {
        $response['output'] .= "\n\nÇalışan Process'ler:\n" . implode("\n", $listOutput);
    }

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
    
    // Debug bilgileri ekle
    $response['debug'] = [
        'backend_dir' => $backendDir ?? 'undefined',
        'current_dir' => getcwd(),
        'node_version' => $nodeOutput[0] ?? 'unknown',
        'npm_version' => $npmOutput[0] ?? 'unknown'
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
