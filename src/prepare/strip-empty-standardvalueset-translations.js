
const { parseXml, buildXml } = require('../utils/xml-utils')
const pathService = require('../services/path-service')
const path = require('path')
const fs = require('fs')
const _ = require('highland')

module.exports = async (config) => {
  if (!fs.existsSync(pathService.getStandardValueSetTranslations()) || !config.objectTranslations) return true
  const cfg = config.objectTranslations
  return _(fs.readdirSync(pathService.getStandardValueSetTranslations()))
    .map(async f => {
      const fContent = fs.readFileSync(path.resolve(pathService.getStandardValueSetTranslations(), f), 'utf8')
      const fJson = await parseXml(fContent)

      if (cfg.stripUntranslatedFields) {
        const keysToProcess = {
          'valueTranslation': 'translation'
        }

        const processXml = (root, keysToProcess) => {
          return Object.keys(keysToProcess).reduce((filterIt, key) => {
            if (!root[key]) return true
            root[key] = root[key].filter(x => {
              const labelKeys = Array.isArray(keysToProcess[key]) ? keysToProcess[key] : [keysToProcess[key]]
              return !labelKeys.reduce((filterIt, labelKey) => {
                if (typeof (labelKey) === 'object') return processXml(x, labelKey) && filterIt
                const labelKeyIsNotTranslated = !x[labelKey] || !x[labelKey][0]
                if (labelKeyIsNotTranslated) delete x[labelKey]
                return filterIt && labelKeyIsNotTranslated
              }, true)
            })
            return filterIt && !root[key].length
          }, true)
        }

        processXml(fJson.StandardValueSetTranslation, keysToProcess)
      }

      fs.writeFileSync(path.resolve(pathService.getStandardValueSetTranslations(), f), buildXml(fJson) + '\n')
    })
    .map(x => _(x))
    .sequence()
    .collect()
    .toPromise(Promise)
}
