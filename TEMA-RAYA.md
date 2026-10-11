# Tema Hari Raya: Zamrud & Emas (12 Okt 2026)

Tema ni aktif bila admin pilih **Hari Raya** dalam butang "✦ Tema" eMAR. Perubahan ikut serta-merta kat eMAR dan Family Connect.

## Rupa
- Light mode: latar gading dengan corak geometri emas yang halus. Sidebar, hero, reben ucapan dan kad profil guna hijau zamrud gelap dengan emas.
- Dark mode: latar penuh hijau zamrud dengan medalion arabes, pelita dan bintang, sama macam poster.
- Reben: "✦ SELAMAT HARI RAYA AIDILFITRI · MAAF ZAHIR & BATIN ✦"

## Fail seni (semua dilukis baru, vektor asli, tiada gambar luar)
`public/themes/hari-raya/`:
- `wallpaper.jpg`: latar halaman (dark mode), sidebar dan kad profil
- `family-hero.jpg`: hero Family Connect
- `emar-video-poster.jpg`: poster ucapan dalam hero dashboard eMAR
- `garland.svg`: untaian pelita, bintang dan bulan di top bar
- `motif.svg`, `particles.svg`: hiasan kecil
- `pattern-light.svg`: corak geometri emas untuk light mode

Nak guna gambar sendiri? Ganti fail dengan nama dan saiz yang sama (contoh: wallpaper 1920×1080).

## Kod
- Baru: `src/raya-emerald.css`. Ia cuma aktif untuk tema Hari Raya. Nak balik ke rupa Raya lama? Buang satu baris `import './raya-emerald.css'` dalam `App.jsx` dan pulihkan fail gambar lama dari git.
- Tema lain (Blue Sakura, Krismas, CNY) tak berubah.
