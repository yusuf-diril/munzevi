# münzevi — yaşayan el yazması

> *bir münzevinin yaşayan el yazması.*

Bu belge, **münzevi** projesinin tüm özelliklerini, ruhunu ve kullanım rehberini bir araya getirir. Bir geliştirici, bir okuyucu ya da geleceğin münzevisi için yazılmıştır.

---

## Ruh

münzevi, bir web sitesi değildir. Bir **defterdir**. Gerçek mürekkeple, gerçek elde, gerçek gecede yazılmış mektupların dijital bir yaşam bulduğu yerdir. Her detay — titreyen harfler, yaşlanan mürekkep, kırılan mühürler, geceye saklanan şiirler — bir atmosfer oluşturmak için değil, bir **duygu aktarmak** için vardır.

Site iki dünya arasında nefes alır:
- **Manuscript** (aydınlık) — krem rengi kağıt, koyu mürekkep, güneş ışığı
- **Void** (karanlık) — gece, yıldızlar, mum ışığı, sessizlik

---

## Yapı

```
munzevicomtr/
├── _config.yml              # Site yapılandırması
├── _data/                   # Veri dosyaları
│   ├── kavramlar.yml        # 9 kavram tanımı
│   ├── secret_words.yml     # 35 gizli kelime haritası
│   ├── kavram_connections.yml # Kavramlar arası bağlantılar
│   ├── notes.yml            # Onaylı kenar notları
│   └── reader_vird.yml      # Okuyucu virdi girdileri
├── _includes/               # Yeniden kullanılabilir bileşenler
│   ├── header.html          # Navigasyon + tema toggle + kısmet
│   ├── footer.html          # Alt bilgi
│   ├── design-panel.html    # Geliştirme paneli (sol alt ⚙)
│   ├── tezhip-gul.html      # SVG serlevha gülü
│   ├── tezhip-ara.html      # SVG ara tezhip süslemesi
│   └── tr-date.html         # Türkçe tarih formatlayıcı
├── _layouts/
│   ├── default.html         # Ana layout (tüm katmanlar)
│   └── post.html            # Mektup/yazı layout'u
├── _posts/                  # 37 mektup
├── pages/                   # Özel sayfalar
│   ├── collection.html      # Koleksiyon (pullar + ayak izleri + konstellasyon)
│   ├── kavramlar.html       # Kavram virdi (zihin haritası)
│   ├── muhataplar.html      # Muhataplar (5 kişi)
│   ├── sual.html            # Sual defteri (17 soru)
│   ├── sir.html             # Defterin sırrı (35 kelime bulmacası)
│   ├── halvet.html          # Halvethâne (sessizlik ödülü)
│   ├── dolunay.html         # Dolunay sırrı (ayda 2-3 gün)
│   └── ruya.html            # Rüya defteri (gece 00-05 arası)
├── assets/
│   ├── css/style.scss       # Tüm stiller (~3400 satır SCSS)
│   ├── js/main.js           # Tüm etkileşimler (~1870 satır JS)
│   └── img/                 # Görseller (kenarlıklar, pullar, damgalar)
├── index.html               # Anasayfa
├── CNAME                    # Custom domain (munzevi.com.tr)
└── .github/workflows/       # GitHub Actions deploy
```

---

## Mektuplar (37 adet)

Her mektup bir `_posts/` dosyasıdır. Front matter özellikleri:

| Özellik | Açıklama | Kullanım |
|---------|----------|----------|
| `stamp_image` | Pul kimliği | Her mektubun benzersiz pulu |
| `is_nocturnal` | Gece şiiri | Sadece 23:00-06:00 arası okunabilir |
| `sealed` | Mühürlü mektup | Yeterli pul toplamadan açılamaz |
| `arrives` | Yolda olan mektup | Belirtilen tarihe kadar geri sayım |
| `kenarlik` | Kenarlık görseli | Sağ kenarda tezhip süslemesi |
| `emotional` | Duygusal mektup | Gözyaşı izleri efekti tetiklenir |

**13 mektup** sadece gece okunabilir (`is_nocturnal`).
**1 mektup** mühürlüdür — tüm defterin kilidini açar.
**1 mektup** henüz yoldadır — belirli bir tarihte ulaşır.

---

## Özellikler

