import * as React from 'react'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import AddIcon from '@material-ui/icons/Add'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions'
import Divider from '@material-ui/core/Divider'
import DeleteIcon from '@material-ui/icons/Delete'
import CITAObservables from '@cita/observables'

import { withObservables } from '../../contexts/observables'
import { withConfig, IConfig } from '../../contexts/config'

const layouts = require('../../styles/layout')

enum Configs {
  server = 'server',
  privkey = 'privkey'
}

export interface IConfigPageProps {
  config: IConfig
  CITAObservables: CITAObservables
}

const initState = {
  server: '',
  serverError: false,
  serverHelperText: '',
  privkey: '',
  privkeyError: false,
  privkeyHelperText: ''
}
export type IConfigPageState = typeof initState

class ConfigPage extends React.Component<IConfigPageProps, IConfigPageState> {
  state = initState
  private handleInput = stateLabel => e => {
    // const value = e.target.value
    const { value } = e.target
    this.setState(state => ({
      ...state,
      [stateLabel]: value,
      [`${stateLabel}Error`]: false,
      [`${stateLabel}HelperText`]: ''
    }))
  }
  private handleSubmit = (actionName: string) => e => {
    switch (actionName) {
      case 'addServer': {
        if (/\d+:\d+/.test(this.state.server)) {
          this.props.config.addServer(this.state.server)
          return true
        }
        this.setState(state => ({
          ...state,
          serverError: true,
          serverHelperText: 'Invalid Format'
        }))
        return false
      }
      case 'addPrivkey': {
        this.props.config.addPrivkey(this.state.privkey)
        return true
      }
      default: {
        return false
      }
    }
  }
  render () {
    return (
      <div className={layouts.main}>
        <ServerConfig
          server={this.state.server}
          serverError={this.state.serverError}
          serverHelperText={this.state.serverHelperText}
          serverList={this.props.config.serverList}
          deleteServer={this.props.config.deleteServer}
          handleInput={this.handleInput}
          handleSubmit={this.handleSubmit}
        />
        <PrivkeyConfig
          privkey={this.state.privkey}
          privkeyError={this.state.privkeyError}
          privkeyHelperText={this.state.privkeyHelperText}
          privkeyList={this.props.config.privkeyList}
          deletePrivkey={this.props.config.deletePrivkey}
          handleInput={this.handleInput}
          handleSubmit={this.handleSubmit}
        />
      </div>
    )
  }
}

const ServerConfig = ({
  server,
  serverError,
  serverHelperText,
  serverList,
  deleteServer,
  handleInput,
  handleSubmit
}) => (
  <ExpansionPanel defaultExpanded>
    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="headline">Server List</Typography>
    </ExpansionPanelSummary>
    <Divider />
    <ExpansionPanelDetails>
      <List style={{ width: '100%' }}>
        {serverList.map((_server, idx) => (
          <ListItem>
            <ListItemText primary={_server} />
            <DeleteIcon onClick={() => deleteServer(idx)} />
          </ListItem>
        ))}
      </List>
    </ExpansionPanelDetails>
    <Divider />
    <ExpansionPanelActions>
      <TextField
        value={server}
        onChange={handleInput('server')}
        label="Add New Server"
        placeholder="host:port"
        error={serverError}
        helperText={serverHelperText}
        fullWidth
      />
      <Button variant="flat" onClick={handleSubmit('addServer')}>
        Add
      </Button>
    </ExpansionPanelActions>
  </ExpansionPanel>
)

const PrivkeyConfig = ({
  privkey,
  privkeyError,
  privkeyHelperText,
  privkeyList,
  deletePrivkey,
  handleInput,
  handleSubmit
}) => (
  <ExpansionPanel>
    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="headline">Privkey List</Typography>
    </ExpansionPanelSummary>
    <Divider />
    <ExpansionPanelDetails>
      <List style={{ width: '100%' }}>
        {privkeyList.map((_privkey, idx) => (
          <ListItem>
            <ListItemText primary={_privkey} />
            <DeleteIcon onClick={() => deletePrivkey(idx)} />
          </ListItem>
        ))}
      </List>
    </ExpansionPanelDetails>
    <Divider />
    <ExpansionPanelActions>
      <TextField
        value={privkey}
        onChange={handleInput('privkey')}
        label="Add New Privkey"
        // placeholder="host:port"
        error={privkeyError}
        helperText={privkeyHelperText}
        fullWidth
      />
      <Button variant="flat" onClick={handleSubmit('addPrivkey')}>
        Add
      </Button>
    </ExpansionPanelActions>
  </ExpansionPanel>
)

export default withConfig(withObservables(ConfigPage))
