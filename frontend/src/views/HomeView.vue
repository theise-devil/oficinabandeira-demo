<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { usuario } from '../composables/useAuth.js'
import fotoOficina from '../assets/entrada_oficina1529x1029.png'

// ── MODAL DE AGENDAMENTO ───────────────────────────────────────────────────────
const modalEl          = ref(null)
const servicoSelecionado = ref('')
const whatsappLink     = ref('')

// ── MODAL DA OFICINA ──────────────────────────────────────────────────────────
const modalOficinaEl = ref(null)
const MAPS_LINK      = 'https://www.google.com/maps/place/Oficina+Bandeira/@-22.4291123,-42.9672893,3a,75y,146.92h,87.37t/data=!3m8!1e1!3m6!1sWRoKKWpLU_75PHnV2ldiPQ!2e0!5s20240701T000000!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D2.6326691261956796%26panoid%3DWRoKKWpLU_75PHnV2ldiPQ%26yaw%3D146.91941131668577!7i16384!8i8192!4m6!3m5!1s0x99b3db6460541d:0x3484da03e13176c8!8m2!3d-22.4292177!4d-42.9672967!16s%2Fg%2F11hh5lys3n?entry=ttu&g_ep=EgoyMDI2MDQwNS4wIKXMDSoASAFQAw%3D%3D'

function abrirModalOficina () {
  Modal.getOrCreateInstance(modalOficinaEl.value).show()
}

function agendarServico (servico) {
  servicoSelecionado.value = servico
  const msg = encodeURIComponent(`Olá! Gostaria de agendar: ${servico}`)
  whatsappLink.value = `https://wa.me/5521999999999?text=${msg}`
  Modal.getOrCreateInstance(modalEl.value).show()
}

// ── CARROS À VENDA ────────────────────────────────────────────────────────────
const anuncios = ref([])

const carrosFallback = [
  { id: 1, nome: 'Honda Civic EXL',     preco: 125000, linkFoto: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600', kilometragem: '45.000 km', ano: '2020/2021' },
  { id: 2, nome: 'Volkswagen Gol 1.6',  preco: 48000,  linkFoto: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600', kilometragem: '62.000 km', ano: '2018/2019' },
  { id: 3, nome: 'Chevrolet Onix Plus', preco: 72000,  linkFoto: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600', kilometragem: '28.000 km', ano: '2022/2022' }
]

onMounted(async () => {
  // Carrega anúncios do backend
  try {
    const res = await fetch('/api/anuncios')
    if (res.ok) {
      const data = await res.json()
      if (data.length) anuncios.value = data
    }
  } catch (_) { /* usa fallback */ }

  // ── DROPDOWNS DESKTOP (hover) ─────────────────────────────────────────────
  document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
    const simpleDD = item.querySelector('.simple-dropdown')
    const megaDD   = item.querySelector('.mega-dropdown')
    const dd = simpleDD || megaDD
    if (!dd) return

    let timer
    const show = () => {
      if (window.innerWidth < 992) return
      clearTimeout(timer)
      item.classList.add('open')
      dd.style.display = megaDD ? 'flex' : 'block'
      requestAnimationFrame(() => dd.classList.add('show'))
    }
    const hide = () => {
      timer = setTimeout(() => {
        item.classList.remove('open')
        dd.classList.remove('show')
        setTimeout(() => { if (!dd.classList.contains('show')) dd.style.display = 'none' }, 260)
      }, 120)
    }

    item.addEventListener('mouseenter', show)
    item.addEventListener('mouseleave', hide)
    dd.addEventListener('mouseenter', () => clearTimeout(timer))
    dd.addEventListener('mouseleave', hide)
    dd.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      item.classList.remove('open')
      dd.classList.remove('show')
      dd.style.display = 'none'
    }))
  })

  // ── DROPDOWNS MOBILE (click) ──────────────────────────────────────────────
  document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
    const trigger  = item.querySelector('.nav-link')
    const mobileDD = item.querySelector('.mobile-dropdown, .mobile-servicos')
    if (!mobileDD) return

    trigger.addEventListener('click', e => {
      if (window.innerWidth >= 992) return
      e.preventDefault()
      document.querySelectorAll('.mobile-dropdown.open, .mobile-servicos.open').forEach(el => {
        if (el !== mobileDD) el.classList.remove('open')
      })
      mobileDD.classList.toggle('open')
      item.classList.toggle('open', mobileDD.classList.contains('open'))
    })
  })
})
</script>

