import http from 'axios'

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

  fetchUsers () {
    http.get('/zukunftswerk/admin/users').then(response => {
      state.users = response.data.sort(
        (u1, u2) => u1.value.localeCompare(u2.value)
      )
    })
  },

  createZWWorkspace (_, {nameDe, nameFr}) {
    return http.post('/zukunftswerk/admin/workspace', undefined, {params: {nameDe, nameFr}}).then(response => {
      state.workspaces.push(response.data)
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
