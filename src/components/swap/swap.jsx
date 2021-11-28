import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Grid,
  Typography,
  IconButton,
  SvgIcon
} from '@material-ui/core'
import config from '../../config'

import Input from '../common/input';
import Button from '../common/button';
import PageLoader from "../common/pageLoader";
import Label from "../common/label";
import AssetSelection from "../assetSelection";
import Config from '../../config';

import {
  ERROR,
  SWAP_TOKEN,
  TOKEN_SWAPPED,
  FINALIZE_SWAP_TOKEN,
  TOKEN_SWAP_FINALIZED,
  TOKENS_UPDATED,
  GET_acent_BALANCES,
  acent_BALANCES_UPDATED,
  GET_ETH_BALANCES,
  ETH_BALANCES_UPDATED,
} from '../../constants'

import Store from "../../stores";
const dispatcher = Store.dispatcher
const emitter = Store.emitter
const store = Store.store

const styles = theme => ({
  root: {
    maxWidth: '400px'
  },
  button: {
    marginTop: '24px'
  },
  frame: {
    border: '1px solid #e1e1e1',
    borderRadius: '3px',
    backgroundColor: '#fafafa',
    padding: '1rem'
  },
  instructions: {
    fontSize: '0.8rem',
    textAlign: 'center',
    marginBottom: '16px'
  },
  instructionUnderlined: {
    fontSize: '0.8rem',
    textDecoration: 'underline',
    textAlign: 'center',
    marginBottom: '16px'
  },
  instructionBold: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '16px'
  },
  hash: {
    fontSize: '0.8rem',
    textAlign: 'center',
    marginBottom: '16px',
    maxWidth: '100%',
    cursor: 'pointer'
  },
  disclaimer: {
    fontSize: '16px',
    marginTop: '24px',
    lineHeight: '42px',
    maxWidth: '250px'
  },
  createAccount: {
    fontSize: '0.8rem',
    textDecoration: 'underline',
    textAlign: 'right',
    marginBottom: '16px',
    cursor: 'pointer'
  },
  icon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderRadius: '25px',
    background: '#dedede',
    height: '50px',
    width: '50px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  iconName: {
    paddingLeft: '24px',
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  swapDirection: {
    margin: '14px 12px 18px 12px'
  },
  gridClick: {
    cursor: 'pointer'
  }
});

function CopyIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        fill={'#6a6a6a'}
        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z"
      />
    </SvgIcon>
  );
}

function SwapIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        fill={'#6a6a6a'}
        d="M8,10V13H14V18H8V21L2,15.5L8,10M22,8.5L16,3V6H10V11H16V14L22,8.5Z"
      />
    </SvgIcon>
  );
}


class Swap extends Component {
  state = {
    loading: false,
    page: 0,
    token: '',
    tokenError: false,
    acentReceiveAddress: '',
    acentReceiveAddressError: false,
    ethReceiveAddress: '',
    ethReceiveAddressError: false,
    tokens: [],
    selectedToken: null,
    acentBalances: null,
    ethBalances: null,
    swapDirection: 'EthereumToAcent'
  };

  componentWillMount() {
    emitter.on(TOKENS_UPDATED, this.tokensUpdated);
    emitter.on(TOKEN_SWAPPED, this.tokenSwapped);
    emitter.on(TOKEN_SWAP_FINALIZED, this.tokenSwapFinalized);
    emitter.on(acent_BALANCES_UPDATED, this.acentBalancesUpdated);
    emitter.on(ETH_BALANCES_UPDATED, this.ethBalancesUpdated);
    emitter.on(ERROR, this.error);
  };

  componentWillUnmount() {
    emitter.removeListener(TOKENS_UPDATED, this.tokensUpdated);
    emitter.removeListener(TOKEN_SWAPPED, this.tokenSwapped);
    emitter.removeListener(TOKEN_SWAP_FINALIZED, this.tokenSwapFinalized);
    emitter.removeListener(acent_BALANCES_UPDATED, this.acentBalancesUpdated);
    emitter.removeListener(ETH_BALANCES_UPDATED, this.ethBalancesUpdated);
    emitter.removeListener(ERROR, this.error);
  };

