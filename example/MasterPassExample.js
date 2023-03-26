import moment from "moment";
import React, { Component, useCallback } from "react";
import { Button, Image, Linking, Text, TextInput, TouchableOpacity, View } from "react-native";
import DialogInput from "react-native-dialog-input";
import { CardAction, MasterPassTurkey, OtpAction, PurchaseAction, RegistrationCheckAction } from "react-native-masterpass-turkey";
import RNPickerSelect from "react-native-picker-select";

class MasterPassExample extends Component {
  state = {
    name: "",
    card: "",
    month: "",
    year: "",
    cvc: "",
    bin: "",
    mpHasAccount: false,
    mpIsLinked: false,
    mpCards: [],
    mpCardSelected: 0,
    mpCanShowSave: false,
    mpSave: false,
    mpCardAlias: "",
    smsDialog: false,
    sentTime: 0,
    timerCount: 0,
  };

  masterpass;
  smsPromiseResolve;
  timer;

  checkMasterpass = async () => {
    // check registration
    const check = await this.masterpass.registrationCheck();

    // is user already authorized to list cards
    const isActionListCards = check.action === RegistrationCheckAction.listCards;
    this.setState({
      mpHasAccount: check.result,
      mpIsLinked: isActionListCards,
      mpCanShowSave: true,
    });

    // list masterpass cards
    if (check.result && isActionListCards) {
      return this.listMasterpassCards().catch(console.warn);
    }
  };

  listMasterpassCards = async () => {
    // list cards
    const result = await this.masterpass.listCards();

    // phone number was verified by another account
    if (result.action === CardAction.hideMpOption) {
      this.setState({
        mpCanShowSave: false,
      });
    }

    // set card list and select first card
    this.setState({ mpCards: result.cards || [], mpIsLinked: true }, () => {
      this.mpCardSelected(result.cards?.length ? 0 : -1);
    });
  };

  linkMasterpass = async () => {
    // link user cards to this account
    const result = await this.masterpass.linkCards().catch(e => e);

    // handle error
    if (result instanceof Error) {
      alert(result.message);
      return;
    }

    // handle next action
    switch (result.action) {

      // otp is required
      case OtpAction.verifyOtp:

        // get otp from user
        const code = await this.getOtpCode();
        if (!code) {
          // cancel purchase
          return;
        }

        // verify otp
        const verifyResult = await this.masterpass.verifyOtp(code, result.type).catch(e => e);

        // handle otp error
        if (verifyResult instanceof Error) {
          return alert(verifyResult.message);
        }

        // handle next action
        if (verifyResult.action === OtpAction.listCards) {

          // otp verification was success, now we can list cards
          return this.listMasterpassCards().catch(console.warn);
        }
        break;
      case OtpAction.listCards:

        // we are ready to list cards
        return this.listMasterpassCards().catch(console.warn);
    }
  };

  resendOtp = () => {
    this.setState({
      sentTime: Date.now(),
    }, () => this.masterpass.resendOtp().catch(console.warn));
  };
  getOtpCode = async () => {
    return new Promise(async resolve => {

      // we set a timer limit of 5 minutes to enter otp password
      if (!this.timer) {
        clearInterval(this.timer);
        const f = () => {
          const timerCount = (moment.duration(5, "minutes").asMilliseconds() - (Date.now() - this.state.sentTime)) / 1000;
          if (timerCount <= 0) {
            // timer reached zero, close sms dialog
            clearInterval(this.timer);
            this.timer = null;
            this.setState({ smsDialog: false });
            return resolve(false);
          }
          this.setState({
            timerCount,
          });
        };
        this.timer = setInterval(f, 1000);

        await this.setState({
          sentTime: Date.now(),
        }, f);
      }

      // set resolve function to be called when user submits otp
      this.smsPromiseResolve = (code) => {

        this.setState({ smsDialog: false });
        if (code) {
          clearInterval(this.timer);
          this.timer = null;
        }
        resolve(code);
      };
      this.setState({ smsDialog: true });
    });
  };


  mpCardSelected = async (index) => {
    this.setState({ mpCardSelected: index });

    let bin = "";
    if (index > -1) {
      const card = this.state.mpCards[index];
      bin = card.maskedCardNumber.substring(0, 8);
      if (isNaN(+bin))
        bin = card.maskedCardNumber.substring(0, 7);
      if (isNaN(+bin))
        bin = card.maskedCardNumber.substring(0, 6);
    }
    const oldBin = this.state.bin;
    this.setState({ bin });
    if (bin !== oldBin) {
      // do something with bin, query your server to get installments, card info etc.
    }
  };

