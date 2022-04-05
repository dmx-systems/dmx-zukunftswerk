<template>
  <div class="zw-login">
    <zw-language-switch></zw-language-switch>
    <div class="stamp">beta</div>
    <img :src="logo">
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
      <el-button class="login-button" type="primary" @click="login">Login</el-button>
      <span class="message">{{message}}</span>
    </div>
    <div class="gap">
    </div>
    <div class="footer">
      <el-button type="text" @click="openImprint"><zw-string>label.imprint</zw-string></el-button>
      <el-button type="text" @click="openPrivacyPolicy"><zw-string>label.privacy_policy</zw-string></el-button>
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
import zw from '../zw-globals'

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
    }
  },

  methods: {

    // Login

    login () {
      this.$store.dispatch('login', this.credentials).finally(() => {
        this.credentials.password = ''
      })
    },

    advance () {
      this.$refs.password.focus()
    },

    // Reset Password

    openDialog () {
      this.visible = true
    },

    closeDialog () {
      this.visible = false
    },

    resetPassword () {
      this.$store.dispatch('resetPassword', this.emailAddress).then(() => {
        this.$notify({
          message: `Mail was sent to ${this.emailAddress}`,
          type: 'success',
          showClose: false
        })
        this.closeDialog()
      }).catch(error => {
        this.$alert('An error occurred while sending the password reset mail', {
          type: 'error',
          showClose: false
        })
      })
    },

    // Legal

    openImprint () {
      this.$store.dispatch('callImprintRoute')
    },

    openPrivacyPolicy () {
      this.$store.dispatch('callPrivacyPolicyRoute')
    }
  }
}
</script>

<style>
.zw-login {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background-color: black;
  background-image: url("../../resources/zw-snake.png");
  background-position: bottom right;
  background-repeat: no-repeat;
  padding: 60px 0 18px 160px;
}

.zw-login .zw-language-switch {
  position: absolute;
  top: 16px;
  right: 16px;
}

.zw-login .stamp {
  position: absolute;
  top: 201px;
  left: 402px;
  font-size: 14px;
  font-weight: bold;
  padding: 1px 10px;
  transform: rotate(-25deg);
  background-color: var(--primary-color);
}

.zw-login img {
  align-self: flex-start;
  margin-left: -81px;
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
  margin-left: 2px;
}

.zw-login .message {
  color: var(--primary-color);
  font-size: 16px;
  margin-left: 24px;
}

.zw-login .login-button,
.zw-login .reset-button {
  font-size: 16px;
  margin-top: 26px;
}

.zw-login .login-button {
  margin-bottom: 36px;
}

.zw-login .gap {
  flex-grow: 1;
}

.zw-login .footer .el-button {
  font-size: var(--secondary-font-size);
}

.zw-login .footer .el-button:nth-child(2) {
  margin-left: 15px;
}
</style>
