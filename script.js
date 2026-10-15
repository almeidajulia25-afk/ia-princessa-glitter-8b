const C = document.getElementById('c'), W = 800, H = 450, G = 370;
let X = C.getContext('2d');

const LV = [
    {n:'Reino Medieval',sky:['#8fd3ff','#ffe0f0'],gr:'#7bd66b',gd:'#4a9e4a',far:'#c9b6f0',d:0,b:'Rei Sombrio',bc:'#5a2d82',en:[['Goblin','#6a8f3a'],['Sapo Bruxo','#4a8f6a'],['Morcego Sombrio','#6a4a9a'],['Cavaleiro Fantasma','#8a9aaa']]},
    {n:'Floresta Colorida',sky:['#b6f5c6','#fff3b0'],gr:'#5ee08a',gd:'#2fa65a',far:'#ffb0dc',d:1,b:'Ent Venenoso',bc:'#3a7a3a',en:[['Cogumelo Mau','#d9534f'],['Coelho Zumbi','#9a8aa0'],['Vespa Neon','#e8c020'],['Planta Atiradora','#2fa65a']]},
    {n:'Praia',sky:['#7fdcff','#fff6d0'],gr:'#ffe3a1',gd:'#e8c27a',far:'#6fd0ee',d:2,b:'Kraken Gosma',bc:'#8a2a7a',en:[['Caranguejo','#ff7a4a'],['Peixe Pulador','#3a8aff'],['Gaivota Louca','#dde','#fff'],['Água-viva','#e870d0']]},
    {n:'Cidade Medieval',sky:['#ffb3d9','#ffd9a8'],gr:'#d8c8b4',gd:'#9e8b7b',far:'#b49ad9',d:3,b:'Bruxa da Praça',bc:'#3a2a5a',en:[['Rato Gigante','#7a6a6a'],['Gárgula','#6a7a8a'],['Corvo Sombra','#2a2a3a'],['Mago Sombrio','#7a3ab0']]},
    {n:'Caminho de Casa',sky:['#ff9ad5','#ffd1e8'],gr:'#ff9fd0',gd:'#d8559d',far:'#ffc2e4',d:4,b:'Lord Tédio',bc:'#3a3a5a',en:[['Nuvem Cinza','#8a8aa0'],['Gosma Escura','#4a3a6a'],['Morcego Neon','#c03a8a'],['Olho Vigia','#e8e8f0']]}
];

const OUT = [['#ff4fa3','#ffb3d9','#ff7ac0'],['#3fa9ff','#bde3ff','#7cc8ff'],['#a35cff','#dcc0ff','#c08cff'],['#ffc928','#fff0a0','#ffe066']];
const ON = ['Rosa Coração','Azul Gelo: tiro rápido','Lilás Mágico: tiro triplo','Dourado Estrela: tiro perfurante'];
const K = {};

let st = 'title', lv = 0, sc = 0, cam = 0, t = 0, P, E = [], PL = [], PK = [], UN = [], SH = [], EB = [], PA = [], BO = null, L = 3200, banner = 0, doneT = 0, seed = 1, unT = 600, last = 0, acc = 0;

P = {x:0, y:G, f:1, hp:5, gl:30, o:0, m:0};

const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

addEventListener('keydown', e => {
    K[e.code] = 1;
    if (/Space|Arrow/.test(e.code)) e.preventDefault();
    if (st != 'play' && (e.code == 'Enter' || e.code == 'Space')) start();
});

addEventListener('keyup', e => K[e.code] = 0);

function start() {
    lv = 0; sc = 0;
    P = {x:80, y:G, vx:0, vy:0, f:1, hp:5, gl:30, inv:0, o:0, m:0, cd:0, g:1};
    load();
    st = 'play';
}

function mk(ty, x) {
    let e = LV[lv].en[ty];
    return {t:ty, x, hx:x, y:ty==2?G-130:G, vx:-1, vy:0, s:0, hp:1+(ty==3?2:ty==1?1:0)+(lv>>1), w:38, h:34, c:e[1], fl:0};
}

function load() {
    seed = lv * 977 + 13; PL = []; E = []; PK = []; UN = []; SH = []; EB = []; PA = []; doneT = 0; banner = 170; cam = 0; unT = 500;
    P.x = 80; P.y = G; P.vx = P.vy = 0; P.m = 0;
    BO = {x:L-250, y:G, w:96, h:104, hp:22+lv*8, mx:22+lv*8, vx:-1.6, vy:0, s:0, inv:0, fl:0, act:0, d:0};
    for (let i = 0; i < 15; i++) {
        let x = 320 + i * 190 + R() * 60, y = G - 70 - R() * 80;
        PL.push({x, y, w:110});
        if (R() < .7) PK.push({x:x+55, y:y-26, k:0});
        if (i % 5 == 4) PK.push({x:x+55, y:y-26, k:1});
    }
    for (let i = 0; i < 12; i++) E.push(mk(i % 4, 500 + i * 185 + R() * 60));
    for (let i = 0; i < 10; i++) PK.push({x:400 + i * 250, y:G - 24, k:0});
    PK.push({x:1500, y:G-30, k:2});
    mkbg();
}

