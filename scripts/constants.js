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
export const REQUIRED_CORE_MODULE_VERSION = '2.0'

/**
 * Damage type icons
 */
export const DAMAGE_TYPE_ICONS = {
    axe: 'fa-solid fa-axe fa-fw',
    brain: 'fa-solid fa-brain fa-fw',
    bolt: 'fa-solid fa-bolt fa-fw',
    'bow-arrow': 'fa-solid fa-bow-arrow fa-fw',
    droplet: 'fa-solid fa-droplet fa-fw',
    fire: 'fa-solid fa-fire fa-fw',
    ghost: 'fa-solid fa-ghost fa-fw',
    hammer: 'fa-solid fa-hammer fa-fw',
    skull: 'fa-solid fa-skull fa-fw',
    snowflake: 'fa-solid fa-snowflake fa-fw',
    spider: 'fa-solid fa-spider fa-fw',
    sun: 'fa-solid fa-sun fa-fw',
    vial: 'fa-solid fa-vial fa-fw',
    'waveform-lines': 'fa-solid fa-waveform-lines fa-fw'
}

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
    R: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>R</span>',
    ...DAMAGE_TYPE_ICONS
}

/**
 * Action type
 */
export const ACTION_TYPE = {
    action: 'TYPES.Item.action',
    attribute: 'tokenActionHud.pf2e.attribute',
    condition: 'TYPES.Item.condition',
    effect: 'TYPES.Item.effect',
    familiarAttack: 'PF2E.AttackLabel',
    feat: 'PF2E.Item.Feat.LevelLabel',
    heroAction: 'tokenActionHud.pf2e.heroAction',
    initiative: 'PF2E.InitiativeLabel',
    item: 'PF2E.ItemTitle',
    save: 'tokenActionHud.pf2e.save',
    skill: 'PF2E.SkillLabel',
    skillAction: 'tokenActionHud.pf2e.skillAction',
    spell: 'TYPES.Item.spell',
    strike: 'PF2E.WeaponStrikeLabel',
    strikeAuxiliaryAction: 'PF2E.WeaponStrikeLabel',
    toggle: 'tokenActionHud.pf2e.toggle',
    utility: 'tokenActionHud.utility'
}

/**
 * Carry types icons
 */
export const CARRY_TYPE_ICON = {
    held1: {
        icon: '<span class="fa-stack fa-fw fa-2xs" data-tooltip="placeholder"><i class="fa-solid fa-hand-back-fist fa-stack-2x"></i><i class="fab fa-1 fa-stack-1x" style="filter: invert(1);"></i></span>',
        tooltip: 'PF2E.CarryType.held1'
    },
    held2: {
        icon: '<span class="fa-stack fa-fw fa-2xs" data-tooltip="placeholder"><i class="fa-solid fa-hand-back-fist fa-stack-2x"></i><i class="fab fa-2 fa-stack-1x" style="filter: invert(1);"></i></span>',
        tooltip: 'PF2E.CarryType.held2'
    },
    dropped: {
        icon: '<i class="fas fa-grip-lines fa-fw" data-tooltip="placeholder"></i>',
        tooltip: 'PF2E.CarryType.dropped'
    },
    stowed: {
        icon: '<i class="fas fa-box fa-fw" data-tooltip="placeholder"></i>',
        tooltip: 'PF2E.CarryType.stowed'
    },
    worn: {
        icon: '<i class="fas fa-tshirt fa-fw" data-tooltip="placeholder"></i>',
        tooltip: 'PF2E.CarryType.worn'
    }
}

/**
 * Item types
 */
export const ITEM_TYPE = {
    armor: { groupId: 'armor' },
    consumable: { groupId: 'consumables' },
    backpack: { groupId: 'containers' },
    equipment: { groupId: 'equipment' },
    shield: { groupId: 'shields' },
    treasure: { groupId: 'treasure' },
    weapon: { groupId: 'weapons' }
}

/**
 * Modular options
 */
export const MODULAR_OPTION = {
    bludgeoning: 'PF2E.TraitBludgeoning',
    piercing: 'PF2E.TraitPiercing',
    slashing: 'PF2E.TraitSlashing'
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
    perception: 'per',
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
    melee: 'systems/pf2e/icons/mdi/sword.svg',
    thrown: 'systems/pf2e/icons/mdi/thrown.svg'
}

/**
 * Strike usage
 */
