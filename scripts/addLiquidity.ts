import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  // Define token addresses
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const To = "0x09c5096AD92A3eb3b83165a4d177a53D3D754197";
  // Define the Uniswap router address
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  // Define the address of the holder account for USDC
  const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  // Impersonate the holder account for USDC
  await helpers.impersonateAccount(USDCHolder);
  const impersonatedSigner = await ethers.getSigner(USDCHolder);

  // Define the amount of tokens to swap
  const amountADesired = ethers.parseUnits("200", 6); // 2000 USDC with 6 decimals
  const amountBDesired = ethers.parseUnits("2000000000000000000000", 18);
  const amountAMin = 0;
  const amountBMin = 0;

  // const amountIn = ethers.utils.parseEther("1"); // 1 ETH with 18 decimals

  // Get contract instances
  const USDC = await ethers.getContractAt("IERC20", USDCAddress);
  const DAI = await ethers.getContractAt("IERC20", DAIAddress);
  const WETH = await ethers.getContractAt("IERC20", WETHAddress);
  const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

  // Approve the router to spend USDC on behalf of the holder account
  const approveTx = await USDC.connect(impersonatedSigner).approve(
    UNIRouter,
    amountADesired
  );
  await approveTx.wait();

  const approveTx1 = await DAI.connect(impersonatedSigner).approve(
    UNIRouter,
    amountBDesired
  );
  await approveTx1.wait();

  // Get balances before the swap
  const ethBal = await impersonatedSigner.provider.getBalance(USDCHolder);
  const wethBal = await WETH.balanceOf(impersonatedSigner.address);
  const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
  const daiBal = await DAI.balanceOf(impersonatedSigner.address);

  // Print balances before the swap
  console.log("USDC Balance:", ethers.formatUnits(usdcBal, 6));
  console.log("DAI Balance:", ethers.formatUnits(daiBal, 18));

  // Set the deadline for the swap
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

  // Swap USDC for DAI
  const swapTx = await ROUTER.connect(impersonatedSigner).addLiquidity(
    USDCAddress,
    DAIAddress, // Accept any amount of DAI
    amountADesired,
    amountBDesired, // Path for the swap
    amountAMin,
    amountBMin,
    To,
    deadline
  );
  await swapTx.wait();

  // Get balances after the swap
  const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);
  const to = await USDC.balanceOf(To);

  // Print balances after the swap
  console.log(
    "USDC Balance after swap:",
    ethers.formatUnits(usdcBalAfterSwap, 6)
  );
  console.log(
    "DAI Balance after swap:",
    ethers.formatUnits(daiBalAfterSwap, 18)
  );

  console.log("Balance of sent liquidity account:", to);
};

// Execute the main function and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
