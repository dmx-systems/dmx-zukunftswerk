import Vue from 'vue'
import http from 'axios'
import dmx from 'dmx-api'
import zw from '../zw-globals'
import SHA256 from '../lib/sha256'

const ENCODED_PASSWORD_PREFIX = '-SHA256-'

const state = {

  primaryPanel: 'zw-workspace-list',  // 'zw-workspace-list'/'zw-user-list'
  secondaryPanel: undefined,          // 'zw-workspace-form'/... or undefined if secondary panel is not engaged
  formMode: undefined,                // 'create'/'update' (String), relevant only for secondary panel forms
  editBuffer: undefined,

  workspaces: [],                     // all ZW shared workspaces + the "Team" workspace (array of Workspace dmx.Topics)
  expandedWorkspaceIds: [],           // IDs of the workspaces that are expanded
  activeWorkspace: undefined,         // (plain Workspace topic) TODO: rename "selectedWorkspace"?

  // Note: "users" is found in root state (see zukunftswerk.js) as it also holds the user display names
  expandedUsernames: [],              // usernames of the users that are expanded (array of String)
  activeUser: undefined               // (plain Username topic) TODO: rename "selectedUser"?
}

const actions = {

  showWorkspaceForm ({dispatch}, workspace) {
    const type = dmx.typeCache.getTopicType('dmx.workspaces.workspace')
    if (workspace) {
      state.formMode = 'update'
      state.editBuffer = type.newFormModel(workspace.clone())
      dispatch('setActiveWorkspace', workspace)
    } else {
      state.formMode = 'create'
      state.editBuffer = type.newFormModel()
      // console.log('editBuffer', state.editBuffer)
    }
    dispatch('setSecondaryPanel', 'zw-workspace-form')
  },

  showUserForm ({dispatch}, user) {
    if (user) {
      state.formMode = 'update'
      dispatch('setActiveUser', user)
    } else {
      state.formMode = 'create'
    }
    dispatch('setSecondaryPanel', 'zw-user-form')
  },

  setPrimaryPanel (_, panel) {
    state.primaryPanel = panel
    if (panel === 'zw-workspace-list' && state.activeWorkspace) {
      state.secondaryPanel = 'zw-workspace-memberships'
    } else {
      state.secondaryPanel = undefined
    }
  },

  setSecondaryPanel (_, panel) {
    state.secondaryPanel = panel
    /* if (panel === 'zw-workspace-form' || !panel) {
      state.activeWorkspace = undefined
    } */    // TODO
  },

  setActiveWorkspace (_, workspace) {
    state.activeWorkspace = workspace
  },

  setExpandedWorkspaceIds ({dispatch}, workspaceIds) {
    state.expandedWorkspaceIds = workspaceIds
    workspaceIds.forEach(id => {
      dispatch('fetchMemberships', id)
    })
  },

  setExpandedUsernames ({dispatch}, usernames) {
    state.expandedUsernames = usernames
    usernames.forEach(username => {
      dispatch('fetchZWWorkspacesOfUser', username)
    })
  },

  expandWorkspace (_, workspaceId) {
    if (!state.expandedWorkspaceIds.includes(workspaceId)) {
      state.expandedWorkspaceIds.push(workspaceId)
    }
  },

  expandUser (_, username) {
    if (!state.expandedUsernames.includes(username)) {
      state.expandedUsernames.push(username)
    }
  },

  setActiveUser (_, user) {
    state.activeUser = user
  },

  fetchAllZWWorkspaces ({rootState}) {
    http.get('/zukunftswerk/admin/workspaces').then(response => {
      state.workspaces = dmx.utils.instantiateMany(response.data, dmx.Topic)
      state.workspaces.push(rootState.teamWorkspace)
    })
  },

  fetchMemberships (_, workspaceId) {
    const workspace = findWorkspace(workspaceId)
    if (!workspace.memberships) {
      return dmx.rpc.getMemberships(workspaceId).then(users => {
        Vue.set(workspace, 'memberships', users.sort(zw.topicSort))       // ad-hoc property is not reactive by default
      })
    }
  },

  fetchZWWorkspacesOfUser (_, username) {
    const usernameTopic = zw.getUser(username)
    if (!usernameTopic.memberships) {
      return http.get(`/zukunftswerk/admin/user/${username}/workspaces`).then(response => {
        const workspaces = response.data.sort(zw.topicSort)               // FIXME: sort bilingually
        Vue.set(usernameTopic, 'memberships', workspaces)                 // ad-hoc property is not reactive by default
      })
    }
  },

  updateWorkspaceMemberships ({rootState, dispatch}, {addUserIds1, removeUserIds1, addUserIds2, removeUserIds2}) {
    const workspace = state.activeWorkspace
    dispatch('expandWorkspace', workspace.id)
    return http.put(`/zukunftswerk/admin/workspace/${workspace.id}`, undefined, {
      params: {
        addUserIds1: addUserIds1.join(','),
        removeUserIds1: removeUserIds1.join(','),
        addUserIds2: addUserIds2.join(','),
        removeUserIds2: removeUserIds2.join(',')
      }
    }).then(response => {
      const users = response.data
      workspace.memberships = users.sort(zw.topicSort)
      collapseUsers(rootState, dispatch)
    })
  },

  updateUserMemberships ({dispatch}, {addWorkspaceIds1, removeWorkspaceIds1, addWorkspaceIds2, removeWorkspaceIds2}) {
    const username = state.activeUser
    dispatch('expandUser', username.value)
    return http.put(`/zukunftswerk/admin/user/${username.value}`, undefined, {
      params: {
        addWorkspaceIds1: addWorkspaceIds1.join(','),
        removeWorkspaceIds1: removeWorkspaceIds1.join(','),
        addWorkspaceIds2: addWorkspaceIds2.join(','),
        removeWorkspaceIds2: removeWorkspaceIds2.join(',')
      }
    }).then(response => {
      username.memberships = response.data.sort(zw.topicSort)       // FIXME: sort bilingually
      collapseWorkspaces(dispatch)
    })
  },

  createZWWorkspace ({rootState, dispatch}, {nameDe, nameFr}) {
    return http.post('/zukunftswerk/admin/workspace', undefined, {
      params: {nameDe, nameFr}
    }).then(response => {
      state.workspaces.push(new dmx.Topic(response.data))
      // team members are invited automatically, so we need to reset the User area
      collapseUsers(rootState, dispatch)
    })
  },

  updateWorkspace ({rootState, dispatch}, workspace) {
    return dmx.rpc.updateTopic(workspace).then(workspace => {
      replaceWorkspace(workspace, rootState)        // TODO: fetch memberships
      collapseUsers(rootState, dispatch)
    })
  },

  deleteWorkspace (_, workspaceId) {
    return zw.confirmDeletion('warning.delete_workspace').then(() => {
      return dmx.rpc.deleteTopic(workspaceId)       // update server state
    }).then(() => {
      removeWorkspace(workspaceId)                  // update client state
      // TODO: collapse?
    }).catch(() => {})                              // suppress unhandled rejection on cancel
  },

  /**
   * @param   userModel   object w/ "displayName" and "emailAddress" props.
   */
  createUser ({rootState}, userModel) {
    let p
    if (DEV) {
      p = dmx.rpc.createUserAccount(userModel.emailAddress, encodePassword('123'))
    } else {
      const mailbox = userModel.emailAddress
      p = http.get(`/sign-up/check/${mailbox}`).then(response => {
        console.log('isAvailable', response.data)
        if (response.data.isAvailable) {
          return mailbox
        } else {
          return Promise.reject(new Error(`Username "${mailbox}" is already taken`))
        }
      }).then(username => {
        const displayName = userModel.displayName
        const password = btoa(newPassword())
        return http.get(`/sign-up/custom-handle/${username}/${displayName}/${password}`).then(response => response.data)
      })
    }
    return p.then(user => {
      rootState.users.push(user)
      rootState.users.sort(zw.topicSort)              // TODO: sort by display name (email address at the moment)
    })
  },

  updateUser ({rootState}, userModel) {
    const username = userModel.emailAddress
    const displayName = userModel.displayName
    return http.put(`/sign-up/display-name/${username}`, undefined, {
      params: {displayName}
    }).then(() => {
      updateUser(username, displayName)               // update client state
      // rootState.users.sort(zw.topicSort)           // TODO: sort by display name (email address at the moment)
    })
  },

  deleteUser ({rootState}, user) {
    return zw.confirmDeletion('warning.delete_user').then(() => {
      return http.delete(`/ldap/user/${user.value}`)  // update server state
    }).then(() => {
      removeUser(user.id, rootState)                  // update client state
    }).catch(() => {})                                // suppress unhandled rejection on cancel
  }
}