function spark(x, y, c, n) {
    for (let i = 0; i < n; i++) PA.push({x, y, vx:(Math.random()-.5)*5, vy:(Math.random()-.8)*5, l:30, c});
}

function hurt() {
    if (P.inv > 0) return;
    P.hp--; P.inv = 100; P.vy = -6; P.x -= P.f * 30; P.m = 0;
    spark(P.x, P.y - 30, '#f44', 8);
    if (P.hp <= 0) st = 'over';
}

function hitE(e, d) {
    e.hp -= d; e.fl = 4; sc += 10;
    spark(e.x, e.y - 15, e.c, 5);
    if (e.hp <= 0) {
        e.d = 1; sc += 100;
        spark(e.x, e.y - 15, e.c, 16);
        if (R() < .4) PK.push({x:e.x, y:G-24, k:0});
    }
}

function fire() {
    let o = P.o, c = OUT[o][0], d = P.f, cost = o == 2 ? 2 : 1;
    if (P.gl < cost) return;
    P.gl -= cost; P.cd = o == 1 ? 9 : o == 3 ? 22 : 16;
    const add = (a, pi, r, dm) => SH.push({x:P.x+d*18, y:P.y-34, vx:d*Math.cos(a)*9, vy:Math.sin(a)*9, c, pi, r, dm, l:70, h:[]});
    if (o == 2) { add(0, 0, 5, 1); add(-.25, 0, 5, 1); add(.25, 0, 5, 1); }
    else add(0, o == 3, o == 3 ? 11 : 6, o == 3 ? 3 : 1);
}

