<script setup>
import { ref, onMounted } from 'vue'
import { apiCall } from '../../composables/useApi.js'

const veiculos = ref([])
const loading  = ref(true)

async function carregar () {
  loading.value = true
  const res = await apiCall('/veiculos')
  if (res) veiculos.value = await res.json()
  loading.value = false
}

async function deletar (id) {
  if (!confirm('Remover este veículo?')) return
  await apiCall(`/veiculos/${id}`, { method: 'DELETE' })
  await carregar()
}

onMounted(carregar)
</script>

<template>
<div>
  <h4 class="fw-bold mb-1">Meus Veículos</h4>
  <p style="color:#64748b" class="mb-4 small">Veículos cadastrados na sua conta</p>

  <div v-if="loading" class="text-center py-5" style="color:#475569">
    <span class="spinner-border text-danger"></span>
  </div>

  <div v-else-if="!veiculos.length" class="text-center py-5" style="color:#475569">
    <i class="bi bi-car-front fs-1 d-block mb-2"></i>Nenhum veículo cadastrado.
  </div>

  <div v-else>
    <div v-for="v in veiculos" :key="v.id" class="veiculo-item">
      <img v-if="v.fotos && v.fotos[0]" :src="v.fotos[0]" :alt="v.modelo">
      <div v-else class="no-foto"><i class="bi bi-car-front"></i></div>
      <div class="veiculo-info">
        <strong>{{ v.marca }} {{ v.modelo }}</strong><br>
        <span>{{ v.ano }} · {{ v.cor }} · {{ v.quilometragem }}</span>
      </div>
      <button class="btn btn-sm btn-outline-danger ms-auto" @click="deletar(v.id)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</div>
</template>

<style scoped>
.veiculo-item {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}
.veiculo-item img { width: 72px; height: 54px; object-fit: cover; border-radius: 6px; }
.no-foto {
  width: 72px; height: 54px; border-radius: 6px;
  background: #1e293b;
  display: flex; align-items: center; justify-content: center;
  color: #475569; font-size: 1.4rem;
}
.veiculo-info { flex: 1; }
.veiculo-info strong { color: #f1f5f9; font-size: .95rem; }
.veiculo-info span   { color: #64748b;  font-size: .8rem; }
</style>
