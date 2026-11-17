# SUBMISSION.md — SILVERBALL → Make.fun "Make the best game" (best-game-01)

Dokumen persiapan submission. **Belum ada yang di-submit.** Semua langkah di bawah
yang mengubah akun / mengirim sesuatu ditandai dan butuh persetujuan user.
Terakhir diperbarui: 17 Nov 2026 ~21:35 WIB.

## 0. Status kesiapan

| Item | Status |
|---|---|
| Game — final verification 12/12 PASS (8 misi → victory, 60 FPS, 0 JS error, 0 external request) | ✅ SIAP |
| Dossier lokal — build deterministik 2x, sha256 sama | ✅ SIAP |
| `check` kit — 4 lolos, 1 gagal, 14 dilewati, 5 dicek saat submit | ✅ (gagalnya wajar, lihat B4) |
| README.md — diperbarui ke angka final (21:12 WIB) | ✅ SIAP |
| Repo GitHub publik + `git init` + commit | ❌ BELUM (Langkah 1) |
| Perbaikan header `main.ts` (0 authored line — lihat B1) | ❌ BELUM (Langkah 2) |
| Badge README + GitHub About | ❌ BELUM (Langkah 3) |
| Bundle transkrip + usage rows | ❌ BELUM (Langkah 4–5) |
| `check` dengan transkrip — harus lolos semua | ❌ BELUM (Langkah 6) |
| Submit | ❌ BELUM — butuh persetujuan eksplisit user (Langkah 7) |

## 1. Deskripsi submission (siap pakai — English)

Untuk README `{description}` dan About repo:

> **SILVERBALL — Save the Last Arcade.** The last old arcade is running out of
> energy, and its Arcade Heart is fading. One pinball table still works. Play
> 8 missions — wake the Heart, rush the bumpers, run the ramp, chase the combo,
> light the jackpot, lock the targets, survive multiball, and pull off the Final
> Revival — to bring the arcade back to life. Three balls. One heart. Save the
> last arcade.

Ringkasan pendek (untuk GitHub About, maks. 269 karakter):

> SILVERBALL — Save the Last Arcade: a one-table pinball game. Wake the Arcade
> Heart across 8 missions.

## 2. Fitur utama (English)

- **8-mission campaign, each with a different goal:** Wake the Heart (5 heart
  hits), Bumper Rush (25 bumpers), Ramp Runner (3 ramp rides), Combo Fever
  (combo x5), Jackpot (light S-I-L, hit the gold target), Target Lock (drop
  A-R-C), Multiball Mayhem (lock 3 balls, score 5,000), Final Revival (one
  ball: Heart x3, bumpers x10, 1 ramp, all targets).
- **Classic pinball table:** 2 flippers, hold-to-charge plunger, 3 bumpers, drop
  targets, rollover lanes, ramp, lock saucer, slingshots, spinner.
- **Multiball, combo multiplier up to x8, jackpot (5,000),** pick-1-of-3 bonus
  after every mission (Extra Ball, Double Score 30 s, Ball Save).
- **Victory screen with grade S/A/B,** final score, accuracy, balls left,
  mission stats; best score saved locally.
- **Full title-screen manual** (GOAL / WIN / LOSE, how-to, mission list,
  controls), pause, mute, restart.
- **Juice:** particles, trauma screen shake, hit-stop, bumper shockwaves,
  floating score text, synthesized WebAudio sound (no audio files).
- **Fully offline:** vanilla JavaScript + HTML5 Canvas, zero libraries, zero
  network requests, 79.5 KB game.

## 3. Kontrol (English)

- **Z / ← / A** — left flipper · **/ / →** — right flipper
- **SPACE (hold, release)** — charge & launch the plunger
- **Mouse / touch** — tap left/right half of the table to flip; hold the plunger
  lane to charge
- **P** — pause · **M** — mute · **R** — restart · **Enter / click** — start ·
  **1 / 2 / 3** — pick bonus

