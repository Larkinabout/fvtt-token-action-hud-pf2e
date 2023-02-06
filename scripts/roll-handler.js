import { Utils } from './utils.js'

// Core Module Imports
import { CoreRollHandler, CoreUtils } from './config.js'

export class RollHandler extends CoreRollHandler {
    BLIND_ROLL_MODE = 'blindRoll'

    /**
     * Handle Action Event
     * @override
     * @param {object} event
     * @param {string} encodedValue
     */
    async doHandleActionEvent (event, encodedValue) {
        const payload = encodedValue.split('|')

        if (payload.length !== 4) {
            super.throwInvalidValueErr()
        }

        const actionType = payload[0]
        const actorId = payload[1]
        const tokenId = payload[2]
        const actionId = payload[3]

        const renderable = ['item', 'feat', 'action', 'lore', 'ammo']
        if (renderable.includes(actionType) && this.isRenderItem()) {
            return this.doRenderItem(actorId, tokenId, actionId)
        }
        const knownCharacters = ['character', 'familiar', 'npc']
        if (tokenId === 'multi' && actionId !== 'toggleCombat') {
            const controlledTokens = canvas.tokens.controlled.filter((token) =>
                knownCharacters.includes(token.actor?.type)
            )
            for (const token of controlledTokens) {
                const tokenActorId = token.actor?.id
                const tokenTokenId = token.id
                await this._handleMacros(
                    event,
                    actionType,
                    tokenActorId,
                    tokenTokenId,
                    actionId
                )
            }
        } else {
            await this._handleMacros(event, actionType, actorId, tokenId, actionId)
        }
    }

    /**
     * Handle Macros
     * @private
     * @param {object} event
     * @param {string} actionType
     * @param {string} actorId
     * @param {string} tokenId
     * @param {string} actionId
     */
    async _handleMacros (event, actionType, actorId, tokenId, actionId) {
        const actor = CoreUtils.getActor(actorId, tokenId)
        let charType
        if (actor) charType = actor.type

        const sharedActions = [
            'ability',
            'spell',
            'item',
            'skill',
            'lore',
            'utility',
            'toggle',
            'strike'
        ]
        if (!sharedActions.includes(actionType)) {
            switch (charType) {
            case 'npc':
                await this._handleUniqueActionsNpc(
                    actionType,
                    event,
                    tokenId,
                    actor,
                    actionId
                )
                break
            case 'character':
            case 'familiar':
                await this._handleUniqueActionsChar(
                    actionType,
                    event,
                    tokenId,
                    actor,
                    actionId
                )
                break
            }
        }

        switch (actionType) {
        case 'ability':
            this._rollAbility(event, actor, actionId)
            break
        case 'skill':
            await this._rollSkill(event, actor, actionId)
            break
        case 'action':
        case 'feat':
        case 'item':
            this._rollItem(actor, actionId)
            break
        case 'spell':
            await this._rollSpell(tokenId, actor, actionId)
            break
        case 'utility':
            this._performUtilityMacro(tokenId, actionId)
            break
        case 'toggle':
            await this._performToggleMacro(event, actorId, tokenId, actionId)
            break
        case 'strike':
            this._rollStrikeChar(event, tokenId, actor, actionId)
            break
        }
    }

    /**
     * Handle Unique Character Actions
     * @private
     * @param {string} actionType The action type
     * @param {object} event The event
     * @param {string} tokenId The token ID
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     */
    async _handleUniqueActionsChar (actionType, event, tokenId, actor, actionId) {
        switch (actionType) {
        case 'save':
            this._rollSave(event, actor, actionId)
            break
        case 'attribute':
            this._rollAttributeChar(event, actor, actionId)
            break
        case 'spellSlot':
            await this._adjustSpellSlot(event, actor, actionId)
            break
        case 'heroPoint':
            await this._adjustResources(
                event,
                actor,
                'heroPoints',
                'value',
                actionId
            )
            break
        case 'doomed':
        case 'wounded':
        case 'dying':
            await this._adjustCondition(event, actor, actionType)
            break
        case 'recoveryCheck':
            actor.rollRecovery({ event })
            break
        case 'familiarAttack':
            this._rollFamiliarAttack(event, actor)
            break
        case 'auxAction':
            this._performAuxAction(event, tokenId, actor, actionId)
            break
        }
    }

    /**
     * Handle Unique NPC Actions
     * @param {string} actionType The action type
     * @param {object} event The event
     * @param {string} tokenId The token ID
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     */
    async _handleUniqueActionsNpc (actionType, event, tokenId, actor, actionId) {
        switch (actionType) {
        case 'save':
            this._rollSave(event, actor, actionId)
            break
        case 'npcStrike':
            this._rollStrikeNpc(event, tokenId, actor, actionId)
            break
        case 'attribute':
            await this._rollAttributeNpc(event, tokenId, actor, actionId)
            break
        }
    }