<template>
<!-- NAVBAR -->
<nav class="navbar navbar-expand-lg fixed-top">
  <div class="container position-relative">
    <a class="navbar-brand fw-bold" href="#home">
      <i class="bi bi-tools me-2 text-danger"></i><span>OFICINA</span> BANDEIRA
    </a>
    <button class="navbar-toggler border-0" type="button"
            data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <i class="bi bi-list text-white fs-4"></i>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto align-items-lg-center">

        <!-- INÍCIO -->
        <li class="nav-item has-dropdown">
          <a class="nav-link d-flex align-items-center gap-1" href="#home">
            Início <i class="bi bi-chevron-down dd-arrow" style="font-size:.7rem"></i>
          </a>
          <div class="simple-dropdown">
            <a href="#home"><i class="bi bi-house"></i>Página Inicial</a>
            <a href="#home"><i class="bi bi-star"></i>Destaques</a>
          </div>
          <div class="mobile-dropdown">
            <a href="#home">Página Inicial</a>
            <a href="#home">Destaques</a>
          </div>
        </li>

        <!-- SOBRE -->
        <li class="nav-item has-dropdown">
          <a class="nav-link d-flex align-items-center gap-1" href="#sobre">
            Sobre <i class="bi bi-chevron-down dd-arrow" style="font-size:.7rem"></i>
          </a>
          <div class="simple-dropdown">
            <a href="#sobre"><i class="bi bi-clock-history"></i>Nossa História</a>
            <a href="#sobre"><i class="bi bi-people"></i>Nossa Equipe</a>
          </div>
          <div class="mobile-dropdown">
            <a href="#sobre">Nossa História</a>
            <a href="#sobre">Nossa Equipe</a>
          </div>
        </li>

        <!-- SERVIÇOS (mega menu) -->
        <li class="nav-item has-dropdown mega">
          <a class="nav-link d-flex align-items-center gap-1" href="#servicos">
            Serviços <i class="bi bi-chevron-down dd-arrow" style="font-size:.7rem"></i>
          </a>
          <div class="mega-dropdown">
            <div class="mega-col">
              <div class="mega-col-title">🔧 Inspeção e Checagem</div>
              <a href="#servicos" @click="agendarServico('Serviços Gerais')"><i class="bi bi-wrench-adjustable"></i>Serviços Gerais</a>
              <a href="#servicos" @click="agendarServico('Checklist Veicular')"><i class="bi bi-clipboard-check"></i>Checklist</a>
              <a href="#servicos" @click="agendarServico('Revisão Preventiva')"><i class="bi bi-shield-check"></i>Revisão Preventiva</a>
            </div>
            <div class="mega-col">
              <div class="mega-col-title">🛠️ Motor</div>
              <a href="#servicos" @click="agendarServico('Testes e Diagnósticos')"><i class="bi bi-cpu"></i>Testes e Diagnósticos</a>
              <a href="#servicos" @click="agendarServico('Troca de Óleo e Filtro')"><i class="bi bi-droplet-half"></i>Troca de Óleo e Filtro</a>
            </div>
            <div class="mega-col">
              <div class="mega-col-title">🚗 Sistema de Freio</div>
              <a href="#servicos" @click="agendarServico('Manutenção de Freios')"><i class="bi bi-disc"></i>Manutenção de Freios</a>
              <a href="#servicos" @click="agendarServico('Sistemas de Segurança')"><i class="bi bi-shield-fill-check"></i>Segurança</a>
            </div>
            <div class="mega-col">
              <div class="mega-col-title">⚙️ Outros</div>
              <a href="#servicos" @click="agendarServico('Iluminação')"><i class="bi bi-lightbulb"></i>Iluminação</a>
              <a href="#servicos" @click="agendarServico('Suspensão')"><i class="bi bi-arrow-down-up"></i>Suspensão</a>
              <a href="#servicos" @click="agendarServico('Diagnóstico Mecânico')"><i class="bi bi-search"></i>Diagnóstico Mecânico</a>
            </div>
          </div>
          <div class="mobile-servicos">
            <div class="mobile-cat-title">🔧 Inspeção e Checagem</div>
            <a href="#servicos">Serviços Gerais</a>
            <a href="#servicos">Checklist</a>
            <a href="#servicos">Revisão Preventiva</a>
            <div class="mobile-cat-title">🛠️ Motor</div>
            <a href="#servicos">Testes e Diagnósticos</a>
            <a href="#servicos">Troca de Óleo e Filtro</a>
            <div class="mobile-cat-title">🚗 Sistema de Freio</div>
            <a href="#servicos">Manutenção de Freios</a>
            <a href="#servicos">Segurança</a>
            <div class="mobile-cat-title">⚙️ Outros</div>
            <a href="#servicos">Iluminação</a>
            <a href="#servicos">Suspensão</a>
            <a href="#servicos">Diagnóstico Mecânico</a>
          </div>
        </li>

        <!-- PROMOÇÕES -->
        <li class="nav-item has-dropdown">
          <a class="nav-link d-flex align-items-center gap-1" href="#promocoes">
            Promoções <i class="bi bi-chevron-down dd-arrow" style="font-size:.7rem"></i>
          </a>
          <div class="simple-dropdown">
            <a href="#promocoes"><i class="bi bi-tag"></i>Ofertas do Mês</a>
            <a href="#promocoes"><i class="bi bi-percent"></i>Pacotes Especiais</a>
          </div>
          <div class="mobile-dropdown">
            <a href="#promocoes">Ofertas do Mês</a>
            <a href="#promocoes">Pacotes Especiais</a>
          </div>
        </li>

        <!-- CARROS À VENDA -->
        <li class="nav-item has-dropdown">
          <a class="nav-link d-flex align-items-center gap-1" href="#carros">
            Carros à Venda <i class="bi bi-chevron-down dd-arrow" style="font-size:.7rem"></i>
          </a>
          <div class="simple-dropdown">
            <a href="#carros"><i class="bi bi-car-front"></i>Ver Estoque</a>
            <a href="#carros"><i class="bi bi-whatsapp"></i>Anunciar Meu Carro</a>
          </div>
          <div class="mobile-dropdown">
            <a href="#carros">Ver Estoque</a>
            <a href="#carros">Anunciar Meu Carro</a>
          </div>
        </li>

        <!-- CONTATO -->
        <li class="nav-item has-dropdown">
          <a class="nav-link d-flex align-items-center gap-1" href="#contato">
            Contato <i class="bi bi-chevron-down dd-arrow" style="font-size:.7rem"></i>
          </a>
          <div class="simple-dropdown">
            <a href="#contato"><i class="bi bi-whatsapp"></i>WhatsApp</a>
            <a href="#contato"><i class="bi bi-instagram"></i>Instagram</a>
            <a href="#contato"><i class="bi bi-geo-alt"></i>Localização</a>
          </div>
          <div class="mobile-dropdown">
            <a href="#contato">WhatsApp</a>
            <a href="#contato">Instagram</a>
            <a href="#contato">Localização</a>
          </div>
        </li>

        <!-- AUTH -->
        <li class="nav-item ms-lg-2">
          <router-link
            :to="usuario ? '/dashboard' : '/login'"
            class="btn btn-outline-danger btn-sm px-3">
            <i :class="usuario ? 'bi bi-person-check me-1' : 'bi bi-person me-1'"></i>
            {{ usuario ? usuario.nome.split(' ')[0] : 'Entrar' }}
          </router-link>
        </li>

      </ul>
    </div>
  </div>
