<?php
/**
 * Backend Installation Helper for SQLite
 * Handles SQLite database setup and backend configuration
 */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$response = ['success' => false, 'message' => '', 'output' => ''];

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action !== 'install') {
        throw new Exception('Geçersiz işlem!');
    }

    $output = [];
    $backendDir = __DIR__ . '/backend';

    // 1. SQLite veritabanını kopyala
    $output[] = "📁 SQLite veritabanı kopyalanıyor...";
    
    $sourceSqlite = __DIR__ . '/database.sqlite';
    $targetSqlite = $backendDir . '/config/stok_yonetim.db';

    if (!file_exists($sourceSqlite)) {
        throw new Exception('SQLite veritabanı dosyası bulunamadı: database.sqlite');
    }

    // Backend config dizinini oluştur
    if (!is_dir($backendDir . '/config')) {
        mkdir($backendDir . '/config', 0755, true);
    }

    // SQLite dosyasını kopyala
    if (!copy($sourceSqlite, $targetSqlite)) {
        throw new Exception('SQLite veritabanı kopyalanamadı!');
    }

    $output[] = "✅ SQLite veritabanı kopyalandı: " . basename($targetSqlite);

    // 2. .env dosyasını oluştur
    $output[] = "📝 .env dosyası oluşturuluyor...";

    $envContent = "NODE_ENV=production\n";
    $envContent .= "PORT=5001\n\n";
    $envContent .= "# SQLite Configuration\n";
    $envContent .= "DB_TYPE=sqlite\n";
    $envContent .= "DB_PATH=" . $targetSqlite . "\n\n";
    $envContent .= "# JWT Configuration\n";
    $envContent .= "JWT_SECRET=" . bin2hex(random_bytes(32)) . "\n";
    $envContent .= "JWT_REFRESH_SECRET=" . bin2hex(random_bytes(32)) . "\n";
    $envContent .= "JWT_EXPIRE=7d\n";
    $envContent .= "JWT_REFRESH_EXPIRE=30d\n\n";
    
    // Frontend URL'i otomatik belirle
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $frontendUrl = $protocol . $host;
    $envContent .= "FRONTEND_URL=$frontendUrl\n";

    $envFile = $backendDir . '/.env';
    if (!file_put_contents($envFile, $envContent)) {
        throw new Exception('.env dosyası oluşturulamadı!');
    }

    $output[] = "✅ .env dosyası oluşturuldu";

    // 3. Gerekli dizinleri oluştur
    $output[] = "📁 Gerekli dizinler oluşturuluyor...";

    $requiredDirs = [
        $backendDir . '/uploads',
        $backendDir . '/logs',
        $backendDir . '/data'
    ];

    foreach ($requiredDirs as $dir) {
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new Exception("Dizin oluşturulamadı: $dir");
            }
            $output[] = "✅ Dizin oluşturuldu: " . basename($dir);
        }
    }

    // 4. NPM paketlerini kontrol et
    $output[] = "📦 NPM paketleri kontrol ediliyor...";

    if (!file_exists($backendDir . '/node_modules')) {
        $output[] = "⏳ NPM paketleri kuruluyor... (Bu işlem birkaç dakika sürebilir)";
        
        $currentDir = getcwd();
        chdir($backendDir);
        
        exec('npm install --production 2>&1', $npmOutput, $npmReturn);
        
        chdir($currentDir);

        if ($npmReturn !== 0) {
            $output[] = "⚠️ NPM kurulum uyarısı: " . implode("\n", $npmOutput);
            $output[] = "💡 Manuel kurulum: cd backend && npm install";
        } else {
            $output[] = "✅ NPM paketleri kuruldu";
        }
    } else {
        $output[] = "✅ NPM paketleri zaten kurulu";
    }

    // 5. Kurulum tamamlandı (install lock oluşturulmaz)
    $output[] = "✅ Kurulum tamamlandı - install.php'yi silebilirsiniz";

    // 6. Demo kullanıcı bilgilerini kontrol et
    $output[] = "👤 Demo kullanıcı kontrol ediliyor...";
    
    try {
        $pdo = new PDO('sqlite:' . $targetSqlite);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE email = 'admin@stok.com'");
        $userExists = $stmt->fetchColumn() > 0;
        
        if ($userExists) {
            $output[] = "✅ Demo kullanıcı mevcut: admin@stok.com / admin123";
        } else {
            $output[] = "⚠️ Demo kullanıcı bulunamadı - backend ilk çalıştırıldığında oluşturulacak";
        }
    } catch (Exception $e) {
        $output[] = "⚠️ Demo kullanıcı kontrolü yapılamadı: " . $e->getMessage();
    }

    $response['success'] = true;
    $response['message'] = 'SQLite kurulumu başarıyla tamamlandı!';
    $response['output'] = implode("\n", $output);

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
    $response['output'] = implode("\n", $output) . "\n\nHATA: " . $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
