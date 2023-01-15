import zw from '../../zw-globals'

/**
 * Note: the host component is expected to hold "workspace": a Workspace topic.
 */
export default {

  computed: {
    workspaceName () {
      return this.getWorkspaceName(this.workspace)
    }
  },

  methods: {
    getWorkspaceName (workspace) {
      return zw.workspaceName(workspace)
    }
  }
}
