<!DOCTYPE html>
<html>
<head>
    <title>NEXUS CONTROL - Micro:bit Edition</title>
    <style>
        body { background: #050505; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; overflow: hidden; }
        #connect { padding: 20px 40px; font-size: 1.5rem; cursor: pointer; background: #00f0ff; border: none; border-radius: 12px; font-weight: bold; box-shadow: 0 0 20px rgba(0, 240, 255, 0.4); transition: 0.3s; }
        #connect:hover { transform: scale(1.05); background: #00d8e6; }
    </style>
</head>
<body>

<button id="connect">CONNECT MICRO:BIT</button>

<script>
/* 
   ================================================================
   PART 1: THE LATEST NEXUS CORE (April 28, 9:24PM VERSION)
   ================================================================
*/
function launchNexus() {
(function() {
    if (document.getElementById('fun-effects-mega-ui')) return;

    const state = {
        matrix: { active: false, interval: null, canvas: null },
        fluid: { active: false, frame: null, canvas: null, listener: null },
        flow: { active: false, frame: null, canvas: null, listener: null },
        dvd: { active: false, frame: null, element: null, x: 0, y: 0, vx: 2, vy: 2 },
        flashlight: { active: false, overlay: null, listener: null },
        shake: { active: false },
        editMode: { active: false },
        zapper: { active: false, overListener: null, outListener: null, clickListener: null, hoveredEl: null },
        ghost: { active: false, clickListener: null },
        cloner: { active: false, clickListener: null },
        swapper: { active: false, listener: null, url: '' },
        imager: { active: false, element: null, isDragging: false, isResizing: false },
        imgEditor: { active: false, overListener: null, outListener: null, clickListener: null, toolbar: null, currentImg: null },
        hijacker: { active: false, clickListener: null },
        colorizer: { active: false, clickListener: null },
        windows: []
    };

    const styleId = 'fun-effects-mega-styles';

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
            @keyframes mega-shake { 0% { transform: translate(2px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(0px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(2px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(2px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
            .mega-shake-active { animation: mega-shake 0.4s infinite !important; overflow: hidden !important; }
            .mega-window { position: fixed; background: var(--bg-panel); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--accent-glow); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--accent-glow); border-radius: var(--border-rad); display: flex; flex-direction: column; font-family: var(--font-main); color: var(--text-main); animation: mega-enter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; z-index: 9999990; resize: both; overflow: hidden; min-width: 320px; min-height: 400px }
            .mega-header { padding: 12px 16px; background: var(--bg-header); border-bottom: 1px solid var(--accent-glow); cursor: grab; display: flex; align-items: center; justify-content: space-between; font-weight: 700; font-size: 14px; user-select: none; flex-shrink: 0 }
            .mega-header:active { cursor: grabbing }
            .mega-tab-bar { display: flex; border-bottom: 1px solid var(--accent-glow); background: rgba(0,0,0,0.2); }
            .mega-tab-btn { flex: 1; background: transparent; border: none; padding: 10px; color: var(--text-main); cursor: pointer; opacity: 0.7; font-weight: 600; font-size: 11px; border-bottom: 2px solid transparent; transition: all 0.2s; }
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
            .mega-editor-hover { outline: 3px dashed #00f0ff !important; filter: drop-shadow(0 0 8px #00f0ff) !important; cursor: pointer !important; }
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
            .mega-img-toolbar { position: absolute; background: var(--bg-panel); border: 1px solid var(--accent); border-radius: 8px; display: flex; gap: 5px; padding: 6px; z-index: 9999995; box-shadow: 0 10px 30px rgba(0,0,0,0.8); backdrop-filter: blur(10px); }
            .mega-img-toolbar button { background: var(--btn-bg); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer; padding: 4px 8px; font-size: 11px; font-weight: bold; }
            .mega-img-toolbar button:hover { background: var(--accent); color: #000; }
        `;
        document.head.appendChild(style);
    }

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

    function spawnImageEditorToolbar(img) {
        if(state.imgEditor.toolbar) state.imgEditor.toolbar.remove();
        state.imgEditor.currentImg = img;
        const tb = document.createElement('div');
        tb.className = 'mega-img-toolbar';
        const rect = img.getBoundingClientRect();
        tb.style.top = Math.max(0, window.scrollY + rect.top - 40) + 'px';
        tb.style.left = (window.scrollX + rect.left) + 'px';

        const btnMinus = document.createElement('button'); btnMinus.innerText = 'Size -';
        btnMinus.onclick = () => { img.style.width = Math.max(10, img.offsetWidth * 0.9) + 'px'; img.style.height = 'auto'; };
        const btnPlus = document.createElement('button'); btnPlus.innerText = 'Size +';
        btnPlus.onclick = () => { img.style.width = (img.offsetWidth * 1.1) + 'px'; img.style.height = 'auto'; };
        const btnWrapL = document.createElement('button'); btnWrapL.innerText = 'Float L';
        btnWrapL.onclick = () => { img.style.float = 'left'; img.style.margin = '10px'; img.style.position = 'static'; };
        const btnWrapR = document.createElement('button'); btnWrapR.innerText = 'Float R';
        btnWrapR.onclick = () => { img.style.float = 'right'; img.style.margin = '10px'; img.style.position = 'static'; };
        const btnBorder = document.createElement('button'); btnBorder.innerText = 'Border';
        let bState = 0;
        btnBorder.onclick = () => {
            bState = (bState + 1) % 3;
            if(bState===1) img.style.border = '5px solid var(--accent)';
            else if(bState===2) img.style.border = '5px dashed #ff0055';
            else img.style.border = 'none';
        };

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

        const btnClose = document.createElement('button'); btnClose.innerText = '✖';
        btnClose.style.background = 'rgba(255,0,0,0.5)';
        btnClose.onclick = () => tb.remove();

        tb.append(btnMinus, btnPlus, btnWrapL, btnWrapR, btnBorder, btnMove, btnClose);
        document.body.appendChild(tb);
        state.imgEditor.toolbar = tb;
    }

    function spawnImager(url) {
        const box = document.createElement('div');
        box.className = 'mega-imager-box';
        box.style.left = (window.scrollX + 100) + 'px';
        box.style.top = (window.scrollY + 100) + 'px';
        box.style.width = '200px';
        box.style.height = '150px';
        const img = document.createElement('img'); img.src = url; box.appendChild(img);
        const handle = document.createElement('div'); handle.className = 'mega-imager-handle'; box.appendChild(handle);
        document.body.appendChild(box);
        state.imager.active = true;
        state.imager.element = box;
        let startX, startY, startW, startH, startL, startT;
        const downFn = function(e) { if(e.target === handle) return; e.preventDefault(); state.imager.isDragging = true; startX = e.clientX; startY = e.clientY; startL = parseInt(box.style.left || 0); startT = parseInt(box.style.top || 0); };
        const resizeDownFn = function(e) { e.preventDefault(); e.stopPropagation(); state.imager.isResizing = true; startX = e.clientX; startY = e.clientY; startW = box.offsetWidth; startH = box.offsetHeight; };
        const moveFn = function(e) {
            if (state.imager.isDragging) { box.style.left = (startL + e.clientX - startX) + 'px'; box.style.top = (startT + e.clientY - startY) + 'px'; }
            else if (state.imager.isResizing) { box.style.width = (startW + e.clientX - startX) + 'px'; box.style.height = (startH + e.clientY - startY) + 'px'; }
        };
        const upFn = function() { state.imager.isDragging = false; state.imager.isResizing = false; };
        const keyFn = function(e) {
            if (e.key === 'Enter' && state.imager.active && state.imager.element) {
                box.removeEventListener('mousedown', downFn); handle.removeEventListener('mousedown', resizeDownFn);
                document.removeEventListener('mousemove', moveFn); document.removeEventListener('mouseup', upFn); document.removeEventListener('keydown', keyFn);
                box.classList.remove('mega-imager-box'); box.style.border = 'none'; box.style.cursor = 'default'; handle.remove();
                const wantWrap = confirm("Press OK to Text Wrap (Float), or Cancel for Overlay (Absolute).");
                if (wantWrap) { const side = confirm("OK for Left Align, Cancel for Right Align?") ? 'left' : 'right'; box.style.position = 'static'; box.style.float = side; box.style.margin = '10px'; }
                else { box.style.position = 'absolute'; }
                state.imager.active = false; state.imager.element = null; alert("Image Placed!");
            }
        };
        box.addEventListener('mousedown', downFn); handle.addEventListener('mousedown', resizeDownFn);
        document.addEventListener('mousemove', moveFn); document.addEventListener('mouseup', upFn); document.addEventListener('keydown', keyFn);
    }

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

    function buildUI() {
        const panel = document.createElement('div'); panel.id = 'fun-effects-mega-ui'; panel.className = 'mega-window';
        Object.assign(panel.style, { top: '20px', right: '20px', width: '360px', height: '650px', left: 'auto', bottom: 'auto' });
        const header = document.createElement('div'); header.className = 'mega-header';
        header.innerHTML = '<div style="display:flex;gap:10px;align-items:center;"><span style="font-size:18px">⚡</span><span>NEXUS CONTROL</span></div>';
        panel.appendChild(header); makeDraggable(panel, header);

        const tabBar = document.createElement('div'); tabBar.className = 'mega-tab-bar';
        const tabMain = document.createElement('button'); tabMain.className = 'mega-tab-btn active'; tabMain.innerText = 'FX & Chaos';
        const tabEdit = document.createElement('button'); tabEdit.className = 'mega-tab-btn'; tabEdit.innerText = 'Editor & Img';
        const tabLinks = document.createElement('button'); tabLinks.className = 'mega-tab-btn'; tabLinks.innerText = 'Mods & Colors';
        tabBar.append(tabMain, tabEdit, tabLinks); panel.appendChild(tabBar);

        const contentMain = document.createElement('div'); contentMain.className = 'mega-content active';
        const contentEdit = document.createElement('div'); contentEdit.className = 'mega-content';
        const contentLinks = document.createElement('div'); contentLinks.className = 'mega-content';

        tabMain.onclick = function() { [tabMain, tabEdit, tabLinks].forEach(t => t.classList.remove('active')); tabMain.classList.add('active'); [contentMain, contentEdit, contentLinks].forEach(c => c.classList.remove('active')); contentMain.classList.add('active'); };
        tabEdit.onclick = function() { [tabMain, tabEdit, tabLinks].forEach(t => t.classList.remove('active')); tabEdit.classList.add('active'); [contentMain, contentEdit, contentLinks].forEach(c => c.classList.remove('active')); contentEdit.classList.add('active'); };
        tabLinks.onclick = function() { [tabMain, tabEdit, tabLinks].forEach(t => t.classList.remove('active')); tabLinks.classList.add('active'); [contentMain, contentEdit, contentLinks].forEach(c => c.classList.remove('active')); contentLinks.classList.add('active'); };

        function createBtn(text, icon, fn) {
            const b = document.createElement('button'); b.className = 'mega-btn';
            b.innerHTML = '<div style="display:flex;gap:10px;align-items:center"><span>' + icon + '</span><span>' + text + '</span></div>';
            b.onclick = function() { const isActive = fn(); if (text.includes('Start') || text.includes('Enable') || text.includes('Mode') || text.includes('Shake')) b.classList.toggle('active', isActive); return isActive; };
            return b;
        }
        function createTitle(text) { const d = document.createElement('div'); d.innerText = text; Object.assign(d.style, { fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '16px 0 8px 4px', opacity: '0.7' }); return d; }

        /* TAB 1 */
        contentMain.appendChild(createTitle('UI Theme'));
        const themeSel = document.createElement('select'); themeSel.id = 'mega-theme-sel'; themeSel.className = 'mega-select';
        themeSel.innerHTML = '<option value="cyberpunk">Cyberpunk</option><option value="matrix">Matrix</option><option value="synthwave">Synthwave</option><option value="light">Clean Light</option>';
        themeSel.onchange = function(e) { panel.dataset.megaTheme = e.target.value; document.querySelectorAll('.mega-window').forEach(w => w.dataset.megaTheme = e.target.value); };
        contentMain.appendChild(themeSel);

        contentMain.appendChild(createTitle('Visual Effects'));
        contentMain.appendChild(createBtn('Start Matrix Rain', '💻', function() {
            if (state.matrix.active) { clearInterval(state.matrix.interval); state.matrix.canvas.remove(); state.matrix.active = false; } else {
                const t = document.createElement('canvas'); Object.assign(t.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '999990' }); document.body.appendChild(t);
                const i = t.getContext('2d'); let n = t.width = window.innerWidth, a = t.height = window.innerHeight, r = Math.floor(n / 15) + 1, s = Array(r).fill(0);
                state.matrix.interval = setInterval(function() { i.fillStyle = 'rgba(0, 0, 0, 0.05)'; i.fillRect(0, 0, n, a); i.fillStyle = '#0F0'; i.font = '15px monospace'; for (let e = 0; e < r; e++) { i.fillText(String.fromCharCode(48 + 33 * Math.random()), 15 * e, s[e]); if (s[e] > 758 + 10000 * Math.random()) s[e] = 0; else s[e] += 15; } }, 50);
                state.matrix.canvas = t; state.matrix.active = true;
            } return state.matrix.active;
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
                state.flow.listener = function(e) { for(let k=0;k<3;k++) particles.push({ x:e.clientX, y:e.clientY, vx:(Math.random()-0.5)*6, vy:(Math.random()-0.5)*6, life:1, size:Math.random()*15+10, color:'hsl('+(hue+Math.random()*40)+',100%,60%)' }); };
                window.addEventListener('mousemove', state.flow.listener);
                function draw() { i.clearRect(0,0,n,a); i.globalCompositeOperation='lighter'; hue=(hue+4)%360; for(let k=0;k<particles.length;k++){ let p=particles[k]; p.x+=p.vx; p.y+=p.vy; p.life-=0.02; if(p.life<=0){particles.splice(k,1);k--;continue;} let sz=Math.max(0.1,p.size*p.life); const g=i.createRadialGradient(p.x,p.y,0,p.x,p.y,sz*2); g.addColorStop(0,p.color); g.addColorStop(1,'transparent'); i.globalAlpha=p.life; i.fillStyle=g; i.beginPath(); i.arc(p.x,p.y,sz*2,0,Math.PI*2); i.fill(); } state.flow.frame=requestAnimationFrame(draw); }
                draw(); state.flow.canvas = t; state.flow.active = true;
            } return state.flow.active;
        }));
        contentMain.appendChild(createBtn('Mode: Flashlight', '🔦', function() {
            if(state.flashlight.active) { document.removeEventListener('mousemove', state.flashlight.listener); if(state.flashlight.overlay) state.flashlight.overlay.remove(); state.flashlight.active = false; }
            else { const o = document.createElement('div'); Object.assign(o.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '999980', background: 'radial-gradient(circle at 50vw 50vh, transparent 100px, rgba(0,0,0,0.95) 150px)' }); document.body.appendChild(o); state.flashlight.overlay = o;
                state.flashlight.listener = (e) => o.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, transparent 100px, rgba(0,0,0,0.95) 150px)`;
                document.addEventListener('mousemove', state.flashlight.listener); state.flashlight.active = true; } return state.flashlight.active;
        }));
        contentMain.appendChild(createBtn('System Shake', '💢', function() { state.shake.active = !state.shake.active; document.body.classList.toggle('mega-shake-active', state.shake.active); return state.shake.active; }));

        /* TAB 2 */
        contentEdit.appendChild(createTitle('Element Tools'));
        contentEdit.appendChild(createBtn('Enable DOM Zapper', '⚡', function() {
            if (state.zapper.active) { document.removeEventListener('mouseover', state.zapper.overListener, true); document.removeEventListener('mouseout', state.zapper.outListener, true); document.removeEventListener('click', state.zapper.clickListener, true); if (state.zapper.hoveredEl) state.zapper.hoveredEl.classList.remove('mega-zapper-hover'); state.zapper.active = false; }
            else { state.zapper.overListener = t => { if (!t.target.closest('.mega-window')) { state.zapper.hoveredEl = t.target; t.target.classList.add('mega-zapper-hover'); } };
                state.zapper.outListener = t => t.target.classList.remove('mega-zapper-hover');
                state.zapper.clickListener = t => { if (!t.target.closest('.mega-window')) { t.preventDefault(); t.stopPropagation(); t.target.remove(); } };
                document.addEventListener('mouseover', state.zapper.overListener, true); document.addEventListener('mouseout', state.zapper.outListener, true); document.addEventListener('click', state.zapper.clickListener, true); state.zapper.active = true; } return state.zapper.active;
        }));
        contentEdit.appendChild(createBtn('Mode: Element Cloner', '👯', function() {
            if(state.cloner.active) { document.removeEventListener('click', state.cloner.clickListener, true); state.cloner.active = false; }
            else { state.cloner.clickListener = e => { if(!e.target.closest('.mega-window')) { e.preventDefault(); e.stopPropagation(); const clone = e.target.cloneNode(true); e.target.parentNode.insertBefore(clone, e.target.nextSibling); } };
                document.addEventListener('click', state.cloner.clickListener, true); state.cloner.active = true; } return state.cloner.active;
        }));
        contentEdit.appendChild(createTitle('Image Tools'));
        contentEdit.appendChild(createBtn('Live Image Editor', '🛠️', function() {
            if(state.imgEditor.active) { document.removeEventListener('mouseover', state.imgEditor.overListener, true); document.removeEventListener('mouseout', state.imgEditor.outListener, true); document.removeEventListener('click', state.imgEditor.clickListener, true); if(state.imgEditor.toolbar) state.imgEditor.toolbar.remove(); state.imgEditor.active = false; }
            else { state.imgEditor.overListener = e => { if(e.target.tagName === 'IMG' && !e.target.closest('.mega-window')) e.target.classList.add('mega-editor-hover'); };
                state.imgEditor.outListener = e => { if(e.target.tagName === 'IMG') e.target.classList.remove('mega-editor-hover'); };
                state.imgEditor.clickListener = e => { if(e.target.tagName === 'IMG' && !e.target.closest('.mega-window')) { e.preventDefault(); e.stopPropagation(); e.target.classList.remove('mega-editor-hover'); spawnImageEditorToolbar(e.target); } };
                document.addEventListener('mouseover', state.imgEditor.overListener, true); document.addEventListener('mouseout', state.imgEditor.outListener, true); document.addEventListener('click', state.imgEditor.clickListener, true); state.imgEditor.active = true; } return state.imgEditor.active;
        }));
        const imgInput = document.createElement('input'); imgInput.className = 'mega-input'; imgInput.placeholder = 'Image URL (Paste or Drop)'; contentEdit.appendChild(imgInput);
        contentEdit.appendChild(createBtn('Mode: Imager', '🖼️', () => { if(imgInput.value) spawnImager(imgInput.value); }));

        /* TAB 3 */
        contentLinks.appendChild(createTitle('Link Hijacker'));
        const linkInp = document.createElement('input'); linkInp.className = 'mega-input'; linkInp.placeholder = 'Target URL...'; contentLinks.appendChild(linkInp);
        contentLinks.appendChild(createBtn('Click to Hijack', '🔗', function() {
            if(state.hijacker.active) { document.removeEventListener('click', state.hijacker.clickListener, true); state.hijacker.active = false; }
            else { state.hijacker.clickListener = e => { const a = e.target.closest('a'); if(a && !a.closest('.mega-window')) { e.preventDefault(); a.href = linkInp.value || '#'; } };
                document.addEventListener('click', state.hijacker.clickListener, true); state.hijacker.active = true; } return state.hijacker.active;
        }));

        panel.append(contentMain, contentEdit, contentLinks);
        const closeBtn = document.createElement('button'); closeBtn.className = 'mega-btn'; closeBtn.style.marginTop = '20px';
        closeBtn.innerHTML = '✖ Close System'; closeBtn.onclick = () => { document.getElementById('fun-effects-mega-ui').remove(); document.getElementById(styleId).remove(); };
        panel.appendChild(closeBtn); document.body.appendChild(panel);
    }

    const splash = document.createElement('div');
    splash.innerHTML = `<div style="position:fixed;inset:0;background:#000;z-index:9999999;display:flex;align-items:center;justify-content:center;color:#00f0ff;font-family:monospace;font-size:30px;letter-spacing:10px;animation:fade 2s forwards">NEXUS INITIALIZING...</div><style>@keyframes fade{80%{opacity:1}100%{opacity:0;pointer-events:none}}</style>`;
    document.body.appendChild(splash);
    setTimeout(() => { splash.remove(); buildUI(); }, 2000);
})();
}

/* 
   ================================================================
   PART 2: MICRO:BIT CONNECTIVITY & CURSOR FIX
   ================================================================
*/
let started = false;
let buttons = [];
let selectedIndex = 0;
let buffer = "";

// Virtual Cursor
let cursor;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
const SPEED = 15;

function createCursor() {
    if (cursor) return;
    cursor = document.createElement("div");
    Object.assign(cursor.style, {
        position: "fixed",
        left: cursorX + "px",
        top: cursorY + "px",
        width: "16px",
        height: "16px",
        background: "cyan",
        borderRadius: "50%",
        zIndex: "10000000",
        pointerEvents: "none",
        boxShadow: "0 0 20px cyan"
    });
    document.body.appendChild(cursor);
}

function waitForButtons() {
    const check = setInterval(() => {
        buttons = Array.from(document.querySelectorAll(".mega-btn"));
        if (buttons.length > 0) {
            clearInterval(check);
            selectedIndex = 0;
            highlightSelected();
        }
    }, 300);
}

function highlightSelected() {
    buttons.forEach((btn, i) => {
        btn.style.outline = (i === selectedIndex) ? "3px solid cyan" : "";
        btn.style.boxShadow = (i === selectedIndex) ? "0 0 15px cyan" : "";
    });
}

function selectNext() {
    buttons = Array.from(document.querySelectorAll(".mega-btn"));
    if (buttons.length === 0) return;
    selectedIndex = (selectedIndex + 1) % buttons.length;
    highlightSelected();
}

function clickSelected() {
    if (buttons.length > 0) buttons[selectedIndex].click();
}

// THE FIX: moveCursor now dispatches a REAL mouse move event
function moveCursor(dx, dy) {
    if (!cursor) return;
    cursorX += dx * SPEED;
    cursorY += dy * SPEED;
    cursorX = Math.max(0, Math.min(window.innerWidth, cursorX));
    cursorY = Math.max(0, Math.min(window.innerHeight, cursorY));
    cursor.style.left = cursorX + "px";
    cursor.style.top = cursorY + "px";

    // ✅ DISPATCH SYNTHETIC MOUSEMOVE EVENT
    // This allows Fluid Trail and Flashy Flow to follow the micro:bit cursor
    const mouseEv = new MouseEvent('mousemove', {
        clientX: cursorX,
        clientY: cursorY,
        bubbles: true
    });
    window.dispatchEvent(mouseEv);
}

function cursorClick() {
    const el = document.elementFromPoint(cursorX, cursorY);
    if (el) el.click();
}

document.getElementById("connect").onclick = async () => {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        document.getElementById("connect").style.display = "none";
        
        const reader = port.readable.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value);
            let lines = buffer.split("\n");
            buffer = lines.pop();

            for (let line of lines) {
                const text = line.trim();
                if (!text) continue;

                if (!started && text === "A") {
                    started = true;
                    launchNexus();
                    createCursor();
                    waitForButtons();
                    continue;
                }

                if (started) {
                    if (text === "A") selectNext();
                    else if (text === "B") clickSelected();
                    else if (text === "AB") cursorClick();
                    else if (text.startsWith("TILT:")) {
                        const parts = text.split(":")[1].split(",");
                        moveCursor(parseInt(parts[0]), parseInt(parts[1]));
                    }
                }
            }
        }
    } catch (e) {
        console.error("Serial error", e);
    }
};
</script>
</body>
</html>
