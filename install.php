<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stok Yönetim Sistemi - Kurulum</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 700px;
            width: 100%;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 14px;
        }

        .progress {
            display: flex;
            justify-content: space-between;
            padding: 30px 40px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
        }

        .step {
            flex: 1;
            text-align: center;
            position: relative;
            padding: 0 10px;
        }

        .step::after {
            content: '';
            position: absolute;
            top: 15px;
            left: 50%;
            width: 100%;
            height: 2px;
            background: #e0e0e0;
            z-index: 0;
        }

        .step:last-child::after {
            display: none;
        }

        .step-number {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #e0e0e0;
            color: #666;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            position: relative;
            z-index: 1;
            margin-bottom: 8px;
        }

        .step.active .step-number {
            background: #667eea;
            color: white;
        }

        .step.completed .step-number {
            background: #10b981;
            color: white;
        }

        .step-label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }

        .content {
            padding: 40px;
        }

        .form-group {
            margin-bottom: 25px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }

        input, select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;
        }

        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .alert {
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            font-size: 14px;
        }

        .alert-error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }

        .alert-success {
            background: #efe;
            color: #3c3;
            border: 1px solid #cfc;
        }

        .alert-warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }

        .requirements {
            list-style: none;
        }

        .requirements li {
            padding: 12px;
            margin-bottom: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .check-ok {
            color: #10b981;
            font-weight: bold;
        }

        .check-fail {
            color: #ef4444;
            font-weight: bold;
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .completion {
            text-align: center;
            padding: 40px 0;
        }

        .completion-icon {
            font-size: 80px;
            margin-bottom: 20px;
        }

        .completion h2 {
            color: #10b981;
            margin-bottom: 15px;
            font-size: 24px;
        }

        .completion p {
            color: #666;
            margin-bottom: 10px;
            line-height: 1.6;
        }

        .btn-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            margin-top: 30px;
        }

        .small-text {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
    </style>
</head>
<body>
<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Kurulum kilidi kontrolü
$lockFile = __DIR__ . '/backend/.install_lock';
if (file_exists($lockFile) && !isset($_GET['force'])) {
    echo '<div class="container">
            <div class="header">
                <h1>⚠️ Kurulum Tamamlanmış</h1>
            </div>
            <div class="content">
                <div class="alert alert-warning">
                    <strong>Dikkat!</strong> Bu sistem zaten kurulmuş görünüyor.
                </div>
                <p>Eğer yeniden kurulum yapmak istiyorsanız, <code>backend/.install_lock</code> dosyasını silin.</p>
                <a href="index.html" class="btn" style="display: inline-block; text-decoration: none; margin-top: 20px;">Ana Sayfaya Git</a>
            </div>
          </div>';
    exit;
}

$currentStep = isset($_GET['step']) ? (int)$_GET['step'] : 1;

// Adım 1: Sistem Gereksinimleri
if ($currentStep === 1) {
    $phpVersion = PHP_VERSION;
    $requiredExtensions = [
        'pdo' => 'PDO Extension',
        'pdo_mysql' => 'PDO MySQL Driver',
        'json' => 'JSON Extension',
        'mbstring' => 'Multibyte String',
        'curl' => 'cURL Extension',
        'openssl' => 'OpenSSL Extension'
    ];

    $checks = [];
    $allPassed = true;

    // PHP versiyon kontrolü
    $phpOk = version_compare($phpVersion, '7.4.0', '>=');
    $checks[] = [
        'name' => 'PHP Versiyonu (≥ 7.4)',
        'value' => PHP_VERSION,
        'status' => $phpOk
    ];

    if (!$phpOk) $allPassed = false;

    // Extension kontrolleri
    foreach ($requiredExtensions as $ext => $name) {
        $status = extension_loaded($ext);
        $checks[] = [
            'name' => $name,
            'value' => $status ? 'Yüklü' : 'Eksik',
            'status' => $status
        ];
        if (!$status) $allPassed = false;
    }

    // Yazma izinleri
    $dirs = ['backend', 'backend/uploads'];
    foreach ($dirs as $dir) {
        $path = __DIR__ . '/' . $dir;
        $writable = is_writable($path);
        $checks[] = [
            'name' => "$dir dizini yazılabilir",
            'value' => $writable ? 'Evet' : 'Hayır',
            'status' => $writable
        ];
        if (!$writable) $allPassed = false;
    }

    echo '<div class="container">
            <div class="header">
                <h1>📦 Stok Yönetim Sistemi</h1>
                <p>Otomatik Kurulum Sihirbazı</p>
            </div>

            <div class="progress">
                <div class="step active">
                    <div class="step-number">1</div>
                    <div class="step-label">Gereksinimler</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-label">Veritabanı</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-label">Admin</div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-label">Tamamlandı</div>
                </div>
            </div>

            <div class="content">
                <h2 style="margin-bottom: 25px;">Sistem Gereksinimleri</h2>';

    if (!$allPassed) {
        echo '<div class="alert alert-error">
                <strong>Eksik gereksinimler!</strong> Lütfen aşağıdaki eksiklikleri giderin.
              </div>';
    } else {
        echo '<div class="alert alert-success">
                <strong>Harika!</strong> Tüm gereksinimler karşılanıyor.
              </div>';
    }

    echo '<ul class="requirements">';
    foreach ($checks as $check) {
        $statusClass = $check['status'] ? 'check-ok' : 'check-fail';
        $statusText = $check['status'] ? '✓' : '✗';
        echo "<li>
                <span>{$check['name']}</span>
                <span class='$statusClass'>$statusText {$check['value']}</span>
              </li>";
    }
    echo '</ul>';

    echo '<form method="get" style="margin-top: 30px;">
            <input type="hidden" name="step" value="2">
            <button type="submit" class="btn"' . ($allPassed ? '' : ' disabled') . '>
                Devam Et →
            </button>
          </form>
        </div>
      </div>';
}

// Adım 2: Veritabanı Ayarları
elseif ($currentStep === 2) {
    $error = null;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $dbHost = trim($_POST['db_host'] ?? '');
        $dbPort = trim($_POST['db_port'] ?? '');
        $dbName = trim($_POST['db_name'] ?? '');
        $dbUser = trim($_POST['db_user'] ?? '');
        $dbPass = $_POST['db_pass'] ?? '';

        // Form validasyonu
        if (empty($dbHost)) {
            $error = "MySQL sunucu adresi boş olamaz!";
        } elseif (empty($dbPort)) {
            $error = "MySQL port boş olamaz!";
        } elseif (empty($dbName)) {
            $error = "Veritabanı adı boş olamaz! Lütfen cPanel'den oluşturduğunuz veritabanı adını girin.";
        } elseif (empty($dbUser)) {
            $error = "Veritabanı kullanıcı adı boş olamaz!";
        }

        if (!isset($error)) {
            try {
            // Veritabanı bağlantısını test et
            $dsn = "mysql:host=$dbHost;port=$dbPort;charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Önce veritabanının mevcut olup olmadığını kontrol et
            $stmt = $pdo->query("SHOW DATABASES LIKE '$dbName'");
            $dbExists = $stmt->rowCount() > 0;

            if (!$dbExists) {
                // Veritabanını oluşturmayı dene
                try {
                    $pdo->exec("CREATE DATABASE `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                } catch (PDOException $e) {
                    throw new Exception("Veritabanı oluşturulamadı. Lütfen hosting panelinizden veritabanını manuel olarak oluşturun ve tekrar deneyin. Hata: " . $e->getMessage());
                }
            }

            // Veritabanına bağlan
            $pdo->exec("USE `$dbName`");

            // SQL dosyasını çalıştır
            $sqlFile = __DIR__ . '/database.sql';
            if (file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                // SQL komutlarını ayır ve çalıştır
                $statements = array_filter(array_map('trim', explode(';', $sql)));
                foreach ($statements as $statement) {
                    if (!empty($statement)) {
                        $pdo->exec($statement);
                    }
                }
            }

            // .env dosyasını oluştur
            $envContent = "NODE_ENV=production\n";
            $envContent .= "PORT=5001\n\n";
            $envContent .= "DB_HOST=$dbHost\n";
            $envContent .= "DB_PORT=$dbPort\n";
            $envContent .= "DB_NAME=$dbName\n";
            $envContent .= "DB_USER=$dbUser\n";
            $envContent .= "DB_PASSWORD=$dbPass\n\n";
            $envContent .= "JWT_SECRET=" . bin2hex(random_bytes(32)) . "\n";
            $envContent .= "JWT_REFRESH_SECRET=" . bin2hex(random_bytes(32)) . "\n";
            $envContent .= "JWT_EXPIRE=7d\n";
            $envContent .= "JWT_REFRESH_EXPIRE=30d\n\n";
            $frontendUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];
            $envContent .= "FRONTEND_URL=$frontendUrl\n";

            file_put_contents(__DIR__ . '/backend/.env', $envContent);

            // Session'a kaydet
            $_SESSION['db_config'] = compact('dbHost', 'dbPort', 'dbName', 'dbUser', 'dbPass');

            header('Location: ?step=3');
            exit;
            } catch (PDOException $e) {
                $errorMsg = $e->getMessage();

                // Daha anlaşılır hata mesajları
                if (strpos($errorMsg, 'Access denied') !== false) {
                    if (strpos($errorMsg, 'database') !== false) {
                        $error = "VERİTABANI ERİŞİM HATASI!<br><br>";
                        $error .= "Girdiğiniz veritabanı adı: <strong>$dbName</strong><br>";
                        $error .= "Kullanıcı adı: <strong>$dbUser</strong><br><br>";
                        $error .= "<strong>Kontrol Edin:</strong><br>";
                        $error .= "1. Veritabanı adını TAM olarak yazdınız mı? (Örn: rea340stinfo_stokyonetim)<br>";
                        $error .= "2. Kullanıcı adını TAM olarak yazdınız mı? (Örn: rea340stinfo_stokuser)<br>";
                        $error .= "3. cPanel'de kullanıcıya bu veritabanı için TÜM YETKİLER verildi mi?<br>";
                        $error .= "4. Şifre doğru mu?<br><br>";
                        $error .= "<em>Teknik detay: " . htmlspecialchars($errorMsg) . "</em>";
                    } else {
                        $error = "MySQL bağlantı hatası: Kullanıcı adı veya şifre yanlış!<br>";
                        $error .= "Kullanıcı: <strong>$dbUser</strong><br><br>";
                        $error .= "<em>" . htmlspecialchars($errorMsg) . "</em>";
                    }
                } elseif (strpos($errorMsg, 'Unknown database') !== false) {
                    $error = "VERİTABANI BULUNAMADI!<br><br>";
                    $error .= "Aradığınız veritabanı: <strong>$dbName</strong><br><br>";
                    $error .= "Lütfen cPanel > MySQL Databases bölümünden veritabanınızı kontrol edin.<br>";
                    $error .= "Veritabanı adını TAM olarak kopyalayıp yapıştırın (prefix dahil).";
                } else {
                    $error = "Veritabanı hatası: " . htmlspecialchars($errorMsg);
                }
            } catch (Exception $e) {
                $error = "Kurulum hatası: " . htmlspecialchars($e->getMessage());
            }
        }
    }

    echo '<div class="container">
            <div class="header">
                <h1>📦 Stok Yönetim Sistemi</h1>
                <p>Otomatik Kurulum Sihirbazı</p>
            </div>

            <div class="progress">
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Gereksinimler</div>
                </div>
                <div class="step active">
                    <div class="step-number">2</div>
                    <div class="step-label">Veritabanı</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-label">Admin</div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-label">Tamamlandı</div>
                </div>
            </div>

            <div class="content">
                <h2 style="margin-bottom: 25px;">Veritabanı Yapılandırması</h2>

                <div class="alert alert-warning">
                    <strong>⚠️ ÖNEMLİ UYARI!</strong><br><br>
                    <strong>Kuruluma başlamadan ÖNCE hosting panelinizden (cPanel/Plesk):</strong><br>
                    1. Yeni bir MySQL veritabanı oluşturun<br>
                    2. Yeni bir MySQL kullanıcısı oluşturun<br>
                    3. Kullanıcıya veritabanı üzerinde <strong>TÜM YETKİLER</strong> verin<br><br>
                    <em>Çoğu hosting sağlayıcı, güvenlik nedeniyle otomatik veritabanı oluşturmaya izin vermez.</em><br><br>
                    📖 <strong>Detaylı rehber:</strong> <a href="CPANEL-VERİTABANI-KURULUM.md" target="_blank" style="color:#667eea;">CPANEL-VERİTABANI-KURULUM.md</a>
                </div>

                <div style="background:#e8f4f8;padding:15px;border-radius:8px;border-left:4px solid #0891b2;margin-bottom:25px;">
                    <strong>💡 İPUCU:</strong> cPanel\'de veritabanı ve kullanıcı adlarını <strong>TAM olarak kopyalayıp</strong> aşağıdaki formlara yapıştırın.<br>
                    <small>cPanel > MySQL Databases bölümünde "Current Databases" ve "Current Users" kısımlarından tam adları görebilirsiniz.</small>
                </div>';

    if ($error) {
        echo "<div class='alert alert-error'>$error</div>";
    }

    echo '<form method="post">
            <div class="form-group">
                <label>MySQL Sunucu Adresi *</label>
                <input type="text" name="db_host" value="localhost" required>
                <div class="small-text">Genellikle "localhost" kullanılır</div>
            </div>

            <div class="form-group">
                <label>MySQL Port *</label>
                <input type="text" name="db_port" value="3306" required>
                <div class="small-text">Varsayılan: 3306</div>
            </div>

            <div class="form-group">
                <label>Veritabanı Adı (TAM AD ile) *</label>
                <input type="text" name="db_name" value="" placeholder="rea340stinfo_stokyonetim" required>
                <div class="small-text" style="color:#c33;font-weight:600;">⚠️ cPanel\'den oluşturduğunuz TAM veritabanı adını girin (prefix ile birlikte)</div>
            </div>

            <div class="form-group">
                <label>Veritabanı Kullanıcı Adı (TAM AD ile) *</label>
                <input type="text" name="db_user" value="" placeholder="rea340stinfo_stokuser" required>
                <div class="small-text" style="color:#c33;font-weight:600;">⚠️ cPanel\'den oluşturduğunuz TAM kullanıcı adını girin (prefix ile birlikte)</div>
            </div>

            <div class="form-group">
                <label>Veritabanı Şifresi *</label>
                <input type="password" name="db_pass" required>
                <div class="small-text">Veritabanı kullanıcısının şifresi</div>
            </div>

            <button type="submit" class="btn">Veritabanını Kur ve Devam Et →</button>
          </form>
        </div>
      </div>';
}

// Adım 3: Admin Kullanıcısı
elseif ($currentStep === 3) {
    if (!isset($_SESSION['db_config'])) {
        header('Location: ?step=2');
        exit;
    }

    $error = null;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = $_POST['username'] ?? 'admin';
        $password = $_POST['password'] ?? '';
        $email = $_POST['email'] ?? 'admin@example.com';
        $fullName = $_POST['full_name'] ?? 'Sistem Yöneticisi';

        if (empty($password)) {
            $error = "Şifre boş olamaz!";
        } elseif (strlen($password) < 6) {
            $error = "Şifre en az 6 karakter olmalıdır!";
        } else {
            try {
                $config = $_SESSION['db_config'];
                $dsn = "mysql:host={$config['dbHost']};port={$config['dbPort']};dbname={$config['dbName']};charset=utf8mb4";
                $pdo = new PDO($dsn, $config['dbUser'], $config['dbPass']);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                // Admin kullanıcısını oluştur
                $passwordHash = password_hash($password, PASSWORD_BCRYPT);

                $stmt = $pdo->prepare("INSERT INTO users (username, password, email, full_name, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'admin', 'active', NOW(), NOW())");
                $stmt->execute([$username, $passwordHash, $email, $fullName]);

                // Kurulum kilidi oluştur
                file_put_contents($lockFile, date('Y-m-d H:i:s'));

                // Session'ı temizle
                $_SESSION['admin_created'] = true;
                $_SESSION['admin_username'] = $username;

                header('Location: ?step=4');
                exit;
            } catch (Exception $e) {
                $error = "Kullanıcı oluşturma hatası: " . $e->getMessage();
            }
        }
    }

    echo '<div class="container">
            <div class="header">
                <h1>📦 Stok Yönetim Sistemi</h1>
                <p>Otomatik Kurulum Sihirbazı</p>
            </div>

            <div class="progress">
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Gereksinimler</div>
                </div>
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Veritabanı</div>
                </div>
                <div class="step active">
                    <div class="step-number">3</div>
                    <div class="step-label">Admin</div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-label">Tamamlandı</div>
                </div>
            </div>

            <div class="content">
                <h2 style="margin-bottom: 25px;">Admin Kullanıcısı Oluştur</h2>';

    if ($error) {
        echo "<div class='alert alert-error'>$error</div>";
    }

    echo '<div class="alert alert-warning">
            <strong>Önemli!</strong> Bu bilgileri güvenli bir yerde saklayın.
          </div>

          <form method="post">
            <div class="form-group">
                <label>Kullanıcı Adı</label>
                <input type="text" name="username" value="admin" required>
            </div>

            <div class="form-group">
                <label>Şifre</label>
                <input type="password" name="password" required minlength="6">
                <div class="small-text">En az 6 karakter</div>
            </div>

            <div class="form-group">
                <label>E-posta</label>
                <input type="email" name="email" value="admin@example.com" required>
            </div>

            <div class="form-group">
                <label>Tam Ad</label>
                <input type="text" name="full_name" value="Sistem Yöneticisi" required>
            </div>

            <button type="submit" class="btn">Admin Oluştur ve Kurulumu Tamamla →</button>
          </form>
        </div>
      </div>';
}

