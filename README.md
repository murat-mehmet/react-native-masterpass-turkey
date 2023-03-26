# React Native Masterpass Turkey

Masterpass Turkey implementation for React Native using its JS SDK. This project uses WebView component from react-native-webview to implement the sdk. 

## Installation 
```sh
npm install react-native-masterpass-turkey --save
yarn add react-native-masterpass-turkey
```

Also make sure you have `react-native-webview` peer dependency installed
```sh
npm install react-native-webview --save
yarn add react-native-webview
```
## Usage
```javascript
import React, {Component} from 'react';
import {MasterPassTurkey} from 'react-native-masterpass-turkey';

@observer
export class App extends Component {
    masterpass;

    onMpEvent = async (data) => {
        if (data.status === 'ready') {
            // ready to check mp registration
        }
    }
    
    render() {
        return (
            <MasterPassTurkey
                ref={c => this.masterpass = c}
                token='server generated token'
                referenceNo='server generated ref number'
                userId='905441231212'
                sendSmsLanguage='tur'
                sendSms='N'
                clientId='1234567'
                sdkUrl='https://www.yoursite.com.tr/Scripts/MasterPass/mfs-client.min.js'
                jqueryUrl='https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'
                serviceUrl='https://ui.masterpassturkiye.com/v2'
                macroMerchantId='1234567123456'
                clientIp='123.12.12.123'
                onEvent={this.onMpEvent} />
        )
    }

}
```
## Example

Check [MasterPassExample.js][l] for a full implementation of sdk

## Methods

| Method                  | Arguments                                                                 | Description                                      |    Returns
| ------------            | ---------------                                                           | ------------------                               | ----------------------------------------------------------------------------------------------------------------------------------------- 
| registrationCheck()     | none                                                                      | Checks mp account status.                        | `{result: boolean, action: 'link-cards' or 'list-cards' or 'show-mp-option'}`
| linkCards()             | none                                                                      | Links customer account with mp cards.            | `{result: boolean, action: 'verify-otp' or 'list-cards', type: 'bank' or 'mp'}`                                                                                                                                  
| listCards()             | none                                                                      | Lists customer mp cards.                         | `{result: boolean, action: 'hide-mp-option' or 'purchase', cards: {bankIca, cardStatus, isMasterPassMember, name, productName, uniqueId, maskedCardNumber}[]}`                             
| deleteCard(cardName)    | name field of the card                                                    | Deletes a card from mp                           | `{result: boolean}`                             
| resendOtp()             | none                                                                      | Resends one time password                        | `{result: boolean, action: 'verify-otp' or 'list-cards', type: 'bank' or 'mp' or 'mpin'}`                             
| verifyOtp(code, type)   | code is entered by user, type comes from result with 'verify-otp' action  | Verify on time password                          | `{result: boolean, action: 'verify-otp' or 'list-cards', type: 'bank' or 'mp' or 'mpin'}`                             
| purchase(args)          | `{orderNo: string, referenceNo: string, amount: number, installmentCount: number, additionalParameters: object, cardName: string OR card: {number: string, cvc: string, expMonth: number, expYear: number, accountAliasName?: string }}` | Makes a purchase                | `{result: boolean, action: 'verify-otp' or 'redirect-3D', token: string, type: type: 'bank' or 'mp' or 'mpin', url: string}`


## Test 
```sh
npm run test
```

[l]: https://github.com/murat-mehmet/react-native-masterpass-turkey/blob/HEAD/example/MasterPassExample.js
