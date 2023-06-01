// ==UserScript==
// @name         Tracking Script for Sborka
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Mazayw
// @match        https://sborka.ua/*?id=80*
// @match        https://sborka.ua/?id=80*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sborka.ua
// @downloadURL  https://raw.githubusercontent.com/Mazayw/TrackingScript/master/index.js
// @updateURL    https://raw.githubusercontent.com/Mazayw/TrackingScript/master/index.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
	'use strict';
	const novaPoshtaUrl = (number) =>
		`https://novaposhta.ua/tracking/?cargo_number=${number}`;
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
		const link = novaPoshtaUrl(elem.textContent.slice(6));
		elem.innerHTML = `${(elem.innerText += '\n' + data.Status)}`;

		const linkElem = document.createElement('a');
		linkElem.href = link;
		linkElem.innerText = 'Відкрити на сайті Нової пошти';
		elem.parentNode.insertBefore(linkElem, elem.nextSibling);

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
