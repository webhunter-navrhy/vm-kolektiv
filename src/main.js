(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hdr = $('.hdr');

  // hlavička při scrollu
  let ticking = false;
  const onScroll = () => {
    hdr.classList.toggle('is-scrolled', scrollY > 40);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // mobilní menu
  const burger = $('.hdr__burger');
  const setMenu = open => {
    hdr.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    $('.mnav').setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!hdr.classList.contains('menu-open')));
  $$('.mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // odhalování sekcí
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.rv').forEach(el => io.observe(el));

  // počítadla
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.to, t0 = performance.now(), dur = 1400;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    cio.unobserve(el);
  }), { threshold: .5 });
  $$('.cnt').forEach(el => cio.observe(el));

  // magnetická tlačítka (jen myš)
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.mag').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  // kalkulačka podle ceníku
  const fmt = n => n.toLocaleString('cs-CZ').replace(/\s/g, ' ');
  const seg = $$('.seg button');
  const r = { dok: $('#r-dok'), bank: $('#r-bank'), zam: $('#r-zam') };
  const calc = () => {
    const on = $('.seg button.on');
    const d = +r.dok.value, b = +r.bank.value, z = +r.zam.value;
    $('#o-dok').textContent = d; $('#o-bank').textContent = b; $('#o-zam').textContent = z;
    const fix = b * 10 + z * 300;
    const lo = d * +on.dataset.min + fix, hi = d * +on.dataset.max + fix;
    $('#calc-cena').textContent = lo === hi ? `${fmt(lo)} Kč` : `${fmt(lo)} – ${fmt(hi)} Kč`;
  };
  seg.forEach(btn => btn.addEventListener('click', () => {
    seg.forEach(x => { x.classList.toggle('on', x === btn); x.setAttribute('aria-checked', x === btn); });
    calc();
  }));
  Object.values(r).forEach(i => i.addEventListener('input', calc));
  calc();

  // předvyplnění poptávky
  const form = $('#poptavka');
  const check = val => $$('input[name="zajem"]', form).forEach(c => { if (c.value === val) c.checked = true; });
  const mapa = { 'Vedení účetnictví': 'Vedení účetnictví', 'Daňová evidence': 'Vedení daňové evidence', 'DPH a výkazy': 'Zpracování DPH',
    'Mzdy a personalistika': 'Mzdy', 'Online účetnictví': 'Ostatní', 'Daňová optimalizace': 'Poradenství' };
  $$('[data-sluzba]').forEach(a => a.addEventListener('click', () => check(mapa[a.dataset.sluzba] || 'Ostatní')));
  $('#calc-go').addEventListener('click', () => {
    const on = $('.seg button.on');
    check(on.dataset.typ);
    if (+r.zam.value > 0) check('Mzdy');
    form.doklady.value = r.dok.value;
    form.vypis.value = r.bank.value;
    form.zamestnanci.value = r.zam.value;
  });

  // odeslání (návrh – bez backendu)
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('err', bad);
      if (bad) ok = false;
    });
    if (!ok) { $('.err', form)?.focus(); return; }
    $('.form__ok', form).hidden = false;
    $('button[type="submit"]', form).disabled = true;
  });
})();
