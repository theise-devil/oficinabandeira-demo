<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usuario, clearAuth } from '../composables/useAuth.js'
import VisaoGeral  from '../components/dashboard/VisaoGeral.vue'
import MeusVeiculos from '../components/dashboard/MeusVeiculos.vue'
import MeusAnuncios from '../components/dashboard/MeusAnuncios.vue'
import NovoVeiculo  from '../components/dashboard/NovoVeiculo.vue'
import NovoAnuncio  from '../components/dashboard/NovoAnuncio.vue'

const router = useRouter()
const secao  = ref('visao-geral')

function logout () {
  clearAuth()
  router.push('/login')
}

function irPara (id) {
  secao.value = id
}
</script>

<template>
<div class="dash-layout">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-brand">
      <router-link to="/" class="text-decoration-none d-flex align-items-center gap-2">
        <i class="bi bi-tools text-danger fs-5"></i>
        <span class="fw-bold text-white" style="font-size:.9rem">OFICINA BANDEIRA</span>
      </router-link>
      <div class="mt-2 small" style="color:#475569">
        Olá, {{ usuario?.nome?.split(' ')[0] }}!
      </div>
    </div>

    <nav class="sidebar-nav">
      <a href="#" class="sidebar-link" :class="{ active: secao === 'visao-geral' }"
         @click.prevent="irPara('visao-geral')">
        <i class="bi bi-grid"></i> Visão Geral
      </a>
      <a href="#" class="sidebar-link" :class="{ active: secao === 'meus-veiculos' }"
         @click.prevent="irPara('meus-veiculos')">
        <i class="bi bi-car-front"></i> Meus Veículos
      </a>
      <a href="#" class="sidebar-link" :class="{ active: secao === 'meus-anuncios' }"
         @click.prevent="irPara('meus-anuncios')">
        <i class="bi bi-megaphone"></i> Meus Anúncios
      </a>
      <a href="#" class="sidebar-link" :class="{ active: secao === 'novo-veiculo' }"
         @click.prevent="irPara('novo-veiculo')">
        <i class="bi bi-plus-circle"></i> Cadastrar Veículo
      </a>
      <a href="#" class="sidebar-link" :class="{ active: secao === 'novo-anuncio' }"
         @click.prevent="irPara('novo-anuncio')">
        <i class="bi bi-tag"></i> Criar Anúncio
      </a>
    </nav>

    <div class="p-3 border-top" style="border-color:rgba(255,255,255,0.06)!important">
      <router-link to="/" class="sidebar-link"><i class="bi bi-house"></i> Site</router-link>
      <a href="#" class="sidebar-link text-danger" @click.prevent="logout">
        <i class="bi bi-box-arrow-left"></i> Sair
      </a>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="dash-main">
    <VisaoGeral   v-if="secao === 'visao-geral'"   @ir-para="irPara" />
    <MeusVeiculos v-if="secao === 'meus-veiculos'" />
    <MeusAnuncios v-if="secao === 'meus-anuncios'" />
    <NovoVeiculo  v-if="secao === 'novo-veiculo'"  @concluido="irPara('meus-veiculos')" />
    <NovoAnuncio  v-if="secao === 'novo-anuncio'"  @concluido="irPara('meus-anuncios')" />
  </main>

</div>
</template>

<style scoped>
.dash-layout {
  display: flex;
  min-height: 100vh;
  padding-top: 0;
}

/* SIDEBAR */
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #0a0f1e;
  border-right: 1px solid rgba(255,255,255,0.06);
  position: fixed;
  top: 0; left: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
}
.sidebar-brand {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sidebar-nav { padding: 16px 12px; flex: 1; }
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: .9rem;
  font-weight: 500;
  transition: all .2s;
  margin-bottom: 4px;
}
.sidebar-link:hover,
.sidebar-link.active {
  background: rgba(220,53,69,.12);
  color: #dc3545;
}
.sidebar-link i { font-size: 1.1rem; }

/* MAIN */
.dash-main {
  margin-left: 240px;
  padding: 32px;
  flex: 1;
}

/* MOBILE */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    min-height: auto;
    position: relative;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .sidebar-nav {
    display: flex;
    flex-wrap: wrap;
    padding: 8px;
  }
  .sidebar-link { padding: 8px 10px; font-size: .8rem; }
  .dash-main { margin-left: 0; padding: 16px; }
}
</style>
