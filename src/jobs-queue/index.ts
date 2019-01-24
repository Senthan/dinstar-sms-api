
import { SmsRepository } from './repository/postgres/sms/sms.repository';
import { ISmsRepository } from './repository/sms';

let smsRepository: ISmsRepository  = new SmsRepository('192.168.10.229', 'admin', 'admin');

smsRepository.sendSms('91441981', 'Hi there! ', '1', [0,1,2,3,4,5,6,7,16,17,18,19,20,21,22,23], null)

export class JobQueueService {
}