<template>
  <div class="zw-login-state">
    <el-dropdown v-if="username" size="medium" trigger="click" @command="handle">
      <el-button type="text" class="fa fa-user-circle">
        <span class="el-icon-arrow-down el-icon--right"></span>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="revealUsername" title="Reveal Username topic">
          <b>{{username}}</b>
        </el-dropdown-item>
        <el-dropdown-item command="logout" divided>
          Logout
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-button v-else class="sign-in" type="primary" @click="open">Sign in</el-button>
    <dmx-login-dialog :visible="visible" @logged-in="loggedIn" @close="close"></dmx-login-dialog>
  </div>
</template>

<script>
export default {

  data () {
    return {
      visible: false    // login dialog visibility
    }
  },

  computed: {
    username () {
      return this.$store.state.username
    }
  },

  methods: {

    loggedIn (username) {
      this.$store.dispatch('loggedIn', username)
    },

    handle (command) {
      this.$store.dispatch(command)
    },

    open () {
      this.visible = true
    },

    close () {
      this.visible = false
    }
  },

  components: {
    'dmx-login-dialog': require('dmx-login-dialog').default
  }
}
</script>

<style>
.zw-login-state .el-button.sign-in {
  font-size: var(--secondary-font-size) !important;
  padding: 4px 8px !important;
}
</style>
