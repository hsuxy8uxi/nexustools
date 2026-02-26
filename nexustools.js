(function() {
    /* Prevent multiple instances */
    if (document.getElementById('fun-effects-mega-ui')) return;

    /* Global state tracker */
    const state = {
        matrix: { active: false, interval: null, canvas: null },
        fluid: { active: false, frame: null, canvas: null, listener: null },
        flow: { active: false, frame: null, canvas: null, listener: null },
        dvd: { active: false, frame: null, element: null, x: 0, y: 0, vx: 2, vy: 2 },
        editMode: { active: false },
        zapper: { active: false, overListener: null, outListener: null, clickListener: null, hoveredEl: null },
        swapper: { active: false, listener: null, url: '' },
        imager: { active: false, element: null, isDragging: false, isResizing: false },
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
            @keyframes mega-pulse { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px var(--accent)) } 50% { transform: scale(1.05); filter: drop-shadow(0 0 25px var(--accent)) } }
            @keyframes mega-enter { 0% { opacity: 0; transform: scale(0.9) translateY(-20px); filter: blur(10px) } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0) } }
            .mega-window { position: fixed; background: var(--bg-panel); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--accent-glow); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--accent-glow); border-radius: var(--border-rad); display: flex; flex-direction: column; font-family: var(--font-main); color: var(--text-main); animation: mega-enter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; z-index: 9999990; resize: both; overflow: hidden; min-width: 300px; min-height: 400px }
            .mega-header { padding: 12px 16px; background: var(--bg-header); border-bottom: 1px solid var(--accent-glow); cursor: grab; display: flex; align-items: center; justify-content: space-between; font-weight: 700; font-size: 14px; user-select: none; flex-shrink: 0 }
            .mega-header:active { cursor: grabbing }
            .mega-tab-bar { display: flex; border-bottom: 1px solid var(--accent-glow); background: rgba(0,0,0,0.2); }
            .mega-tab-btn { flex: 1; background: transparent; border: none; padding: 10px; color: var(--text-main); cursor: pointer; opacity: 0.7; font-weight: 600; border-bottom: 2px solid transparent; transition: all 0.2s; }
            .mega-tab-btn:hover { opacity: 1; background: rgba(255,255,255,0.05); }
            .mega-tab-btn.active { opacity: 1; border-bottom: 2px solid var(--accent); background: rgba(255,255,255,0.05); }
            .mega-content { flex: 1; overflow-y: auto; padding: 16px; display: none; }
            .mega-content.active { display: block; }
            .mega-content::-webkit-scrollbar { width: 6px }
            .mega-content::-webkit-scrollbar-track { background: transparent }
            .mega-content::-webkit-scrollbar-thumb { background: var(--accent-glow); border-radius: 10px }
            .mega-btn { width: 100%; padding: 10px 12px; margin-bottom: 6px; background: var(--btn-bg); border: 1px solid transparent; border-left: 3px solid transparent; border-radius: calc(var(--border-rad) / 2); color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 600; font-family: inherit; transition: all 0.2s }
            .mega-btn:hover { background: var(--btn-hover); border-left: 3px solid var(--accent); transform: translateX(3px) }
            .mega-btn.active { background: var(--accent-glow); border-color: var(--accent-glow); border-left: 3px solid var(--accent); color: var(--text-main); text-shadow: 0 0 8px var(--accent) }
            .mega-input, .mega-select { width: 100%; padding: 10px; margin-bottom: 8px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--accent-glow); color: var(--text-main); border-radius: calc(var(--border-rad) / 2); font-family: inherit; font-size: 12px; outline: none; box-sizing: border-box }
            .mega-input:focus { border-color: var(--accent); box-shadow: 0 0 10px var(--accent-glow) }
            .mega-zapper-hover { outline: 3px dashed #ff4757 !important; background-color: rgba(255, 71, 87, 0.3) !important; cursor: crosshair !important }
            .mega-iframe-container iframe { width: 100%; height: 100%; border: none; background: #fff }
            .mega-close-btn { background: transparent; border: none; color: var(--text-main); cursor: pointer; font-size: 16px; opacity: 0.6; transition: opacity 0.2s }
            .mega-close-btn:hover { opacity: 1; color: #ff4757 }
            .mega-toolbar { display: flex; gap: 5px; margin-bottom: 10px; padding: 5px; background: rgba(0,0,0,0.2); border-radius: 8px; }
            .mega-tool-btn { flex: 1; background: transparent; border: 1px solid var(--accent-glow); color: var(--text-main); border-radius: 4px; cursor: pointer; padding: 5px; }
            .mega-tool-btn:hover { background: var(--accent-glow); }
            .mega-color-picker { width: 30px; height: 30px; border: none; background: transparent; cursor: pointer; }
            .mega-helper-text { font-size: 10px; opacity: 0.7; margin-bottom: 10px; font-style: italic; }
            .mega-imager-box { position: absolute; border: 2px dashed var(--accent); z-index: 9999900; cursor: move; box-shadow: 0 0 15px var(--accent-glow); }
            .mega-imager-box img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
            .mega-imager-handle { position: absolute; bottom: -5px; right: -5px; width: 15px; height: 15px; background: var(--accent); cursor: se-resize; border-radius: 50%; }
        `;
        document.head.appendChild(style);
    }

    /* Draggable window logic */
    function makeDraggable(win, header) {
        let isDragging = false, startX, startY, initialLeft, initialTop;
        header.addEventListener('mousedown', function(e) {
            isDragging = true; startX = e.clientX; startY = e.clientY;
            const rect = win.getBoundingClientRect(); initialLeft = rect.left; initialTop = rect.top;
            document.querySelectorAll('.mega-window').forEach(function(w) { w.style.zIndex = '9999990'; });
            win.style.zIndex = '9999999'; win.style.right = 'auto'; win.style.bottom = 'auto';
        });
        document.addEventListener('mousemove', function(e) {
            if (isDragging) { win.style.left = initialLeft + e.clientX - startX + 'px'; win.style.top = initialTop + e.clientY - startY + 'px'; }
        });
        document.addEventListener('mouseup', function() { isDragging = false; });
    }

    /* Imager Logic (Placer Tool) */
    function spawnImager(url) {
        const box = document.createElement('div');
        box.className = 'mega-imager-box';
        box.style.left = (window.scrollX + 100) + 'px';
        box.style.top = (window.scrollY + 100) + 'px';
        box.style.width = '200px';
        box.style.height = '150px';
        
        const img = document.createElement('img');
        img.src = url;
        box.appendChild(img);

        const handle = document.createElement('div');
        handle.className = 'mega-imager-handle';
        box.appendChild(handle);
        document.body.appendChild(box);

        state.imager.active = true;
        state.imager.element = box;

        let startX, startY, startW, startH, startL, startT;

        const downFn = function(e) {
            if(e.target === handle) { return; }
            e.preventDefault();
            state.imager.isDragging = true;
            startX = e.clientX; startY = e.clientY;
            startL = parseInt(box.style.left || 0); startT = parseInt(box.style.top || 0);
        };

        const resizeDownFn = function(e) {
            e.preventDefault(); e.stopPropagation();
            state.imager.isResizing = true;
            startX = e.clientX; startY = e.clientY;
            startW = box.offsetWidth; startH = box.offsetHeight;
        };

        const moveFn = function(e) {
            if (state.imager.isDragging) {
                box.style.left = (startL + e.clientX - startX) + 'px';
                box.style.top = (startT + e.clientY - startY) + 'px';
            } else if (state.imager.isResizing) {
                box.style.width = (startW + e.clientX - startX) + 'px';
                box.style.height = (startH + e.clientY - startY) + 'px';
            }
        };

        const upFn = function() { state.imager.isDragging = false; state.imager.isResizing = false; };

        const keyFn = function(e) {
            if (e.key === 'Enter' && state.imager.active && state.imager.element) {
                /* Cleanup listeners */
                box.removeEventListener('mousedown', downFn);
                handle.removeEventListener('mousedown', resizeDownFn);
                document.removeEventListener('mousemove', moveFn);
                document.removeEventListener('mouseup', upFn);
                document.removeEventListener('keydown', keyFn);
                
                /* Cleanup UI */
                box.classList.remove('mega-imager-box');
                box.style.border = 'none';
                box.style.cursor = 'default';
                handle.remove();

                /* Options */
                const wantWrap = confirm("Press OK to Text Wrap (Float), or Cancel for Overlay (Absolute).");
                if (wantWrap) {
                    const side = confirm("OK for Left Align, Cancel for Right Align?") ? 'left' : 'right';
                    box.style.position = 'static';
                    box.style.float = side;
                    box.style.margin = '10px';
                } else {
                    box.style.position = 'absolute';
                }
                
                state.imager.active = false;
                state.imager.element = null;
                alert("Image Placed!");
            }
        };

        box.addEventListener('mousedown', downFn);
        handle.addEventListener('mousedown', resizeDownFn);
        document.addEventListener('mousemove', moveFn);
        document.addEventListener('mouseup', upFn);
        document.addEventListener('keydown', keyFn);
    }

    /* Spawns a floating iframe window */
    function spawnIframeWindow(url) {
        const win = document.createElement('div'); win.className = 'mega-window';
        const sel = document.getElementById('mega-theme-sel'); win.dataset.megaTheme = sel ? sel.value : 'cyberpunk';
        Object.assign(win.style, { top: '100px', left: '100px', width: '600px', height: '450px' });
        const header = document.createElement('div'); header.className = 'mega-header';
        header.innerHTML = '<div style="display:flex;gap:8px;align-items:center">🌍 <span>Scout: ' + url.substring(0, 30) + '...</span></div>';
        const closeBtn = document.createElement('button'); closeBtn.className = 'mega-close-btn';
        closeBtn.innerHTML = '✖'; closeBtn.onclick = function() { win.remove(); };
        header.appendChild(closeBtn); win.appendChild(header);
        const content = document.createElement('div'); content.className = 'mega-content mega-iframe-container active';
        content.style.padding = '0';
        const iframe = document.createElement('iframe'); iframe.src = url.startsWith('http') ? url : 'https://' + url;
        content.appendChild(iframe); win.appendChild(content); document.body.appendChild(win);
        makeDraggable(win, header); state.windows.push(win);
    }

    /* Build UI */
    function buildUI() {
        const panel = document.createElement('div');
        panel.id = 'fun-effects-mega-ui';
        panel.className = 'mega-window';
        Object.assign(panel.style, { top: '20px', right: '20px', width: '340px', height: '650px', left: 'auto', bottom: 'auto' });
        
        const header = document.createElement('div');
        header.className = 'mega-header';
        header.innerHTML = '<div style="display:flex;gap:10px;align-items:center;"><span style="font-size:18px">⚡</span><span>NEXUS CONTROL</span></div>';
        panel.appendChild(header);
        makeDraggable(panel, header);

        /* Tabs */
        const tabBar = document.createElement('div');
        tabBar.className = 'mega-tab-bar';
        const tabMain = document.createElement('button');
        tabMain.className = 'mega-tab-btn active';
        tabMain.innerText = 'FX & Tools';
        const tabEdit = document.createElement('button');
        tabEdit.className = 'mega-tab-btn';
        tabEdit.innerText = 'Editor & Img';
        tabBar.appendChild(tabMain);
        tabBar.appendChild(tabEdit);
        panel.appendChild(tabBar);

        const contentMain = document.createElement('div');
        contentMain.className = 'mega-content active';
        const contentEdit = document.createElement('div');
        contentEdit.className = 'mega-content';

        /* Tab Logic */
        tabMain.onclick = function() {
            tabMain.classList.add('active'); tabEdit.classList.remove('active');
            contentMain.classList.add('active'); contentEdit.classList.remove('active');
        };
        tabEdit.onclick = function() {
            tabEdit.classList.add('active'); tabMain.classList.remove('active');
            contentEdit.classList.add('active'); contentMain.classList.remove('active');
        };

        /* Helpers */
        function createBtn(text, icon, fn) {
            const b = document.createElement('button'); b.className = 'mega-btn';
            b.innerHTML = '<div style="display:flex;gap:10px;align-items:center"><span>' + icon + '</span><span>' + text + '</span></div>';
            b.onclick = function() {
                const isActive = fn();
                if (text.includes('Start') || text.includes('Enable') || text.includes('Mode')) {
                    b.classList.toggle('active', isActive);
                }
            };
            return b;
        }
        function createTitle(text) {
            const d = document.createElement('div'); d.innerText = text;
            Object.assign(d.style, { fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '16px 0 8px 4px', opacity: '0.7' });
            return d;
        }

        /* --- MAIN TAB CONTENT --- */
        contentMain.appendChild(createTitle('UI Theme'));
        const themeSel = document.createElement('select'); themeSel.id = 'mega-theme-sel'; themeSel.className = 'mega-select';
        themeSel.innerHTML = '<option value="cyberpunk">Cyberpunk</option><option value="matrix">Matrix / Hacker</option><option value="synthwave">Synthwave</option><option value="light">Clean Light</option>';
        themeSel.onchange = function(e) { panel.dataset.megaTheme = e.target.value; document.querySelectorAll('.mega-window').forEach(function(w) { w.dataset.megaTheme = e.target.value; }); };
        contentMain.appendChild(themeSel);

        contentMain.appendChild(createTitle('Web Scout'));
        const scoutInp = document.createElement('input'); scoutInp.className = 'mega-input'; scoutInp.placeholder = 'Enter URL (e.g., bing.com)';
        scoutInp.onkeydown = function(e) { if (e.key === 'Enter' && scoutInp.value) { spawnIframeWindow(scoutInp.value); } };
        contentMain.appendChild(scoutInp);
        contentMain.appendChild(createBtn('Launch Scout Window', '🚀', function() { if (scoutInp.value) { spawnIframeWindow(scoutInp.value); } }));

        contentMain.appendChild(createTitle('Visual Effects'));
        
        contentMain.appendChild(createBtn('Start Matrix Rain', '💻', function() {
            if (state.matrix.active) { clearInterval(state.matrix.interval); state.matrix.canvas.remove(); state.matrix.active = false; } else {
                const t = document.createElement('canvas'); Object.assign(t.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '999990' }); document.body.appendChild(t);
                const i = t.getContext('2d'); let n = t.width = window.innerWidth, a = t.height = window.innerHeight;
                const r = Math.floor(n / 15) + 1, s = Array(r).fill(0);
                state.matrix.interval = setInterval(function() { i.fillStyle = 'rgba(0, 0, 0, 0.05)'; i.fillRect(0, 0, n, a); i.fillStyle = '#0F0'; i.font = '15px monospace'; for (let e = 0; e < r; e++) { i.fillText(String.fromCharCode(48 + 33 * Math.random()), 15 * e, s[e]); if (s[e] > 758 + 10000 * Math.random()) { s[e] = 0; } else { s[e] += 15; } } }, 50);
                state.matrix.canvas = t; state.matrix.active = true;
            } return state.matrix.active;
        }));

        contentMain.appendChild(createBtn('Start DVD Bouncer', '📀', function() {
            if (state.dvd.active) { cancelAnimationFrame(state.dvd.frame); state.dvd.element.remove(); state.dvd.active = false; } else {
                const img = document.createElement('img'); img.src = 'https://files.catbox.moe/9d4kiy.svg'; Object.assign(img.style, { position: 'fixed', left: '0', top: '0', width: '150px', zIndex: '999998', pointerEvents: 'none', willChange: 'transform' }); document.body.appendChild(img);
                state.dvd.element = img; state.dvd.x = Math.random()*(window.innerWidth-150); state.dvd.y = Math.random()*(window.innerHeight-100); state.dvd.vx = 3; state.dvd.vy = 3; state.dvd.active = true;
                function runDVD() { if(!state.dvd.active)return; const el=state.dvd.element; const w=window.innerWidth, h=window.innerHeight; state.dvd.x+=state.dvd.vx; state.dvd.y+=state.dvd.vy; if(state.dvd.x+150>=w || state.dvd.x<=0){state.dvd.vx*=-1; el.style.filter='hue-rotate('+Math.random()*360+'deg)';} if(state.dvd.y+100>=h || state.dvd.y<=0){state.dvd.vy*=-1; el.style.filter='hue-rotate('+Math.random()*360+'deg)';} el.style.transform='translate('+state.dvd.x+'px, '+state.dvd.y+'px)'; state.dvd.frame=requestAnimationFrame(runDVD); } runDVD();
            } return state.dvd.active;
        }));

        contentMain.appendChild(createBtn('Start Fluid Trail', '💧', function() {
            if (state.fluid.active) { cancelAnimationFrame(state.fluid.frame); window.removeEventListener('mousemove', state.fluid.listener); state.fluid.canvas.remove(); state.fluid.active = false; } else {
                const t = document.createElement('canvas'); Object.assign(t.style, {position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'999995',background:'#000',opacity:'0',transition:'opacity 0.6s'}); document.body.appendChild(t);
                const i = t.getContext('2d'); let n = t.width = window.innerWidth, a = t.height = window.innerHeight, o = [];
                state.fluid.listener = function(e) { for(let k=0;k<3;k++) o.push({x:e.clientX,y:e.clientY,vx:(Math.random()-0.5),vy:(Math.random()-0.5),life:1,size:Math.random()*10+5,c:'hsl('+(Date.now()/10)%360+',100%,60%)'}); };
                window.addEventListener('mousemove', state.fluid.listener); requestAnimationFrame(function(){t.style.opacity='1';});
                function draw() { i.clearRect(0,0,n,a); for(let k=0;k<o.length;k++){let p=o[k]; p.x+=p.vx; p.y+=p.vy; p.life-=0.02; if(p.life<=0){o.splice(k,1);k--;continue;} i.globalAlpha=p.life; i.fillStyle=p.c; i.beginPath(); i.arc(p.x,p.y,p.size*p.life,0,6.28); i.fill();} state.fluid.frame=requestAnimationFrame(draw); } draw(); state.fluid.canvas=t; state.fluid.active=true;
            } return state.fluid.active;
        }));

        contentMain.appendChild(createBtn('Start Flashy Flow', '✨', function() {
             if (state.flow.active) { cancelAnimationFrame(state.flow.frame); window.removeEventListener('mousemove', state.flow.listener); state.flow.canvas.remove(); state.flow.active = false; } else {
                const t = document.createElement('canvas'); Object.assign(t.style, {position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'999996',background:'transparent'}); document.body.appendChild(t);
                const i = t.getContext('2d'); let n = t.width = window.innerWidth, a = t.height = window.innerHeight, particles = [], hue = 0;
                state.flow.listener = function(e) { for(let k=0;k<5;k++) particles.push({ x:e.clientX, y:e.clientY, vx:(Math.random()-0.5)*6, vy:(Math.random()-0.5)*6, life:1, size:Math.random()*15+10, color:'hsl('+(hue+Math.random()*40)+',100%,60%)' }); };
                window.addEventListener('mousemove', state.flow.listener);
                function draw() { i.clearRect(0,0,n,a); i.globalCompositeOperation='lighter'; hue=(hue+4)%360; for(let k=0;k<particles.length;k++){ let p=particles[k]; p.x+=p.vx; p.y+=p.vy; p.life-=0.02; if(p.life<=0){particles.splice(k,1);k--;continue;} let sz=Math.max(0.1,p.size*p.life); const g=i.createRadialGradient(p.x,p.y,0,p.x,p.y,sz*2); g.addColorStop(0,p.color); g.addColorStop(1,'transparent'); i.globalAlpha=p.life; i.fillStyle=g; i.beginPath(); i.arc(p.x,p.y,sz*2,0,Math.PI*2); i.fill(); } state.flow.frame=requestAnimationFrame(draw); }
                draw(); state.flow.canvas = t; state.flow.active = true;
            } return state.flow.active;
        }));

        /* --- EDITING TAB CONTENT --- */
        contentEdit.appendChild(createTitle('Text Editor'));
        const toolbar = document.createElement('div'); toolbar.className = 'mega-toolbar';
        ['B', 'I', 'U'].forEach(function(cmd) {
            const btn = document.createElement('button'); btn.className = 'mega-tool-btn';
            btn.innerText = cmd; btn.style.fontWeight = cmd === 'B' ? 'bold' : 'normal'; btn.style.fontStyle = cmd === 'I' ? 'italic' : 'normal'; btn.style.textDecoration = cmd === 'U' ? 'underline' : 'none';
            btn.onclick = function() { if(state.editMode.active) { document.execCommand(cmd === 'B' ? 'bold' : cmd === 'I' ? 'italic' : 'underline'); } else { alert("Enable Page Editor first!"); } };
            toolbar.appendChild(btn);
        });
        const colorInput = document.createElement('input'); colorInput.type = 'color'; colorInput.className = 'mega-color-picker';
        colorInput.oninput = function(e) { if(state.editMode.active) { document.execCommand('foreColor', false, e.target.value); } };
        toolbar.appendChild(colorInput);
        contentEdit.appendChild(toolbar);

        contentEdit.appendChild(createBtn('Enable Page Editor', '📝', function() {
            state.editMode.active = !state.editMode.active;
            document.designMode = state.editMode.active ? 'on' : 'off';
            return state.editMode.active;
        }));

        contentEdit.appendChild(createTitle('Element Tools'));
        contentEdit.appendChild(createBtn('Enable DOM Zapper', '⚡', function() {
            if (state.zapper.active) {
                document.removeEventListener('mouseover', state.zapper.overListener, true);
                document.removeEventListener('mouseout', state.zapper.outListener, true);
                document.removeEventListener('click', state.zapper.clickListener, true);
                if (state.zapper.hoveredEl) { state.zapper.hoveredEl.classList.remove('mega-zapper-hover'); }
                state.zapper.active = false;
            } else {
                state.zapper.overListener = function(t) { if (!t.target.closest('.mega-window') && !t.target.closest('.mega-imager-placed') && !t.target.closest('.mega-imager-box')) { state.zapper.hoveredEl = t.target; t.target.classList.add('mega-zapper-hover'); } };
                state.zapper.outListener = function(t) { if (!t.target.closest('.mega-window')) { t.target.classList.remove('mega-zapper-hover'); state.zapper.hoveredEl = null; } };
                state.zapper.clickListener = function(t) { if (!t.target.closest('.mega-window') && !t.target.closest('.mega-imager-box')) { t.preventDefault(); t.stopPropagation(); t.target.remove(); state.zapper.hoveredEl = null; } };
                document.addEventListener('mouseover', state.zapper.overListener, true);
                document.addEventListener('mouseout', state.zapper.outListener, true);
                document.addEventListener('click', state.zapper.clickListener, true);
                state.zapper.active = true;
            } return state.zapper.active;
        }));

        contentEdit.appendChild(createTitle('Image Tools'));
        const imgInput = document.createElement('input'); imgInput.className = 'mega-input'; imgInput.placeholder = 'Image URL (Paste or Drop)';
        imgInput.addEventListener('drop', function(e) { e.preventDefault(); const t = e.dataTransfer.getData('text'); if(t) { imgInput.value = t; } });
        contentEdit.appendChild(imgInput);

        /* Swapper */
        contentEdit.appendChild(createBtn('Mode 1: Swapper', '🔄', function() {
            if(state.swapper.active) {
                document.removeEventListener('click', state.swapper.listener, true); state.swapper.active = false;
            } else {
                state.swapper.url = imgInput.value;
                if(!state.swapper.url) { alert("Enter URL first!"); return false; }
                state.swapper.listener = function(e) {
                    if(e.target.tagName === 'IMG' && !e.target.closest('.mega-window')) {
                        e.preventDefault(); e.stopPropagation(); e.target.src = state.swapper.url; e.target.srcset = state.swapper.url;
                    }
                };
                document.addEventListener('click', state.swapper.listener, true); state.swapper.active = true;
            } return state.swapper.active;
        }));
        const swapText = document.createElement('div'); swapText.innerHTML = '<div class="mega-helper-text">Swapper: Enable -> Click existing image to replace.</div>'; contentEdit.appendChild(swapText);

        /* Imager */
        const imagerBtn = document.createElement('button'); imagerBtn.className = 'mega-btn';
        imagerBtn.innerHTML = '<div style="display:flex;gap:10px;align-items:center"><span>🖼️</span><span>Mode 2: Imager</span></div>';
        imagerBtn.onclick = function() {
             if(!imgInput.value) { alert("Enter URL first!"); return; }
             if(state.imager.active) { alert("Finish placing current image first (Press Enter)"); return; }
             spawnImager(imgInput.value);
        };
        contentEdit.appendChild(imagerBtn);
        const imagerText = document.createElement('div'); imagerText.innerHTML = '<div class="mega-helper-text">Imager: Drag/Resize -> Press ENTER to set.</div>'; contentEdit.appendChild(imagerText);

        panel.appendChild(contentMain);
        panel.appendChild(contentEdit);

        /* Close */
        const closeBtn = document.createElement('button'); closeBtn.className = 'mega-btn'; closeBtn.style.marginTop = '20px';
        closeBtn.innerHTML = '<div style="display:flex;gap:10px;align-items:center"><span style="color:#ff4757">✖</span><span style="color:#ff4757">Close System</span></div>';
        closeBtn.onclick = function() {
            if (state.matrix.active) { clearInterval(state.matrix.interval); if(state.matrix.canvas) state.matrix.canvas.remove(); }
            if (state.fluid.active) { cancelAnimationFrame(state.fluid.frame); window.removeEventListener('mousemove', state.fluid.listener); if(state.fluid.canvas) state.fluid.canvas.remove(); }
            if (state.flow.active) { cancelAnimationFrame(state.flow.frame); window.removeEventListener('mousemove', state.flow.listener); if(state.flow.canvas) state.flow.canvas.remove(); }
            if (state.dvd.active) { cancelAnimationFrame(state.dvd.frame); if(state.dvd.element) state.dvd.element.remove(); }
            if (state.editMode.active) { document.designMode = 'off'; }
            if (state.zapper.active) { document.removeEventListener('mouseover', state.zapper.overListener, true); document.removeEventListener('mouseout', state.zapper.outListener, true); document.removeEventListener('click', state.zapper.clickListener, true); }
            if (state.swapper.active) { document.removeEventListener('click', state.swapper.listener, true); }
            if (state.imager.active && state.imager.element) { state.imager.element.remove(); }
            document.querySelectorAll('.mega-window').forEach(function(w) { w.remove(); });
            const s = document.getElementById(styleId); if(s) s.remove();
        };
        panel.appendChild(closeBtn);

        document.body.appendChild(panel);
        panel.dataset.megaTheme = 'cyberpunk';
    }

    /* Splash */
    const overlay = document.createElement('div');
    Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '9999999', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', color: '#fff', transition: 'opacity 0.5s ease' });
    overlay.innerHTML = '<div style="font-size:40px;margin-bottom:20px;animation:mega-pulse 1.5s infinite">⚡</div><div style="font-weight:800;letter-spacing:4px;font-size:20px">NEXUS SYSTEM</div>';
    document.body.appendChild(overlay);
    setTimeout(function() { overlay.style.opacity = '0'; setTimeout(function() { overlay.remove(); buildUI(); }, 500); }, 800);
})();