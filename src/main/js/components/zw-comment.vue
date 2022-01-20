<template>
  <div class="zw-comment" :data-id="comment.id">
    <div class="field-label">{{date}} ({{creator}})</div>
    <zw-comment-ref :comment="refComment" @click="commentRefClick"></zw-comment-ref>
    <zw-document-ref :document="refDocument"></zw-document-ref>
    <div class="columns">
      <div v-html="html[origLang]"></div>
      <div v-html="html[translatedLang]"></div>
    </div>
    <div class="button-panel" v-if="isWritable">
      <el-button type="text" @click="reply"><zw-string>button.reply</zw-string></el-button>
      <el-button type="text"><zw-string>button.edit</zw-string></el-button>
      <el-button type="text"><zw-string>button.delete</zw-string></el-button>
    </div>
    <div class="attachments">
      <div v-for="file in attachments" :key="file.id">
        <zw-attachment :file="file" :enabled="true"></zw-attachment>
      </div>
    </div>
  </div>
</template>

<script>
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

    html () {
      return {
        de: this.comment.children['zukunftswerk.comment.de'].value,
        fr: this.comment.children['zukunftswerk.comment.fr'].value
      }
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

    attachments () {
      return this.comment.children['dmx.files.file#zukunftswerk.attachment']
    },

    isWritable () {
      return this.$store.state.isWritable
    },

    lang () {
      return this.$store.state.lang
    },

    created () {
      return this.comment.children['dmx.timestamps.created'].value
    },

    creator () {
      return this.comment.children['dmx.accesscontrol.creator'].value
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

.zw-comment {
  position: relative;
}

.zw-comment .zw-comment-ref,
.zw-comment .zw-document-ref {
  margin-bottom: 6px;
}

.zw-comment .zw-attachment {
  margin-top: 6px;
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

.zw-comment .columns > div.glow {
  animation: glow var(--glow-duration);
}

.zw-comment .button-panel {
  position: absolute;
  right: 0;
  visibility: hidden;
  z-index: 1;   /* place button panel _before_ attachments */
}

.zw-comment:hover .button-panel {
  visibility: visible;
}

@keyframes glow {
  0% {
    background-color: var(--highlight-color);
  },
  100% {
    background-color: white;
  }
}
</style>