function upd() {
    if (banner > 0) banner--;
    let sp = P.m ? 5 : 3.2; P.vx = 0;
    if (K.ArrowLeft) { P.vx = -sp; P.f = -1; }
    if (K.ArrowRight) { P.vx = sp; P.f = 1; }
    if (K.Space && P.g) { P.vy = P.m ? -14 : -12; P.g = 0; }
    P.vy += .6; let py = P.y; P.x += P.vx; P.y += P.vy; P.g = 0;
    if (P.y >= G) { P.y = G; P.vy = 0; P.g = 1; }
    else if (P.vy >= 0) for (const p of PL) if (P.x + 13 > p.x && P.x - 13 < p.x + p.w && py <= p.y && P.y >= p.y) { P.y = p.y; P.vy = 0; P.g = 1; }
    P.x = Math.max(20, Math.min(L + 260, P.x));
    if (BO && BO.act && !BO.d) P.x = Math.max(P.x, L - 800);
    if (P.cd > 0) P.cd--; if (P.inv > 0) P.inv--; if (P.m > 0) P.m--;
    if (t % 80 == 0 && P.gl < 40) P.gl++;
    if ((K.KeyX || K.KeyZ) && P.cd <= 0) fire();
    cam = Math.max(0, Math.min(L + 300 - W, P.x - 320));

    if (--unT <= 0) { if (!P.m && !UN.length && P.x < L - 900) UN.push({x: P.x + 420}); unT = 500 + Math.random() * 300; }
    for (const u of UN) if (Math.abs(u.x - P.x) < 34 && Math.abs(P.y - G) < 40) { P.m = 700; u.d = 1; spark(P.x, P.y - 30, '#fff', 20); }
    UN = UN.filter(u => !u.d && u.x > P.x - 500);

    for (const k of PK) if (!k.d && Math.abs(P.x - k.x) < 22 && Math.abs(P.y - 27 - k.y) < 40) {
        k.d = 1;
        if (k.k == 0) { P.gl = Math.min(40, P.gl + 5); sc += 10; }
        if (k.k == 1) { P.hp = Math.min(6, P.hp + 1); sc += 50; }
        if (k.k == 2) { P.o = Math.min(3, P.o + 1); sc += 200; banner = 120; spark(P.x, P.y - 30, OUT[P.o][0], 24); }
    }

    for (const s of SH) {
        s.x += s.vx; s.y += s.vy; s.l--;
        if (t % 3 == 0) spark(s.x, s.y, s.c, 1);
        for (const e of E) if (!e.d && !s.h.includes(e) && Math.abs(s.x - e.x) < e.w / 2 + s.r && s.y > e.y - e.h - s.r && s.y < e.y + s.r) { hitE(e, s.dm); s.h.push(e); if (!s.pi) s.l = 0; }
        if (BO.act && !BO.d && !s.h.includes(BO) && Math.abs(s.x - BO.x) < BO.w / 2 + s.r && s.y > BO.y - BO.h && s.y < BO.y) { BO.hp -= s.dm; BO.fl = 4; sc += 10; spark(s.x, s.y, s.c, 4); s.h.push(BO); if (!s.pi) s.l = 0; }
    }
    SH = SH.filter(s => s.l > 0);

    for (const e of E) {
        if (e.d || Math.abs(e.x - P.x) > 900) continue;
        e.s++; if (e.fl > 0) e.fl--;
        if (e.t == 0) { e.x += e.vx; if (Math.abs(e.x - e.hx) > 100) e.vx *= -1; }
        if (e.t == 1) { if (e.s % 90 == 0 && e.y >= G) e.vy = -10; e.vy += .5; e.y += e.vy; if (e.y >= G) { e.y = G; e.vy = 0; } else e.x += P.x < e.x ? -1.2 : 1.2; }
        if (e.t == 2) { if (Math.abs(P.x - e.x) > 6) e.x += P.x < e.x ? -1 : 1; e.y = G - 110 + Math.sin(e.s / 20) * 40; }
        if (e.t == 3 && e.s % 110 == 0 && Math.abs(e.x - P.x) < 500) { let a = Math.atan2(P.y - 40 - (e.y - 20), P.x - e.x); EB.push({x:e.x, y:e.y-20, vx:Math.cos(a)*3.5, vy:Math.sin(a)*3.5, l:200}); }
        if (Math.abs(P.x - e.x) < (26 + e.w) / 2 - 4 && P.y > e.y - e.h && P.y - 54 < e.y) { if (P.m) hitE(e, 9); else hurt(); }
    }

    if (!BO.d) {
        if (!BO.act && P.x > L - 760) { BO.act = 1; banner = 120; }
        if (BO.act) {
            BO.s++; BO.x += BO.vx;
            if (BO.x < L - 520) BO.vx = 1.6; if (BO.x > L + 10) BO.vx = -1.6;
            if (BO.s % 120 == 0 && BO.y >= G) BO.vy = -13;
            BO.vy += .6; BO.y += BO.vy; if (BO.y > G) { BO.y = G; BO.vy = 0; }
            if (BO.s % 100 == 0) for (const a of [-.3, 0, .3]) { let b = Math.atan2(P.y - 50 - (BO.y - 60), P.x - BO.x) + a; EB.push({x:BO.x, y:BO.y-60, vx:Math.cos(b)*4, vy:Math.sin(b)*4, l:220}); }
            if (BO.inv > 0) BO.inv--; if (BO.fl > 0) BO.fl--;
            if (Math.abs(P.x - BO.x) < (26 + BO.w) / 2 - 6 && P.y > BO.y - BO.h && P.y - 54 < BO.y) {
                if (P.m) { if (BO.inv <= 0) { BO.hp -= 4; BO.inv = 40; BO.fl = 6; sc += 50; P.x -= P.f * 60; spark(BO.x, BO.y - 50, '#fff', 14); } }
                else hurt();
            }
            if (BO.hp <= 0) { BO.d = 1; sc += 1000; spark(BO.x, BO.y - 50, '#ffd84d', 50); doneT = 1; }
        }
    }

    if (doneT > 0 && ++doneT > 170) {
        lv++;
        if (lv > 4) { lv = 4; st = 'win'; }
        else { P.hp = Math.min(6, P.hp + 2); P.gl = Math.min(40, P.gl + 15); load(); }
    }

    for (const b of EB) { b.x += b.vx; b.y += b.vy; b.l--; if (Math.abs(b.x - P.x) < 14 && b.y > P.y - 56 && b.y < P.y) { hurt(); b.l = 0; } }
    EB = EB.filter(b => b.l > 0);
    for (const p of PA) { p.x += p.vx; p.y += p.vy; p.vy += .1; p.l--; }
    PA = PA.filter(p => p.l > 0);
}

let BG = {};
const rr = s => { s = Math.sin(s * 127.1) * 43758.5; return s - Math.floor(s); };

function wb(x, y, rx, ry, col, a, s) {
    for (let k = 0; k < 3; k++) {
        X.globalAlpha = a * (k ? .55 : .8); X.fillStyle = col; X.beginPath();
        for (let i = 0; i <= 14; i++) {
            let an = i / 14 * 6.283, r = 1 + (rr(s + k * 9 + i % 14) - .5) * .22, px = x + Math.cos(an) * rx * r * (1 - k * .04), py = y + Math.sin(an) * ry * r * (1 - k * .04);
            i ? X.lineTo(px, py) : X.moveTo(px, py);
        }
        X.fill();
    }
    X.globalAlpha = a * .5; X.strokeStyle = col; X.lineWidth = 1.5; X.stroke(); X.globalAlpha = 1;
}

function wp(p, col, a, s) {
    for (let k = 0; k < 3; k++) {
        let q = p.map((v, i) => [v[0] + (rr(s + i + k * 7) - .5) * 5, v[1] + (rr(s + i * 3 + k * 5) - .5) * 5]), n = q.length;
        X.globalAlpha = a * (k ? .5 : .8); X.fillStyle = col; X.beginPath();
        X.moveTo((q[0][0] + q[n-1][0]) / 2, (q[0][1] + q[n-1][1]) / 2);
        for (let i = 0; i < n; i++) {
            let b = q[i], c = q[(i + 1) % n];
            X.quadraticCurveTo(b[0], b[1], (b[0] + c[0]) / 2, (b[1] + c[1]) / 2);
        }
        X.fill();
        if (k == 2) { X.globalAlpha = a * .6; X.strokeStyle = col; X.lineWidth = 1.2; X.stroke(); }
    }
    X.globalAlpha = 1;
}

