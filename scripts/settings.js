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

    game.settings.register(MODULE.ID, 'showStrikeImages', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.showStrikeImages.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.showStrikeImages.hint'
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
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'showAuxiliaryActions', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.showAuxiliaryActions.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.showAuxiliaryActions.hint'
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

    game.settings.register(MODULE.ID, 'addStowedItems', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.settings.addStowedItems.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.settings.addStowedItems.hint'
        ),
        scope: 'client',
        config: true,
        type: String,
        default: 'containers',
        choices: {
            containers: game.i18n.localize('tokenActionHud.pf2e.settings.addStowedItems.choices.containers'),
            nonContainers: game.i18n.localize('tokenActionHud.pf2e.settings.addStowedItems.choices.nonContainers'),
            both: game.i18n.localize('tokenActionHud.pf2e.settings.addStowedItems.choices.both'),
            none: game.i18n.localize('tokenActionHud.pf2e.settings.addStowedItems.choices.none')
        },
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