</nav>

<!-- HERO -->
<section id="home" class="hero-section">
  <div class="container">
    <div class="row align-items-center min-vh-100">
      <div class="col-lg-8 mx-auto text-center hero-content">
        <h1 class="display-3 fw-bold mb-4 animate-fade-in">Tradição, Confiança e Paixão por Carros</h1>
        <p class="lead mb-5 animate-fade-in-delay">Há mais de 30 anos cuidando do seu veículo com responsabilidade e excelência em Teresópolis/RJ</p>
        <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-danger btn-lg px-5 py-3 animate-fade-in-delay-2">
          <i class="bi bi-whatsapp me-2"></i>Fale Conosco no WhatsApp
        </a>
      </div>
    </div>
  </div>
  <!-- Botão flutuante no rodapé do hero -->
  <button class="hero-map-btn" @click="abrirModalOficina">
    <i class="bi bi-geo-alt-fill me-2"></i>Ver a Oficina
  </button>
</section>

<!-- MODAL DA OFICINA -->
<div class="modal fade" ref="modalOficinaEl" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-oficina">
    <div class="modal-content oficina-modal-content">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title fw-bold text-white">
          <i class="bi bi-geo-alt-fill text-danger me-2"></i>Nossa Oficina
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-0">
        <img :src="fotoOficina" alt="Entrada da Oficina Bandeira"
             class="oficina-foto">
      </div>
      <div class="modal-footer flex-column gap-2 border-0 pt-3">
        <a :href="MAPS_LINK" target="_blank"
           class="btn btn-danger w-100 fw-bold">
          <i class="bi bi-map me-2"></i>Abrir no Google Maps
        </a>
        <a :href="MAPS_LINK" target="_blank"
           class="btn btn-outline-light w-100">
          <i class="bi bi-navigation me-2"></i>Como chegar
        </a>
      </div>
    </div>
  </div>
