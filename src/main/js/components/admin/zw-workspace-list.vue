<template>
  <div class="zw-workspace-list">
    <div class="heading"><zw-string>label.admin_workspaces</zw-string></div>
    <div v-if="noWorkspaces" class="secondary"><zw-string>label.no_workspaces</zw-string></div>
    <template v-else>
      <div class="owner" key="owner"><zw-string>label.owner</zw-string></div>
      <div class="scroll-container">
        <el-collapse v-model="expandedIds">
          <zw-workspace-item v-for="workspace in workspaces" :workspace="workspace" :key="workspace.id">
          </zw-workspace-item>
        </el-collapse>
      </div>
    </template>
    <el-button class="add-button" size="medium" icon="el-icon-plus" @click="addWorkspace">
      <zw-string>action.add_workspace</zw-string>
    </el-button>
  </div>
</template>

<script>
export default {

  created () {
    this.$store.dispatch('admin/fetchAllZWWorkspaces')
  },

  computed: {

    workspaces () {
      return this.$store.state.admin.workspaces
    },

    noWorkspaces () {
      return this.workspaces.length === 0
    },

    expandedIds: {
      get () {
        return this.$store.state.admin.expandedWorkspaceIds
      },
      set (ids) {
        this.$store.dispatch('admin/setExpandedWorkspaceIds', ids)
      }
    }
  },

  methods: {
    addWorkspace () {
      this.$store.dispatch('admin/showWorkspaceForm')
    }
  },

  components: {
    'zw-workspace-item': require('./zw-workspace-item').default
  }
}
</script>

<style>
.zw-workspace-list > .owner {
  margin-left: 56%;
  margin-bottom: 6px;
}
</style>
