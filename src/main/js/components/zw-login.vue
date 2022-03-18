<template>
  <div class="zw-login">
    <div class="logo">
      <img :src="logoSrc">
      <zw-language-switch></zw-language-switch>
    </div>
    <div class="login-form">
      <div class="welcome">
        <zw-string>label.welcome</zw-string>
      </div>
      <div class="login">
        <zw-string>label.login</zw-string>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>label.email_address</zw-string></div>
        <el-input v-model="credentials.username" ref="username" @keyup.native.enter="advance"></el-input>
      </div>
      <div class="field">
        <div class="field-label"><zw-string>label.password</zw-string></div>
        <el-input v-model="credentials.password" ref="password" @keyup.native.enter="login" type="password"></el-input>
      </div>
      <el-button class="submit-button" type="primary" @click="login">Login</el-button>
      <span class="message">
        {{message}}
      </span>
    </div>
  </div>
</template>

<script>
import dmx from 'dmx-api'

export default {

  mixins: [
    require('./mixins/logo').default
  ],

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

  computed: {
    lang () {
      return this.$store.state.lang
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
  height: 100%;
  background-color: black;
  padding-left: 80px;
  padding-top: 60px;
}

.zw-login .logo img {
  vertical-align: top;
  margin-right: 180px;
}

.zw-login .login-form {
  padding-left: 80px;
}

.zw-login .welcome {
  color: var(--primary-color);
  font-size: 20px;
  margin-top: 42px;
}

.zw-login .login {
  color: var(--primary-color);
  font-size: 36px;
  font-weight: lighter;
  margin-top: 10px;
  margin-bottom: 28px;
}

.zw-login .message {
  color: var(--primary-color);
  font-size: 16px;
  margin-left: 24px;
}

.zw-login .el-input {
  width: 280px;
}

.zw-login .submit-button {
  font-size: 16px;
  margin-top: 24px;
}
</style>
