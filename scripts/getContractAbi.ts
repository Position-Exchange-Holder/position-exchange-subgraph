import fs from 'fs'
import axios from 'axios'
import '../env.config'

const BSC_API = process.env.BSC_API || 'https://api.bscscan.com/api'
const BSC_API_KEY = process.env.BSC_API_KEY || ''

async function getContractAbi (contractAddress?: string, contractName?: string) {
  contractAddress = contractAddress ? contractAddress : process.argv[2]
  contractName = contractName ? contractName : process.argv[3]
  console.log(contractAddress, contractName)

  if (!BSC_API_KEY || BSC_API_KEY === 'YOUR_BSC_API_KEY') { 
    console.error('[ERROR] Missing BSC_API_KEY')
    return
  }

  try {
    const res = await axios.get(
      `${BSC_API}?module=contract&action=getabi&address=${contractAddress}&apikey=${BSC_API_KEY}`
    )
    
    if (res.data?.message === 'NOTOK') {
      console.error('[ERROR] Fail')
      return
    }

    const abi = res.data?.result
    const abiFilePath = `./${contractName ? contractName : contractAddress}.json`
    fs.writeFileSync(abiFilePath, abi)
    console.log(`Done: ${abiFilePath}`)
  } catch (error) {
    console.error(error)
  }
}

getContractAbi()
