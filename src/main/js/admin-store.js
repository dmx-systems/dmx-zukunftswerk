import http from 'axios'

const state = {
  workspaces: []        // all ZW workspaces (array of plain topic objects)
}

const actions = {
  fetchWorkspaces () {
    http.get('/zukunftswerk/admin/workspaces').then(response => {
      state.workspaces = response.data.sort(
        (w1, w2) => w1.value.localeCompare(w2.value)
      )
    })
  }
}

export default {
  namespaced: true,
  state,
  actions
}
