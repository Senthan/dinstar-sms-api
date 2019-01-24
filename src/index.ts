import { JobQueueService } from './jobs-queue';
import * as dotenv from 'dotenv';
const envConfig = dotenv.config()
const jobQueue = new JobQueueService();




