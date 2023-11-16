const axios = require("axios")


/**
 * The function "getJuniCredentials" returns an object containing a token and a client ID.
 * @returns An object containing the token and clientId from Juni.
 */
function getJuniCredentials() {
    return {
        token: "TOKEN_FROM_JUNI",
        clientId: "CLIENT_ID_FROM_JUNI"
    };
}

/**
 * The function is an asynchronous function that verifies a telephone number by making a GET
 * request to the Juni Payments API.
 * @param telephoneNumber - The `telephoneNumber` parameter is the phone number that you want to
 * verify. It should be a string representing a valid phone number.
 * @returns The function `verify` returns the data received from the API call if the call is
 * successful. If there is an error or the API call fails, it returns an object with a `status`
 * property set to "failed".
 */
async function verify(telephoneNumber) {
    let response

    var config = {
        method: "GET",
        url: `https://api.junipayments.com/resolve?channel=mobile_money&phoneNumber=${telephoneNumber}`,
        headers: {
            'cache-control': 'no-cache',
            'authorization': "Bearer " + getJuniCredentials().token,
            'clientid': getJuniCredentials().clientId
        }
    };
    try {
        response = await axios(config);
        return response.data;
    } catch (err) {
        return {
            status: "failed"
        }
    }
}

/**
 * The `pay` function is an asynchronous function that makes a POST request to the Juni Payments API to
 * initiate a payment transaction with the specified amount, total amount, provider, phone number,
 * description, callback URL, sender email, channel, and foreign ID.
 * @param amount - The `amount` parameter represents the amount of money to be paid.
 * @param tot_amnt - The `tot_amnt` parameter represents the total amount of the payment. It is the
 * total amount that the user needs to pay, including any additional fees or charges.
 * @param provider - The "provider" parameter refers to the payment service provider that you want to
 * use for the transaction. It could be a specific mobile money provider or any other payment service
 * provider that is supported by the Juni Payments API.
 * @param phoneNumber - The `phoneNumber` parameter is the phone number of the user who will be making
 * the payment.
 * @param description - The `description` parameter is a string that describes the purpose or nature of
 * the payment. It can be used to provide additional information or context about the payment
 * transaction.
 * @returns the response data from the API call if the call is successful. If there is an error, it
 * returns an object with a status of "failed".
 */
async function pay(amount, tot_amnt, provider, phoneNumber, description) {
    console.log(amount, tot_amnt, provider, phoneNumber, description)
    let response
    let callbackUrl = "https://sampleurl.com/callback"
    let senderEmail = "test@mail.com"
    let channel = "mobile_money"
    let foreignID = Date.now().toString()
    var config = {
        method: "POST",
        url: `https://api.junipayments.com/payment`,
        headers: {
            'cache-control': 'no-cache',
            'authorization': "Bearer " + getJuniCredentials().token,
            'clientid': getJuniCredentials().clientId
        },
        data: {
            amount: amount,
            tot_amnt: tot_amnt,
            provider: provider,
            phoneNumber: phoneNumber,
            channel: channel,
            senderEmail: senderEmail,
            description: description,
            foreignID: foreignID,
            callbackUrl: callbackUrl
        }
    };

    try {
        response = await axios(config);
        console.log(response.data)
        return response.data;
    } catch (err) {
        console.log(err.response.data)
        return {
            status: "failed"
        }
    }
}


module.exports = {
    verify,
    pay
}


