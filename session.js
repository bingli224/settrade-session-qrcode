/**
 * By BingLi224
 *
 * 00:41 THA 02/07/2018
 *
 * Settrade Session
 *
 * Issue:
 * 	Cookie with XMLHttpRequest is not allowed yet.
 *
 * 16:45 THA 04/08/2019
 *
 * Add: QRCode generator form session.
 *
 * 02:51 THA 27/10/2019
 *
 * Remove session button after showing QR code.
 *
 * Reference: https://davidshimjs.github.io/qrcodejs/
 */

try {
	// importScripts('./spreadsheet.js')
	import {exportConfig} from 'spreadsheet'
	// import {exportConfig} from './spreadsheet.js'
} catch (e) {
	console.error(e)
}


document.addEventListener ( 'DOMContentLoaded', function () {
	document.getElementById ( 'btn_to_qr' ).addEventListener ( 'click', function () {
		session2qrcode ( );
		document.getElementById ( 'btn_session' ).remove ( );
	} )
	try {
		document.getElementById ( 'btn_test_set_session' ).addEventListener ( 'click', function () {
			// TEST: BEFORE
			chrome.cookies.getAll (
				{
					"url"	: "https://*.settrade.com",
				},
				(cookies) => {
					document.getElementById ( "content" ).value = JSON.stringify(cookies)
				}
			)
			setSession ( )

			// TEST: AFTER
			chrome.cookies.getAll (
				{
					"url"	: "https://*.settrade.com",
				},
				cookies => {
					document.getElementById ( "content" ).value += JSON.stringify(cookies)
				}
			)
		} );
	} catch (e) {
		console.error(e)
	}
	
} );
	const menu = chrome.contextMenus.create ( {
		title: 'Settrade session',
		id: 'session',
		contexts: ['all'],
	})
	
	// TEST: set the cloud URL
	chrome.contextMenus.create ( {
		title: 'Import',
		parentId: menu,
		contexts: ['all'],
		type: 'normal',
		onclick: () => {
			chrome.tabs.create({
				url: chrome.extension.getURL('session.html'),
				action: false
			},
			(tab) => {
				chrome.windows.create({
					tabId: tab.id,
					type: 'popup',
					focused: true
				})
			})
		},
	} )
	
	chrome.contextMenus.create ( {
		title: 'Export',
		parentId: menu,
		contexts: ['all'],
		type: 'normal',
		onclick: exportConfig,
	} )

function session2qrcode ( )
{
	chrome.cookies.getAll (
		{
			"url"	: "https://*.settrade.com",
		},
		function ( cookies ) {
			let str_cookies = "";
			for ( cookie of cookies )
			{
				console.log(JSON.stringify(cookie, undefined, 4))
				if ( [ 'id', 'if', 'st', '__txtBrokerId', '__txtUserRef' ].indexOf ( cookie.name ) >= 0 ) str_cookies += cookie.name + "=" + cookie.value + ";"
			}
			ui = document.getElementById ( 'content' );
			ui.rows = cookies.length;
			ui.value = str_cookies;

			let e = document.createElement ( 'script' )
			e.src = chrome.extension.getURL ( 'qrcode.min.js' )
			e.addEventListener ( 'load', () => {
				document.getElementById ( 'qrcode' ).style.margin = '100px'
				new QRCode ( document.getElementById ( "qrcode" ), { width : 300, height : 300 } ).makeCode ( str_cookies )
			}, false )
			e.addEventListener ( 'error', () => { document.getElementById ( 'qrcode' ).innerHTML = 'Failed to load QRCode.' }, false )
			document.head.appendChild ( e )
		}
	);
}

// TEST:
// TODO: get cookies from server to update
async function setSession ( ) {
	const url = "https://*.settrade.com"
	const domain = ".settrade.com"
	await chrome.cookies.set ( {
		"url"	: url,
		"name"	: "__txtUserRef",
		"value"	: "7007367",
		"domain"	: domain,
		"secure"	: true,
	} )
	await chrome.cookies.set ( {
		"url"	: url,
		"name"	: "__txtBrokerId",
		"value"	: "050",
		"domain"	: domain,
		"secure"	: true,
	} )
	await chrome.cookies.set ( {
		"url"	: url,
		"name"	: "if",
		"value"	: "\"157TZbjCwBABX4/zrvseZiNIuMzuxtavm95WZpL/WJkxZ/Dis2CddajTABVf0Q==\"",
		"domain"	: domain,
		"secure"	: true,
	} )
	await chrome.cookies.set ( {
		"url"	: url,
		"name"	: "id",
		"value"	: "7KozmcNx1XdHj1LkKHJB6w0000000000",
		"domain"	: domain,
		"secure"	: true,
	} )
	await chrome.cookies.set ( {
		"url"	: url,
		"name"	: "st",
		"value"	: "\"ITP|10.33.2.156|1640502787000|/webrealtime/data/dataXML.jsp\"",
		"domain"	: domain,
		"secure"	: true,
	} )
}