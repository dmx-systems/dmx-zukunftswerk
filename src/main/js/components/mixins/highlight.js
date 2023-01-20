import store from '../../store/zukunftswerk'

export default {
  methods: {
    highlight (topic, text, isHtml) {
      const matches = store.state.search.matches
      const matchIndex = store.state.search.matchIndex
      if (!matches.length || matches[matchIndex].id !== topic.id) {
        return text
      }
      if (isHtml) {
        let out = ''
        let i = 0
        let t1
        while ((t1 = text.indexOf('<', i)) >= 0) {
          out += insertSpans(text.substring(i, t1))     // output text
          const t2 = text.indexOf('>', t1 + 1)
          if (t2 === -1) {
            throw Error(`highlight failure: "${text}", topicId=${topic.id}`)
          }
          out += text.substring(t1, t2 + 1)             // output tag
          i = t2 + 1
        }
        return out
      } else {
        return insertSpans(text)
      }
    }
  }
}

function insertSpans (text) {
  const searchTerm = store.state.search.searchTerm.toLowerCase()
  const length = searchTerm.length
  const _text = text.toLowerCase()
  let out = ''
  let i = 0
  let m
  while ((m = _text.indexOf(searchTerm, i)) >= 0) {
    out += text.substring(i, m)                                                   // output text
    out += '<span class="match">' + text.substring(m, m + length) + '</span>'     // output match
    i = m + length
  }
  out += text.substring(i)                                                        // output tail
  return out
}
