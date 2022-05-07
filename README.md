# Smart Ropsten – Binance test smartchain Bridge

This project contains cross blockchain bridge implementation, tests for bridge contract with 100% coverage and useful tasks

To send tokens from one blockchain to another, user1 from first blochain calls swap function on bridge contract. SwapInitialized event emited. Then imaginary backend cathes the event. 
Then user2 from second blockchain wants to call redeem function on second network bridge contract and asks backend to sign the request. Backend knows that there was a request and signs request using bridge owner account. Then user2 can call redeem method using the given signature

# Contract addresses
- Bridge on ropsten: `0xf1aed056Fb25e8524B556EC49305930B82B304d7`
- Token on ropsten: `0x7C83EFa2d0090D5aA7858cc889dABf1f10574eAe`

- Bridge on binance smartchain: `0xE0E41444d6BB895eca3D259a1D6Bb6F5c2268F8a`
- Token on binance smartchain: `0x25C7E3a8D6c4Ac82C18C1B983D98E2Cb7e920805`

# Verifications
- Bridge on binance smartchain: https://testnet.bscscan.com/address/0xE0E41444d6BB895eca3D259a1D6Bb6F5c2268F8a#code
- Bridge on ropsten: https://ropsten.etherscan.io/address/0xf1aed056Fb25e8524B556EC49305930B82B304d7#code
# How to deploy

- Ropsten
`npx hardhat run ./scripts/deploy.ts --network ropsten`

- Binance smartchain
`npx hardhat run ./scripts/deploy.ts --network binance_testnet`


# How to verify

- Ropsten
`npx hardhat verify 0xf1aed056Fb25e8524B556EC49305930B82B304d7 --network ropsten 0x7C83EFa2d0090D5aA7858cc889dABf1f10574eAe`

- Binance smartchain
`npx hardhat verify 0xE0E41444d6BB895eca3D259a1D6Bb6F5c2268F8a --network binance_testnet 0x25C7E3a8D6c4Ac82C18C1B983D98E2Cb7e920805`


# How to swap

- Ropsten
`npx hardhat swap --contract-addr 0xf1aed056Fb25e8524B556EC49305930B82B304d7 --to 0x2836eC28C32E232280F984d3980BA4e05d6BF68f --amount 0.1 --network ropsten`

- Binance smartchain
`npx hardhat swap --contract-addr 0xE0E41444d6BB895eca3D259a1D6Bb6F5c2268F8a --to 0x2836eC28C32E232280F984d3980BA4e05d6BF68f --amount 0.1 --network binance_testnet`

# How to redeem

- Binance smartchain
`npx hardhat redeem --contract-addr 0xE0E41444d6BB895eca3D259a1D6Bb6F5c2268F8a --to 0x2836eC28C32E232280F984d3980BA4e05d6BF68f --amount 0.1 --signature 0x8ee055bf08b73eb3c8c6f76b5d7c1494ec98854a691b42c442492cb7e4ffcf4c5cbf16a36291264234321d15f2532350088c16a2be000c353f7ef761a5163bec1b --nonce 0 --network binance_testnet`

- Ropsten
`npx hardhat swap --contract-addr 0xf1aed056Fb25e8524B556EC49305930B82B304d7 --to 0x2836eC28C32E232280F984d3980BA4e05d6BF68f --amount 0.1 --signature 0x8ee055bf08b73eb3c8c6f76b5d7c1494ec98854a691b42c442492cb7e4ffcf4c5cbf16a36291264234321d15f2532350088c16a2be000c353f7ef761a5163bec1b --nonce 0 --network ropsten`
