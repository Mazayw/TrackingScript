// ==UserScript==
// @name         Tracking Script for Sborka
// @namespace    http://tampermonkey.net/
// @version      0.8
// @author       Mazayw
// @match        https://sborka.ua/?id=80*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sborka.ua
// @downloadURL  https://raw.githubusercontent.com/Mazayw/TrackingScript/master/index.js?token=GHSAT0AAAAAABTFORFDZYVYA4JLKXJ7CNHQYUDVAQA
// @updateURL    https://raw.githubusercontent.com/Mazayw/TrackingScript/master/index.js?token=GHSAT0AAAAAABTFORFDZYVYA4JLKXJ7CNHQYUDVAQA
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
	'use strict';
	const data = (DocumentNumber) => ({
		modelName: 'TrackingDocument',
		calledMethod: 'getStatusDocuments',
		methodProperties: {
			Documents: [
				{
					DocumentNumber,
					Phone: '380500000001',
				},
			],
			CheckWeightMethod: '',
			CalculatedWeight: '3',
		},
	});

	const handleResponse = (elem) => (response) => {
		const data = JSON.parse(response.response).data[0];
		console.log(data);

		elem.innerText += '\n' + data.Status;
		if (data.DateReturnCargo) {
			const daySave = Math.ceil(
				(Date.parse(data.DateReturnCargo) - Date.now()) / (1000 * 3600 * 24)
			);
			elem.innerText += `\n Залишилось ${daySave} днів`;
			if (daySave < 4) elem.style.color = 'red';
		}
		if (data.ExpressWaybillAmountToPay > 0) {
			elem.innerText += `\n До оплати ${data.ExpressWaybillAmountToPay} грн`;
		}
	};

	const url = 'https://api.novaposhta.ua/v2.0/json/';

	const trackingNumbers = document.getElementsByClassName('tracking-parcel');
	for (const elem of trackingNumbers) {
		GM_xmlhttpRequest({
			method: 'POST',
			url,
			data: JSON.stringify(data(elem.textContent.slice(6))),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			onload: handleResponse(elem),
		});
	}
})();