### Atmosfer Katmanları

#### Yıldızlı Gece
Void modunda sabit arka planda titreyen yıldızlar. İki katman CSS `radial-gradient` ile oluşturulmuş, `twinkle-a` ve `twinkle-b` animasyonlarıyla alternatif titreşir. Tasarım panelinden kapatılabilir.

#### Ay Evresi
Sağ üst köşede gerçek astronomik hesaplamayla güncel ay evresi emojisi. 8 evre (yeni ay → dolunay → son hilâl). Void modda daha parlak, manuscript modda soluk. **Tıklanınca dolunay sayfasına gider.**

#### Mum Işığı (Candlelight)
Void modunda fare imlecini takip eden iki katmanlı efekt:
1. **Mask katmanı**: İçerik sadece fare etrafında görünür (`radial-gradient` mask)
2. **Glow katmanı**: Sıcak amber rengi parıltı (`rgba(212, 163, 115, 0.08)`)

Dokunmatik cihazlarda otomatik devre dışı kalır.

#### Hava Durumu
Tarayıcı konumu kullanılarak gerçek hava durumu alınır (Open-Meteo API). 4 durum:
- **Açık**: Hafif altın parıltı
- **Bulutlu**: Gri gradient
- **Yağmurlu**: Koyu mavi gradient
- **Karlı**: Beyaz radial gradient

#### Mevsim Duyarlılığı
Gerçek takvim ayına göre atmosfer tonu değişir:
- **İlkbahar** (Mart-Mayıs): Yeşil alt ton
- **Yaz** (Haziran-Ağustos): Altın sarısı
- **Sonbahar** (Eylül-Kasım): Amber/bakır
- **Kış** (Aralık-Şubat): Soğuk mavi

#### Sis Efekti
Yazı sayfalarının altında 50vh yüksekliğinde gradient sis. Metin aşağıya doğru soluyor. Tema ile uyumlu renk (krem veya siyah). Tasarım panelinden kapatılabilir.

---

### Etkileşimler

#### Mühür Kırma
Her mektubun üzerinde balmumu mühür (6 renk varyasyonu, Arapça harfler). Tıklayınca:
1. Mühür iki yarıya ayrılır (CSS animasyon)
2. Parçacıklar saçılır (`spawnSealParticles`)
3. Balmumu çatlama sesi çalar (Web Audio API)
4. Mektup içeriği açılır (max-height animasyon)
5. Pul koleksiyona eklenir

#### Pul Koleksiyonu
Her okunan mektup otomatik olarak bir pul kazandırır. 4 farklı pul görseli (hash-based seçim). Koleksiyon sayfasında grid görünümü. Toplanmış pullar renkli, toplanmamışlar gri/soluk.

#### Konstellasyon Haritası
Koleksiyon sayfasının 3. sekmesi. Her mektup bir yıldız olarak SVG haritada gösterilir. Okunan mektuplar parlak altın, okunmayanlar soluk. **Okuyucunun yolculuğu** (okuma sırası) yıldızlar arasında çizgilerle bir takımyıldız oluşturur. Her okuyucunun takımyıldızı farklıdır.

#### Ayak İzi Haritası
Zaman çizelgesi görünümü. Her mektup bir durak. Ziyaret edilen mektuplar tarih damgasıyla işaretli, ziyaret edilmeyenler bulanık.

#### Kısmet Butonu (✦)
Header'daki ✦ butonuna tıklayınca rastgele bir mektuba yönlendirir. Fade geçişli.

#### Gizli Kelimeler
Mektuplarda görünmez mürekkeple yazılmış kelimeler (`.secret-ink`). Metin seçildiğinde ortaya çıkar. 35 kelime bir cümle oluşturur:

> *"her yüreğin derininde bir münzevi yaşar sessizce yazar kimse okumasa da durur çünkü yazmak onun nefesidir ve her kelime bir mühürdür kırılmayı bekleyen gece yarısında açılan defterdir bu yürek sızısı mürekkeple yazılmış son mektuptur belki"*

İlerleme `/sir/` sayfasından takip edilir.

#### Mürekkep Damlaları
Sayfada rastgele konumlarda küçük mürekkep lekeleri. Tıklayınca gizli bir alıntı gösterir (15 farklı söz). 5 saniye sonra kaybolur.

