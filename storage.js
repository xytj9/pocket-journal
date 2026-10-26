/* The app starts only after IndexedDB is read. No journal data is sent to a server. */
window.PocketJournalStorage = (() => {
  const LEGACY_KEY = 'pocket_journal_doraemon_v2';
  const DB_NAME = 'pocket-journal-pwa';
  let db, stored = null, durableRevision = 0, lastBytes = 0;
  let blocked = false, pending = null, timer = 0, error = '';
  let queue = Promise.resolve(true), sequence = 0, committedSequence = 0;
  const clone = value => JSON.parse(JSON.stringify(value));
  function announce(status, message = '') {
    window.dispatchEvent(new CustomEvent('pocket-storage-status', {detail: {status, message}}));
  }
  function report(message) {
    error = message;
    let box = document.getElementById('pocket-storage-error');
    if (!box && document.body) {
      box = document.createElement('div'); box.id = 'pocket-storage-error';
      box.setAttribute('role', 'alert'); document.body.appendChild(box);
    }
    if (box) box.textContent = message;
    announce('error', message);
  }
  function clearError() { error = ''; document.getElementById('pocket-storage-error')?.remove(); }
  function validate(raw) {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        !value.days || typeof value.days !== 'object' || Array.isArray(value.days) ||
        !Array.isArray(value.diaries)) throw new Error('invalid journal');
    return value;
  }
  function readRecord() {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('records', 'readonly');
      const request = tx.objectStore('records').get('current');
      tx.oncomplete = () => resolve(request.result || null);
      tx.onabort = tx.onerror = () => reject(tx.error || Error('read failed'));
    });
  }
  function writeRecord(raw) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('records', 'readwrite');
      const store = tx.objectStore('records');
      const request = store.get('current');
      let conflict = false;
      request.onsuccess = () => {
        if ((request.result?.revision || 0) !== durableRevision) {
          conflict = true; tx.abort(); return;
        }
        store.put({raw, revision: durableRevision + 1, savedAt: new Date().toISOString()}, 'current');
      };
      tx.oncomplete = () => { durableRevision++; resolve(); };
      tx.onabort = tx.onerror = () => reject(conflict ? Error('conflict') : (tx.error || Error('write failed')));
    });
  }
  const ready = (async () => {
    try {
      if (!window.indexedDB) throw Error('IndexedDB unavailable');
      db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore('records');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(Error('database upgrade blocked'));
      });
      db.onversionchange = () => { db.close(); blocked = true; report('手账数据库已在另一页面更新。请先导出当前内容，再重新打开。'); };
      const record = await readRecord();
      durableRevision = record?.revision || 0;
      let raw = record?.raw || null;
      if (!raw) {
        let legacy;
        try { legacy = localStorage.getItem(LEGACY_KEY); } catch (_) { /* IndexedDB remains usable. */ }
        if (legacy) {
          validate(legacy);
          await writeRecord(legacy);
          const check = await readRecord();
          if (check?.raw !== legacy) throw Error('migration verification failed');
          raw = legacy;
          try { localStorage.removeItem(LEGACY_KEY); } catch (_) { /* Keep the old copy. */ }
        }
      }
      if (raw) { stored = validate(raw); lastBytes = new Blob([raw]).size; }
      window.pocketJournalHadStoredData = !!raw;
      window.pocketJournalStoredDayKeys = Object.keys(stored?.days || {});
      return true;
    } catch (_) {
      blocked = true;
      report('无法安全读取本机手账，已停止启动和写入以保护原记录。请保留 Safari 网站数据，重试打开；不要清除网站数据。');
      return false;
    }
  })();
  function load(fallback) {
    if (blocked || !db) throw Error('Storage not ready');
    return Object.assign(clone(fallback), stored ? clone(stored) : {});
  }
  function commit(raw) {
    const id = ++sequence;
    announce('saving', '正在保存');
    queue = queue.catch(() => false).then(async () => {
      if (blocked) return false;
      try {
        await writeRecord(raw);
        committedSequence = id;
        lastBytes = new Blob([raw]).size;
        clearError();
        if (id === sequence && !pending) announce('saved', '已保存在此设备');
        return true;
      } catch (failure) {
        if (failure.message === 'conflict') {
          blocked = true;
          report('另一页面已保存新记录。为避免相互覆盖，本页已停止写入。请导出当前内容作备份，再重新打开。');
        } else report('保存未完成，当前内容仍在页面内。请立即导出备份，释放设备空间后再保存；暂时不要关闭页面。');
        return false;
      }
    });
    return queue;
  }
  function save(data, options = {}) {
    if (blocked) return false;
    if (options.flush) return flush(data);
    try {
      pending = JSON.stringify(data);
      announce('saving', '正在保存');
      clearTimeout(timer);
      timer = setTimeout(() => { const raw = pending; pending = null; if (raw != null) commit(raw); }, 180);
      return true;
    } catch (_) { report('记录内容无法序列化，当前更改尚未保存。请导出备份。'); return false; }
  }
  function flush(data) {
    if (blocked) return Promise.resolve(false);
    clearTimeout(timer);
    try {
      const raw = data === undefined ? pending : JSON.stringify(data);
      pending = null;
      return raw == null ? queue : commit(raw);
    } catch (_) { report('当前内容尚未保存，请导出备份。'); return Promise.resolve(false); }
  }
  function health() {
    const el = document.getElementById('storage-health-text');
    if (el) el.textContent = `${(lastBytes / 1048576).toFixed(2)} MB · 本机 IndexedDB，无应用自设容量上限`;
    const bar = document.getElementById('storage-health-bar');
    if (bar?.parentElement) bar.parentElement.hidden = true;
  }
  async function persist() {
    try { return navigator.storage?.persist ? await navigator.storage.persist() : false; }
    catch (_) { return false; }
  }
  return {ready, load, save, flush, health, persist, get status() { return {blocked, error, lastBytes, dirty: !!pending || sequence !== committedSequence}; }};
})();
window.flushPocketJournal = () => {
  try { return window.PocketJournalStorage.flush(state); } catch (_) { return Promise.resolve(false); }
};