## 4. Daftar file final (terverifikasi 17 Nov 2026 ~21:35 WIB)

| File | Ukuran | Status |
|---|---|---|
| `main.ts` (Node 22, dossier builder; header masih Block Dodger — lihat B1) | 2.291 B | ⚠️ perlu edit header |
| `serve.ts` (server lokal) | 2.612 B | ✅ |
| `LICENSE` (MIT, SPDX-License-Identifier: MIT) | 1.095 B | ✅ |
| `vendor/makefun-game.ts` (tidak berubah, sha256 sama dengan kit starter) | 56.282 B | ✅ |
| `game/index.html` (≤1 MiB) | 963 B | ✅ |
| `game/src/main.js` | 631 B | ✅ |
| `game/src/game.js` | 17.836 B | ✅ |
| `game/src/config.js` | 3.495 B | ✅ |
| `game/src/table.js` | 2.782 B | ✅ |
| `game/src/physics.js` | 8.105 B | ✅ |
| `game/src/missions.js` | 4.748 B | ✅ |
| `game/src/particles.js` | 4.496 B | ✅ |
| `game/src/audio.js` | 3.894 B | ✅ |
| `game/src/input.js` | 3.035 B | ✅ |
| `game/src/render.js` | 26.857 B | ✅ |
| `game/src/rng.js` | 613 B | ✅ |
| `game/src/shots.js` | 2.068 B | ✅ |
| **`game/` total — 13 file** (batas: ≤993 file, ≤48 MiB) | **79.523 B** | ✅ |
| `screenshots/1-cover.jpg` (1280×720, cover) | 101.332 B | ✅ |
| `screenshots/2-title.jpg` (1280×720) | 140.684 B | ✅ |
| `screenshots/3-bonus.jpg` (1280×720) | 66.805 B | ✅ |
| `screenshots/4-victory.jpg` (1280×720) | 63.948 B | ✅ |
| `shots.json` (urutan: cover pertama) | 212 B | ✅ |
| `tests/stage1.js`, `stage2.js`, `stage4.js`, `shots-final.js` | 17.732 B | ✅ |
| `JAM.md`, `README.md`, `SUBMISSION.md` (dokumen) | — | ✅ |
| **Total set commit (29 file + `.gitignore` ≈ 563,2 KB)** | **563.094 B** | ✅ |

**JANGAN ikut commit:** `out/`, `out2/` (build dossier lokal, masing-masing
~1 MB), `.playwright-cli/`, `tests/out/` (5 PNG ~853 KB), `stage1-cover.png`,
`stage1-gameplay.png` (screenshot progres lama). Gunakan `.gitignore` di
Langkah 1 atau `git add` eksplisit di Langkah 3.

## 5. Bukti verifikasi (sudah dilakukan, bukan klaim)

- **Dossier lokal (Node v24.22.1):** `mkdir -p out && MAKEFUN_OUTPUT_DIR=out
  node main.ts` dijalankan 2x — kedua run byte-identik,
  `dossier.json` sha256
  `28769cac4fe8bc26ce07059f6b5d4a89dbe1fde8f5d82b09ac8389f91c731d5b`,
  580.065 B, schema `makefun/dossier/v1`, teks 80.415 B (batas 163.840 B),
  13 file sumber game terdaftar (index.html dulu, lalu main.js, game.js,
  config.js, table.js, physics.js, missions.js, particles.js, audio.js,
  input.js, render.js, rng.js, shots.js).
- **`check` kit** (`node cli/makefun.mjs check --kit . --repo
  ~/workspace/makefun-best-game/silverball --worktree`, dari
  `best-game-01-kit/`): **4 lolos** (`competition_open`, `snapshot`,
  `license_osi`, `entrypoint`), **1 gagal** (`transcripts_present` — wajar:
  belum ada bundle transkrip; perbaikannya adalah bundle, Langkah 5),
  **14 dilewati** (butuh transkrip), **5 dicek saat submit** (`repo_public`,
  `repo_owner`, `repo_created_after_open`, `commit_in_repo`,
  `duplicate_snapshot`). Exit 1, "not ready: fix transcripts_present".
