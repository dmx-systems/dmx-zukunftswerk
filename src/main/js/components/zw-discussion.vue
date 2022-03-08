<template>
  <div :class="['zw-discussion', panelVisibility ? 'open' : 'close']">
    <el-button v-if="!panelVisibility" class="open-button" type="text" icon="el-icon-d-arrow-left" @click="open">
    </el-button>
    <template v-else>
      <el-button class="close-button" type="text" icon="el-icon-d-arrow-right" @click="close"></el-button>
      <zw-string class="heading">label.discussion</zw-string>
      <div class="doc-filter" v-if="refDocument">
        <zw-string>label.document_filter</zw-string>
        <zw-document-ref :document="refDocument" :closable="true"></zw-document-ref>
      </div>
      <!-- Comments -->
      <div class="comments">
        <zw-comment v-for="comment in filteredDiscussion" :topic="comment" :key="comment.id" @reply="reply"
          @comment-ref-click="jumpTo">
        </zw-comment>
      </div>
      <!-- New-Comment panel -->
      <div class="new-comment-container">
        <div class="new-comment" v-if="isWritable" v-loading="submitting">
          <zw-comment-ref :comment="refComment" :closable="true" @click="jumpTo" @remove="removeCommentRef">
          </zw-comment-ref>
          <zw-document-ref :document="refDocument" :closable="true"></zw-document-ref>
          <div class="editor-container dmx-html-field">
            <quill v-model="newComment" :options="quillOptions" ref="newComment" @quill-ready="focus"></quill>
            <el-button class="attach-button" type="text" icon="el-icon-paperclip" :title="attachButtonTitle"
              @click="openUploadDialog">
            </el-button>
          </div>
          <div class="attachments">
            <zw-attachment v-for="file in attachments" :file="file" :closable="true" :key="file.id"
              @remove="removeAttachment">
            </zw-attachment>
          </div>
        </div>
        <el-button class="submit-button" type="text" icon="el-icon-circle-plus" size="medium" @click="createComment">
        </el-button>
      </div>
    </template>
    <zw-upload-dialog :visible="uploadDialogVisible" @attach="attach" @close="closeUploadDialog"></zw-upload-dialog>
    <zw-download-iframe></zw-download-iframe>
  </div>
</template>

<script>
const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
console.log('[ZW] isChrome', isChrome)

export default {

  data () {
    return {
      newComment: '',                 // new comment being entered by the user
      refComment: undefined,          // comment the new comment relates to (a Comment topic, plain object)
      attachments: [],                // attachments for the new comment (array of File topics)
      uploadDialogVisible: false,     // upload dialog visibility (for comment attachments)
      submitting: false,              // true while submitting new comment
      quillOptions: {                 // options for new-comment quill editor
        placeholder: this.$store.state.getString('label.new_comment'),
        ...this.$store.state.quillOptions
      }
    }
  },

  computed: {

    isWritable () {
      return this.$store.state.isWritable
    },

    panelVisibility () {
      return this.$store.state.panelVisibility
    },

    discussion () {
      return this.$store.state.discussion
    },

    filteredDiscussion () {
      return this.discussion && this.discussion.filter(
        comment => !this.refDocument || this.getDocumentId(comment) === this.refDocument.id
      )
    },

    refTopicIds () {
      const ids = []
      if (this.refComment) {
        ids.push(this.refComment.id)
      }
      if (this.refDocument) {
        ids.push(this.refDocument.id)
      }
      return ids
    },

    refDocument () {
      return this.$store.state.refDocument
    },

    fileTopicIds () {
      return this.attachments.map(file => file.id)
    },

    attachButtonTitle () {
      return this.$store.state.getString('action.attach_files')
    }
  },

  watch: {
    panelVisibility () {
      this.scrollDown()
    },
    discussion () {
      this.scrollDown()
    },
    refDocument () {
      this.scrollDown()
    }
  },

  methods: {

    open () {
      this.$store.dispatch('setPanelVisibility', true)
    },

    close () {
      this.$store.dispatch('setPanelVisibility', false)
    },

    createComment () {
      this.submitting = true
      this.$store.dispatch('createComment', {
        comment: this.newComment,
        refTopicIds: this.refTopicIds,
        fileTopicIds: this.fileTopicIds
      }).then(comment => {
        this.newComment = ''
        this.$refs.newComment.setHTML('')     // why does binding not work here?
        this.refComment = undefined
        this.attachments = []
        this.jumpTo(comment, isChrome ? 'auto' : undefined)
      }).catch(() => {
        // silence browser console
      }).finally(() => {
        this.submitting = false
        this.focus()
      })
    },

    reply (comment) {
      this.refComment = comment
    },

    jumpTo (comment, behavior) {
      this.$store.dispatch('jumpToComment', {comment, behavior})
    },

    scrollDown () {
      if (this.panelVisibility) {
        this.$nextTick(() => {
          // scroll down to bottom of discussion
          document.querySelector('.zw-discussion .comments').scroll({
            top: 100000,
            behavior: 'smooth'
          })
        })
      }
    },

    removeCommentRef () {
      this.refComment = undefined
    },

    removeAttachment (file) {
      this.attachments = this.attachments.filter(f => f.id !== file.id)
    },

    attach (file) {
      this.attachments.push(file)
    },

    focus () {
      this.$refs.newComment.focus()
    },

    openUploadDialog () {
      this.uploadDialogVisible = true
    },

    closeUploadDialog () {
      this.uploadDialogVisible = false
    },

    getDocumentId (comment) {
      const doc = comment.children['zukunftswerk.document']
      return doc && doc.id
    }
  },

  components: {
    'zw-comment':         require('./zw-comment').default,
    'zw-upload-dialog':   require('./zw-upload-dialog').default,
    'zw-download-iframe': require('./zw-download-iframe').default,
    quill: () => ({
      component: import('vue-quill-minimum' /* webpackChunkName: "vue-quill-minimum" */),
      loading: require('./zw-spinner')
    })
  }
}
</script>

