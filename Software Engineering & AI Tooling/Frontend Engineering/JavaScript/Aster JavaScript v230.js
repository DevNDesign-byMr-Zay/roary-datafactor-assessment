/* Aster JavaScript v230 — authenticated buyer-safe derivative: download-options panel construction. Host state/dependencies are intentionally external. */
function buildPanel(panel){
    panel.innerHTML = `
      <div class="rt-dl-head">
        <div>
          <div class="rt-dl-title">Download</div>
          <div class="rt-dl-subtitle">Export settings</div>
        </div>
      </div>

      <div class="rt-dl-card">
        <div class="rt-dl-row"><div class="rt-dl-field">
          <div class="rt-dl-label">File type</div>
          <select class="rt-dl-select" id="rtDlFormat">
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WEBP</option>
          </select>
        </div><div class="rt-dl-field">
          <div class="rt-dl-label">Size</div>
          <select class="rt-dl-select" id="rtDlScalePick">
            <option value="100">1x</option>
            <option value="200">2x</option>
            <option value="300">3x</option>
            <option value="400">4x</option>
          </select>
        </div></div>

        <div class="rt-dl-field" id="rtDlQualityWrap">
          <div class="rt-dl-label">Quality</div>
          <input class="rt-dl-range" id="rtDlQuality" type="range" min="40" max="100" step="1" value="95">
          <div class="rt-dl-muted" id="rtDlQualityReadout"></div>
        </div>

        <div class="rt-dl-field" id="rtDlTransparentWrap">
          <div class="rt-dl-label">Background</div>
          <div class="rt-dl-toggle">
            <div>
              <div style="font-weight:900;font-size:13px">Transparent</div>
              <small>PNG only</small>
            </div>
            <input id="rtDlTransparent" type="checkbox">
          </div>
        </div>

        <div class="rt-dl-toggle">
          <div>
            <div style="font-weight:900;font-size:13px">Compress file</div>
            <small>Smaller download</small>
          </div>
          <input id="rtDlCompress" type="checkbox">
        </div>

        <div class="rt-dl-toggle">
          <div>
            <div style="font-weight:900;font-size:13px">Save settings</div>
            <small>Use these next time</small>
          </div>
          <input id="rtDlSave" type="checkbox">
        </div>

        <div class="rt-dl-actions">
          <button class="rt-dl-btn rt-dl-btn-ghost" type="button" id="rtDlReset">Reset</button>
          <button class="rt-dl-btn rt-dl-btn-primary" type="button" id="rtDlDownload">Download</button>
        </div>

        <div class="rt-dl-muted" id="rtDlNote"></div>
      </div>
    `;
  }
