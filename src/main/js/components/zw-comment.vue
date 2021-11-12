<template>
  <div class="zw-comment">
    <div v-html="de"></div>
    <div v-html="fr"></div>
  </div>
</template>

<script>
// import dmx from 'dmx-api'

export default {

  props: {
    comment: Object
  },

  computed: {

    de () {
      const de = this.comment.children['zukunftswerk.comment.de']
      return de ? de.value : 'n/a'
    },

    fr () {
      const fr = this.comment.children['zukunftswerk.comment.fr']
      return fr ? fr.value : 'n/a'
    }
  }
}
</script>

<style>
.zw-comment {
  display: flex;
  column-gap: 12px;
}

.zw-comment > div {
  flex-basis: 50%;
  background-color: white;
}
</style>
