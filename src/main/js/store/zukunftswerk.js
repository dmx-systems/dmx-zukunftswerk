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
  lang: undefined,              // UI language ('de'/'fr')
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

  logout () {
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
   * Precondition: User state is up-to-date.
   */
  getInitialWorkspaceId () {
    // 1) take from URL
    let workspaceId = state.routerModule.router.currentRoute.query.workspaceId
    if (workspaceId) {
      return workspaceId
    }
    // 2) take from cookie
    workspaceId = dmx.utils.getCookie('dmx_workspace_id')
    if (workspaceId) {
      return workspaceId
    }
    // 3) team members land in "Team" workspace (at first login there are no ZW event workspaces)
    if (state.isTeam) {
      return state.teamWorkspace.then(workspace => workspace.id)
    }
    // 4) take first workspace (based on memberships)
    workspaceId = state.workspaces[0]?.id
    if (!workspaceId) {
      throw Error("Benutzer \"" + state.username + "\" wurde noch keinem Arbeitsbereich zugeordnet. Bitte nimm " +
        "Kontakt mit dem Zukunftswerk-Team auf. / L'utilisateur \"" + state.username + "\" n'a pas encore été " +
        "affecté à un domaine d'activité. Veuillez prendre contact avec l'équipe de Zukunftswerk.")
    }
    return workspaceId
  },

  setLang (_, lang) {
    state.lang = lang
    dmx.utils.setCookie('zw_lang', lang)
  },

  setWorkspace ({dispatch}, workspaceId) {
    if (!workspaceId) {
      throw Error(`${workspaceId} is not a workspace ID`)
    }
    dispatch('deselect')                      // reset selection
    dispatch('setRefDocument', undefined)     // reset doc-filter
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

  /**
   * @param   topic   must not be null/undefined
   */
  select ({dispatch}, topic) {
    dispatch('deselect')
    // console.log('select', topic.id)
    state.topic = topic
    document.querySelector(`.moveable-control-box.target-${topic.id}`).classList.add('active')
  },

  deselect () {
    // console.log('deselect', state.topic?.id)
    if (state.topic) {
      document.querySelector(`.moveable-control-box.target-${state.topic.id}`).classList.remove('active')
      state.topic = undefined
    }
  },

  storeTopicPos (_, topic) {
    if (topic.id >= 0) {
      dmx.rpc.setTopicPosition(state.topicmap.id, topic.id, topic.pos)      // update server state
    }
  },

  storeTopicSize (_, topic) {
    if (topic.id >= 0) {    // regard both, undefined and -1 as "not set"
      dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, {
        'dmx.topicmaps.width': topic.viewProps['dmx.topicmaps.width'],
        'dmx.topicmaps.height': topic.viewProps['dmx.topicmaps.height']
      })
    }
  },

  storeTopicAngle (_, topic) {
    if (topic.id >= 0) {    // regard both, undefined and -1 as "not set"
      dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, {
        'zukunftswerk.angle': topic.viewProps['zukunftswerk.angle']
      })
    }
  },

  storeArrowHandles (_, topic) {
    // Note: the server would store doubles but can't retrieve doubles but integers (ClassCastException)!
    // So we better do the rounding here.
    dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, {
      'dmx.topicmaps.x':     Math.round(topic.viewProps['dmx.topicmaps.x']),
      'dmx.topicmaps.y':     Math.round(topic.viewProps['dmx.topicmaps.y']),
      'dmx.topicmaps.width': topic.viewProps['dmx.topicmaps.width'],
      'zukunftswerk.angle':  topic.viewProps['zukunftswerk.angle']
    })
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

  // Note: pan/zoom state is not persisted. We have the Viewport topic instead.
  setPan (_, pan) {
    // TODO: update topicmap model?
    state.pan = pan
  },

  // Note: pan/zoom state is not persisted. We have the Viewport topic instead.
  setViewport (_, {pan, zoom}) {
    // TODO: update topicmap model?
    state.pan = pan
    state.zoom = zoom
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

  setFullscreen (_, fullscreen) {
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

  /**
   * @param   comment   if not part of the current discussion nothing happens.
   */
  replaceComment (_, comment) {
    const i = findCommentIndex(comment)
    if (i >= 0) {
      state.discussion.splice(i, 1, comment)
    }
  },

  /**
   * @param   comment   if not part of the current discussion nothing happens.
   */
  removeComment (_, comment) {
    const i = findCommentIndex(comment)
    if (i >= 0) {
      state.discussion.splice(i, 1)
    }
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
   * @param   doc     a Document topic (plain object)
   */
  revealDocument ({dispatch}, doc) {
    // 1) select and pan
    const topic = state.topicmap.getTopic(doc.id)
    dispatch('select', topic)     // programmatic selection
    dispatch('setPan', {
      x: -topic.pos.x * state.zoom + zw.CANVAS_BORDER,
      y: -topic.pos.y * state.zoom + zw.CANVAS_BORDER
    })
    // 2) set doc filter
    dispatch('setRefDocument', doc)
  },

  /**
   * @param   doc     optional: a Document topic (plain object)
   */
  setRefDocument ({dispatch}, doc) {
    state.refDocument = doc
    if (doc) {
      dispatch('setPanelVisibility', true)
    }
  },

  edit ({dispatch}, topic) {
    dispatch('select', topic)     // programmatic selection
    state.isEditActive.push(topic.id)
  },

  delete ({dispatch}, topic) {
    dispatch('select', topic)     // programmatic selection
    zw.confirmDeletion().then(() => {
      state.topic = undefined
      state.topicmap.removeTopic(topic.id)        // update client state
      dmx.rpc.deleteTopic(topic.id)               // update server state
    }).catch(() => {})            // suppress unhandled rejection on cancel
  },

  deleteComment (_, comment) {
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

  /**
   * Precondition: the given topic is visible on canvas.
   */
  updateControlBox (_, {topicId, delay = 0}) {
    // Note: $nextTick() instead shows strange result
    setTimeout(() => {
      document.querySelector(`.zw-canvas-item[data-id="${topicId}"]`).__vue__.moveable.updateTarget()
    }, delay)
  },

  updateUserProfile ({rootState}, userProfile) {
    return http.put(`/zukunftswerk/user_profile`, undefined, {
      params: userProfile
    }).then(() => {
      updateUserProfile(userProfile)              // update client state
      // rootState.users.sort(zw.topicSort)       // TODO: sort by display name (email address at the moment)
    })
  },

  translate (_, text) {
    // suppress standard HTTP error handler
    return dmx.rpc._http.post('/zukunftswerk/translate', text).then(response => response.data)
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
initLang()

export default store

// action helper

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
    // suppress standard HTTP error handler
    p = dmx.rpc._http.post(`/zukunftswerk/${type}`, topic.value).then(response => response.data)
  }
  return p.then(_topic => {
    addTopicToTopicmap(topic, _topic)
    removeNewTopic(topic)
  })
}

// state helper

function initLang () {
  let lang
  const langC = dmx.utils.getCookie('zw_lang')
  if (langC) {
    lang = langC
    console.log('[ZW] lang:', lang, '(from cookie)')
  } else {
    const langB = navigator.language.substr(0, 2)
    lang = ['de', 'fr'].includes(langB) ? langB : 'de'
    console.log('[ZW] lang:', langB, '(from browser) ->', lang)
  }
  store.dispatch('setLang', lang)
}

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
        state.workspaces = response.data  // TODO: sort
      }),
      store.dispatch('fetchAllUsers')     // needed for accessing display names
    ])
  } else {
    state.username = ''
    state.workspaces = []
    state.isTeam = false
    state.workspace = undefined
    state.topic = undefined
    updateWorkspaceCookie()
    return Promise.resolve()
  }
}

