<template>
  <div :class="['zw-discussion', panelVisibility ? 'open' : 'close']">
    <el-button v-if="!panelVisibility" class="open-button" type="text" icon="el-icon-d-arrow-left" @click="open">
    </el-button>
    <template v-else>
      <el-button class="close-button" type="text" icon="el-icon-d-arrow-right" @click="close"></el-button>
      <zw-string class="heading">label.discussion</zw-string>
      <!-- Filter -->
      <div class="filter-container" v-if="documentFilter || textblockFilter">
        <div class="filter" v-if="documentFilter" key="document-filter">
          <zw-string>label.document_filter</zw-string>
          <el-button class="close-button" type="text" icon="el-icon-close" @click="resetDocumentFilter"></el-button>
        </div>
        <div class="filter" v-if="textblockFilter" key="textblock-filter">
          <zw-string>label.textblock_filter</zw-string>
          <el-button class="close-button" type="text" icon="el-icon-close" @click="resetTextblockFilter"></el-button>
        </div>
      </div>
      <!-- Comments -->
      <div v-if="noComments" class="secondary"><zw-string>label.no_comments</zw-string></div>
      <div v-else class="comments" v-loading="discussionLoading">
        <zw-comment v-for="comment in filteredDiscussion" :topic="comment" :key="comment.id" @reply="reply"
          @comment-ref-click="jumpTo">
        </zw-comment>
      </div>
      <!-- New comment -->
      <div class="new-comment-container" v-if="isWritable" v-loading="submitting">
        <div class="new-comment">
          <zw-comment-ref :comment="refComment" :closable="true" @click="jumpTo" @remove="removeCommentRef">
          </zw-comment-ref>
          <zw-document-ref :document="documentFilter" :closable="true"></zw-document-ref>
          <zw-textblock-ref :topic="textblockFilter" :closable="true"></zw-textblock-ref>
          <div class="editor-container dmx-html-field">
            <quill v-model="newComment" :options="quillOptions" ref="newComment" @quill-ready="focus"></quill>
            <el-button class="attach-button" type="text" icon="el-icon-paperclip" :title="attachTooltip"
              @click="openUploadDialog">
            </el-button>
          </div>
          <div class="attachments">
            <zw-attachment v-for="file in attachments" :file="file" :closable="true" :key="file.id"
              @remove="removeAttachment">
            </zw-attachment>
          </div>
        </div>
        <el-button class="submit-button" type="text" icon="el-icon-s-promotion" size="medium" @click="createComment">
        </el-button>
      </div>
    </template>
    <zw-upload-dialog :visible="uploadDialogVisible" @attach="attach" @close="closeUploadDialog"></zw-upload-dialog>
    <zw-download-iframe></zw-download-iframe>
  </div>
</template>

<script>
import zw from '../zw-globals'
import errorHandler from '../error-handler'

