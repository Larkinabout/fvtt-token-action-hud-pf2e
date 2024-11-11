export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        /**
         * Execute macro by ID
         * @private
         * @param {string} id The macro id
         */
        async #executeMacroById (id) {
            game.packs.get('pf2e.pf2e-macros').getDocument(id).then((e) => e.execute())
        }

        /**
         * Is renderable item
         * @private
         * @param {string} actionType The action type
         * @return {boolean}          Whether the action is a renderable item
         */
        #isRenderableItem (actionType) {
            const renderable = [
                'action',
                'ammo',
                'feat',
                'item',
                'lore'
            ]

            return this.isRenderItem() && renderable.includes(actionType)
        }

        /**
         * Get controlled tokens
         * @private
         * @return {array} The controlled tokens
         */
        #getControlledTokens () {
            const actorTypes = [
                'character',
                'familiar',
                'hazard',
                'npc'
            ]

            return canvas.tokens.controlled.filter(token => actorTypes.includes(token.actor?.type))
        }

        /**
         * Set roll options
         * @private
         */
        #setRollOptions () {
            this.rollMode = this.ctrl ? game.user.isGM ? 'gmroll' : 'blindroll' : null
            this.showCheckDialogs = this.shift ? game.user.settings.showCheckDialogs : !game.user.settings.showCheckDialogs
        }

        /**
         * Handle action click
         * @override
         * @param {object} event          The event
         * @param {string} encodedPayload The encoded payload
         */
        async handleActionClick (event, encodedPayload) {
            const payload = decodeURIComponent(encodedPayload).split('|', 2)

            if (payload.length < 2) {
                super.throwInvalidValueErr()
            }

            const [actionType, actionId] = payload

            this.#setRollOptions()

            if (this.#isRenderableItem(actionType)) {
                return this.renderItem(this.actor, actionId)
            }

            if (this.actor) {
                await this.#handleActions(event, actionType, this.actor, this.token, actionId)
            } else {
                for (const token of this.#getControlledTokens()) {
                    await this.#handleActions(event, actionType, token.actor, token, actionId)
                }
            }
        }

        /**
         * Handle action hover
         * @override
         * @param {object} event          The event
         * @param {string} encodedPayload The encoded payload
         */
        async handleActionHover (event, encodedPayload) {
            const payload = decodeURIComponent(encodedPayload).split('|', 2)

            if (payload.length < 2) {
                return
            }

            const [actionType, actionData] = payload

            if (!this.actor) return

            // Currently, only the following action types are handled.
            const actionTypes = [
                'action',
                'elementalBlast',
                'familiarAttack',
                'feat',
                'item',
                'spell',
                'strike'
            ]

            if (!actionTypes.includes(actionType)) return

            let item

            switch (actionType) {
            case 'elementalBlast':
                {
                    // blastId, blastElement, blastValue, blastType
                    const [blastId, blastElement] = actionData.split('>', 2)
                    const blast = coreModule.api.Utils.getItem(this.actor, blastId)
                    item = blast?.rules.find(rule => rule.value?.element === blastElement)
                }
                break
            case 'familiarAttack':
                item = this.actor.system.attack
                break
            case 'spell':
                {
                    // spellcastingEntry, rank, spellId
                    const [, , spellId] = actionData.split('>', 3)
                    item = coreModule.api.Utils.getItem(this.actor, spellId)
                }
                break
            case 'strike':
                {
                    // strikeId, strikeName, strikeValue, strikeType
                    const [strikeId] = actionData.split('>', 1)
                    if (strikeId === 'xxPF2ExUNARMEDxx') {
                        item = this.actor.system.actions.find(action => action.item?.id === 'xxPF2ExUNARMEDxx').item
                    } else {
                        item = coreModule.api.Utils.getItem(this.actor, strikeId)
                    }
                }
                break
            default:
                {
                    const [actionId] = actionData.split('>', 1)
                    item = coreModule.api.Utils.getItem(this.actor, actionId)
                }
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
         * Handle actions
         * @private
         * @param {object} event      The event
         * @param {string} actionType The action type
         * @param {object} actor      The actor
         * @param {object} token      The token
         * @param {string} actionId   The action id
         */
        async #handleActions (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'action':
                this.#rollItemMacro(event, actor, actionId)
                break
            case 'condition':
                this.#adjustCondition(actor, actionId)
                break
            case 'effect':
                this.#adjustEffect(actor, actionId)
                break
            case 'elementalBlast':
                await this.#rollElementalBlast(event, actor, actionId)
                break
            case 'elementalBlastDamageType':
                this.#setElementalBlastDamageType(actor, actionId)
                break
            case 'familiarAttack':
                this.#rollFamiliarAttack(actor)
                break
            case 'feat':
                this.#rollItemMacro(event, actor, actionId)
                break
             case 'heroAction':
                 this.#performHeroAction(actor, actionId)
                 break
            case 'heroPoints':
                await this.#adjustResources(actor, 'heroPoints', 'value')
                break
            case 'mythicPoints':
                await this.#adjustResources(actor, 'mythicPoints', 'value')
                break
            case 'initiative':
                this.#rollInitiative(actor, actionId)
                break
            case 'item':
                this.#rollItemMacro(event, actor, actionId)
                break
            case 'perceptionCheck':
                this.#rollPerception(actor)
                break
            case 'recoveryCheck':
                this.#rollRecovery(event, actor)
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
            case 'strikeAuxiliaryAction':
                this.#performStrikeAuxiliaryAction(actor, actionId)
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
         * Roll item macro
         * @private
         * @param {string} actionId The action id
         */
        #rollItemMacro (event, actor, actionId) {
            const item = actor?.items?.get(actionId)
            if (item) {
                if (!item.system.selfEffect && !item.system.frequency) {
                    item.toMessage(event)
                }
                else {
                    game.pf2e.rollItemMacro(actionId)
                }
            }
        }

        /**
         * Adjust condition
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #adjustCondition (actor, actionId) {
            this.rightClick ? actor.decreaseCondition(actionId) : actor.increaseCondition(actionId)
        }

        /**
         * Adjust effect
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #adjustEffect (actor, actionId) {
            const effect = coreModule.api.Utils.getItem(actor, actionId)

            if (!effect) return

            this.rightClick ? effect.decrease() : effect.increase()

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Roll elemental blast
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #rollElementalBlast (event, actor, actionId) {
            const [itemId, element, type, usage] = decodeURIComponent(actionId).split('>', 4)

            const blasts = new game.pf2e.ElementalBlast(actor)
            const blast = blasts.configs.find(blast => blast.item.id === itemId && blast.element === element)
            const damageType = blast.damageTypes.find(damageType => damageType.selected)?.value ?? element
            const melee = usage === 'melee'
            const outcome = type === 'damage' ? 'success' : 'criticalSuccess'

            switch (type) {
            case 'damage':
            case 'critical':
                await blasts.damage({ element, damageType, melee, outcome, event })
                break
            default:
                await blasts.attack({ mapIncreases: type, element, damageType, melee, event })
                break
            }
        }

        /**
         * Set elemental blast damage type
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #setElementalBlastDamageType (actor, actionId) {
            // itemId, element, damageType
            const [, element, damageType] = decodeURIComponent(actionId).split('>', 3)

            const blasts = new game.pf2e.ElementalBlast(actor)
            blasts.setDamageType({ element, damageType })
        }

        /**
         * Roll familiar attack
         * @private
         * @param {object} actor  The actor
         */
        #rollFamiliarAttack (actor) {
            actor.attackStatistic.roll({ rollMode: this.rollMode, skipDialog: this.skipDialog })
        }

        /**
         * Perform hero action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #performHeroAction (actor, actionId) {
            switch (actionId) {
            case actionId === 'drawHeroActions':
                await game.modules.get('pf2e-hero-actions')?.api?.drawHeroActions(actor)
                break
            case actionId === 'useHeroAction':
                await game.modules.get('pf2e-hero-actions')?.api?.useHeroAction(actor, actionId)
                break
            }

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Adjust resources
         * @private
         * @param {object} actor     The actor
         * @param {string} resource  The resource
         * @param {string} valueName The value name
         */
        async #adjustResources (actor, resource, valueName) {
            let value = actor.system.resources[resource][valueName]

            if (this.rightClick) {
                if (value > 0) {
                    value--
                }
            } else {
                if (value < actor.system.resources[resource].max) {
                    value++
                }
            }

            switch (resource) {
            case "heroPoints":
                await actor.update({ "system.resources.heroPoints.value": value })
                break
            case "mythicPoints":
                await actor.update({ "system.resources.mythicPoints.value": value })
                break
            }

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Roll initiative
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #rollInitiative (actor, actionId) {
            if (actor.inCombat && actor.combatant?.initiative) {
                coreModule.api.Logger.info(game.i18n.format('PF2E.Encounter.AlreadyRolled', { actor: actor.name }), true)
            } else {
                await actor.update({ 'system.initiative.statistic': actionId })

                actor.initiative.roll({ rollMode: this.rollMode, skipDialog: this.skipDialog })
            }
        }

        /**
         * Roll perception
         * @private
         * @param {object} actor The actor
         */
        #rollPerception (actor) {
            actor.perception.roll({ rollMode: this.rollMode, skipDialog: this.skipDialog })
        }

        /**
         * Roll recovery
         * @private
         * @param {object} event The event
         * @param {object} actor The actor
         */
        #rollRecovery (event, actor) {
            actor.rollRecovery({ event })
        }

        /**
         * Roll save
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollSave (actor, actionId) {
            actor.saves[actionId].check.roll({ rollMode: this.rollMode, skipDialog: this.skipDialog })
        }

        /**
         * Roll skill
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #rollSkill (event, actor, actionId) {
            await actor.skills[actionId].check.roll({ event })
        }

        /**
         * Roll spell
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #rollSpell (actor, actionId) {
            const [spellbookId, level, spellId, expend] = decodeURIComponent(actionId).split('>', 4)

            if (this.isRenderItem()) {
                return this.renderItem(actor, spellId)
            }

            const spellbook = actor.items.get(spellbookId)
            const spell = actor.items.get(spellId)

            if (!spellbook || !spell) return

            await spellbook.cast(spell, { message: !expend, consume: true, rank: Number(level) })

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Adjust spell slot
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #adjustSpellSlot (actor, actionId) {
            const [spellbookId, slot, effect] = decodeURIComponent(actionId).split('>', 3)

            const spellbook = actor.items.get(spellbookId)

            if (!spellbook && slot !== 'focus') return

            let value, max

            if (slot === 'focus') {
                value = actor.system.resources.focus.value
                max = actor.system.resources.focus.max
            } else {
                value = spellbook.system.slots[slot].value
                max = spellbook.system.slots[slot].max
            }

            switch (effect) {
            case 'slotIncrease':
                if (value < max) {
                    value++
                }
                break
            case 'slotDecrease':
                if (value > 0) {
                    value--
                }
            }

            if (slot === 'focus') {
                actor.update({ 'system.resources.focus.value': value })
            } else {
                await Item.updateDocuments([{ _id: spellbook.id, data: { slots: { [slot]: { value } } } }], { parent: actor })
            }

            Hooks.callAll('forceUpdateTokenActionHud')
        }

        /**
         * Roll strike
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #rollStrike (event, actor, actionId) {
            const [itemId, slug, strikeType, usage] = decodeURIComponent(actionId).split('>', 4)

            let strike = actor.system.actions
                .filter(action => action.type === 'strike')
                .find(strike => strike.item.id === itemId && strike.slug === slug)

            if (this.isRenderItem() && strike.item?.id !== 'xxPF2ExUNARMEDxx') {
                return this.renderItem(actor, strike.item.id)
            }

            let altUsage

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
         * Perform strike auxiliary action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #performStrikeAuxiliaryAction (actor, actionId) {
            const [itemId, slug, strikeType, selection] = decodeURIComponent(actionId).split('>', 4)

            const strike = actor.system.actions
                .filter(action => action.type === 'strike')
                .find(strike => strike.item.id === itemId && strike.slug === slug)

            if (!strike) return

            if (strike.origin && this.isRenderItem()) {
                this.renderItem(actor, strike.origin.id)
            } else {
                strike.auxiliaryActions[strikeType]?.execute({ selection })
            }
        }

        /**
         * Perform toggle action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #performToggleAction (actor, actionId) {
            const [domain, option, itemId, suboptionValue] = decodeURIComponent(actionId).split('>', 4)

            if (!domain || !option) return

            const toggles = Object.values(this.actor.synthetics.toggles).flatMap(domain => Object.values(domain))

            const toggle = toggles.find(t => t.domain === domain && t.option === option && t.itemId === itemId)

            if (!toggle) return

            const value = !toggle.enabled || !toggle.checked || (suboptionValue && !toggle.suboptions.find(s => s.value === suboptionValue)?.selected)

            await actor.toggleRollOption(domain, option, itemId, value, suboptionValue)
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
                if (game.combat?.current?.tokenId === token.id) {
                    await game.combat?.nextTurn()
                }
                break
            }
        }

        /**
         * Perform versatile option
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #performVersatileOption (actor, actionId) {
            const [itemId, slug, selection] = decodeURIComponent(actionId).split('>', 3)

            const action = actor.system.actions
                .filter(action => action.type === 'strike')
                .find(strike => strike.item.id === itemId && strike.slug === slug)
            const weapon = action?.item

            if (!weapon) return

            await toggleWeaponTrait({ weapon, trait: 'versatile', selection })

            // Adapted from pf2e
            async function toggleWeaponTrait ({ weapon, trait, selection }) {
                if (!actor?.isOfType('character')) return

                const item = actor.items.get(weapon.id)

                const property = trait === 'double-barrel' ? 'doubleBarrel' : trait
                const current = item.system.traits.toggles[property].selected
                if (current === selection) return

                if (item?.isOfType('weapon') && item === weapon) {
                    const value = property === 'doubleBarrel' ? !!selection : selection
                    await item.update({ [`system.traits.toggles.${property}.selected`]: value })
                } else if (item?.isOfType('weapon') && weapon.altUsageType === 'melee') {
                    item.update({ [`system.meleeUsage.traitToggles.${trait}`]: selection })
                } else if (trait === 'versatile' && item?.isOfType('shield')) {
                    item.update({ 'system.traits.integrated.versatile.selected': selection })
                } else if (trait !== 'double-barrel') {
                    const rule = item?.rules.find(
                        r => r.key === 'Strike' && !r.ignored && r.slug === weapon.slug
                    )
                    await rule?.toggleTrait({ trait, selection })
                }
            }
        }
    }
})
