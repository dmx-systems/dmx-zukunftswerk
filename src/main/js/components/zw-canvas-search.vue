<template>
  <div class="zw-canvas-search">
    <el-input v-model="searchTerm"></el-input>
    <el-button type="text" icon="el-icon-arrow-left" :disabled="disPrev" @click="step(-1)"></el-button>
    <el-button type="text" icon="el-icon-arrow-right" :disabled="disNext" @click="step(1)"></el-button>
    <span :class="['match-info', {'no-match': noMatch}, 'secondary']">{{matchInfo}}</span>
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
      if (this.searchTerm) {
        if (this.noMatch) {
          return 'No match'
        } else {
          return `Match ${this.matchIndex + 1} of ${this.matches.length}`
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
      if (this.searchTerm) {
        this.topicmap.topics.forEach(topic => {
          const text = this.itemText(topic)
          if (text) {
            // TODO: locale lower case?
            const i = text.toLowerCase().indexOf(this.searchTerm.toLowerCase())
            if (i >= 0) {
              this.matches.push(topic)
            }
          }
        })
        // console.log('search', this.searchTerm, this.matches.length)
        if (this.matches.length) {
          this.showMatch()
        }
      }
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

    step (delta) {
      this.matchIndex += delta
      this.showMatch()
    },

    showMatch () {
      this.$store.dispatch('selectAndPan', this.matches[this.matchIndex])
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
  width: 100px;
  margin-left: 5px;
  vertical-align: super;
}

.zw-canvas-search .match-info.no-match {
  color: var(--color-danger);
}
</style>
