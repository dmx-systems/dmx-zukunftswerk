<template>
  <div class="zw-workspaces">
    <div class="heading"><zw-string>label.admin_workspaces</zw-string></div>
    <div v-if="noWorkspaces" class="secondary"><zw-string>label.no_workspaces</zw-string></div>
    <div v-else>
      <zw-workspace-item v-for="workspace in workspaces" :workspace="workspace" :key="workspace.id"></zw-workspace-item>
    </div>
    <el-button class="add-button" size="medium" icon="el-icon-plus" @click="addWorkspace">
      <zw-string>action.add_workspace</zw-string>
    </el-button>
  </div>
</template>

<script>
export default {

  created () {
    this.$store.dispatch('admin/fetchZWWorkspaces')
  },

  computed: {

    workspaces () {
      return this.$store.state.admin.workspaces
    },

    noWorkspaces () {
      return this.workspaces.length === 0
    }
  },

  methods: {
    addWorkspace () {
      this.$store.dispatch('admin/setSecondaryPanel', 'zw-workspace-form')
    }
  },

  components: {
    'zw-workspace-item': require('./zw-workspace-item').default
  }
}
</script>

<style>
.zw-workspaces .zw-workspace-item + .zw-workspace-item {
  margin-top: 10px;
}
</style>
