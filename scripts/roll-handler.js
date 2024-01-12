export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        BLIND_ROLL_MODE = 'blindRoll'

        /**
         * Handle action click
         * @override
         * @param {object} event
         * @param {string} encodedValue
         */
        async handleActionClick (event, encodedValue) {
            const payload = encodedValue.split('|')

            if (payload.length !== 2) {
                super.throwInvalidValueErr()
            }

            const [actionType, actionId] = payload

            this.#setRollOptions()

            if (this.#isRenderableItem(actionType)) {
                return this.doRenderItem(this.actor, actionId)
            }

            if (!this.actor) {
                const controlledTokens = this.#getControlledTokens()
                for (const token of controlledTokens) {
                    const actor = token.actor
                    await this.#handleActions(event, actionType, actor, token, actionId)
                }
            } else {
                await this.#handleActions(event, actionType, this.actor, this.token, actionId)
            }
        }

        /**
         * Handle action hover
         * @override
         * @param {object} event
         * @param {string} encodedValue
         */
        async handleActionHover (event, encodedValue) {
            const types = ['elementalBlast', 'action', 'feat', 'item', 'spell', 'familiarAttack', 'strike']
            const [actionType, actionData] = decodeURIComponent(encodedValue).split('|')

            if (!types.includes(actionType)) return

            if (!this.actor) return

            let item
            switch (actionType) {
            case 'elementalBlast':
                const [blastId, blastElement, blastValue, blastType] = actionData.split('>')
                const blast = coreModule.api.Utils.getItem(this.actor, blastId)
                const blastItem = blast.rules.find(r => r.value.element == blastElement)
                item = blastItem
                break
            case 'spell':
                const [spellcastingEntry, rank, spellId] = actionData.split('>')
                const spellItem = coreModule.api.Utils.getItem(this.actor, spellId)
                item = spellItem
                break
            case 'strike':
                const [strikeId, strikeName, strikeValue, strikeType] = actionData.split('>')
                if (strikeId === 'xxPF2ExUNARMEDxx') {
                    const strikeItem = this.actor.system.actions.find(a => a.item.id === 'xxPF2ExUNARMEDxx').item
                    return strikeItem
                }
                const strikeItem = coreModule.api.Utils.getItem(this.actor, strikeId)
                item = strikeItem
                break
            case 'familiarAttack':
                const attackItem = this.actor.system.attack
                item = attackItem
                break
            default:
                const actionId = actionData.split('>', 1)[0]
                const actionItem = coreModule.api.Utils.getItem(this.actor, actionId)
                item = actionItem
                break
            }

            if (!item) return

            if (event.type === 'mouseenter') {
                Hooks.call('tokenActionHudSystemActionHoverOn', event, item)
            } else {
                Hooks.call('tokenActionHudSystemActionHoverOff', event, item)
            }
        }

        /**
         * Set roll options
         */
        #setRollOptions () {
            const skipDefault = !game.user.settings.showCheckDialogs
            this.rollMode = (this.ctrl) ? (game.user.isGM) ? 'gmroll' : 'blindroll' : null
            this.skipDialog = (this.shift) ? !skipDefault : skipDefault
        }

        /**
         * Is renderable item
         * @param {string} actionType The action typr
         * @returns {boolean} Whether the action is a renderable item
         */
        #isRenderableItem (actionType) {
            const renderable = ['item', 'feat', 'action', 'lore', 'ammo']
            return renderable.includes(actionType) && this.isRenderItem()
        }

        /**
         * Get controlled tokens
         * @returns {array} The controlled tokens
         */
        #getControlledTokens () {
            const actorTypes = ['character', 'familiar', 'hazard', 'npc']
            return canvas.tokens.controlled.filter((token) =>
                actorTypes.includes(token.actor?.type)
            )
        }

        /**
         * Handle actions
         * @private
         * @param {object} event
         * @param {string} actionType
         * @param {object} actor
         * @param {object} token
         * @param {string} actionId
         */
        async #handleActions (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'ability':
                this.#rollAbility(event, actor, actionId)
                break
            case 'auxAction':
                this.#performAuxAction(actor, actionId)
                break
            case 'elementalDamageType':
                this.#setDamageType(event, actor, actionId)
                break
            case 'elementalBlast':
                await this.#rollElementalBlast(event, actor, actionId)
                break
            case 'action':
            case 'feat':
            case 'item':
                this.#rollItem(actionId)
                break
            case 'condition':
                this.#toggleCondition(actor, actionId)
                break
            case 'effect':
                this.#adjustEffect(actor, actionId)
                break
            case 'familiarAttack':
                this.#rollFamiliarAttack(event, actor)
                break
            case 'heroAction':
                this.#useHeroAction(actor, actionId)
                break
            case 'heroPoints':
                await this.#adjustResources('heroPoints', 'value', actor)
                break
            case 'initiative':
                this.#rollInitiative(event, actor, actionId)
                break
            case 'perceptionCheck':
            {
                const args = { rollMode: this.rollMode, skipDialog: this.skipDialog }
                actor.perception.roll(args)
                break
            }
            case 'recoveryCheck':
                actor.rollRecovery({ event })
                break
            case 'save':
                this.#rollSave(actor, actionId)
                break
            case 'spell':
                await this.#rollSpell(actor, actionId)
                break
            case 'spellSlot':
                await this.#adjustSpellSlot(actor, actionId)
                break
            case 'skill':
                await this.#rollSkill(event, actor, actionId)
                break
            case 'strike':
                this.#rollStrike(event, actor, actionId)
                break
            case 'toggle':
                await this.#performToggleAction(actor, actionId)
                break
            case 'utility':
                this.#performUtilityAction(token, actionId)
                break
            case 'versatileOption':
                this.#performVersatileOption(actor, actionId)
                break
            }
        }

        /**
         * Roll skill
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
         * Roll ability
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollAbility (event, actor, actionId) {
            actor.rollAbility(event, actionId)
        }

        /**
         * Set damage type
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #setDamageType (event, actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const element = actionParts[1]
            const damageType = actionParts[2]

            const blasts = new game.pf2e.ElementalBlast(actor)

            blasts.setDamageType({
                element,
                damageType
            })
        }

        /**
         * Roll elemental blast
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @returns
         */
        async #rollElementalBlast (event, actor, actionId) {
            const actionParts = decodeURIComponent(actionId).split('>')

            const itemId = actionParts[0]
            const element = actionParts[1]
            const type = actionParts[2]
            const usage = actionParts[3] ? actionParts[3] : null
            const melee = (usage === 'melee')

            const blasts = new game.pf2e.ElementalBlast(actor)
            const blast = blasts.configs.find(blast => blast.item.id === itemId && blast.element === element)
            const damageType = blast.damageTypes.find(damageType => damageType.selected)?.value ?? element

            switch (type) {
            case 'damage':
            case 'critical':
                {
                    const outcome = type === 'damage' ? 'success' : 'criticalSuccess'
                    await blasts.damage({
                        element,
                        damageType,
                        melee,
                        outcome,
                        event
                    })
                }
                break
            default:
                await blasts.attack({
                    mapIncreases: type,
                    element,
                    damageType,
                    melee,
                    event
                })
                break
            }
        }

        /**
         * Roll initiative
         * @param {object} event The event
         * @param {object} actor The actor
         * @param {string} actionId The action id
         */
        async #rollInitiative (event, actor, actionId) {
            const initiative = actor.combatant?.initiative

            if (initiative && actor.inCombat) {
                ui.notifications.info("You have already rolled initiative.")
                return
            }

            await actor.update({ 'system.attributes.initiative.statistic': actionId })
            const args = { rollMode: this.rollMode, skipDialog: this.skipDialog }
            actor.initiative.roll(args)
        }

        /**
         * Roll NPC attribute
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
         * Roll save
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollSave (actor, actionId) {
            const args = { rollMode: this.rollMode, skipDialog: this.skipDialog }
            actor.saves[actionId].check.roll(args)
        }

        /**
         * Roll character strike
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @returns
         */
        #rollStrike (event, actor, actionId) {
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
         * Perform auxiliary action
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
         * Perform versatile option
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         * @returns
         */
        async #performVersatileOption (actor, actionId) {
            const [itemId, slug, selection] = decodeURIComponent(actionId).split('>')

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
         * Roll item
         * @private
         * @param {string} actionId The action id
         */
        #rollItem (actionId) {
            game.pf2e.rollItemMacro(actionId)
        }

        /**
         * Roll familiar attack
         * @private
         * @param {object} event The event
         * @param {object} actor The actor
         */
        #rollFamiliarAttack (event, actor) {
            const args = { rollMode: this.rollMode, skipDialog: this.skipDialog }
            actor.attackStatistic.roll(args)
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
                rank: Number(level)
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
         * Execute macro by ID
         * @private
         * @param {string} id The macro ID
         */
        async #executeMacroById (id) {
            const pack = game.packs.get('pf2e.pf2e-macros')
            pack.getDocument(id).then((e) => e.execute())
        }

        /**
         * Adjust resources
         * @private
         * @param {string} property  The property
         * @param {string} valueName The value name
         * @param {object} actor     The actor
         */
        async #adjustResources (property, valueName, actor) {
            let value = actor.system.resources[property][valueName]
            const max = actor.system.resources[property].max

            if (this.rightClick) {
                if (value > 0) {
                    value--
                }
            } else if (value < max) {
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
            if (this.rightClick) {
                actor.decreaseCondition(actionId)
            } else {
                actor.increaseCondition(actionId)
            }
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

                Hooks.callAll('forceUpdateTokenActionHud')
            } else {
                await game.modules.get('pf2e-hero-actions')?.api?.useHeroAction(actor, actionId)
            }
        }

        /**
         * Perform toggle action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #performToggleAction (actor, actionId) {
            const [domain, option, itemId, suboptionValue] = decodeURIComponent(actionId).split('>')

            if (!domain || !option) return

            const toggle = actor.synthetics.toggles.find(t => t.domain === domain && t.option === option && t.itemId === itemId)

            if (!toggle) return

            const value = !toggle.enabled || !toggle.checked || (suboptionValue && !toggle.suboptions.find(s => s.value === suboptionValue)?.selected)

            await actor.toggleRollOption(domain, option, itemId, value, suboptionValue)
        }
    }
})
