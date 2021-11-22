export interface MasterPassTurkeyArgs {
    token: string
    referenceNo: string
    userId: string
    sendSmsLanguage: string
    sendSms: 'N' | 'Y',
    macroMerchantId: string
    clientIp: string
    sdkUrl: string
    clientId: string
    serviceUrl: string
}

export interface RegistrationCheckResult {
    result: boolean,
    action: RegistrationCheckAction
}

export enum RegistrationCheckAction {
    linkCards = 'link-cards',
    listCards = 'list-cards',
    showMpOption = 'show-mp-option'
}

export interface OtpResult {
    result: boolean
    action: OtpAction
    type: OtpType
}

export enum OtpType {
    bank = 'bank',
    masterPass = 'mp',
    mPin = 'mpin',
}

export enum OtpAction {
    verifyOtp = 'verify-otp',
    listCards = 'list-cards',
    redirect3D = 'redirect-3D'
}

export interface CardResult {
    result: boolean
    action: CardAction
    cards: CardModel[]
}

export enum CardAction {
    hideMpOption = 'hide-mp-option',
    purchase = 'purchase',
}

export interface CardModel {
    bankIca: string,
    cardStatus: string,
    isMasterPassMember: 'Y' | 'N',
    name: string,
    productName: string,
    uniqueId: string,
    maskedCardNumber: string
}

export interface DeleteCardResult {
    result: boolean
}

export interface PurchaseNewArgs {
    orderNo: string,
    referenceNo: string,
    amount: number,
    installmentCount: number,
    additionalParameters?: object,
    card: PurchaseCardModel
}

export interface PurchaseExistingArgs {
    orderNo: string,
    referenceNo: string,
    amount: number,
    installmentCount: number,
    additionalParameters?: object,
    cardName: string
}

export type PurchaseArgs = PurchaseNewArgs | PurchaseExistingArgs;

export interface PurchaseCardModel {
    cardHolderName: string,
    number: string,
    cvc: string,
    expMonth: number,
    expYear: number,
    accountAliasName?: string
}

export interface PurchaseResult {
    result: boolean
    action: PurchaseAction
    token: string
    purchaseType: PurchaseType
    type: OtpType
    url: string
}

export enum PurchaseType {
    NewCardRegistration = 0,
    WithRegisteredCard = 1,
    DirectPayment = 2
}

export enum PurchaseAction {
    verifyOtp = 'verify-otp',
    redirect3D = 'redirect-3D'
}
