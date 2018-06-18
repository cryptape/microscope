import * as React from 'react'
import { Link } from 'react-router-dom'
import LinearProgress from '@material-ui/core/LinearProgress'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import List from '@material-ui/core/List'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'

import { withObservables } from '../../contexts/observables'
import { IContainerProps, DetailedTransaction } from '../../typings/'
import ErrorNotification from '../../components/ErrorNotification'

const layouts = require('../../styles/layout.scss')
const texts = require('../../styles/text.scss')
const styles = require('./styles.scss')

interface TransactionProps extends IContainerProps {}

interface TransactionState extends DetailedTransaction {
  timestamp: ''
  gasUsed: ''
  error: {
    message: string
    code: string
  }
}
const initState: TransactionState = {
  hash: '',
  blockHash: '',
  blockNumber: '',
  index: '',
  content: '',
  basicInfo: {
    to: '',
    from: '',
    data: '',
    value: '',
  },
  error: {
    message: '',
    code: '',
  },
  timestamp: '',
  gasUsed: '',
}

const InfoList = ({ infos, details }) =>
  infos.map(info => (
    <ListItem key={info.key}>
      <ListItemText
        classes={{
          primary: styles.infoTitle,
          secondary: styles.infoValue,
        }}
        primary={info.label}
        secondary={
          info.type ? (
            <Link
              to={`/${info.type}/${details[info.key]}`}
              href={`/${info.type}/${details[info.key]}`}
              className={texts.addr}
            >
              {details[info.key] || '_'}
            </Link>
          ) : (
            details[info.key] || '_'
          )
        }
      />
    </ListItem>
  ))
class Transaction extends React.Component<TransactionProps, TransactionState> {
  readonly state = initState
  componentWillMount () {
    const { transaction } = this.props.match.params
    if (transaction) {
      this.props.CITAObservables.getTransaction(transaction).subscribe(
        // next
        (tx: DetailedTransaction) => {
          this.handleReturnedTx(tx)
        },
        // error
        error => {
          this.setState(state => ({ error }))
        },

        // complete
        () => {},
      )
    }
  }
  private handleReturnedTx = (tx: DetailedTransaction) => {
    if (!tx) {
      return this.setState(state => ({
        error: {
          message: 'Transaction Not Found',
          code: '-1',
        },
      }))
    }
    return this.setState(state => ({ ...tx }))
  }
  private infos = [
    { key: 'blockHash', label: 'Block Hash', type: 'block' },
    { key: 'blockNumber', label: 'Height', type: 'height' },
    { key: 'index', label: 'Index' },
    {
      key: 'content',
      label: 'Content',
    },
  ]
  private basicInfo = [
    { key: 'from', label: 'From', type: 'account' },
    { key: 'to', label: 'To', type: 'account' },
    { key: 'value', label: 'value' },
    { key: 'data', label: 'data' },
  ]

  private dismissNotification = e => {
    this.setState(state => ({
      error: {
        message: '',
        code: '',
      },
    }))
  }
  render () {
    const {
      hash,
      blockHash,
      blockNumber,
      content,
      index,
      error,
      timestamp,
      gasUsed,
    } = this.state
    return (
      <React.Fragment>
        {hash ? '' : <LinearProgress />}
        <div className={layouts.main}>
          <Card classes={{ root: layouts.cardContainer }}>
            {/*
            <CardHeader
              title={
                <div className={styles.txHeader}>
                  Transaction: <span className={texts.addr}>{hash}</span>
                </div>
              }
              subheader="time"
            />
          */}
            <CardContent>
              <div className={styles.hash}>Transaction</div>
              <div className={texts.hash}>{hash}</div>
              <div className={styles.attrs}>
                {timestamp ? (
                  <span>
                    <svg className="icon" aria-hidden="true">
                      <use xlinkHref="#icon-time" />
                    </svg>
                    Time: {new Date(timestamp).toLocaleTimeString()}
                  </span>
                ) : null}
                {gasUsed ? (
                  <span>
                    <svg className="icon" aria-hidden="true">
                      <use xlinkHref="#icon-gas" />
                    </svg>
                    Gas Used: {gasUsed}
                  </span>
                ) : null}
              </div>
              <Divider />
              <div className={styles.lists}>
                <List
                  subheader={
                    <ListSubheader
                      component="div"
                      classes={{ root: styles.listHeaderRoot }}
                    >
                      Token
                    </ListSubheader>
                  }
                >
                  <InfoList
                    infos={this.basicInfo}
                    details={this.state.basicInfo}
                  />
                </List>
                <List
                  subheader={
                    <ListSubheader
                      component="div"
                      classes={{ root: styles.listHeaderRoot }}
                    >
                      Block
                    </ListSubheader>
                  }
                >
                  <InfoList infos={this.infos} details={this.state} />
                </List>
              </div>
            </CardContent>
          </Card>
        </div>
        <ErrorNotification
          error={error}
          dismissNotification={this.dismissNotification}
        />
      </React.Fragment>
    )
  }
}

export default withObservables(Transaction)
