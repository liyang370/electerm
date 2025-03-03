/**
 * show base terminal info, id sessionID
 */

import { osResolve } from '../../common/resolve'
import ShowItem from '../common/show-item'

const { prefix } = window
const c = prefix('common')
const st = prefix('setting')

export default function TerminalInfoBase (props) {
  const { id, saveTerminalLogToFile, logName } = props
  const base = props.appPath
    ? osResolve(props.appPath, 'electerm', 'session_logs')
    : window.et.sessionLogPath
  const path = osResolve(base, logName + '.log')
  const to = saveTerminalLogToFile
    ? <ShowItem disabled={!saveTerminalLogToFile} to={path}>{path}</ShowItem>
    : `-> ${c('setting')} -> ${st('saveTerminalLogToFile')}`
  return (
    <div className='terminal-info-section terminal-info-base'>
      <p><b>ID:</b> {id}</p>
      <p><b>log:</b> {to}</p>
    </div>
  )
}
