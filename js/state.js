export const FREE_FONTS = [
  { name: '思源黑體', family: "'Noto Sans TC', sans-serif", cat: '現代', desc: '清晰百搭 · 教學解說' },
  { name: '台北黑體', family: "'Taipei Sans TC', 'Noto Sans TC', sans-serif", cat: '現代', desc: '俐落平衡 · Vlog字幕' },
  { name: '昭源黑體', family: "'Chiron Hei HK', sans-serif", cat: '現代', desc: '現代簡潔 · 時尚標題' },
  { name: '探空體', family: "'TASA Explorer', sans-serif", cat: '現代', desc: '未來科技 · 帥氣舞風' },
  { name: '芫荽體', family: "'Iansui', cursive", cat: '手寫', desc: '硬筆楷書 · 生活溫度' },
  { name: '霞鶩文楷', family: "'LXGW WenKai TC', serif", cat: '手寫', desc: '溫潤楷韻 · 古典抒情' },
  { name: '辰宇落雁體', family: "'ChenYuluoyan', cursive", cat: '手寫', desc: '飄逸手寫 · 感性歌詞' },
  { name: 'jf open 粉圓', family: "'jf-openhuninn', sans-serif", cat: '圓體', desc: '圓潤可愛 · 旅遊美食' },
  { name: '源泉圓體', family: "'GenSenRounded', sans-serif", cat: '圓體', desc: '飽滿圓角 · 親切活潑' },
  { name: '思源宋體', family: "'Noto Serif TC', serif", cat: '古典', desc: '典雅大氣 · 電影質感' },
  { name: '昭源宋體', family: "'Chiron Sung HK', serif", cat: '古典', desc: '文學書卷 · 藝文紀錄' },
  { name: '得意黑', family: "'Smiley Sans', sans-serif", cat: '特色', desc: '斜體張力 · 節拍標題' },
  { name: '俐方體11號', family: "'Cubic 11', monospace", cat: '特色', desc: '復古像素 · 趣味梗圖' },
  { name: '站酷快樂體', family: "'ZCOOL KuaiLe', sans-serif", cat: '特色', desc: '動感活潑 · 綜藝字卡' }
];

export const SUBTITLE_ANIMS = [
  { id: 'none', name: '無動畫' },
  { id: 'fade', name: '柔和淡入' },
  { id: 'pop', name: '彈跳放大' },
  { id: 'slideUp', name: '向上滑入' },
  { id: 'typewriter', name: '打字機逐字' },
  { id: 'wipe', name: '掃光展寬' }
];

export const SUB_COLOR_SWATCHES = ['#ffffff', '#ffeb3b', '#2ce6c3', '#ff7eb3', '#38bdf8', '#111827'];

export const FILTER_PRESETS = [
  { id: 'none', name: '原圖', b: 100, c: 100, s: 100, warm: 0, sharp: 0 },
  { id: 'dance', name: '練舞室高對比', b: 105, c: 122, s: 112, warm: -5, sharp: 28 },
  { id: 'vlog', name: '日系清新 Vlog', b: 108, c: 94, s: 92, warm: 10, sharp: 12 },
  { id: 'warm', name: '暖陽微光', b: 104, c: 105, s: 115, warm: 22, sharp: 10 },
  { id: 'film', name: '復古膠片', b: 96, c: 114, s: 82, warm: 14, sharp: 15 },
  { id: 'bw', name: '黑白極簡', b: 105, c: 125, s: 0, warm: 0, sharp: 22 }
];

export const TRANSITIONS = [
  { id: 'none', name: '無轉場', icon: '｜' },
  { id: 'fade', name: '疊化淡入', icon: '◐' },
  { id: 'zoom', name: '節拍推進', icon: '⊕' },
  { id: 'flash', name: '節拍閃白', icon: '⚡' },
  { id: 'slide', name: '向左滑動', icon: '⇄' }
];

export const SPEED_PRESETS = [
  { val: 0.25, label: '0.25x 極慢' },
  { val: 0.5,  label: '0.5x 慢動作' },
  { val: 0.75, label: '0.75x' },
  { val: 1.0,  label: '1.0x 原速' },
  { val: 1.5,  label: '1.5x' },
  { val: 2.0,  label: '2.0x 快轉' },
  { val: 3.0,  label: '3.0x 縮時' }
];

