/**
 * Default categories and subcategories
 */
export let DEFAULTS = null

Hooks.on('i18nInit', async () => {
    DEFAULTS = {
        categories: [
            {
                nestId: 'attack',
                id: 'attack',
                name: game.i18n.localize('PF2E.AttackLabel'),
                subcategories: [
                    {
                        nestId: 'attack_attack',
                        id: 'attack',
                        name: game.i18n.localize('PF2E.AttackLabel'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    }
                ]
            },
            {
                nestId: 'actions',
                id: 'actions',
                name: game.i18n.localize('PF2E.ActionsActionsHeader'),
                subcategories: [
                    {
                        nestId: 'actions_toggles',
                        id: 'toggles',
                        name: game.i18n.localize('PF2E.TogglesLabel'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'actions_strikes',
                        id: 'strikes',
                        name: game.i18n.localize('PF2E.StrikesLabel'),
                        type: 'system',
                        hasDerivedSubcategories: true
                    },
                    {
                        nestId: 'actions_actions',
                        id: 'actions',
                        name: game.i18n.localize('PF2E.ActionsActionsHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'actions_reactions',
                        id: 'reactions',
                        name: game.i18n.localize('PF2E.ActionsReactionsHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'actions_free-actions',
                        id: 'free-actions',
                        name: game.i18n.localize('PF2E.ActionsFreeActionsHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'actions_passives',
                        id: 'passives',
                        name: game.i18n.localize('PF2E.NPC.PassivesLabel'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    }
                ]
            },
            {
                nestId: 'inventory',
                id: 'inventory',
                name: game.i18n.localize('PF2E.TabInventoryLabel'),
                subcategories: [
                    {
                        nestId: 'inventory_weapons',
                        id: 'weapons',
                        name: game.i18n.localize('PF2E.InventoryWeaponsHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'inventory_armor',
                        id: 'armor',
                        name: game.i18n.localize('PF2E.InventoryArmorHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'inventory_equipment',
                        id: 'equipment',
                        name: game.i18n.localize('PF2E.InventoryEquipmentHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'inventory_consumables',
                        id: 'consumables',
                        name: game.i18n.localize('PF2E.InventoryConsumablesHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'inventory_containers',
                        id: 'containers',
                        name: game.i18n.localize('PF2E.InventoryBackpackHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'inventory_treasure',
                        id: 'treasure',
                        name: game.i18n.localize('PF2E.InventoryTreasureHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    }
                ]
            },
            {
                nestId: 'feats',
                id: 'feats',
                name: game.i18n.localize('PF2E.TabFeatsLabel'),
                subcategories: [
                    {
                        nestId: 'feats_ancestry-features',
                        id: 'ancestry-features',
                        name: game.i18n.localize('PF2E.FeaturesAncestryHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'feats_class-features',
                        id: 'class-features',
                        name: game.i18n.localize('PF2E.FeaturesClassHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'feats_ancestry-feats',
                        id: 'ancestry-feats',
                        name: game.i18n.localize('PF2E.FeatAncestryHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'feats_class-feats',
                        id: 'class-feats',
                        name: game.i18n.localize('PF2E.FeatClassHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'feats_skill-feats',
                        id: 'skill-feats',
                        name: game.i18n.localize('PF2E.FeatSkillHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'feats_general-feats',
                        id: 'general-feats',
                        name: game.i18n.localize('PF2E.FeatGeneralHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'feats_general-feats',
                        id: 'general-feats',
                        name: game.i18n.localize('PF2E.FeatBonusHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    }
                ]
            },
            {
                nestId: 'spells',
                id: 'spells',
                name: game.i18n.localize('PF2E.SpellLabelPlural'),
                subcategories: [
                    {
                        nestId: 'spells_spells',
                        id: 'spells',
                        name: game.i18n.localize('PF2E.SpellLabelPlural'),
                        type: 'system',
                        hasDerivedSubcategories: true
                    }
                ]
            },
            {
                nestId: 'attributes',
                id: 'attributes',
                name: game.i18n.localize('tokenActionHud.pf2e.attributes'),
                subcategories: [
                    {
                        nestId: 'attributes_hero-points',
                        id: 'hero-points',
                        name: game.i18n.localize('PF2E.HeroPointsLabel'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'attributes_initiative',
                        id: 'initiative',
                        name: game.i18n.localize('PF2E.InitiativeLabel'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'attributes_perception-check',
                        id: 'perception-check',
                        name: game.i18n.localize('PF2E.PerceptionLabel'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'attributes_saves',
                        id: 'saves',
                        name: game.i18n.localize('PF2E.SavesHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    }
                ]
            },
            {
                nestId: 'skills',
                id: 'skills',
                name: game.i18n.localize('PF2E.SkillsLabel'),
                subcategories: [
                    {
                        nestId: 'skills_core-skills',
                        id: 'core-skills',
                        name: game.i18n.localize('PF2E.CoreSkillsHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'skills_lore-skills',
                        id: 'lore-skills',
                        name: game.i18n.localize('PF2E.LoreSkillsHeader'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    }
                ]
            },
            {
                nestId: 'effects',
                id: 'effects',
                name: game.i18n.localize('PF2E.EffectsLabel'),
                subcategories: [
                    {
                        nestId: 'effects_conditions',
                        id: 'conditions',
                        name: game.i18n.localize('PF2E.ConditionsLabel'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'effects_effects',
                        id: 'effects',
                        name: game.i18n.localize('PF2E.EffectsLabel'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    }
                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: game.i18n.localize('tokenActionHud.utility'),
                subcategories: [
                    {
                        nestId: 'utility_combat',
                        id: 'combat',
                        name: game.i18n.localize('tokenActionHud.combat'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'utility_token',
                        id: 'token',
                        name: game.i18n.localize('tokenActionHud.token'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'utility_recovery-check',
                        id: 'recovery-check',
                        name: game.i18n.localize('PF2E.Check.Specific.Recovery'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'utility_rests',
                        id: 'rests',
                        name: game.i18n.localize('tokenActionHud.pf2e.rests'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    },
                    {
                        nestId: 'utility_utility',
                        id: 'utility',
                        name: game.i18n.localize('tokenActionHud.utility'),
                        type: 'system',
                        hasDerivedSubcategories: false
                    }
                ]
            }
        ],
        subcategories: [
            { id: 'attack', name: game.i18n.localize('PF2E.AttackLabel'), type: 'system', hasDerivedSubcategories: false },
            { id: 'toggles', name: game.i18n.localize('PF2E.TogglesLabel'), type: 'system', hasDerivedSubcategories: false },
            { id: 'strikes', name: game.i18n.localize('PF2E.StrikesLabel'), type: 'system', hasDerivedSubcategories: true },
            { id: 'actions', name: game.i18n.localize('PF2E.ActionsActionsHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'reactions', name: game.i18n.localize('PF2E.ActionsReactionsHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'free-actions', name: game.i18n.localize('PF2E.ActionsFreeActionsHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'passives', name: game.i18n.localize('PF2E.NPC.PassivesLabel'), type: 'system', hasDerivedSubcategories: false },
            { id: 'weapons', name: game.i18n.localize('PF2E.InventoryWeaponsHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'armor', name: game.i18n.localize('PF2E.InventoryArmorHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'equipment', name: game.i18n.localize('PF2E.InventoryEquipmentHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'consumables', name: game.i18n.localize('PF2E.InventoryConsumablesHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'containers', name: game.i18n.localize('PF2E.InventoryBackpackHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'treasure', name: game.i18n.localize('PF2E.InventoryTreasureHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'ancestry-features', name: game.i18n.localize('PF2E.FeaturesAncestryHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'class-features', name: game.i18n.localize('PF2E.FeaturesClassHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'ancestry-feats', name: game.i18n.localize('PF2E.FeatAncestryHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'class-feats', name: game.i18n.localize('PF2E.FeatClassHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'skill-feats', name: game.i18n.localize('PF2E.FeatSkillHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'general-feats', name: game.i18n.localize('PF2E.FeatGeneralHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'bonus-feats', name: game.i18n.localize('PF2E.FeatBonusHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'spells', name: game.i18n.localize('PF2E.SpellLabelPlural'), type: 'system', hasDerivedSubcategories: true },
            { id: 'hero-points', name: game.i18n.localize('PF2E.HeroPointsLabel'), type: 'system', hasDerivedSubcategories: false },
            { id: 'initiative', name: game.i18n.localize('PF2E.InitiativeLabel'), type: 'system', hasDerivedSubcategories: false },
            { id: 'perception-check', name: game.i18n.localize('PF2E.PerceptionLabel'), type: 'system', hasDerivedSubcategories: false },
            { id: 'core-skills', name: game.i18n.localize('PF2E.CoreSkillsHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'lore-skills', name: game.i18n.localize('PF2E.LoreSkillsHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'conditions', name: game.i18n.localize('PF2E.ConditionsLabel'), type: 'system', hasDerivedSubcategories: false },
            { id: 'effects', name: game.i18n.localize('PF2E.EffectsLabel'), type: 'system', hasDerivedSubcategories: false },
            { id: 'combat', name: game.i18n.localize('tokenActionHud.combat'), type: 'system', hasDerivedSubcategories: false },
            { id: 'token', name: game.i18n.localize('tokenActionHud.token'), type: 'system', hasDerivedSubcategories: false },
            { id: 'recovery-check', name: game.i18n.localize('PF2E.Check.Specific.Recovery'), type: 'system', hasDerivedSubcategories: false },
            { id: 'rests', name: game.i18n.localize('tokenActionHud.pf2e.rests'), type: 'system', hasDerivedSubcategories: false },
            { id: 'saves', name: game.i18n.localize('PF2E.SavesHeader'), type: 'system', hasDerivedSubcategories: false },
            { id: 'utility', name: game.i18n.localize('tokenActionHud.utility'), type: 'system', hasDerivedSubcategories: false }
        ]
    }
})
