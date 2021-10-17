<template>
  <div class="zw-header">
    <lang-string class="workspace">header.shared_workspace</lang-string>
    <div>
      <el-button type="text" @click="setLang('de')">DE</el-button>
      <span>|</span>
      <el-button type="text" @click="setLang('fr')">FR</el-button>
    </div>
  </div>
</template>

<script>
export default {
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
</style>
