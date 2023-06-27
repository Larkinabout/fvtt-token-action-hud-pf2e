import { MODULE } from './constants.js'

export function register (updateFunc) {
    game.settings.register(MODULE.ID, 'calculateAttackPenalty', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.calculateAttackPenalty.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.calculateAttackPenalty.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'colorSkills', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.colorSkills.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.colorSkills.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'showStrikeNames', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.showStrikeNames.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.showStrikeNames.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'splitStrikes', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.splitStrikes.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.splitStrikes.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'addDamageAndCritical', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.addDamageAndCritical.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.addDamageAndCritical.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'addUnequippedItems', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.addUnequippedItems.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.addUnequippedItems.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })
}
