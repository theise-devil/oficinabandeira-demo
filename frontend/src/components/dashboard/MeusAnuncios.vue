<script setup>
import { ref, onMounted } from 'vue'
import { apiCall } from '../../composables/useApi.js'

const anuncios = ref([])
const loading  = ref(true)

async function carregar () {
  loading.value = true
  const res = await apiCall('/anuncios/meus')
  if (res) anuncios.value = await res.json()
  loading.value = false
}

async function deletar (id) {
  if (!confirm('Remover este anúncio?')) return
  await apiCall(`/anuncios/${id}`, { method: 'DELETE' })
  await carregar()
}

onMounted(carregar)
</script>

<template>
<div>
  <h4 class="fw-bold mb-1">Meus Anúncios</h4>
  <p style="color:#64748b" class="mb-4 small">Anúncios publicados por você</p>

  <div v-if="loading" class="text-center py-5" style="color:#475569">
    <span class="spinner-border text-danger"></span>
  </div>

  <div v-else-if="!anuncios.length" class="text-center py-5" style="color:#475569">
    <i class="bi bi-megaphone fs-1 d-block mb-2"></i>Nenhum anúncio publicado.
  </div>

  <div v-else>
    <div v-for="a in anuncios" :key="a.id" class="anuncio-item d-flex align-items-center gap-3">
      <img v-if="a.fotos && a.fotos[0]"
           :src="a.fotos[0]"
           style="width:72px;height:54px;object-fit:cover;border-radius:6px" alt="">
      <div v-else style="width:72px;height:54px;background:#1e293b;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#475569;font-size:1.4rem">
        <i class="bi bi-car-front"></i>
      </div>
      <div class="flex-grow-1">
        <strong style="color:#f1f5f9">{{ a.marca }} {{ a.modelo }} {{ a.ano }}</strong><br>
        <span class="text-danger fw-bold">R$ {{ Number(a.preco).toLocaleString('pt-BR') }}</span>
        <span class="ms-2 badge" :class="a.ativo ? 'bg-success' : 'bg-secondary'">
          {{ a.ativo ? 'Ativo' : 'Inativo' }}
        </span>
      </div>
      <button v-if="a.ativo" class="btn btn-sm btn-outline-danger ms-auto" @click="deletar(a.id)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</div>
</template>

<style scoped>
.anuncio-item {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}
</style>
