import store from './store'

export default message => {
  switch (message.type) {
  case 'createComment':
    if (message.args.workspaceId === store.state.workspace.id) {
      store.dispatch('newComment', message.args.comment)
    }
  }
}