#### Kenar Notları
Her mektubun altında okuyucuların not bırakabileceği alan. Notlar hafif döndürülmüş, yapışkan kağıt estetiğinde. Formspree ile gönderilir.

---

### Zamana Bağlı Özellikler

#### Gece Şiirleri
13 mektup `is_nocturnal: true` ile işaretli. Saat 06:00-23:00 arası erişildiğinde:
- Karanlık perde belirir: *"Bu şiir gün ışığında okunamaz."*
- İçerik bulanıklaştırılır
- Gece yarısından sonra perde kalkar

#### Mühürlü Mektup
`sealed: true` ile işaretli tek mektup. Açmak için belirli sayıda mektup okumak gerekir. Karanlık overlay: *"Bu mektup mühürlüdür."* Dinamik sayaç: *"X mektup daha oku."*

#### Yolda Olan Mektup
`arrives: "2026-02-28"` ile işaretli. Tarihe kadar kum saati animasyonuyla geri sayım. Tarih geldiğinde normal mektuba dönüşür.

#### Dolunay Sırrı
`/dolunay/` sayfası. Ay evresi hesaplamasıyla (Julian gün) dolunay tespiti. Dolunay değilse: *"bu sayfa sadece dolunayda okunabilir..."* Dolunayda: gizli bir şiir fade-in ile belirir.

#### Rüya Defteri
`/ruya/` sayfası. Sadece **gece 00:00-05:00** arası erişilebilir. Tüm mektuplardan rastgele cümleler alınıp surreal bir montaj oluşturulur. Her ziyarette farklı — hiçbir zaman aynı olmayan bilinçaltı akışı.

