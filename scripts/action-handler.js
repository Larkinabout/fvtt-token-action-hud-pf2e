// System Module Imports
import { ACTION_ICONS, SKILL_ABBREVIATIONS, STRIKE_ICONS, STRIKE_USAGES } from './constants.js'
import { Utils } from './utils.js'

// Core Module Imports
import { CoreActionHandler, CoreUtils, Logger } from './config.js'

export class ActionHandler extends CoreActionHandler {
    // Initialize actor and token variables
    actor = null
    actors = null
    actorId = null
    actorType = null
    character = null
    token = null
    tokenId = null

    // Initialize items variable
    items = null

    // Initialize setting variables
    abbreviateSkills = null
    calculateAttackPenalty = null

    // Initialize subcategoryIds variables
    subcategoryIds = null
    activationSubcategoryIds = null
    effectSubcategoryIds = null
    featSubcategoryIds = null
    inventorySubcategoryIds = null
    spellSubcategoryIds = null

    // Initialize action variables
    featureActions = null
    inventoryActions = null
    spellActions = null

    /**
     * Build System Actions
     * @override
     * @param {object} character
     * @param {array} subcategoryIds
     */
    async buildSystemActions (character, subcategoryIds) {
        // Set actor and token variables
        this.actor = character?.actor
        this.actorId = this.actor?.id ?? 'multi'
        this.actors = (this.actorId === 'multi') ? this._getActors() : [this.actor]
        this.actorType = this.actor?.type
        this.token = character?.token
        this.tokenId = this.token?.id ?? 'multi'

        // Exit if actor is not required type
        const knownActors = ['character', 'npc', 'familiar']
        if (this.actorType && !knownActors.includes(this.actorType)) return

        // Set items variable
        if (this.actorId !== 'multi') {
            let items = this.actor.items
            items = this.sortItemsByName(items)
            this.items = items
        }

        // Set settings variables
        this.abbreviateSkills = Utils.getSetting('abbreviateSkills')
        this.calculateAttackPenalty = Utils.getSetting('calculateAttackPenalty')

        // Set subcategory variables
        this.subcategoryIds = subcategoryIds

        this.actionSubcategoryIds = subcategoryIds.filter(subcategoryId =>
            subcategoryId === 'actions' ||
            subcategoryId === 'reactions' ||
            subcategoryId === 'free-actions' ||
            subcategoryId === 'passives'
        )

        this.featSubcategoryIds = subcategoryIds.filter(subcategoryId =>
            subcategoryId === 'ancestry-features' ||
            subcategoryId === 'class-features' ||
            subcategoryId === 'ancestry-feats' ||
            subcategoryId === 'class-feats' ||
            subcategoryId === 'skill-feats' ||
            subcategoryId === 'general-feats' ||
            subcategoryId === 'bonus-feats'
        )

        this.inventorySubcategoryIds = subcategoryIds.filter(subcategoryId =>
            subcategoryId === 'equipped' ||
            subcategoryId === 'consumables' ||
            subcategoryId === 'containers' ||
            subcategoryId === 'equipment' ||
            subcategoryId === 'loot' ||
            subcategoryId === 'tools' ||
            subcategoryId === 'weapons' ||
            subcategoryId === 'unequipped'
        )

        this.skillSubcategoryIds = subcategoryIds.filter(subcategoryId =>
            subcategoryId === 'core-skills' ||
            subcategoryId === 'lore-skills')

        if (this.actorType === 'character') {
            await this._buildCharacterActions()
        }
        if (this.actorType === 'familiar') {
            await this._buildFamiliarActions()
        }
        if (this.actorType === 'npc') {
            await this._buildNpcActions()
        }
        if (!this.actor) {
            this._buildMultipleTokenActions()
        }
    }

    /**
     * Build character actions
     * @private
     * @param {object} actionList
     * @param {object} character
     * @param {array} subcategoryIds
     * @param {array} inventorySubcategoryIds
     * @returns {object}
     */
    async _buildCharacterActions () {
        this._buildActions()
        this._buildCombat()
        await this._buildConditions()
        this._buildEffects()
        this._buildFeats()
        this._buildHeroPoints()
        this._buildInitiative()
        this._buildInventory()
        this._buildPerceptionCheck()
        this._buildRecoveryCheck()
        this._buildRests()
        this._buildSaves()
        this._buildSkills()
        await this._buildSpells()
        this._buildStrikes()
        this._buildToggles()
    }

    /**
     * Build familiar actions
     * @private
     */
    async _buildFamiliarActions () {
        this._buildAttack()
        this._buildCombat()
        await this._buildConditions()
        this._buildEffects()
        this._buildInitiative()
        this._buildInventory()
        this._buildPerceptionCheck()
        this._buildSaves()
        this._buildSkills()
    }

    /**
     * Build NPC actions
     */
    async _buildNpcActions () {
        this._buildActions()
        this._buildCombat()
        await this._buildConditions()
        this._buildEffects()
        this._buildFeats()
        this._buildInitiative()
        this._buildInventory()
        this._buildPerceptionCheck()
        this._buildSaves()
        this._buildSkills()
        this._buildStrikes()
        await this._buildSpells()
    }

