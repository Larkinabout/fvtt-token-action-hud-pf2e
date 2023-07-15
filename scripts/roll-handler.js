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

            this.#setRollOptions()

            const renderable = ['item', 'feat', 'action', 'lore', 'ammo']
            if (renderable.includes(actionType) && this.isRenderItem()) {
                return this.doRenderItem(this.actor, actionId)
            }
            const knownCharacters = ['character', 'familiar', 'hazard', 'npc']
            if (!this.actor) {
                const controlledTokens = canvas.tokens.controlled.filter((token) =>
                    knownCharacters.includes(token.actor?.type)
                )
                for (const token of controlledTokens) {
                    const actor = token.actor
                    await this.#handleActions(event, actionType, actor, token, actionId)
                }
            } else {
                await this.#handleActions(event, actionType, this.actor, this.token, actionId)
            }
        }

        #setRollOptions () {
            const showRollDialog = game.user.getFlag('pf2e', 'showRollDialogs')
            this.rollMode = (this.ctrl) ? 'gmroll' : null
            this.skipDialog = (showRollDialog) ? this.shift : !this.shift
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
        async #handleActions (event, actionType, actor, token, actionId) {
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
                    await this.#handleUniqueActionsNpc(
                        event,
                        actionType,
                        actor,
                        token,
                        actionId
                    )
                    break
                case 'character':
                case 'familiar':
                case 'hazard':
                    await this.#handleUniqueActionsChar(
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
                this.#rollAbility(event, actor, actionId)
                break
            case 'action':
            case 'feat':
            case 'item':
                this.#rollItem(event, actor, actionId)
                break
            case 'condition':
                this.#toggleCondition(actor, actionId)
                break
            case 'effect':
                this.#adjustEffect(actor, actionId)
                break
            case 'heroAction':
                this.#useHeroAction(actor, actionId)
                break
            case 'spell':
                await this.#rollSpell(actor, actionId)
                break
            case 'skill':
                await this.#rollSkill(event, actor, actionId)
                break
            case 'strike':
                this.#rollStrikeChar(event, actor, actionId)
                break
            case 'toggle':
                await this.#performToggleAction(actor, actionId)
                break
            case 'utility':
                this.#performUtilityAction(token, actionId)
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
        async #handleUniqueActionsChar (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'save':
                this.#rollSave(actor, actionId)
                break
            case 'initiative':
                this.#rollInitiative(event, actor, actionId)
                break
            case 'attribute':
            case 'perceptionCheck':
            {
                const args = { rollMode: this.rollMode, skipDialog: this.skipDialog }
                this.actor.perception.roll(args)
                break
            }
            case 'spellSlot':
                await this.#adjustSpellSlot(actor, actionId)
                break
            case 'heroPoints':
                await this.#adjustResources('heroPoints', 'value', actor)
                break
            case 'recoveryCheck':
                actor.rollRecovery({ event })
                break
            case 'familiarAttack':
                this.#rollFamiliarAttack(event, actor)
                break
            case 'auxAction':
                this.#performAuxAction(actor, actionId)
                break
            case 'versatileOption':
                this.#performVersatileOption(actor, actionId)
                break
            }
        }

        /**
         * Handle Unique NPC Actions
         * @param {object} event      The event
         * @param {string} actionType The action type
         * @param {string} actionId   The action id
         */
        async #handleUniqueActionsNpc (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'initiative':
                this.#rollInitiative(event, actor, actionId)
                break
            case 'attribute':
            case 'perceptionCheck':
                await this.#rollAttributeNpc(event, actor, actionId)
                break
            case 'save':
                this.#rollSave(actor, actionId)
                break
            case 'strike':
                this.#rollStrikeNpc(event, actor, actionId)
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
        async #rollSkill (event, actor, actionId) {
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
        #rollAbility (event, actor, actionId) {
            actor.rollAbility(event, actionId)
        }

        /**
         * Roll Initiative
         * @param {object} event The event
         * @param {object} actor The actor
         * @param {string} actionId The action id
         */
        async #rollInitiative (event, actor, actionId) {
            await actor.update({ 'system.attributes.initiative.statistic': actionId })
            const args = { rollMode: this.rollMode, skipDialog: this.skipDialog }
            actor.initiative.roll(args)
        }

        /**
         * Roll NPC Attribute
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #rollAttributeNpc (event, actor, actionId) {
            actor.rollAttribute(event, actionId)
        }

        /**
         * Adjust spell slot
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #adjustSpellSlot (actor, actionId) {
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

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Roll Save
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollSave (actor, actionId) {
            const args = { rollMode: this.rollMode, skipDialog: this.skipDialog }
            actor.saves[actionId].check.roll(args)
        }

        /**
         * Roll Character Strike
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @returns
         */
        #rollStrikeChar (event, actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const itemId = actionParts[0]
            const slug = actionParts[1]
            const strikeType = actionParts[2]
            const usage = actionParts[3] ? actionParts[3] : null
            let altUsage = null

            let strike = actor.system.actions
                .filter(action => action.type === 'strike')
                .find(strike => strike.item.id === itemId && strike.slug === slug)

            if (this.isRenderItem()) {
                const item = strike.item
                if (item && item.id !== 'xxPF2ExUNARMEDxx') return this.doRenderItem(actor, item.id)
            }

            if (strike.altUsages?.length) {
                switch (true) {
                case usage === 'melee' && !strike.item.isMelee:
                    altUsage = usage
                    strike = strike.altUsages.find(strike => strike.item.isMelee)
                    break
                case usage === 'ranged' && !strike.item.isRanged:
                    altUsage = usage
                    strike = strike.altUsages.find(strike => strike.item.isRanged)
                    break
                case usage === 'thrown' && !strike.item.isThrown:
                    altUsage = usage
                    strike = strike.altUsages.find(strike => strike.item.isThrown)
                    break
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
                strike.variants[strikeType]?.roll({ event, altUsage })
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
        #performAuxAction (actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const itemId = actionParts[0]
            const slug = actionParts[1]
            const strikeType = actionParts[2]
            const selection = actionParts[3] ? actionParts[3] : null

            const strike = actor.system.actions
                .filter(action => action.type === 'strike')
                .find(strike => strike.item.id === itemId && strike.slug === slug)

            if (this.isRenderItem()) {
                const item = strike.origin
                if (item) return this.doRenderItem(actor, item.id)
            }

            strike.auxiliaryActions[strikeType]?.execute({ selection })
        }

        /**
         * Perform Versatile Option
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @returns
         */
        async #performVersatileOption (actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const itemId = actionParts[0]
            const selection = actionParts[2]
            const trait = 'versatile'
            const weapon = coreModule.api.Utils.getItem(actor, itemId)

            await toggleWeaponTrait({ weapon, trait, selection })

            // Copied from pf2e.js
            async function toggleWeaponTrait ({ weapon, trait, selection }) {
                const current = weapon.system.traits.toggles[trait].selection
                if (current === selection) return false

                const item = weapon.actor?.items.get(weapon.id)
                if (item?.isOfType('weapon') && item === weapon) {
                    await item.update({ [`system.traits.toggles.${trait}.selection`]: selection })
                } else if (item?.isOfType('weapon') && weapon.altUsageType === 'melee') {
                    item.update({ [`system.meleeUsage.traitToggles.${trait}`]: selection })
                } else {
                    const rule = item?.rules.find(r => r.key === 'Strike' && !r.ignored && r.slug === weapon.slug)
                    await rule?.toggleTrait({ trait, selection })
                }

                return true
            }
        }

        /**
         * Roll NPC Strike
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @returns
         */
        #rollStrikeNpc (event, actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const itemId = actionParts[0]
            const slug = actionParts[1]
            const strikeType = actionParts[2]

            const strike = actor.system.actions
                .filter(action => action.type === 'strike')
                .find(strike => strike.item.id === itemId && strike.slug === slug)

            if (itemId === 'plus') {
                const item = actor.items.find(
                    (item) =>
                        strikeType
                            .toUpperCase()
                            .localeCompare(item.name.toUpperCase(), undefined, {
                                sensitivity: 'base'
                            }) === 0
                )

                if (this.isRenderItem()) return this.doRenderItem(actor, item.id)

                item.toChat(event)
                return
            }

            if (this.isRenderItem()) return this.doRenderItem(actor, itemId)

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
         * Roll item
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollItem (event, actor, actionId) {
            const item = actor.items.get(actionId)

            item.toChat(event)
        }

        /**
         * Roll familiar attack
         * @private
         * @param {object} event The event
         * @param {object} actor The actor
         */
        #rollFamiliarAttack (event, actor) {
            const options = actor.getRollOptions(['all', 'attack'])
            actor.system.attack.roll({ event, options })
        }

        /**
         * Roll spell
         * @private
         * @param {object} actor The actor
         * @param {string} actionId The action id
         * @returns
         */
        async #rollSpell (actor, actionId) {
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

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Perform utility action
         * @private
         * @param {object} token    The token
         * @param {string} actionId The action id
         */
        async #performUtilityAction (token, actionId) {
            switch (actionId) {
            case 'treatWounds':
                this.#executeMacroById('6duZj0Ygiqv712rq')
                break
            case 'rest':
                this.#executeMacroById('0GU2sdy3r2MeC56x')
                break
            case 'takeBreather':
                this.#executeMacroById('aS6F7PSUlS9JM5jr')
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
        async #executeMacroById (id) {
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
        async #adjustResources (property, valueName, actor) {
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
            Hooks.callAll('forceUpdateTokenActionHud')
        }

        async #toggleCondition (actor, actionId) {
            if (this.rightClick) actor.decreaseCondition(actionId)
            else actor.increaseCondition(actionId)

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Adjust effect
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #adjustEffect (actor, actionId) {
            const item = coreModule.api.Utils.getItem(actor, actionId)

            if (this.rightClick) item.decrease()
            else item.increase()

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Use hero action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #useHeroAction (actor, actionId) {
            if (actionId === 'drawHeroActions') {
                await game.modules.get('pf2e-hero-actions')?.api?.drawHeroActions(actor)
            } else {
                await game.modules.get('pf2e-hero-actions')?.api?.useHeroAction(actor, actionId)
            }

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Perform Toggle Macro
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #performToggleAction (actor, actionId) {
            const toggle = JSON.parse(actionId)
            if (!(toggle.domain && toggle.option)) return

            await actor.toggleRollOption(toggle.domain, toggle.option, toggle.itemId)
        }
    }
})
