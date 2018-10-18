import * as React from 'react'
import { Link } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Search as SearchIcon } from '@material-ui/icons'
import { unsigner } from '@nervos/signer'
import { withObservables } from '../../contexts/observables'
import { IContainerProps, IBlock, UnsignedTransaction } from '../../typings'
import { initBlock, initUnsignedTransaction } from '../../initValues'
import toText from '../../utils/toText'
import bytesToHex from '../../utils/bytesToHex'
import valueFormatter from '../../utils/valueFormatter'
import check from '../../utils/check'

const styles = require('./styles.scss')

enum SearchType {
  BLOCK,
  TRANSACTION,
  ACCOUNT,
  HEIGHT,
  ERROR
}

const searchGen = keyword => {
  let word = keyword
  if (!check.digits(word) && word.slice(0, 2) !== '0x') {
    word = `0x${word}`
  }
  if (check.address(word)) {
    return [
      { type: SearchType.ACCOUNT, url: `/account/${word}`, value: word },
      { type: SearchType.HEIGHT, url: `/height/${word}`, value: word }
    ]
  } else if (check.transaction(word)) {
    return [
      { type: SearchType.BLOCK, url: `/block/${word}`, value: word },
      { type: SearchType.TRANSACTION, url: `/transactions/${word}`, value: word },
      { type: SearchType.HEIGHT, url: `/height/${word}`, value: word }
    ]
  } else if (check.height(word)) {
    return [{ type: SearchType.HEIGHT, url: `/height/${word}`, value: word }]
  }
  return [{ type: SearchType.ERROR, url: '', value: word }]

  // switch (keyword.length) {
  //   case 64:
  //   case 66: {
  //     return [
  //       { type: SearchType.BLOCK, url: `/block/${keyword}` },
  //       { type: SearchType.TRANSACTION, url: `/transactions/${keyword}` }
  //     ]
  //   }
  //   case 40:
  //   case 42: {
  //     return [{ type: SearchType.ACCOUNT, url: `/account/${keyword}` }]
  //   }
  //   default: {
  //     return [{ type: SearchType.HEIGHT, url: `/height/${keyword}` }]
  //   }
  // }
}

