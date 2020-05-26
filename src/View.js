'use strict'
const chalk = require('chalk')
const DiffyView = require('diffy-view')

module.exports = class View extends DiffyView {
  showMenu (menu, cost) {
    const choice = menu.map((x) => {
      return {
        name: `${x} minute(s) ${chalk.yellow(((x * 60) * cost).toLocaleString() + ' Sats')}`
      }
    })
    choice.push({ value: 0, name: 'Cancel' })
    let str = `Enter the number of your choice.\n\nStream costs : ${cost} Sats per second.\n`
    choice.forEach(({ name }, index) => {
      str += `${chalk.red(index + 1)}. ${name} \n`
    })
    this.setState({
      menu: str
    })
  }

  streamIsValid () {
    this.setState({
      menu: '',
      streamAuth: chalk.green.bold('>> Feed is autheneticated << ')
    })
  }

  showStreamMeta (obj) {
    let str = '______________________________________\n\n'
    Object.keys(obj).forEach((k) => {
      str += `${chalk.blue(k)} : ${obj[k]}\n`
    })
    this.setState({
      streamMeta: str
    })
  }

  render () {
    const { stationKey, input, menu, streamAuth, streamMeta, hlsServer, streamStatus, log } = this.state
    return `
      Bitstation

      Station Key : ${chalk.underline.bold(stationKey)}

      ${menu || streamAuth || ''}
      ${hlsServer ? `\n\nNow streaming on ${chalk.blue(hlsServer)}` : ''}

      ${streamMeta || ''}

      ${streamStatus ? chalk.blue(streamStatus) : ''}
      ${log ? chalk.blue(log) : ''}


      ${menu ? input || chalk.gray('Enter choice number') : ''}

      ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    `
  }
}
