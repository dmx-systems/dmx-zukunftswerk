import zw from '../../zw-globals'

export default {
  computed: {
    color () {
      return this.topic.viewProps['zukunftswerk.color'] || zw.ITEM_COLORS[1]      // default is lavender
    }
  }
}
