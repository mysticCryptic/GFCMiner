import { Button, ButtonGroup } from 'react-bootstrap';
import { ethers } from "ethers";
import { useState } from "react";
import MinerContract from "./artifacts/contracts/MinerContract.sol/MinerContract.json";
import CoinContract from "./artifacts/contracts/GalaxyFuelCoin.json";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'sf-font';
import { TASK_COMPILE_SOLIDITY_LOG_RUN_COMPILER_END } from 'hardhat/builtin-tasks/task-names';

const minerAddress = "0x1BbE23f1fE058769Af9132AeEf021905fdBDdE6f";
const coinAddress = "0xEc0f013A108d3639219Fa8210D5c7435E112332F";

function App() {

  //property variables
  const [message, setEggs] = useState("");
  const [currentMiners, setMiners] = useState("");
  const [userAddress, setAddress] = useState("Please Connect Wallet");
  const [status, setStatus] = useState("Connect Your Wallet");



  //request access to metamask accounts
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    setAddress(signerAddress);
    setStatus('Connected');

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
        console.log("balance: ", newBalance);
        console.log("allowance: ", newAllowance);
        if (balance==allowance || balance>allowance){
          console.log("nigger");
          const approval = await contract2.approve(minerAddress, balance);
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

  async function fetchMiners() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(minerAddress, MinerContract.abi, provider)
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      try {
        const data = await contract.getMyMiners(signerAddress);
        const newData = Number(data);
        console.log("data: ", newData);
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
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = signer.getAddress();

        const contract = new ethers.Contract(minerAddress, MinerContract.abi, signer);
        const newAmount = ethers.utils.parseUnits(message, 18);
        const transaction = await contract.buyEggs(signerAddress, newAmount);

        setEggs("");

        //waits for transaction to finish and logs new minertotal

        await transaction.wait();
        fetchMiners();
        console.log(transaction);
        /*print total miners
        const miners = await contract.getMyMiners(signerAddress);
        const newMiners = Number(miners);
        console.log(newMiners);
        */
      }
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
              <h1 className="pt-2" style={{ fontWeight: "30" }}>Galaxy Fuel Miner</h1>
            </div>
            <h3># of miners</h3>
            <div>
              # of GFC to compound or collect
              <Button className="button-style m-1" style={{ border: "0.2px", borderRadius: "14px", boxShadow: "1px 1px 5px #000000" }}>
                Compound
              </Button>
              <Button className="button-style m-1" style={{ border: "0.2px", borderRadius: "14px", boxShadow: "1px 1px 5px #000000" }}>
                Sell Miners
              </Button>

              //testing approval
              <Button className="button-style m-1" onClick={initCoin} style={{ border: "0.2px", borderRadius: "14px", boxShadow: "1px 1px 5px #000000" }}>
                approve
              </Button>

            </div>
          </div>
          <div>
            <label style={{ fontWeight: "300", fontSize: "18px" }}>Purchase Miners</label>
          </div>
          <input type="text" placeholder='0 '/>
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
