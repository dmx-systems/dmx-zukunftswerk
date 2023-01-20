/**
 * Note: the host component is expected to hold "topic": any topic which has a 'comments_enabled' child.
 */
export default {
  computed: {
    commentsEnabled () {
      return this.topic.children['zukunftswerk.comments_enabled']?.value
    }
  }
}