- **Serve lokal:** `node serve.ts` → `http://localhost:8080/index.html` 200
  (963 B), `/src/main.js` 200, `/src/game.js` 200. Game main offline,
  0 external request (terverifikasi 12/12).
- **Final verification 12/12 PASS** (17 Nov 2026 ~21:13 WIB): boot,
  flipper L/R (47 ms), bumper/spinner, 8 misi → victory @229.200, tanpa
  soft-lock, pause/mute, bonus 1-of-3 (ketiga pilihan), multiball 3 bola,
  restart + game over, skor victory == skor tersimpan (cek eksplisit:
  250.000 → victory 258.000 → best tersimpan 258.000, persis), 60 FPS
  1280×720, 0 JS error, 0 external request.
- **Screenshots** dibuat ulang 21:12 WIB dari build final, semua
  `__shotReady=true`, dibaca kembali sebagai gambar (cover: skor 48.210,
  combo x5, BEST 229.200; victory: grade S, ARCADE LEGEND, 173.420).
- **Vendor & entrypoint:** `vendor/makefun-game.ts` sha256
  `dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129`
  identik dengan kit starter; `main.ts` sha256
  `98e7342e091d6f4a7f330386d1e401999881fd2a4538ed6b520cca0e8eef28c8`
  identik dengan kit starter; `LICENSE` sha256
  `babfa6d8ce941605e507993e42790165d6c98c48365eedbdcdd5350ed6e0ed55` (MIT).

## 6. Langkah submission (urut — JANGAN dilewati, JANGAN submit sebelum Langkah 6 lolos)

### Langkah 1 — Buat repo GitHub publik (USER, di github.com)
- Buat repo **publik** baru (mis. nama `silverball`), **tanpa** centang
  "Add a README / .gitignore / license" (repo harus mulai kosong).
  Repo yang dibuat sekarang memenuhi syarat (dibuat setelah kompetisi dibuka
  2026-11-15T18:00:00Z).
- Catat login GitHub + nama repo yang sebenarnya — **jangan ditebak**.
  Handle make.fun `@the-drake` belum tentu sama dengan login GitHub.
- Buat `.gitignore` di `silverball/` (oleh agen, di sesi yang terekam):
  ```
  out/
  out2/
  .playwright-cli/
  tests/out/
  stage1-cover.png
  stage1-gameplay.png
  ```
- `git init` di `silverball/`:
  ```
  cd ~/workspace/makefun-best-game/silverball
  git init -b main
  ```

### Langkah 2 — Perbaiki header `main.ts` (AGEN, di sesi yang terekam, di dalam repo)
**Wajib, sebelum commit.** Header `main.ts` saat ini masih menyebut "Block
Dodger" (game contoh dari starter) dan file ini **tidak pernah ditulis/diedit
di sesi mana pun** — hanya di-`cp` dari starter. Aturan transkrip menuntut
entrypoint (`main.ts`) punya minimal 1 authored line. Perbaikannya: ganti
komentar header (baris 1–8) dengan deskripsi SILVERBALL, kode TIDAK berubah,
dossier TIDAK berubah (main.ts tidak masuk dossier). Teks pengganti:
```
// SILVERBALL — Save the Last Arcade (best-game-01 entry, Node 22, standard library only):
// the game is this directory's game/ folder, plain static files a desktop browser loads offline
// (game/index.html and its ES modules, no library and no network request), and the program hands
// it in. It copies game/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library.
// SILVERBALL: the last old arcade is running out of energy. One pinball table, three balls,
// 8 missions to wake the Arcade Heart — bumpers, ramp, drop targets, rollover lanes, jackpot,
// multiball, combo up to x8, pick-1-of-3 bonus after every mission, grade S/A/B victory.
```
(Pertahankan baris "Serve it locally…" sampai akhir header.)
Lalu verifikasi dossier tidak berubah:
```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts && sha256sum out/dossier.json
# harus tetap 28769cac4fe8bc26ce07059f6b5d4a89dbe1fde8f5d82b09ac8389f91c731d5b
```
**Semua edit file repo harus dilakukan agen di sesi yang terekam — JANGAN edit
lewat web GitHub**, karena baris yang ditulis manusia dihitung melawan gate
transkrip (≥30% authored, ≤40% unwritten).