export const BLEND_MODES = [
  { id: 'source-over', name: '正常覆蓋' },
  { id: 'screen', name: '濾色 (去黑底)' },
  { id: 'multiply', name: '正片疊底 (去白底)' },
  { id: 'overlay', name: '疊加融合' },
  { id: 'soft-light', name: '柔光融合' }
];

export const MASK_TYPES = [
  { id: 'none', name: '無遮罩' },
  { id: 'circle', name: '圓形' },
  { id: 'roundrect', name: '圓角矩形' },
  { id: 'feather', name: '四周羽化融合' },
  { id: 'pen', name: '✒️ 鋼筆自訂形狀' }
];

export const PETAL_COLORS = [
  { hex: '#ffb7c5', name: '櫻花粉' },
  { hex: '#e11d48', name: '玫瑰紅' },
  { hex: '#fff5f7', name: '純白花瓣' },
  { hex: '#fbbf24', name: '金箔感' }
];

export function roundSec(val) {
  return Math.round(val * 100) / 100;
}

export function hexToRgb(hex) {
  const clean = (hex || '#000000').replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16) || 0;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function adjustColorBrightness(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp255(r * factor)}, ${clamp255(g * factor)}, ${clamp255(b * factor)})`;
}

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(1);
  return `${String(m).padStart(2, '0')}:${s.padStart(4, '0')}`;
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2300);
}

export function createDefaultSubtitleProps(overrides = {}) {
  return {
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    groupId: null,
    text: '新字幕點此編輯',
    orientation: 'horizontal',
    start: 0,
    duration: 3.0,
    x: 0.5,
    y: 0.78,
    size: 24,
    font: "'Noto Sans TC', sans-serif",
    color: '#ffffff',
    strokeEnabled: true,
    stroke: '#000000',
    strokeWidth: 3,
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowBlur: 8,
    shadowOffset: 3,
    bgMode: 'semi',
    bgColor: '#000000',
    bg: 'rgba(0,0,0,0.48)',
    anim: 'none',
    animDur: 0.35,
    ...overrides
  };
}

export function normalizeSubtitleObject(sub) {
  if (!sub) return sub;
  if (typeof sub.groupId === 'undefined') sub.groupId = null;
  if (typeof sub.strokeEnabled !== 'boolean') sub.strokeEnabled = Boolean(sub.stroke);
  if (!sub.stroke) sub.stroke = '#000000';
  if (typeof sub.strokeWidth !== 'number') sub.strokeWidth = 3;
  if (typeof sub.shadowEnabled !== 'boolean') sub.shadowEnabled = false;
  if (!sub.shadowColor) sub.shadowColor = '#000000';
  if (typeof sub.shadowBlur !== 'number') sub.shadowBlur = 8;
  if (typeof sub.shadowOffset !== 'number') sub.shadowOffset = 3;
  if (!sub.bgMode) {
    if (!sub.bg || sub.bg === 'transparent') sub.bgMode = 'none';
    else if (sub.bg.startsWith('rgba')) sub.bgMode = 'semi';
    else sub.bgMode = 'solid';
  }
  if (!sub.bgColor) sub.bgColor = '#000000';
  if (!sub.anim) sub.anim = 'none';
  if (typeof sub.animDur !== 'number') sub.animDur = 0.35;
  return sub;
}

export function computeSubtitleBgCss(sub) {
  if (sub.bgMode === 'none') return 'transparent';
  if (sub.bgMode === 'solid') return sub.bgColor || '#000000';
  const { r, g, b } = hexToRgb(sub.bgColor || '#000000');
  return `rgba(${r},${g},${b},0.48)`;
}

export function createDefaultClipProps(overrides = {}) {
  return {
    groupId: null,
    fileId: null, origFileName: '', trimStart: 0, start: 0, duration: 5, maxDuration: 60,
    speed: 1.0, muted: false, audioGain: 1.0, transitionAfter: 'none',
    fadeIn: { type: 'none', dur: 0.8 }, fadeOut: { type: 'none', dur: 0.8 },
    opacity: 1.0, blendMode: 'source-over', color: { b: 100, c: 100, s: 100, warm: 0, sharp: 0 },
    cutout: { mode: 'none', keyColor: '#00ff00', tolerance: 65, smoothness: 15 },
    mask: { type: 'none', feather: 12, penPoints: [] },
    baseTransform: { scaleX: 1.0, scaleY: 1.0, x: 0, y: 0, rot: 0 },
    crop: { left: 0, right: 0, top: 0, bottom: 0 }, keyframes: [], ...overrides
  };
}

export function cloneClipData(c) {
  return {
    ...c,
    groupId: c.groupId || null,
    fadeIn: { ...(c.fadeIn || { type: 'none', dur: 0.8 }) },
    fadeOut: { ...(c.fadeOut || { type: 'none', dur: 0.8 }) },
    baseTransform: { ...(c.baseTransform || { scaleX: 1.0, scaleY: 1.0, x: 0, y: 0, rot: 0 }) },
    crop: { ...(c.crop || { left: 0, right: 0, top: 0, bottom: 0 }) },
    keyframes: JSON.parse(JSON.stringify(c.keyframes || [])),
    color: { b: 100, c: 100, s: 100, warm: 0, sharp: 0, ...(c.color || {}) },
    cutout: { ...c.cutout },
    mask: { ...c.mask, penPoints: JSON.parse(JSON.stringify(c.mask.penPoints || [])) }
  };
}

const savedVoiceCfg = (() => {
  try { return JSON.parse(localStorage.getItem('cutvideo_voice_cfg') || '{}'); } catch (_) { return {}; }
})();

export const state = {
  pxPerSec: 55,
  snapEnabled: true,
  snapThresholdPx: 14,
  marqueeMode: false,
  ratio: '9:16',
  exportQuality: '1080p',
  renderScaleFactor: 1,
  currentTime: 0,
  isPlaying: false,
  isExporting: false,
  activeTab: 'media',
  drawerCollapsed: false,
  canvasBoxMode: 'transform',
  lastSelectedType: 'clip',
  selectedClipId: null,
  selectedSubId: null,
  selectedAudioId: null,
  multiSelectedIds: [],
  fontFilter: '全部',
  penEditMode: false,
  eyedropperMode: false,
  trackVisibility: { main: true, audio: true, sub: true },
  voiceConfig: {
    engine: savedVoiceCfg.engine || 'browser',
    browserVoiceURI: savedVoiceCfg.browserVoiceURI || '',
    rate: savedVoiceCfg.rate || 1.0,
    autoSyncPlayback: savedVoiceCfg.autoSyncPlayback !== false,
    provider: savedVoiceCfg.provider || 'elevenlabs',
    apiKey: savedVoiceCfg.apiKey || '',
    voiceId: savedVoiceCfg.voiceId || '',
    scriptDraft: ''
  },
  background: { mode: 'solid', color1: '#000000', color2: '#2d1b4e', mediaEl: null, mediaType: null, mediaName: '', mediaFileId: null },
  effects: {
    particleType: 'none', particleSize: 6, particleDensity: 45, particleSpeed: 1.0, petalColor: '#ffb7c5',
    spotlight: { enabled: false, angle: 0, focusX: 0.5, focusY: 0.55, spread: 0.34, darkness: 0.72, blurRadius: 14, intensity: 1.25, color: '#fff8e7' }
  },
  pipTracks: [{ id: 'pip-track-1', name: '畫中畫 L1 (頂層)', visible: true, clips: [] }],
  clips: [],
  subtitles: [],
  audioClips: []
};

export function saveVoiceConfig() {
  try {
    const { scriptDraft, ...toPersist } = state.voiceConfig;
    localStorage.setItem('cutvideo_voice_cfg', JSON.stringify(toPersist));
  } catch (_) {}
}

export function ensureMainClipsTimelineStarts() {
  let cursor = 0;
  state.clips.forEach(c => {
    if (typeof c.start !== 'number' || !isFinite(c.start)) {
      c.start = roundSec(cursor);
    } else {
      c.start = roundSec(Math.max(0, c.start));
    }
    cursor = c.start + c.duration;
  });
}

export function normalizeMainClipsOrderAndOverlap() {
  ensureMainClipsTimelineStarts();
  state.clips.sort((a, b) => (a.start || 0) - (b.start || 0));
  let prevEnd = 0;
  state.clips.forEach((c, idx) => {
    if (idx === 0) {
      c.start = roundSec(Math.max(0, c.start || 0));
    } else if ((c.start || 0) < prevEnd - 0.01) {
      c.start = roundSec(prevEnd);
    }
    prevEnd = (c.start || 0) + c.duration;
  });
}

export function getTotalDuration() {
  ensureMainClipsTimelineStarts();
  const mainEnd = state.clips.reduce((max, c) => Math.max(max, (c.start || 0) + c.duration), 0);
  let pipEnd = 0;
  state.pipTracks.forEach(tr => tr.clips.forEach(c => { pipEnd = Math.max(pipEnd, (c.start || 0) + c.duration); }));
  const subEnd = state.subtitles.reduce((max, s) => Math.max(max, s.start + s.duration), 0);
  const audEnd = state.audioClips.reduce((max, a) => Math.max(max, (a.start || 0) + a.duration), 0);
  return roundSec(Math.max(mainEnd, pipEnd, subEnd, audEnd, 1));
}

export function isClipActiveAtCurrentTime(clip, isPip) {
  if (!clip) return false;
  if (!isPip) ensureMainClipsTimelineStarts();
  const s = clip.start || 0;
  return state.currentTime >= s - 0.02 && state.currentTime <= s + clip.duration + 0.02;
}

export function getActiveVisualClipAtCurrentTime() {
  if (state.lastSelectedType === 'pip' && state.selectedClipId) {
    for (const tr of state.pipTracks) {
      if (tr.visible === false) continue;
      const found = tr.clips.find(c => c.id === state.selectedClipId);
      if (found && isClipActiveAtCurrentTime(found, true)) return { clip: found, isPip: true, track: tr };
    }
  }
  if (state.selectedClipId) {
    if (state.trackVisibility.main !== false) {
      const mainFound = state.clips.find(c => c.id === state.selectedClipId);
      if (mainFound && isClipActiveAtCurrentTime(mainFound, false)) return { clip: mainFound, isPip: false, track: null };
    }
    for (const tr of state.pipTracks) {
      if (tr.visible === false) continue;
      const found = tr.clips.find(c => c.id === state.selectedClipId);
      if (found && isClipActiveAtCurrentTime(found, true)) return { clip: found, isPip: true, track: tr };
    }
  }
  for (const tr of state.pipTracks) {
    if (tr.visible === false) continue;
    for (const p of tr.clips) {
      if (isClipActiveAtCurrentTime(p, true)) return { clip: p, isPip: true, track: tr };
    }
  }
  if (state.trackVisibility.main !== false) {
    for (const c of state.clips) {
      if (isClipActiveAtCurrentTime(c, false)) return { clip: c, isPip: false, track: null };
    }
  }
  return null;
}

export function getSelectedVisualClip() {
  if (state.lastSelectedType === 'pip' && state.selectedClipId) {
    for (const tr of state.pipTracks) {
      const found = tr.clips.find(c => c.id === state.selectedClipId);
      if (found) return { clip: found, isPip: true, track: tr };
    }
  }
  if (state.selectedClipId) {
    const mainFound = state.clips.find(c => c.id === state.selectedClipId);
    if (mainFound) return { clip: mainFound, isPip: false, track: null };
    for (const tr of state.pipTracks) {
      const found = tr.clips.find(c => c.id === state.selectedClipId);
      if (found) return { clip: found, isPip: true, track: tr };
    }
  }
  if (state.clips.length > 0) return { clip: state.clips[0], isPip: false, track: null };
  for (const tr of state.pipTracks) {
    if (tr.clips.length > 0) return { clip: tr.clips[0], isPip: true, track: tr };
  }
  return null;
}

export function getClipLocalTime(clip, isPip) {
  if (isPip) return Math.max(0, Math.min(clip.duration, state.currentTime - (clip.start || 0)));
  ensureMainClipsTimelineStarts();
  return Math.max(0, Math.min(clip.duration, state.currentTime - (clip.start || 0)));
}

export function getInterpolatedTransform(clip, localT) {
  const base = clip?.baseTransform || { scaleX: 1.0, scaleY: 1.0, x: 0, y: 0, rot: 0 };
  if (!clip || !clip.keyframes || clip.keyframes.length === 0) return { ...base };
  const kfs = [...clip.keyframes].sort((a, b) => a.t - b.t);
  if (localT <= kfs[0].t) return { ...kfs[0] };
  if (localT >= kfs[kfs.length - 1].t) return { ...kfs[kfs.length - 1] };
  for (let i = 0; i < kfs.length - 1; i++) {
    const k1 = kfs[i], k2 = kfs[i + 1];
    if (localT >= k1.t && localT <= k2.t) {
      const rawRatio = (localT - k1.t) / Math.max(0.001, k2.t - k1.t);
      const ratio = rawRatio * rawRatio * (3 - 2 * rawRatio);
      return {
        scaleX: (k1.scaleX ?? 1) + ((k2.scaleX ?? 1) - (k1.scaleX ?? 1)) * ratio,
        scaleY: (k1.scaleY ?? 1) + ((k2.scaleY ?? 1) - (k1.scaleY ?? 1)) * ratio,
        x: k1.x + (k2.x - k1.x) * ratio,
        y: k1.y + (k2.y - k1.y) * ratio,
        rot: (k1.rot || 0) + ((k2.rot || 0) - (k1.rot || 0)) * ratio
      };
    }
  }
  return { ...base };
}

export function addManualKeyframeAtCurrentTime(clip, isPip) {
  if (!clip) return;
  const localT = roundSec(getClipLocalTime(clip, isPip)), curTr = getInterpolatedTransform(clip, localT);
  if (!clip.keyframes) clip.keyframes = [];
  let existing = clip.keyframes.find(k => Math.abs(k.t - localT) < 0.1);
  if (existing) Object.assign(existing, curTr); else clip.keyframes.push({ t: localT, ...curTr });
}

export function updateClipActiveTransform(clip, localT, patch) {
  if (!clip.baseTransform) clip.baseTransform = { scaleX: 1.0, scaleY: 1.0, x: 0, y: 0, rot: 0 };
  if (clip.keyframes?.length > 0) {
    const exactKf = clip.keyframes.find(k => Math.abs(k.t - localT) < 0.1);
    if (exactKf) { Object.assign(exactKf, patch); return; }
  }
  Object.assign(clip.baseTransform, patch);
}

// ====== 撤回 / 重做堆疊 ======
let undoStack = [];
let redoStack = [];

export function captureStateSnapshot() {
  return {
    clips: state.clips.map(cloneClipData),
    pipTracks: state.pipTracks.map(tr => ({ ...tr, visible: tr.visible !== false, clips: tr.clips.map(cloneClipData) })),
    subtitles: JSON.parse(JSON.stringify(state.subtitles)),
    audioClips: state.audioClips.map(a => ({ ...a })),
    trackVisibility: { ...state.trackVisibility },
    background: { ...state.background },
    effects: JSON.parse(JSON.stringify(state.effects)),
    selectedClipId: state.selectedClipId, selectedSubId: state.selectedSubId,
    selectedAudioId: state.selectedAudioId, lastSelectedType: state.lastSelectedType,
    multiSelectedIds: [...(state.multiSelectedIds || [])],
    currentTime: state.currentTime
  };
}

export function applyStateSnapshot(snap) {
  const timelineScroll = document.getElementById('timelineScroll');
  state.clips = snap.clips.map(cloneClipData);
  state.pipTracks = snap.pipTracks.map(tr => ({ ...tr, visible: tr.visible !== false, clips: tr.clips.map(cloneClipData) }));
  state.subtitles = JSON.parse(JSON.stringify(snap.subtitles)).map(s => normalizeSubtitleObject(s));
  state.audioClips = snap.audioClips.map(a => ({ ...a }));
  state.trackVisibility = snap.trackVisibility ? { ...snap.trackVisibility } : { main: true, audio: true, sub: true };
  if (snap.background) state.background = { ...snap.background };
  if (snap.effects) state.effects = JSON.parse(JSON.stringify(snap.effects));
  state.selectedClipId = snap.selectedClipId; state.selectedSubId = snap.selectedSubId;
  state.selectedAudioId = snap.selectedAudioId; state.lastSelectedType = snap.lastSelectedType;
  state.multiSelectedIds = [...(snap.multiSelectedIds || [])];
  if (typeof snap.currentTime === 'number') {
    state.currentTime = snap.currentTime;
    if (timelineScroll) timelineScroll.scrollLeft = Math.round(state.currentTime * state.pxPerSec);
  }
}

export function updateHistoryButtonsUI() {
  const uBtn = document.getElementById('undoBtn');
  const rBtn = document.getElementById('redoBtn');
  if (uBtn) { uBtn.disabled = undoStack.length === 0; uBtn.classList.toggle('history-active', undoStack.length > 0); }
  if (rBtn) { rBtn.disabled = redoStack.length === 0; rBtn.classList.toggle('history-active', redoStack.length > 0); }
}

export function pushUndo() {
  undoStack.push(captureStateSnapshot());
  if (undoStack.length > 35) undoStack.shift();
  redoStack = [];
  updateHistoryButtonsUI();
}

export function getUndoStack() { return undoStack; }
export function getRedoStack() { return redoStack; }
