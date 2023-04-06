export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        BLIND_ROLL_MODE = 'blindRoll'

        /**
     * Handle Action Event
     * @override
     * @param {object} event
     * @param {string} encodedValue
     */
        async doHandleActionEvent (event, encodedValue) {
            const payload = encodedValue.split('|')

            if (payload.length !== 2) {
                super.throwInvalidValueErr()
            }

            const actionType = payload[0]
            const actionId = payload[1]

            const renderable = ['item', 'feat', 'action', 'lore', 'ammo']
            if (renderable.includes(actionType) && this.isRenderItem()) {
                return this.doRenderItem(this.actor, actionId)
            }
            const knownCharacters = ['character', 'familiar', 'npc']
            if (!this.actor) {
                const controlledTokens = canvas.tokens.controlled.filter((token) =>
                    knownCharacters.includes(token.actor?.type)
                )
                for (const token of controlledTokens) {
                    const actor = token.actor
                    await this._handleMacros(event, actionType, actor, token, actionId)
                }
            } else {
                await this._handleMacros(event, actionType, this.actor, this.token, actionId)
            }
        }

        /**
     * Handle Macros
     * @private
     * @param {object} event
     * @param {string} actionType
     * @param {object} actor
     * @param {object} token
     * @param {string} actionId
     */
        async _handleMacros (event, actionType, actor, token, actionId) {
            let actorType
            if (actor) actorType = actor.type

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
                switch (actorType) {
                case 'npc':
                    await this._handleUniqueActionsNpc(
                        event,
                        actionType,
                        actor,
                        token,
                        actionId
                    )
                    break
                case 'character':
                case 'familiar':
                    await this._handleUniqueActionsChar(
                        event,
                        actionType,
                        actor,
                        token,
                        actionId
                    )
                    break
                }
            }

            switch (actionType) {
            case 'ability':
                this._rollAbility(event, actor, actionId)
                break
            case 'action':
            case 'feat':
            case 'item':
                this._rollItem(actor, actionId)
                break
            case 'condition':
                this._toggleCondition(actor, actionId)
                break
            case 'effect':
                this._adjustEffect(actor, actionId)
                break
            case 'spell':
                await this._rollSpell(actor, actionId)
                break
            case 'skill':
                await this._rollSkill(event, actor, actionId)
                break
            case 'strike':
                this._rollStrikeChar(event, actor, actionId)
                break
            case 'toggle':
                await this._performToggleMacro(actor, actionId)
                break
            case 'utility':
                this._performUtilityMacro(token, actionId)
                break
            }
        }

        /**
     * Handle Unique Character Actions
     * @private
     * @param {object} event      The event
     * @param {string} actionType The action type
     * @param {object} actor      The actor
     * @param {object} token      The token
     * @param {string} actionId   The action id
     */
        async _handleUniqueActionsChar (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'save':
                this._rollSave(event, actor, actionId)
                break
            case 'initiative':
                actor.initiative.roll()
                break
            case 'attribute':
            case 'perceptionCheck':
                this._rollAttributeChar(event, actor, actionId)
                break
            case 'spellSlot':
                await this._adjustSpellSlot(actor, actionId)
                break
            case 'heroPoints':
                await this._adjustResources('heroPoints', 'value', actor)
                break
            case 'recoveryCheck':
                actor.rollRecovery({ event })
                break
            case 'familiarAttack':
                this._rollFamiliarAttack(event, actor)
                break
            case 'auxAction':
                this._performAuxAction(actor, actionId)
                break
            }
        }

        /**
     * Handle Unique NPC Actions
     * @param {object} event      The event
     * @param {string} actionType The action type
     * @param {string} actionId   The action id
     */
        async _handleUniqueActionsNpc (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'initiative':
                actor.initiative.roll()
                break
            case 'attribute':
            case 'perceptionCheck':
                await this._rollAttributeNpc(event, actor, actionId)
                break
            case 'save':
                this._rollSave(event, actor, actionId)
                break
            case 'strike':
                this._rollStrikeNpc(event, actor, actionId)
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
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
        _rollAbility (event, actor, actionId) {
            actor.rollAbility(event, actionId)
        }

        /**
     * Roll Character Attribute
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
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
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
        async _rollAttributeNpc (event, actor, actionId) {
            actor.rollAttribute(event, actionId)
        }

        /**
     * Adjust spell slot
     * @private
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
        async _adjustSpellSlot (actor, actionId) {
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
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
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
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     * @returns
     */
        _rollStrikeChar (event, actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const strikeId = actionParts[0]
            const strikeType = actionParts[1]
            const altUsage = actionParts[2] ? actionParts[2] : null

            let strike = actor.system.actions
                .filter(action => action.type === 'strike')
                .find(strike => (strike.item.id ?? strike.slug) === strikeId)

            if (this.isRenderItem()) {
                const item = strike.item
                if (item && item.id !== 'xxPF2ExUNARMEDxx') return this.doRenderItem(actor, item.id)
            }

            if (altUsage !== null && strike.altUsages?.length) {
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
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     * @returns
     */
        _performAuxAction (actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const strikeId = actionParts[0]
            const strikeType = actionParts[1]
            const strikeUsage = actionParts[2]

            let strike = actor.system.actions
                .filter(action => action.type === 'strike')
                .find(strike => (strike.item.id ?? strike.slug) === strikeId)

            if (this.isRenderItem()) {
                const item = strike.origin
                if (item) return this.doRenderItem(actor, item.id)
            }

            if (strikeUsage !== '') {
                strike = strike[strikeUsage]
            }

            strike.auxiliaryActions[strikeType]?.execute()
        }

        /**
     * Roll NPC Strike
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     * @returns
     */
        _rollStrikeNpc (event, actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const strikeId = actionParts[0]
            const strikeType = actionParts[1]

            if (strikeId === 'plus') {
                const item = actor.items.find(
                    (item) =>
                        strikeType
                            .toUpperCase()
                            .localeCompare(item.name.toUpperCase(), undefined, {
                                sensitivity: 'base'
                            }) === 0
                )

                if (this.isRenderItem()) return this.doRenderItem(actor, item.id)

                item.toChat()
                return
            }

            if (this.isRenderItem()) return this.doRenderItem(actor, strikeId)

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
     * @param {string} actionId The action id
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
     * @param {object} actor The actor
     * @param {string} actionId The action id
     * @returns
     */
        async _rollSpell (actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')
            const [spellbookId, level, spellId, expend] = actionParts

            if (this.isRenderItem()) return this.doRenderItem(actor, spellId)

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
     * @param {object} token    The token
     * @param {string} actionId The action id
     */
        async _performUtilityMacro (token, actionId) {
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
            case 'endTurn':
                if (game.combat?.current?.tokenId === token.id) await game.combat?.nextTurn()
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
     * @param {string} property  The property
     * @param {string} valueName The value name
     * @param {object} actor     The actor
     */
        async _adjustResources (property, valueName, actor) {
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

        async _toggleCondition (actor, actionId) {
            if (this.rightClick) actor.decreaseCondition(actionId)
            else actor.increaseCondition(actionId)

            Hooks.callAll('forceUpdateTokenActionHUD')
        }

        /**
     * Adjust effect
     * @private
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
        async _adjustEffect (actor, actionId) {
            const item = coreModule.api.Utils.getItem(actor, actionId)

            if (this.rightClick) item.decrease()
            else item.increase()

            Hooks.callAll('forceUpdateTokenActionHUD')
        }

        /**
     * Perform Toggle Macro
     * @private
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
        async _performToggleMacro (actor, actionId) {
            const toggle = JSON.parse(actionId)
            if (!(toggle.domain && toggle.option)) return

            await actor.toggleRollOption(toggle.domain, toggle.option, toggle.itemId)
        }
    }
})
