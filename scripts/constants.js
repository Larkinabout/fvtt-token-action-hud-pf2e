/**
 * Module-based constants
 */
export const MODULE = {
    ID: 'token-action-hud-pf2e'
}

/**
 * Core module
 */
export const CORE_MODULE = {
    ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = '1.2'

/**
 * Action icons
 */
export const ACTION_ICON = {
    1: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>A</span>',
    2: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>D</span>',
    3: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>T</span>',
    free: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>F</span>',
    reaction: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>R</span>',
    passive: '',
    A: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>A</span>',
    D: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>D</span>',
    T: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>T</span>',
    F: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>F</span>',
    R: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>R</span>'
}

/**
 * Action type
 */
export const ACTION_TYPE = {
    action: 'ITEM.TypeAction',
    attribute: 'tokenActionHud.pf2e.attribute',
    auxAction: 'PF2E.WeaponStrikeLabel',
    condition: 'ITEM.TypeCondition',
    effect: 'ITEM.TypeEffect',
    familiarAttack: 'PF2E.AttackLabel',
    feat: 'PF2E.Item.Feat.LevelLabel',
    item: 'PF2E.ItemTitle',
    save: 'tokenActionHud.pf2e.save',
    skill: 'PF2E.SkillLabel',
    spell: 'ITEM.TypeSpell',
    strike: 'PF2E.WeaponStrikeLabel',
    toggle: 'tokenActionHud.pf2e.toggle',
    utility: 'tokenActionHud.utility'
}

/**
 * Skill abbreviations
 */
export const SKILL_ABBREVIATION = {
    acrobatics: 'acr',
    arcana: 'arc',
    athletics: 'ath',
    crafting: 'cra',
    deception: 'dec',
    diplomacy: 'dip',
    intimidation: 'itm',
    medicine: 'med',
    nature: 'nat',
    occultism: 'occ',
    performance: 'prf',
    religion: 'rel',
    society: 'soc',
    stealth: 'ste',
    survival: 'sur',
    thievery: 'thi'
}

/**
 * Strike icons
 */
export const STRIKE_ICON = {
    melee: `<img class="alt-usage-icon" src="systems/pf2e/icons/mdi/sword.svg" title="Melee Usage" style="
            border: 0;
            filter: invert(1) drop-shadow(1px 1px 1px rgba(0, 0, 0, 1));
            left: 2px;
            padding-top: 3px;
            position: relative;
            ">`,
    thrown: `<img class="alt-usage-icon" src="systems/pf2e/icons/mdi/thrown.svg" title="Thrown Usage" style="
            border: 0;
            filter: invert(1) drop-shadow(1px 1px 1px rgba(0, 0, 0, 1));
            left: 2px;
            padding-top: 3px;
            position: relative;
            ">`
}

export const STRIKE_USAGE = {
    melee: { name: 'PF2E.WeaponRangeMelee' },
    ranged: { name: 'PF2E.NPCAttackRanged' },
    thrown: { name: 'PF2E.TraitThrown' }
}

export const SUBCATEGORY = {
    attack: { id: 'attack', name: 'PF2E.AttackLabel', type: 'system', hasDerivedSubcategories: false },
    toggles: { id: 'toggles', name: 'PF2E.TogglesLabel', type: 'system', hasDerivedSubcategories: false },
    strikes: { id: 'strikes', name: 'PF2E.StrikesLabel', type: 'system', hasDerivedSubcategories: true },
    actions: { id: 'actions', name: 'PF2E.ActionsActionsHeader', type: 'system', hasDerivedSubcategories: false },
    reactions: { id: 'reactions', name: 'PF2E.ActionsReactionsHeader', type: 'system', hasDerivedSubcategories: false },
    freeActions: { id: 'free-actions', name: 'PF2E.ActionsFreeActionsHeader', type: 'system', hasDerivedSubcategories: false },
    passives: { id: 'passives', name: 'PF2E.NPC.PassivesLabel', type: 'system', hasDerivedSubcategories: false },
    weapons: { id: 'weapons', name: 'PF2E.InventoryWeaponsHeader', type: 'system', hasDerivedSubcategories: false },
    armor: { id: 'armor', name: 'PF2E.InventoryArmorHeader', type: 'system', hasDerivedSubcategories: false },
    equipment: { id: 'equipment', name: 'PF2E.InventoryEquipmentHeader', type: 'system', hasDerivedSubcategories: false },
    consumables: { id: 'consumables', name: 'PF2E.InventoryConsumablesHeader', type: 'system', hasDerivedSubcategories: false },
    containers: { id: 'containers', name: 'PF2E.InventoryBackpackHeader', type: 'system', hasDerivedSubcategories: false },
    treasure: { id: 'treasure', name: 'PF2E.InventoryTreasureHeader', type: 'system', hasDerivedSubcategories: false },
    ancestryFeatures: { id: 'ancestry-features', name: 'PF2E.FeaturesAncestryHeader', type: 'system', hasDerivedSubcategories: false },
    classFeatures: { id: 'class-features', name: 'PF2E.FeaturesClassHeader', type: 'system', hasDerivedSubcategories: false },
    ancestryFeats: { id: 'ancestry-feats', name: 'PF2E.FeatAncestryHeader', type: 'system', hasDerivedSubcategories: false },
    classFeats: { id: 'class-feats', name: 'PF2E.FeatClassHeader', type: 'system', hasDerivedSubcategories: false },
    skillFeats: { id: 'skill-feats', name: 'PF2E.FeatSkillHeader', type: 'system', hasDerivedSubcategories: false },
    generalFeats: { id: 'general-feats', name: 'PF2E.FeatGeneralHeader', type: 'system', hasDerivedSubcategories: false },
    bonusFeats: { id: 'bonus-feats', name: 'PF2E.FeatBonusHeader', type: 'system', hasDerivedSubcategories: false },
    spells: { id: 'spells', name: 'PF2E.SpellLabelPlural', type: 'system', hasDerivedSubcategories: true },
    heroPoints: { id: 'hero-points', name: 'PF2E.HeroPointsLabel', type: 'system', hasDerivedSubcategories: false },
    initiative: { id: 'initiative', name: 'PF2E.InitiativeLabel', type: 'system', hasDerivedSubcategories: false },
    perceptionCheck: { id: 'perception-check', name: 'PF2E.PerceptionLabel', type: 'system', hasDerivedSubcategories: false },
    coreSkills: { id: 'core-skills', name: 'PF2E.CoreSkillsHeader', type: 'system', hasDerivedSubcategories: false },
    loreSkills: { id: 'lore-skills', name: 'PF2E.LoreSkillsHeader', type: 'system', hasDerivedSubcategories: false },
    conditions: { id: 'conditions', name: 'PF2E.ConditionsLabel', type: 'system', hasDerivedSubcategories: false },
    effects: { id: 'effects', name: 'PF2E.EffectsLabel', type: 'system', hasDerivedSubcategories: false },
    combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system', hasDerivedSubcategories: false },
    token: { id: 'token', name: 'tokenActionHud.token', type: 'system', hasDerivedSubcategories: false },
    recoveryCheck: { id: 'recovery-check', name: 'PF2E.Check.Specific.Recovery', type: 'system', hasDerivedSubcategories: false },
    rests: { id: 'rests', name: 'tokenActionHud.pf2e.rests', type: 'system', hasDerivedSubcategories: false },
    saves: { id: 'saves', name: 'PF2E.SavesHeader', type: 'system', hasDerivedSubcategories: false },
    utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system', hasDerivedSubcategories: false }
}
