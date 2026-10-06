const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Hero: o mouse inclina a cena em 3D e move o texto gigante ao fundo */
const hero = document.querySelector('[data-hero]');
const stage = document.querySelector('[data-stage]');
const big = document.querySelector('.hero-bigtext');
if (hero && !reduce) {
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stage.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 16}deg)`;
    big.style.transform = `translate(calc(-50% + ${-x * 50}px), calc(-50% + ${-y * 30}px)) translateZ(-120px)`;
  });
  hero.addEventListener('mouseleave', () => {
    stage.style.transform = '';
    big.style.transform = '';
  });
}

/* Cards: inclinação 3D + brilho que segue o cursor */
document.querySelectorAll('[data-tilt]').forEach((card) => {
  if (reduce) return;
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.transform = `rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 14}deg) translateZ(10px)`;
    card.style.setProperty('--mx', x * 100 + '%');
    card.style.setProperty('--my', y * 100 + '%');
  });
  card.addEventListener('mouseleave', () => (card.style.transform = ''));
});

/* Entrada ao rolar + link ativo no menu */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => en.isIntersecting && en.target.classList.add('in'));
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

const links = document.querySelectorAll('.nav a');
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('header[id], section[id]').forEach((s) => spy.observe(s));

/* Partículas conectadas no fundo (efeito "rede") */
const cv = document.getElementById('bg');
const ctx = cv.getContext('2d');
let W, H, pts = [];
const mouse = { x: -999, y: -999 };
function resize() {
  W = cv.width = innerWidth;
  H = cv.height = innerHeight;
  pts = Array.from({ length: Math.min(70, Math.floor(W / 22)) }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
  }));
}
addEventListener('resize', resize);
addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
function draw() {
  ctx.clearRect(0, 0, W, H);
  pts.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.fillStyle = 'hsla(45,100%,72%,.6)';
    ctx.fillRect(p.x, p.y, 2, 2);
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 130) {
        ctx.strokeStyle = `hsla(45,100%,72%,${0.14 * (1 - d / 130)})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
    const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    if (dm < 160) {
      ctx.strokeStyle = `hsla(45,100%,72%,${0.35 * (1 - dm / 160)})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  });
  requestAnimationFrame(draw);
}
resize();
if (!reduce) draw();

/* Formulário: habilita o botão e abre o email já preenchido */
const form = document.querySelector('[data-form]');
const btn = document.querySelector('[data-btn]');
form.addEventListener('input', () => (btn.disabled = !form.checkValidity()));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const body = `${d.get('message')}\n\n${d.get('fullname')} (${d.get('email')})`;
  location.href = `mailto:emanuelledeabreucaetano@email.com?subject=${encodeURIComponent('Contato pelo portfólio')}&body=${encodeURIComponent(body)}`;
});