const getters = {
  sortedWorkspaces () {
    return state.workspaces.sort((t1, t2) => zw.workspaceName(t1).localeCompare(zw.workspaceName(t2)))
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters
}

// state helper

function findWorkspace (id) {
  const ws = state.workspaces.find(ws => ws.id === id)
  if (!ws) {
    throw Error(`Workspace ${id} not found`)
  }
  return ws
}

function removeWorkspace (id) {
  const i = state.workspaces.findIndex(ws => ws.id === id)
  if (i === -1) {
    throw Error('removeWorkspace')
  }
  state.workspaces.splice(i, 1)
}

function removeUser (id, rootState) {
  const i = rootState.users.findIndex(u => u.id === id)
  if (i === -1) {
    throw Error('removeUser')
  }
  rootState.users.splice(i, 1)
}

function replaceWorkspace (workspace, rootState) {
  // admin state
  let i = state.workspaces.findIndex(ws => ws.id === workspace.id)
  if (i === -1) {
    throw Error('replaceWorkspace')
  }
  Vue.set(state.workspaces, i, workspace)
  // root state
  i = rootState.workspaces.findIndex(ws => ws.id === workspace.id)
  if (i >= 0) {
    workspace.assoc = rootState.workspaces[i].assoc     // transfer membership of current user
    Vue.set(rootState.workspaces, i, workspace)
  }
}

function updateUser(username, displayName) {
  const children = zw.getUser(username).children
  if (!children['dmx.signup.display_name']) {   // TODO: refactor
    Vue.set(children, 'dmx.signup.display_name', {})
  }
  children['dmx.signup.display_name'].value = displayName
}

function collapseWorkspaces (dispatch) {
  state.workspaces.forEach(workspace => {
    delete workspace.memberships                // force refetch once needed
    dispatch('setExpandedWorkspaceIds', [])     // TODO: don't collapse but refetch later on when needed
  })
}

function collapseUsers (rootState, dispatch) {
  rootState.users.forEach(username => {
    delete username.memberships                 // force refetch once needed
    dispatch('setExpandedUsernames', [])        // TODO: don't collapse but refetch later on when needed
  })
}

// helper

function encodePassword (password) {
  return ENCODED_PASSWORD_PREFIX + SHA256(password)
}

function newPassword () {
  return Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
}
