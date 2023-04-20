import Vue from 'vue'
import Vuex from 'vuex'
import http from 'axios'
import dmx from 'dmx-api'
import searchStore from './search'
import adminStore from './admin'
import errorHandler from '../error-handler'
import zw from '../zw-globals'

window.addEventListener('focus', updateCookies)

Vue.use(Vuex)

const teamWorkspace = dmx.rpc.getTopicByUri('zukunftswerk.team', true).then(workspace => {      // includeChildren=true
  state.teamWorkspace = workspace
  return workspace
})
const ready = dmx.rpc.getUsername().then(initUserState)
const width = window.innerWidth

const state = {

  ready,                        // a promise, resolved once User state is initialized
  users: [],                    // all users in the system (array of plain Username topics, sorted by username=email
                                // address). "memberships" prop holds respective user's Workspaces (array), initialized
                                // on-demand on a per-user basis, unsorted; a sorted per-user Workspaces array is
                                // available by the "sortedMemberships" getter (object).
  teamWorkspace: undefined,     // the "Team" Workspace topic (dmx.Topic); guaranteed inited once User state is ready

  // User
  username: '',                 // username of current user (String), empty/undefined if not logged in
  workspaces: [],               // ZW shared workspaces of the current user (array of plain Workspace topics),
                                // "assoc" prop holds current user's Membership. "Team" workspace is not included.
                                // Array is unsorted; a sorted array is available by the "sortedWorkspaces" getter.
  workspace: undefined,         // the selected workspace (dmx.Topic, w/o "assoc" prop)
  isWritable: false,            // true if the workspace is writable by the current user (Boolean)
  isEditor: false,              // true if the current user is an editor of the selected workspace (Boolean)
  isTeam: false,                // true if the "Team" workspace is writable by the current user (Boolean)

  // Canvas
  topicmap: undefined,          // the topicmap displayed on canvas (dmx.Topicmap)
  topic: undefined,             // the selected topic (dmx.ViewTopic), undefined if nothing is selected   // TODO: drop
  selection: [],                // the selected topics (array of dmx.ViewTopic)
  pan: {x: 0, y: 0},            // canvas pan (in pixel)                  // TODO: drop this, calculate instead?
  zoom: 1,                      // canvas zoom (Number)                   // TODO: drop this, calculate instead?
  isDragging: false,            // true while canvas pan or panel resize is in progress
  transition: false,            // true while a canvas pan/zoom transition is in progress
  newTopics: [],                // topics being created, not yet saved (array of dmx.ViewTopic)
  isEditActive: [],             // IDs of topics being edited (array)     // TODO: drop this, query model ID instead?
  fullscreen: false,            // if true the current document is rendered fullscreen
  pageNr: {de: {}, fr: {}},     // key: document topic ID, value: pageNr (Number)

  // Discussion Panel
  panelVisibility: true,        // discussion panel visibility (Boolean)
  panelX: 0.65 * width,         // x coordinate in pixel (Number)
  discussion: undefined,        // the comments displayed in discussion panel (array of dmx.RelatedTopic)
  discussionLoading: false,     // true while a discussion is loading
  documentFilter: undefined,    // discussion is filtered by this document (a Document topic, plain object)
  textblockFilter: undefined,   // discussion is filtered by this textblock (a Textblock topic, plain object)
                                // Either one of both is set, or none. TODO: unify these 2

  // Misc
  lang: undefined,              // UI language ('de'/'fr')
  loginMessage: ''              // the status message shown next to Login button
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

  fetchZWWorkspaces () {
    return http.get('/zukunftswerk/workspaces').then(response => {
      state.workspaces = response.data
    })
  },

  fetchAllUsers () {
    if (!state.users.length) {
      return http.get('/zukunftswerk/users').then(response => {
        state.users = response.data.sort(zw.topicSort)
      })
    }
  },

  setLang (_, lang) {
    state.lang = lang
    dmx.utils.setCookie('zw_lang', lang)
  },

  setWorkspace ({dispatch}, workspaceId) {
    if (!workspaceId) {
      throw Error(`${workspaceId} is not a workspace ID`)
    }
    dispatch('deselect')                        // reset selection
    dispatch('setDocumentFilter', undefined)    // reset document-filter
    dispatch('setTextblockFilter', undefined)   // reset textblock-filter
    dmx.rpc.getTopic(workspaceId, true).then(workspace => {           // includeChildren=true
      if (workspace.typeUri !== 'dmx.workspaces.workspace') {
        throw Error(`${workspaceId} is not a workspace (but a ${workspace.typeUri})`)
      }
      state.workspace = workspace
      updateWorkspaceState()
      return updateCookies()
    }).then(() => {
      fetchDiscussion()
      return fetchTopicmap()
    }).then(topicmap => {
      state.topicmap = topicmap
      const viewport = zw.getViewport()
      dispatch('setViewport', {pan: viewport.pan, zoom: viewport.zoom, transition: true})
    }).catch(error => {
      console.warn(`Workspace ${workspaceId} check failed`, error)
    })
  },

  /**
   * Updates the application's selection state according to an *interactive* selection.
   */
  updateSelection (_, {addTopics, removeTopicIds}) {
    state.selection = state.selection.filter(topic => !removeTopicIds.includes(topic.id))
    state.selection.push(...addTopics)
  },

  /**
   * Selects a topic *programmatically*.
   * Precondition: the topic is in DOM already.
   *
   * @param   topic   a dmx.ViewTopic
   */
  select ({dispatch}, topic) {
    state.selection = [topic]
    // update "Selecto" component's internal selection state
    const target = document.querySelector(`.zw-canvas-item[data-id="${topic.id}"]`)
    document.querySelector('.zw-canvas .selecto-selection').__vue__.setSelectedTargets([target])
  },

  /**
   * Removes the selection *programmatically*.
   * Note: *interactive* (de)selection is handled by "Selecto" component, resulting in `updateSelection()`.
   */
  deselect () {
    state.selection = []
    // update "Selecto" component's internal selection state
    // Note: while app initialization components are not yet available, `deselect()` is dispacthed by `setWorkspace()`
    document.querySelector('.zw-canvas .selecto-selection')?.__vue__.setSelectedTargets([])
  },

  storeTopicPos (_, topic) {
    if (topic.id >= 0) {
      dmx.rpc.setTopicPosition(state.topicmap.id, topic.id, topic.pos)      // update server state
    }
  },

  storeTopicCoords (_, topicCoords) {
    dmx.rpc.setTopicPositions(state.topicmap.id, topicCoords)               // update server state
  },

  storeTopicSize (_, topic) {
    if (topic.id >= 0) {
      dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, {
        'dmx.topicmaps.width': topic.viewProps['dmx.topicmaps.width'],
        'dmx.topicmaps.height': topic.viewProps['dmx.topicmaps.height']
      })
    }
  },

  storeTopicAngle (_, topic) {
    if (topic.id >= 0) {
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
    dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, topic.viewProps)
  },

  revealTopic ({dispatch}, topic) {
    dispatch('select', topic)     // programmatic selection
    dispatch('setViewport', {
      pan: {
        x: -topic.pos.x * state.zoom + zw.CANVAS_BORDER,
        y: -topic.pos.y * state.zoom + zw.CANVAS_BORDER
      },
      transition: true
    })
  },

  /**
   * @param   zoom    optional
   */
  setViewport (_, {pan, zoom, transition = false}) {
    // Note: pan/zoom state is not persisted. We have the Viewport topic instead.
    // TODO: update topicmap model?
    state.pan = pan
    if (zoom) {
      state.zoom = zoom
    }
    state.transition = transition
  },

  transitionEnd () {
    state.transition = false
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
        store.dispatch('select', state.selection[0])      // sync Selecto model/view with app state
      })
    }
  },

  initPageNr (_, topicId) {
    const pageNr = state.pageNr[state.lang]
    if (!pageNr[topicId]) {
      Vue.set(pageNr, topicId, 1)
    }
  },

  prevPage (_, topicId) {
    const pageNr = state.pageNr[state.lang]
    if (pageNr[topicId] > 1) {
      pageNr[topicId]--
      return true
    }
  },

  nextPage (_, {topicId, numPages}) {
    const pageNr = state.pageNr[state.lang]
    if (pageNr[topicId] < numPages) {
      pageNr[topicId]++
      return true
    }
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  newTopic ({dispatch}, topic) {
    state.newTopics.push(topic)
    //
    // workaround to prevent body scrolling when new topic exceeds viewport
    document.body.classList.add('fixed')
    Vue.nextTick(() => {
      // a fixed body would not adapt to window resize anymore
      document.body.classList.remove('fixed')
      dispatch('select', topic)       // programmatic selection
    })
  },

  /**
   * @param   type          'note'/'textblock'/'label'
   * @param   topic         a dmx.ViewTopic of the respective type.
   *                        Its "value" is used for topic creation (not its "children").
   * @param   monolingual   Optional: if truish a monolingual topic is created (no auto-translation)
   */
  createTopic ({dispatch}, {type, topic, monolingual}) {
    let p
    if (monolingual)  {
      // Note: a monolingual note/textblock/label is stored in "de". "fr" and "Original Language" are not set.
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
      addTopicToTopicmap(topic, _topic, dispatch)
      removeNewTopic(topic)
    })
  },

  /**
   * @param   topic         a dmx.ViewTopic of type "Document"
   * @param   monolingual   Optional: if truish a monolingual document is created (no auto-translation)
   */
  createDocument ({dispatch}, {topic, monolingual}) {
    let p
    if (monolingual)  {
      // Note: a monolingual document name is stored in "de". "fr" and "Original Language" are not set.
      p = dmx.rpc.createTopic(topic)
    } else {
      const docName = topic.children['zukunftswerk.document_name.de'].value
      const fileId = topic.children['dmx.files.file#zukunftswerk.de'].id
      // suppress standard HTTP error handler
      p = dmx.rpc._http.post('/zukunftswerk/document', docName, {params: {fileId}}).then(response => response.data)
    }
    return p.then(_topic => {
      addTopicToTopicmap(topic, _topic, dispatch)
      removeNewTopic(topic)
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  createArrow ({dispatch}, topic) {
    return dmx.rpc.createTopic(topic).then(_topic => {
      addTopicToTopicmap(topic, _topic, dispatch)
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  updateAndStoreColor ({dispatch}, topic) {
    dispatch('update', topic)
    dmx.rpc.setTopicViewProps(state.topicmap.id, topic.id, {
      'zukunftswerk.color': topic.viewProps['zukunftswerk.color']
    })
  },

  /**
   * @param   topic   a dmx.ViewTopic
   */
  update (_, topic) {
    return dmx.rpc.updateTopic(topic).then(removeEditActive)
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
  updateComment (_, comment) {
    dmx.rpc.updateTopic(comment).then(replaceComment)
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

  jumpToComment (_, {comment, behavior = 'smooth', glow = true}) {
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
    if (glow) {
      const text = document.querySelector(`${commentSelector} .columns`)
      text.classList.add('glow')
      setTimeout(() => {
        text.classList.remove('glow')
      }, 3000)    // corresponds to CSS variable "--glow-duration" in App.vue
    }
  },

  /**
   * @param   doc     a Document topic (plain object)
   */
  revealDocument ({dispatch}, doc) {
    dispatch('revealTopic', state.topicmap.getTopic(doc.id))
    dispatch('setDocumentFilter', doc)
  },

  /**
   * @param   doc     a Textblock topic (plain object)
   */
  revealTextblock ({dispatch}, textblock) {
    dispatch('revealTopic', state.topicmap.getTopic(textblock.id))
    dispatch('setTextblockFilter', textblock)
  },

  /**
   * @param   doc     optional: a Document topic (plain object)
   */
  setDocumentFilter ({dispatch}, doc) {
    state.documentFilter = doc
    if (doc) {
      state.textblockFilter = undefined
      dispatch('setPanelVisibility', true)
    }
    dispatch('updatePlaceholder')
  },

  /**
   * @param   textblock     optional: a Textblock topic (plain object)
   */
  setTextblockFilter ({dispatch}, textblock) {
    state.textblockFilter = textblock
    if (textblock) {
      state.documentFilter = undefined
      dispatch('setPanelVisibility', true)
    }
    dispatch('updatePlaceholder')
  },

  updatePlaceholder () {
      const editor = document.querySelector('.zw-discussion .new-comment .ql-editor')
      // editor is not available
      // 1) while app launch, updatePlaceholder() is called by setWorkspace()     // TODO: revise
      // 2) when discussion panel is closed
      if (editor) {
        const suffix = state.documentFilter ? '_document' : state.textblockFilter ? '_textblock' : ''
        editor.dataset.placeholder = zw.getString('label.new_comment' + suffix)
      }
  },

  edit ({dispatch}, topic) {
    dispatch('select', topic)     // programmatic selection
    state.isEditActive.push(topic.id)
  },

  toggleLock (_, topic) {
    // update client state
    if (!topic.children['zukunftswerk.locked']) {
      Vue.set(topic.children, 'zukunftswerk.locked', {})
    }
    const locked = !topic.children['zukunftswerk.locked'].value
    Vue.set(topic.children['zukunftswerk.locked'], 'value', locked)
    // update server state
    dmx.rpc.updateTopic({
      id: topic.id,
      children: {
        'zukunftswerk.locked': locked
      }
    })
  },

  delete ({dispatch}, topic) {
    dispatch('select', topic)     // programmatic selection
    zw.confirmDeletion().then(() => {
      dispatch('deselect')
      state.topicmap.removeTopic(topic.id)            // update client state
      dmx.rpc.deleteTopic(topic.id)                   // update server state
    }).catch(() => {})            // suppress unhandled rejection on cancel
  },

  deleteMany ({dispatch}, topicIds) {
    zw.confirmDeletion('warning.delete_many', topicIds.length).then(() => {
      dispatch('deselect')
      topicIds.forEach(id => {                        // update client state
        state.topicmap.removeTopic(id)
      })
      dmx.rpc.deleteMulti({topicIds, assocIds: []})   // update server state
    }).catch(() => {})            // suppress unhandled rejection on cancel
  },

  deleteComment (_, comment) {
    zw.confirmDeletion('warning.delete_comment').then(() => {
      removeComment(comment)                          // update client state
      dmx.rpc.deleteTopic(comment.id)                 // update server state
    }).catch(() => {})            // suppress unhandled rejection on cancel
  },

  cancel ({dispatch}, topic) {
    if (topic.id < 0) {
      // abort creation
      removeNewTopic(topic)       // update client state
      dispatch('deselect')
    } else {
      // abort update
      removeEditActive(topic)     // update client state
    }
  },

  /**
   * Precondition: the given topic is visible on canvas.
   */
  updateControlBox () {
    // Note: in some cases the view is already up-to-date (e.g. when dispatched from updated() live-cycle hook), in
    // others it is not (e.g. when dispatched from message-handler (setTopicPosition)). So we *always* wait for the
    // next event cycle (setTimeout).
    // Note: Vue.nextTick() instead shows strange result
    setTimeout(() => {
      document.querySelector('.zw-canvas .content-layer .moveable-control-box').__vue__.updateTarget()
    })
  },

  updateUserProfile ({rootState}, userProfile) {
    return http.put(`/zukunftswerk/user_profile`, undefined, {
      params: userProfile
    }).then(() => {
      updateUserProfile(userProfile)            // update client state
      // rootState.users.sort(zw.topicSort)     // TODO: sort by display name (email address at the moment)
    })
  },

  resetPassword (_, emailAddress) {
    return http.get(`/sign-up/password-token/${emailAddress}/%2f`).then(() => {      // redirectUrl=/ (%2f)
      Vue.prototype.$notify({
        type: 'success',
        title: zw.getString('label.email_sent'),
        message: `${zw.getString('label.to')} ${emailAddress}`,
        showClose: false
      })
    }).catch(error => {
      Vue.prototype.$alert('An error occurred while sending the password reset mail', {
        type: 'error',
        showClose: false
      })
    })
  },

  translate (_, text) {
    // suppress standard HTTP error handler
    return dmx.rpc._http.post('/zukunftswerk/translate', text).then(response => response.data)
  },

  downloadFile (_, repoPath) {
    const url = filerepoUrl(repoPath) + '?download'
    document.querySelector('.zw-download-iframe').contentWindow.location.assign(url)
  },

  getFileContent (_, repoPath) {
    return http.get(filerepoUrl(repoPath)).then(response => response.data)
  }
}

const getters = {

  sortedWorkspaces () {
    return state.workspaces.sort(zw.workspaceSort)
  },

  sortedMemberships () {
    return state.users.reduce((memberships, user) => {
      if (user.memberships) {
        const workspaces = user.memberships.sort(zw.workspaceSort)
        memberships[user.value] = workspaces
      }
      return memberships
    }, {})
  }
}

const store = new Vuex.Store({
  state,
  actions,
  getters
})

store.registerModule('search', searchStore)     // TODO: do static registration instead
store.registerModule('admin', adminStore)       // TODO: do static registration instead
initLang()

export default store

function initLang () {
  let lang
  const langC = dmx.utils.getCookie('zw_lang')
  if (langC) {
    lang = langC
    console.log('[ZW] lang:', lang, '(from cookie)')
  } else {
    const langB = navigator.language.substr(0, 2)
    lang = ['de', 'fr'].includes(langB) ? langB : 'de'      // fallback is 'de'
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
  if (username) {     // Login
    return Promise.all([
      teamWorkspace
        .then(workspace => workspace.isWritable())
        .then(isWritable => {
          state.username = username
          state.isTeam = isWritable
        }),
      store.dispatch('fetchZWWorkspaces'),
      store.dispatch('fetchAllUsers')     // needed for accessing display names
    ])
  } else {            // Logout
    state.username = ''
    state.workspaces = []
    state.isTeam = false
    state.workspace = undefined
    store.dispatch('deselect')
    return Promise.resolve()
  }
}

/**
 * Updates "dmx_workspace_id" and "dmx_topicmap_id" cookies according to "workspace" state.
 *
 * @return  a promise, resolved once the cookies are updated.
 */
function updateCookies () {
  if (state.workspace) {
    // 1) workspace cookie
    dmx.utils.setCookie('dmx_workspace_id', state.workspace.id)
    // 2) topicmap cookie
    return dmx.rpc.getAssignedTopics(state.workspace.id, 'dmx.topicmaps.topicmap').then(topics => {
      // TODO: show warning if there are more than one topicmaps
      const topicmapId = topics[0].id
      dmx.utils.setCookie('dmx_topicmap_id', topicmapId)
    })
  }
}

function updateWorkspaceState () {
  state.workspace.isWritable().then(isWritable => {
    state.isWritable = isWritable
  })
  if (state.workspace.id !== state.teamWorkspace.id) {
    state.isEditor = findWorkspace(state.workspace.id).assoc.children['zukunftswerk.editor']?.value
  }
}

function findWorkspace (id) {
  const workspace = zw.findWorkspace(id)
  if (!workspace) {
    throw Error(`Workspace ${id} not found in ${state.workspaces} (${state.workspaces.length})`)
  }
  return workspace
}

function fetchDiscussion () {
  state.discussion = undefined      // trigger recalculation of "noComments" (zw-discussion.vue), load-spinner appears
  state.discussionLoading = true
  http.get('/zukunftswerk/discussion').then(response => {
    state.discussion = dmx.utils.instantiateMany(response.data, dmx.Topic).sort(
      (c1, c2) => c1.children['dmx.timestamps.created'].value - c2.children['dmx.timestamps.created'].value
    )
    state.discussionLoading = false
  })
}

function fetchTopicmap () {
  const topicmapId = dmx.utils.getCookie('dmx_topicmap_id')
  return dmx.rpc.getTopicmap(topicmapId, true)      // includeChildren=true
}

// TODO: basically copied from admin.js
function updateUserProfile(userProfile) {
  const children = zw.getUser(state.username).children
  if (!children['dmx.signup.display_name']) {   // TODO: refactor
    Vue.set(children, 'dmx.signup.display_name', {})
  }
  children['dmx.signup.display_name'].value = userProfile.displayName
  children['zukunftswerk.show_email_address'].value = userProfile.showEmailAddress
}

/**
 * Transfers "id", "value", and "children" from the given topic to the given viewTopic and adds the viewTopic
 * to the topicmap. Updates both, client state and server state.
 */
function addTopicToTopicmap (viewTopic, topic, dispatch) {
  viewTopic.id       = topic.id
  viewTopic.value    = topic.value
  viewTopic.children = {...viewTopic.children, ...topic.children}   // merge to keep synthetic child values (color)
  state.topicmap.addTopic(viewTopic)                                                // update client state
  dmx.rpc.addTopicToTopicmap(state.topicmap.id, topic.id, viewTopic.viewProps)      // update server state
  Vue.nextTick(() => {
    dispatch('select', viewTopic)     // programmatic selection
  })
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

function filerepoUrl (repoPath) {
  return '/filerepo/' + encodeURIComponent(repoPath)
}
