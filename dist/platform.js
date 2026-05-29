import { getMatter } from './utils.js';
import { WindowBlindAccessory } from "./devices/WindowBlindAccessory.js";
import { PLATFORM_NAME, PLUGIN_NAME } from "./settings.js";
import { SchellenbergUSBApi } from "./SchellenbergUSBApi.js";
export class SchellenbergUSBPlatform {
    log;
    config;
    api;
    matterAccessories = new Map();
    matter;
    sApi;
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.sApi = new SchellenbergUSBApi(this.config.comport, this.log);
        this.log.debug('Finished initializing platform:', this.config.name);
        if (!this.api.isMatterAvailable?.()) {
            this.log.warn('Matter is not available in this version of Homebridge. Please update Homebridge to use this plugin.');
        }
        if (!this.api.isMatterEnabled?.()) {
            this.log.warn('Matter is not enabled in Homebridge. Please enable Matter in the Homebridge settings to use this plugin.');
            return;
        }
        this.matter = getMatter(this.api);
        this.log.info('Setting up sApi');
        this.api.on('didFinishLaunching', () => {
            this.log.debug('Executed didFinishLaunching callback');
            void this.registerMatterAccessories();
        });
    }
    //ONLY FOR HAP
    configureAccessory() { }
    //ONLY FOR MATTER
    configureMatterAccessory(accessory) {
        this.log.debug('Loading cached Matter accessory:', accessory.displayName);
        this.matterAccessories.set(accessory.UUID, accessory);
    }
    async registerMatterAccessories() {
        this.log.info('═'.repeat(80));
        this.log.info('Homebridge SchellenbergUSB');
        this.log.info('═'.repeat(80));
        if (!this.config.devices) {
            this.log.warn('No devices in config. Cannot continue.');
            return;
        }
        const accessories = [];
        for (let configEntry of this.config.devices) {
            if (!configEntry.id || !configEntry.name || !configEntry.runtime) {
                this.log.warn('Device is missing some parameters.');
                continue;
            }
            const device = new WindowBlindAccessory(this.api, this.log, configEntry, this.sApi);
            accessories.push(device.toAccessory());
        }
        if (accessories.length > 0) {
            this.log.info(`Registered ${accessories.length} device(s)`);
            for (const acc of accessories) {
                this.log.info(`  - ${acc.displayName}`);
            }
            await this.matter.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, accessories);
        }
        this.log.info('═'.repeat(80));
        this.log.info('Finished registering Matter accessories');
        this.log.info('═'.repeat(80));
    }
}
//# sourceMappingURL=platform.js.map