import { MODULE } from './constants.js'

export function register (updateFunc) {
    game.settings.register(MODULE.ID, 'calculateAttackPenalty', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.setting.calculateAttackPenalty.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.calculateAttackPenalty.hint'
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
            'tokenActionHud.pf2e.setting.colorSkills.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.colorSkills.hint'
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
            'tokenActionHud.pf2e.setting.showStrikeImages.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.showStrikeImages.hint'
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
            'tokenActionHud.pf2e.setting.showStrikeNames.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.showStrikeNames.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'showStrikeTraits', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.setting.showStrikeTraits.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.showStrikeTraits.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'splitStrikes', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.setting.splitStrikes.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.splitStrikes.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'addAuxiliaryActions', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.setting.addAuxiliaryActions.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.addAuxiliaryActions.hint'
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
            'tokenActionHud.pf2e.setting.addDamageAndCritical.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.addDamageAndCritical.hint'
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
            'tokenActionHud.pf2e.setting.addStowedItems.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.addStowedItems.hint'
        ),
        scope: 'client',
        config: true,
        type: String,
        default: 'containers',
        choices: {
            containers: game.i18n.localize('tokenActionHud.pf2e.setting.addStowedItems.choice.containers'),
            nonContainers: game.i18n.localize('tokenActionHud.pf2e.setting.addStowedItems.choice.nonContainers'),
            both: game.i18n.localize('tokenActionHud.pf2e.setting.addStowedItems.choice.both'),
            none: game.i18n.localize('tokenActionHud.pf2e.setting.addStowedItems.choice.none')
        },
        onChange: (value) => {
            updateFunc(value)
        }
    })

    game.settings.register(MODULE.ID, 'addUnequippedItems', {
        name: game.i18n.localize(
            'tokenActionHud.pf2e.setting.addUnequippedItems.name'
        ),
        hint: game.i18n.localize(
            'tokenActionHud.pf2e.setting.addUnequippedItems.hint'
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
