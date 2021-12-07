<template>
  <div class="zw-comment" :data-id="comment.id">
    <div class="field-label">{{date}}</div>
    <zw-comment-ref :comment="refComment" @comment-ref-click="commentRefClick"></zw-comment-ref>
    <zw-document-ref :document="refDocument"></zw-document-ref>
    <div class="columns">
      <div v-html="this[origLang]"></div>
      <div v-html="this[translatedLang]"></div>
    </div>
    <div class="button-panel">
      <el-button type="text" @click="reply">Reply</el-button>
      <el-button type="text">Edit</el-button>
      <el-button type="text">Delete</el-button>
    </div>
  </div>
</template>

<script>
// import dmx from 'dmx-api'

export default {

  created () {
    // console.log(this.comment)
  },

  props: {
    comment: {
      type: Object,     // the Comment topic to render (plain Object, not a dmx.Topic)
      required: true
    }
  },

  computed: {

    de () {
      return this.comment.children['zukunftswerk.comment.de'].value
    },

    fr () {
      return this.comment.children['zukunftswerk.comment.fr'].value
    },

    origLang () {
      return this.comment.children['zukunftswerk.language#zukunftswerk.original_language'].value
    },

    translatedLang () {
      if (this.origLang === 'de') {
        return 'fr'
      } else if (this.origLang === 'fr') {
        return 'de'
      }
    },

    refComment () {
      return this.comment.children['zukunftswerk.comment']
    },

    refDocument () {
      return this.comment.children['zukunftswerk.document']
    },

    lang () {
      return this.$store.state.lang
    },

    created () {
      return this.comment.children['dmx.timestamps.created'].value
    },

    date () {
      return new Date(this.created).toLocaleString()
    }
  },

  methods: {

    reply () {
      this.$emit('reply', this.comment)
    },

    commentRefClick (comment) {
      this.$emit('comment-ref-click', comment)
    }
  }
}
</script>

<style>
.zw-comment .zw-comment-ref,
.zw-comment .zw-document-ref {
  margin-bottom: 6px;
}

.zw-comment .columns {
  display: flex;
  column-gap: 12px;
}

.zw-comment .columns > div {
  flex-basis: 50%;
  padding: 0 6px;
  background-color: white;
}

.zw-comment .button-panel {
  text-align: right;
  visibility: hidden;
}

.zw-comment:hover .button-panel {
  visibility: visible;
}
</style>
