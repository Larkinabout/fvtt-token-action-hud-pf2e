// For distribution
const coreModulePath = '../../token-action-hud-core/scripts/token-action-hud-core.min.js'
const coreModule = await import(coreModulePath)
export const CoreActionHandler = coreModule.ActionHandler
export const CoreActionListExtender = coreModule.ActionListExtender
export const CoreCategoryManager = coreModule.CategoryManager
export const CorePreRollHandler = coreModule.PreRollHandler
export const CoreRollHandler = coreModule.RollHandler
export const CoreSystemManager = coreModule.SystemManager
export const CoreUtils = coreModule.Utils
export const Logger = coreModule.Logger

// For development
/* const coreModulePath = '../../token-action-hud-core/'
const coreActionHandlerFile = `${coreModulePath}scripts/action-handlers/action-handler.js`
const coreActionListExtenderFile = `${coreModulePath}scripts/action-handlers/action-list-extender.js`
const coreCategoryManagerFile = `${coreModulePath}scripts/category-manager.js`
const corePreRollHandlerFile = `${coreModulePath}scripts/roll-handlers/pre-roll-handler.js`
const coreRollHandlerFile = `${coreModulePath}scripts/roll-handlers/roll-handler.js`
const coreSystemManagerFile = `${coreModulePath}scripts/system-manager.js`
const coreUtilsFile = `${coreModulePath}scripts/utilities/utils.js`

export const CoreActionHandler = await import(coreActionHandlerFile).then(module => module.ActionHandler)
export const CoreActionListExtender = await import(coreActionListExtenderFile).then(module => module.ActionListExtender)
export const CoreCategoryManager = await import(coreCategoryManagerFile).then(module => module.CategoryManager)
export const CorePreRollHandler = await import(corePreRollHandlerFile).then(module => module.PreRollHandler)
export const CoreRollHandler = await import(coreRollHandlerFile).then(module => module.RollHandler)
export const CoreSystemManager = await import(coreSystemManagerFile).then(module => module.SystemManager)
const coreUtilsModule = await import(coreUtilsFile)
export const CoreUtils = coreUtilsModule.Utils
export const Logger = coreUtilsModule.Logger */
