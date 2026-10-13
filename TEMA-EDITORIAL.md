# Rupa harian baru: UAQ Editorial (13 Okt 2026)

Rupa harian Family Connect sekarang sama gaya dengan laman web uaqelderlycarecentre.com:
latar gelap, tajuk huruf besar warna perak, tulisan serif, aksen teal dan rose dari logo UAQ.

- Mula-mula buka: **mod gelap**. Butang matahari/bulan masih boleh tukar, dan pilihan keluarga diingat dalam telefon masing-masing.
- Kunci tema dalam Supabase masih `blue_sakura` (ditukar dari Pengurus Tema dalam eMAR). Tiada perubahan pada data, login atau RLS.
- Tema Hari Raya tak berubah dan masih boleh dipilih.

Fail:
- `src/uaq-editorial.css`: design utama.
- `src/editorial-sweep.css`: dijana automatik (tukar sisa warna biru/hijau lama kepada neutral).
- `public/images/editorial/`: logo dan gambar dari laman web.

Nak kembali ke Sakura lama? Dalam `src/App.jsx`, tukar dua baris import
`uaq-editorial.css` + `editorial-sweep.css` kepada `sakura-classic.css`.
