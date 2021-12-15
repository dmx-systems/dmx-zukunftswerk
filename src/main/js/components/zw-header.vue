<template>
  <div class="zw-header">
    <div class="workspace">
      <zw-string>header.shared_workspace</zw-string>:
      <span class="name" v-if="workspaceName">{{workspaceName[lang]}}</span>
    </div>
    <div>
      <el-button type="text" @click="setLang('de')">DE</el-button>
      <span>|</span>
      <el-button type="text" @click="setLang('fr')">FR</el-button>
    </div>
  </div>
</template>

<script>
export default {

  computed: {

    workspace () {
      return this.$store.state.workspace
    },

    workspaceName () {
      if (this.workspace)
        return {
          de: this.workspace.children['dmx.workspaces.workspace_name#zukunftswerk.de'].value,
          fr: this.workspace.children['dmx.workspaces.workspace_name#zukunftswerk.fr'].value
        }
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {
    setLang (lang) {
      this.$store.dispatch('setLang', lang)
    }
  }
}
</script>

<style>
.zw-header {
  display: flex;
  align-items: baseline;
  color: white;
  padding: 8px;
  background-color: rgb(63, 65, 104);
  z-index: 1;
}

.zw-header .workspace {
  flex-grow: 1;
}

.zw-header .workspace .name {
  font-weight: bold;
  font-style: italic;
}
</style>
