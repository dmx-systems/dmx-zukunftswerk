<template>
  <el-dropdown class="zw-language-switch" size="medium" trigger="click" @command="setLang">
    <el-button type="text" :title="selectTooltip">
      <span>{{lang.toUpperCase()}}</span><span class="el-icon-arrow-down el-icon--right"></span>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="de">DE</el-dropdown-item>
      <el-dropdown-item command="fr">FR</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import zw from '../zw-globals'

export default {

  computed: {

    lang () {
      return this.$store.state.lang
    },

    selectTooltip () {
      return zw.getString('tooltip.select_language')
    }
  },

  methods: {
    setLang (lang) {
      this.$store.dispatch('setLang', lang)
    }
  }
}
</script>
