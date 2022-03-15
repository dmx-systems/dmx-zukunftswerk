import Vue from 'vue'
import http from 'axios'
import dmx from 'dmx-api'
import SHA256 from './lib/sha256'

const ENCODED_PASSWORD_PREFIX = '-SHA256-'

const state = {
  primaryPanel: 'zw-workspaces',   // 'zw-workspaces'/'zw-users' ### TODO: drop; utilize router instead (nested routes?)
  secondaryPanel: undefined,       // 'zw-workspace-form' or undefined if secondary panel is not engaged ### TODO: drop
  workspaces: [],                  // all ZW shared workspaces (array of plain Workspace topics)
  users: [],                       // all users in the system (array of plain Username topics)
  activeWorkspace: undefined,      // (plain Workspace topic)
  activeUser: undefined            // (plain Username topic)
}

const actions = {

  setPrimaryPanel (_, panel) {
    state.primaryPanel = panel
    if (panel === 'zw-workspaces' && state.activeWorkspace) {
      state.secondaryPanel = 'zw-membership-form'
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

  setActiveUser (_, user) {
    state.activeUser = user
  },

  fetchZWWorkspaces () {
    http.get('/zukunftswerk/admin/workspaces').then(response => {
      state.workspaces = response.data.sort(
        (w1, w2) => w1.value.localeCompare(w2.value)
      )
    })
  },

  createZWWorkspace (_, {nameDe, nameFr}) {
    return http.post('/zukunftswerk/admin/workspace', undefined, {
      params: {nameDe, nameFr}
    }).then(response => {
      state.workspaces.push(response.data)
    })
  },

  fetchMemberships (_, workspaceId) {
    const workspace = getWorkspace(workspaceId)
    if (!workspace.memberships) {
      return dmx.rpc.getMemberships(workspaceId).then(usernames => {
        // console.log('fetchMemberships', workspaceId, usernames)
        Vue.set(workspace, 'memberships', usernames)      // ad-hoc property is not reactive by default
      })
    } else {
      return Promise.resolve()
    }
  },

  updateMemberships (_, {addUserIds, removeUserIds}) {
    console.log('updateMemberships', addUserIds, removeUserIds)
    const workspace = state.activeWorkspace
    dmx.rpc.bulkUpdateWorkspaceMemberships(workspace.id, addUserIds, removeUserIds).then(usernames => {
      workspace.memberships = usernames
    })
  },

  fetchUsers () {
    if (!state.users.length) {
      // console.log('fetchUsers')
      return http.get('/zukunftswerk/admin/users').then(response => {
        state.users = response.data.sort(
          (u1, u2) => u1.value.localeCompare(u2.value)
        )
      })
    } else {
      return Promise.resolve()
    }
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

function getWorkspace (id) {
  return state.workspaces.find(ws => ws.id === id)
}

// helper

function encodePassword (password) {
  return ENCODED_PASSWORD_PREFIX + SHA256(password)
}