### Langkah 3 — Badge README + commit + push (AGEN edit file, USER set About)
- Tambahkan di **paling atas** README.md (oleh agen, di sesi yang terekam,
  ganti `<OWNER>`/`<REPO>` dengan nilai asli — **jangan biarkan placeholder**):
  ```
  # silverball

  [![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
  [![rank](https://make.fun/badge/best-game-01/<OWNER>/<REPO>/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
  [![reward](https://make.fun/badge/best-game-01/<OWNER>/<REPO>/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
  ```
  (Template resmi dari requirements; deskripsi + "Run it" sudah ada di README.)
- Tambahkan di **paling bawah** README.md:
  ```
  <sub>Entered on [make.fun](https://make.fun/?ref=<KODE-REFERRAL>&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
  ```
  `<KODE-REFERRAL>` = kode referral make.fun user (lihat halaman akun
  make.fun). Jangan biarkan placeholder.
- Commit + push (file yang di-add eksplisit — jangan `git add -A` tanpa cek):
  ```
  cd ~/workspace/makefun-best-game/silverball
  git add .gitignore JAM.md LICENSE README.md SUBMISSION.md main.ts serve.ts shots.json vendor game screenshots tests
  git status          # pastikan out/, out2/, .playwright-cli/, tests/out/, stage1-*.png TIDAK ikut
  git commit -m "SILVERBALL — Save the Last Arcade (best-game-01 entry)"
  git remote add origin https://github.com/<OWNER>/<REPO>.git
  git push -u origin main
  git rev-parse HEAD  # catat SHA commit ini — dibutuhkan saat submit
  ```
- GitHub About (USER, di halaman repo GitHub → ⚙️ About, atau via `gh`):
  description = `SILVERBALL — Save the Last Arcade: a one-table pinball game. Wake the Arcade Heart across 8 missions. Built by an AI agent for make.fun's “Make the best game” bounty, $1,000 in USDC.`,
  website = `https://make.fun/bounty/best-game-01`,
  topics = `makefun, ai-agents, bounties, games`.
  Alternatif CLI: `gh repo edit <OWNER>/<REPO> --description '...' --homepage 'https://make.fun/bounty/best-game-01' --add-topic 'makefun,ai-agents,bounties,games'`
- Bila owner repo GitHub ≠ login GitHub yang terhubung ke akun make.fun,
  tambahkan file `.makefun/owner.json` di root repo berisi
  `{"wallet": "8HAJBSnouVwv5TiPjnV4WJRo6LHXJZdXD3J4KhifppL8"}` lalu commit
  lagi (check akan memberi tahu bila ini diperlukan).

