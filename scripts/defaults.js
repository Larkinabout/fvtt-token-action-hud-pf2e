import { SUBCATEGORY } from './constants.js'

/**
 * Default categories and subcategories
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const subcategories = SUBCATEGORY
    Object.values(subcategories).forEach(subcategory => {
        subcategory.name = coreModule.api.Utils.i18n(subcategory.name)
        subcategory.listName = `Subcategory: ${coreModule.api.Utils.i18n(subcategory.name)}`
    })
    const subcategoriesArray = Object.values(subcategories)
    DEFAULTS = {
        categories: [
            {
                nestId: 'attack',
                id: 'attack',
                name: coreModule.api.Utils.i18n('PF2E.AttackLabel'),
                subcategories: [
                    { ...subcategories.attack, nestId: 'attack_attack' }
                ]
            },
            {
                nestId: 'actions',
                id: 'actions',
                name: coreModule.api.Utils.i18n('PF2E.ActionsActionsHeader'),
                subcategories: [
                    { ...subcategories.toggles, nestId: 'actions_toggles' },
                    { ...subcategories.strikes, nestId: 'actions_strikes' },
                    { ...subcategories.actions, nestId: 'actions_actions' },
                    { ...subcategories.reactions, nestId: 'actions_reactions' },
                    { ...subcategories.freeActions, nestId: 'actions_free-actions' },
                    { ...subcategories.passives, nestId: 'actions_passives' }
                ]
            },
            {
                nestId: 'inventory',
                id: 'inventory',
                name: coreModule.api.Utils.i18n('PF2E.TabInventoryLabel'),
                subcategories: [
                    { ...subcategories.weapons, nestId: 'inventory_weapons' },
                    { ...subcategories.armor, nestId: 'inventory_armor' },
                    { ...subcategories.equipment, nestId: 'inventory_equipment' },
                    { ...subcategories.consumables, nestId: 'inventory_consumables' },
                    { ...subcategories.containers, nestId: 'inventory_containers' },
                    { ...subcategories.treasure, nestId: 'inventory_treasure' }
                ]
            },
            {
                nestId: 'feats',
                id: 'feats',
                name: coreModule.api.Utils.i18n('PF2E.TabFeatsLabel'),
                subcategories: [
                    { ...subcategories.ancestryFeatures, nestId: 'feats_ancestry-features' },
                    { ...subcategories.classFeatures, nestId: 'feats_class-features' },
                    { ...subcategories.ancestryFeats, nestId: 'feats_ancestry-feats' },
                    { ...subcategories.classFeats, nestId: 'feats_class-feats' },
                    { ...subcategories.skillFeats, nestId: 'feats_skill-feats' },
                    { ...subcategories.generalFeats, nestId: 'feats_general-feats' },
                    { ...subcategories.bonusFeats, nestId: 'feats_bonus-feats' }
                ]
            },
            {
                nestId: 'spells',
                id: 'spells',
                name: coreModule.api.Utils.i18n('PF2E.SpellLabelPlural'),
                subcategories: [
                    { ...subcategories.spells, nestId: 'spells_spells' }
                ]
            },
            {
                nestId: 'attributes',
                id: 'attributes',
                name: coreModule.api.Utils.i18n('tokenActionHud.pf2e.attributes'),
                subcategories: [
                    { ...subcategories.heroPoints, nestId: 'attributes_hero-points' },
                    { ...subcategories.initiative, nestId: 'attributes_initiative' },
                    { ...subcategories.perceptionCheck, nestId: 'attributes_perception-check' },
                    { ...subcategories.saves, nestId: 'attributes_saves' }
                ]
            },
            {
                nestId: 'skills',
                id: 'skills',
                name: coreModule.api.Utils.i18n('PF2E.SkillsLabel'),
                subcategories: [
                    { ...subcategories.coreSkills, nestId: 'skills_core-skills' },
                    { ...subcategories.loreSkills, nestId: 'skills_lore-skills' }
                ]
            },
            {
                nestId: 'effects',
                id: 'effects',
                name: coreModule.api.Utils.i18n('PF2E.EffectsLabel'),
                subcategories: [
                    { ...subcategories.conditions, nestId: 'effects_conditions' },
                    { ...subcategories.effects, nestId: 'effects_effects' }
                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
                subcategories: [
                    { ...subcategories.combat, nestId: 'utility_combat' },
                    { ...subcategories.token, nestId: 'utility_token' },
                    { ...subcategories.recoveryCheck, nestId: 'utility_recovery-check' },
                    { ...subcategories.rests, nestId: 'utility_rests' },
                    { ...subcategories.utility, nestId: 'utility_utility' }
                ]
            }
        ],
        subcategories: subcategoriesArray
    }
})
