import Vue from 'vue'
import http from 'axios'
import dmx from 'dmx-api'

const state = {
  primaryPanel: 'zw-workspaces',    // 'zw-workspaces'/'zw-users' ### TODO: drop; utilize router instead (nested routes?)
  secondaryPanel: undefined,        // 'zw-workspace-form' or undefined if secondary panel is not engaged ### TODO: drop
  workspaces: [],                   // all ZW shared workspaces (array of plain Workspace topics)
  users: []                         // all user(name)s in the system (array of plain Username topics)
}

const actions = {

  setPrimaryPanel (_, panel) {
    state.primaryPanel = panel
    state.secondaryPanel = undefined
  },

  setSecondaryPanel (_, panel) {
    state.secondaryPanel = panel
  },

  fetchZWWorkspaces () {
    http.get('/zukunftswerk/admin/workspaces').then(response => {
      state.workspaces = response.data.sort(
        (w1, w2) => w1.value.localeCompare(w2.value)
      )
    })
  },

  createZWWorkspace (_, {nameDe, nameFr}) {
    return http.post('/zukunftswerk/admin/workspace', undefined, {params: {nameDe, nameFr}}).then(response => {
      state.workspaces.push(response.data)
    })
  },

  fetchMemberships (_, workspaceId) {
    const workspace = getWorkspace(workspaceId)
    if (!workspace.memberships) {
      dmx.rpc.getMemberships(workspaceId).then(usernames => {
      // console.log('fetchMemberships', workspaceId, usernames)
        Vue.set(workspace, 'memberships', usernames)      // ad-hoc property is not reactive by default
      })
    }
  },

  fetchUsers () {
    http.get('/zukunftswerk/admin/users').then(response => {
      state.users = response.data.sort(
        (u1, u2) => u1.value.localeCompare(u2.value)
      )
    })
  },

  createUser (_, userModel) {
    // TODO
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
