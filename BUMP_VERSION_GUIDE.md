# วิธี Release เวอร์ชันใหม่

ทุกครั้งที่แก้ HTML แล้วอยากให้ผู้ใช้เห็นแบนเนอร์ "มีเวอร์ชันใหม่"

## Edition Numbering Convention
รูปแบบ: `YYYY.N`
- `YYYY` = ปี ค.ศ. (เช่น 2026)
- `N` = ลำดับ release ของปีนี้ (เริ่มที่ 1, เพิ่มทุกครั้งที่ deploy ใหญ่)

ตัวอย่าง:
- `2026.1` = release แรกของปี 2026
- `2026.5` = release ที่ 5 ของปี 2026
- `2027.1` = release แรกของปี 2027 (รีเซ็ตกลับเป็น 1)

ส่วน `version` (เช่น `18.17`) ยังเก็บไว้สำหรับ internal logic — ไม่ต้องเข้าใจมาก แต่ต้องเปลี่ยนทุกครั้งที่ release ใหม่

## ขั้นตอน — แก้ 3 จุด

### 1. ใน `index.html` — บรรทัดต้น script
ค้นหา:
```js
const BCF_VERSION = "18.17";
const BCF_BUILD = "20260507-0056";
const BCF_EDITION = "2026.5";
```

เปลี่ยนเป็น (ตัวอย่าง release ใหม่):
```js
const BCF_VERSION = "18.18";       ← +1
const BCF_BUILD = "20260510-1430"; ← เวลาไทยปัจจุบัน YYYYMMDD-HHMM
const BCF_EDITION = "2026.6";      ← +1 (หรือถ้าข้ามปีก็เป็น 2027.1)
```

### 2. ใน `index.html` — version pill ใน header
ค้นหา:
```html
<span id="bcfVersionLabel" class="bcf-version-pill" ...>Edition 2026.5</span>
```
เปลี่ยนเป็น:
```html
<span id="bcfVersionLabel" class="bcf-version-pill" ...>Edition 2026.6</span>
```

### 3. แก้ `version.json`
```json
{
  "edition": "2026.6",
  "version": "18.18",
  "build": "20260510-1430",
  "buildTime": "2026-05-10T14:30:00+07:00",
  "notes": "อะไรที่แก้ในรอบนี้"
}
```

### 4. Commit ทั้ง 2 ไฟล์ขึ้น GitHub พร้อมกัน
- `index.html`
- `version.json`

## ที่เกิดขึ้นกับผู้ใช้

- ภายใน 5 นาที ผู้ใช้จะเห็นแบนเนอร์: "🎉 มีเวอร์ชันใหม่ Edition 2026.6 — กดเพื่ออัพเดต"
- กด "รีโหลดเลย" → ได้เวอร์ชันใหม่
- คลิกที่ pill "Edition 2026.5" ในหัวเว็บ → force check ทันที
