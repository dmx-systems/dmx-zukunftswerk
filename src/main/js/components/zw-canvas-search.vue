<template>
  <div class="zw-canvas-search">
    <el-input v-model="searchTerm"></el-input>
    <el-button type="text" icon="el-icon-arrow-left" :disabled="disPrev" @click="prev"></el-button>
    <el-button type="text" icon="el-icon-arrow-right" :disabled="disNext" @click="next"></el-button>
    <span :class="['match-info', {'no-match': noMatch}, 'secondary']" v-if="searchTerm">
      {{matchInfo}}
    </span>
  </div>
</template>

<script>

export default {

  data () {
    return {
      searchTerm: '',
      matches: [],
      matchIndex: 0
    }
  },

  computed: {

    matchInfo () {
      if (!this.noMatch) {
        return `Match ${this.matchIndex + 1} of ${this.matches.length}`
      } else {
        return 'No match'
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

    topicmap () {
      return this.$store.state.topicmap
    },

    lang () {
      return this.$store.state.lang
    }
  },

  watch: {
    searchTerm () {
      this.search()
    }
  },

  methods: {

    search () {
      this.matches = []
      this.matchIndex = 0
      this.topicmap.topics.forEach(topic => {
        const text = this.itemText(topic)
        if (text) {
          // TODO: locale lower case?
          const i = text.toLowerCase().indexOf(this.searchTerm.toLowerCase())
          if (i >= 0) {
            this.matches.push(topic.id)
          }
        }
      })
    },

    itemText (topic) {
      // TODO: refactor
      const vm = document.querySelector(`.zw-canvas-item[data-id="${topic.id}"] .item-content`).__vue__
      switch (topic.typeUri) {
      case 'zukunftswerk.note':
        return vm.noteHtml
      case 'zukunftswerk.label':
        return vm.labelText
      case 'zukunftswerk.document':
        return vm.docName
      }
    },

    prev () {
      this.matchIndex--
    },

    next () {
      this.matchIndex++
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
  margin-left: 5px;
  vertical-align: super;
}

.zw-canvas-search .match-info.no-match {
  color: var(--color-danger);
}
</style>
