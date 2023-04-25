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
export const REQUIRED_CORE_MODULE_VERSION = '1.4'

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

export const GROUP = {
    attack: { id: 'attack', name: 'PF2E.AttackLabel', type: 'system' },
    toggles: { id: 'toggles', name: 'PF2E.TogglesLabel', type: 'system' },
    strikes: { id: 'strikes', name: 'PF2E.StrikesLabel', type: 'system' },
    actions: { id: 'actions', name: 'PF2E.ActionsActionsHeader', type: 'system' },
    reactions: { id: 'reactions', name: 'PF2E.ActionsReactionsHeader', type: 'system' },
    freeActions: { id: 'free-actions', name: 'PF2E.ActionsFreeActionsHeader', type: 'system' },
    passives: { id: 'passives', name: 'PF2E.NPC.PassivesLabel', type: 'system' },
    weapons: { id: 'weapons', name: 'PF2E.InventoryWeaponsHeader', type: 'system' },
    armor: { id: 'armor', name: 'PF2E.InventoryArmorHeader', type: 'system' },
    equipment: { id: 'equipment', name: 'PF2E.InventoryEquipmentHeader', type: 'system' },
    consumables: { id: 'consumables', name: 'PF2E.InventoryConsumablesHeader', type: 'system' },
    containers: { id: 'containers', name: 'PF2E.InventoryBackpackHeader', type: 'system' },
    treasure: { id: 'treasure', name: 'PF2E.InventoryTreasureHeader', type: 'system' },
    ancestryFeatures: { id: 'ancestry-features', name: 'PF2E.FeaturesAncestryHeader', type: 'system' },
    classFeatures: { id: 'class-features', name: 'PF2E.FeaturesClassHeader', type: 'system' },
    ancestryFeats: { id: 'ancestry-feats', name: 'PF2E.FeatAncestryHeader', type: 'system' },
    classFeats: { id: 'class-feats', name: 'PF2E.FeatClassHeader', type: 'system' },
    skillFeats: { id: 'skill-feats', name: 'PF2E.FeatSkillHeader', type: 'system' },
    generalFeats: { id: 'general-feats', name: 'PF2E.FeatGeneralHeader', type: 'system' },
    bonusFeats: { id: 'bonus-feats', name: 'PF2E.FeatBonusHeader', type: 'system' },
    spells: { id: 'spells', name: 'PF2E.SpellLabelPlural', type: 'system' },
    heroPoints: { id: 'hero-points', name: 'PF2E.HeroPointsLabel', type: 'system' },
    initiative: { id: 'initiative', name: 'PF2E.InitiativeLabel', type: 'system' },
    perceptionCheck: { id: 'perception-check', name: 'PF2E.PerceptionLabel', type: 'system' },
    coreSkills: { id: 'core-skills', name: 'PF2E.CoreSkillsHeader', type: 'system' },
    loreSkills: { id: 'lore-skills', name: 'PF2E.LoreSkillsHeader', type: 'system' },
    conditions: { id: 'conditions', name: 'PF2E.ConditionsLabel', type: 'system' },
    effects: { id: 'effects', name: 'PF2E.EffectsLabel', type: 'system' },
    combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
    token: { id: 'token', name: 'tokenActionHud.token', type: 'system' },
    recoveryCheck: { id: 'recovery-check', name: 'PF2E.Check.Specific.Recovery', type: 'system' },
    rests: { id: 'rests', name: 'tokenActionHud.pf2e.rests', type: 'system' },
    saves: { id: 'saves', name: 'PF2E.SavesHeader', type: 'system' },
    utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' }
}
