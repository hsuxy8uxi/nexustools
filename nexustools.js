/* START OF FILE - Nexus Control v2.0 */
(function() {
    /* Prevent multiple instances */
    if (document.getElementById('fun-effects-mega-ui')) return;

    /* Global state tracker for cleanup and toggles */
    const state = {
        matrix: { active: false, interval: null, canvas: null },
        fluid: { active: false, frame: null, canvas: null, listener: null },
        flow: { active: false, frame: null, canvas: null, listener: null },
        dvd: { active: false, frame: null, element: null, x: 0, y: 0, vx: 2, vy: 2 },
        shake: { active: false },
        magnify: { active: false, over: null, out: null },
        editMode: { active: false },
        zapper: { active: false, over: null, out: null, click: null, hoveredEl: null },
        ghost: { active: false, click: null },
        swapper: { active: false, click: null, url: '' },
        imager: { active: false, element: null, isDragging: false, isResizing: false },
        imgEditor: { active: false, click: null, over: null, out: null, toolbar: null, currentImg: null, dragRef: null },
        windows: []
    };

    const styleId = 'fun-effects-mega-styles';

    /* Inject CSS */
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            :root { --bg-panel: rgba(15, 20, 30, 0.95); --bg-header: rgba(0, 0, 0, 0.4); --text-main: #ffffff; --accent: #00f0ff; --accent-glow: rgba(0, 240, 255, 0.3); --btn-bg: rgba(255, 255, 255, 0.05); --btn-hover: rgba(255, 255, 255, 0.1); --font-main: system-ui, sans-serif; --border-rad: 12px }
            [data-mega-theme='matrix'] { --bg-panel: rgba(0, 10, 0, 0.95); --bg-header: rgba(0, 20, 0, 0.9); --text-main: #00ff00; --accent: #00ff00; --accent-glow: rgba(0, 255, 0, 0.3); --btn-bg: rgba(0, 255, 0, 0.05); --btn-hover: rgba(0, 255, 0, 0.15); --font-main: monospace; --border-rad: 0px }
            [data-mega-theme='synthwave'] { --bg-panel: linear-gradient(135deg, rgba(45, 10, 65, 0.95), rgba(15, 10, 40, 0.95)); --bg-header: rgba(0, 0, 0, 0.5); --text-main: #f3e6ff; --accent: #ff00ff; --accent-glow: rgba(255, 0, 255, 0.4); --btn-bg: rgba(255, 0, 255, 0.08); --btn-hover: rgba(255, 0, 255, 0.2); --border-rad: 8px }
            [data-mega-theme='light'] { --bg-panel: rgba(255, 255, 255, 0.95); --bg-header: rgba(240, 240, 240, 0.95); --text-main: #1a1a1a; --accent: #0066ff; --accent-glow: rgba(0, 102, 255, 0.2); --btn-bg: rgba(0, 0, 0, 0.04); --btn-hover: rgba(0, 0, 0, 0.08); --border-rad: 16px }
            
            @keyframes mega-enter { 0% { opacity: 0; transform: scale(0.9) translateY(-20px); filter: blur(10px) } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0) } }
            @keyframes mega-shake { 0% { transform: translate(2px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(0px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(2px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(2px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
            
            .mega-shake-active { animation: mega-shake 0.4s infinite !important; overflow: hidden !important; }
            .mega-window { position: fixed; background: var(--bg-panel); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--accent-glow); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--accent-glow); border-radius: var(--border-rad); display: flex; flex-direction: column; font-family: var(--font-main); color: var(--text-main); animation: mega-enter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; z-index: 9999990; resize: both; overflow: hidden; min-width: 300px; min-height: 400px }
            .mega-header { padding: 12px 16px; background: var(--bg-header); border-bottom: 1px solid var(--accent-glow); cursor: grab; display: flex; align-items: center; justify-content: space-between; font-weight: 700; font-size: 14px; user-select: none; flex-shrink: 0 }
            .mega-tab-bar { display: flex; border-bottom: 1px solid var(--accent-glow); background: rgba(0,0,0,0.2); }
            .mega-tab-btn { flex: 1; background: transparent; border: none; padding: 10px; color: var(--text-main); cursor: pointer; opacity: 0.7; font-weight: 600; border-bottom: 2px solid transparent; transition: all 0.2s; }
            .mega-tab-btn.active { opacity: 1; border-bottom: 2px solid var(--accent); background: rgba(255,255,255,0.05); }
            .mega-content { flex: 1; overflow-y: auto; padding: 16px; display: none; }
            .mega-content.active { display: block; }
            .mega-btn { width: 100%; padding: 10px 12px; margin-bottom: 6px; background: var(--btn-bg); border: 1px solid transparent; border-left: 3px solid transparent; border-radius: calc(var(--border-rad) / 2); color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 600; font-family: inherit; transition: all 0.2s }
            .mega-btn:hover { background: var(--btn-hover); border-left: 3px solid var(--accent); transform: translateX(3px) }
            .mega-btn.active { background: var(--accent-glow); border-color: var(--accent-glow); border-left: 3px solid var(--accent); color: var(--text-main); text-shadow: 0 0 8px var(--accent) }
            .mega-input, .mega-select { width: 100%; padding: 10px; margin-bottom: 8px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--accent-glow); color: var(--text-main); border-radius: calc(var(--border-rad) / 2); font-family: inherit; font-size: 12px; outline: none; box-sizing: border-box }
            .mega-toolbar { display: flex; gap: 5px; margin-bottom: 10px; padding: 5px; background: rgba(0,0,0,0.2); border-radius: 8px; align-items: center; }
            .mega-tool-btn { flex: 1; background: transparent; border: 1px solid var(--accent-glow); color: var(--text-main); border-radius: 4px; cursor: pointer; padding: 5px; font-size: 14px; }
            .mega-tool-btn:hover { background: var(--accent-glow); }
            
            /* Custom Zapper & Editor visual states */
            .mega-zapper-hover { outline: 3px dashed #ff4757 !important; background-color: rgba(255, 71, 87, 0.3) !important; cursor: crosshair !important }
            .mega-editor-hover { outline: 3px dashed #00f0ff !important; filter: drop-shadow(0 0 8px #00f0ff) !important; cursor: pointer !important; }
            .mega-imager-box { position: absolute; border: 2px dashed var(--accent); z-index: 9999900; cursor: move; box-shadow: 0 0 15px var(--accent-glow); }
            .mega-imager-handle { position: absolute; bottom: -5px; right: -5px; width: 15px; height: 15px; background: var(--accent); cursor: se-resize; border-radius: 50%; }
            
            /* Mini Floating Image Toolbar */
            .mega-img-toolbar { position: absolute; background: var(--bg-panel); border: 1px solid var(--accent); border-radius: 8px; display: flex; gap: 5px; padding: 6px; z-index: 9999995; box-shadow: 0 10px 30px rgba(0,0,0,0.8); backdrop-filter: blur(10px); }
            .mega-img-toolbar button { background: var(--btn-bg); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer; padding: 4px 8px; font-size: 11px; font-weight: bold; }
            .mega-img-toolbar button:hover { background: var(--accent); color: #000; }
        `;
        document.head.appendChild(style);
    }

    /* Helper: Window Dragger */
    function makeDraggable(win, header) {
        let isDragging = false, startX, startY, initialLeft, initialTop;
        header.addEventListener('mousedown', function(e) {
            isDragging = true; startX = e.clientX; startY = e.clientY;
            const rect = win.getBoundingClientRect(); initialLeft = rect.left; initialTop = rect.top;
            document.querySelectorAll('.mega-window').forEach(w => w.style.zIndex = '9999990');
            win.style.zIndex = '9999999'; win.style.right = 'auto'; win.style.bottom = 'auto';
        });
        document.addEventListener('mousemove', e => {
            if (isDragging) { win.style.left = initialLeft + e.clientX - startX + 'px'; win.style.top = initialTop + e.clientY - startY + 'px'; }
        });
        document.addEventListener('mouseup', () => isDragging = false);
    }

    /* Helper: UI Builders */
    function createBtn(text, icon, fn) {
        const b = document.createElement('button'); b.className = 'mega-btn';
        b.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><span>${icon}</span><span>${text}</span></div>`;
        b.onclick = () => { const isActive = fn(); if (text.includes('Start') || text.includes('Enable') || text.includes('Mode')) b.classList.toggle('active', isActive); };
        return b;
    }
    function createTitle(text) {
        const d = document.createElement('div'); d.innerText = text;
        Object.assign(d.style, { fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '16px 0 8px 4px', opacity: '0.7' });
        return d;
    }

    /* --- Image Editor System (Existing Images) --- */
    function spawnImageEditorToolbar(img) {
        if(state.imgEditor.toolbar) state.imgEditor.toolbar.remove();
        state.imgEditor.currentImg = img;
        
        const tb = document.createElement('div');
        tb.className = 'mega-img-toolbar';
        const rect = img.getBoundingClientRect();
        tb.style.top = Math.max(0, window.scrollY + rect.top - 40) + 'px';
        tb.style.left = (window.scrollX + rect.left) + 'px';

        // Size Buttons
        const btnMinus = document.createElement('button'); btnMinus.innerText = 'Size -';
        btnMinus.onclick = () => { img.style.width = Math.max(10, img.offsetWidth * 0.9) + 'px'; img.style.height = 'auto'; };
        const btnPlus = document.createElement('button'); btnPlus.innerText = 'Size +';
        btnPlus.onclick = () => { img.style.width = (img.offsetWidth * 1.1) + 'px'; img.style.height = 'auto'; };
        
        // Wrap/Float
        const btnWrapL = document.createElement('button'); btnWrapL.innerText = 'Float L';
        btnWrapL.onclick = () => { img.style.float = 'left'; img.style.margin = '10px'; img.style.position = 'static'; };
        const btnWrapR = document.createElement('button'); btnWrapR.innerText = 'Float R';
        btnWrapR.onclick = () => { img.style.float = 'right'; img.style.margin = '10px'; img.style.position = 'static'; };
        
        // Border
        const btnBorder = document.createElement('button'); btnBorder.innerText = 'Border';
        let bState = 0;
        btnBorder.onclick = () => {
            bState = (bState + 1) % 3;
            if(bState===1) img.style.border = '5px solid var(--accent)';
            else if(bState===2) img.style.border = '5px dashed #ff0055';
            else img.style.border = 'none';
        };

        // Move/Drag
        const btnMove = document.createElement('button'); btnMove.innerText = 'Move';
        btnMove.onclick = () => {
            if(img.dataset.megaDragging) {
                img.style.position = 'static'; img.style.cursor = 'default';
                delete img.dataset.megaDragging;
                btnMove.style.background = '';
            } else {
                img.style.position = 'absolute'; img.style.zIndex = '999900';
                img.style.cursor = 'move';
                img.dataset.megaDragging = "true";
                btnMove.style.background = 'var(--accent)'; btnMove.style.color = '#000';
                
                // Drag Logic
                let drag = false, sx, sy, sl, st;
                img.onmousedown = (e) => {
                    if(!img.dataset.megaDragging) return;
                    e.preventDefault(); drag = true; sx = e.clientX; sy = e.clientY;
                    sl = parseInt(img.style.left || img.offsetLeft); st = parseInt(img.style.top || img.offsetTop);
                };
                document.addEventListener('mousemove', (e) => {
                    if(drag) { img.style.left = (sl + e.clientX - sx) + 'px'; img.style.top = (st + e.clientY - sy) + 'px'; tb.style.left = img.style.left; tb.style.top = (parseInt(img.style.top)-40)+'px'; }
                });
                document.addEventListener('mouseup', () => drag = false);
            }
        };

        // Close Toolbar
        const btnClose = document.createElement('button'); btnClose.innerText = '✖';
        btnClose.style.background = 'rgba(255,0,0,0.5)';
        btnClose.onclick = () => tb.remove();

        tb.append(btnMinus, btnPlus, btnWrapL, btnWrapR, btnBorder, btnMove, btnClose);
        document.body.appendChild(tb);
        state.imgEditor.toolbar = tb;
    }

    /* Build Main UI */
    function buildUI() {
        const panel = document.createElement('div');
        panel.id = 'fun-effects-mega-ui';
        panel.className = 'mega-window';
        Object.assign(panel.style, { top: '20px', right: '20px', width: '350px', height: '680px', left: 'auto', bottom: 'auto' });
        
        const header = document.createElement('div');
        header.className = 'mega-header';
        header.innerHTML = '<div style="display:flex;gap:10px;align-items:center;"><span style="font-size:18px">⚡</span><span>NEXUS CONTROL</span></div>';
        panel.appendChild(header);
        makeDraggable(panel, header);

        /* Tabs */
        const tabBar = document.createElement('div'); tabBar.className = 'mega-tab-bar';
        const tabMain = document.createElement('button'); tabMain.className = 'mega-tab-btn active'; tabMain.innerText = 'FX & Chaos';
        const tabEdit = document.createElement('button'); tabEdit.className = 'mega-tab-btn'; tabEdit.innerText = 'Editor & Img';
        tabBar.appendChild(tabMain); tabBar.appendChild(tabEdit); panel.appendChild(tabBar);

        const contentMain = document.createElement('div'); contentMain.className = 'mega-content active';
        const contentEdit = document.createElement('div'); contentEdit.className = 'mega-content';

        tabMain.onclick = () => { tabMain.classList.add('active'); tabEdit.classList.remove('active'); contentMain.classList.add('active'); contentEdit.classList.remove('active'); };
        tabEdit.onclick = () => { tabEdit.classList.add('active'); tabMain.classList.remove('active'); contentEdit.classList.add('active'); contentMain.classList.remove('active'); };

        /* --- TAB 1: FX & CHAOS --- */
        contentMain.appendChild(createTitle('UI Theme'));
        const themeSel = document.createElement('select'); themeSel.className = 'mega-select';
        themeSel.innerHTML = '<option value="cyberpunk">Cyberpunk</option><option value="matrix">Matrix</option><option value="synthwave">Synthwave</option><option value="light">Light</option>';
        themeSel.onchange = (e) => { panel.dataset.megaTheme = e.target.value; document.querySelectorAll('.mega-window').forEach(w => w.dataset.megaTheme = e.target.value); };
        contentMain.appendChild(themeSel);

        contentMain.appendChild(createTitle('Visual Effects'));
        
        // Matrix
        contentMain.appendChild(createBtn('Start Matrix Rain', '💻', () => {
            if (state.matrix.active) { clearInterval(state.matrix.interval); state.matrix.canvas.remove(); state.matrix.active = false; } else {
                const t = document.createElement('canvas'); Object.assign(t.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '999990' }); document.body.appendChild(t);
                const i = t.getContext('2d'); let n = t.width = window.innerWidth, a = t.height = window.innerHeight;
                const r = Math.floor(n / 15) + 1, s = Array(r).fill(0);
                state.matrix.interval = setInterval(() => { i.fillStyle = 'rgba(0, 0, 0, 0.05)'; i.fillRect(0, 0, n, a); i.fillStyle = '#0F0'; i.font = '15px monospace'; for (let e = 0; e < r; e++) { i.fillText(String.fromCharCode(48 + 33 * Math.random()), 15 * e, s[e]); if (s[e] > 758 + 10000 * Math.random()) s[e] = 0; else s[e] += 15; } }, 50);
                state.matrix.canvas = t; state.matrix.active = true;
            } return state.matrix.active;
        }));

        // Optimized Flashy Flow
        contentMain.appendChild(createBtn('Start Flashy Flow (Pro)', '✨', () => {
            if (state.flow.active) { cancelAnimationFrame(state.flow.frame); window.removeEventListener('mousemove', state.flow.listener); state.flow.canvas.remove(); state.flow.active = false; } else {
                const t = document.createElement('canvas'); Object.assign(t.style, {position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'999996'}); document.body.appendChild(t);
                const i = t.getContext('2d', {alpha:true}); let n = t.width = window.innerWidth, a = t.height = window.innerHeight;
                let particles = [], hue = 0, lastX = 0, lastY = 0;
                state.flow.listener = (e) => {
                    if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 5) return; // Distance limit optimizer
                    lastX = e.clientX; lastY = e.clientY;
                    for(let k=0; k<2; k++) particles.push({ x: e.clientX, y: e.clientY, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 1, sz: Math.random()*8+4, c: `hsl(${hue}, 100%, 60%)` });
                };
                window.addEventListener('mousemove', state.flow.listener);
                function draw() { 
                    i.clearRect(0,0,n,a); i.globalCompositeOperation = 'screen'; hue = (hue + 2) % 360;
                    for(let k=0; k<particles.length; k++){ 
                        let p = particles[k]; p.x += p.vx; p.y += p.vy; p.life -= 0.02;
                        if(p.life <= 0){ particles.splice(k,1); k--; continue; }
                        i.fillStyle = p.c; i.globalAlpha = p.life; i.beginPath(); i.arc(p.x, p.y, p.sz, 0, 6.28); i.fill(); // Arc is 10x faster than gradient
                    }
                    state.flow.frame = requestAnimationFrame(draw); 
                } draw(); state.flow.canvas = t; state.flow.active = true;
            } return state.flow.active;
        }));

        contentMain.appendChild(createTitle('Chaos Controls'));

        // System Shake
        contentMain.appendChild(createBtn('System Shake', '💢', () => {
            state.shake.active = !state.shake.active;
            document.body.classList.toggle('mega-shake-active', state.shake.active);
            return state.shake.active;
        }));

        // Gravity Mode
        contentMain.appendChild(createBtn('Gravity Mode', '🌎', () => {
            document.querySelectorAll('img, button, h1, h2, p, a, div.card').forEach(el => {
                if(el.closest('.mega-window')) return;
                el.style.transition = 'transform 2.5s cubic-bezier(0.5, 0, 0.8, 0.2)';
                el.style.transform = `translateY(${window.innerHeight + 200}px) rotate(${Math.random()*60-30}deg)`;
            });
            setTimeout(() => alert("Gravity applied! Refresh page to undo."), 500);
            return false;
        }));

        // Hover Magnify
        contentMain.appendChild(createBtn('Hover Magnify', '🔍', () => {
            if(state.magnify.active) {
                document.removeEventListener('mouseover', state.magnify.over); document.removeEventListener('mouseout', state.magnify.out);
                state.magnify.active = false;
            } else {
                state.magnify.over = (e) => { if(!e.target.closest('.mega-window')) { e.target.style.transition = 'transform 0.2s'; e.target.style.transform = 'scale(1.4)'; e.target.style.zIndex = '99999'; e.target.style.position = 'relative'; } };
                state.magnify.out = (e) => { if(!e.target.closest('.mega-window')) { e.target.style.transform = ''; e.target.style.zIndex = ''; e.target.style.position = ''; } };
                document.addEventListener('mouseover', state.magnify.over); document.addEventListener('mouseout', state.magnify.out);
                state.magnify.active = true;
            } return state.magnify.active;
        }));


        /* --- TAB 2: EDITOR & IMG --- */
        contentEdit.appendChild(createTitle('Text Editor'));
        const toolbar = document.createElement('div'); toolbar.className = 'mega-toolbar';
        ['B', 'I', 'U'].forEach(cmd => {
            const btn = document.createElement('button'); btn.className = 'mega-tool-btn'; btn.innerText = cmd; 
            btn.style.fontWeight = cmd === 'B' ? 'bold' : 'normal'; btn.style.fontStyle = cmd === 'I' ? 'italic' : 'normal'; btn.style.textDecoration = cmd === 'U' ? 'underline' : 'none';
            btn.onclick = () => { if(state.editMode.active) document.execCommand(cmd==='B'?'bold':cmd==='I'?'italic':'underline'); else alert("Enable Page Editor first!"); };
            toolbar.appendChild(btn);
        });
        
        // Font Size Picker
        const fontSel = document.createElement('select'); fontSel.className = 'mega-select'; fontSel.style.margin = '0'; fontSel.style.width = '60px'; fontSel.style.padding = '4px';
        fontSel.innerHTML = '<option value="">Sz</option>' + [1,2,3,4,5,6,7].map(n=>`<option value="${n}">${n}</option>`).join('');
        fontSel.onchange = (e) => { if(state.editMode.active) document.execCommand('fontSize', false, e.target.value); e.target.value = ''; };
        toolbar.appendChild(fontSel);

        const colorInput = document.createElement('input'); colorInput.type = 'color'; colorInput.className = 'mega-tool-btn'; colorInput.style.padding='0'; colorInput.style.height='28px';
        colorInput.oninput = (e) => { if(state.editMode.active) document.execCommand('foreColor', false, e.target.value); };
        toolbar.appendChild(colorInput);
        contentEdit.appendChild(toolbar);

        contentEdit.appendChild(createBtn('Enable Page Editor', '📝', () => {
            state.editMode.active = !state.editMode.active;
            document.designMode = state.editMode.active ? 'on' : 'off';
            return state.editMode.active;
        }));

        contentEdit.appendChild(createTitle('Element Tools'));
        
        // Zapper
        contentEdit.appendChild(createBtn('DOM Zapper (Delete)', '⚡', () => {
            if (state.zapper.active) {
                document.removeEventListener('mouseover', state.zapper.over, true); document.removeEventListener('mouseout', state.zapper.out, true); document.removeEventListener('click', state.zapper.click, true);
                if (state.zapper.hoveredEl) state.zapper.hoveredEl.classList.remove('mega-zapper-hover');
                state.zapper.active = false;
            } else {
                state.zapper.over = (t) => { if (!t.target.closest('.mega-window')) { state.zapper.hoveredEl = t.target; t.target.classList.add('mega-zapper-hover'); } };
                state.zapper.out = (t) => { if (!t.target.closest('.mega-window')) { t.target.classList.remove('mega-zapper-hover'); state.zapper.hoveredEl = null; } };
                state.zapper.click = (t) => { if (!t.target.closest('.mega-window')) { t.preventDefault(); t.stopPropagation(); t.target.remove(); state.zapper.hoveredEl = null; } };
                document.addEventListener('mouseover', state.zapper.over, true); document.addEventListener('mouseout', state.zapper.out, true); document.addEventListener('click', state.zapper.click, true);
                state.zapper.active = true;
            } return state.zapper.active;
        }));

        // Ghost Mode
        contentEdit.appendChild(createBtn('Ghost Mode (Opacity)', '👻', () => {
            if(state.ghost.active) { document.removeEventListener('click', state.ghost.click, true); state.ghost.active = false; }
            else {
                state.ghost.click = (e) => { if(!e.target.closest('.mega-window')) { e.preventDefault(); e.stopPropagation(); e.target.style.opacity = e.target.style.opacity === '0.2' ? '1' : '0.2'; }};
                document.addEventListener('click', state.ghost.click, true); state.ghost.active = true;
            } return state.ghost.active;
        }));

        contentEdit.appendChild(createTitle('Image Tools'));
        
        // Live Image Editor (Existing)
        contentEdit.appendChild(createBtn('Live Image Editor', '🛠️', () => {
            if(state.imgEditor.active) {
                document.removeEventListener('mouseover', state.imgEditor.over, true); document.removeEventListener('mouseout', state.imgEditor.out, true); document.removeEventListener('click', state.imgEditor.click, true);
                if(state.imgEditor.toolbar) state.imgEditor.toolbar.remove();
                state.imgEditor.active = false;
            } else {
                state.imgEditor.over = (e) => { if(e.target.tagName === 'IMG' && !e.target.closest('.mega-window')) e.target.classList.add('mega-editor-hover'); };
                state.imgEditor.out = (e) => { if(e.target.tagName === 'IMG') e.target.classList.remove('mega-editor-hover'); };
                state.imgEditor.click = (e) => { 
                    if(e.target.tagName === 'IMG' && !e.target.closest('.mega-window')) {
                        e.preventDefault(); e.stopPropagation(); e.target.classList.remove('mega-editor-hover'); spawnImageEditorToolbar(e.target);
                    }
                };
                document.addEventListener('mouseover', state.imgEditor.over, true); document.addEventListener('mouseout', state.imgEditor.out, true); document.addEventListener('click', state.imgEditor.click, true);
                state.imgEditor.active = true;
            } return state.imgEditor.active;
        }));
        contentEdit.appendChild(Object.assign(document.createElement('div'), {innerHTML: '<div class="mega-helper-text">Enable -> Click any image to open mini-editor.</div>'}));

        // URL Img Tools
        const imgInput = document.createElement('input'); imgInput.className = 'mega-input'; imgInput.placeholder = 'Paste Image URL here...';
        contentEdit.appendChild(imgInput);

        contentEdit.appendChild(createBtn('URL Swapper', '🔄', () => {
            if(state.swapper.active) { document.removeEventListener('click', state.swapper.click, true); state.swapper.active = false; }
            else {
                if(!imgInput.value) { alert("Enter URL first!"); return false; }
                state.swapper.url = imgInput.value;
                state.swapper.click = (e) => { if(e.target.tagName === 'IMG' && !e.target.closest('.mega-window')) { e.preventDefault(); e.stopPropagation(); e.target.src = state.swapper.url; e.target.srcset = state.swapper.url; } };
                document.addEventListener('click', state.swapper.click, true); state.swapper.active = true;
            } return state.swapper.active;
        }));

        panel.appendChild(contentMain); panel.appendChild(contentEdit);

        /* Close / Shutdown */
        const closeBtn = document.createElement('button'); closeBtn.className = 'mega-btn'; closeBtn.style.marginTop = '20px';
        closeBtn.innerHTML = '<div style="display:flex;gap:10px;align-items:center"><span style="color:#ff4757">✖</span><span style="color:#ff4757">Close System</span></div>';
        closeBtn.onclick = () => {
            if(state.matrix.active) clearInterval(state.matrix.interval);
            if(state.flow.active) cancelAnimationFrame(state.flow.frame);
            if(state.editMode.active) document.designMode = 'off';
            document.body.classList.remove('mega-shake-active');
            document.querySelectorAll('.mega-window, .mega-img-toolbar, canvas').forEach(w => w.remove());
            const s = document.getElementById(styleId); if(s) s.remove();
        };
        panel.appendChild(closeBtn);
        document.body.appendChild(panel);
    }

    /* Cinematic Splash Screen */
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:radial-gradient(circle at 50% 50%, #0f1423 0%, #000 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#fff;transition:all 0.6s ease;';
    overlay.innerHTML = `<h1 style="font-size:40px;letter-spacing:10px;color:#00f0ff;text-shadow:0 0 20px #00f0ff;margin:0;">NEXUS</h1><p style="letter-spacing:5px;opacity:0.7;">V2 INITIATED</p>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(1.2)';
        setTimeout(() => { overlay.remove(); buildUI(); }, 600);
    }, 1500);
})();
