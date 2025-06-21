import { http, createConfig } from 'wagmi'
import { localhost, mainnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains: [localhost, mainnet],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [localhost.id]: http('http://localhost:8545'),
    [mainnet.id]: http(),
  },
})

export const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337') 