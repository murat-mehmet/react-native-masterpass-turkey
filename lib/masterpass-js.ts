import {MasterPassTurkeyArgs} from "./types/common";

export const service = (args: MasterPassTurkeyArgs) => {
    const {clientId, serviceUrl, userId, token, sendSmsLanguage} = args;
// language=JavaScript
    return `
        function registrationCheck() {
            return new Promise((resolve, reject) => {
                MFS.setClientId('${clientId}');
                MFS.setAddress('${serviceUrl}');

                MFS.checkMasterPass($("#checkMP-form"), function (status, response) {
                    if (response.responseCode == "0000" || response.responseCode == "") {

                        // 1. MasterPass hesabi bulunmayan kullanici (CheckMasterPass => 000000XXXXXXXXXX)
                        if (response.accountStatus.substring(0, 6) == '000000') {
                            return resolve({
                                result: false,
                                action: 'show-mp-option'
                            })
                        }
                        // 2. MasterPass hesabi olup uye isyerinde hic islem yapmamis kullanici (CheckMasterPass => X1100XXXXXXXXXXX)
                        else if (response.accountStatus.substring(1, 6) == '11000') {
                            return resolve({
                                result: true,
                                action: 'link-cards'
                            })
                        }
                        // 3. MasterPass hesabi olup uye isyerinde hesabını ilişkilendirmiş kullanici (CheckMasterPass => X11100XXXXXXXXXX)
                        else if (response.accountStatus.substring(1, 6) == '11100') {
                            return resolve({
                                result: true,
                                action: 'list-cards'
                            })
                        }
                    } else {
                        return reject(new Error(response.responseDescription));
                    }
                });
            })
        }

        function linkCards() {
            return new Promise(async (resolve, reject) => {
                MFS.linkCardToClient($('#linkCardToClient-form'), otpResult(resolve, reject));
            })
        }

        function htmlEntities(str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function listCards() {
            return new Promise(async (resolve, reject) => {
                MFS.listCards('${userId}', '${token}', function (statusCode, response) {
                        if (response.responseCode != "0000" && response.responseCode != "") {
                            if (response.responseCode == "1078") { // Telefon numarası başka kullanıcı tarafından doğrulanmış ve kullanılmış
                                resolve({
                                    result: false,
                                    action: 'hide-mp-option'
                                })
                            } else
                                resolve({
                                    result: false,
                                    action: 'purchase'
                                })

                            return false;
                        }

                        var cards = [];

                        for (var i = 0; i < response.cards.length; i++) {
                            var card = response.cards[i];
                            card.Name = htmlEntities(card.Name);

                            cards.push({
                                bankIca: card.BankIca,
                                cardStatus: card.CardStatus,
                                isMasterPassMember: card.IsMasterPassMember,
                                name: card.Name,
                                productName: card.ProductName,
                                uniqueId: card.UniqueId,
                                maskedCardNumber: card.Value1
                            });
                        }
                        resolve({
                            result: true,
                            action: 'purchase',
                            cards
                        })
                    }
                );
            })
        }

        function deleteCard(cardName) {
            $("#deleteCard-form [name='accountAliasName']").val(cardName);
            return new Promise(async (resolve, reject) => {
                MFS.deleteCard($("#deleteCard-form"), function (statusCode, response) {
                    if (response.responseCode == "0000" || response.responseCode == "") {
                        resolve({
                            result: true
                        })
                    } else {
                        reject(new Error(response.responseDescription));
                    }
                });
            })
        }

        var otpResult = (resolve, reject) => function (statusCode, response) {
            if (response.responseCode == "0000" || response.responseCode == "") {
                return resolve({
                    result: true,
                    action: 'list-cards',
                    token: response.token
                })
            } else {

                if (response.responseCode == "5001") { // Banka OTP form aç
                    return resolve({
                        result: false,
                        action: 'verify-otp',
                        type: 'bank'
                    })
                } else if (response.responseCode == "5008") { // Masterpass OTP sor (GSM doğrulaması mp tarafından yapılıyor)
                    return resolve({
                        result: false,
                        action: 'verify-otp',
                        type: 'mp'
                    })
                } else if (response.responseCode == "5015") { // Mpin form aç
                    return resolve({
                        result: false,
                        action: 'verify-otp',
                        type: 'mpin'
                    })
                } else if (response.responseCode == "5010") { // 3D Secure yönlendirmesi
                    return resolve({
                        result: false,
                        action: 'redirect-3D',
                        url: response.url3D
                    })
                } else { // Hata döndü                
                    reject(new Error(response.responseDescription));
                }
            }
        }

        /*
         *
         * type:
         * NewCardRegistration: 0,
         * WithRegisteredCard: 1,
         * DirectPayment: 2
         */
        var paymentResult = (resolve, reject, type) => function (statusCode, response) {
            if (response.responseCode == "0000" || response.responseCode == "") {
                return resolve({
                    result: true,
                    token: response.token,
                    purchaseType
                })
            } else {

                if (response.responseCode == "5001") { // Banka OTP form aç
                    return resolve({
                        result: false,
                        action: 'verify-otp',
                        type: 'bank'
                    })
                } else if (response.responseCode == "5008") { // Masterpass OTP sor (GSM doğrulaması mp tarafından yapılıyor)
                    return resolve({
                        result: false,
                        action: 'verify-otp',
                        type: 'mp'
                    })
                } else if (response.responseCode == "5015") { // Mpin form aç
                    return resolve({
                        result: false,
                        action: 'verify-otp',
                        type: 'mpin'
                    })
                } else if (response.responseCode == "5010") { // 3D Secure yönlendirmesi
                    return resolve({
                        result: false,
                        action: 'redirect-3D',
                        url: response.url3D
                    })
                } else { // Hata döndü                
                    reject(new Error(response.responseDescription));
                }
            }
        }

        function resendOtp() {
            return new Promise(async (resolve, reject) => {
                const token = MFS.getLastToken();
                MFS.resendOtp(token, '${sendSmsLanguage}', otpResult(resolve, reject));
            })
        }

        function verifyOtp(pin, type) {
            $("#otp-form [name='validationCode']").val(pin);
            $("#otp-form [name='pinType']").val(type == 'mpin' ? 'mpin' : 'otp');
            return new Promise(async (resolve, reject) => {
                MFS.validateTransaction($("#otp-form"), otpResult(resolve, reject));
            })
        }

        function purchaseWithNewCard(args) {
            const {orderNo, referenceNo, amount, installmentCount, additionalParameters, card: {cardHolderName, number, cvc, expMonth, expYear, accountAliasName}, token} = args;
            let expiryDate = expYear.toString();
            if (expMonth < 10)
                expiryDate += '0';
            expiryDate += expMonth.toString();
            $("#payment-form [name='referenceNo']").val(referenceNo.toString());
            $("#payment-form [name='orderNo']").val(orderNo.toString());
            $("#payment-form [name='amount']").val(Math.round(amount * 100).toString());
            $("#payment-form [name='rtaPan']").val(number);
            $("#payment-form [name='expiryDate']").val(expiryDate);
            $("#payment-form [name='cvc']").val(cvc);
            $("#payment-form [name='cardHolderName']").val(cardHolderName);
            $("#payment-form [name='installmentCount']").val(installmentCount.toString());
            if (token)
                $("#payment-form [name='token']").val(token);
            if (accountAliasName) {
                $("#payment-form [name='accountAliasName']").val(accountAliasName);
            }
            $("#payment-form [name='accountAliasName']").prop("disabled", !accountAliasName);
            if (additionalParameters)
                MFS.setAdditionalParameters(additionalParameters);
            return new Promise((resolve, reject) => {
                if (accountAliasName)
                    MFS.purchaseAndRegister($("#payment-form"), paymentResult(resolve, reject, 0));
                else
                    MFS.directPurchase($("#payment-form"), paymentResult(resolve, reject, 2));
            })
        }

        function purchaseWithExistingCard(args) {
            const {orderNo, referenceNo, amount, installmentCount, additionalParameters, cardName, token} = args;
            $("#purchase-form [name='referenceNo']").val(referenceNo.toString());
            $("#purchase-form [name='orderNo']").val(orderNo.toString());
            $("#purchase-form [name='amount']").val(Math.round(amount * 100).toString());
            $("#purchase-form [name='listAccountName']").val(cardName);
            $("#purchase-form [name='installmentCount']").val(installmentCount.toString());
            if (token)
                $("#purchase-form [name='token']").val(token);
              
            if (additionalParameters)
                MFS.setAdditionalParameters(additionalParameters);
            return new Promise(async (resolve, reject) => {
                MFS.purchase($("#purchase-form"), paymentResult(resolve, reject, 1));
            })
        }
    `;
}