function star(x, y, r, c) {
    X.fillStyle = c; X.beginPath(); X.moveTo(x, y - r);
    X.quadraticCurveTo(x, y, x + r, y); X.quadraticCurveTo(x, y, x, y + r);
    X.quadraticCurveTo(x, y, x - r, y); X.quadraticCurveTo(x, y, x, y - r); X.fill();
}

function heart(x, y, s, c) {
    X.fillStyle = c; X.beginPath(); X.moveTo(x, y + s * .5);
    X.bezierCurveTo(x - s * 1.2, y - s * .2, x - s * .5, y - s, x, y - s * .4);
    X.bezierCurveTo(x + s * .5, y - s, x + s * 1.2, y - s * .2, x, y + s * .5); X.fill();
}

function mkc(w, h, fn) {
    let c = document.createElement('canvas'); c.width = w; c.height = h;
    let o = X; X = c.getContext('2d'); fn(); X = o; return c;
}

function mkbg() {
    let l = LV[lv];
    BG.sky = mkc(W, G + 40, () => {
        let g = X.createLinearGradient(0, 0, 0, G + 40);
        g.addColorStop(0, l.sky[0]); g.addColorStop(1, l.sky[1]); X.fillStyle = g; X.fillRect(0, 0, W, G + 40);
        for (let i = 0; i < 9; i++) {
            let x = rr(i + lv * 9) * W, y = rr(i * 3 + lv) * 250, r = 90 + rr(i + 5) * 90, q = X.createRadialGradient(x, y, 0, x, y, r);
            q.addColorStop(0, ['#ffffffaa','#ffd1ecaa','#d9c8ffaa','#c8f0ffaa'][i % 4]); q.addColorStop(1, '#fff0'); X.fillStyle = q; X.fillRect(x - r, y - r, 2 * r, 2 * r);
        }
        let s = X.createRadialGradient(650, 70, 0, 650, 70, 90);
        s.addColorStop(0, '#fffbe0'); s.addColorStop(.3, '#fff2b0aa'); s.addColorStop(1, '#fff0'); X.fillStyle = s; X.fillRect(550, 0, 200, 180);
        if (l.d == 4) {
            X.lineWidth = 12;
            ['#ff5a8a','#ffa84a','#ffe84a','#5ae88a','#4ab8ff','#a35cff'].forEach((c, i) => {
                X.globalAlpha = .4; X.strokeStyle = c; X.beginPath(); X.arc(420, G + 80, 240 - i * 11, Math.PI, 0); X.stroke();
            });
            X.globalAlpha = 1;
        }
    });

    BG.far = mkc(1600, 200, () => {
        for (let i = 0; i < 8; i++) for (let d = -1; d < 2; d++) wb(i * 200 + 100 + d * 1600, 195, 130 + rr(i + 3) * 50, 70 + rr(i) * 60, l.far, .55, i * 5);
    });

    BG.mid = mkc(1920, 260, () => {
        let B = 240; if (l.d == 2) wp([[-30, B - 40], [1950, B - 40], [1950, B + 30], [-30, B + 30]], '#4fc9e8', .55, 3);
        for (let i = 0; i < 8; i++) {
            let x = i * 240 + 60, s = i * 7 + lv;
            if (l.d == 0) {
                wp([[x, B], [x, B - 110], [x + 60, B - 110], [x + 60, B]], '#cdb8f2', .85, s);
                wp([[x + 75, B], [x + 75, B - 80], [x + 125, B - 80], [x + 125, B]], '#e0cdf8', .85, s + 1);
                wp([[x - 8, B - 105], [x + 30, B - 165], [x + 68, B - 105]], '#ff7fbd', .85, s + 2);
                wp([[x + 68, B - 78], [x + 100, B - 125], [x + 132, B - 78]], '#ff9ccb', .85, s + 3);
                wb(x + 30, B - 50, 8, 12, '#8f5cff', .7, s);
            }
            if (l.d == 1 || l.d == 4) {
                wp([[x + 22, B], [x + 26, B - 80], [x + 38, B - 80], [x + 42, B]], l.d == 4 ? '#ffffff' : '#9a6a4a', .85, s);
                ['#ff7fbd','#ffd84a','#a07cff','#5ad0f0'].forEach((c, k) => wb(x + 32 + (k - 1.5) * 14, B - 95 - (k % 2) * 16, 28, 24, c, .6, s + k));
            }
            if (l.d == 2) {
                X.strokeStyle = '#9a6a4a'; X.lineWidth = 7; X.lineCap = 'round'; X.beginPath();
                X.moveTo(x + 30, B); X.quadraticCurveTo(x + 52, B - 60, x + 32, B - 105); X.stroke();
                for (let k = 0; k < 5; k++) wb(x + 32 + Math.cos(k * 1.3 - 2.6) * 24, B - 110 + Math.sin(k * 1.3 - 2.6) * 10, 26, 7, '#3ac07a', .7, s + k);
            }
            if (l.d == 3) {
                wp([[x, B], [x, B - 70], [x + 80, B - 70], [x + 80, B]], ['#fff0e0','#ffe4c8','#f5e0ff'][i % 3], .85, s);
                wp([[x - 8, B - 66], [x + 40, B - 118], [x + 88, B - 66]], '#ff7fbd', .85, s + 1);
                wb(x + 22, B - 42, 8, 9, '#8fd0ff', .8, s); wb(x + 58, B - 42, 8, 9, '#8fd0ff', .8, s + 2);
            }
        }
    });

    BG.gnd = mkc(800, H - G + 10, () => {
        let f = x => 16 + 6 * Math.sin(x / 800 * 12.566), hh = H - G + 10;
        X.fillStyle = l.gd; X.beginPath(); X.moveTo(-10, hh);
        for (let x = -10; x <= 810; x += 20) X.lineTo(x, f(x));
        X.lineTo(810, hh); X.fill();
        X.fillStyle = l.gr; X.beginPath();
        for (let x = -10; x <= 810; x += 20) X.lineTo(x, f(x));
        for (let x = 810; x >= -10; x -= 20) X.lineTo(x, f(x) + 22 + 4 * Math.sin(x / 50));
        X.fill();
        for (let i = 0; i < 30; i++) wb(rr(i) * 800, 50 + rr(i + 50) * 40, 30 + rr(i + 9) * 40, 5, i % 2 ? '#ffffff' : '#7a4a8a', .22, i);
        for (let i = 0; i < 24; i++) wb(rr(i + 70) * 800, 12 + rr(i + 3) * 12, 3.5, 3.5, ['#ff7fbd','#ffffff','#ffd84a','#b08cff'][i % 4], .9, i);
    });

    if (!BG.pat) BG.pat = X.createPattern(mkc(128, 128, () => {
        for (let i = 0; i < 1100; i++) {
            X.fillStyle = i % 2 ? '#7a5a3a' : '#ffffff';
            X.globalAlpha = .1 + rr(i) * .2;
            X.fillRect(rr(i + 1) * 128, rr(i + 2) * 128, 1 + rr(i + 3) * 1.5, 1 + rr(i + 4) * 1.5);
        }
    }), 'repeat');
}

