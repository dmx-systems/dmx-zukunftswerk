/**
 * Note: the host component is expected to hold "workspace": a Workspace topic.
 */
export default {

  computed: {

    workspaceName () {
      return this.getWorkspaceName(this.workspace)
    },

    lang () {
      return this.$store.state.lang
    }
  },

  methods: {
    getWorkspaceName (workspace) {
      const names = getWorkspaceNames(workspace)
      const lang = getWorkspaceNameLang(names, this.lang)
      return names[lang]
    }
  }
}

/**
 * @return    possibly undefined
 */
function getWorkspaceNameLang (names, lang) {
  if (names.de && names.fr) {
    return lang
  } else if (names.de) {
    return 'de'
  } else if (names.fr) {
    return 'fr'
  }
}

/**
 * @param   workspace   optional
 */
function getWorkspaceNames (workspace) {
  return {
    de: workspace?.children['dmx.workspaces.workspace_name#zukunftswerk.de']?.value,
    fr: workspace?.children['dmx.workspaces.workspace_name#zukunftswerk.fr']?.value
  }
}
