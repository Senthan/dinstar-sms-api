export interface ISmsRepository {
    addToOutgoing(messageId: any, addToFront: any): void;
    sendSms(number: any, message: any, messageId: any, sendToSim: any, encoding: any): void;
    registerForOutgoingSmsResult(): void;
    unregisterForOutgoingSmsResult(): void;
    registerForIncomingSms(): void;
    unregisterForIncomingSms(): void;
    queryOutgoingSmsResult(messageId: any, that: any): void;
}