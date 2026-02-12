const typedEl = document.getElementById("typed");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const reveal = document.getElementById("reveal");
const confettiBtn = document.getElementById("confettiBtn");
const copyBtn = document.getElementById("copyBtn");
const dateEl = document.getElementById("date");
const photo = document.getElementById("photo");

const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
}
window.addEventListener("resize", resize);
resize();

dateEl.textContent = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
});

const lines = [
    "Ты улыбаешься — и мир становится мягче.",
    "Можно я украду у тебя минутку…",
    "…и попрошу быть моей валентинкой? 💖"
];

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function typeLine(text, speed = 34) {
    for (let i = 0; i <= text.length; i++) {
        typedEl.textContent = text.slice(0, i);
        await sleep(speed);
    }
}

(async function runTyping() {
    for (let i = 0; i < lines.length; i++) {
        await typeLine(lines[i]);
        await sleep(800);
    }
})();

/* Фото: клик -> небольшой зум */
if (photo) {
    photo.addEventListener("click", () => {
        photo.classList.toggle("zoomed");
    });
}

/* Кнопка "Нет" — убегает, но не слишком жестко */
let noScale = 1;
noBtn.addEventListener("mouseenter", () => {
    const maxX = Math.min(180, window.innerWidth - 220);
    const maxY = 90;
    const x = (Math.random() * 2 - 1) * maxX;
    const y = (Math.random() * 2 - 1) * maxY;
    noBtn.style.transform = `translate(${x}px, ${y}px) scale(${noScale})`;
    noScale = Math.max(0.78, noScale - 0.05);
});

yesBtn.addEventListener("click", () => {
    reveal.hidden = false;
    burstHearts(120);
});

confettiBtn.addEventListener("click", () => burstHearts(160));

copyBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const text =
        `Настюша, ты — мой любимый человек.
С 14 февраля 💖
(Обнимашки обязательны!)`;

    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Скопировано ✅";
        setTimeout(() => copyBtn.textContent = "Скопировать послание", 1400);
    } catch {
        copyBtn.textContent = "Не получилось 😅";
        setTimeout(() => copyBtn.textContent = "Скопировать послание", 1400);
    }
});

// --- FX: flying hearts ---
const particles = [];

function rand(a, b) { return a + Math.random() * (b - a); }

function addHeart(x, y) {
    particles.push({
        x: x * devicePixelRatio,
        y: y * devicePixelRatio,
        vx: rand(-1.2, 1.2) * devicePixelRatio,
        vy: rand(-3.6, -1.8) * devicePixelRatio,
        r: rand(8, 16) * devicePixelRatio,
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.08, 0.08),
        life: rand(60, 110),
        maxLife: 0
    });
}

function burstHearts(n = 80) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < n; i++) {
        addHeart(cx + rand(-40, 40), cy + rand(-20, 20));
    }
}

function drawHeart(px, py, s, rot) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    ctx.beginPath();

    const k = s;
    ctx.moveTo(0, k * 0.35);
    ctx.bezierCurveTo(0, 0, -k, 0, -k, k * 0.45);
    ctx.bezierCurveTo(-k, k, 0, k * 1.15, 0, k * 1.35);
    ctx.bezierCurveTo(0, k * 1.15, k, k, k, k * 0.45);
    ctx.bezierCurveTo(k, 0, 0, 0, 0, k * 0.35);

    const g = ctx.createLinearGradient(-k, 0, k, k);
    g.addColorStop(0, "#ff4d8d");
    g.addColorStop(1, "#ff79b0");
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.restore();
}

function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.maxLife = Math.max(p.maxLife, p.life);

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03 * devicePixelRatio;
        p.vx *= 0.995;
        p.rot += p.vr;
        p.life -= 1;

        const alpha = Math.max(0, p.life / (p.maxLife || 100));
        ctx.globalAlpha = alpha;

        drawHeart(p.x, p.y, p.r, p.rot);

        if (p.life <= 0 || p.y > canvas.height + 100) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(tick);
}
tick();

setTimeout(() => burstHearts(40), 600);
