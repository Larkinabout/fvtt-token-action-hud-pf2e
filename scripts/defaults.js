import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach(group => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.name)}`
    })
    const groupsArray = Object.values(groups)
    DEFAULTS = {
        layout: [
            {
                nestId: 'attack',
                id: 'attack',
                name: coreModule.api.Utils.i18n('PF2E.AttackLabel'),
                groups: [
                    { ...groups.attack, nestId: 'attack_attack' }
                ]
            },
            {
                nestId: 'strikes',
                id: 'strikes',
                name: coreModule.api.Utils.i18n('PF2E.StrikesLabel'),
                groups: [
                    { ...groups.toggles, nestId: 'strikes_toggles' },
                    { ...groups.strikes, nestId: 'strikes_strikes' }
                ],
                settings: { customWidth: 500 }
            },
            {
                nestId: 'actions',
                id: 'actions',
                name: coreModule.api.Utils.i18n('PF2E.ActionsActionsHeader'),
                groups: [
                    { ...groups.actions, nestId: 'actions_actions' },
                    { ...groups.reactions, nestId: 'actions_reactions' },
                    { ...groups.freeActions, nestId: 'actions_free-actions' },
                    { ...groups.passives, nestId: 'actions_passives' }
                ]
            },
            {
                nestId: 'inventory',
                id: 'inventory',
                name: coreModule.api.Utils.i18n('PF2E.TabInventoryLabel'),
                groups: [
                    { ...groups.weapons, nestId: 'inventory_weapons' },
                    { ...groups.armor, nestId: 'inventory_armor' },
                    { ...groups.equipment, nestId: 'inventory_equipment' },
                    { ...groups.consumables, nestId: 'inventory_consumables' },
                    { ...groups.containers, nestId: 'inventory_containers' },
                    { ...groups.treasure, nestId: 'inventory_treasure' }
                ]
            },
            {
                nestId: 'feats',
                id: 'feats',
                name: coreModule.api.Utils.i18n('PF2E.TabFeatsLabel'),
                groups: [
                    { ...groups.ancestryFeatures, nestId: 'feats_ancestry-features' },
                    { ...groups.classFeatures, nestId: 'feats_class-features' },
                    { ...groups.ancestryFeats, nestId: 'feats_ancestry-feats' },
                    { ...groups.classFeats, nestId: 'feats_class-feats' },
                    { ...groups.skillFeats, nestId: 'feats_skill-feats' },
                    { ...groups.generalFeats, nestId: 'feats_general-feats' },
                    { ...groups.bonusFeats, nestId: 'feats_bonus-feats' }
                ]
            },
            {
                nestId: 'spells',
                id: 'spells',
                name: coreModule.api.Utils.i18n('PF2E.SpellLabelPlural'),
                groups: [
                    { ...groups.spells, nestId: 'spells_spells' }
                ]
            },
            {
                nestId: 'attributes',
                id: 'attributes',
                name: coreModule.api.Utils.i18n('tokenActionHud.pf2e.attributes'),
                groups: [
                    { ...groups.heroPoints, nestId: 'attributes_hero-points' },
                    { ...groups.initiative, nestId: 'attributes_initiative' },
                    { ...groups.perceptionCheck, nestId: 'attributes_perception-check' },
                    { ...groups.saves, nestId: 'attributes_saves' }
                ]
            },
            {
                nestId: 'skills',
                id: 'skills',
                name: coreModule.api.Utils.i18n('PF2E.SkillsLabel'),
                groups: [
                    { ...groups.coreSkills, nestId: 'skills_core-skills' },
                    { ...groups.loreSkills, nestId: 'skills_lore-skills' }
                ]
            },
            {
                nestId: 'effects',
                id: 'effects',
                name: coreModule.api.Utils.i18n('PF2E.EffectsLabel'),
                groups: [
                    { ...groups.conditions, nestId: 'effects_conditions' },
                    { ...groups.effects, nestId: 'effects_effects' }
                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
                groups: [
                    { ...groups.combat, nestId: 'utility_combat' },
                    { ...groups.token, nestId: 'utility_token' },
                    { ...groups.recoveryCheck, nestId: 'utility_recovery-check' },
                    { ...groups.rests, nestId: 'utility_rests' },
                    { ...groups.utility, nestId: 'utility_utility' }
                ]
            }
        ],
        groups: groupsArray
    }
})
