# Plan: Ubah Slot Booking dari 1 Jam ke 2 Jam

## Status: SELESAI

---

## Analisis Awal

### File yang perlu diubah:
1. `components/BookingSection.tsx` - Halaman booking user
2. `components/admin/ScheduleGrid.tsx` - Grid jadwal di admin dashboard
3. `components/admin/AddBookingForm.tsx` - Form tambah booking admin
4. `components/PublicScheduleGrid.tsx` - Halaman jadwal publik (/schedule)

### Perubahan utama:
- **RAW_SCHEDULE**: Ubah format slot dari 1 jam (contoh: "06.00 - 07.00") menjadi 2 jam (contoh: "06.00 - 08.00")
- **getExpandedSlots function**: Hapus logic yang memecah slot > 1 jam menjadi slot 1 jam
- **hasTimeOverlap function**: Tambah fungsi untuk handle booking lama yang pakai format 1 jam

### Database Migration:
- **TIDAK PERLU MIGRASI** - Kolom `time_slot` sudah bertipe `text`, bisa menampung format apapun

---

## Tasks

### [x] Task 1: Buat file tasksekarang.md dengan plan
- Status: SELESAI
- Tanggal: 2026-03-23

### [x] Task 2: Ubah RAW_SCHEDULE di BookingSection.tsx (user-facing)
- Status: SELESAI
- File: `components/BookingSection.tsx`
- Perubahan:
  - Ubah semua slot dari format 1 jam ke 2 jam
  - Update getExpandedSlots function
  - Update display untuk menampilkan jam dengan benar (slot * 2)
  - Tambah hasTimeOverlap function untuk handle booking lama

### [x] Task 3: Ubah RAW_SCHEDULE di ScheduleGrid.tsx (admin)
- Status: SELESAI
- File: `components/admin/ScheduleGrid.tsx`
- Perubahan:
  - Ubah semua slot dari format 1 jam ke 2 jam
  - Update getExpandedSlots function
  - Tambah hasTimeOverlap function untuk handle booking lama

### [x] Task 4: Ubah RAW_SCHEDULE di AddBookingForm.tsx (admin)
- Status: SELESAI
- File: `components/admin/AddBookingForm.tsx`
- Perubahan:
  - Ubah semua slot dari format 1 jam ke 2 jam
  - Update getExpandedSlots function
  - Tambah hasTimeOverlap function untuk handle booking lama

### [x] Task 5: Ubah RAW_SCHEDULE di PublicScheduleGrid.tsx (/schedule page)
- Status: SELESAI
- File: `components/PublicScheduleGrid.tsx`
- Perubahan:
  - Ubah semua slot dari format 1 jam ke 2 jam
  - Update getExpandedSlots function
  - Tambah hasTimeOverlap function untuk handle booking lama
  - Update display jam (slot * 2)

### [x] Task 6: Verifikasi database tidak perlu migrasi
- Status: SELESAI
- Analisis: Kolom `time_slot` di schema bertipe `text`, format bisa berubah tanpa migrasi
- Hasil: TIDAK PERLU MIGRASI DATABASE

### [x] Task 7: Build test
- Status: SELESAI
- Hasil: Build berhasil tanpa error

---

## Detail Format Slot Baru (2 Jam)

### Sebelum (1 Jam):
```
{ "jam": "06.00 - 07.00", "harga": 450000 }
{ "jam": "07.00 - 08.00", "harga": 450000 }
{ "jam": "08.00 - 09.00", "harga": 450000 }
...
```

### Sesudah (2 Jam):
```
{ "jam": "06.00 - 08.00", "harga": 900000 }  // 2x harga 1 jam
{ "jam": "08.00 - 10.00", "harga": 900000 }  // 2x harga 1 jam
{ "jam": "10.00 - 12.00", "harga": 800000 }  // 2x harga 1 jam
...
```

### Perhitungan Harga:
Harga slot 2 jam = Harga per jam x 2

---

## Fitur hasTimeOverlap

Fungsi baru ditambahkan untuk handle booking lama yang masih pakai format 1 jam:

```javascript
const parseTimeSlot = (slot: string) => {
  const [startStr, endStr] = slot.split(' - ');
  const start = parseFloat(startStr.replace('.', '.'));
  const end = parseFloat(endStr.replace('.', '.'));
  return { start, end };
};

const hasTimeOverlap = (slot1: string, slot2: string): boolean => {
  const { start: s1, end: e1 } = parseTimeSlot(slot1);
  const { start: s2, end: e2 } = parseTimeSlot(slot2);
  return s1 < e2 && s2 < e1;
};
```

Dengan fungsi ini, slot baru 2 jam ("06.00 - 08.00") akan terdeteksi sebagai booked jika ada booking lama dengan format 1 jam ("06.00 - 07.00" atau "07.00 - 08.00").

---

## Progress Log

| Waktu | Task | Status |
|-------|------|--------|
| 2026-03-23 | Task 1 - Buat plan file | SELESAI |
| 2026-03-23 | Task 2 - BookingSection.tsx | SELESAI |
| 2026-03-23 | Task 3 - ScheduleGrid.tsx | SELESAI |
| 2026-03-23 | Task 4 - AddBookingForm.tsx | SELESAI |
| 2026-03-23 | Task 5 - PublicScheduleGrid.tsx | SELESAI |
| 2026-03-23 | Task 6 - Verifikasi DB | SELESAI |
| 2026-03-23 | Task 7 - Build test | SELESAI |

---

## Catatan Tambahan

- Semua booking yang sudah ada di database akan tetap valid karena format time_slot disimpan sebagai text
- Booking lama dengan format 1 jam akan ditandai sebagai booked di slot 2 jam yang overlapping
- Hanya booking BARU yang akan menggunakan format 2 jam