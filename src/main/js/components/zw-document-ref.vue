<template>
  <div class="zw-document-ref" v-if="document">
    <el-tag :type="type" :closable="removable" size="medium" @click="reveal" @close="remove">
      <span class="fa fa-fw fa-file-o"></span>
      <span>{{docName}}</span>
    </el-tag>
  </div>
</template>

<script>
export default {

  props: {
    document: Object,       // the referred-to Document, optional (plain Object, not a dmx.Topic)
    removable: Boolean      // if true the remove-button is rendered, optional
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

    type () {
      if (this.refDocument && this.refDocument.id === this.document.id) {
        return 'success'
      }
    },

    refDocument () {
      return this.$store.state.refDocument
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {

    reveal () {
      this.$store.dispatch('revealDocument', this.document)
    },

    remove () {
      this.$store.dispatch('setRefDocument', undefined)
    }
  }
}
</script>

<style>
.zw-document-ref .el-tag {
  cursor: pointer;
  height: unset;                  /* Element UI Tag default is 32px; not suitable for multi-line tags */
  line-height: unset;             /* Element UI Tag default is 30px */
  white-space: unset;             /* Element UI Tag default is "nowrap" */
  padding: 5px 10px 5px 10px;     /* Element UI Tag default is "0 10px" */
}
</style>
