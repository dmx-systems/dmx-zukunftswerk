<template>
  <div class="zw-header">
    <div class="workspace">
      <zw-string>label.shared_workspace</zw-string>:
      <span class="name">{{workspaceName}}</span>
    </div>
    <div>
      <el-button type="text" :style="style('de')" @click="setLang('de')">DE</el-button>
      <span>|</span>
      <el-button type="text" :style="style('fr')" @click="setLang('fr')">FR</el-button>
    </div>
    <zw-login-state></zw-login-state>
  </div>
</template>

<script>
export default {

  computed: {

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

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    style (lang) {
      if (this.lang === lang) {
        return {
          'text-decoration': 'underline'
        }
      }
    },

    setLang (lang) {
      this.$store.dispatch('setLang', lang)
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
  align-items: baseline;
  color: white;
  padding: 8px;
  background-color: var(--header-color);
  z-index: 1;
}

.zw-header .workspace {
  flex-grow: 1;
}

.zw-header .workspace .name {
  font-weight: bold;
  font-style: italic;
}

.zw-header .zw-login-state {
  margin-left: 20px;
}
</style>
