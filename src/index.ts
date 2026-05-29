import type { API } from 'homebridge'

import { SchellenbergUSBPlatform } from './platform.js'
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

export default (api: API) => {
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, SchellenbergUSBPlatform)
}
