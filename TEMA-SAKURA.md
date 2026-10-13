# Tema Blue Sakura: seni asal, penuh setiap page (12 Okt 2026)

Seni sakura kertas putih-biru yang asal dikekalkan (gambar hero, poster dan wallpaper asal dipulihkan).

## Apa yang ditambah
- **Seni penuh setiap page:** lanskap gunung biru berbunga putih (`public/images/uaq-sakura-landscape.webp`, dari gambar asal "Landskap Gunung Biru Berbunga Putih", dimampatkan jadi 194KB) mengisi seluruh latar setiap page. Kad jadi kaca putih supaya pemandangan masih terasa di belakangnya.
- **Sidebar:** lanskap yang sama di bahagian bawah, dan dahan sakura di atas.
- **Setiap menu dihias:**
  - icon dalam bulatan kertas putih
  - bunga sakura kecil di hujung kanan setiap menu (berputar bila hover)
  - menu aktif: kad putih dengan dahan sakura, dan icon biru
- **Family Connect (phone):** menu bawah jadi kaca, dan menu aktif ada bunga kecil.
- **Dark mode:** pemandangan yang sama dengan lapisan biru malam.

## Fail
- Baru: `src/sakura-classic.css`, `public/themes/blue-sakura/blossom.svg`, `public/themes/blue-sakura/sprig.svg`, `public/images/uaq-sakura-landscape.webp`
- Nak buang hiasan ni: padam baris `import './sakura-classic.css'` dalam `App.jsx`.
