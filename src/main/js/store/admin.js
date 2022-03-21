import Vue from 'vue'
import http from 'axios'
import dmx from 'dmx-api'
import SHA256 from '../lib/sha256'

const ENCODED_PASSWORD_PREFIX = '-SHA256-'

const state = {

  primaryPanel: 'zw-workspace-list',  // 'zw-workspace-list'/'zw-user-list'
  secondaryPanel: undefined,          // 'zw-workspace-form'/... or undefined if secondary panel is not engaged

  workspaces: [],                     // all ZW shared workspaces+the "Team" workspace (array of plain Workspace topics)
  expandedWorkspaceIds: [],           // IDs of the workspaces that are expanded
  activeWorkspace: undefined,         // (plain Workspace topic)

  users: [],                          // all users in the system (array of plain Username topics)
  expandedUsernames: [],              // usernames of the users that are expanded
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
    // console.log('expandWorkspace', workspaceId, state.expandedWorkspaceIds)
    if (!state.expandedWorkspaceIds.includes(workspaceId)) {
      state.expandedWorkspaceIds.push(workspaceId)
    }
  },

  setActiveUser (_, user) {
    state.activeUser = user
  },

  fetchAllZWWorkspaces ({rootState}) {
    http.get('/zukunftswerk/admin/workspaces').then(response => {
      state.workspaces = response.data.sort(
        (w1, w2) => w1.value.localeCompare(w2.value)
      )
      return rootState.teamWorkspace
    }).then(workspace => {
      state.workspaces.push(workspace)
    })
  },

  fetchAllUsers () {
    if (!state.users.length) {
      // console.log('fetchAllUsers')
      return http.get('/zukunftswerk/admin/users').then(response => {
        state.users = response.data.sort(
          (u1, u2) => u1.value.localeCompare(u2.value)
        )
      })
    } else {
      return Promise.resolve()
    }
  },

  fetchMemberships (_, workspaceId) {
    const workspace = findWorkspace(workspaceId)
    if (!workspace.memberships) {
      return dmx.rpc.getMemberships(workspaceId).then(usernames => {
        // console.log('fetchMemberships', workspaceId, usernames)
        Vue.set(workspace, 'memberships', usernames)          // ad-hoc property is not reactive by default
      })
    } else {
      return Promise.resolve()
    }
  },

  fetchZWWorkspacesOfUser (_, username) {
    const usernameTopic = findUser(username)
    if (!usernameTopic.memberships) {
      return http.get(`/zukunftswerk/admin/user/${username}/workspaces`).then(response => {
        const workspaces = response.data
        Vue.set(usernameTopic, 'memberships', workspaces)     // ad-hoc property is not reactive by default
      })
    } else {
      return Promise.resolve()
    }
  },

  updateMemberships ({dispatch}, {addUserIds, removeUserIds}) {
    // console.log('updateMemberships', addUserIds, removeUserIds)
    const workspace = state.activeWorkspace
    dispatch('expandWorkspace', workspace.id)
    return dmx.rpc.bulkUpdateWorkspaceMemberships(workspace.id, addUserIds, removeUserIds).then(usernames => {
      workspace.memberships = usernames
    })
  },

  createZWWorkspace (_, {nameDe, nameFr}) {
    return http.post('/zukunftswerk/admin/workspace', undefined, {
      params: {nameDe, nameFr}
    }).then(response => {
      state.workspaces.push(response.data)
    })
  },

  createUser (_, userModel) {
    // TODO. Just for testing.
    return dmx.rpc.createUserAccount(userModel.emailAddress, encodePassword('123')).then(user => {
      state.users.push(user)
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

function findUser (username) {
  return state.users.find(ws => ws.value === username)
}

// helper

function encodePassword (password) {
  return ENCODED_PASSWORD_PREFIX + SHA256(password)
}
