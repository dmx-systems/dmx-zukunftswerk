<template>
  <div class="zw-admin">
    <div class="nav-bar">
      <el-button class="fa fa-list" type="text" @click="goWorkspaces"></el-button>
      <el-button class="fa fa-users" type="text" @click="goUsers"></el-button>
      <div class="gap"></div>
      <el-button class="close-button fa fa-times-circle-o" type="text" @click="close"></el-button>
    </div>
    <component class="primary-panel" :is="primaryPanel"></component>
    <component class="secondary-panel" :is="secondaryPanel"></component>
  </div>
</template>

<script>
export default {

  computed: {

    primaryPanel () {
      return this.$store.state.admin.primaryPanel
    },

    secondaryPanel () {
      return this.$store.state.admin.secondaryPanel
    }
  },

  methods: {

    goWorkspaces () {
      this.$store.dispatch('admin/setPrimaryPanel', 'zw-workspaces')
    },

    goUsers () {
      this.$store.dispatch('admin/setPrimaryPanel', 'zw-users')
    },

    close () {
      this.$store.dispatch('callWorkspaceRoute')
    }
  },

  components: {
    'zw-workspaces': require('./zw-workspaces').default,
    'zw-workspace-form': require('./zw-workspace-form').default,
    'zw-membership-form': require('./zw-membership-form').default,
    'zw-users': require('./zw-users').default,
    'zw-user-form': require('./zw-user-form').default
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
  padding: 24px 12px 12px 12px;
}

.zw-admin .nav-bar .el-button {
  font-size: 16px;
  margin: 0;
}

.zw-admin .nav-bar .el-button + .el-button {
  margin-top: 15px;
}

.zw-admin .nav-bar .close-button {
  font-size: 20px;
}

.zw-admin .nav-bar .gap {
  flex-grow: 1;
}

.zw-admin .primary-panel {
  flex-basis: 50%;
  padding: 30px;
}

.zw-admin .primary-panel .heading {
  font-size: 20px;
  margin-bottom: 28px;
}

.zw-admin .primary-panel .add-button {
  margin-top: 34px;
}

.zw-admin .secondary-panel {
  flex-grow: 1;
  padding: 30px;
  background-color: var(--discussion-color);
}

.zw-admin .secondary-panel .heading {
  font-size: 20px;
  margin-bottom: 22px;
}

.zw-admin .secondary-panel .submit-button {
  margin-top: 26px;
}
</style>