export const STRIKE_USAGE = {
    melee: { name: 'PF2E.WeaponRangeMelee' },
    ranged: { name: 'PF2E.NPCAttackRanged' },
    thrown: { name: 'PF2E.TraitThrown' }
}

/**
 * Groups
 */
export const GROUP = {
    attack: { id: 'attack', name: 'PF2E.AttackLabel', type: 'system' },
    toggles: { id: 'toggles', name: 'PF2E.TogglesLabel', type: 'system' },
    strikes: { id: 'strikes', name: 'PF2E.StrikesLabel', type: 'system' },
    actions: { id: 'actions', name: 'PF2E.ActionsActionsHeader', type: 'system' },
    reactions: { id: 'reactions', name: 'PF2E.ActionsReactionsHeader', type: 'system' },
    freeActions: { id: 'free-actions', name: 'PF2E.ActionsFreeActionsHeader', type: 'system' },
    passives: { id: 'passives', name: 'PF2E.NPC.PassivesLabel', type: 'system' },
    skillActionsGrouped: { id: 'skill-actions-grouped', name: 'tokenActionHud.pf2e.skillActions', listName: 'tokenActionHud.pf2e.skillActionsGrouped', type: 'system' },
    skillActionsUngrouped: { id: 'skill-actions-ungrouped', name: 'tokenActionHud.pf2e.skillActions', listName: 'tokenActionHud.pf2e.skillActionsUngrouped', type: 'system', settings: { sort: true } },
    weapons: { id: 'weapons', name: 'tokenActionHud.pf2e.weapons', type: 'system' },
    shields: { id: 'shields', name: 'tokenActionHud.pf2e.shields', type: 'system' },
    armor: { id: 'armor', name: 'tokenActionHud.pf2e.armor', type: 'system' },
    equipment: { id: 'equipment', name: 'tokenActionHud.pf2e.equipment', type: 'system' },
    consumables: { id: 'consumables', name: 'tokenActionHud.pf2e.consumables', type: 'system' },
    containers: { id: 'containers', name: 'tokenActionHud.pf2e.containers', type: 'system' },
    treasure: { id: 'treasure', name: 'tokenActionHud.pf2e.treasure', type: 'system' },
    ancestryFeatures: { id: 'ancestry-features', name: 'PF2E.Actor.Character.FeatSlot.AncestryFeaturesHeader', type: 'system' },
    classFeatures: { id: 'class-features', name: 'PF2E.Actor.Character.FeatSlot.ClassFeaturesHeader', type: 'system' },
    ancestryFeats: { id: 'ancestry-feats', name: 'PF2E.Actor.Character.FeatSlot.AncestryHeader', type: 'system' },
    classFeats: { id: 'class-feats', name: 'PF2E.Actor.Character.FeatSlot.ClassHeader', type: 'system' },
    skillFeats: { id: 'skill-feats', name: 'PF2E.Actor.Character.FeatSlot.SkillHeader', type: 'system' },
    generalFeats: { id: 'general-feats', name: 'PF2E.Actor.Character.FeatSlot.GeneralHeader', type: 'system' },
    bonusFeats: { id: 'bonus-feats', name: 'PF2E.Actor.Character.FeatSlot.BonusHeader', type: 'system' },
    spells: { id: 'spells', name: 'PF2E.Item.Spell.Plural', type: 'system' },
    heroPoints: { id: 'hero-points', name: 'PF2E.Actor.Resource.HeroPoints', type: 'system' },
    mythicPoints: { id: 'mythic-points', name: 'PF2E.Actor.Resource.MythicPoints', type: 'system' },
    initiative: { id: 'initiative', name: 'PF2E.InitiativeLabel', type: 'system' },
    perceptionCheck: { id: 'perception-check', name: 'PF2E.PerceptionLabel', type: 'system' },
    coreSkills: { id: 'core-skills', name: 'PF2E.CoreSkillsHeader', type: 'system' },
    loreSkills: { id: 'lore-skills', name: 'PF2E.LoreSkillsHeader', type: 'system' },
    conditions: { id: 'conditions', name: 'PF2E.ConditionsLabel', type: 'system' },
    socialConditions: { id: 'social-conditions', name: 'tokenActionHud.pf2e.socialConditions', type: 'system' },
    otherConditions: { id: 'other-conditions', name: 'tokenActionHud.pf2e.otherConditions', type: 'system' },
    effects: { id: 'effects', name: 'PF2E.EffectsLabel', type: 'system' },
    combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
    token: { id: 'token', name: 'tokenActionHud.token', type: 'system' },
    recoveryCheck: { id: 'recovery-check', name: 'PF2E.Check.Specific.Recovery', type: 'system' },
    rests: { id: 'rests', name: 'tokenActionHud.pf2e.rests', type: 'system' },
    saves: { id: 'saves', name: 'PF2E.SavesHeader', type: 'system' },
    utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' }
}

