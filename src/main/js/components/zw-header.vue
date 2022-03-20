<template>
  <div class="zw-header">
    <img class="logo" :src="logoSrc">
    <div class="workspace">
      <zw-string v-if="isAdmin" class="name" key="admin">label.admin</zw-string>
      <template v-else>
        <zw-string>label.shared_workspace</zw-string>:
        <el-dropdown size="medium" trigger="click" @command="setWorkspace">
          <el-button type="text">
            <span class="name">{{workspaceName}}</span><span class="el-icon-arrow-down el-icon--right"></span>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="workspace in workspaces" :command="workspace.id" :key="workspace.id">
              {{workspace.value}}
            </el-dropdown-item>
            <el-dropdown-item v-if="isTeam && teamWorkspace" :command="teamWorkspace.id" :divided="divided">
              {{teamWorkspace.value}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </div>
    <el-button class="admin-button fa fa-wrench" v-if="isTeam" type="text" @click="admin"></el-button>
    <zw-language-switch></zw-language-switch>
    <zw-user-menu></zw-user-menu>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/logo').default,
    require('./mixins/workspace-name').default
  ],

  created () {
    this.$store.state.teamWorkspace.then(workspace => {
      this.teamWorkspace = workspace
    })
  },

  data () {
    return {
      teamWorkspace: undefined      // a Workspace topic
    }
  },

  computed: {

    divided () {
      return this.workspaces.length > 0
    },

    workspaces () {
      return this.$store.state.workspaces
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

    isAdmin () {
      return this.router.currentRoute.name === 'admin'
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

.zw-header .zw-user-menu {
  margin-left: 20px;
}
</style>
