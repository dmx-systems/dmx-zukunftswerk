<template>
  <div class="zw-admin">
    <div class="nav-bar">
      <el-button class="fa fa-list" type="text" @click="goWorkspaces"></el-button>
      <el-button class="fa fa-users" type="text" @click="goUsers"></el-button>
      <div class="gap"></div>
      <el-button class="close-button fa fa-times-circle-o" type="text" @click="close"></el-button>
    </div>
    <component :is="adminArea"></component>
  </div>
</template>

<script>
export default {

  data () {
    return {
      adminArea: 'zw-workspaces'      // selected area: 'zw-workspaces'/'zw-users'
    }
  },

  methods: {

    goWorkspaces () {
      this.adminArea = 'zw-workspaces'
    },

    goUsers () {
      this.adminArea = 'zw-users'
    },

    close () {
      this.$store.dispatch('callWorkspaceRoute')
    }
  },

  components: {
    'zw-workspaces': require('./zw-workspaces').default,
    'zw-users': require('./zw-users').default
  }
}
</script>

<style>
.zw-admin {
  display: flex;
  flex-grow: 1;
}

.zw-admin .nav-bar {
  display: flex;
  flex-direction: column;
  background-color: var(--discussion-color);
  padding: 15px 10px 10px 10px;
}

.zw-admin .nav-bar .el-button {
  margin: 0;
}

.zw-admin .nav-bar .el-button + .el-button {
  margin-top: 10px;
}

.zw-admin .nav-bar .close-button {
  font-size: 18px;
}

.zw-admin .nav-bar .gap {
  flex-grow: 1;
}
</style>
