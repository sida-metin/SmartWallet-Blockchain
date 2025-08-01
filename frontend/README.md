# Smart Wallet Bank Frontend

Modern ve kullanıcı dostu bir kripto cüzdan arayüzü.

## Özellikler

- 🏦 **Para Yatırma/Çekme**: ETH yatırma ve çekme işlemleri
- 💸 **Transfer**: Diğer adreslere ETH transferi
- 📊 **Dashboard**: Bakiye ve istatistik görüntüleme
- 📜 **İşlem Geçmişi**: Tüm işlemlerin detaylı geçmişi
- 🔒 **Güvenlik**: MetaMask entegrasyonu ile güvenli işlemler
- 📱 **Responsive**: Mobil ve masaüstü uyumlu tasarım

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Uygulamayı başlatın:
```bash
npm start
```

3. Tarayıcıda `http://localhost:3000` adresini açın.

## Kullanım

1. **Cüzdan Bağlama**: MetaMask cüzdanınızı bağlayın
2. **Para Yatırma**: Dashboard'dan "Para Yatır" sekmesine gidin
3. **Transfer**: "Transfer" sekmesinden diğer adreslere ETH gönderin
4. **Geçmiş**: Tüm işlemlerinizi "Geçmiş" sekmesinde görüntüleyin

## Teknolojiler

- React 18
- Ethers.js
- Tailwind CSS
- Lucide React (İkonlar)
- React Hot Toast (Bildirimler)

## Kontrat Entegrasyonu

Bu frontend, `WalletBank.sol` akıllı kontratı ile entegre çalışır. Kontrat adresini `App.js` dosyasında güncelleyin:

```javascript
const contractAddress = '0x...'; // Deploy edilen kontrat adresi
```

## Geliştirme

- `npm run build`: Production build oluşturur
- `npm test`: Testleri çalıştırır
- `npm run eject`: React konfigürasyonunu dışa aktarır (geri alınamaz) 