function updateWorkspaceCookie () {
  if (state.workspace) {
    dmx.utils.setCookie('dmx_workspace_id', state.workspace.id)
  } else {
    dmx.utils.deleteCookie('dmx_workspace_id')
  }
}

function updateWorkspaceState () {
  state.workspace.isWritable().then(isWritable => {
    state.isWritable = isWritable
  })
  teamWorkspace.then(workspace => {
    if (state.workspace.id !== workspace.id) {
      state.isEditor = findWorkspace(state.workspace.id).assoc.children['zukunftswerk.editor']?.value
      // console.log('isEditor', state.workspace.id, state.isEditor)
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

// TODO: basically copied from admin.js
function updateUserProfile(userProfile) {
  const children = zw.getUser(state.username).children
  if (!children['zukunftswerk.display_name']) {   // TODO: refactor
    Vue.set(children, 'zukunftswerk.display_name', {})
  }
  children['zukunftswerk.display_name'].value = userProfile.displayName
  children['zukunftswerk.show_email_address'].value = userProfile.showEmailAddress
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
  const i = findCommentIndex(comment)
  if (i === -1) {
    throw Error('removeComment')
  }
  state.discussion.splice(i, 1)
}

function replaceComment (comment) {
  const i = findCommentIndex(comment)
  if (i === -1) {
    throw Error('replaceComment')
  }
  state.discussion.splice(i, 1, comment)
}

function findCommentIndex (comment) {
  return state.discussion.findIndex(cmt => cmt.id === comment.id)
}

function initViewport () {
  const viewport = zw.getViewport()
  state.pan = viewport.pan
  state.zoom = viewport.zoom
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
