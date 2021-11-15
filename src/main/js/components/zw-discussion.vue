<template>
  <div class="zw-discussion" :style="style">
    <el-button v-if="isClosed" class="open-button" type="text" icon="el-icon-chat-round" @click="open"></el-button>
    <template v-else>
      <el-button class="close-button" type="text" icon="el-icon-circle-close" @click="close"></el-button>
      <h4 v-if="documentMode">Document discussion</h4>
      <h4 v-if="workspaceMode">Workspace discussion</h4>
      <!-- Comments -->
      <zw-comment v-for="comment in discussion" :comment="comment" :key="comment.id"></zw-comment>
      <!-- New Comment -->
      <div class="new-comment dmx-html-field">
        New comment
        <quill v-model="newComment" :options="quillOptions" ref="newComment" @quill-ready="focus"></quill>
      </div>
      <el-button class="save-button" type="primary" @click="save">Save</el-button>
    </template>
  </div>
</template>

<script>
export default {

  data () {
    return {
      newComment: ''
    }
  },

  computed: {

    discussionMode () {
      return this.$store.state.discussionMode
    },

    discussion () {
      return this.$store.state.discussion
    },

    isClosed () {
      return !this.discussionMode
    },

    documentMode () {
      return this.discussionMode === 'document'
    },

    workspaceMode () {
      return this.discussionMode === 'workspace'
    },

    targetId () {
      return this.$store.getters.targetId
    },

    quillOptions () {
      return this.$store.state.quillOptions
    },

    style () {
      return this.isClosed ? {} : {'flex-basis': '30%'}
    }
  },

  methods: {

    open () {
      this.$store.dispatch('setDiscussionMode', 'workspace')
    },

    close () {
      this.$store.dispatch('setDiscussionMode', undefined)
    },

    save () {
      this.$store.dispatch('addComment', {
        comment: this.newComment,
        targetTopicId: this.targetId
      })
      this.newComment = ''
      this.$refs.newComment.setHTML('')     // why does binding not work here?
      this.focus()
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
  position: relative;
  overflow: auto;
  padding: 0 6px;
  background-color: rgb(182, 216, 202);
  z-index: 1;
}

.zw-discussion .open-button {
  font-size: 24px;
}

.zw-discussion .close-button {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 0;
  font-size: 24px;
}

.zw-discussion .save-button {
  margin-top: 6px;
}

.zw-discussion .zw-comment {
  margin-top: 12px;
}

.zw-discussion .new-comment {
  margin-top: 24px;
}
</style>
