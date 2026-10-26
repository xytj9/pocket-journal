/* PWA shell: offline readiness, installation, safe updates and iOS file sharing. */
(() => {
  let registration, installPrompt, updateRequested = false;
  let offlineReady = false, storageStatus = '正在读取本机手账';
  const boot = () => document.getElementById('pwa-boot');
  function fail(message) {
    boot().hidden = false;
    boot().querySelector('p').textContent = message;
    boot().querySelector('button').hidden = false;
  }
  function setStatus() {
    const saved = document.getElementById('pwa-save-state');
    const connection = document.getElementById('pwa-connection');
    if (saved) saved.textContent = storageStatus;
    if (connection) connection.textContent = offlineReady
      ? (navigator.onLine ? '离线页面已备妥 · PWA 1.2.0' : '当前离线，仍可记录 · PWA 1.2.0')
      : '正在准备离线页面，首次打开请保持联网';
  }
  window.addEventListener('pocket-storage-status', event => {
    storageStatus = event.detail.message || (event.detail.status === 'saved' ? '已保存在此设备' : '正在保存');
    setStatus();
  });
  async function storageInfo() {
    const target = document.getElementById('pwa-storage-detail');
    if (!target) return;
    let detail = '记录仅保存在当前设备，不上传手账内容。网页存储仍受系统配额和剩余空间影响，请定期备份。';
    try {
      const estimate = await navigator.storage?.estimate?.();
      const persistent = await navigator.storage?.persisted?.();
      if (estimate?.quota) detail += ` 当前此站点已用约 ${(estimate.usage / 1048576).toFixed(1)} MB，系统估计额度约 ${(estimate.quota / 1048576).toFixed(0)} MB。`;
      detail += persistent ? ' 系统已授予持久存储。' : ' 系统尚未授予或未提供持久存储状态。';
    } catch (_) { /* Safari may not expose estimates in every context. */ }
    target.textContent = detail;
  }
  function showUpdate() {
    const box = document.getElementById('pwa-update');
    if (box) box.hidden = false;
  }
  async function installServiceWorker() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      document.getElementById('pwa-connection').textContent = '安装和离线缓存需要 HTTPS 网站，当前环境只可预览';
      return;
    }
    try {
      const scope = new URL('./', location.href).href;
      const existing = await navigator.serviceWorker.getRegistration(scope);
      registration = existing?.scope === scope ? existing : await navigator.serviceWorker.register('./sw.js', {scope:'./', updateViaCache:'none'});
      await navigator.serviceWorker.ready;
      offlineReady = true; setStatus();
      if (registration.waiting) showUpdate();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (updateRequested) location.reload();
        else { offlineReady = true; setStatus(); if (registration.waiting) showUpdate(); }
      });
      if (navigator.onLine) registration.update().catch(() => {});
    } catch (_) {
      document.getElementById('pwa-connection').textContent = '离线缓存尚未完成，请联网后在工具中重试';
    }
  }
  async function applyUpdate() {
    const button = document.getElementById('pwa-update-apply');
    button.disabled = true;
    // Block new edits during the short final commit before reloading the shell.
    const main = document.querySelector('main');
    const wasInert = main.inert;
    main.inert = true;
    const saved = await flushPocketJournal();
    if (!saved) { main.inert = wasInert; button.disabled = false; return; }
    updateRequested = true;
    if (registration?.waiting) registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
    else location.reload();
  }
  async function shareFile(file) {
    if (navigator.canShare?.({files:[file]}) && navigator.share) {
      try { await navigator.share({files:[file], title:'口袋手账备份'}); return true; }
      catch (error) { if (error.name === 'AbortError') return false; }
    }
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = file.name;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  }
  window.exportPocketPwaBackup = async () => {
    try {
      // Initiate the native share sheet within the user's click activation.
      const raw = JSON.stringify(state, null, 2);
      const file = new File([raw], `口袋手账备份_${getTodayKey()}.json`, {type:'application/json'});
      if (await shareFile(file)) showToast('已交给系统分享或下载，请将备份保存到“文件”。');
    } catch (_) { showToast('未能导出备份，请保持页面打开后重试。'); }
  };
  function addShellControls() {
    const shelf = document.createElement('aside'); shelf.id = 'pwa-shelf'; shelf.setAttribute('aria-label','安装与存档状态');
    shelf.innerHTML = '<p><span id="pwa-save-state" role="status" aria-live="polite"></span><span id="pwa-connection"></span></p><button type="button" id="pwa-help-open">安装与备份</button>';
    document.querySelector('header').after(shelf);
    const help = document.createElement('details'); help.id = 'pwa-help';
    help.innerHTML = `<summary>iPhone 安装、离线与备份</summary>
      <h4>添加到主屏幕</h4>
      <ol><li>在 Safari 中打开这个网站。微信等应用内浏览器请先选择“在 Safari 中打开”。</li><li>点 Safari 的分享按钮，选择“添加到主屏幕”。若出现“作为网页 App 打开”，保持开启。</li><li>名称填写“口袋手账”，点“添加”。首次打开保持联网，等首页显示“离线页面已备妥”。</li></ol>
      <button type="button" class="pwa-action" id="pwa-install-button" hidden>安装口袋手账</button>
      <h4>记录放在哪里</h4><p id="pwa-storage-detail"></p>
      <p>Safari 与主屏幕 App、不同网址及不同设备的记录可能彼此独立。安装后请先确认记录；需要搬迁时先导出 JSON，再在目标入口导入。</p>
      <div class="pwa-actions"><button type="button" class="pwa-action" id="pwa-export">备份到“文件”或分享</button><button type="button" class="pwa-action" id="pwa-import">导入 JSON 备份</button><button type="button" class="pwa-action" id="pwa-persist">申请系统持久存储</button><button type="button" class="pwa-action" id="pwa-check-update">检查更新 / 重试离线缓存</button></div>
      <p id="pwa-maintenance-status" role="status"></p>
      <p>熄屏或关闭 App 后，iOS 可能暂停网页。已保存的数据会保留，下次打开会补做日期切换；不承诺后台准点运行。更换网址、清除网站数据或移除 App 前先导出备份。</p>`;
    document.querySelector('#original-tools-modal > .comic-card').appendChild(help);
    const update = document.createElement('div'); update.id = 'pwa-update'; update.hidden = true;
    update.innerHTML = '<p>新版离线页面已准备好。更新前会先保存当前手账。</p><button type="button" class="pwa-action" id="pwa-update-apply">保存并更新</button>';
    help.after(update);
    document.getElementById('pwa-help-open').onclick = () => { document.getElementById('original-tools-toggle').click(); help.open = true; storageInfo(); };
    help.addEventListener('toggle', () => { if (help.open) storageInfo(); });
    document.getElementById('pwa-export').onclick = window.exportPocketPwaBackup;
    document.getElementById('pwa-import').onclick = () => document.getElementById('backup-file').click();
    document.getElementById('pwa-persist').onclick = async () => {
      const granted = await PocketJournalStorage.persist();
      document.getElementById('pwa-maintenance-status').textContent = granted ? '系统已允许持久存储，请继续保留独立备份。' : '系统尚未授予持久存储，仍可正常使用；请定期备份。';
      storageInfo();
    };
    document.getElementById('pwa-check-update').onclick = async () => {
      const status = document.getElementById('pwa-maintenance-status');
      if (!navigator.onLine) { status.textContent = '当前离线，联网后可检查更新。'; return; }
      status.textContent = '正在检查';
      try {
        if (registration) { await registration.update(); status.textContent = registration.waiting ? '新版已备妥，请选择保存并更新。' : '检查已完成，发现新版本后会显示更新按钮。'; }
        else { await installServiceWorker(); status.textContent = offlineReady ? '离线页面已备妥。' : '尚未完成，请确认网址使用 HTTPS。'; }
      } catch (_) { status.textContent = '暂时无法检查，请确认网络后重试。'; }
    };
    document.getElementById('pwa-update-apply').onclick = applyUpdate;
    document.getElementById('pwa-install-button').onclick = async () => {
      if (!installPrompt) return;
      await installPrompt.prompt(); installPrompt = null;
      document.getElementById('pwa-install-button').hidden = true;
    };
    if (installPrompt) document.getElementById('pwa-install-button').hidden = false;
    window.addEventListener('online', setStatus); window.addEventListener('offline', setStatus);
    const fit = () => document.documentElement.style.setProperty('--pwa-vh', `${window.visualViewport?.height || innerHeight}px`);
    if (window.visualViewport) visualViewport.addEventListener('resize', fit);
    fit(); setStatus();
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event;
    const button = document.getElementById('pwa-install-button'); if (button) button.hidden = false;
  });
  async function start() {
    boot().querySelector('button').onclick = () => location.reload();
    if (!await PocketJournalStorage.ready) { fail(PocketJournalStorage.status.error); return; }
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script'); script.src = './journal.js';
        script.onload = resolve; script.onerror = reject; document.body.appendChild(script);
      });
      initApp();
      document.dispatchEvent(new Event('pocket-ready'));
      addShellControls();
      boot().hidden = true;
      window.pocketPwaReady = true;
      await flushPocketJournal();
      await installServiceWorker();
    } catch (_) { fail('手账页面未能完整启动。请保持原网站数据，联网后点“重试打开”。'); }
  }
  start();
})();
