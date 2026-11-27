import {
  state,
  roundSec,
  showToast,
  cloneClipData,
  normalizeSubtitleObject,
  ensureMainClipsTimelineStarts,
  pushUndo
} from './state.js';

const DB_NAME = 'CutVideoDraftDB';
const DB_VERSION = 1;
const STORE_FILES = 'mediaFiles';
const STORE_PROJECT = 'projectState';
const memoryBlobRegistry = new Map();

let storageHooks = {
  createClonedVideoElement: null,
  ensureAudioNode: null,
  applyCanvasResolutionForRatio: null,
  expandSelectionWithLinkedGroups: null,
  updateDeleteButtonLabel: null,
  updateGroupButtonUI: null,
  renderTimeline: null,
  renderDrawer: null,
  syncVideoElements: null,
  renderFrame: null
};

export function registerStorageHooks(hooks) {
  Object.assign(storageHooks, hooks);
}

export function openDraftDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('No IndexedDB'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) db.createObjectStore(STORE_FILES);
      if (!db.objectStoreNames.contains(STORE_PROJECT)) db.createObjectStore(STORE_PROJECT);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMediaBlobToDB(fileId, blob) {
  if (!fileId || !blob) return;
  memoryBlobRegistry.set(fileId, blob);
  try {
    const db = await openDraftDB();
    const tx = db.transaction(STORE_FILES, 'readwrite');
    tx.objectStore(STORE_FILES).put(blob, fileId);
  } catch (_) {}
}

