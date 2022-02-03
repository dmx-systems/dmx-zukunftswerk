<template>
  <div :class="['zw-comment', mode]" :data-id="topic.id" v-loading="saving">
    <div class="field-label">{{date}} ({{creator}})</div>
    <zw-comment-ref :comment="refComment" @click="commentRefClick"></zw-comment-ref>
    <zw-document-ref :document="refDocument"></zw-document-ref>
    <div class="columns">
      <template v-if="infoMode">
        <div v-html="comment[origLang]"></div>
        <div v-html="comment[translatedLang]"></div>
      </template>
      <template v-else>
        <div class="dmx-html-field">
          <quill v-model="commentModel[origLang]" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
        </div>
        <div class="dmx-html-field">
          <quill v-model="commentModel[translatedLang]" :options="quillOptions"></quill>
        </div>
      </template>
    </div>
    <el-button class="save-button" v-if="formMode" type="primary" size="medium" @click="save">
      <zw-string>button.submit</zw-string>
    </el-button>
    <div class="button-panel" v-if="buttonPanelVisibility">
      <el-button type="text" @click="reply"><zw-string>button.reply</zw-string></el-button>
      <el-button type="text" @click="edit"><zw-string>button.edit</zw-string></el-button>
      <el-button type="text" @click="deleteComment"><zw-string>button.delete</zw-string></el-button>
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

  mixins: [
    require('./mixins/orig-lang').default,
  ],

  data () {
    return {
      mode: 'info',             // 'info'/'form'
      topicBuffer: undefined,   // the edit buffer (dmx.Topic)
      saving: false             // true while comment is saved
    }
  },

  props: {
    topic: {                    // the Comment topic to render (plain Object, not a dmx.Topic)
      type: Object,
      required: true
    }
  },

  computed: {

    comment () {
      return {
        de: this.topic.children['zukunftswerk.comment.de'].value,
        fr: this.topic.children['zukunftswerk.comment.fr'].value
      }
    },

    commentModel () {
      return {
        de: this.topicBuffer.children['zukunftswerk.comment.de'].value,
        fr: this.topicBuffer.children['zukunftswerk.comment.fr'].value
      }
    },

    buttonPanelVisibility () {
      return this.infoMode && this.isWritable
    },

    refComment () {
      return this.topic.children['zukunftswerk.comment']
    },

    refDocument () {
      return this.topic.children['zukunftswerk.document']
    },

    attachments () {
      return this.topic.children['dmx.files.file#zukunftswerk.attachment']
    },

    isWritable () {
      return this.$store.state.isWritable
    },

    lang () {
      return this.$store.state.lang
    },

    created () {
      return this.topic.children['dmx.timestamps.created'].value
    },

    creator () {
      return this.topic.children['dmx.accesscontrol.creator'].value
    },

    date () {
      return new Date(this.created).toLocaleString()
    },

    infoMode () {
      return this.mode === 'info'
    },

    formMode () {
      return this.mode === 'form'
    },

    quillOptions () {
      return this.$store.state.quillOptions
    }
  },

  methods: {

    focus () {
      this.$refs.quill.focus()
    },

    save () {
      this.saving = true
      // transfer edit buffer to topic model
      this.setComment('de')
      this.setComment('fr')
      //
      this.$store.dispatch('updateComment', this.topic).then(() => {
        this.mode = 'info'
        this.saving = false
      })
    },

    reply () {
      this.$emit('reply', this.topic)
    },

    edit () {
      this.mode = 'form'
      this.topicBuffer = this.topic.clone()
    },

    // Note: can't be named "delete"
    deleteComment () {
      this.$store.dispatch('deleteComment', this.topic)
    },

    commentRefClick (comment) {
      this.$emit('comment-ref-click', comment)
    },

    setComment (lang) {
      const compDefUri = 'zukunftswerk.comment.' + lang
      this.topic.children[compDefUri].value = this.commentModel[lang]
    }
  },

  components: {
    quill: () => ({
      component: import('vue-quill-minimum' /* webpackChunkName: "vue-quill-minimum" */),
      loading: require('./zw-spinner')
    })
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
}

.zw-comment.info .columns > div {
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
