(() => {
  'use strict';

  const els = {
    sheetWidth: document.querySelector('#sheetWidth'),
    sheetHeight: document.querySelector('#sheetHeight'),
    units: document.querySelector('#units'),
    margin: document.querySelector('#margin'),
    gap: document.querySelector('#gap'),
    allowRotate: document.querySelector('#allowRotate'),
    partsBody: document.querySelector('#partsBody'),
    rowTemplate: document.querySelector('#partRowTemplate'),
    addPartBtn: document.querySelector('#addPartBtn'),
    clearPartsBtn: document.querySelector('#clearPartsBtn'),
    nestBtn: document.querySelector('#nestBtn'),
    exampleBtn: document.querySelector('#exampleBtn'),
    errorBox: document.querySelector('#errorBox'),
    resultsPanel: document.querySelector('#resultsPanel'),
    resultSummary: document.querySelector('#resultSummary'),
    stats: document.querySelector('#stats'),
    preview: document.querySelector('#preview'),
    sheetIndicator: document.querySelector('#sheetIndicator'),
    prevSheetBtn: document.querySelector('#prevSheetBtn'),
    nextSheetBtn: document.querySelector('#nextSheetBtn'),
    exportSheetBtn: document.querySelector('#exportSheetBtn'),
    exportAllBtn: document.querySelector('#exportAllBtn'),
    statusPill: document.querySelector('#statusPill')
  };

  let state = {
    result: null,
    sheetIndex: 0,
    settings: null
  };

  class MaxRectsBin {
    constructor(width, height, heuristic) {
      this.width = width;
      this.height = height;
      this.heuristic = heuristic;
      this.freeRects = [{ x: 0, y: 0, w: width, h: height }];
      this.usedRects = [];
    }

    scoreRect(w, h) {
      let best = null;
      for (const free of this.freeRects) {
        if (w <= free.w + 1e-9 && h <= free.h + 1e-9) {
          const leftoverH = Math.abs(free.w - w);
          const leftoverV = Math.abs(free.h - h);
          const shortSide = Math.min(leftoverH, leftoverV);
          const longSide = Math.max(leftoverH, leftoverV);
          const areaFit = free.w * free.h - w * h;
          const bottom = free.y + h;
          const right = free.x + w;

          let score1;
          let score2;
          switch (this.heuristic) {
            case 'area':
              score1 = areaFit;
              score2 = shortSide;
              break;
            case 'long':
              score1 = longSide;
              score2 = shortSide;
              break;
            case 'bottom':
              score1 = bottom;
              score2 = right;
              break;
            case 'short':
            default:
              score1 = shortSide;
              score2 = longSide;
          }

          const candidate = { x: free.x, y: free.y, w, h, score1, score2 };
          if (!best || score1 < best.score1 - 1e-9 ||
              (Math.abs(score1 - best.score1) < 1e-9 && score2 < best.score2 - 1e-9)) {
            best = candidate;
          }
        }
      }
      return best;
    }

    place(rect) {
      const newFree = [];
      for (const free of this.freeRects) {
        if (!this.intersects(free, rect)) {
          newFree.push(free);
          continue;
        }
        this.splitFreeRect(free, rect, newFree);
      }
      this.freeRects = this.pruneFreeList(newFree);
      this.usedRects.push(rect);
      return rect;
    }

    intersects(a, b) {
      return !(b.x >= a.x + a.w - 1e-9 || b.x + b.w <= a.x + 1e-9 ||
               b.y >= a.y + a.h - 1e-9 || b.y + b.h <= a.y + 1e-9);
    }

    splitFreeRect(free, used, out) {
      if (used.x < free.x + free.w && used.x + used.w > free.x) {
        if (used.y > free.y && used.y < free.y + free.h) {
          out.push({ x: free.x, y: free.y, w: free.w, h: used.y - free.y });
        }
        if (used.y + used.h < free.y + free.h) {
          out.push({ x: free.x, y: used.y + used.h, w: free.w, h: free.y + free.h - (used.y + used.h) });
        }
      }

      if (used.y < free.y + free.h && used.y + used.h > free.y) {
        if (used.x > free.x && used.x < free.x + free.w) {
          out.push({ x: free.x, y: free.y, w: used.x - free.x, h: free.h });
        }
        if (used.x + used.w < free.x + free.w) {
          out.push({ x: used.x + used.w, y: free.y, w: free.x + free.w - (used.x + used.w), h: free.h });
        }
      }
    }

    pruneFreeList(rects) {
      const clean = rects.filter(r => r.w > 1e-9 && r.h > 1e-9);
      const keep = new Array(clean.length).fill(true);
      for (let i = 0; i < clean.length; i++) {
        if (!keep[i]) continue;
        for (let j = 0; j < clean.length; j++) {
          if (i === j || !keep[j]) continue;
          if (this.contains(clean[j], clean[i])) {
            keep[i] = false;
            break;
          }
        }
      }
      return clean.filter((_, i) => keep[i]);
    }

    contains(a, b) {
      return b.x >= a.x - 1e-9 && b.y >= a.y - 1e-9 &&
             b.x + b.w <= a.x + a.w + 1e-9 &&
             b.y + b.h <= a.y + a.h + 1e-9;
    }
  }

  function addPartRow(part = {}) {
    const fragment = els.rowTemplate.content.cloneNode(true);
    const row = fragment.querySelector('.part-row');
    row.querySelector('.part-width').value = part.width ?? '';
    row.querySelector('.part-height').value = part.height ?? '';
    row.querySelector('.part-qty').value = part.qty ?? 1;
    row.querySelector('.part-rotate').checked = part.rotate ?? true;
    row.querySelector('.remove-part').addEventListener('click', () => {
      row.remove();
      if (!els.partsBody.children.length) addPartRow();
    });
    els.partsBody.appendChild(fragment);
  }

  function clearParts() {
    els.partsBody.innerHTML = '';
    addPartRow();
    hideResults();
  }

  function loadExample() {
    els.sheetWidth.value = 2440;
    els.sheetHeight.value = 1220;
    els.margin.value = 10;
    els.gap.value = 3;
    els.units.value = 'mm';
    els.allowRotate.checked = true;
    els.partsBody.innerHTML = '';
    [
      { width: 720, height: 420, qty: 4 },
      { width: 610, height: 380, qty: 5 },
      { width: 500, height: 300, qty: 4 },
      { width: 350, height: 260, qty: 6 }
    ].forEach(addPartRow);
    hideResults();
  }

  function readInputs() {
    const sheetW = parseFloat(els.sheetWidth.value);
    const sheetH = parseFloat(els.sheetHeight.value);
    const margin = parseFloat(els.margin.value || '0');
    const gap = parseFloat(els.gap.value || '0');

    if (!(sheetW > 0) || !(sheetH > 0)) throw new Error('Enter a valid sheet width and height.');
    if (!(margin >= 0) || !(gap >= 0)) throw new Error('Margin and part gap must be zero or greater.');
    if (sheetW - margin * 2 <= 0 || sheetH - margin * 2 <= 0) {
      throw new Error('The edge margin leaves no usable sheet area.');
    }

    const parts = [];
    let rowNo = 0;
    for (const row of els.partsBody.querySelectorAll('.part-row')) {
      rowNo++;
      const width = parseFloat(row.querySelector('.part-width').value);
      const height = parseFloat(row.querySelector('.part-height').value);
      const qty = parseInt(row.querySelector('.part-qty').value, 10);
      const rotate = row.querySelector('.part-rotate').checked;
      const blank = Number.isNaN(width) && Number.isNaN(height);
      if (blank) continue;
      if (!(width > 0) || !(height > 0)) throw new Error(`Part row ${rowNo} needs a valid width and height.`);
      if (!Number.isInteger(qty) || qty < 1) throw new Error(`Part row ${rowNo} needs a quantity of 1 or more.`);
      parts.push({ width, height, qty, rotate, rowNo });
    }
    if (!parts.length) throw new Error('Add at least one part.');

    return {
      sheetW,
      sheetH,
      margin,
      gap,
      globalRotate: els.allowRotate.checked,
      units: els.units.value,
      parts
    };
  }

  function expandParts(settings) {
    const expanded = [];
    let id = 1;
    settings.parts.forEach((p, typeIndex) => {
      for (let i = 0; i < p.qty; i++) {
        expanded.push({
          id: id++,
          typeIndex,
          originalW: p.width,
          originalH: p.height,
          canRotate: settings.globalRotate && p.rotate,
          area: p.width * p.height,
          maxSide: Math.max(p.width, p.height),
          minSide: Math.min(p.width, p.height)
        });
      }
    });
    return expanded;
  }

  function seededShuffle(items, seed) {
    const arr = [...items];
    let s = seed >>> 0;
    const rand = () => {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function orderingVariants(parts) {
    const variants = [
      [...parts].sort((a, b) => b.area - a.area || b.maxSide - a.maxSide),
      [...parts].sort((a, b) => b.maxSide - a.maxSide || b.area - a.area),
      [...parts].sort((a, b) => b.originalW - a.originalW || b.originalH - a.originalH),
      [...parts].sort((a, b) => b.originalH - a.originalH || b.originalW - a.originalW),
      [...parts].sort((a, b) => (b.originalW + b.originalH) - (a.originalW + a.originalH)),
      [...parts].sort((a, b) => b.minSide - a.minSide || b.maxSide - a.maxSide)
    ];
    const randomTrials = parts.length <= 150 ? 8 : 3;
    for (let i = 1; i <= randomTrials; i++) variants.push(seededShuffle(parts, 7919 * i + parts.length));
    return variants;
  }

  function validateFit(part, usableW, usableH, gap) {
    const w = part.originalW + gap;
    const h = part.originalH + gap;
    const normal = w <= usableW + 1e-9 && h <= usableH + 1e-9;
    const rotated = part.canRotate && h <= usableW + 1e-9 && w <= usableH + 1e-9;
    return normal || rotated;
  }

  function packWithStrategy(parts, settings, heuristic) {
    const usableW = settings.sheetW - 2 * settings.margin + settings.gap;
    const usableH = settings.sheetH - 2 * settings.margin + settings.gap;
    const bins = [];

    for (const part of parts) {
      let best = null;
      const orientations = [{
        pw: part.originalW + settings.gap,
        ph: part.originalH + settings.gap,
        actualW: part.originalW,
        actualH: part.originalH,
        rotated: false
      }];
      if (part.canRotate && Math.abs(part.originalW - part.originalH) > 1e-9) {
        orientations.push({
          pw: part.originalH + settings.gap,
          ph: part.originalW + settings.gap,
          actualW: part.originalH,
          actualH: part.originalW,
          rotated: true
        });
      }

      for (let sheetIndex = 0; sheetIndex < bins.length; sheetIndex++) {
        const bin = bins[sheetIndex];
        for (const o of orientations) {
          const score = bin.scoreRect(o.pw, o.ph);
          if (!score) continue;
          const candidate = { sheetIndex, bin, score, o };
          if (!best || score.score1 < best.score.score1 - 1e-9 ||
              (Math.abs(score.score1 - best.score.score1) < 1e-9 && score.score2 < best.score.score2 - 1e-9)) {
            best = candidate;
          }
        }
      }

      if (!best) {
        const bin = new MaxRectsBin(usableW, usableH, heuristic);
        bins.push(bin);
        for (const o of orientations) {
          const score = bin.scoreRect(o.pw, o.ph);
          if (score) {
            best = { sheetIndex: bins.length - 1, bin, score, o };
            break;
          }
        }
      }

      if (!best) throw new Error('A part could not be placed. Check the dimensions, margins, gap, or rotation settings.');

      const packedRect = { x: best.score.x, y: best.score.y, w: best.o.pw, h: best.o.ph };
      best.bin.place(packedRect);
      packedRect.part = part;
      packedRect.actualW = best.o.actualW;
      packedRect.actualH = best.o.actualH;
      packedRect.rotated = best.o.rotated;
    }

    const sheets = bins.map((bin, sheetIndex) => {
      const placements = bin.usedRects.map(r => ({
        id: r.part.id,
        typeIndex: r.part.typeIndex,
        x: r.x + settings.margin,
        y: r.y + settings.margin,
        w: r.actualW,
        h: r.actualH,
        rotated: r.rotated,
        originalW: r.part.originalW,
        originalH: r.part.originalH
      }));
      const partArea = placements.reduce((sum, p) => sum + p.w * p.h, 0);
      return { sheetIndex, placements, partArea };
    });

    const totalPartArea = sheets.reduce((sum, s) => sum + s.partArea, 0);
    const sheetArea = settings.sheetW * settings.sheetH;
    const usedSheetArea = sheets.length * sheetArea;
    const overallUtilization = totalPartArea / usedSheetArea;
    const lastSheetUtil = sheets.length ? sheets[sheets.length - 1].partArea / sheetArea : 0;
    const compactness = sheets.reduce((sum, s) => {
      if (!s.placements.length) return sum;
      const maxX = Math.max(...s.placements.map(p => p.x + p.w));
      const maxY = Math.max(...s.placements.map(p => p.y + p.h));
      return sum + maxX * maxY;
    }, 0);

    return { sheets, totalPartArea, overallUtilization, lastSheetUtil, compactness, heuristic };
  }

  function compareResults(a, b) {
    if (!b) return -1;
    if (a.sheets.length !== b.sheets.length) return a.sheets.length - b.sheets.length;
    if (Math.abs(a.lastSheetUtil - b.lastSheetUtil) > 1e-10) return b.lastSheetUtil - a.lastSheetUtil;
    if (Math.abs(a.compactness - b.compactness) > 1e-7) return a.compactness - b.compactness;
    return b.overallUtilization - a.overallUtilization;
  }

  function nest(settings) {
    const parts = expandParts(settings);
    const usableW = settings.sheetW - 2 * settings.margin + settings.gap;
    const usableH = settings.sheetH - 2 * settings.margin + settings.gap;
    const oversized = parts.find(p => !validateFit(p, usableW, usableH, settings.gap));
    if (oversized) {
      throw new Error(`Part ${fmt(oversized.originalW)} × ${fmt(oversized.originalH)} does not fit the usable sheet area.`);
    }

    const heuristics = ['short', 'area', 'long', 'bottom'];
    let best = null;
    let attempt = 0;
    const variants = orderingVariants(parts);
    for (const ordered of variants) {
      for (const heuristic of heuristics) {
        attempt++;
        const result = packWithStrategy(ordered, settings, heuristic);
        result.attempt = attempt;
        if (!best || compareResults(result, best) < 0) best = result;
      }
    }
    best.attempts = attempt;
    best.totalParts = parts.length;
    return best;
  }

  function renderResults() {
    const { result, settings } = state;
    if (!result || !settings) return;

    state.sheetIndex = Math.min(state.sheetIndex, result.sheets.length - 1);
    const current = result.sheets[state.sheetIndex];
    const sheetArea = settings.sheetW * settings.sheetH;
    const util = current.partArea / sheetArea;

    els.resultsPanel.hidden = false;
    els.resultSummary.textContent = `${result.totalParts} parts placed across ${result.sheets.length} sheet${result.sheets.length === 1 ? '' : 's'}. Best of ${result.attempts} packing attempts.`;
    els.stats.innerHTML = [
      statHtml('Sheets', result.sheets.length),
      statHtml('Overall material use', `${(result.overallUtilization * 100).toFixed(1)}%`),
      statHtml('Shown sheet use', `${(util * 100).toFixed(1)}%`),
      statHtml('Shown sheet waste', `${((1 - util) * 100).toFixed(1)}%`)
    ].join('');

    els.sheetIndicator.textContent = `Sheet ${state.sheetIndex + 1} of ${result.sheets.length}`;
    els.prevSheetBtn.disabled = state.sheetIndex === 0;
    els.nextSheetBtn.disabled = state.sheetIndex === result.sheets.length - 1;

    renderPreview(current, settings);
    els.resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function statHtml(label, value) {
    return `<div class="stat"><small>${label}</small><strong>${value}</strong></div>`;
  }

  function renderPreview(sheet, settings) {
    const pad = Math.max(settings.sheetW, settings.sheetH) * 0.015;
    const vbX = -pad;
    const vbY = -pad;
    const vbW = settings.sheetW + pad * 2;
    const vbH = settings.sheetH + pad * 2;
    els.preview.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    els.preview.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const sheetRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    sheetRect.setAttribute('x', 0);
    sheetRect.setAttribute('y', 0);
    sheetRect.setAttribute('width', settings.sheetW);
    sheetRect.setAttribute('height', settings.sheetH);
    sheetRect.setAttribute('fill', '#ffffff');
    sheetRect.setAttribute('stroke', '#17212b');
    sheetRect.setAttribute('stroke-width', Math.max(settings.sheetW, settings.sheetH) / 450);

    els.preview.replaceChildren(sheetRect);

    const palette = ['#dce9ff', '#e2f4ea', '#fff0d4', '#f1e4ff', '#ffe1e1', '#dff4f4', '#ececec'];
    for (const p of sheet.placements) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', p.x);
      rect.setAttribute('y', p.y);
      rect.setAttribute('width', p.w);
      rect.setAttribute('height', p.h);
      rect.setAttribute('fill', palette[p.typeIndex % palette.length]);
      rect.setAttribute('stroke', '#3a4754');
      rect.setAttribute('stroke-width', Math.max(settings.sheetW, settings.sheetH) / 900);
      rect.setAttribute('vector-effect', 'non-scaling-stroke');
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${fmt(p.w)} × ${fmt(p.h)}${p.rotated ? ' (rotated)' : ''}`;
      rect.appendChild(title);
      els.preview.appendChild(rect);
    }
  }

  function dxfHeader(units) {
    const insunits = units === 'in' ? 1 : 4;
    return [
      '0','SECTION','2','HEADER',
      '9','$ACADVER','1','AC1015',
      '9','$INSUNITS','70', String(insunits),
      '0','ENDSEC',
      '0','SECTION','2','TABLES','0','ENDSEC',
      '0','SECTION','2','ENTITIES'
    ];
  }

  function dxfPolyline(x, y, w, h) {
    // DXF Y is Cartesian. The nesting preview uses top-left origin, so invert Y here.
    const y0 = -y;
    const y1 = -(y + h);
    const pts = [
      [x, y0],
      [x + w, y0],
      [x + w, y1],
      [x, y1]
    ];
    const out = ['0','LWPOLYLINE','100','AcDbEntity','8','0','100','AcDbPolyline','90','4','70','1'];
    for (const [px, py] of pts) out.push('10', num(px), '20', num(py));
    return out;
  }

  function buildDxf(sheets, settings, allSheets) {
    const lines = dxfHeader(settings.units);
    const separation = Math.max(settings.margin, settings.gap, settings.sheetW * 0.05, 1);
    sheets.forEach((sheet, index) => {
      const xOffset = allSheets ? index * (settings.sheetW + separation) : 0;
      for (const p of sheet.placements) {
        lines.push(...dxfPolyline(p.x + xOffset, p.y, p.w, p.h));
      }
    });
    lines.push('0','ENDSEC','0','EOF');
    return lines.join('\r\n') + '\r\n';
  }

  function downloadText(filename, text, mime = 'application/dxf') {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportCurrentSheet() {
    if (!state.result) return;
    const sheet = state.result.sheets[state.sheetIndex];
    const dxf = buildDxf([sheet], state.settings, false);
    downloadText(`sheet-${state.sheetIndex + 1}.dxf`, dxf);
  }

  function exportAllSheets() {
    if (!state.result) return;
    const dxf = buildDxf(state.result.sheets, state.settings, true);
    downloadText('all-sheets.dxf', dxf);
  }

  function showError(message) {
    els.errorBox.textContent = message;
    els.errorBox.hidden = false;
    els.statusPill.textContent = 'Check inputs';
  }

  function clearError() {
    els.errorBox.hidden = true;
    els.errorBox.textContent = '';
  }

  function hideResults() {
    els.resultsPanel.hidden = true;
    state.result = null;
    state.settings = null;
    state.sheetIndex = 0;
    els.statusPill.textContent = 'Ready';
  }

  function fmt(n) {
    return Number.isInteger(n) ? String(n) : Number(n.toFixed(3)).toString();
  }

  function num(n) {
    const rounded = Math.abs(n) < 1e-10 ? 0 : n;
    return Number(rounded.toFixed(6)).toString();
  }

  els.addPartBtn.addEventListener('click', () => addPartRow());
  els.clearPartsBtn.addEventListener('click', clearParts);
  els.exampleBtn.addEventListener('click', loadExample);
  els.prevSheetBtn.addEventListener('click', () => { state.sheetIndex--; renderResults(); });
  els.nextSheetBtn.addEventListener('click', () => { state.sheetIndex++; renderResults(); });
  els.exportSheetBtn.addEventListener('click', exportCurrentSheet);
  els.exportAllBtn.addEventListener('click', exportAllSheets);

  els.nestBtn.addEventListener('click', () => {
    clearError();
    els.statusPill.textContent = 'Calculating…';
    els.nestBtn.disabled = true;
    requestAnimationFrame(() => {
      try {
        const settings = readInputs();
        const result = nest(settings);
        state = { result, sheetIndex: 0, settings };
        els.statusPill.textContent = 'Nested';
        renderResults();
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      } finally {
        els.nestBtn.disabled = false;
      }
    });
  });

  addPartRow({ width: 600, height: 400, qty: 4 });
  addPartRow({ width: 500, height: 300, qty: 6 });
})();