export async function getMediaBlobFromDB(fileId) {
  if (!fileId) return null;
  if (memoryBlobRegistry.has(fileId)) return memoryBlobRegistry.get(fileId);
  try {
    const db = await openDraftDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const req = tx.objectStore(STORE_FILES).get(fileId);
      req.onsuccess = () => {
        if (req.result) memoryBlobRegistry.set(fileId, req.result);
        resolve(req.result || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (_) { return null; }
}

export function buildSerializableProjectPayload() {
  ensureMainClipsTimelineStarts();
  const serializeClip = (c) => {
    const { mediaEl, ...rest } = cloneClipData(c);
    return rest;
  };
  return {
    savedAt: Date.now(),
    ratio: state.ratio,
    exportQuality: state.exportQuality,
    pxPerSec: state.pxPerSec,
    snapEnabled: state.snapEnabled,
    snapThresholdPx: state.snapThresholdPx,
    trackVisibility: { ...state.trackVisibility },
    background: {
      mode: state.background.mode,
      color1: state.background.color1,
      color2: state.background.color2,
      mediaType: state.background.mediaType,
      mediaName: state.background.mediaName,
      mediaFileId: state.background.mediaFileId || null
    },
    effects: JSON.parse(JSON.stringify(state.effects)),
    pipTracks: state.pipTracks.map(tr => ({
      id: tr.id,
      name: tr.name,
      visible: tr.visible !== false,
      clips: tr.clips.map(serializeClip)
    })),
    clips: state.clips.map(serializeClip),
    subtitles: JSON.parse(JSON.stringify(state.subtitles)),
    audioClips: state.audioClips.map(a => {
      const { mediaEl, ...rest } = a;
      return rest;
    })
  };
}

let draftSaveTimer = null;
export function scheduleAutoSaveDraft() {
  const badge = document.getElementById('draftStatusBadge');
  if (badge) badge.textContent = '💾 儲存草稿中...';
  clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(async () => {
    try {
      const db = await openDraftDB();
      const payload = buildSerializableProjectPayload();
      const tx = db.transaction(STORE_PROJECT, 'readwrite');
      tx.objectStore(STORE_PROJECT).put(payload, 'latest_draft');
      tx.oncomplete = () => {
        const tStr = new Date().toTimeString().slice(0, 5);
        if (badge) badge.textContent = `💾 草稿已存 ${tStr}`;
      };
    } catch (_) {
      if (badge) badge.textContent = '💾 本機草稿';
    }
  }, 600);
}

export async function clearDraftCache() {
  try {
    const db = await openDraftDB();
    const tx = db.transaction([STORE_PROJECT, STORE_FILES], 'readwrite');
    tx.objectStore(STORE_PROJECT).clear();
    tx.objectStore(STORE_FILES).clear();
    memoryBlobRegistry.clear();
    const badge = document.getElementById('draftStatusBadge');
    if (badge) badge.textContent = '💾 草稿已清空';
    showToast('已清除本機暫存草稿 🗑️');
  } catch (_) {}
}

export function recreateElementFromBlob(blob, mediaType, initialSeek = 0.01, isAudioOnly = false) {
  return new Promise((resolve) => {
    if (!blob) return resolve(null);
    const url = URL.createObjectURL(blob);
    if (mediaType === 'image') {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    } else if (isAudioOnly && blob.type.startsWith('audio/')) {
      const aud = new Audio(url);
      aud.preload = 'auto';
      if (storageHooks.ensureAudioNode) storageHooks.ensureAudioNode(aud);
      aud.onloadedmetadata = () => {
        aud.currentTime = Math.max(0.01, initialSeek);
        resolve(aud);
      };
      aud.onerror = () => resolve(null);
    } else if (storageHooks.createClonedVideoElement) {
      const vid = storageHooks.createClonedVideoElement(url, initialSeek);
      vid.addEventListener('loadeddata', () => resolve(vid), { once: true });
      vid.addEventListener('error', () => resolve(null), { once: true });
    } else {
      resolve(null);
    }
  });
}

export async function applyDeserializedProject(saved, customBlobMap = null) {
  const resolveBlob = async (fileId) => {
    if (customBlobMap && customBlobMap.has(fileId)) {
      const b = customBlobMap.get(fileId);
      await saveMediaBlobToDB(fileId, b);
      return b;
    }
    return await getMediaBlobFromDB(fileId);
  };

  const restoredClips = [];
  let mainAcc = 0;
  for (const c of (saved.clips || [])) {
    const blob = await resolveBlob(c.fileId);
    const el = await recreateElementFromBlob(blob, c.mediaType, c.trimStart || 0.01, false);
    if (el) {
      const startVal = (typeof c.start === 'number' && isFinite(c.start)) ? roundSec(c.start) : roundSec(mainAcc);
      const colorObj = { b: 100, c: 100, s: 100, warm: 0, sharp: 0, ...(c.color || {}) };
      restoredClips.push({ ...c, color: colorObj, groupId: c.groupId || null, start: startVal, mediaEl: el });
      mainAcc = startVal + (c.duration || 5);
    }
  }

  const restoredPipTracks = [];
  for (const tr of (saved.pipTracks || [])) {
    const pClips = [];
    for (const p of (tr.clips || [])) {
      const blob = await resolveBlob(p.fileId);
      const el = await recreateElementFromBlob(blob, p.mediaType, p.trimStart || 0.01, false);
      if (el) {
        const colorObj = { b: 100, c: 100, s: 100, warm: 0, sharp: 0, ...(p.color || {}) };
        pClips.push({ ...p, color: colorObj, groupId: p.groupId || null, mediaEl: el });
      }
    }
    restoredPipTracks.push({ ...tr, clips: pClips });
  }

  const restoredAudio = [];
  for (const a of (saved.audioClips || [])) {
    const blob = await resolveBlob(a.fileId);
    const el = await recreateElementFromBlob(blob, a.fromVideo ? 'video' : 'audio', a.trimStart || 0.01, true);
    if (el) restoredAudio.push({ ...a, groupId: a.groupId || null, mediaEl: el });
  }

  if (saved.background) {
    state.background = { ...saved.background, mediaEl: null };
    if (saved.background.mode === 'custom' && saved.background.mediaFileId) {
      const bgBlob = await resolveBlob(saved.background.mediaFileId);
      const bgEl = await recreateElementFromBlob(bgBlob, saved.background.mediaType, 0.01, false);
      if (bgEl) {
        if (saved.background.mediaType === 'video') { bgEl.loop = true; bgEl.muted = true; }
        state.background.mediaEl = bgEl;
      }
    }
  }

  state.clips = restoredClips;
  state.pipTracks = restoredPipTracks.length > 0 ? restoredPipTracks : [{ id: 'pip-track-1', name: '畫中畫 L1 (頂層)', visible: true, clips: [] }];
  state.subtitles = (saved.subtitles || []).map(s => normalizeSubtitleObject({ ...s }));
  state.audioClips = restoredAudio;
  state.trackVisibility = saved.trackVisibility || { main: true, audio: true, sub: true };
  if (saved.effects) {
    state.effects = saved.effects;
    if (typeof state.effects.particleSpeed !== 'number') state.effects.particleSpeed = 1.0;
    if (state.effects.spotlight) {
      if (typeof state.effects.spotlight.blurRadius !== 'number') state.effects.spotlight.blurRadius = 14;
      if (typeof state.effects.spotlight.intensity !== 'number') state.effects.spotlight.intensity = 1.25;
    }
  }
  if (saved.exportQuality) state.exportQuality = saved.exportQuality;
  if (saved.ratio) {
    state.ratio = saved.ratio;
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.toggle('active', b.dataset.ratio === state.ratio));
    if (storageHooks.applyCanvasResolutionForRatio) storageHooks.applyCanvasResolutionForRatio(state.ratio, null);
  }
  state.selectedClipId = state.clips[0]?.id || state.pipTracks[0]?.clips[0]?.id || null;
  state.lastSelectedType = state.clips[0] ? 'clip' : (state.pipTracks[0]?.clips[0] ? 'pip' : 'clip');
  state.multiSelectedIds = (state.selectedClipId && storageHooks.expandSelectionWithLinkedGroups)
    ? storageHooks.expandSelectionWithLinkedGroups([state.selectedClipId])
    : [];
  state.currentTime = 0;
  const timelineScroll = document.getElementById('timelineScroll');
  if (timelineScroll) timelineScroll.scrollLeft = 0;

  if (storageHooks.updateDeleteButtonLabel) storageHooks.updateDeleteButtonLabel();
  if (storageHooks.updateGroupButtonUI) storageHooks.updateGroupButtonUI();
  if (storageHooks.renderTimeline) storageHooks.renderTimeline();
  if (storageHooks.renderDrawer) storageHooks.renderDrawer();
  if (storageHooks.syncVideoElements) storageHooks.syncVideoElements(true);
  if (storageHooks.renderFrame) storageHooks.renderFrame();
  scheduleAutoSaveDraft();
}

export async function restoreDraftFromDB() {
  try {
    const db = await openDraftDB();
    const saved = await new Promise((resolve) => {
      const tx = db.transaction(STORE_PROJECT, 'readonly');
      const req = tx.objectStore(STORE_PROJECT).get('latest_draft');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (!saved) return;

    const hasItems = (saved.clips?.length > 0) ||
      (saved.pipTracks?.some(t => t.clips?.length > 0)) ||
      (saved.subtitles?.length > 0) ||
      (saved.audioClips?.length > 0);
    if (!hasItems) return;

    const badge = document.getElementById('draftStatusBadge');
    if (badge) badge.textContent = '⏳ 恢復草稿中...';
    await applyDeserializedProject(saved, null);
    if (badge) badge.textContent = '💾 已恢復上次草稿';
    showToast('已自動恢復上次未完成的草稿專案 ✨');
  } catch (err) {
    console.warn('Draft restore skipped:', err);
  }
}

export function collectRequiredAssetRefs(payload) {
  const refs = new Map();
  const register = (fileId, fallbackName, mediaType) => {
    if (fileId && !refs.has(fileId)) refs.set(fileId, { fileId, origFileName: fallbackName || fileId, mediaType: mediaType || 'video' });
  };
  (payload.clips || []).forEach(c => register(c.fileId, c.origFileName || c.name, c.mediaType));
  (payload.pipTracks || []).forEach(tr => (tr.clips || []).forEach(p => register(p.fileId, p.origFileName || p.name, p.mediaType)));
  (payload.audioClips || []).forEach(a => register(a.fileId, a.origFileName || a.name, a.fromVideo ? 'video' : 'audio'));
  if (payload.background?.mode === 'custom' && payload.background.mediaFileId) register(payload.background.mediaFileId, payload.background.mediaName, payload.background.mediaType);
  return Array.from(refs.values());
}

export function downloadBlobAsFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function initProjectFileHandlers() {
  const exportModalBackdrop = document.getElementById('exportModalBackdrop');
  const exportOptionsList = document.getElementById('exportOptionsList');
  const exportProgressBox = document.getElementById('exportProgressBox');
  const exportPercentBig = document.getElementById('exportPercentBig');
  const exportProgressText = document.getElementById('exportProgressText');
  const exportProgressSub = document.getElementById('exportProgressSub');
  const exportProgressFill = document.getElementById('exportProgressFill');

  const draftBadge = document.getElementById('draftStatusBadge');
  if (draftBadge) {
    draftBadge.onclick = () => {
      if (confirm('要清除瀏覽器中自動保存的草稿快取嗎？（清除後重新整理將恢復為空白專案）')) {
        clearDraftCache();
      }
    };
  }

  const optSaveLightProject = document.getElementById('optSaveLightProject');
  if (optSaveLightProject) {
    optSaveLightProject.onclick = () => {
      const payload = buildSerializableProjectPayload();
      payload.format = 'cutvideo-light-project';
      payload.assetManifest = collectRequiredAssetRefs(payload);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '') + '_' + new Date().toTimeString().slice(0, 5).replace(':', '');
      downloadBlobAsFile(blob, `CutVideo_輕量工程檔_${stamp}.cutproj`);
      exportModalBackdrop.classList.remove('open');
      showToast('已下載輕量工程檔（.cutproj · 僅參數秒存）📄');
    };
  }

  const optSaveFullProjectPack = document.getElementById('optSaveFullProjectPack');
  if (optSaveFullProjectPack) {
    optSaveFullProjectPack.onclick = async () => {
      if (state.isExporting) return;
      state.isExporting = true;
      exportOptionsList.style.display = 'none';
      exportProgressBox.style.display = 'block';
      exportPercentBig.textContent = '10%';
      exportProgressText.textContent = '正在蒐集原始素材並建立封裝索引...';
      exportProgressSub.textContent = '同一原始檔案切多段只會打包一次';
      exportProgressFill.style.width = '10%';

      try {
        const payload = buildSerializableProjectPayload();
        payload.format = 'cutvideo-full-pack';
        const assetRefs = collectRequiredAssetRefs(payload);
        const packedAssets = [], binaryBlobs = [];

        for (let i = 0; i < assetRefs.length; i++) {
          const ref = assetRefs[i];
          const pct = Math.round(15 + ((i + 1) / Math.max(1, assetRefs.length)) * 75);
          exportPercentBig.textContent = `${pct}%`;
          exportProgressText.textContent = `正在打包原始素材 (${i + 1} / ${assetRefs.length})：${ref.origFileName}`;
          exportProgressFill.style.width = `${pct}%`;
          const blob = await getMediaBlobFromDB(ref.fileId);
          if (blob) {
            packedAssets.push({ fileId: ref.fileId, origFileName: ref.origFileName, mediaType: ref.mediaType, mimeType: blob.type || 'application/octet-stream', byteLength: blob.size });
            binaryBlobs.push(blob);
          }
        }

        payload.packedAssets = packedAssets;
        const headerBytes = new TextEncoder().encode(JSON.stringify(payload));
        const magicBytes = new TextEncoder().encode('CUTPACK1');
        const lenBuf = new ArrayBuffer(4);
        new DataView(lenBuf).setUint32(0, headerBytes.byteLength, true);

        const fullBlob = new Blob([magicBytes, lenBuf, headerBytes, ...binaryBlobs], { type: 'application/octet-stream' });
        const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '') + '_' + new Date().toTimeString().slice(0, 5).replace(':', '');
        downloadBlobAsFile(fullBlob, `CutVideo_完整工程包_${stamp}.cutpack`);

        exportPercentBig.textContent = '100%';
        exportProgressFill.style.width = '100%';
        showToast(`完整工程包（.cutpack · 共打包 ${packedAssets.length} 個原始素材）已下載 🧳`);
      } catch (err) {
        showToast('打包工程包失敗：' + err.message);
      } finally {
        state.isExporting = false;
        exportModalBackdrop.classList.remove('open');
        exportOptionsList.style.display = 'block';
        exportProgressBox.style.display = 'none';
      }
    };
  }

  let pendingRelinkProject = null, pendingMissingRefs = [];
  const importProjectBtn = document.getElementById('importProjectBtn');
  if (importProjectBtn) importProjectBtn.onclick = () => document.getElementById('projectFileInput').click();

  const projectFileInput = document.getElementById('projectFileInput');
  if (projectFileInput) {
    projectFileInput.onchange = async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const magic = new TextDecoder().decode(await file.slice(0, 8).arrayBuffer());
        if (magic === 'CUTPACK1') {
          exportOptionsList.style.display = 'none';
          exportProgressBox.style.display = 'block';
          exportPercentBig.textContent = '30%';
          exportProgressText.textContent = '正在解包完整工程包與還原素材...';
          exportProgressSub.textContent = file.name;
          exportProgressFill.style.width = '30%';

          const headerLen = new DataView(await file.slice(8, 12).arrayBuffer()).getUint32(0, true);
          const projectData = JSON.parse(new TextDecoder().decode(await file.slice(12, 12 + headerLen).arrayBuffer()));
          let cursor = 12 + headerLen;
          const customBlobMap = new Map();
          for (const asset of (projectData.packedAssets || [])) {
            customBlobMap.set(asset.fileId, file.slice(cursor, cursor + asset.byteLength, asset.mimeType));
            cursor += asset.byteLength;
          }

          exportPercentBig.textContent = '80%';
          exportProgressFill.style.width = '80%';
          pushUndo();
          await applyDeserializedProject(projectData, customBlobMap);
          exportPercentBig.textContent = '100%';
          exportProgressFill.style.width = '100%';
          exportModalBackdrop.classList.remove('open');
          exportOptionsList.style.display = 'block';
          exportProgressBox.style.display = 'none';
          showToast('完整工程包還原成功！所有軌道、分割與特效已就緒 🎉');
          return;
        }

        const projectData = JSON.parse(await file.text());
        const refs = collectRequiredAssetRefs(projectData), missing = [];
        for (const r of refs) { if (!(await getMediaBlobFromDB(r.fileId))) missing.push(r); }

        if (missing.length === 0) {
          pushUndo();
          await applyDeserializedProject(projectData, null);
          exportModalBackdrop.classList.remove('open');
          showToast('輕量工程檔已成功還原（本機快取自動配對完成）🎉');
        } else {
          pendingRelinkProject = projectData;
          pendingMissingRefs = missing;
          document.getElementById('relinkMissingList').innerHTML = missing.map(m => `<li><strong>${m.origFileName}</strong></li>`).join('');
          exportOptionsList.style.display = 'none';
          document.getElementById('relinkAssetsBox').style.display = 'block';
        }
      } catch (err) {
        showToast('工程檔讀取失敗，請確認檔案格式正確');
      }
    };
  }

  const relinkSelectFilesBtn = document.getElementById('relinkSelectFilesBtn');
  if (relinkSelectFilesBtn) relinkSelectFilesBtn.onclick = () => document.getElementById('relinkAssetsInput').click();

  const relinkCancelBtn = document.getElementById('relinkCancelBtn');
  if (relinkCancelBtn) {
    relinkCancelBtn.onclick = () => {
      pendingRelinkProject = null;
      pendingMissingRefs = [];
      document.getElementById('relinkAssetsBox').style.display = 'none';
      exportOptionsList.style.display = 'block';
    };
  }

  const relinkAssetsInput = document.getElementById('relinkAssetsInput');
  if (relinkAssetsInput) {
    relinkAssetsInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      e.target.value = '';
      if (!files.length || !pendingRelinkProject) return;
      const customBlobMap = new Map(), unmatchedFiles = [...files];
      pendingMissingRefs.forEach(ref => {
        const idx = unmatchedFiles.findIndex(f => f.name === ref.origFileName);
        if (idx !== -1) customBlobMap.set(ref.fileId, unmatchedFiles.splice(idx, 1)[0]);
      });
      pendingMissingRefs.forEach(ref => {
        if (!customBlobMap.has(ref.fileId) && unmatchedFiles.length > 0) customBlobMap.set(ref.fileId, unmatchedFiles.shift());
      });
      pushUndo();
      await applyDeserializedProject(pendingRelinkProject, customBlobMap);
      pendingRelinkProject = null;
      pendingMissingRefs = [];
      document.getElementById('relinkAssetsBox').style.display = 'none';
      exportOptionsList.style.display = 'block';
      exportModalBackdrop.classList.remove('open');
      showToast('已自動依照輕量工程檔還原所有分割與剪輯設定 🎉');
    };
  }
}
