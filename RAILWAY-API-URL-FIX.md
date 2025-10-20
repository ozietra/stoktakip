# 🔧 Railway Frontend API URL Sorunu - Çözüm

## 🚨 Problem:
Frontend hala `localhost:5001` kullanmaya çalışıyor:
```
xhr.js:198 Refused to connect to 'http://localhost:5001/api/auth/login'
```

## ✅ Çözüm:

### Railway'de Environment Variable Ekle:

1. **Railway Dashboard** → **Web Service** → **Variables** sekmesi
2. **"New Variable"** butonuna tıkla
3. Şu variable'ı ekle:

```
Name: REACT_APP_API_URL
Value: /api
```

### Neden Bu Gerekli:
- Frontend build sırasında `REACT_APP_API_URL` environment variable'ını okur
- Eğer bu variable yoksa, development default'u olan `localhost:5001` kullanır
- Production'da `/api` kullanması gerekiyor (relative URL)

### Sonra:
1. **"Deploy"** butonuna bas (yeniden build için)
2. Frontend yeniden build edilecek
3. Bu sefer `/api` kullanacak
4. CSP hatası çözülecek

## 🎯 Beklenen Sonuç:
```javascript
// Önceki (hatalı):
API_URL = 'http://localhost:5001/api'

// Sonraki (doğru):
API_URL = '/api'
```

## ⚡ Hızlı Test:
Variable ekledikten ve redeploy yaptıktan sonra:
1. F12 → Network sekmesi
2. Login butonuna bas
3. `/api/auth/login` isteği görmeli (localhost:5001 değil)

---

**Bu variable eklenmeden frontend çalışmayacak!** 🚨
