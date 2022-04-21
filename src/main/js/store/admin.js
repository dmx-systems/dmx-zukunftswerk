import Vue from 'vue'
import http from 'axios'
import dmx from 'dmx-api'
import zw from '../zw-globals'
import SHA256 from '../lib/sha256'

const ENCODED_PASSWORD_PREFIX = '-SHA256-'

const state = {

  primaryPanel: 'zw-workspace-list',  // 'zw-workspace-list'/'zw-user-list'
  secondaryPanel: undefined,          // 'zw-workspace-form'/... or undefined if secondary panel is not engaged

  workspaces: [],                     // all ZW shared workspaces+the "Team" workspace (array of plain Workspace topics)
  expandedWorkspaceIds: [],           // IDs of the workspaces that are expanded
  activeWorkspace: undefined,         // (plain Workspace topic)

  expandedUsernames: [],              // usernames of the users that are expanded (array of String)
  activeUser: undefined               // (plain Username topic)
}

const actions = {

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
    if (panel === 'zw-workspace-form' || !panel) {
      state.activeWorkspace = undefined
    }
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
      state.workspaces = response.data
      return rootState.teamWorkspace
    }).then(workspace => {
      state.workspaces.push(workspace)
      state.workspaces.sort(zw.topicSort)
    })
  },

  fetchMemberships (_, workspaceId) {
    const workspace = findWorkspace(workspaceId)
    if (!workspace.memberships) {
      return dmx.rpc.getMemberships(workspaceId).then(usernames => {
        Vue.set(workspace, 'memberships', usernames.sort(zw.topicSort))   // ad-hoc property is not reactive by default
      })
    }
  },

  fetchZWWorkspacesOfUser (_, username) {
    const usernameTopic = zw.getUser(username)
    if (!usernameTopic.memberships) {
      return http.get(`/zukunftswerk/admin/user/${username}/workspaces`).then(response => {
        const workspaces = response.data.sort(zw.topicSort)
        Vue.set(usernameTopic, 'memberships', workspaces)                 // ad-hoc property is not reactive by default
      })
    }
  },

  updateWorkspaceMemberships ({rootState, dispatch}, {addUserIds, removeUserIds}) {
    const workspace = state.activeWorkspace
    dispatch('expandWorkspace', workspace.id)
    return dmx.rpc.bulkUpdateWorkspaceMemberships(workspace.id, addUserIds, removeUserIds).then(usernames => {
      workspace.memberships = usernames.sort(zw.topicSort)
      rootState.users.forEach(username => {
        delete username.memberships                 // force refetch once needed
        dispatch('setExpandedUsernames', [])        // TODO: don't collapse but refetch later on when needed
      })
    })
  },

  updateUserMemberships ({dispatch}, {addWorkspaceIds, removeWorkspaceIds}) {
    const username = state.activeUser
    dispatch('expandUser', username.value)
    return http.put(`/zukunftswerk/admin/user/${username.value}`, undefined, {
      params: {
        addWorkspaceIds: addWorkspaceIds.join(','),
        removeWorkspaceIds: removeWorkspaceIds.join(',')
      }
    }).then(response => {
      username.memberships = response.data.sort(zw.topicSort)
      state.workspaces.forEach(workspace => {
        delete workspace.memberships                // force refetch once needed
        dispatch('setExpandedWorkspaceIds', [])     // TODO: don't collapse but refetch later on when needed
      })
    })
  },

  createZWWorkspace ({rootState, dispatch}, {nameDe, nameFr}) {
    return http.post('/zukunftswerk/admin/workspace', undefined, {
      params: {nameDe, nameFr}
    }).then(response => {
      state.workspaces.push(response.data)
      state.workspaces.sort(zw.topicSort)
      // team members are invited automatically, so we need to reset the User area
      rootState.users.forEach(username => {
        delete username.memberships                 // force refetch once needed
        dispatch('setExpandedUsernames', [])        // TODO: don't collapse but refetch later on when needed
      })
    })
  },

  deleteWorkspace (_, workspaceId) {
    zw.confirmDeletion('warning.delete_workspace').then(() => {
      return dmx.rpc.deleteTopic(workspaceId)       // update server state
    }).then(() => {
      removeWorkspace(workspaceId)                  // update client state
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
      rootState.users.sort(zw.topicSort)
    })
  }
}

export default {
  namespaced: true,
  state,
  actions
}

// state helper

function findWorkspace (id) {
  return state.workspaces.find(ws => ws.id === id)
}

function removeWorkspace (id) {
  const i = state.workspaces.findIndex(ws => ws.id === id)
  if (i === -1) {
    throw Error('removeWorkspace')
  }
  state.workspaces.splice(i, 1)
}

// helper

function encodePassword (password) {
  return ENCODED_PASSWORD_PREFIX + SHA256(password)
}

function newPassword () {
  return Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
}
