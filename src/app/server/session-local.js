/**
 * terminal/sftp/serial class
 */
const pty = require('node-pty')
const { resolve: pathResolve } = require('path')
const log = require('../common/log')
const {
  isWin
} = require('../common/runtime-constants')
const { TerminalBase } = require('./session-base')

// const { MockBinding } = require('@serialport/binding-mock')
// MockBinding.createPort('/dev/ROBOT', { echo: true, record: true })

class TerminalLocal extends TerminalBase {
  init () {
    const {
      cols,
      rows,
      execWindows,
      execMac,
      execLinux,
      execWindowsArgs,
      execMacArgs,
      execLinuxArgs,
      termType,
      term
    } = this.initOptions
    const { platform } = process
    const exec = platform.startsWith('win')
      ? pathResolve(
        process.env.windir,
        execWindows
      )
      : platform === 'darwin' ? execMac : execLinux
    const arg = platform.startsWith('win')
      ? execWindowsArgs
      : platform === 'darwin' ? execMacArgs : execLinuxArgs
    const cwd = process.env[platform === 'win32' ? 'USERPROFILE' : 'HOME']
    const argv = platform.startsWith('darwin') ? ['--login', ...arg] : arg
    this.term = pty.spawn(exec, argv, {
      name: term,
      encoding: null,
      cols: cols || 80,
      rows: rows || 24,
      cwd,
      env: process.env
    })
    this.term.termType = termType
    const { sessionId } = this.initOptions
    global.sessions[sessionId] = {
      id: sessionId,
      sftps: {},
      terminals: {
        [this.pid]: this
      }
    }
    return Promise.resolve(this)
  }

  resize (cols, rows) {
    this.term.resize(cols, rows)
  }

  on (event, cb) {
    this.term.on(event, cb)
  }

  write (data) {
    try {
      this.term.write(data)
      if (this.sshLogger) {
        this.sshLogger.write(data)
      }
    } catch (e) {
      log.error(e)
    }
  }

  kill () {
    if (this.sshLogger) {
      this.sshLogger.destroy()
    }
    if (!isWin) {
      this.term && this.term.kill()
    }
    this.onEndConn()
  }
}

exports.terminalLocal = function (initOptions, ws) {
  return (new TerminalLocal(initOptions, ws)).init()
}

/**
 * test ssh connection
 * @param {object} options
 */
exports.testConnectionLocal = (initOptions) => {
  return Promise.resolve(true)
}
