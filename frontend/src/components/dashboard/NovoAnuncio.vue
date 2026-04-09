<script setup>
import { ref, onMounted } from 'vue'
import { apiCall } from '../../composables/useApi.js'

const emit = defineEmits(['concluido'])

const veiculos  = ref([])
const veiculo_id = ref('')
const preco     = ref('')
const descricao = ref('')
const loading   = ref(false)
const alerta    = ref({ msg: '', tipo: '' })

onMounted(async () => {
  const res = await apiCall('/veiculos')
  if (res) veiculos.value = await res.json()
})

async function criar () {
  loading.value = true
  alerta.value  = { msg: '', tipo: '' }
  try {
    const res  = await apiCall('/anuncios', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ veiculo_id: veiculo_id.value, preco: preco.value, descricao: descricao.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data.erros || [data.erro]).join(' '))
    alerta.value = { msg: 'Anúncio publicado com sucesso!', tipo: 'sucesso' }
    veiculo_id.value = ''
    preco.value      = ''
    descricao.value  = ''
    setTimeout(() => emit('concluido'), 1200)
  } catch (err) {
    alerta.value = { msg: err.message, tipo: 'erro' }
  } finally {
    loading.value = false
  }
}
</script>

<template>
<div>
  <h4 class="fw-bold mb-1">Criar Anúncio</h4>
  <p style="color:#64748b" class="mb-4 small">Anuncie um veículo para venda</p>

  <div class="dash-card">
    <div class="p-4">
      <div v-if="alerta.msg" class="p-3 mb-3 small"
           :class="alerta.tipo === 'erro' ? 'alerta-erro' : 'alerta-sucesso'">
        {{ alerta.msg }}
      </div>

      <form @submit.prevent="criar">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Veículo *</label>
            <select v-model="veiculo_id" class="form-select" required>
              <option value="">Selecione um veículo...</option>
              <option v-for="v in veiculos" :key="v.id" :value="v.id">
                {{ v.marca }} {{ v.modelo }} ({{ v.ano }})
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Preço (R$) *</label>
            <input v-model="preco" type="number" class="form-control"
                   placeholder="Ex: 45000" min="0" step="0.01" required>
          </div>
          <div class="col-12">
            <label class="form-label">Descrição do anúncio</label>
            <textarea v-model="descricao" class="form-control" rows="3"
                      placeholder="Descreva o veículo para os compradores..."></textarea>
          </div>
        </div>
        <button type="submit" class="btn btn-danger mt-4 px-4" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-megaphone me-2"></i>
          {{ loading ? 'Publicando...' : 'Publicar Anúncio' }}
        </button>
      </form>
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
.form-control, .form-select {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  color: #e2e8f0;
  border-radius: 8px;
}
.form-control:focus, .form-select:focus {
  background: #0f172a;
  border-color: #dc3545;
  color: #e2e8f0;
  box-shadow: 0 0 0 3px rgba(220,53,69,.15);
}
.form-control::placeholder { color: #475569; }
.form-label { color: #94a3b8; font-size: .85rem; }
.form-select option { background: #1e293b; }
.alerta-erro    { background: rgba(220,53,69,.15); border: 1px solid rgba(220,53,69,.3); color: #fca5a5; border-radius: 8px; }
.alerta-sucesso { background: rgba(34,197,94,.12);  border: 1px solid rgba(34,197,94,.3);  color: #86efac; border-radius: 8px; }
</style>
