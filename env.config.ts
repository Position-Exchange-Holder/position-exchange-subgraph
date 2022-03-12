import { config as configDotenv } from 'dotenv'
import { resolve } from 'path'

switch(process.env.NODE_ENV) {
  case 'production':
    configDotenv({
      path: resolve(__dirname, './.env')
    })
    break
  case 'dev':
    configDotenv({
      path: resolve(__dirname, './.env.example')
    })
    break
  case 'test':
    configDotenv({
      path: resolve(__dirname, './.env.test')
    })
    break
  default:
    throw new Error(`'NODE_ENV' ${process.env.NODE_ENV} is not handled`)
}
