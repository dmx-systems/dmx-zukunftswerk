<template>
  <div :class="['zw-comment', mode]" :data-id="topic.id" v-loading="saving">
    <!-- Heading -->
    <div class="heading">
      <div>
        <span class="creator" :title="emailAddress">{{displayName}}</span>
        <span class="date label">{{date}}</span>
        <span :class="['translation-info', 'label', translationMode]">
          (<zw-string>label.translation</zw-string>: {{translationInfo}})
        </span>
      </div>
      <div class="button-panel" v-if="buttonPanelVisibility">
        <el-button class="fa fa-reply" type="text" :title="replyTooltip" @click="reply"></el-button>
        <el-dropdown v-if="commentIsWritable" size="medium" trigger="click" @command="handle">
          <el-button type="text" class="fa fa-fw fa-ellipsis-v"></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="edit"><zw-string>action.edit</zw-string></el-dropdown-item>
            <el-dropdown-item command="deleteComment" divided><zw-string>action.delete</zw-string></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!-- Refs -->
    <zw-comment-ref :comment="refComment" @click="commentRefClick"></zw-comment-ref>
    <zw-document-ref :document="refDocument"></zw-document-ref>
    <zw-textblock-ref :topic="refTextblock"></zw-textblock-ref>
    <!-- Content -->
    <div class="columns">
      <template v-if="infoMode">
        <div class="dmx-html-field info text1" v-html="comment[lang1]"></div>
        <div class="dmx-html-field info text2" v-html="comment[lang2]"></div>
      </template>
      <template v-else>
        <div class="dmx-html-field text1">
          <quill v-model="model[lang1].value" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
        </div>
        <el-button class="translate-button" type="text" icon="el-icon-right" :title="translateTooltip"
          @click="doTranslate">
        </el-button>
        <div class="dmx-html-field text2">
          <quill v-model="model[lang2].value" :options="quillOptions" ref="translation" v-loading="translating"></quill>
        </div>
      </template>
    </div>
    <!-- Attachments -->
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
import Vue from 'vue'
import zw from '../zw-globals'

export default {

  mixins: [
    require('./mixins/mode').default,
    require('./mixins/translation').default
  ],

  props: {
    topic: {                    // the Comment topic to render (plain Object, not a dmx.Topic ### FIXDOC?)
      type: Object,
      required: true
    }
  },

  data () {
    return {
      type: 'zukunftswerk.comment',
      mode: 'info',             // 'info'/'form'
      topicBuffer: undefined,   // the edit buffer (dmx.Topic)
      saving: false             // true while comment is saved
    }
  },

  computed: {

    comment () {
      return {
        // Note: in a monolingual comment "fr" is not defined.
        // "de" on the other is expected to be always defined, but ZW dev-data are corrupt.
        de: this.topic.children['zukunftswerk.comment.de']?.value,
        fr: this.topic.children['zukunftswerk.comment.fr']?.value
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

    refTextblock () {
      return this.topic.children['zukunftswerk.textblock']
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

    isEditor () {
      return this.$store.state.isEditor
    },

    isWritable () {
      return this.$store.state.isWritable
    },

    commentIsWritable () {
      return this.isWritable && (this.username === this.creator || this.isTeam)
    },

    created () {
      return this.topic.children['dmx.timestamps.created'].value
    },

    creator () {
      return this.topic.children['dmx.accesscontrol.creator'].value
    },

    displayName () {
      return zw.getDisplayName(this.creator)
    },

    emailAddress () {
      return zw.getShowEmailAddress(this.creator) && this.creator
    },

    date () {
      return new Date(this.created).toLocaleString()
    },

    translationMode () {
      if (this.infoMode) {
        const topic = this.topic.children['zukunftswerk.comment.' + this.lang2]
        if (!topic || topic.value === '<p><br></p>') {
          return 'none'
        } else {
          return this.translationEdited ? 'edited' : 'automatic'
        }
      } else {
        const buffer = this.model[this.lang2].value
        if (!buffer || buffer === '<p><br></p>') {
          return 'none'
        } else {
          return this.editedFlag ? 'edited' : 'automatic'
        }
      }
    },

    translationInfo () {
      return zw.getString('label.' + this.translationMode)
    },

    quillOptions () {
      return zw.quillOptions2
    },

    replyTooltip () {
      return zw.getString('tooltip.reply')
    }
  },

  methods: {

    focus () {
      this.$refs.quill.focus()
    },

    save () {
      this.saving = true
      // transfer edit buffer to topic model
      this.topic.children['zukunftswerk.translation_edited'] = {value: this.editedFlag}
      this.topic.children['zukunftswerk.comment.de'] = this.model.de
      this.topic.children['zukunftswerk.comment.fr'] = this.model.fr
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
      // Note 1: in a monolingual comment "fr" is not defined. We meed it as editor model.
      // Note 2: we can't use newFormModel() as Comment is a recursive type definition.
      // Note 3: we need Vue.set() as topic clone is put into state already.
      if (!this.topicBuffer.children['zukunftswerk.comment.fr']) {
        Vue.set(this.topicBuffer.children, 'zukunftswerk.comment.fr', {value: ''})
      }
      this.$nextTick(() => {
        this.$store.dispatch('jumpToComment', {
          comment: this.topic,
          behavior: zw.isChrome ? 'auto' : undefined,
          glow: false
        })
      })
    },

    doTranslate () {
      this.translate().then(translation => {
        // Note: in case of translation error 'confirm' is passed (String)
        if (translation instanceof Object) {
          this.$refs.translation.setHTML(translation.text) // TODO: atm vue-quill-minimum does not react on model change
        }
      })
    },

    // Note: can't be named "delete"
    deleteComment () {
      this.$store.dispatch('deleteComment', this.topic)
    },

    commentRefClick (comment) {
      this.$emit('comment-ref-click', comment)
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

.zw-comment .heading .date,
.zw-comment .heading .translation-info {
  margin-left: 12px;
}

.zw-comment.form .heading .translation-info.edited {
  background-color: var(--primary-color-light);
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

.zw-comment .zw-comment-target-ref {
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

.zw-comment .columns > .text1 {
  border-right: 1px dashed #aaa;
}

.zw-comment.form .columns > .text2 {
  border-left: 1px dashed #aaa;
}

.zw-comment.info .columns > .text1 {
  padding-right: 15px;
}

.zw-comment.info .columns > .text2 {
  padding-left: 15px;
}

.zw-comment .columns > .text1 .ql-editor {
  padding: 0 15px 0 0 !important;
}

.zw-comment .columns > .text2 .ql-editor {
  padding: 0 0 0 15px !important;
}

.zw-comment .columns > .translate-button {
  font-size: 18px;
  margin: 0 6px;
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
