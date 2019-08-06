(function(){
    kintone.events.on("app.record.index.show", function(event) {
        "use strict";
        console.log(event);

        // returns a bool
        // true if payer's email is in donor's list, else false
        function payerIsExistingDonor(payerEmail, donorList){
            for(let i = 0; i < donorList.length; i++){
                if(donorList[i].Link.value === payerEmail){ // "Link" is the field id of the email address
                    return true;
                }
            }
            return false;
        }



        // takes payer info from Transactions app and adds a new record in Final Donors List app
        function addPayerToDonor(payerInfo){
            let body = {
                'app': 17, // app id of the Final Donor List app
                'record':{
                    "Text": {"value": payerInfo.Text.value}, // Name
                    // "Monthly Donor Status" and "Donor Type" cannot be identified from the transactions app
                    "Link": {"value": payerInfo.Link.value}, // email
                    "Link_0": {"value": payerInfo.Link_1.value}, // phone
                    "Text_0": {"value": payerInfo.Text_1.value}, // street address
                    "Text_1": {"value": payerInfo.Text_3.value}, // city
                    "Text_2": {"value": payerInfo.Text_4.value}, // state
                    "Text_3": {"value": payerInfo.Text_5.value}, // zip
                    "Drop_down_0": {"value": payerInfo.Drop_down_0.value} // country
                }
            }
            kintone.api(kintone.api.url("/k/v1/record", true), "POST", body, function(resp) {
                console.log(resp);
            }), function(error){
                console.log(error);
            }
        }



        let body = {"app": 18}; // app id of the transactions app
        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body, function(resp) {
            //success
            console.log(resp);
            // update the Final Donor List app by adding a new record for payers not in the donor list
            for(let i = 0; i < resp.records.length; i++){
                let newPayer = resp.records[i];
                let newPayerEmail = newPayer.Link.value;
                if(!payerIsExistingDonor(newPayerEmail, event.records)){
                    addPayerToDonor(newPayer);
                    console.log(newPayerEmail, " is added as a new donor!");
                }else{
                    console.log(newPayerEmail, " already exists in donors list.");
                }
            }
        }, function(error) {
            // error
            console.log(error);
        })
    });
})();