    /**
     * Roll Skill
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action ID
     */
    async _rollSkill (event, actor, actionId) {
        const skill = actor.skills[actionId]
        await skill.check.roll({ event })
    }

    /**
     * Roll Ability
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     */
    _rollAbility (event, actor, actionId) {
        actor.rollAbility(event, actionId)
    }

    /**
     * Roll Character Attribute
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     */
    _rollAttributeChar (event, actor, actionId) {
        const attribute = actor.system.attributes[actionId]
        if (!attribute) {
            actor.rollAttribute(event, actionId)
        } else {
            const options = actor.getRollOptions(['all', attribute])
            attribute.roll({ event, options })
        }
    }

    /**
     * Roll NPC Attribute
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     */
    async _rollAttributeNpc (event, actor, actionId) {
        if (actionId === 'initiative') { await actor.rollInitiative({ createCombatants: true }) } else actor.rollAttribute(event, actionId)
    }

    /**
     * Adjust Spell Slot
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     */
    async _adjustSpellSlot (event, actor, actionId) {
        const actionParts = decodeURIComponent(actionId).split('>')

        const spellbookId = actionParts[0]
        const slot = actionParts[1]
        const effect = actionParts[2]

        const spellbook = actor.items.get(spellbookId)

        let value, max
        if (slot === 'focus') {
            value = actor.system.resources.focus.value
            max = actor.system.resources.focus.max
        } else {
            const slots = spellbook.system.slots
            value = slots[slot].value
            max = slots[slot].max
        }

        switch (effect) {
        case 'slotIncrease':
            if (value >= max) break

            value++
            break
        case 'slotDecrease':
            if (value <= 0) break

            value--
        }

        let update
        if (slot === 'focus') {
            actor.update({ 'data.resources.focus.value': value })
        } else {
            update = [
                { _id: spellbook.id, data: { slots: { [slot]: { value } } } }
            ]
            await Item.updateDocuments(update, { parent: actor })
        }

        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    /**
     * Roll Save
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     */
    _rollSave (event, actor, actionId) {
        actor.saves[actionId].check.roll({ event })
    }

    /**
     * Update Roll Mode
     * @private
     * @param {string} rollMode The roll mode
     */
    async _updateRollMode (rollMode) {
        await game.settings.set('core', 'rollMode', rollMode)
    }

    /**
     * Roll Character Strike
     * @private
     * @param {object} event The event
     * @param {string} tokenId The token ID
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     * @returns 
     */
    _rollStrikeChar (event, tokenId, actor, actionId) {
        const actionParts = decodeURIComponent(actionId).split('>')

        const strikeId = actionParts[0]
        const strikeType = actionParts[1]
        const altUsage = actionParts[2] ? actionParts[2] : null

        let strike = actor.system.actions
            .filter((a) => a.type === 'strike')
            .find((s) => (s.item.id ?? s.slug) === strikeId)

        if (this.isRenderItem()) {
            const item = strike.item
            if (item) return this.doRenderItem(tokenId, item.id)
        }

        if (altUsage !== null && strike.altUsages.length) {
            if (altUsage === 'melee' && !strike.item.isMelee) {
                strike = strike.altUsages.find(strike => strike.item.isMelee)
            }
            if (altUsage === 'thrown') {
                strike = strike.altUsages.find(strike => strike.item.isThrown)
            }
        }

        switch (strikeType) {
        case 'damage':
            strike.damage({ event })
            break
        case 'critical':
            strike.critical({ event })
            break
        default:
            strike.variants[strikeType]?.roll({ event })
            break
        }
    }

    /**
     * Perform Auxiliary Action
     * @private
     * @param {object} event The event
     * @param {string} tokenId The token ID
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     * @returns 
     */
    _performAuxAction (event, tokenId, actor, actionId) {
        const actionParts = decodeURIComponent(actionId).split('>')

        const strikeId = actionParts[0]
        const strikeType = actionParts[1]
        const strikeUsage = actionParts[2]

        let strike = actor.system.actions
            .filter(action => action.type === 'strike')
            .find(strike => (strike.item.id ?? strike.slug) === strikeId)

        if (this.isRenderItem()) {
            const item = strike.origin
            if (item) return this.doRenderItem(tokenId, item.id)
        }

        if (strikeUsage !== '') {
            strike = strike[strikeUsage]
        }

        strike.auxiliaryActions[strikeType]?.execute()
    }

    /**
     * Roll NPC Strike
     * @private
     * @param {object} event The event
     * @param {string} tokenId The token ID
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     * @returns 
     */
    _rollStrikeNpc (event, tokenId, actor, actionId) {
        const actionParts = decodeURIComponent(actionId).split('>')

        const strikeId = actionParts[0]
        const strikeType = actionParts[1]

        if (strikeId === 'plus') {
            const item = actor.items.find(
                (i) =>
                    strikeType
                        .toUpperCase()
                        .localeCompare(i.name.toUpperCase(), undefined, {
                            sensitivity: 'base'
                        }) === 0
            )

            if (this.isRenderItem()) return this.doRenderItem(tokenId, item.id)

            item.toChat()
            return
        }

        if (this.isRenderItem()) return this.doRenderItem(tokenId, strikeId)

        const strike = actor.items.get(strikeId)

        switch (strikeType) {
        case 'damage':
            strike.rollNPCDamage(event)
            break
        case 'critical':
            strike.rollNPCDamage(event, true)
            break
        case '0':
            strike.rollNPCAttack(event)
            break
        case '1':
            strike.rollNPCAttack(event, 2)
            break
        case '2':
            strike.rollNPCAttack(event, 3)
            break
        }
    }

    /**
     * Roll Item
     * @private
     * @param {object} actor    The actor
     * @param {string} actionId The actionID
     */
    _rollItem (actor, actionId) {
        const item = actor.items.get(actionId)

        item.toChat()
    }

    /**
     * Roll Familiar Attack
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     */
    _rollFamiliarAttack (event, actor) {
        const options = actor.getRollOptions(['all', 'attack'])
        actor.system.attack.roll(event, options)
    }

    /**
     * Roll Spell
     * @private
     * @param {object} event    The event
     * @param {string} tokenId  The token ID
     * @param {object} actor    The actor
     * @param {string} actionId The action ID
     * @returns 
     */
    async _rollSpell (tokenId, actor, actionId) {
        const actionParts = decodeURIComponent(actionId).split('>')
        const [spellbookId, level, spellId, expend] = actionParts

        if (this.isRenderItem()) return this.doRenderItem(tokenId, spellId)

        const spellcasting = actor.items.get(spellbookId)
        const spell = actor.items.get(spellId)
        if (!spellcasting || !spell) return

        await spellcasting.cast(spell, {
            message: !expend,
            consume: true,
            level: Number(level)
        })
        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    /**
     * Perform Utility Macro
     * @private
     * @param {string} tokenId The token ID
     * @param {object} actor The actor
     * @param {string} actionId The action ID
     */
    async _performUtilityMacro (tokenId, actionId) {
        const token = CoreUtils.getToken(tokenId)

        switch (actionId) {
        case 'treatWounds':
            this._executeMacroById('6duZj0Ygiqv712rq')
            break
        case 'rest':
            this._executeMacroById('0GU2sdy3r2MeC56x')
            break
        case 'takeBreather':
            this._executeMacroById('aS6F7PSUlS9JM5jr')
            break
        case 'toggleCombat':
            token.toggleCombat()
            Hooks.callAll('forceUpdateTokenActionHUD')
            break
        case 'toggleVisibility':
            token.toggleVisibility()
            break
        case 'endTurn':
            if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn()
            break
        }
    }

    /**
     * Execute Macro by ID
     * @private
     * @param {string} id The macro ID
     */
    async _executeMacroById (id) {
        const pack = game.packs.get('pf2e.pf2e-macros')
        pack.getDocument(id).then((e) => e.execute())
    }

    /**
     * Adjust Resources
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     * @param {string} property The property
     * @param {string} valueName The value name
     * @param {string} actionId The action ID
     */
    async _adjustResources (event, actor, property, valueName, actionId) {
        let value = actor.system.resources[property][valueName]
        const max = actor.system.resources[property].max

        if (this.rightClick) {
            if (value <= 0) return
            value--
        } else {
            if (value >= max) return
            value++
        }

        const update = [
            {
                _id: actor.id,
                data: { resources: { [property]: { [valueName]: value } } }
            }
        ]

        await Actor.updateDocuments(update)
        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    /**
     * Adjust Condition
     * @private
     * @param {object} event The event
     * @param {object} actor The actor
     * @param {string} property The property
     */
    async _adjustCondition (event, actor, property) {
        const max = actor.system.attributes[property].max

        if (this.rightClick) {
            await actor.decreaseCondition(property)
        } else {
            await actor.increaseCondition(property, { max })
        }

        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    /**
     * Perform Toggle Macro
     * @private
     * @param {object} event The event
     * @param {string} actorId The actorID
     * @param {string} tokenId The token ID
     * @param {string} actionId The action ID
     */
    async _performToggleMacro (event, actorId, tokenId, actionId) {
        const actor = CoreUtils.getActor(actorId, tokenId)
        const toggle = JSON.parse(actionId)
        if (!(toggle.domain && toggle.option)) return

        await actor.toggleRollOption(toggle.domain, toggle.option, toggle.itemId)
    }
}
