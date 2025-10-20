# GitHub Repository Kurulum Rehberi

## 🚀 Hızlı GitHub Kurulumu

### 1. GitHub'da Yeni Repository Oluştur
1. [github.com](https://github.com) adresine git
2. Sağ üstte "+" butonuna tıkla → "New repository"
3. **Repository name**: `stok-yonetim-sistemi` (veya istediğiniz ad)
4. **Visibility**: **Public** seç (Railway için gerekli)
5. **Initialize repository**: Hiçbirini seçme (boş bırak)
6. "Create repository" butonuna tıkla

### 2. Repository URL'ini Kopyala
GitHub'da yeni oluşturulan repository sayfasında:
- HTTPS URL'ini kopyala (örnek: `https://github.com/USERNAME/stok-yonetim-sistemi.git`)

### 3. Local Repository'yi GitHub'a Bağla
Aşağıdaki komutları çalıştır (URL'i kendi repository URL'inle değiştir):

```bash
git remote add origin https://github.com/USERNAME/stok-yonetim-sistemi.git
git branch -M main
git push -u origin main
```

## 🔧 Otomatik Script

Alternatif olarak, GitHub repository URL'inizi aldıktan sonra:

1. `connect-github.bat` dosyasını çalıştır
2. Repository URL'inizi girin
3. Otomatik bağlanacak

## ✅ Doğrulama

Push işlemi tamamlandıktan sonra:
- GitHub repository sayfasını yenile
- Tüm dosyalarınızın yüklendiğini kontrol edin
- `railway.json` ve `RAILWAY-DEPLOYMENT-GUIDE.md` dosyalarının görünür olduğunu kontrol edin

## 🚀 Sonraki Adım: Railway Deploy

GitHub'a yükleme tamamlandıktan sonra:
1. [railway.app](https://railway.app) adresine git
2. "New Project" → "Deploy from GitHub repo"
3. Repository'nizi seç
4. Otomatik deploy başlayacak!

## 💡 İpucu

Eğer GitHub'da repository oluştururken sorun yaşarsanız:
- Repository adında Türkçe karakter kullanmayın
- Public seçmeyi unutmayın
- README, .gitignore, license eklemeyin (zaten var)