function shadow(x, y, w) {
    let k = Math.max(.3, 1 - (G - y) / 250);
    X.fillStyle = 'rgba(70,30,100,.22)'; X.beginPath();
    X.ellipse(x, G + 9, w * k, 5 * k, 0, 0, 7); X.fill();
}

function hero(x, y, f, o, run) {
    X.save(); X.translate(x, y); X.scale(f, 1);
    let c = OUT[o], a = Math.sin(t / 8) * 3, sw = run ? Math.sin(t / 3) * 3 : 0;
    wp([[-6, -60], [-15, -52], [-19 + a, -32], [-14 + a * 1.5, -16], [-7, -34]], '#f2c040', .9, 1);
    wb(-5 + sw, -2, 6, 3, c[0], .9, 2); wb(5 - sw, -2, 6, 3, c[0], .9, 3);
    wp([[-5, -36], [5, -36], [19 + sw, -8], [12, 1], [-12, 1], [-19 - sw, -8]], c[0], .9, 4);
    wb(-4, -17, 9, 11, c[1], .45, 5);
    [-9, 0, 9].forEach((u, i) => wb(u, -1, 6, 3.5, c[1], .8, 6 + i));
    wp([[-6, -36], [6, -36], [5, -47], [-5, -47]], c[0], .95, 9);
    wb(0, -41, 5, 3, c[2], .6, 10);
    X.lineCap = 'round'; X.strokeStyle = '#f6cfae'; X.lineWidth = 4; X.beginPath(); X.moveTo(3, -44); X.lineTo(14, -39); X.stroke();
    X.strokeStyle = '#f0c24a'; X.lineWidth = 2; X.beginPath(); X.moveTo(13, -39); X.lineTo(21, -50); X.stroke();
    star(21, -53, 6 + Math.sin(t / 5) * 1.5, '#fff3a0');
    wb(0, -55, 9, 10, '#fbd5b8', .95, 11); wb(5, -52, 3, 2, '#ff9ab8', .5, 12);
    X.fillStyle = '#fff'; X.beginPath(); X.ellipse(4, -56, 3, 3.6, 0, 0, 7); X.fill();
    X.fillStyle = '#3a86e8'; X.beginPath(); X.arc(4.6, -56, 2.1, 0, 7); X.fill();
    X.fillStyle = '#fff'; X.fillRect(4, -57, 1, 1);
    X.strokeStyle = '#4a2a2a'; X.lineWidth = 1.2; X.beginPath(); X.arc(4, -56, 3.6, Math.PI * 1.1, Math.PI * 1.9); X.stroke();
    X.strokeStyle = '#e0507a'; X.lineWidth = 1.5; X.beginPath(); X.arc(5.5, -50.5, 2, .2, Math.PI - .2); X.stroke();
    wp([[-10, -52], [-10, -64], [0, -69], [10, -63], [10, -57], [4, -60], [-3, -58]], '#f2c040', .95, 13);
    wp([[-5, -66], [-3, -72], [0, -67], [3, -72], [5, -66]], '#ffd84a', .95, 14);
    wb(0, -68, 2, 2, c[2], .9, 15); X.restore();
}