### Langkah 4 — Usage rows Muse (AGEN UTAMA / top-level, SETELAH semua subagent selesai)
- Dijalankan oleh agen top-level (bukan subagent), di turn setelah pesan
  build terakhir, dengan `muse.db`, lalu tulis barisnya apa adanya (satu
  JSON per baris, jangan diketik ulang/dibulatkan) ke
  `~/workspace/makefun-best-game/muse-usage.jsonl` (**di luar repo**):
  ```sql
  SELECT u.agent_id AS agent_id, u.message_id AS message_id, u.created_at AS created_at, u.input_tokens AS input_tokens, u.output_tokens AS output_tokens, a.model AS model FROM agent.agent_message_token_usage u JOIN agent.agents a ON a.agent_id = u.agent_id WHERE u.agent_id IN ('27ecda47-9d52-4f67-96de-6a670197ae34','3faf2a7a-ed2c-49df-8357-293041014016','45a8f532-a663-4afd-b7b6-335cc18ea86f','52cd2160-72a0-4187-a636-8223aaf8bb1e','5e7ddd6e-2d23-4e4c-8b1e-7d172163a455','64e1cdbd-3a2c-4d2e-8cfb-7483767bd068','6848c753-f2de-470b-b694-16d0058dcab6','6e0fcbb0-17a4-4404-a000-2e98359245df','748e1e2f-91d1-4a9b-bd44-9d5ddf5312ed','7c3937db-2542-40cf-8230-5ad3ca4237dc','8338c69b-68cf-43bd-aff5-a6faef98c56a','951a2a76-a1dc-4aab-b809-376b3dd1c185','a103d978-d3f6-4dd7-81c2-9dab20b39401','a915aaa3-3ae6-4650-862b-6f31f7520675','abd68563-183b-446e-b24d-388cf2b99ea7','af8d320c-ab57-45de-802a-2c13b1286de8','b5419178-1ab9-43ed-9ce7-a6d1a7a5a55a','b56308cb-04fa-421e-9188-ff52b7f93028','ba12e25f-ee7d-45ac-8e4e-80bfa8c4f39a','cf8e2fc5-7c1b-43f1-8c6d-aa2652b08880','d13e67b8-94e2-43af-b65a-20e6d1c444c1','d78e231c-e4ab-4e6f-845c-b29571f43c57','de82327b-e728-47f6-8e7f-3619924939db','e68cbe75-d890-4ec3-be31-c01b7eed53e6') ORDER BY u.created_at DESC LIMIT 500
  ```
  (24 agent_id dari baris pertama tiap file sesi `~/agents/*/sessions/*.jsonl`
  yang menyebut silverball; bila hasil mencapai 500 baris, ulangi dengan
  `AND u.created_at <= <created_at terawal>` lalu gabungkan — jangan
  memangkas file, bundle yang menyaring baris sebelum build.)
- Keadaan saat persiapan (17 Nov ~21:30 WIB): query mengembalikan **60 baris
  untuk 18 dari 24 agen** (terawal 2026-11-16T04:43:49Z, terakhir
  2026-11-17T14:23:00Z; model `ipnext/avocado-5.17-v2`); **6 agen belum punya
  baris** (64e1cdbd, 6e0fcbb0, b5419178, cf8e2fc5, de82327b, e68cbe75 — baris
  subagent ditulis setelah run-nya selesai). **Wajib jalankan ulang saat
  bundle** — file lama akan basi.

### Langkah 5 — Bundle transkrip (AGEN, setelah Langkah 1–4)
```
cd ~/workspace/makefun-best-game/best-game-01-kit
node cli/makefun.mjs bundle --repo ~/workspace/makefun-best-game/silverball --out ~/workspace/makefun-best-game/silverball-transcripts.tar.gz --muse-usage ~/workspace/makefun-best-game/muse-usage.jsonl
```
- Bundle menemukan sendiri semua sesi yang working directory/workspace-nya
  milik repo (git common dir; termasuk sesi yang dimulai di direktori di atas
  repo). Diharapkan menemukan 24 sesi silverball (sesi utama 7c3937db +
  subagent builder/verifier). Periksa jumlah sesi di output; bila ada yang
  hilang, tambahkan `--session ~/agents/<agent>/sessions/<id>.jsonl`.
- **Jangan** menulis/merekayasa sesi dari ingatan — hanya file sesi asli.

### Langkah 6 — Check dengan transkrip (AGEN)
```
cd ~/workspace/makefun-best-game/best-game-01-kit
node cli/makefun.mjs check --kit . --repo ~/workspace/makefun-best-game/silverball --transcripts ~/workspace/makefun-best-game/silverball-transcripts.tar.gz
```
- Tanpa `--worktree`: memeriksa commit HEAD. **Semua check harus lolos**
  sebelum submit. Bila `transcripts_reproduces` gagal, ikuti fix-nya
  (biasanya: bundle sesi yang menulis file itu, atau tulis ulang file itu
  di sesi yang terekam).

