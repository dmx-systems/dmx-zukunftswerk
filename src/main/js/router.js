/**
 * The router: when URL changes adapt app state accordingly.
 */

import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/zw-login'
import Legal from './components/zw-legal'
import Webclient from './components/zw-webclient'
import Workspace from './components/zw-workspace'
import Admin from './components/admin/zw-admin'
import store from './store/zukunftswerk'
import zw from './zw-globals'
import dmx from 'dmx-api'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'root',
      component: Webclient,
      children: [
        {
          path: '/workspace/:workspaceId',
          name: 'workspace',
          component: Workspace
        },
        {
          path: '/admin',
          name: 'admin',
          component: Admin
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/imprint',
      name: 'imprint',
      component: Legal
    },
    {
      path: '/privacy_policy',
      name: 'privacy_policy',
      component: Legal
    }
  ]
})

router.beforeEach((to, from, next) => {
  console.log('guard', to.name, id(to.params.workspaceId))
  store.state.ready.then(() => {
    if (['imprint', 'privacy_policy'].includes(to.name)) {
      next()
    } else if (store.state.username) {
      let init = true
      if (to.name === 'workspace') {
        if (zw.isValidWorkspaceId(id(to.params.workspaceId), 'path param')) {
          next()
          init = false
        }
      } else if (to.name === 'admin') {
        if (store.state.isTeam) {
          next()
          init = false
        } else {
          if (from.name) {
            next(false)
            init = false
          }
        }
      }
      if (init) {
        console.log('guard: call getInitialWorkspaceId')
        store.dispatch('getInitialWorkspaceId').then(workspaceId => {
          next({name: 'workspace', params: {workspaceId}})
        })
      }
    } else {
      if (to.name === 'login') {
        next()
      } else {
        const loc = {name: 'login', query: {}}
        if (to.name === 'workspace') {
          loc.query.workspaceId = to.params.workspaceId
        }
        next(loc)
      }
    }
  }).catch(error => {
    Vue.prototype.$alert(error.message, {
      type: 'error',
      showClose: false
    }).then(() =>
      store.dispatch('logout')
    ).then(() => {
      next({name: 'root'})
    })
  })
})

const state = {
  router
}

const actions = {

  /**
   * @param   workspaceId   optional
   */
  callWorkspaceRoute (_, workspaceId) {
    const id = workspaceId || store.state.workspace.id
    router.push({
      name: 'workspace',
      params: {workspaceId: id}
    })
  },

  callRootRoute () {
    router.push({name: 'root'})
  },

  callLoginRoute () {
    router.push({name: 'login'})
  },

  callImprintRoute () {
    router.push({name: 'imprint'})
  },

  callPrivacyPolicyRoute () {
    router.push({name: 'privacy_policy'})
  },

  callAdminRoute () {
    router.push({name: 'admin'})
  },

  /**
   * Precondition: User state is up-to-date.
   */
  getInitialWorkspaceId () {
    console.log('getInitialWorkspaceId', router.currentRoute)
    // 1) take from URL (query param)
    let workspaceId = id(router.currentRoute.query.workspaceId)
    if (zw.isValidWorkspaceId(workspaceId, 'query param')) {
      return workspaceId
    }
    // 2) take from cookie
    workspaceId = id(dmx.utils.getCookie('dmx_workspace_id'))
    if (zw.isValidWorkspaceId(workspaceId, 'cookie')) {
      return workspaceId
    }
    // 3) team members land in "Team" workspace (at first login there are no ZW event workspaces)
    if (store.state.isTeam) {
      return store.state.teamWorkspace.id
    }
    // 4) take first workspace (based on memberships)
    workspaceId = store.state.workspaces[0]?.id
    if (!workspaceId) {
      throw Error("Benutzer \"" + store.state.username + "\" wurde noch keinem Arbeitsbereich zugeordnet. Bitte nimm " +
        "Kontakt mit dem Zukunftswerk-Team auf. / L'utilisateur \"" + store.state.username + "\" n'a pas encore été " +
        "affecté à un domaine d'activité. Veuillez prendre contact avec l'équipe de Zukunftswerk.")
    }
    return workspaceId
  }
}

export default router

store.registerModule('routerModule', {
  state,
  actions
})

/**
 * Adapts app state when route changes.
 */
store.watch(
  state => state.routerModule.router.currentRoute,
  (to, from) => {
    if (to.name === 'workspace') {
      store.dispatch('setWorkspace', id(to.params.workspaceId))
    }
  }
)

/**
 * Converts the given value into Number.
 *
 * @return  the number, or undefined if `undefined`/`null` is given.
 *          Never returns `null`.
 *
 * @throws  if the given value is not one of Number/String/undefined/null.
 */
function id (v) {
  // Note: Number(undefined) is NaN, and NaN != NaN is true!
  // Note: dmx.utils.getCookie may return null, and Number(null) is 0 (and typeof null is 'object')
  if (typeof v === 'number') {
    return v
  } else if (typeof v === 'string') {
    return Number(v)
  } else if (v !== undefined && v !== null) {
    throw Error(`Expecting one of [number|string|undefined|null], got ${v}`)
  }
}
