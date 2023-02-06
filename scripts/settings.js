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
}
