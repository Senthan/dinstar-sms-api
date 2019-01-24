import * as dotenv from 'dotenv';
const envConfig = dotenv.config()
if (envConfig.error) {
  console.log('dotenv err:- ', envConfig.error);
}