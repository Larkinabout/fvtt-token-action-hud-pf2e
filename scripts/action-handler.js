// System Module Imports
import { ACTION_ICON, ACTION_TYPE, ITEM_TYPE, MODULAR_OPTION, SKILL_ABBREVIATION, SKILL, SKILL_ACTION, STRIKE_ICON, STRIKE_USAGE } from './constants.js'
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
        showStrikeNames = null

        // Initialize groupIds variables
        groupIds = null
        activationGroupIds = null
        effectGroupIds = null
        inventoryGroupIds = null
        spellGroupIds = null

        // Initialize action variables
        featureActions = null
        inventoryActions = null
        spellActions = null

        /**
         * Build System Actions
         * @override
         * @param {array} groupIds
         */
        async buildSystemActions (groupIds) {
            // Set actor and token variables
            this.actors = (!this.actor) ? this._getActors() : [this.actor]
            this.actorType = this.actor?.type

            // Exit if actor is not a known type
            const knownActors = ['character', 'npc', 'familiar']
            if (this.actorType && !knownActors.includes(this.actorType)) return

            // Set items variable
            if (this.actor) {
                let items = this.actor.items
                items = coreModule.api.Utils.sortItemsByName(items)
                this.items = items
            }

            // Set settings variables
            this.abbreviateSkills = Utils.getSetting('abbreviateSkills')
            this.calculateAttackPenalty = Utils.getSetting('calculateAttackPenalty')
            this.colorSkills = Utils.getSetting('colorSkills')
            this.showStrikeNames = Utils.getSetting('showStrikeNames')

            // Set group variables
            this.groupIds = groupIds

            if (this.actorType === 'character') {
                await this._buildCharacterActions()
            } else if (this.actorType === 'familiar') {
                await this._buildFamiliarActions()
            } else if (this.actorType === 'npc') {
                await this._buildNpcActions()
            } else if (!this.actor) {
                this._buildMultipleTokenActions()
            }
        }

        /**
         * Build character actions
         * @private
         */
        async _buildCharacterActions () {
            await Promise.all([
                this._buildActions(),
                this._buildConditions(),
                this._buildEffects(),
                this._buildFeats(),
                this._buildInitiative(),
                this._buildInventory(),
                this._buildSaves(),
                this._buildSkillActions(),
                this._buildSkills(),
                this._buildSpells(),
                this._buildStrikes()
            ])

            this._buildCombat()
            this._buildHeroPoints()
            this._buildPerceptionCheck()
            this._buildRecoveryCheck()
            this._buildRests()
            this._buildToggles()
        }

        /**
         * Build familiar actions
         * @private
         */
        async _buildFamiliarActions () {
            await Promise.all([
                this._buildConditions(),
                this._buildInventory(),
                this._buildSaves(),
                this._buildSkills()
            ])

            this._buildAttack()
            this._buildCombat()
            this._buildEffects()
            this._buildPerceptionCheck()
        }

        /**
         * Build NPC actions
         */
        async _buildNpcActions () {
            await Promise.all([
                this._buildActions(),
                this._buildConditions(),
                this._buildEffects(),
                this._buildFeats(),
                this._buildInitiative(),
                this._buildInventory(),
                this._buildSaves(),
                this._buildSkillActions(),
                this._buildSkills(),
                this._buildStrikes(),
                this._buildSpells()
            ])

            this._buildCombat()
            this._buildPerceptionCheck()
        }

        /**
         * Build multiple token actions
         * @private
         * @returns {object}
         */
        async _buildMultipleTokenActions () {
            await Promise.all([
                this._buildInitiative(),
                this._buildSaves(),
                this._buildSkills()
            ])

            this._buildPerceptionCheck()
            this._buildSkillActions()
        }

        /**
         * Build actions
         */
        async _buildActions () {
            const actionType = 'action'

            // Exit early if no items exist
            if (this.items.size === 0) return

            const actionTypes = ['action', 'reaction', 'free', 'passive']

            const actionItems = new Map([...this.items].filter(([_, itemData]) => itemData.type === 'action' || actionTypes.includes(itemData.system?.actionType?.value)))

            const actionsMap = new Map()

            for (const [key, value] of actionItems) {
                // Set variables
                const actionTypeValue = value.system.actionType?.value

                switch (actionTypeValue) {
                case 'action':
                    actionsMap.set('actions', actionsMap.get('actions') || new Map())
                    actionsMap.get('actions').set(key, value)
                    break
                case 'reaction':
                    actionsMap.set('reactions', actionsMap.get('reactions') || new Map())
                    actionsMap.get('reactions').set(key, value)
                    break
                case 'free':
                    actionsMap.set('free-actions', actionsMap.get('free-actions') || new Map())
                    actionsMap.get('free-actions').set(key, value)
                    break
                case 'passive':
                    actionsMap.set('passives', actionsMap.get('passives') || new Map())
                    actionsMap.get('passives').set(key, value)
                    break
                }
            }

            // Loop through inventory subcategory ids
            for (const [key, value] of actionsMap) {
                const groupId = key
                const items = value

                // Create group data
                const groupData = { id: groupId, type: 'system' }

                const actions = await Promise.all(
                    [...items].map(async ([_, itemData]) => {
                        const id = this._getActionId(itemData)
                        const name = this._getActionName(itemData)
                        const listName = this._getActionListName(itemData, actionType)
                        const cssClass = this._getActionCss(itemData)
                        const encodedValue = [actionType, id].join(this.delimiter)
                        const icon1 = this._getIcon1(itemData, actionType)
                        const img = coreModule.api.Utils.getImage(itemData)
                        const info = this._getItemInfo(itemData)
                        const chatData = await itemData.getChatData()
                        const tooltipData = {
                            name,
                            description: chatData.description.value,
                            properties: chatData.properties,
                            traits: chatData.traits
                        }
                        const tooltip = await this._getTooltip(tooltipData)
                        return {
                            id,
                            name,
                            encodedValue,
                            cssClass,
                            img,
                            icon1,
                            info,
                            listName,
                            tooltip
                        }
                    })
                )

                // Add actions to action list
                this.addActions(actions, groupData)
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

                // Create group data
                const groupData = { id: 'attack', type: 'system' }

                // Add actions to action list
                this.addActions(actions, groupData)
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

            // Create group data
            const groupData = { id: 'combat', type: 'system' }

            // Add actions to action list
            this.addActions(actions, groupData)
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
            const conditions = [...game.pf2e.ConditionManager.conditions]
                .filter(([conditionId]) => !conditionId.startsWith('Compendium'))
                .map(([conditionId, conditionData]) => {
                    conditionData.name = conditionData.name.replace(' 1', '')
                    return [conditionId, conditionData]
                })

            // Build actions
            const actions = await Promise.all(
                conditions.map(async ([conditionId, conditionData]) => {
                    const id = conditionData.slug
                    const activeCondition = activeConditions.get(conditionId)
                    const activeConditionId = activeCondition?.id
                    const name = conditionData.name
                    const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                    const listName = `${actionTypeName}${name}`
                    const encodedValue = [actionType, id].join(this.delimiter)
                    const img = coreModule.api.Utils.getImage(conditionData)
                    const active = activeConditionId ? ' active' : ''
                    const cssClass = `toggle${active}`
                    let info1 = ''
                    let attributeValue = ''

                    if (activeConditionId) {
                        if (limitedConditions.includes(activeCondition.slug)) {
                            const attribute = this.actor.system.attributes[activeCondition.slug]
                            attributeValue = attribute.value
                            const max = attribute.max
                            info1 = { text: (max > 0) ? `${attributeValue ?? 0}/${max}` : '' }
                        } else if (activeCondition.system.value.isValued) {
                            attributeValue = activeCondition.system.value.value
                            info1 = { text: attributeValue }
                        }
                    }

                    const tooltipName = `${name}${(attributeValue) ? ` ${attributeValue}` : ''}`
                    const tooltipData = {
                        name: tooltipName,
                        description: conditionData.description
                    }
                    const tooltip = await this._getTooltip(tooltipData)

                    return {
                        id,
                        name,
                        listName,
                        encodedValue,
                        cssClass,
                        img,
                        info1,
                        tooltip
                    }
                })
            )

            // Create group data
            const groupData = { id: 'conditions', type: 'system' }

            // Add actions to action list
            await this.addActions(actions, groupData)
        }

        /**
         * Build hero points
         */
        async _buildHeroPoints () {
            const actionType = 'heroPoints'

            // Create group data
            const groupData = { id: 'hero-points', type: 'system' }

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
            this.addActions(actions, groupData)
        }

        /**
         * Build effects
         * @private
         */
        async _buildEffects () {
            const actionType = 'effect'

            // Get effects
            // 'unidentified' property moved to 'system.unidentified' post pf2e 4.10+
            const items = new Map([...this.items]
                .filter(item =>
                    item[1].type === 'effect' &&
                    ((!(item[1].system?.unidentified ?? false) &&
                    !(item[1].unidentified ?? false)) || game.user.isGM)))

            // Create group data
            const groupData = { id: 'effects', type: 'system' }

            const actions = await Promise.all(
                [...items].map(async ([_$, itemData]) => {
                    const id = this._getActionId(itemData)
                    const name = this._getActionName(itemData)
                    const listName = this._getActionListName(itemData, actionType)
                    const cssClass = this._getActionCss(itemData)
                    const encodedValue = [actionType, id].join(this.delimiter)
                    const icon1 = this._getIcon1(itemData, actionType)
                    const img = coreModule.api.Utils.getImage(itemData)
                    const info = this._getItemInfo(itemData)
                    const tooltipData = {
                        name,
                        description: itemData.description
                    }
                    const tooltip = await this._getTooltip(tooltipData)
                    return {
                        id,
                        name,
                        listName,
                        encodedValue,
                        cssClass,
                        img,
                        icon1,
                        info,
                        tooltip
                    }
                })
            )

            // Add actions to action list
            this.addActions(actions, groupData)
        }

        /**
         * Build Feats
         * @private
         */
        async _buildFeats () {
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
                if (value.type !== 'feat') continue
                // 'featType' changed to 'system.category' post pf2e 4.10+
                const featType = value.system?.category ?? value.featType
                const groupId = featTypes[featType]

                featsMap.set(groupId, featsMap.get(groupId) || new Map())
                featsMap.get(groupId).set(key, value)
            }

            for (const [key, value] of featsMap) {
                const groupId = key
                const items = value

                // Get group data
                const groupData = { id: groupId, type: 'system' }

                const actions = await Promise.all(
                    [...items].map(async ([_, itemData]) => {
                        const id = this._getActionId(itemData)
                        const name = this._getActionName(itemData)
                        const listName = this._getActionListName(itemData, actionType)
                        const cssClass = this._getActionCss(itemData)
                        const encodedValue = [actionType, id].join(this.delimiter)
                        const icon1 = this._getIcon1(itemData, actionType)
                        const img = coreModule.api.Utils.getImage(itemData)
                        const info = this._getItemInfo(itemData)
                        const chatData = await itemData.getChatData()
                        const tooltipData = {
                            name,
                            description: chatData?.description.value,
                            properties: chatData.properties,
                            traits: chatData.traits
                        }
                        const tooltip = await this._getTooltip(tooltipData)
                        return {
                            id,
                            name,
                            encodedValue,
                            cssClass,
                            img,
                            icon1,
                            info,
                            listName,
                            tooltip
                        }
                    })
                )

                // Add actions to action list
                this.addActions(actions, groupData)
            }
        }

        /**
         * Build initiative
         * @private
         */
        async _buildInitiative () {
            const actionType = 'initiative'

            // Get skills
            const skills = (this.actor)
                ? Object.entries(this.actor.skills).filter(([_, skillData]) => !!skillData.label && skillData.label.length > 1)
                : this._getSharedSkills()

            if (!skills) return

            const initiativeStatistic = this.actor?.system.attributes.initiative.statistic ?? null

            // Get actions
            const actions = []

            const perception = (this.actor) ? this.actor.system.attributes.perception : CONFIG.PF2E.attributes.perception
            const fullName = coreModule.api.Utils.i18n(CONFIG.PF2E.attributes.perception)
            const name = this.abbreviatedSkills ? SKILL_ABBREVIATION.perception ?? fullName : fullName
            const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
            const listName = `${actionTypeName}${name}`
            const encodedValue = [actionType, 'perception'].join(this.delimiter)
            const active = (initiativeStatistic === 'perception') ? ' active' : ''
            const cssClass = `toggle${active}`
            const modifier = coreModule.api.Utils.getModifier(perception?.totalModifier)
            const info1 = this.actor ? { text: modifier } : ''
            const tooltipName = `${fullName}${(this.actor && modifier) ? ` ${modifier}` : ''}`
            const tooltipData = {
                name: tooltipName,
                modifiers: perception?.modifiers
            }
            const tooltip = (this.actor) ? await this._getTooltip(tooltipData) : null

            // Get actions
            actions.push({
                id: 'initiative-perception',
                name,
                listName,
                encodedValue,
                cssClass,
                info1,
                tooltip
            })

            const skillActions = await Promise.all(
                skills.map(async ([skillId, skillData]) => {
                    const id = `initiative-${skillId}`
                    const data = skillData
                    const fullName = coreModule.api.Utils.i18n(data.label) ?? coreModule.api.Utils.i18n(CONFIG.PF2E.skillList[skillId])
                    const name = this.abbreviatedSkills ? SKILL_ABBREVIATION[data.slug] ?? fullName : fullName
                    const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                    const listName = `${actionTypeName}${name}`
                    const encodedValue = [actionType, skillId].join(this.delimiter)
                    const active = (initiativeStatistic === skillId) ? ' active' : ''
                    const cssClass = `toggle${active}`
                    const modifier = coreModule.api.Utils.getModifier(skillData.check?.mod)
                    const info1 = this.actor ? { text: modifier } : ''
                    const tooltipName = `${fullName}${(this.actor && modifier) ? ` ${modifier}` : ''}`
                    const tooltipData = {
                        name: tooltipName,
                        modifiers: skillData?.modifiers
                    }
                    const tooltip = (this.actor) ? await this._getTooltip(tooltipData) : null

                    return {
                        id,
                        name,
                        listName,
                        encodedValue,
                        cssClass,
                        info1,
                        tooltip
                    }
                })
            )

            actions.push(...skillActions)

            // Create group data
            const groupData = { id: 'initiative', type: 'system' }

            // Add actions to action list
            this.addActions(actions, groupData)
        }

        /**
         * Build inventory
         * @private
         */
        async _buildInventory () {
        // Exit early if no items exist
            if (this.items.size === 0) return

            const actionType = 'item'
            const inventoryMap = new Map()

            for (const [key, value] of this.items) {
                const hasQuantity = value.system?.quantity > 0
                const isEquippedItem = this._isEquippedItem(value)
                const type = value.type

                if (hasQuantity) {
                    const itemType = isEquippedItem ? 'equipped' : 'unequipped'
                    const itemCategoryMap = inventoryMap.get(itemType) ?? new Map()
                    itemCategoryMap.set(key, value)
                    inventoryMap.set(itemType, itemCategoryMap)

                    if (isEquippedItem) {
                        const categoryTypeMap = inventoryMap.get(type) ?? new Map()
                        categoryTypeMap.set(key, value)
                        inventoryMap.set(type, categoryTypeMap)
                    }
                }
            }

            for (const [key, value] of this.items) {
                const hasQuantity = value.system?.quantity > 0
                const isEquippedItem = this._isEquippedItem(value)
                const type = value.type

                if (hasQuantity) {
                    const itemType = isEquippedItem ? 'equipped' : 'unequipped'
                    const itemCategoryMap = inventoryMap.get(itemType) ?? new Map()
                    itemCategoryMap.set(key, value)
                    inventoryMap.set(itemType, itemCategoryMap)

                    if (isEquippedItem) {
                        const categoryTypeMap = inventoryMap.get(type) ?? new Map()
                        categoryTypeMap.set(key, value)
                        inventoryMap.set(type, categoryTypeMap)
                    }
                }
            }

            // Loop through inventory group ids
            for (const [id, items] of inventoryMap) {
                // Create group data
                const groupId = ITEM_TYPE[id]?.groupId
                if (!groupId) continue
                const groupData = { id: groupId, type: 'system' }

                // Get actions
                const actions = await Promise.all(
                    [...items].map(async ([_, itemData]) => {
                        const id = this._getActionId(itemData)
                        const name = this._getActionName(itemData)
                        const listName = this._getActionListName(itemData, actionType)
                        const cssClass = this._getActionCss(itemData)
                        const encodedValue = [actionType, id].join(this.delimiter)
                        const icon1 = this._getIcon1(itemData, actionType)
                        const img = coreModule.api.Utils.getImage(itemData)
                        const info = this._getItemInfo(itemData)
                        const chatData = await itemData.getChatData()
                        const tooltipData = {
                            name,
                            description: chatData?.description.value,
                            rarity: chatData.rarity,
                            traits: chatData.traits,
                            traits2: chatData.properties
                        }
                        const tooltip = await this._getTooltip(tooltipData)
                        return {
                            id,
                            name,
                            encodedValue,
                            cssClass,
                            img,
                            icon1,
                            info,
                            listName,
                            tooltip
                        }
                    })
                )

                // Add actions to action list
                this.addActions(actions, groupData)
            }

            // Add container contents
            if (inventoryMap.has('backpack')) {
                // Create parent group data
                const parentGroupData = { id: 'containers', type: 'system' }
                const containers = inventoryMap.get('backpack')

                for (const [id, container] of containers) {
                    const contents = container.contents

                    // Skip if container has no contents
                    if (!contents.size) continue

                    // Create group data
                    const groupId = ITEM_TYPE[id]?.groupId
                    if (!groupId) continue
                    const groupData = {
                        id: groupId,
                        name: container.name,
                        listName: `Group: ${container.name}`,
                        type: 'system-derived'
                    }

                    // Add group to action list
                    await this.addGroup(groupData, parentGroupData)

                    const items = new Map(contents.map(content => [content.id, content]))

                    const actions = await Promise.all(
                        [...items].map(async ([_, itemData]) => {
                            const id = this._getActionId(itemData)
                            const name = this._getActionName(itemData)
                            const listName = this._getActionListName(itemData, actionType)
                            const cssClass = this._getActionCss(itemData)
                            const encodedValue = [actionType, id].join(this.delimiter)
                            const icon1 = this._getIcon1(itemData, actionType)
                            const img = coreModule.api.Utils.getImage(itemData)
                            const info = this._getItemInfo(itemData)
                            const chatData = await itemData.getChatData()
                            const tooltipData = {
                                name,
                                description: chatData?.description.value,
                                properties: chatData.properties,
                                rarity: chatData.rarity,
                                traits: chatData.traits
                            }
                            const tooltip = await this._getTooltip(tooltipData)
                            return {
                                id,
                                name,
                                encodedValue,
                                cssClass,
                                img,
                                icon1,
                                info,
                                listName,
                                tooltip
                            }
                        })
                    )

                    // Add actions to action list
                    this.addActions(actions, groupData)
                }
            }
        }

        /**
         * Build perception check
         * @private
         */
        _buildPerceptionCheck () {
            const actionType = 'perceptionCheck'
            const perception = (this.actor) ? this.actor.system.attributes.perception : CONFIG.PF2E.attributes.perception
            const modifierValue = perception?.totalModifier
            const modifierSign = (modifierValue >= 0) ? '+' : ''
            const modifier = `${modifierSign}${modifierValue}`

            // Get actions
            const actions = [{
                id: 'perception',
                name: coreModule.api.Utils.i18n(CONFIG.PF2E.attributes.perception),
                encodedValue: [actionType, 'perception'].join(this.delimiter),
                info1: { text: modifier }
            }]

            // Create group data
            const groupData = { id: 'perception-check', type: 'system' }

            // Add actions to action list
            this.addActions(actions, groupData)
        }

        /**
         * Build recovery check
         */
        _buildRecoveryCheck () {
            const actionType = 'recoveryCheck'
            const dyingPoints = this.actor?.system.attributes?.dying

            if (dyingPoints?.value >= 1) {
            // Get actions
                const actions = [{
                    id: actionType,
                    name: coreModule.api.Utils.i18n('PF2E.Check.Specific.Recovery'),
                    encodedValue: [actionType, actionType].join(this.delimiter)
                }]

                // Create group data
                const groupData = { id: 'recovery-check', type: 'system' }

                // Add actions to action list
                this.addActions(actions, groupData)
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

            // Create group data
            const groupData = { id: 'rests', type: 'system' }

            // Add actions to action list
            this.addActions(actions, groupData)
        }

        /**
         * Build saves
         * @private
         */
        async _buildSaves () {
            const actionType = 'save'

            // Get saves
            const saves = this.actor ? Object.entries(this.actor.saves || []) : Object.entries(CONFIG.PF2E.saves)

            // Exit if no saves exist
            if (!saves || saves.length === 0) return

            // Get actions
            const actions = await Promise.all(
                saves.map(async ([id, saveData]) => {
                    const name = saveData.label ?? (typeof saveData === 'string' ? coreModule.api.Utils.i18n(saveData) : '')
                    const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                    const listName = `${actionTypeName}${name}`
                    const encodedValue = [actionType, id].join(this.delimiter)
                    const modifier = coreModule.api.Utils.getModifier(saveData.mod)
                    const info1 = this.actor ? { text: modifier } : ''
                    const tooltipName = `${name}${(this.actor && modifier) ? ` ${modifier}` : ''}`
                    const tooltipData = {
                        name: tooltipName,
                        modifiers: saveData?.modifiers
                    }
                    const tooltip = (this.actor) ? await this._getTooltip(tooltipData) : null
                    return {
                        id,
                        name,
                        listName,
                        encodedValue,
                        info1,
                        tooltip
                    }
                })
            )

            // Get group data
            const groupData = { id: 'saves', type: 'system' }

            // Add actions to action list
            this.addActions(actions, groupData)
        }

        /**
         * Build skill actions
         * @private
         */
        async _buildSkillActions () {
            const actionType = 'compendiumMacro'

            // Get skill actions
            const actionMacros = await game.packs.get('pf2e.action-macros').getIndex()

            if (!actionMacros.size) return

            const skillActionsMap = new Map()

            const actions = []

            for (const actionMacro of actionMacros) {
                const skillAction = SKILL_ACTION[actionMacro._id]

                if (!skillAction) continue

                const id = actionMacro._id
                const actionName = coreModule.api.Utils.i18n(skillAction.name)
                const skillName = coreModule.api.Utils.i18n(SKILL[skillAction.skill]?.name)
                const name = `${actionName} - ${skillName}`
                const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE.skillAction)}: ` ?? ''
                const listName = `${actionTypeName}${name}`
                const encodedValue = [actionType, 'pf2e.action-macros', id].join(this.delimiter)
                const icon1 = this._getActionIcon(skillAction.actionCost)
                const img = skillAction.image
                const modifier = coreModule.api.Utils.getModifier(this.actor?.skills[skillAction.skill]?.check?.mod)
                const info1 = (this.actor) ? { text: modifier } : null

                const action = {
                    id,
                    name,
                    listName,
                    encodedValue,
                    icon1,
                    img,
                    info1
                }

                // Get actions
                actions.push(action)

                skillActionsMap.set(skillAction.skill, skillActionsMap.get(skillAction.skill) || new Map())
                skillActionsMap.get(skillAction.skill).set(actionMacro._id, { ...action, name: actionName })
            }

            // Add actions to HUD
            await this.addActions(actions, { id: 'skill-actions-ungrouped', type: 'system' })

            for (const [key, value] of Object.entries(SKILL)) {
                const groupId = key
                const groupName = coreModule.api.Utils.i18n(value.name)
                const skillActions = skillActionsMap.get(groupId)

                if (!skillActions) continue

                // Create group data
                const groupData = { id: groupId, name: groupName, type: 'system-derived' }

                // Add group to HUD
                await this.addGroup(groupData, { id: 'skill-actions-grouped', type: 'system' })

                // Get actions
                const actions = [...skillActions].map(([_, skillAction]) => {
                    return skillAction
                })

                // Add actions to HUD
                await this.addActions(actions, groupData)
            }
        }

        /**
         * Build skills
         * @private
         */
        async _buildSkills () {
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
                const groupId = key
                const skills = value

                // Create group data
                const groupData = { id: groupId, type: 'system' }

                // Get actions
                const actions = await Promise.all(
                    [...skills].map(async ([skillId, skillData]) => {
                        const id = skillId
                        const label = coreModule.api.Utils.i18n(skillData.label) ?? coreModule.api.Utils.i18n(CONFIG.PF2E.skillList[skillId])
                        const name = this.abbreviatedSkills ? SKILL_ABBREVIATION[skillData.slug] ?? label : label
                        const fullName = label
                        const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                        const listName = `${actionTypeName}${name}`
                        const encodedValue = [actionType, id].join(this.delimiter)
                        const cssClass = (this.actor && this.colorSkills && skillData.rank > 0) ? `tah-pf2e-skill-rank-${skillData.rank}` : ''
                        const modifier = coreModule.api.Utils.getModifier(skillData.check?.mod)
                        const info1 = this.actor ? { text: modifier } : ''
                        const tooltipName = `${fullName}${(this.actor && modifier) ? ` ${modifier}` : ''}`
                        const tooltipData = {
                            name: tooltipName,
                            modifiers: skillData?.modifiers
                        }
                        const tooltip = (this.actor) ? await this._getTooltip(tooltipData) : null

                        return {
                            id,
                            name,
                            fullName,
                            listName,
                            encodedValue,
                            cssClass,
                            info1,
                            tooltip
                        }
                    })
                )

                // Add actions to action list
                this.addActions(actions, groupData)
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

            // Create parent group data
            const parentGroupData = { id: 'spells', type: 'system' }

            const spellcastingEntries = [...this.items].filter(item => item[1].type === 'spellcastingEntry')

            for (const spellcastingEntry of spellcastingEntries) {
                const bookGroupId = `spells+${spellcastingEntry[1].name.slugify({ replacement: '-', strict: true })}`
                const bookGroupName = spellcastingEntry[1].name
                const bookInfo1 = this._getSpellDcInfo(spellcastingEntry[1])

                // Create book group data
                const bookGroupData = {
                    id: bookGroupId,
                    name: bookGroupName,
                    type: 'system-derived',
                    info1: bookInfo1
                }

                // Add group to action list
                await this.addGroup(bookGroupData, parentGroupData)

                // Add spell slot info to group
                this.addGroupInfo(bookGroupData)

                const spellInfo = await (spellcastingEntry[1].getSpellData ? spellcastingEntry[1].getSpellData() : spellcastingEntry[1].getSheetData())
                const activeLevels = spellInfo.levels.filter((level) => level.active.length > 0)

                for (const level of Object.entries(activeLevels)) {
                    const spellLevel = level[1].level
                    const levelGroupId = `${bookGroupId}+${spellLevel}`
                    const levelGroupName = String(coreModule.api.Utils.i18n(level[1].label))

                    // Create level group data
                    const levelGroupData = {
                        id: levelGroupId,
                        name: levelGroupName,
                        type: 'system-derived'
                    }

                    // Add group to action list
                    await this.addGroup(levelGroupData, bookGroupData)

                    await this._addSpellSlotInfo(bookGroupData, levelGroupData, level, spellInfo)

                    // Get available spells
                    const activeSpells = level[1].active
                        .filter(activeSpell => !activeSpell?.expended && activeSpell)
                        .map(spell => spell.spell)

                    const items = new Map(activeSpells.map(spell => [spell.id, spell]))

                    const actions = await Promise.all(
                        [...items].map(async ([itemId, itemData]) => {
                            const id = this._getActionId(itemData, actionType, spellLevel)
                            const name = this._getActionName(itemData)
                            const listName = this._getActionListName(itemData, actionType)
                            const cssClass = this._getActionCss(itemData)
                            const encodedValue = this._getActionEncodedValue(itemData, actionType, spellLevel)
                            const icon1 = this._getIcon1(itemData, actionType)
                            const img = coreModule.api.Utils.getImage(itemData)
                            const info = this._getSpellInfo(itemData)
                            const chatData = await itemData.getChatData()
                            const tooltipData = {
                                name,
                                description: chatData.description.value,
                                properties: chatData.properties,
                                rarity: chatData.rarity,
                                traits: chatData.actionTraits,
                                traitsAlt: chatData.spellTraits
                            }
                            const tooltip = await this._getTooltip(tooltipData)
                            return {
                                id,
                                name,
                                listName,
                                encodedValue,
                                cssClass,
                                img,
                                icon1,
                                info,
                                tooltip
                            }
                        })
                    )

                    // Add actions to action list
                    this.addActions(actions, levelGroupData)
                }
            }
        }

        /** @private */
        async _addSpellSlotInfo (
            bookGroupData,
            levelGroupData,
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

            levelGroupData.info = { info1 }

            // Add group info to the group
            this.addGroupInfo(levelGroupData)

            const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE.spell)

            // Get actions
            const actions = [
                {
                    id: `${spellInfo.id}>${spellSlot}>slotIncrease`,
                    name: '+',
                    listName: `${actionTypeName}: ${bookGroupData.name}: ${levelGroupData.name}: +`,
                    encodedValue: [actionType, `${spellInfo.id}>${spellSlot}>slotIncrease`].join(this.delimiter),
                    cssClass: 'shrink'
                },
                {
                    id: `${spellInfo.id}>${spellSlot}>slotDecrease`,
                    name: '-',
                    listName: `${actionTypeName}: ${bookGroupData.name}: ${levelGroupData.name}: -`,
                    encodedValue: [actionType, `${spellInfo.id}>${spellSlot}>slotDecrease`].join(this.delimiter),
                    cssClass: 'shrink'
                }
            ]

            // Add actions to action list
            this.addActions(actions, levelGroupData)
        }

        /**
         * Build strikes
         */
        async _buildStrikes () {
            const actionType = 'strike'

            // Create parent group data
            const parentGroupData = { id: 'strikes', type: 'system' }

            // Get strikes
            const strikes = this.actor.system.actions
                .filter(action => action.type === actionType && (action.item.system.quantity > 0 || this.actor.type === 'npc'))

            // Exit if no strikes exist
            if (!strikes) return

            for (const strike of strikes) {
                const strikeId = `${strike.item.id}-${strike.slug}`
                const strikeGroupId = `strikes+${strikeId}`
                const strikeGroupName = strike.label
                const strikeGroupListName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ${strike.label} (${strike.item.id})`
                const image = strike.imageUrl
                const showTitle = this.showStrikeNames
                const descriptionLocalised = this._getStrikeDescription({ description: strike.description, criticalSuccess: strike.criticalSuccess, success: strike.success })
                const chatData = await strike?.item?.getChatData()
                const properties = chatData?.properties.filter(property => property !== 'PF2E.WeaponTypeMartial')
                const tooltipData = {
                    name: strike.label,
                    descriptionLocalised,
                    modifiers: strike.modifiers,
                    properties,
                    traits: strike.traits,
                    traitsAlt: strike.weaponTraits
                }
                const tooltip = await this._getTooltip(tooltipData)
                // Create group data
                const strikeGroupData = { id: strikeGroupId, name: strikeGroupName, listName: strikeGroupListName, type: 'system-derived', settings: { image, showTitle }, tooltip }

                // Add group to action list
                this.addGroup(strikeGroupData, parentGroupData, true)

                if (strike.auxiliaryActions?.length) {
                    // Get actions
                    const actions = strike.auxiliaryActions.flatMap((auxiliaryAction, index) => {
                        if (auxiliaryAction.purpose === 'Modular') {
                            const modularOptions = strike.item.system.traits.toggles.modular.options
                            const modularSelection = strike.item.system.traits.toggles.modular.selection
                            return modularOptions.map(modularOption => {
                                const id = encodeURIComponent(`${strike.item.id}>${strike.slug}>${index}>${modularOption}`)
                                const name = coreModule.api.Utils.i18n(MODULAR_OPTION[modularOption])
                                return {
                                    id,
                                    name,
                                    listName: `${strikeGroupListName}: ${name}`,
                                    encodedValue: ['auxAction', id].join(this.delimiter),
                                    icon1: this._getActionIcon(auxiliaryAction.glyph),
                                    cssClass: this._getActionCss({ selected: (modularOption === modularSelection) })
                                }
                            })
                        } else {
                            const id = encodeURIComponent(`${strike.item.id}>${strike.slug}>${index}>`)
                            const name = auxiliaryAction.label
                            return {
                                id,
                                name,
                                listName: `${strikeGroupListName}: ${name}`,
                                encodedValue: ['auxAction', id].join(this.delimiter),
                                icon1: this._getActionIcon(auxiliaryAction.glyph),
                                info: this._getItemInfo(auxiliaryAction)
                            }
                        }
                    })

                    // Add actions to action list
                    this.addActions(actions, strikeGroupData)
                }
                if (strike.ready) {
                    if (strike.versatileOptions?.length) {
                        // Get actions
                        const actions = strike.versatileOptions.map(versatileOption => {
                            const id = encodeURIComponent(`${strike.item.id}>${strike.slug}>${versatileOption.value}>`)
                            const fullName = coreModule.api.Utils.i18n(versatileOption.label)
                            return {
                                id: encodeURIComponent(`${strike.item.id}>${strike.slug}>${versatileOption.value}>`),
                                name: '',
                                fullName,
                                listName: `${strikeGroupListName}: ${fullName}`,
                                encodedValue: ['versatileOption', id].join(this.delimiter),
                                cssClass: this._getActionCss(versatileOption),
                                icon1: this._getActionIcon(versatileOption.glyph, fullName)
                            }
                        })

                        // Add actions to action list
                        this.addActions(actions, strikeGroupData)
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
                        const usageGroupId = `${strikeGroupId}+${usage}`
                        const usageGroupName = (strikeUsage.attackRollType)
                            ? coreModule.api.Utils.i18n(strikeUsage.attackRollType)
                            : coreModule.api.Utils.i18n(STRIKE_USAGE[usage].name)
                        const usageGroupListName = `${strikeGroupListName}: ${usageGroupName}`
                        const usageGroupIcon = (usage !== 'thrown' && glyph)
                            ? `<span style='font-family: "Pathfinder2eActions"; font-size: var(--font-size-20);'>${glyph}</span>`
                            : STRIKE_ICON[usage]
                        const settings = { showTitle: (usage !== 'melee' && strikeUsages.length > 1) }

                        // Create group data
                        const usageGroupData = {
                            id: usageGroupId,
                            name: usageGroupName,
                            listName: usageGroupListName,
                            icon: usageGroupIcon,
                            type: 'system-derived',
                            settings
                        }

                        // Add group to action list
                        this.addGroup(usageGroupData, strikeGroupData)

                        const actions = strikeUsage.variants.map((variant, index) => {
                            const id = encodeURIComponent(`${strike.item.id}>${strike.slug}>${index}>` + usage)
                            const isMap = variant.label.includes('MAP')
                            const bonus = (isMap) ? strike.totalModifier + parseInt(variant.label.split(' ')[1]) : parseInt(variant.label.split(' ')[1])
                            const name = (this.calculateAttackPenalty) ? (bonus >= 0) ? `+${bonus}` : `${bonus}` : variant.label
                            return {
                                id,
                                name,
                                encodedValue: [actionType, id].join(this.delimiter),
                                listName: `${usageGroupListName}: ${name}`
                            }
                        })

                        // Get Damage
                        const damageId = encodeURIComponent(`${strike.item.id}>${strike.slug}>damage>${usage}`)
                        const damageName = coreModule.api.Utils.i18n('PF2E.DamageLabel')
                        actions.push({
                            id: damageId,
                            name: damageName,
                            listName: `${usageGroupListName}: ${damageName}`,
                            encodedValue: [actionType, damageId].join(this.delimiter)
                        })

                        // Get Critical
                        const criticalId = encodeURIComponent(`${strike.item.id}>${strike.slug}>critical>${usage}`)
                        const criticalName = coreModule.api.Utils.i18n('PF2E.CriticalDamageLabel')
                        actions.push({
                            id: criticalId,
                            name: criticalName,
                            listName: `${usageGroupListName}: ${criticalName}`,
                            encodedValue: [actionType, criticalId].join(this.delimiter)
                        })

                        // Get Ammo
                        if (strikeUsage.selectedAmmoId && !strikeUsage.ammunition) {
                            const item = this.actor.items.get(strikeUsage.selectedAmmoId)

                            if (!item) {
                                const id = 'noAmmo'
                                const name = coreModule.api.Utils.i18n('tokenActionHud.pf2e.noAmmo')
                                actions.push({
                                    id,
                                    name,
                                    listName: `${usageGroupListName}: ${name}`,
                                    encodedValue: id
                                })
                            } else {
                                const id = this._getActionId(item)
                                const name = this._getActionName(item)
                                actions.push({
                                    id,
                                    name,
                                    listName: `${usageGroupListName}: ${name}`,
                                    encodedValue: [actionType, id].join(this.delimiter)
                                })
                            }
                        }

                        // Add actions to action list
                        this.addActions(actions, usageGroupData)
                    }
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

            // Create group data
            const groupData = { id: 'toggles', type: 'system' }

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
            this.addActions(actions, groupData)
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

        _getActionId (entity, actionType, spellLevel) {
            return (actionType === 'spell') ? `${entity.id ?? entity._id}-${spellLevel}` : entity.id ?? entity._id
        }

        _getActionName (entity) {
            return entity?.name ?? entity?.label ?? ''
        }

        _getActionListName (entity, actionType) {
            const name = this._getActionName(entity)
            const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
            return entity.listName ?? `${actionTypeName}${name}`
        }

        _getActionCss (entity) {
            if (Object.hasOwn(entity, 'disabled')) {
                const active = (!entity.disabled) ? ' active' : ''
                return `toggle${active}`
            }
            if (Object.hasOwn(entity, 'selected')) {
                const active = (entity.selected) ? ' active' : ''
                return `toggle${active}`
            }
        }

        _getActionEncodedValue (entity, actionType, spellLevel) {
            const spellcastingId = entity?.spellcasting?.id
            const encodedId = (actionType === 'spell') ? `${spellcastingId}>${spellLevel}>${entity.id ?? entity._id}` : this._getActionId(entity, actionType, spellLevel)
            return [actionType, encodedId].join(this.delimiter)
        }

        _getIcon1 (entity, actionType) {
            const actions = entity.system?.actions
            const actionTypes = ['free', 'reaction', 'passive']
            const actionTypeValue = entity.system?.actionType?.value
            const actionsCost = (actions) ? parseInt((actions || {}).value, 10) : null
            const timeValue = entity.system?.time?.value
            const actionIcon = entity.actionIcon
            const iconType = (actionType === 'spell') ? timeValue : (actionTypes.includes(actionTypeValue)) ? actionTypeValue : actionsCost ?? actionIcon
            const name = this._getActionName(entity)
            return this._getActionIcon(iconType, name)
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
        _getActionIcon (action, title = '') {
            if (['bow-arrow', 'axe'].includes(action)) {
                return `<i class="${ACTION_ICON[action]}" data-tooltip="${title}"></i>`
            }
            return ACTION_ICON[action]
        }

        /** @protected */
        _foundrySort (a, b) {
            if (!(a?.sort || b?.sort)) return 0

            return a.sort - b.sort
        }

        /**
         * Get tooltip
         * @param {object} tooltipData The tooltip data
         * @returns {string}           The tooltip
         */
        async _getTooltip (tooltipData) {
            if (typeof tooltipData === 'string') return tooltipData

            const name = coreModule.api.Utils.i18n(tooltipData.name)
            const nameHtml = `<h3>${name}</h3>`

            const description = coreModule.api.Utils.i18n(tooltipData?.description ?? tooltipData?.descriptionLocalised ?? '')

            const rarityHtml = tooltipData?.rarity
                ? `<span class="tag ${tooltipData.rarity.name}">${coreModule.api.Utils.i18n(tooltipData.rarity.label)}</span>`
                : ''

            const propertiesHtml = tooltipData?.properties
                ? `<div class="tah-properties">${tooltipData.properties.map(property => `<span class="tah-property">${coreModule.api.Utils.i18n(property)}</span>`).join('')}</div>`
                : ''

            const traitsHtml = tooltipData?.traits
                ? tooltipData.traits.map(trait => `<span class="tag">${coreModule.api.Utils.i18n(trait.label)}</span>`).join('')
                : ''

            const traits2Html = tooltipData?.traits2
                ? tooltipData.traits2.map(trait => `<span class="tag tag_secondary">${coreModule.api.Utils.i18n(trait.label ?? trait)}</span>`).join('')
                : ''

            const traitsAltHtml = tooltipData?.traitsAlt
                ? tooltipData.traitsAlt.map(trait => `<span class="tag tag_alt">${coreModule.api.Utils.i18n(trait.label)}</span>`).join('')
                : ''

            const modifiersHtml = tooltipData?.modifiers
                ? `<div class="tags">${tooltipData.modifiers.filter(modifier => modifier.enabled).map(modifier => {
                    const label = coreModule.api.Utils.i18n(modifier.label)
                    const sign = modifier.modifier >= 0 ? '+' : ''
                    const mod = `${sign}${modifier.modifier ?? ''}`
                    return `<span class="tag tag_transparent">${label} ${mod}</span>`
                }).join('')}</div>`
                : ''

            const tagsJoined = [rarityHtml, traitsHtml, traits2Html, traitsAltHtml].join('')

            const tagsHtml = (tagsJoined) ? `<div class="tags">${tagsJoined}</div>` : ''

            const headerTags = (tagsHtml || modifiersHtml) ? `<div class="tah-tags-wrapper">${tagsHtml}${modifiersHtml}</div>` : ''

            if (!description && !tagsHtml && !modifiersHtml) return name

            const tooltipHtml = await TextEditor.enrichHTML(
                `<div>${nameHtml}${headerTags}${description}${propertiesHtml}</div>`,
                { async: true }
            )

            return tooltipHtml
        }

        _getStrikeDescription (data) {
            const description = (data?.description) ? `<p>${coreModule.api.Utils.i18n(data?.description)}</p>` : ''
            const criticalSuccess = (data?.criticalSuccess) ? `<hr><h4>${coreModule.api.Utils.i18n('PF2E.Check.Result.Degree.Check.criticalSuccess')}</h4><p>${coreModule.api.Utils.i18n(data?.criticalSuccess)}</p>` : ''
            const success = (data?.success) ? `<h4>${coreModule.api.Utils.i18n('PF2E.Check.Result.Degree.Check.success')}</h4><p>${coreModule.api.Utils.i18n(data?.success)}</p>` : ''
            return `${description}${criticalSuccess}${success}`
        }
    }
})