  cardChanged = async (v) => {
    let bin = "";
    if (v.replace(" ", "").length >= 8) {
      bin = v.replace(" ", "").substring(0, 8);
    }
    const oldBin = this.state.bin;
    this.setState({ card: v, bin });
    if (bin !== oldBin) {
      // do something with bin, query your server to get installments, card info etc.
    }
  };

  get canResend() {
    return this.state.timerCount < moment.duration(5, "minutes").add(-30, "seconds").asSeconds();
  }

  // should display a checkbox about saving user card in masterpass
  get showMpSave() {
    return this.state.mpCanShowSave && (!this.state.mpHasAccount || this.state.mpIsLinked);
  }

  // should display a card form for user
  get displayCardForm() {
    return !this.state.mpCards.length || this.state.mpCardSelected === -1;
  }

  mpCardImageFromBin(binNumber) {
    switch (binNumber) {
      case "2110":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0046.png";
      case "2030":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0062.png";
      case "3771":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0064.png";
      case "1684":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0111.png";
      case "9165":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0032.png";
      case "3039":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0012.png";
      case "7656":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0123.png";
      case "2117":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0067.png";
      case "2119":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0015.png";
      case "15140":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0012.png";
      case "2374":
        return "https://raw.githubusercontent.com/oseyf/bank-ica-css/main/bank-logo-0010.png";
      default:
        return null;
    }
  }

  mpDeleteCard = async (card) => {
    this.masterpass.deleteCard(card.name).then(() => {
      alert("Kartınız başarıyla silindi");
      return this.listMasterpassCards();
    }).catch(e => {
      alert(e.message);
    });
  };

  onMpEvent = async (data) => {
    // we are ready to check masterpass status
    if (data.status === "ready")
      return this.checkMasterpass().catch(console.warn);
  };

  purchase = async () => {
    // card for was displayed
    if (this.displayCardForm) {
      // validate card details
      if (this.state.card.length !== 19)
        return alert("Kart numaranızı giriniz");
      if (this.state.month === "")
        return alert("Kartın bitiş ayını giriniz");
      if (this.state.year === "")
        return alert("Kartın bitiş yılını giriniz");
      if (this.state.cvc === "")
        return alert("Kartın cvc kodunu giriniz");
      if (this.state.mpSave && (!this.state.mpCardAlias || this.state.mpCardAlias.length < 3))
        // validate card alias
        return alert("Lütfen minumum 3 karakterli kart adını giriniz.");
    }

    // here get order number and other details from your server
    const orderNo = "1234";
    const referenceNo = "server generated ref number";
    const totalAmount = 100;
    const installment = 1;
    const returnUrl = "https://your.website.com/purchase/callback";

    const purchaseResult = await this.masterpass.purchase({
      orderNo: orderNo,
      referenceNo: referenceNo,
      amount: totalAmount,
      installmentCount: installment,
      additionalParameters: null,
      ...this.displayCardForm ? {
        card: {
          number: this.state.card.replace(/\s+/g, ""),
          expMonth: +this.state.month,
          expYear: +this.state.year,
          cvc: this.state.cvc,
          accountAliasName: this.state.mpSave ? this.state.mpCardAlias : null,
          cardHolderName: this.state.name,
        },
      } : {
        cardName: this.state.mpCards[this.state.mpCardSelected].name,
      },
    }).catch(e => e);

    if (purchaseResult instanceof Error) {
      return alert(purchaseResult.message);
    }

    // result
    if (purchaseResult.result) {
      // purchase completed without 3ds
      alert("Purchase success");
    } else {

      // define a function that will redirect to 3ds page to continue payment
      const redirectAction = (url) => {
        // here simply open a 3ds webview page for user to complete steps in their bank page
        // on page unmount call onResult so we can handle payment completion
        this.props.navigation.navigate("threeDS", {
          uri: url + `&returnUrl=${encodeURIComponent(returnUrl)}`,
          onResult: async (success) => {
            if (!success) {
              alert("payment failed");

              // tell user to check his information
            } else {
              alert("payment was successful");

              // navigate to order detail page
            }
          },
        });
      };

      // handle next action
      switch (purchaseResult.action) {
        case PurchaseAction.verifyOtp:

          // get otp from user
          const code = await this.getOtpCode();
          if (!code) {
            //cancel purchase
            return;
          }

          // verify otp
          const verifyResult = await this.mass.verifyOtp(code, purchaseResult.type).catch(e => e);

          // handle otp error
          if (verifyResult instanceof Error) {
            return alert(verifyResult.message);
          }

          // handle next action
          if (verifyResult.action === OtpAction.redirect3D) {

            // otp verification was success, now we can redirect to payment
            redirectAction(verifyResult.url);
          }
          return;
        case PurchaseAction.redirect3D:

          // we are ready to redirect to 3ds page
          redirectAction(purchaseResult.url);
          return;
      }
    }
  };

