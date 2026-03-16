# FinPulse

> **Kripto portföyünüzü ve piyasaları tek bir platformda yönetin!**

FinPulse, kripto yatırımcıları için geliştirilmiş, portföy yönetimi, gerçek zamanlı piyasa takibi ve akıllı alarm sistemlerini bir arada sunan modern ve kullanıcı dostu bir platformdur. Yatırım kararlarınızı güçlendirmek için tasarlanmış, hızlı ve güvenilir bir çözüm sunar.

## 🎯 Neden FinPulse?

- Portföyünüzü kolayca yönetin
- Piyasa fiyatlarını ve trendleri anlık takip edin
- Fiyat bazlı akıllı alarmlar kurun
- Favori coinlerinizi izleyin
- Modern ve karanlık temalı arayüz ile yatırım deneyiminizi iyileştirin

## 🛠️ Kullanılan Teknolojiler

### Backend

- **Python** (FastAPI)
- **SQLAlchemy** (Veritabanı ORM)
- **MySQL** (veya opsiyonel SQLite)
- **WebSocket** (Gerçek zamanlı veri)
- **JWT** ile kimlik doğrulama
- **Docker & Docker Compose**

### Frontend

- **React** (Vite + TypeScript)
- **Redux Toolkit** (State yönetimi)
- **Axios** (API istekleri)
- **TailwindCSS** & **Sass/CSS** (Modern responsive tasarım)
- **i18n** (Çoklu dil desteği)

## ⚡ Kurulum

> **Not:** Backend için bir `.env` dosyası oluşturmanız gerekebilir. Detaylar için backend klasöründeki örnek dosyaya bakınız.

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend/finpulse
npm install
npm run dev
```

## 📂 Proje Yapısı

- **backend/**: API, veritabanı, iş mantığı
- **frontend/**: Kullanıcı arayüzü

## 💡 Öne Çıkan Özellikler

- Gerçek zamanlı fiyat takibi ve grafikler
- Portföy ve izleme listesi yönetimi
- Fiyat bazlı alarm sistemi
- Bildirimler ve e-posta entegrasyonu
- Modern, karanlık tema arayüz
- Çoklu dil desteği

## 👩‍💻 Katkı Sağlama

Katkıda bulunmak için issue açabilir veya pull request gönderebilirsiniz.