  tokensUpdated = () => {
    const tokens = store.getStore('tokens')

    this.setState({
      tokens: tokens
    })
  };

  acentBalancesUpdated = (data) => {
    this.setState({ acentBalances: data, loading: false })
  };

  ethBalancesUpdated = (data) => {
    this.setState({ ethBalances: data, loading: false })
  };

  error = (err) => {
    this.props.showError(err)
    this.setState({ loading: false })
  };

  tokenSwapped = (data) => {
    this.setState({
      page: 1,
      clientUuid: data.uuid,
      ethDepositAddress: data.eth_address,
      acentDepositAddress: data.acent_address,
      loading: false
   })
  };

  tokenSwapFinalized = (transactions) => {
    this.setState({
      page: 2,
      loading: false,
      transactions: transactions
    })
  };

  callSwapToken = () => {

    const {
      token,
      swapDirection,
      acentReceiveAddress,
      ethReceiveAddress
    } = this.state

    const content =  {
      token_uuid: token,
      direction: swapDirection,
      acent_address: acentReceiveAddress,
      eth_address: ethReceiveAddress,
    }

    dispatcher.dispatch({ type: SWAP_TOKEN, content })

    this.setState({ loading: true })
  };

  callFinalizeSwapToken = () => {
    const {
      clientUuid,
      selectedToken,
      swapDirection
    } = this.state

    const content = {
      uuid: clientUuid,
      direction: swapDirection,
      token_uuid: selectedToken.uuid
    }
    dispatcher.dispatch({type: FINALIZE_SWAP_TOKEN, content })

    this.setState({ loading: true })
  };

  validateSwapToken = () => {

    this.setState({
      tokenError: false,
      acentReceiveAddressError: false,
      ethReceiveAddressError: false,
    })

    const {
      token,
      swapDirection,
      acentReceiveAddress,
      ethReceiveAddress,
    } = this.state

    let error = false

    if(!token || token === '') {
      this.setState({ tokenError: true })
      error = true
    }

    if(swapDirection === 'EthereumToAcent') {
      if(!acentReceiveAddress || acentReceiveAddress === '') {
        this.setState({ acentReceiveAddressError: true })
        error = true
      }
    } else {
      if(!ethReceiveAddress || ethReceiveAddress === '') {
        this.setState({ ethReceiveAddressError: true })
        error = true
      }
    }

    return !error
  };

  onNext = (event) => {
    switch (this.state.page) {
      case 0:
        if(this.validateSwapToken()) {
          this.callSwapToken()
        }
        break;
      case 1:
        this.callFinalizeSwapToken()
        break;
      case 2:
        this.resetPage()
        break;
      default:

    }
  };

  onSwapDirectionClick = () => {
    const {
      swapDirection,
      selectedToken
    } = this.state

    let direction = swapDirection==='EthereumToAcent'?'AcentToEthereum':'EthereumToAcent'

    if(selectedToken){
      if(!selectedToken.eth_to_acent_enabled && direction === 'EthereumToAcent') {
        direction = 'AcentToEthereum'
      }

      if(!selectedToken.acent_to_eth_enabled && direction === 'AcentToEthereum') {
        direction = 'EthereumToAcent'
      }
    }

    this.setState({
      swapDirection: direction,
      ethReceiveAddress: '',
      acentReceiveAddress: '',
      ethBalances: null,
      acentBalances: null
    })
  };

  resetPage = () => {
    this.setState({
      page: 0,
      token: '',
      tokenError: false,
      acentReceiveAddress: '',
      acentReceiveAddressError: false,
      ethReceiveAddress: '',
      ethReceiveAddressError: false,
      selectedToken: null,
      acentBalances: null,
      ethBalances: null,
    })
  };

