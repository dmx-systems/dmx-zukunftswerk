<template>
  <div class="zw-comment-ref" v-if="comment" @click="click">
    <div class="creator label">{{displayName}}</div>
    <zw-truncate class="comment label" :html="html[lang]"></zw-truncate>
    <el-button class="close-button" v-if="closable" type="text" icon="el-icon-close" @click.stop="remove"></el-button>
  </div>
</template>

<script>
import zw from '../zw-globals'

export default {

  props: {
    comment: Object,      // the referred-to Comment, optional (plain Object, not a dmx.Topic)
    closable: Boolean     // if true the close-button is rendered, optional
  },

  computed: {

    html () {
      return {
        de: this.comment.children['zukunftswerk.comment.de'].value,
        fr: this.comment.children['zukunftswerk.comment.fr'].value
      }
    },

    creator () {
      return this.comment.children['dmx.accesscontrol.creator'].value
    },

    displayName () {
      return zw.getDisplayName(this.creator)
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    click () {
      this.$emit('click', this.comment)
    },

    remove () {
      this.$emit('remove', this.comment)
    }
  }
}
</script>

<style>
.zw-comment-ref {
  display: inline-block;
  position: relative;
  background-color: var(--primary-color-light);
  border-left: 5px solid var(--primary-color);
  padding: 6px 10px;
  cursor: pointer;
}

.zw-comment-ref .creator {
  font-weight: bold;
  margin-bottom: 2px;
}

.zw-comment-ref .comment {
  font-style: italic;
}

.zw-comment-ref .close-button {
  font-size: 18px;
  position: absolute;
  top: 1px;
  right: 1px;
}
</style>
