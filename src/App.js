import { Button, ButtonGroup } from 'react-bootstrap';
import { ethers } from "ethers";
import { useState } from "react";
import MinerContract from "./artifacts/contracts/MinerContract.sol/MinerContract.json";
import CoinContract from "./GalaxyFuelCoin.json";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'sf-font';
import { TASK_COMPILE_SOLIDITY_LOG_RUN_COMPILER_END } from 'hardhat/builtin-tasks/task-names';

const minerAddress = "0x569c244A2C7eD172c091DA803aDa768488B885AF";
const coinAddress = "0x299051d2Fb9ef61e7b387D56cef3889BdA6fc9d6";

function App() {

  //property variables
  const [message, setEggs] = useState("");
  const [currentMiners, setMiners] = useState("# of ");
  const [userAddress, setAddress] = useState("Please Connect Wallet");
  const [status, setStatus] = useState("Connect Your Wallet");
  const [tokenBalance, setBalance] = useState("");
  const [minedTokens, updatePending] = useState("");



  //request access to metamask accounts
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    setAddress(signerAddress);
    setStatus('Connected');
    fetchData();
  }

  //initialize coin contract and check permisions
  async function initCoin() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(coinAddress, CoinContract.abi, provider)
      const contract2 = new ethers.Contract(coinAddress, CoinContract.abi, signer)
      const signerAddress = await signer.getAddress();

      try {
        const balance = await contract.balanceOf(signerAddress);
        const newBalance = Number(balance);
        const allowance = await contract.allowance(signerAddress, minerAddress);
        const newAllowance = Number(allowance);
        //const newAllowance = Number(allowance);
        setBalance(newBalance/(10**9));
        console.log(newBalance, newAllowance)
        if (newBalance!=newAllowance || newBalance>newAllowance){
          const approval = await contract2.approve(minerAddress, (balance * 2));
        } else {
          console.log('allowance is chilling')
        }

      } catch (error) {
        console.log('Error: ', error);
      }
    }
  }

  //helper functions

  //fetch current values stored in contract

  async function fetchData() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(minerAddress, MinerContract.abi, provider)
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      try {
        const data = await contract.getMyMiners(signerAddress);
        const newData = Number(data);

        const eggs = await contract.getEggsSinceLastHatch(signerAddress);
        const pending = await contract.calculateEggSell(eggs);
        updatePending((Number(pending)/10**9));
        //console.log("data: ", newData);
        setMiners(newData);
        setAddress(signerAddress);
      } catch (error) {
        console.log('Error: ', error);
      }
    }
  }


  async function buyMiners() {
    if (message !== "") {
      if (typeof window.ethereum !== "undefined") {
        await requestAccount();
        await initCoin();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = signer.getAddress();

        const contract = new ethers.Contract(minerAddress, MinerContract.abi, signer);
        const newAmount = ethers.utils.parseUnits(message, 9);
        const transaction = await contract.buyEggs(signerAddress, newAmount);

        setEggs("");

        //waits for transaction to finish and logs new minertotal

        await transaction.wait();
        fetchData();
        console.log(transaction);
        /*print total miners
        const miners = await contract.getMyMiners(signerAddress);
        const newMiners = Number(miners);
        console.log(newMiners);
        */
      }
    }
  }

  async function sellMiners() {
      if (typeof window.ethereum !== "undefined") {
        console.log("cum")
        await requestAccount();
        await initCoin();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = signer.getAddress();

        const contract = new ethers.Contract(minerAddress, MinerContract.abi, signer);
        const transaction = await contract.sellEggs();
        await transaction.wait();
        fetchData();
        console.log(transaction);
        /*print total miners
        const miners = await contract.getMyMiners(signerAddress);
        const newMiners = Number(miners);
        console.log(newMiners);
        */
      }
    
  }

  async function compound() {
      if (typeof window.ethereum !== "undefined") {
        await requestAccount();
        await initCoin();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = signer.getAddress();

        const contract = new ethers.Contract(minerAddress, MinerContract.abi, signer);
        const transaction = await contract.hatchEggs(signerAddress);
        await transaction.wait();
        fetchData();
      }
    
  }
  return (
    <div className="minerapp">
      <nav className="navbar navbarfont navbar-expand-md navbar-dark bg-transparent mb-4">
        <div className="container-fluid" style={{ fontFamily: "SF Pro Display" }}>
          <a className="navbar-brand px-5" style={{ fontWeight: "800", fontSize: '25px' }} href="#"></a><img src="galaxylogo.png" width="8%" />
          <button className="navbar-toggler" type="button" onClick={requestAccount} data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 px-3 mb-md-0" style={{ fontSize: "25px" }}>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">Token Miner</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Token Site</a>
              </li>
              <li className="nav-item">
                <a className="nav-link">Documentation</a>
              </li>
            </ul>
          </div>
        </div>
        <div className='px-5'>
          <input id="connectbtn" type="button" className="connectbutton" onClick={requestAccount} style={{ fontFamily: "SF Pro Display" }} value={status} />
        </div>
      </nav>
      <div className='container'>
        <div className='col minerform'>
        <form>
          <div className="row pt-3">
            <div>
              <h1 className="pt-2" style={{ fontWeight: "30" }}>Gulaxy Fuel Miner</h1>
            </div>
            <h3>{currentMiners} Fuel Harvesters</h3>
            <div>
            <div className ="bold">
              <label> Your Balance: {tokenBalance} GFC</label>
              </div>
              <div>
                <label className='bold'>Tokens to Collect: {minedTokens}</label>
              </div>
              <div>
              <Button className="button-style m-1" onClick={compound} style={{ border: "0.2px", borderRadius: "14px", boxShadow: "1px 1px 5px #000000" }}>
                Compound
              </Button>
              <Button className="button-style m-1" onClick={sellMiners} style={{ border: "0.2px", borderRadius: "14px", boxShadow: "1px 1px 5px #000000" }}>
                Sell Miners
              </Button>
              <Button className="button-style m-1" onClick={initCoin} style={{ border: "0.2px", borderRadius: "14px", boxShadow: "1px 1px 5px #000000" }}>
                approve
              </Button>
              </div>
              </div>
            </div>
          <div>
            <label style={{ fontWeight: "300", fontSize: "18px" }}>Purchase Miners</label>
          </div>
          <input onChange={(e) => setEggs(e.target.value)} value={message} type="text" placeholder='0 '/>
          <label> GFC</label>
          <div className="row px-2 pb-2 row-style">
            <div>
              <Button className="button-style" onClick={buyMiners} style={{ border: "0.2px", borderRadius: "14px", boxShadow: "1px 1px 5px #000000" }}>
                Buy Miners
              </Button>
            </div>
          </div>
          <h6>Your Wallet Address</h6>
            <div className="pb-3" id='wallet-address' style={{
              color: "#39FF14",
              fontWeight: "400",
              textShadow: "1px 1px 1px black",
            }}>
              <label>{userAddress}</label>
            </div>
        </form> 
      </div>
      </div>
    </div>
  )
}

export default App;
