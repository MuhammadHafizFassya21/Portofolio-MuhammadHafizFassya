# 🛡️ Laporan Audit Keamanan Menyeluruh (Security Audit Report)
**Target Proyek:** Website Portofolio Muhammad Hafiz Fassya (`MyPortofolio`)  
**Metodologi:** `security-audit` Skill Framework  
**Tanggal Audit:** 8 Oktober 2026  
**Status Evaluasi:** Selesai (Temuan Membutuhkan Tindakan Perbaikan)

---

## Executive Summary

Audit keamanan menyeluruh telah dilakukan pada repositori website portofolio (`MyPortofolio`) dengan memfokuskan pemindaian pada 4 domain utama:
1. **Secrets & Credentials Management**
2. **Input & Form Security (XSS & Bot Mitigation)**
3. **Dependency Vulnerability Assessment**
4. **HTTP Security Headers & Server Hardening**

### Ringkasan Tingkat Keparahan Temuan (Severity Breakdown)

| Tingkat Keparahan | Jumlah | Deskripsi Area Utama |
| :--- | :---: | :--- |
| 🔴 **Critical** | 3 | Kerentanan dependensi tingkat kritis (`proxy-addr`, `shell-quote`), potensi remote bypass/injection. |
| 🟠 **High** | 7 | **DOM-based XSS** pada formulir CRUD Mahasiswa (`saveStudent` & `renderStudents`), 6 paket dependensi berstatus High, dan kerentanan Vite/Rollup pada `react-island`. |
| 🟡 **Medium** | 6 | Ketiadaan HTTP Security Headers di [vercel.json](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/vercel.json), CORS wildcard (`origin: true`), information leakage di endpoint error response. |
| 🔵 **Low / Info** | 5 | Tidak adanya CSRF / Honeypot pada kontak Formspree, dependensi outdated minor, ketiadaan Subresource Integrity (SRI) pada CDN eksternal, `target="_blank"` tanpa `rel="noreferrer"`. |

---

## 1. Secrets & Credentials

### Temuan 1.1: Pemeriksaan File Lingkungan (`.env`) & Git Tracking
- **Status:** ✅ **Aman (Tidak Ada Kunci Terbuka / Leaked Key)**
- **Hasil Pemindaian:**
  - File [.env](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/.env) hanya berisi placeholder (`GEMINI_API_KEY=` dan `OPENAI_API_KEY=`).
  - File [.gitignore](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/.gitignore) telah mencantumkan `.env` pada baris ke-2.
  - Pemeriksaan riwayat commit (`git log --all --full-history -- .env`) mengonfirmasi bahwa file `.env` **tidak pernah ter-commit** ke Git history.
- **Rekomendasi Tambahan (Preventif):**
  - Buat file `.env.example` sebagai referensi agar kolaborator atau developer lain tidak bingung format variabel lingkungan yang dibutuhkan, tanpa mengekspos file `.env` lokal.