/**
 * Skill actions
 */
export const SKILL_ACTION = {
    l5pbgrj8SSNtRGs8: { name: 'PF2E.Actions.AdministerFirstAid.Stabilize.Title', actionCost: 2, skill: 'medicine', image: 'systems/pf2e/icons/features/feats/treat-wounds.webp' },
    ZEWD4zcEDQwYhVT8: { name: 'PF2E.Actions.AdministerFirstAid.StopBleeding.Title', actionCost: 2, skill: 'medicine', image: 'systems/pf2e/icons/conditions/persistent-damage.webp' },
    '55mxH0w8UkY1o3Xv': { name: 'PF2E.Actions.Balance.Title', skill: 'acrobatics', actionCost: 1, image: 'icons/skills/movement/feet-winged-boots-brown.webp' },
    LXCy1iJddD95Z91s: { name: 'PF2E.Actions.Climb.Title', skill: 'athletics', actionCost: 1, image: 'icons/sundries/misc/ladder.webp' },
    '9RNumMausgG7adgL': { name: 'PF2E.Actions.Coerce.Title', skill: 'intimidation', actionCost: 'passive', image: 'icons/skills/social/intimidation-impressing.webp' },
    xcrdOOiN0l6O1sIn: { name: 'PF2E.Actions.CommandAnAnimal.Title', skill: 'nature', actionCost: 1, image: 'icons/environment/creatures/horse-white.webp' },
    zn0HadZeoKDALxRu: { name: 'PF2E.Actions.ConcealAnObject.Title', skill: 'stealth', actionCost: 1, image: 'systems/pf2e/icons/equipment/adventuring-gear/wax-key-blank.webp' },
    Tu7LIRelQsiOuo1l: { name: 'PF2E.Actions.Craft.Title', skill: 'crafting', actionCost: 'passive', image: 'icons/skills/trades/smithing-anvil-silver-red.webp' },
    aDsYSdRqiC6qQIOQ: { name: 'PF2E.Actions.CreateADiversion.DistractingWords.Title', skill: 'deception', actionCost: 1, image: 'icons/magic/control/mouth-smile-deception-purple.webp' },
    zUJ0UhuoFt5a7tiN: { name: 'PF2E.Actions.CreateADiversion.Gesture.Title', skill: 'deception', actionCost: 1, image: 'icons/skills/social/wave-halt-stop.webp' },
    '1JpYPlIkjyseE9JU': { name: 'PF2E.Actions.CreateADiversion.Trick.Title', skill: 'deception', actionCost: 1, image: 'systems/pf2e/icons/spells/charming-words.webp' },
    mNphXpAkmGsMadUv: { name: 'PF2E.Actions.CreateForgery.Title', skill: 'society', actionCost: 'passive', image: 'systems/pf2e/icons/spells/transcribe-moment.webp' },
    U6WjxFPn4fUqIrfl: { name: 'PF2E.Actions.DecipherWriting.Title', skill: 'arcana', actionCost: 'passive', image: 'icons/skills/trades/academics-book-study-runes.webp' },
    RZyfkw1DiqVy3JUC: { name: 'PF2E.Actions.DecipherWriting.Title', skill: 'occultism', actionCost: 'passive', image: 'icons/skills/trades/academics-book-study-purple.webp' },
    sDUERv4E88G5BRPr: { name: 'PF2E.Actions.DecipherWriting.Title', skill: 'religion', actionCost: 'passive', image: 'systems/pf2e/icons/equipment/other/spellbooks/thresholds-of-truth.webp' },
    YWAvvDXpdW1fYPFo: { name: 'PF2E.Actions.DecipherWriting.Title', skill: 'society', actionCost: 'passive', image: 'icons/skills/trades/academics-study-reading-book.webp' },
    nEwqNNWX6scLt4sc: { name: 'PF2E.Actions.Demoralize.Title', skill: 'intimidation', actionCost: 1, image: 'icons/skills/social/intimidation-impressing.webp' },
    T2QNEoRojMWEec4a: { name: 'PF2E.Actions.DisableDevice.Title', skill: 'thievery', actionCost: 2, image: 'systems/pf2e/icons/equipment/adventuring-gear/thieves-tools.webp' },
    ooiO59Ch2QaebOmc: { name: 'PF2E.Actions.Disarm.Title', skill: 'athletics', actionCost: 1, image: 'icons/skills/melee/sword-damaged-broken-glow-red.webp' },
    '50Q0DYL33Kalu1BH': { name: 'PF2E.Actions.Escape.Title', skill: 'acrobatics', actionCost: 1, image: 'icons/skills/movement/feet-winged-boots-glowing-yellow.webp' },
    lkEcQQss16SIrVxM: { name: 'PF2E.Actions.Escape.Title', skill: 'athletics', actionCost: 1, image: 'icons/skills/movement/feet-winged-boots-glowing-yellow.webp' },
    RjfPFjqPrNve6eeh: { name: 'PF2E.Actions.Feint.Title', skill: 'deception', actionCost: 1, image: 'icons/skills/melee/maneuver-sword-katana-yellow.webp' },
    yMTKMnaYSGtDz4wk: { name: 'PF2E.Actions.ForceOpen.Title', skill: 'athletics', actionCost: 1, image: 'icons/equipment/feet/boots-armored-steel.webp' },
    rCgGPEyXbzLFcio6: { name: 'PF2E.Actions.GatherInformation.Title', skill: 'diplomacy', actionCost: 'passive', image: 'icons/skills/social/diplomacy-handshake.webp' },
    i95kcGLIQKOTsnv6: { name: 'PF2E.Actions.Grapple.Title', skill: 'athletics', actionCost: 'passive', image: 'icons/skills/melee/unarmed-punch-fist.webp' },
    FlM3HvpnsZpCKawG: { name: 'PF2E.Actions.Hide.Title', skill: 'stealth', actionCost: 1, image: 'systems/pf2e/icons/features/classes/wild.webp' },
    v3dlDjFlOmT5T2gC: { name: 'PF2E.Actions.HighJump.Title', skill: 'athletics', actionCost: 2, image: 'icons/skills/movement/arrows-up-trio-red.webp' },
    k5nW4jGyXD0Oq9LR: { name: 'PF2E.Actions.Impersonate.Title', skill: 'deception', actionCost: 'passive', image: 'icons/equipment/head/mask-carved-scream-tan.webp' },
    VTg4t8kYTvXcHROq: { name: 'PF2E.Actions.Lie.Title', skill: 'deception', actionCost: 'passive', image: 'icons/magic/control/mouth-smile-deception-purple.webp' },
    QPsV0qi2zXm7syt6: { name: 'PF2E.Actions.LongJump.Title', skill: 'athletics', actionCost: 2, image: 'icons/skills/movement/figure-running-gray.webp' },
    '1Sj2Pz3VI2SFWqZw': { name: 'PF2E.Actions.MakeAnImpression.Title', skill: 'diplomacy', actionCost: 'passive', image: 'icons/environment/people/commoner.webp' },
    '9Ul5Op5OceT9P5SS': { name: 'PF2E.Actions.ManeuverInFlight.Title', skill: 'acrobatics', actionCost: 1, image: 'icons/commodities/biological/wing-bird-white.webp' },
    Gj68YCVlDjc75iCP: { name: 'PF2E.Actions.PalmAnObject.Title', skill: 'thievery', actionCost: 1, image: 'icons/sundries/gaming/playing-cards.webp' },
    dWcrojMk0d2WRPBq: { name: 'PF2E.Actions.Perform.Title', skill: 'performance', actionCost: 1, image: 'icons/skills/trades/music-singing-voice-blue.webp' },
    '8YrH37NzKRuiKFbF': { name: 'PF2E.Actions.PickALock.Title', skill: 'thievery', actionCost: 2, image: 'icons/sundries/misc/lock-bronze-reinforced.webp' },
    BQTA7bL264189Xla: { name: 'PF2E.Actions.Repair.Title', skill: 'crafting', actionCost: 'passive', image: 'icons/tools/smithing/anvil.webp' },
    tbveXG4gaIoKnsWX: { name: 'PF2E.Actions.Request.Title', skill: 'diplomacy', actionCost: 1, image: 'icons/skills/social/thumbsup-approval-like.webp' },
    tikhJ2b6AMh7wQU7: { name: 'PF2E.Actions.Seek.Title', skill: 'perception', actionCost: 1, image: 'icons/tools/scribal/magnifying-glass.webp' },
    LN67MgbGE8IHb2X0: { name: 'PF2E.Actions.SenseDirection.Title', skill: 'survival', actionCost: 'passive', image: 'icons/tools/navigation/compass-brass-blue-red.webp' },
    PmHt7Gb5fCrlWWTr: { name: 'PF2E.Actions.SenseMotive.Title', skill: 'perception', actionCost: 1, image: 'icons/environment/people/commoner.webp' },
    yNry1xMZqdWHncbV: { name: 'PF2E.Actions.Shove.Title', skill: 'athletics', actionCost: 1, image: 'systems/pf2e/icons/spells/hydraulic-push.webp' },
    HSTkVuv0SjTNK3Xx: { name: 'PF2E.Actions.Sneak.Title', skill: 'stealth', actionCost: 1, image: 'systems/pf2e/icons/conditions/unnoticed.webp' },
    UKHPveLpG7hUs4D0: { name: 'PF2E.Actions.Squeeze.Title', skill: 'acrobatics', actionCost: 'passive', image: 'icons/commodities/tech/claw-mechanical.webp' },
    zjovbAeuLvyuWFKd: { name: 'PF2E.Actions.Steal.Title', skill: 'thievery', actionCost: 1, image: 'icons/containers/bags/coinpouch-gold-red.webp' },
    mkKko3CEBCyJVQw1: { name: 'PF2E.Actions.Subsist.Title', skill: 'society', actionCost: 'passive', image: 'icons/environment/settlement/building-rubble.webp' },
    zkqh01BoXDVgydzo: { name: 'PF2E.Actions.Subsist.Title', skill: 'survival', actionCost: 'passive', image: 'icons/environment/wilderness/camp-improvised.webp' },
    TIlUkCzviYxdVk4E: { name: 'PF2E.Actions.Swim.Title', skill: 'athletics', actionCost: 1, image: 'icons/creatures/fish/fish-shark-swimming.webp' },
    Al5LYMMdeDcpC9Br: { name: 'PF2E.Actions.Track.Title', skill: 'survival', actionCost: 'passive', image: 'systems/pf2e/icons/conditions/observed.webp' },
    m4iM5r3TfvQs5Y2n: { name: 'PF2E.Actions.TreatDisease.Title', skill: 'medicine', actionCost: 'passive', image: 'icons/magic/nature/root-vine-caduceus-healing.webp' },
    R03LRl2RBbsm6EcF: { name: 'PF2E.Actions.TreatPoison.Title', skill: 'medicine', actionCost: 1, image: 'systems/pf2e/icons/effects/treat-poison.webp' },
    gRj7xUfcpUZQLrOC: { name: 'PF2E.Actions.Trip.Title', skill: 'athletics', actionCost: 1, image: 'icons/skills/wounds/bone-broken-marrow-yellow.webp' },
    '2qhYHkcSsTJoSwrJ': { name: 'PF2E.Actions.TumbleThrough.Title', skill: 'acrobatics', actionCost: 1, image: 'icons/skills/movement/feet-winged-sandals-tan.webp' }
}

/**
 * Skills
 */
export const SKILL = {
    acrobatics: { name: 'PF2E.SkillAcrobatics' },
    arcana: { name: 'PF2E.SkillArcana' },
    athletics: { name: 'PF2E.SkillAthletics' },
    crafting: { name: 'PF2E.SkillCrafting' },
    deception: { name: 'PF2E.SkillDeception' },
    diplomacy: { name: 'PF2E.SkillDiplomacy' },
    intimidation: { name: 'PF2E.SkillIntimidation' },
    lore: { name: 'PF2E.SkillLore' },
    medicine: { name: 'PF2E.SkillMedicine' },
    nature: { name: 'PF2E.SkillNature' },
    occultism: { name: 'PF2E.SkillOccultism' },
    perception: { name: 'PF2E.PerceptionLabel' },
    performance: { name: 'PF2E.SkillPerformance' },
    religion: { name: 'PF2E.SkillReligion' },
    society: { name: 'PF2E.SkillSociety' },
    stealth: { name: 'PF2E.SkillStealth' },
    survival: { name: 'PF2E.SkillSurvival' },
    thievery: { name: 'PF2E.SkillThievery' }
}