  onBack = (event) => {
    this.setState({ page: 0 })
  };

  onHashClick = (hash) => {
    const {
      swapDirection
    } = this.state

    if(swapDirection === 'EthereumToAcent') {
      window.open(config.etherscanURL+hash, "_blank")
    } else {
      window.open(config.explorerURL+hash, "_blank")
    }
  };

  onTokenSelected = (value) => {

    const {
      tokens,
      swapDirection,
      acentReceiveAddress,
      ethReceiveAddress,
    } = this.state

    let theToken = tokens.filter((tok) => {
      return tok.uuid === value
    })

    if(theToken.length < 1) {
      this.setState({ token: value, selectedToken: null })
      return false;
    }

    this.setState({ token: value, selectedToken: theToken[0] })

    if(!theToken[0].eth_to_acent_enabled && !theToken[0].acent_to_eth_enabled) {
      this.setState({ swapDirection: null })
      return false
    }

    let direction = swapDirection

    if(!theToken[0].eth_to_acent_enabled && swapDirection === 'EthereumToAcent') {
      direction = 'AcentToEthereum'
      this.setState({ swapDirection: direction })
    }

    if(!theToken[0].acent_to_eth_enabled && swapDirection === 'AcentToEthereum') {
      direction = 'EthereumToAcent'
      this.setState({ swapDirection: direction })
    }

    if(direction === 'EthereumToAcent') {
      if(theToken.length > 0  && acentReceiveAddress && acentReceiveAddress !== "" && acentReceiveAddress.length === Config.acentAddressLength) {
        const content = {
          acent_address: acentReceiveAddress,
          token_uuid: theToken[0].uuid
        }
        dispatcher.dispatch({type: GET_acent_BALANCES, content })
        this.setState({ loading: true })
      }
      this.setState({ acentBalances: null })
    } else {
      if(theToken.length > 0  && ethReceiveAddress && ethReceiveAddress !== "" && ethReceiveAddress.length === Config.erc20addressLength) {
        const content = {
          eth_address: ethReceiveAddress,
          token_uuid: theToken[0].uuid
        }
        dispatcher.dispatch({type: GET_ETH_BALANCES, content })
        this.setState({ loading: true })
      }
      this.setState({ ethBalances: null })
    }
  };

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)

    if(event.target.id === 'acentReceiveAddress') {

      const {
        selectedToken,
      } = this.state

      if(selectedToken  && event.target.value && event.target.value !== "" && event.target.value.length === Config.acentAddressLength) {
        const content = {
          acent_address: event.target.value,
          token_uuid: selectedToken.uuid
        }
        dispatcher.dispatch({type: GET_acent_BALANCES, content })
        this.setState({ loading: true })
      }
      this.setState({ acentBalances: null })
    }

    if(event.target.id === 'ethReceiveAddress') {

      const {
        selectedToken,
      } = this.state

      if(selectedToken  && event.target.value && event.target.value !== "" && event.target.value.length === Config.erc20addressLength) {
        const content = {
          eth_address: event.target.value,
          token_uuid: selectedToken.uuid
        }
        dispatcher.dispatch({type: GET_ETH_BALANCES, content })
        this.setState({ loading: true })
      }
      this.setState({ ethBalances: null })
    }
  };

  onCopy = () => {
    var elm = document.getElementById("depositAddress");
    let range;
    // for Internet Explorer

    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(elm);
      range.select();
      document.execCommand("Copy");
    } else if (window.getSelection) {
      // other browsers
      var selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(elm);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("Copy");
    }
  };

  renderPage0 = () => {

    const {
      acentReceiveAddress,
      acentReceiveAddressError,
      ethReceiveAddress,
      ethReceiveAddressError,
      loading,
      acentBalances,
      ethBalances,
      selectedToken,
      swapDirection
    } = this.state

    const {
      onIssue,
      onCreateAccount,
      classes
    } = this.props

    return (
      <React.Fragment>
        { this.renderSwapDirection() }
        <AssetSelection onIssue={ onIssue } onTokenSelected={ this.onTokenSelected } disabled={ loading } />
        <Grid item xs={ 12 }>
          {


            (selectedToken && !selectedToken.eth_to_acent_enabled && !selectedToken.acent_to_eth_enabled) ?
              <React.Fragment>
              </React.Fragment>
            :
            swapDirection === "EthereumToAcent" ?
              <React.Fragment>
                <Input
                  id='acentReceiveAddress'
                  fullWidth={ true }
                  label="acent Receive Address"
                  placeholder="eg: acent1mmxvnhkyqrvd2dpskvsgl8lmft4tnrcs97apr3"
                  value={ acentReceiveAddress }
                  error={ acentReceiveAddressError }
                  onChange={ this.onChange }
                  disabled={ loading }
                />
                {
                  acentBalances &&
                  <React.Fragment>
                    <Typography>
                      Current {selectedToken.name} Balance: { acentBalances.balance } { selectedToken.symbol }
                    </Typography>
                  </React.Fragment>
                }
                {
                  !acentBalances &&
                  <Typography className={ classes.createAccount } onClick={ onCreateAccount }>
                    Don't have an account? Create one
                  </Typography>
                }
              </React.Fragment>
              :
              <React.Fragment>
                <Input
                  id='ethReceiveAddress'
                  fullWidth={ true }
                  label="Eth Receive Address"
                  placeholder="eg: 0x0dE0BCb0703ff8F1aEb8C892eDbE692683bD8030"
                  value={ ethReceiveAddress }
                  error={ ethReceiveAddressError }
                  onChange={ this.onChange }
                  disabled={ loading }
                />
                {
                  ethBalances &&
                  <React.Fragment>
                   <Typography>
                     Current {selectedToken.name} Balance: { ethBalances.balance } { selectedToken.symbol }
                   </Typography>
                  </React.Fragment>
                }
             </React.Fragment>
          }
        </Grid>
      </React.Fragment>
    )
  };

  renderPage1 = () => {
    const {
      selectedToken,
      ethDepositAddress,
      acentDepositAddress,
      swapDirection
    } = this.state

    const {
      classes
    } = this.props

    return (
      <React.Fragment>
        <Grid item xs={ 12 } className={ classes.frame }>
          <Typography className={ classes.instructionUnderlined }>
            Here's what you need to do next:
          </Typography>
          <Typography className={ classes.instructionBold }>
            Transfer your {swapDirection === 'EthereumToAcent' ? (selectedToken.symbol+'-ERC20') : selectedToken.unique_symbol}
          </Typography>
          <Typography className={ classes.instructions }>
            to
          </Typography>
          <Typography className={ classes.instructionBold }>
            <div id='depositAddress'>{swapDirection === 'EthereumToAcent' ? ethDepositAddress : acentDepositAddress}</div>
            <IconButton
              style={{
                verticalAlign: "top",
                marginRight: "-5px"
              }}
              onClick={this.onCopy}
            >
              <CopyIcon/>
            </IconButton>
          </Typography>
          <Typography className={ classes.instructionUnderlined }>
            After you've completed the transfer, click the "NEXT" button so we can verify your transaction.
          </Typography>
        </Grid>
      </React.Fragment>
    )
  };

  renderPage2 = () => {

    const {
      classes
    } = this.props

    return (
      <React.Fragment>
        <Grid item xs={ 12 } className={ classes.frame }>
          <Typography className={ classes.instructionBold }>
            Swap request pending
          </Typography>
          <Typography className={ classes.instructions }>
            We have added the following transaction/s to our log for your address:
          </Typography>
          { this.renderTransactions() }
          { this.renderTotals() }
        </Grid>
      </React.Fragment>
    )
  };

  renderTotals = () => {
    const {
      transactions,
      selectedToken,
      acentReceiveAddress,
      ethReceiveAddress,
      swapDirection
    } = this.state

    const {
      classes
    } = this.props

    const reducer = (accumulator, currentValue) => accumulator + parseFloat(currentValue.amount);
    const totalAmount = transactions.reduce(reducer, 0)

    return (
      <React.Fragment>
        <Typography className={ classes.instructions }>
          You will receive another <b>{totalAmount} { swapDirection === 'EthereumToAcent' ? selectedToken.unique_symbol : (selectedToken.symbol+'-ERC20') }</b> in your address <b>{ swapDirection === 'EthereumToAcent' ? acentReceiveAddress : ethReceiveAddress }</b>
        </Typography>
      </React.Fragment>
    )
  };

  renderTransactions = () => {
    const {
      transactions,
      selectedToken,
      swapDirection
    } = this.state

    const {
      classes
    } = this.props

    return transactions.map((transaction) => {
      return (
        <React.Fragment>
          <Typography className={ classes.hash } onClick={ (event) => { this.onHashClick(transaction.deposit_transaction_hash); } }>
            <b>{transaction.amount} { swapDirection === 'EthereumToAcent' ? (selectedToken.symbol+'-ERC20') : selectedToken.unique_symbol }</b> from <b>{ swapDirection === 'EthereumToAcent' ? transaction.eth_address : transaction.acent_address }</b>
          </Typography>
        </React.Fragment>)
    })
  };

  renderSwapDirection = () => {

    const {
      classes
    } = this.props

    const {
      swapDirection,
      selectedToken
    } = this.state

    let first = 'Acent'
    let second = 'Ethereum'

    if(swapDirection === 'EthereumToAcent') {
      first = 'Ethereum'
      second = 'Acent'
    }

    if(selectedToken && !selectedToken.eth_to_acent_enabled && !selectedToken.acent_to_eth_enabled) {

      return (
        <React.Fragment>
          <Label label={ 'Swap direction' } overrideStyle={ { marginTop: '12px' } } />
          <Typography>No available swaps for selectedToken.symbol</Typography>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <Label label={ 'Swap direction' } overrideStyle={ { marginTop: '12px' } } />
        <Grid item xs={ 5 } onClick={ this.onSwapDirectionClick } className={ classes.gridClick }>
          <div className={ classes.icon }>
            <img
              alt=""
              src={ require('../../assets/images/'+first+'-logo.png') }
              height="50px"
            />
          </div>
          <div className={ classes.iconName }>
            <Typography  variant='h5'>{ first ==='Acent' ? 'BEP2' : 'ERC20' }</Typography>
          </div>
        </Grid>
        <Grid item xs={ 2 } onClick={ this.onSwapDirectionClick } className={ classes.gridClick }>
          <SwapIcon className={ classes.swapDirection } />
        </Grid>
        <Grid item xs={ 5 } align='left' onClick={ this.onSwapDirectionClick } className={ classes.gridClick }>
          <div className={ classes.icon }>
            <img
              alt=""
              src={ require('../../assets/images/'+second+'-logo.png') }
              height="50px"
            />
          </div>
          <div className={ classes.iconName }>
            <Typography  variant='h5'>{ second ==='Acent' ? 'Acent20' : 'ERC20' }</Typography>
          </div>
        </Grid>
      </React.Fragment>
    )
  };

  render() {
    const {
      classes
    } = this.props

    const {
      page,
      loading,
      selectedToken
    } = this.state

    return (
      <Grid container className={ classes.root }>
        { loading && <PageLoader /> }
        { page === 0 && this.renderPage0() }
        { page === 1 && this.renderPage1() }
        { page === 2 && this.renderPage2() }
        <Grid item xs={ 12 } align='right' className={ classes.button }>
          <Button
            fullWidth={true}
            label={ page === 2 ? "Done" : "Next" }
            disabled={ loading || (selectedToken && !selectedToken.eth_to_acent_enabled && !selectedToken.acent_to_eth_enabled) }
            onClick={ this.onNext }
          />
        </Grid>
      </Grid>
    )
  };
}

Swap.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Swap);
