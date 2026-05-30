

import type { API, Logger, MatterRequests } from 'homebridge'

import { getMatter } from '../utils.js'
import {BaseMatterAccessory} from "./BaseMatterAccessory.js";
import {SchellenbergUSBApi, SchellenbergUSBCommands} from "../SchellenbergUSBApi.js";
import {clearInterval, setInterval} from "node:timers";

export class WindowBlindAccessory extends BaseMatterAccessory {

  private sApi : SchellenbergUSBApi
  private config : any
  private currentPosition : number
  private targetPosition : number
  private shutterStepTime : number
  private shutterDriver : NodeJS.Timeout | null

  constructor(api: API, log: Logger, config : any, schellenbergAPI : SchellenbergUSBApi) {
    const serialNumber = config.id
    const matter = getMatter(api)

    super(api, log, {
      UUID: matter.uuid.generate(serialNumber),
      displayName: config.name,
      deviceType: matter.deviceTypes.WindowCovering,
      serialNumber,
      manufacturer: 'PHartmann',
      model: 'SchellenbergUSB',
      firmwareRevision: '2.0.0',
      hardwareRevision: '1.0.0',

      clusters: {
        windowCovering: {
          targetPositionLiftPercent100ths: 5000,
          currentPositionLiftPercent100ths: 5000,
          operationalStatus: {
            global: 0,
            lift: 0,
            tilt: 0,
          },
          endProductType: 0,
          configStatus: {
            operational: true,
            onlineReserved: true,
            liftMovementReversed: false,
            liftPositionAware: true,
            tiltPositionAware: false,
            liftEncoderControlled: true,
            tiltEncoderControlled: false,
          },
        },
      },

      handlers: {
        windowCovering: {
          goToLiftPercentage: async request => this.handleGoToLift(request),
          upOrOpen: async () => this.handleUpOrOpen(),
          downOrClose: async () => this.handleDownOrClose(),
          stopMotion: async () => this.handleStop(),
        },
      },
    })

    this.currentPosition = 50
    this.targetPosition = 50
    this.shutterStepTime = config.runtime / 100;
    this.sApi = schellenbergAPI
    this.config = config
    this.shutterDriver = null
    this.logInfo('initialized.')
  }

  private async handleGoToLift(request: MatterRequests.GoToLiftPercentage): Promise<void> {
    this.logInfo(`GoToLiftPercentage request: ${JSON.stringify(request)}`)

    this.targetPosition = Math.round(request.liftPercent100thsValue /100)
    this.logInfo(`moving to ${this.targetPosition}%.`)

    await this.shutterInterval()

  }

  private async handleUpOrOpen(): Promise<void> {
    this.logInfo('Opened blind.')
    this.targetPosition = 0
    await this.shutterInterval()
  }

  private async handleDownOrClose(): Promise<void> {
    this.logInfo('closed blind.')
    this.targetPosition = 100
    await this.shutterInterval()
  }

  private async handleStop(): Promise<void> {
    this.logInfo('stopping blind.')
    this.targetPosition = this.currentPosition
    await this.shutterInterval()
  }

  public async updateLiftPosition(percent: number): Promise<void> {


    await this.updateState(this.matter.clusterNames.WindowCovering, {
      currentPositionLiftPercent100ths: Math.round(percent * 100),
    })

  }

  private async shutterInterval(){
    this.logInfo('curren position is:', this.currentPosition)
    this.logInfo('targetPosition is:', this.targetPosition)
    if (this.shutterDriver != null){
      clearInterval(this.shutterDriver);
    }
    await this.updateState(this.matter.clusterNames.WindowCovering, {
      targetPositionLiftPercent100ths: Math.round(this.targetPosition*100),
    })
    if (this.currentPosition < this.targetPosition || this.targetPosition == 0 ) {
      this.logInfo('Will go down')
      this.sApi.sendCommand(this.config.id, SchellenbergUSBCommands.DOWN)
          .then(result => {
            this.logInfo('Setting Interval')
            this.shutterDriver = setInterval(()=>{

              if (this.currentPosition == this.targetPosition) {
                if (this.shutterDriver != null){
                  clearInterval(this.shutterDriver);
                }
                if (this.targetPosition != 0) {
                  this.sApi.sendCommand(this.config.id, SchellenbergUSBCommands.STOP)
                      .then(()=>{
                        //TODO
                      })
                      .catch(()=>{
                        //TODO
                      })
                }

              }
              this.currentPosition -= 1
              this.logInfo(`lift position: ${this.currentPosition}% `)
              this.updateLiftPosition(this.currentPosition)
            }, this.shutterStepTime)
          })
          .catch(error => {

          })
    } else if (this.currentPosition > this.targetPosition || this.targetPosition == 100) {
      this.logInfo('Will go up')
      this.sApi.sendCommand(this.config.id, SchellenbergUSBCommands.UP)
          .then(result => {
            this.logInfo('Setting Interval')
            this.shutterDriver = setInterval(()=>{
              if (this.currentPosition == this.targetPosition) {
                if (this.shutterDriver != null){
                  clearInterval(this.shutterDriver);
                }
                if (this.targetPosition != 100) {
                  this.sApi.sendCommand(this.config.id, SchellenbergUSBCommands.STOP)
                      .then(()=>{
                        //TODO
                      })
                      .catch(()=>{
                        //TODO
                      })
                }
              }
              this.currentPosition += 1
              this.logInfo(`lift position: ${this.currentPosition}% `)
              this.updateLiftPosition(this.currentPosition)
            }, this.shutterStepTime)
          })
          .catch(error => {

          })
    } else {
      this.sApi.sendCommand(this.config.id, SchellenbergUSBCommands.STOP)
          .then(result => {
            this.logInfo('stopped blind.')
          })
          .catch(error => {
            //TODO
          })
    }
  }
}
