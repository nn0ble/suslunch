// let url = 'https://meta.fabricmc.net/v2/versions/loader/:game_version
const {
    profile
} = require('console')
const fse = require('fs')
const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const request = require('request')

const ConfigManager = require('./configmanager')
const VersionManager = require('./versionmanager')

const logger = require('./loggerutil')('%c[FabricManager]', 'color: #a02d2a; font-weight: bold')

const sysRoot = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME)
const dataPath = path.join(sysRoot, '.featherlauncher')


const launcherDir = process.env.CONFIG_DIRECT_PATH || require('@electron/remote').app.getPath('userData')
const DEFAULT_CONFIG = {
    id: "1.18.1",
    inheritsFrom: "1.18.1",
    type: "release",
    libraries: [],
    mainClass: ""
}

let config = {
    id: "",
    inheritsFrom: "",
    minecraftArguments: "--username ${auth_player_name} --version ${version_name} --gameDir ${game_directory} --assetsDir ${assets_root} --assetIndex ${assets_index_name} --uuid ${auth_uuid} --accessToken ${auth_access_token} --userType ${user_type} --versionType ${version_type}",
    type: "release",
    libraries: [],
    mainClass: ""
}

class FabricIndex {
    static fromJSON(json) {

        const fabVers = Object.assign(new FabricIndex(), json)

        return fabVers
    }
}

data = null

exports.pullRemote = function () {
    let version = VersionManager.getProfile(ConfigManager.getSelectedServer()).version
    let versPath = version + '-fabric'
    let type = VersionManager.getProfile(ConfigManager.getSelectedServer()).type
    let url = 'https://meta.fabricmc.net/v2/versions/loader/' + version
    let libUrl = 'https://maven.fabricmc.net/'
    return new Promise((resolve, reject) => {
        const opts = {
            url: url,
            timeout: 500
        }

        console.log("OOGA BOOGA")
        //versPath = 'versions/' + versPath + '/' + versPath + '.json'

        const distroDest = path.join(dataPath, 'versions/' + versPath + '/' + versPath + '.json')
        request(opts, (error, resp, body) => {
            if (!error) {
                js = JSON.parse(body)
                for (vers of js) {
                    if (vers.loader.stable) {
                        console.log(vers)

                        config.id = version
                        config.id.inheritsFrom = version
                        config.type = type

                        for (library of vers.launcherMeta.libraries.common) {
                            config.libraries.push(library)
                        }

                        config.libraries.push({
                            "name": vers.intermediary.maven,
                            "url": libUrl
                        })
                        config.libraries.push(

                            {
                                "name": vers.loader.maven,
                                "url": libUrl
                            }
                        )

                        config.mainClass = vers.launcherMeta.mainClass.client

                        fse.access(distroDest, (err) => {
                            if(err) {
                                fs.mkdir(path.join(dataPath, 'versions/' + versPath), {recursive: true}, (err) => {
                                    if (err) {
                                        console.log('failed to create directory', err);
                                    } else {
                                        console.log('writing file succeeded');
                                    }
                                });
                            } 
                            fse.writeFile(distroDest, JSON.stringify(config), 'utf-8', (err) => {
                                if(!err){
                                    console.log('Write Fabric')
                                    data = FabricIndex.fromJSON(js)
                                    resolve(data)
                                    return
                                } else {
                                    reject(err)
                                    return
                                }
                            })
                        });

                        

                    } else {
                        console.log("no stable version, using latest")

                    }
                }


            } else {
                reject(error)
                return
            }
        })
    })
}