### Langkah 7 — SUBMIT (⚠️ BUTUH PERSETUJUAN EKSPLISIT USER untuk perintah ini)
```
cd ~/workspace/makefun-best-game/best-game-01-kit
node cli/makefun.mjs submit --competition best-game-01 --repo-url https://github.com/<OWNER>/<REPO> --commit <SHA-dari-Langkah-3> --title "SILVERBALL — Save the Last Arcade" --bundle ~/workspace/makefun-best-game/silverball-transcripts.tar.gz --keypair ~/workspace/makefun-ai-judge-rich-01/makefun-keypair.json
```
- Perintah ini **menandatangani** entry message ("make.fun entry v1",
  berlaku 10 menit, satu submission) dengan wallet agen
  `8HAJBSnouVwv5TiPjnV4WJRo6LHXJZdXD3J4KhifppL8` (wallet payout).
  Keypair sudah terverifikasi milik wallet itu (mode 600).
- Setelah submit: verifikasi di https://make.fun/bounty/best-game-01
  (entry muncul; cek statusnya).
- ⚠️ **Percobaan yang ditolak DIHITUNG dalam kuota harian** (maks. 5/hari,
  20 total per akun). Jangan submit sebelum Langkah 6 lolos semua.

## 7. Penghalang & risiko (dibaca sebelum submit)

- **B1 — main.ts 0 authored line (KRITIS bila dilewati).** `main.ts` identik
  dengan starter dan tidak pernah ditulis/diedit di sesi mana pun (hanya
  `cp`; satu-satunya "wrote main.ts" di semua sesi adalah milik Coralfire,
  proyek lain). Aturan: entrypoint harus punya ≥1 authored line. Fix:
  Langkah 2 (edit komentar header di sesi terekam). Tanpa ini,
  `transcripts_reproduces` berisiko FAIL.
- **B2 — Belum ada repo git/GitHub.** Bundle tidak bisa menemukan sesi tanpa
  git repo (`bundle --dry-run` gagal: "not inside a git repository").
  Fix: Langkah 1–3.
- **B3 — Usage rows harus dijalankan ulang saat bundle** (agen top-level,
  setelah semua subagent selesai). File yang dibuat lebih awal akan basi;
  6 agen saat ini belum punya baris. Fix: Langkah 4.
- **B4 — `check` saat ini FAIL `transcripts_present`.** Wajar dan diharapkan
  sebelum bundle ada. Fix: Langkah 5, lalu Langkah 6.
- **B5 — Nilai yang belum diketahui, JANGAN ditebak:** login GitHub user,
  nama repo, kode referral make.fun. Ketiganya dibutuhkan di Langkah 1–3.
- **B6 — Deadline: Kam 19 Nov 2026 01:00 WIB** (Rab 18 Nov 2026 18:00 UTC).
  Rencana ship-buffer (JAM.md): submit v1 18 Nov 12:00 WIB sebagai asuransi,
  final 20:00–22:00 WIB — **rencana saja; tiap submit butuh persetujuan user**.
- **B7 — Kuota & aturan submit:** maks. 5/hari, 10 total (aturan Force_Last:
  yang terakhir sebelum deadline yang berlaku), 20 maks. per akun;
  percobaan ditolak dihitung. Entri terakhir sebelum deadline = final.
- **B8 — `handed_over_places: none`.** Sesi kami adalah sesi Muse asli
  (bukan handed-over), jadi aman. Jangan pernah menyerahkan sesi hasil
  rekayasa — entri handed-over diranking tapi TIDAK mendapat tempat berbayar.
- **B9 — Catatan kosmetik (tidak menghalangi):** bayangan samar skor HUD di
  balik judul victory; panel HUD kanan sedikit tembus pandang di balik
  overlay title yang lebih terang. Teks tetap terbaca.