export default {

  mixins: [
    require('./mixins/error-handling').default
  ],

  data () {
    return {
      newComment: '',                 // new comment being entered by the user (String)
      refComment: undefined,          // comment the new comment relates to (a Comment topic, plain object)
      attachments: [],                // attachments for the new comment (array of File topics)
      uploadDialogVisible: false,     // upload dialog visibility (for comment attachments)
      submitting: false,              // true while submitting new comment
      quillOptions: {                 // options for new-comment quill editor
        placeholder: zw.getString('label.new_comment'),     // FIXME: once Quill instance is created
        ...zw.quillOptions2                                 // ... placeholder is not lang-reactive
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

    discussionLoading () {
      return this.$store.state.discussionLoading
    },

    filteredDiscussion () {
      return this.discussion?.filter(
        comment => (!this.documentFilter  || this.getDocumentId(comment)  === this.documentFilter.id) &&
                   (!this.textblockFilter || this.getTextblockId(comment) === this.textblockFilter.id)
      )
    },

    noComments () {
      return this.filteredDiscussion?.length === 0
    },

    refTopicIds () {
      const ids = []
      this.refComment && ids.push(this.refComment.id)
      this.documentFilter  && ids.push(this.documentFilter.id)
      this.textblockFilter && ids.push(this.textblockFilter.id)
      return ids
    },

    documentFilter () {
      return this.$store.state.documentFilter
    },

    textblockFilter () {
      return this.$store.state.textblockFilter
    },

    lang () {
      return this.$store.state.lang
    },

    fileTopicIds () {
      return this.attachments.map(file => file.id)
    },

    attachTooltip () {
      return zw.getString('tooltip.attach')
    }
  },

  watch: {

    lang () {
      this.$store.dispatch('updatePlaceholder')
    },

    panelVisibility () {this.scrollDown()},
    discussion ()      {this.scrollDown()},
    documentFilter ()  {this.scrollDown()},
    textblockFilter () {this.scrollDown()}
  },

  methods: {

    open () {
      this.$store.dispatch('setPanelVisibility', true)
    },

    close () {
      this.$store.dispatch('setPanelVisibility', false)
    },

    resetDocumentFilter () {
      this.$store.dispatch('setDocumentFilter', undefined)
    },

    resetTextblockFilter () {
      this.$store.dispatch('setTextblockFilter', undefined)
    },

    createComment () {
      const commentModel = {
        comment: this.newComment,
        refTopicIds: this.refTopicIds,
        fileTopicIds: this.fileTopicIds
      }
      this.submitting = true
      this.$store.dispatch('createComment', commentModel).then(comment => {
        this.resetNewCommentPanel(comment)
      }).catch(error => {
        return this.handleError(error, 'confirm')
      }).then(result => {
        if (result === 'confirm') {
          commentModel.monolingual = true
          this.$store.dispatch('createComment', commentModel).then(comment => {
            this.resetNewCommentPanel(comment)
          }).catch(error => {
            errorHandler(error)     // generic error handler
          })
        }
      }).catch(result => {
        // console.log('cancel', result)
      }).finally(() => {
        this.submitting = false
        this.focus()
      })
    },

    resetNewCommentPanel (comment) {
      this.newComment = ''
      this.$refs.newComment.setHTML('')     // TODO: atm vue-quill-minimum does not react on model change
      this.refComment = undefined
      this.attachments = []
      this.jumpTo(comment, zw.isChrome ? 'auto' : undefined)
    },

    reply (comment) {
      this.refComment = comment
    },

    jumpTo (comment, behavior) {
      this.$store.dispatch('jumpToComment', {comment, behavior})
    },

    /**
     * Scrolls down to bottom of discussion.
     */
    scrollDown () {
      if (this.panelVisibility) {
        this.$nextTick(() => {
          // Note: if there are no comments the "comments" element does not exist
          document.querySelector('.zw-discussion .comments')?.scroll({
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
      return comment.children['zukunftswerk.document']?.id
    },

    getTextblockId (comment) {
      return comment.children['zukunftswerk.textblock']?.id
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
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  position: relative;         /* place close-button relative to this element */
  box-sizing: border-box;
  z-index: 1;
}

.zw-discussion.open {
  padding: 10px 0 10px 10px;
  flex-grow: 1;
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
  right: 6px;
  font-size: 30px;
}

.zw-discussion > .heading {
  font-size: 20px;
  margin-top: 14px;
  margin-bottom: 20px;
}

.zw-discussion .filter-container {
  margin-bottom: 32px;
  margin-right: 10px;
}

.zw-discussion .filter {
  display: inline-block;
  background-color: var(--primary-color);
  padding: 5px 8px;
}

.zw-discussion .filter .zw-string {
  font-size: 15px;
}

.zw-discussion .filter .close-button {
  font-size: 20px;
  margin-left: 6px;
}

.zw-discussion .filter .close-button > i {
  vertical-align: text-bottom;
}

.zw-discussion .comments {
  overflow: auto;
  position: relative;     /* scroll absolute positioned childs along, e.g. the "Translate" button */
  min-height: 72px;       /* corresponds to effective comment min-height */
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
  font-style: unset;
  left: unset;
  right: unset;
}

.zw-discussion .new-comment .zw-comment-target-ref {
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
  margin: 0 10px 7px 10px;
}
</style>