  render() {
    return (
      <View style={{ flex: 1, padding: 15, backgroundColor: "white" }}>

        {/* User has account masterpass account*/}
        {this.state.mpHasAccount && (!this.state.mpIsLinked || !!this.state.mpCards.length) &&
          <View style={{ marginBottom: 10 }}>
            {/* you can display masterpass logo here */}

            {!this.state.mpIsLinked ?
              <>
                {/* display a message about user having saved cards but did not link it with this account yet */}
                <Text style={[{ marginTop: 15 }]}>Masterpass'e kayıtlı kartlarınız var, kullanmak i̇ster mi̇si̇ni̇z?</Text>
                <TouchableOpacity onPress={this.linkMasterpass}><Text>Hesap Doğrula</Text></TouchableOpacity>
              </>
              :
              <>
                {/* display saved cards */}
                <Text style={[{ marginTop: 15 }]}>Masterpass'e kayıtlı kartlarım</Text>
                {this.state.mpCards.map((x, i) => {
                  return (
                    <TouchableOpacity key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}
                                      onPress={() => this.mpCardSelected(i)}>
                      <Radio
                        checked={this.state.mpCardSelected === i}
                        onChange={() => this.mpCardSelected(i)}
                      />

                      {/* display card logo */}
                      <Image source={{ uri: this.mpCardImageFromBin(x.bankIca) }} style={{ width: 100, height: 36 }}
                             resizeMode="contain" />

                      <View style={{ flex: 1 }}>
                        <Text>{x.name} </Text>
                        <Text>{x.maskedCardNumber} </Text>
                      </View>
                      <TouchableOpacity style={{ paddingVertical: 15 }} onPress={() => this.mpDeleteCard(x)}>
                        <Text>Sil</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}
                                  onPress={() => this.mpCardSelected(-1)}>
                  <Radio
                    checked={this.state.mpCardSelected === -1}
                    onChange={() => this.mpCardSelected(-1)}
                  />
                  <Text style={[{ marginLeft: 10 }]}>FARKLI BİR KART İLE ÖDEMEK İSTİYORUM. </Text>
                </TouchableOpacity>
              </>
            }
          </View>
        }

        {/* display card form */}
        {this.displayCardForm &&
          <>
            <Text>KART BİLGİLERİ</Text>
            <Text style={[{ marginBottom: 0 }]}>Kart Sahibi</Text>

            <View>
              <TextInput
                placeholder="İsim Soyisim"
                placeholderTextColor="#c7c7cd"
                value={this.state.name}
                onChangeText={v => this.setState({ name: v })}
              />
            </View>
            <Text style={[{ marginBottom: 0 }]}>Kart No</Text>

            <View>
              <TextInput
                type="credit-card"
                placeholder="XXXX XXXX XXXX XXXX"
                placeholderTextColor="#c7c7cd"
                value={this.state.card}
                onChangeText={v => this.cardChanged(v)}
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ flex: 1 }}>Son Kul. Tarihi</Text>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <RNPickerSelect
                  placeholder={{
                    label: "Ay",
                    value: "",
                  }}
                  items={months}
                  onValueChange={v => this.setState({ month: v })}
                  value={this.state.month}
                  style={{
                    icon: {
                      top: 4,
                    },
                    underline: { borderTopWidth: 0 },
                    inputAndroid: { color: "black" },
                  }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <RNPickerSelect
                  placeholder={{
                    label: "Yıl",
                    value: "",
                  }}
                  items={years}
                  onValueChange={v => this.setState({ year: v })}
                  value={this.state.year}
                  style={{
                    icon: {
                      top: 4,
                    },
                    underline: { borderTopWidth: 0 },
                    inputAndroid: { color: "black" },
                  }}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
              <Text style={{ flex: 1 }}>CVC</Text>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <TextInput
                  type="custom"
                  options={{
                    mask: "999",
                  }}
                  placeholder="XXX"
                  underlineColorAndroid="rgba(0,0,0,0)"
                  placeholderTextColor="#c7c7cd"
                  value={this.state.cvc}
                  onChangeText={v => this.setState({ cvc: v })}
                  keyboardType="numeric"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }} />
            </View>

            {/* display option to save new card */}
            {this.showMpSave &&
              <>

                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 15 }}>
                  <View>
                    <Checkbox checked={this.state.mpSave} onChange={v => this.setState({ mpSave: v })} />
                  </View>
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 15 }}>
                    <Text>
                      {"Kartımı Masterpass Altyapısında Saklamak Ve Sonraki̇ Alışveri̇şleri̇mde Kullanmak İsti̇yorum, "}
                      <Text style={{ textDecorationLine: "underline" }}
                            onPress={() => Linking.openURL("https://www.masterpassturkiye.com/TermsAndConditions.aspx")}>
                        Masterpass Kullanım Koşulları
                      </Text>
                      {"’nı Okudum, Onaylıyorum."}
                    </Text>
                  </View>

                </View>

                {this.state.mpSave &&
                  <>

                    <Text style={[{ marginBottom: 0, marginTop: 15 }]}>Kart Adı</Text>
                    <View>
                      <TextInput
                        placeholder="Kart Adı"
                        underlineColorAndroid="rgba(0,0,0,0)"
                        placeholderTextColor="#c7c7cd"
                        value={this.state.mpCardAlias}
                        onChangeText={v => this.setState({ mpCardAlias: v })}
                      />
                    </View>
                  </>
                }
              </>
            }
          </>
        }
        {/* Purchase */}
        <Button title={'Satın Al'} onPress={this.purchase} />

        {/* Master pass sdk */}
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
          onEvent={this.onMpEvent}
        />

        {/* OTP form */}
        <DialogInput isDialogVisible={this.state.smsDialog}
                     title={"Telefon Doğrulaması"}
                     message={<>
                       <Text>{"\n\nTelefon numaranıza gönderilen doğrulama kodunu giriniz."}{"\n"}</Text>
                       <Text>
                         {moment.duration(this.state.timerCount, "seconds").format("mm:ss", { trim: false })}
                       </Text> -
                       <Text onPress={this.canResend ? this.resendOtp : null} style={{
                         textDecorationLine: "underline",
                         color: this.canResend ? "#2f5d96" : "#cbcbcb",
                       }}>{"Yeni kod al"}</Text>
                     </>
                     }
                     submitInput={(inputText) => this.smsPromiseResolve(inputText)}
                     textInputProps={{
                       autoCorrect: false,
                       keyboardType: "numeric",
                     }}
                     closeDialog={() => this.smsPromiseResolve(false)}
                     submitText={"Gönder"}
                     cancelText={"İptal"}>
        </DialogInput>
      </View>
    );
  }
}

