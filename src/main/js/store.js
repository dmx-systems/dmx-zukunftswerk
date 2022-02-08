import Vue from 'vue'
import Vuex from 'vuex'
import {MessageBox} from 'element-ui'
import http from 'axios'
import dmx from 'dmx-api'

window.addEventListener('focus', updateWorkspaceCookie)

Vue.use(Vuex)

const teamWorkspace = dmx.rpc.getTopicByUri('zukunftswerk.team')
const width = window.innerWidth

const state = {

  username: undefined,          // username of logged in user (String), undefined if not logged in
  isTeam: false,                // true if the "Team" workspace is writable by the current user (Boolean)

  topicmap: undefined,          // the topicmap displayed on canvas (dmx.Topicmap)
  workspace: undefined,         // the workspace the topicmap belongs to (dmx.Topic)
  isWritable: false,            // true if the workspace is writable by the current user (Boolean)
  topic: undefined,             // the selected topic (dmx.ViewTopic), undefined if nothing is selected
  newTopics: [],                // topics being created, not yet saved (array of dmx.ViewTopic)
  isEditActive: [],             // IDs of topics being edited (array)
  pan: {x: 0, y: 0},            // canvas pan (in pixel)
  zoom: 1,                      // canvas zoom (Number)

  panelVisibility: true,        // discussion panel visibility (Boolean)
  panelX: 0.65 * width,         // x coordinate in pixel (Number)
  discussion: undefined,        // the comments displayed in discussion panel (array of dmx.RelatedTopic)
  refDocument: undefined,       // document the new comment relates to (a Document topic, plain object)
  downloadUrl: undefined,       // URL of previously downloaded comment attachment

  lang: 'de',                   // UI language ('de'/'fr')
  langStrings:  require('./lang-strings').default,
  quillOptions: require('./quill-options').default,

  NEW_POS_X: 42,                // position of both, new items, and document revelation (in pixel)
  NEW_POS_Y: 42
}