#### Halvethâne — Sessizlik Ödülü
`/halvet/` sayfası. Kademeli açılım (süre `localStorage`'da birikir):
- **30 saniye**: *"sabır, sessizliğin en derin halidir."*
- **2 dakika**: İkinci bir katman belirir
- **5 dakika**: Üçüncü katman + rüya defteri bağlantısı
- **10 dakika**: Çok özel bir final metni

Ekranda sayaç yok — sadece sabreden ödüllenir.

---

### Görsel Efektler

#### Daktilo Efekti (Typewriter)
Yazı sayfalarında paragraflar viewport'a girdiğinde karakter karakter belirir. IntersectionObserver ile tetiklenir, sıralı çalışır (bir paragraf bitmeden diğeri başlamaz). Lazy loading ile performans optimize edilmiştir.

**Ayarlar** (tasarım paneli):
- Açık/kapalı toggle
- Hız slider'ı (10-100ms arası, varsayılan 35ms)

#### İmza Döngüsü
Header'daki site adı 3.2 saniyede bir fade geçişle döner:
> münzevî → hiçten, kimseye.. → yusuf diril → münzevî → ...

#### Okuma İzi
Yazı sayfalarında sol kenarda ince bir mürekkep çizgisi. Scroll pozisyonuna bağlı olarak büyür. `localStorage`'da kaydedilir — tekrar ziyarette eski iz daha soluk olarak görünür.

#### Kahve Lekeleri & Gözyaşı İzleri
7 günden eski mektuplarda deterministik konumlarda soluk kahve lekeleri (`radial-gradient`). Mektup yaşlandıkça lekeler çoğalır. `emotional: true` front matter'ı olan mektuplarda ayrıca gözyaşı damlaları.

#### Son Nefes
Mektubun son paragrafı tamamen görünüğünde, son noktalama işareti büyüyüp soluyor — mektubun son nefesi. 2.5 saniye sonra "mektup zinciri" bağlantısı fade-in ile belirir.

#### Mürekkep Yaşlanması
Eski mektupların mürekkebi daha soluk (opacity tarih bazlı hesaplanır). En yeni mektup en koyu, en eski en soluk.

#### Palimpsest
Yazı sayfalarında önceki mektubun içeriği çok soluk olarak arka planda görünür — tıpkı gerçek bir palimpsest gibi.

#### Yazarın Eli
Yazı alanları üzerinde özel cursor:
- **Manuscript tema**: Mürekkepli kalem ucu (SVG)
- **Void tema**: Tüy kalem / quill (SVG)

#### El Yazısı Efektleri
- **Wobble**: SVG `feTurbulence` filtresi ile organik el yazısı titremesi
- **Breathe**: Metnin opacity'sinin hafifçe pulse etmesi (3.5s döngü)
- **Scribble**: Üstü çizili kelimeler (karalama efekti)
- **Faded ink**: Soluk mürekkep kelimeleri
- **Drop-cap**: Büyük ilk harf (gazete stili)

#### Sayfa Geçiş Animasyonları
Dahili link tıklamalarında:
1. Mevcut sayfa fade-out (0.3s)
2. `sessionStorage` flag set
3. Yeni sayfa fade-in (0.45s)

Harici linkler, `target="_blank"`, Ctrl/Cmd+click atlanır.

---

### Ses Tasarımı

Tüm sesler **Web Audio API** ile programatik olarak üretilir (dosya yok):

| Ses | Tetikleyici | Açıklama |
|-----|-------------|----------|
| Kağıt hışırtısı | Slider navigasyon | 0.18s, bandpass filtreli noise |
| Mühür kırılma | Mühür tıklama | Keskin transient + rezonans |
| Tema geçişi | Tema toggle | Düşük frekans sine sweep (80→300Hz) |

---

### Sayfalar

#### Anasayfa (`index.html`)
1. **Awakening**: Siyah ekran 3 saniyede açılır
2. **Hero**: "münzevi" harfleri tek tek belirir (2.4s)
3. **Whisper**: Günün kavramı veya rastgele mısra
4. **Rüzgara bırakılan sayfa**: Günlük featured alıntı
5. **Defter slider'ı**: Yatay kaydırmalı mektup kartları
6. **Uçak yolu**: Slider navigasyonu, animasyonlu uçak

#### Kavram Virdi (`/kavramlar/`)
9 kavram, her biri:
- Arapça yazılış + Türkçe karşılık + öz anlam
- Tarihli katmanlı anlamlar
- İlişkili mektup bağlantıları
- SVG zihin haritası (düğüm + bağlantı)

**Kavramlar**: sekîne, sûveyda, firkat, vuslat, hicran, münzevi, vird, garâbet, tefekkür

#### Muhataplar (`/muhataplar/`)
Mektuplardaki 5 muhatap:
- **Sûveyda** — gönlün en derin noktası
- **Hira** — ilk vahyin mağarası
- **Cavidan** — ebedî, sonsuz olan
- **Acize** — âciz kalan, teslim olan
- **Hemdem** — sırdaş, nefes arkadaşı

#### Sual Defteri (`/sual/`)
17 felsefi soru. Cevapsız — düşündürmek için.

#### Defterin Sırrı (`/sir/`)
35 gizli kelimenin takip sayfası. Kelimeler mektuplarda gizli mürekkeple yazılı. Bulunan kelimeler cümledeki yerini doldurur.

---

### Tasarım Paneli

Sol alt köşedeki ⚙ butonu ile erişilir. Geliştirme ve özelleştirme aracı:

**Tipografi**: 20+ font seçeneği (el yazısı, kaligrafik, serif, Arapça), boyut, satır aralığı, metin genişliği, başlık boyutu

**Süsleme**: 11 kenarlık seçeneği, kenarlık pozisyon/boyut/opaklık, cüz gülü göster/gizle, ara tezhip göster/gizle, pul pozisyon/boyut

**Efekt kontrolleri** (açık/kapalı):
| Efekt | Varsayılan |
|-------|-----------|
| Sis efekti | Açık |
| Okuma izi | Açık |
| Kahve lekeleri | Açık |
| Son nefes | Açık |
| Yazarın eli (cursor) | Açık |
| Sayfa geçişi | Açık |
| İmza döngüsü | Açık |
| El yazısı titremesi | Açık |
| Nefes efekti | Açık |
| Yıldızlı gece | Açık |

**Daktilo**: Açık/kapalı + hız (10-100ms)

**Arka plan**: 6 renk seçeneği (krem, açık krem, beyaz, sarımsı, gri krem, parşömen)

---

### Veri Depolama

Tüm kullanıcı verileri tarayıcıda (`localStorage`) saklanır:

| Anahtar | Değer | Açıklama |
|---------|-------|----------|
| `munzevi-theme` | manuscript / void | Tema tercihi |
| `munzevi-stamps` | JSON dizi | Toplanan pul kimlikleri |
| `munzevi-journey` | JSON dizi | Okuma yolculuğu (id + timestamp) |
| `munzevi-opened-seals` | JSON dizi | Açılan mühür sayfa numaraları |
| `munzevi-visited` | "1" | İlk ziyaret flag'i |
| `munzevi-last-read` | metin | Son okunan mektup başlığı |
| `munzevi-secret-words` | JSON dizi | Bulunan gizli kelimeler |
| `munzevi-reading-traces` | JSON obje | Sayfa bazlı okuma ilerlemesi |
| `munzevi-typewriter` | on / off | Daktilo efekti tercihi |
| `munzevi-typewriter-speed` | sayı (ms) | Daktilo hızı |
| `munzevi-fx-{efekt}` | off | Efekt devre dışı bırakma |
| `munzevi-halvet-time` | sayı (saniye) | Halvethâne birikimli süre |

---

### Renk Paleti

**Manuscript (Aydınlık)**:
- Arka plan: `#f4ede3` (krem)
- Kağıt: `#faf6ed` (açık krem)
- Metin: `#2c1810` (koyu kahve)
- Vurgu: `#8b0000` (koyu kırmızı)
- Mürekkep: `#1a0f0a` (siyaha yakın)

**Void (Karanlık)**:
- Arka plan: `#080706` (siyaha yakın)
- Kağıt: `#121010` (koyu gri)
- Metin: `#c9b99a` (sıcak bej)
- Vurgu: `#d4a373` (altın)
- Mürekkep: `#e8dcc8` (açık krem)

**Mühür Renkleri** (6 varyasyon):
`#8b0000` · `#6b1020` · `#5a2d0c` · `#4a1942` · `#7a6520` · `#2d4a3a`

---

### Okuyucu Yolculuğu

```
İlk Ziyaret
    │
    ▼
Awakening (karanlıktan ışığa, 3s)
    │
    ▼
Hero ("münzevi" harfleri belirir)
    │
    ▼
Hoşgeldin Sayfası (slider'da ilk kart)
    │
    ▼
Mühür Kır → Mektup Oku → Pul Kazan
    │
    ├──→ Gizli kelimeleri ara (metin seçerek)
    ├──→ Void modunu keşfet (yıldızlar, mum ışığı)
    ├──→ Gece şiirlerini bekle
    ├──→ Ay'a tıkla → Dolunay sırrını bekle
    ├──→ Kavramları keşfet
    ├──→ Mürekkep damlalarına tıkla
    │
    ▼
Koleksiyon: Pullar + Ayak İzleri + Takımyıldızın
    │
    ▼
Defterin Sırrı: 35 kelimeyi bul, cümleyi tamamla
    │
    ▼
Mühürlü Mektup: Yeterli pul topla, son mektubu aç
    │
    ▼
Halvethâne: Sessizlikte bekle → Katmanlar açılır
    │
    ▼
Rüya Defteri: Gece yarısı gel, surreal montajı oku
    │
    ▼
Abyss: Sayfanın en dibine in → "halvethâne" kapısı
```

---

### Teknik Notlar

**Platform**: Jekyll 4.4 + GitHub Pages (GitHub Actions ile deploy)
**Font**: Caveat (el yazısı), EB Garamond (serif)
**Ses**: Web Audio API (programatik, dosyasız)
**Veri**: localStorage (sunucu tarafı yok)
**Responsive**: 768px breakpoint ile mobil uyum
**Performans**: Typewriter lazy loading, IntersectionObserver

---

### Yeni Mektup Ekleme

```markdown
---
title: "mektup başlığı"
date: 2024-05-15
stamp_image: "benzersiz-pul-id"
---

Mektup içeriği buraya...

Gizli kelime eklemek için:
<span class="secret-ink" data-secret="kelime">kelime</span>
```

**Özel özellikler** (isteğe bağlı):
```yaml
is_nocturnal: true          # sadece gece okunabilir
sealed: true                # mühürlü (pul gerektiren)
arrives: "2024-06-01"       # yolda olan mektup
kenarlik: "kenarlik-3.png"  # sağ kenarlık süslemesi
emotional: true             # gözyaşı izleri efekti
```

---

*bu defter sana ait. kapat ve kalbine koy.*

— münzevî
