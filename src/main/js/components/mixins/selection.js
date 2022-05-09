/**
 * Note: the host component is expected to hold "topic": the topic to render.
 */
export default {

  computed: {

    isSelected () {
      return this.selectedTopic?.id === this.topic.id
    },

    selectedTopic () {
      return this.$store.state.topic
    }
  }
}