function uni(x, y, f) {
    X.save(); X.translate(x, y); X.scale(f, 1);
    let a = Math.sin(t / 6) * 4, sw = Math.sin(t / 4) * 5;
    X.strokeStyle = '#f3ecff'; X.lineWidth = 6; X.lineCap = 'round';
    [[-16, 1], [-6, -1], [8, 1], [18, -1]].forEach(q => {
        X.beginPath(); X.moveTo(q[0], -22); X.lineTo(q[0] + q[1] * sw, -2); X.stroke();
    });
    wp([[-34, -32], [-38 + a, -12], [-28 + a, -8], [-24, -26]], '#ff9ccb', .85, 1);
    wb(0, -32, 28, 15, '#ffffff', .95, 2); wb(-4, -26, 18, 8, '#e6d8ff', .5, 3);
    wp([[12, -40], [22, -64], [34, -58], [28, -38]], '#ffffff', .95, 4);
    wb(28, -56, 11, 8, '#ffffff', .95, 5);
    wp([[28, -62], [34, -86], [36, -60]], '#ffd84a', .95, 6);
    ['#ff7fbd','#ffd84a','#8fe0b0','#8fd0ff','#b08cff'].forEach((c, i) => wp([[18 - i * 3, -62], [8 - i * 4 + a, -52 + i * 5], [14 - i * 3, -44 + i * 5]], c, .8, 10 + i));
    X.fillStyle = '#4a2a5a'; X.beginPath(); X.arc(31, -58, 1.8, 0, 7); X.fill(); X.restore();
}

function mon(x, y, w, h, c, ty, fl, crown) {
    X.save(); X.translate(x, y);
    let dp = P.x > x ? 1 : -1, s = ty * 5 + 3, k = fl ? '#ffffff' : c;
    if (crown) wb(0, -h / 2, w * .8, h * .7, '#6a3aa0', .25, s);
    if (ty == 2) {
        let a = Math.sin(t / 3) * .5;
        [-1, 1].forEach(q => { X.save(); X.translate(q * w / 2, -h * .6); X.rotate(q * a); wb(q * 14, 0, 18, 8, '#ffffff', .7, s + q); X.restore(); });
    }
    if (ty == 0 || crown) [-1, 1].forEach(q => wp([[q * w / 3, -h + 6], [q * w / 3 + q * 6, -h - 12], [q * w / 6, -h + 2]], '#3a2a4a', .9, s + 2));
    if (ty == 1) for (let i = -1; i < 2; i++) wp([[i * w / 4 - 6, -h + 4], [i * w / 4, -h - 12], [i * w / 4 + 6, -h + 4]], '#5a3a6a', .7, s + i + 4);
    if (ty == 3) wp([[0, -h / 2 - 6], [w / 2 + 10, -h / 2 - 4], [w / 2 + 10, -h / 2 + 6], [0, -h / 2 + 6]], '#3a2a4a', .9, s + 1);
    wb(0, -h / 2, w / 2, h / 2, k, .9, s);
    if (!fl) wb(-w / 6, -h * .3, w / 4, h / 5, '#ffffff', .25, s + 1);
    if (crown) wp([[-20, -h - 4], [-20, -h - 20], [-10, -h - 12], [0, -h - 24], [10, -h - 12], [20, -h - 20], [20, -h - 4]], '#ffd84a', .95, s + 7);
    [-1, 1].forEach(q => {
        X.fillStyle = '#fff'; X.beginPath(); X.ellipse(q * w / 5, -h * .6, w / 9 + 2, w / 8 + 2, 0, 0, 7); X.fill();
        X.fillStyle = '#2a1a3a'; X.beginPath(); X.arc(q * w / 5 + dp * 2, -h * .6, w / 16 + 1, 0, 7); X.fill();
        X.fillStyle = '#fff'; X.fillRect(q * w / 5 + dp * 2 - 1, -h * .6 - 3, 2, 2);
    });
    X.strokeStyle = '#2a1a3a'; X.lineWidth = 2; X.lineCap = 'round'; X.beginPath();
    X.moveTo(-w / 3, -h * .82); X.lineTo(-w / 10, -h * .72); X.moveTo(w / 3, -h * .82); X.lineTo(w / 10, -h * .72); X.stroke();
    X.fillStyle = '#4a1a3a'; X.beginPath(); X.arc(0, -h * .33, w / 6, 0, Math.PI); X.fill();
    X.fillStyle = '#fff'; X.fillRect(-w / 8, -h * .33, 4, 4); X.fillRect(w / 8 - 4, -h * .33, 4, 4); X.restore();
}

