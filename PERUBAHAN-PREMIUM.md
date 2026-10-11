# Family Connect: kemas kini premium (11 Okt 2026)

Semua perubahan ni pada rupa dan PWA je. Data, login, Supabase dan RLS tak disentuh.

## Fail baru
- `src/uaq-premium.css`: lapisan design akhir (warna, font, kad, hero, login, dark mode). Nak undo? Buang satu baris `import './uaq-premium.css'` dalam `App.jsx`.
- `src/OfflineBanner.jsx`: notis kecil "Tiada sambungan internet" bila line hilang.
- `public/sw.js`: service worker. Fail JS/CSS dan gambar disimpan dalam cache supaya app buka laju. Data Supabase **tak pernah** disimpan dalam cache.
- `public/offline.html`: page offline yang ada cap UAQ.
- `public/_headers`: arahan untuk Cloudflare supaya `sw.js` dan manifest sentiasa fresh.
- `public/images/uaq-mark.png`: logo UAQ asal, dah dibuang latar putih (18KB). Warna dia diwarnakan melalui CSS.
- `public/icon-maskable-512.png`: icon untuk Android (bentuk bulat atau squircle).

## Fail yang diubah
- `App.jsx`: logo gambar diganti dengan logo `BrandMark` (sama untuk semua musim). Hero dashboard digabungkan jadi satu ("Good evening, Siti"). Icon Family Code ditukar dari emel ke kad ID.
- `main.jsx`: daftar service worker (masa production je) dan papar notis offline.
- `index.html`: font Fraunces dan Plus Jakarta Sans dimuat sekali, guna preconnect.
- `App.css`: buang `@import` font lama (DM Sans + Playfair).
- `manifest.webmanifest`: icon maskable, warna tema teal, `lang: ms`.
- Icon (`icon-192/512`, `apple-touch-icon`, `favicon`): reka baru, latar teal dan tulisan "FAMILY".
- Gambar tema Raya dan Sakura dimampatkan (722K→313K, 405K→170K, 402K→164K, 238K→146K, 476K→170K).

## Gambar yang dah tak digunakan
Dipindahkan ke `_arkib-gambar-tak-guna/` (jumlah ~7MB, tak lagi di-deploy). Boleh padam kalau dah puas hati.

## Icon eMAR
Folder `icon-eMAR-baru/` ada icon navy untuk eMAR. Salin ke `UAQ-eMAR-V2/public/` (ganti fail lama), lepas tu naikkan `?v=` dalam `index.html` dan `manifest.webmanifest` eMAR.

## Deploy
```
npm install
npm run build
npx wrangler deploy
```
Phone yang dah add-to-home akan dapat icon baru lepas buka app beberapa kali. Untuk iPhone kadang-kadang kena buang dan add semula.
