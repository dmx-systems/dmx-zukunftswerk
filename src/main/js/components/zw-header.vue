<template>
  <div class="zw-header">
    <div class="workspace">
      <lang-string>header.shared_workspace</lang-string>:
      <span class="name">{{workspaceName}}</span>
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
      return this.workspace && this.workspace.value
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
  background-color: rgb(63, 65, 104);
  padding: 8px;
}

.zw-header .workspace {
  flex-grow: 1;
}

.zw-header .workspace .name {
  font-weight: bold;
  font-style: italic;
}
</style>
