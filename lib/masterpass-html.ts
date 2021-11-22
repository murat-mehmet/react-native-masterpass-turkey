import {service} from "./masterpass-js";
import {executor} from "./webview-executor";
import {MasterPassTurkeyArgs} from "./types/common";

export const masterPassHTML = (args: MasterPassTurkeyArgs) => {
    const {token, referenceNo, userId, sendSms, sendSmsLanguage, macroMerchantId, clientIp, sdkUrl} = args;
    return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <title>MFS Javascript client library</title>
    <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    <meta content="utf-8" http-equiv="encoding">
    <script src="${sdkUrl}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
</head>
<body>
<form action="" method="POST" id="checkMP-form" style="display: none">
    <input type="hidden" name="userId" value="${userId}" />
    <input type="hidden" name="token" value="${token}" />
    <input type="hidden" name="referenceNo" value="${referenceNo}" />
    <input type="hidden" name="sendSmsLanguage" value="${sendSmsLanguage}" />
    <input type="hidden" name="sendSms" value="${sendSms}" />
</form>

<form action="" method="POST" id="linkCardToClient-form" style="display:none;">
    <input type="hidden" name="msisdn" value="${userId}" />
    <input type="hidden" name="token" value="${token}" />
    <input type="hidden" name="referenceNo" value="${referenceNo}" />
    <input type="hidden" name="sendSmsLanguage" value="${sendSmsLanguage}" />
    <input type="hidden" name="sendSms" value="${sendSms}" />
</form>

<form action="" method="POST" id="deleteCard-form" style="display:none;">
    <input type="hidden" name="accountAliasName" value="" />
    <input type="hidden" name="msisdn" value="${userId}" />
    <input type="hidden" name="token" value="${token}" />
    <input type="hidden" name="referenceNo" value="${referenceNo}" />
    <input type="hidden" name="sendSmsLanguage" value="${sendSmsLanguage}" />
    <input type="hidden" name="sendSms" value="${sendSms}" />
</form>

<form action="" method="POST" id="otp-form" style="display:none">
    <input type="hidden" name="validationCode" value="" />
    <input type="hidden" name="referenceNo" value="${referenceNo}" />
    <input type="hidden" name="sendSmsLanguage" value="${sendSmsLanguage}" />
    <input type="hidden" name="sendSms" value="${sendSms}" />
    <input type="hidden" name="pinType" value="" />
</form>

<form action="" method="POST" id="payment-form" style="display:none">
    <input type="hidden" name="cardHolderName" value="" />
    <input type="hidden" name="expiryDate" value="" />
    <input type="hidden" name="cvc" value="" />
    <input type="hidden" name="rtaPan" value="" />
    
    <input type="hidden" name="amount" value="" />
    <input type="hidden" name="msisdn" value="${userId}" />
    <input type="hidden" name="token" value="${token}" />
    <input type="hidden" name="referenceNo" value="${referenceNo}" />
    <input type="hidden" name="sendSmsLanguage" value="${sendSmsLanguage}" />
    <input type="hidden" name="sendSms" value="${sendSms}" />
    <input type="hidden" name="macroMerchantId" value="${macroMerchantId}" />
    <input type="hidden" name="orderNo" value="" />
    <input type="hidden" name="actionType" value="A" />
    <input type="hidden" name="installmentCount" value="" />
    <input type="hidden" name="accountAliasName" value="" />
    
</form>
<form action="" method="POST" id="purchase-form" style="display:none">
    <input type="hidden" name="amount" value="" />
    <input type="hidden" name="listAccountName" value="" />
    <input type="hidden" name="msisdn" value="${userId}" />
    <input type="hidden" name="token" value="${token}" />
    <input type="hidden" name="referenceNo" value="${referenceNo}" />
    <input type="hidden" name="sendSmsLanguage" value="${sendSmsLanguage}" />
    <input type="hidden" name="sendSms" value="${sendSms}" />
    <input type="hidden" name="macroMerchantId" value="${macroMerchantId}" />
    <input type="hidden" name="orderNo" value="" />
    <input type="hidden" name="installmentCount" value="" />
    <input type="hidden" name="aav" value="aav" />
    <input type="hidden" name="clientIp" value="${clientIp}" />
    <input type="hidden" name="encCPin" value="0" />
    <input type="hidden" name="encPassword" value="" />
    <input type="hidden" name="sendSmsMerchant" value="N" />
    <input type="hidden" name="password" value="" />
</form>

<script>${executor}</script>
<script>${service(args)}</script>
<script>
    $( document ).ready(function() {
        RN.publish({status: 'ready'})
    });
</script>
</body>
</html>
`;
}
