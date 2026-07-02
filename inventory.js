/* ═══════════════════════════════════════════════════════════════
   inventory.js  —  Sarpras QR / OCR sub-page
   Mirrors the Staff / Kehadiran pattern exactly.
   All state and helpers live inside window.inventoryQROCR.
   External scripts are lazy-loaded only when the tab is opened.
   ═══════════════════════════════════════════════════════════════ */

window.inventoryQROCR = (() => {

  /* ── External deps (loaded lazily) ── */
  const DEPS = [
    { id: '__dep_pdfjs__',     src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' },
    { id: '__dep_pdfjsw__',    src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js', worker: true },
    { id: '__dep_html5qr__',   src: 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js' },
    { id: '__dep_tesseract__', src: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js' },
    { id: '__dep_qrcreator__', src: 'https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.min.js' },
    { id: '__dep_qrscanner__', src: 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.umd.min.js' },
    { id: '__dep_jspdf__',     src: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js' },
  ];

  let _loaded = false;
  let _loading = false;

  function loadDeps() {
    return new Promise((resolve, reject) => {
      if (_loaded) { resolve(); return; }
      if (_loading) { const poll = setInterval(() => { if (_loaded) { clearInterval(poll); resolve(); } }, 120); return; }
      _loading = true;

      const toLoad = DEPS.filter(d => !d.worker && !document.getElementById(d.id));
      if (!toLoad.length) { _loaded = true; _loading = false; resolve(); return; }

      let done = 0;
      toLoad.forEach(dep => {
        const s = document.createElement('script');
        s.id  = dep.id;
        s.src = dep.src;
        s.onload = () => {
          done++;
          if (done === toLoad.length) {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            _loaded = true;
            _loading = false;
            resolve();
          }
        };
        s.onerror = () => reject(new Error('Failed to load: ' + dep.src));
        document.head.appendChild(s);
      });
    });
  }

  /* ── Module state ── */
  let videoScanner   = null;
  let lastScan       = '';
  let scanLock       = false;
  let currentImg     = null;
  let currentOCRImg  = null;
  let ocrWorker      = null;
  let bulkOcrWorker  = null;
  let bulkFiles      = [];
  let bulkRows       = [];
  let bulkMode       = 'qr';
  let apiPool        = [];
  let apiRowCounter  = 0;
  let historyArr     = [];
  let bgData         = [];

  /* ── Audio ── */
  function beep() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 820; osc.type = 'sine';
      gain.gain.value = 0.25;
      osc.start(); osc.stop(ctx.currentTime + 0.13);
    } catch {}
  }

  /* ── ID helpers ── */
  const el  = id => document.getElementById('qro-' + id);
  const qs  = sel => document.querySelector(sel);

  /* ══════════════════════════════════════════════════════
     HTML template
  ══════════════════════════════════════════════════════ */
  function buildHTML() {
    return `
<div class="sarpras-qr-tool" id="sarpras-qr-tool-root">

  <!-- ── Tab strip ── -->
  <div class="qr-tabs" role="tablist">
    <button class="qr-tab active" data-qrtab="video">📹 Video Scan</button>
    <button class="qr-tab" data-qrtab="image">📁 Upload Gambar</button>
    <button class="qr-tab" data-qrtab="ocr">📝 OCR Teks</button>
    <button class="qr-tab" data-qrtab="generator">✨ QR Generator</button>
    <button class="qr-tab" data-qrtab="bulk">📦 Bulk Scan</button>
    <button class="qr-tab" data-qrtab="label">🏷️ Label QR</button>
  </div>

  <!-- ════ TAB 1: VIDEO ════ -->
  <div class="qr-panel active" id="qro-panel-video">
    <div id="qro-reader-container"></div>
    <div class="qr-status" id="qro-video-status">Klik Mulai Scan untuk mengaktifkan kamera.</div>
    <div class="qr-btn-group">
      <button class="qr-btn qr-btn-primary" id="qro-start-btn">▶ Mulai Scan</button>
      <button class="qr-btn qr-btn-secondary" id="qro-stop-btn" disabled>⏹ Stop</button>
    </div>
  </div>

  <!-- ════ TAB 2: IMAGE ════ -->
  <div class="qr-panel" id="qro-panel-image">
    <div class="qr-upload" id="qro-img-upload">
      <div class="qr-upload-icon">📁</div>
      <strong>Klik atau drag & drop gambar</strong>
      <small>JPG, PNG, WebP — Scan QR / Barcode dari gambar</small>
    </div>
    <input type="file" id="qro-img-input" accept="image/*" style="display:none">
    <div id="qro-img-preview-wrap" style="display:none;text-align:center">
      <img class="qr-preview-img" id="qro-img-preview" alt="Preview">
    </div>
    <div class="qr-btn-group" id="qro-img-btns" style="display:none">
      <button class="qr-btn qr-btn-primary" id="qro-img-scan-btn">🔍 Scan QR / Barcode</button>
      <button class="qr-btn qr-btn-secondary" id="qro-img-ocr-btn">📝 Deteksi Teks (OCR)</button>
    </div>
  </div>

  <!-- ════ TAB 3: OCR ════ -->
  <div class="qr-panel" id="qro-panel-ocr">
    <div class="qr-upload" id="qro-ocr-upload">
      <div class="qr-upload-icon">📝</div>
      <strong>Upload Gambar untuk OCR</strong>
      <small>Ekstrak teks dari dokumen, nota, invoice, dll</small>
    </div>
    <input type="file" id="qro-ocr-input" accept="image/*" style="display:none">
    <div id="qro-ocr-preview-wrap" style="display:none;text-align:center">
      <img class="qr-preview-img" id="qro-ocr-preview" alt="Preview">
    </div>
    <div class="qr-btn-group" id="qro-ocr-btns" style="display:none">
      <button class="qr-btn qr-btn-primary" id="qro-ocr-run-btn">🔍 Deteksi Teks</button>
    </div>
    <div id="qro-ocr-loading" style="display:none">
      <div class="qr-ocr-progress"><div class="qr-spinner"></div><span id="qro-ocr-progress-txt">Memproses...</span></div>
    </div>
  </div>

  <!-- ════ TAB 4: GENERATOR ════ -->
  <div class="qr-panel" id="qro-panel-generator">
    <div class="qr-gen-grid">
      <div style="display:grid;gap:0.85rem;">
        <div class="qr-form-group">
          <label class="qr-form-label">Text / URL / Data</label>
          <textarea class="qr-textarea" id="qro-gen-text" placeholder="Masukkan teks, URL, kode aset..."></textarea>
        </div>
        <div class="qr-color-row">
          <div class="qr-form-group">
            <label class="qr-form-label">Warna QR</label>
            <input type="color" class="qr-color-input" id="qro-gen-color" value="#021112">
          </div>
          <div class="qr-form-group">
            <label class="qr-form-label">Background</label>
            <input type="color" class="qr-color-input" id="qro-gen-bg" value="#ffffff">
          </div>
        </div>
        <div class="qr-form-group">
          <label class="qr-form-label">Ukuran (px)</label>
          <div class="qr-range-row">
            <input type="range" id="qro-gen-size" min="128" max="512" value="300"
              oninput="document.getElementById('qro-gen-size-val').textContent=this.value">
            <span class="qr-range-val" id="qro-gen-size-val">300</span>
          </div>
        </div>
        <div class="qr-form-group">
          <label class="qr-form-label">Roundness</label>
          <div class="qr-range-row">
            <input type="range" id="qro-gen-radius" min="0" max="0.5" step="0.1" value="0.3"
              oninput="document.getElementById('qro-gen-radius-val').textContent=this.value">
            <span class="qr-range-val" id="qro-gen-radius-val">0.3</span>
          </div>
        </div>
        <div class="qr-form-group">
          <label class="qr-form-label">Error Correction</label>
          <select class="qr-select" id="qro-gen-ec">
            <option value="L">Low (7%)</option>
            <option value="M" selected>Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>
        <div class="qr-btn-group">
          <button class="qr-btn qr-btn-primary" id="qro-gen-btn">✨ Generate</button>
          <button class="qr-btn qr-btn-secondary" id="qro-gen-dl">💾 Download</button>
        </div>
      </div>
      <div class="qr-gen-preview">
        <canvas id="qro-gen-canvas"></canvas>
        <small style="color:var(--qr-muted);font-size:0.75rem;">QR Code muncul di sini</small>
      </div>
    </div>
  </div>

  <!-- ════ TAB 5: BULK ════ -->
  <div class="qr-panel" id="qro-panel-bulk">

    <!-- API Keys -->
    <div class="qr-api-section" id="qro-api-box">
      <div class="qr-api-section-hd">
        <strong>🤖 AI Provider Keys <span style="font-size:0.72rem;font-weight:400;color:var(--qr-muted)">(fallback otomatis)</span></strong>
        <button class="qr-btn qr-btn-secondary" id="qro-add-api" style="min-height:2rem;padding:0 0.75rem;font-size:0.78rem;">+ Tambah</button>
      </div>
      <div id="qro-api-list" style="display:flex;flex-direction:column;gap:0.5rem;"></div>
      <div id="qro-api-status" style="font-size:0.72rem;color:var(--qr-muted);"></div>
    </div>

    <!-- Mode toggle -->
    <div class="qr-mode-row">
      <button class="qr-mode-btn active" data-bulkmode="qr">🔲 Scan QR</button>
      <button class="qr-mode-btn" data-bulkmode="ocr">📝 OCR Teks</button>
      <button class="qr-mode-btn" data-bulkmode="both">⚡ QR + OCR</button>
    </div>

    <!-- Upload -->
    <div class="qr-upload" id="qro-bulk-upload">
      <div class="qr-upload-icon">📦</div>
      <strong>Upload File (banyak sekaligus)</strong>
      <small id="qro-bulk-hint">Gambar (JPG, PNG, WebP) & PDF</small>
    </div>
    <input type="file" id="qro-bulk-input" accept="image/*,.pdf" multiple style="display:none">

    <div class="qr-file-chips" id="qro-bulk-chips" style="display:none"></div>

    <!-- OCR lang -->
    <div id="qro-ocr-lang-row" style="display:none">
      <div class="qr-form-group">
        <label class="qr-form-label">Bahasa OCR</label>
        <select class="qr-select" id="qro-bulk-lang">
          <option value="ind+eng" selected>Indonesia + English</option>
          <option value="eng">English only</option>
          <option value="ind">Indonesia only</option>
        </select>
      </div>
    </div>

    <!-- Custom prompt -->
    <div class="qr-prompt-box" id="qro-prompt-box">
      <div class="qr-prompt-hd">
        <label class="qr-form-label" style="margin:0;">🧠 Custom Prompt AI <span style="text-transform:none;font-weight:400;color:var(--qr-muted)">(opsional)</span></label>
        <button class="qr-btn qr-btn-secondary" id="qro-reset-prompt" style="min-height:1.9rem;padding:0 0.65rem;font-size:0.75rem;">↺ Reset</button>
      </div>
      <textarea class="qr-textarea" id="qro-prompt-input" rows="4"
        placeholder="Contoh: Dari data berikut ekstrak nomor aset dan kondisi:\n{{DATA}}"></textarea>
      <p style="font-size:0.72rem;color:var(--qr-muted);margin:0;">
        Gunakan <code>{{QR}}</code> <code>{{OCR}}</code> atau <code>{{DATA}}</code> sebagai placeholder.
      </p>
    </div>

    <!-- Action buttons -->
    <div class="qr-btn-group" id="qro-bulk-btns" style="display:none">
      <button class="qr-btn qr-btn-primary" id="qro-bulk-run">🔍 Proses Semua</button>
      <button class="qr-btn qr-btn-secondary" id="qro-bulk-clear">🗑️ Hapus</button>
      <button class="qr-btn qr-btn-secondary" id="qro-bulk-export" disabled>📥 Export CSV</button>
      <button class="qr-btn" id="qro-bulk-ai" disabled
        style="background:linear-gradient(135deg,var(--accent-2,#7c4dff),var(--accent));color:#fff;border:none;">
        🤖 Analisis AI
      </button>
    </div>

    <!-- Progress -->
    <div class="qr-progress-wrap" id="qro-bulk-prog" style="display:none">
      <div class="qr-progress-labels">
        <span id="qro-bulk-prog-txt">Memproses...</span>
        <span id="qro-bulk-prog-pct">0%</span>
      </div>
      <div class="qr-progress-track"><div class="qr-progress-fill" id="qro-bulk-prog-fill"></div></div>
    </div>

    <div class="qr-progress-wrap" id="qro-ai-prog" style="display:none">
      <div class="qr-progress-labels">
        <span id="qro-ai-prog-txt">AI menganalisis...</span>
        <span id="qro-ai-prog-pct">0%</span>
      </div>
      <div class="qr-progress-track">
        <div class="qr-progress-fill" id="qro-ai-prog-fill" style="background:linear-gradient(90deg,#7c4dff,var(--accent));"></div>
      </div>
    </div>

    <!-- Summary -->
    <div class="qr-summary" id="qro-bulk-summary" style="display:none">
      <div class="qr-summary-card s-total"><strong id="qro-s-total">0</strong><span>Total</span></div>
      <div class="qr-summary-card s-ok"  ><strong id="qro-s-ok">0</strong><span>Berhasil</span></div>
      <div class="qr-summary-card s-fail"><strong id="qro-s-fail">0</strong><span id="qro-s-fail-lbl">Gagal</span></div>
    </div>

    <!-- Results table -->
    <div class="qr-results-scroll" id="qro-bulk-table-wrap" style="display:none">
      <table class="qr-results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>File / Halaman</th>
            <th>Status</th>
            <th id="qro-col-qr">Hasil QR</th>
            <th id="qro-col-ocr" style="display:none">Hasil OCR</th>
            <th>🤖 Analisis AI</th>
          </tr>
        </thead>
        <tbody id="qro-bulk-tbody"></tbody>
      </table>
    </div>
  </div>

  <!-- ════ TAB 6: LABEL ════ -->
  <div class="qr-panel" id="qro-panel-label">
    <div class="qr-label-upload" id="qro-label-upload">
      <span style="font-size:2rem;opacity:.55">📊</span>
      <strong>Upload Excel / CSV</strong>
      <small>Kolom yang dikenali: No / Kode / Nama</small>
    </div>
    <input type="file" id="qro-label-input" accept=".xlsx,.xls,.csv" style="display:none">

    <div id="qro-label-map-row" style="display:none">
      <div class="qr-label-map">
        <div class="qr-form-group">
          <label class="qr-form-label">Kolom QR (kode)</label>
          <select class="qr-select" id="qro-lbl-col-qr"></select>
        </div>
        <div class="qr-form-group">
          <label class="qr-form-label">Kolom Label (nama)</label>
          <select class="qr-select" id="qro-lbl-col-name"></select>
        </div>
        <button class="qr-btn qr-btn-primary" id="qro-lbl-render" style="align-self:flex-end;">✨ Preview</button>
      </div>
    </div>

    <div id="qro-label-cfg-row" style="display:none">
      <div class="qr-label-cfg">
        <div class="qr-form-group">
          <label class="qr-form-label">Lebar (mm)</label>
          <input class="qr-input" type="number" id="qro-lbl-w" value="38" min="20" max="100">
        </div>
        <div class="qr-form-group">
          <label class="qr-form-label">Tinggi (mm)</label>
          <input class="qr-input" type="number" id="qro-lbl-h" value="42" min="20" max="120">
        </div>
        <div class="qr-form-group">
          <label class="qr-form-label">Font (pt)</label>
          <input class="qr-input" type="number" id="qro-lbl-fs" value="8" min="5" max="16">
        </div>
        <div class="qr-form-group">
          <label class="qr-form-label">Error Correction</label>
          <select class="qr-select" id="qro-lbl-ec">
            <option value="M" selected>Medium</option>
            <option value="L">Low</option>
            <option value="Q">Quartile</option>
            <option value="H">High</option>
          </select>
        </div>
      </div>
    </div>

    <div class="qr-btn-group" id="qro-label-btns" style="display:none">
      <button class="qr-btn qr-btn-primary" id="qro-lbl-pdf">📄 Export PDF</button>
      <button class="qr-btn qr-btn-secondary" id="qro-lbl-clear">🗑️ Reset</button>
    </div>

    <div id="qro-label-stats" style="font-size:0.78rem;color:var(--qr-muted);display:none;"></div>
    <div class="qr-label-grid" id="qro-label-grid"></div>
  </div>

  <!-- ════ Shared result + history ════ -->
  <div id="qro-result-area" style="display:none">
    <div class="qr-result-box">
      <div class="qr-result-label">✅ Hasil Scan</div>
      <div class="qr-result-text" id="qro-result-text">—</div>
    </div>
    <div class="qr-btn-group" style="margin-top:0.75rem">
      <button class="qr-btn qr-btn-secondary" id="qro-copy-btn">📋 Salin</button>
    </div>
  </div>

  <div style="display:grid;gap:0.6rem;">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
      <span style="font-size:0.84rem;font-weight:700;">📜 Riwayat Scan</span>
      <button class="qr-btn qr-btn-danger" id="qro-clear-history" style="min-height:2rem;padding:0 0.65rem;font-size:0.75rem;">🗑️ Hapus</button>
    </div>
    <div class="qr-history-list" id="qro-history-list">
      <p style="color:var(--qr-muted);font-size:0.82rem;text-align:center;padding:1rem 0;">Belum ada riwayat.</p>
    </div>
  </div>

</div>`;
  }

  /* ══════════════════════════════════════════════════════
     Tab switching
  ══════════════════════════════════════════════════════ */
  function initTabs(root) {
    root.querySelectorAll('.qr-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.qr-tab').forEach(b => b.classList.remove('active'));
        root.querySelectorAll('.qr-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        root.querySelector('#qro-panel-' + btn.dataset.qrtab)?.classList.add('active');
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     History
  ══════════════════════════════════════════════════════ */
  function addHistory(text, type) {
    historyArr.unshift({ text, type, ts: new Date().toLocaleString('id-ID') });
    if (historyArr.length > 60) historyArr.pop();
    renderHistory();
  }

  function renderHistory() {
    const list = document.getElementById('qro-history-list');
    if (!list) return;
    if (!historyArr.length) {
      list.innerHTML = '<p style="color:var(--qr-muted);font-size:0.82rem;text-align:center;padding:1rem 0;">Belum ada riwayat.</p>';
      return;
    }
    list.innerHTML = historyArr.map((h, i) => `
      <div class="qr-history-item" data-hi="${i}">
        <strong>[${h.type}] ${h.text.substring(0, 90)}${h.text.length > 90 ? '…' : ''}</strong>
        <small>${h.ts}</small>
      </div>
    `).join('');
    list.querySelectorAll('.qr-history-item').forEach(item => {
      item.addEventListener('click', () => displayResult(historyArr[+item.dataset.hi].text, ''));
    });
  }

  function displayResult(text, type) {
    const area = document.getElementById('qro-result-area');
    const txt  = document.getElementById('qro-result-text');
    if (area) area.style.display = '';
    if (txt)  txt.textContent = text;
    if (type) addHistory(text, type);
    beep();
  }

  /* ══════════════════════════════════════════════════════
     Image preprocessing
  ══════════════════════════════════════════════════════ */
  function preprocessImage(dataURL, mode) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const scale  = mode === 'upscale' ? 2 : 1;
        const canvas = document.createElement('canvas');
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const id   = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = id.data;
        for (let i = 0; i < data.length; i += 4) {
          let gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
          if (mode === 'thresh' || mode === 'upscale') gray = gray < 140 ? 0 : 255;
          else if (mode === 'invert') gray = 255 - gray;
          data[i] = data[i+1] = data[i+2] = gray;
          data[i+3] = 255;
        }
        ctx.putImageData(id, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataURL;
    });
  }

  async function tryQrScanHtml5(dataURL) {
    const blob = await fetch(dataURL).then(r => r.blob());
    const file = new File([blob], 'q.png', { type: blob.type || 'image/png' });
    let container = document.getElementById('__qro_h5__');
    if (!container) {
      container = document.createElement('div');
      container.id = '__qro_h5__';
      container.style.cssText = 'display:none;position:absolute;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(container);
    }
    const scanner = new Html5Qrcode('__qro_h5__');
    try {
      return await scanner.scanFile(file, false);
    } finally {
      try { scanner.clear(); } catch {}
    }
  }

  async function tryQrScan(dataURL) {
    const strategies = [
      () => QrScanner.scanImage(dataURL, { returnDetailedScanResult: true }).then(r => r.data),
      async () => QrScanner.scanImage(await preprocessImage(dataURL, 'thresh'),  { returnDetailedScanResult: true }).then(r => r.data),
      async () => QrScanner.scanImage(await preprocessImage(dataURL, 'upscale'), { returnDetailedScanResult: true }).then(r => r.data),
      async () => QrScanner.scanImage(await preprocessImage(dataURL, 'invert'),  { returnDetailedScanResult: true }).then(r => r.data),
      () => tryQrScanHtml5(dataURL),
      async () => tryQrScanHtml5(await preprocessImage(dataURL, 'thresh')),
    ];
    for (const s of strategies) {
      try { const r = await s(); if (r) return r; } catch {}
    }
    return null;
  }

  async function tryOcrScan(dataURL, lang) {
    if (!bulkOcrWorker) {
      bulkOcrWorker = await Tesseract.createWorker(lang, 1, { logger: () => {} });
    }
    const { data: { text } } = await bulkOcrWorker.recognize(dataURL);
    return text?.trim() || null;
  }

  /* ══════════════════════════════════════════════════════
     Video scanning
  ══════════════════════════════════════════════════════ */
  function initVideo() {
    document.getElementById('qro-start-btn').addEventListener('click', async () => {
      videoScanner = new Html5Qrcode('qro-reader-container');
      const status = document.getElementById('qro-video-status');
      try {
        await videoScanner.start(
          { facingMode: 'environment' },
          { fps: 30, qrbox: { width: 300, height: 300 } },
          decoded => {
            if (scanLock || decoded === lastScan) return;
            scanLock = true; lastScan = decoded;
            displayResult(decoded, 'QR/Barcode');
            status.textContent = '✅ ' + decoded.substring(0, 60);
            status.className = 'qr-status ok';
            setTimeout(() => { scanLock = false; }, 600);
          },
          () => {}
        );
        document.getElementById('qro-start-btn').disabled = true;
        document.getElementById('qro-stop-btn').disabled  = false;
        status.textContent = '🎥 Scanner aktif — arahkan ke QR / Barcode';
        status.className = 'qr-status ok';
      } catch (err) {
        status.textContent = '❌ Error: ' + err;
        status.className = 'qr-status error';
      }
    });

    document.getElementById('qro-stop-btn').addEventListener('click', async () => {
      if (videoScanner) {
        await videoScanner.stop(); videoScanner = null;
        document.getElementById('qro-start-btn').disabled = false;
        document.getElementById('qro-stop-btn').disabled  = true;
        const s = document.getElementById('qro-video-status');
        s.textContent = '⏹ Scanner dihentikan'; s.className = 'qr-status';
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     Single image upload
  ══════════════════════════════════════════════════════ */
  function initImageUpload() {
    const upload   = document.getElementById('qro-img-upload');
    const input    = document.getElementById('qro-img-input');
    const preview  = document.getElementById('qro-img-preview');
    const prevWrap = document.getElementById('qro-img-preview-wrap');
    const btns     = document.getElementById('qro-img-btns');

    const load = file => {
      if (!file || !file.type.startsWith('image/')) return;
      const fr = new FileReader();
      fr.onload = e => {
        currentImg = e.target.result;
        preview.src = currentImg;
        prevWrap.style.display = '';
        btns.style.display = '';
      };
      fr.readAsDataURL(file);
    };

    upload.addEventListener('click', () => input.click());
    upload.addEventListener('dragover',  e => { e.preventDefault(); upload.classList.add('dragover'); });
    upload.addEventListener('dragleave', () => upload.classList.remove('dragover'));
    upload.addEventListener('drop', e => { e.preventDefault(); upload.classList.remove('dragover'); load(e.dataTransfer.files[0]); });
    input.addEventListener('change', e => load(e.target.files[0]));

    document.getElementById('qro-img-scan-btn').addEventListener('click', async () => {
      if (!currentImg) return;
      const r = await tryQrScan(currentImg);
      if (r) displayResult(r, 'QR Code (Gambar)');
      else alert('❌ QR/Barcode tidak ditemukan di gambar.');
    });

    document.getElementById('qro-img-ocr-btn').addEventListener('click', async () => {
      if (!currentImg) return;
      runOCR(currentImg, null, '');
    });
  }

  /* ══════════════════════════════════════════════════════
     OCR tab
  ══════════════════════════════════════════════════════ */
  async function runOCR(imgData, progressEl, lang) {
    const loadEl = document.getElementById('qro-ocr-loading');
    const progTxt = document.getElementById('qro-ocr-progress-txt');
    if (loadEl) loadEl.style.display = '';
    try {
      if (!ocrWorker) {
        ocrWorker = await Tesseract.createWorker(lang || 'ind+eng', 1, {
          logger: m => { if (m.status === 'recognizing text' && progTxt) progTxt.textContent = `Menganalisis... ${Math.round(m.progress * 100)}%`; }
        });
      }
      const { data: { text } } = await ocrWorker.recognize(imgData);
      if (text?.trim()) displayResult(text, 'OCR Teks');
      else alert('⚠️ Tidak ada teks terdeteksi.');
    } catch (err) { alert('❌ Error OCR: ' + err.message); }
    finally { if (loadEl) loadEl.style.display = 'none'; }
  }

  function initOCR() {
    const upload   = document.getElementById('qro-ocr-upload');
    const input    = document.getElementById('qro-ocr-input');
    const preview  = document.getElementById('qro-ocr-preview');
    const prevWrap = document.getElementById('qro-ocr-preview-wrap');
    const btns     = document.getElementById('qro-ocr-btns');

    const load = file => {
      if (!file || !file.type.startsWith('image/')) return;
      const fr = new FileReader();
      fr.onload = e => {
        currentOCRImg = e.target.result;
        preview.src = currentOCRImg;
        prevWrap.style.display = '';
        btns.style.display = '';
      };
      fr.readAsDataURL(file);
    };

    upload.addEventListener('click', () => input.click());
    upload.addEventListener('dragover',  e => { e.preventDefault(); upload.classList.add('dragover'); });
    upload.addEventListener('dragleave', () => upload.classList.remove('dragover'));
    upload.addEventListener('drop', e => { e.preventDefault(); upload.classList.remove('dragover'); load(e.dataTransfer.files[0]); });
    input.addEventListener('change', e => load(e.target.files[0]));

    document.getElementById('qro-ocr-run-btn').addEventListener('click', () => {
      if (currentOCRImg) runOCR(currentOCRImg, null, 'ind+eng');
    });
  }

  /* ══════════════════════════════════════════════════════
     QR Generator
  ══════════════════════════════════════════════════════ */
  function initGenerator() {
    document.getElementById('qro-gen-btn').addEventListener('click', () => {
      const text = document.getElementById('qro-gen-text').value.trim();
      if (!text) { alert('⚠️ Masukkan teks atau URL.'); return; }
      QrCreator.render({
        text,
        radius:     parseFloat(document.getElementById('qro-gen-radius').value),
        ecLevel:    document.getElementById('qro-gen-ec').value,
        fill:       document.getElementById('qro-gen-color').value,
        background: document.getElementById('qro-gen-bg').value,
        size:       parseInt(document.getElementById('qro-gen-size').value),
      }, document.getElementById('qro-gen-canvas'));
      beep();
    });

    document.getElementById('qro-gen-dl').addEventListener('click', () => {
      const canvas = document.getElementById('qro-gen-canvas');
      if (!canvas.width) { alert('⚠️ Generate QR terlebih dahulu.'); return; }
      const a = document.createElement('a');
      a.download = 'qr-' + Date.now() + '.png';
      a.href = canvas.toDataURL();
      a.click();
    });
  }

  /* ══════════════════════════════════════════════════════
     Shared utils
  ══════════════════════════════════════════════════════ */
  function fileToDataURL(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  async function pdfPageToDataURL(pdfFile, pageNum) {
    const buf = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const page = await pdf.getPage(pageNum);
    const vp   = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    return { dataURL: canvas.toDataURL('image/png'), totalPages: pdf.numPages };
  }

  /* ══════════════════════════════════════════════════════
     Bulk scanning
  ══════════════════════════════════════════════════════ */
  function initBulk() {
    const upload = document.getElementById('qro-bulk-upload');
    const input  = document.getElementById('qro-bulk-input');

    upload.addEventListener('click', () => input.click());
    upload.addEventListener('dragover',  e => { e.preventDefault(); upload.classList.add('dragover'); });
    upload.addEventListener('dragleave', () => upload.classList.remove('dragover'));
    upload.addEventListener('drop', e => { e.preventDefault(); upload.classList.remove('dragover'); addBulkFiles([...e.dataTransfer.files]); });
    input.addEventListener('change', e => addBulkFiles([...e.target.files]));

    document.querySelectorAll('[data-bulkmode]').forEach(btn => {
      btn.addEventListener('click', () => {
        bulkMode = btn.dataset.bulkmode;
        document.querySelectorAll('[data-bulkmode]').forEach(b => b.classList.toggle('active', b === btn));
        document.getElementById('qro-ocr-lang-row').style.display = bulkMode === 'qr' ? 'none' : '';
        document.getElementById('qro-col-ocr').style.display      = bulkMode === 'both' ? '' : 'none';
        document.getElementById('qro-s-fail-lbl').textContent     = bulkMode === 'qr' ? 'Tidak Ada QR' : 'Tidak Ada Hasil';
        document.getElementById('qro-bulk-hint').textContent      = bulkMode === 'qr'
          ? 'Gambar (JPG, PNG, WebP) & PDF' : bulkMode === 'ocr'
          ? 'Ekstrak teks — Gambar & PDF per halaman'
          : 'Scan QR + Ekstrak Teks — Gambar & PDF';
      });
    });

    document.getElementById('qro-bulk-run').addEventListener('click', runBulkScan);
    document.getElementById('qro-bulk-clear').addEventListener('click', clearBulk);
    document.getElementById('qro-bulk-export').addEventListener('click', exportCSV);
    document.getElementById('qro-bulk-ai').addEventListener('click', analyseAll);
    document.getElementById('qro-reset-prompt').addEventListener('click', () => {
      document.getElementById('qro-prompt-input').value = '';
    });
  }

  function addBulkFiles(files) {
    const ok = files.filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (!ok.length) { alert('⚠️ Hanya gambar dan PDF.'); return; }
    ok.forEach(f => { if (!bulkFiles.some(b => b.name === f.name && b.size === f.size)) bulkFiles.push(f); });
    renderChips();
    document.getElementById('qro-bulk-btns').style.display = '';
  }

  function renderChips() {
    const chips = document.getElementById('qro-bulk-chips');
    chips.style.display = '';
    chips.innerHTML = bulkFiles.map((f, i) => `
      <div class="qr-chip">
        <span>${f.type === 'application/pdf' ? '📄' : '🖼️'}</span>
        <span class="qr-chip-name">${f.name}</span>
        <span class="qr-chip-type">${f.type === 'application/pdf' ? 'PDF' : 'IMG'}</span>
        <span style="font-size:0.72rem;color:var(--qr-muted);">${(f.size/1024).toFixed(1)} KB</span>
        <button class="qr-btn qr-btn-danger" data-ci="${i}"
          style="min-height:1.6rem;padding:0 0.5rem;font-size:0.72rem;">✕</button>
      </div>
    `).join('');
    chips.querySelectorAll('[data-ci]').forEach(btn => {
      btn.addEventListener('click', () => {
        bulkFiles.splice(+btn.dataset.ci, 1);
        if (!bulkFiles.length) clearBulk(); else renderChips();
      });
    });
  }

  function clearBulk() {
    bulkFiles = []; bulkRows = [];
    const input = document.getElementById('qro-bulk-input');
    if (input) input.value = '';
    ['qro-bulk-chips','qro-bulk-btns','qro-bulk-prog','qro-ai-prog',
     'qro-bulk-summary','qro-bulk-table-wrap'].forEach(id => {
      const e = document.getElementById(id);
      if (e) e.style.display = 'none';
    });
    const tbody = document.getElementById('qro-bulk-tbody');
    if (tbody) tbody.innerHTML = '';
    const exp = document.getElementById('qro-bulk-export');
    if (exp) exp.disabled = true;
  }

  function appendRow(rowNum, fileName) {
    const tbody = document.getElementById('qro-bulk-tbody');
    const tr = document.createElement('tr');
    const isBoth = bulkMode === 'both';
    tr.id = 'qro-row-' + rowNum;
    tr.innerHTML = `
      <td>${rowNum}</td>
      <td title="${fileName}">${fileName.length > 35 ? fileName.substring(0,34)+'…' : fileName}</td>
      <td><span class="qr-pill pending">⏳ Proses</span></td>
      <td>—</td>
      <td style="${isBoth ? '' : 'display:none'}">—</td>
      <td></td>
    `;
    tbody.appendChild(tr);
    tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return tr;
  }

  function updateRow(tr, status, qrHTML, ocrHTML) {
    const ok   = status === 'ok';
    tr.children[2].innerHTML = `<span class="qr-pill ${ok ? 'ok' : 'fail'}">${ok ? '✅ OK' : '❌ Gagal'}</span>`;
    tr.children[3].innerHTML = qrHTML  || '<span style="color:var(--qr-muted)">—</span>';
    tr.children[4].innerHTML = ocrHTML || '<span style="color:var(--qr-muted)">—</span>';
  }

  function ocrCellHTML(text, rowId) {
    const esc = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<div>
      <div class="qr-ocr-preview" id="qro-ocrp-${rowId}">${esc}</div>
      <button class="qr-inline-btn" onclick="(function(){
        const e=document.getElementById('qro-ocrp-${rowId}');
        const x=e.classList.toggle('expanded');
        this.textContent=x?'▲ Tutup':'▼ Lebih';
      }).call(this)">▼ Lebih</button>
      <button class="qr-inline-btn" onclick="navigator.clipboard.writeText(document.getElementById('qro-ocrp-${rowId}').textContent)">📋</button>
    </div>`;
  }

  async function runBulkScan() {
    if (!bulkFiles.length) return;
    bulkRows = [];
    document.getElementById('qro-bulk-tbody').innerHTML = '';
    ['qro-bulk-table-wrap','qro-bulk-prog','qro-bulk-summary'].forEach(id => {
      document.getElementById(id).style.display = '';
    });
    document.getElementById('qro-bulk-run').disabled    = true;
    document.getElementById('qro-bulk-export').disabled = true;
    if (bulkOcrWorker) { await bulkOcrWorker.terminate(); bulkOcrWorker = null; }

    const lang = document.getElementById('qro-bulk-lang').value;

    // Expand PDFs to page plan
    const plan = [];
    for (const file of bulkFiles) {
      if (file.type === 'application/pdf') {
        const ab  = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        for (let p = 1; p <= pdf.numPages; p++) plan.push({ file, label: `${file.name} — Hal.${p}`, pageNum: p, isPDF: true });
      } else {
        plan.push({ file, label: file.name, pageNum: null, isPDF: false });
      }
    }

    let done = 0, ok = 0, fail = 0;

    const setProgress = () => {
      const pct = plan.length ? Math.round(done / plan.length * 100) : 0;
      document.getElementById('qro-bulk-prog-fill').style.width = pct + '%';
      document.getElementById('qro-bulk-prog-pct').textContent  = pct + '%';
      document.getElementById('qro-bulk-prog-txt').textContent  = `Memproses ${done} dari ${plan.length}...`;
      document.getElementById('qro-s-total').textContent = plan.length;
      document.getElementById('qro-s-ok').textContent    = ok;
      document.getElementById('qro-s-fail').textContent  = fail;
    };
    setProgress();

    for (let i = 0; i < plan.length; i++) {
      const { file, label, pageNum, isPDF } = plan[i];
      const rowNum = i + 1;
      const tr = appendRow(rowNum, label);

      let dataURL;
      try {
        dataURL = isPDF ? (await pdfPageToDataURL(file, pageNum)).dataURL : await fileToDataURL(file);

        if (bulkMode === 'qr') {
          const r = await tryQrScan(dataURL);
          if (r) {
            updateRow(tr, 'ok', `<span style="color:var(--qr-success);word-break:break-all;">${r}</span>`, null);
            bulkRows.push({ row: rowNum, file: label, status: 'OK', result: r, ocr: '' });
            addHistory(r, `Bulk QR — ${label}`);
            ok++;
          } else {
            updateRow(tr, 'fail', null, null);
            bulkRows.push({ row: rowNum, file: label, status: 'Tidak Ada QR', result: '', ocr: '' });
            fail++;
          }

        } else if (bulkMode === 'ocr') {
          const t = await tryOcrScan(dataURL, lang);
          if (t) {
            updateRow(tr, 'ok', ocrCellHTML(t, rowNum), null);
            bulkRows.push({ row: rowNum, file: label, status: 'OK', result: t, ocr: '' });
            addHistory(t.substring(0,200), `Bulk OCR — ${label}`);
            ok++;
          } else {
            updateRow(tr, 'fail', null, null);
            bulkRows.push({ row: rowNum, file: label, status: 'Teks Kosong', result: '', ocr: '' });
            fail++;
          }

        } else {
          const [qr, ocr] = await Promise.all([tryQrScan(dataURL), tryOcrScan(dataURL, lang)]);
          const st = (qr || ocr) ? 'ok' : 'fail';
          updateRow(tr, st,
            qr  ? `<span style="color:var(--qr-success);word-break:break-all;">${qr}</span>` : null,
            ocr ? ocrCellHTML(ocr, rowNum) : null
          );
          bulkRows.push({ row: rowNum, file: label, status: st === 'ok' ? 'OK' : 'Gagal', result: qr||'', ocr: ocr||'' });
          if (qr)  addHistory(qr,                `Bulk QR — ${label}`);
          if (ocr) addHistory(ocr.substring(0,200), `Bulk OCR — ${label}`);
          st === 'ok' ? ok++ : fail++;
        }
      } catch (err) {
        updateRow(tr, 'fail', `<span style="color:var(--qr-danger);font-size:0.75rem;">Error: ${err.message}</span>`, null);
        bulkRows.push({ row: rowNum, file: label, status: 'Error', result: err.message, ocr: '' });
        fail++;
      }

      done++; setProgress();
    }

    document.getElementById('qro-bulk-prog-txt').textContent = `✅ Selesai — ${plan.length} halaman diproses`;
    document.getElementById('qro-bulk-prog-fill').style.background = 'linear-gradient(90deg,var(--accent),var(--qr-success))';
    document.getElementById('qro-bulk-run').disabled    = false;
    document.getElementById('qro-bulk-export').disabled = false;
    if (ok > 0) {
      beep();
      document.getElementById('qro-bulk-ai').disabled = false;
    }
  }

  /* ── AI providers ── */
  const PROVIDERS = {
    claude:  { name: 'Claude (Anthropic)', placeholder: 'sk-ant-api03-...', models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    ]},
    openai:  { name: 'OpenAI (GPT)', placeholder: 'sk-proj-...', models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'gpt-4o',      label: 'GPT-4o'      },
    ]},
    gemini:  { name: 'Gemini (Google)', placeholder: 'AIza...', models: [
      { id: 'gemini-2.0-flash',  label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-flash',  label: 'Gemini 1.5 Flash' },
    ]},
    groq:    { name: 'Groq', placeholder: 'gsk_...', models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B'  },
    ]},
  };

  function initApiManager() {
    document.getElementById('qro-add-api').addEventListener('click', () => addApiRow('claude'));
    // seed one row
    addApiRow('claude');
  }

  function addApiRow(prov = 'claude') {
    const id = ++apiRowCounter;
    const p  = PROVIDERS[prov];
    apiPool.push({ id, provider: prov, key: '', model: p.models[0].id, status: 'idle' });
    renderApiPool();
  }

  function renderApiPool() {
    const list = document.getElementById('qro-api-list');
    if (!list) return;
    list.innerHTML = '';
    apiPool.forEach(entry => {
      const prov = PROVIDERS[entry.provider];
      const row  = document.createElement('div');
      row.className = 'qr-provider-row' + (entry.status === 'fail' ? ' failed' : entry.status === 'ok' ? ' active' : '');
      row.id = 'qro-prow-' + entry.id;

      const selP = document.createElement('select');
      selP.className = 'qr-provider-select';
      Object.entries(PROVIDERS).forEach(([k, v]) => {
        const o = document.createElement('option'); o.value = k; o.textContent = v.name;
        if (k === entry.provider) o.selected = true;
        selP.appendChild(o);
      });
      selP.addEventListener('change', () => {
        entry.provider = selP.value;
        entry.model    = PROVIDERS[selP.value]?.models[0]?.id || '';
        inp.placeholder = PROVIDERS[selP.value]?.placeholder || '';
        renderModelOpts(modelSel, selP.value, entry.model);
      });

      const inp = document.createElement('input');
      inp.type = 'password'; inp.className = 'qr-key-input';
      inp.placeholder = prov.placeholder; inp.value = entry.key;
      const saveKey = () => { entry.key = inp.value.trim(); };
      inp.addEventListener('input', saveKey);
      inp.addEventListener('paste', () => setTimeout(saveKey, 10));

      const modelSel = document.createElement('select');
      modelSel.className = 'qr-model-select';
      renderModelOpts(modelSel, entry.provider, entry.model);
      modelSel.addEventListener('change', () => { entry.model = modelSel.value; });

      const dot = document.createElement('div');
      dot.className = 'qr-dot ' + entry.status; dot.id = 'qro-dot-' + entry.id;

      const eyeBtn = document.createElement('button');
      eyeBtn.className = 'qr-btn qr-btn-secondary'; eyeBtn.textContent = '👁';
      eyeBtn.style.cssText = 'min-height:1.9rem;padding:0 0.5rem;font-size:0.78rem;';
      eyeBtn.addEventListener('click', () => { inp.type = inp.type === 'password' ? 'text' : 'password'; });

      const delBtn = document.createElement('button');
      delBtn.className = 'qr-btn qr-btn-danger'; delBtn.textContent = '✕';
      delBtn.style.cssText = 'min-height:1.9rem;padding:0 0.5rem;font-size:0.78rem;';
      delBtn.addEventListener('click', () => { apiPool = apiPool.filter(e => e.id !== entry.id); renderApiPool(); });

      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;align-items:center;gap:0.35rem;';
      wrap.appendChild(dot); wrap.appendChild(eyeBtn); wrap.appendChild(delBtn);

      row.appendChild(selP); row.appendChild(inp); row.appendChild(modelSel); row.appendChild(wrap);
      list.appendChild(row);
    });

    const statusEl = document.getElementById('qro-api-status');
    const filled   = apiPool.filter(e => e.key);
    if (!statusEl) return;
    statusEl.textContent = filled.length
      ? filled.map(e => `✅ ${PROVIDERS[e.provider]?.name} / ${e.key.substring(0,8)}...`).join('  ')
      : '⚠️ Belum ada API key';
  }

  function renderModelOpts(sel, provKey, selected) {
    const models = PROVIDERS[provKey]?.models || [];
    sel.innerHTML = models.map(m => `<option value="${m.id}" ${m.id === selected ? 'selected' : ''}>${m.label}</option>`).join('');
  }

  async function callProvider(entry, prompt) {
    const { provider, key, model } = entry;
    if (provider === 'claude') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key,
          'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model, max_tokens: 400, messages: [{ role: 'user', content: prompt }] })
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || `HTTP ${r.status}`); }
      return (await r.json()).content?.[0]?.text || '—';
    }
    if (provider === 'openai') {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, max_tokens: 400, messages: [{ role: 'user', content: prompt }] })
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || `HTTP ${r.status}`); }
      return (await r.json()).choices?.[0]?.message?.content || '—';
    }
    if (provider === 'gemini') {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 400 } })
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || `HTTP ${r.status}`); }
      return (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '—';
    }
    if (provider === 'groq') {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, max_tokens: 400, messages: [{ role: 'user', content: prompt }] })
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || `HTTP ${r.status}`); }
      return (await r.json()).choices?.[0]?.message?.content || '—';
    }
    throw new Error('Unknown provider: ' + provider);
  }

  async function callAI(prompt) {
    const avail = apiPool.filter(e => e.key && e.status !== 'fail');
    if (!avail.length) throw new Error('Tidak ada API key tersedia.');
    for (const entry of avail) {
      const dot = document.getElementById('qro-dot-' + entry.id);
      const row = document.getElementById('qro-prow-' + entry.id);
      if (dot) dot.className = 'qr-dot busy';
      try {
        const result = await callProvider(entry, prompt);
        entry.status = 'ok';
        if (dot) dot.className = 'qr-dot ok';
        if (row) { row.classList.remove('failed'); row.classList.add('active'); }
        return result;
      } catch (err) {
        entry.status = 'fail';
        if (dot) dot.className = 'qr-dot fail';
        if (row) { row.classList.add('failed'); row.classList.remove('active'); }
      }
    }
    throw new Error('Semua provider gagal.');
  }

  async function analyseAll() {
    const okRows = bulkRows.filter(r => r.status === 'OK' && (r.result || r.ocr));
    if (!okRows.length) { alert('⚠️ Tidak ada hasil yang bisa dianalisis.'); return; }
    if (!apiPool.some(e => e.key)) { alert('⚠️ Tambahkan API key terlebih dahulu.'); return; }

    const customTpl = document.getElementById('qro-prompt-input')?.value?.trim() || '';
    const isBoth    = bulkMode === 'both';
    const aiColIdx  = isBoth ? 5 : 4;

    document.getElementById('qro-bulk-ai').disabled = true;
    document.getElementById('qro-ai-prog').style.display = '';

    let done = 0;
    const setAiProg = () => {
      const pct = Math.round(done / okRows.length * 100);
      document.getElementById('qro-ai-prog-fill').style.width = pct + '%';
      document.getElementById('qro-ai-prog-pct').textContent  = pct + '%';
      document.getElementById('qro-ai-prog-txt').textContent  = `AI menganalisis ${done} dari ${okRows.length}...`;
    };
    setAiProg();

    for (const row of okRows) {
      const tbody = document.getElementById('qro-bulk-tbody');
      const tr    = document.getElementById('qro-row-' + row.row);
      if (!tr) { done++; setAiProg(); continue; }
      while (tr.children.length <= aiColIdx) tr.appendChild(document.createElement('td'));
      const aiCell = tr.children[aiColIdx];
      aiCell.innerHTML = '<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.75rem;color:var(--qr-muted);"><div class="qr-spinner" style="width:1rem;height:1rem;border-width:2px;"></div> Menganalisis...</div>';

      try {
        const qrSnip  = (row.result || '').substring(0, 1200);
        const ocrSnip = (row.ocr   || '').substring(0, 1200);
        let prompt = customTpl
          ? customTpl.replace(/\{\{QR\}\}/g, qrSnip).replace(/\{\{OCR\}\}/g, ocrSnip).replace(/\{\{DATA\}\}/g, qrSnip || ocrSnip)
          : isBoth
            ? `Dari label aset — Kode QR: "${qrSnip}" | Teks Label: "${ocrSnip}". Tampilkan nama aset, kode, dan info relevan. Singkat.`
            : bulkMode === 'ocr'
              ? `Ekstrak field penting dari teks ini (tanggal, nomor, total, nama): "${ocrSnip}". Jawab singkat.`
              : `Analisis QR ini: "${qrSnip}". Tentukan tipe (URL/email/WiFi/teks), apakah valid, ringkasan 1 kalimat.`;

        const text = await callAI(prompt);
        const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
        aiCell.innerHTML = `<div style="font-size:0.78rem;color:var(--accent);line-height:1.5;white-space:pre-wrap;">${safe}</div>`;
        row.aiResult = text;
      } catch (err) {
        aiCell.innerHTML = `<span style="color:var(--qr-danger);font-size:0.75rem;">❌ ${err.message}</span>`;
      }
      done++; setAiProg();
    }

    document.getElementById('qro-ai-prog-txt').textContent = `✅ Analisis AI selesai — ${okRows.length} baris`;
    document.getElementById('qro-bulk-ai').disabled = false;
  }

  function exportCSV() {
    if (!bulkRows.length) return;
    const isBoth = bulkMode === 'both';
    const header = isBoth
      ? ['No','File','Status','Hasil QR','Hasil OCR','Analisis AI']
      : ['No','File','Status', bulkMode === 'qr' ? 'Hasil QR' : 'Hasil OCR','Analisis AI'];
    const rows = bulkRows.map(r => {
      const base = [r.row, `"${r.file.replace(/"/g,'""')}"`, r.status, `"${r.result.replace(/"/g,'""')}"`];
      if (isBoth) base.push(`"${(r.ocr||'').replace(/"/g,'""')}"`);
      base.push(`"${(r.aiResult||'').replace(/"/g,'""')}"`);
      return base;
    });
    const csv  = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `bulk-${bulkMode}-${Date.now()}.csv`;
    a.click();
  }

  /* ══════════════════════════════════════════════════════
     Label QR Generator
  ══════════════════════════════════════════════════════ */
  function initLabel() {
    const upload = document.getElementById('qro-label-upload');
    const input  = document.getElementById('qro-label-input');
    upload.addEventListener('click', () => input.click());
    upload.addEventListener('dragover',  e => { e.preventDefault(); upload.classList.add('dragover'); });
    upload.addEventListener('dragleave', () => upload.classList.remove('dragover'));
    upload.addEventListener('drop', e => { e.preventDefault(); upload.classList.remove('dragover'); if (e.dataTransfer.files[0]) parseLabelFile(e.dataTransfer.files[0]); });
    input.addEventListener('change', e => { if (e.target.files[0]) parseLabelFile(e.target.files[0]); });

    document.getElementById('qro-lbl-render').addEventListener('click', renderLabels);
    document.getElementById('qro-lbl-pdf').addEventListener('click', exportLabelPDF);
    document.getElementById('qro-lbl-clear').addEventListener('click', clearLabel);
  }

  async function parseLabelFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    let rows  = [];

    if (ext === 'csv') {
      const text = await file.text();
      rows = text.trim().split('\n').map(line => line.split(',').map(c => c.replace(/^"|"$/g,'').trim()));
    } else {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf, { type: 'array' });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    }

    if (!rows.length) { alert('⚠️ File kosong.'); return; }

    const headers  = rows[0].map(h => String(h).trim());
    const dataRows = rows.slice(1).filter(r => r.some(c => String(c).trim()));
    const lc = headers.map(h => h.toLowerCase());
    const guessQR  = lc.findIndex(h => h.includes('kode') || h.includes('code') || h === 'no' || h === 'id');
    const guessLbl = lc.findIndex(h => h.includes('nama') || h.includes('name') || h.includes('label'));

    const selQR  = document.getElementById('qro-lbl-col-qr');
    const selLbl = document.getElementById('qro-lbl-col-name');
    selQR.innerHTML = selLbl.innerHTML = headers.map((h, i) => `<option value="${i}">${h || 'Kolom '+(i+1)}</option>`).join('');
    selQR.value  = guessQR  >= 0 ? guessQR  : 0;
    selLbl.value = guessLbl >= 0 ? guessLbl : Math.min(1, headers.length - 1);

    bgData = dataRows.map(r => ({ _raw: r, qr: String(r[+selQR.value]||'').trim(), label: String(r[+selLbl.value]||'').trim() }));

    ['qro-label-map-row','qro-label-cfg-row','qro-label-stats'].forEach(id => document.getElementById(id).style.display = '');
    document.getElementById('qro-label-stats').textContent = `✅ ${dataRows.length} baris — kolom: ${headers.join(', ')}`;
    renderLabels();
  }

  function renderLabels() {
    const qrIdx  = parseInt(document.getElementById('qro-lbl-col-qr').value);
    const lblIdx = parseInt(document.getElementById('qro-lbl-col-name').value);
    const ec     = document.getElementById('qro-lbl-ec').value;

    bgData = bgData.map(r => ({ _raw: r._raw, qr: String(r._raw[qrIdx]||'').trim(), label: String(r._raw[lblIdx]||'').trim() }));

    const grid = document.getElementById('qro-label-grid');
    grid.innerHTML = '';

    bgData.forEach((item, i) => {
      if (!item.qr && !item.label) return;
      const card   = document.createElement('div');
      card.className = 'qr-label-card';
      const canvas = document.createElement('canvas');
      try {
        QrCreator.render({ text: item.qr || item.label, size: 82, fill: '#000', background: '#fff', ecLevel: ec, radius: 0 }, canvas);
      } catch {
        canvas.width = canvas.height = 82;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fee2e2'; ctx.fillRect(0,0,82,82);
      }
      card.appendChild(canvas);
      const name  = document.createElement('div'); name.className = 'qr-label-name'; name.textContent = item.label || item.qr;
      const code  = document.createElement('div'); code.className = 'qr-label-code'; code.textContent = `#${i+1} · ${item.qr}`;
      card.appendChild(name); card.appendChild(code);
      grid.appendChild(card);
    });

    const valid = bgData.filter(r => r.qr || r.label).length;
    document.getElementById('qro-label-btns').style.display  = '';
    document.getElementById('qro-label-stats').style.display = '';
    document.getElementById('qro-label-stats').textContent   = `✅ ${valid} label siap`;
  }

  async function exportLabelPDF() {
    const valid = bgData.filter(r => r.qr || r.label);
    if (!valid.length) { alert('⚠️ Tidak ada data.'); return; }
    const { jsPDF } = window.jspdf;
    const lW = parseFloat(document.getElementById('qro-lbl-w').value) || 38;
    const lH = parseFloat(document.getElementById('qro-lbl-h').value) || 42;
    const fs = parseFloat(document.getElementById('qro-lbl-fs').value) || 8;
    const ec = document.getElementById('qro-lbl-ec').value;
    const pageW = 210, pageH = 297, marginX = 8, marginY = 8, gap = 3;
    const cols = Math.max(1, Math.floor((pageW - 2*marginX + gap) / (lW + gap)));
    const rows_ = Math.max(1, Math.floor((pageH - 2*marginY + gap) / (lH + gap)));
    const perPage = cols * rows_;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const qrPx = Math.round((lW - 6) * 3.78);

    for (let i = 0; i < valid.length; i++) {
      const item = valid[i];
      const pos  = i % perPage;
      const col  = pos % cols;
      const row  = Math.floor(pos / cols);
      if (i > 0 && pos === 0) doc.addPage();
      const x = marginX + col * (lW + gap);
      const y = marginY + row * (lH + gap);
      doc.setDrawColor(180,180,180); doc.setLineWidth(0.3);
      doc.roundedRect(x, y, lW, lH, 1.5, 1.5);
      try {
        const canvas = document.createElement('canvas');
        QrCreator.render({ text: item.qr || item.label, size: qrPx, fill: '#000', background: '#fff', ecLevel: ec, radius: 0 }, canvas);
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', x+3, y+2, lW-6, lW-6);
      } catch {}
      doc.setFontSize(fs); doc.setTextColor(20,20,20); doc.setFont('helvetica','bold');
      const lines = doc.splitTextToSize(item.label || item.qr, lW - 4);
      doc.text(lines.slice(0,2), x + lW/2, y + 2 + (lW-6) + 3.5, { align: 'center' });
    }

    doc.save(`qr-labels-${valid.length}pcs-${Date.now()}.pdf`);
    beep();
    document.getElementById('qro-label-stats').textContent = `✅ PDF berhasil — ${valid.length} label`;
  }

  function clearLabel() {
    bgData = [];
    document.getElementById('qro-label-input').value = '';
    document.getElementById('qro-label-grid').innerHTML = '';
    ['qro-label-map-row','qro-label-cfg-row','qro-label-btns','qro-label-stats'].forEach(id => {
      document.getElementById(id).style.display = 'none';
    });
  }

  /* ══════════════════════════════════════════════════════
     Misc
  ══════════════════════════════════════════════════════ */
  function initMisc() {
    document.getElementById('qro-copy-btn')?.addEventListener('click', function() {
      const txt = document.getElementById('qro-result-text')?.textContent;
      if (txt) {
        navigator.clipboard.writeText(txt);
        this.textContent = '✓ Tersalin!';
        setTimeout(() => this.textContent = '📋 Salin', 2000);
      }
    });
    document.getElementById('qro-clear-history')?.addEventListener('click', () => {
      if (!confirm('Hapus semua riwayat?')) return;
      historyArr = []; renderHistory();
    });
  }

  /* ══════════════════════════════════════════════════════
     Public: mount()  —  called once the container is ready
  ══════════════════════════════════════════════════════ */
  function mount(container) {
    container.innerHTML = buildHTML();
    const root = container.querySelector('#sarpras-qr-tool-root');
    initTabs(root);
    initVideo();
    initImageUpload();
    initOCR();
    initGenerator();
    initBulk();
    initApiManager();
    initLabel();
    initMisc();
  }

  return { mount, loadDeps };
})();


/* ══════════════════════════════════════════════════════════════
   enhanceInventoryPage()
   Mirrors enhanceStaffPage() in app.js.
   Adds "Overview" | "QR / OCR" subnav to the Sarpras section.
   ══════════════════════════════════════════════════════════════ */
window.enhanceInventoryPage = function() {
  const section = document.querySelector('#inventory');
  const page    = section?.querySelector('.module-page');
  const heading = page?.querySelector('.module-heading');
  if (!section || !page || !heading || page.querySelector('.module-subnav')) return;

  /* ── Wrap existing content into "overview" sub-page ── */
  const overview = document.createElement('section');
  overview.id        = 'inv-overview';
  overview.className = 'module-subpage';
  [...page.children].forEach(child => { if (child !== heading) overview.appendChild(child); });

  /* ── Subnav (same markup as Staff) ── */
  const subnav = document.createElement('div');
  subnav.className = 'module-subnav';
  subnav.setAttribute('role', 'tablist');
  subnav.innerHTML = `
    <button class="active" type="button" data-invpage="inv-overview">Overview</button>
    <button type="button" data-invpage="inv-qrocr">QR / OCR</button>
  `;

  /* ── QR/OCR sub-page container ── */
  const qrPage = document.createElement('section');
  qrPage.id        = 'inv-qrocr';
  qrPage.className = 'module-subpage';
  qrPage.hidden    = true;

  /* Loading placeholder */
  qrPage.innerHTML = `
    <div class="sarpras-qr-loading" id="sarpras-qr-loading">
      <div class="qr-spinner"></div>
      <strong>Menyiapkan alat...</strong>
      <small>Memuat library QR, OCR, dan PDF scanner</small>
    </div>
  `;

  page.append(subnav, overview, qrPage);

  /* ── Subnav switching ── */
  let qrMounted = false;

  const openInvPage = id => {
    page.querySelectorAll('[data-invpage]').forEach(b => b.classList.toggle('active', b.dataset.invpage === id));
    page.querySelectorAll('.module-subpage').forEach(s => { s.hidden = s.id !== id; });

    if (id === 'inv-qrocr' && !qrMounted) {
      /* Lazy-load all deps, then mount */
      window.inventoryQROCR.loadDeps()
        .then(() => {
          qrMounted = true;
          window.inventoryQROCR.mount(qrPage);
        })
        .catch(err => {
          qrPage.innerHTML = `<div class="sarpras-qr-loading"><strong style="color:var(--due-text)">Gagal memuat library.</strong><small>${err.message}</small></div>`;
        });
    }
  };

  page.querySelectorAll('[data-invpage]').forEach(b => {
    b.addEventListener('click', () => openInvPage(b.dataset.invpage));
  });

  /* Wire "QR / OCR" quick-action button (created by renderSimplePages) */
  page.querySelectorAll('.module-feature-list button').forEach(btn => {
    if (btn.textContent.trim().toLowerCase().includes('qr')) {
      btn.addEventListener('click', () => openInvPage('inv-qrocr'));
    }
  });
};
