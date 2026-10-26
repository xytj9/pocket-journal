
    // ====================================================
    // 1. SAFE STORAGE WRAPPER
    // ====================================================
    const STORAGE_KEY = 'pocket_journal_doraemon_v2';

    function getTodayKey() {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }

    function loadStorage(fallback) { return PocketJournalStorage.load(fallback); }

    function saveStorage(stateObj, options) { return PocketJournalStorage.save(stateObj, options); }

    function saveCanvasPng(canvas, filename, successMessage) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        if (window.AndroidBridge && typeof window.AndroidBridge.saveDataUrl === 'function') {
          window.AndroidBridge.saveDataUrl(dataUrl, filename);
          return;
        }
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
        showToast(successMessage);
      } catch (error) {
        showToast('图片保存失败，请重试。');
      }
    }

    // ====================================================
    // 2. RICH NATURAL MOODS (10), WEATHERS (10), SLEEP QUALITIES & GADGETS
    // ====================================================
    const MOOD_OPTIONS = [
      { id: 'happy', icon: '😊', label: '开心愉悦', quote: '看到你今天这么开心，哆啦A梦也忍不住想唱起歌来啦！' },
      { id: 'energetic', icon: '🥳', label: '元气满满', quote: '今天干劲十足呀！戴上竹蜻蜓去迎接顺顺利利的一天吧~' },
      { id: 'calm', icon: '😌', label: '平静舒心', quote: '平平淡淡、安安静静的日子，就像午后躺在草地上看云一样舒服。' },
      { id: 'warm', icon: '🥰', label: '幸福治愈', quote: '今天一定遇到了很温暖的小确幸吧！快写进手账里珍藏起来~' },
      { id: 'focused', icon: '💪', label: '专注充实', quote: '有记忆吐司和电脑铅笔加持，今天的努力一定会闪闪发光！' },
      { id: 'sleepy', icon: '🥱', label: '犯困疲惫', quote: '辛苦啦！累了就钻进壁橱里好好睡一觉，天塌下来有哆啦A梦顶着。' },
      { id: 'down', icon: '😔', label: '有点低落', quote: '摸摸头，不开心的时候吃个热乎乎的铜锣烧，我永远站在你这边。' },
      { id: 'anxious', icon: '😣', label: '焦虑烦躁', quote: '深呼吸~ 把大麻烦用【缩小灯】照一下，一步一步慢慢来就好。' },
      { id: 'angry', icon: '😠', label: '生气委屈', quote: '是谁惹你生气啦？拿【空气炮】把坏心情统统轰到九霄云外去！' },
      { id: 'busy', icon: '🤯', label: '忙碌奔波', quote: '今天事情好多呀！忙完记得奖励自己一顿好吃的，注意休息哦。' }
    ];

    const WEATHER_OPTIONS = [
      { id: 'sunny', icon: '☀️', label: '晴朗' },
      { id: 'partly', icon: '🌤️', label: '多云' },
      { id: 'cloudy', icon: '☁️', label: '阴天' },
      { id: 'breezy', icon: '🌬️', label: '微风' },
      { id: 'lightrain', icon: '🌧️', label: '小雨' },
      { id: 'heavyrain', icon: '⛈️', label: '大雨' },
      { id: 'thunder', icon: '⚡', label: '雷雨' },
      { id: 'foggy', icon: '🌫️', label: '有雾' },
      { id: 'snowy', icon: '❄️', label: '飘雪' },
      { id: 'rainbow', icon: '🌈', label: '彩虹' }
    ];

    const SLEEP_QUALITIES = [
      { id: 'great', icon: '💤', label: '秒睡香甜' },
      { id: 'good', icon: '🌙', label: '安稳好眠' },
      { id: 'fair', icon: '☁️', label: '多梦浅睡' },
      { id: 'poor', icon: '🦉', label: '熬夜欠佳' }
    ];

    const EXPENSE_CATEGORIES = {
      food: { icon: '🍔', label: '餐饮美食', cls: 'bg-amber-100 text-amber-900' },
      transport: { icon: '🚌', label: '交通出行', cls: 'bg-sky-100 text-sky-900' },
      shopping: { icon: '🛍️', label: '购物日用', cls: 'bg-pink-100 text-pink-900' },
      fun: { icon: '🎮', label: '休闲娱乐', cls: 'bg-purple-100 text-purple-900' },
      study: { icon: '📚', label: '学习办公', cls: 'bg-emerald-100 text-emerald-900' },
      other: { icon: '🎁', label: '人情其他', cls: 'bg-slate-100 text-slate-800' }
    };

    const GADGET_DEX = [
      { id: 'anywhere-door', code: '#001', name: '任意门', icon: '🚪', rarity: 'SSR', category: '时空旅行', color: 'bg-pink-100', desc: '粉红色的神奇木门，只要在心里想着目的地并转动门把，十光年以内想去哪里都能一秒抵达！', effect: '今日出行好运 +100%，通勤不堵车' },
      { id: 'hopter', code: '#002', name: '竹蜻蜓', icon: '🚁', rarity: 'SSR', category: '时空旅行', color: 'bg-amber-100', desc: '戴在头顶就能以时速80公里在天空自由翱翔的微型飞行器，内置反重力浮力场。', effect: '今日灵感轻盈起飞，摆脱沉闷心情' },
      { id: 'time-machine', code: '#003', name: '时光机', icon: '🛸', rarity: 'SSR', category: '时空旅行', color: 'bg-sky-100', desc: '入口藏在书桌抽屉里的超空间航行器，可自由穿梭于过去、现在与22世纪。', effect: '手账记录永久珍藏，每一天都值得回味' },
      { id: 'memory-bread', code: '#004', name: '记忆吐司', icon: '🍞', rarity: 'SSR', category: '学习救星', color: 'bg-orange-100', desc: '把吐司印在书本或笔记上再吃下去，上面的内容就能清清楚楚地记在脑海里！', effect: '今日学习与工作专注力提升 200%' },
      { id: 'what-if-booth', code: '#005', name: '如果电话亭', icon: '☎️', rarity: 'SSR', category: '生活奇物', color: 'bg-red-100', desc: '拿起听筒说出“如果这个世界变成……”，就能创造并体验平行世界的超强道具。', effect: '打破思维定势，解锁天马行空的创意' },
      { id: 'gourmet-cloth', code: '#006', name: '美食桌布', icon: '🍽️', rarity: 'SR', category: '生活奇物', color: 'bg-rose-100', desc: '铺在桌上说出想吃的料理名称，无论是铜锣烧还是大餐都能热腾腾地变出来！', effect: '今日饮食幸福感拉满，胃口倍儿棒' },
      { id: 'time-cloth', code: '#007', name: '时光包巾', icon: '🧣', rarity: 'SSR', category: '时空旅行', color: 'bg-purple-100', desc: '正面包裹会让物体时间前进，反面包裹则会让旧物恢复崭新状态、疲惫一扫而空。', effect: '元气快速恢复，消除昨日熬夜疲惫' },
      { id: 'translation-gummy', code: '#008', name: '翻译魔芋', icon: '🍮', rarity: 'SR', category: '学习救星', color: 'bg-emerald-100', desc: '吃下这块Q弹的魔芋，全宇宙的语言甚至小动物的叫声都能听懂并流利沟通！', effect: '外语学习与人际沟通畅通无阻' },
      { id: 'small-light', code: '#009', name: '缩小灯', icon: '🔦', rarity: 'SR', category: '生活奇物', color: 'bg-yellow-100', desc: '照一下就能把庞大的麻烦或物品缩得像口袋玩具一样迷你！', effect: '把复杂的大任务拆解成轻松小事' },
      { id: 'computer-pencil', code: '#010', name: '电脑铅笔', icon: '✏️', rarity: 'SR', category: '学习救星', color: 'bg-indigo-100', desc: '只要握在手里，无论是多复杂的算术题还是长篇报告都会自动行云流水地写完！', effect: '告别拖延症，下笔如有神助' },
      { id: 'air-cannon', code: '#011', name: '空气炮', icon: '💨', rarity: 'SR', category: '生活奇物', color: 'bg-cyan-100', desc: '套在手上大喊一声“砰！”，就能发射强力空气冲击波，击退一切坏心情与水逆。', effect: '一键轰走焦虑与烦心事' },
      { id: 'weather-box', code: '#012', name: '天气箱', icon: '🌤️', rarity: 'SR', category: '生活奇物', color: 'bg-teal-100', desc: '只要插进对应的天气卡片，就能让头顶局部天空随时保持微风晴朗。', effect: '无论外界风雨，内心自带晴天' }
    ];

    const CAFE_MENU = [
      { id: 'dora-classic', name: '经典蜜豆铜锣烧', icon: '🥞', cal: 240, tag: '哆啦A梦最爱', desc: '松软蜂蜜饼皮夹着绵密北海道红豆沙，咬一口幸福感爆棚！' },
      { id: 'dora-matcha', name: '宇治抹茶生巧铜锣烧', icon: '🍵', cal: 210, tag: '限定新品', desc: '微苦回甘的抹茶奶油配红豆，下午茶解压首选。' },
      { id: 'memory-toast-set', name: '满分记忆吐司早餐盘', icon: '🍞', cal: 320, tag: '考前必点', desc: '印满重点公式的黄油烤吐司配热牛奶，元气满满开启一天。' },
      { id: 'dorami-melon', name: '哆啦美酥皮蜜瓜包', icon: '🍈', cal: 260, tag: '甜度满分', desc: '哆啦美强烈推荐的格子酥皮面包，香气扑鼻。' },
      { id: 'shizuka-potato', name: '静香手作焦糖烤红薯', icon: '🍠', cal: 190, tag: '暖心治愈', desc: '热乎乎流蜜的烤红薯，寒冷或疲惫时最治愈的美味。' },
      { id: 'gian-stew', name: '胖虎特调勇气料理', icon: '🍲', cal: 150, tag: '挑战极限', desc: '散发着神秘紫色光芒的浓汤……喝下去据说能获得无穷勇气！' }
    ];

    // Build initial multi-day records around current date so calendar review is immediately rich
    const todayKey = getTodayKey();
    const ymPrefix = todayKey.slice(0, 8); // e.g., "2026-10-"

    const DEFAULT_STATE = {
      profile: {
        gender: 'boy',      // 'boy' -> 大雄, 'girl' -> 静香
        customName: '',     // Optional custom nickname override
        dailyBudget: 100,
        sleepGoal: 8.0
      },
      activeDate: todayKey,
      coins: 160,
      equippedGadget: 'hopter',
      todoFilter: 'all',
      gadgetCategory: 'all',
      focusMinutes: 50,
      friendship: 98,
      // Per-date records dictionary for Calendar Review & Daily Tracking
      days: {
        [`${ymPrefix}18`]: {
          mood: 'Warm', moodId: 'warm', weather: 'sunny', temp: 23,
          sleepHours: 8.5, bedtime: '23:00', waketime: '07:30', sleepQuality: 'great',
          energyCount: 8,
          expenses: [
            { id: 1801, category: 'food', title: '周末铜锣烧下午茶', amount: 28.0, time: '14:20' },
            { id: 1802, category: 'shopping', title: '手账贴纸与胶带', amount: 19.5, time: '16:10' }
          ]
        },
        [`${ymPrefix}19`]: {
          moodId: 'focused', weather: 'partly', temp: 21,
          sleepHours: 7.5, bedtime: '23:30', waketime: '07:00', sleepQuality: 'good',
          energyCount: 6,
          expenses: [
            { id: 1901, category: 'transport', title: '公交地铁通勤', amount: 6.0, time: '08:30' },
            { id: 1902, category: 'food', title: '日式咖喱蛋包饭', amount: 32.0, time: '12:15' }
          ]
        },
        [`${ymPrefix}20`]: {
          moodId: 'calm', weather: 'lightrain', temp: 19,
          sleepHours: 7.0, bedtime: '00:00', waketime: '07:00', sleepQuality: 'fair',
          energyCount: 7,
          expenses: [
            { id: 2001, category: 'food', title: '热牛奶与烤吐司', amount: 15.0, time: '08:10' },
            { id: 2002, category: 'study', title: '笔记本与中性笔补充', amount: 22.0, time: '19:00' }
          ]
        },
        [`${ymPrefix}21`]: {
          moodId: 'energetic', weather: 'rainbow', temp: 22,
          sleepHours: 8.0, bedtime: '23:15', waketime: '07:15', sleepQuality: 'great',
          energyCount: 8,
          expenses: [
            { id: 2101, category: 'food', title: '丰盛午餐便当', amount: 26.0, time: '12:20' },
            { id: 2102, category: 'fun', title: '漫画书租赁', amount: 12.0, time: '18:40' }
          ]
        },
        [todayKey]: {
          moodId: 'happy', weather: 'sunny', temp: 22,
          sleepHours: 8.0, bedtime: '23:30', waketime: '07:30', sleepQuality: 'great',
          energyCount: 6,
          expenses: [
            { id: 2201, category: 'food', title: '早餐记忆吐司配热豆浆', amount: 14.5, time: '08:15' },
            { id: 2202, category: 'food', title: '经典红豆铜锣烧双拼', amount: 18.0, time: '14:30' },
            { id: 2203, category: 'transport', title: '日常通勤出行', amount: 6.0, time: '18:05' }
          ]
        }
      },
      todos: [
        { id: 101, date: todayKey, text: '用【记忆吐司】完成今日重点学习/工作计划', category: 'study', done: true },
        { id: 102, date: todayKey, text: '记录昨晚睡眠时长与今日零花钱开销', category: 'life', done: true },
        { id: 103, date: todayKey, text: '喝满 8 杯水，保持一天好状态', category: 'life', done: false },
        { id: 104, date: todayKey, text: '戴上【竹蜻蜓】出门散步或运动 20 分钟', category: 'adventure', done: false }
      ],
      diaries: [
        {
          id: 201,
          dateKey: todayKey,
          title: '口袋手账全新升级的一天！',
          content: '今天在口袋手账里补齐了睡眠时长记录、零花钱消费记账和时光机月历回看！心情选了“开心愉悦”，晚上还要早点钻进壁橱睡个好觉~ 【🥞奖励自己铜锣烧】',
          date: `${todayKey} 09:20`,
          moodIcon: '😊',
          weatherLabel: '☀️ 晴朗'
        },
        {
          id: 202,
          dateKey: `${ymPrefix}21`,
          title: '雨后看到彩虹的傍晚',
          content: '下午下了一场小雨，傍晚推开窗竟然看到了彩虹！记完今天的账单发现控制在预算内，超有成就感。【🚪推开任意门去散心】',
          date: `${ymPrefix}21 20:45`,
          moodIcon: '🥳',
          weatherLabel: '🌈 彩虹'
        },
        {
          id: 203,
          dateKey: `${ymPrefix}19`,
          title: '认真专注的小目标',
          content: '遇到复杂的任务也不怕，先用【缩小灯】把它拆成三个小步骤，一步步打勾完成！【💯 满分印章】',
          date: `${ymPrefix}19 21:30`,
          moodIcon: '💪',
          weatherLabel: '🌤️ 多云'
        }
      ],
      mealLogs: [
        { id: 301, type: '🌅 早餐', name: '满分记忆吐司早餐盘', cal: 320, time: '08:15' },
        { id: 302, type: '🍵 下午茶', name: '经典蜜豆铜锣烧 ×1', cal: 240, time: '15:30' }
      ],
      draftTitle: '',
      draftContent: ''
    };

    let state = loadStorage(DEFAULT_STATE);
    if (!state.profile) state.profile = JSON.parse(JSON.stringify(DEFAULT_STATE.profile));
    if (!state.days) state.days = JSON.parse(JSON.stringify(DEFAULT_STATE.days));
    if (!state.activeDate) state.activeDate = getTodayKey();
    state.todos = Array.isArray(state.todos) ? state.todos.map(todo => Object.assign({}, todo, { date: todo.date || state.activeDate })) : [];
    state.diaries = Array.isArray(state.diaries) ? state.diaries : [];

    function getDayRecord(dateKey) {
      if (!state.days[dateKey]) {
        state.days[dateKey] = {
          moodId: 'happy',
          weather: 'sunny',
          temp: 22,
          sleepHours: 8.0,
          bedtime: '23:30',
          waketime: '07:30',
          sleepQuality: 'good',
          energyCount: 0,
          expenses: [], activities: [], weightKg: null, draftTitle: '', draftContent: ''
        };
      }
      if (!Array.isArray(state.days[dateKey].activities)) state.days[dateKey].activities = [];
      if (!Array.isArray(state.days[dateKey].expenses)) state.days[dateKey].expenses = [];
      return state.days[dateKey];
    }

    function getUserName() {
      const custom = (state.profile?.customName || '').trim();
      if (custom) return custom;
      return state.profile?.gender === 'girl' ? '静香' : '大雄';
    }

    function getUserAvatarEmoji() {
      return state.profile?.gender === 'girl' ? '👧' : '👦';
    }

    // ====================================================
    // 3. WEB AUDIO API SYNTHESIZER
    // ====================================================
    let audioCtx = null;
    let bgmPlaying = false;
    let bgmInterval = null;
    let noteIndex = 0;

    const MELODY_NOTES = [
      392.00, 523.25, 523.25, 659.25, 783.99, 659.25, 587.33, 523.25,
      587.33, 659.25, 587.33, 523.25, 493.88, 587.33, 698.46, 659.25
    ];

    function ensureAudio() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playSFX(type) {
      try {
        ensureAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(getPocketSfxOutput());

        if (type === 'bell') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.5, now);
          osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'coin') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(987.77, now);
          osc.frequency.setValueAtTime(1318.51, now + 0.07);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
        } else if (type === 'gadget') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.22);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(660, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        }
      } catch (e) {}
    }

    function toggleBGM() {
      ensureAudio();
      bgmPlaying = !bgmPlaying;
      const wavesEl = document.getElementById('bgm-waves');
      const labelEl = document.getElementById('bgm-label');

      if (bgmPlaying) {
        wavesEl.classList.add('bgm-playing');
        labelEl.textContent = '演奏中';
        showToast('🎵 已开启 22世纪八音盒背景音乐');
        bgmInterval = setInterval(() => {
          if (!audioCtx || !bgmPlaying) return;
          const freq = MELODY_NOTES[noteIndex % MELODY_NOTES.length];
          noteIndex++;
          const now = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.32);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.34);
        }, 380);
      } else {
        wavesEl.classList.remove('bgm-playing');
        labelEl.textContent = '八音盒';
        clearInterval(bgmInterval);
        showToast('🔇 已暂停八音盒背景音乐');
      }
    }

    // ====================================================
    // 4. UI HELPERS & PROFILE SETTINGS MODAL
    // ====================================================
    function showToast(msg) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'comic-card-sm bg-slate-900 text-white px-4 py-2 text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300';
      toast.innerHTML = `<span class="text-[#FFD700]">🔔</span><span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-8px)';
        setTimeout(() => toast.remove(), 250);
      }, 2200);
    }

    function updateClock() {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      document.getElementById('hud-date').textContent =
        `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${days[now.getDay()]}`;
      document.getElementById('hud-clock').textContent =
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    function ringBell() {
      playSFX('bell');
      const bell = document.getElementById('header-bell');
      bell.classList.remove('bell-ring-active');
      void bell.offsetWidth;
      bell.classList.add('bell-ring-active');
      state.coins += 2;
      saveStorage(state);
      renderHUD();
      showToast(`叮铃铃~ ${getUserName()}摇响了金铃铛，获得 +2 🔔 铃铛币！`);
    }

    function pokeDoraemon() {
      playSFX('bell');
      const name = getUserName();
      const quotes = [
        `“${name}，不管今天遇到什么困难，我的四次元口袋永远为你敞开！”`,
        `“${name}，昨晚睡得好吗？累了的话随时用【任意门】去吹吹风吧~”`,
        `“只要和${name}一起分享刚出炉的铜锣烧，就是最幸福的时光啦！”`,
        `“${name}今天记账和写手账都超认真呢，奖励你一朵小红花！”`,
        `“就算偶尔粗心或者心情不好也没关系，哆啦A梦永远陪着${name}！”`
      ];
      getDayRecord(state.activeDate).doraQuote = quotes[Math.floor(Math.random() * quotes.length)];
      document.getElementById('dora-quote').textContent = getDayRecord(state.activeDate).doraQuote;
      state.friendship = Math.min(100, (state.friendship || 95) + 1);
      saveStorage(state);
      renderStats();
    }

    // Settings Modal Logic
    let tempGender = 'boy';

    function openSettingsModal() {
      playSFX('click');
      tempGender = state.profile.gender || 'boy';
      updateRoleButtonsUI();
      document.getElementById('settings-custom-name').value = state.profile.customName || '';
      document.getElementById('settings-budget').value = state.profile.dailyBudget || 100;
      document.getElementById('settings-sleep-goal').value = state.profile.sleepGoal || 8.0;

      const modal = document.getElementById('settings-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeSettingsModal() {
      const modal = document.getElementById('settings-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function selectGenderRole(gender) {
      playSFX('click');
      tempGender = gender;
      updateRoleButtonsUI();
    }

    function updateRoleButtonsUI() {
      const boyBtn = document.getElementById('role-btn-boy');
      const girlBtn = document.getElementById('role-btn-girl');
      if (tempGender === 'boy') {
        boyBtn.className = 'comic-btn p-3 rounded-2xl flex flex-col items-center text-center bg-[#FFD700] border-slate-900 font-black';
        girlBtn.className = 'comic-btn p-3 rounded-2xl flex flex-col items-center text-center bg-slate-50 border-slate-900 opacity-75';
      } else {
        girlBtn.className = 'comic-btn p-3 rounded-2xl flex flex-col items-center text-center bg-pink-200 border-slate-900 font-black';
        boyBtn.className = 'comic-btn p-3 rounded-2xl flex flex-col items-center text-center bg-slate-50 border-slate-900 opacity-75';
      }
    }

    function clearCustomName() {
      playSFX('click');
      document.getElementById('settings-custom-name').value = '';
    }

    function saveSettings() {
      playSFX('gadget');
      state.profile.gender = tempGender;
      state.profile.customName = document.getElementById('settings-custom-name').value.trim();
      state.profile.dailyBudget = Math.max(10, parseFloat(document.getElementById('settings-budget').value) || 100);
      state.profile.sleepGoal = Math.min(14, Math.max(4, parseFloat(document.getElementById('settings-sleep-goal').value) || 8.0));

      saveStorage(state);
      closeSettingsModal();
      renderAll();
      showToast(`✨ 设置已保存！欢迎你，${getUserName()}！`);
    }

    // ====================================================
    // 5. TAB NAVIGATION & ACTIVE DATE SWITCHING
    // ====================================================
    function switchTab(tabId) {
      playSFX('click');
      const tabs = ['journal', 'calendar', 'gadgets', 'timer'];
      tabs.forEach(t => {
        const view = document.getElementById(`tab-${t}`);
        const navBtn = document.getElementById(`nav-${t}`);
        if (t === tabId) {
          view.classList.remove('hidden');
          navBtn.classList.remove('text-slate-500', 'font-bold');
          navBtn.classList.add('text-[#0096E6]', 'font-black', 'scale-105');
        } else {
          view.classList.add('hidden');
          navBtn.classList.add('text-slate-500', 'font-bold');
          navBtn.classList.remove('text-[#0096E6]', 'font-black', 'scale-105');
        }
      });
      if (tabId === 'calendar') {
        renderCalendar();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function switchSubGadgetView(sub) {
      playSFX('click');
      const dexView = document.getElementById('subview-dex');
      const cafeView = document.getElementById('subview-cafe');
      const dexBtn = document.getElementById('subbtn-dex');
      const cafeBtn = document.getElementById('subbtn-cafe');
      if (sub === 'dex') {
        dexView.classList.remove('hidden');
        cafeView.classList.add('hidden');
        dexBtn.className = 'comic-btn flex-1 py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-[#0096E6] text-white';
        cafeBtn.className = 'comic-btn flex-1 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-white text-slate-700';
      } else {
        cafeView.classList.remove('hidden');
        dexView.classList.add('hidden');
        cafeBtn.className = 'comic-btn flex-1 py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-[#E60012] text-white';
        dexBtn.className = 'comic-btn flex-1 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-white text-slate-700';
      }
    }

    function switchActiveDate(dateKey) {
      playSFX('gadget');
      if (typeof window.reconcilePocketDailyDate === 'function') window.reconcilePocketDailyDate({render: false});
      const currentDay = getDayRecord(state.activeDate);
      currentDay.draftTitle = document.getElementById('diary-title').value;
      currentDay.draftContent = document.getElementById('diary-content').value;
      state.activeDate = dateKey;
      state.followCurrentDate = dateKey === getTodayKey();
      const nextDay = getDayRecord(dateKey);
      state.draftTitle = nextDay.draftTitle || '';
      state.draftContent = nextDay.draftContent || '';
      saveStorage(state);
      renderAll();
      document.getElementById('diary-title').value = state.draftTitle;
      document.getElementById('diary-content').value = state.draftContent;
      updateWordCount();
      if (typeof window.syncPocketRpsStreak === 'function') window.syncPocketRpsStreak();
      switchTab('journal');
      showToast(`🛸 已搭乘时光机切换至 ${dateKey} 的手账页`);
    }

    // ====================================================
    // 6. RENDER HUD, MOOD (10), WEATHER (10), SLEEP & ENERGY
    // ====================================================
    function renderHUD() {
      const name = getUserName();
      const emoji = getUserAvatarEmoji();
      document.getElementById('hud-user-pill').textContent = `${emoji} ${name}`;
      document.getElementById('banner-username').textContent = name;
      document.getElementById('mood-card-username').textContent = name;
      document.getElementById('diary-card-username').textContent = name;

      const isToday = state.activeDate === getTodayKey();
      document.getElementById('active-date-indicator').textContent =
        isToday ? `📅 今日手账 ${state.activeDate}` : `🛸 补记历史手账 ${state.activeDate}`;

      const returnBtn = document.getElementById('return-today-btn');
      if (isToday) {
        returnBtn.classList.add('hidden');
      } else {
        returnBtn.classList.remove('hidden');
      }

      document.getElementById('hud-coins').textContent = state.coins;
      const dayRec = getDayRecord(state.activeDate);
      const currentMood = MOOD_OPTIONS.find(m => m.id === dayRec.moodId) || MOOD_OPTIONS[0];
      const quoteEl = document.getElementById('dora-quote');
      if (quoteEl) quoteEl.textContent = dayRec.doraQuote || `“${name}，${currentMood.quote}”`;
      const pct = Math.min(100, Math.round(((dayRec.energyCount || 0) / 8) * 100));
      document.getElementById('hud-energy-bar').style.width = `${pct}%`;
      document.getElementById('hud-energy-text').textContent = `${pct}%`;

      const eqGadget = GADGET_DEX.find(g => g.id === state.equippedGadget) || GADGET_DEX[1];
      document.getElementById('hud-equipped-gadget').textContent = `${eqGadget.icon} ${eqGadget.name}`;
    }

    function renderMoodAndWeather() {
      const dayRec = getDayRecord(state.activeDate);
      const currentMood = MOOD_OPTIONS.find(m => m.id === dayRec.moodId) || MOOD_OPTIONS[0];
      const currentWeather = WEATHER_OPTIONS.find(w => w.id === dayRec.weather) || WEATHER_OPTIONS[0];

      document.getElementById('mood-status-badge').textContent = `${currentMood.icon} ${currentMood.label}`;
      document.getElementById('weather-status-badge').textContent = `${currentWeather.icon} ${currentWeather.label} ${dayRec.temp ?? 22}°C`;
      document.getElementById('temp-display').textContent = `${dayRec.temp ?? 22}°C`;

      // Render 10 Moods
      const moodContainer = document.getElementById('mood-selector');
      moodContainer.innerHTML = MOOD_OPTIONS.map(m => {
        const active = m.id === dayRec.moodId;
        return `
          <button type="button" onclick="selectMood('${m.id}')" class="comic-btn flex flex-col items-center justify-center py-2 px-1 rounded-xl min-h-[54px] ${active ? 'bg-[#FFD700] text-slate-900 font-black ring-2 ring-slate-900' : 'bg-slate-50 hover:bg-sky-50 text-slate-700'}">
            <span class="text-xl leading-none mb-1">${m.icon}</span>
            <span class="text-[11px] leading-tight truncate w-full text-center">${m.label}</span>
          </button>
        `;
      }).join('');

      // Render 10 Weathers
      const weatherContainer = document.getElementById('weather-selector');
      weatherContainer.innerHTML = WEATHER_OPTIONS.map(w => {
        const active = w.id === dayRec.weather;
        return `
          <button type="button" onclick="selectWeather('${w.id}')" class="comic-btn flex flex-col items-center justify-center py-1.5 px-1 rounded-xl min-h-[46px] ${active ? 'bg-[#0096E6] text-white font-black' : 'bg-slate-50 hover:bg-sky-50 text-slate-700'}">
            <span class="text-base leading-none mb-0.5">${w.icon}</span>
            <span class="text-[10px] leading-tight">${w.label}</span>
          </button>
        `;
      }).join('');
    }

    function selectMood(moodId) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      dayRec.moodId = moodId;
      const m = MOOD_OPTIONS.find(item => item.id === moodId);
      if (m) {
        getDayRecord(state.activeDate).doraQuote = `“${getUserName()}，${m.quote}”`;
        document.getElementById('dora-quote').textContent = getDayRecord(state.activeDate).doraQuote;
      }
      saveStorage(state);
      renderMoodAndWeather();
      if (typeof renderPaperAndStamp === 'function') renderPaperAndStamp();
      if (typeof renderWeeklyBooklet === 'function') renderWeeklyBooklet();
    }

    function selectWeather(weatherId) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      dayRec.weather = weatherId;
      saveStorage(state);
      renderMoodAndWeather();
      if (typeof renderPaperAndStamp === 'function') renderPaperAndStamp();
      if (typeof renderCollageStage === 'function') renderCollageStage();
      if (typeof renderWeeklyBooklet === 'function') renderWeeklyBooklet();
    }

    function adjustTemp(delta) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      dayRec.temp = Math.min(45, Math.max(-20, (dayRec.temp ?? 22) + delta));
      saveStorage(state);
      renderMoodAndWeather();
    }

    // ====================================================
    // 7. SLEEP DURATION TRACKER (壁橱睡眠记录)
    // ====================================================
    function renderSleepTracker() {
      const dayRec = getDayRecord(state.activeDate);
      const goal = state.profile.sleepGoal || 8.0;
      const hours = typeof dayRec.sleepHours === 'number' ? dayRec.sleepHours : 8.0;

      document.getElementById('sleep-goal-label').textContent = goal.toFixed(1);
      document.getElementById('sleep-bedtime').value = dayRec.bedtime || '23:30';
      document.getElementById('sleep-waketime').value = dayRec.waketime || '07:30';
      document.getElementById('sleep-hours-num').textContent = `${hours.toFixed(1)}h`;

      const isMet = hours >= goal;
      const badgeEl = document.getElementById('sleep-badge');
      badgeEl.textContent = `${hours.toFixed(1)}h ${isMet ? '✨达标' : '💤待补觉'}`;
      badgeEl.className = `font-mono-num text-xs font-black px-2.5 py-1 rounded-full border border-slate-900 ${isMet ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`;

      const pct = Math.min(100, Math.round((hours / goal) * 100));
      document.getElementById('sleep-progress-bar').style.width = `${pct}%`;

      const qContainer = document.getElementById('sleep-quality-selector');
      const curQ = dayRec.sleepQuality || 'great';
      qContainer.innerHTML = SLEEP_QUALITIES.map(q => {
        const active = q.id === curQ;
        return `
          <button type="button" onclick="selectSleepQuality('${q.id}')" class="comic-btn py-1.5 px-1 rounded-xl flex flex-col items-center justify-center min-h-[44px] ${active ? 'bg-indigo-600 text-white font-black' : 'bg-white text-slate-600'}">
            <span class="text-sm leading-none">${q.icon}</span>
            <span class="text-[10px] mt-0.5">${q.label}</span>
          </button>
        `;
      }).join('');
    }

    function calculateSleepFromTimes() {
      playSFX('click');
      const bed = document.getElementById('sleep-bedtime').value;
      const wake = document.getElementById('sleep-waketime').value;
      const dayRec = getDayRecord(state.activeDate);
      dayRec.bedtime = bed;
      dayRec.waketime = wake;

      if (bed && wake) {
        const [bh, bm] = bed.split(':').map(Number);
        const [wh, wm] = wake.split(':').map(Number);
        let bedMins = bh * 60 + bm;
        let wakeMins = wh * 60 + wm;
        if (wakeMins <= bedMins) {
          wakeMins += 24 * 60;
        }
        const diffHours = Math.round(((wakeMins - bedMins) / 60) * 2) / 2;
        dayRec.sleepHours = Math.min(16, Math.max(0, diffHours));
      }
      saveStorage(state);
      renderSleepTracker();
      showToast(`🌙 已自动计算睡眠时长：${dayRec.sleepHours.toFixed(1)} 小时`);
    }

    function adjustSleepHours(delta) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      dayRec.sleepHours = Math.min(16, Math.max(0, (dayRec.sleepHours || 8.0) + delta));
      saveStorage(state);
      renderSleepTracker();
    }

    function selectSleepQuality(qId) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      dayRec.sleepQuality = qId;
      saveStorage(state);
      renderSleepTracker();
    }

    // ====================================================
    // 8. DORAYAKI / HYDRATION STAMPS
    // ====================================================
    function renderDorayakiStamps() {
      const dayRec = getDayRecord(state.activeDate);
      const count = dayRec.energyCount || 0;
      document.getElementById('energy-count').textContent = count;
      const container = document.getElementById('dorayaki-stamps');
      let html = '';
      for (let i = 1; i <= 8; i++) {
        const active = i <= count;
        html += `
          <button type="button" onclick="toggleEnergySlot(${i})" aria-label="能量打卡第${i}格" class="comic-btn py-2.5 rounded-xl flex flex-col items-center justify-center min-h-[52px] ${active ? 'bg-amber-100 border-amber-900' : 'bg-slate-100 opacity-60'}">
            <span class="text-xl leading-none">${active ? '🥞' : '💧'}</span>
            <span class="text-[10px] font-bold mt-1 ${active ? 'text-amber-900' : 'text-slate-400'}">#${i}</span>
          </button>
        `;
      }
      container.innerHTML = html;
    }

    function toggleEnergySlot(slot) {
      const dayRec = getDayRecord(state.activeDate);
      if (dayRec.energyCount === slot) {
        dayRec.energyCount = slot - 1;
        playSFX('click');
      } else {
        if (slot > (dayRec.energyCount || 0)) {
          state.coins += 5;
          showToast(`🥞 饮水/元气打卡 ${slot}/8！奖励 +5 🔔 铃铛币`);
        }
        dayRec.energyCount = slot;
        playSFX('coin');
      }
      saveStorage(state);
      renderDorayakiStamps();
      renderHUD();
    }

    function fillAllEnergy() {
      const dayRec = getDayRecord(state.activeDate);
      dayRec.energyCount = 8;
      state.coins += 10;
      playSFX('gadget');
      saveStorage(state);
      renderDorayakiStamps();
      renderHUD();
      showToast('🥞 今日 8 格元气补给已全部点亮！+10 🔔');
    }

    // ====================================================
    // 9. DAILY EXPENSE TRACKER (四次元零花钱消费记录)
    // ====================================================
    function renderExpenses() {
      const dayRec = getDayRecord(state.activeDate);
      const expenses = dayRec.expenses || [];
      const budget = state.profile.dailyBudget || 100;
      const total = expenses.filter(item => item.kind !== 'income').reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      document.getElementById('daily-expense-total').textContent = total.toFixed(2);
      document.getElementById('daily-budget-limit').textContent = budget;

      const pct = Math.min(100, Math.round((total / budget) * 100));
      const bar = document.getElementById('budget-progress-bar');
      bar.style.width = `${pct}%`;
      bar.className = `h-full transition-all duration-300 ${total > budget ? 'bg-[#E60012]' : total > budget * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`;

      const listEl = document.getElementById('expense-list');
      if (expenses.length === 0) {
        listEl.innerHTML = `
          <div class="comic-card-sm p-4 text-center bg-slate-50 text-slate-400 text-xs font-bold">
            💰 当天还没有消费记录，在上方输入金额即可记一笔账~
          </div>
        `;
        return;
      }

      listEl.innerHTML = expenses.map(exp => {
        const meta = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.other;
        return `
          <div class="comic-card-sm px-3 py-2.5 bg-white flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-9 h-9 rounded-xl border border-slate-900 flex items-center justify-center text-base shrink-0 ${meta.cls}">
                ${meta.icon}
              </span>
              <div class="min-w-0">
                <p class="text-xs sm:text-sm font-bold text-slate-900 truncate">${escapeHtml(exp.title)}</p>
                <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <span>${meta.label}</span>
                  <span>•</span>
                  <span class="font-mono-num">${exp.time || ''}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="font-mono-num text-sm font-black ${exp.kind === 'income' ? 'text-emerald-700' : 'text-[#E60012]'}">${exp.kind === 'income' ? '+' : '-'}¥${Number(exp.amount).toFixed(2)}</span>
              <button type="button" onclick="deleteExpense(${exp.id})" aria-label="删除消费" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-xs font-bold flex items-center justify-center">✕</button>
            </div>
          </div>
        `;
      }).join('');
    }

    function addExpense(e) {
      e.preventDefault();
      const catEl = document.getElementById('expense-category');
      const titleEl = document.getElementById('expense-title');
      const amountEl = document.getElementById('expense-amount');

      const amount = parseFloat(amountEl.value);
      if (isNaN(amount) || amount <= 0) {
        showToast('💰 请输入有效的消费金额哦~');
        return;
      }
      if (amount > 1000000) {
        showToast('金额不能超过 ¥1,000,000。');
        return;
      }
      const meta = EXPENSE_CATEGORIES[catEl.value] || EXPENSE_CATEGORIES.other;
      const title = titleEl.value.trim() || meta.label;
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');

      const dayRec = getDayRecord(state.activeDate);
      if (!dayRec.expenses) dayRec.expenses = [];
      dayRec.expenses.unshift({
        id: Date.now(),
        category: catEl.value,
        kind: document.getElementById('transaction-kind')?.value === 'income' ? 'income' : 'expense',
        title,
        amount,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
      });

      titleEl.value = '';
      amountEl.value = '';
      const kind = document.getElementById('transaction-kind')?.value === 'income' ? 'income' : 'expense';
      state.coins += 5;
      playSFX('coin');
      saveStorage(state);
      renderExpenses();
      renderHUD();
      renderStats();
      renderCalendar();
      showToast(`💰 已记录${kind === 'income' ? '收入' : '支出'}：${title} ¥${amount.toFixed(2)}（奖励 +5 🔔）`);
    }

    function updateExpenseCategories() {
      const kind = document.getElementById('transaction-kind').value;
      const category = document.getElementById('expense-category');
      const options = kind === 'income'
        ? [['salary', '💼 工资'], ['bonus', '🎁 奖金'], ['freelance', '🧰 兼职'], ['other-income', '💰 其他收入']]
        : [['food', '🍔 餐饮美食'], ['transport', '🚌 交通出行'], ['shopping', '🛍️ 购物日用'], ['fun', '🎮 休闲娱乐'], ['study', '📚 学习办公'], ['other', '🎁 人情其他']];
      category.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
      category.setAttribute('aria-label', kind === 'income' ? '收入分类' : '消费分类');
      document.getElementById('expense-title').placeholder = kind === 'income' ? '收入来源（如：工资、奖金）' : '消费项目（如：买铜锣烧、地铁通勤、奶茶）';
    }

    function deleteExpense(id) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      dayRec.expenses = (dayRec.expenses || []).filter(item => item.id !== id);
      saveStorage(state);
      renderExpenses();
      renderStats();
      renderCalendar();
    }

    function addActivity(event) {
      event.preventDefault();
      const input = document.getElementById('activity-minutes');
      const minutes = Number(input.value);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) return showToast('运动时长请填写 1 到 1440 分钟。');
      const day = getDayRecord(state.activeDate);
      day.activities.unshift({ id: Date.now(), type: document.getElementById('activity-type').value, minutes });
      input.value = '';
      saveStorage(state);
      renderDailyMetrics(); renderStats(); renderCalendar();
      showToast(`今天的 ${minutes} 分钟运动记下啦。`);
    }

    function saveWeight(event) {
      event.preventDefault();
      const raw = document.getElementById('weight-input').value.trim();
      const value = Number(raw);
      if (!raw || !Number.isFinite(value) || value < 20 || value > 350) return showToast('请输入 20 到 350 kg 之间的体重。');
      getDayRecord(state.activeDate).weightKg = Math.round(value * 10) / 10;
      state.coins += 10;
      playSFX('coin');
      spawnFloatingParticles(['⚖️', '✨', '💚']);
      saveStorage(state);
      renderDailyMetrics(); renderBmiStation(); renderWeeklyBooklet(); renderThemeQuestProgress(); renderHUD(); renderStats(); renderCalendar();
      showToast(`${state.activeDate} 的体重记录已更新，BMI指数已同步测算！(+10 🔔)`);
    }

    function deleteActivity(id) {
      const day = getDayRecord(state.activeDate);
      day.activities = day.activities.filter(item => item.id !== id);
      saveStorage(state); renderDailyMetrics(); renderStats(); renderCalendar();
    }

    function renderDailyMetrics() {
      const day = getDayRecord(state.activeDate);
      document.getElementById('weight-input').value = day.weightKg ?? '';
      const previous = Object.entries(state.days).filter(([, item]) => item.weightKg != null).sort(([a], [b]) => b.localeCompare(a))[0];
      document.getElementById('weight-last-entry').textContent = day.weightKg != null
        ? `已保存 ${Number(day.weightKg).toFixed(1)} kg，仅保存在此设备。`
        : previous ? `上次记录 ${previous[0]} · ${Number(previous[1].weightKg).toFixed(1)} kg` : '体重可选记录，仅保存在此设备。';
      const list = document.getElementById('activity-log-list');
      list.innerHTML = day.activities.length ? day.activities.map(item => `<div class="flex items-center justify-between gap-2 text-xs bg-emerald-50 rounded-lg px-2 py-1.5"><span class="min-w-0 truncate">${escapeHtml(item.type)} · ${item.minutes} 分钟</span><button type="button" onclick="deleteActivity(${item.id})" aria-label="删除运动记录" class="text-slate-500 px-2 min-h-[36px]">删除</button></div>`).join('') : '<p class="text-[11px] text-slate-500">记录散步、跑步或其他运动</p>';
    }

    let reportPeriod = 'week';
    function reportData() {
      const [year, month, day] = state.activeDate.split('-').map(Number);
      const active = new Date(year, month - 1, day);
      let start, end;
      if (reportPeriod === 'week') {
        const offset = (active.getDay() + 6) % 7;
        start = new Date(year, month - 1, day - offset); end = new Date(year, month - 1, day + 6 - offset);
      } else { start = new Date(year, month - 1, 1); end = new Date(year, month, 0); }
      const keyOf = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const from = keyOf(start), to = keyOf(end);
      const days = Object.entries(state.days).filter(([key]) => key >= from && key <= to).map(([date, data]) => ({ date, data }));
      const activities = days.flatMap(({ data }) => data.activities || []);
      const expenses = days.flatMap(({ date, data }) => (data.expenses || []).map(item => Object.assign({ date }, item)));
      const weights = days.filter(({ data }) => data.weightKg != null).map(({ date, data }) => ({ date, value: Number(data.weightKg) })).sort((a, b) => a.date.localeCompare(b.date));
      const spend = expenses.filter(item => item.kind !== 'income').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const income = expenses.filter(item => item.kind === 'income').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const chart = reportPeriod === 'week'
        ? Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); const key = keyOf(d); return { label: ['一','二','三','四','五','六','日'][i], value: (state.days[key]?.activities || []).reduce((sum, item) => sum + Number(item.minutes || 0), 0) }; })
        : Array.from({ length: 5 }, (_, i) => { const a = new Date(year, month - 1, i * 7 + 1); const b = new Date(year, month - 1, Math.min(i * 7 + 7, end.getDate())); return { label: `${a.getDate()}-${b.getDate()}`, value: days.filter(entry => entry.date >= keyOf(a) && entry.date <= keyOf(b)).reduce((sum, entry) => sum + (entry.data.activities || []).reduce((n, item) => n + Number(item.minutes || 0), 0), 0) }; });
      const recordedDays = days.filter(entry => (entry.data.activities || []).length || (entry.data.expenses || []).length || entry.data.weightKg != null || entry.data.sleepHours || entry.data.energyCount || state.diaries.some(d => (d.dateKey || d.date.slice(0, 10)) === entry.date)).length;
      return { year, month, from, to, days, activities, weights, chart, spend, income, recordedDays, totalMinutes: activities.reduce((sum, item) => sum + Number(item.minutes || 0), 0) };
    }

    function setReportPeriod(period) {
      if (!['week', 'month'].includes(period)) return;
      reportPeriod = period;
      document.getElementById('report-week-button').setAttribute('aria-pressed', String(period === 'week'));
      document.getElementById('report-month-button').setAttribute('aria-pressed', String(period === 'month'));
      renderReport();
    }

    function renderReport() {
      const report = reportData();
      document.getElementById('report-date-range').textContent = reportPeriod === 'week' ? `${report.from} 至 ${report.to} · 周报` : `${report.year} 年 ${String(report.month).padStart(2, '0')} 月 · 月报`;
      document.getElementById('report-exercise-minutes').textContent = `${report.totalMinutes} 分钟`;
      document.getElementById('report-exercise-count').textContent = `${report.activities.length} 次`;
      document.getElementById('report-expense-total').textContent = `¥${report.spend.toFixed(2)}`;
      document.getElementById('report-income-total').textContent = `¥${report.income.toFixed(2)}`;
      document.getElementById('report-balance-total').textContent = `¥${(report.income - report.spend).toFixed(2)}`;
      document.getElementById('report-active-days').textContent = `${report.recordedDays} 天`;
      const max = Math.max(10, ...report.chart.map(item => item.value));
      document.getElementById('report-activity-chart').innerHTML = report.chart.map(item => `<div class="flex flex-col items-center justify-end h-20 min-w-0" title="${escapeHtml(item.label)} ${item.value} 分钟"><span class="text-[9px] text-slate-500">${item.value || ''}</span><div class="w-4/5 rounded-t bg-emerald-500 border border-slate-800" style="height:${item.value ? Math.max(6, item.value / max * 55) : 2}px"></div><span class="text-[9px] text-slate-500 mt-1">${escapeHtml(item.label)}</span></div>`).join('');
      const weights = report.weights;
      const lastWeight = weights[weights.length - 1];
      document.getElementById('report-weight-summary').textContent = weights.length ? `体重：${weights[0].value.toFixed(1)} kg → ${lastWeight.value.toFixed(1)} kg${weights.length > 1 ? `（变化 ${(lastWeight.value - weights[0].value > 0 ? '+' : '')}${(lastWeight.value - weights[0].value).toFixed(1)} kg）` : ''}` : '此周期还没有体重记录。';
    }

    async function downloadReportPoster() {
      const report = reportData();
      const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
      const ctx = canvas.getContext('2d'); if (!ctx) return showToast('当前浏览器无法生成海报。');
      ctx.fillStyle = '#E6F6FF'; ctx.fillRect(0, 0, 1080, 1350); ctx.fillStyle = '#FFFDF7'; ctx.fillRect(48, 48, 984, 1254);
      ctx.fillStyle = '#0096E6'; ctx.fillRect(48, 48, 984, 220); ctx.fillStyle = '#FFFFFF'; ctx.font = '700 58px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'; ctx.fillText('我的时光生活报告', 96, 136);
      ctx.font = '32px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'; ctx.fillText(reportPeriod === 'week' ? `${report.from} 至 ${report.to}` : `${report.year} 年 ${report.month} 月`, 96, 205);
      const metrics = [['运动时长', `${report.totalMinutes} 分钟`], ['运动次数', `${report.activities.length} 次`], ['周期支出', `¥${report.spend.toFixed(2)}`], ['周期收入', `¥${report.income.toFixed(2)}`], ['收支结余', `¥${(report.income-report.spend).toFixed(2)}`], ['记录天数', `${report.recordedDays} 天`]];
      metrics.forEach(([label, value], i) => { const x = 96 + i % 2 * 450, y = 320 + Math.floor(i / 2) * 135; ctx.fillStyle = i % 2 ? '#E9F8F4' : '#ECF6FC'; ctx.fillRect(x, y, 410, 106); ctx.fillStyle = '#52606D'; ctx.font = '26px sans-serif'; ctx.fillText(label, x+22, y+38); ctx.fillStyle = '#243248'; ctx.font = '700 38px sans-serif'; ctx.fillText(value, x+22, y+83); });
      ctx.fillStyle = '#243248'; ctx.font = '700 32px sans-serif'; ctx.fillText('运动足迹', 96, 810); const max = Math.max(10, ...report.chart.map(item => item.value));
      report.chart.forEach((item, i) => { const gap = 850 / report.chart.length, x = 110 + i * gap + gap * .3, w = gap * .4, h = item.value ? item.value / max * 155 : 3; ctx.fillStyle = '#168064'; ctx.fillRect(x, 1010-h, w, h); ctx.fillStyle = '#52606D'; ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(item.label, x+w/2, 1045); }); ctx.textAlign = 'left';
      if (report.weights.length) { const first=report.weights[0], last=report.weights[report.weights.length - 1]; ctx.font='28px sans-serif'; ctx.fillText(`体重记录  ${first.value.toFixed(1)} → ${last.value.toFixed(1)} kg`,96,1150); }
      if (window.AndroidBridge) {
        saveCanvasPng(canvas, `生活报告_${reportPeriod}_${report.from}.png`, '统计海报已保存。');
        return;
      }
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) return showToast('海报生成失败，请重试。');
      const filename = `生活报告_${reportPeriod}_${report.from}.png`, file = new File([blob], filename, {type:'image/png'});
      try { if (navigator.share && navigator.canShare?.({files:[file]})) { await navigator.share({files:[file], title:'我的时光生活报告'}); return; } } catch (error) { if (error.name === 'AbortError') return; }
      saveCanvasPng(canvas, filename, '统计海报已保存。');
    }

    // ====================================================
    // 10. TO-DO MISSIONS CHECKLIST
    // ====================================================
    const CATEGORY_META = {
      study: { badge: '🍞 学习工作', cls: 'bg-amber-100 text-amber-900' },
      life: { badge: '🚪 日常生活', cls: 'bg-sky-100 text-sky-900' },
      adventure: { badge: '🚁 运动外出', cls: 'bg-emerald-100 text-emerald-900' }
    };

    function setTodoFilter(filter) {
      playSFX('click');
      state.todoFilter = filter;
      document.querySelectorAll('.todo-filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
          btn.className = 'todo-filter-btn comic-btn px-3 py-1.5 rounded-full text-xs font-black bg-[#0096E6] text-white shrink-0 min-h-[36px]';
        } else {
          btn.className = 'todo-filter-btn comic-btn px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 shrink-0 min-h-[36px]';
        }
      });
      renderTodos();
    }

    function renderTodos() {
      const listEl = document.getElementById('todo-list');
      const currentTodos = state.todos.filter(t => (t.date || state.activeDate) === state.activeDate);
      const filtered = currentTodos.filter(t => state.todoFilter === 'all' || t.category === state.todoFilter);

      const doneCount = currentTodos.filter(t => t.done).length;
      const totalCount = currentTodos.length;
      const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
      document.getElementById('todo-progress-bar').style.width = `${pct}%`;
      document.getElementById('todo-progress-text').textContent = `${doneCount}/${totalCount}`;

      if (filtered.length === 0) {
        listEl.innerHTML = `
          <div class="comic-card-sm p-6 text-center bg-slate-50 text-slate-400 text-xs font-bold">
            ✨ 暂时没有该分类的待办任务，快添加一条吧！
          </div>
        `;
        return;
      }

      listEl.innerHTML = filtered.map(todo => {
        const meta = CATEGORY_META[todo.category] || CATEGORY_META.life;
        return `
          <div class="comic-card-sm p-3 flex items-center justify-between gap-2.5 ${todo.done ? 'bg-slate-50/90 opacity-75' : 'bg-white'}">
            <button type="button" onclick="toggleTodo(${todo.id})" class="flex items-center gap-3 flex-1 text-left min-h-[38px] min-w-0">
              <span class="w-6 h-6 rounded-lg border-2 border-slate-900 flex items-center justify-center shrink-0 font-black text-xs ${todo.done ? 'bg-[#FFD700] text-slate-900' : 'bg-white'}">
                ${todo.done ? '✓' : ''}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold break-words ${todo.done ? 'line-through text-slate-400' : 'text-slate-800'}">${escapeHtml(todo.text)}</p>
                <span class="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 ${meta.cls}">${meta.badge}</span>
              </div>
            </button>
            <button type="button" onclick="deleteTodo(${todo.id})" aria-label="删除任务" class="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-slate-900 flex items-center justify-center shrink-0 text-xs font-bold">
              ✕
            </button>
          </div>
        `;
      }).join('');
    }

    function addTodo(e) {
      e.preventDefault();
      const input = document.getElementById('todo-input');
      const catSelect = document.getElementById('todo-category-select');
      const text = input.value.trim();
      if (!text) {
        showToast('✏️ 请先输入待办事项内容哦~');
        return;
      }
      state.todos.unshift({
        id: Date.now(),
        date: state.activeDate,
        text,
        category: catSelect.value,
        done: false
      });
      input.value = '';
      playSFX('bell');
      saveStorage(state);
      renderTodos();
      renderStats();
      showToast('🎒 新待办已添加进口袋手账！');
    }

    function toggleTodo(id) {
      const item = state.todos.find(t => t.id === id && (t.date || state.activeDate) === state.activeDate);
      if (!item) return;
      item.done = !item.done;
      if (item.done) {
        state.coins += 15;
        playSFX('coin');
        showToast(`🎉 太棒了${getUserName()}！完成任务奖励 +15 🔔 铃铛币`);
      } else {
        playSFX('click');
      }
      saveStorage(state);
      renderTodos();
      renderHUD();
      renderStats();
    }

    function deleteTodo(id) {
      playSFX('click');
      state.todos = state.todos.filter(t => t.id !== id || (t.date || state.activeDate) !== state.activeDate);
      saveStorage(state);
      renderTodos();
      renderStats();
    }

    // ====================================================
    // 11. POCKET DIARY & STICKERS
    // ====================================================
    function insertSticker(stickerText) {
      playSFX('click');
      const textarea = document.getElementById('diary-content');
      textarea.value = (textarea.value ? textarea.value + ' ' : '') + stickerText;
      state.draftContent = textarea.value;
      updateWordCount();
      saveStorage(state);
      textarea.focus();
    }

    function updateWordCount() {
      const len = document.getElementById('diary-content').value.trim().length;
      document.getElementById('diary-word-count').textContent = `已写 ${len} 字`;
    }

    async function saveDiaryEntry() {
      const titleInput = document.getElementById('diary-title');
      const contentInput = document.getElementById('diary-content');
      const title = titleInput.value.trim() || `${getUserName()}的日常手账`;
      const content = contentInput.value.trim();

      if (!content) {
        showToast('✍️ 手账正文还是空的，写两句再封存吧！');
        return;
      }

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${state.activeDate} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const dayRec = getDayRecord(state.activeDate);
      const moodObj = MOOD_OPTIONS.find(m => m.id === dayRec.moodId) || MOOD_OPTIONS[0];
      const weatherObj = WEATHER_OPTIONS.find(w => w.id === dayRec.weather) || WEATHER_OPTIONS[0];

      state.diaries.unshift({
        id: Date.now(),
        dateKey: state.activeDate,
        title,
        content,
        date: dateStr,
        moodIcon: moodObj.icon,
        weatherLabel: `${weatherObj.icon} ${weatherObj.label}`
      });

      titleInput.value = '';
      contentInput.value = '';
      state.draftTitle = '';
      state.draftContent = '';
      dayRec.draftTitle = '';
      dayRec.draftContent = '';
      state.coins += 20;

      playSFX('gadget');
      const saved = await PocketJournalStorage.flush(state);
      updateWordCount();
      renderDiaries();
      renderHUD();
      renderStats();
      if (saved) showToast('手账已保存到本机。');
    }

    function deleteDiary(id) {
      playSFX('click');
      state.diaries = state.diaries.filter(d => d.id !== id);
      saveStorage(state);
      renderDiaries();
      renderStats();
    }

    function renderDiaries() {
      const container = document.getElementById('diary-history-list');
      const query = (document.getElementById('diary-search')?.value || '').trim().toLocaleLowerCase();
      const visible = state.diaries.filter(d => !query || `${d.title} ${d.content}`.toLocaleLowerCase().includes(query));
      document.getElementById('diary-total-badge').textContent = query ? `${visible.length}/${state.diaries.length} 篇` : `共 ${state.diaries.length} 篇`;

      if (visible.length === 0) {
        container.innerHTML = `<div class="text-center text-xs text-slate-400 py-4">还没有封存的手账记录哦~</div>`;
        return;
      }

      container.innerHTML = visible.map(d => `
        <article class="comic-card-sm p-3.5 bg-[#FFFDF7] relative">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-base">${d.moodIcon || '😊'}</span>
              <h4 class="font-bold text-sm text-slate-900 truncate">${escapeHtml(d.title)}</h4>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[10px] font-bold bg-sky-100 text-sky-900 px-2 py-0.5 rounded-full border border-slate-800">${d.weatherLabel || '☀️ 晴朗'}</span>
              <button type="button" onclick="editDiary(${d.id})" aria-label="编辑手账" class="text-slate-500 hover:text-sky-700 text-xs font-bold px-1">编辑</button>
              <button type="button" onclick="deleteDiary(${d.id})" aria-label="删除手账" class="text-slate-400 hover:text-rose-600 text-xs font-bold px-1">✕</button>
            </div>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">${escapeHtml(d.content)}</p>
          <div class="mt-2 text-[10px] font-mono-num text-slate-400">🕰️ 时光坐标：${d.date}</div>
        </article>
      `).join('');
    }

    function editDiary(id) {
      const entry = state.diaries.find(item => item.id === id);
      if (!entry) return;
      if (entry.dateKey && entry.dateKey !== state.activeDate) switchActiveDate(entry.dateKey);
      document.getElementById('diary-title').value = entry.title;
      document.getElementById('diary-content').value = entry.content;
      state.diaries = state.diaries.filter(item => item.id !== id);
      state.draftTitle = entry.title;
      state.draftContent = entry.content;
      saveStorage(state);
      updateWordCount(); renderDiaries();
      showToast('已把这篇手账放回编辑区，保存后会生成新的记录。');
    }

    // ====================================================
    // 12. MONTHLY CALENDAR REVIEW (时光机·月历回看)
    // ====================================================
    let calYear = new Date().getFullYear();
    let calMonth = new Date().getMonth(); // 0-indexed
    let selectedCalDate = state.activeDate;

    function changeCalendarMonth(delta) {
      playSFX('click');
      calMonth += delta;
      if (calMonth < 0) {
        calMonth = 11;
        calYear--;
      } else if (calMonth > 11) {
        calMonth = 0;
        calYear++;
      }
      renderCalendar();
    }

    function renderCalendar() {
      const pad = n => String(n).padStart(2, '0');
      const monthPrefix = `${calYear}-${pad(calMonth + 1)}-`;
      document.getElementById('cal-month-title').textContent = `${calYear}年 ${calMonth + 1}月`;

      // Calculate monthly stats
      let loggedDays = 0;
      let totalSleep = 0;
      let sleepCount = 0;
      let totalMonthExpense = 0;

      Object.keys(state.days).forEach(k => {
        if (k.startsWith(monthPrefix)) {
          const rec = state.days[k];
          const expSum = (rec.expenses || []).filter(e => e.kind !== 'income').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
          const hasDiary = state.diaries.some(d => (d.dateKey || d.date.slice(0, 10)) === k);
          if (rec.sleepHours || expSum > 0 || hasDiary || rec.energyCount > 0) {
            loggedDays++;
          }
          if (rec.sleepHours) {
            totalSleep += rec.sleepHours;
            sleepCount++;
          }
          totalMonthExpense += expSum;
        }
      });

      const doneTodosCount = state.todos.filter(t => t.done && (t.date || state.activeDate).startsWith(monthPrefix)).length;
      document.getElementById('cal-stat-days').textContent = `${loggedDays} 天`;
      document.getElementById('cal-stat-sleep').textContent = `${sleepCount ? (totalSleep / sleepCount).toFixed(1) : '8.0'} h`;
      document.getElementById('cal-stat-expense').textContent = `¥${totalMonthExpense.toFixed(1)}`;
      document.getElementById('cal-stat-todos').textContent = `${doneTodosCount} 项`;

      // Build calendar grid (Monday first)
      const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun..6=Sat
      const offset = (firstDay + 6) % 7; // Monday=0
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

      const gridEl = document.getElementById('calendar-grid');
      let html = '';

      for (let i = 0; i < offset; i++) {
        html += `<div class="h-16 sm:h-20 rounded-xl bg-slate-100/50 border border-dashed border-slate-200"></div>`;
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${calYear}-${pad(calMonth + 1)}-${pad(d)}`;
        const rec = state.days[dateKey];
        const isSelected = dateKey === selectedCalDate;
        const isToday = dateKey === getTodayKey();
        const moodObj = rec ? MOOD_OPTIONS.find(m => m.id === rec.moodId) : null;
        const weatherObj = rec ? WEATHER_OPTIONS.find(w => w.id === rec.weather) : null;
        const expSum = rec ? (rec.expenses || []).filter(e => e.kind !== 'income').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) : 0;
        const hasDiary = state.diaries.some(item => (item.dateKey || item.date.slice(0, 10)) === dateKey);

        html += `
          <button type="button" onclick="selectCalendarDate('${dateKey}')" class="h-16 sm:h-20 p-1 rounded-xl border-2 flex flex-col justify-between text-left transition relative overflow-hidden ${isSelected ? 'bg-[#FFF3B0] border-slate-900 ring-2 ring-[#0096E6] shadow-[0_2px_0_#1E293B]' : rec ? 'bg-white border-slate-800 hover:bg-sky-50' : 'bg-white/70 border-slate-300 text-slate-400'}">
            <div class="flex items-center justify-between w-full">
              <span class="font-mono-num text-[11px] font-black ${isToday ? 'bg-[#E60012] text-white px-1 rounded' : 'text-slate-800'}">${d}</span>
              <span class="text-xs leading-none">${moodObj ? moodObj.icon : ''}${weatherObj ? weatherObj.icon : ''}</span>
            </div>
            <div class="w-full space-y-0.5">
              ${rec && rec.sleepHours ? `<div class="text-[9px] font-mono-num font-bold text-indigo-700 bg-indigo-50 px-1 rounded truncate">🌙${rec.sleepHours}h</div>` : ''}
              ${expSum > 0 ? `<div class="text-[9px] font-mono-num font-bold text-rose-700 bg-rose-50 px-1 rounded truncate">¥${expSum.toFixed(0)}</div>` : ''}
              ${hasDiary && !expSum ? `<div class="text-[9px] font-bold text-sky-700 bg-sky-50 px-1 rounded truncate">✍️手账</div>` : ''}
            </div>
          </button>
        `;
      }

      gridEl.innerHTML = html;
      renderCalendarDayDetail(selectedCalDate);
    }

    function selectCalendarDate(dateKey) {
      playSFX('click');
      selectedCalDate = dateKey;
      renderCalendar();
    }

    function renderCalendarDayDetail(dateKey) {
      const box = document.getElementById('calendar-day-detail');
      const rec = state.days[dateKey];
      const dayDiaries = state.diaries.filter(d => (d.dateKey || d.date.slice(0, 10)) === dateKey);

      if (!rec && dayDiaries.length === 0) {
        box.innerHTML = `
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 py-2">
            <div>
              <h4 class="font-title text-base text-slate-900">📅 ${dateKey} 暂无记录</h4>
              <p class="text-xs text-slate-500 mt-0.5">你可以搭乘时光机回到这一天，补记当天的睡眠、消费或心情手账！</p>
            </div>
            <button onclick="switchActiveDate('${dateKey}')" class="comic-btn bg-[#0096E6] text-white font-black text-xs px-4 py-2.5 rounded-xl shrink-0">
              🛸 切换到该日补记手账
            </button>
          </div>
        `;
        return;
      }

      const moodObj = MOOD_OPTIONS.find(m => m.id === (rec?.moodId || 'happy')) || MOOD_OPTIONS[0];
      const weatherObj = WEATHER_OPTIONS.find(w => w.id === (rec?.weather || 'sunny')) || WEATHER_OPTIONS[0];
      const sleepQ = SLEEP_QUALITIES.find(q => q.id === (rec?.sleepQuality || 'good')) || SLEEP_QUALITIES[0];
      const expenses = rec?.expenses || [];
      const expTotal = expenses.filter(e => e.kind !== 'income').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
      const movement = rec?.activities || [];
      const activityTotal = movement.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);

      box.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-dashed border-slate-200">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${moodObj.icon}</span>
            <div>
              <h4 class="font-title text-base sm:text-lg text-slate-900">${dateKey} · ${ getUserName() }的时光档案</h4>
              <div class="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-600 mt-0.5">
                <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-slate-900">${moodObj.icon} ${moodObj.label}</span>
                <span class="bg-sky-100 text-sky-900 px-2 py-0.5 rounded-full border border-slate-900">${weatherObj.icon} ${weatherObj.label} ${rec?.temp ?? 22}°C</span>
                <span class="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full border border-slate-900">🌙 睡眠 ${rec?.sleepHours ?? 8.0}h (${sleepQ.label})</span>
                <span class="bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full border border-slate-900">💰 消费 ¥${expTotal.toFixed(2)}</span>
                ${activityTotal ? `<span class="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-slate-900">🏃 运动 ${activityTotal} 分钟</span>` : ''}
                ${rec?.weightKg != null ? `<span class="bg-sky-100 text-sky-900 px-2 py-0.5 rounded-full border border-slate-900">⚖️ ${Number(rec.weightKg).toFixed(1)} kg</span>` : ''}
              </div>
            </div>
          </div>
          <button onclick="switchActiveDate('${dateKey}')" class="comic-btn bg-[#FFD700] text-slate-900 font-black text-xs px-3.5 py-2 rounded-xl shrink-0">
            ✏️ 编辑/补记这天
          </button>
        </div>

        <!-- Expense Breakdown for Selected Day -->
        <div class="mb-3">
          <h5 class="text-xs font-black text-slate-700 mb-1.5">💰 当日消费明细 (${expenses.length} 笔)：</h5>
          ${expenses.length === 0 ? `<p class="text-xs text-slate-400">当日无消费记录</p>` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              ${expenses.map(e => {
                const meta = EXPENSE_CATEGORIES[e.category] || EXPENSE_CATEGORIES.other;
                return `
                  <div class="bg-white px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <span class="font-bold truncate">${meta.icon} ${escapeHtml(e.title)}</span>
                    <span class="font-mono-num font-black ${e.kind === 'income' ? 'text-emerald-700' : 'text-[#E60012]'} shrink-0 ml-2">${e.kind === 'income' ? '+' : '-'}¥${Number(e.amount).toFixed(2)}</span>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Diary Entries for Selected Day -->
        <div>
          <h5 class="text-xs font-black text-slate-700 mb-1.5">✍️ 当日手账笔记 (${dayDiaries.length} 篇)：</h5>
          ${dayDiaries.length === 0 ? `<p class="text-xs text-slate-400">当日未写手账正文</p>` : `
            <div class="space-y-2">
              ${dayDiaries.map(d => `
                <div class="bg-white p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div class="font-bold text-slate-900 mb-0.5">${escapeHtml(d.title)}</div>
                  <p class="text-slate-600 leading-relaxed whitespace-pre-wrap">${escapeHtml(d.content)}</p>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    // ====================================================
    // 13. SECRET GADGET DEX & CAFE
    // ====================================================
    function setGadgetCategory(cat) {
      playSFX('click');
      state.gadgetCategory = cat;
      document.querySelectorAll('.gadget-cat-btn').forEach(btn => {
        if (btn.dataset.gcat === cat) {
          btn.className = 'gadget-cat-btn comic-btn px-3 py-1.5 rounded-full text-xs font-black bg-[#0096E6] text-white shrink-0 min-h-[36px]';
        } else {
          btn.className = 'gadget-cat-btn comic-btn px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 shrink-0 min-h-[36px]';
        }
      });
      renderGadgets();
    }

    function renderGadgets() {
      const query = (document.getElementById('gadget-search')?.value || '').trim().toLowerCase();
      const grid = document.getElementById('gadget-grid');

      const filtered = GADGET_DEX.filter(g => {
        const matchCat = state.gadgetCategory === 'all' || g.category === state.gadgetCategory;
        const matchQuery = !query || g.name.toLowerCase().includes(query) || g.desc.toLowerCase().includes(query);
        return matchCat && matchQuery;
      });

      grid.innerHTML = filtered.map(g => {
        const isEquipped = state.equippedGadget === g.id;
        return `
          <div onclick="openGadgetModal('${g.id}')" class="comic-card-sm p-3 cursor-pointer hover:-translate-y-0.5 transition flex flex-col justify-between relative ${isEquipped ? 'ring-2 ring-[#E60012] bg-amber-50/40' : 'bg-white'}">
            <div>
              <div class="flex items-center justify-between text-[10px] font-mono-num font-bold mb-2">
                <span class="px-1.5 py-0.5 rounded bg-slate-900 text-white">${g.code}</span>
                <span class="px-1.5 py-0.5 rounded border border-slate-900 ${g.rarity === 'SSR' ? 'bg-[#FFD700] text-slate-900 font-black' : 'bg-sky-100 text-sky-900'}">${g.rarity}</span>
              </div>
              <div class="w-14 h-14 mx-auto my-1 rounded-2xl ${g.color} border-2 border-slate-900 flex items-center justify-center text-3xl shadow-[0_2px_0_#1E293B]">
                ${g.icon}
              </div>
              <h3 class="font-title text-base text-center text-slate-900 mt-2">${g.name}</h3>
              <p class="text-[11px] text-slate-500 text-center line-clamp-2 mt-1 leading-snug">${g.desc}</p>
            </div>
            <div class="mt-3 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400">${g.category}</span>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-900 ${isEquipped ? 'bg-[#E60012] text-white' : 'bg-slate-100 text-slate-700'}">
                ${isEquipped ? '✓ 已装备' : '详情'}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    function openGadgetModal(gadgetId) {
      playSFX('click');
      const g = GADGET_DEX.find(item => item.id === gadgetId);
      if (!g) return;
      const isEquipped = state.equippedGadget === g.id;
      const body = document.getElementById('gadget-modal-body');
      body.innerHTML = `
        <div class="text-center">
          <span class="font-mono-num text-xs font-black bg-slate-900 text-amber-300 px-2.5 py-1 rounded-full">${g.code} · ${g.rarity} 秘密道具</span>
          <div class="w-20 h-20 mx-auto my-3 rounded-3xl ${g.color} border-[2.5px] border-slate-900 shadow-[0_4px_0_#1E293B] flex items-center justify-center text-5xl">
            ${g.icon}
          </div>
          <h3 class="font-title text-2xl text-slate-900">${g.name}</h3>
          <span class="inline-block text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full border border-slate-900 mt-1 mb-3">${g.category}</span>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 text-left mb-3">${g.desc}</p>
          <div class="comic-card-sm p-2.5 bg-amber-50 text-xs font-bold text-amber-900 mb-4">
            ✨ 手账加成效果：${g.effect}
          </div>
          <button onclick="equipGadget('${g.id}')" class="comic-btn w-full py-3 rounded-2xl font-black text-sm min-h-[46px] ${isEquipped ? 'bg-emerald-500 text-white' : 'bg-[#0096E6] text-white'}">
            ${isEquipped ? '✓ 当前已装备在顶部仪表盘' : '🎒 设为今日随身守护道具'}
          </button>
        </div>
      `;
      const modal = document.getElementById('gadget-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeGadgetModal() {
      const modal = document.getElementById('gadget-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function equipGadget(gadgetId) {
      state.equippedGadget = gadgetId;
      const g = GADGET_DEX.find(item => item.id === gadgetId);
      playSFX('gadget');
      saveStorage(state);
      renderHUD();
      renderGadgets();
      closeGadgetModal();
      if (g) {
        showToast(`🎒 已装备【${g.name}】！${g.effect}`);
      }
    }

    function renderCafe() {
      const menuGrid = document.getElementById('cafe-menu-grid');
      menuGrid.innerHTML = CAFE_MENU.map(item => `
        <div class="comic-card-sm p-3 bg-white flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-slate-900 flex items-center justify-center text-2xl shrink-0">
              ${item.icon}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h4 class="font-bold text-sm text-slate-900 truncate">${item.name}</h4>
                <span class="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded border border-slate-900 shrink-0">${item.tag}</span>
              </div>
              <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${item.desc}</p>
              <span class="text-[10px] font-mono-num text-amber-700 font-bold">🔥 ${item.cal} kcal</span>
            </div>
          </div>
          <button onclick="orderCafeDish('${item.id}')" class="comic-btn bg-[#FFD700] hover:bg-amber-400 text-slate-900 font-black text-xs px-3 py-2 rounded-xl shrink-0 min-h-[40px]">
            点单投喂
          </button>
        </div>
      `).join('');

      const logList = document.getElementById('meal-log-list');
      const dayMeals = state.mealLogs.filter(m => (m.dateKey || state.activeDate) === state.activeDate);
      const totalCal = dayMeals.reduce((acc, m) => acc + (m.cal || 200), 0);
      document.getElementById('cafe-calories').textContent = totalCal;

      if (dayMeals.length === 0) {
        logList.innerHTML = `<div class="text-xs text-slate-400 text-center py-2">今天还没有点单或记录饮食哦~</div>`;
        return;
      }

      logList.innerHTML = dayMeals.map(m => `
        <div class="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-900 text-xs">
          <div class="flex items-center gap-2 min-w-0">
            <span class="font-bold text-sky-800 shrink-0">${m.type}</span>
            <span class="font-bold text-slate-800 truncate">${escapeHtml(m.name)}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-mono-num text-slate-400">${m.time}</span>
            <button onclick="deleteMealLog(${m.id})" class="text-slate-400 hover:text-rose-600 font-bold">✕</button>
          </div>
        </div>
      `).join('');
    }

    function orderCafeDish(dishId) {
      const dish = CAFE_MENU.find(d => d.id === dishId);
      if (!dish) return;
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      state.mealLogs.unshift({
        id: Date.now(),
        type: '🍽️ 美食桌布',
        dateKey: state.activeDate,
        name: `${dish.icon} ${dish.name}`,
        cal: dish.cal,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
      });
      const dayRec = getDayRecord(state.activeDate);
      dayRec.energyCount = Math.min(8, (dayRec.energyCount || 0) + 1);
      state.friendship = Math.min(100, (state.friendship || 95) + 1);
      playSFX('coin');
      saveStorage(state);
      renderCafe();
      renderDorayakiStamps();
      renderHUD();
      renderStats();
      showToast(`🍽️ 美食桌布变出了【${dish.name}】！哆啦A梦好感度 UP！`);
    }

    function addCustomMeal(e) {
      e.preventDefault();
      const typeEl = document.getElementById('meal-type');
      const nameEl = document.getElementById('meal-name');
      const name = nameEl.value.trim();
      if (!name) {
        showToast('🍱 请填写今天吃到的美食名称哦~');
        return;
      }
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      state.mealLogs.unshift({
        id: Date.now(),
        type: typeEl.value,
        dateKey: state.activeDate,
        name,
        cal: 280,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
      });
      nameEl.value = '';
      state.coins += 10;
      playSFX('bell');
      saveStorage(state);
      renderCafe();
      renderHUD();
      showToast('🍱 已记入今日饮食手账！奖励 +10 🔔');
    }

    function deleteMealLog(id) {
      playSFX('click');
      state.mealLogs = state.mealLogs.filter(m => m.id !== id || (m.dateKey || state.activeDate) !== state.activeDate);
      saveStorage(state);
      renderCafe();
    }

    // ====================================================
    // 14. 4D POCKET GACHA & FOCUS TIMER
    // ====================================================
    const LUCKY_FORTUNES = [
      '【大吉 · 铜锣烧日】今天做什么都顺风顺水，适合推进最重要的计划！',
      '【大吉 · 任意门开启】今天会有意想不到的好消息或灵感敲门！',
      '【中吉 · 记忆吐司加持】今天头脑格外清醒，学习与工作效率翻倍！',
      '【大吉 · 云之国奇遇】适合忙里偷闲喝杯下午茶，给自己充充电~'
    ];

    function openGachaModal() {
      playSFX('bell');
      const modal = document.getElementById('gacha-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeGachaModal() {
      const modal = document.getElementById('gacha-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function drawFromPocket() {
      if (state.coins < 20) {
        showToast('🔔 铃铛币不足 20 枚！快去完成待办或摇响顶部金铃铛吧~');
        return;
      }
      state.coins -= 20;
      playSFX('gadget');

      const randomGadget = GADGET_DEX[Math.floor(Math.random() * GADGET_DEX.length)];
      const fortune = LUCKY_FORTUNES[Math.floor(Math.random() * LUCKY_FORTUNES.length)];
      document.getElementById('gacha-icon-preview').textContent = randomGadget.icon;

      const box = document.getElementById('gacha-result-box');
      box.innerHTML = `
        <div class="text-3xl mb-1">${randomGadget.icon}</div>
        <div class="font-title text-base text-slate-900">为 ${getUserName()} 掏出了【${randomGadget.name}】！</div>
        <p class="text-[11px] text-amber-900 font-bold mt-1">${fortune}</p>
        <button onclick="equipGadget('${randomGadget.id}'); closeGachaModal();" class="mt-2 text-[11px] font-black text-[#0096E6] underline">
          立即装备这件道具 →
        </button>
      `;
      saveStorage(state);
      renderHUD();
    }

    let timerTotalSeconds = 25 * 60;
    let timerRemaining = 25 * 60;
    let timerRunning = false;
    let timerInterval = null;

    function setTimerMode(mins, label) {
      playSFX('click');
      if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
      }
      timerTotalSeconds = mins * 60;
      timerRemaining = timerTotalSeconds;
      document.getElementById('timer-mode-label').textContent = label;
      document.getElementById('timer-toggle-btn').textContent = '▶ 开始专注';
      document.getElementById('timer-state-hint').textContent = '准备开始';

      [25, 15, 5].forEach(m => {
        const btn = document.getElementById(`tmode-${m}`);
        if (m === mins) {
          btn.className = 'comic-btn px-3 py-1.5 rounded-full text-xs font-black bg-[#0096E6] text-white min-h-[36px]';
        } else {
          btn.className = 'comic-btn px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 min-h-[36px]';
        }
      });
      updateTimerUI();
    }

    function updateTimerUI() {
      const mins = Math.floor(timerRemaining / 60);
      const secs = timerRemaining % 60;
      document.getElementById('timer-display').textContent =
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      const circumference = 289;
      const progress = (timerTotalSeconds - timerRemaining) / timerTotalSeconds;
      const offset = circumference * progress;
      document.getElementById('timer-ring').style.strokeDashoffset = offset;
    }

    function toggleTimer() {
      playSFX('click');
      const btn = document.getElementById('timer-toggle-btn');
      const hint = document.getElementById('timer-state-hint');

      if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        btn.textContent = '▶ 继续专注';
        hint.textContent = '已暂停';
      } else {
        timerRunning = true;
        btn.textContent = '⏸ 暂停';
        hint.textContent = '时光屋专注进行中...';
        timerInterval = setInterval(() => {
          if (timerRemaining > 0) {
            timerRemaining--;
            updateTimerUI();
          } else {
            clearInterval(timerInterval);
            timerRunning = false;
            const addedMins = Math.round(timerTotalSeconds / 60);
            state.focusMinutes = (state.focusMinutes || 0) + addedMins;
            state.coins += 30;
            saveStorage(state);
            playSFX('gadget');
            renderHUD();
            renderStats();
            btn.textContent = '▶ 再来一轮';
            hint.textContent = '🎉 专注完成！';
            showToast(`🎉 专注完成！累计 +${addedMins} 分钟，奖励 +30 🔔`);
            timerRemaining = timerTotalSeconds;
            updateTimerUI();
          }
        }, 1000);
      }
    }

    function resetTimer() {
      playSFX('click');
      clearInterval(timerInterval);
      timerRunning = false;
      timerRemaining = timerTotalSeconds;
      document.getElementById('timer-toggle-btn').textContent = '▶ 开始专注';
      document.getElementById('timer-state-hint').textContent = '已重置';
      updateTimerUI();
    }

    function renderStats() {
      const doneTasks = state.todos.filter(t => (t.date || state.activeDate) === state.activeDate && t.done).length;
      document.getElementById('stat-tasks-done').textContent = doneTasks;
      document.getElementById('stat-diary-count').textContent = state.diaries.length;
      document.getElementById('stat-focus-mins').textContent = state.focusMinutes || 50;
      document.getElementById('stat-friendship').textContent = `${state.friendship || 98}%`;
      renderReport();
      renderDailyMetrics();
    }

    function exportJournalData() { return window.exportPocketPwaBackup(); }

    async function importJournalData(event) {
      const file = event.target.files?.[0]; event.target.value = '';
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        const imported = parsed?.state && typeof parsed.state === 'object' ? parsed.state : parsed;
        if (!imported || typeof imported !== 'object' || Array.isArray(imported) ||
            !imported.days || typeof imported.days !== 'object' || Array.isArray(imported.days) ||
            !Array.isArray(imported.diaries)) throw Error('invalid backup');
        const next = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_STATE)), imported);
        if (!await PocketJournalStorage.flush(next)) return;
        state = next;
        normalizePocketDailyRecords(state.activeDate);
        reconcilePocketDailyDate({render:false});
        const activeDay = getDayRecord(state.activeDate);
        document.getElementById('diary-title').value = state.draftTitle = activeDay.draftTitle || state.draftTitle || '';
        document.getElementById('diary-content').value = state.draftContent = activeDay.draftContent || state.draftContent || '';
        updateWordCount(); syncPocketRpsStreak(); closeResetModal(); renderAll();
        await PocketJournalStorage.flush(state);
        showToast('手账备份已导入并保存。');
      } catch (_) { showToast('无法读取这个备份文件，请检查内容后重试。'); }
    }

    function openResetModal() {
      playSFX('click');
      const modal = document.getElementById('reset-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeResetModal() {
      const modal = document.getElementById('reset-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function confirmResetData() {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      seedEnhancedStateDefaults();
      saveStorage(state);
      closeResetModal();
      renderAll();
      playSFX('gadget');
      showToast('🧣 时光包巾已将口袋手账恢复为初始演示状态！');
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }


    // ====================================================
    // 15. ENHANCED FEATURES: BMI, PAPER TEXTURE & STAMPS, INSPIRATION,
    //     PHOTO STICKER COLLAGE, VOICE MEMOS, FUTURE MAILBOX, WEEKLY BOOKLET
    // ====================================================
    const INSPIRATION_QUESTIONS = [
      { topic: '✨ 瞬间定格', q: '今天最想留住的一个瞬间是什么？' },
      { topic: '🚪 任意门记忆', q: '如果用任意门回到今天某个时刻，你想停留在哪一秒？' },
      { topic: '🥞 小确幸收集', q: '今天有哪件不起眼的小事，其实让你偷偷开心了一下？' },
      { topic: '🍲 味蕾治愈', q: '今天吃到的哪一口食物或饮品最治愈你的胃和心？' },
      { topic: '🏆 今日颁奖礼', q: '如果给今天的自己颁一个奇奇怪怪的奖，会是什么奖？' },
      { topic: '🎧 声音记忆', q: '今天听到的哪句话、哪首歌或哪种声音最让你难忘？' },
      { topic: '💌 时光对话', q: '此时此刻，你最想对一周后的自己说句什么话？' },
      { topic: '🌱 温柔觉察', q: '今天有没有哪个瞬间，让你觉得“幸好我有认真生活”？' },
      { topic: '📸 镜头捕捉', q: '如果把今天拍成一张拍立得照片，画面里会有什么？' },
      { topic: '💤 睡前放下', q: '今晚钻进壁橱睡觉前，你想用空气炮轰走哪件小烦恼？' }
    ];

    const STAMP_DESIGNS = [
      { id: 'postmark-blue', color: '#0096E6', border: '#0077B6', badge: '22世纪晴空认证局' },
      { id: 'postmark-red', color: '#E60012', border: '#B91C1C', badge: '四次元百宝袋特许印' },
      { id: 'postmark-gold', color: '#D97706', border: '#92400E', badge: '金铃铛小确幸珍藏印' },
      { id: 'postmark-sakura', color: '#DB2777', border: '#9D174D', badge: '静香花园温柔纪念章' },
      { id: 'postmark-emerald', color: '#059669', border: '#065F46', badge: '后山微风森林消印' }
    ];

    const COLLAGE_SCENES = {
      sunset: {
        name: '🌅 后山夕阳',
        svg: `<svg viewBox="0 0 400 220" class="w-full h-full object-cover">
          <defs>
            <linearGradient id="skySun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FB7185"/>
              <stop offset="55%" stop-color="#FBBF24"/>
              <stop offset="100%" stop-color="#FEF08A"/>
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill="url(#skySun)"/>
          <circle cx="290" cy="78" r="38" fill="#FFFBEB" opacity="0.9"/>
          <path d="M0 155 Q110 110 230 150 T400 135 L400 220 L0 220 Z" fill="#15803D"/>
          <path d="M0 175 Q160 140 400 170 L400 220 L0 220 Z" fill="#166534"/>
          <text x="24" y="198" fill="#FEF3C7" font-size="13" font-weight="bold">🌅 后山落日微风</text>
        </svg>`
      },
      dorayaki: {
        name: '🥞 铜锣烧茶会',
        svg: `<svg viewBox="0 0 400 220" class="w-full h-full object-cover">
          <rect width="400" height="220" fill="#FFFBEB"/>
          <circle cx="80" cy="50" r="90" fill="#FDE68A" opacity="0.45"/>
          <circle cx="330" cy="170" r="80" fill="#FED7AA" opacity="0.5"/>
          <ellipse cx="200" cy="135" rx="115" ry="38" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
          <ellipse cx="175" cy="122" rx="48" ry="24" fill="#D97706" stroke="#1E293B" stroke-width="3.5"/>
          <ellipse cx="230" cy="128" rx="48" ry="24" fill="#B45309" stroke="#1E293B" stroke-width="3.5"/>
          <text x="24" y="198" fill="#92400E" font-size="13" font-weight="bold">🥞 暖阳铜锣烧下午茶</text>
        </svg>`
      },
      rainbow: {
        name: '🌈 雨后彩虹',
        svg: `<svg viewBox="0 0 400 220" class="w-full h-full object-cover">
          <rect width="400" height="220" fill="#E0F2FE"/>
          <path d="M40 190 A160 140 0 0 1 360 190" fill="none" stroke="#F87171" stroke-width="10" opacity="0.8"/>
          <path d="M52 190 A148 128 0 0 1 348 190" fill="none" stroke="#FBBF24" stroke-width="10" opacity="0.8"/>
          <path d="M64 190 A136 116 0 0 1 336 190" fill="none" stroke="#34D399" stroke-width="10" opacity="0.8"/>
          <path d="M76 190 A124 104 0 0 1 324 190" fill="none" stroke="#38BDF8" stroke-width="10" opacity="0.8"/>
          <circle cx="95" cy="165" r="26" fill="#FFFFFF"/>
          <circle cx="122" cy="170" r="22" fill="#FFFFFF"/>
          <circle cx="290" cy="168" r="26" fill="#FFFFFF"/>
          <text x="24" y="198" fill="#0369A1" font-size="13" font-weight="bold">🌈 雨后放晴的彩虹天空</text>
        </svg>`
      },
      closet: {
        name: '🌙 壁橱夜读',
        svg: `<svg viewBox="0 0 400 220" class="w-full h-full object-cover">
          <rect width="400" height="220" fill="#1E1B4B"/>
          <circle cx="315" cy="58" r="28" fill="#FEF08A"/>
          <circle cx="326" cy="50" r="24" fill="#1E1B4B"/>
          <circle cx="90" cy="48" r="2.5" fill="#FDE047"/>
          <circle cx="160" cy="76" r="2" fill="#FDE047"/>
          <circle cx="235" cy="38" r="3" fill="#FDE047"/>
          <rect x="70" y="135" width="260" height="55" rx="14" fill="#FEF3C7" opacity="0.18"/>
          <text x="24" y="198" fill="#FDE68A" font-size="13" font-weight="bold">🌙 星夜壁橱的静谧时光</text>
        </svg>`
      },
      sakura: {
        name: '🌸 樱花任意门',
        svg: `<svg viewBox="0 0 400 220" class="w-full h-full object-cover">
          <rect width="400" height="220" fill="#FDF2F8"/>
          <circle cx="70" cy="60" r="8" fill="#F9A8D4"/>
          <circle cx="330" cy="80" r="10" fill="#F472B6"/>
          <circle cx="130" cy="140" r="6" fill="#F9A8D4"/>
          <rect x="165" y="42" width="70" height="128" rx="8" fill="#F43F5E" stroke="#1E293B" stroke-width="4"/>
          <rect x="175" y="52" width="50" height="108" rx="4" fill="#FB7185" stroke="#1E293B" stroke-width="2.5"/>
          <circle cx="216" cy="108" r="4.5" fill="#FFD700" stroke="#1E293B" stroke-width="2"/>
          <text x="24" y="198" fill="#9D174D" font-size="13" font-weight="bold">🌸 推开任意门的春日微风</text>
        </svg>`
      }
    };

    let currentInspirationIndex = 0;
    let currentStampDesignIdx = 0;
    let currentBookletPage = 1;
    let currentBookletTheme = 'dora';

    // Collage studio in-memory working state
    let collageState = {
      scene: 'sunset',
      customImageData: null,
      frameStyle: 'classic',
      stickers: [
        { id: 1, emoji: '🚁', x: 65, y: 24, scale: 1.2, rot: -8 },
        { id: 2, emoji: '🥞', x: 250, y: 112, scale: 1.25, rot: 10 },
        { id: 3, emoji: '✨', x: 170, y: 45, scale: 1.1, rot: 0 }
      ],
      selectedStickerId: 2
    };

    function spawnFloatingParticles(emojis = ['🥞', '🔔', '✨', '🚁']) {
      for (let i = 0; i < 6; i++) {
        const el = document.createElement('div');
        el.className = 'particle-burst';
        el.textContent = emojis[i % emojis.length];
        el.style.left = `${25 + Math.random() * 50}vw`;
        el.style.top = `${35 + Math.random() * 30}vh`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1150);
      }
    }

    function scrollToSection(sectionId) {
      playSFX('click');
      switchTab('journal');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    }

    function seedEnhancedStateDefaults() {
      if (!state.profile.heightCm) state.profile.heightCm = 168;
      if (!state.profile.targetWeightKg) state.profile.targetWeightKg = 58.0;
      if (!state.paperMode) state.paperMode = 'auto';

      const tKey = getTodayKey();
      const ym = tKey.slice(0, 8);
      const demoWeights = {
        [`${ym}18`]: { w: 59.2, q: '周末和哆啦A梦在后山分享了热乎乎的红豆铜锣烧，夕阳把云染成了橘子汽水色。', scene: 'sunset', cap: '后山橘子汽水色的夕阳 🌅' },
        [`${ym}19`]: { w: 58.9, q: '把复杂的任务拆成三件小事，全部打勾的那一刻超有成就感！', scene: 'closet', cap: '专注充实的周一夜读 🍞' },
        [`${ym}20`]: { w: 58.6, q: '窗外下着淅淅沥沥的小雨，泡了一杯热牛奶，听着雨声觉得世界很安静。', scene: 'dorayaki', cap: '雨天里的热牛奶与甜点 🌧️' },
        [`${ym}21`]: { w: 58.4, q: '雨停之后推开窗看到了双层彩虹！赶紧用拍立得定格下这幸运的一秒。', scene: 'rainbow', cap: '雨后偶遇双层彩虹 🌈' },
        [tKey]: { w: 58.2, q: '吹到了很舒服的微风，一步一个脚印把喜欢的日常都装进了四次元口袋。', scene: 'sakura', cap: '夕阳很慢，铜锣烧很甜 ✨' }
      };

      if (!window.pocketJournalHadStoredData) Object.entries(demoWeights).forEach(([k, info]) => {
        const rec = getDayRecord(k);
        if (rec.weightKg == null) rec.weightKg = info.w;
        if (!rec.dailyQuote) rec.dailyQuote = info.q;
        if (!rec.inspirationQuestion) rec.inspirationQuestion = '今天最想留住的一个瞬间是什么？';
        if (!Array.isArray(rec.photos) || rec.photos.length === 0) {
          rec.photos = [{
            id: 9000 + Number(k.slice(-2)),
            dateKey: k,
            scene: info.scene,
            frameStyle: 'classic',
            caption: info.cap,
            stickers: ['🚁', '✨', '🥞']
          }];
        }
      });

      if (!Array.isArray(state.voiceMemos)) {
        state.voiceMemos = [
          {
            id: 7001,
            dateKey: tKey,
            time: '14:35',
            durationSec: 12,
            ambient: '🎵 八音盒轻吟',
            text: '下午茶时间吃到了超松软的红豆铜锣烧，录段语音给自己鼓个劲！',
            audioUrl: null
          },
          {
            id: 7002,
            dateKey: `${ym}21`,
            time: '18:50',
            durationSec: 9,
            ambient: '🌧️ 窗外雨声',
            text: '傍晚雨停后空气好清新，散步回家的路上心情特别放松~',
            audioUrl: null
          }
        ];
      }

      if (!Array.isArray(state.futureLetters)) {
        state.futureLetters = [
          {
            id: 8001,
            createdDate: `${ym}15`,
            unlockDate: tKey,
            seal: '🔔 金铃铛火漆',
            title: '给一周后的自己：记得奖励自己一颗糖',
            content: `亲爱的${getUserName()}：
当你拆开这封来自一周前的信时，不管这周过得忙碌还是悠闲，都请先给自己一个大大的拥抱！你认真记录生活的样子真的超棒，今晚早点钻进被窝睡个好觉吧~`,
            opened: false
          },
          {
            id: 8002,
            createdDate: tKey,
            unlockDate: `${ym}29`,
            seal: '🚪 任意门火漆',
            title: '寄往下周今日：愿望清单都实现了吗？',
            content: `希望下周的你依然保持好心情，按时吃饭、好好睡觉，离理想体重和目标更近一步！`,
            opened: false
          }
        ];
      }
    }

    // ====================================================
    // 15A. MOOD & WEATHER DYNAMIC PAPER TEXTURE & STAMP
    // ====================================================
    function getAutoPaperTexture(moodId, weatherId) {
      if (['lightrain', 'heavyrain', 'thunder'].includes(weatherId)) {
        return { cls: 'paper-rainy-grid', name: '🌧️ 雨音微澜水彩方格纸', motto: '雨声滴答 · 把温柔心事折进方格里' };
      }
      if (['warm', 'energetic'].includes(moodId)) {
        return { cls: 'paper-sakura-dots', name: '🌸 樱花甜心点阵手账纸', motto: '元气满格 · 每一颗小确幸都在发光' };
      }
      if (weatherId === 'rainbow') {
        return { cls: 'paper-rainbow-confetti', name: '🌈 彩虹庆典手账纸', motto: '雨后彩虹 · 好运正穿过任意门向你奔来' };
      }
      if (['focused', 'busy'].includes(moodId)) {
        return { cls: 'paper-blueprint', name: '📐 22世纪蓝图方格纸', motto: '记忆吐司加持 · 专注的每一刻都算数' };
      }
      if (['calm', 'sleepy', 'down'].includes(moodId) || ['snowy', 'foggy', 'cloudy'].includes(weatherId)) {
        return { cls: 'paper-starry-kraft', name: '📜 星夜复古牛皮纸', motto: '慢下来也没关系 · 哆啦A梦陪你安静充电' };
      }
      return { cls: 'paper-sunny-lined', name: '☀️ 暖阳奶油横线纸', motto: '晴空万里 · 适合戴上竹蜻蜓去收集快乐' };
    }

    const PAPER_META_MAP = {
      'paper-sunny-lined': { cls: 'paper-sunny-lined', name: '☀️ 暖阳奶油横线纸', motto: '晴空万里 · 适合戴上竹蜻蜓去收集快乐' },
      'paper-rainy-grid': { cls: 'paper-rainy-grid', name: '🌧️ 雨音微澜水彩方格纸', motto: '雨声滴答 · 把温柔心事折进方格里' },
      'paper-sakura-dots': { cls: 'paper-sakura-dots', name: '🌸 樱花甜心点阵手账纸', motto: '元气满格 · 每一颗小确幸都在发光' },
      'paper-starry-kraft': { cls: 'paper-starry-kraft', name: '📜 星夜复古牛皮纸', motto: '慢下来也没关系 · 哆啦A梦陪你安静充电' },
      'paper-blueprint': { cls: 'paper-blueprint', name: '📐 22世纪蓝图方格纸', motto: '记忆吐司加持 · 专注的每一刻都算数' },
      'paper-rainbow-confetti': { cls: 'paper-rainbow-confetti', name: '🌈 彩虹庆典手账纸', motto: '雨后彩虹 · 好运正穿过任意门向你奔来' }
    };

    function changePaperTextureMode(mode) {
      playSFX('click');
      state.paperMode = mode;
      saveStorage(state);
      renderPaperAndStamp();
      showToast(`📜 手账纸张已切换为：${mode === 'auto' ? '随心情天气自动换纸' : PAPER_META_MAP[mode]?.name}`);
    }

    function cycleCustomStampStyle() {
      playSFX('bell');
      currentStampDesignIdx = (currentStampDesignIdx + 1) % STAMP_DESIGNS.length;
      renderPaperAndStamp();
      const design = STAMP_DESIGNS[currentStampDesignIdx];
      showToast(`💮 已切换印章款式：【${design.badge}】`);
    }

    function renderPaperAndStamp() {
      const dayRec = getDayRecord(state.activeDate);
      const moodObj = MOOD_OPTIONS.find(m => m.id === dayRec.moodId) || MOOD_OPTIONS[0];
      const weatherObj = WEATHER_OPTIONS.find(w => w.id === dayRec.weather) || WEATHER_OPTIONS[0];

      const paperMode = state.paperMode || 'auto';
      const selectEl = document.getElementById('paper-texture-mode-select');
      if (selectEl) selectEl.value = paperMode;

      const paperInfo = paperMode === 'auto'
        ? getAutoPaperTexture(moodObj.id, weatherObj.id)
        : (PAPER_META_MAP[paperMode] || PAPER_META_MAP['paper-sunny-lined']);

      const allPaperClasses = Object.keys(PAPER_META_MAP);
      const surfaceEl = document.getElementById('diary-paper-surface');
      if (surfaceEl) {
        allPaperClasses.forEach(c => surfaceEl.classList.remove(c));
        surfaceEl.classList.add(paperInfo.cls);
      }

      const badgeEl = document.getElementById('active-paper-name-badge');
      if (badgeEl) badgeEl.textContent = paperInfo.name;
      const indEl = document.getElementById('diary-paper-indicator');
      if (indEl) indEl.textContent = `📜 ${paperInfo.name}`;
      const miniIcons = document.getElementById('seal-mini-icons');
      if (miniIcons) miniIcons.textContent = `${moodObj.icon}${weatherObj.icon}`;

      const design = STAMP_DESIGNS[currentStampDesignIdx % STAMP_DESIGNS.length];
      const mottoEl = document.getElementById('active-stamp-motto');
      if (mottoEl) {
        mottoEl.textContent = `专属印章：【${moodObj.icon}${moodObj.label} × ${weatherObj.icon}${weatherObj.label}】· ${paperInfo.motto}`;
      }

      const postmarkEl = document.getElementById('diary-live-postmark');
      if (postmarkEl) {
        postmarkEl.innerHTML = `
          <div class="w-20 h-20 rounded-full border-[2.5px] flex flex-col items-center justify-center text-center p-1 shadow-md bg-white/90" style="border-color:${design.color}; color:${design.color}; transform: rotate(-8deg);">
            <span class="text-[8px] font-black tracking-tight leading-none">${design.badge}</span>
            <div class="text-base leading-none my-0.5">${moodObj.icon}${weatherObj.icon}</div>
            <span class="text-[9px] font-black leading-none">${moodObj.label}</span>
            <span class="font-mono-num text-[8px] font-bold mt-0.5">${state.activeDate.slice(5)}</span>
          </div>
        `;
      }
    }

    function stampMoodWeatherToDiary() {
      playSFX('gadget');
      const dayRec = getDayRecord(state.activeDate);
      const moodObj = MOOD_OPTIONS.find(m => m.id === dayRec.moodId) || MOOD_OPTIONS[0];
      const weatherObj = WEATHER_OPTIONS.find(w => w.id === dayRec.weather) || WEATHER_OPTIONS[0];
      const design = STAMP_DESIGNS[currentStampDesignIdx % STAMP_DESIGNS.length];
      const stampText = `【💮${design.badge}：${moodObj.icon}${moodObj.label} · ${weatherObj.icon}${weatherObj.label} ${dayRec.temp ?? 22}°C】`;

      insertSticker(stampText);
      const postmarkEl = document.getElementById('diary-live-postmark');
      if (postmarkEl) {
        postmarkEl.classList.remove('stamp-animate');
        void postmarkEl.offsetWidth;
        postmarkEl.classList.add('stamp-animate');
      }
      spawnFloatingParticles(['💮', moodObj.icon, weatherObj.icon, '✨']);
      showToast(`💮 已将今日【${moodObj.label}×${weatherObj.label}】专属消印盖入手账！`);
    }

    // ====================================================
    // 15B. WEIGHT & BMI SMART CALCULATOR STATION
    // ====================================================
    function quickStepWeight(delta) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      const base = dayRec.weightKg != null ? Number(dayRec.weightKg) : 58.2;
      const next = Math.min(350, Math.max(20, Math.round((base + delta) * 10) / 10));
      dayRec.weightKg = next;
      const inputEl = document.getElementById('weight-input');
      if (inputEl) inputEl.value = next.toFixed(1);
      saveStorage(state);
      renderDailyMetrics();
      renderBmiStation();
      renderWeeklyBooklet();
      showToast(`⚖️ 今日体重已调整为 ${next.toFixed(1)} kg`);
    }

    function updateBmiConfig() {
      playSFX('click');
      const hInput = document.getElementById('bmi-height-cm');
      const tInput = document.getElementById('bmi-target-kg');
      const hVal = parseFloat(hInput?.value);
      const tVal = parseFloat(tInput?.value);
      if (Number.isFinite(hVal) && hVal >= 100 && hVal <= 230) {
        state.profile.heightCm = Math.round(hVal * 10) / 10;
      }
      if (Number.isFinite(tVal) && tVal >= 25 && tVal <= 250) {
        state.profile.targetWeightKg = Math.round(tVal * 10) / 10;
      }
      saveStorage(state);
      renderBmiStation();
      renderWeeklyBooklet();
      showToast('🔦 身高与目标体重已更新，BMI 指数已重新测算！');
    }

    function getBmiEvaluation(bmi) {
      if (bmi < 18.5) {
        return { label: '🌱 偏瘦体型', cls: 'bg-sky-100 text-sky-900', advice: '多吃点营养美食，补充铜锣烧能量哦~' };
      }
      if (bmi < 24.0) {
        return { label: '💚 标准健康体型', cls: 'bg-emerald-100 text-emerald-900', advice: '体型超标准！继续保持规律作息与运动~' };
      }
      if (bmi < 28.0) {
        return { label: '🍯 轻度超重', cls: 'bg-amber-100 text-amber-900', advice: '戴上竹蜻蜓多去散步运动，轻松回到理想区间！' };
      }
      return { label: '🎈 需控重管理', cls: 'bg-rose-100 text-rose-900', advice: '循序渐进控制饮食与运动，哆啦A梦陪你一起加油！' };
    }

    function renderBmiStation() {
      const heightCm = state.profile?.heightCm || 168;
      const targetKg = state.profile?.targetWeightKg || 58.0;
      const hInput = document.getElementById('bmi-height-cm');
      const tInput = document.getElementById('bmi-target-kg');
      if (hInput && document.activeElement !== hInput) hInput.value = heightCm;
      if (tInput && document.activeElement !== tInput) tInput.value = targetKg;

      const dayRec = getDayRecord(state.activeDate);
      const allWeightEntries = Object.entries(state.days)
        .filter(([, d]) => d && d.weightKg != null)
        .sort(([a], [b]) => a.localeCompare(b));

      const latestWeight = dayRec.weightKg != null
        ? Number(dayRec.weightKg)
        : (allWeightEntries.length ? Number(allWeightEntries[allWeightEntries.length - 1][1].weightKg) : 58.2);

      const heightM = heightCm / 100;
      const bmi = latestWeight / (heightM * heightM);
      const minHealthy = (18.5 * heightM * heightM).toFixed(1);
      const maxHealthy = (23.9 * heightM * heightM).toFixed(1);
      const evalInfo = getBmiEvaluation(bmi);

      const bmiNumEl = document.getElementById('bmi-number-display');
      if (bmiNumEl) bmiNumEl.textContent = bmi.toFixed(1);

      const spanEl = document.getElementById('bmi-healthy-span');
      if (spanEl) spanEl.textContent = `理想 ${minHealthy}~${maxHealthy}kg`;

      const pillEl = document.getElementById('bmi-category-pill');
      if (pillEl) {
        pillEl.textContent = `${evalInfo.label} (BMI ${bmi.toFixed(1)})`;
        pillEl.className = `text-xs font-black px-2.5 py-1 rounded-full border border-slate-900 ${evalInfo.cls}`;
      }

      const diff = latestWeight - targetKg;
      const deltaEl = document.getElementById('bmi-goal-delta');
      if (deltaEl) {
        if (Math.abs(diff) <= 0.2) {
          deltaEl.textContent = '🎉 已达成目标';
          deltaEl.className = 'font-mono-num text-sm sm:text-base font-black text-emerald-700 mt-0.5';
        } else {
          deltaEl.textContent = `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`;
          deltaEl.className = `font-mono-num text-lg font-black mt-0.5 ${diff > 0 ? 'text-amber-700' : 'text-sky-700'}`;
        }
      }

      const adviceEl = document.getElementById('bmi-advice-short');
      if (adviceEl) adviceEl.textContent = evalInfo.advice;

      // Position pointer along BMI 14..32
      const pointerEl = document.getElementById('bmi-scale-pointer');
      if (pointerEl) {
        const pct = Math.min(96, Math.max(4, ((bmi - 14) / (32 - 14)) * 100));
        pointerEl.style.left = `${pct}%`;
      }

      // Render recent 7 weight entries chart
      const recent7 = allWeightEntries.slice(-7);
      const barsContainer = document.getElementById('weight-history-bars');
      const weekDeltaBadge = document.getElementById('weight-week-delta-badge');
      if (barsContainer) {
        if (recent7.length === 0) {
          barsContainer.innerHTML = `<div class="col-span-7 text-center text-xs text-slate-400 py-2">还没有体重记录，在上方输入今日体重即可生成趋势图</div>`;
        } else {
          const vals = recent7.map(([, d]) => Number(d.weightKg));
          const minW = Math.min(...vals) - 1;
          const maxW = Math.max(...vals) + 1;
          if (weekDeltaBadge && vals.length >= 2) {
            const net = vals[vals.length - 1] - vals[0];
            weekDeltaBadge.textContent = `近期变化 ${net > 0 ? '+' : ''}${net.toFixed(1)} kg`;
          }
          barsContainer.innerHTML = recent7.map(([dateKey, d]) => {
            const w = Number(d.weightKg);
            const hPct = Math.max(22, Math.round(((w - minW) / Math.max(1, maxW - minW)) * 52));
            const isCur = dateKey === state.activeDate;
            return `
              <button type="button" onclick="switchActiveDate('${dateKey}')" class="flex flex-col items-center justify-end p-1 rounded-xl border ${isCur ? 'bg-amber-100 border-slate-900 font-black' : 'bg-slate-50 border-slate-200'}">
                <span class="font-mono-num text-[10px] text-slate-800">${w.toFixed(1)}</span>
                <div class="w-4 rounded-t ${isCur ? 'bg-[#0096E6]' : 'bg-sky-400'} border border-slate-900 my-1" style="height:${hPct}px"></div>
                <span class="font-mono-num text-[9px] text-slate-500">${dateKey.slice(5)}</span>
              </button>
            `;
          }).join('');
        }
      }
    }

    // ====================================================
    // 15C. DAILY INSPIRATION PROMPT BOX
    // ====================================================
    function renderInspirationBox() {
      const dayRec = getDayRecord(state.activeDate);
      const item = INSPIRATION_QUESTIONS[currentInspirationIndex % INSPIRATION_QUESTIONS.length];
      const topicEl = document.getElementById('inspiration-topic-badge');
      const qEl = document.getElementById('inspiration-question-display');
      if (topicEl) topicEl.textContent = item.topic;
      if (qEl) qEl.textContent = `“${item.q}”`;

      const bannerEl = document.getElementById('saved-daily-quote-banner');
      const quoteTextEl = document.getElementById('saved-daily-quote-text');
      if (bannerEl && quoteTextEl) {
        if (dayRec.dailyQuote) {
          bannerEl.classList.remove('hidden');
          quoteTextEl.textContent = `📌 今日留住的瞬间：“${dayRec.dailyQuote}”`;
        } else {
          bannerEl.classList.add('hidden');
        }
      }
    }

    function nextInspirationPrompt() {
      playSFX('bell');
      currentInspirationIndex = (currentInspirationIndex + 1) % INSPIRATION_QUESTIONS.length;
      renderInspirationBox();
    }

    function fillInspirationChip(text) {
      playSFX('click');
      const inputEl = document.getElementById('inspiration-answer-input');
      if (inputEl) {
        inputEl.value = text;
        inputEl.focus();
      }
    }

    function saveInspirationToDiary() {
      const inputEl = document.getElementById('inspiration-answer-input');
      const ans = (inputEl?.value || '').trim();
      if (!ans) {
        showToast('💡 请先写下你的灵感回答或点击上方灵感快贴哦~');
        return;
      }
      const item = INSPIRATION_QUESTIONS[currentInspirationIndex % INSPIRATION_QUESTIONS.length];
      const dayRec = getDayRecord(state.activeDate);
      dayRec.inspirationQuestion = item.q;
      dayRec.dailyQuote = ans;

      // Also insert into diary textarea so user's journal entry gets real content
      const diaryInput = document.getElementById('diary-content');
      if (diaryInput) {
        const snippet = `【💡每日灵感：${item.q}】
“${ans}”`;
        diaryInput.value = diaryInput.value ? `${diaryInput.value}
${snippet}` : snippet;
        state.draftContent = diaryInput.value;
        dayRec.draftContent = diaryInput.value;
        updateWordCount();
      }

      inputEl.value = '';
      state.coins += 10;
      playSFX('coin');
      spawnFloatingParticles(['💡', '✨', '🔔']);
      saveStorage(state);
      renderInspirationBox();
      renderHUD();
      renderWeeklyBooklet();
      renderTimeTvProjector();
      renderBackHillMap();
      renderThemeQuestProgress();
      showToast('✨ 已将今日灵感瞬间收入手账 & 每周回忆小册！+10 🔔');
    }

    // ====================================================
    // 15D. PHOTO & STICKER COLLAGE STUDIO
    // ====================================================
    function selectCollageScene(sceneId) {
      playSFX('click');
      collageState.scene = sceneId;
      collageState.customImageData = null;
      renderCollageStage();
    }

    function setCollageFrameStyle(style) {
      playSFX('click');
      collageState.frameStyle = style;
      const frameEl = document.getElementById('collage-polaroid-frame');
      if (frameEl) {
        frameEl.className = `polaroid-frame-${style} mb-2.5 relative`;
      }
    }

    function handleCollagePhotoUpload(event) {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        showToast('请选择图片文件，手机可从相册或相机返回照片。');
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => showToast('照片读取失败，请重试或检查浏览器照片权限。');
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 560;
          const scale = Math.min(1, maxW / img.width);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          collageState.customImageData = canvas.toDataURL('image/jpeg', 0.82);
          playSFX('gadget');
          renderCollageStage();
          showToast('📷 照片已载入拍立得画板！快添加贴纸吧~');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function getMediaSupportMessage() {
      const protocol = window.location.protocol;
      if (protocol === 'file:') {
        return '当前是直接打开 HTML 文件。手机浏览器通常会禁止 file:// 页面访问麦克风，请改用 HTTPS 网页或 Android APP。';
      }
      if (!window.isSecureContext) {
        return '麦克风需要 HTTPS 安全网址。局域网 http:// 地址无法授权，请使用 https:// 域名打开。';
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        return '当前浏览器没有提供麦克风接口，请更新 Chrome、Edge 或 Safari。';
      }
      if (!window.MediaRecorder) {
        return '当前浏览器不支持网页录音，请更新系统浏览器或使用 Android APP。';
      }
      return '';
    }

    async function checkMobileMediaAccess(showResult = false) {
      const message = getMediaSupportMessage();
      if (message) {
        if (showResult) showToast(message);
        return { ok: false, message };
      }
      try {
        if (navigator.permissions?.query) {
          const permission = await navigator.permissions.query({ name: 'microphone' });
          if (permission.state === 'denied') {
            const denied = '麦克风权限已被拒绝，请在手机浏览器设置中允许此网站使用麦克风后重试。';
            if (showResult) showToast(denied);
            return { ok: false, message: denied };
          }
        }
        if (showResult) showToast('网页环境支持录音。点击“开始录语音”时，请在系统弹窗中选择允许。');
        return { ok: true };
      } catch (err) {
        if (showResult) showToast('无法读取麦克风权限状态，请直接点击开始录语音并允许系统授权。');
        return { ok: true };
      }
    }

    function addStickerToCollage(emoji) {
      playSFX('click');
      const id = Date.now() + Math.floor(Math.random() * 1000);
      collageState.stickers.push({
        id,
        emoji,
        x: 40 + Math.floor(Math.random() * 210),
        y: 25 + Math.floor(Math.random() * 115),
        scale: 1.2,
        rot: Math.floor(Math.random() * 24) - 12
      });
      collageState.selectedStickerId = id;
      renderCollageStage();
    }

    function transformSelectedSticker(action) {
      playSFX('click');
      const target = collageState.stickers.find(s => s.id === collageState.selectedStickerId)
        || collageState.stickers[collageState.stickers.length - 1];
      if (!target) return;
      collageState.selectedStickerId = target.id;
      if (action === 'rotate') {
        target.rot = (target.rot + 20) % 360;
      } else if (action === 'scale') {
        target.scale = target.scale >= 1.8 ? 0.9 : Math.round((target.scale + 0.25) * 100) / 100;
      }
      renderCollageStage();
    }

    function clearCollageStickers() {
      playSFX('click');
      collageState.stickers = [];
      collageState.selectedStickerId = null;
      renderCollageStage();
    }

    function renderCollageStage() {
      const bgLayer = document.getElementById('collage-bg-layer');
      const stickersLayer = document.getElementById('collage-stickers-layer');
      const stampEl = document.getElementById('collage-date-stamp');
      if (!bgLayer || !stickersLayer) return;

      const dayRec = getDayRecord(state.activeDate);
      const weatherObj = WEATHER_OPTIONS.find(w => w.id === dayRec.weather) || WEATHER_OPTIONS[0];
      const moodObj = MOOD_OPTIONS.find(m => m.id === dayRec.moodId) || MOOD_OPTIONS[0];
      if (stampEl) {
        stampEl.textContent = `${state.activeDate} · ${moodObj.icon}${weatherObj.icon}`;
      }

      if (collageState.customImageData) {
        bgLayer.innerHTML = `<img src="${collageState.customImageData}" alt="今日拍立得" class="w-full h-full object-cover" />`;
      } else {
        const sceneObj = COLLAGE_SCENES[collageState.scene] || COLLAGE_SCENES.sunset;
        bgLayer.innerHTML = sceneObj.svg;
      }

      stickersLayer.innerHTML = collageState.stickers.map(s => {
        const isSel = s.id === collageState.selectedStickerId;
        return `
          <div data-sticker-id="${s.id}"
               class="collage-sticker-item ${isSel ? 'collage-sticker-selected' : ''} text-2xl px-1"
               style="left:${s.x}px; top:${s.y}px; transform: rotate(${s.rot}deg) scale(${s.scale});">
            ${s.emoji}
          </div>
        `;
      }).join('');

      // Attach pointer drag handlers to stickers
      const stageEl = document.getElementById('collage-canvas-stage');
      stickersLayer.querySelectorAll('.collage-sticker-item').forEach(el => {
        el.onpointerdown = e => {
          e.stopPropagation();
          const sid = Number(el.dataset.stickerId);
          collageState.selectedStickerId = sid;
          const stickerObj = collageState.stickers.find(item => item.id === sid);
          if (!stickerObj || !stageEl) return;

          const rect = stageEl.getBoundingClientRect();
          const startX = e.clientX;
          const startY = e.clientY;
          const origX = stickerObj.x;
          const origY = stickerObj.y;

          el.setPointerCapture(e.pointerId);
          el.onpointermove = moveEvent => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            stickerObj.x = Math.min(rect.width - 36, Math.max(4, origX + dx));
            stickerObj.y = Math.min(rect.height - 36, Math.max(4, origY + dy));
            el.style.left = `${stickerObj.x}px`;
            el.style.top = `${stickerObj.y}px`;
          };
          el.onpointerup = () => {
            el.onpointermove = null;
            el.onpointerup = null;
            renderCollageStage();
          };
        };
      });

      renderSavedCollagesStrip();
    }

    function saveCollageSnapshot() {
      const dayRec = getDayRecord(state.activeDate);
      if (!Array.isArray(dayRec.photos)) dayRec.photos = [];
      const caption = (document.getElementById('collage-caption-input')?.value || '').trim() || '定格今日小确幸 ✨';

      dayRec.photos.unshift({
        id: Date.now(),
        dateKey: state.activeDate,
        scene: collageState.scene,
        customImageData: collageState.customImageData,
        frameStyle: collageState.frameStyle,
        caption,
        stickers: collageState.stickers.map(s => s.emoji)
      });

      state.coins += 15;
      playSFX('gadget');
      spawnFloatingParticles(['📸', '✨', '🌸', '🔔']);
      saveStorage(state);
      renderSavedCollagesStrip();
      renderHUD();
      renderWeeklyBooklet();
      renderThemeQuestProgress();
      showToast('📸 拍立得拼贴已收入今日手账与每周回忆小册！+15 🔔');
    }

    function deleteSavedCollage(photoId) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      dayRec.photos = (dayRec.photos || []).filter(p => p.id !== photoId);
      saveStorage(state);
      renderSavedCollagesStrip();
      renderWeeklyBooklet();
      renderThemeQuestProgress();
    }

    function renderSavedCollagesStrip() {
      const stripEl = document.getElementById('saved-collages-strip');
      if (!stripEl) return;
      const dayRec = getDayRecord(state.activeDate);
      const photos = dayRec.photos || [];
      if (photos.length === 0) {
        stripEl.innerHTML = `<span class="text-[11px] text-slate-400">今日还未保存拍立得，拼贴好后点击上方「贴入今日手账」吧~</span>`;
        return;
      }
      stripEl.innerHTML = photos.map(p => `
        <div class="comic-card-sm px-2.5 py-1.5 bg-white flex items-center gap-2 shrink-0">
          <span class="text-sm">${(p.stickers || ['📸']).slice(0, 2).join('')}</span>
          <span class="text-xs font-bold text-slate-800 max-w-[110px] truncate">${escapeHtml(p.caption)}</span>
          <button type="button" onclick="deleteSavedCollage(${p.id})" class="text-slate-400 hover:text-rose-600 text-xs font-bold">✕</button>
        </div>
      `).join('');
    }

    function downloadCollageCardPng() {
      playSFX('bell');
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 520;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#FFFDF7';
      ctx.fillRect(0, 0, 640, 520);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, 616, 496);

      ctx.fillStyle = '#E0F2FE';
      ctx.fillRect(36, 36, 568, 360);
      ctx.strokeRect(36, 36, 568, 360);

      ctx.fillStyle = '#0096E6';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`📸 ${state.activeDate} · 四次元拍立得手账`, 56, 82);

      const stText = collageState.stickers.map(s => s.emoji).join('  ');
      ctx.font = '48px sans-serif';
      ctx.fillText(stText || '🚁 ✨ 🥞 🔔', 64, 220);

      const cap = (document.getElementById('collage-caption-input')?.value || '夕阳很慢，铜锣烧很甜 ✨').trim();
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cap, 320, 455);

      saveCanvasPng(canvas, `polaroid_${state.activeDate}.png`, '🖼️ 拍立得照片已保存为 PNG 图片！');
    }

    // ====================================================
    // 15E. VOICE MEMO CAPSULES (22世纪录音花)
    // ====================================================
    let voiceRecording = false;
    let voiceSeconds = 0;
    let voiceTimerInterval = null;
    let mediaRecorderInstance = null;
    let recordedAudioChunks = [];
    let lastRecordedAudioDataUrl = null;
    let voiceCaptureAvailable = false;
    let voiceAudioReady = Promise.resolve();
    let resolveVoiceAudioReady = null;
    let playingVoiceId = null;

    async function toggleVoiceRecording() {
      const btn = document.getElementById('voice-record-btn');
      const statusEl = document.getElementById('voice-record-status');
      const waveBox = document.getElementById('voice-wave-box');

      if (!voiceRecording) {
        // Keep getUserMedia in the original tap call. Some mobile browsers reject
        // microphone prompts after an awaited permission query loses user activation.
        const supportMessage = getMediaSupportMessage();
        if (supportMessage) {
          if (statusEl) statusEl.textContent = supportMessage;
          showToast(supportMessage);
          return;
        }
        voiceRecording = true;
        voiceSeconds = 0;
        recordedAudioChunks = [];
        lastRecordedAudioDataUrl = null;
        voiceCaptureAvailable = false;
        playSFX('bell');

        if (btn) {
          btn.textContent = '⏹ 结束录音';
          btn.className = 'comic-btn bg-slate-900 text-amber-300 font-black text-xs py-1.5 px-3 rounded-xl';
        }
        if (statusEl) statusEl.textContent = '🎙️ 录音花正在倾听你的声音...';
        if (waveBox) waveBox.classList.add('voice-recording-active');

        // Try real MediaRecorder if available & permitted in browser
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
            const mimeCandidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
            const mimeType = mimeCandidates.find(type => MediaRecorder.isTypeSupported?.(type));
            mediaRecorderInstance = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            const outputType = mediaRecorderInstance.mimeType || mimeType || 'audio/webm';
            mediaRecorderInstance.ondataavailable = e => {
              if (e.data && e.data.size > 0) recordedAudioChunks.push(e.data);
            };
            mediaRecorderInstance.onstop = () => {
              stream.getTracks().forEach(t => t.stop());
              if (recordedAudioChunks.length > 0) {
                const blob = new Blob(recordedAudioChunks, { type: outputType });
                const reader = new FileReader();
                reader.onloadend = () => {
                  lastRecordedAudioDataUrl = reader.result;
                  resolveVoiceAudioReady?.();
                  resolveVoiceAudioReady = null;
                };
                reader.readAsDataURL(blob);
              } else {
                resolveVoiceAudioReady?.();
                resolveVoiceAudioReady = null;
              }
            };
            voiceAudioReady = new Promise(resolve => { resolveVoiceAudioReady = resolve; });
            mediaRecorderInstance.start();
            voiceCaptureAvailable = true;
            if (statusEl) statusEl.textContent = '麦克风已连接，正在录下此刻的声音。';
          } catch (err) {
            mediaRecorderInstance = null;
            voiceRecording = false;
            clearInterval(voiceTimerInterval);
            if (waveBox) waveBox.classList.remove('voice-recording-active');
            if (btn) {
              btn.textContent = '● 开始录语音';
              btn.className = 'comic-btn bg-[#E60012] text-white font-black text-xs py-1.5 px-3 rounded-xl';
            }
            const reason = err?.name === 'NotAllowedError'
              ? '麦克风权限被拒绝，请在浏览器网站设置中改为允许。'
              : err?.name === 'NotFoundError'
                ? '没有找到可用麦克风，请检查手机系统权限。'
                : '当前打开方式无法使用麦克风，请确认网页使用 HTTPS。';
            if (statusEl) statusEl.textContent = `${reason} 也可以封存文字胶囊。`;
            showToast(reason);
          }
        } else {
          voiceRecording = false;
          if (statusEl) statusEl.textContent = '此浏览器不支持录音；可写下碎念并封存为文字胶囊。';
          if (waveBox) waveBox.classList.remove('voice-recording-active');
          if (btn) {
            btn.textContent = '● 开始录语音';
            btn.className = 'comic-btn bg-[#E60012] text-white font-black text-xs py-1.5 px-3 rounded-xl';
          }
        }

        if (voiceRecording) {
          clearInterval(voiceTimerInterval);
          voiceTimerInterval = setInterval(() => {
            voiceSeconds++;
            const pad = n => String(n).padStart(2, '0');
            const tEl = document.getElementById('voice-record-timer');
            if (tEl) tEl.textContent = `${pad(Math.floor(voiceSeconds / 60))}:${pad(voiceSeconds % 60)}`;
          }, 1000);
        }
      } else {
        stopVoiceRecordingInternal();
        showToast(voiceCaptureAvailable
          ? `🎙️ 已录下 ${Math.max(1, voiceSeconds)} 秒语音，点击下方封存。`
          : '已准备好文字胶囊，可补充碎念后封存。');
      }
    }

    function stopVoiceRecordingInternal() {
      voiceRecording = false;
      clearInterval(voiceTimerInterval);
      if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
        try { mediaRecorderInstance.stop(); } catch (e) {}
      }
      const btn = document.getElementById('voice-record-btn');
      const statusEl = document.getElementById('voice-record-status');
      const waveBox = document.getElementById('voice-wave-box');
      if (btn) {
        btn.textContent = '● 开始录语音';
        btn.className = 'comic-btn bg-[#E60012] text-white font-black text-xs py-1.5 px-3 rounded-xl';
      }
      if (statusEl) statusEl.textContent = voiceCaptureAvailable
        ? `✓ 已录制 ${Math.max(1, voiceSeconds)} 秒 · 可补充文字后封存`
        : '文字胶囊已准备好，可补充碎念后封存。';
      if (waveBox) waveBox.classList.remove('voice-recording-active');
    }

    async function saveVoiceMemo() {
      if (voiceRecording) stopVoiceRecordingInternal();
      if (voiceCaptureAvailable) await voiceAudioReady;
      const textInput = document.getElementById('voice-memo-text');
      const ambientSelect = document.getElementById('voice-ambient-select');
      const noteText = (textInput?.value || '').trim() || '今天留下了一段温暖的语音碎碎念~';
      const durationSec = Math.max(3, voiceSeconds || 8);

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      if (!Array.isArray(state.voiceMemos)) state.voiceMemos = [];

      state.voiceMemos.unshift({
        id: Date.now(),
        dateKey: state.activeDate,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
        durationSec: voiceCaptureAvailable ? durationSec : 0,
        mode: voiceCaptureAvailable ? 'audio' : 'text',
        ambient: ambientSelect?.value || '🎵 八音盒轻吟',
        text: noteText,
        audioUrl: lastRecordedAudioDataUrl
      });

      if (textInput) textInput.value = '';
      voiceSeconds = 0;
      voiceCaptureAvailable = false;
      lastRecordedAudioDataUrl = null;
      const timerEl = document.getElementById('voice-record-timer');
      if (timerEl) timerEl.textContent = '00:00';

      state.coins += 15;
      playSFX('gadget');
      spawnFloatingParticles(['🎙️', '🎵', '🔔']);
      saveStorage(state);
      renderVoiceMemos();
      renderHUD();
      renderWeeklyBooklet();
      showToast('🎙️ 录音花已封存这段语音碎念胶囊！+15 🔔');
    }

    function playVoiceMemo(id) {
      const item = (state.voiceMemos || []).find(v => v.id === id);
      if (!item) return;
      playingVoiceId = id;
      renderVoiceMemos();

      if (item.audioUrl) {
        const audio = new Audio(item.audioUrl);
        audio.onended = () => {
          playingVoiceId = null;
          renderVoiceMemos();
        };
        audio.play().catch(() => {});
      } else {
        // Play gentle synthesized voice capsule chime + speech synthesis if supported
        playSFX('bell');
        setTimeout(() => playSFX('coin'), 280);
        if ('speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(item.text);
            utter.lang = 'zh-CN';
            utter.rate = 1.0;
            utter.onend = () => {
              playingVoiceId = null;
              renderVoiceMemos();
            };
            window.speechSynthesis.speak(utter);
          } catch (e) {}
        }
        setTimeout(() => {
          playingVoiceId = null;
          renderVoiceMemos();
        }, 2800);
      }
      showToast(`🎧 正在播放语音碎念 (${item.ambient})：“${item.text.slice(0, 18)}...”`);
    }

    function deleteVoiceMemo(id) {
      playSFX('click');
      state.voiceMemos = (state.voiceMemos || []).filter(v => v.id !== id);
      saveStorage(state);
      renderVoiceMemos();
      renderWeeklyBooklet();
    }

    function renderVoiceMemos() {
      const listEl = document.getElementById('voice-memo-list');
      const badgeEl = document.getElementById('voice-count-badge');
      const memos = (state.voiceMemos || []).filter(m => m.dateKey === state.activeDate);
      if (badgeEl) badgeEl.textContent = `${memos.length} 条语音`;
      if (!listEl) return;

      if (memos.length === 0) {
        listEl.innerHTML = `<div class="text-xs text-slate-400 text-center py-3">还没有语音碎念，点击上方「开始录语音」留下第一段声音吧~</div>`;
        return;
      }

      listEl.innerHTML = memos.map(m => {
        const isPlaying = playingVoiceId === m.id;
        return `
          <div class="comic-card-sm p-2.5 bg-white flex items-center justify-between gap-2">
            <button type="button" onclick="playVoiceMemo(${m.id})" class="flex items-center gap-2.5 flex-1 text-left min-w-0">
              <span class="w-9 h-9 rounded-xl border border-slate-900 flex items-center justify-center shrink-0 font-black text-xs ${isPlaying ? 'bg-[#E60012] text-white animate-ping' : 'bg-emerald-100 text-emerald-900'}">
                ${isPlaying ? '🔊' : '▶'}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span class="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-slate-800">${escapeHtml(m.ambient)}</span>
                  <span class="font-mono-num">${m.mode === 'text' || !m.durationSec ? '文字' : `${m.durationSec}\"`}</span>
                  <span>•</span>
                  <span class="font-mono-num">${m.dateKey} ${m.time}</span>
                </div>
                <p class="text-xs font-bold text-slate-800 truncate mt-0.5">${escapeHtml(m.text)}</p>
              </div>
            </button>
            <button type="button" onclick="deleteVoiceMemo(${m.id})" aria-label="删除语音" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 text-xs font-bold shrink-0">✕</button>
          </div>
        `;
      }).join('');
    }

    // ====================================================
    // 15F. FUTURE TIME CAPSULE MAILBOX (未来邮筒)
    // ====================================================
    function setFuturePresetDays(days) {
      playSFX('click');
      const d = new Date();
      d.setDate(d.getDate() + days);
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const inputEl = document.getElementById('future-unlock-date');
      if (inputEl) inputEl.value = dateStr;
      showToast(`📮 已设定信件开启日期为 ${days} 天后 (${dateStr})`);
    }

    function sendFutureLetter() {
      const unlockEl = document.getElementById('future-unlock-date');
      const sealEl = document.getElementById('future-wax-seal');
      const titleEl = document.getElementById('future-letter-title');
      const contentEl = document.getElementById('future-letter-content');

      const content = (contentEl?.value || '').trim();
      if (!content) {
        showToast('📮 请先写下想寄给未来自己的信件内容哦~');
        return;
      }
      const unlockDate = unlockEl?.value || getTodayKey();
      if (unlockDate <= getTodayKey()) {
        showToast('开启日期要晚于今天，才能投递进未来邮筒。');
        return;
      }
      const title = (titleEl?.value || '').trim() || `寄往 ${unlockDate} 的时光信`;
      const seal = sealEl?.value || '🔔 金铃铛火漆';

      if (!Array.isArray(state.futureLetters)) state.futureLetters = [];
      state.futureLetters.unshift({
        id: Date.now(),
        createdDate: state.activeDate,
        unlockDate,
        seal,
        title,
        content,
        opened: false
      });

      if (titleEl) titleEl.value = '';
      if (contentEl) contentEl.value = '';
      state.coins += 25;
      playSFX('gadget');
      spawnFloatingParticles(['📮', '💌', '🔔', '✨']);
      saveStorage(state);
      renderFutureMailbox();
      renderHUD();
      showToast(`📮 信件已盖上【${seal}】投递进未来邮筒！奖励 +25 🔔`);
    }

    function openFutureLetterModal(id) {
      playSFX('gadget');
      const letter = (state.futureLetters || []).find(l => l.id === id);
      if (!letter) return;
      if (letter.unlockDate > getTodayKey()) {
        showToast(`这封信要到 ${letter.unlockDate} 才能拆封。`);
        return;
      }
      letter.opened = true;
      saveStorage(state);
      renderFutureMailbox();

      const body = document.getElementById('letter-modal-body');
      if (body) {
        body.innerHTML = `
          <div class="text-center mb-3">
            <span class="inline-block text-xs font-black bg-[#E60012] text-white px-3 py-1 rounded-full border-2 border-slate-900">${escapeHtml(letter.seal)} · 时光慢递信笺</span>
            <h3 class="font-title text-xl text-slate-900 mt-2">${escapeHtml(letter.title)}</h3>
            <p class="text-[11px] font-mono-num text-slate-500 mt-0.5">寄出日：${letter.createdDate}  →  开启日：${letter.unlockDate}</p>
          </div>
          <div class="comic-card-sm p-4 bg-white/95 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mb-4">
            ${escapeHtml(letter.content)}
          </div>
          <button type="button" onclick="closeLetterModal()" class="comic-btn w-full bg-[#0096E6] text-white font-black py-2.5 rounded-xl text-xs">
            💌 珍藏回四次元信箱
          </button>
        `;
      }
      const modal = document.getElementById('letter-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function closeLetterModal() {
      const modal = document.getElementById('letter-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function deleteFutureLetter(id) {
      playSFX('click');
      state.futureLetters = (state.futureLetters || []).filter(l => l.id !== id);
      saveStorage(state);
      renderFutureMailbox();
    }

    function renderFutureMailbox() {
      const unlockEl = document.getElementById('future-unlock-date');
      if (unlockEl) unlockEl.min = getTodayKey();
      if (unlockEl && !unlockEl.value) {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        const pad = n => String(n).padStart(2, '0');
        unlockEl.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      }

      const letters = state.futureLetters || [];
      const badgeEl = document.getElementById('mailbox-count-badge');
      if (badgeEl) badgeEl.textContent = `💌 邮筒信件 ${letters.length} 封`;

      const listEl = document.getElementById('future-letters-list');
      if (!listEl) return;

      if (letters.length === 0) {
        listEl.innerHTML = `<div class="text-xs text-slate-400 text-center py-4">邮筒里还没有信件，给7天后的自己写封信吧~</div>`;
        return;
      }

      const tKey = getTodayKey();
      listEl.innerHTML = letters.map(l => {
        const isUnlocked = l.unlockDate <= tKey;
        return `
          <div class="comic-card-sm p-3 ${isUnlocked ? 'bg-amber-50' : 'bg-white'} flex items-center justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-900 ${isUnlocked ? 'bg-emerald-100 text-emerald-900' : 'bg-sky-100 text-sky-900'}">
                  ${isUnlocked ? '✨ 已送达可拆封' : `🛸 派送中 · ${l.unlockDate}开启`}
                </span>
                <span class="text-[10px] font-bold text-rose-700">${escapeHtml(l.seal)}</span>
              </div>
              <h4 class="text-xs sm:text-sm font-black text-slate-900 truncate mt-1">${escapeHtml(l.title)}</h4>
              <p class="text-[11px] text-slate-500 truncate">${isUnlocked || l.opened ? escapeHtml(l.content) : '🔒 信件正在穿越时空隧道...'}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button type="button" onclick="openFutureLetterModal(${l.id})" ${isUnlocked ? '' : 'disabled'} class="comic-btn ${isUnlocked ? 'bg-[#FFD700] text-slate-900' : 'bg-sky-100 text-slate-500 opacity-70 cursor-not-allowed'} font-black text-xs px-2.5 py-1.5 rounded-xl min-h-[40px]">
                ${isUnlocked ? '💌 拆封' : '🔒 尚未送达'}
              </button>
              <button type="button" onclick="deleteFutureLetter(${l.id})" class="text-slate-400 hover:text-rose-600 text-xs font-bold px-1">✕</button>
            </div>
          </div>
        `;
      }).join('');
    }

    // ====================================================
    // 15G. WEEKLY MEMORY BOOKLET (每周回忆小册 & 完成一周记录生成回忆页)
    // ====================================================
    function getWeekDatesForActiveDate() {
      const [y, m, d] = state.activeDate.split('-').map(Number);
      const cur = new Date(y, m - 1, d);
      const offset = (cur.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(y, m - 1, d - offset);
      const pad = n => String(n).padStart(2, '0');
      const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      return Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(monday);
        dt.setDate(monday.getDate() + i);
        const key = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        return { key, weekday: labels[i], shortDate: `${pad(dt.getMonth() + 1)}.${pad(dt.getDate())}` };
      });
    }

    function isDayRecordedForBooklet(dateKey) {
      const rec = state.days[dateKey];
      if (!rec) return false;
      const hasPhoto = Array.isArray(rec.photos) && rec.photos.length > 0;
      const hasQuote = Boolean(rec.dailyQuote);
      const hasExpense = Array.isArray(rec.expenses) && rec.expenses.length > 0;
      const hasDiary = state.diaries.some(d => (d.dateKey || d.date.slice(0, 10)) === dateKey);
      const hasActivity = Array.isArray(rec.activities) && rec.activities.length > 0;
      const hasTodo = Array.isArray(rec.todos) && rec.todos.length > 0;
      const hasSleep = Number(rec.sleepHours) > 0;
      const hasMoodOrWeather = Boolean(rec.moodId || rec.weather);
      const hasVoice = (state.voiceMemos || []).some(item => item.dateKey === dateKey);
      return hasPhoto || hasQuote || hasExpense || hasDiary || rec.weightKg != null || hasActivity || hasTodo || hasSleep || hasMoodOrWeather || hasVoice;
    }

    function refreshWeeklyMemory() {
      currentBookletPage = 1;
      renderWeeklyBooklet();
      const count = getWeekDatesForActiveDate().filter(day => isDayRecordedForBooklet(day.key)).length;
      showToast(count === 7 ? '本周 7 天记录已汇入回忆页。' : `已汇入本周现有记录：${count}/7 天，新增记录后会自动更新。`);
    }

    function seedWeeklyDemo() {
      playSFX('gadget');
      const weekDays = getWeekDatesForActiveDate();
      const sampleQuotes = [
        { mood: 'focused', weather: 'partly', w: 59.0, scene: 'closet', cap: '周一用记忆吐司开启元气计划 🍞', quote: '把复杂的任务拆成三件小事，全部打勾超有成就感！' },
        { mood: 'calm', weather: 'lightrain', w: 58.7, scene: 'dorayaki', cap: '周二雨天里的热牛奶与铜锣烧 🌧️', quote: '窗外下着淅淅沥沥的小雨，泡了一杯热牛奶，世界很安静。' },
        { mood: 'energetic', weather: 'rainbow', w: 58.5, scene: 'rainbow', cap: '周三雨后偶遇双层彩虹 🌈', quote: '雨停之后推开窗看到了双层彩虹！赶紧用拍立得定格下来。' },
        { mood: 'happy', weather: 'sunny', w: 58.2, scene: 'sakura', cap: '周四微风晴朗的放学路 🌸', quote: '吹到了很舒服的微风，一步一个脚印把日常装进口袋。' },
        { mood: 'warm', weather: 'sunny', w: 58.1, scene: 'sunset', cap: '周五后山橘子汽水色的夕阳 🌅', quote: '和好朋友分享了刚出炉的铜锣烧，笑声飘得很远。' },
        { mood: 'energetic', weather: 'breezy', w: 57.9, scene: 'sakura', cap: '周六推开任意门去公园散心 🚪', quote: '阳光晒在肩膀上暖洋洋的，在草地上躺着看了好久的云。' },
        { mood: 'happy', weather: 'sunny', w: 57.8, scene: 'dorayaki', cap: '周日整理一周回忆小册 📖', quote: '翻看这一周留下的照片和短句，原来平凡日子也闪闪发光。' }
      ];

      weekDays.forEach((wd, idx) => {
        const rec = getDayRecord(wd.key);
        const sample = sampleQuotes[idx % sampleQuotes.length];
        rec.moodId = rec.moodId || sample.mood;
        rec.weather = rec.weather || sample.weather;
        if (rec.weightKg == null) rec.weightKg = sample.w;
        if (!rec.dailyQuote) rec.dailyQuote = sample.quote;
        if (!Array.isArray(rec.photos) || rec.photos.length === 0) {
          rec.photos = [{
            id: Date.now() + idx,
            dateKey: wd.key,
            scene: sample.scene,
            frameStyle: 'classic',
            caption: sample.cap,
            stickers: ['🚁', '✨', '🥞']
          }];
        }
      });

      state.coins += 30;
      spawnFloatingParticles(['📖', '🎉', '🥞', '🔔', '✨']);
      saveStorage(state);
      renderAll();
      showToast('🎉 已集齐本周 7/7 天完整手账记录！自动生成《每周回忆页》画报 (+30 🔔)');
    }

    function setBookletPage(pageNum) {
      playSFX('click');
      currentBookletPage = pageNum;
      renderWeeklyBooklet();
    }

    function flipBookletPage(delta) {
      playSFX('click');
      currentBookletPage = ((currentBookletPage - 1 + delta + 4) % 4) + 1;
      renderWeeklyBooklet();
    }

    function changeBookletTheme(theme) {
      playSFX('click');
      currentBookletTheme = theme;
      renderWeeklyBooklet();
    }

    function renderWeeklyBooklet() {
      const weekDays = getWeekDatesForActiveDate();
      const recordedList = weekDays.filter(wd => isDayRecordedForBooklet(wd.key));
      const count = recordedList.length;

      const rangeEl = document.getElementById('weekly-booklet-range-label');
      if (rangeEl) rangeEl.textContent = `🗓️ 本周时光集章卡 (${weekDays[0].shortDate} - ${weekDays[6].shortDate})`;

      const badgeEl = document.getElementById('weekly-stamp-progress-badge');
      if (badgeEl) {
        badgeEl.textContent = count >= 7 ? '🎉 本周7天全勤达成！已解锁完整回忆册' : `已点亮 ${count} / 7 天`;
        badgeEl.className = `text-xs font-black px-2.5 py-0.5 rounded-full border border-slate-900 ${count >= 7 ? 'bg-emerald-200 text-emerald-900' : 'bg-[#FFD700] text-slate-900'}`;
      }

      const stampsEl = document.getElementById('weekly-7day-stamps');
      if (stampsEl) {
        stampsEl.innerHTML = weekDays.map(wd => {
          const rec = state.days[wd.key];
          const done = isDayRecordedForBooklet(wd.key);
          const moodObj = rec ? MOOD_OPTIONS.find(m => m.id === rec.moodId) : null;
          const weatherObj = rec ? WEATHER_OPTIONS.find(w => w.id === rec.weather) : null;
          const isCur = wd.key === state.activeDate;
          return `
            <button type="button" onclick="switchActiveDate('${wd.key}')" class="p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition ${isCur ? 'bg-[#FFF3B0] border-slate-900 ring-2 ring-[#0096E6]' : done ? 'bg-white border-slate-900' : 'bg-white/60 border-dashed border-slate-300 opacity-65'}">
              <span class="text-[10px] font-black text-slate-600">${wd.weekday}</span>
              <span class="text-base leading-none my-1">${done ? `${moodObj?.icon || '😊'}${weatherObj?.icon || '☀️'}` : '⚪'}</span>
              <span class="font-mono-num text-[9px] font-bold text-slate-500">${wd.shortDate}</span>
            </button>
          `;
        }).join('');
      }

      [1, 2, 3, 4].forEach(p => {
        const tabBtn = document.getElementById(`zine-tab-${p}`);
        if (tabBtn) {
          tabBtn.className = p === currentBookletPage
            ? 'comic-btn px-3 py-1.5 rounded-xl text-xs font-black bg-[#0096E6] text-white'
            : 'comic-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700';
        }
      });

      const pageInd = document.getElementById('booklet-page-indicator');
      if (pageInd) pageInd.textContent = `${currentBookletPage}/4`;

      const stage = document.getElementById('weekly-booklet-stage');
      if (!stage) return;

      // Apply theme background class
      stage.className = `comic-card-sm p-4 transition-all duration-300 ${
        currentBookletTheme === 'film' ? 'paper-starry-kraft' : currentBookletTheme === 'sakura' ? 'paper-sakura-dots' : 'paper-sunny-lined'
      }`;

      // Gather week's photos, quotes, weights
      const weekPhotos = [];
      const weekQuotes = [];
      const weekWeights = [];
      let totalSleep = 0, sleepDays = 0, totalSpend = 0;

      weekDays.forEach(wd => {
        const rec = state.days[wd.key];
        if (!rec) return;
        const moodObj = MOOD_OPTIONS.find(m => m.id === rec.moodId) || MOOD_OPTIONS[0];
        const weatherObj = WEATHER_OPTIONS.find(w => w.id === rec.weather) || WEATHER_OPTIONS[0];
        if (Array.isArray(rec.photos)) {
          rec.photos.forEach(p => weekPhotos.push(Object.assign({}, p, { dateKey: wd.key, weekday: wd.weekday, moodIcon: moodObj.icon, weatherIcon: weatherObj.icon })));
        }
        if (rec.dailyQuote) {
          weekQuotes.push({ dateKey: wd.key, weekday: wd.weekday, quote: rec.dailyQuote, moodIcon: moodObj.icon, weatherIcon: weatherObj.icon, temp: rec.temp ?? 22 });
        }
        if (rec.weightKg != null) {
          weekWeights.push({ dateKey: wd.key, weekday: wd.weekday, w: Number(rec.weightKg) });
        }
        if (rec.sleepHours) {
          totalSleep += Number(rec.sleepHours);
          sleepDays++;
        }
        if (Array.isArray(rec.expenses)) {
          totalSpend += rec.expenses.filter(e => e.kind !== 'income').reduce((s, e) => s + (Number(e.amount) || 0), 0);
        }
      });

      if (currentBookletPage === 1) {
        stage.innerHTML = `
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b-2 border-dashed border-slate-300">
            <div>
              <span class="bg-[#E60012] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-900">WEEKLY MEMORY ZINE · 第 1 页</span>
              <h3 class="font-title text-xl text-slate-900 mt-1">《${getUserName()}的四次元每周回忆录》</h3>
              <p class="text-xs text-slate-600 font-bold">📅 记录周期：${weekDays[0].key} 至 ${weekDays[6].key} · 共点亮 ${count}/7 天</p>
            </div>
            <div class="comic-card-sm px-3 py-2 bg-white text-center shrink-0">
              <div class="text-lg">💮</div>
              <div class="text-[10px] font-black text-[#0096E6]">22世纪时光局认证</div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            <div class="comic-card-sm p-2.5 bg-white text-center">
              <div class="text-[10px] text-slate-500 font-bold">📸 本周定格照片</div>
              <div class="font-mono-num text-lg font-black text-[#0096E6]">${weekPhotos.length} 张</div>
            </div>
            <div class="comic-card-sm p-2.5 bg-white text-center">
              <div class="text-[10px] text-slate-500 font-bold">💡 留住瞬间短句</div>
              <div class="font-mono-num text-lg font-black text-amber-600">${weekQuotes.length} 句</div>
            </div>
            <div class="comic-card-sm p-2.5 bg-white text-center">
              <div class="text-[10px] text-slate-500 font-bold">🌙 平均睡眠时长</div>
              <div class="font-mono-num text-lg font-black text-indigo-600">${sleepDays ? (totalSleep / sleepDays).toFixed(1) : '8.0'} h</div>
            </div>
            <div class="comic-card-sm p-2.5 bg-white text-center">
              <div class="text-[10px] text-slate-500 font-bold">⚖️ 最新体重记录</div>
              <div class="font-mono-num text-lg font-black text-emerald-700">${weekWeights.length ? `${weekWeights[weekWeights.length - 1].w.toFixed(1)} kg` : '未记'}</div>
            </div>
          </div>

          <div class="bg-white/90 rounded-2xl p-3 border-2 border-slate-900">
            <div class="text-xs font-black text-slate-800 mb-1">🔔 哆啦A梦的本周扉页寄语：</div>
            <p class="text-xs text-slate-700 leading-relaxed">
              “${getUserName()}，这一周我们一起走过了 ${count} 个认真记录的日子，留下了 ${weekPhotos.length} 张拍立得拼贴和 ${weekQuotes.length} 句温暖瞬间。点击上方【2. 拍立得照片回忆页】或右侧翻页按钮，看看属于你的图文回忆页吧！”
            </p>
          </div>
        `;
      } else if (currentBookletPage === 2) {
        stage.innerHTML = `
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="bg-[#0096E6] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-900">PHOTO SCRAPBOOK · 第 2 页</span>
              <h3 class="font-title text-lg text-slate-900 mt-1">📸 本周拍立得照片 & 贴纸回忆画报</h3>
            </div>
            <span class="text-xs font-bold text-slate-500">共 ${weekPhotos.length} 张拍立得</span>
          </div>
          ${weekPhotos.length === 0 ? `
            <div class="text-center py-6 text-xs text-slate-500">本周还没有保存拍立得照片，去上方拼贴工坊保存一张或点击「一键集齐本周7天回忆」吧！</div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${weekPhotos.slice(0, 6).map(p => {
                const sceneSvg = COLLAGE_SCENES[p.scene]?.svg || COLLAGE_SCENES.sunset.svg;
                return `
                  <div class="comic-card-sm p-2.5 bg-white flex flex-col justify-between">
                    <div class="relative h-28 rounded-xl overflow-hidden border border-slate-900 mb-2">
                      ${p.customImageData ? `<img src="${p.customImageData}" alt="回忆照" class="w-full h-full object-cover" />` : sceneSvg}
                      <div class="absolute top-1.5 left-1.5 bg-slate-900/70 text-amber-200 text-[9px] font-mono-num font-bold px-1.5 py-0.5 rounded-full">
                        ${p.dateKey.slice(5)} ${p.weekday} ${p.moodIcon || ''}${p.weatherIcon || ''}
                      </div>
                      <div class="absolute bottom-1 right-1.5 text-base drop-shadow">
                        ${(p.stickers || ['✨']).join(' ')}
                      </div>
                    </div>
                    <p class="font-title text-xs text-center text-slate-900 truncate">“${escapeHtml(p.caption)}”</p>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        `;
      } else if (currentBookletPage === 3) {
        const weekVoices = (state.voiceMemos || []).slice(0, 3);
        stage.innerHTML = `
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-900">MOMENTS & QUOTES · 第 3 页</span>
              <h3 class="font-title text-lg text-slate-900 mt-1">💡 本周留住的瞬间短句 & 语音碎念墙</h3>
            </div>
            <span class="text-xs font-bold text-slate-500">${weekQuotes.length} 条瞬间</span>
          </div>
          <div class="space-y-2 mb-3">
            ${weekQuotes.map(q => `
              <div class="comic-card-sm p-2.5 bg-white flex items-start gap-2.5">
                <span class="px-2 py-1 rounded-lg bg-amber-100 border border-slate-900 font-mono-num text-[10px] font-black text-amber-900 shrink-0">
                  ${q.dateKey.slice(5)} ${q.weekday} ${q.moodIcon}${q.weatherIcon}
                </span>
                <p class="text-xs sm:text-sm font-bold text-slate-800 leading-snug">“${escapeHtml(q.quote)}”</p>
              </div>
            `).join('')}
          </div>
          ${weekVoices.length ? `
            <div class="pt-2 border-t border-dashed border-slate-300">
              <div class="text-xs font-black text-slate-700 mb-1.5">🎙️ 本周有声碎念摘录：</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${weekVoices.map(v => `
                  <button type="button" onclick="playVoiceMemo(${v.id})" class="comic-card-sm p-2 bg-emerald-50 text-left flex items-center gap-2">
                    <span class="text-base">🔊</span>
                    <div class="min-w-0">
                      <div class="text-[10px] font-bold text-emerald-900">${escapeHtml(v.ambient)} · ${v.durationSec}"</div>
                      <div class="text-xs font-bold text-slate-800 truncate">${escapeHtml(v.text)}</div>
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        `;
      } else {
        const hCm = state.profile?.heightCm || 168;
        const firstW = weekWeights.length ? weekWeights[0].w : 58.5;
        const lastW = weekWeights.length ? weekWeights[weekWeights.length - 1].w : 58.2;
        const wDelta = lastW - firstW;
        const bmi = lastW / ((hCm / 100) * (hCm / 100));
        stage.innerHTML = `
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-900">HEALTH & SUMMARY · 第 4 页</span>
              <h3 class="font-title text-lg text-slate-900 mt-1">⚖️ 本周体重 BMI 变化 & 守护总结</h3>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
            <div class="comic-card-sm p-3 bg-white">
              <div class="text-[11px] text-slate-500 font-bold">⚖️ 本周体重轨迹</div>
              <div class="font-mono-num text-base font-black text-slate-900 mt-1">${firstW.toFixed(1)}kg → ${lastW.toFixed(1)}kg</div>
              <div class="text-[11px] font-bold ${wDelta <= 0 ? 'text-emerald-700' : 'text-amber-700'}">周变化 ${wDelta > 0 ? '+' : ''}${wDelta.toFixed(1)} kg</div>
            </div>
            <div class="comic-card-sm p-3 bg-white">
              <div class="text-[11px] text-slate-500 font-bold">🔦 最新 BMI 指数</div>
              <div class="font-mono-num text-base font-black text-[#0096E6] mt-1">BMI ${bmi.toFixed(1)}</div>
              <div class="text-[11px] font-bold text-emerald-700">${getBmiEvaluation(bmi).label}</div>
            </div>
            <div class="comic-card-sm p-3 bg-white">
              <div class="text-[11px] text-slate-500 font-bold">💰 本周累计消费</div>
              <div class="font-mono-num text-base font-black text-[#E60012] mt-1">¥${totalSpend.toFixed(2)}</div>
              <div class="text-[11px] font-bold text-slate-500">理性消费 · 快乐攒铃铛</div>
            </div>
          </div>
          <div class="comic-card-sm p-3 bg-amber-50 flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-bold text-amber-900">🎁 点击右侧按钮可将本周的照片、短句、印章与日期导出为一张完整《每周回忆手账长图》！</span>
            <button type="button" onclick="downloadWeeklyMemoryZinePng()" class="comic-btn bg-[#FFD700] text-slate-900 font-black text-xs px-3.5 py-2 rounded-xl">
              🖼️ 立即下载回忆页海报
            </button>
          </div>
        `;
      }
    }

    function downloadWeeklyMemoryZinePng() {
      playSFX('gadget');
      const weekDays = getWeekDatesForActiveDate();
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#E6F6FF';
      ctx.fillRect(0, 0, 1080, 1480);
      ctx.fillStyle = '#FFFDF7';
      ctx.fillRect(44, 44, 992, 1392);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 6;
      ctx.strokeRect(44, 44, 992, 1392);

      // Header Banner
      ctx.fillStyle = '#0096E6';
      ctx.fillRect(44, 44, 992, 190);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(`📖 ${getUserName()}的每周回忆手账页`, 84, 125);
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#FEF08A';
      ctx.fillText(`时光坐标：${weekDays[0].key} 至 ${weekDays[6].key} · 四次元口袋纪念刊`, 84, 182);

      // 7 Days Rows with Date, Mood/Weather Stamp, Photo Caption, Daily Quote
      let y = 285;
      weekDays.forEach(wd => {
        const rec = state.days[wd.key] || {};
        const moodObj = MOOD_OPTIONS.find(m => m.id === rec.moodId) || MOOD_OPTIONS[0];
        const weatherObj = WEATHER_OPTIONS.find(w => w.id === rec.weather) || WEATHER_OPTIONS[0];
        const quote = rec.dailyQuote || '认真生活、收集快乐的一天 ✨';
        const photoCap = (rec.photos && rec.photos[0]?.caption) ? `📸 ${rec.photos[0].caption}` : '📸 四次元拍立得定格';

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(80, y, 920, 142);
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 3;
        ctx.strokeRect(80, y, 920, 142);

        ctx.fillStyle = '#0096E6';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`${wd.key} (${wd.weekday})  ${moodObj.icon}${moodObj.label} · ${weatherObj.icon}${weatherObj.label}`, 106, y + 42);

        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 21px sans-serif';
        ctx.fillText(`${photoCap}${rec.weightKg ? `  |  ⚖️ ${Number(rec.weightKg).toFixed(1)}kg` : ''}`, 106, y + 80);

        ctx.fillStyle = '#334155';
        ctx.font = '22px sans-serif';
        ctx.fillText(`“${quote.slice(0, 38)}”`, 106, y + 118);
        y += 160;
      });

      saveCanvasPng(canvas, `weekly_memory_${weekDays[0].key}.png`, '🖼️ 《每周回忆手账页》高清海报已导出！');
    }

    function renderThemeQuestProgress() {
      const dayRec = getDayRecord(state.activeDate);
      let done = 0;
      if (dayRec.dailyQuote) done++;
      if (Array.isArray(dayRec.photos) && dayRec.photos.length > 0) done++;
      if (dayRec.weightKg != null) done++;
      if ((state.voiceMemos || []).some(v => v.dateKey === state.activeDate)) done++;

      const progEl = document.getElementById('theme-quest-progress');
      if (progEl) {
        progEl.textContent = done >= 4 ? '🎉 今日主题已圆满达成 (4/4)' : `进度 ${done}/4`;
      }
    }


    // ====================================================
    // 16. OFFLINE-FIRST UX UPGRADES: NIGHT MODE, 1-TAP PRESETS,
    //     DATE STEPPER, ACHIEVEMENT BADGES & APP ICON STUDIO
    // ====================================================
    let currentIconTheme = 'mint';

    const ICON_THEMES = {
      mint: {
        name: '🩵 晴空薄荷蓝',
        bgGradStart: '#7DD3FC',
        bgGradEnd: '#CCFBF1',
        coverTop: '#38BDF8',
        coverBody: '#FFFDF7',
        collar: '#FB7185',
        bell: '#FDE047',
        door: '#F472B6',
        motif: 'door'
      },
      sakura: {
        name: '🌸 樱花蜜桃粉',
        bgGradStart: '#FBCFE8',
        bgGradEnd: '#FEF3C7',
        coverTop: '#F472B6',
        coverBody: '#FFFDF7',
        collar: '#FB7185',
        bell: '#FDE047',
        door: '#38BDF8',
        motif: 'sakura'
      },
      cream: {
        name: '🍯 奶油铜锣烧',
        bgGradStart: '#FDE68A',
        bgGradEnd: '#E0F2FE',
        coverTop: '#F59E0B',
        coverBody: '#FFFDF7',
        collar: '#E60012',
        bell: '#FFD700',
        door: '#FB7185',
        motif: 'dorayaki'
      },
      galaxy: {
        name: '🌌 星夜时光机',
        bgGradStart: '#312E81',
        bgGradEnd: '#0EA5E9',
        coverTop: '#4F46E5',
        coverBody: '#F8FAFC',
        collar: '#E60012',
        bell: '#FDE047',
        door: '#A855F7',
        motif: 'galaxy'
      },
      hopter: {
        name: '🚁 蓝天竹蜻蜓',
        bgGradStart: '#38BDF8',
        bgGradEnd: '#FEF08A',
        coverTop: '#0284C7',
        coverBody: '#FFFDF7',
        collar: '#E60012',
        bell: '#FFD700',
        door: '#F59E0B',
        motif: 'hopter'
      },
      toast: {
        name: '🍞 满分记忆吐司',
        bgGradStart: '#FDBA74',
        bgGradEnd: '#FEF3C7',
        coverTop: '#D97706',
        coverBody: '#FFFBEB',
        collar: '#E60012',
        bell: '#FDE047',
        door: '#10B981',
        motif: 'toast'
      },
      dorami: {
        name: '🎀 哆啦美郁金香',
        bgGradStart: '#FEF08A',
        bgGradEnd: '#FCE7F3',
        coverTop: '#FACC15',
        coverBody: '#FFFDF7',
        collar: '#0EA5E9',
        bell: '#FB7185',
        door: '#F43F5E',
        motif: 'dorami'
      },
      forest: {
        name: '🌲 后山翡翠森林',
        bgGradStart: '#6EE7B7',
        bgGradEnd: '#E0F2FE',
        coverTop: '#10B981',
        coverBody: '#FFFDF7',
        collar: '#F59E0B',
        bell: '#FDE047',
        door: '#059669',
        motif: 'forest'
      }
    };

    function triggerHaptic(ms = 10) {
      try {
        if (navigator.vibrate) navigator.vibrate(ms);
      } catch (e) {}
    }

    function toggleCozyNightMode() {
      playSFX('click');
      triggerHaptic(12);
      state.nightMode = !state.nightMode;
      saveStorage(state);
      applyCozyNightModeUI();
      showToast(state.nightMode ? '🌙 已开启【星夜壁橱】护眼夜读模式' : '☀️ 已切回【晴空暖阳】日间手账模式');
    }

    function applyCozyNightModeUI() {
      const isNight = Boolean(state.nightMode);
      document.body.classList.toggle('cozy-night-mode', isNight);
      const iconEl = document.getElementById('night-mode-icon');
      const labelEl = document.getElementById('night-mode-label');
      if (iconEl) iconEl.textContent = isNight ? '☀️' : '🌙';
      if (labelEl) labelEl.textContent = isNight ? '日间' : '夜读';
    }

    function stepActiveDate(deltaDays) {
      triggerHaptic(10);
      const [y, m, d] = state.activeDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() + deltaDays);
      const pad = n => String(n).padStart(2, '0');
      const nextKey = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
      switchActiveDate(nextKey);
    }

    function quickAddExpensePreset(category, title, amount) {
      triggerHaptic(12);
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dayRec = getDayRecord(state.activeDate);
      if (!dayRec.expenses) dayRec.expenses = [];
      dayRec.expenses.unshift({
        id: Date.now(),
        category,
        kind: 'expense',
        title,
        amount: Number(amount),
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
      });
      state.coins += 5;
      playSFX('coin');
      saveStorage(state);
      renderExpenses();
      renderHUD();
      renderStats();
      renderCalendar();
      renderAchievements();
      showToast(`⚡ 已极速记账：${title} -¥${Number(amount).toFixed(2)} (+5 🔔)`);
    }

    function quickAddTodoPreset(category, text) {
      triggerHaptic(12);
      state.todos.unshift({
        id: Date.now(),
        date: state.activeDate,
        text,
        category,
        done: false
      });
      playSFX('bell');
      saveStorage(state);
      renderTodos();
      renderStats();
      renderAchievements();
      showToast(`⚡ 已添加常用待办：「${text}」`);
    }

    function renderAchievements() {
      const gridEl = document.getElementById('achievement-badges-grid');
      const pillEl = document.getElementById('achievement-progress-pill');
      if (!gridEl) return;

      const recordedDaysCount = Object.keys(state.days || {}).length;
      const weightDaysCount = Object.values(state.days || {}).filter(d => d && d.weightKg != null).length;
      const totalPhotosCount = Object.values(state.days || {}).reduce((acc, d) => acc + ((d && d.photos) ? d.photos.length : 0), 0);
      const totalVoicesCount = (state.voiceMemos || []).length;
      const totalLettersCount = (state.futureLetters || []).length;
      const doneTodosCount = (state.todos || []).filter(t => t.done).length;

      const badges = [
        { id: 'streak', icon: '🔥', title: '时光记录家', desc: `累计记录 ${recordedDaysCount} 天日常`, unlocked: recordedDaysCount >= 3 },
        { id: 'bmi', icon: '⚖️', title: '健康管理师', desc: `累计打卡 ${weightDaysCount} 次体重BMI`, unlocked: weightDaysCount >= 2 },
        { id: 'photo', icon: '📸', title: '拍立得达人', desc: `定格 ${totalPhotosCount} 张贴纸相片`, unlocked: totalPhotosCount >= 2 },
        { id: 'voice', icon: '🎙️', title: '声音收集者', desc: `收录 ${totalVoicesCount} 条录音花胶囊`, unlocked: totalVoicesCount >= 1 },
        { id: 'letter', icon: '📮', title: '时光慢递员', desc: `投递 ${totalLettersCount} 封未来信件`, unlocked: totalLettersCount >= 1 },
        { id: 'todo', icon: '🏆', title: '行动派超人', desc: `完成 ${doneTodosCount} 项待办目标`, unlocked: doneTodosCount >= 2 }
      ];

      const unlockedCount = badges.filter(b => b.unlocked).length;
      if (pillEl) pillEl.textContent = `已点亮 ${unlockedCount}/${badges.length}`;

      gridEl.innerHTML = badges.map(b => `
        <div class="comic-card-sm p-2.5 flex items-center gap-2.5 ${b.unlocked ? 'bg-amber-50/80' : 'bg-slate-100 opacity-60'}">
          <div class="w-10 h-10 rounded-xl border-2 border-slate-900 flex items-center justify-center text-xl shrink-0 ${b.unlocked ? 'bg-[#FFD700]' : 'bg-white'}">
            ${b.icon}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-black text-slate-900 truncate">${b.title}</div>
            <div class="text-[10px] font-bold text-slate-500 truncate">${b.desc}</div>
          </div>
        </div>
      `).join('');
    }

    function getAppIconSvgMarkup(themeKey = 'mint', uidSuffix = '') {
      const t = ICON_THEMES[themeKey] || ICON_THEMES.mint;
      const gradId = uidSuffix ? `iconBgGrad_${themeKey}_${uidSuffix}` : `iconBgGrad`;
      let topAccessorySvg = '';
      let pocketInnerSvg = `
        <rect x="92" y="144" width="28" height="36" rx="5" fill="${t.door}" stroke="#1E293B" stroke-width="4.5" transform="rotate(-8 106 162)"/>
        <circle cx="150" cy="162" r="16" fill="#D97706" stroke="#1E293B" stroke-width="4.5"/>
        <circle cx="150" cy="162" r="9" fill="#FEF3C7"/>
      `;

      if (t.motif === 'hopter') {
        topAccessorySvg = `
          <line x1="128" y1="12" x2="128" y2="32" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
          <rect x="88" y="8" width="80" height="10" rx="5" fill="#FFD700" stroke="#1E293B" stroke-width="4.5"/>
          <circle cx="128" cy="13" r="6" fill="#F59E0B" stroke="#1E293B" stroke-width="3.5"/>
        `;
      } else if (t.motif === 'dorami') {
        topAccessorySvg = `
          <path d="M128 30 L96 10 C88 16 88 32 102 36 Z" fill="#E60012" stroke="#1E293B" stroke-width="5"/>
          <path d="M128 30 L160 10 C168 16 168 32 154 36 Z" fill="#E60012" stroke="#1E293B" stroke-width="5"/>
          <circle cx="128" cy="28" r="9" fill="#FFD700" stroke="#1E293B" stroke-width="4.5"/>
        `;
      } else if (t.motif === 'galaxy') {
        topAccessorySvg = `
          <circle cx="196" cy="44" r="16" fill="#FDE047"/>
          <circle cx="204" cy="39" r="14" fill="${t.bgGradStart}"/>
        `;
        pocketInnerSvg = `
          <circle cx="128" cy="164" r="22" fill="#312E81" stroke="#1E293B" stroke-width="4.5"/>
          <circle cx="128" cy="164" r="12" fill="#38BDF8" stroke="#FDE047" stroke-width="3"/>
          <text x="118" y="170" font-size="16">🛸</text>
        `;
      } else if (t.motif === 'toast') {
        topAccessorySvg = `
          <rect x="112" y="16" width="32" height="18" rx="5" fill="#FEF08A" stroke="#1E293B" stroke-width="4.5" transform="rotate(-6 128 25)"/>
        `;
        pocketInnerSvg = `
          <text x="96" y="174" fill="#E60012" font-size="28" font-weight="900" font-family="sans-serif">100</text>
          <circle cx="156" cy="164" r="12" fill="#10B981" stroke="#1E293B" stroke-width="4"/>
        `;
      } else if (t.motif === 'forest') {
        topAccessorySvg = `
          <circle cx="120" cy="18" r="8" fill="#10B981" stroke="#1E293B" stroke-width="3.5"/>
          <circle cx="136" cy="18" r="8" fill="#10B981" stroke="#1E293B" stroke-width="3.5"/>
          <line x1="128" y1="22" x2="128" y2="34" stroke="#1E293B" stroke-width="4.5"/>
        `;
        pocketInnerSvg = `
          <path d="M128 140 L106 176 H150 Z" fill="#10B981" stroke="#1E293B" stroke-width="4.5"/>
          <rect x="123" y="176" width="10" height="12" fill="#B45309" stroke="#1E293B" stroke-width="3"/>
        `;
      }

      return `<svg viewBox="0 0 256 256" class="w-full h-full">
        <defs>
          <linearGradient id="iconBgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7DD3FC"/><stop offset="100%" stop-color="#CCFBF1"/></linearGradient>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${t.bgGradStart}"/>
            <stop offset="100%" stop-color="${t.bgGradEnd}"/>
          </linearGradient>
        </defs>
        <!-- Squircle Base -->
        <rect width="256" height="256" rx="56" fill="url(#${gradId})"/>
        <!-- Soft Floating Clouds & Stars -->
        <circle cx="48" cy="54" r="15" fill="#FFFFFF" opacity="0.78"/>
        <circle cx="66" cy="58" r="11" fill="#FFFFFF" opacity="0.78"/>
        <circle cx="208" cy="62" r="13" fill="#FFFFFF" opacity="0.78"/>
        <!-- Notebook Shadow -->
        <rect x="44" y="38" width="168" height="186" rx="34" fill="#1E293B"/>
        <!-- Cream Notebook Body -->
        <rect x="44" y="32" width="168" height="186" rx="34" fill="${t.coverBody}" stroke="#1E293B" stroke-width="8"/>
        <!-- Top Header Cap -->
        <path d="M44 66 C44 46 60 32 78 32 H178 C196 32 212 46 212 66 V98 H44 Z" fill="${t.coverTop}" stroke="#1E293B" stroke-width="8"/>
        ${topAccessorySvg}
        <!-- Cute Eyes & Nose on Notebook Header -->
        <ellipse cx="106" cy="64" rx="13" ry="16" fill="#FFFFFF" stroke="#1E293B" stroke-width="5"/>
        <ellipse cx="150" cy="64" rx="13" ry="16" fill="#FFFFFF" stroke="#1E293B" stroke-width="5"/>
        <circle cx="110" cy="65" r="5.5" fill="#1E293B"/>
        <circle cx="146" cy="65" r="5.5" fill="#1E293B"/>
        <circle cx="108" cy="62" r="2" fill="#FFFFFF"/>
        <circle cx="144" cy="62" r="2" fill="#FFFFFF"/>
        <circle cx="128" cy="78" r="9" fill="#E60012" stroke="#1E293B" stroke-width="4.5"/>
        <circle cx="125" cy="75" r="2.8" fill="#FFFFFF"/>
        <!-- Collar Strap -->
        <rect x="44" y="92" width="168" height="18" fill="${t.collar}" stroke="#1E293B" stroke-width="7"/>
        <!-- 4D Pocket Semicircle on Lower Cover -->
        <path d="M74 134 H182 V152 C182 182 158 200 128 200 C98 200 74 182 74 152 Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="7"/>
        ${pocketInnerSvg}
        <!-- Center Golden Bell Bookmark -->
        <circle cx="128" cy="104" r="21" fill="${t.bell}" stroke="#1E293B" stroke-width="6.5"/>
        <rect x="109" y="99" width="38" height="6" rx="3" fill="#F59E0B" stroke="#1E293B" stroke-width="4"/>
        <circle cx="128" cy="112" r="4.5" fill="#1E293B"/>
      </svg>`;
    }

    function setAppIconTheme(themeKey) {
      playSFX('bell');
      currentIconTheme = ICON_THEMES[themeKey] ? themeKey : 'mint';
      state.selectedIconTheme = currentIconTheme;
      saveStorage(state);
      renderAppIconStudio();
      syncDynamicBrowserFavicon(currentIconTheme);
      showToast(`🎨 已切换手绘图标主题：${ICON_THEMES[currentIconTheme].name}`);
    }

    function cycleAppIconTheme() {
      const keys = Object.keys(ICON_THEMES);
      const nextIdx = (keys.indexOf(currentIconTheme) + 1) % keys.length;
      setAppIconTheme(keys[nextIdx]);
    }

    function syncDynamicBrowserFavicon(themeKey = 'mint') {
      // Keep static <head> icon link untouched to avoid antivirus heuristic false positives on local HTML files
      return themeKey;
    }

    function renderAppIconStudio() {
      if (state.selectedIconTheme && ICON_THEMES[state.selectedIconTheme]) {
        currentIconTheme = state.selectedIconTheme;
      }
      const box = document.getElementById('app-icon-preview-box');
      if (box) {
        box.innerHTML = getAppIconSvgMarkup(currentIconTheme);
      }
      const plazaLabel = document.getElementById('plaza-active-icon-label');
      if (plazaLabel && ICON_THEMES[currentIconTheme]) {
        plazaLabel.textContent = `当前：${ICON_THEMES[currentIconTheme].name}`;
      }

      Object.keys(ICON_THEMES).forEach(k => {
        const btn = document.getElementById(`icon-theme-${k}`);
        if (btn) {
          btn.className = k === currentIconTheme
            ? 'comic-btn px-2.5 py-1 rounded-lg text-[11px] font-black bg-[#0096E6] text-white'
            : 'comic-btn px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700';
        }
      });

      const plazaGrid = document.getElementById('plaza-8-icons-grid');
      if (plazaGrid) {
        plazaGrid.innerHTML = Object.entries(ICON_THEMES).map(([k, meta]) => {
          const isCur = k === currentIconTheme;
          return `
            <button type="button" onclick="setAppIconTheme('${k}')" class="svg-badge-btn p-2 flex flex-col items-center justify-center ${isCur ? 'bg-[#FFF3B0] ring-2 ring-[#0096E6]' : 'bg-slate-50 hover:bg-sky-50'}">
              <div class="w-14 h-14 rounded-2xl overflow-hidden border border-slate-900 shadow-sm mb-1">
                ${getAppIconSvgMarkup(k, 'plaza_' + k)}
              </div>
              <span class="text-[10px] font-black text-slate-800 truncate w-full text-center">${meta.name.slice(2).trim()}</span>
            </button>
          `;
        }).join('');
      }
    }

    function drawHealingAppIconOnCanvas(size = 512, themeKey = 'mint') {
      const t = ICON_THEMES[themeKey] || ICON_THEMES.mint;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return canvas;

      const s = v => (v / 256) * size;

      // Rounded Squircle Background
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, t.bgGradStart);
      grad.addColorStop(1, t.bgGradEnd);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, s(56));
      ctx.fill();

      // Notebook Shadow & Body
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(s(44), s(38), s(168), s(186), s(34));
      ctx.fill();

      ctx.fillStyle = t.coverBody;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = s(8);
      ctx.beginPath();
      ctx.roundRect(s(44), s(32), s(168), s(186), s(34));
      ctx.fill();
      ctx.stroke();

      // Top Header Cap
      ctx.fillStyle = t.coverTop;
      ctx.beginPath();
      ctx.roundRect(s(44), s(32), s(168), s(66), [s(34), s(34), 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Eyes
      [106, 150].forEach((cx, idx) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(s(cx), s(64), s(13), s(16), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = s(5);
        ctx.stroke();

        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.arc(s(idx === 0 ? 110 : 146), s(65), s(5.5), 0, Math.PI * 2);
        ctx.fill();
      });

      // Red Nose
      ctx.fillStyle = '#E60012';
      ctx.beginPath();
      ctx.arc(s(128), s(78), s(9), 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = s(4.5);
      ctx.stroke();

      // Red Collar
      ctx.fillStyle = t.collar;
      ctx.lineWidth = s(7);
      ctx.fillRect(s(44), s(92), s(168), s(18));
      ctx.strokeRect(s(44), s(92), s(168), s(18));

      // 4D Pocket
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(s(74), s(134), s(108), s(66), [s(10), s(10), s(54), s(54)]);
      ctx.fill();
      ctx.stroke();

      // Center Golden Bell
      ctx.fillStyle = t.bell;
      ctx.beginPath();
      ctx.arc(s(128), s(104), s(21), 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = s(6.5);
      ctx.stroke();

      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(s(128), s(112), s(4.5), 0, Math.PI * 2);
      ctx.fill();

      return canvas;
    }

    function exportOfflineAppIconPng(size = 512) {
      playSFX('gadget');
      const canvas = drawHealingAppIconOnCanvas(size, currentIconTheme);
      saveCanvasPng(
        canvas,
        `pocket_journal_icon_${currentIconTheme}_${size}x${size}.png`,
        `📱 已离线生成并导出 ${size}×${size} 治愈系 App 图标！`
      );
    }


    // ====================================================
    // 17. PHASE 2 UPGRADES: PRIVACY BLUR, 7-DAY HABIT MATRIX,
    //     COUNTDOWN CAPSULES, WHAT-IF PHONE BOOTH, WHITE NOISE & STORAGE HEALTH
    // ====================================================
    const WHATIF_SCENARIOS = [
      {
        q: '“如果今天所有的压力都变成软绵绵的棉花糖云朵，你会先咬哪一口？”',
        tip: '✨ 解忧锦囊：允许自己今天慢半拍，去做一件纯粹开心的小事'
      },
      {
        q: '“如果电话亭把今天变成了【绝对不许内耗日】，你现在最想放下哪件小担忧？”',
        tip: '✨ 解忧锦囊：写下那件小担忧，然后对它说一句：明天再说吧~'
      },
      {
        q: '“如果今晚壁橱里的时光机带你去见10年后的自己，TA一定正微笑着感谢今天认真生活的你。”',
        tip: '✨ 解忧锦囊：喝口温水，给今天努力过的自己点个赞'
      },
      {
        q: '“如果全世界的闹钟今天都慢下1小时，送给你60分钟隐形假期，你想怎么度过？”',
        tip: '✨ 解忧锦囊：哪怕只有15分钟，也去听首歌或发会儿呆吧'
      },
      {
        q: '“如果吃下一块铜锣烧就能把坏运气全部转化为好运气，你希望明天发生什么好事？”',
        tip: '✨ 解忧锦囊：把期待的好事写进手账，美好正在赶来的路上'
      }
    ];

    let whatIfIndex = 0;
    let ambientNoiseNode = null;
    let ambientGainNode = null;
    let currentNoiseMode = 'off';

    function ensurePhase2Defaults() {
      if (!Array.isArray(state.habits) || state.habits.length === 0) {
        const weekDays = getWeekDatesForActiveDate().map(d => d.key);
        state.habits = [
          { id: 'h1', name: '🌅 按时早起不赖床', checks: { [weekDays[0]]: true, [weekDays[1]]: true, [weekDays[3]]: true, [state.activeDate]: true } },
          { id: 'h2', name: '🥛 晨起喝一杯温水', checks: { [weekDays[0]]: true, [weekDays[2]]: true, [weekDays[3]]: true, [state.activeDate]: true } },
          { id: 'h3', name: '🏃 运动或散步20分钟', checks: { [weekDays[1]]: true, [weekDays[2]]: true } },
          { id: 'h4', name: '📵 23:30前放下手机', checks: { [weekDays[0]]: true, [weekDays[3]]: true } },
          { id: 'h5', name: '✍️ 留下一句今日手账', checks: { [weekDays[0]]: true, [weekDays[1]]: true, [weekDays[2]]: true, [weekDays[3]]: true, [state.activeDate]: true } }
        ];
      }
      if (!Array.isArray(state.countdowns) || state.countdowns.length === 0) {
        const d1 = new Date();
        d1.setDate(d1.getDate() + 12);
        const d2 = new Date();
        d2.setDate(d2.getDate() - 30);
        const pad = n => String(n).padStart(2, '0');
        const fmt = dt => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        state.countdowns = [
          { id: 9101, title: '🏖️ 期待的周末小旅行', targetDate: fmt(d1) },
          { id: 9102, title: '📖 开启四次元手账纪念', targetDate: fmt(d2) }
        ];
      }
    }

    function togglePrivacyBlurMode() {
      playSFX('click');
      triggerHaptic(12);
      state.privacyBlur = !state.privacyBlur;
      applyPrivacyBlurUI();
      showToast(state.privacyBlur ? '🙈 已开启【防窥模糊】，金额、体重与日记已隐藏' : '👀 已关闭防窥模糊，恢复正常显示');
    }

    function applyPrivacyBlurUI() {
      const active = Boolean(state.privacyBlur);
      document.body.classList.toggle('privacy-blur-active', active);
      const iconEl = document.getElementById('privacy-blur-icon');
      const labelEl = document.getElementById('privacy-blur-label');
      if (iconEl) iconEl.textContent = active ? '👀' : '🙈';
      if (labelEl) labelEl.textContent = active ? '显字' : '防窥';
    }

    function renderHabitBoard() {
      ensurePhase2Defaults();
      const listEl = document.getElementById('habit-streak-list');
      const badgeEl = document.getElementById('habit-today-badge');
      if (!listEl) return;

      const weekDays = getWeekDatesForActiveDate();
      const todayChecks = state.habits.filter(h => h.checks && h.checks[state.activeDate]).length;
      if (badgeEl) badgeEl.textContent = `今日 ${todayChecks}/${state.habits.length}`;

      listEl.innerHTML = state.habits.map(h => {
        const checks = h.checks || {};
        const doneToday = Boolean(checks[state.activeDate]);
        const weekCount = weekDays.filter(wd => checks[wd.key]).length;
        return `
          <div class="comic-card-sm p-2.5 bg-white flex items-center justify-between gap-2">
            <button type="button" onclick="toggleHabitCheck('${h.id}')" class="flex items-center gap-2 text-left min-w-0 flex-1">
              <span class="w-6 h-6 rounded-lg border-2 border-slate-900 flex items-center justify-center text-xs font-black shrink-0 ${doneToday ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-transparent'}">✓</span>
              <span class="text-xs font-bold text-slate-800 truncate">${escapeHtml(h.name)}</span>
            </button>
            <div class="flex items-center gap-1 shrink-0">
              ${weekDays.map(wd => `
                <button type="button" onclick="toggleHabitCheck('${h.id}', '${wd.key}')" title="${wd.weekday} (${wd.shortDate})" class="w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center text-[8px] font-black ${checks[wd.key] ? 'bg-[#FFD700] text-slate-900' : 'bg-slate-100 text-slate-400'}">
                  ${wd.weekday.slice(-1)}
                </button>
              `).join('')}
              <span class="font-mono-num text-[10px] font-black text-emerald-700 ml-1">${weekCount}d</span>
              <button type="button" onclick="deleteHabitItem('${h.id}')" class="text-slate-300 hover:text-rose-600 text-xs font-bold ml-0.5">✕</button>
            </div>
          </div>
        `;
      }).join('');
    }

    function toggleHabitCheck(habitId, dateKey = state.activeDate) {
      triggerHaptic(10);
      const habit = (state.habits || []).find(h => h.id === habitId);
      if (!habit) return;
      if (!habit.checks) habit.checks = {};
      habit.checks[dateKey] = !habit.checks[dateKey];
      if (habit.checks[dateKey]) {
        state.coins += 5;
        playSFX('coin');
        showToast(`🌱 微习惯打卡成功：「${habit.name}」(+5 🔔)`);
      } else {
        playSFX('click');
      }
      saveStorage(state);
      renderHabitBoard();
      renderHUD();
    }

    function addCustomHabit(e) {
      e.preventDefault();
      const inputEl = document.getElementById('custom-habit-input');
      const name = (inputEl?.value || '').trim();
      if (!name) {
        showToast('🌱 请先输入想要养成的微习惯名称哦~');
        return;
      }
      ensurePhase2Defaults();
      state.habits.push({
        id: 'h_' + Date.now(),
        name,
        checks: { [state.activeDate]: true }
      });
      inputEl.value = '';
      playSFX('bell');
      saveStorage(state);
      renderHabitBoard();
      showToast(`🌱 已新增微习惯：「${name}」`);
    }

    function deleteHabitItem(habitId) {
      playSFX('click');
      state.habits = (state.habits || []).filter(h => h.id !== habitId);
      saveStorage(state);
      renderHabitBoard();
    }

    function renderCountdownCapsules() {
      ensurePhase2Defaults();
      const listEl = document.getElementById('countdown-capsules-list');
      if (!listEl) return;

      const [ay, am, ad] = state.activeDate.split('-').map(Number);
      const activeMs = new Date(ay, am - 1, ad).getTime();

      listEl.innerHTML = (state.countdowns || []).map(item => {
        const [ty, tm, td] = (item.targetDate || state.activeDate).split('-').map(Number);
        const targetMs = new Date(ty, tm - 1, td).getTime();
        const diffDays = Math.round((targetMs - activeMs) / 86400000);
        const isFuture = diffDays >= 0;
        return `
          <div class="comic-card-sm p-2.5 ${isFuture ? 'bg-sky-50' : 'bg-amber-50'} relative">
            <button type="button" onclick="deleteCountdownItem(${item.id})" class="absolute top-1.5 right-1.5 text-slate-400 hover:text-rose-600 text-[10px] font-bold">✕</button>
            <div class="text-[11px] font-black text-slate-800 truncate pr-4">${escapeHtml(item.title)}</div>
            <div class="font-mono-num text-base font-black ${isFuture ? 'text-[#0096E6]' : 'text-amber-700'} mt-0.5">
              ${diffDays === 0 ? '🎉 就是今天！' : isFuture ? `还有 ${diffDays} 天` : `已陪伴 ${Math.abs(diffDays)} 天`}
            </div>
            <div class="font-mono-num text-[10px] text-slate-500">${item.targetDate}</div>
          </div>
        `;
      }).join('');
    }

    function addCountdownItem(e) {
      e.preventDefault();
      const titleEl = document.getElementById('countdown-title-input');
      const dateEl = document.getElementById('countdown-date-input');
      const title = (titleEl?.value || '').trim();
      const targetDate = dateEl?.value || getTodayKey();
      if (!title) {
        showToast('⏳ 请输入倒数日或纪念日名称哦~');
        return;
      }
      ensurePhase2Defaults();
      state.countdowns.unshift({
        id: Date.now(),
        title,
        targetDate
      });
      titleEl.value = '';
      playSFX('bell');
      saveStorage(state);
      renderCountdownCapsules();
      showToast(`⏳ 已添加时光坐标：「${title}」`);
    }

    function deleteCountdownItem(id) {
      playSFX('click');
      state.countdowns = (state.countdowns || []).filter(c => c.id !== id);
      saveStorage(state);
      renderCountdownCapsules();
    }

    function dialWhatIfBooth() {
      playSFX('gadget');
      triggerHaptic(15);
      whatIfIndex = (whatIfIndex + 1) % WHATIF_SCENARIOS.length;
      const item = WHATIF_SCENARIOS[whatIfIndex];
      const qEl = document.getElementById('whatif-booth-display');
      const tipEl = document.getElementById('whatif-booth-tip');
      if (qEl) qEl.textContent = item.q;
      if (tipEl) tipEl.textContent = item.tip;
      state.coins += 5;
      saveStorage(state);
      renderHUD();
      showToast('☎️ 叮铃铃~ 如果电话亭已接通平行世界！(+5 🔔)');
    }

    function stampWhatIfToDiary() {
      const item = WHATIF_SCENARIOS[whatIfIndex % WHATIF_SCENARIOS.length];
      insertSticker(`【☎️如果电话亭奇想：${item.q.replace(/“|”/g, '')}】`);
      showToast('☎️ 已将平行世界奇想记入今日手账！');
    }

    // Offline Procedural White Noise Synthesizer (Web Audio API)
    function setOfflineAmbientNoise(mode) {
      ensureAudio();
      currentNoiseMode = mode;

      if (ambientNoiseNode) {
        try { ambientNoiseNode.stop(); ambientNoiseNode.disconnect(); } catch (e) {}
        ambientNoiseNode = null;
      }

      ['off', 'rain', 'wave', 'fire'].forEach(m => {
        const btn = document.getElementById(`noise-btn-${m}`);
        if (btn) {
          btn.className = m === mode
            ? 'comic-btn py-1.5 rounded-xl text-[11px] font-black bg-[#0096E6] text-white'
            : 'comic-btn py-1.5 rounded-xl text-[11px] font-bold bg-white text-slate-700';
        }
      });

      if (mode === 'off' || !audioCtx) {
        showToast('🔇 已关闭专注环境白噪音');
        return;
      }

      const bufferSize = audioCtx.sampleRate * 2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.2;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = mode === 'rain' ? 'bandpass' : 'lowpass';
      filter.frequency.value = mode === 'rain' ? 950 : mode === 'wave' ? 320 : 520;

      const gain = audioCtx.createGain();
      gain.gain.value = 0.06;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();

      ambientNoiseNode = noise;
      ambientGainNode = gain;
      const labels = { rain: '🌧️ 窗外听雨', wave: '🌊 晴空海浪', fire: '🔥 壁炉篝火' };
      showToast(`🎧 已开启离线白噪音：【${labels[mode] || mode}】`);
    }

    function renderStorageHealth() { PocketJournalStorage.health(); }

    function exportMarkdownJournal() {
      playSFX('bell');
      const lines = [
        `# 📖 ${getUserName()}的口袋手账导出记录`,
        `> 导出时间：${new Date().toLocaleString('zh-CN')}`,
        ''
      ];
      Object.keys(state.days || {}).sort().reverse().forEach(dateKey => {
        const d = state.days[dateKey];
        const moodObj = MOOD_OPTIONS.find(m => m.id === d.moodId) || MOOD_OPTIONS[0];
        const weatherObj = WEATHER_OPTIONS.find(w => w.id === d.weather) || WEATHER_OPTIONS[0];
        lines.push(`## 📅 ${dateKey} · ${moodObj.icon}${moodObj.label} · ${weatherObj.icon}${weatherObj.label} ${d.temp ?? 22}°C`);
        if (d.sleepHours) lines.push(`- 🌙 睡眠时长：${d.sleepHours} 小时`);
        if (d.weightKg != null) lines.push(`- ⚖️ 体重记录：${d.weightKg} kg`);
        if (d.dailyQuote) lines.push(`- 💡 今日留住的瞬间：“${d.dailyQuote}”`);
        if (Array.isArray(d.expenses) && d.expenses.length) {
          const sum = d.expenses.filter(e => e.kind !== 'income').reduce((s, e) => s + Number(e.amount || 0), 0);
          lines.push(`- 💰 当日支出：¥${sum.toFixed(2)}（共 ${d.expenses.length} 笔）`);
        }
        lines.push('');
      });

      if (window.AndroidBridge) {
        AndroidBridge.saveText(lines.join('\n'), `口袋手账_${state.activeDate}.md`, 'text/markdown');
        return;
      }
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pocket_journal_${state.activeDate}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('📝 已导出 Markdown 格式手账笔记！');
    }


    // ====================================================
    // 18. PHASE 3 WEB ENHANCEMENTS: DORAEMON DRESS-UP & FEEDING,
    //     STRUCTURED JOURNAL TEMPLATES, #TAG CORRELATION INSIGHTS,
    //     AIR CANNON WORRY SHREDDER, MEMORY BREAD FLASHCARDS & DRAWER PIN LOCK
    // ====================================================
    const JOURNAL_TEMPLATES = {
      movie: {
        name: '🎬 观影/追剧手账卡',
        p1: '🎬 作品名称（如：《伴我同行》）',
        p2: '💬 最触动的一句台词或观后感...',
        prefix: '🎬【观影追剧卡】'
      },
      book: {
        name: '📚 读书/播客摘抄卡',
        p1: '📚 书名或播客（如：《小王子》）',
        p2: '✒️ 摘抄金句或阅读启发...',
        prefix: '📚【读书摘抄卡】'
      },
      food: {
        name: '🧋 奶茶/美食探店卡',
        p1: '🧋 店名与单品（如：红豆铜锣烧配抹茶）',
        p2: '😋 口味评价与幸福感描述...',
        prefix: '🧋【美食测评卡】'
      },
      travel: {
        name: '🧳 任意门出游记录卡',
        p1: '🚪 目的地与同行伙伴（如：后山公园野餐）',
        p2: '🌄 今日最美风景或难忘瞬间...',
        prefix: '🧳【出游记录卡】'
      },
      gratitude: {
        name: '🌙 睡前感恩三件事',
        p1: '💖 今天最想感谢的人或自己的一件事',
        p2: '🌟 今天发生的一件微小却确定的幸福...',
        prefix: '🌙【睡前感恩卡】'
      }
    };

    let currentTemplateKey = 'movie';
    let currentBreadIndex = 0;
    let currentBreadFlipped = false;
    let enteredPin = '';

    function ensurePhase3Defaults() {
      if (!state.doraAccessory) state.doraAccessory = { icon: '🚁', name: '竹蜻蜓' };
      if (!state.drawerPin) state.drawerPin = '2112';
      if (state.cannonBlastedCount == null) state.cannonBlastedCount = 3;
      if (state.breadEatenCount == null) state.breadEatenCount = 4;

      if (!Array.isArray(state.worries) || state.worries.length === 0) {
        state.worries = [
          { id: 1, text: '💥 拖延症小怪兽' },
          { id: 2, text: '💥 熬夜疲惫小乌云' },
          { id: 3, text: '💥 没必要的精神内耗' },
          { id: 4, text: '💥 今日份水逆与烦躁' }
        ];
      }

      if (!Array.isArray(state.memoryBreads) || state.memoryBreads.length === 0) {
        state.memoryBreads = [
          { id: 1, front: '“不管遇到什么困难，先睡个好觉再说！”', back: '💡 哆啦A梦哲学：壁橱里睡饱8小时，醒来又是元气满满的新一天。' },
          { id: 2, front: 'BMI 健康计算公式是什么？', back: '📐 BMI = 体重(kg) ÷ 身高(m)²，中国成人标准健康区间为 18.5 ~ 23.9。' },
          { id: 3, front: 'Serendipity (英语高频词)', back: '🌸 释义：意外发现珍奇事物的本领；不期而遇的小确幸。' },
          { id: 4, front: '感到任务太难不想动怎么办？', back: '🔦 用【缩小灯思维】把大任务拆成5分钟就能启动的第一小步！' }
        ];
      }
    }

    function setDoraAccessory(icon, name) {
      ensurePhase3Defaults();
      playSFX('gadget');
      state.doraAccessory = { icon, name };
      saveStorage(state);
      renderDoraPetAccessory();
      showToast(`🐾 已为哆啦A梦穿戴上【${icon} ${name}】！`);
    }

    function feedDoraemonPet(foodName) {
      ensurePhase3Defaults();
      playSFX('coin');
      triggerHaptic(15);
      state.friendship = Math.min(100, (state.friendship || 98) + 1);
      spawnFloatingParticles(['🥞', '💖', '🔔', '✨']);
      const statusEl = document.getElementById('dora-pet-status');
      if (statusEl) {
        statusEl.textContent = `😋 刚吃饱${foodName}，好感度 ${state.friendship}%`;
      }
      getDayRecord(state.activeDate).doraQuote = `“哇！是${getUserName()}投喂的${foodName}！太好吃啦，干劲瞬间提升200%！”`;
      const qEl = document.getElementById('dora-quote');
      if (qEl) qEl.textContent = getDayRecord(state.activeDate).doraQuote;
      saveStorage(state);
      renderStats();
      showToast(`🥞 投喂成功！哆啦A梦开心地吃下了${foodName}~`);
    }

    function renderDoraPetAccessory() {
      ensurePhase3Defaults();
      const acc = state.doraAccessory || { icon: '🚁', name: '竹蜻蜓' };
      const statusEl = document.getElementById('dora-pet-status');
      if (statusEl) {
        statusEl.textContent = `✨ 戴着${acc.icon}${acc.name}伴读中`;
      }
    }

    function selectJournalTemplate(key) {
      playSFX('click');
      currentTemplateKey = key;
      const tpl = JOURNAL_TEMPLATES[key] || JOURNAL_TEMPLATES.movie;
      const f1 = document.getElementById('tpl-field-1');
      const f2 = document.getElementById('tpl-field-2');
      if (f1) f1.placeholder = tpl.p1;
      if (f2) f2.placeholder = tpl.p2;

      Object.keys(JOURNAL_TEMPLATES).forEach(k => {
        const btn = document.getElementById(`tpl-btn-${k}`);
        if (btn) {
          btn.className = k === key
            ? 'comic-btn px-2.5 py-1 rounded-lg text-[11px] font-black bg-[#0096E6] text-white shrink-0'
            : 'comic-btn px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700 shrink-0';
        }
      });
    }

    function insertStructuredTemplateCard() {
      const tpl = JOURNAL_TEMPLATES[currentTemplateKey] || JOURNAL_TEMPLATES.movie;
      const f1 = document.getElementById('tpl-field-1');
      const f2 = document.getElementById('tpl-field-2');
      const rating = document.getElementById('tpl-rating-select')?.value || '⭐⭐⭐⭐⭐ 5.0';

      const v1 = (f1?.value || '').trim() || '今日宝藏记录';
      const v2 = (f2?.value || '').trim() || '留下了超棒的体验与回忆 ✨';

      const cardBlock = `${tpl.prefix}《${v1}》(${rating})
└ ✍️ 札记：${v2}`;
      const textarea = document.getElementById('diary-content');
      if (textarea) {
        textarea.value = textarea.value ? `${textarea.value}
${cardBlock}` : cardBlock;
        state.draftContent = textarea.value;
        getDayRecord(state.activeDate).draftContent = textarea.value;
        updateWordCount();
      }
      if (f1) f1.value = '';
      if (f2) f2.value = '';
      playSFX('gadget');
      saveStorage(state);
      showToast(`🗂️ 已将${tpl.name}插入手账正文！`);
    }

    function toggleDayTag(tag) {
      playSFX('click');
      const dayRec = getDayRecord(state.activeDate);
      if (!Array.isArray(dayRec.tags)) dayRec.tags = [];
      if (dayRec.tags.includes(tag)) {
        dayRec.tags = dayRec.tags.filter(t => t !== tag);
      } else {
        dayRec.tags.push(tag);
        insertSticker(tag);
      }
      saveStorage(state);
      renderDayTags();
      renderCorrelationInsights();
    }

    function renderDayTags() {
      const dayRec = getDayRecord(state.activeDate);
      const activeTags = dayRec.tags || [];
      document.querySelectorAll('.day-tag-chip').forEach(btn => {
        const tag = btn.dataset.tag;
        const isOn = activeTags.includes(tag);
        btn.className = isOn
          ? 'day-tag-chip text-[11px] font-black bg-[#FFD700] text-slate-900 px-2.5 py-0.5 rounded-full border-2 border-slate-900 shrink-0'
          : 'day-tag-chip text-[11px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-800 shrink-0';
      });
    }

    function renderCorrelationInsights() {
      const box = document.getElementById('correlation-insight-box');
      if (!box) return;

      const entries = Object.entries(state.days || {});
      let goodSleepHappy = 0, goodSleepTotal = 0;
      let sunnySpend = 0, sunnyDays = 0;
      const tagCounts = {};

      entries.forEach(([, d]) => {
        if (!d) return;
        const hrs = Number(d.sleepHours || 8);
        const isPositiveMood = ['happy', 'energetic', 'warm', 'focused', 'calm'].includes(d.moodId);
        if (hrs >= (state.profile?.sleepGoal || 8)) {
          goodSleepTotal++;
          if (isPositiveMood) goodSleepHappy++;
        }
        const daySpend = (d.expenses || []).filter(e => e.kind !== 'income').reduce((s, e) => s + Number(e.amount || 0), 0);
        if (['sunny', 'rainbow', 'breezy'].includes(d.weather)) {
          sunnySpend += daySpend;
          sunnyDays++;
        }
        (d.tags || []).forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });

      const happyRate = goodSleepTotal ? Math.round((goodSleepHappy / goodSleepTotal) * 100) : 92;
      const avgSunnySpend = sunnyDays ? (sunnySpend / sunnyDays).toFixed(1) : '28.5';
      const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '#早睡自律';

      box.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-xs font-black text-slate-900">🔮 22世纪手账关联洞察雷达（睡眠 × 心情 × 消费 × 标签）</span>
          <span class="text-[10px] font-black bg-[#FFD700] text-slate-900 px-2 py-0.5 rounded-full border border-slate-900">智能交叉分析</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div class="bg-white p-2 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-slate-500 block">🌙 睡眠 × 心情关联</span>
            <strong class="text-indigo-700">睡满目标时长时，好心情率达 ${happyRate}%</strong>
          </div>
          <div class="bg-white p-2 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-slate-500 block">☀️ 天气 × 消费洞察</span>
            <strong class="text-rose-700">晴朗微风日平均消费 ¥${avgSunnySpend}/天</strong>
          </div>
          <div class="bg-white p-2 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-slate-500 block">🏷️ 高频快乐标签</span>
            <strong class="text-emerald-700">近期最常点亮 ${escapeHtml(topTag)}</strong>
          </div>
        </div>
      `;
    }

    // Air Cannon Worry Shredder
    function renderAirCannon() {
      ensurePhase3Defaults();
      const stage = document.getElementById('worry-bubbles-stage');
      const badge = document.getElementById('cannon-count-badge');
      if (badge) badge.textContent = `已击碎 ${state.cannonBlastedCount || 0} 个`;
      if (!stage) return;

      if (state.worries.length === 0) {
        stage.innerHTML = `
          <div class="col-span-2 comic-card-sm p-4 bg-emerald-50 text-center text-xs font-bold text-emerald-800">
            🎉 烦恼靶场已清空！所有坏情绪都被空气炮轰到九霄云外啦~
          </div>
        `;
        return;
      }

      stage.innerHTML = state.worries.map(w => `
        <button type="button" id="worry-bubble-${w.id}" onclick="blastWorryBubble(${w.id})" class="comic-card-sm p-2.5 bg-rose-50 hover:bg-rose-100 text-left flex items-center justify-between gap-2 group">
          <span class="text-xs font-bold text-slate-800 truncate">${escapeHtml(w.text)}</span>
          <span class="text-xs font-black text-[#E60012] shrink-0">💨 砰!</span>
        </button>
      `).join('');
    }

    function blastWorryBubble(id) {
      ensurePhase3Defaults();
      const el = document.getElementById(`worry-bubble-${id}`);
      if (el) el.classList.add('worry-shatter-anim');
      playSFX('gadget');
      triggerHaptic(20);
      spawnFloatingParticles(['💨', '💥', '✨', '🌈']);

      setTimeout(() => {
        state.worries = (state.worries || []).filter(w => w.id !== id);
        state.cannonBlastedCount = (state.cannonBlastedCount || 0) + 1;
        state.coins += 10;
        saveStorage(state);
        renderAirCannon();
        renderHUD();
        showToast('💨 砰！！空气炮已把烦恼彻底击碎！奖励 +10 🔔');
      }, 360);
    }

    function addAndBlastWorry(e) {
      e.preventDefault();
      ensurePhase3Defaults();
      const inputEl = document.getElementById('worry-custom-input');
      const text = (inputEl?.value || '').trim();
      if (!text) {
        showToast('💨 请先写下你想用空气炮轰走的小烦恼哦~');
        return;
      }
      const newId = Date.now();
      state.worries.unshift({ id: newId, text: `💥 ${text}` });
      inputEl.value = '';
      renderAirCannon();
      setTimeout(() => blastWorryBubble(newId), 120);
    }

    // Memory Bread Flip-Card Studio
    function renderMemoryBread() {
      ensurePhase3Defaults();
      const cards = state.memoryBreads || [];
      const eatenBadge = document.getElementById('bread-eaten-badge');
      if (eatenBadge) eatenBadge.textContent = `已消化 ${state.breadEatenCount || 0} 片`;

      if (cards.length === 0) return;
      currentBreadIndex = ((currentBreadIndex % cards.length) + cards.length) % cards.length;
      const card = cards[currentBreadIndex];

      const sideBadge = document.getElementById('bread-side-badge');
      const idxLabel = document.getElementById('bread-index-label');
      const textEl = document.getElementById('bread-card-text');

      if (sideBadge) {
        sideBadge.textContent = currentBreadFlipped ? '✨ 吐司背面 (记忆解析)' : '🍞 吐司正面 (点击翻面)';
      }
      if (idxLabel) idxLabel.textContent = `${currentBreadIndex + 1} / ${cards.length}`;
      if (textEl) textEl.textContent = currentBreadFlipped ? card.back : card.front;
    }

    function flipMemoryBread() {
      playSFX('click');
      currentBreadFlipped = !currentBreadFlipped;
      renderMemoryBread();
    }

    function stepMemoryBread(delta) {
      playSFX('click');
      currentBreadFlipped = false;
      currentBreadIndex += delta;
      renderMemoryBread();
    }

    function eatMemoryBread() {
      ensurePhase3Defaults();
      playSFX('coin');
      state.breadEatenCount = (state.breadEatenCount || 0) + 1;
      state.coins += 10;
      spawnFloatingParticles(['🍞', '💯', '✨', '🔔']);
      saveStorage(state);
      renderMemoryBread();
      renderHUD();
      showToast('😋 咕咚！已吃下这片记忆吐司，知识点牢牢印在脑海里啦！(+10 🔔)');
    }

    function addMemoryBreadCard(e) {
      e.preventDefault();
      ensurePhase3Defaults();
      const fEl = document.getElementById('bread-front-input');
      const bEl = document.getElementById('bread-back-input');
      const front = (fEl?.value || '').trim();
      const back = (bEl?.value || '').trim();
      if (!front || !back) {
        showToast('🍞 请同时填写记忆吐司的正面与背面内容哦~');
        return;
      }
      state.memoryBreads.unshift({ id: Date.now(), front, back });
      currentBreadIndex = 0;
      currentBreadFlipped = false;
      fEl.value = '';
      bEl.value = '';
      playSFX('bell');
      saveStorage(state);
      renderMemoryBread();
      showToast('🍞 新的一片记忆吐司已烘烤完成！');
    }

    // Desk Drawer 4-Digit PIN Lock
    function openDrawerLockModal() {
      ensurePhase3Defaults();
      playSFX('click');
      enteredPin = '';
      updateDrawerPinDots();
      const modal = document.getElementById('drawer-lock-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function updateDrawerPinDots() {
      const dotsBox = document.getElementById('drawer-pin-dots');
      if (!dotsBox) return;
      dotsBox.innerHTML = [0, 1, 2, 3].map(i => `
        <span class="w-4 h-4 rounded-full border-2 border-slate-900 ${i < enteredPin.length ? 'bg-[#FFD700]' : 'bg-white'}"></span>
      `).join('');
    }

    function pressDrawerPinDigit(d) {
      playSFX('click');
      if (enteredPin.length >= 4) return;
      enteredPin += String(d);
      updateDrawerPinDots();
      if (enteredPin.length === 4) {
        const targetPin = state.drawerPin || '2112';
        if (enteredPin === targetPin) {
          playSFX('gadget');
          const modal = document.getElementById('drawer-lock-modal');
          if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
          }
          showToast('🔓 咔哒~ 书桌抽屉时光机关已开启，欢迎回来！');
        } else {
          enteredPin = '';
          updateDrawerPinDots();
          showToast('❌ 纪念数字不对哦，默认是哆啦A梦诞生日 2112~');
        }
      }
    }

    function clearDrawerPinInput() {
      playSFX('click');
      enteredPin = enteredPin.slice(0, -1);
      updateDrawerPinDots();
    }

    function resetDrawerPinToDefault() {
      state.drawerPin = '2112';
      enteredPin = '2112';
      updateDrawerPinDots();
      const modal = document.getElementById('drawer-lock-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      saveStorage(state);
      showToast('🧣 时光包巾已将抽屉机关恢复为 2112 并打开抽屉！');
    }

    // Web Keyboard Shortcuts
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement && (document.activeElement.id === 'diary-content' || document.activeElement.id === 'diary-title')) {
          e.preventDefault();
          saveDiaryEntry();
        }
      } else if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') { e.preventDefault(); switchTab('journal'); }
        else if (e.key === '2') { e.preventDefault(); switchTab('calendar'); }
        else if (e.key === '3') { e.preventDefault(); switchTab('gadgets'); }
        else if (e.key === '4') { e.preventDefault(); switchTab('timer'); }
        else if (e.key.toLowerCase() === 'n') { e.preventDefault(); toggleCozyNightMode(); }
        else if (e.key.toLowerCase() === 'b') { e.preventDefault(); togglePrivacyBlurMode(); }
        else if (e.key.toLowerCase() === 'l') { e.preventDefault(); openDrawerLockModal(); }
        else if (e.key.toLowerCase() === 'd') { e.preventDefault(); openAnywhereDoorModal(); }
      }
    });


    // ====================================================
    // 19. PHASE 4 WEB EXCLUSIVES + FLOATING ANYWHERE DOOR PORTAL:
    //     1) 📺 22nd-Century Time TV Random Memory Projector
    //     2) 🗺️ Back Hill Secret Base Exploration Map
    //     3) 🎨 Washi Tape & Stamp Corner DIY Studio
    //     4) 📖 2-Page Open Book Spread Viewer & Print Mode
    //     5) 🚪 Floating Anywhere Door Draggable FAB & Quick Teleport
    // ====================================================
    const WASHI_STYLES = {
      classic: { cls: 'washi-style-classic', name: '🔵 蓝黄斜纹胶带' },
      gingham: { cls: 'washi-style-gingham', name: '🔴 野餐红格胶带' },
      sakura: { cls: 'washi-style-sakura', name: '🌸 樱花波点胶带' },
      galaxy: { cls: 'washi-style-galaxy', name: '🌌 星夜银河胶带' },
      dorayaki: { cls: 'washi-style-dorayaki', name: '🥞 铜锣烧金胶带' }
    };

    const BACKHILL_LANDMARKS = [
      { id: 'desk', reqSteps: 0, icon: '🏠', name: '大雄的书桌抽屉', desc: '时光机入口已开启，开启每日手账之旅', stamp: '🛸 起点认证章' },
      { id: 'pipes', reqSteps: 60, icon: '🧱', name: '空地三根水泥管', desc: '午后晒太阳与小伙伴们聊天的秘密集合点', stamp: '⚽ 空地伙伴章' },
      { id: 'shizuka', reqSteps: 140, icon: '🎻', name: '静香的温馨书房', desc: '飘着烤红薯与红茶香气的下午茶读书角', stamp: '🍠 甜心下午茶章' },
      { id: 'cedar', reqSteps: 220, icon: '🌲', name: '后山千年大杉树', desc: '俯瞰整座小镇夕阳与微风的治愈山顶草坪', stamp: '🌅 后山夕阳章' },
      { id: 'cloud', reqSteps: 320, icon: '☁️', name: '22世纪云之国城堡', desc: '乘着竹蜻蜓抵达云端之上的梦幻秘密基地', stamp: '👑 云之国国王章' }
    ];

    let currentTvChannel = 0;
    let currentTvTargetDate = null;

    function ensurePhase4Defaults() {
      if (!state.washiStyle) state.washiStyle = 'classic';
      if (!state.stampCorner) state.stampCorner = 'top-right';
      if (state.bonusMapSteps == null) state.bonusMapSteps = 45;
    }

    // 3) Washi Tape & Stamp Corner DIY
    function setWashiTapeStyle(styleKey) {
      ensurePhase4Defaults();
      playSFX('click');
      state.washiStyle = styleKey;
      saveStorage(state);
      renderWashiAndStampCorner();
      const meta = WASHI_STYLES[styleKey] || WASHI_STYLES.classic;
      showToast(`🎨 已更换手账顶部胶带：【${meta.name}】`);
    }

    function setStampCorner(corner) {
      ensurePhase4Defaults();
      playSFX('bell');
      state.stampCorner = corner;
      saveStorage(state);
      renderWashiAndStampCorner();
      const labels = { 'top-right': '↗ 右上角邮戳位', 'bottom-right': '↘ 右下角火漆位', 'top-left': '↖ 左上角徽章位' };
      showToast(`💮 印章加盖位置已调整为：【${labels[corner] || corner}】`);
    }

    function renderWashiAndStampCorner() {
      ensurePhase4Defaults();
      const cardEl = document.getElementById('diary-paper-card');
      if (cardEl) {
        Object.values(WASHI_STYLES).forEach(w => cardEl.classList.remove(w.cls));
        const cur = WASHI_STYLES[state.washiStyle] || WASHI_STYLES.classic;
        cardEl.classList.add(cur.cls);
      }

      Object.keys(WASHI_STYLES).forEach(k => {
        const btn = document.getElementById(`washi-btn-${k}`);
        if (btn) {
          btn.className = k === state.washiStyle
            ? 'comic-btn px-2 py-0.5 rounded-lg text-[11px] font-black bg-[#0096E6] text-white shrink-0'
            : 'comic-btn px-2 py-0.5 rounded-lg text-[11px] font-bold bg-white text-slate-700 shrink-0';
        }
      });

      const postmarkEl = document.getElementById('diary-live-postmark');
      if (postmarkEl) {
        postmarkEl.className = 'stamp-animate absolute z-10 cursor-pointer select-none ';
        if (state.stampCorner === 'bottom-right') {
          postmarkEl.className += 'bottom-1 right-2';
        } else if (state.stampCorner === 'top-left') {
          postmarkEl.className += 'top-2 left-2';
        } else {
          postmarkEl.className += 'top-2 right-2';
        }
      }
    }

    // 1) 22nd-Century Time TV Random Memory Projector
    function collectAllMemoriesForTv() {
      const pool = [];
      (state.diaries || []).forEach(d => {
        pool.push({
          type: '✍️ 封存手账笔记',
          dateKey: d.dateKey || d.date.slice(0, 10),
          title: d.title,
          content: d.content,
          badge: `${d.moodIcon || '😊'} ${d.weatherLabel || '☀️ 晴朗'}`
        });
      });

      Object.entries(state.days || {}).forEach(([dateKey, rec]) => {
        if (!rec) return;
        const moodObj = MOOD_OPTIONS.find(m => m.id === rec.moodId) || MOOD_OPTIONS[0];
        const weatherObj = WEATHER_OPTIONS.find(w => w.id === rec.weather) || WEATHER_OPTIONS[0];
        if (rec.dailyQuote) {
          pool.push({
            type: '💡 留住的灵感瞬间',
            dateKey,
            title: rec.inspirationQuestion || '今天最想留住的一个瞬间是什么？',
            content: `“${rec.dailyQuote}”`,
            badge: `${moodObj.icon}${moodObj.label} · ${weatherObj.icon}${weatherObj.label}`
          });
        }
        if (Array.isArray(rec.photos) && rec.photos.length > 0) {
          rec.photos.forEach(p => {
            pool.push({
              type: '📸 拍立得贴纸记忆',
              dateKey,
              title: p.caption || '定格今日小确幸',
              content: `画面贴纸：${(p.stickers || ['🚁', '✨', '🥞']).join(' ')} · 留住了一张温暖的拍立得相片`,
              badge: `${moodObj.icon} 拍立得画报`
            });
          });
        }
      });

      (state.voiceMemos || []).forEach(v => {
        pool.push({
          type: '🎙️ 录音花声音胶囊',
          dateKey: v.dateKey,
          title: `${v.ambient} (${v.durationSec || 8}秒)`,
          content: `“${v.text}”`,
          badge: `🎧 ${v.time}`
        });
      });

      return pool;
    }

    function renderTimeTvProjector() {
      const screenEl = document.getElementById('time-tv-screen-box');
      const chBadge = document.getElementById('time-tv-channel-badge');
      const footerHint = document.getElementById('time-tv-footer-hint');
      if (!screenEl) return;

      const pool = collectAllMemoriesForTv();
      if (pool.length === 0) {
        currentTvTargetDate = getTodayKey();
        screenEl.innerHTML = `<div class="text-xs text-slate-300 py-8 text-center">📺 雪花屏待机中... 快去写一篇手账或拍立得吧！</div>`;
        return;
      }

      const idx = ((currentTvChannel % pool.length) + pool.length) % pool.length;
      const item = pool[idx];
      currentTvTargetDate = item.dateKey;

      if (chBadge) chBadge.textContent = `CH-0${(idx % 9) + 1}`;
      if (footerHint) footerHint.textContent = `🕰️ 正在放映 ${item.dateKey} 的时光片段`;

      screenEl.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 text-[10px] font-mono-num text-amber-300 mb-1.5">
            <span class="bg-white/15 px-2 py-0.5 rounded-full">${escapeHtml(item.type)}</span>
            <span>📅 ${item.dateKey} · ${escapeHtml(item.badge)}</span>
          </div>
          <h4 class="font-title text-base text-white mb-1 truncate">${escapeHtml(item.title)}</h4>
          <p class="text-xs text-sky-100 leading-relaxed line-clamp-2">${escapeHtml(item.content)}</p>
        </div>
        <div class="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-amber-200 font-mono-num">
          <span>▶ PLAY · 22世纪超空间回放</span>
          <span>频道 ${idx + 1} / ${pool.length}</span>
        </div>
      `;
    }

    function tuneTimeTvChannel() {
      playSFX('gadget');
      triggerHaptic(12);
      currentTvChannel++;
      const screenEl = document.getElementById('time-tv-screen-box');
      if (screenEl) {
        screenEl.classList.remove('tv-channel-switch');
        void screenEl.offsetWidth;
        screenEl.classList.add('tv-channel-switch');
      }
      renderTimeTvProjector();
      showToast('📺 咔哒~ 已拧动时光电视旋钮切换回忆频道！');
    }

    function jumpToTimeTvDate() {
      if (!currentTvTargetDate) return;
      switchActiveDate(currentTvTargetDate);
    }

    // 2) Back Hill Secret Base Adventure Map
    function calculateTotalExplorationSteps() {
      ensurePhase4Defaults();
      const recordedDays = Object.keys(state.days || {}).length;
      const totalFocus = Number(state.focusMinutes || 50);
      const doneTodos = (state.todos || []).filter(t => t.done).length;
      const diariesCount = (state.diaries || []).length;
      return (recordedDays * 25) + totalFocus + (doneTodos * 12) + (diariesCount * 15) + Number(state.bonusMapSteps || 0);
    }

    function renderBackHillMap() {
      const gridEl = document.getElementById('backhill-landmarks-grid');
      const stepsBadge = document.getElementById('map-steps-badge');
      const progBar = document.getElementById('map-progress-bar');
      const postcardEl = document.getElementById('map-selected-postcard');
      if (!gridEl) return;

      const steps = calculateTotalExplorationSteps();
      if (stepsBadge) stepsBadge.textContent = `🚁 ${steps} 步`;

      const pct = Math.min(100, Math.round((steps / 320) * 100));
      if (progBar) progBar.style.width = `${pct}%`;

      let highestUnlocked = BACKHILL_LANDMARKS[0];
      BACKHILL_LANDMARKS.forEach(lm => {
        if (steps >= lm.reqSteps) highestUnlocked = lm;
      });
      if (postcardEl) {
        postcardEl.textContent = `${highestUnlocked.icon} 当前抵达：${highestUnlocked.name}（${highestUnlocked.stamp}）`;
      }

      gridEl.innerHTML = BACKHILL_LANDMARKS.map(lm => {
        const unlocked = steps >= lm.reqSteps;
        return `
          <div onclick="inspectLandmarkPostcard('${lm.id}')" class="comic-card-sm px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition ${unlocked ? 'bg-white hover:bg-emerald-50' : 'bg-slate-100 opacity-60'}">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-8 h-8 rounded-xl border border-slate-900 flex items-center justify-center text-base shrink-0 ${unlocked ? 'bg-[#FFD700]' : 'bg-white'}">${lm.icon}</span>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-black text-slate-900 truncate">${lm.name}</span>
                  <span class="text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded border border-slate-800 ${unlocked ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-600'}">
                    ${unlocked ? lm.stamp : `需 ${lm.reqSteps} 步`}
                  </span>
                </div>
                <p class="text-[10px] text-slate-500 truncate">${lm.desc}</p>
              </div>
            </div>
            <span class="text-xs font-black ${unlocked ? 'text-emerald-600' : 'text-slate-400'} shrink-0">${unlocked ? '✓已点亮' : '🔒'}</span>
          </div>
        `;
      }).join('');
    }

    function inspectLandmarkPostcard(lmId) {
      const lm = BACKHILL_LANDMARKS.find(item => item.id === lmId);
      if (!lm) return;
      const steps = calculateTotalExplorationSteps();
      if (steps < lm.reqSteps) {
        showToast(`🗺️ 距离抵达【${lm.name}】还差 ${lm.reqSteps - steps} 步，快去写手账或点击竹蜻蜓巡航吧！`);
        return;
      }
      playSFX('bell');
      insertSticker(`【🗺️${lm.stamp}：打卡${lm.name}】`);
      showToast(`🗺️ 已将地标纪念章【${lm.stamp}】盖入今日手账！`);
    }

    function boostMapSteps() {
      ensurePhase4Defaults();
      playSFX('gadget');
      triggerHaptic(15);
      state.bonusMapSteps = (state.bonusMapSteps || 0) + 25;
      state.coins += 5;
      spawnFloatingParticles(['🚁', '🗺️', '🌲', '☁️']);
      saveStorage(state);
      renderBackHillMap();
      renderHUD();
      showToast('🚁 戴上竹蜻蜓巡航前进 +25 步！获得 +5 🔔');
    }

    // 4) 2-Page Open Hardcover Book Spread View & Print Mode
    function openBookSpreadModal() {
      playSFX('gadget');
      renderBookSpreadModal();
      const modal = document.getElementById('book-spread-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function closeBookSpreadModal() {
      const modal = document.getElementById('book-spread-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function stepBookSpreadDate(delta) {
      stepActiveDate(delta);
      renderBookSpreadModal();
    }

    function printBookSpread() {
      playSFX('bell');
      if (window.AndroidBridge) AndroidBridge.printJournal();
      else window.print();
    }

    function renderBookSpreadModal() {
      const leftEl = document.getElementById('book-left-page');
      const rightEl = document.getElementById('book-right-page');
      if (!leftEl || !rightEl) return;

      const dateKey = state.activeDate;
      const dayRec = getDayRecord(dateKey);
      const moodObj = MOOD_OPTIONS.find(m => m.id === dayRec.moodId) || MOOD_OPTIONS[0];
      const weatherObj = WEATHER_OPTIONS.find(w => w.id === recWeather(dayRec)) || WEATHER_OPTIONS[0];
      const expenses = dayRec.expenses || [];
      const totalSpend = expenses.filter(e => e.kind !== 'income').reduce((s, e) => s + Number(e.amount || 0), 0);
      const dayDiaries = (state.diaries || []).filter(d => (d.dateKey || d.date.slice(0, 10)) === dateKey);
      const photos = dayRec.photos || [];
      const firstPhoto = photos[0];

      leftEl.innerHTML = `
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
          <div>
            <span class="text-[10px] font-mono-num font-black bg-[#0096E6] text-white px-2 py-0.5 rounded-full">LEFT PAGE · 每日生活档案</span>
            <h4 class="font-title text-xl text-slate-900 mt-1">📅 ${dateKey} · ${getUserName()}的手账左页</h4>
          </div>
          <div class="text-right">
            <div class="text-xl">${moodObj.icon}${weatherObj.icon}</div>
            <span class="text-[10px] font-bold text-slate-600">${moodObj.label} · ${weatherObj.label} ${dayRec.temp ?? 22}°C</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-3 text-center">
          <div class="comic-card-sm p-2 bg-indigo-50">
            <div class="text-[10px] text-slate-500 font-bold">🌙 睡眠时长</div>
            <div class="font-mono-num text-sm font-black text-indigo-700">${dayRec.sleepHours ?? 8.0} h</div>
          </div>
          <div class="comic-card-sm p-2 bg-sky-50">
            <div class="text-[10px] text-slate-500 font-bold">⚖️ 体重记录</div>
            <div class="font-mono-num text-sm font-black text-sky-700">${dayRec.weightKg != null ? `${dayRec.weightKg} kg` : '未记'}</div>
          </div>
          <div class="comic-card-sm p-2 bg-rose-50">
            <div class="text-[10px] text-slate-500 font-bold">💰 今日支出</div>
            <div class="font-mono-num text-sm font-black text-[#E60012]">¥${totalSpend.toFixed(2)}</div>
          </div>
        </div>

        <div class="mb-3">
          <div class="text-xs font-black text-slate-800 mb-1">💡 今日留住的灵感瞬间：</div>
          <div class="p-2.5 rounded-xl bg-amber-50 border border-slate-800 text-xs font-bold text-amber-900">
            ${dayRec.dailyQuote ? `“${escapeHtml(dayRec.dailyQuote)}”` : '“平平淡淡却认真生活的一天 ✨”'}
          </div>
        </div>

        <div>
          <div class="text-xs font-black text-slate-800 mb-1">💰 当日账单明细 (${expenses.length} 笔)：</div>
          ${expenses.length === 0 ? `<p class="text-xs text-slate-400">当日暂无消费记录</p>` : `
            <div class="space-y-1">
              ${expenses.slice(0, 5).map(e => `
                <div class="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded border border-slate-800">
                  <span class="font-bold truncate">${escapeHtml(e.title)}</span>
                  <span class="font-mono-num font-black text-[#E60012]">-¥${Number(e.amount).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;

      const sceneSvg = firstPhoto ? (COLLAGE_SCENES[firstPhoto.scene]?.svg || COLLAGE_SCENES.sunset.svg) : COLLAGE_SCENES.sunset.svg;
      rightEl.innerHTML = `
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
          <div>
            <span class="text-[10px] font-mono-num font-black bg-[#FFD700] text-slate-900 px-2 py-0.5 rounded-full border border-slate-900">RIGHT PAGE · 拍立得与手账正文</span>
            <h4 class="font-title text-xl text-slate-900 mt-1">✍️ 抽屉时光手账右页</h4>
          </div>
          <span class="text-xs font-black text-[#E60012] border-2 border-[#E60012] px-2 py-0.5 rounded-full" style="transform: rotate(-6deg);">💮 22世纪珍藏印</span>
        </div>

        <!-- Mini Polaroid Preview -->
        <div class="comic-card-sm p-2.5 bg-white mb-3">
          <div class="h-28 rounded-lg overflow-hidden border border-slate-900 relative mb-1.5">
            ${firstPhoto && firstPhoto.customImageData ? `<img src="${firstPhoto.customImageData}" alt="拍立得" class="w-full h-full object-cover" />` : sceneSvg}
            <div class="absolute bottom-1 right-2 text-lg">${firstPhoto ? (firstPhoto.stickers || ['🚁', '✨']).join(' ') : '🚁 ✨ 🥞'}</div>
          </div>
          <p class="font-title text-xs text-center text-slate-800">“${escapeHtml(firstPhoto ? firstPhoto.caption : '夕阳很慢，铜锣烧很甜 ✨')}”</p>
        </div>

        <!-- Diary Notes -->
        <div class="space-y-2">
          ${dayDiaries.length === 0 ? `
            <div class="p-3 rounded-xl bg-white/90 border border-slate-800 text-xs text-slate-700 leading-relaxed">
              <strong>《${escapeHtml(document.getElementById('diary-title')?.value || '今日手账随笔')}》</strong>
              <p class="mt-1 whitespace-pre-wrap">${escapeHtml(document.getElementById('diary-content')?.value || '今天也在认真记录生活，把每一个微小却确定的幸福装进四次元口袋里~')}</p>
            </div>
          ` : dayDiaries.map(d => `
            <div class="p-3 rounded-xl bg-white/95 border border-slate-800 text-xs text-slate-800 leading-relaxed">
              <div class="font-black text-slate-900 mb-1">《${escapeHtml(d.title)}》 <span class="font-mono-num text-[10px] text-slate-400">${d.date}</span></div>
              <p class="whitespace-pre-wrap">${escapeHtml(d.content)}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    function recWeather(dayRec) {
      return (dayRec && dayRec.weather) || 'sunny';
    }

    // 5) Floating Anywhere Door FAB & Teleport Portal
    function openAnywhereDoorModal() {
      playSFX('gadget');
      triggerHaptic(12);
      const modal = document.getElementById('anywhere-door-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function closeAnywhereDoorModal() {
      const modal = document.getElementById('anywhere-door-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function teleportViaAnywhereDoor(tabId, targetElId, label) {
      closeAnywhereDoorModal();
      playSFX('gadget');
      triggerHaptic(15);

      // Switch to target tab without scrolling to top first
      const tabs = ['journal', 'calendar', 'gadgets', 'timer'];
      tabs.forEach(t => {
        const view = document.getElementById(`tab-${t}`);
        const navBtn = document.getElementById(`nav-${t}`);
        if (t === tabId) {
          view.classList.remove('hidden');
          navBtn.classList.remove('text-slate-500', 'font-bold');
          navBtn.classList.add('text-[#0096E6]', 'font-black', 'scale-105');
        } else {
          view.classList.add('hidden');
          navBtn.classList.add('text-slate-500', 'font-bold');
          navBtn.classList.remove('text-[#0096E6]', 'font-black', 'scale-105');
        }
      });

      if (tabId === 'calendar') renderCalendar();
      if (tabId === 'gadgets' && targetElId === 'subview-dex') switchSubGadgetView('dex');

      setTimeout(() => {
        const el = document.getElementById(targetElId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.remove('portal-arrival-flash');
          void el.offsetWidth;
          el.classList.add('portal-arrival-flash');
        }
      }, 70);

      spawnFloatingParticles(['🚪', '✨', '🌸']);
      showToast(`🚪 推开任意门，已瞬移至【${label}】！`);
    }

    function initFloatingAnywhereDoorFab() {
      const fab = document.getElementById('anywhere-door-fab');
      if (fab && fab.dataset.portalBound !== 'true') {
        fab.dataset.portalBound = 'true';
        fab.addEventListener('click', openAnywhereDoorModal);
      }
    }

    // ====================================================
    // 20. PHASE 5: CUSTOM ILLUSTRATED SVG BADGES, FLOATING PORTAL SKINS,
    //     DORAEMON RPS & SOUNDPAD, DORAYAKI TAROT, WISHING PLANT & DORAYAKI RAIN
    // ====================================================
    const FLOATING_PORTAL_SKINS = {
      door: {
        name: '🚪 粉红任意门',
        label: '任意门',
        bg: 'linear-gradient(180deg, #FB7185 0%, #F43F5E 100%)',
        svg: `<svg viewBox="0 0 56 64" class="w-9 h-10 pointer-events-none">
          <rect x="6" y="4" width="44" height="54" rx="6" fill="#F43F5E" stroke="#1E293B" stroke-width="3.5"/>
          <rect x="12" y="10" width="32" height="19" rx="3" fill="#FDA4AF" stroke="#1E293B" stroke-width="2.5"/>
          <rect x="12" y="33" width="32" height="19" rx="3" fill="#FDA4AF" stroke="#1E293B" stroke-width="2.5"/>
          <circle cx="39" cy="31" r="4" fill="#FFD700" stroke="#1E293B" stroke-width="2"/>
          <rect x="3" y="56" width="50" height="5" rx="2.5" fill="#FB7185" stroke="#1E293B" stroke-width="2.5"/>
        </svg>`
      },
      hopter: {
        name: '🚁 旋转竹蜻蜓',
        label: '竹蜻蜓',
        bg: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)',
        svg: `<svg viewBox="0 0 56 64" class="w-9 h-10 pointer-events-none">
          <rect x="8" y="10" width="40" height="8" rx="4" fill="#FFD700" stroke="#1E293B" stroke-width="3" class="hopter-rotor-spin"/>
          <line x1="28" y1="18" x2="28" y2="38" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>
          <line x1="28" y1="18" x2="28" y2="38" stroke="#1E293B" stroke-width="2"/>
          <path d="M14 48 C14 36 42 36 42 48 Z" fill="#FFD700" stroke="#1E293B" stroke-width="3"/>
          <circle cx="28" cy="14" r="4.5" fill="#F59E0B" stroke="#1E293B" stroke-width="2.5"/>
        </svg>`
      },
      bell: {
        name: '🔔 叮当金铃铛',
        label: '金铃铛',
        bg: 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)',
        svg: `<svg viewBox="0 0 56 64" class="w-9 h-10 pointer-events-none">
          <rect x="8" y="6" width="40" height="8" rx="4" fill="#E60012" stroke="#1E293B" stroke-width="2.8"/>
          <circle cx="28" cy="34" r="19" fill="#FFD700" stroke="#1E293B" stroke-width="3.2"/>
          <rect x="9" y="30" width="38" height="5" rx="2.5" fill="#F59E0B" stroke="#1E293B" stroke-width="2.5"/>
          <circle cx="28" cy="41" r="4" fill="#1E293B"/>
          <line x1="28" y1="45" x2="28" y2="52" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
        </svg>`
      },
      timemachine: {
        name: '🛸 超空间时光机',
        label: '时光机',
        bg: 'linear-gradient(180deg, #6366F1 0%, #312E81 100%)',
        svg: `<svg viewBox="0 0 56 64" class="w-9 h-10 pointer-events-none">
          <circle cx="28" cy="24" r="15" fill="#FEF08A" stroke="#1E293B" stroke-width="3"/>
          <line x1="28" y1="24" x2="28" y2="15" stroke="#1E293B" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="28" y1="24" x2="35" y2="24" stroke="#E60012" stroke-width="2.8" stroke-linecap="round"/>
          <rect x="8" y="38" width="40" height="14" rx="5" fill="#38BDF8" stroke="#1E293B" stroke-width="3"/>
          <circle cx="16" cy="45" r="3" fill="#FFD700"/>
          <circle cx="40" cy="45" r="3" fill="#E60012"/>
        </svg>`
      },
      dorayaki: {
        name: '🥞 微笑铜锣烧',
        label: '铜锣烧',
        bg: 'linear-gradient(180deg, #F59E0B 0%, #B45309 100%)',
        svg: `<svg viewBox="0 0 56 64" class="w-9 h-10 pointer-events-none">
          <ellipse cx="28" cy="34" rx="22" ry="14" fill="#78350F" stroke="#1E293B" stroke-width="3"/>
          <ellipse cx="28" cy="29" rx="22" ry="15" fill="#D97706" stroke="#1E293B" stroke-width="3"/>
          <ellipse cx="28" cy="27" rx="16" ry="10" fill="#FBBF24"/>
          <circle cx="22" cy="26" r="2.2" fill="#1E293B"/>
          <circle cx="34" cy="26" r="2.2" fill="#1E293B"/>
          <path d="M24 30 Q28 34 32 30" fill="none" stroke="#1E293B" stroke-width="2.2" stroke-linecap="round"/>
        </svg>`
      }
    };

    const ILLUSTRATED_SVG_BADGES = [
      {
        id: 'svg-dorayaki',
        name: '蜜豆铜锣烧',
        emoji: '🥞',
        stamp: '【🥞手绘铜锣烧特许章】',
        svg: `<svg viewBox="0 0 64 64" class="w-11 h-11">
          <ellipse cx="32" cy="38" rx="24" ry="14" fill="#78350F" stroke="#1E293B" stroke-width="3.5"/>
          <ellipse cx="32" cy="31" rx="24" ry="15" fill="#D97706" stroke="#1E293B" stroke-width="3.5"/>
          <path d="M16 28 Q32 36 48 28" fill="none" stroke="#FEF3C7" stroke-width="3" stroke-linecap="round"/>
          <circle cx="25" cy="25" r="2.3" fill="#1E293B"/><circle cx="39" cy="25" r="2.3" fill="#1E293B"/>
        </svg>`
      },
      {
        id: 'svg-door',
        name: '粉红任意门',
        emoji: '🚪',
        stamp: '【🚪任意门瞬移纪念章】',
        svg: `<svg viewBox="0 0 64 64" class="w-11 h-11">
          <rect x="14" y="8" width="36" height="48" rx="5" fill="#F43F5E" stroke="#1E293B" stroke-width="3.5"/>
          <rect x="20" y="14" width="24" height="16" rx="2.5" fill="#FDA4AF" stroke="#1E293B" stroke-width="2.5"/>
          <rect x="20" y="34" width="24" height="16" rx="2.5" fill="#FDA4AF" stroke="#1E293B" stroke-width="2.5"/>
          <circle cx="40" cy="32" r="3.5" fill="#FFD700" stroke="#1E293B" stroke-width="2"/>
        </svg>`
      },
      {
        id: 'svg-hopter',
        name: '黄金竹蜻蜓',
        emoji: '🚁',
        stamp: '【🚁竹蜻蜓晴空漫游章】',
        svg: `<svg viewBox="0 0 64 64" class="w-11 h-11">
          <rect x="10" y="14" width="44" height="8" rx="4" fill="#FFD700" stroke="#1E293B" stroke-width="3.2"/>
          <line x1="32" y1="22" x2="32" y2="44" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
          <path d="M18 52 C18 40 46 40 46 52 Z" fill="#FDE047" stroke="#1E293B" stroke-width="3.2"/>
        </svg>`
      },
      {
        id: 'svg-toast',
        name: '满分记忆吐司',
        emoji: '🍞',
        stamp: '【🍞记忆吐司100分印】',
        svg: `<svg viewBox="0 0 64 64" class="w-11 h-11">
          <path d="M14 24 C10 14 22 10 32 14 C42 10 54 14 50 24 V50 C50 53 47 55 44 55 H20 C17 55 14 53 14 50 Z" fill="#FDE68A" stroke="#B45309" stroke-width="4"/>
          <text x="19" y="41" fill="#E60012" font-size="15" font-weight="900">100</text>
        </svg>`
      },
      {
        id: 'svg-bell',
        name: '四次元金铃铛',
        emoji: '🔔',
        stamp: '【🔔金铃铛守护印章】',
        svg: `<svg viewBox="0 0 64 64" class="w-11 h-11">
          <circle cx="32" cy="32" r="20" fill="#FFD700" stroke="#1E293B" stroke-width="3.5"/>
          <rect x="12" y="28" width="40" height="6" rx="3" fill="#F59E0B" stroke="#1E293B" stroke-width="2.8"/>
          <circle cx="32" cy="40" r="4" fill="#1E293B"/>
        </svg>`
      },
      {
        id: 'svg-cannon',
        name: '空气炮冲击波',
        emoji: '💨',
        stamp: '【💨空气炮击碎烦恼章】',
        svg: `<svg viewBox="0 0 64 64" class="w-11 h-11">
          <path d="M12 24 L36 18 V46 L12 40 Z" fill="#94A3B8" stroke="#1E293B" stroke-width="3.5"/>
          <ellipse cx="36" cy="32" rx="5" ry="14" fill="#1E293B"/>
          <circle cx="50" cy="32" r="8" fill="none" stroke="#38BDF8" stroke-width="3.5" stroke-dasharray="4 2"/>
        </svg>`
      },
      {
        id: 'svg-smalllight',
        name: '神奇缩小灯',
        emoji: '🔦',
        stamp: '【🔦缩小灯化繁为简章】',
        svg: `<svg viewBox="0 0 64 64" class="w-11 h-11">
          <rect x="12" y="26" width="24" height="14" rx="4" fill="#EF4444" stroke="#1E293B" stroke-width="3.2"/>
          <path d="M36 22 L46 18 V48 L36 44 Z" fill="#FDE047" stroke="#1E293B" stroke-width="3.2"/>
          <path d="M46 22 L58 14 V52 L46 44 Z" fill="#FEF08A" opacity="0.75"/>
        </svg>`
      },
      {
        id: 'svg-doramibow',
        name: '哆啦美蝴蝶结',
        emoji: '🎀',
        stamp: '【🎀哆啦美元气蝴蝶结章】',
        svg: `<svg viewBox="0 0 64 64" class="w-11 h-11">
          <path d="M32 32 L12 16 C8 24 8 40 12 48 Z" fill="#FB7185" stroke="#1E293B" stroke-width="3.5"/>
          <path d="M32 32 L52 16 C56 24 56 40 52 48 Z" fill="#FB7185" stroke="#1E293B" stroke-width="3.5"/>
          <circle cx="32" cy="32" r="8" fill="#FFD700" stroke="#1E293B" stroke-width="3.5"/>
        </svg>`
      }
    ];

    const TAROT_FORTUNE_CARDS = [
      {
        slotTitle: '🌅 晨曦之牌',
        gadget: '🚁 竹蜻蜓 · 轻盈腾飞签',
        stars: '⭐⭐⭐⭐⭐ 大吉',
        luckyColor: '🩵 晴空蓝',
        desc: '放下沉重的包袱，今天适合主动迈出第一步，好消息会顺着微风吹向你！',
        emoji: '🚁'
      },
      {
        slotTitle: '☀️ 晴空之牌',
        gadget: '🥞 美食桌布 · 能量满格签',
        stars: '⭐⭐⭐⭐⭐ 超吉',
        luckyColor: '🍯 铜锣烧金',
        desc: '好好吃一顿热乎乎的美食，味蕾被治愈的同时，工作与学习灵感也会翻倍湧现！',
        emoji: '🥞'
      },
      {
        slotTitle: '🌙 星夜之牌',
        gadget: '🚪 任意门 · 心想事成签',
        stars: '⭐⭐⭐⭐⭐ 上上签',
        luckyColor: '🌸 樱花粉',
        desc: '你一直挂念的小目标正在悄悄开花，今晚早点休息，好梦会穿过任意门来找你~',
        emoji: '🚪'
      }
    ];

    let rpsWinStreak = Number(getDayRecord(state.activeDate).rpsWinStreak) || 0;
    let revealedTarotSlots = { 0: false, 1: true, 2: false };
    let activeTarotIndex = 1;
    let activeLightBeamMode = 'normal';

    function ensurePhase5Defaults() {
      if (!state.fabSkin || !FLOATING_PORTAL_SKINS[state.fabSkin]) {
        state.fabSkin = 'door';
      }
      if (!state.wishingPlant) {
        state.wishingPlant = {
          wish: '早睡早起，攒够旅行小金库 ✨',
          exp: 65,
          harvested: 2
        };
      }
    }

    // Floating Portal FAB Skin Switcher
    function setFloatingPortalSkin(skinKey) {
      ensurePhase5Defaults();
      if (!FLOATING_PORTAL_SKINS[skinKey]) return;
      playSFX('gadget');
      state.fabSkin = skinKey;
      saveStorage(state);
      renderFabSkinSelector();
      showToast(`🚪 悬浮图标已换装为：【${FLOATING_PORTAL_SKINS[skinKey].name}】`);
    }

    function renderFabSkinSelector() {
      ensurePhase5Defaults();
      const skin = FLOATING_PORTAL_SKINS[state.fabSkin] || FLOATING_PORTAL_SKINS.door;
      const fab = document.getElementById('anywhere-door-fab');
      if (fab) {
        fab.style.background = skin.bg;
        fab.innerHTML = `
          ${skin.svg}
          <span class="text-[10px] font-black text-white bg-slate-900/85 px-1.5 py-0.2 rounded-full leading-tight -mt-1 pointer-events-none">${skin.label}</span>
        `;
      }
      const badge = document.getElementById('active-fab-skin-badge');
      if (badge) badge.textContent = `当前造型：${skin.name}`;

      const grid = document.getElementById('fab-skin-selector-grid');
      if (grid) {
        grid.innerHTML = Object.entries(FLOATING_PORTAL_SKINS).map(([k, meta]) => {
          const isCur = k === state.fabSkin;
          return `
            <button type="button" onclick="setFloatingPortalSkin('${k}')" class="svg-badge-btn p-2 flex flex-col items-center justify-center ${isCur ? 'bg-[#FFD700] font-black' : 'bg-white hover:bg-pink-50'}">
              <div class="w-8 h-9 flex items-center justify-center">${meta.svg}</div>
              <span class="text-[10px] font-black text-slate-900 mt-1 truncate w-full text-center">${meta.label}</span>
            </button>
          `;
        }).join('');
      }
    }

    // 8 Illustrated SVG Gadget Badges
    function renderSvgIllustratedBadges() {
      const grid = document.getElementById('svg-illustrated-badges-grid');
      if (!grid) return;
      grid.innerHTML = ILLUSTRATED_SVG_BADGES.map(b => `
        <button type="button" onclick="useSvgIllustratedBadge('${b.id}')" class="svg-badge-btn p-2 bg-amber-50/50 hover:bg-amber-100 flex flex-col items-center justify-center text-center">
          <div class="w-11 h-11 flex items-center justify-center mb-1">${b.svg}</div>
          <span class="text-[10px] font-black text-slate-800 truncate w-full">${b.name}</span>
        </button>
      `).join('');
    }

    function useSvgIllustratedBadge(badgeId) {
      const b = ILLUSTRATED_SVG_BADGES.find(item => item.id === badgeId);
      if (!b) return;
      playSFX('gadget');
      triggerHaptic(12);
      insertSticker(b.stamp);
      addStickerToCollage(b.emoji);
      spawnFloatingParticles([b.emoji, '✨', '🔔']);
      showToast(`🎨 已盖下手绘徽章${b.stamp}，并同步贴入拍立得画板！`);
    }

    // Doraemon Round-Hand Rock-Paper-Scissors & Soundpad
    function playDoraRps(userMove) {
      triggerHaptic(12);
      const dailyRecord = getDayRecord(state.activeDate);
      rpsWinStreak = Number(dailyRecord.rpsWinStreak) || 0;
      const doraMoves = ['rock', 'rock', 'rock', 'scissors', 'paper'];
      const doraMove = doraMoves[Math.floor(Math.random() * doraMoves.length)];
      const moveLabels = { rock: '✊ 圆手石头', scissors: '✌️ 道具剪刀', paper: '✋ 道具布' };
      const userLabels = { rock: '✊ 石头', scissors: '✌️ 剪刀', paper: '✋ 布' };
      let outcome = 'draw';
      if ((userMove === 'paper' && doraMove === 'rock') ||
          (userMove === 'rock' && doraMove === 'scissors') ||
          (userMove === 'scissors' && doraMove === 'paper')) outcome = 'win';
      else if (userMove !== doraMove) outcome = 'lose';

      const pill = document.getElementById('dora-rps-result-pill');
      const quoteEl = document.getElementById('dora-quote');
      if (outcome === 'win') {
        rpsWinStreak++;
        state.coins += 8;
        playSFX('coin');
        spawnFloatingParticles(['🎉', '✊', '🔔', '🥞']);
        if (pill) pill.textContent = `🎉 你赢啦 (${userLabels[userMove]} vs ${moveLabels[doraMove]}) · 连胜 ${rpsWinStreak} 局`;
        if (quoteEl) quoteEl.textContent = doraMove === 'rock'
          ? `“哇啊啊！${getUserName()}又欺负我只有圆手只能出✊石头！给你 +8 🔔 铃铛币啦~”`
          : `“呜哇，连秘密道具猜拳手套都被${getUserName()}看穿了！太厉害啦 (+8 🔔)”`;
      } else if (outcome === 'draw') {
        playSFX('bell');
        if (pill) pill.textContent = `🤝 平局心有灵犀 (${userLabels[userMove]}) · 连胜 ${rpsWinStreak} 局`;
        if (quoteEl) quoteEl.textContent = `“嘿嘿，和${getUserName()}出的一模一样，我们真是心有灵犀的好搭档！”`;
      } else {
        rpsWinStreak = 0;
        playSFX('gadget');
        if (pill) pill.textContent = `😼 哆啦险胜 (${moveLabels[doraMove]}) · 再来一局`;
        if (quoteEl) quoteEl.textContent = `“锵锵！我偷偷戴了【百战百胜猜拳手套】出了${moveLabels[doraMove]}！再来一局吧~”`;
      }
      dailyRecord.rpsWinStreak = rpsWinStreak;
      if (quoteEl) dailyRecord.doraQuote = quoteEl.textContent;
      saveStorage(state);
      renderHUD();
    }

    function playGadgetSoundPad(soundKey) {
      ensureAudio();
      triggerHaptic(10);
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(getPocketSfxOutput());

      if (soundKey === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1174.66, now);
        osc.frequency.exponentialRampToValueAtTime(1760.0, now + 0.12);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        showToast('🔔 叮铃铃~ 四次元金铃铛清脆鸣响！');
      } else if (soundKey === 'hopter') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(760, now + 0.28);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        showToast('🚁 呼呼呼~ 竹蜻蜓反重力螺旋桨高速旋转！');
      } else if (soundKey === 'door') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.32);
        gain.gain.setValueAtTime(0.13, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.start(now);
        osc.stop(now + 0.34);
        showToast('🚪 吱呀~ 粉红任意门已跨时空开启！');
      } else if (soundKey === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.25);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.start(now);
        osc.stop(now + 0.26);
        showToast('🔦 哔——！缩小灯还原光线发射！');
      }
    }

    // Celebratory Dorayaki & Bell Rain
    function triggerDorayakiRain() {
      playSFX('gadget');
      setTimeout(() => playSFX('bell'), 180);
      triggerHaptic(20);
      const icons = ['🥞', '🔔', '🚁', '🚪', '🌸', '✨', '🍞', '💖'];
      for (let i = 0; i < 24; i++) {
        setTimeout(() => {
          const drop = document.createElement('div');
          drop.className = 'dorayaki-rain-item';
          drop.textContent = icons[i % icons.length];
          drop.style.left = `${4 + Math.random() * 90}vw`;
          drop.style.animationDuration = `${2.0 + Math.random() * 1.2}s`;
          document.body.appendChild(drop);
          setTimeout(() => drop.remove(), 3300);
        }, i * 55);
      }
      state.coins += 6;
      saveStorage(state);
      renderHUD();
      showToast('🎊 哇！美食桌布降下了漫天铜锣烧流星雨！(+6 🔔)');
    }

    // Small Light / Big Light View Toggle
    function toggleLightBeamMode(mode) {
      playGadgetSoundPad('laser');
      if (activeLightBeamMode === mode) {
        activeLightBeamMode = 'normal';
      } else {
        activeLightBeamMode = mode;
      }
      document.body.classList.remove('small-light-mode', 'big-light-mode');
      if (activeLightBeamMode === 'small') {
        document.body.classList.add('small-light-mode');
        showToast('🔦 已用【缩小灯】将手账卡片缩成精致紧凑视图！（再次点击恢复）');
      } else if (activeLightBeamMode === 'big') {
        document.body.classList.add('big-light-mode');
        showToast('🔎 已用【放大灯】将手账文字放大为舒适大字版！（再次点击恢复）');
      } else {
        showToast('🧣 已恢复标准手账视图比例！');
      }
    }

    // Dorayaki Tarot Fortune Deck
    function renderTarotDeck() {
      const stage = document.getElementById('tarot-cards-stage');
      const detailBox = document.getElementById('tarot-fortune-detail');
      if (!stage) return;

      stage.innerHTML = TAROT_FORTUNE_CARDS.map((c, idx) => {
        const isOpen = Boolean(revealedTarotSlots[idx]);
        const isSelected = activeTarotIndex === idx;
        if (!isOpen) {
          return `
            <button type="button" onclick="flipTarotCard(${idx})" class="comic-card-sm p-3 bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-900 text-white min-h-[148px] flex flex-col items-center justify-between hover:-translate-y-0.5 transition">
              <span class="text-[10px] font-mono-num text-amber-300">${c.slotTitle}</span>
              <div class="w-12 h-12 rounded-full border-2 border-amber-300 bg-white/10 flex items-center justify-center text-2xl">
                🔔
              </div>
              <span class="text-[10px] font-black text-amber-200 bg-white/15 px-2 py-0.5 rounded-full">点击翻牌 ✨</span>
            </button>
          `;
        }
        return `
          <button type="button" onclick="flipTarotCard(${idx})" class="tarot-flip-anim comic-card-sm p-2.5 bg-[#FFFDF7] min-h-[148px] flex flex-col items-center justify-between text-center ${isSelected ? 'ring-2 ring-[#E60012] bg-amber-50' : ''}">
            <span class="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-slate-900">${c.stars}</span>
            <div class="text-3xl my-1">${c.emoji}</div>
            <div class="text-xs font-black text-slate-900 leading-tight">${c.gadget.split('·')[0]}</div>
            <span class="text-[10px] font-bold text-rose-700">${c.luckyColor}</span>
          </button>
        `;
      }).join('');

      const cur = TAROT_FORTUNE_CARDS[activeTarotIndex] || TAROT_FORTUNE_CARDS[0];
      if (detailBox) {
        detailBox.innerHTML = `
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 text-xs font-black text-slate-900">
              <span>${cur.emoji} ${cur.gadget}</span>
              <span class="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-800">幸运色：${cur.luckyColor}</span>
            </div>
            <p class="text-[11px] text-slate-600 font-bold mt-0.5 leading-snug">${cur.desc}</p>
          </div>
          <button type="button" onclick="stampTarotToDiary()" class="comic-btn bg-[#FFD700] hover:bg-amber-400 text-slate-900 text-xs font-black px-3 py-1.5 rounded-xl shrink-0">
            📌 贴入手账
          </button>
        `;
      }
    }

    function flipTarotCard(idx) {
      playSFX('gadget');
      triggerHaptic(12);
      revealedTarotSlots[idx] = true;
      activeTarotIndex = idx;
      const cur = TAROT_FORTUNE_CARDS[idx];
      spawnFloatingParticles([cur.emoji, '🔮', '✨', '🔔']);
      renderTarotDeck();
      showToast(`🔮 翻开了【${cur.slotTitle}】：${cur.gadget}！`);
    }

    function resetTarotDeck() {
      playSFX('bell');
      revealedTarotSlots = { 0: false, 1: false, 2: false };
      // Shuffle tarot fortunes slightly
      TAROT_FORTUNE_CARDS.sort(() => Math.random() - 0.5);
      renderTarotDeck();
      showToast('🔄 塔罗牌已重新洗牌，请凭直觉翻开一张吧！');
    }

    function stampTarotToDiary() {
      const cur = TAROT_FORTUNE_CARDS[activeTarotIndex] || TAROT_FORTUNE_CARDS[0];
      insertSticker(`【🔮今日塔罗吉签：${cur.gadget}｜幸运色${cur.luckyColor}】`);
      showToast('🔮 已将今日塔罗幸运签贴入手账正文！');
    }

    // 4D Wishing Plant Pot
    function getPlantStageMeta(exp) {
      if (exp < 25) return { lv: 1, badge: 'Lv.1 🌰 愿望种子', tip: '🌱 多浇点晨露和暖阳，种子很快就会发芽啦！' };
      if (exp < 50) return { lv: 2, badge: 'Lv.2 🌱 破土嫩芽', tip: '🌱 嫩芽已经钻出土壤，继续呵护它长大吧~' };
      if (exp < 75) return { lv: 3, badge: 'Lv.3 🌿 翡翠枝叶', tip: `🌿 再浇灌 ${100 - exp} 点能量即可结出黄金铜锣烧果！` };
      if (exp < 100) return { lv: 4, badge: 'Lv.4 🌷 铃铛花苞', tip: `🌷 花苞摇摇欲坠，还差 ${100 - exp} 点能量就结果啦！` };
      return { lv: 5, badge: 'Lv.5 🥞 铜锣烧果树', tip: '🎉 已结出饱满的黄金铜锣烧许愿果！继续浇灌可收获新果实~' };
    }

    function getPlantSvgByLevel(lv) {
      let plantTop = '';
      if (lv === 1) {
        plantTop = `<ellipse cx="60" cy="70" rx="10" ry="7" fill="#92400E" stroke="#1E293B" stroke-width="3"/>`;
      } else if (lv === 2) {
        plantTop = `
          <path d="M60 72 V48" stroke="#15803D" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M60 52 C46 42 42 56 60 58" fill="#22C55E" stroke="#1E293B" stroke-width="3"/>
          <path d="M60 52 C74 42 78 56 60 58" fill="#4ADE80" stroke="#1E293B" stroke-width="3"/>
        `;
      } else if (lv === 3) {
        plantTop = `
          <path d="M60 72 V34" stroke="#15803D" stroke-width="5" stroke-linecap="round"/>
          <path d="M60 56 C40 44 38 62 60 62" fill="#22C55E" stroke="#1E293B" stroke-width="3"/>
          <path d="M60 50 C80 38 82 56 60 56" fill="#4ADE80" stroke="#1E293B" stroke-width="3"/>
          <path d="M60 38 C44 26 42 42 60 44" fill="#10B981" stroke="#1E293B" stroke-width="3"/>
        `;
      } else if (lv === 4) {
        plantTop = `
          <path d="M60 72 V28" stroke="#15803D" stroke-width="5" stroke-linecap="round"/>
          <path d="M60 56 C40 44 38 62 60 62" fill="#22C55E" stroke="#1E293B" stroke-width="3"/>
          <path d="M60 50 C80 38 82 56 60 56" fill="#4ADE80" stroke="#1E293B" stroke-width="3"/>
          <circle cx="60" cy="24" r="12" fill="#FB7185" stroke="#1E293B" stroke-width="3.2"/>
          <circle cx="60" cy="24" r="5" fill="#FDE047"/>
        `;
      } else {
        plantTop = `
          <circle cx="60" cy="36" r="24" fill="#4ADE80" stroke="#1E293B" stroke-width="3.5"/>
          <path d="M60 72 V42" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
          <circle cx="48" cy="30" r="8" fill="#D97706" stroke="#1E293B" stroke-width="2.5"/>
          <circle cx="72" cy="34" r="8" fill="#D97706" stroke="#1E293B" stroke-width="2.5"/>
          <circle cx="60" cy="20" r="7" fill="#FFD700" stroke="#1E293B" stroke-width="2.5"/>
        `;
      }

      return `<svg viewBox="0 0 120 115" class="w-full h-full">
        <circle cx="24" cy="22" r="8" fill="#FEF08A" opacity="0.85"/>
        ${plantTop}
        <!-- 4D Pocket Flowerpot -->
        <rect x="28" y="68" width="64" height="10" rx="4" fill="#0096E6" stroke="#1E293B" stroke-width="3.2"/>
        <path d="M34 78 H86 L78 106 H42 Z" fill="#38BDF8" stroke="#1E293B" stroke-width="3.2"/>
        <path d="M44 84 H76 C76 96 68 101 60 101 C52 101 44 96 44 84 Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5"/>
        <circle cx="60" cy="78" r="5.5" fill="#FFD700" stroke="#1E293B" stroke-width="2.5"/>
      </svg>`;
    }

    function renderWishingPlant() {
      ensurePhase5Defaults();
      const p = state.wishingPlant;
      const meta = getPlantStageMeta(p.exp || 0);

      const badge = document.getElementById('plant-stage-badge');
      if (badge) badge.textContent = meta.badge;

      const svgBox = document.getElementById('wishing-plant-svg-box');
      if (svgBox) svgBox.innerHTML = getPlantSvgByLevel(meta.lv);

      const wishInput = document.getElementById('plant-wish-input');
      if (wishInput && document.activeElement !== wishInput) {
        wishInput.value = p.wish || '早睡早起，攒够旅行小金库 ✨';
      }

      const expText = document.getElementById('plant-exp-text');
      if (expText) expText.textContent = `${Math.min(100, p.exp)} / 100`;

      const expBar = document.getElementById('plant-exp-bar');
      if (expBar) expBar.style.width = `${Math.min(100, p.exp)}%`;

      const tipEl = document.getElementById('plant-status-tip');
      if (tipEl) tipEl.textContent = meta.tip;

      const harvEl = document.getElementById('plant-harvest-count');
      if (harvEl) harvEl.textContent = `已收获 ${p.harvested || 0} 颗果`;
    }

    function savePlantWishTitle(val) {
      ensurePhase5Defaults();
      state.wishingPlant.wish = (val || '').trim() || '早睡早起，心想事成 ✨';
      saveStorage(state);
      showToast('🌱 心愿木牌已更新！');
    }

    function nurtureWishingPlant(action) {
      ensurePhase5Defaults();
      const p = state.wishingPlant;
      const delta = action === 'song' ? 20 : 15;
      p.exp = (p.exp || 0) + delta;

      const svgBox = document.getElementById('wishing-plant-svg-box');
      if (svgBox) {
        svgBox.classList.remove('plant-grow-bounce');
        void svgBox.offsetWidth;
        svgBox.classList.add('plant-grow-bounce');
      }

      if (p.exp >= 100) {
        p.exp = 20;
        p.harvested = (p.harvested || 0) + 1;
        state.coins += 25;
        playSFX('gadget');
        spawnFloatingParticles(['🥞', '🌸', '🎉', '🔔']);
        showToast(`🎉 许愿盆栽结出了第 ${p.harvested} 颗黄金铜锣烧果！收获 +25 🔔 铃铛币！`);
      } else {
        playSFX('coin');
        const icons = action === 'water' ? ['💧', '🌱', '✨'] : action === 'sun' ? ['☀️', '🌿', '✨'] : ['🎵', '🌸', '✨'];
        spawnFloatingParticles(icons);
        showToast(`🌱 盆栽能量 +${delta}！离结出铜锣烧许愿果越来越近啦~`);
      }

      saveStorage(state);
      renderWishingPlant();
      renderHUD();
    }


    function renderAll() {
      updateClock();
      applyCozyNightModeUI();
      applyPrivacyBlurUI();
      renderHUD();
      renderDoraPetAccessory();
      renderMoodAndWeather();
      renderPaperAndStamp();
      renderWashiAndStampCorner();
      renderSleepTracker();
      renderDorayakiStamps();
      renderExpenses();
      renderBmiStation();
      renderTodos();
      renderHabitBoard();
      renderCountdownCapsules();
      renderInspirationBox();
      renderDayTags();
      renderCollageStage();
      renderVoiceMemos();
      renderFutureMailbox();
      renderWeeklyBooklet();
      renderThemeQuestProgress();
      renderDiaries();
      renderCalendar();
      renderGadgets();
      renderCafe();
      renderAirCannon();
      renderMemoryBread();
      renderCorrelationInsights();
      renderStats();
      renderAchievements();
      renderAppIconStudio();
      renderTimeTvProjector();
      renderBackHillMap();
      renderFabSkinSelector();
      renderSvgIllustratedBadges();
      renderTarotDeck();
      renderWishingPlant();
      renderStorageHealth();
      updateTimerUI();
    }

    function initApp() {
      seedEnhancedStateDefaults();
      initFloatingAnywhereDoorFab();
      const activeDay = getDayRecord(state.activeDate);
      state.draftTitle = activeDay.draftTitle || state.draftTitle || '';
      state.draftContent = activeDay.draftContent || state.draftContent || '';
      renderAll();
      const titleInput = document.getElementById('diary-title');
      const contentInput = document.getElementById('diary-content');
      if (state.draftTitle) titleInput.value = state.draftTitle;
      if (state.draftContent) contentInput.value = state.draftContent;
      updateWordCount();

      titleInput.oninput = () => {
        state.draftTitle = titleInput.value;
        getDayRecord(state.activeDate).draftTitle = titleInput.value;
        saveStorage(state);
      };
      contentInput.oninput = () => {
        state.draftContent = contentInput.value;
        getDayRecord(state.activeDate).draftContent = contentInput.value;
        updateWordCount();
        saveStorage(state);
      };
    }

    setInterval(updateClock, 1000);
    
  

/* Local repairs only: preserve the original content and function sequence. */
(() => {
  let sfxOutput;
  let lastEffectAt = -Infinity;
  let lastKeyAt = -Infinity;
  const enabled = () => state.uiSfxEnabled !== false;
  window.getPocketSfxOutput = function () {
    if (!sfxOutput && audioCtx) { sfxOutput = audioCtx.createGain(); sfxOutput.connect(audioCtx.destination); }
    if (sfxOutput) sfxOutput.gain.value = enabled() ? 1 : 0;
    return sfxOutput || audioCtx.destination;
  };
  const originalPlay = playSFX;
  window.playSFX = function (type) {
    if (!enabled()) return;
    lastEffectAt = performance.now();
    return originalPlay(type);
  };
  const originalPad = playGadgetSoundPad;
  window.playGadgetSoundPad = function (key) {
    if (!enabled()) return;
    lastEffectAt = performance.now();
    return originalPad(key);
  };
  function littleSound(kind) {
    if (!enabled()) return;
    try {
      ensureAudio(); if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const notes = kind === 'key' ? [660] : kind === 'close' ? [740,554] : kind === 'door' ? [523,784,1047] : [784,988];
      notes.forEach((freq,i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        const start = now+i*.045;
        o.type = kind === 'key' ? 'sine' : 'triangle';
        o.frequency.setValueAtTime(freq, start);
        o.frequency.exponentialRampToValueAtTime(freq*1.05,start+.035);
        g.gain.setValueAtTime(.001,start);
        g.gain.linearRampToValueAtTime(kind === 'key' ? .018 : .045,start+.006);
        g.gain.exponentialRampToValueAtTime(.001,start+.075);
        o.connect(g); g.connect(getPocketSfxOutput());
        o.onended = () => {o.disconnect();g.disconnect();};
        o.start(start);o.stop(start+.08);
      });
      lastEffectAt = performance.now();
    } catch (_) {}
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('button,a,[onclick],[role="button"],label,input,select,summary');
    if (!target || target.disabled || target.closest('[data-sfx-toggle]')) return;
    const before = lastEffectAt;
    queueMicrotask(() => {
      if (lastEffectAt !== before) return;
      const action = target.getAttribute('onclick') || '';
      littleSound(/close|Close/.test(action) ? 'close' : /door|Door|switchTab/.test(action) ? 'door' : 'tap');
    });
  },true);
  document.addEventListener('keydown', event => {
    if (event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.matches('input:not([type="file"]),textarea,[contenteditable="true"]') &&
        (event.key.length === 1 || ['Backspace','Delete','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))) {
      littleSound('key');lastKeyAt = performance.now();
    }
  },true);
  document.addEventListener('input', event => {
    if (event.isComposing || performance.now()-lastKeyAt<55) return;
    if (event.target.matches('input:not([type="file"]),textarea,[contenteditable="true"]')) littleSound('key');
  },true);
  document.addEventListener('compositionend', () => littleSound('key'),true);

  document.addEventListener('pocket-ready', () => {
    const header = document.querySelector('header > div:first-child');
    const controls = header.lastElementChild;
    const tools = document.createElement('div'); tools.id = 'original-header-tools';
    [...controls.children].slice(1).forEach(node => tools.appendChild(node));
    controls.appendChild(tools);
    const toggle = document.createElement('button');
    toggle.id = 'original-tools-toggle';toggle.type = 'button';
    toggle.className = 'comic-btn bg-white text-slate-900 rounded-full text-xs font-black';
    toggle.innerHTML = '<span aria-hidden="true">☰</span><span>工具</span>';
    toggle.setAttribute('aria-controls','original-tools-modal');toggle.setAttribute('aria-expanded','false');
    controls.insertBefore(toggle,tools);
    const modal = document.createElement('div');
    modal.id = 'original-tools-modal';modal.className = 'fixed inset-0 z-50 bg-slate-900/60 hidden items-center justify-center';
    modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','original-tools-title');
    modal.innerHTML = '<div class="comic-card bg-white p-4 relative"><h3 id="original-tools-title" class="font-title text-lg">口袋工具</h3><button type="button" aria-label="关闭口袋工具" class="absolute top-3 right-3 comic-btn rounded-full bg-rose-50 w-11" id="original-tools-close">✕</button><div class="original-tools-grid" id="original-tools-grid"></div></div>';
    document.body.appendChild(modal);
    const grid = document.getElementById('original-tools-grid');
    const sound = document.createElement('button');sound.type='button';sound.dataset.sfxToggle='true';
    sound.className='comic-btn bg-amber-50 text-slate-900 px-3 py-2 rounded-full text-xs font-black';
    const sync = () => {sound.textContent=enabled() ? '音效：开' : '音效：关';sound.setAttribute('aria-pressed',String(enabled()));if(sfxOutput)sfxOutput.gain.value=enabled()?1:0;};
    sound.addEventListener('click',()=>{state.uiSfxEnabled=!enabled();sync();saveStorage(state,{flush:true});if(enabled())littleSound('door');});
    tools.appendChild(sound);sync();
    const close = () => {modal.classList.add('hidden');modal.classList.remove('flex');toggle.setAttribute('aria-expanded','false');toggle.focus({preventScroll:true});};
    const open = () => {modal.classList.remove('hidden');modal.classList.add('flex');toggle.setAttribute('aria-expanded','true');document.getElementById('original-tools-close').focus({preventScroll:true});};
    toggle.addEventListener('click',open);
    document.getElementById('original-tools-close').addEventListener('click',close);
    modal.addEventListener('click', e => {if(e.target===modal)close();});
    grid.addEventListener('click',e=>{if(e.target.closest('button:not([data-sfx-toggle])'))close();},true);
    const media = matchMedia('(max-width: 639px)');
    const adapt = () => {const from=media.matches?tools:grid,to=media.matches?grid:tools;[...from.children].forEach(node=>to.appendChild(node));close();};
    media.addEventListener('change',adapt);adapt();
  });
})();



/* Calendar-day rollover, daily-list ownership and routing for the original layout. */
(() => {
  let previousDoorFocus = null;
  let previousDoorScroll = 0;
  let backgroundAria = [];
  let activeRpsUiDate = null;
  let appReady = false;

  window.normalizePocketDailyRecords = function (dateKey) {
    if (!state || typeof state !== 'object') return;
    if (!state.days || typeof state.days !== 'object' || Array.isArray(state.days)) state.days = {};
    const owner = dateKey || state.lastObservedDate || state.lastSavedActiveDate || state.activeDate || getTodayKey();
    state.mealLogs = Array.isArray(state.mealLogs)
      ? state.mealLogs.map(item => ({...item, dateKey: item.dateKey || owner}))
      : [];
    state.todos = Array.isArray(state.todos)
      ? state.todos.map(item => ({...item, date: item.date || owner}))
      : [];
    state.diaries = Array.isArray(state.diaries) ? state.diaries : [];

    const legacyDate = state.lastObservedDate || state.lastSavedActiveDate || state.activeDate || owner;
    if (!state.dailyQuoteMigrationV1) {
      if (typeof state.doraQuote === 'string' && state.doraQuote && !getDayRecord(legacyDate).doraQuote) {
        getDayRecord(legacyDate).doraQuote = state.doraQuote;
      }
      state.dailyQuoteMigrationV1 = true;
      delete state.doraQuote;
    }
    if (!state.dailyRpsMigrationV1) {
      if (Number.isFinite(Number(state.rpsWinStreak))) {
        const streakDate = state.rpsStreakDate || legacyDate;
        getDayRecord(streakDate).rpsWinStreak = Math.max(0, Number(state.rpsWinStreak) || 0);
      }
      state.dailyRpsMigrationV1 = true;
    }
    delete state.rpsWinStreak;
    delete state.rpsStreakDate;
  };

  function saveVisibleDraft(dateKey) {
    const title = document.getElementById('diary-title');
    const content = document.getElementById('diary-content');
    const day = getDayRecord(dateKey);
    if (!appReady) {
      day.draftTitle = day.draftTitle || state.draftTitle || '';
      day.draftContent = day.draftContent || state.draftContent || '';
      return;
    }
    if (title) day.draftTitle = title.value;
    if (content) day.draftContent = content.value;
    if (state.activeDate === dateKey) {
      state.draftTitle = day.draftTitle || '';
      state.draftContent = day.draftContent || '';
    }
  }

  function syncActiveRpsStreak() {
    const day = getDayRecord(state.activeDate);
    if (!Object.prototype.hasOwnProperty.call(day, 'rpsWinStreak')) day.rpsWinStreak = 0;
    rpsWinStreak = Number(day.rpsWinStreak) || 0;
    activeRpsUiDate = state.activeDate;
    const pill = document.getElementById('dora-rps-result-pill');
    if (pill) pill.textContent = `圆手待命 · 连胜 ${rpsWinStreak} 局`;
  }
  window.syncPocketRpsStreak = syncActiveRpsStreak;

  window.finalizePocketInitialState = function () {
    if (!state || state.pocketInitialDefaultsV1 || window.pocketJournalHadStoredData) return false;
    const today = getTodayKey();
    const defaults = {
      followCurrentDate: true,
      lastObservedDate: today,
      dailyQuoteMigrationV1: true,
      dailyRpsMigrationV1: true,
      pocketInitialDefaultsV1: true
    };
    Object.assign(state, defaults);
    return true;
  };

  window.reconcilePocketDailyDate = function ({render = true, flush = false} = {}) {
    if (!state || typeof getTodayKey !== 'function' || typeof getDayRecord !== 'function') return false;
    const today = getTodayKey();
    const previous = state.lastObservedDate || state.activeDate || today;
    if (state.followCurrentDate == null) {
      if (state.lastObservedDate) state.followCurrentDate = state.activeDate === state.lastObservedDate;
      else if (state.lastSavedDate && state.lastSavedActiveDate) state.followCurrentDate = state.lastSavedDate === state.lastSavedActiveDate;
      else state.followCurrentDate = true;
    }
    normalizePocketDailyRecords(previous);

    const changed = previous !== today;
    const needsInitialSave = !state.lastObservedDate;
    if (changed) {
      saveVisibleDraft(state.activeDate || previous);
      state.lastObservedDate = today;
      // Creating a date record initializes daily counters and lists without touching history.
      getDayRecord(today);
      if (state.followCurrentDate) {
        state.activeDate = today;
        const fresh = getDayRecord(today);
        state.draftTitle = fresh.draftTitle || '';
        state.draftContent = fresh.draftContent || '';
      } else {
        const viewed = getDayRecord(state.activeDate || previous);
        state.draftTitle = viewed.draftTitle || '';
        state.draftContent = viewed.draftContent || '';
      }
      if (render && document.getElementById('diary-title')) {
        renderAll();
        document.getElementById('diary-title').value = state.draftTitle;
        document.getElementById('diary-content').value = state.draftContent;
        updateWordCount();
      }
    } else {
      state.lastObservedDate = today;
    }
    if (changed || needsInitialSave || activeRpsUiDate !== state.activeDate) syncActiveRpsStreak();
    if (changed || needsInitialSave) saveStorage(state, {flush});
    return changed;
  };

  function setBackgroundHidden(hidden) {
    const targets = [document.querySelector('body > header'), document.querySelector('body > main'),
      document.querySelector('body > nav'), document.getElementById('anywhere-door-fab')].filter(Boolean);
    if (hidden) {
      backgroundAria = targets.map(node => [node, node.getAttribute('aria-hidden'), !!node.inert]);
      targets.forEach(node => { node.setAttribute('aria-hidden', 'true'); if ('inert' in node) node.inert = true; });
    } else {
      backgroundAria.forEach(([node, value, wasInert]) => {
        if (value == null) node.removeAttribute('aria-hidden'); else node.setAttribute('aria-hidden', value);
        if ('inert' in node) node.inert = wasInert;
      });
      backgroundAria = [];
    }
  }

  window.openAnywhereDoorModal = function () {
    const modal = document.getElementById('anywhere-door-modal');
    if (!modal || !modal.classList.contains('hidden')) return;
    if (!document.getElementById('original-tools-modal')?.classList.contains('hidden')) {
      document.getElementById('original-tools-close')?.click();
    }
    previousDoorFocus = document.activeElement;
    previousDoorScroll = window.scrollY;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'false');
    setBackgroundHidden(true);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    playSFX('gadget');
    triggerHaptic(12);
    const panel = modal.querySelector(':scope > .comic-card');
    if (panel) panel.scrollTop = 0;
    modal.querySelector('button')?.focus({preventScroll: true});
  };

  window.closeAnywhereDoorModal = function ({restoreFocus = true} = {}) {
    const modal = document.getElementById('anywhere-door-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
    setBackgroundHidden(false);
    if (restoreFocus && previousDoorFocus?.isConnected) previousDoorFocus.focus({preventScroll: true});
    if (restoreFocus && Math.abs(window.scrollY - previousDoorScroll) > 2) window.scrollTo(0, previousDoorScroll);
    previousDoorFocus = null;
  };

  function visibleDialogs() {
    return [...document.querySelectorAll('[id$="-modal"]')]
      .filter(node => !node.classList.contains('hidden') && getComputedStyle(node).display !== 'none')
      .sort((a,b) => Number(getComputedStyle(a).zIndex || 0) - Number(getComputedStyle(b).zIndex || 0) ||
        (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  }

  window.handleAndroidBack = function () {
    const modal = visibleDialogs().at(-1);
    if (!modal) return false;
    if (modal.id === 'anywhere-door-modal') { closeAnywhereDoorModal(); return true; }
    const closeButton = modal.querySelector('button[aria-label*="关闭"],button[onclick*="close" i],button[onclick*="Close"]');
    if (closeButton) closeButton.click();
    else { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    return true;
  };

  function routeToTarget(tabId, targetId, label) {
    const valid = ['journal','calendar','gadgets','timer'];
    const target = document.getElementById(targetId);
    if (!valid.includes(tabId) || !target) {
      showToast('这个入口暂时不可用，请重开任意门再试。');
      return;
    }
    closeAnywhereDoorModal({restoreFocus: false});
    playSFX('gadget');
    triggerHaptic(15);
    valid.forEach(tab => {
      const view = document.getElementById(`tab-${tab}`), button = document.getElementById(`nav-${tab}`);
      if (!view || !button) return;
      const active = tab === tabId;
      view.classList.toggle('hidden', !active);
      button.classList.toggle('text-[#0096E6]', active);
      button.classList.toggle('font-black', active);
      button.classList.toggle('scale-105', active);
      button.classList.toggle('text-slate-500', !active);
      button.classList.toggle('font-bold', !active);
    });
    if (tabId === 'calendar') renderCalendar();
    if (tabId === 'gadgets') {
      if (targetId === 'subview-dex' || targetId === 'subbtn-dex') switchSubGadgetView('dex');
      else if (targetId === 'subview-cafe' || targetId === 'subbtn-cafe' || targetId === 'cafe-menu-grid' || targetId === 'meal-log-list') switchSubGadgetView('cafe');
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const destination = document.getElementById(targetId);
      if (!destination || destination.closest('.hidden')) { showToast('目标区域目前不可见，请重开任意门再试。'); return; }
      destination.closest('details:not([open])')?.setAttribute('open', '');
      destination.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center'});
      destination.classList.remove('portal-arrival-flash');
      void destination.offsetWidth;
      destination.classList.add('portal-arrival-flash');
      destination.setAttribute('tabindex','-1');
      destination.focus({preventScroll:true});
      setTimeout(() => { if (destination.getAttribute('tabindex') === '-1') destination.removeAttribute('tabindex'); }, 900);
    }));
    spawnFloatingParticles(['🚪','✨','🌸']);
    showToast(`🚪 推开任意门，已瞬移至【${label}】！`);
  }

  normalizePocketDailyRecords(state.activeDate);
  reconcilePocketDailyDate({render: false, flush: true});
    finalizePocketInitialState();

  document.addEventListener('pocket-ready', () => {
    appReady = true;
    normalizePocketDailyRecords(state.activeDate);
    reconcilePocketDailyDate({render: false, flush: true});
    if (typeof renderAll === 'function') renderAll();
    const initialized = finalizePocketInitialState();
    const activeDay = getDayRecord(state.activeDate);
    const title = document.getElementById('diary-title'), content = document.getElementById('diary-content');
    if (title) title.value = state.draftTitle = activeDay.draftTitle || state.draftTitle || '';
    if (content) content.value = state.draftContent = activeDay.draftContent || state.draftContent || '';
    updateWordCount();
    syncActiveRpsStreak();
    if (typeof flushPocketJournal === 'function') flushPocketJournal();
    else if (initialized) saveStorage(state, {flush: true});
    window.setInterval(() => reconcilePocketDailyDate({flush: true}), 10000);
    window.addEventListener('focus', () => reconcilePocketDailyDate({flush: true}));
    window.addEventListener('pageshow', () => reconcilePocketDailyDate({flush: true}));
    window.addEventListener('pagehide', () => flushPocketJournal());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushPocketJournal();
      else reconcilePocketDailyDate({flush: true});
    });
    document.addEventListener('click', event => {
      const button = event.target.closest('#anywhere-door-modal button[onclick^="teleportViaAnywhereDoor"]');
      if (!button) return;
      const match = button.getAttribute('onclick').match(/^teleportViaAnywhereDoor\('([^']+)',\s*'([^']+)',\s*'([^']*)'\)$/);
      if (!match) return;
      event.preventDefault(); event.stopImmediatePropagation();
      routeToTarget(...match.slice(1));
    }, true);
    document.addEventListener('keydown', event => {
      const door = document.getElementById('anywhere-door-modal');
      const tools = document.getElementById('original-tools-modal');
      const active = visibleDialogs().at(-1);
      if (!active) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (active === door) closeAnywhereDoorModal();
        else document.querySelector(`#${CSS.escape(active.id)} button[aria-label*="关闭"],#${CSS.escape(active.id)} button[onclick*="close" i]`)?.click();
      } else if (event.key === 'Tab' && (active === door || active === tools)) {
        const focusables = [...active.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')]
          .filter(node => node.getClientRects().length);
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !active.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    });
  });
})();

