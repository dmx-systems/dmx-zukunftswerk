<template>
  <div class="zw-login">
    <div class="header">
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
      <div class="password-reset">
        <zw-string class="label">label.forgot_password</zw-string>
        <el-button type="text" @click="openDialog"><zw-string>action.reset_password</zw-string></el-button>
      </div>
      <el-button class="submit-button" type="primary" @click="login">Login</el-button>
      <span class="message">{{message}}</span>
    </div>
    <el-dialog :visible.sync="visible" width="350px">
      <zw-string slot="title">label.reset_password</zw-string>
      <div class="field">
        <div class="field-label"><zw-string>label.email_address</zw-string></div>
        <el-input v-model="emailAddress"></el-input>
      </div>
      <el-button class="reset-button" type="primary" @click="resetPassword">
        <zw-string>action.submit</zw-string>
      </el-button>
    </el-dialog>
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
      // Login dialog
      credentials: {
        username: '',
        password: ''
      },
      // Password-reset Dialog
      visible: false,
      emailAddress: ''
    }
  },

  computed: {

    message () {
      return this.$store.state.loginMessage
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    login () {
      this.$store.dispatch('login', this.credentials).finally(() => {
        this.credentials.password = ''
      })
    },

    advance () {
      this.$refs.password.focus()
    },

    openDialog () {
      this.visible = true
    },

    closeDialog () {
      this.visible = false
    },

    resetPassword () {
      this.$store.dispatch('resetPassword', this.emailAddress)
      this.closeDialog()
    },
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

.zw-login .header img {
  vertical-align: top;
  margin-right: 180px;
}

.zw-login .login-form {
  padding-left: 80px;
}

.zw-login .login-form .el-input {
  width: 280px;
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

.zw-login .password-reset {
  margin-top: 6px;
}

.zw-login .password-reset .el-button {
  font-size: var(--secondary-font-size);
}

.zw-login .message {
  color: var(--primary-color);
  font-size: 16px;
  margin-left: 24px;
}

.zw-login .submit-button,
.zw-login .reset-button {
  font-size: 16px;
  margin-top: 26px;
}
</style>
