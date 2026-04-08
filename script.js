const carros = [
  { id: 1, nome: "Honda Civic EXL",      preco: 125000, linkFoto: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600", kilometragem: "45.000 km", ano: "2020/2021" },
  { id: 2, nome: "Volkswagen Gol 1.6",   preco: 48000,  linkFoto: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600", kilometragem: "62.000 km", ano: "2018/2019" },
  { id: 3, nome: "Chevrolet Onix Plus",  preco: 72000,  linkFoto: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600", kilometragem: "28.000 km", ano: "2022/2022" }
];

/* ── AGENDAMENTO ── */
function agendarServico(servico) {
  document.getElementById('modalServicoNome').textContent = servico;
  const msg = encodeURIComponent(`Olá! Gostaria de agendar: ${servico}`);
  document.getElementById('modalWhatsappLink').href = `https://wa.me/5521999999999?text=${msg}`;
  new bootstrap.Modal(document.getElementById('modalAgendamento')).show();
}

document.addEventListener('DOMContentLoaded', async () => {

  /* ── CARROS ── */
  // Carrega anúncios do backend; fallback para array local se offline
  const container = document.querySelector('#carros .row');
  try {
    const res = await fetch('http://localhost:3001/api/anuncios');
    if (res.ok) {
      const anuncios = await res.json();
      if (anuncios.length) {
        container.innerHTML = anuncios.map(c => `
          <div class="col-md-6 col-lg-4">
            <div class="card car-card border-0 shadow h-100">
              <img src="${c.foto ? 'http://localhost:3001' + c.foto : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'}" class="card-img-top" alt="${c.modelo}" style="height:200px;object-fit:cover">
              <div class="card-body p-4">
                <h5 class="card-title fw-bold">${c.marca} ${c.modelo}</h5>
                <p class="text-muted mb-1"><i class="bi bi-calendar3 me-2"></i>${c.ano}</p>
                <p class="text-muted mb-3"><i class="bi bi-speedometer2 me-2"></i>${c.quilometragem}</p>
                <h4 class="text-danger fw-bold mb-3">R$ ${Number(c.preco).toLocaleString('pt-BR')}</h4>
                <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-danger w-100">
                  <i class="bi bi-whatsapp me-2"></i>Entrar em Contato
                </a>
              </div>
            </div>
          </div>
        `).join('');
        return;
      }
    }
  } catch (_) {}

  // fallback local
  container.innerHTML = carros.map(c => `
    <div class="col-md-6 col-lg-4">
      <div class="card car-card border-0 shadow h-100">
        <img src="${c.linkFoto}" class="card-img-top" alt="${c.nome}" style="height:200px;object-fit:cover">
        <div class="card-body p-4">
          <h5 class="card-title fw-bold">${c.nome}</h5>
          <p class="text-muted mb-1"><i class="bi bi-calendar3 me-2"></i>${c.ano}</p>
          <p class="text-muted mb-3"><i class="bi bi-speedometer2 me-2"></i>${c.kilometragem}</p>
          <h4 class="text-danger fw-bold mb-3">R$ ${c.preco.toLocaleString('pt-BR')}</h4>
          <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-danger w-100">
            <i class="bi bi-whatsapp me-2"></i>Entrar em Contato
          </a>
        </div>
      </div>
    </div>
  `).join('');

  /* ── DROPDOWNS DESKTOP (hover genérico) ── */
  document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
    const simpleDD = item.querySelector('.simple-dropdown');
    const megaDD   = item.querySelector('.mega-dropdown');
    const dd = simpleDD || megaDD;
    if (!dd) return;

    let timer;
    const show = () => {
      if (window.innerWidth < 992) return;
      clearTimeout(timer);
      item.classList.add('open');
      dd.style.display = megaDD ? 'flex' : 'block';
      requestAnimationFrame(() => dd.classList.add('show'));
    };
    const hide = () => {
      timer = setTimeout(() => {
        item.classList.remove('open');
        dd.classList.remove('show');
        setTimeout(() => { if (!dd.classList.contains('show')) dd.style.display = 'none'; }, 260);
      }, 120);
    };

    item.addEventListener('mouseenter', show);
    item.addEventListener('mouseleave', hide);
    dd.addEventListener('mouseenter', () => clearTimeout(timer));
    dd.addEventListener('mouseleave', hide);
    dd.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      item.classList.remove('open');
      dd.classList.remove('show');
      dd.style.display = 'none';
    }));
  });

  /* ── DROPDOWNS MOBILE (click genérico) ── */
  document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
    const trigger   = item.querySelector('.nav-link');
    const mobileDD  = item.querySelector('.mobile-dropdown, .mobile-servicos');
    if (!mobileDD) return;

    trigger.addEventListener('click', e => {
      if (window.innerWidth >= 992) return;
      e.preventDefault();
      // fecha outros abertos
      document.querySelectorAll('.mobile-dropdown.open, .mobile-servicos.open').forEach(el => {
        if (el !== mobileDD) el.classList.remove('open');
      });
      mobileDD.classList.toggle('open');
      item.classList.toggle('open', mobileDD.classList.contains('open'));
    });
  });

  /* ── NAVBAR TOGGLER CUSTOM ── */
  document.getElementById('mobileToggle').addEventListener('click', () => {
    document.getElementById('navbarNav').classList.toggle('show');
  });

  /* ── BOTAO AUTH NA NAVBAR ── */
  const usuario = JSON.parse(localStorage.getItem('ob_usuario') || 'null');
  const token   = localStorage.getItem('ob_token');
  const authLink = document.getElementById('navAuthLink');
  const authText = document.getElementById('navAuthText');
  if (usuario && token) {
    authLink.href = 'dashboard.html';
    authLink.querySelector('i').className = 'bi bi-person-check me-1';
    authText.textContent = usuario.nome.split(' ')[0];
  }

});
