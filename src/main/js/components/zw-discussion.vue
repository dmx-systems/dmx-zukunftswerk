<template>
  <div class="zw-discussion" :style="style">
    <el-button v-if="!isOpen" class="open-button" type="text" icon="el-icon-chat-round" @click="open"></el-button>
    <template v-else>
      <el-button class="close-button" type="text" icon="el-icon-circle-close" @click="close"></el-button>
      <h4><zw-string>discussion.heading</zw-string></h4>
      <!-- Comments -->
      <div class="comments">
        <zw-comment v-for="comment in discussion" :comment="comment" :key="comment.id" @reply="reply"
          @comment-ref-click="jumpTo">
        </zw-comment>
      </div>
      <!-- New Comment -->
      <div class="new-comment" v-loading="submitting">
        <div class="field-label">
          <zw-string>discussion.new_comment</zw-string>
        </div>
        <zw-comment-ref :comment="refComment" @comment-ref-click="jumpTo"></zw-comment-ref>
        <zw-document-ref :document="refDocument"></zw-document-ref>
        <div class="dmx-html-field">
          <quill v-model="newComment" :options="quillOptions" ref="newComment" @quill-ready="focus"></quill>
        </div>
        <div class="button-panel">
          <el-button type="text" @click="openUploadDialog">Attach Files</el-button>
        </div>
        <div class="attachments">
          <div v-for="file in attachments" :key="file.id">
            <zw-attachment :file="file"></zw-attachment>
          </div>
        </div>
        <el-button class="submit-button" type="primary" size="medium" @click="submit">
          <zw-string>global.submit</zw-string>
        </el-button>
      </div>
    </template>
    <zw-upload-dialog :visible="uploadDialogVisible" @attach="attach" @close="closeUploadDialog"></zw-upload-dialog>
    <zw-download-iframe></zw-download-iframe>
  </div>
</template>

<script>
export default {

  data () {
    return {
      newComment: '',                 // new comment being entered by the user
      refComment: undefined,          // comment the new comment relates to (a Comment topic, plain object)
      attachments: [],                // attachments for the new comment (array of File topics)
      uploadDialogVisible: false,     // upload dialog visibility (for comment attachments)
      submitting: false               // true while submitting new comment
    }
  },

  computed: {

    isOpen () {
      return this.$store.state.panelVisibility
    },

    discussion () {
      return this.$store.state.discussion
    },

    style () {
      return this.isOpen ? {
        padding: '10px 0 10px 10px',
        'flex-grow': 1
      } : {
        padding: '5px',
        width: 'auto'
      }
    },

    refTopicId () {
      if (this.refComment) {
        return this.refComment.id
      } else if (this.refDocument) {
        return this.refDocument.id
      }
    },

    refDocument () {
      return this.$store.state.refDocument
    },

    fileTopicIds () {
      return this.attachments.map(file => file.id)
    },

    quillOptions () {
      return this.$store.state.quillOptions
    }
  },

  methods: {

    open () {
      this.$store.dispatch('setPanelVisibility', true)
    },

    close () {
      this.$store.dispatch('setPanelVisibility', false)
    },

    submit () {
      this.submitting = true
      this.$store.dispatch('createComment', {
        comment: this.newComment,
        refTopicId: this.refTopicId,
        fileTopicIds: this.fileTopicIds
      }).then(comment => {
        this.newComment = ''
        this.$refs.newComment.setHTML('')     // why does binding not work here?
        this.refComment = undefined
        this.attachments = []
        this.submitting = false
        this.jumpTo(comment)
        this.focus()
      })
    },

    reply (comment) {
      this.refComment = comment
    },

    jumpTo (comment) {
      document.querySelector(`.zw-discussion .zw-comment[data-id="${comment.id}"]`).scrollIntoView({
        behavior: 'smooth'
      })
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

    attach (file) {
      this.attachments.push(file)
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
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  background-color: rgb(182, 216, 202);
  z-index: 1;
}

.zw-discussion .open-button {
  font-size: 24px;
}

.zw-discussion .close-button {
  position: absolute;
  top: 5px;
  right: 4px;
  font-size: 24px;
}

.zw-discussion .submit-button {
  margin-top: 6px;
}

.zw-discussion .comments {
  overflow: auto;
}

.zw-discussion .comments .zw-comment + .zw-comment {
  margin-top: 20px;
}

.zw-discussion .new-comment {
  margin-top: 20px;
}

.zw-discussion .new-comment .zw-comment-ref,
.zw-discussion .new-comment .zw-document-ref {
  margin-bottom: 6px;
}

.zw-discussion .new-comment .zw-attachment {
  margin-top: 6px;
}

.zw-discussion .new-comment .button-panel {
  position: absolute;
  right: 0;
  visibility: hidden;
}

.zw-discussion .new-comment:hover .button-panel {
  visibility: visible;
}
</style>