function draw() {
    if (st == 'title') cam = t * 1.5;
    let l = LV[lv], o;
    X.drawImage(BG.sky, 0, 0);
    o = -Math.round(cam * .15) % 1600; X.drawImage(BG.far, o, G - 150); X.drawImage(BG.far, o + 1600, G - 150);
    o = -Math.round(cam * .4) % 1920; X.drawImage(BG.mid, o, G - 240); X.drawImage(BG.mid, o + 1920, G - 240);
    o = -Math.round(cam) % 800; X.drawImage(BG.gnd, o, G - 8); X.drawImage(BG.gnd, o + 800, G - 8);

    if (st == 'title') {
        title(); X.globalAlpha = .1; X.fillStyle = BG.pat; X.fillRect(0, 0, W, H); X.globalAlpha = 1; return;
    }

    X.save(); X.translate(-cam, 0);
    if (l.d == 4) {
        wp([[L + 120, G], [L + 120, G - 90], [L + 230, G - 90], [L + 230, G]], '#ffd1e8', .9, 1);
        wp([[L + 105, G - 85], [L + 175, G - 155], [L + 245, G - 85]], '#ff4fa3', .9, 2);
        heart(L + 175, G - 35, 16, '#ff4fa3');
    }

    for (const p of PL) {
        let m = p.x + p.w / 2;
        wb(m, p.y + 16, p.w / 2 + 4, 13, l.gd, .8, p.x);
        wb(m, p.y + 5, p.w / 2 + 8, 9, l.gr, .9, p.x + 3);
        for (let i = 0; i < 3; i++) wb(p.x + 14 + i * 40, p.y - 1, 4, 4, ['#ff7fbd','#ffffff','#ffd84a'][i], .8, i);
    }

    for (const k of PK) {
        if (k.d) continue;
        let y = k.y + Math.sin(t / 10 + k.x) * 3;
        if (k.k == 0) { star(k.x, y, 10, t % 20 < 10 ? '#ff7fbd' : '#ffd84a'); star(k.x + 9, y - 8, 4, '#fff'); }
        if (k.k == 1) heart(k.x, y, 12, '#ff3a6a');
        if (k.k == 2) {
            let c = OUT[Math.min(3, P.o + 1)];
            wp([[k.x - 4, y - 12], [k.x + 4, y - 12], [k.x + 15, y + 12], [k.x - 15, y + 12]], c[0], .9, 3);
            star(k.x, y - 18, 7, '#ffe066');
        }
    }

    for (const u of UN) { shadow(u.x, G, 28); uni(u.x, G, -1); star(u.x, G - 95 + Math.sin(t / 8) * 5, 8, '#fff'); }
    for (const e of E) if (!e.d) { shadow(e.x, e.y, 20); mon(e.x, e.y, e.w, e.h, e.c, e.t, e.fl); }
    if (!BO.d) { shadow(BO.x, BO.y, 50); mon(BO.x, BO.y, BO.w, BO.h, l.bc, 0, BO.fl, 1); }

    if (!(P.inv > 0 && t % 6 < 3)) {
        shadow(P.x, P.y, 16); let run = P.vx != 0 && P.g;
        if (P.m) { uni(P.x, P.y, P.f); hero(P.x, P.y - 22, P.f, P.o, 0); }
        else hero(P.x, P.y, P.f, P.o, run);
    }

    for (const s of SH) {
        let g = X.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.2);
        g.addColorStop(0, '#fff'); g.addColorStop(.4, s.c); g.addColorStop(1, '#fff0');
        X.fillStyle = g; X.beginPath(); X.arc(s.x, s.y, s.r * 2.2, 0, 7); X.fill();
        star(s.x, s.y, s.r * 1.6, '#fff');
    }

    for (const b of EB) {
        let g = X.createRadialGradient(b.x, b.y, 0, b.x, b.y, 12);
        g.addColorStop(0, '#ffd1f0'); g.addColorStop(.5, '#a0309a'); g.addColorStop(1, '#a0309a00');
        X.fillStyle = g; X.beginPath(); X.arc(b.x, b.y, 12, 0, 7); X.fill();
    }

    for (const p of PA) { X.globalAlpha = p.l / 30; star(p.x, p.y, 2 + p.l / 7, p.c); }
    X.globalAlpha = 1; X.restore();

    hud();
    if (st == 'over') ov('Fim de jogo', 'ENTER para tentar de novo');
    if (st == 'win') ov('Você voltou para casa! 💖', 'Pontos: ' + sc + ' · ENTER para jogar de novo');

    X.globalAlpha = .1; X.fillStyle = BG.pat; X.fillRect(0, 0, W, H); X.globalAlpha = 1;
}

