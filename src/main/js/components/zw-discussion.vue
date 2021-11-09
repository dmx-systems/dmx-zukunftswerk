<template>
  <div class="zw-discussion">
    <el-button v-if="isClosed" class="open-button" type="text" icon="el-icon-chat-round" @click="open"></el-button>
    <template v-else>
      <div v-if="document">Document discussion</div>
      <div v-if="workspace">Workspace discussion</div>
      <el-button size="medium" @click="close">Close</el-button>
    </template>
  </div>
</template>

<script>
export default {

  computed: {

    discussionMode () {
      return this.$store.state.discussionMode
    },

    isClosed () {
      return !this.discussionMode
    },

    document () {
      return this.discussionMode === 'document'
    },

    workspace () {
      return this.discussionMode === 'workspace'
    }
  },

  methods: {

    open () {
      this.$store.dispatch('setDiscussionMode', 'workspace')
    },

    close () {
      this.$store.dispatch('setDiscussionMode', undefined)
    }
  }
}
</script>

<style>
.zw-discussion {
  padding: 0 6px;
  background-color: rgb(182, 216, 202);
}

.zw-discussion .open-button {
  font-size: 24px;
}
</style>
