<template>
  <el-collapse-item :class="['zw-workspace-item', {'zw-selected': selected}]" :name="workspace.id">
    <div class="workspace" slot="title">
      <div class="name"><span class="fa fa-fw fa-list"></span> {{workspaceName}}</div>
      <el-dropdown size="medium" trigger="click" @command="handle" @click.native.stop>
        <el-button type="text" class="fa fa-fw fa-ellipsis-v"></el-button>
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
          <el-dropdown-item command="editMemberships" divided>
            <i class="fa fa-fw fa-users"></i><zw-string>action.edit_memberships</zw-string>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div v-for="(username, i) in workspace.memberships">
      <span class="fa fa-fw fa-user"></span>
      {{displayNames[i]}} ({{username.value}})
    </div>
  </el-collapse-item>
</template>

<script>
import zw from '../../zw-globals'

export default {

  mixins: [
    require('../mixins/workspace-name').default
  ],

  props: {
    workspace: {
      type: Object,     // a plain Workspace topic
      required: true
    }
  },

  computed: {

    activeWorkspace () {
      return this.$store.state.admin.activeWorkspace
    },

    selected () {
      return this.activeWorkspace?.id === this.workspace.id
    },

    displayNames () {
      return this.workspace.memberships.map(user => zw.getDisplayName(user.value))
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
      this.$store.dispatch('admin/showWorkspaceForm', this.workspace)
    },

    delete () {
      this.$store.dispatch('admin/setActiveWorkspace', this.workspace)
      this.$store.dispatch('admin/deleteWorkspace', this.workspace.id)
    },

    editMemberships () {
      this.$store.dispatch('admin/setActiveWorkspace', this.workspace)
      this.$store.dispatch('admin/setSecondaryPanel', 'zw-workspace-memberships')
    }
  }
}
</script>

<style>
.zw-workspace-item .workspace {
  display: flex;
  width: 92%;
}

.zw-workspace-item .workspace .name {
  flex-grow: 1;
}
</style>
