# Render.com Deployment Rehberi

## Yapılan Düzeltmeler

### 1. render.yaml Güncellemesi
- Build command düzeltildi: Frontend build edildikten sonra backend build çalıştırılıyor
- Doğru sıralama: `npm install && cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build`

### 2. Backend Package.json Güncellemesi
- `build` script'i eklendi
- `postbuild` script'i eklendi (frontend dosyalarını backend/public'e kopyalar)

### 3. Server.js Zaten Hazır
- Production modda static file serving aktif
- SPA routing için catch-all route mevcut
- Environment variables doğru şekilde kullanılıyor

## Deployment Adımları

### 1. GitHub'a Push
```bash
git add .
git commit -m "Fix Render.com deployment configuration"
git push origin main
```

### 2. Render.com'da Yeni Deploy
1. Render.com dashboard'a git
2. "New Web Service" seç
3. GitHub repository'nizi bağlayın
4. render.yaml otomatik algılanacak
5. Deploy butonuna bas

### 3. Database Kurulumu
- Render.com otomatik olarak MySQL database oluşturacak
- Environment variables otomatik set edilecek
- İlk deploy'da database tabloları otomatik oluşturulacak

## Beklenen Sonuç

✅ Frontend React uygulaması build edilecek
✅ Build dosyaları backend/public'e kopyalanacak  
✅ Backend Express server başlayacak
✅ Tek URL'den hem API hem frontend erişilebilir olacak
✅ Müşterileriniz demo'yu görebilecek

## Troubleshooting

Eğer hala hata alırsanız:

1. **Build logs kontrol edin**: Render.com dashboard'da build loglarını inceleyin
2. **Environment variables**: Database bağlantı bilgilerinin doğru geldiğinden emin olun
3. **Memory limit**: Free tier'da memory sınırı var, gerekirse optimize edin

## Test

Deploy tamamlandıktan sonra:
- `https://your-app.onrender.com/api/health` - API test
- `https://your-app.onrender.com` - Frontend test
