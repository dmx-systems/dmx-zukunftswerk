<template>
  <div :class="['zw-document-ref', 'zw-comment-target-ref', {closable}]" v-if="document" @click="reveal">
    <span class="icon fa fa-fw fa-file-o"></span>
    <span class="doc-name label">{{docName}}</span>
    <el-button class="close-button" v-if="closable" type="text" icon="el-icon-close" @click.stop="close"></el-button>
  </div>
</template>

<script>
export default {

  props: {
    document: Object,       // the referred-to Document, optional (plain Object, not a dmx.Topic)
    closable: Boolean       // if true the close-button is rendered, optional
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

    close () {
      this.$store.dispatch('setDocumentFilter', undefined)
    }
  }
}
</script>

<style>
.zw-document-ref {
  display: inline-block;
  background-color: var(--primary-color-light);
  padding: 6px;
  cursor: pointer;
}

.zw-document-ref.closable {
  background-color: var(--primary-color);
}

.zw-document-ref .icon {
  color: var(--primary-color);
}

.zw-document-ref.closable .icon,
.zw-document-ref.closable .doc-name {
  color: black !important;
}

.zw-document-ref .close-button {
  font-size: 18px;
  margin-left: 6px;
}

.zw-document-ref .close-button > i {
  vertical-align: text-bottom;
}
</style>
