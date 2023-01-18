<template>
  <div class="zw-canvas-search">
    <el-input v-model="searchTerm" :placeholder="placeholder"></el-input>
    <el-button type="text" icon="el-icon-arrow-left" :disabled="disPrev" @click="prevMatch"></el-button>
    <el-button type="text" icon="el-icon-arrow-right" :disabled="disNext" @click="nextMatch"></el-button>
    <span :class="['match-info', {'no-match': noMatch}, 'secondary']">{{matchInfo}}</span>
  </div>
</template>

<script>
import zw from '../zw-globals'

export default {

  computed: {

    placeholder () {
      return zw.getString('label.search')
    },

    matchInfo () {
      // Note: match-info DOM is always rendered to reserve horizontal space
      if (this.searchTerm) {
        if (this.noMatch) {
          return '0'
        } else {
          return `${this.matchIndex + 1} ${zw.getString('label.of')} ${this.matches.length}`
        }
      }
    },

    noMatch () {
      return !this.matches.length
    },

    disPrev () {
      return this.matchIndex == 0
    },

    disNext () {
      return this.matchIndex == this.matches.length - 1 || this.noMatch
    },

    searchTerm: {
      get () {
        return this.$store.state.search.searchTerm
      },
      set (searchTerm) {
        this.$store.dispatch('search/search', searchTerm)
      }
    },

    matches () {
      return this.$store.state.search.matches
    },

    matchIndex () {
      return this.$store.state.search.matchIndex
    }
  },

  methods: {

    prevMatch () {
      this.$store.dispatch('search/prevMatch')
    },

    nextMatch () {
      this.$store.dispatch('search/nextMatch')
    }
  }
}
</script>

<style>
.zw-canvas-search {
  display: inline-block;
}

.zw-canvas-search .el-input {
  width: 180px;
  vertical-align: super;
}

.zw-canvas-search .el-input__inner {
  height: 32px;
}

.zw-canvas-search .el-button:nth-of-type(1) {
  margin-left: 5px;
}

.zw-canvas-search .el-button:nth-of-type(2) {
  margin-left: 0px;
}

.zw-canvas-search .match-info {
  display: inline-block;
  width: 60px;
  margin-left: 5px;
  vertical-align: super;
}

.zw-canvas-search .match-info.no-match {
  color: var(--color-danger);
}
</style>