</div>

<!-- SOBRE -->
<section id="sobre" class="py-5 bg-alt">
  <div class="container py-5">
    <div class="row align-items-center">
      <div class="col-lg-6 mb-4 mb-lg-0">
        <h2 class="display-5 fw-bold mb-4">Nossa História</h2>
        <p class="lead mb-4" style="color:#94a3b8">Uma tradição familiar que atravessa gerações</p>
        <p class="mb-3">A Oficina Bandeira nasceu da paixão por carros e do compromisso com a excelência. Há mais de 30 anos, nossa história começou com um sonho: oferecer serviços mecânicos de qualidade com responsabilidade total pelo veículo de cada cliente.</p>
        <p class="mb-3">Somos uma empresa familiar, onde o conhecimento e os valores são passados de pai para filho. Essa tradição nos permite unir experiência consolidada com técnicas modernas, atendendo tanto carros nacionais quanto importados.</p>
        <p class="mb-4">Aqui, cada veículo é tratado com o mesmo cuidado que daríamos ao nosso próprio carro. Confiança não se compra, se conquista — e é isso que fazemos todos os dias.</p>
        <div class="d-flex gap-4">
          <div class="text-center">
            <h3 class="display-4 fw-bold text-danger">30+</h3>
            <p style="color:#64748b">Anos de Experiência</p>
          </div>
          <div class="text-center">
            <h3 class="display-4 fw-bold text-danger">100%</h3>
            <p style="color:#64748b">Responsabilidade</p>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800"
             alt="Oficina Mecânica" class="img-fluid rounded shadow">
      </div>
    </div>
  </div>
</section>

<!-- BANNER -->
<section class="py-5 banner-red text-white">
  <div class="container py-4">
    <div class="col-lg-8 mx-auto text-center">
      <i class="bi bi-shield-check display-1 mb-3"></i>
      <h2 class="display-6 fw-bold mb-3">Responsabilidade Total pelo Seu Veículo</h2>
      <p class="lead">Assumimos o compromisso integral com a segurança e qualidade dos serviços realizados. Seu carro está em mãos confiáveis.</p>
    </div>
  </div>
</section>

