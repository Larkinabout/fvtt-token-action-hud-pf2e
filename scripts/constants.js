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
export const REQUIRED_CORE_MODULE_VERSION = '1.1'

/**
 * Action icons
 */
export const ACTION_ICONS = {
    1: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>A</span>',
    2: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>D</span>',
    3: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>T</span>',
    free: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>F</span>',
    reaction: '<span style=\'font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);\'>R</span>',
    passive: ''
}

/**
 * Skill abbreviations
 */
export const SKILL_ABBREVIATIONS = {
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
export const STRIKE_ICONS = {
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

export const STRIKE_USAGES = {
    melee: { name: 'PF2E.WeaponRangeMelee' },
    ranged: { name: 'PF2E.NPCAttackRanged' },
    thrown: { name: 'PF2E.TraitThrown' }
}