function Checkbox({ checked, onChange }) {
  const _onChange = useCallback(() => {
    onChange(!checked);
  }, [checked]);

  return (
    <View style={[{ flexDirection: "row", marginBottom: 15 }]}>
      <TouchableOpacity
        style={[{ flexDirection: "row", backgroundColor: "white", borderRadius: 6, width: 26, height: 26, borderWidth: 1 },
          checked && { backgroundColor: "blue" }]}
        onPress={_onChange} />
    </View>
  );
}

function Radio({ checked, onChange }) {
  const _onChange = useCallback(() => {
    onChange(!checked);
  }, [checked]);

  return (
    <View style={[{ flexDirection: "row" }]}>
      <TouchableOpacity
        style={[{ flexDirection: "row", backgroundColor: "white", borderRadius: 13, width: 26, height: 26, borderWidth: 1 },
          checked && { backgroundColor: "blue" }]}
        onPress={_onChange} />
    </View>
  );
}

function padLeft(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const months = [], years = [];
for (let i = 1; i <= 12; i++) {
  months.push({ label: padLeft(i, 2), value: padLeft(i, 2) });
}
const thisYear = new Date().getFullYear();
for (let i = 0; i <= 50; i++) {
  years.push({ label: (thisYear + i).toString().substring(2), value: (thisYear + i).toString().substring(2) });
}

export default MasterPassExample;