    /**
     * Build multiple token actions
     * @private
     * @returns {object}
     */
    _buildMultipleTokenActions () {
        this._buildInitiative()
        this._buildPerceptionCheck()
        this._buildSaves()
        this._buildSkills()
    }

    /**
     * Build actions
     */
    _buildActions () {
        if (!this.actionSubcategoryIds) return

        const actionType = 'action'

        // Exit early if no items exist
        if (this.items.size === 0) return

        const actionItems = new Map([...this.items].filter(item => item[1].type === 'action'))

        const actionsMap = new Map()

        for (const [key, value] of actionItems) {
            // Set variables
            const actionTypeValue = value.system.actionType?.value

            switch (actionTypeValue) {
            case 'action':
                if (!actionsMap.has('actions')) actionsMap.set('actions', new Map())
                actionsMap.get('actions').set(key, value)
                break
            case 'reaction':
                if (!actionsMap.has('reactions')) actionsMap.set('reactions', new Map())
                actionsMap.get('reactions').set(key, value)
                break
            case 'free':
                if (!actionsMap.has('free-actions')) actionsMap.set('free-actions', new Map())
                actionsMap.get('free-actions').set(key, value)
                break
            case 'passive':
                if (!actionsMap.has('passives')) actionsMap.set('passives', new Map())
                actionsMap.get('passives').set(key, value)
                break
            }
        }

        // Loop through inventory subcateogry ids
        for (const subcategoryId of this.actionSubcategoryIds) {
            if (!actionsMap.has(subcategoryId)) continue

            // Create subcategory data
            const subcategoryData = { id: subcategoryId, type: 'system' }

            const actions = actionsMap.get(subcategoryId)

            // Build actions
            this._addActions(actions, subcategoryData, actionType)
        }

        /*   const exploration = this.initializeEmptySubcategory()
        exploration.actions = this._produceActionMap(
            tokenId,
            (filteredActions ?? []).filter((a) =>
                a.system.traits?.value.includes('exploration')
            ),
            macroType
        )

        const downtime = this.initializeEmptySubcategory()
        downtime.actions = this._produceActionMap(
            tokenId,
            (filteredActions ?? []).filter((a) =>
                a.system.traits?.value.includes('downtime')
            ),
            macroType
        ) */
    }

