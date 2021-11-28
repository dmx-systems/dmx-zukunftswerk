<template>
  <div class="zw-comment">
    <div class="field-label">{{date}}</div>
    <el-button class="comment-ref-button" v-if="commentRef" type="text">
      <span class="fa fa-comment"></span>
      <zw-truncate :html="commentRef[lang]"></zw-truncate>
    </el-button>
    <div class="columns">
      <div v-html="this[origLang]"></div>
      <div v-html="this[translatedLang]"></div>
    </div>
    <div class="button-panel">
      <el-button type="text">Reply</el-button>
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
    comment: Object
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

    commentRef () {
      const commentRef = this.comment.children['zukunftswerk.comment']
      if (commentRef) {
        return {
          de: commentRef.children['zukunftswerk.comment.de'].value,
          fr: commentRef.children['zukunftswerk.comment.fr'].value
        }
      }
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
  }
}
</script>

<style>
.zw-comment {
  background-color: white;
}

.zw-comment .comment-ref-button {
  white-space: unset;     /* Element UI default is "nowrap" */
  text-align: unset;      /* Element UI default is "center" */
}

.zw-comment .columns {
  display: flex;
  column-gap: 12px;
}

.zw-comment .columns > div {
  flex-basis: 50%;
  padding: 0 6px;
}

.zw-comment .button-panel {
  text-align: right;
  visibility: hidden;
}

.zw-comment:hover .button-panel {
  visibility: visible;
}
</style>
