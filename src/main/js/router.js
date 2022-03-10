/**
 * The router.
 * - Initializes app state according to start URL.
 * - Adapts app state when URL changes.
 */

import Vue from 'vue'
import VueRouter from 'vue-router'
import Workspace from './components/zw-workspace'
import Admin from './components/zw-admin'
import store from './store'
import dmx from 'dmx-api'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: Workspace
    },
    {
      path: '/:topicmapId',
      name: 'topicmap',
      component: Workspace
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin
    }
  ]
})

export default router

store.registerModule('routerModule', {

  state: {
    router
  },

  actions: {

    initialNavigation () {
      initialNavigation(router.currentRoute)
    },

    callAdminRoute () {
      router.push({name: 'admin'})
    }
  }
})

// TODO: why does the watcher kick in when an initial URL is present?
// Since when is it this way?
function registerRouteWatcher () {
  store.watch(
    state => state.routerModule.router.currentRoute,
    (to, from) => {
      // console.log('### Route watcher', to, from)
      navigate(to, from)
    }
  )
}

/**
 * Sets up initial app state according to start URL.
 * Pushes the initial route if a redirect is needed.
 */
function initialNavigation (route) {
  //
  registerRouteWatcher()
  //
  const topicmapId = id(route.params.topicmapId)
  let _workspace
  //
  // topicmap validity check
  if (topicmapId) {
    // console.log(`Checking workspace of topicmap ${topicmapId}`)
    // Note: get-assigned-workspace responses are not cached by the browser.
    // In contrast get-topic responses *are* cached by the browser.
    // Doing get-assigned-workspace first avoids working with stale data.
    getAssignedWorkspace(topicmapId, true).then(workspace => {
      _workspace = workspace
      return dmx.rpc.getTopic(topicmapId)
    }).then(topic => {
      if (topic.typeUri !== 'dmx.topicmaps.topicmap') {
        throw Error(`${topicmapId} is not a topicmap (but a ${topic.typeUri})`)
      }
      return dmx.rpc.getTopicmap(topic.id, true)      // includeChildren=true
    }).then(topicmap => {
      store.dispatch('setTopicmap', topicmap)
      store.dispatch('setWorkspace', _workspace)
    }).catch(error => {
      console.warn(`Topicmap ${topicmapId} check failed`, error)
    })
  }
}

/**
 * Adapts app state when route changes.
 */
function navigate (to, from) {
  // TODO
}

const getAssignedWorkspace = dmx.rpc.getAssignedWorkspace

/**
 * Converts the given value into Number.
 *
 * @return  the number, or undefined if `undefined` or `null` is given.
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
    throw Error(`id() expects one of [number|string|undefined|null], got ${v}`)
  }
}
