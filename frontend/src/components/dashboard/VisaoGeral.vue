<script setup>
import { ref, onMounted } from 'vue'
import { apiCall } from '../../composables/useApi.js'

const emit = defineEmits(['ir-para'])

const statVeiculos = ref('—')
const statAnuncios = ref('—')
const perfil       = ref(null)

onMounted(async () => {
  const [rv, ra, rp] = await Promise.all([
    apiCall('/veiculos'),
    apiCall('/anuncios/meus'),
    apiCall('/auth/perfil')
  ])
  if (rv) { const v = await rv.json(); statVeiculos.value = v.length }
  if (ra) { const a = await ra.json(); statAnuncios.value = a.filter(x => x.ativo).length }
  if (rp) { perfil.value = await rp.json() }
})
</script>

<template>
<div>
  <h4 class="fw-bold mb-1">Visão Geral</h4>
  <p style="color:#64748b" class="mb-4 small">Bem-vindo à sua área</p>

  <div class="row g-3 mb-4">
    <div class="col-6 col-md-3">
      <div class="stat-card">
        <div class="num">{{ statVeiculos }}</div>
        <div class="lbl">Veículos</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="stat-card">
        <div class="num">{{ statAnuncios }}</div>
        <div class="lbl">Anúncios Ativos</div>
      </div>
    </div>
  </div>

  <div class="dash-card">
    <div class="card-header"><i class="bi bi-person me-2 text-danger"></i>Meus Dados</div>
    <div class="p-4">
      <template v-if="perfil">
        <p class="mb-1"><span style="color:#64748b">Nome:</span> <span class="ms-2">{{ perfil.nome }}</span></p>
        <p class="mb-1"><span style="color:#64748b">E-mail:</span> <span class="ms-2">{{ perfil.email }}</span></p>
        <p class="mb-0"><span style="color:#64748b">Membro desde:</span>
          <span class="ms-2">{{ new Date(perfil.criado_em).toLocaleDateString('pt-BR') }}</span>
        </p>
      </template>
      <p v-else style="color:#475569">Carregando...</p>
    </div>
  </div>
</div>
</template>

<style scoped>
.dash-card {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
}
.dash-card .card-header {
  background: transparent;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 16px 20px;
  font-weight: 600; color: #f1f5f9;
}
.stat-card {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.stat-card .num { font-size: 2rem; font-weight: 700; color: #dc3545; }
.stat-card .lbl { color: #64748b; font-size: .85rem; }
</style>
