<template>
  <div class="zw-header">
    <img class="logo" :src="logo">
    <div class="workspace">
      <zw-string>label.shared_workspace</zw-string>:
      <span class="name">{{workspaceName}}</span>
    </div>
    <el-button class="admin-button fa fa-wrench" v-if="isTeam" type="text" @click="admin"></el-button>
    <el-dropdown size="medium" trigger="click" @command="setLang">
      <el-button type="text">
        <span>{{lang.toUpperCase()}}</span><span class="el-icon-arrow-down el-icon--right"></span>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="de">DE</el-dropdown-item>
        <el-dropdown-item command="fr">FR</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <zw-login-state></zw-login-state>
  </div>
</template>

<script>
const logo = {
  de: require('../../resources/logo.de.png'),
  fr: require('../../resources/logo.fr.png')
}

export default {

  computed: {

    isTeam () {
      return this.$store.state.isTeam
    },

    workspace () {
      return this.$store.state.workspace
    },

    workspaceName () {
      if (this.workspaceNameLang) {
        return this.workspaceNames[this.workspaceNameLang]
      } else if (this.workspace) {
        return this.workspace.children['dmx.workspaces.workspace_name'].value
      }
    },

    workspaceNames () {
      if (this.workspace) {
        const de = this.workspace.children['dmx.workspaces.workspace_name#zukunftswerk.de']
        const fr = this.workspace.children['dmx.workspaces.workspace_name#zukunftswerk.fr']
        return {
          de: de && de.value,
          fr: fr && fr.value
        }
      }
    },

    workspaceNameLang () {
      const names = this.workspaceNames
      if (names) {
        if (names.de && names.fr) {
          return this.lang
        } else if (names.de) {
          return 'de'
        } else if (names.fr) {
          return 'fr'
        }
      }
    },

    logo () {
      return logo[this.lang]
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    setLang (lang) {
      this.$store.dispatch('setLang', lang)
    },

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
