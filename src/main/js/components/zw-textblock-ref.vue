<template>
  <div :class="['zw-textblock-ref', 'zw-comment-target-ref', {closable}]" v-if="topic" :style="style"
      @click="reveal">
    <span class="icon fa fa-fw fa-align-left"></span>
    <zw-truncate class="textblock label" :html="textblockHtml"></zw-truncate>
    <el-button class="close-button" v-if="closable" type="text" icon="el-icon-close" @click.stop="close"></el-button>
  </div>
</template>

<script>
export default {

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

    color () {
      const topic = this.topicmap.getTopic(this.topic.id)
      return topic.viewProps['zukunftswerk.color'] || zw.ITEM_COLORS[1]      // default is lavender
    },

    topicmap () {
      return this.$store.state.topicmap
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
      this.$store.dispatch('setRefTextblock', undefined)
    }
  }
}
</script>

<style>
.zw-textblock-ref {
  display: inline-block;
  /* background-color: var(--primary-color-light); TODO */
  padding: 6px;
  cursor: pointer;
}

.zw-textblock-ref.closable {
  /* background-color: var(--primary-color); TODO */
}

.zw-textblock-ref .icon {
  color: var(--primary-color);
}

.zw-textblock-ref.closable .icon,
.zw-textblock-ref.closable .textblock {
  color: black !important;
}

.zw-textblock-ref .close-button {
  font-size: 18px;
  margin-left: 6px;
}

.zw-textblock-ref .close-button > i {
  vertical-align: text-bottom;
}
</style>