- **B10 — JANGAN hapus `~/workspace/makefun-ai-judge-rich-01/`.** File
  `makefun-keypair.json` di dalamnya (mode 600) adalah kunci signing untuk
  submit (wallet 8HAJBS…), meski bounty ai-judge-rich-01 sendiri di-skip
  karena berbayar ($1).

## 8. Jalur alternatif — source bundle (bila tidak ada akun GitHub)

1. Di repo KOSONG baru (belum ada commit, belum ada LICENSE):
   `cd <repo> && node <kit>/cli/makefun.mjs init --license MIT --keypair ~/workspace/makefun-ai-judge-rich-01/makefun-keypair.json`
   (commit root hanya berisi `.makefun/freshness.json` + LICENSE; jangan
   rewrite root ini.)
2. Salin semua file SILVERBALL ke repo itu, commit di atas root.
3. Buat git bundle: `git bundle create <file> refs/heads/submission`
   (maks. 512 MiB); `repo_url` menjadi `bundle:<sha root commit>`.
4. Langkah 2 (main.ts), 4 (usage), 5 (bundle transkrip), 6 (check) sama.
5. Submit:
   `node cli/makefun.mjs submit --competition best-game-01 --source <repo> --commit <sha> --title "SILVERBALL — Save the Last Arcade" --bundle <bundle.tar.gz> --keypair <keypair>`

## 9. Ringkasan bounty (terverifikasi live 17 Nov 2026 ~21:18 WIB)

- Kompetisi: **best-game-01 — "Make the best game"**. Hadiah **$1.000 USDC**
  (escrow Solana): 1st $400, 2nd $200, 3rd $120, 4th–10th $40.
- Deadline: **Rab 18 Nov 2026 18:00 UTC = Kam 19 Nov 2026 01:00 WIB**.
  Final run 10 menit setelah deadline menentukan ranking resmi.
- **Entry fee: TIDAK ADA (gratis)** — `entryFeeUsd: null`, `entryFeesUsd: 0`.
  Saat dicek: 14.255 submission, pot $1.000.
- Deliverable: repo GitHub publik ATAU source bundle; `main.ts` (Node 22) di
  root; `vendor/makefun-game.ts` tidak berubah; `game/` file statis offline
  (`game/index.html` main offline di desktop Chrome, tanpa network);
  3–4 screenshot; transkrip agen.
- Caps: `game/` ≤993 file / ≤48 MiB; `game/index.html` ≤1 MiB; screenshot
  3–4, tiap ≤256 KiB, sisi panjang ≤1280 px, sisi pendek ≥480 px;
  dossier teks ≤163.840 B, dossier ≤1,5 MiB.
- Transcript gate: ≥30% authored lines, ≤40% unwritten, ≥5 assistant turn
  berteks/berpikir, ada file yang direvisi ≥2 write, sesi setelah kompetisi
  dibuka (2026-11-15T18:00:00Z), entrypoint punya ≥1 authored line.
  Semua 24 sesi silverball dimulai setelah pembukaan (terawal
  2026-11-17T12:56:23Z; sesi utama 2026-11-16T04:37:36Z) — jendela waktu ✅.
- Juri: AI membandingkan pairwise via contact sheet screenshot (cover dulu,
  besar di atas) + outline singkat source. Kriteria berurutan: (1) game
  lengkap di screenshot, (2) fun & depth, (3) feel & polish, (4) look &
  originality, (5) struktur (source terpisah per file, satu tugas jelas).
- Akun: **@the-drake**, wallet agen `8HAJBSnouVwv5TiPjnV4WJRo6LHXJZdXD3J4KhifppL8`
  (terdaftar di akun; kunci berlaku s.d. 2026-12-17). Wallet utama akun:
  `39iQ17X9K6t37i1GbvhxT6gibhiPQRTwhtW8nrQeDm1V` (sign-in).
- Heats: disaring di dev rating (garis tempat 40); shortlist 3 ronde Swiss;
  playoff 12 besar; review finalis menahan tempat 1–5 hingga 60 menit;
  3 besar di-host live setelah entry ditutup.
