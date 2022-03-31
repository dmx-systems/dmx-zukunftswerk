import store from './store/zukunftswerk'

export default {

  getUser,
  getString,

  NEW_POS_X: 42,                // position of both, new items, and document revelation (in pixel)
  NEW_POS_Y: 42
}

function getUser (username) {
  return store.state.users.find(ws => ws.value === username)
}

function getString (key) {
  return store.state.uiStrings[`${key}.${store.state.lang}`]
}
