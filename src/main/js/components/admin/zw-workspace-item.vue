<template>
  <div class="zw-workspace-item">
    <div class="name">{{workspaceName}}</div>
    <el-dropdown size="medium" trigger="click" @command="handle">
      <el-button type="text" class="fa fa-ellipsis-v"></el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="show">
          <i class="fa fa-fw fa-eye"></i><zw-string>action.show_workspace</zw-string>
        </el-dropdown-item>
        <el-dropdown-item command="edit">
          <i class="fa fa-fw fa-pencil"></i><zw-string>action.edit_workspace</zw-string>
        </el-dropdown-item>
        <el-dropdown-item command="delete">
          <i class="fa fa-fw fa-trash"></i><zw-string>action.delete_workspace</zw-string>
        </el-dropdown-item>
        <el-dropdown-item command="adminUsers" divided>
          <i class="fa fa-fw fa-users"></i><zw-string>action.admin_users</zw-string>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {

  mixins: [
    require('../mixins/workspace-name').default
  ],

  props: {
    workspace: {      // plain Workspace topic
      type: Object,
      required: true
    }
  },

  methods: {

    handle (command) {
      this[command]()
    },

    show () {
      this.$store.dispatch('callWorkspaceRoute', this.workspace.id)
    },

    edit () {
      // TODO
    },

    delete () {
      // TODO
    },

    adminUsers () {
      // TODO
    }
  }
}
</script>

<style>
.zw-workspace-item {
  display: flex;
  background-color: #f6f6f6;
  padding: 10px;
}

.zw-workspace-item .name {
  flex-grow: 1;
}
</style>