import Vue from 'vue'
import Vuex from 'vuex'
import http from 'axios'
import dmx from 'dmx-api'
import adminStore from './admin'
import errorHandler from '../error-handler'
import zw from '../zw-globals'

window.addEventListener('focus', updateWorkspaceCookie)

Vue.use(Vuex)

const teamWorkspace = dmx.rpc.getTopicByUri('zukunftswerk.team', true)      // includeChildren=true
const ready = dmx.rpc.getUsername().then(initUserState)
const width = window.innerWidth

const state = {

  teamWorkspace,                // a promise, resolved with the "Team" Workspace topic (dmx.Topic)
  ready,                        // a promise, resolved once User state is initialized

  // User state
  username: '',                 // username of current user (String), empty/undefined if not logged in
  workspaces: [],               // ZW shared workspaces of the current user (array of plain Workspace topics)
                                // Note: the "Team" workspace is not included.
  isTeam: false,                // true if the "Team" workspace is writable by the current user (Boolean)
  users: [],                    // all users in the system (array of plain Username topics)

  // Workspace state
  workspace: undefined,         // the selected workspace (dmx.Topic)
  topicmap: undefined,          // the topicmap displayed on canvas (dmx.Topicmap)
  isWritable: false,            // true if the workspace is writable by the current user (Boolean)
  isEditor: false,              // true if the current user is an editor of the selected workspace (Boolean)
  topic: undefined,             // the selected topic (dmx.ViewTopic), undefined if nothing is selected
  newTopics: [],                // topics being created, not yet saved (array of dmx.ViewTopic)
  isEditActive: [],             // IDs of topics being edited (array)     // ### TODO: drop this, query model ID instead
  pan: {x: 0, y: 0},            // canvas pan (in pixel)                  // ### TODO: drop this, calculate instead
  zoom: 1,                      // canvas zoom (Number)                   // ### TODO: drop this, calculate instead
  isDragging: false,            // true while any of the 4 dragging actions is in progress (item move, item resize,
                                // canvas pan, panel resize)
  fullscreen: false,            // if true the current document is rendered fullscreen

  // Discussion Panel state
  panelVisibility: true,        // discussion panel visibility (Boolean)
  panelX: 0.65 * width,         // x coordinate in pixel (Number)
  discussion: undefined,        // the comments displayed in discussion panel (array of dmx.RelatedTopic)
  refDocument: undefined,       // document the new comment relates to (a Document topic, plain object)
  downloadUrl: undefined,       // URL of previously downloaded comment attachment

  // Misc state
  lang: 'de',                   // UI language ('de'/'fr')
  loginMessage: ''              // the status message shown besides Login button
}

