var express = require("express");
const router = express.Router();
const juni = require("./juniController")
const axios = require("axios");
let userSessionData = {};
let ussdCode = "*928*36#";
const {
  uuid
} = require('uuidv4');

/* The code is implementing a POST route for handling USSD requests. It receives the request body
which contains session information, user input, and other data. */
router.post("/ussd", async (req, res) => {
  const {
    sessionID,
    newSession,
    msisdn,
    userData,
    network,
    userID
  } = req.body;

  console.log("####################", req.body);
  let message = "";
  let service = "";
  let continueSession;
  const numberRegex = /^\d{10}$/;
  const amountRegex = /^[1-9]\d*(\.\d*)?$/;
  const customerAmount = userData.match(amountRegex);
  const customerNumber = userData.match(numberRegex);
  const whitelist = [
    "233554444444",
  ];


  if (newSession && userData == ussdCode) {
    userSessionData[sessionID] = {
      step: 1,
      amount: undefined,
      service: undefined,
      phonenumber: undefined,
      amount: undefined,
      reference: undefined,
    };


    message = "Welcome to Junipay\n";
    message += "1. Pay for fuel.\n";
    message += "2. Pay for food.\n";
    continueSession = true;
  } else if (
    newSession == false &&
    userSessionData[sessionID].step === 1
  ) {
    userSessionData[sessionID].service = userData;
    if (
      userSessionData[sessionID].service == "1" &&
      whitelist.includes(msisdn)
    ) {
      service = "1";
      message = "Please Enter Customer's Phone Number for fuel";
      continueSession = true;
      userSessionData[sessionID].step = userSessionData[sessionID].step + 1;
    } else {
      service = "1";

      message =
        "You are not authorized for this service.";
      continueSession = false;
    }
    if (userSessionData[sessionID].service == "2") {
      service = "2";
      message = "Please Enter Customer's Phone Number for food";
      continueSession = true;
      userSessionData[sessionID].step = userSessionData[sessionID].step + 1;
    }
  } else if (
    newSession == false &&
    customerNumber &&
    userSessionData[sessionID].step === 2
  ) {
    userSessionData[sessionID].phonenumber = userData;
    if (userSessionData[sessionID].service == "1") {
      service = "1";

      //Invalid option selected
      message = "Enter the amount to be paid:\n";
      continueSession = true;
      userSessionData[sessionID].step = userSessionData[sessionID].step + 1;
    }
    if (userSessionData[sessionID].service == "2") {
      service = "2";

      //Invalid option selected
      message = "Enter the amount to be paid:\n";
      continueSession = true;
      userSessionData[sessionID].step = userSessionData[sessionID].step + 1;
    }
  } else if (
    newSession == false &&
    userSessionData[sessionID].step === 3
  ) {

    userSessionData[sessionID].amount = parseFloat(userData)
    if (userSessionData[sessionID].service == "1") {

      service = "1";
      var fuelCustomerName = await juni.verify(userSessionData[sessionID].phonenumber)

      //commit to database
      message = `Please Confirm Collection From ${fuelCustomerName.name} - (${userSessionData[sessionID].phonenumber}) for fuel\n`;
      message += "1. Yes\n";
      message += "2. Back\n";
      userSessionData[sessionID].step = userSessionData[sessionID].step + 1;
      continueSession = true;
    }

    if (userSessionData[sessionID].service == "2") {
      service = "2";
      var foodCustomerName = await juni.verify(userSessionData[sessionID].phonenumber)

      //commit to database
      message = `Please Confirm Collection From ${foodCustomerName.name} - (${userSessionData[sessionID].phonenumber}) for food\n`;
      message += "1. Yes\n";
      message += "2. Back\n";
      userSessionData[sessionID].step = userSessionData[sessionID].step + 1;
      continueSession = true;
    }
  } else if (
    newSession == false &&
    userData === "1" &&
    userSessionData[sessionID].step === 4
  ) {
    if (userSessionData[sessionID].service == "1") {
      var customerInfo = await juni.verify(userSessionData[sessionID].phonenumber)
    await juni.pay(userSessionData[sessionID].amount, userSessionData[sessionID].amount, customerInfo.provider, userSessionData[sessionID].phonenumber, "test_payment")
      service = "1";
      message =
        "The customer will receive a prompt to authorize payment soon for fuel. Thank You.";
      continueSession = false;
      delete userSessionData[sessionID];
    } else if (userSessionData[sessionID].service == "2") {
      service = "2";

      message =
        "The customer will receive a prompt to authorize payment soon for food. Thank You.";
      continueSession = false;
      delete userSessionData[sessionID];
    }
  } else if (
    newSession == false &&
    userData === "2" &&
    userSessionData[sessionID].step === 4
  ) {
    if (userSessionData[sessionID].service == "1") {
      service = "1";
      //GO BACK TO ENTERING THE PHONE NUMBER_REGE
      message = "Enter number of customer for fuel";
      continueSession = true;
      userSessionData[sessionID].step = 2;
    }
    if (userSessionData[sessionID].service == "2") {
      service = "2";
      //GO BACK TO ENTERING THE PHONE NUMBER_REGE
      message = "Enter number of customer for food";
      continueSession = true;
      userSessionData[sessionID].step = 2;
    }
  } else if (
    newSession &&
    userData == ussdCode &&
    !whitelist.includes(msisdn)
  ) {
    message =
      "You are not authorized for this service. Your phone number has been logged with the administrator.";
    continueSession = false;
  } else {
    message = "Wrong input";
    continueSession = false;
  }

  // Print the response onto the page so that the SDK can read it
  let response = {
    sessionID: sessionID,
    service: service,
    msisdn: msisdn,
    userID: userID,
    message: message,
    continueSession: continueSession,
    network: network,

  };
  res.send(response);
  // DONE!!!
});


router.post("/callback", (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Callback received"
  })
})



module.exports = router;