<style>
.zw-discussion {
  background-color: var(--discussion-color);
  display: flex;
  flex-direction: column;
  position: relative;         /* place close-button relative to this element */
  box-sizing: border-box;
  z-index: 1;
}

.zw-discussion.open {
  padding: 10px 0 10px 10px;
}

.zw-discussion.close {
  padding: 5px;
  width: auto !important;
}

.zw-discussion > .open-button {
  font-size: 30px;
}

.zw-discussion > .close-button {
  position: absolute;
  top: 6px;
  right: 0px;
  font-size: 30px;
}

.zw-discussion > .heading {
  font-size: 20px;
  font-weight: bold;
  margin-top: 14px;
  margin-bottom: 20px;
}

.zw-discussion .doc-filter {
  margin-right: 10px;
  margin-bottom: 32px;
}

.zw-discussion .doc-filter .zw-string {
  font-size: 20px;
  line-height: 32px;
  margin-right: 6px;
}

.zw-discussion .comments {
  overflow: auto;
}

.zw-discussion .comments .zw-comment {
  margin-right: 10px;
}

.zw-discussion .comments .zw-comment + .zw-comment {
  margin-top: 20px;
}

.zw-discussion .new-comment-container {
  display: flex;
  align-items: flex-end;
  margin-top: 20px;
}

.zw-discussion .new-comment {
  flex-grow: 1;
  background-color: white;
  padding: 12px;
  border-radius: 10px;
}

.zw-discussion .new-comment .editor-container {
  position: relative;
}

.zw-discussion .new-comment .ql-editor {
  max-height: 35vh;
  padding: 0 40px 0 0 !important;
}

.zw-discussion .new-comment .ql-editor.ql-blank::before {
  color: var(--secondary-color);
  font-style: unset;
  left: unset;
  right: unset;
}

.zw-discussion .new-comment .zw-comment-ref,
.zw-discussion .new-comment .zw-document-ref {
  margin-bottom: 15px;
}

.zw-discussion .new-comment .zw-attachment {
  margin-top: 6px;
}

.zw-discussion .new-comment .zw-attachment:first-child {
  margin-top: 15px;
}

.zw-discussion .new-comment .attach-button {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 20px;
}

.zw-discussion .new-comment-container .submit-button {
  font-size: 30px;
  margin: 0 10px 5px 10px;
}
</style>
