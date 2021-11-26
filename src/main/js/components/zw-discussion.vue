<template>
  <div class="zw-discussion" :style="style">
    <el-button v-if="!isOpen" class="open-button" type="text" icon="el-icon-chat-round" @click="open"></el-button>
    <template v-else>
      <el-button class="close-button" type="text" icon="el-icon-circle-close" @click="close"></el-button>
      <h4><zw-string>discussion.heading</zw-string></h4>
      <!-- Comments -->
      <div class="comments">
        <zw-comment v-for="comment in discussion" :comment="comment" :key="comment.id"></zw-comment>
      </div>
      <!-- New Comment -->
      <div class="new-comment" v-loading="submitting">
        <div class="field-label">
          <zw-string>discussion.new_comment</zw-string>
        </div>
        <div class="dmx-html-field">
          <quill v-model="newComment" :options="quillOptions" ref="newComment" @quill-ready="focus"></quill>
        </div>
        <el-button class="save-button" type="primary" size="medium" @click="save">
          <zw-string>global.save</zw-string>
        </el-button>
      </div>
    </template>
  </div>
</template>

<script>
export default {

  data () {
    return {
      newComment: '',         // new comment entered by the user
      submitting: false       // true while submitting new comment
    }
  },

  computed: {

    isOpen () {
      return this.$store.state.panelVisibility
    },

    discussion () {
      return this.$store.state.discussion
    },

    quillOptions () {
      return this.$store.state.quillOptions
    },

    style () {
      return this.isOpen ? {
        padding: '10px 0 10px 10px',
        'flex-basis': '35%'
      } : {
        padding: '6px'
      }
    }
  },

  methods: {

    open () {
      this.$store.dispatch('setPanelVisibility', true)
    },

    close () {
      this.$store.dispatch('setPanelVisibility', false)
    },

    save () {
      this.submitting = true
      this.$store.dispatch('createComment', this.newComment).then(() => {
        this.newComment = ''
        this.$refs.newComment.setHTML('')     // why does binding not work here?
        this.focus()
        this.submitting = false
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
  background-color: rgb(182, 216, 202);
  z-index: 1;
}

.zw-discussion .open-button {
  padding: 0;
  font-size: 24px;
}

.zw-discussion .close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 0;
  font-size: 24px;
}

.zw-discussion .save-button {
  margin-top: 6px;
}

.zw-discussion .comments {
  overflow: auto;
}

.zw-discussion .zw-comment {
  margin-top: 12px;
}

.zw-discussion .new-comment {
  margin-top: 24px;
}
</style>
