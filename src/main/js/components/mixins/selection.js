export default {

  computed: {

    /**
     * Note: only callable by components which hold a "topic" property.
     */
    isSelected () {
      return this.selection.find(topic => topic.id === this.topic.id)
    },

    selectedTopic () {
      if (this.isSingleSelection) {
        return this.selection[0]
      }
    },

    selection () {
      return this.$store.state.selection
    },

    isEmptySelection () {
      return this.selection.length === 0
    },

    isSingleSelection () {
      return this.selection.length === 1
    },

    isMultiSelection () {
      return this.selection.length > 1
    }
  }
}
