/**
 * Base Matter Accessory Class
 *
 * This base class implements the MatterAccessory interface and provides
 * common functionality that all Matter devices can use.
 *
 * Individual device types should extend this class and call super() with
 * the required configuration.
 */
import { getMatter } from '../utils.js';
/**
 * Base class for all Matter accessories
 * Implements the MatterAccessory interface and provides common methods
 */
export class BaseMatterAccessory {
    // Required MatterAccessory properties
    UUID;
    displayName;
    deviceType;
    serialNumber;
    manufacturer;
    model;
    firmwareRevision;
    hardwareRevision;
    context;
    clusters;
    handlers;
    parts;
    // Protected properties available to child classes
    api;
    log;
    matter;
    constructor(api, log, config) {
        this.api = api;
        this.log = log;
        this.matter = getMatter(api);
        // Set all required properties
        this.UUID = config.UUID;
        this.displayName = config.displayName;
        this.deviceType = config.deviceType;
        this.serialNumber = config.serialNumber;
        this.manufacturer = config.manufacturer;
        this.model = config.model;
        this.firmwareRevision = config.firmwareRevision;
        this.hardwareRevision = config.hardwareRevision;
        this.clusters = config.clusters;
        this.handlers = config.handlers;
        this.parts = config.parts;
        // Set context with all metadata
        this.context = {
            serialNumber: this.serialNumber,
            manufacturer: this.manufacturer,
            model: this.model,
            firmwareRevision: this.firmwareRevision,
            hardwareRevision: this.hardwareRevision,
            ...config.context,
        };
    }
    async updateState(cluster, attributes, partId) {
        await this.matter.updateAccessoryState(this.UUID, cluster, attributes, partId);
        this.log.debug(`[${this.displayName}] Updated ${cluster} state:`, attributes);
    }
    async readState(cluster, partId) {
        return await this.matter.getAccessoryState(this.UUID, cluster, partId);
    }
    /**
     * Log helper methods
     */
    logInfo(message, ...args) {
        this.log.info(`[${this.displayName}] ${message}`, ...args);
    }
    logError(message, ...args) {
        this.log.error(`[${this.displayName}] ${message}`, ...args);
    }
    logDebug(message, ...args) {
        this.log.debug(`[${this.displayName}] ${message}`, ...args);
    }
    logWarn(message, ...args) {
        this.log.warn(`[${this.displayName}] ${message}`, ...args);
    }
    /**
     * Convert this class instance to a plain MatterAccessory object
     * This is what gets registered with Homebridge
     */
    toAccessory() {
        return {
            UUID: this.UUID,
            displayName: this.displayName,
            deviceType: this.deviceType,
            serialNumber: this.serialNumber,
            manufacturer: this.manufacturer,
            model: this.model,
            firmwareRevision: this.firmwareRevision,
            hardwareRevision: this.hardwareRevision,
            context: this.context,
            clusters: this.clusters,
            handlers: this.handlers,
            parts: this.parts,
        };
    }
}
//# sourceMappingURL=BaseMatterAccessory.js.map