<!-- SERVIÇOS -->
<section id="servicos" class="py-5">
  <div class="container py-5">
    <div class="text-center mb-5">
      <h2 class="display-5 fw-bold mb-3">Nossos Serviços</h2>
      <p class="lead" style="color:#64748b">Clique em qualquer serviço para agendar sua revisão</p>
    </div>

    <!-- Inspeção -->
    <div class="mb-5">
      <div class="d-flex align-items-center mb-4">
        <span class="fs-3 me-2">🔧</span>
        <h4 class="fw-bold mb-0 categoria-titulo">Inspeção e Checagem</h4>
      </div>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Serviços Gerais')">
            <div class="card-body text-center p-4">
              <i class="bi bi-wrench-adjustable service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Serviços Gerais</h5>
              <p class="card-text small">Manutenção preventiva e corretiva completa para seu veículo.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Checklist Veicular')">
            <div class="card-body text-center p-4">
              <i class="bi bi-clipboard-check service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Checklist</h5>
              <p class="card-text small">Verificação completa de todos os itens de segurança e funcionamento.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Revisão de Férias')">
            <div class="card-body text-center p-4">
              <i class="bi bi-sun service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Revisão de Férias</h5>
              <p class="card-text small">Prepare seu carro para viagens longas com segurança total.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Motor -->
    <div class="mb-5">
      <div class="d-flex align-items-center mb-4">
        <span class="fs-3 me-2">🛠️</span>
        <h4 class="fw-bold mb-0 categoria-titulo">Motor</h4>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="service-card card h-100" @click="agendarServico('Testes e Diagnósticos')">
            <div class="card-body text-center p-4">
              <i class="bi bi-cpu service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Testes e Diagnósticos</h5>
              <p class="card-text small">Diagnóstico computadorizado para identificar falhas com precisão.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="service-card card h-100" @click="agendarServico('Troca de Óleo e Filtro')">
            <div class="card-body text-center p-4">
              <i class="bi bi-droplet-half service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Troca de Óleo e Filtro</h5>
              <p class="card-text small">Troca de óleo e filtros com produtos de qualidade para maior durabilidade.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Freios -->
    <div class="mb-5">
      <div class="d-flex align-items-center mb-4">
        <span class="fs-3 me-2">🚗</span>
        <h4 class="fw-bold mb-0 categoria-titulo">Sistema de Freio</h4>
      </div>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Tradição em Freios')">
            <div class="card-body text-center p-4">
              <i class="bi bi-award service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Tradição em Freios</h5>
              <p class="card-text small">Mais de 30 anos de experiência em sistemas de frenagem.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Manutenção dos Freios')">
            <div class="card-body text-center p-4">
              <i class="bi bi-disc service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Manutenção dos Freios</h5>
              <p class="card-text small">Troca de pastilhas, discos e fluido de freio com garantia.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Sistemas de Segurança')">
            <div class="card-body text-center p-4">
              <i class="bi bi-shield-check service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Sistemas de Segurança</h5>
              <p class="card-text small">Verificação e manutenção de ABS e demais sistemas de segurança.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Iluminação -->
    <div class="mb-2">
      <div class="d-flex align-items-center mb-4">
        <span class="fs-3 me-2">💡</span>
        <h4 class="fw-bold mb-0 categoria-titulo">Iluminação</h4>
      </div>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Revisão de Iluminação')">
            <div class="card-body text-center p-4">
              <i class="bi bi-lightbulb service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Revisão de Iluminação</h5>
              <p class="card-text small">Verificação e troca de faróis, lanternas e lâmpadas internas.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Regulagem de Faróis')">
            <div class="card-body text-center p-4">
              <i class="bi bi-brightness-high service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Regulagem de Faróis</h5>
              <p class="card-text small">Alinhamento e regulagem dos faróis para máxima visibilidade.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="service-card card h-100" @click="agendarServico('Sistema Elétrico')">
            <div class="card-body text-center p-4">
              <i class="bi bi-lightning-charge service-icon text-danger mb-3"></i>
              <h5 class="card-title fw-bold mb-2">Sistema Elétrico</h5>
              <p class="card-text small">Diagnóstico e reparo de falhas elétricas e eletrônicas do veículo.</p>
              <span class="btn btn-outline-danger btn-sm mt-2"><i class="bi bi-calendar-check me-1"></i>Agendar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- MODAL AGENDAMENTO -->
<div class="modal fade" ref="modalEl" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header bg-danger text-white border-0">
        <h5 class="modal-title fw-bold"><i class="bi bi-calendar-check me-2"></i>Agendar Revisão</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-4 text-center">
        <p class="mb-1" style="color:#94a3b8">Serviço selecionado:</p>
        <h5 class="fw-bold text-danger mb-3">{{ servicoSelecionado }}</h5>
        <p class="mb-4" style="color:#94a3b8">Clique abaixo para falar com a gente no WhatsApp e confirmar seu agendamento. É rápido e fácil! 😊</p>
        <a :href="whatsappLink" target="_blank" class="btn btn-success btn-lg w-100">
          <i class="bi bi-whatsapp me-2"></i>Agendar pelo WhatsApp
        </a>
      </div>
    </div>
  </div>
