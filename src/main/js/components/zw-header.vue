<template>
  <div class="zw-header">
    <img class="logo" :src="logo">
    <!-- Workspace selector -->
    <div class="workspace">
      <zw-string v-if="isAdminRoute" class="name" key="admin">label.admin</zw-string>
      <template v-else>
        <zw-string>label.shared_workspace</zw-string>:
        <el-dropdown size="medium" trigger="click" @command="setWorkspace">
          <el-button type="text" :title="selectTooltip">
            <span class="name">{{workspaceName}}</span><span class="el-icon-arrow-down el-icon--right"></span>
          </el-button>
          <el-dropdown-menu class="zw-workspace-selector" slot="dropdown">
            <el-dropdown-item v-for="workspace in workspaces" :command="workspace.id" :key="workspace.id">
              {{getWorkspaceName(workspace)}}
            </el-dropdown-item>
            <el-dropdown-item v-if="isTeam && teamWorkspace" :command="teamWorkspace.id" :divided="workspacesExist">
              {{getWorkspaceName(teamWorkspace)}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </div>
    <!-- Admin button -->
    <el-button class="admin-button fa fa-wrench" v-if="isTeam" type="text" :title="adminTooltip" @click="admin">
    </el-button>
    <zw-language-switch></zw-language-switch>
    <zw-user-menu></zw-user-menu>
  </div>
</template>

<script>
import zw from '../zw-globals'

export default {

  mixins: [
    require('./mixins/logo').default,
    require('./mixins/workspace-name').default
  ],

  computed: {

    workspacesExist () {
      return this.workspaces.length > 0
    },

    teamWorkspace () {
      return this.$store.state.teamWorkspace
    },

    workspaces () {
      return this.$store.getters.sortedWorkspaces
    },

    isTeam () {
      return this.$store.state.isTeam
    },

    workspace () {
      return this.$store.state.workspace
    },

    router () {
      return this.$store.state.routerModule.router
    },

    isAdminRoute () {
      return this.router.currentRoute.name === 'admin'
    },

    selectTooltip () {
      return zw.getString('tooltip.select_workspace')
    },

    adminTooltip () {
      return zw.getString('tooltip.admin')
    }
  },

  methods: {

    setWorkspace (id) {
      this.$store.dispatch('callWorkspaceRoute', id)
    },

    admin () {
      this.$store.dispatch('callAdminRoute')
    }
  },

  components: {
    'zw-user-menu': require('./zw-user-menu').default
  }
}
</script>

<style>
.zw-header {
  display: flex;
  align-items: center;
  padding: 2px 10px;
  background-color: var(--header-color);
}

.zw-header img.logo {
  height: 44px;
  margin-right: 72px;
}

.zw-header .workspace {
  flex-grow: 1;
  color: white;
}

.zw-header .workspace .name {
  font-weight: bold;
  font-style: italic;
}

.zw-header .admin-button {
  margin-right: 20px;
}

.zw-header .zw-user-menu {
  margin-left: 20px;
}

/* dropdown menus are body mounted */
body > .el-dropdown-menu.zw-workspace-selector {
  overflow: auto;
  max-height: calc(100% - 68px);
  white-space: nowrap;
}
</style>
