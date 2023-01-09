<template>
  <div class="zw-textblock-ref zw-comment-target-ref secondary" v-if="topic" :style="style" @click="reveal">
    <span class="icon fa fa-fw fa-align-left"></span>
    <zw-truncate class="textblock label" :html="textblockHtml"></zw-truncate>
    <el-button class="close-button" v-if="closable" type="text" icon="el-icon-close" @click.stop="close"></el-button>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/color').default
  ],

  props: {
    topic: Object,          // the referred-to Textblock, optional (plain Object, not a dmx.Topic)
    closable: Boolean       // if true the close-button is rendered, optional
  },

  computed: {

    topicHtml () {
      return {
        de: this.html('de'),
        fr: this.html('fr')
      }
    },

    textblockHtml () {
      const topicHtml = this.topicHtml
      if (topicHtml.de && topicHtml.fr) {
        return topicHtml[this.lang]
      } else if (topicHtml.de) {
        return topicHtml.de
      } else if (topicHtml.fr) {
        return topicHtml.fr
      }
    },

    style () {
      return {
        'background-color': this.color
      }
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    html (lang) {
      // Note: in a monolingual textblock "fr" is not defined
      const html = this.topic.children['zukunftswerk.textblock.' + lang]?.value
      if (html !== '<p><br></p>') {
        return html
      }
    },

    reveal () {
      this.$store.dispatch('revealTextblock', this.topic)
    },

    close () {
      this.$store.dispatch('setTextblockFilter', undefined)
    }
  }
}
</script>

<style>
.zw-textblock-ref {
  display: inline-block;
  padding: 6px;
  cursor: pointer;
}

.zw-textblock-ref .close-button {
  font-size: 18px;
  margin-left: 6px;
}

.zw-textblock-ref .close-button > i {
  vertical-align: text-bottom;
}
</style>