</div>

<!-- PROMOÇÕES -->
<section id="promocoes" class="py-5 bg-alt">
  <div class="container py-5">
    <div class="text-center mb-5">
      <h2 class="display-5 fw-bold mb-3">Promoções Especiais</h2>
      <p class="lead" style="color:#64748b">Aproveite nossas ofertas exclusivas</p>
    </div>
    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="card promo-card h-100">
          <div class="promo-badge">OFERTA</div>
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-3">Revisão Completa</h5>
            <p class="card-text mb-3">Revisão geral com troca de óleo, filtros e verificação de 20 itens.</p>
            <div class="d-flex align-items-center mb-3">
              <span class="text-decoration-line-through me-2" style="color:#475569">R$ 450,00</span>
              <span class="h4 text-danger fw-bold mb-0">R$ 349,00</span>
            </div>
            <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-outline-danger w-100">
              <i class="bi bi-whatsapp me-2"></i>Agendar Agora
            </a>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card promo-card h-100">
          <div class="promo-badge">OFERTA</div>
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-3">Troca de Pastilhas</h5>
            <p class="card-text mb-3">Troca de pastilhas de freio dianteiras com mão de obra inclusa.</p>
            <div class="d-flex align-items-center mb-3">
              <span class="text-decoration-line-through me-2" style="color:#475569">R$ 280,00</span>
              <span class="h4 text-danger fw-bold mb-0">R$ 220,00</span>
            </div>
            <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-outline-danger w-100">
              <i class="bi bi-whatsapp me-2"></i>Agendar Agora
            </a>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card promo-card h-100">
          <div class="promo-badge">OFERTA</div>
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-3">Diagnóstico Gratuito</h5>
            <p class="card-text mb-3">Diagnóstico computadorizado sem custo na realização do serviço.</p>
            <div class="d-flex align-items-center mb-3">
              <span class="text-decoration-line-through me-2" style="color:#475569">R$ 80,00</span>
              <span class="h4 text-danger fw-bold mb-0">GRÁTIS</span>
            </div>
            <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-outline-danger w-100">
              <i class="bi bi-whatsapp me-2"></i>Consultar
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CARROS À VENDA -->
<section id="carros" class="py-5">
  <div class="container py-5">
    <div class="text-center mb-5">
      <h2 class="display-5 fw-bold mb-3">Carros à Venda</h2>
      <p class="lead" style="color:#64748b">Veículos de clientes anunciados com confiança</p>
    </div>
    <div class="row g-4">
      <!-- Anúncios da API -->
      <template v-if="anuncios.length">
        <div v-for="c in anuncios" :key="c.id" class="col-md-6 col-lg-4">
          <div class="card car-card border-0 shadow h-100">
            <img
              :src="c.fotos[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'"
              class="card-img-top" :alt="c.modelo" style="height:200px;object-fit:cover">
            <div class="card-body p-4">
              <h5 class="card-title fw-bold">{{ c.marca }} {{ c.modelo }}</h5>
              <p class="text-muted mb-1"><i class="bi bi-calendar3 me-2"></i>{{ c.ano }}</p>
              <p class="text-muted mb-3"><i class="bi bi-speedometer2 me-2"></i>{{ c.quilometragem }}</p>
              <h4 class="text-danger fw-bold mb-3">R$ {{ Number(c.preco).toLocaleString('pt-BR') }}</h4>
              <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-danger w-100">
                <i class="bi bi-whatsapp me-2"></i>Entrar em Contato
              </a>
            </div>
          </div>
        </div>
      </template>
      <!-- Fallback local -->
      <template v-else>
        <div v-for="c in carrosFallback" :key="c.id" class="col-md-6 col-lg-4">
          <div class="card car-card border-0 shadow h-100">
            <img :src="c.linkFoto" class="card-img-top" :alt="c.nome" style="height:200px;object-fit:cover">
            <div class="card-body p-4">
              <h5 class="card-title fw-bold">{{ c.nome }}</h5>
              <p class="text-muted mb-1"><i class="bi bi-calendar3 me-2"></i>{{ c.ano }}</p>
              <p class="text-muted mb-3"><i class="bi bi-speedometer2 me-2"></i>{{ c.kilometragem }}</p>
              <h4 class="text-danger fw-bold mb-3">R$ {{ c.preco.toLocaleString('pt-BR') }}</h4>
              <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-danger w-100">
                <i class="bi bi-whatsapp me-2"></i>Entrar em Contato
              </a>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</section>

