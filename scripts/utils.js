import { MODULE } from './constants.js'
import { Logger } from './config.js'

export class Utils {
    /**
     * Get setting value
     * @param {string} key The key
     * @param {string=null} defaultValue The default value
     * @returns The setting value
     */
    static getSetting (key, defaultValue = null) {
        let value = defaultValue ?? null
        try {
            value = game.settings.get(MODULE.ID, key)
        } catch {
            Logger.debug(`Setting '${key}' not found`)
        }
        return value
    }

    /**
     * Set setting value
     * @param {string} key The key
     * @param {string} value The value
     */
    static async setSetting (key, value) {
        try {
            value = await game.settings.set(MODULE.ID, key, value)
            Logger.debug(`Setting '${key}' set to '${value}'`)
        } catch {
            Logger.debug(`Setting '${key}' not found`)
        }
    }
}
