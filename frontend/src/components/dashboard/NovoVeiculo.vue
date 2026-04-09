<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiCall } from '../../composables/useApi.js'

const emit = defineEmits(['concluido'])

// ── DADOS DO FORMULÁRIO ───────────────────────────────────────────────────────
const marca         = ref('')
const modelo        = ref('')
const ano           = ref('')
const cor           = ref('')
const quilometragem = ref('')
const descricao     = ref('')
const loading       = ref(false)
const alerta        = ref({ msg: '', tipo: '' })

// ── MARCAS E MODELOS (vindos da API) ─────────────────────────────────────────
const marcasObj = ref({})

onMounted(async () => {
  try {
    const res = await fetch('/api/veiculos/marcas')
    if (res.ok) marcasObj.value = await res.json()
  } catch (_) {}
})

// ── AUTOCOMPLETE MARCA ────────────────────────────────────────────────────────
const marcaFocus      = ref(false)
const marcaQuery      = ref('')
const marcaSelecionada = ref('')

const sugestoesMarca = computed(() => {
  if (!marcaQuery.value) return Object.keys(marcasObj.value)
  const q = marcaQuery.value.toLowerCase()
  return Object.keys(marcasObj.value).filter(m => m.toLowerCase().includes(q))
})

function selecionarMarca (m) {
  marcaSelecionada.value = m
  marcaQuery.value       = m
  marca.value            = m
  marcaFocus.value       = false
  // limpa modelo
  modeloQuery.value      = ''
  modeloSelecionado.value = ''
  modelo.value           = ''
}

// ── AUTOCOMPLETE MODELO ───────────────────────────────────────────────────────
const modeloFocus       = ref(false)
const modeloQuery       = ref('')
const modeloSelecionado = ref('')

const modelosDisponiveis = computed(() =>
  marcaSelecionada.value ? (marcasObj.value[marcaSelecionada.value] || []) : []
)

const sugestoesModelo = computed(() => {
  if (!modeloQuery.value) return modelosDisponiveis.value
  const q = modeloQuery.value.toLowerCase()
  return modelosDisponiveis.value.filter(m => m.toLowerCase().includes(q))
})

function selecionarModelo (m) {
  modeloSelecionado.value = m
  modeloQuery.value       = m
  modelo.value            = m
  modeloFocus.value       = false
}

// ── ANOS ──────────────────────────────────────────────────────────────────────
const anos = computed(() => {
  const atual = new Date().getFullYear()
  return Array.from({ length: atual - 1979 }, (_, i) => atual - i)
})

// ── FOTOS (dropzone + preview) ────────────────────────────────────────────────
const fotos      = ref([])   // File[]
const previews   = ref([])   // { url, name }[]
const dropOver   = ref(false)
const inputFotos = ref(null)

function adicionarArquivos (files) {
  const permitidos = ['image/jpeg', 'image/png', 'image/webp']
  for (const f of Array.from(files)) {
    if (!permitidos.includes(f.type)) continue
    if (fotos.value.length >= 10) break
    fotos.value.push(f)
    previews.value.push({ url: URL.createObjectURL(f), name: f.name })
  }
}

function removerFoto (i) {
  URL.revokeObjectURL(previews.value[i].url)
  fotos.value.splice(i, 1)
  previews.value.splice(i, 1)
}

function onDrop (e) {
  dropOver.value = false
  adicionarArquivos(e.dataTransfer.files)
}

