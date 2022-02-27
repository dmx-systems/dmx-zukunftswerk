<template>
  <div :class="['zw-comment', mode]" :data-id="topic.id" v-loading="saving">
    <div class="heading">
      <div>
        <span class="creator">{{creator}}</span><span class="date label">{{date}}</span>
      </div>
      <div class="button-panel" v-if="buttonPanelVisibility">
        <el-button class="fa fa-reply" type="text" @click="reply"></el-button>
        <el-dropdown v-if="commentIsWritable" size="medium" trigger="click" @command="handle">
          <el-button type="text" class="fa fa-ellipsis-v"></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="edit"><zw-string>action.edit</zw-string></el-dropdown-item>
            <el-dropdown-item command="deleteComment" divided><zw-string>action.delete</zw-string></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <zw-comment-ref :comment="refComment" @click="commentRefClick"></zw-comment-ref>
    <zw-document-ref :document="refDocument"></zw-document-ref>
    <div class="columns">
      <template v-if="infoMode">
        <div class="dmx-html-field info left" v-html="comment[origLang]"></div>
        <div class="dmx-html-field info right" v-html="comment[translatedLang]"></div>
      </template>
      <template v-else>
        <div class="dmx-html-field left">
          <quill v-model="commentModel[origLang]" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
        </div>
        <div class="dmx-html-field right">
          <quill v-model="commentModel[translatedLang]" :options="quillOptions"></quill>
        </div>
      </template>
    </div>
    <div class="attachments">
      <zw-attachment v-for="file in attachments" :file="file" :enabled="true" :key="file.id"></zw-attachment>
    </div>
    <template v-if="formMode">
      <el-button class="save-button" type="primary" size="medium" @click="save">
        <zw-string>action.submit</zw-string>
      </el-button>
      <el-button size="medium" @click="cancel">
        <zw-string>action.cancel</zw-string>
      </el-button>
    </template>
  </div>
</template>

<script>
export default {

  mixins: [
    require('./mixins/orig-lang').default,
  ],

  props: {
    topic: {                    // the Comment topic to render (plain Object, not a dmx.Topic ### FIXDOC?)
      type: Object,
      required: true
    }
  },

  data () {
    return {
      mode: 'info',             // 'info'/'form'
      topicBuffer: undefined,   // the edit buffer (dmx.Topic)
      saving: false             // true while comment is saved
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

    username () {
      return this.$store.state.username
    },

    isTeam () {
      return this.$store.state.isTeam
    },

    isWritable () {
      return this.$store.state.isWritable
    },

    commentIsWritable () {
      return this.isWritable && (this.username === this.creator || this.isTeam)
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
      return this.$store.state.quillOptions2
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

    cancel () {
      this.mode = 'info'
    },

    reply () {
      this.$emit('reply', this.topic)
    },

    handle (command) {
      this[command]()
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
  background-color: white;
  padding: 12px;
  border-radius: 10px;
}

.zw-comment .heading {
  display: flex;
  margin-bottom: 10px;
}

.zw-comment .heading > div:first-child {
  flex-grow: 1;
}

.zw-comment .heading .creator {
  font-size: var(--secondary-font-size);
  font-weight: bold;
}

.zw-comment .heading .date {
  margin-left: 15px;
}

.zw-comment .heading .button-panel {
  visibility: hidden;
}

.zw-comment:hover .heading .button-panel {
  visibility: visible;
}

.zw-comment .heading .button-panel .el-dropdown {
  margin-left: 6px;
}

.zw-comment .zw-comment-ref,
.zw-comment .zw-document-ref {
  margin-bottom: 15px;
}

.zw-comment .zw-attachment {
  margin-top: 6px;
}

.zw-comment .zw-attachment:first-child,
.zw-comment .save-button {
  margin-top: 15px;
}

.zw-comment .columns {
  display: flex;
}

.zw-comment .columns > div {
  flex-basis: 50%;
}

.zw-comment .columns > .left {
  border-right: 1px dashed #aaa;
}

.zw-comment.info .columns > .left {
  padding-right: 15px;
}

.zw-comment.info .columns > .right {
  padding-left: 15px;
}

.zw-comment .columns > .left .ql-editor {
  padding: 0 15px 0 0 !important;
}

.zw-comment .columns > .right .ql-editor {
  padding: 0 0 0 15px !important;
}

.zw-comment .columns.glow {
  animation: glow var(--glow-duration);
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
