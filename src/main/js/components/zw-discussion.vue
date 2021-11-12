<template>
  <div class="zw-discussion" :style="style">
    <el-button v-if="isClosed" class="open-button" type="text" icon="el-icon-chat-round" @click="open"></el-button>
    <template v-else>
      <div v-if="documentMode">Document discussion</div>
      <div v-if="workspaceMode">Workspace discussion</div>
      <!-- Comments -->
      <zw-comment v-for="comment in discussion" :comment="comment" :key="comment.id"></zw-comment>
      <!-- New Comment -->
      <div class="new-comment">
        <div>
          <div>de</div>
          <div class="dmx-html-field">
            <quill v-model="newComment.de" :options="quillOptions" @quill-ready="focus" ref="quill"></quill>
          </div>
        </div>
        <div>
          <div>fr</div>
          <div class="dmx-html-field">
            <quill v-model="newComment.fr" :options="quillOptions"></quill>
          </div>
        </div>
      </div>
      <el-button type="primary" @click="save">Save</el-button>
      <el-button size="medium" @click="close">Close</el-button>
    </template>
  </div>
</template>

<script>
export default {

  data () {
    return {
      newComment: {de: '', fr: ''}
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
        comment: {
          children: {
            'zukunftswerk.comment.de': this.newComment.de,
            'zukunftswerk.comment.fr': this.newComment.fr
          }
        },
        targetTopicId: this.targetId
      })
      this.newComment.de = ''     // FIXME
      this.newComment.fr = ''     // FIXME
    },

    focus () {
      this.$refs.quill.focus()
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
  padding: 0 6px;
  background-color: rgb(182, 216, 202);
  z-index: 1;
}

.zw-discussion .open-button {
  font-size: 24px;
}

.zw-discussion .new-comment {
  display: flex;
  column-gap: 12px;
}

.zw-discussion .new-comment > div {
  flex-basis: 50%;
}
</style>