const BlockDisplay = translate('microscope')(({ block, t }: { block: IBlock; t: (key: string) => string }) => (
  <div className={styles.display}>
    <div className={styles.title}>Block</div>
    <table className={styles.items}>
      <tbody>
        <tr>
          <td>{t('hash')}</td>
          <td>{block.hash}</td>
        </tr>
        <tr>
          <td>{t('height')}</td>
          <td>{+block.header.number}</td>
        </tr>
        <tr>
          <td>{t('prev hash')}</td>
          <td>{block.header.prevHash}</td>
        </tr>
        <tr>
          <td>{t('validator')}</td>
          <td>{block.header.proposer}</td>
        </tr>
        <tr>
          <td>{t('time')}</td>
          <td>{new Date(block.header.timestamp).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td>{t('quota used')}</td>
          <td>{block.header.gasUsed}</td>
        </tr>
      </tbody>
    </table>
    <Link to={`/block/${block.hash}`} href={`/block/${block.hash}`} className={styles.more}>
      {t('detail')}
    </Link>
  </div>
))

const TransactionDisplay = translate('microscope')(
  ({ tx, t }: { tx: UnsignedTransaction & { hash: string }; t: (key: string) => string }) => (
    <div className={styles.display}>
      <div className={styles.title}>Transaction</div>
      <table className={styles.items}>
        <tbody>
          <tr>
            <td>{t('from')}</td>
            <td>{tx.sender.address}</td>
          </tr>
          <tr>
            <td>{t('to')}</td>
            <td>{toText(tx.transaction.to)}</td>
          </tr>
          <tr>
            <td>{t('value')}</td>
            <td>{valueFormatter(bytesToHex(tx.transaction.value as any))}</td>
          </tr>
        </tbody>
      </table>
      <Link to={`/transaction/${tx.hash}`} href={`/transaction/${tx.hash}`} className={styles.more}>
        {t('detail')}
      </Link>
    </div>
  )
)

const AccountDisplay = translate('microscope')(
  ({ balance, txCount, addr, t }: { balance: string; txCount: number; addr: string; t: (key: string) => string }) => (
    <div className={styles.display}>
      <div className={styles.title}>{t('account')}</div>
      <table className={styles.items}>
        <tbody>
          <tr>
            <td>{t('balance')}</td>
            <td>{balance}</td>
          </tr>
          <tr>
            <td>{t('transactions')}</td>
            <td>{txCount}</td>
          </tr>
        </tbody>
      </table>
      <Link to={`/account/${addr}`} href={`/account/${addr}`} className={styles.more}>
        {t('detail')}
      </Link>
    </div>
  )
)

const initState = {
  keyword: '',
  block: initBlock,
  transaction: { ...initUnsignedTransaction, hash: '' },
  txCount: '',
  balance: '',
  searchValueError: false
}

type SearchPanelState = typeof initState
interface SearchPanelProps extends IContainerProps {}
class SearchPanel extends React.Component<SearchPanelProps, SearchPanelState> {
  state = initState

  private handleInput = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    this.setState({
      keyword: value
    })
  }
  private handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      this.handleSearch()
    }
  }
  private handleSearch = () => {
    const { keyword } = this.state
    if (keyword === '') return
    // clear history
    this.setState({ ...initState, keyword })

    const { CITAObservables } = this.props
    const searches = searchGen(keyword)
    searches.forEach(search => {
      const { value, type } = search
      switch (type) {
        case SearchType.BLOCK: {
          return CITAObservables.blockByHash(value).subscribe(block =>
            this.setState(state => Object.assign({}, state, { block }))
          )
        }
        case SearchType.HEIGHT: {
          return CITAObservables.blockByNumber(value.toString(16)).subscribe(block =>
            this.setState(state => Object.assign({}, state, { block }))
          )
        }
        case SearchType.TRANSACTION: {
          return CITAObservables.getTransaction(value).subscribe(transaction => {
            const unsignedTransaction = unsigner(transaction.content)
            unsignedTransaction.hash = transaction.hash
            this.setState(state => Object.assign({}, state, { transaction: unsignedTransaction }))
          })
        }
        case SearchType.ACCOUNT: {
          // CITAObservables.getBalance({ addr: value, blockNumber: "latest" }).subscribe(balance => {
          //   this.setState(state => Object.assign({}, state, {balance}))
          // })
          CITAObservables.getTransactionCount({
            addr: value,
            blockNumber: 'latest'
          }).subscribe(txCount => {
            this.setState(state => Object.assign({}, state, { txCount }))
          })
          return CITAObservables.getBalance({
            addr: value,
            blockNumber: 'latest'
          }).subscribe(balance => {
            this.setState(state => Object.assign({}, state, { balance }))
          })
        }
        case SearchType.ERROR: {
          console.log('error')
          this.setState({
            searchValueError: true
          })
          return false
        }
        default: {
          return false
        }
      }
    })
  }
  render () {
    const { keyword, block, transaction, balance, txCount, searchValueError } = this.state
    return (
      <div>
        <div className={`${styles.fields} ${searchValueError ? styles.error : ''}`}>
          <div className={styles.search}>
            <input
              type="text"
              value={keyword}
              onChange={this.handleInput}
              onKeyUp={this.handleKeyUp}
              placeholder="Account Address, Tx Hash, Block Hash or Height"
            />
            <button onClick={this.handleSearch}>
              <SearchIcon />
            </button>
          </div>
          {searchValueError ? (
            <div className={styles.errormessage}>
              Please enter Address or Transaction Hash or Block Hash or Block Height
            </div>
          ) : null}
        </div>

        {block.hash ? <BlockDisplay block={block} /> : null}
        {transaction.hash ? <TransactionDisplay tx={transaction} /> : null}
        {balance !== '' ? <AccountDisplay balance={balance} txCount={+txCount} addr={keyword} /> : null}
      </div>
    )
  }
}
export default withObservables(SearchPanel)
