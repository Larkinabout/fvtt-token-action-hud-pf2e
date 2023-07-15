// System Module Imports
import { ActionHandler } from './action-handler.js'
import { RollHandler as Core } from './roll-handler.js'
import { DEFAULTS } from './defaults.js'
import * as systemSettings from './settings.js'

export let SystemManager = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    SystemManager = class SystemManager extends coreModule.api.SystemManager {
    /** @override */
        doGetCategoryManager (user) {
            return new coreModule.api.CategoryManager()
        }

        /** @override */
        doGetActionHandler (categoryManager) {
            const actionHandler = new ActionHandler(categoryManager)
            return actionHandler
        }

        /** @override */
        getAvailableRollHandlers () {
            const coreTitle = 'Core PF2E'

            const choices = { core: coreTitle }

            return choices
        }

        /** @override */
        doGetRollHandler (handlerId) {
            let rollHandler
            switch (handlerId) {
            case 'core':
            default:
                rollHandler = new Core()
                break
            }

            return rollHandler
        }

        /** @override */
        doRegisterSettings (updateFunc) {
            systemSettings.register(updateFunc)
        }

        /** @override */
        async doRegisterDefaultFlags () {
            const defaults = DEFAULTS
            if (game.modules.get('pf2e-hero-actions')?.active) {
                const listType = coreModule.api.Utils.i18n('tokenActionHud.group')
                const name = coreModule.api.Utils.i18n('tokenActionHud.pf2e.heroActions')
                defaults.groups.push(
                    {
                        id: 'hero-actions',
                        name,
                        listName: `${listType}: ${name}`,
                        type: 'system'
                    }
                )
                defaults.groups.sort((a, b) => a.id.localeCompare(b.id))
            }
            return defaults
        }
    }
})
