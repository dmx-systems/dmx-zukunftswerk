import zw from '../../zw-globals'

export default {

  computed: {

    /**
     * Note: the host component is expected to hold "workspace": a Workspace topic.
     */
    workspaceName () {
      // Note: while app launch workspace is not yet known
      return this.workspace && this.getWorkspaceName(this.workspace)
    }
  },

  methods: {
    getWorkspaceName (workspace) {
      return zw.workspaceName(workspace)
    }
  }
}