### Temuan 1.2: Pemindaian Kode Frontend (Static Assets & JS)
- **Status:** ✅ **Aman dari API Key Rahasia**
- **Hasil Pemindaian:**
  - File [js/script.js](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/js/script.js), [js/ai-career.js](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/js/ai-career.js), dan [js/buildMetricsPayload.js](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/js/buildMetricsPayload.js) tidak menyimpan token otentikasi rahasia.
  - Request ke AI provider (Gemini / OpenAI) dilakukan melalui backend serverless route (`/api/ai-insights`), bukan langsung dari browser pengguna.
  - Endpoint publik pihak ketiga yang terpasang di client-side:
    - Formspree endpoint ID: `https://formspree.io/f/xldyprek` (pada [index.html](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/index.html#L4230))
    - Umami Analytics website ID: `52488882-a7f8-4228-878e-e1a8adb36eba` (pada [index.html](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/index.html#L19))
    *Keduanya merupakan ID publik yang sah digunakan di frontend, namun perlu dibatasi domain pengirimnya dari dashboard masing-masing.*

### Temuan 1.3: Information Leakage pada Error Handling Server (🟡 Medium)
- **Lokasi Sumber:** [server/routes/aiInsights.ts:46](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/server/routes/aiInsights.ts#L46)
- **Kode Bermasalah:**
  ```typescript
  res.status(500).json({
      error: 'Internal server error',
      message: 'Gagal menghasilkan insights.',
      details: err.message, // Send detailed error for debugging
  });
  ```
- **Analisis Dampak:**
  Jika pemanggilan ke Google Generative AI atau OpenAI mengalami kegagalan (misalnya karena kuota, kesalahan payload, atau invalid credentials), `err.message` dari SDK pihak ketiga dapat mencantumkan URL endpoint internal, header permintaan, atau detail parameter server yang sensitif.
- **Rekomendasi Perbaikan:**
  Jangan pernah mengirim `err.message` mentah ke klien di lingkungan production. Kembalikan kode error generik dan simpan log detail hanya di sisi server.

---

## 2. Input & Form Security

### Temuan 2.1: DOM-based Cross-Site Scripting (XSS) pada Fitur CRUD Mahasiswa (🟠 High)
- **Lokasi Sumber:** 
  - Input: [index.html:4502-4538](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/index.html#L4502-L4538) (`#studentForm`)
  - Logika Simpan: [js/script.js:2415-2437](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/js/script.js#L2415-L2437) (`saveStudent`)
  - Logika Render: [js/script.js:2316-2346](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/js/script.js#L2316-L2346) (`renderStudents`)
- **Mekanisme Celah:**
  Fungsi `saveStudent()` mengambil nilai dari form input tanpa sanitasi:
  ```javascript
  const name = document.getElementById('studentName').value;
  const nim = document.getElementById('studentNim').value;
  const major = document.getElementById('studentMajor').value;
  ```
  Kemudian, di dalam `renderStudents()`:
  ```javascript
  filtered.forEach(s => {
    const initial = s.name.charAt(0).toUpperCase();
    const item = document.createElement('div');
    item.className = "...";
    item.innerHTML = `
      ...
      <h4 class="text-white font-medium group-hover:text-[#38bdf8] transition-colors">${s.name}</h4>
      ...
      <span class="flex items-center gap-1"><i class="fas fa-id-card"></i> ${s.nim}</span>
      <span class="flex items-center gap-1"><i class="fas fa-graduation-cap"></i> ${s.major}</span>
      ...
    `;
    list.appendChild(item);
  });
  ```
- **Skenario Eksploitasi (Proof of Concept):**
  Jika pengguna memasukkan payload berikut ke dalam field "Nama Lengkap":
  ```html
  <img src="x" onerror="alert(document.domain)">
  ```
  Nilai tersebut akan langsung diinjeksi ke dalam DOM melalui template literal `item.innerHTML`. Browser akan segera mengeksekusi script JavaScript penyerang. Pada konteks yang lebih luas, penyerang dapat mencuri cookie, token sesi, atau mengubah tampilan halaman secara sepihak.
- **Rekomendasi Perbaikan:**
  Gunakan fungsi escape karakter HTML khusus (`escapeHtml`) atau gunakan properti DOM yang aman (`textContent`) sebelum memasukkan variabel pengguna ke dalam template HTML:
  ```javascript
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  ```

### Temuan 2.2: Ketiadaan Proteksi Bot / Spam pada Formulir Kontak Formspree (🔵 Low)
- **Lokasi Sumber:** [index.html:4230](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/index.html#L4230) dan [js/script.js:175-223](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/js/script.js#L175-L223)
- **Analisis Dampak:**
  Formulir kontak langsung mengirimkan POST request ke Formspree tanpa mekanisme:
  1. **Honeypot field** (field tersembunyi untuk menjebak bot otomatis).
  2. **Rate limiting / cooldown submit di sisi frontend** (mencegah klik berkali-kali).
  3. **Batasan panjang karakter (`maxlength`)** pada field `name`, `_replyto`, dan `message`.
  Akibatnya, skrip otomasi spammer dapat membanjiri kotak masuk email pemilik portofolio dan dengan cepat menghabiskan kuota gratis Formspree bulanan.
- **Rekomendasi Perbaikan:**
  1. Tambahkan honeypot field pada HTML form:
     ```html
     <input type="text" name="_gotcha" style="display:none !important" tabindex="-1" autocomplete="off">
     ```
  2. Tambahkan atribut `maxlength` pada input:
     - `name`: `maxlength="100"`
     - `_replyto`: `maxlength="100"`
     - `message`: `maxlength="2000"`

### Temuan 2.3: CORS Permissive Misconfiguration pada API Server (🟡 Medium)
- **Lokasi Sumber:** [api/index.ts:10-14](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/api/index.ts#L10-L14)
- **Kode Bermasalah:**
  ```typescript
  app.use(cors({
      origin: true, // allow all origins in dev
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
  }));
  ```
- **Analisis Dampak:**
  Pengaturan `origin: true` merefleksikan nilai header `Origin` dari klien mana pun secara otomatis (`Access-Control-Allow-Origin: *` atau requesting origin). Jika backend ini diakses di production, website berbahaya dapat memicu request LLM generation ke endpoint `/api/ai-insights` dari browser pengguna lain dan menghabiskan kuota API key server.
- **Rekomendasi Perbaikan:**
  Batasi origin hanya ke domain portofolio resmi di production:
  ```typescript
  const allowedOrigins = [
      'https://hafiz-portfolio.vercel.app', // Sesuaikan dengan domain live Anda
      'http://localhost:5173',
      'http://localhost:5174',
  ];
  app.use(cors({
      origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
          } else {
              callback(new Error('Blocked by CORS policy'));
          }
      },
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
  }));
  ```

---

## 3. Dependency Vulnerability Assessment

Hasil pemindaian otomatis `npm audit` menunjukkan adanya paket-paket pihak ketiga yang memiliki catatan celah keamanan (CVE / GHSA):

### A. Root Workspace ([package.json](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/package.json))
**Total Kerentanan:** 14 (3 Critical, 6 High, 4 Moderate, 1 Low)

| Paket | Tingkat | ID Advisory | Deskripsi Kerentanan |
| :--- | :---: | :--- | :--- |
| `proxy-addr` (1.1.0 - 2.0.7) | 🔴 **Critical** | [GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) | IP spoofing via IPv4-mapped IPv6 trust subnet. |
| `shell-quote` (<=1.8.4) | 🔴 **Critical** | [GHSA-w7jw-789q-3m8p](https://github.com/advisories/GHSA-w7jw-789q-3m8p) | Command injection via unescaped newlines in `.op` values; Quadratic DoS. (Dependensi dari `concurrently`). |
| `postcss` (<=8.5.22) | 🟠 **High** | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)<br>[GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | XSS via unescaped `</style>` & path traversal/arbitrary file read via sourceMappingURL. |
| `browserslist` (<=4.28.6) | 🟠 **High** | [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) | Unbounded memory growth (OOM DoS) & prototype write crash. |
| `path-to-regexp` (<0.1.13) | 🟠 **High** | [GHSA-37ch-88jc-xwx2](https://github.com/advisories/GHSA-37ch-88jc-xwx2) | Regular Expression Denial of Service (ReDoS) via multiple route parameters. |
| `nanoid` (<=3.3.17) | 🟠 **High** | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | Infinite loop & integer overflow pada non-secure / custom generator. |
| `body-parser` & `qs` | 🟡 **Moderate** | [GHSA-v422-hmwv-36x6](https://github.com/advisories/GHSA-v422-hmwv-36x6) | Silent size enforcement bypass & arrayLimit DoS. |

### B. Sub-project ([react-island/package.json](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/react-island/package.json))
**Total Kerentanan:** 16 (11 High, 3 Moderate, 2 Low)

| Paket | Tingkat | ID Advisory | Deskripsi Kerentanan |
| :--- | :---: | :--- | :--- |
| `vite` (7.0.0 - 7.3.3) | 🟠 **High** | [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9)<br>[GHSA-v2wj-q39q-566r](https://github.com/advisories/GHSA-v2wj-q39q-566r)<br>[GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583) | Path traversal pada `.map`, bypass `server.fs.deny`, dan arbitrary file read via dev server websocket. |
| `rollup` (4.0.0 - 4.58.0) | 🟠 **High** | [GHSA-mw96-cpmx-2vgc](https://github.com/advisories/GHSA-mw96-cpmx-2vgc) | Arbitrary File Write via Path Traversal. |
| `minimatch` & `picomatch` | 🟠 **High** | [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26) | ReDoS via repeated wildcard pattern matching. |

### Langkah Perbaikan Dependensi:
Jalankan perintah berikut di terminal:
```bash
# 1. Update paket pada root project
npm audit fix

# 2. Update paket pada sub-project react-island
cd react-island
npm audit fix
cd ..
```

---

## 4. HTTP Security Headers & Server Hardening

### Temuan 4.1: Konfigurasi Header Keamanan pada `vercel.json` Kosong (🟡 Medium)
- **Lokasi Sumber:** [vercel.json](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/vercel.json)
- **Analisis Dampak:**
  Saat ini `vercel.json` hanya berisi aturan `rewrites`. Tidak ada HTTP header keamanan yang dikirimkan ke peramban pengguna saat mengakses website portofolio. Hal ini meninggalkan celah bagi serangan:
  - **Clickjacking**: Situs dapat disematkan ke dalam `<iframe>` di situs jahat.
  - **MIME-Sniffing**: Browser dapat salah menginterpretasikan tipe file yang diunggah.
  - **XSS & Injection**: Tidak ada Content-Security-Policy (CSP) yang membatasi asal sumber script.
  - **Information Leaks**: Header `Referrer` memuat URL lengkap ke situs eksternal.

- **Rekomendasi Perbaikan Konfigurasi `vercel.json`:**
  Tambahkan blok `"headers"` dengan konfigurasi standar keamanan industri:
  ```json
  {
      "version": 2,
      "headers": [
          {
              "source": "/(.*)",
              "headers": [
                  {
                      "key": "X-Content-Type-Options",
                      "value": "nosniff"
                  },
                  {
                      "key": "X-Frame-Options",
                      "value": "DENY"
                  },
                  {
                      "key": "X-XSS-Protection",
                      "value": "1; mode=block"
                  },
                  {
                      "key": "Referrer-Policy",
                      "value": "strict-origin-when-cross-origin"
                  },
                  {
                      "key": "Permissions-Policy",
                      "value": "camera=(), microphone=(), geolocation=(), payment=()"
                  },
                  {
                      "key": "Strict-Transport-Security",
                      "value": "max-age=63072000; includeSubDomains; preload"
                  },
                  {
                      "key": "Content-Security-Policy",
                      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cloud.umami.is; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://formspree.io https://cloud.umami.is http://localhost:5174; frame-ancestors 'none';"
                  }
              ]
          }
      ],
      "rewrites": [
          {
              "source": "/api/(.*)",
              "destination": "/api/index.ts"
          },
          {
              "source": "/(.*)",
              "destination": "/$1"
          }
      ]
  }
  ```

### Temuan 4.2: Express Server Header Hardening (`X-Powered-By` Disclosure)
- **Lokasi Sumber:** [api/index.ts](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/api/index.ts)
- **Analisis Dampak:**
  Secara default, Express mengembalikan header `X-Powered-By: Express`. Informasi ini membantu penyerang mengidentifikasi teknologi backend yang digunakan untuk menargetkan exploit CVE Express tertentu.
- **Rekomendasi Perbaikan:**
  1. Pasang paket `helmet` (`npm i helmet`) atau nonaktifkan header secara manual:
     ```typescript
     app.disable('x-powered-by');
     ```
  2. Atau pasang middleware `helmet()` di [api/index.ts](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/api/index.ts):
     ```typescript
     import helmet from 'helmet';
     app.use(helmet());
     ```

---

## 5. Temuan Tambahan (Good Practices & Architecture)

### Temuan 5.1: In-Memory Rate Limiter di Lingkungan Serverless (🟡 Medium)
- **Lokasi Sumber:** [server/lib/rateLimit.ts:7](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/server/lib/rateLimit.ts#L7)
- **Mekanisme:** Menggunakan `const store = new Map<string, RateLimitEntry>()`.
- **Analisis Dampak:**
  Ketika dideploy ke Vercel Serverless Functions (`/api/index.ts`), instance serverless bersifat stateless dan dinamis (cold-start / ephemeral). Setiap instance memiliki memorinya sendiri, sehingga IP yang melakukan brute-force request dapat dialihkan ke instance serverless baru tanpa terblokir oleh in-memory rate limiter lokal.
- **Rekomendasi Perbaikan:**
  Untuk lingkungan serverless production yang membutuhkan proteksi ketat dari konsumsi kuota OpenAI/Gemini, gunakan Redis terdistribusi berbasis HTTP seperti **Upstash Redis** (`@upstash/ratelimit`).

### Temuan 5.2: Tautan Eksternal `target="_blank"` Tanpa `rel="noopener noreferrer"` (🔵 Low)
- **Lokasi Sumber:** 
  - [index.html](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/index.html) (beberapa link sosial media dan demo proyek).
  - [js/script.js:1228-1234](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/js/script.js#L1228-L1234) (tombol link Live Demo pada modal).
- **Analisis Dampak:**
  Tautan eksternal yang membuka tab baru tanpa `rel="noopener noreferrer"` berisiko terhadap serangan *Reverse Tabnabbing*, di mana halaman tujuan yang tidak dipercaya dapat memanipulasi objek `window.opener` untuk mengarahkan halaman asal ke situs phising.
- **Rekomendasi Perbaikan:**
  Pastikan setiap tag `<a target="_blank">` dilengkapi atribut:
  ```html
  rel="noopener noreferrer"
  ```

### Temuan 5.3: Pemuatan Tailwind CDN di Lingkungan Produksi (🔵 Low)
- **Lokasi Sumber:** [index.html:12](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/index.html#L12)
  ```html
  <script src="https://cdn.tailwindcss.com"></script>
  ```
- **Analisis Dampak:**
  Script `cdn.tailwindcss.com` ditujukan eksklusif untuk prototyping cepat karena melakukan kompilasi CSS JIT di browser pengguna. Pemuatan skrip tanpa atribut integritas (`integrity`) juga rentan terhadap insiden supply-chain CDN.
- **Rekomendasi Perbaikan:**
  Build CSS Tailwind secara statis menggunakan PostCSS/Tailwind CLI bawaan proyek (paket `tailwindcss` versi 4 sudah tersedia di devDependencies) lalu import file CSS hasil build lokal.

---

## 6. Action Plan & Prioritas Remediasi (Roadmap)

### Prioritas 1 — Segera (Hari Ini):
1. **Perbaiki Celah DOM XSS di [js/script.js](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/js/script.js)**: Tambahkan sanitasi `escapeHtml()` pada fungsi `renderStudents`.
2. **Jalankan `npm audit fix`**: Lakukan mitigasi otomatis untuk dependensi dengan advisory critical/high di root dan `react-island`.
3. **Perbarui [vercel.json](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/vercel.json)**: Terapkan HTTP Security Headers (`X-Frame-Options`, `X-Content-Type-Options`, `CSP`, `HSTS`).

### Prioritas 2 — Jangka Pendek (1-3 Hari):
1. **Perketat CORS & Error Handling di [api/index.ts](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/api/index.ts)**: Ganti `origin: true` dengan whitelist domain resmi portofolio dan sembunyikan `err.message` detail pada response 500.
2. **Amankan Formulir Kontak**: Tambahkan atribut `maxlength` dan honeypot field pada formulir Formspree di [index.html](file:///c:/Users/user/Documents/PROJECT/MyPortofolio/index.html).
3. **Audit Link Eksternal**: Tambahkan `rel="noopener noreferrer"` pada semua elemen `target="_blank"`.

### Prioritas 3 — Pemeliharaan Rutin:
1. Migrasikan pemanggilan `cdn.tailwindcss.com` ke file CSS yang terkompilasi statis.
2. Pertimbangkan Upstash Redis jika kuota serverless AI di masa depan perlu dibatasi secara persisten.

---
*Laporan ini dihasilkan secara otomatis melalui proses pengujian statis dan dinamis dengan panduan keamanan `security-audit`.*