    /**
     * Build attacks
     * @private
     */
    _buildAttack () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('attack')) return

        const actionType = 'familiarAttack'

        const attack = this.actor.system.attack

        if (attack) {
            const id = attack.slug
            const name = attack.name.charAt(0).toUpperCase() + attack.name.slice(1)
            const encodedValue = [actionType, this.actorId, this.tokenId, id].join(this.delimiter)
            const info1 = attack.totalModifier < 0 ? attack.totalModifier : `+${attack.totalModifier}`

            // Get actions
            const actions = [{
                id,
                name,
                encodedValue,
                info1
            }]

            // Create subcategory data
            const subcategoryData = { id: 'attack', type: 'system' }

            // Add actions to action list
            this.addActionsToActionList(actions, subcategoryData)
        }
    }

    /**
     * Build combat
     */
    _buildCombat () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('combat')) return

        const actionType = 'utility'

        // Set combat types
        const combatTypes = {
            endTurn: { id: 'endTurn', name: CoreUtils.i18n('tokenActionHud.endTurn') }
        }

        // Delete endTurn for multiple tokens
        if (game.combat?.current?.tokenId !== this.tokenId) delete combatTypes.endTurn

        // Get actions
        const actions = Object.entries(combatTypes).map((combatType) => {
            const id = combatType[1].id
            const name = combatType[1].name
            const encodedValue = [actionType, this.actorId, this.tokenId, id].join(this.delimiter)
            return {
                id,
                name,
                encodedValue
            }
        })

        // Create subcategory data
        const subcategoryData = { id: 'combat', type: 'system' }

        // Add actions to action list
        this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Build conditions
     * @private
     */
    async _buildConditions () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('conditions')) return

        const actionType = 'condition'

        const limitedConditions = ['doomed', 'dying', 'wounded']

        // Get active conditions
        const activeConditions = new Map(
            [...this.items]
                .filter(item => item[1].type === actionType)
                .map(item => {
                    const itemData = item[1]
                    return [
                        itemData.slug,
                        itemData
                    ]
                })
        )

        // Get conditions
        const conditions = [...game.pf2e.ConditionManager.conditions]

        // Build actions
        const actions = conditions.map(condition => {
            const id = condition[1].slug
            const activeCondition = activeConditions.get(condition[0])
            const activeConditionId = activeCondition?.id
            const name = condition[1].name
            const encodedValue = [actionType, this.actorId, this.tokenId, id].join(this.delimiter)
            const img = CoreUtils.getImage(condition[1])
            const active = (activeConditionId) ? ' active' : ''
            const cssClass = `toggle${active}`
            let info1 = ''
            if (activeConditionId) {
                if (limitedConditions.includes(activeCondition.slug)) {
                    const attribute = this.actor.system.attributes[activeCondition.slug]
                    const value = attribute.value
                    const max = attribute.max
                    info1 = { text: (max > 0) ? `${value ?? 0}/${max}` : '' }
                } else if (activeCondition.system.value.isValued) {
                    info1 = { text: activeCondition.system.value.value }
                }
            }
            return {
                id,
                name,
                encodedValue,
                cssClass,
                img,
                info1
            }
        })

        // Create subcategory data
        const subcategoryData = { id: 'conditions', type: 'system' }

        // Add actions to action list
        await this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Build hero points
     */
    async _buildHeroPoints () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('hero-points')) return

        const actionType = 'heroPoints'

        // Create subcategory data
        const subcategoryData = { id: 'hero-points', type: 'system' }

        const heroPoints = this.actor.system.resources?.heroPoints
        const value = heroPoints.value
        const max = heroPoints.max

        // Get actions
        const actions = [{
            id: 'heroPoints',
            name: CoreUtils.i18n('PF2E.HeroPointsLabel'),
            encodedValue: [actionType, this.actorId, this.tokenId, actionType].join(this.delimiter),
            info1: { text: (max > 0) ? `${value ?? 0}/${max}` : '' }
        }]

        // Add actions to action list
        this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Build effects
     * @private
     */
    _buildEffects () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('effects')) return

        const actionType = 'effect'

        // Get effects
        const effects = new Map([...this.items].filter(item => item[1].type === 'effect' && (!(item.unidentified ?? false) || game.user.isGM)))

        // Create subcategory data
        const subcategoryData = { id: 'effects', type: 'system' }

        // Build actions
        this._addActions(effects, subcategoryData, actionType)
    }

    /**
     * Build Feats
     * @private
     */
    _buildFeats () {
        // Exit if no subcategories exist
        if (!this.featSubcategoryIds) return

        const actionType = 'feat'
        const featTypes = {
            ancestryfeature: 'ancestry-features',
            classfeature: 'class-features',
            ancestry: 'ancestry-feats',
            class: 'class-feats',
            skill: 'skill-feats',
            general: 'general-feats',
            bonus: 'bonus-feats'
        }

        // Get feats
        const featsMap = new Map()

        for (const [key, value] of this.items) {
            const featType = value.featType
            if (!featsMap.has(featType)) featsMap.set(featType, new Map())
            featsMap.get(featType).set(key, value)
        }

        for (const [key, value] of featsMap) {
            const featType = key
            const feats = value

            const subcategoryId = featTypes[featType]

            // Exit if subcategory does not exist
            if (!this.featSubcategoryIds.includes(subcategoryId)) continue

            // Get subcategory data
            const subcategoryData = { id: subcategoryId, type: 'system' }

            // Build actions
            this._addActions(feats, subcategoryData, actionType)
        }
    }

    /**
     * Build initiative
     * @private
     */
    _buildInitiative () {
        // Exit if no subcategory existsp
        if (!this.subcategoryIds.includes('initiative')) return

        const actionType = 'initiative'

        const initiative = (this.actorId !== 'multi') ? this.actor.system.attributes.initiative : 'PF2E.InitiativeLabel'
        const totalModifier = initiative.totalModifier
        const modifier = (totalModifier || totalModifier === 0) ? `${(totalModifier > 0) ? '+' : ''}${totalModifier}` : ''

        // Get actions
        const actions = [{
            id: 'initiative',
            name: (initiative.label) ? initiative.label : (typeof initiative === 'string') ? CoreUtils.i18n(initiative) : '',
            encodedValue: [actionType, this.actorId, this.tokenId, 'initiative'].join(this.delimiter),
            info1: { text: modifier }
        }]

        // Create subcategory data
        const subcategoryData = { id: 'initiative', type: 'system' }

        // Add actions to action list
        this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Build inventory
     * @private
     */
    _buildInventory () {
        // Exit if no subcategories exist
        if (!this.inventorySubcategoryIds) return

        // Exit early if no items exist
        if (this.items.size === 0) return

        const inventoryMap = new Map()

        for (const [key, value] of this.items) {
            // Set variables
            const hasQuantity = value.system?.quantity > 0
            const isEquippedItem = this._isEquippedItem(value)
            const type = value.type

            // Set items into maps
            if (hasQuantity) {
                if (isEquippedItem) {
                    if (!inventoryMap.has('equipped')) inventoryMap.set('equipped', new Map())
                    inventoryMap.get('equipped').set(key, value)
                }
                if (!isEquippedItem) {
                    if (!inventoryMap.has('unequipped')) inventoryMap.set('unequipped', new Map())
                    inventoryMap.get('unequipped').set(key, value)
                }
                if (isEquippedItem) {
                    if (type === 'armor' && this.actorType === 'character') {
                        if (!inventoryMap.has('armors')) inventoryMap.set('armors', new Map())
                        inventoryMap.get('armors').set(key, value)
                    }
                    if (type === 'consumable') {
                        if (!inventoryMap.has('consumables')) inventoryMap.set('consumables', new Map())
                        inventoryMap.get('consumables').set(key, value)
                    }
                    if (type === 'backpack') {
                        if (!inventoryMap.has('containers')) inventoryMap.set('containers', new Map())
                        inventoryMap.get('containers').set(key, value)
                    }
                    if (type === 'equipment') {
                        if (!inventoryMap.has('equipment')) inventoryMap.set('equipment', new Map())
                        inventoryMap.get('equipment').set(key, value)
                    }
                    if (type === 'treasure') {
                        if (!inventoryMap.has('treasure')) inventoryMap.set('treasure', new Map())
                        inventoryMap.get('treasure').set(key, value)
                    }
                    if (type === 'weapon') {
                        if (!inventoryMap.has('weapons')) inventoryMap.set('weapons', new Map())
                        inventoryMap.get('weapons').set(key, value)
                    }
                }
            }
        }

        // Loop through inventory subcateogry ids
        for (const subcategoryId of this.inventorySubcategoryIds) {
            if (!inventoryMap.has(subcategoryId)) continue

            // Create subcategory data
            const subcategoryData = { id: subcategoryId, type: 'system' }

            const inventory = inventoryMap.get(subcategoryId)

            // Build actions
            this._addActions(inventory, subcategoryData)
        }
    }

    /**
     * Build perception check
     * @private
     */
    _buildPerceptionCheck () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('perception-check')) return

        const actionType = 'perceptionCheck'

        const perception = (this.actorId !== 'multi') ? this.actor.system.attributes.perception : CONFIG.PF2E.attributes.perception
        const totalModifier = perception.totalModifier
        const modifier = (totalModifier || totalModifier === 0) ? `${(totalModifier > 0) ? '+' : ''}${totalModifier}` : ''

        // Get actions
        const actions = [{
            id: 'perception',
            name: CoreUtils.i18n(CONFIG.PF2E.attributes.perception),
            encodedValue: [actionType, this.actorId, this.tokenId, 'perception'].join(this.delimiter),
            info1: { text: modifier }
        }]

        // Create subcategory data
        const subcategoryData = { id: 'perception-check', type: 'system' }

        // Add actions to action list
        this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Build recovery check
     */
    _buildRecoveryCheck () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('recovery-check')) return

        const actionType = 'recoveryCheck'

        const dyingPoints = this.actor.system.attributes?.dying

        if (dyingPoints?.value >= 1) {
            // Get actions
            const actions = [{
                id: actionType,
                name: CoreUtils.i18n('PF2E.Check.Specific.Recovery'),
                encodedValue: [actionType, this.actorId, this.tokenId, actionType].join(this.delimiter)
            }]

            // Create subcategory data
            const subcategoryData = { id: 'recovery-check', type: 'system' }

            // Add actions to action list
            this.addActionsToActionList(actions, subcategoryData)
        }
    }

    /**
     * Build rests
     */
    _buildRests () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('rests')) return

        // Exit if multiple actors and not every actor is not the character type
        if (this.actorId === 'multi' && !this.actors.every(actor => actor.type === 'character')) return

        const actionType = 'utility'

        const actions = [
            {
                id: 'treatWounds',
                name: CoreUtils.i18n('PF2E.Actions.TreatWounds.Label'),
                encodedValue: [actionType, this.actorId, this.tokenId, 'treatWounds'].join(this.delimiter)
            },
            {
                id: 'rest',
                name: CoreUtils.i18n('PF2E.Actor.Character.Rest.Label'),
                encodedValue: [actionType, this.actorId, this.tokenId, 'rest'].join(this.delimiter)
            }
        ]

        // Take a Breather
        if (game.settings.get('pf2e', 'staminaVariant')) {
            actions.push({
                id: 'takeBreather',
                name: CoreUtils.i18n('tokenActionHud.pf2e.takeBreather'),
                encodedValue: [actionType, this.actorId, this.tokenId, 'takeBreather'].join(this.delimiter)
            })
        }

        // Create subcategory data
        const subcategoryData = { id: 'rests', type: 'system' }

        // Add actions to action list
        this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Build saves
     * @private
     */
    _buildSaves () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('saves')) return

        const actionType = 'save'

        // Get saves
        const saves = (this.actorId !== 'multi') ? Object.entries(this.actor.saves) : Object.entries(CONFIG.PF2E.saves)

        // Get actions
        const actions = saves.map((save) => {
            const id = save[0]
            const name = save[1].label ?? (typeof save[1] === 'string' ? CoreUtils.i18n(save[1]) : '')
            const encodedValue = [actionType, this.actorId, this.tokenId, id].join(this.delimiter)
            return {
                id,
                name,
                encodedValue
            }
        })

        // Get subcategory data
        const subcategoryData = { id: 'saves', type: 'system' }

        // Add actions to action list
        this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Build skills
     * @private
     */
    _buildSkills () {
        // Exit if no subcategory exists
        if (!this.skillSubcategoryIds) return

        const actionType = 'skill'

        // Get skills
        const skills = (this.actorId !== 'multi')
            ? Object.entries(this.actor.skills).filter(skill => !!skill[1].label && skill[1].label.length > 1)
            : this._getSharedSkills()

        const skillsMap = new Map()

        for (const skill of skills) {
            // Set variables
            const isLore = skill[1].lore

            // Set skills into maps
            if (!skillsMap.has('skills')) skillsMap.set('skills', new Map())
            skillsMap.get('skills').set(skill[0], skill[1])
            if (isLore) {
                if (!skillsMap.has('lore-skills')) skillsMap.set('lore-skills', new Map())
                skillsMap.get('lore-skills').set(skill[0], skill[1])
            }
            if (!isLore) {
                if (!skillsMap.has('core-skills')) skillsMap.set('core-skills', new Map())
                skillsMap.get('core-skills').set(skill[0], skill[1])
            }
        }

        // Loop through inventory subcateogry ids
        for (const subcategoryId of this.skillSubcategoryIds) {
            if (!skillsMap.has(subcategoryId)) continue

            // Create subcategory data
            const subcategoryData = { id: subcategoryId, type: 'system' }

            const skills = skillsMap.get(subcategoryId)

            // Get actions
            const actions = [...skills].map(skill => {
                const id = skill[0]
                const data = skill[1]
                const label = CoreUtils.i18n(data.label) ?? CoreUtils.i18n(CONFIG.PF2E.skillList[skill[0]])
                const name = this.abbreviatedSkills ? SKILL_ABBREVIATIONS[data.slug] ?? label : label
                const encodedValue = [actionType, this.actorId, this.tokenId, id].join(this.delimiter)
                const mod = data.check?.mod
                const info1 = (mod || mod === 0) ? `${(mod > 0) ? '+' : ''}${mod}` : ''

                return {
                    id,
                    name,
                    encodedValue,
                    info1
                }
            })

            // Add actions to action list
            this.addActionsToActionList(actions, subcategoryData)
        }
    }

    /**
     * Get shared skills between all actors
     * @returns {object}
     */
    _getSharedSkills () {
        const allSkillSets = this.actors.map(actor => Object.entries(actor.skills).filter(skill => !!skill[1].label && skill[1].label.length > 1))
        const minSkillSetSize = Math.min(...allSkillSets.map(skillSet => skillSet.length))
        const smallestSkillSet = allSkillSets.find(skillSet => skillSet.length === minSkillSetSize)
        return smallestSkillSet.filter(smallestSkill => allSkillSets.every(skillSet => skillSet.some(skill => skill[0] === smallestSkill[0])))
    }

    /**
     * Build spells
     * @private
     */
    async _buildSpells () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('spells')) return

        const actionType = 'spell'

        // Create parent subcategory data
        const parentSubcategoryData = { id: 'spells', type: 'system' }

        const spellcastingEntries = [...this.items].filter(item => item[1].type === 'spellcastingEntry')

        for (const spellcastingEntry of spellcastingEntries) {
            const bookSubcategoryId = `spells+${spellcastingEntry[1].name.slugify({ replacement: '-', strict: true })}`
            const bookSubcategoryName = spellcastingEntry[1].name
            const bookInfo1 = this._getSpellDcInfo(spellcastingEntry[1])

            // Create book subcategory data
            const bookSubcategoryData = {
                id: bookSubcategoryId,
                name: bookSubcategoryName,
                type: 'system-derived',
                info1: bookInfo1,
                hasDerivedSubcategories: true
            }

            // Add subcategory to action list
            await this.addSubcategoryToActionList(parentSubcategoryData, bookSubcategoryData)

            // Add spell slot info to subcategory
            this.addSubcategoryInfo(bookSubcategoryData)

            const spellInfo = await spellcastingEntry[1].getSpellData()
            const activeLevels = spellInfo.levels.filter((level) => level.active.length > 0)

            for (const level of Object.entries(activeLevels)) {
                const levelSubcategoryId = `${bookSubcategoryId}+${level[1].level}`
                const levelSubcategoryName = String(CoreUtils.i18n(level[1].label))

                // Create level subcategory data
                const levelSubcategoryData = {
                    id: levelSubcategoryId,
                    name: levelSubcategoryName,
                    type: 'system-derived'
                }

                // Add subcategory to action list
                await this.addSubcategoryToActionList(bookSubcategoryData, levelSubcategoryData)

                await this._addSpellSlotInfo(levelSubcategoryData, level, spellInfo)

                // Get available spells
                const activeSpells = level[1].active
                    .filter(activeSpell => !activeSpell?.expended && activeSpell)
                    .map(spell => spell.spell)

                const spellsMap = new Map(activeSpells.map(spell => [spell.id, spell]))

                // Build actions
                await this._addActions(spellsMap, levelSubcategoryData, actionType)
            }
        }
    }

    /** @private */
    async _addSpellSlotInfo (
        levelSubcategoryData,
        level,
        spellInfo
    ) {
        const isCantrip = level[1].isCantrip
        const isFlexible = spellInfo.isFlexible
        const isFocusPool = spellInfo.isFocusPool
        const isInnate = spellInfo.isInnate
        const isPrepared = spellInfo.isPrepared

        //  Exit if spells are cantrips
        if (!isFocusPool && (isCantrip || isInnate)) return

        if (!isFocusPool && (isPrepared && !isFlexible)) return

        const actionType = 'spellSlot'
        const focus = this.actor.system.resources.focus
        const slots = level[1].uses
        const spellSlot = (isFocusPool) ? 'focus' : `slot${level[1].level}`
        const maxSlots = (spellSlot === 'focus') ? focus?.max : slots?.max
        const availableSlots = (spellSlot === 'focus') ? focus?.value : slots?.value
        const info1 = { text: (maxSlots >= 0) ? `${availableSlots ?? 0}/${maxSlots}` : '' }

        levelSubcategoryData.info = { info1 }

        // Add subcategory info to the subcategory
        this.addSubcategoryInfo(levelSubcategoryData)

        // Get actions
        const actions = [
            {
                id: `${spellInfo.id}>${spellSlot}>slotIncrease`,
                name: '+',
                encodedValue: [actionType, this.actorId, this.tokenId, `${spellInfo.id}>${spellSlot}>slotIncrease`].join(this.delimiter),
                cssClass: 'shrink'
            },
            {
                id: `${spellInfo.id}>${spellSlot}>slotDecrease`,
                name: '-',
                encodedValue: [actionType, this.actorId, this.tokenId, `${spellInfo.id}>${spellSlot}>slotDecrease`].join(this.delimiter),
                cssClass: 'shrink'
            }
        ]

        // Add actions to action list
        this.addActionsToActionList(actions, levelSubcategoryData)
    }

    /**
     * Build strikes
     */
    _buildStrikes () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('strikes')) return

        const actionType = 'strike'

        // Create parent subcategory data
        const parentSubcategoryData = { id: 'strikes', type: 'system' }

        // Get strikes
        let strikes = this.actor.system.actions
            .filter(action => action.type === actionType && (action.item.system.quantity > 0 || this.actor.type === 'npc'))
        strikes = strikes
            .filter((strike, index) => index === strikes.findIndex(other => strike.label === other.label && strike.attackRollType === other.attackRollType))

        // Exit if no strikes exist
        if (!strikes) return

        for (const strike of strikes) {
            const strikeId = strike.item.id
            const strikeSubcategoryId = `strikes+${strike.slug}`
            const strikeSubcategoryName = strike.label

            // Create subcategory data
            const strikeSubcategoryData = { id: strikeSubcategoryId, name: strikeSubcategoryName, hasDerivedSubcategories: true, type: 'system-derived' }

            // Add subcategory to action list
            this.addSubcategoryToActionList(parentSubcategoryData, strikeSubcategoryData)

            if (strike.auxiliaryActions) {
                const actionType = 'auxAction'
                const auxiliaryActionEntities = strike.auxiliaryActions.map((auxiliaryAction, index) => {
                    const id = encodeURIComponent(`${strikeId}>${index}>`)
                    const name = auxiliaryAction.label
                    return { id, name }
                })
                const image = { img: strike.imageUrl }
                if (auxiliaryActionEntities[0]) auxiliaryActionEntities[0].img = CoreUtils.getImage(image)

                // Get actions
                const actions = auxiliaryActionEntities.map(entity => this._getAction(actionType, entity))

                // Add actions to action list
                this.addActionsToActionList(actions, strikeSubcategoryData)
            }

            const strikeUsages = (strike.altUsages) ? [strike, ...strike.altUsages] : [strike]

            for (const strikeUsage of strikeUsages) {
                const glyph = strike.glyph
                const encodedUsage = `${strikeUsage.item.isMelee}_${strikeUsage.item.isThrown}_${strikeUsage.item.isRanged}`
                let usage
                switch (encodedUsage) {
                case 'true_false_false':
                    usage = 'melee'
                    break
                case 'false_true_true':
                    usage = 'thrown'
                    break
                case 'false_false_true':
                    usage = 'ranged'
                    break
                }
                const usageSubcategoryId = `${strikeSubcategoryId}+${usage}`
                const usageSubcategoryName = (strikeUsage.attackRollType)
                    ? CoreUtils.i18n(strikeUsage.attackRollType)
                    : CoreUtils.i18n(STRIKE_USAGES[usage].name)
                const usageSubcategoryIcon = (usage !== 'thrown' && glyph)
                    ? `<span style='font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);'>${glyph}</span>`
                    : STRIKE_ICONS[usage]

                // Create subcategory data
                const usageSubcategoryData = { id: usageSubcategoryId, name: usageSubcategoryName, icon: usageSubcategoryIcon, type: 'system-derived' }

                // Add subcategory to action list
                this.addSubcategoryToActionList(strikeSubcategoryData, usageSubcategoryData)

                if (strikeUsage.ready) {
                    const entities = strikeUsage.variants.map((variant, index) => {
                        const id = encodeURIComponent(`${strikeId}>${index}>` + usage)
                        const isMap = variant.label.includes('MAP')
                        const bonus = (isMap) ? strike.totalModifier + parseInt(variant.label.split(' ')[1]) : parseInt(variant.label.split(' ')[1])
                        const name = (this.calculateAttackPenalty) ? (bonus >= 0) ? `+${bonus}` : `${bonus}` : variant.label
                        return { actionType, id, name }
                    })

                    // Get Damage
                    const damageId = encodeURIComponent(`${strikeId}>damage>${usage}`)
                    const damageName = CoreUtils.i18n('PF2E.DamageLabel')
                    entities.push({ actionType, id: damageId, name: damageName })

                    // Get Critical
                    const criticalId = encodeURIComponent(`${strikeId}>critical>${usage}`)
                    const criticalName = CoreUtils.i18n('PF2E.CriticalDamageLabel')
                    entities.push({ actionType, id: criticalId, name: criticalName })

                    // Get Ammo
                    if (strikeUsage.selectedAmmoId && !strikeUsage.ammunition) {
                        const item = this.actor.items.get(strikeUsage.selectedAmmoId)

                        if (!item) {
                            const id = 'noAmmo'
                            const name = CoreUtils.i18n('tokenActionHud.pf2e.noAmmo')
                            entities.push({ actionType, id, name })
                        } else {
                            item.actionType = actionType
                            entities.push(item)
                        }
                    }

                    // Get actions
                    const actions = entities.map(entity => this._getAction(actionType, entity))

                    // Add actions to action list
                    this.addActionsToActionList(actions, usageSubcategoryData)
                }
            }
        }
    }

    /**
     * Build toggles
     */
    _buildToggles () {
        // Exit if no subcategory exists
        if (!this.subcategoryIds.includes('toggles')) return

        const actionType = 'toggle'

        // Get toggles
        const toggles = this.actor.system.toggles

        // Exit if no toggles exist
        if (!toggles.length) return

        // Create subcategory data
        const subcategoryData = { id: 'toggles', type: 'system' }

        // Get actions
        const actions = toggles.map(toggle => {
            const id = [toggle.domain, toggle.option].join('.')
            const name = CoreUtils.i18n(toggle.label)
            const encodedValue = [actionType, this.actorId, this.tokenId, JSON.stringify(toggle)].join(this.delimiter)
            const active = (toggle.checked) ? ' active' : ''
            const cssClass = `toggle${active}`

            return { id, encodedValue, name, cssClass }
        })

        // Add actions to action list
        this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Get attribute pool action
     * @param {string} actionType   The action type
     * @param {string} name         The tracker
     * @param {number} currentValue The current value
     * @param {number} maxValue     The max value
     * @returns {object}            The action
     */
    _getAttributePoolAction (actionType, name, currentValue, maxValue) {
        const id = name.slugify({ replacement: '-', strict: true })
        return {
            id,
            name,
            encodedValue: [actionType, this.actorId, this.tokenId, id].join(this.delimiter),
            info1: { text: `${currentValue}/${maxValue}` }
        }
    }

    /** @private */
    /*
    _addContainerSubcategories (tokenId, actionType, category, actor, items) {
        const allContainerIds = [
            ...new Set(
                actor.items
                    .filter((i) => i.system.containerId?.value)
                    .map((i) => i.system.containerId.value)
            )
        ]
        const containers = (items ?? []).filter((i) =>
            allContainerIds.includes(i.id)
        )

        containers.forEach((container) => {
            const containerId = container.id
            const contents = actor.items
                .filter((i) => i.system.containerId?.value === containerId)
                .sort(this.foundrySort)
            if (contents.length === 0) return

            const containerCategory = this.initializeEmptySubcategory(containerId)
            const containerActions = this._buildItemActions(
                tokenId,
                actionType,
                contents
            )
            containerCategory.actions = containerActions
            containerCategory.info1 = container.system.bulkCapacity.value

            this._combineSubcategoryWithCategory(
                category,
                container.name,
                containerCategory
            )
        })
    } */

    /**
     * Build actions
     * @private
     * @param {object} items
     * @param {object} subcategoryData
     * @param {string} actionType
     */
    async _addActions (items, subcategoryData, actionType = 'item') {
        // Exit if there are no items
        if (items.size === 0) return

        // Exit if there is no subcategoryId
        const subcategoryId = (typeof subcategoryData === 'string' ? subcategoryData : subcategoryData?.id)
        if (!subcategoryId) return

        // Get actions
        const actions = [...items].map(item => this._getAction(actionType, item[1]))

        // Add actions to action list
        await this.addActionsToActionList(actions, subcategoryData)
    }

    /**
     * Get Action
     * @private
     * @param {string} actionType
     * @param {object} entity
     * @returns {object}
     */
    _getAction (actionType, entity) {
        const id = entity.id ?? entity._id
        const name = entity?.name ?? entity?.label
        let cssClass = ''
        if (Object.hasOwn(entity, 'disabled')) {
            const active = (!entity.disabled) ? ' active' : ''
            cssClass = `toggle${active}`
        }
        const spellcastingId = entity?.spellcasting?.id
        const spellLevel = entity?.level
        const encodedId = (actionType === 'spell') ? `${spellcastingId}>${spellLevel}>${id}` : id
        const encodedValue = [actionType, this.actorId, this.tokenId, encodedId].join(this.delimiter)
        const actions = entity.system?.actions
        const actionTypes = ['free', 'reaction', 'passive']
        const actionTypeValue = entity.system?.actionType?.value
        const actionsCost = parseInt((actions || {}).value, 10) || 1
        const timeValue = entity.system?.time?.value
        const iconType = (actionType === 'spell') ? timeValue : (actionTypes.includes(actionTypeValue)) ? actionTypeValue : actionsCost
        const icon1 = this._getActionIcon(iconType)
        const img = CoreUtils.getImage(entity)
        const info = (actionType === 'spell') ? this._getSpellInfo(entity) : this._getItemInfo(entity)
        const info1 = info?.info1
        const info2 = info?.info2
        const info3 = info?.info3
        return {
            id,
            name,
            encodedValue,
            cssClass,
            img,
            icon1,
            info1,
            info2,
            info3
        }
    }

    /**
     * Whether the action is a slow action
     * @param {object} action The action
     * @returns {boolean}
     */
    _isSlowAction (action) {
        const shortActionTypes = ['downtime', 'exploration']
        return shortActionTypes.includes(action.system.traits?.value)
    }

    /**
     * Get spell DC info
     * @param {object} spellcastingEntry The spellcasting entry
     * @returns {string}                 The spell DC info
     */
    _getSpellDcInfo (spellcastingEntry) {
        let result = ''

        const statistic = spellcastingEntry.statistic
        const spelldc = typeof statistic.dc === 'function' ? statistic.dc().value : statistic.dc.value
        const spellatk = statistic.check.mod
        const attackBonus = spellatk >= 0
            ? `${CoreUtils.i18n('tokenActionHud.pf2e.atk')} +${spellatk}`
            : `${CoreUtils.i18n('tokenActionHud.pf2e.atk')} ${spellatk}`
        const dcInfo = `${CoreUtils.i18n('tokenActionHud.pf2e.dc')}${spelldc}`

        result = `${attackBonus} ${dcInfo}`

        return result
    }

    /**
     * Get spell info
     * @param {object} spell The spell object
     * @returns {object}     The spell info
     */
    _getSpellInfo (spell) {
        const componentData = this._getComponentsInfo(spell)
        const usesData = this._getUsesData(spell)

        return {
            info1: componentData,
            info2: usesData
        }
    }

    /**
     * Get spell component info
     * @param {object} spell The spell object
     * @returns {string}     The spell components
     */
    _getComponentsInfo (spell) {
        const text = spell.components.value ?? spell.system.components?.value ?? ''
        const title = Object.entries(spell.components)
            .filter(component => component[1] === true)
            .map(component => { return component[0].trim().charAt(0).toUpperCase() + component[0].slice(1) })
            .join(', ')
        return { text, title }
    }

    /**
     * Get uses
     * @param {object} spell The spell
     * @returns {string}     The uses
     */
    _getUsesData (spell) {
        const value = spell?.uses?.value
        const max = spell?.uses?.max
        const text = (value && max >= 0) ? `${value}/${max}` : ''
        return { text }
    }

    /**
     * Get actors
     * @private
     * @returns {object}
     */
    _getActors () {
        const allowedTypes = ['character', 'npc']
        const actors = canvas.tokens.controlled.map(token => token.actor)
        if (actors.every(actor => allowedTypes.includes(actor.type))) { return actors }
    }

    /**
     * Is equipped item
     * @private
     * @param {object} item
     * @returns {boolean}
     */
    _isEquippedItem (item) {
        const carryTypes = ['held', 'worn']
        const carryType = item.system.equipped?.carryType

        if (this.showUnequippedItems) return true
        if (carryTypes.includes(carryType) && !item.system.containerId?.value?.length) return true
        return false
    }

    /**
     * Get item info
     * @private
     * @param {object} item
     * @returns {object}
     */
    _getItemInfo (item) {
        const quantityData = this._getQuantityData(item) ?? ''
        return {
            info1: { text: quantityData }
        }
    }

    /**
     * Get quantity
     * @private
     * @param {object} item
     * @returns {string}
     */
    _getQuantityData (item) {
        const quantity = item?.system?.quantity?.value
        return (quantity > 1) ? quantity : ''
    }

    /**
     * Get action icon
     * @param {object} action
     * @returns {string}
     */
    _getActionIcon (action) {
        return ACTION_ICONS[action]
    }

    /** @protected */
    _foundrySort (a, b) {
        if (!(a?.sort || b?.sort)) return 0

        return a.sort - b.sort
    }
}