const actions = {

  loggedIn (_, username) {
    DEV && console.log('[ZW] Login', username)
    setUsername(username)
    updateIsWritable()
  },

  logout () {
    DEV && console.log('[ZW] Logout', state.username)
    dmx.rpc.logout().then(() => {
      state.username = undefined
      state.isTeam = false
      updateIsWritable()
    })
  },

  setTopicmap (_, topicmap) {
    state.topicmap = topicmap
    state.pan = {
      x: topicmap.panX,
      y: topicmap.panY
    }
    state.zoom = topicmap.zoom
  },


  setViewport (_, {pan, zoom}) {
    state.pan = pan
    state.zoom = zoom
    setTopicmapViewport()     // update server state (debounced)
  },

  setPan (_, pan) {
    state.pan = pan
    setTopicmapViewport()     // update server state (debounced)
  },

  /* setZoom (_, zoom) {
    state.zoom = zoom
    setTopicmapViewport()     // update server state (debounced)
  }, */

  setPanelVisibility (_, visibility) {
    state.panelVisibility = visibility
  },

  setPanelX (_, x) {
    state.panelX = x
  },

  setLang (_, lang) {
    state.lang = lang
  },

  setWorkspace (_, workspace) {
    state.workspace = workspace
    updateWorkspaceCookie()
    updateIsWritable()
    fetchDiscussion()
  },

  setTopic (_, topic) {
    state.topic = topic
  },

  newTopic (_, topic) {
    state.newTopics.push(topic)
    //
    // workaround to prevent body scrolling when new topic exceeds viewport
    document.body.classList.add('fixed')
    Vue.nextTick(() => {
      // a fixed body would not adapt to window resize anymore
      document.body.classList.remove('fixed')
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createDocument (_, topic) {
    return dmx.rpc.createTopic(topic).then(_topic => {
      addTopicToTopicmap(topic, _topic)
      removeNewTopic(topic)
    })
  },

  updateDocument ({dispatch}, {topic, docModel}) {
    // Transfer edit buffer to topic model
    topic.children['zukunftswerk.document_name.de'] = docModel.names.de
    topic.children['zukunftswerk.document_name.fr'] = docModel.names.fr
    topic.children['dmx.files.file#zukunftswerk.de'] = docModel.paths.de.value ? docModel.files.de : undefined
    topic.children['dmx.files.file#zukunftswerk.fr'] = docModel.paths.fr.value ? docModel.files.fr : undefined
    //
    dispatch('update', topic)
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createNote (_, topic) {
    return http.post('/zukunftswerk/note', topic.value, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    .then(response => response.data)
    .then(_topic => {
      addTopicToTopicmap(topic, _topic)
      removeNewTopic(topic)
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createLabel (_, topic) {
    return http.post('/zukunftswerk/label', topic.value, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    .then(response => response.data)
    .then(_topic => {
      addTopicToTopicmap(topic, _topic)
      removeNewTopic(topic)
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createArrow (_, topic) {
    return dmx.rpc.createTopic(topic).then(_topic => {
      addTopicToTopicmap(topic, _topic)
    })
  },

  /**
   * @param   refTopicId    optional: a Comment ID or a Document ID
   */
  createComment (_, {comment, refTopicId, fileTopicIds}) {
    return http.post('/zukunftswerk/comment', comment, {
      headers: {
        'Content-Type': 'text/plain'
      },
      params: {
        refTopicId,
        fileTopicIds: fileTopicIds.join(',')
      }
    }).then(response => {
      const comment = new dmx.Topic(response.data)
      state.discussion.push(comment)
      state.refDocument = undefined
      return comment
    })
  },

  /**
   * @param   comment   a dmx.Topic
   */
  updateComment (_, comment) {
    dmx.rpc.updateTopic(comment)
  },

  addComment (_, comment) {
    state.discussion.push(comment)
  },

  jumpToComment (_, {comment, behavior = 'smooth'}) {
    // 1) Scroll comment into view
    // Safari note: Safari ignores scrollIntoView() "behavior" option; scrolling is not smooth.
    // Chrome note: in Chrome after new-comment scrolling does not work at all if "behavior" is set to "smooth".
    // (In contrast for comment-ref-click scrolling DOES work, and is even smooth.) As workaraound we use "auto"
    // in this very case. Scrolling works then (but not smooth, as expected).
    // "scrollIntoView() has a long bug-history in Chrome, some of them are still open for now." (May 2020)
    // https://stackoverflow.com/questions/61885401/scrollintoview-is-not-working-in-chrome-version-81
    const commentSelector = `.zw-discussion .zw-comment[data-id="${comment.id}"]`
    document.querySelector(commentSelector).scrollIntoView({
      behavior,
      block: 'nearest'      // avoid body scroll
    })
    // 2) Apply "glow" effect
    const texts = document.querySelectorAll(`${commentSelector} .columns > div`)
    texts.forEach(text => {
      text.classList.add('glow')
    })
    setTimeout(() => {
      texts.forEach(text => {
        text.classList.remove('glow')
      })
    }, 3000)    // corresponds to CSS variable "--glow-duration" in App.vue
  },

  /**
   * @param   document    a Document topic (plain object)
   */
  revealDocument ({dispatch}, document) {
    const topic = state.topicmap.getTopic(document.id)
    dispatch('setTopic', topic)
    dispatch('setPan', {
      x: -topic.pos.x * state.zoom + state.NEW_POS_X,
      y: -topic.pos.y * state.zoom + state.NEW_POS_Y
    })
  },

  setRefDocument ({dispatch}, document) {
    state.refDocument = document
    if (document) {
      dispatch('setPanelVisibility', true)
    }
  },

  edit ({dispatch}, topic) {
    dispatch('setTopic', topic)   // select programmatically
    state.isEditActive.push(topic.id)
  },

  delete ({dispatch}, topic) {
    dispatch('setTopic', topic)   // select programmatically
    confirmDeletion().then(() => {
      state.topicmap.removeTopic(topic.id)        // update client state
      dmx.rpc.deleteTopic(topic.id)               // update server state
    }).catch(() => {})  // suppress unhandled rejection on cancel
  },

  deleteComment ({dispatch}, comment) {
    confirmDeletion('warning.delete_comment').then(() => {
      removeComment(comment)                      // update client state
      dmx.rpc.deleteTopic(comment.id)             // update server state
    }).catch(() => {})  // suppress unhandled rejection on cancel
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  update (_, topic) {
    return dmx.rpc.updateTopic(topic).then(directives => {
      removeEditActive(topic)
    })
  },

  cancel (_, topic) {
    if (!topic.id) {
      // abort creation
      removeNewTopic(topic)                       // update client state
    } else {
      // abort update
      removeEditActive(topic)                     // update client state
    }
  },

  downloadFile (_, repoPath) {
    state.downloadUrl = filerepoUrl(repoPath) + '?download'
    setTimeout(() => {
      state.downloadUrl = undefined     // reset required for downloading the same file twice
    }, 1000)
  },

  getFileContent (_, repoPath) {
    return http.get(filerepoUrl(repoPath))
      .then(response => response.data)
  }
}

const store = new Vuex.Store({
  state,
  actions
})

export default store

// init state

dmx.rpc.getUsername().then(setUsername)

// state helper

function setUsername (username) {
  teamWorkspace
    .then(workspace => workspace.isWritable())
    .then(isWritable => {
      state.username = username
      state.isTeam = isWritable
    })
}

function updateWorkspaceCookie () {
  // console.log('dmx_workspace_id', state.workspace.id)
  dmx.utils.setCookie('dmx_workspace_id', state.workspace.id)
}

function updateIsWritable () {
  state.workspace.isWritable().then(isWritable => {
    state.isWritable = isWritable
  })
}

function fetchDiscussion () {
  http.get('/zukunftswerk/discussion').then(response => {
    state.discussion = dmx.utils.instantiateMany(response.data, dmx.Topic).sort(
      (c1, c2) => c1.children['dmx.timestamps.created'].value - c2.children['dmx.timestamps.created'].value
    )
  })
}

/**
 * Transfers "id", "value", and "children" from the given topic to the given viewTopic and adds the viewTopic
 * to the topicmap. Updates both, client state and server state.
 */
function addTopicToTopicmap (viewTopic, topic) {
  viewTopic.id       = topic.id
  viewTopic.value    = topic.value
  viewTopic.children = topic.children
  state.topicmap.addTopic(viewTopic)                                                // update client state
  dmx.rpc.addTopicToTopicmap(state.topicmap.id, topic.id, viewTopic.viewProps)      // update server state
}

// TODO: unify this 3 functions

function removeNewTopic (topic) {
  const i = state.newTopics.indexOf(topic)
  if (i === -1) {
    throw Error('removeNewTopic')
  }
  state.newTopics.splice(i, 1)
}

function removeEditActive (topic) {
  const i = state.isEditActive.indexOf(topic.id)
  if (i === -1) {
    throw Error('removeEditActive')
  }
  state.isEditActive.splice(i, 1)
}

function removeComment (comment) {
  const i = state.discussion.indexOf(comment)
  if (i === -1) {
    throw Error('removeComment')
  }
  state.discussion.splice(i, 1)
}

function setTopicmapViewport() {
  if (state.isTeam) {
    dmx.rpc.setTopicmapViewport(state.topicmap.id, state.pan, state.zoom)           // update server state
  }
}

function getString (key) {
  return state.langStrings[`${key}.${state.lang}`]
}

// util

function filerepoUrl (repoPath) {
  return '/filerepo/' + encodeURIComponent(repoPath)
}

function confirmDeletion (textKey = 'warning.delete') {
  return MessageBox.confirm(getString(textKey), 'Warning', {
    type: 'warning',
    confirmButtonText: getString('action.delete'),
    confirmButtonClass: 'el-button--danger',
    showClose: false
  })
}
