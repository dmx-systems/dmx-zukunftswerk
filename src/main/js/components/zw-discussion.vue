<template>
  <div class="zw-discussion" :style="style">
    <el-button v-if="!isOpen" class="open-button" type="text" icon="el-icon-chat-round" @click="open"></el-button>
    <template v-else>
      <el-button class="close-button" type="text" icon="el-icon-circle-close" @click="close"></el-button>
      <h4><zw-string>discussion.heading</zw-string></h4>
      <!-- Comments -->
      <div class="comments">
        <zw-comment v-for="comment in discussion" :comment="comment" :key="comment.id" @reply="reply"
          @comment-ref-click="jump">
        </zw-comment>
      </div>
      <!-- New Comment -->
      <div class="new-comment" v-loading="submitting">
        <div class="field-label">
          <zw-string>discussion.new_comment</zw-string>
        </div>
        <zw-comment-ref :comment="refComment" @comment-ref-click="jump"></zw-comment-ref>
        <zw-document-ref :document="refDocument"></zw-document-ref>
        <div class="dmx-html-field">
          <quill v-model="newComment" :options="quillOptions" ref="newComment" @quill-ready="focus"></quill>
        </div>
        <el-button class="submit-button" type="primary" size="medium" @click="submit">
          <zw-string>global.submit</zw-string>
        </el-button>
      </div>
    </template>
  </div>
</template>

<script>
export default {

  data () {
    return {
      newComment: '',             // new comment entered by the user
      refComment: undefined,      // comment the new comment relates to (a Comment topic, plain object)
      submitting: false           // true while submitting new comment
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
        refTopicId: this.refTopicId
      }).then(() => {
        this.newComment = ''
        this.$refs.newComment.setHTML('')     // why does binding not work here?
        this.refComment = undefined
        this.submitting = false
        this.focus()
      })
    },

    reply (comment) {
      this.refComment = comment
    },

    jump (comment) {
      document.querySelector(`.zw-discussion .zw-comment[data-id="${comment.id}"]`).scrollIntoView({
        behavior: 'smooth'
      })
    },

    focus () {
      this.$refs.newComment.focus()
    }
  },

  components: {
    'zw-comment': require('./zw-comment').default,
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

.zw-discussion .new-comment {
  margin-top: 18px;
}

.zw-discussion .new-comment .zw-comment-ref,
.zw-discussion .new-comment .zw-document-ref {
  margin-bottom: 6px;
}
</style>
