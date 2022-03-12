/**
 * Note: the host component is expected to hold "workspace": a Workspace topic.
 */
export default {

  computed: {

    workspaceName () {
      if (this.workspaceNameLang) {
        return this.workspaceNames[this.workspaceNameLang]
      } else if (this.workspace) {
        return this.workspace.children['dmx.workspaces.workspace_name'].value
      }
    },

    workspaceNames () {
      if (this.workspace) {
        const de = this.workspace.children['dmx.workspaces.workspace_name#zukunftswerk.de']
        const fr = this.workspace.children['dmx.workspaces.workspace_name#zukunftswerk.fr']
        return {
          de: de && de.value,
          fr: fr && fr.value
        }
      }
    },

    workspaceNameLang () {
      const names = this.workspaceNames
      if (names) {
        if (names.de && names.fr) {
          return this.lang
        } else if (names.de) {
          return 'de'
        } else if (names.fr) {
          return 'fr'
        }
      }
    },

    lang () {
      return this.$store.state.lang
    }
  }
}
