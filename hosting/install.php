<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stok Yönetim Sistemi - SQLite Kurulum</title>
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

        .demo-info {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #0891b2;
            margin: 20px 0;
        }

        .demo-info h3 {
            color: #0891b2;
            margin-bottom: 10px;
        }

        .demo-credentials {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            margin-top: 10px;
        }
    </style>
</head>
<body>
<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Install lock kontrolü kaldırıldı - kurulum sonrası install.php silinecek

$currentStep = isset($_GET['step']) ? (int)$_GET['step'] : 1;

// Adım 1: Sistem Gereksinimleri
if ($currentStep === 1) {
    $phpVersion = PHP_VERSION;
    $requiredExtensions = [
        'pdo' => 'PDO Extension',
        'pdo_sqlite' => 'PDO SQLite Driver',
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

    // Node.js kontrolü
    exec('node --version 2>&1', $nodeOutput, $nodeReturn);
    $nodeOk = $nodeReturn === 0;
    $nodeVersion = $nodeOk ? trim($nodeOutput[0]) : 'Kurulu değil';
    $checks[] = [
        'name' => 'Node.js (≥ 14.0)',
        'value' => $nodeVersion,
        'status' => $nodeOk
    ];
    if (!$nodeOk) $allPassed = false;

    // NPM kontrolü
    exec('npm --version 2>&1', $npmOutput, $npmReturn);
    $npmOk = $npmReturn === 0;
    $npmVersion = $npmOk ? trim($npmOutput[0]) : 'Kurulu değil';
    $checks[] = [
        'name' => 'NPM Package Manager',
        'value' => $npmVersion,
        'status' => $npmOk
    ];
    if (!$npmOk) $allPassed = false;

    // Yazma izinleri
    $dirs = ['backend', 'backend/uploads', '.'];
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
                <p>SQLite Otomatik Kurulum Sihirbazı</p>
            </div>

            <div class="progress">
                <div class="step active">
                    <div class="step-number">1</div>
                    <div class="step-label">Gereksinimler</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-label">Kurulum</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-label">Tamamlandı</div>
                </div>
            </div>

            <div class="content">
                <h2 style="margin-bottom: 25px;">Sistem Gereksinimleri</h2>

                <div class="alert alert-success">
                    <strong>🎉 SQLite Kurulum!</strong><br>
                    Bu kurulum SQLite veritabanı kullanır - MySQL kurulumu gerekmez!<br>
                    Demo kullanıcı ve veriler otomatik olarak hazır gelir.
                </div>';

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

    if (!$allPassed) {
        echo '<div class="alert alert-warning">
                <strong>Node.js Kurulum:</strong><br>
                Node.js kurulu değilse, <a href="https://nodejs.org" target="_blank">nodejs.org</a> adresinden indirip kurun.
              </div>';
    }

    echo '<form method="get" style="margin-top: 30px;">
            <input type="hidden" name="step" value="2">
            <button type="submit" class="btn"' . ($allPassed ? '' : ' disabled') . '>
                Kuruluma Başla →
            </button>
          </form>
        </div>
      </div>';
}

// Adım 2: Otomatik Kurulum
elseif ($currentStep === 2) {
    echo '<div class="container">
            <div class="header">
                <h1>📦 Stok Yönetim Sistemi</h1>
                <p>SQLite Otomatik Kurulum Sihirbazı</p>
            </div>

            <div class="progress">
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Gereksinimler</div>
                </div>
                <div class="step active">
                    <div class="step-number">2</div>
                    <div class="step-label">Kurulum</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-label">Tamamlandı</div>
                </div>
            </div>

            <div class="content">
                <h2 style="margin-bottom: 25px;">Otomatik Kurulum</h2>

                <div id="installationStatus" class="alert alert-warning">
                    <strong>⏳ Kurulum başlatılıyor...</strong><br>
                    Lütfen bekleyin, bu işlem birkaç dakika sürebilir.
                </div>

                <div id="installationOutput" style="display:none; background:#f8f9fa; padding:15px; border-radius:8px; margin:20px 0; font-family:monospace; font-size:12px; max-height:300px; overflow-y:auto; white-space: pre-wrap;"></div>

                <div id="nextStepBtn" style="display:none;">
                    <a href="?step=3" class="btn btn-success" style="text-decoration:none;">
                        Kurulum Tamamlandı - Devam Et →
                    </a>
                </div>

                <script>
                async function performInstallation() {
                    const status = document.getElementById("installationStatus");
                    const output = document.getElementById("installationOutput");
                    const nextBtn = document.getElementById("nextStepBtn");

                    try {
                        status.innerHTML = "<strong>⏳ SQLite veritabanı kopyalanıyor...</strong>";
                        
                        const response = await fetch("install-backend.php", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({action: "install"})
                        });
                        
                        const data = await response.json();
                        
                        output.style.display = "block";
                        output.textContent = data.output || data.message;

                        if (data.success) {
                            status.className = "alert alert-success";
                            status.innerHTML = "<strong>✅ Kurulum Başarılı!</strong><br>" + data.message;
                            nextBtn.style.display = "block";
                        } else {
                            status.className = "alert alert-error";
                            status.innerHTML = "<strong>❌ Kurulum Hatası:</strong><br>" + data.message;
                        }
                    } catch (error) {
                        status.className = "alert alert-error";
                        status.innerHTML = "<strong>❌ Bağlantı Hatası:</strong><br>" + error.message;
                        output.style.display = "block";
                        output.textContent = "Hata: " + error.message;
                    }
                }

                // Kurulumu otomatik başlat
                performInstallation();
                </script>
            </div>
          </div>';
}

// Adım 3: Tamamlandı
elseif ($currentStep === 3) {
    echo '<div class="container">
            <div class="header">
                <h1>📦 Stok Yönetim Sistemi</h1>
                <p>SQLite Otomatik Kurulum Sihirbazı</p>
            </div>

            <div class="progress">
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Gereksinimler</div>
                </div>
                <div class="step completed">
                    <div class="step-number">✓</div>
                    <div class="step-label">Kurulum</div>
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
                    <p>Stok Yönetim Sistemi SQLite ile başarıyla kuruldu ve kullanıma hazır.</p>

                    <div class="demo-info">
                        <h3>🔑 Demo Giriş Bilgileri</h3>
                        <p>Sisteme giriş yapmak için aşağıdaki demo hesabı kullanabilirsiniz:</p>
                        <div class="demo-credentials">
                            <strong>E-posta:</strong> admin@stok.com<br>
                            <strong>Şifre:</strong> admin123
                        </div>
                        <p style="margin-top: 10px; font-size: 12px; color: #666;">
                            ⚠️ Güvenlik için ilk girişten sonra şifrenizi değiştirin.
                        </p>
                    </div>

                    <div id="backendStatus" class="alert alert-warning" style="text-align: left; margin: 30px 0;">
                        <strong>Son Adım:</strong><br><br>
                        <strong>Backend Sunucusunu Başlat:</strong><br>
                        Aşağıdaki butona tıklayarak backend sunucusunu otomatik başlatın.
                    </div>

                    <button id="startBackendBtn" class="btn" onclick="startBackend()" style="margin-bottom: 20px;">
                        🚀 Backend\'i Başlat
                    </button>

                    <div id="backendOutput" style="display:none; background:#f8f9fa; padding:15px; border-radius:8px; margin:20px 0; text-align:left; font-family:monospace; font-size:12px; max-height:200px; overflow-y:auto; white-space: pre-wrap;"></div>

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
                        output.textContent = data.output || data.message;

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
                        output.textContent = "Hata: " + error.message;
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