// Adım 4: Tamamlandı
elseif ($currentStep === 4) {
    if (!isset($_SESSION['admin_created'])) {
        header('Location: ?step=1');
        exit;
    }

    $username = $_SESSION['admin_username'] ?? 'admin';
    session_destroy();

    echo '<div class="container">
            <div class="header">
                <h1>📦 Stok Yönetim Sistemi</h1>
                <p>Otomatik Kurulum Sihirbazı</p>
            </div>

            <div class="progress">
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Gereksinimler</div>
                </div>
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Veritabanı</div>
                </div>
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Admin</div>
                </div>
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Tamamlandı</div>
                </div>
            </div>

            <div class="content">
                <div class="completion">
                    <div class="completion-icon">🎉</div>
                    <h2>Kurulum Başarıyla Tamamlandı!</h2>
                    <p>Stok Yönetim Sistemi başarıyla kuruldu ve kullanıma hazır.</p>
                    <p><strong>Kullanıcı Adınız:</strong> ' . htmlspecialchars($username) . '</p>

                    <div id="backendStatus" class="alert alert-success" style="text-align: left; margin: 30px 0;">
                        <strong>Son Adım:</strong><br><br>
                        <strong>Backend Sunucusunu Başlat:</strong><br>
                        Aşağıdaki butona tıklayarak backend sunucusunu otomatik başlatabilirsiniz.
                    </div>

                    <button id="startBackendBtn" class="btn" onclick="startBackend()" style="margin-bottom: 20px;">
                        🚀 Backend\'i Başlat
                    </button>

                    <div id="backendOutput" style="display:none; background:#f8f9fa; padding:15px; border-radius:8px; margin:20px 0; text-align:left; font-family:monospace; font-size:12px; max-height:200px; overflow-y:auto;"></div>

                    <div style="background:#fff3cd;padding:15px;border-radius:8px;border:1px solid #ffeaa7;margin:20px 0;text-align:left;">
                        <strong>⚠️ Güvenlik Uyarısı:</strong><br>
                        Kurulum tamamlandıktan sonra <code>install.php</code> dosyasını sunucunuzdan silmeniz önerilir.
                    </div>

                    <a href="index.html" id="goToAppBtn" class="btn btn-success" style="text-decoration:none;display:none;">
                        Giriş Sayfasına Git →
                    </a>
                </div>

                <script>
                async function startBackend() {
                    const btn = document.getElementById("startBackendBtn");
                    const status = document.getElementById("backendStatus");
                    const output = document.getElementById("backendOutput");
                    const goBtn = document.getElementById("goToAppBtn");

                    btn.disabled = true;
                    btn.innerHTML = "<span class=\'loading\'></span> Backend başlatılıyor...";
                    status.className = "alert alert-warning";
                    status.innerHTML = "<strong>⏳ Lütfen bekleyin...</strong><br>Backend sunucusu başlatılıyor. Bu işlem birkaç dakika sürebilir.";

                    try {
                        const response = await fetch("start-backend.php");
                        const data = await response.json();

                        output.style.display = "block";
                        output.innerHTML = "<strong>Çıktı:</strong><br>" + (data.output || data.message).replace(/\\n/g, "<br>");

                        if (data.success) {
                            status.className = "alert alert-success";
                            status.innerHTML = "<strong>✅ Backend Başarıyla Başlatıldı!</strong><br>" + data.message;
                            btn.style.display = "none";
                            goBtn.style.display = "inline-block";

                            if (data.warning) {
                                setTimeout(() => {
                                    status.innerHTML += "<br><br><em>" + data.warning + "</em>";
                                }, 1000);
                            }
                        } else {
                            status.className = "alert alert-error";
                            status.innerHTML = "<strong>❌ Backend Başlatma Hatası:</strong><br>" + data.message;
                            status.innerHTML += "<br><br><strong>Manuel Başlatma:</strong><br>";
                            status.innerHTML += "<code style=\'background:#fff;padding:5px 10px;border-radius:4px;display:inline-block;margin:5px 0;\'>cd backend && npm install && pm2 start ecosystem.config.js</code>";
                            btn.disabled = false;
                            btn.innerHTML = "🔄 Tekrar Dene";
                        }
                    } catch (error) {
                        status.className = "alert alert-error";
                        status.innerHTML = "<strong>❌ Bağlantı Hatası:</strong><br>" + error.message;
                        output.style.display = "block";
                        output.innerHTML = "<strong>Hata:</strong> " + error.message;
                        btn.disabled = false;
                        btn.innerHTML = "🔄 Tekrar Dene";
                    }
                }
                </script>
                </div>
            </div>
          </div>';
}
?>
</body>
</html>
