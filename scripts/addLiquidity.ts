import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const wethAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(USDCHolder);
  const impersonatedSigner = await ethers.getSigner(USDCHolder);

  const amountOut = ethers.parseUnits("2000", 6);
  const amountIn = ethers.parseEther("1");

  const USDC = await ethers.getContractAt("IERC20", USDCAddress);
  const DAI = await ethers.getContractAt("IERC20", DAIAddress);
  const WETH = await ethers.getContractAt("IERC20", wethAdress);

  const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

  const approveTx = await USDC.connect(impersonatedSigner).approve(
    UNIRouter,
    amountOut
  );
  await approveTx.wait();

  const ethBal = await impersonatedSigner.provider.getBalance(USDCHolder);
  const wethBal = await WETH.balanceOf(impersonatedSigner.address);

  const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
  const daiBal = await DAI.balanceOf(impersonatedSigner.address);

  // console.log("WETH Balance:", ethers.formatUnits(wethBal, 18));
  // console.log("ETH Balance:",ethers.formatUnits(ethBal, 18));
  console.log("USDC Balance:", ethers.formatUnits(usdcBal, 6));
  console.log("DAI Balance:", ethers.formatUnits(daiBal, 18));

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // const swapTx = await ROUTER.swapTokensForExactETH(
  //     amountOut,
  //     amountIn,
  //     [USDCAddress, wethAdress],
  //     impersonatedSigner.address,
  //     deadline
  // );

  const swapTx = await ROUTER.connect(
    impersonatedSigner
  ).swapExactTokensForTokens(
    amountOut,
    0,
    [USDCAddress, DAIAddress],
    impersonatedSigner.address,
    deadline
  );

  await swapTx.wait();

  // Uncomment this if you are using the swap tokens for ETH
  // const ethBalAfterSwap = await impersonatedSigner.provider.getBalance(USDCHolder);
  // const wethBalAfterSwap = await WETH.balanceOf(impersonatedSigner.address);

  const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);

  console.log(
    "-----------------------------------------------------------------"
  );

  // Uncomment this if you are using the swap tokens for ETH
  // console.log("weth balance before swap", ethers.formatUnits(wethBalAfterSwap, 18));
  // console.log("eth balance after swap", ethers.formatUnits(ethBalAfterSwap, 18));

  console.log(
    "usdc balance after swap",
    ethers.formatUnits(usdcBalAfterSwap, 6)
  );
  console.log(
    "dai balance after swap",
    ethers.formatUnits(daiBalAfterSwap, 18)
  );

  /*

    console.log("usdc balance before swap", Number(usdcBal._hex));
    // console.log("weth balance before swap", Number(wethBal._hex));
    console.log("eth balance before swap", Number(ethBal._hex));
    */
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
