<template>
  <div class="zw-header">
    <div class="workspace">
      <zw-string>header.shared_workspace</zw-string>:
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
