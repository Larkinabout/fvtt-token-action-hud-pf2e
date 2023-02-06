// System Module Imports
import { ActionHandler } from './action-handler.js'
import { RollHandler as Core } from './roll-handler.js'
import { DEFAULTS } from './defaults.js'
import * as systemSettings from './settings.js'
import { Utils } from './utils.js'

// Core Module Imports
import { CoreSystemManager, CoreCategoryManager, CoreUtils } from './config.js'

export class SystemManager extends CoreSystemManager {
    /** @override */
    doGetCategoryManager (user) {
        return new CoreCategoryManager()
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
        await CoreUtils.setUserFlag('default', defaults)
    }
}
