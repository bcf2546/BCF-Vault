# 🐔 BCF Vault — ระบบจัดการห้องเย็น

> ระบบจัดการสต็อกและผังห้องเย็นสำหรับ **Black Chicken Farm** (ฟาร์มไก่ดำ จ.กาญจนบุรี)

[![Edition](https://img.shields.io/badge/Edition-2026.5-c9a961?style=flat-square)](https://bcf2546.github.io/BCF-Vault/)
[![Build](https://img.shields.io/badge/Build-20260507--0056-1a3a7a?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Private-c0392b?style=flat-square)](#)

🌐 **Live:** https://bcf2546.github.io/BCF-Vault/

---

## 📖 ภาพรวม

BCF Vault เป็น web app สำหรับจัดการห้องเย็น 4 ห้องในฟาร์มไก่ดำ — รวม **178 ช่องเก็บของ** ติดตามสินค้า, LOT, วันหมดอายุ, รับ-เบิก, ออกใบเสร็จ และรายงาน

### ✨ ฟีเจอร์หลัก

| ส่วน | รายละเอียด |
|-----|-----------|
| 🗺️ **ผังห้องเย็น** | ดู 178 ช่องใน 4 ห้องแบบ grid · สถานะแสดงด้วยสีตาม LOT/หมดอายุ |
| 📊 **Dashboard** | สรุปยอดรวม, ใกล้หมดอายุ, ยอดขาย 7/30 วัน |
| 📋 **สรุปสินค้า** | รายการสินค้าทั้งหมด · กรองตามสถานะ |
| 🃏 **Flash Card** | Pinterest-style masonry · ดูภาพรวมสินค้าแต่ละ LOT |
| 🔍 **ค้นหา** | ค้นชื่อสินค้า · ดูตำแหน่งทั้งหมด |
| 🕐 **ประวัติ** | บันทึกการเปลี่ยนแปลงทุกครั้ง |
| 📦 **รับ-เบิก** | บันทึกการรับเข้า / เบิกออก พร้อม slip ใบเบิก |
| 🔄 **ย้ายของ** | ย้ายสินค้าระหว่างช่อง |
| 🧾 **ออกใบเสร็จ** | ระบบขายเต็มรูปแบบ · พิมพ์/ส่ง LINE |
| 📈 **รายงาน** | Stock report, Sales report (เดือน/สัปดาห์/ปี) |
| 👥 **ลูกค้า + 📦 สินค้า** | Master data |

### 🌡️ ห้องเย็นทั้งหมด

| ID | ชื่อ | จำนวนช่อง | หมายเหตุ |
|---|------|---------|---------|
| `room1` | ห้องเย็นเบอร์ 1 | 86 | มีทางเดินคอลัมน์ AA, AB |
| `room2f1` | ห้องเย็นเบอร์ 2 ชั้น 1 | 51 | DOOR คอลัมน์ C, D |
| `room2f2` | ห้องเย็นเบอร์ 2 ชั้น 2 | 29 | — |
| `room5` | ห้องเย็นเบอร์ 5 | 12 | Door ด้านล่าง |

---

## 🎨 Design System

### Palette
```
Navy        #0a1f44   ← ฐานหลัก, header, primary actions
Navy 2      #152d5e   ← gradient mid
Navy 3      #1a3a7a   ← gradient light
Gold        #c9a961   ← accent หลัก (premium feel)
Gold Light  #d4b97a
Gold Dark   #a8893f
Cream       #faf7f0   ← พื้นหลัง content
Cream Deep  #f4ede0
Ivory       #f7f4ec
```

### Typography
- **Cormorant Garamond** (serif) — ชื่อหัวข้อ, brand title
- **Sarabun** (sans-serif) — ตัวเนื้อ, ตัวเลข, UI
- **Plus Jakarta Sans** — ป้ายกำกับ

### หลักการออกแบบ
- **Airy minimal** — ใช้ negative space แทนกรอบหนา
- **Gold accents only** — ทองใช้สำหรับ highlight, active state, brand
- **Borderless cards** — ใช้ shadow บาง ๆ แทน border ตัด
- **Tabular numerals** — ตัวเลขใน statistics เรียงเท่ากันทุกแถว

---

## 🛠️ Architecture

### Tech Stack
```
Frontend:  Single HTML file (~630 KB)
           Vanilla JavaScript (no framework)
           CSS Grid + Flexbox + columns
           Inline base64 favicons + logo

Backend:   Google Sheets (data store)
           Google Apps Script (REST endpoint)
           
Hosting:   GitHub Pages (free, public repo)
           Cloudflare DNS

PWA:       Add to Home Screen (iOS + Android)
           manifest.json + apple-touch-icons
```

### Single-file philosophy
ทั้งระบบเป็น **`index.html` ไฟล์เดียว** ขนาด ~630 KB:
- ไม่มี build step / bundler
- ไม่มี npm dependencies
- favicon + logo ฝังเป็น base64 inline
- เปิดในเบราว์เซอร์ได้ทันที (offline-friendly)

### Data Flow
```
┌───────────┐  pushToSheets()   ┌──────────────┐  doPost()  ┌──────────┐
│  Browser  │ ─────────────────► │ Apps Script  │ ─────────► │  Google  │
│ index.html│ ◄───────────────── │  Web API     │ ◄────────  │  Sheets  │
└───────────┘ pullFromSheets()  └──────────────┘  doGet()   └──────────┘
     │                                                            ▲
     │ localStorage (cache)                                        │
     └────────────────► daily backup trigger ──────────────────────┘
                       (Backup_yyyy_MM_dd tabs)
```

### Sheet Schema (`BCFData_v2`)
**Row-per-cell** schema (สามารถเก็บข้อมูลขนาดใหญ่ได้):
```
| key (room_col_row) | itemsJSON (stringified array) | updatedAt |
| room1_A_1          | [{name,lot,qtys,note,...}]   | timestamp |
```

---

## 📱 Responsive Breakpoints

| ขนาดจอ | Range | Devices |
|--------|-------|---------|
| Tiny phone | ≤360px | iPhone SE 1st gen |
| Phone | 361-640px | iPhone all current models |
| Phone landscape | 641-767px | iPhone landscape |
| iPad portrait (narrow) | 768-900px | iPad Mini, iPad regular portrait |
| iPad portrait (wide) | 901-1023px | iPad Air, iPad Pro 11" portrait |
| iPad Pro 12.9 portrait | 1024-1080px | iPad Pro 12.9" portrait |
| iPad landscape | 1024-1279px | iPad Pro 11" landscape |
| Desktop | ≥1280px | Laptop, Desktop |

### Mobile Adaptations
- ☰ **Hamburger** (≤900px) — เปิด sidebar overlay
- ⋯ **More menu** (≤900px) — รวม CSV/PDF/Print ใน dropdown
- 📱 **Sidebar** — slide-in overlay จาก left
- 📐 **Auto-zoom prevention** — input font ≥16px
- 👆 **Touch-action: manipulation** — ไม่มี delay 300ms
- 🪟 **Modal full-screen** บน iPhone, max 92vh บน iPad

---

## 🔐 Authentication

ระบบ login มี 3 ระดับสิทธิ์:

| Username | รหัส | สิทธิ์ |
|---------|-----|-------|
| `npjsk` | `0923` | Admin — แก้ไขทุกอย่าง |
| `bcf` | `30013` | Staff — แก้ไขทั่วไป |
| `view` | `9999` | Viewer — ดูอย่างเดียว |

- รหัสผ่าน hash ด้วย **SHA-256 + salt** (`bcf-coldroom-2026-xK9m`)
- ไม่มี plaintext password ใน code
- Session เก็บใน `localStorage`

### 🔒 Lock Mode
ผู้ใช้สามารถสลับเป็น "โหมดดูอย่างเดียว" ได้ทุกเมื่อ — ป้องกันการแก้ไขผิดพลาด

---

## 📲 ติดตั้งเป็นแอป (PWA)

### iOS (iPhone / iPad)
1. เปิด Safari → ไปที่ https://bcf2546.github.io/BCF-Vault/
2. กดปุ่ม **Share** (📤)
3. เลือก **Add to Home Screen**
4. กด **Add**

จะได้ icon บน home screen — เปิดเหมือนแอปเต็มจอ ไม่มีแถบ Safari

### Android
1. เปิด Chrome → ไปที่ URL ข้างต้น
2. กด **Install app** ใน address bar
3. หรือกดปุ่ม **📲 ติดตั้งแอป** ใน header

### Desktop (Chrome / Edge)
- กดปุ่ม **📲 ติดตั้งแอป** ใน header
- หรือคลิก install icon ใน address bar

---

## 🚀 การ Deploy

### Setup ครั้งแรก
1. Fork / clone repo
2. ไปที่ **Settings → Pages**
3. Source: `Deploy from a branch`
4. Branch: `main` · Folder: `/ (root)`
5. กด **Save**
6. รอ 1-2 นาที — site จะออนไลน์

### Files ที่ต้อง deploy
```
BCF-Vault/
├── index.html              ← ตัวระบบทั้งหมด (~630 KB)
├── manifest.json           ← PWA config
├── version.json            ← version metadata (สำหรับ auto-update)
├── favicon.ico             ← desktop favicon
├── favicon-192.png         ← Android home screen icon
├── favicon-512.png         ← Android splash screen
├── favicon-maskable-192.png ← Android adaptive icon
├── favicon-maskable-512.png ← Android adaptive icon (large)
├── apple-touch-icon.png    ← iOS home screen icon (180x180)
├── README.md               ← ไฟล์นี้
└── BUMP_VERSION_GUIDE.md   ← วิธี release เวอร์ชันใหม่
```

---

## 📦 Versioning

ใช้รูปแบบ **`Edition YYYY.N`**
- `YYYY` = ปี ค.ศ. (เช่น 2026)
- `N` = ลำดับ release ของปี (เริ่มที่ 1)

**ตัวอย่าง:**
- `Edition 2026.5` = release ที่ 5 ของปี 2026
- `Edition 2027.1` = release แรกของปี 2027

ระบบเปรียบเทียบเวอร์ชัน (internal logic) ใช้ `BCF_VERSION` (เลขลำดับ) — ดู [BUMP_VERSION_GUIDE.md](./BUMP_VERSION_GUIDE.md)

### 🎉 Auto-update
- ทุก ๆ **5 นาที** ระบบเช็ค `version.json` → ถ้ามีใหม่กว่า → แสดงแบนเนอร์ "🎉 มีเวอร์ชันใหม่"
- เช็คซ้ำตอนเปลี่ยน tab → กลับมาที่หน้าเว็บ
- กด **รีโหลดเลย** → cache-bust + reload
- กด pill `Edition 2026.5` ในหัวเว็บ → force check ทันที

---

## 🐛 Known Limitations

| ข้อจำกัด | สาเหตุ | แก้ในอนาคต |
|---------|-------|---------|
| ขนาดไฟล์ HTML 630 KB | inline assets + single-file architecture | ✗ ตั้งใจ (ไม่ต้อง build step) |
| ต้อง online ครั้งแรก | โหลด HTML จาก GitHub Pages | PWA cache ในอนาคต |
| Sync delay ~5 นาที | Apps Script polling | WebSocket / push API |
| ไม่รองรับ dark mode | design ทำมาเฉพาะ light | จะทำในอนาคต |

---

## 🛡️ Security

- ✅ Password hashed (SHA-256 + salt)
- ✅ External links ใช้ `rel="noopener noreferrer"`
- ✅ XSS protection ใน update banner (textContent ไม่ใช่ innerHTML)
- ✅ HTTPS only (GitHub Pages enforces)
- ✅ No third-party tracking / analytics
- ⚠️ Frontend-only auth — ไม่ควรเก็บข้อมูลความลับสูง
- ⚠️ Apps Script endpoint เป็น public — anyone with URL ส่ง request ได้ (รองรับด้วย LockService + validation)

---

## 🤝 ทีมพัฒนา

- **Owner:** [@bcf2546](https://github.com/bcf2546)
- **Email alerts:** bcf.alert@gmail.com
- **AI co-developer:** Claude (Anthropic)

---

## 📜 License

Private — เป็น internal tool ของ Black Chicken Farm
ห้ามเผยแพร่ / clone โดยไม่ได้รับอนุญาต

---

## 📞 Contact

ฟาร์มไก่ดำ (Black Chicken Farm)
300/13 ถ.แสงชูโตเหนือ ต.ท่ามะขาม อ.เมือง จ.กาญจนบุรี 71000

---

<sub>Made with ❄️ and ☕ in Kanchanaburi · Edition 2026.5</sub>