const actions = {

  login ({dispatch}, credentials) {
    const authMethod = DEV || credentials.username === 'admin' ? 'Basic' : 'LDAP'
    return dmx.rpc.login(credentials, authMethod).then(username => {
      DEV && console.log('[ZW] Login', username)
      state.loginMessage = 'Login OK'
      return initUserState(username).then(() =>
        dispatch('getInitialWorkspaceId')
      ).then(workspaceId =>
        dispatch('callWorkspaceRoute', workspaceId)
      ).catch(error =>
        Vue.prototype.$alert(error.message, {
          type: 'error',
          showClose: false
        }).then(() =>
          dispatch('logout')
        )
      ).finally(() => {
        state.loginMessage = ''
      })
    }).catch(error => {
      state.loginMessage = 'Login failed'
      if (error.response.status !== 401) {
        errorHandler(error)     // generic error handler
      }
    })
  },

  logout ({dispatch}) {
    DEV && console.log('[ZW] Logout', state.username)
    return dmx.rpc.logout().then(initUserState)
  },

  resetPassword (_, emailAddress) {
    return http.get(`/sign-up/password-token/${emailAddress}/%2f`)      // redirectUrl=/ (%2f)
  },

  fetchAllUsers () {
    if (!state.users.length) {
      return http.get('/zukunftswerk/users').then(response => {
        state.users = response.data.sort(zw.topicSort)
      })
    }
  },

  /**
   * Depends on up-to-date User state.
   */
  getInitialWorkspaceId () {
    if (state.isTeam) {
      return state.teamWorkspace.then(workspace => workspace.id)
    } else {
      const workspaceId = state.workspaces[0]?.id
      if (!workspaceId) {
        throw Error("Benutzer \"" + state.username + "\" wurde noch keinem Arbeitsbereich zugeordnet. Bitte nimm " +
          "Kontakt mit dem Zukunftswerk-Team auf. / L'utilisateur \"" + state.username + "\" n'a pas encore été " +
          "affecté à un domaine d'activité. Veuillez prendre contact avec l'équipe de Zukunftswerk.")
      }
      return workspaceId
    }
  },

  setLang (_, lang) {
    state.lang = lang
  },

  setWorkspace (_, workspaceId) {
    if (!workspaceId) {
      throw Error(`${workspaceId} is not a workspace ID`)
    }
    dmx.rpc.getTopic(workspaceId, true).then(workspace => {           // includeChildren=true
      if (workspace.typeUri !== 'dmx.workspaces.workspace') {
        throw Error(`${workspaceId} is not a workspace (but a ${workspace.typeUri})`)
      }
      state.workspace = workspace
      updateWorkspaceCookie()
      updateWorkspaceState()
      fetchDiscussion()
      return fetchTopicmap()
    }).then(topicmap => {
      state.topicmap = topicmap
      initViewport()
    }).catch(error => {
      console.warn(`Workspace ${workspaceId} check failed`, error)
    })
  },

  setTopic (_, topic) {
    state.topic = topic
  },

  setTopicPos (_, {topic, x, y}) {
    const pos = {x, y}
    topic.setPosition(pos)                                            // update client state
    if (topic.id >= 0) {
      dmx.rpc.setTopicPosition(state.topicmap.id, topic.id, pos)      // update server state
    }
  },

  /**
   * Persists all of the given topic's view props.
   *
   * @param   topic   the topic (dmx.ViewTopic)
   */
  storeTopicViewProps (_, topic) {
    // console.log('storeTopicViewProps', topic.viewProps)
    dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, topic.viewProps)
  },

  setTopicSize (_, {topic, width, height}) {
    // update client state
    topic.setViewProp('dmx.topicmaps.width', width)
    topic.setViewProp('dmx.topicmaps.height', height)
    // update server state
    if (topic.id >= 0) {    // regard both, undefined and -1 as "not set"
      dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, {
        'dmx.topicmaps.width': width,
        'dmx.topicmaps.height': height
      })
    }
  },

  setPan (_, pan) {
    // FIXME: update client state (topicmap model)?
    state.pan = pan
    setTopicmapViewport()     // update server state (debounced)
  },

  setViewport (_, {pan, zoom}) {
    // FIXME: update client state (topicmap model)?
    state.pan = pan
    state.zoom = zoom
    setTopicmapViewport()     // update server state (debounced)
  },

  setPanelVisibility (_, visibility) {
    state.panelVisibility = visibility
  },

  setPanelX (_, x) {
    state.panelX = x
  },

  readPanelXFromView () {
    const panel = document.querySelector('.left-panel')
    if (panel) {    // only available for workspace view (not e.g. for login page or admin area)
      state.panelX = panel.clientWidth
    }
  },

  dragStart () {
    state.isDragging = true
  },

  dragStop () {
    state.isDragging = false
  },

  setFullscreen ({dispatch}, fullscreen) {
    state.fullscreen = fullscreen
    if (!fullscreen) {
      Vue.nextTick(() => {
        document.querySelector('.zw-resizer').__vue__.resize()
      })
    }
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
    // Transfer edit buffer to topic model ### TODO: refactor
    topic.children['zukunftswerk.document_name.de'] = docModel.names.de
    topic.children['zukunftswerk.document_name.fr'] = docModel.names.fr
    topic.children['dmx.files.file#zukunftswerk.de'] = docModel.paths.de.value ? docModel.files.de : undefined
    topic.children['dmx.files.file#zukunftswerk.fr'] = docModel.paths.fr.value ? docModel.files.fr : undefined
    //
    dispatch('update', topic)
  },

  /**
   * @param   topic         a dmx.ViewTopic of type "Note"
   * @param   monolingual   Optional: if truish a monolingual note is created (no auto-translation)
   */
  createNote (_, {topic, monolingual}) {
    return create('note', topic, monolingual)
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  updateNote ({dispatch}, topic) {
    dispatch('update', topic)
    dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, {
      'zukunftswerk.color': topic.viewProps['zukunftswerk.color']
    })
  },

  /**
   * @param   topic         a dmx.ViewTopic of type "Label"
   * @param   monolingual   Optional: if truish a monolingual label is created (no auto-translation)
   */
  createLabel (_, {topic, monolingual}) {
    return create('label', topic, monolingual)
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
   * @param   comment         the comment (String)
   * @param   refTopicIds     array: a Comment ID, or a Document ID, or both
   * @param   monolingual     Optional: if truish a monolingual comment is created (no auto-translation)
   */
  createComment (_, {comment, refTopicIds, fileTopicIds, monolingual}) {
    const _http = monolingual ? http : dmx.rpc._http
    const suffix = monolingual ? '/monolingual' : ''
    return _http.post(`/zukunftswerk/comment${suffix}`, comment, {
      headers: {
        'Content-Type': 'text/plain'
      },
      params: {
        refTopicIds: refTopicIds.join(','),
        fileTopicIds: fileTopicIds.join(',')
      }
    }).then(response => {
      const comment = new dmx.Topic(response.data)
      state.discussion.push(comment)
      return comment
    })
  },

  /**
   * @param   comment   a dmx.Topic
   */
  updateComment (_, {commentId, commentModel}) {
    dmx.rpc.updateTopic({
      id: commentId,
      children: {
        'zukunftswerk.comment.de': commentModel.de,
        'zukunftswerk.comment.fr': commentModel.fr
      }
    }).then(replaceComment)
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
    const text = document.querySelector(`${commentSelector} .columns`)
    text.classList.add('glow')
    setTimeout(() => {
      text.classList.remove('glow')
    }, 3000)    // corresponds to CSS variable "--glow-duration" in App.vue
  },

  /**
   * @param   document    a Document topic (plain object)
   */
  revealDocument ({dispatch}, document) {
    // 1) select and pan
    const topic = state.topicmap.getTopic(document.id)
    dispatch('setTopic', topic)
    dispatch('setPan', {
      x: -topic.pos.x * state.zoom + zw.NEW_POS_X,
      y: -topic.pos.y * state.zoom + zw.NEW_POS_Y
    })
    // 2) set doc filter
    dispatch('setRefDocument', document)
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
    zw.confirmDeletion().then(() => {
      state.topicmap.removeTopic(topic.id)        // update client state
      dmx.rpc.deleteTopic(topic.id)               // update server state
    }).catch(() => {})            // suppress unhandled rejection on cancel
  },

  deleteComment ({dispatch}, comment) {
    zw.confirmDeletion('warning.delete_comment').then(() => {
      removeComment(comment)                      // update client state
      dmx.rpc.deleteTopic(comment.id)             // update server state
    }).catch(() => {})            // suppress unhandled rejection on cancel
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
    if (topic.id === -1 || topic.id === undefined) {
      // abort creation
      removeNewTopic(topic)                       // update client state
    } else {
      // abort update
      removeEditActive(topic)                     // update client state
    }
  },

  translate (_, text) {
    return http.post('/zukunftswerk/translate', text).then(response => response.data)
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

store.registerModule('admin', adminStore)

export default store

/**
 * @param   type    'note'/'label'
 */
function create (type, topic, monolingual) {
  let p
  if (monolingual)  {
    // Note: a monolingual note/label is stored in "de". "fr" and "Original Language" are not set.
    p = dmx.rpc.createTopic({
      typeUri: `zukunftswerk.${type}`,
      children: {
        [`zukunftswerk.${type}.de`]: topic.value
      }
    })
  } else {
    p = dmx.rpc._http.post(`/zukunftswerk/${type}`, topic.value, {      // suppress standard HTTP error handler
      headers: {
        'Content-Type': 'text/plain'
      }
    }).then(response => response.data)
  }
  return p.then(_topic => {
    addTopicToTopicmap(topic, _topic)
    removeNewTopic(topic)
  })
}

// state helper

/**
 * Initialzes 4 states:
 *   "username"
 *   "workspaces"
 *   "isTeam"
 *   "users"
 *
 * @param   username  the username or empty/undefined if not logged in
 *
 * @return  a promise, resolved once the state is initialized.
 */
function initUserState (username) {
  if (username) {
    return Promise.all([
      teamWorkspace
        .then(workspace => workspace.isWritable())
        .then(isWritable => {
          state.username = username
          state.isTeam = isWritable
        }),
      http.get('/zukunftswerk/workspaces').then(response => {
        state.workspaces = response.data
      }),
      store.dispatch('fetchAllUsers')     // needed for accessing display names
    ])
  } else {
    state.username = ''
    state.workspaces = []
    state.isTeam = false
    return Promise.resolve()
  }
}

function updateWorkspaceCookie () {
  if (state.workspace) {
    dmx.utils.setCookie('dmx_workspace_id', state.workspace.id)
  }
}

function updateWorkspaceState () {
  state.workspace.isWritable().then(isWritable => {
    state.isWritable = isWritable
  })
  teamWorkspace.then(workspace => {
    if (state.workspace.id !== workspace.id) {
      state.isEditor = findWorkspace(state.workspace.id).assoc.children['zukunftswerk.editor']?.value
      console.log('isEditor', state.workspace.id, state.isEditor)
    }
  })
}

function findWorkspace (id) {
  const workspace = state.workspaces.find(ws => ws.id === id)
  if (!workspace) {
    throw Error(`Workspace ${id} not found in ${state.workspaces} (${state.workspaces.length})`)
  }
  return workspace
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

function replaceComment (comment) {
  const i = state.discussion.findIndex(cmt => cmt.id === comment.id)
  if (i === -1) {
    throw Error('replaceComment')
  }
  state.discussion.splice(i, 1, comment)
}

function initViewport () {
  const topicmap = state.topicmap
  const viewport = topicmap.topics.find(t => t.typeUri === 'zukunftswerk.viewport')
  if (!viewport) {
    console.warn(`Viewport topic missing in Topicmap ${topicmap.id}`)
    // fallback
    state.pan = {
      x: topicmap.panX,
      y: topicmap.panY
    }
    state.zoom = topicmap.zoom
    return
  }
  const zoom = viewport.viewProps['dmx.topicmaps.zoom']
  state.pan = {
    x: -viewport.pos.x * zoom,
    y: -viewport.pos.y * zoom
  }
  state.zoom = zoom
}

function setTopicmapViewport() {
  if (state.isTeam || state.isEditor) {
    dmx.rpc.setTopicmapViewport(state.topicmap.id, state.pan, state.zoom)           // update server state
  }
}

// util

function filerepoUrl (repoPath) {
  return '/filerepo/' + encodeURIComponent(repoPath)
}

function fetchTopicmap () {
  return dmx.rpc.getAssignedTopics(state.workspace.id, 'dmx.topicmaps.topicmap').then(topics => {
    // TODO: show warning if there are more than one topicmaps
    return dmx.rpc.getTopicmap(topics[0].id, true)      // includeChildren=true
  })
}
