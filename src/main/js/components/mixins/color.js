import zw from '../../zw-globals'

export default {
  computed: {
    color () {
      return this.topic.children['zukunftswerk.color']?.value || zw.ITEM_COLORS[1]      // default is lavender
    }
  }
}
