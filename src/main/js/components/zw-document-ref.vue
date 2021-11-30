<template>
  <el-button class="zw-document-ref" v-if="document" type="text">
    <span class="fa fa-file-o"></span>
    <span>{{docName}}</span>
  </el-button>
</template>

<script>
// import dmx from 'dmx-api'

export default {

  props: {
    document: Object     // the Comment to render, optional (plain Object, not a dmx.Topic)
  },

  computed: {

    docLang () {
      const docNames = this.docNames
      if (docNames.de && docNames.fr) {
        return this.lang
      } else if (docNames.de) {
        return 'de'
      } else if (docNames.fr) {
        return 'fr'
      }
    },

    docName () {
      if (this.docLang) {
        const name = this.docNames[this.docLang]
        return name && name.value
      }
    },

    docNames () {
      return {
        de: this.document.children['zukunftswerk.document_name.de'],
        fr: this.document.children['zukunftswerk.document_name.fr']
      }
    },

    lang () {
      return this.$store.state.lang
    }
  }
}
</script>

<style>
.zw-document-ref {
  white-space: unset;     /* Element UI default is "nowrap" */
  text-align: unset;      /* Element UI default is "center" */
}
</style>
