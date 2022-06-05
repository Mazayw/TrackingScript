// ==UserScript==
// @name         Tracking Script for Sborka
// @namespace    http://tampermonkey.net/
// @version      0.6
// @author       Mazayw
// @match        https://sborka.ua/?id=80*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sborka.ua
// @downloadURL  https://raw.githubusercontent.com/Mazayw/TrackingScript/master/index.js?token=GHSAT0AAAAAABTFORFDZYVYA4JLKXJ7CNHQYUDVAQA
// @updateURL    https://raw.githubusercontent.com/Mazayw/TrackingScript/master/index.js?token=GHSAT0AAAAAABTFORFDZYVYA4JLKXJ7CNHQYUDVAQA
// ==/UserScript==

(function () {
  'use strict';
  const data = {
    apiKey: '[ВАШ КЛЮЧ]',
    modelName: 'TrackingDocument',
    calledMethod: 'getStatusDocuments',
    methodProperties: {
      Documents: [
        {
          DocumentNumber: '20400281751880',
          Phone: '380500000001',
        },
      ],
      CheckWeightMethod: '',
      CalculatedWeight: '3',
    },
  };

  const url = 'https://api.novaposhta.ua/v2.0/json/';

  const trackingNumbers = document.getElementsByClassName('tracking-parcel');
  for (const elem of trackingNumbers) {
    data.methodProperties.Documents[0].DocumentNumber =
      elem.textContent.slice(6);

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.data[0]);
        elem.innerText += '\n' + data.data[0].Status;
        if (data.data[0].DateReturnCargo) {
          const daySave = Math.ceil(
            (Date.parse(data.data[0].DateReturnCargo) - Date.now()) /
              (1000 * 3600 * 24)
          );
          elem.innerText += `\n Залишилось ${daySave} днів`;
          if (daySave < 4) elem.style.color = 'red';
        }
        if (data.data[0].ExpressWaybillAmountToPay > 0) {
          elem.innerText += `\n До оплати ${data.data[0].ExpressWaybillAmountToPay} грн`;
        }
      });
  }
})();
