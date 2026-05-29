import type { API, DynamicPlatformPlugin, Logging, MatterAccessory, PlatformConfig } from 'homebridge';
export declare class SchellenbergUSBPlatform implements DynamicPlatformPlugin {
    readonly log: Logging;
    readonly config: PlatformConfig;
    readonly api: API;
    readonly matterAccessories: Map<string, MatterAccessory>;
    private readonly matter;
    private sApi;
    constructor(log: Logging, config: PlatformConfig, api: API);
    configureAccessory(): void;
    configureMatterAccessory(accessory: MatterAccessory): void;
    private registerMatterAccessories;
}
