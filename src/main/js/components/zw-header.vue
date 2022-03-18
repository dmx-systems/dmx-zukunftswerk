<template>
  <div class="zw-header">
    <img class="logo" :src="logoSrc">
    <div class="workspace">
      <zw-string>label.shared_workspace</zw-string>:
      <span class="name">{{workspaceName}}</span>
    </div>
    <el-button class="admin-button fa fa-wrench" v-if="isTeam" type="text" @click="admin"></el-button>
    <zw-language-switch></zw-language-switch>
    <zw-login-state></zw-login-state>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/logo').default,
    require('./mixins/workspace-name').default
  ],

  computed: {

    isTeam () {
      return this.$store.state.isTeam
    },

    workspace () {
      return this.$store.state.workspace
    }
  },

  methods: {
    admin () {
      this.$store.dispatch('callAdminRoute')
    }
  },

  components: {
    'zw-login-state':  require('./zw-login-state').default
  }
}
</script>

<style>
.zw-header {
  display: flex;
  align-items: center;
  padding: 2px 10px;
  color: white;
  background-color: var(--header-color);
  z-index: 1;
}

.zw-header img.logo {
  height: 44px;
  margin-right: 72px;
}

.zw-header .workspace {
  flex-grow: 1;
}

.zw-header .workspace .name {
  font-weight: bold;
  font-style: italic;
}

.zw-header .admin-button {
  margin-right: 20px;
}

.zw-header .zw-login-state {
  margin-left: 20px;
}
</style>
