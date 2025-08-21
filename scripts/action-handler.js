// System Module Imports
import { ACTION_ICON, ACTION_TYPE, CARRY_TYPE_ICON, ITEM_TYPE, MODULAR_OPTION, SKILL_ABBREVIATION, SKILL, SKILL_ACTION, STRIKE_ICON, STRIKE_USAGE, DAMAGE_TYPE_ICONS } from './constants.js'
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

        mapLabel = coreModule.api.Utils.i18n('PF2E.MAPAbbreviationLabel').replace(' {penalty}', '')

        /**
         * Build System Actions
         * @override
         * @param {array} groupIds
         */
        async buildSystemActions (groupIds) {
            // Set actor and token variables
            this.actors = (!this.actor) ? this.#getActors() : [this.actor]
            this.actorType = this.actor?.type

            // Exit if actor is not a known type
            const knownActors = ['character', 'familiar', 'hazard', 'npc']
            if (this.actorType && !knownActors.includes(this.actorType)) return

            // Set items variable
            if (this.actor) {
                let items = this.actor.items
                items = coreModule.api.Utils.sortItemsByName(items)
                this.items = items
            }

            // Set settings variables
            this.abbreviateSkills = Utils.getSetting('abbreviateSkills')
            this.addAuxiliaryActions = Utils.getSetting('addAuxiliaryActions')
            this.addDamageAndCritical = Utils.getSetting('addDamageAndCritical')
            this.addStowedItems = Utils.getSetting('addStowedItems')
            this.addUnequippedItems = Utils.getSetting('addUnequippedItems')
            this.calculateAttackPenalty = Utils.getSetting('calculateAttackPenalty')
            this.colorSkills = Utils.getSetting('colorSkills')
            this.showStrikeImages = Utils.getSetting('showStrikeImages')
            this.showStrikeNames = Utils.getSetting('showStrikeNames')
            this.showStrikeTraits = Utils.getSetting('showStrikeTraits')
            this.splitStrikes = Utils.getSetting('splitStrikes')

            // Set group variables
            this.groupIds = groupIds

            if (this.actorType === 'character') {
                await this.#buildCharacterActions()
            } else if (this.actorType === 'familiar') {
                await this.#buildFamiliarActions()
            } else if (this.actorType === 'hazard') {
                await this.#buildHazardActions()
            } else if (this.actorType === 'npc') {
                await this.#buildNpcActions()
            } else if (!this.actor) {
                this.#buildMultipleTokenActions()
            }
        }

        /**
         * Build character actions
         * @private
         */
        async #buildCharacterActions () {
            await Promise.all([
                this.#buildActions(),
                this.#buildCombat(),
                this.#buildConditions(),
                this.#buildEffects(),
                this.#buildFeats(),
                this.#buildHeroActions(),
                this.#buildPoints('heroPoints'),
                this.#buildPoints('mythicPoints'),
                this.#buildInitiative(),
                this.#buildInventory(),
                this.#buildPerceptionCheck(),
                this.#buildRecoveryCheck(),
                this.#buildRests(),
                this.#buildSaves(),
                this.#buildSkillActions(),
                this.#buildSkills(),
                this.#buildSpells(),
                this.#buildStrikes(),
                this.#buildToggles()
            ])
            // Build elemental blasts after other character actions so they are grouped together
            await this.#buildElementalBlasts()
        }

        /**
         * Build familiar actions
         * @private
         */
        async #buildFamiliarActions () {
            await Promise.all([
                this.#buildActions(),
                this.#buildAttack(),
                this.#buildCombat(),
                this.#buildConditions(),
                this.#buildEffects(),
                this.#buildInventory(),
                this.#buildPerceptionCheck(),
                this.#buildSaves(),
                this.#buildSkills()
            ])
        }

        /**
         * Build hazard actions
         * @private
         */
        async #buildHazardActions () {
            await Promise.all([
                this.#buildActions(),
                this.#buildCombat(),
                this.#buildInitiative(),
                this.#buildSaves(),
                this.#buildStrikes()
            ])
        }

        /**
         * Build NPC actions
         */
        async #buildNpcActions () {
            await Promise.all([
                this.#buildActions(),
                this.#buildCombat(),
                this.#buildConditions(),
                this.#buildEffects(),
                this.#buildFeats(),
                this.#buildInitiative(),
                this.#buildInventory(),
                this.#buildPerceptionCheck(),
                this.#buildSaves(),
                this.#buildSkillActions(),
                this.#buildSkills(),
                this.#buildStrikes(),
                this.#buildSpells(),
                this.#buildToggles()
            ])
        }

        /**
         * Build multiple token actions
         * @private
         * @returns {object}
         */
        async #buildMultipleTokenActions () {
            await Promise.all([
                this.#buildInitiative(),
                this.#buildPerceptionCheck(),
                this.#buildSaves(),
                this.#buildSkillActions(),
                this.#buildSkills()
            ])
        }

        /**
         * Build actions
         */
        async #buildActions () {
            const actionType = 'action'

            // Exit early if no items exist
            if (this.items.size === 0) return

            const actionTypes = ['action', 'reaction', 'free', 'passive']

            const actionItems = new Map([...this.items].filter(([_, itemData]) => itemData.type === 'action' || actionTypes.includes(itemData.system?.actionType?.value)))

            const actionsMap = new Map()

            for (const [key, value] of actionItems) {
                if (value.suppressed === true) continue

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
                if (value.suppressed === true) continue

                const groupId = key
                const items = value

                // Create group data
                const groupData = { id: groupId, type: 'system' }

                const actions = await Promise.all(
                    [...items].map(async ([_, itemData]) => {
                        const id = this.#getActionId(itemData)
                        const name = this.#getActionName(itemData)
                        const listName = this.#getActionListName(itemData, actionType)
                        const cssClass = this.#getActionCss(itemData)
                        const encodedValue = [actionType, id].join(this.delimiter)
                        const icon1 = this.#getIcon1(itemData, actionType)
                        const img = coreModule.api.Utils.getImage(itemData)
                        const info = this.#getItemInfo(itemData)
                        const tooltipData = await this.#getTooltipData(itemData, actionType)
                        const tooltip = await this.#getTooltip(actionType, tooltipData)

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
        #buildAttack () {
            const actionType = 'familiarAttack'

            const attack = this.actor.system.attack

            if (attack) {
                const id = attack.slug
                const name = coreModule.api.Utils.i18n('PF2E.AttackLabel')
                const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                const listName = `${actionTypeName}${name}`
                const encodedValue = [actionType, id].join(this.delimiter)
                const modifier = coreModule.api.Utils.getModifier(attack?.totalModifier)
                const info1 = this.actor ? { text: modifier } : ''

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
        #buildCombat () {
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
        async #buildConditions () {
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
                    const tooltip = await this.#getTooltip(actionType, tooltipData)

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

            actions.sort((a, b) => a.name.localeCompare(b.name))

            // Create group data
            const conditionsGroupData = { id: 'conditions', type: 'system' }
            const actionsTemp = []

            // Add conditions to the group
            await this.addActions(
                actions.reduce(function (acc, current) {
                    const filter = ['Friendly', 'Helpful', 'Hostile', 'Indifferent', 'Malevolence', 'Unfriendly']
                    if (!filter.includes(current.name)) {
                        acc.push(current)
                    } else {
                        actionsTemp.push(current)
                    }
                    return acc
                }, []),
                conditionsGroupData
            )

            const socialGroupData = { id: 'social-conditions', type: 'system' }
            const actionsOther = []

            // Add social conditions to the group
            await this.addActions(
                actionsTemp.reduce(function (acc, current) {
                    const filter = ['Friendly', 'Helpful', 'Hostile', 'Indifferent', 'Unfriendly']
                    if (filter.includes(current.name)) {
                        acc.push(current)
                    } else {
                        actionsOther.push(current)
                    }
                    return acc
                }, []),
                socialGroupData
            )

            const otherGroupData = { id: 'other-conditions', type: 'system' }

            // Add other conditions to the group
            await this.addActions(actionsOther, otherGroupData)
        }

        /**
         * Build hero points
         */
        async #buildPoints (actionType) {
            let actions, groupData

            const mythicEnabled = this.actor.system.resources?.mythicPoints.max ? true : false

            // Create group data
            if (actionType === 'heroPoints' && !mythicEnabled) {
                groupData = { id: 'hero-points', type: 'system' }

                const heroPoints = this.actor.system.resources?.heroPoints
                const value = heroPoints.value
                const max = heroPoints.max

                // Get actions
                actions = [{
                    id: 'heroPoints',
                    name: coreModule.api.Utils.i18n('PF2E.Actor.Resource.HeroPoints'),
                    encodedValue: [actionType, actionType].join(this.delimiter),
                    info1: { text: (max > 0) ? `${value ?? 0}/${max}` : '' }
                }]
            }
            else if (actionType === 'mythicPoints' && mythicEnabled) {
                groupData = { id: 'mythic-points', type: 'system' }

                const mythicPoints = this.actor.system.resources?.mythicPoints
                const value = mythicPoints.value
                const max = mythicPoints.max

                // Get actions
                actions = [{
                    id: 'mythicPoints',
                    name: coreModule.api.Utils.i18n('PF2E.Actor.Resource.MythicPoints'),
                    encodedValue: [actionType, actionType].join(this.delimiter),
                    info1: { text: (max > 0) ? `${value ?? 0}/${max}` : '' }
                }]
            }

            // Add actions to action list
            if (actions && groupData) {
                this.addActions(actions, groupData)
            }
        }

        /**
         * Build effects
         * @private
         */
        async #buildEffects () {
            const actionType = 'effect'

            // Get effects
            const items = new Map([...this.items]
                .filter(item =>
                    item[1].type === 'effect' &&
                    ((!(item[1].system?.unidentified ?? false) &&
                    !(item[1].unidentified ?? false)) || game.user.isGM)))

            // Create group data
            const groupData = { id: 'effects', type: 'system' }

            const actions = await Promise.all(
                [...items].map(async ([_$, itemData]) => {
                    const id = this.#getActionId(itemData)
                    const name = this.#getActionName(itemData)
                    const listName = this.#getActionListName(itemData, actionType)
                    const cssClass = this.#getActionCss(itemData)
                    const encodedValue = [actionType, id].join(this.delimiter)
                    const icon1 = this.#getIcon1(itemData, actionType)
                    const img = coreModule.api.Utils.getImage(itemData)
                    const info = this.#getItemInfo(itemData)
                    const tooltipData = {
                        name,
                        description: itemData.description
                    }
                    const tooltip = await this.#getTooltip(actionType, tooltipData)
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

            actions.sort((a, b) => a.name.localeCompare(b.name))

            // Add actions to action list
            this.addActions(actions, groupData)
        }

        /**
         * Build Feats
         * @private
         */
        async #buildFeats () {
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
                if (value.suppressed === true) continue

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
                        const id = this.#getActionId(itemData)
                        const name = this.#getActionName(itemData)
                        const listName = this.#getActionListName(itemData, actionType)
                        const cssClass = this.#getActionCss(itemData)
                        const encodedValue = [actionType, id].join(this.delimiter)
                        const icon1 = this.#getIcon1(itemData, actionType)
                        const img = coreModule.api.Utils.getImage(itemData)
                        const info = this.#getItemInfo(itemData)
                        const tooltipData = await this.#getTooltipData(itemData, actionType)
                        const tooltip = await this.#getTooltip(actionType, tooltipData)
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
        * Build hero actions
        * @private
        */
        async #buildHeroActions () {
            if (!game.modules.get('pf2e-hero-actions')?.active) return

            const actionType = 'heroAction'
            const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionType])
            const heroActions = this.actor.getFlag('pf2e-hero-actions', 'heroActions') ?? []

            const groupData = { id: 'hero-actions', type: 'system' }

            const actions = []

            const heroPoints = this.actor.heroPoints?.value
            const remainingHeroPoints = heroPoints - (heroActions?.length ?? 0)

            if (remainingHeroPoints > 0) {
                actions.push({
                    id: 'drawHeroActions',
                    name: game.i18n.format('pf2e-hero-actions.templates.heroActions.draw', { nb: remainingHeroPoints }),
                    listName: `${actionTypeName}: ${game.i18n.localize('pf2e-hero-actions.templates.heroActions.draw').replace('({nb}) ', '')}`,
                    encodedValue: [actionType, 'drawHeroActions'].join(this.delimiter)
                })
            }

            const heroActionActions = await Promise.all(
                [...heroActions].map(async (heroAction) => {
                    const id = heroAction?.uuid
                    const name = heroAction?.name
                    const listName = `${actionTypeName}: ${name}`
                    const encodedValue = [actionType, id].join(this.delimiter)
                    const img = coreModule.api.Utils.getImage('systems/pf2e/icons/actions/Passive.webp')
                    const uuidData = (heroAction?.uuid) ? await fromUuid(heroAction?.uuid) : null
                    const tooltipData = {
                        name,
                        description: uuidData?.text?.content ?? null
                    }
                    const tooltip = await this.#getTooltip(actionType, tooltipData)
                    return {
                        id,
                        name,
                        encodedValue,
                        img,
                        listName,
                        tooltip
                    }
                })
            )

            actions.push(...heroActionActions)

            // Add actions to action list
            this.addActions(actions, groupData)
        }

        /**
         * Build initiative
         * @private
         */
        async #buildInitiative () {
            const actionType = 'initiative'

            const initiativeStatistic = this.actor?.system?.initiative?.statistic ?? null

            // Get actions
            const actions = []

            if (this.actorType !== 'hazard') {
                const initiative = this.actor ? this.actor.system.initiative : coreModule.api.Utils.i18n('PF2E.PerceptionLabel')
                const fullName = coreModule.api.Utils.i18n('PF2E.PerceptionLabel')
                const name = this.abbreviatedSkills ? SKILL_ABBREVIATION.perception ?? fullName : fullName
                const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                const listName = `${actionTypeName}${name}`
                const encodedValue = [actionType, 'perception'].join(this.delimiter)
                const active = (initiativeStatistic === 'perception') ? ' active' : ''
                const cssClass = `toggle${active}`
                const modifier = coreModule.api.Utils.getModifier(initiative?.totalModifier)
                const info1 = this.actor ? { text: modifier } : ''
                const tooltipName = `${fullName}${(this.actor && modifier) ? ` ${modifier}` : ''}`
                const tooltipData = {
                    name: tooltipName,
                    modifiers: initiative?.modifiers
                }
                const tooltip = this.actor ? await this.#getTooltip(actionType, tooltipData) : null

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
            }

            // Get skills
            const skills = (this.actor)
                ? Object.entries(this.actor.skills).filter(([_, skillData]) => !!skillData.label && skillData.label.length > 1)
                : this.#getSharedSkills()

            if (!skills) return

            const coreSkills = []
            const loreSkills = []

            for (const skill of skills) {
                if (!skill[1].lore) {
                    coreSkills.push(skill)
                } else {
                    loreSkills.push(skill)
                }
            }

            coreSkills.sort((a, b) => a[1].label.localeCompare(b[1].label))
            loreSkills.sort((a, b) => a[1].label.localeCompare(b[1].label))

            const skillActions = await Promise.all(
                [...coreSkills, ...loreSkills].map(async ([skillId, skillData]) => {
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
                    const tooltip = (this.actor) ? await this.#getTooltip(actionType, tooltipData) : null

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
        async #buildInventory () {
            // Exit if no items exist
            if (this.items.size === 0) return

            const actionType = 'item'
            const inventoryMap = new Map()

            for (const [key, value] of this.items) {
                const hasQuantity = value.system?.quantity > 0
                const isEquippedItem = this.#isEquippedItem(value)
                const isAddItem = this.#isAddItem('nonContainer', value)
                const type = value.type

                if (hasQuantity && isAddItem) {
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
                const groupId = ITEM_TYPE[id]?.groupId

                if (!groupId) continue

                // Create group data
                const groupData = { id: groupId, type: 'system' }

                // Get actions
                const actions = await Promise.all(
                    [...items].map(async ([_, itemData]) => {
                        const id = this.#getActionId(itemData)
                        const name = this.#getActionName(itemData)
                        const listName = this.#getActionListName(itemData, actionType)
                        const cssClass = this.#getActionCss(itemData)
                        const encodedValue = [actionType, id].join(this.delimiter)
                        const icon1 = this.#getIcon1(itemData, actionType)
                        const icon2 = this.#getCarryTypeIcon(itemData)
                        const img = coreModule.api.Utils.getImage(itemData)
                        const info = this.#getItemInfo(itemData)
                        const tooltipData = await this.#getTooltipData(itemData, actionType)
                        const tooltip = await this.#getTooltip(actionType, tooltipData)

                        return {
                            id,
                            name,
                            encodedValue,
                            cssClass,
                            img,
                            icon1,
                            icon2,
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
                    const groupData = {
                        id,
                        name: container.name,
                        listName: `Group: ${container.name}`,
                        type: 'system-derived'
                    }

                    // Add group to action list
                    await this.addGroup(groupData, parentGroupData)

                    const contentsMap = new Map()

                    for (const content of contents) {
                        const isAddItem = this.#isAddItem('container', content)

                        if (isAddItem) {
                            contentsMap.set(content.id, content)
                        }
                    }

                    const actions = await Promise.all(
                        [...contentsMap].map(async ([_, itemData]) => {
                            const id = this.#getActionId(itemData)
                            const name = this.#getActionName(itemData)
                            const listName = this.#getActionListName(itemData, actionType)
                            const cssClass = this.#getActionCss(itemData)
                            const encodedValue = [actionType, id].join(this.delimiter)
                            const icon1 = this.#getIcon1(itemData, actionType)
                            const icon2 = this.#getCarryTypeIcon(itemData)
                            const img = coreModule.api.Utils.getImage(itemData)
                            const info = this.#getItemInfo(itemData)
                            const tooltipData = await this.#getTooltipData(itemData, actionType)
                            const tooltip = await this.#getTooltip(actionType, tooltipData)

                            return {
                                id,
                                name,
                                encodedValue,
                                cssClass,
                                img,
                                icon1,
                                icon2,
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
        async #buildPerceptionCheck () {
            const actionType = 'perceptionCheck'
            const perception = this.actor ? this.actor.system.perception : coreModule.api.Utils.i18n('PF2E.PerceptionLabel')
            const name = coreModule.api.Utils.i18n('PF2E.PerceptionLabel')
            const modifier = coreModule.api.Utils.getModifier(perception?.totalModifier)
            const info1 = this.actor ? { text: modifier } : ''
            const tooltipName = `${name}${(this.actor && modifier) ? ` ${modifier}` : ''}`
            const tooltipData = {
                name: tooltipName,
                modifiers: perception?.modifiers
            }
            const tooltip = await this.#getTooltip(actionType, tooltipData)

            // Get actions
            const actions = [{
                id: 'perception',
                name,
                encodedValue: [actionType, 'perception'].join(this.delimiter),
                info1,
                tooltip
            }]

            // Create group data
            const groupData = { id: 'perception-check', type: 'system' }

            // Add actions to action list
            this.addActions(actions, groupData)
        }

        /**
         * Build recovery check
         */
        #buildRecoveryCheck () {
            const actionType = 'recoveryCheck'
            const dyingValue = this.actor?.system.attributes?.dying

            if (dyingValue?.value > 0) {
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
        #buildRests () {
            // Exit if multiple actors and not every actor is the character type
            if (!this.actor && !this.actors.every(actor => actor.type === 'character')) return

            const actionType = 'utility'

            // Get actions
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
        async #buildSaves () {
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
                    const tooltip = this.actor ? await this.#getTooltip(actionType, tooltipData) : null

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
        async #buildSkillActions () {
            const actionType = 'compendiumMacro'

            // Get skill actions
            const actionMacros = await game.packs.get('pf2e.action-macros').getIndex()

            if (!actionMacros.size) return

            const skillActionsMap = new Map()

            // Get actions
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
                const icon1 = this.#getActionIcon(skillAction.actionCost)
                const img = skillAction.image
                const modifier = coreModule.api.Utils.getModifier(this.actor?.skills[skillAction.skill]?.check?.mod)
                const info1 = this.actor ? { text: modifier } : null

                const action = {
                    id,
                    name,
                    listName,
                    encodedValue,
                    icon1,
                    img,
                    info1
                }

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
        async #buildSkills () {
            const actionType = 'skill'

            // Get skills
            const skills = (this.actor)
                ? Object.entries(this.actor.skills).filter(skill => !!skill[1].label && skill[1].label.length > 1)
                : this.#getSharedSkills()

            if (!skills) return

            const coreSkills = []
            const loreSkills = []

            for (const skill of skills) {
                if (!skill[1].lore) {
                    coreSkills.push(skill)
                } else {
                    loreSkills.push(skill)
                }
            }

            coreSkills.sort((a, b) => a[1].label.localeCompare(b[1].label))
            loreSkills.sort((a, b) => a[1].label.localeCompare(b[1].label))

            const skillsMap = new Map()

            skillsMap.set('skills', new Map())

            if (coreSkills.length > 0) {
                skillsMap.set('core-skills', new Map())
            }
            if (loreSkills.length > 0) {
                skillsMap.set('lore-skills', new Map())
            }

            for (const skill of [...coreSkills, ...loreSkills]) {
                if (!skill[1].lore) {
                    skillsMap.get('core-skills').set(skill[0], skill[1])
                } else {
                    skillsMap.get('lore-skills').set(skill[0], skill[1])
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
                        const tooltip = (this.actor) ? await this.#getTooltip(actionType, tooltipData) : null

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
        #getSharedSkills () {
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
        async #buildSpells () {
            const actionType = 'spell'

            // Create parent group data
            const parentGroupData = { id: 'spells', type: 'system' }

            const spellcastingEntries = [...this.items].filter(item => item[1].type === 'spellcastingEntry')

            for (const spellcastingEntry of spellcastingEntries) {
                const spellbookGroupId = `spells+${spellcastingEntry[1].name.slugify({ replacement: '-', strict: true })}`
                const spellbookGroupName = spellcastingEntry[1].name
                const spellbookInfo1 = this.#getSpellDcInfo(spellcastingEntry[1])

                // Create book group data
                const bookGroupData = {
                    id: spellbookGroupId,
                    name: spellbookGroupName,
                    type: 'system-derived',
                    info1: spellbookInfo1
                }

                // Add group to action list
                await this.addGroup(bookGroupData, parentGroupData)

                // Add spell slot info to group
                this.addGroupInfo(bookGroupData)

                const spellInfo = await spellcastingEntry[1].getSheetData()
                const activeLevels = spellInfo.groups.filter(level => level.active.length > 0)

                for (const level of Object.entries(activeLevels)) {
                    const spellLevel = level[1].id
                    const levelGroupId = `${spellbookGroupId}+${spellLevel}`
                    const levelGroupName = String(coreModule.api.Utils.i18n(level[1].label))

                    // Create level group data
                    const levelGroupData = {
                        id: levelGroupId,
                        name: levelGroupName,
                        type: 'system-derived'
                    }

                    // Add group to action list
                    await this.addGroup(levelGroupData, bookGroupData)

                    await this.#addSpellSlotInfo(bookGroupData, levelGroupData, level, spellInfo)

                    // Get available spells
                    const activeSpells = level[1].active
                        .filter(activeSpell => activeSpell && !activeSpell.expended)
                        .map(spell => spell.spell)

                    const spells = new Map(activeSpells.map(spell => [spell.id, spell]))

                    // Get actions
                    const actions = await Promise.all(
                        [...spells].map(async ([_, itemData]) => {
                            const id = this.#getActionId(itemData, actionType, spellLevel)
                            const name = this.#getActionName(itemData)
                            const listName = this.#getActionListName(itemData, actionType)
                            const cssClass = this.#getActionCss(itemData)
                            const encodedValue = this.#getActionEncodedValue(itemData, actionType, spellLevel)
                            const icon1 = this.#getIcon1(itemData, actionType)
                            const img = coreModule.api.Utils.getImage(itemData)
                            const tooltipData = await this.#getTooltipData(itemData, actionType, spellLevel)
                            const tooltip = await this.#getTooltip(actionType, tooltipData)

                            return {
                                id,
                                name,
                                listName,
                                encodedValue,
                                cssClass,
                                img,
                                icon1,
                                tooltip
                            }
                        })
                    )

                    // Add actions to action list
                    this.addActions(actions, levelGroupData)
                }
            }
        }

        /**
         * Add spell slot info
         * @param {object} bookGroupData  The book group data
         * @param {object} levelGroupData The level group data
         * @param {number} level          The level
         * @param {object} spellInfo      The spell info
         */
        async #addSpellSlotInfo (
            bookGroupData,
            levelGroupData,
            level,
            spellInfo
        ) {
            const isCantrip = level[1].id === 'cantrips'
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
            const spellSlot = (isFocusPool) ? 'focus' : `slot${level[1].id}`
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
         * Build elemental blasts
         */
        async #buildElementalBlasts () {
            const actionType = 'elementalBlast'

            // Get elemental blasts
            const blasts = new game.pf2e.ElementalBlast(this.actor)?.configs
            const blastItem = this.actor.itemTypes.action.filter((i) => i.slug === "elemental-blast")[0] ?? null

            // Exit if no strikes exist
            if (!blasts.length || !blastItem) return

            // Create parent group data
            const parentGroupData = { id: 'strikes', type: 'system' }

            for (const blast of blasts) {
                let damageTypeActions = []
                let strikeGroupData = null
                const usageData = []

                const strikeId = `${blastItem.id}-${blast.element}`
                const strikeGroupId = `strikes+${strikeId}`
                const strikeGroupName = (() => {
                    let groupName = coreModule.api.Utils.i18n(blast.label)
                    if (this.showStrikeTraits && this.showStrikeNames) {
                        const blastTraits = blastItem.system.traits.value
                        if (blastTraits.length > 0) {
                            groupName += ' - '
                            for (const trait of blastTraits) {
                                groupName += '[' + trait + ']'
                            }
                        }
                    }
                    return groupName
                })()
                const strikeGroupListName = `${coreModule.api.Utils.i18n(ACTION_TYPE.strike)}: ${strikeGroupName} (${blastItem.id})`
                const image = blast.img ?? blastItem?.img
                const showTitle = this.showStrikeNames
                const tooltipData = await this.#getTooltipData(blast, actionType)
                const tooltip = await this.#getTooltip(actionType, tooltipData)

                // Create group data
                strikeGroupData = {
                    id: strikeGroupId,
                    name: strikeGroupName,
                    listName: strikeGroupListName,
                    type: 'system-derived',
                    settings: { showTitle },
                    tooltip
                }

                if (this.showStrikeImages) {
                    strikeGroupData.settings.image = image
                }

                // Add group to action list
                this.addGroup(strikeGroupData, parentGroupData)

                if (blast.damageTypes.length > 1) {
                    // Get actions
                    damageTypeActions = blast.damageTypes.map((damageType, index) => {
                        const id = encodeURIComponent(`${blastItem.id}>${blast.element}>${damageType.value}>`)
                        const fullName = damageType.label
                        return {
                            id,
                            name: '',
                            fullName,
                            listName: `${strikeGroupListName}: ${fullName}`,
                            encodedValue: ['elementalBlastDamageType', id].join(this.delimiter),
                            cssClass: this.#getActionCss(damageType),
                            icon1: this.#getActionIcon(damageType.icon, fullName)
                        }
                    })
                }

                const blastUsages = Object.entries(blast.maps) ?? []

                for (const [key, blastUsage] of blastUsages) {
                    const usage = key
                    const usageGroupId = `${strikeGroupId}+${key}`
                    const usageGroupName = (() => {
                        if (usage !== 'melee' && blast.range.max > 0 && blast.range.label.length > 0) {
                            return blast.range.label
                        } else {
                            return coreModule.api.Utils.i18n(STRIKE_USAGE[key].name)
                        }
                    })()
                    const usageGroupListName = `${strikeGroupListName}: ${usageGroupName}`
                    const usageGroupImage = (blastUsages.length > 1)
                        ? (usage === 'melee')
                            ? STRIKE_ICON.melee
                            : STRIKE_ICON.thrown
                        : ''
                    const usageGroupShowTitle = !((usageGroupImage || blastUsages.length <= 1))
                    const settings = { showTitle: usageGroupShowTitle, image: usageGroupImage }

                    const usageGroupData = {
                        id: usageGroupId,
                        name: usageGroupName,
                        listName: usageGroupListName,
                        type: 'system-derived',
                        settings
                    }

                    const rolls = Object.values(blastUsage)

                    const actions = rolls.map((roll, index) => {
                        const id = encodeURIComponent(`${blastItem.id}>${blast.element}>${index}>` + usage)
                        const isMap = `${roll}`.includes(this.mapLabel)
                        let modifier
                        if (isMap) {
                            modifier = `${roll}`.split(' ')[0]
                        } else {
                            modifier = `${roll}`.replace(coreModule.api.Utils.i18n('PF2E.WeaponStrikeLabel'), '').replace(' ', '')
                        }
                        const name = (this.calculateAttackPenalty) ? modifier : roll
                        return {
                            id,
                            name,
                            encodedValue: [actionType, id].join(this.delimiter),
                            listName: `${usageGroupListName}: ${name}`
                        }
                    })

                    // Get Damage
                    const damageId = encodeURIComponent(`${blastItem.id}>${blast.element}>damage>${usage}`)
                    const damageName = coreModule.api.Utils.i18n('PF2E.DamageLabel')
                    actions.push({
                        id: damageId,
                        name: damageName,
                        listName: `${usageGroupListName}: ${damageName}`,
                        encodedValue: [actionType, damageId].join(this.delimiter),
                        systemSelected: this.addDamageAndCritical
                    })

                    // Get Critical
                    const criticalId = encodeURIComponent(`${blastItem.id}>${blast.element}>critical>${usage}`)
                    const criticalName = coreModule.api.Utils.i18n('PF2E.CriticalDamageLabel')
                    actions.push({
                        id: criticalId,
                        name: criticalName,
                        listName: `${usageGroupListName}: ${criticalName}`,
                        encodedValue: [actionType, criticalId].join(this.delimiter),
                        systemSelected: this.addDamageAndCritical
                    })

                    usageData.push({ actions, usageGroupData })
                }

                if (this.splitStrikes) {
                    this.addActions(damageTypeActions, strikeGroupData)
                    for (const usage of usageData) {
                        this.addGroup(usage.usageGroupData, strikeGroupData)
                        this.addActions(usage.actions, usage.usageGroupData)
                    }
                } else {
                    this.addActions([...(usageData[0]?.actions || []), ...damageTypeActions], strikeGroupData)
                    usageData.shift()
                    for (const usage of usageData) {
                        this.addGroup(usage.usageGroupData, strikeGroupData)
                        this.addActions(usage.actions, usage.usageGroupData)
                    }
                }
            }
        }

        /**
         * Build strikes
         */
        async #buildStrikes () {
            const actionType = 'strike'

            // Create parent group data
            const parentGroupData = { id: 'strikes', type: 'system' }

            // Get strikes
            const strikes = this.actor.system.actions
                .filter(action => (action.type === actionType && (action.item.system.quantity > 0 || this.actor.type === 'hazard' || this.actor.type === 'npc')))

            // Exit if no strikes exist
            if (!strikes) return

            for (const strike of strikes) {
                let auxiliaryActions = []
                let versatileOptionActions = []
                let strikeGroupData = null
                const usageData = []

                const strikeId = `${strike.item.id}-${strike.slug}`
                const strikeGroupId = `strikes+${strikeId}`
                const strikeGroupName = (() => {
                    let groupName = strike.label
                    if (this.showStrikeTraits && this.showStrikeNames) {
                        let strikeTraits
                        if (this.actor.type === 'character') {
                            strikeTraits = strike.weaponTraits
                        } else {
                            strikeTraits = strike.traits
                        }
                        if (strikeTraits.length > 0) {
                            groupName += ' - '
                            for (const trait of strikeTraits) {
                                groupName += '[' + trait.label + ']'
                            }
                        }
                    }
                    return groupName
                })()
                const strikeGroupListName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ${strike.label} (${strike.item.id})`
                const image = strike.imageUrl ?? strike.item?.img
                const showTitle = this.showStrikeNames
                const tooltipData = await this.#getTooltipData(strike, actionType)
                const tooltip = await this.#getTooltip(actionType, tooltipData)

                // Create group data
                strikeGroupData = {
                    id: strikeGroupId,
                    name: strikeGroupName,
                    listName: strikeGroupListName,
                    type: 'system-derived',
                    settings: { showTitle },
                    tooltip
                }
                if (this.showStrikeImages) strikeGroupData.settings.image = image
                if (typeof strikeGroupData.settings.sort === 'undefined' && coreModule.api.Utils.getSetting('sortActions')) strikeGroupData.settings.sort = false

                // Add group to action list
                this.addGroup(strikeGroupData, parentGroupData)

                if (strike.auxiliaryActions?.length && this.addAuxiliaryActions) {
                    // Get actions
                    auxiliaryActions = strike.auxiliaryActions.flatMap((auxiliaryAction, index) => {
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
                                    encodedValue: ['strikeAuxiliaryAction', id].join(this.delimiter),
                                    cssClass: this.#getActionCss({ selected: (modularOption === modularSelection) }),
                                    icon1: this.#getActionIcon(auxiliaryAction.glyph)
                                }
                            })
                        } else {
                            const id = encodeURIComponent(`${strike.item.id}>${strike.slug}>${index}>`)
                            const name = auxiliaryAction.label
                            return {
                                id,
                                name,
                                listName: `${strikeGroupListName}: ${name}`,
                                encodedValue: ['strikeAuxiliaryAction', id].join(this.delimiter),
                                icon1: this.#getActionIcon(auxiliaryAction.glyph),
                                info: this.#getItemInfo(auxiliaryAction)
                            }
                        }
                    })
                }
                if (strike.ready) {
                    if (strike.versatileOptions?.length) {
                        // Get actions
                        versatileOptionActions = strike.versatileOptions.map(versatileOption => {
                            const encodedId = encodeURIComponent(`${strike.item.id}>${strike.slug}>${versatileOption.value}>`)
                            const fullName = coreModule.api.Utils.i18n(versatileOption.label)
                            return {
                                id: encodedId,
                                name: '',
                                fullName,
                                listName: `${strikeGroupListName}: ${fullName}`,
                                encodedValue: ['versatileOption', encodedId].join(this.delimiter),
                                cssClass: this.#getActionCss(versatileOption),
                                icon1: this.#getActionIcon(versatileOption.glyph, fullName)
                            }
                        })
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
                        const usageGroupImage = (strikeUsages.length > 1) ? STRIKE_ICON[usage] : ''
                        const usageGroupShowTitle = !((usageGroupImage || strikeUsages.length <= 1))
                        const settings = { showTitle: usageGroupShowTitle, image: usageGroupImage }

                        const usageGroupData = {
                            id: usageGroupId,
                            name: usageGroupName,
                            listName: usageGroupListName,
                            icon: usageGroupIcon,
                            type: 'system-derived',
                            settings
                        }

                        if (typeof usageGroupData.settings.sort === 'undefined' && coreModule.api.Utils.getSetting('sortActions')) {
                            usageGroupData.settings.sort = false
                        }

                        const actions = strikeUsage.variants.map((variant, index) => {
                            const id = encodeURIComponent(`${strike.item.id}>${strike.slug}>${index}>` + usage)
                            const isMap = variant.label.includes(this.mapLabel)
                            const modifier = (isMap)
                                ? variant.label.split(' ')[0]
                                : variant.label.replace(coreModule.api.Utils.i18n('PF2E.WeaponStrikeLabel'), '').replace(' ', '')
                            const name = (this.calculateAttackPenalty) ? modifier : variant.label
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
                            encodedValue: [actionType, damageId].join(this.delimiter),
                            systemSelected: this.addDamageAndCritical
                        })

                        // Get Critical
                        const criticalId = encodeURIComponent(`${strike.item.id}>${strike.slug}>critical>${usage}`)
                        const criticalName = coreModule.api.Utils.i18n('PF2E.CriticalDamageLabel')
                        actions.push({
                            id: criticalId,
                            name: criticalName,
                            listName: `${usageGroupListName}: ${criticalName}`,
                            encodedValue: [actionType, criticalId].join(this.delimiter),
                            systemSelected: this.addDamageAndCritical
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
                                const id = this.#getActionId(item)
                                const name = this.#getActionName(item)
                                actions.push({
                                    id,
                                    name,
                                    listName: `${usageGroupListName}: ${name}`,
                                    encodedValue: [actionType, id].join(this.delimiter)
                                })
                            }
                        }

                        usageData.push({ actions, usageGroupData })
                    }
                }

                if (this.splitStrikes) {
                    this.addActions([...versatileOptionActions, ...auxiliaryActions], strikeGroupData)
                    for (const usage of usageData) {
                        this.addGroup(usage.usageGroupData, strikeGroupData)
                        this.addActions(usage.actions, usage.usageGroupData)
                    }
                } else {
                    this.addActions([...(usageData[0]?.actions || []), ...versatileOptionActions, ...auxiliaryActions], strikeGroupData)
                    usageData.shift()
                    for (const usage of usageData) {
                        this.addGroup(usage.usageGroupData, strikeGroupData)
                        this.addActions(usage.actions, usage.usageGroupData)
                    }
                }
            }
        }

        /**
         * Build toggles
         */
        #buildToggles () {
            const actionType = 'toggle'

            // Get toggles
            const toggles = Object.values(this.actor.synthetics.toggles).flatMap(domain => Object.values(domain))

            // Exit if no toggles exist
            if (!toggles.length) return

            const togglesWithoutSuboptions = toggles.filter(toggle => toggle.suboptions.length === 0)
            const togglesWithSuboptions = toggles.filter(toggle => toggle.suboptions.length !== 0)

            // Create group data
            const groupData = { id: 'toggles', type: 'system' }

            // Get actions
            const actions = togglesWithoutSuboptions.map(toggle => {
                const id = encodeURIComponent(`${toggle.domain}>${toggle.option}>${toggle.itemId}>>`)
                const name = coreModule.api.Utils.i18n(toggle.label)
                const encodedValue = [actionType, id].join(this.delimiter)
                const active = (toggle.checked) ? ' active' : ''
                const cssClass = `toggle${active}`

                return { id, encodedValue, name, cssClass }
            })

            // Add actions to action list
            this.addActions(actions, groupData)

            for (const toggle of togglesWithSuboptions) {
                const id = [toggle.domain, toggle.option].join('.')
                const subgroupName = coreModule.api.Utils.i18n(toggle.label)
                const subgroupListName = `${ACTION_TYPE.toggle}: ${subgroupName}`
                const subgroupData = {
                    id,
                    name: subgroupName,
                    listName: subgroupListName,
                    type: 'system-derived'
                }

                this.addGroup(subgroupData, groupData)

                // Get actions
                const actions = toggle.suboptions.map(suboption => {
                    const id = encodeURIComponent(`${toggle.domain}>${toggle.option}>${toggle.itemId}>${suboption.value}`)
                    const name = coreModule.api.Utils.i18n(suboption.label)
                    const selected = suboption.selected && toggle.enabled && toggle.checked

                    return {
                        id,
                        name,
                        listName: `${subgroupListName}: ${name}`,
                        encodedValue: ['toggle', id].join(this.delimiter),
                        cssClass: this.#getActionCss({ selected })
                    }
                })

                // Add actions to action list
                this.addActions(actions, subgroupData)
            }
        }

        #getActionId (entity, actionType, spellLevel) {
            return (actionType === 'spell') ? `${entity.id ?? entity._id}-${spellLevel}` : entity.id ?? entity._id
        }

        #getActionName (entity) {
            return entity?.name ?? entity?.label ?? ''
        }

        #getActionListName (entity, actionType) {
            const name = this.#getActionName(entity)
            const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
            return entity.listName ?? `${actionTypeName}${name}`
        }

        #getActionCss (entity) {
            if (Object.hasOwn(entity, 'disabled')) {
                const active = (!entity.disabled) ? ' active' : ''
                return `toggle${active}`
            }
            if (Object.hasOwn(entity, 'selected')) {
                const active = (entity.selected) ? ' active' : ''
                return `toggle${active}`
            }
        }

        #getActionEncodedValue (entity, actionType, spellLevel) {
            const spellcastingId = entity?.spellcasting?.id
            const encodedId = (actionType === 'spell') ? `${spellcastingId}>${spellLevel}>${entity.id ?? entity._id}` : this.#getActionId(entity, actionType, spellLevel)
            return [actionType, encodedId].join(this.delimiter)
        }

        #getIcon1 (entity, actionType) {
            const actions = entity.system?.actions
            const actionTypes = ['free', 'reaction', 'passive']
            const actionTypeValue = entity.system?.actionType?.value
            const actionsCost = (actions) ? parseInt((actions || {}).value, 10) : null
            const timeValue = entity.system?.time?.value
            const actionIcon = entity.actionIcon
            const iconType = (actionType === 'spell') ? timeValue : (actionTypes.includes(actionTypeValue)) ? actionTypeValue : actionsCost ?? actionIcon
            const name = this.#getActionName(entity)
            return this.#getActionIcon(iconType, name)
        }

        /**
         * Get spell DC info
         * @private
         * @param {object} spellcastingEntry The spellcasting entry
         * @returns {string}                 The spell DC info
         */
        #getSpellDcInfo (spellcastingEntry) {
            const statistic = spellcastingEntry.statistic
            const spellDc = typeof statistic.dc === 'function'
                ? statistic.dc().value
                : statistic.dc.value
            const spellAttackModifier = statistic.check.mod
            const spellAttackBonus = spellAttackModifier >= 0
                ? `${coreModule.api.Utils.i18n('tokenActionHud.pf2e.atk')} +${spellAttackModifier}`
                : `${coreModule.api.Utils.i18n('tokenActionHud.pf2e.atk')} ${spellAttackModifier}`
            const spellDcInfo = `${coreModule.api.Utils.i18n('tokenActionHud.pf2e.dc')}${spellDc}`
            return `${spellAttackBonus} ${spellDcInfo}`
        }

        /**
         * Get actors
         * @private
         * @returns {object}
         */
        #getActors () {
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
        #isEquippedItem (item) {
            const carryTypes = ['held', 'worn']
            const carryType = item.system.equipped?.carryType

            if (this.addUnequippedItems) return true
            if (carryTypes.includes(carryType) && !item.system.containerId?.value?.length) return true
            return false
        }

        #isAddItem (groupType, item) {
            if (item.system.equipped?.carryType !== 'stowed') return true
            return this.#isAddStowedItem(groupType, item)
        }

        /**
         * Is add stowed item
         * @private
         * @param {string} groupType The group type: container or nonContainer
         * @param {object} item      The item
         * @returns {boolean}        Whether the stowed item should be added to the group
         */
        #isAddStowedItem (groupType, item) {
            if (item.system.equipped?.carryType !== 'stowed') return true
            if (this.addStowedItems === 'both') return true
            if (groupType === 'container' && this.addStowedItems === 'containers') return true
            if (groupType === 'nonContainer' && this.addStowedItems === 'nonContainers') return true
            return false
        }

        /**
         * Get item info
         * @private
         * @param {object} item
         * @returns {object}
         */
        #getItemInfo (item) {
            const quantityData = this.#getQuantityData(item) ?? ''
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
        #getQuantityData (item) {
            const quantity = item?.system?.quantity?.value
            return (quantity > 1) ? quantity : ''
        }

        /**
         * Get action icon
         * @private
         * @param {object} action
         * @returns {string}
         */
        #getActionIcon (action, title = '') {
            if (DAMAGE_TYPE_ICONS[action]) {
                return `<i class="${ACTION_ICON[action]}" data-tooltip="${title}"></i>`
            }
            return ACTION_ICON[action]
        }

        /**
         * Get carry type icon
         * @private
         * @param {object} itemData The item data
         * @returns {string}
         */
        #getCarryTypeIcon (itemData) {
            let carryType = ''
            switch (itemData?.carryType) {
            case 'held':
                if (itemData?.handsHeld === 2) {
                    carryType = 'held2'
                } else {
                    carryType = 'held1'
                }
                break
            default:
                carryType = itemData?.carryType
                break
            }
            const tooltip = coreModule.api.Utils.i18n(CARRY_TYPE_ICON[carryType]?.tooltip) ?? ''
            return CARRY_TYPE_ICON[carryType]?.icon.replace('placeholder', tooltip) ?? ''
        }

        /**
         * Get tooltip data
         * @param {object} entity     The entity
         * @param {string} actionType The action type
         * @returns {Promise<object>} The tooltip data
         */
        async #getTooltipData (entity, actionType, spellRank = null) {
            if (this.tooltipsSetting === 'none' || !entity) return ''
            else if (this.tooltipsSetting === 'nameOnly') return entity.name ?? ''

            let blastItem

            if (actionType === 'elementalBlast') {
                blastItem = this.actor.itemTypes.action.filter((i) => i.slug === "elemental-blast")[0] ?? null

                if (!blastItem) return ''
            }

            let chatData

            switch (actionType) {
            case 'elementalBlast':
                chatData = await blastItem.getChatData()
                break
            case 'strike':
                chatData = await entity.item.getChatData()
                break
            default:
                chatData = await entity.getChatData()
                break
            }

            if (!chatData) return ''

            switch (actionType) {
            case 'item':
                return {
                    name: entity.name,
                    description: chatData.description?.value,
                    rarity: chatData.rarity,
                    traits: chatData.traits,
                    traits2: chatData.properties
                }
            case 'spell':
            {
                return {
                    name: entity.name,
                    description: chatData.description?.value,
                    properties: chatData.properties,
                    rarity: chatData.rarity,
                    traits: chatData.traits,
                    traitsAlt: chatData.spellTraits
                }
            }
            case 'strike':
                return {
                    name: entity.label,
                    descriptionLocalised: this.#getStrikeDescription(entity),
                    modifiers: entity.modifiers,
                    properties: chatData.properties?.filter(property => property !== 'PF2E.WeaponTypeMartial'),
                    traits: entity.traits,
                    traitsAlt: entity.weaponTraits
                }
            default:
                return {
                    name: actionType === 'elementalBlast' ? blastItem.name : entity.name,
                    description: chatData.description?.value,
                    properties: chatData.properties,
                    rarity: chatData.rarity,
                    traits: chatData.traits
                }
            }
        }

        /**
         * Get tooltip
         * @private
         * @param {string} actionType  The action type
         * @param {object} tooltipData The tooltip data
         * @returns {Promise<string>}  The tooltip
         */
        async #getTooltip (actionType, tooltipData) {
            if (this.tooltipsSetting === 'none') return ''

            const name = coreModule.api.Utils.i18n(tooltipData.name)

            if (this.tooltipsSetting === 'nameOnly') return name

            if (typeof tooltipData === 'string') return tooltipData

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

            const tooltipHtml = `<div>${nameHtml}${headerTags}${description}${propertiesHtml}</div>`

            return await foundry.applications.ux.TextEditor.enrichHTML(tooltipHtml, { async: true })
        }

        /**
         * Get strike description
         * @private
         * @param {object} strike The strike data
         * @returns {string}      The strike description
         */
        #getStrikeDescription (strike) {
            const description = (strike?.description) ? `<p>${coreModule.api.Utils.i18n(strike?.description)}</p>` : ''
            const criticalSuccess = (strike?.criticalSuccess) ? `<hr><h4>${coreModule.api.Utils.i18n('PF2E.Check.Result.Degree.Check.criticalSuccess')}</h4><p>${coreModule.api.Utils.i18n(strike?.criticalSuccess)}</p>` : ''
            const success = (strike?.success) ? `<h4>${coreModule.api.Utils.i18n('PF2E.Check.Result.Degree.Check.success')}</h4><p>${coreModule.api.Utils.i18n(strike?.success)}</p>` : ''
            return `${description}${criticalSuccess}${success}`
        }
    }
})
