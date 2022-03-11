<template>
  <div class="zw-workspaces">
    <div class="heading"><zw-string>label.admin_workspaces</zw-string></div>
    <div v-if="noWorkspaces" class="secondary"><zw-string>label.no_workspaces</zw-string></div>
    <div v-for="workspace in workspaces">{{workspace.value}}</div>
    <el-button class="add-workspace-button" size="medium" icon="el-icon-plus" @click="addWorkspace">
      <zw-string>action.add_workspace</zw-string>
    </el-button>
  </div>
</template>

<script>
export default {

  created () {
    this.$store.dispatch('admin/fetchZWWorkspaces')
  },

  data () {
    return {
    }
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
  }
}
</script>

<style>
.zw-workspaces {
  flex-grow: 1;
  padding: 30px;
}

.zw-workspaces .heading {
  font-size: 20px;
  margin-bottom: 20px;
}

.zw-workspaces .add-workspace-button {
  margin-top: 24px;
}
</style>
