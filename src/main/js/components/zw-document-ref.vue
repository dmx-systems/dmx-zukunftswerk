<template>
  <div class="zw-document-ref" v-if="document" @click="reveal">
    <span class="icon fa fa-fw fa-file-o"></span>
    <span class="label">{{docName}}</span>
    <el-button class="close-button" v-if="removable" type="text" icon="el-icon-close" @click="remove"></el-button>
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
.zw-document-ref {
  display: inline-block;
  background-color: #fff6cc;
  padding: 6px;
  cursor: pointer;
}

.zw-document-ref .icon {
  color: #ffd100;
}

.zw-document-ref .close-button {
  font-size: 20px;
  margin-left: 6px;
}

.zw-document-ref .close-button > i {
  vertical-align: text-bottom;
}
</style>
