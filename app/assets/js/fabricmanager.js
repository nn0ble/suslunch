// let url = 'https://meta.fabricmc.net/v2/versions/loader/:game_version
const { profile } = require('console')
const fse   = require('fs')
const fs   = require('fs-extra')
const os   = require('os')
const path = require('path')
const request = require('request')

const ConfigManager = require('./configmanager')

const logger = require('./loggerutil')('%c[VersionManager]', 'color: #a02d2a; font-weight: bold')

const sysRoot = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME)
const dataPath = path.join(sysRoot, '.featherlauncher')
const MANIFEST_PATH = path.join(ConfigManager.getLauncherDirectory(), 'version_manifest.json')


const version = ConfigManager.getSelectedServerVersion()

const launcherDir = process.env.CONFIG_DIRECT_PATH || require('@electron/remote').app.getPath('userData')
const DEFAULT_CONFIG = {
    id: this.version,
    inheritsFrom: this.version,
    type: "release",
    libraries: [],
    mainClass: ""
  }

let config = null

data = null

exports.pullRemote = function() {
    let url = 'https://meta.fabricmc.net/v2/versions/loader/' + this.version
    
        return new Promise((resolve, reject) => {
            const opts = {
                url: url,
                timeout: 500
            }
            const distroDest = path.join(dataPath, 'versions/' + this.version + '/version.json')
            request(opts, (error, resp, body) => {
                if(!error){
                    fse.writeFile(distroDest, body, 'utf-8', (err) => {
                        if(!err){
                            console.log(' Write Fabric')
                            resolve(data)
                            return
                        } else {
                            reject(err)
                            return
                        }
                    })
                } else {
                    reject(error)
                    return
                }
            })
        })
}