# Smart Ropsten – Binance test smartchain Bridge

This project contains cross blockchain bridge implementation, tests for bridge contract with 100% coverage and useful tasks

To send tokens from one blockchain to another, user1 from first blochain calls swap function on bridge contract. SwapInitialized event emited. Then imaginary backend cathes the event. 
Then user2 from second blockchain wants to call redeem function on second network bridge contract and asks backend to sign the request. Backend knows that there was a request and signs request using bridge owner account. Then user2 can call redeem method using the given signature

Contract addresses
- Bridge on ropsten: `0xef0Db8ce2035CCd1a793012af7385D66493C449c`
- Token on ropsten: `0x6B16Fd7A190381C3b70fe36Bfc7D01FD61980d58`

- Bridge on binance smartchain: `0x19A45D748AafDB240517550b7fB40f2E843608B4`
- Token on binance smartchain: `0x0731104CCeF151B60F4118F039B43ce5cc573d3F`

Verifications
- Bridge on binance smartchain: https://testnet.bscscan.com/address/0x19A45D748AafDB240517550b7fB40f2E843608B4#code
- Bridge on ropsten: https://ropsten.etherscan.io/address/0xef0Db8ce2035CCd1a793012af7385D66493C449c#code

How to deploy
- Ropsten
`npx hardhat run ./scripts/deploy.ts --network ropsten`

- Binance smartchain
`npx hardhat run ./scripts/deploy.ts --network binance_testnet`

How to verify

- Ropsten
`npx hardhat verify 0xef0Db8ce2035CCd1a793012af7385D66493C449c --network ropsten 3`

- Binance smartchain
`npx hardhat verify 0x19A45D748AafDB240517550b7fB40f2E843608B4 --network binance_testnet 97`


How to swap

- Ropsten
`npx hardhat swap --contract-addr 0xef0Db8ce2035CCd1a793012af7385D66493C449c --token-addr 0x6B16Fd7A190381C3b70fe36Bfc7D01FD61980d58 --to 0x2836eC28C32E232280F984d3980BA4e05d6BF68f --amount 0.1 --network ropsten`

- Binance smartchain
`npx hardhat swap --contract-addr 0x19A45D748AafDB240517550b7fB40f2E843608B4 --token-addr 0x0731104CCeF151B60F4118F039B43ce5cc573d3F --to 0x2836eC28C32E232280F984d3980BA4e05d6BF68f --amount 0.1 --network binance_testnet`

How to redeem

- Binance smartchain
`npx hardhat redeem --contract-addr 0x19A45D748AafDB240517550b7fB40f2E843608B4 --token-to-redeem 0x0731104CCeF151B60F4118F039B43ce5cc573d3F --to 0x2836eC28C32E232280F984d3980BA4e05d6BF68f --amount 0.1 --signature 0x8ee055bf08b73eb3c8c6f76b5d7c1494ec98854a691b42c442492cb7e4ffcf4c5cbf16a36291264234321d15f2532350088c16a2be000c353f7ef761a5163bec1b --nonce 0 --target-chain-id 97 --network binance_testnet`

- Ropsten
`npx hardhat swap --contract-addr 0xef0Db8ce2035CCd1a793012af7385D66493C449c --token-to-redeem 0x6B16Fd7A190381C3b70fe36Bfc7D01FD61980d58 --to 0x2836eC28C32E232280F984d3980BA4e05d6BF68f --amount 0.1 --signature 0x8ee055bf08b73eb3c8c6f76b5d7c1494ec98854a691b42c442492cb7e4ffcf4c5cbf16a36291264234321d15f2532350088c16a2be000c353f7ef761a5163bec1b --nonce 0 --target-chain-id 3 --network ropsten`

How to allow chain id

- Binance smartchain
`npx hardhat updateChainById --contract-addr 0x19A45D748AafDB240517550b7fB40f2E843608B4 --target-chain-id 97 --is-allowed true --network binance_testnet`

- Ropsten
`npx hardhat updateChainById --contract-addr 0xef0Db8ce2035CCd1a793012af7385D66493C449c --target-chain-id 3 --is-allowed true --network ropsten`

How to include token

- Binance smartchain
`npx hardhat includeToken --contract-addr 0x19A45D748AafDB240517550b7fB40f2E843608B4 --token-to-burn 0x0731104CCeF151B60F4118F039B43ce5cc573d3F --token-to-mint 0x6B16Fd7A190381C3b70fe36Bfc7D01FD61980d58 --network binance_testnet`

- Ropsten
`npx hardhat includeToken --contract-addr 0xef0Db8ce2035CCd1a793012af7385D66493C449c --token-to-burn 0x6B16Fd7A190381C3b70fe36Bfc7D01FD61980d58 --token-to-mint 0x0731104CCeF151B60F4118F039B43ce5cc573d3F --network ropsten`

How to exclude token

- Binance smartchain
`npx hardhat excludeToken --contract-addr 0x19A45D748AafDB240517550b7fB40f2E843608B4 --token-to-exclude 0x0731104CCeF151B60F4118F039B43ce5cc573d3F --network binance_testnet`

- Ropsten
`npx hardhat excludeToken --contract-addr 0xef0Db8ce2035CCd1a793012af7385D66493C449c --token-to-exclude 0x6B16Fd7A190381C3b70fe36Bfc7D01FD61980d58 --network ropsten`