// ── SUBMIT ────────────────────────────────────────────────────────────────────
async function cadastrar () {
  loading.value = true
  alerta.value  = { msg: '', tipo: '' }

  const form = new FormData()
  form.append('marca',         marca.value)
  form.append('modelo',        modelo.value)
  form.append('ano',           ano.value)
  form.append('cor',           cor.value)
  form.append('quilometragem', quilometragem.value)
  form.append('descricao',     descricao.value)
  fotos.value.forEach(f => form.append('fotos', f))

  try {
    const res  = await apiCall('/veiculos', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error((data.erros || [data.erro]).join(' '))

    alerta.value = { msg: 'Veículo cadastrado com sucesso!', tipo: 'sucesso' }

    // limpa form
    marcaQuery.value       = ''
    marcaSelecionada.value = ''
    marca.value            = ''
    modeloQuery.value      = ''
    modeloSelecionado.value = ''
    modelo.value           = ''
    ano.value              = ''
    cor.value              = ''
    quilometragem.value    = ''
    descricao.value        = ''
    previews.value.forEach(p => URL.revokeObjectURL(p.url))
    fotos.value    = []
    previews.value = []

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
  <h4 class="fw-bold mb-1">Cadastrar Veículo</h4>
  <p style="color:#64748b" class="mb-4 small">Adicione um novo veículo à sua conta</p>

  <div class="dash-card">
    <div class="p-4">
      <div v-if="alerta.msg" class="p-3 mb-3 small"
           :class="alerta.tipo === 'erro' ? 'alerta-erro' : 'alerta-sucesso'">
        {{ alerta.msg }}
      </div>

      <form @submit.prevent="cadastrar">
        <div class="row g-3">

          <!-- MARCA (autocomplete) -->
          <div class="col-md-6">
            <label class="form-label">Marca *</label>
            <div class="position-relative">
              <input
                v-model="marcaQuery"
                type="text"
                class="form-control"
                placeholder="Digite ou selecione a marca"
                autocomplete="off"
                required
                @focus="marcaFocus = true"
                @blur="setTimeout(() => marcaFocus = false, 200)"
              >
              <ul v-if="marcaFocus && sugestoesMarca.length" class="autocomplete-list">
                <li v-for="m in sugestoesMarca" :key="m" @mousedown.prevent="selecionarMarca(m)">
                  {{ m }}
                </li>
              </ul>
            </div>
          </div>

          <!-- MODELO (autocomplete) -->
          <div class="col-md-6">
            <label class="form-label">Modelo *</label>
            <div class="position-relative">
              <input
                v-model="modeloQuery"
                type="text"
                class="form-control"
                :placeholder="marcaSelecionada ? 'Digite ou selecione o modelo' : 'Selecione a marca primeiro'"
                autocomplete="off"
                required
                :disabled="!marcaSelecionada"
                @focus="modeloFocus = true"
                @blur="setTimeout(() => modeloFocus = false, 200)"
              >
              <ul v-if="modeloFocus && sugestoesModelo.length" class="autocomplete-list">
                <li v-for="m in sugestoesModelo" :key="m" @mousedown.prevent="selecionarModelo(m)">
                  {{ m }}
                </li>
              </ul>
            </div>
          </div>

          <!-- ANO -->
          <div class="col-md-4">
            <label class="form-label">Ano *</label>
            <select v-model="ano" class="form-select" required>
              <option value="">Selecione...</option>
              <option v-for="a in anos" :key="a" :value="String(a)">{{ a }}</option>
            </select>
          </div>

          <!-- COR -->
          <div class="col-md-4">
            <label class="form-label">Cor *</label>
            <select v-model="cor" class="form-select" required>
              <option value="">Selecione...</option>
              <option v-for="c in ['Branco','Preto','Prata','Cinza','Vermelho','Azul','Verde','Amarelo','Laranja','Marrom','Bege','Dourado','Vinho','Rosa','Roxo']"
                      :key="c">{{ c }}</option>
            </select>
          </div>

          <!-- QUILOMETRAGEM -->
          <div class="col-md-4">
            <label class="form-label">Quilometragem *</label>
            <input v-model="quilometragem" type="text" class="form-control"
                   placeholder="Ex: 45.000 km" required>
          </div>

          <!-- DESCRIÇÃO -->
          <div class="col-12">
            <label class="form-label">Descrição</label>
            <textarea v-model="descricao" class="form-control" rows="3"
                      placeholder="Detalhes do veículo..."></textarea>
          </div>

          <!-- FOTOS (dropzone) -->
          <div class="col-12">
            <label class="form-label">
              Fotos do veículo <span style="color:#475569">(máx. 10, 5MB cada)</span>
            </label>
            <div
              class="foto-dropzone"
              :class="{ 'drag-over': dropOver }"
              @click="inputFotos.click()"
              @dragover.prevent="dropOver = true"
              @dragleave="dropOver = false"
              @drop.prevent="onDrop"
            >
              <i class="bi bi-cloud-upload fs-2 text-danger"></i>
              <p class="mb-0 mt-2" style="color:#64748b">Clique ou arraste as fotos aqui</p>
              <p class="small mb-0" style="color:#475569">JPG, PNG ou WEBP</p>
            </div>
            <input
              ref="inputFotos"
              type="file"
              accept="image/*"
              multiple
              class="d-none"
              @change="adicionarArquivos($event.target.files); $event.target.value = ''"
            >
            <!-- PREVIEW -->
            <div class="d-flex flex-wrap gap-2 mt-3">
              <div v-for="(p, i) in previews" :key="i" class="foto-preview">
                <img :src="p.url" :alt="p.name">
                <button type="button" class="remover" @click="removerFoto(i)">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>

        </div>

        <button type="submit" class="btn btn-danger mt-4 px-4" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-plus-circle me-2"></i>
          {{ loading ? 'Salvando...' : 'Cadastrar Veículo' }}
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

/* AUTOCOMPLETE */
.autocomplete-list {
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0 0 8px 8px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 999;
  list-style: none;
  margin: 0; padding: 4px 0;
}
.autocomplete-list li {
  padding: 8px 14px;
  color: #cbd5e1;
  cursor: pointer;
  font-size: .88rem;
}
.autocomplete-list li:hover {
  background: rgba(220,53,69,.15);
  color: #fff;
}

/* DROPZONE */
.foto-dropzone {
  border: 2px dashed rgba(220,53,69,.4);
  border-radius: 10px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color .2s, background .2s;
}
.foto-dropzone:hover,
.foto-dropzone.drag-over {
  border-color: #dc3545;
  background: rgba(220,53,69,.06);
}

/* PREVIEW */
.foto-preview {
  position: relative;
  width: 90px; height: 70px;
}
.foto-preview img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
}
.foto-preview .remover {
  position: absolute;
  top: -6px; right: -6px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px; height: 20px;
  font-size: .7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.alerta-erro    { background: rgba(220,53,69,.15); border: 1px solid rgba(220,53,69,.3); color: #fca5a5; border-radius: 8px; }
.alerta-sucesso { background: rgba(34,197,94,.12);  border: 1px solid rgba(34,197,94,.3);  color: #86efac; border-radius: 8px; }
</style>
