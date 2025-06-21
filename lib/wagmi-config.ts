import { http, createConfig } from "wagmi"
import { sepolia } from "wagmi/chains"
import { injected, metaMask, walletConnect } from "wagmi/connectors"

// Pastikan Anda memiliki NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID di .env.local
// Dapatkan dari https://cloud.walletconnect.com/
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

export const config = createConfig({
  chains: [sepolia], // Anda bisa menambahkan chain lain seperti mainnet, polygon, dll.
  connectors: [
    injected(), // Untuk dompet yang terinject seperti MetaMask
    metaMask(),
    walletConnect({ projectId: walletConnectProjectId }),
  ],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
        : undefined,
    ),
    // Tambahkan transport untuk chain lain jika diperlukan
  },
})