<!-- CONTATO -->
<section id="contato" class="py-5" style="background:#0a0f1e">
  <div class="container py-5">
    <div class="text-center mb-5">
      <h2 class="display-5 fw-bold mb-3">Entre em Contato</h2>
      <p class="lead" style="color:#64748b">Estamos prontos para atender você</p>
    </div>
    <div class="row g-4">
      <div class="col-md-4">
        <div class="contact-card text-center p-4">
          <i class="bi bi-whatsapp display-4 text-success mb-3"></i>
          <h5 class="fw-bold mb-3">WhatsApp</h5>
          <p style="color:#64748b" class="mb-3">Fale conosco agora mesmo</p>
          <a href="https://wa.me/5521999999999" target="_blank" class="btn btn-success">
            <i class="bi bi-whatsapp me-2"></i>Enviar Mensagem
          </a>
        </div>
      </div>
      <div class="col-md-4">
        <div class="contact-card text-center p-4">
          <i class="bi bi-instagram display-4 text-danger mb-3"></i>
          <h5 class="fw-bold mb-3">Instagram</h5>
          <p style="color:#64748b" class="mb-3">Siga nossas novidades</p>
          <a href="https://instagram.com/oficinabandeira" target="_blank" class="btn btn-danger">
            <i class="bi bi-instagram me-2"></i>Seguir Agora
          </a>
        </div>
      </div>
      <div class="col-md-4">
        <div class="contact-card text-center p-4">
          <i class="bi bi-geo-alt display-4 text-warning mb-3"></i>
          <h5 class="fw-bold mb-3">Localização</h5>
          <p style="color:#64748b" class="mb-3">Teresópolis - RJ<br>Região Serrana</p>
          <button class="btn btn-warning" @click="abrirModalOficina">
            <i class="bi bi-map me-2"></i>Ver no Mapa
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="py-4" style="background:#060a14;border-top:1px solid rgba(255,255,255,0.06)">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
        <p class="mb-0" style="color:#475569">&copy; 2024 Oficina Bandeira. Todos os direitos reservados.</p>
      </div>
      <div class="col-md-6 text-center text-md-end">
        <a href="https://wa.me/5521999999999" target="_blank" class="text-white me-3 fs-4"><i class="bi bi-whatsapp"></i></a>
        <a href="https://instagram.com/oficinabandeira" target="_blank" class="text-white fs-4"><i class="bi bi-instagram"></i></a>
      </div>
    </div>
  </div>
</footer>
</template>

<style scoped>
/* ── BOTÃO FLUTUANTE NO HERO ─────────────────────────────────────────────── */
.hero-map-btn {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  font-weight: 600;
  font-size: .95rem;
  padding: 10px 28px;
  border-radius: 50px;
  cursor: pointer;
  transition: background .25s, transform .25s;
  white-space: nowrap;
}
.hero-map-btn:hover {
  background: rgba(220, 53, 69, 0.75);
  transform: translateX(-50%) translateY(-3px);
}

/* ── MODAL DA OFICINA ────────────────────────────────────────────────────── */
.modal-oficina {
  max-width: 680px;
  width: 95vw;
}
.oficina-modal-content {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  overflow: hidden;
}
.oficina-foto {
  width: 100%;
  max-height: 65vh;
  object-fit: cover;
  display: block;
}

@media (max-width: 576px) {
  .hero-map-btn { font-size: .82rem; padding: 9px 20px; bottom: 20px; }
  .oficina-foto { max-height: 50vh; }
}
</style>
