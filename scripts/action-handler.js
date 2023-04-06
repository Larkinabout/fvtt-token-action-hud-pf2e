// System Module Imports
import { ACTION_ICON, ACTION_TYPE, SKILL_ABBREVIATION, STRIKE_ICON, STRIKE_USAGE } from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
    // Initialize actor and token variables
        actors = null
        actorId = null
        actorType = null
        tokenId = null

        // Initialize items variable
        items = null

        // Initialize setting variables
        abbreviateSkills = null
        calculateAttackPenalty = null
        colorSkills = null

        // Initialize subcategoryIds variables
        subcategoryIds = null
        activationSubcategoryIds = null
        effectSubcategoryIds = null
        inventorySubcategoryIds = null
        spellSubcategoryIds = null

        // Initialize action variables
        featureActions = null
        inventoryActions = null
        spellActions = null

        /**
         * Build System Actions
         * @override
         * @param {array} subcategoryIds
         */
        async buildSystemActions (subcategoryIds) {
        // Set actor and token variables
            this.actors = (!this.actor) ? this._getActors() : [this.actor]
            this.actorType = this.actor?.type

            // Exit if actor is not required type
            const knownActors = ['character', 'npc', 'familiar']
            if (this.actorType && !knownActors.includes(this.actorType)) return

            // Set items variable
            if (this.actor) {
                let items = this.actor.items
                items = this.sortItemsByName(items)
                this.items = items
            }

            // Set settings variables
            this.abbreviateSkills = Utils.getSetting('abbreviateSkills')
            this.calculateAttackPenalty = Utils.getSetting('calculateAttackPenalty')
            this.colorSkills = Utils.getSetting('colorSkills')

            // Set subcategory variables
            this.subcategoryIds = subcategoryIds

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
            for (const [key, value] of actionsMap) {
                const subcategoryId = key
                const actions = value

                // Create subcategory data
                const subcategoryData = { id: subcategoryId, type: 'system' }

                // Build actions
                this._addActions(actions, subcategoryData, actionType)
            }
        }

        /**
         * Build attacks
         * @private
         */
        _buildAttack () {
            const actionType = 'familiarAttack'

            const attack = this.actor.system.attack

            if (attack) {
                const id = attack.slug
                const name = attack.name.charAt(0).toUpperCase() + attack.name.slice(1)
                const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                const listName = `${actionTypeName}${name}`
                const encodedValue = [actionType, id].join(this.delimiter)
                const info1 = attack.totalModifier < 0 ? attack.totalModifier : `+${attack.totalModifier}`

                // Get actions
                const actions = [{
                    id,
                    name,
                    listName,
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
            const actionType = 'utility'

            // Set combat types
            const combatTypes = {
                endTurn: { id: 'endTurn', name: coreModule.api.Utils.i18n('tokenActionHud.endTurn') }
            }

            // Delete endTurn for multiple tokens
            if (game.combat?.current?.tokenId !== this.token?.id) delete combatTypes.endTurn

            // Get actions
            const actions = Object.entries(combatTypes).map((combatType) => {
                const id = combatType[1].id
                const name = combatType[1].name
                const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                const listName = `${actionTypeName}${name}`
                const encodedValue = [actionType, id].join(this.delimiter)
                return {
                    id,
                    name,
                    listName,
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
            // Conditions are duplicated in the ConditionManager and the name scaled conditions is suffixed with ' 1'
            const conditions = [...game.pf2e.ConditionManager.conditions].filter(condition => !condition[0].startsWith('Compendium'))
            conditions.forEach(condition => { condition[1].name = condition[1].name.replace(' 1', '') })

            // Build actions
            const actions = conditions.map(condition => {
                const id = condition[1].slug
                const activeCondition = activeConditions.get(condition[0])
                const activeConditionId = activeCondition?.id
                const name = condition[1].name
                const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                const listName = `${actionTypeName}${name}`
                const encodedValue = [actionType, id].join(this.delimiter)
                const img = coreModule.api.Utils.getImage(condition[1])
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
                    listName,
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
            const actionType = 'heroPoints'

            // Create subcategory data
            const subcategoryData = { id: 'hero-points', type: 'system' }

            const heroPoints = this.actor.system.resources?.heroPoints
            const value = heroPoints.value
            const max = heroPoints.max

            // Get actions
            const actions = [{
                id: 'heroPoints',
                name: coreModule.api.Utils.i18n('PF2E.HeroPointsLabel'),
                encodedValue: [actionType, actionType].join(this.delimiter),
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
                const subcategoryId = featTypes[featType]
                if (!featsMap.has(subcategoryId)) featsMap.set(subcategoryId, new Map())
                featsMap.get(subcategoryId).set(key, value)
            }

            for (const [key, value] of featsMap) {
                const subcategoryId = key
                const feats = value

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
            const actionType = 'initiative'

            const initiative = (this.actor) ? this.actor.system.attributes.initiative : 'PF2E.InitiativeLabel'
            const totalModifier = initiative.totalModifier
            const modifier = (totalModifier || totalModifier === 0) ? `${(totalModifier >= 0) ? '+' : ''}${totalModifier}` : ''

            // Get actions
            const actions = [{
                id: 'initiative',
                name: (initiative.label) ? initiative.label : (typeof initiative === 'string') ? coreModule.api.Utils.i18n(initiative) : '',
                encodedValue: [actionType, 'initiative'].join(this.delimiter),
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
            for (const [key, value] of inventoryMap) {
                const subcategoryId = key
                const inventory = value

                // Create subcategory data
                const subcategoryData = { id: subcategoryId, type: 'system' }

                // Build actions
                this._addActions(inventory, subcategoryData)
            }
        }

        /**
         * Build perception check
         * @private
         */
        _buildPerceptionCheck () {
            const actionType = 'perceptionCheck'

            const perception = (this.actor) ? this.actor.system.attributes.perception : CONFIG.PF2E.attributes.perception
            const totalModifier = perception.totalModifier
            const modifier = (totalModifier || totalModifier === 0) ? `${(totalModifier >= 0) ? '+' : ''}${totalModifier}` : ''

            // Get actions
            const actions = [{
                id: 'perception',
                name: coreModule.api.Utils.i18n(CONFIG.PF2E.attributes.perception),
                encodedValue: [actionType, 'perception'].join(this.delimiter),
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
            const actionType = 'recoveryCheck'

            const dyingPoints = this.actor.system.attributes?.dying

            if (dyingPoints?.value >= 1) {
            // Get actions
                const actions = [{
                    id: actionType,
                    name: coreModule.api.Utils.i18n('PF2E.Check.Specific.Recovery'),
                    encodedValue: [actionType, actionType].join(this.delimiter)
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
        // Exit if multiple actors and not every actor is not the character type
            if (!this.actor && !this.actors.every(actor => actor.type === 'character')) return

            const actionType = 'utility'

            const actions = [
                {
                    id: 'treatWounds',
                    name: coreModule.api.Utils.i18n('PF2E.Actions.TreatWounds.Label'),
                    encodedValue: [actionType, 'treatWounds'].join(this.delimiter)
                },
                {
                    id: 'rest',
                    name: coreModule.api.Utils.i18n('PF2E.Actor.Character.Rest.Label'),
                    encodedValue: [actionType, 'rest'].join(this.delimiter)
                }
            ]

            // Take a Breather
            if (game.settings.get('pf2e', 'staminaVariant')) {
                actions.push({
                    id: 'takeBreather',
                    name: coreModule.api.Utils.i18n('tokenActionHud.pf2e.takeBreather'),
                    encodedValue: [actionType, 'takeBreather'].join(this.delimiter)
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
            const actionType = 'save'

            // Get saves
            const saves = (this.actor) ? Object.entries(this.actor.saves) : Object.entries(CONFIG.PF2E.saves)

            // Get actions
            const actions = saves.map((save) => {
                const id = save[0]
                const name = save[1].label ?? (typeof save[1] === 'string' ? coreModule.api.Utils.i18n(save[1]) : '')
                const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                const listName = `${actionTypeName}${name}`
                const encodedValue = [actionType, id].join(this.delimiter)
                return {
                    id,
                    name,
                    listName,
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
            const actionType = 'skill'

            // Get skills
            const skills = (this.actor)
                ? Object.entries(this.actor.skills).filter(skill => !!skill[1].label && skill[1].label.length > 1)
                : this._getSharedSkills()

            if (!skills) return

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
            for (const [key, value] of skillsMap) {
                const subcategoryId = key
                const skills = value

                // Create subcategory data
                const subcategoryData = { id: subcategoryId, type: 'system' }

                // Get actions
                const actions = [...skills].map(skill => {
                    const id = skill[0]
                    const data = skill[1]
                    const label = coreModule.api.Utils.i18n(data.label) ?? coreModule.api.Utils.i18n(CONFIG.PF2E.skillList[skill[0]])
                    const name = this.abbreviatedSkills ? SKILL_ABBREVIATION[data.slug] ?? label : label
                    const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                    const listName = `${actionTypeName}${name}`
                    const encodedValue = [actionType, id].join(this.delimiter)
                    const cssClass = (this.actor && this.colorSkills && data.rank > 0) ? `tah-pf2e-skill-rank-${data.rank}` : ''
                    const mod = data.check?.mod
                    const info1 = (this.actor) ? { text: (mod || mod === 0) ? `${(mod >= 0) ? '+' : ''}${mod}` : '' } : ''

                    return {
                        id,
                        name,
                        listName,
                        encodedValue,
                        cssClass,
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
            if (!this.actors) return
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
                    const spellLevel = level[1].level
                    const levelSubcategoryId = `${bookSubcategoryId}+${spellLevel}`
                    const levelSubcategoryName = String(coreModule.api.Utils.i18n(level[1].label))

                    // Create level subcategory data
                    const levelSubcategoryData = {
                        id: levelSubcategoryId,
                        name: levelSubcategoryName,
                        type: 'system-derived'
                    }

                    // Add subcategory to action list
                    await this.addSubcategoryToActionList(bookSubcategoryData, levelSubcategoryData)

                    await this._addSpellSlotInfo(bookSubcategoryData, levelSubcategoryData, level, spellInfo)

                    // Get available spells
                    const activeSpells = level[1].active
                        .filter(activeSpell => !activeSpell?.expended && activeSpell)
                        .map(spell => spell.spell)

                    const spellsMap = new Map(activeSpells.map(spell => [spell.id, spell]))

                    // Build actions
                    await this._addActions(spellsMap, levelSubcategoryData, actionType, spellLevel)
                }
            }
        }

        /** @private */
        async _addSpellSlotInfo (
            bookSubcategoryData,
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

            const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE.spell)

            // Get actions
            const actions = [
                {
                    id: `${spellInfo.id}>${spellSlot}>slotIncrease`,
                    name: '+',
                    listName: `${actionTypeName}: ${bookSubcategoryData.name}: ${levelSubcategoryData.name}: +`,
                    encodedValue: [actionType, `${spellInfo.id}>${spellSlot}>slotIncrease`].join(this.delimiter),
                    cssClass: 'shrink'
                },
                {
                    id: `${spellInfo.id}>${spellSlot}>slotDecrease`,
                    name: '-',
                    listName: `${actionTypeName}: ${bookSubcategoryData.name}: ${levelSubcategoryData.name}: -`,
                    encodedValue: [actionType, `${spellInfo.id}>${spellSlot}>slotDecrease`].join(this.delimiter),
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
                const strikeSubcategoryId = `strikes+${encodeURIComponent(strike.label)}`
                const strikeSubcategoryName = strike.label

                // Create subcategory data
                const strikeSubcategoryData = { id: strikeSubcategoryId, name: strikeSubcategoryName, hasDerivedSubcategories: true, type: 'system-derived' }

                // Add subcategory to action list
                this.addSubcategoryToActionList(parentSubcategoryData, strikeSubcategoryData)

                if (strike.auxiliaryActions?.length) {
                    const actionType = 'auxAction'
                    const auxiliaryActionEntities = strike.auxiliaryActions.map((auxiliaryAction, index) => {
                        const id = encodeURIComponent(`${strikeId}>${index}>`)
                        const name = auxiliaryAction.label
                        const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ${strikeSubcategoryName}: ` ?? ''
                        const listName = `${actionTypeName}${name}`
                        const actionIcon = auxiliaryAction.img
                        return { id, name, listName, actionIcon }
                    })
                    const image = { img: strike.imageUrl }
                    if (auxiliaryActionEntities[0]) auxiliaryActionEntities[0].img = coreModule.api.Utils.getImage(image)

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
                        ? coreModule.api.Utils.i18n(strikeUsage.attackRollType)
                        : coreModule.api.Utils.i18n(STRIKE_USAGE[usage].name)
                    const usageSubcategoryIcon = (usage !== 'thrown' && glyph)
                        ? `<span style='font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);'>${glyph}</span>`
                        : STRIKE_ICON[usage]
                    const advancedCategoryOptions = { showTitle: (strikeUsages.length > 1) }

                    // Create subcategory data
                    const usageSubcategoryData = {
                        id: usageSubcategoryId,
                        name: usageSubcategoryName,
                        icon: usageSubcategoryIcon,
                        type: 'system-derived',
                        advancedCategoryOptions
                    }

                    // Add subcategory to action list
                    this.addSubcategoryToActionList(strikeSubcategoryData, usageSubcategoryData)

                    const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ${strikeSubcategoryName}: ${usageSubcategoryName}: ` ?? ''
                    const systemSelected = strikeUsage.ready

                    const entities = strikeUsage.variants.map((variant, index) => {
                        const id = encodeURIComponent(`${strikeId}>${index}>` + usage)
                        const isMap = variant.label.includes('MAP')
                        const bonus = (isMap) ? strike.totalModifier + parseInt(variant.label.split(' ')[1]) : parseInt(variant.label.split(' ')[1])
                        const name = (this.calculateAttackPenalty) ? (bonus >= 0) ? `+${bonus}` : `${bonus}` : variant.label
                        const listName = `${actionTypeName}${name}`
                        return { actionType, id, name, listName, systemSelected }
                    })

                    // Get Damage
                    const damageId = encodeURIComponent(`${strikeId}>damage>${usage}`)
                    const damageName = coreModule.api.Utils.i18n('PF2E.DamageLabel')
                    const damageListName = `${actionTypeName}${damageName}`
                    entities.push({ actionType, id: damageId, name: damageName, listName: damageListName, systemSelected })

                    // Get Critical
                    const criticalId = encodeURIComponent(`${strikeId}>critical>${usage}`)
                    const criticalName = coreModule.api.Utils.i18n('PF2E.CriticalDamageLabel')
                    const criticalListName = `${actionTypeName}${criticalName}`
                    entities.push({ actionType, id: criticalId, name: criticalName, listName: criticalListName, systemSelected })

                    // Get Ammo
                    if (strikeUsage.selectedAmmoId && !strikeUsage.ammunition) {
                        const item = this.actor.items.get(strikeUsage.selectedAmmoId)

                        if (!item) {
                            const id = 'noAmmo'
                            const name = coreModule.api.Utils.i18n('tokenActionHud.pf2e.noAmmo')
                            const listName = `${actionTypeName}${name}`
                            entities.push({ actionType, id, name, listName, systemSelected })
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

        /**
         * Build toggles
         */
        _buildToggles () {
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
                const name = coreModule.api.Utils.i18n(toggle.label)
                const encodedValue = [actionType, JSON.stringify(toggle)].join(this.delimiter)
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
                encodedValue: [actionType, id].join(this.delimiter),
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
        async _addActions (items, subcategoryData, actionType = 'item', spellLevel = null) {
        // Exit if there are no items
            if (items.size === 0) return

            // Exit if there is no subcategoryId
            const subcategoryId = (typeof subcategoryData === 'string' ? subcategoryData : subcategoryData?.id)
            if (!subcategoryId) return

            // Get actions
            const actions = [...items].map(item => this._getAction(actionType, item[1], spellLevel))

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
        _getAction (actionType, entity, spellLevel) {
            const id = (actionType === 'spell') ? `${entity.id ?? entity._id}-${spellLevel}` : entity.id ?? entity._id
            const name = entity?.name ?? entity?.label
            const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
            const listName = entity.listName ?? `${actionTypeName}${name}`
            let cssClass = ''
            if (Object.hasOwn(entity, 'disabled')) {
                const active = (!entity.disabled) ? ' active' : ''
                cssClass = `toggle${active}`
            }
            const spellcastingId = entity?.spellcasting?.id
            const encodedId = (actionType === 'spell') ? `${spellcastingId}>${spellLevel}>${entity.id ?? entity._id}` : id
            const encodedValue = [actionType, encodedId].join(this.delimiter)
            const actions = entity.system?.actions
            const actionTypes = ['free', 'reaction', 'passive']
            const actionTypeValue = entity.system?.actionType?.value
            const actionsCost = (actions) ? parseInt((actions || {}).value, 10) : null
            const timeValue = entity.system?.time?.value
            const actionIcon = entity.actionIcon
            const iconType = (actionType === 'spell') ? timeValue : (actionTypes.includes(actionTypeValue)) ? actionTypeValue : actionsCost ?? actionIcon
            const icon1 = this._getActionIcon(iconType)
            const img = coreModule.api.Utils.getImage(entity)
            const info = (actionType === 'spell') ? this._getSpellInfo(entity) : this._getItemInfo(entity)
            const info1 = info?.info1
            const info2 = info?.info2
            const info3 = info?.info3
            const systemSelected = entity?.systemSelected ?? null
            return {
                id,
                name,
                encodedValue,
                cssClass,
                img,
                icon1,
                info1,
                info2,
                info3,
                listName,
                systemSelected
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
                ? `${coreModule.api.Utils.i18n('tokenActionHud.pf2e.atk')} +${spellatk}`
                : `${coreModule.api.Utils.i18n('tokenActionHud.pf2e.atk')} ${spellatk}`
            const dcInfo = `${coreModule.api.Utils.i18n('tokenActionHud.pf2e.dc')}${spelldc}`

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
            return ACTION_ICON[action]
        }

        /** @protected */
        _foundrySort (a, b) {
            if (!(a?.sort || b?.sort)) return 0

            return a.sort - b.sort
        }
    }
})
