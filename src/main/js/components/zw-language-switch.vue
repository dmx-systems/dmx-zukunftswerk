<template>
  <el-dropdown class="zw-language-switch" size="medium" trigger="click" @command="setLang">
    <el-button type="text">
      <span>{{lang.toUpperCase()}}</span><span class="el-icon-arrow-down el-icon--right"></span>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="de">DE</el-dropdown-item>
      <el-dropdown-item command="fr">FR</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {

  computed: {
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
