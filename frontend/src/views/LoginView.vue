<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setAuth } from '../composables/useAuth.js'

const router = useRouter()

// Redireciona se já logado
if (localStorage.getItem('ob_token')) router.replace('/dashboard')

const aba      = ref('login')
const alerta   = ref({ msg: '', tipo: '' })
const loading  = ref(false)

// campos login
const loginEmail = ref('')
const loginSenha = ref('')

// campos cadastro
const cadNome  = ref('')
const cadEmail = ref('')
const cadSenha = ref('')

function mostrarAlerta (msg, tipo = 'erro') {
  alerta.value = { msg, tipo }
}
function limparAlerta () {
  alerta.value = { msg: '', tipo: '' }
}

async function fazerLogin () {
  loading.value = true
  limparAlerta()
  try {
    const res  = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: loginEmail.value, senha: loginSenha.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao entrar.')
    setAuth(data)
    router.push('/dashboard')
  } catch (err) {
    mostrarAlerta(err.message)
  } finally {
    loading.value = false
  }
}

async function fazerCadastro () {
  loading.value = true
  limparAlerta()
  try {
    const res  = await fetch('/api/auth/cadastro', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nome: cadNome.value, email: cadEmail.value, senha: cadSenha.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data.erros || [data.erro]).join(' '))
    setAuth(data)
    router.push('/dashboard')
  } catch (err) {
    mostrarAlerta(err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
<div class="auth-bg">
  <div class="container px-3">
    <div class="auth-card">

      <!-- Logo -->
      <div class="text-center mb-4">
        <router-link to="/" class="text-decoration-none">
          <i class="bi bi-tools text-danger fs-2"></i>
          <div class="fw-bold text-white mt-1">OFICINA BANDEIRA</div>
        </router-link>
      </div>

      <!-- Tabs -->
      <div class="d-flex border-bottom border-secondary mb-4">
        <button class="tab-btn" :class="{ active: aba === 'login' }"    @click="aba = 'login';    limparAlerta()">Entrar</button>
        <button class="tab-btn" :class="{ active: aba === 'cadastro' }" @click="aba = 'cadastro'; limparAlerta()">Criar Conta</button>
      </div>

      <!-- Alerta -->
      <div v-if="alerta.msg" class="p-3 mb-3 small"
           :class="alerta.tipo === 'erro' ? 'alert-dark-danger' : 'alert-dark-success'">
        {{ alerta.msg }}
      </div>

      <!-- LOGIN -->
      <form v-if="aba === 'login'" @submit.prevent="fazerLogin">
        <div class="mb-3">
          <label class="form-label">E-mail</label>
          <input v-model="loginEmail" type="email" class="form-control" placeholder="seu@email.com" required>
        </div>
        <div class="mb-4">
          <label class="form-label">Senha</label>
          <input v-model="loginSenha" type="password" class="form-control" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-danger w-100 fw-bold" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-box-arrow-in-right me-2"></i>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <!-- CADASTRO -->
      <form v-else @submit.prevent="fazerCadastro">
        <div class="mb-3">
          <label class="form-label">Nome completo</label>
          <input v-model="cadNome" type="text" class="form-control" placeholder="Seu nome" required>
        </div>
        <div class="mb-3">
          <label class="form-label">E-mail</label>
          <input v-model="cadEmail" type="email" class="form-control" placeholder="seu@email.com" required>
        </div>
        <div class="mb-1">
          <label class="form-label">Senha</label>
          <input v-model="cadSenha" type="password" class="form-control" placeholder="Mín. 8 caracteres" required>
        </div>
        <p class="small mb-4" style="color:#475569">Deve conter ao menos 8 caracteres, 1 maiúscula e 1 número.</p>
        <button type="submit" class="btn btn-danger w-100 fw-bold" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-person-plus me-2"></i>
          {{ loading ? 'Criando conta...' : 'Criar Conta' }}
        </button>
      </form>

      <p class="text-center mt-4 mb-0 small" style="color:#475569">
        <router-link to="/" class="text-danger text-decoration-none">
          <i class="bi bi-arrow-left me-1"></i>Voltar ao site
        </router-link>
      </p>

    </div>
  </div>
</div>
</template>

<style scoped>
.auth-bg {
  background: #0f172a;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 0 !important;
}
/* sobrescreve padding-top do body apenas nesta página */
:global(body) { padding-top: 0; }

.auth-card {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  margin: auto;
}
.form-control {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  color: #e2e8f0;
  border-radius: 8px;
}
.form-control:focus {
  background: #0f172a;
  border-color: #dc3545;
  color: #e2e8f0;
  box-shadow: 0 0 0 3px rgba(220,53,69,0.15);
}
.form-label { color: #94a3b8; font-size: .875rem; }
.tab-btn {
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 1rem;
  padding: 8px 20px;
  border-bottom: 2px solid transparent;
  transition: all .2s;
}
.tab-btn.active { color: #dc3545; border-bottom-color: #dc3545; }
.alert-dark-danger  { background: rgba(220,53,69,.15);  border: 1px solid rgba(220,53,69,.3);  color: #fca5a5; border-radius: 8px; }
.alert-dark-success { background: rgba(34,197,94,.12);  border: 1px solid rgba(34,197,94,.3);  color: #86efac; border-radius: 8px; }
</style>