function hud() {
    X.fillStyle = '#4a2a6a99'; X.beginPath(); X.roundRect(8, 6, W - 16, 32, 16); X.fill();
    for (let i = 0; i < P.hp; i++) heart(26 + i * 22, 23, 9, '#ff6a9a');
    X.fillStyle = '#fff'; X.font = 'bold 17px Georgia,serif';
    star(172, 22, 8, '#ffe066'); X.fillText(P.gl, 186, 28);
    X.fillText('Pontos ' + sc, 240, 28); X.fillText('Fase ' + (lv + 1) + '/5', 360, 28);
    wb(458, 22, 9, 9, OUT[P.o][0], .95, 1); X.font = '13px sans-serif';
    X.fillText(ON[P.o] + (P.m ? ' · 🦄' : ''), 474, 27);

    if (BO.act && !BO.d) {
        X.fillStyle = '#4a2a6a99'; X.beginPath(); X.roundRect(200, 44, 400, 18, 9); X.fill();
        X.fillStyle = '#ff7fbd'; X.beginPath(); X.roundRect(203, 47, 394 * Math.max(.02, BO.hp / BO.mx), 12, 6); X.fill();
        X.fillStyle = '#fff'; X.font = 'bold 12px Georgia,serif'; X.textAlign = 'center';
        X.fillText(LV[lv].b, 400, 58); X.textAlign = 'left';
    }

    if (banner > 0) {
        X.globalAlpha = Math.min(1, banner / 40); X.textAlign = 'center';
        X.fillStyle = '#4a2a6a88'; X.beginPath(); X.roundRect(120, 150, 560, 90, 30); X.fill();
        X.fillStyle = '#fff'; X.font = 'italic bold 34px Georgia,serif';
        X.fillText('Fase ' + (lv + 1) + ' · ' + LV[lv].n, 400, 195);
        X.font = '15px sans-serif';
        X.fillText('Inimigos: ' + LV[lv].en.map(e => e[0]).join(' · '), 400, 224);
        X.textAlign = 'left'; X.globalAlpha = 1;
    }

    if (doneT > 0) {
        X.textAlign = 'center'; X.fillStyle = '#fff'; X.font = 'italic bold 42px Georgia,serif';
        X.fillText('Chefão derrotado! ✨', 400, 200); X.textAlign = 'left';
    }
}

function ov(a, b) {
    X.fillStyle = '#4a2a6acc'; X.fillRect(0, 0, W, H);
    X.textAlign = 'center'; X.fillStyle = '#fff';
    X.font = 'italic bold 46px Georgia,serif'; X.fillText(a, 400, 200);
    X.font = '20px sans-serif'; X.fillText(b, 400, 245);
    X.textAlign = 'left';
}

function title() {
    let v = X.createRadialGradient(400, 225, 150, 400, 225, 480);
    v.addColorStop(0, '#ffd1ec00'); v.addColorStop(1, '#7a3a9a99');
    X.fillStyle = v; X.fillRect(0, 0, W, H);

    X.save(); X.translate(160, G + 20); X.scale(4.2, 4.2); hero(0, 0, 1, Math.floor(t / 70) % 4, 0); X.restore();
    X.save(); X.translate(650, G + 10); X.scale(2.4, 2.4); uni(0, 0, -1); X.restore();

    for (let i = 0; i < 10; i++) star(rr(i) * W, 60 + rr(i + 9) * 250, 4 + Math.sin(t / 12 + i) * 3, '#fff');

    X.textAlign = 'center';
    let g = X.createLinearGradient(0, 60, 0, 130);
    g.addColorStop(0, '#fff'); g.addColorStop(1, '#ff7fbd');
    X.fillStyle = g; X.shadowColor = '#ff4fa3'; X.shadowBlur = 20;
    X.font = 'italic bold 62px Georgia,serif'; X.fillText('Princesa Glitter', 400, 110); X.shadowBlur = 0;

    X.fillStyle = '#fff'; X.font = '16px Georgia,serif';
    ['A heroína do Reino Rosa precisa enfrentar as forças do mal!', 'Atravesse 5 mundos mágicos, derrote os chefões e volte para casa.'].forEach((s, i) => X.fillText(s, 400, 150 + i * 22));

    X.fillStyle = '#4a2a6a99'; X.beginPath(); X.roundRect(240, 205, 320, 104, 22); X.fill();
    X.fillStyle = '#fff'; X.font = '14px sans-serif';
    ['← → mover     ESPAÇO pular', 'X (ou Z) lançar glitter mágico', 'Pegue o 🦄 e dê chifradas nos monstros', 'Vestidos novos mudam a magia!'].forEach((s, i) => X.fillText(s, 400, 230 + i * 21));

    if (t % 60 < 40) {
        X.font = 'italic bold 26px Georgia,serif'; X.fillStyle = '#ffe066';
        X.fillText('Pressione ENTER para começar', 400, 350);
    }
    X.textAlign = 'left';
}

mkbg();

function frame(n) {
    acc += Math.min(50, n - last); last = n;
    while (acc > 16.67) { acc -= 16.67; t++; if (st == 'play') upd(); }
    draw();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);