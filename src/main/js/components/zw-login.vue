<template>
  <div class="zw-login">
    Login
    <div class="field">
      <div class="field-label">Username</div>
      <el-input v-model="credentials.username" ref="username" @keyup.native.enter="advance"></el-input>
    </div>
    <div class="field">
      <div class="field-label">Password</div>
      <el-input v-model="credentials.password" ref="password" @keyup.native.enter="login" type="password"></el-input>
    </div>
    <div class="field">
      {{message}}
    </div>
    <div>
      <el-button type="primary" @click="login">Login</el-button>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mounted () {
    this.$refs.username.focus()
  },

  data () {
    return {
      credentials: {
        username: '',
        password: ''
      },
      message: ''
    }
  },

  methods: {

    login () {
      this.$store.dispatch('login', this.credentials).then(() => {
        this.message = 'Login OK'
      }).catch(error => {
        this.message = 'Login failed'
      }).finally(() => {
        this.credentials.password = ''
      })
    },

    advance () {
      this.$refs.password.focus()
    }
  }
}
</script>

<style>
.zw-login {
}
</style>
