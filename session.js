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
 * 
 * 17:51 THA 04/01/2021
 * 
 * Encrypt/decrypt cookies with AEC-GCM. See window.crypto.
 * 
 * Export/import cookies in specific browser (including
 * incognito mode) to specific spreadsheet.
 */

'use strict'

async function test_generatekey_gotFixedSize() {
	crypto.subtle.generateKey({
			name: "AES-GCM",
			length: 128,
		},
		true,
		['encrypt', 'decrypt']
	).then(async iv => {
		console.log("original: iv=" + iv)
		console.log("original: uint8array(iv)=" + new Uint8Array(iv))
		console.log("original: str(uint8array(iv))=" + String.fromCharCode(...new Uint8Array(iv)))
		let ex_iv = await crypto.subtle.exportKey("raw", iv)
		console.log("expected: iv=" + ex_iv)
		console.log("exported: typeof(iv)=" + typeof(ex_iv))
		console.log("exported: uint8array(iv)=" + JSON.stringify(new Uint8Array(ex_iv)))
		console.log("exported: uint8array(iv).buffer=" + JSON.stringify(new Uint8Array(ex_iv).buffer))
		console.log("exported: str(uint8array(iv))=" + JSON.stringify(String.fromCharCode(...new Uint8Array(ex_iv))))
		console.log("exported: base64(uint8array(iv))=" + btoa(String.fromCharCode(...new Uint8Array(ex_iv))))
		console.log("exported: base64(uint8array(iv)).backward=" + atob(btoa(String.fromCharCode(...new Uint8Array(ex_iv)))))
	})
	let count = new Uint16Array(new SharedArrayBuffer(1024))
	for (let i=0; i<500; i++) {
		crypto.subtle.generateKey({
				name: "AES-GCM",
				length: 128,
			},
			true,
			['encrypt', 'decrypt']
		).then(async iv => {
			iv = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey("raw", iv))))
			console.log("len: " + iv.length)
			// console.log(iv)
			Atomics.store(count, i, iv.length)
		})
	}
	let grp = {}
	for (let i=0; i<500; i++) {
		let sz = Atomics.load(count, i)
		if (!grp[sz]) {
			grp[sz] = 1
		} else {
			grp[sz] ++
		}
	}
	for (let k in grp) {
		console.log(k + "\t: " + count[k])
	}
}

async function test_importKey_equalsTo_exportKey_result() {
	// 192: not supported by AES
	// const key = Uint8Array.from([1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39,41,43,45,47])
	// 128
	const key = Uint8Array.from([1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31])
	
	const importedKey = await crypto.subtle.importKey(
		"raw",
		key,
		"AES-GCM",
		true,
		['encrypt', 'decrypt']
	)
	const exportedKey = await crypto.subtle.exportKey(
		"raw",
		importedKey
	)

	console.log("uint8array key: " + key)
	console.log("imported: " + importedKey)
	console.log("exported: " + exportedKey)
	console.log("cmp: " + (key === exportedKey))
	
	const exportedKeyUintArray = new Uint8Array(exportedKey)
	for (let i in exportedKeyUintArray) {
		// console.log(key[i] + " vs " + exportedKeyUintArray[i] + ":\t" + (key[i] === exportedKeyUintArray[i]) + "\t" + (key[i] == exportedKeyUintArray[i]))
		console.log("===: " + (key[i] === exportedKeyUintArray[i]) + "\t==: " + (key[i] == exportedKeyUintArray[i]))
	}
}

document.addEventListener ( 'DOMContentLoaded', function () {
	document.getElementById ( 'btn_to_qr' ).addEventListener ( 'click', async function () {
		session2qrcode ( );
		document.getElementById ( 'btn_session' ).remove ( );
	} )

	const menu = chrome.contextMenus.create ( {
		title: 'Settrade session',
		id: 'session',
		contexts: ['all'],
	})
	
	// TEST: set the cloud URL
	// not work yet
	// chrome.contextMenus.create ( {
	// 	title: 'Import',
	// 	parentId: menu,
	// 	contexts: ['all'],
	// 	type: 'normal',
	// 	onclick: () => {
	// 		chrome.tabs.create({
	// 				url: chrome.extension.getURL('session.html'),
	// 				action: false
	// 			},
	// 			(tab) => {
	// 				chrome.windows.create({
	// 					tabId: tab.id,
	// 					type: 'popup',
	// 					focused: true
	// 			})
	// 		})
	// 	},
	// } )
	
	chrome.contextMenus.create ( {
		title: 'Export',
		parentId: menu,
		contexts: ['all'],
		type: 'normal',
		onclick: async ( ) => {
			// TODO: find account id from cookies
			await updateUser ( )
			await exportConfig ( )
		}
	} )

	// FOR TESTING
	// try {
	// 	document.getElementById ( 'btn_test_set_session' ).addEventListener ( 'click', function () {
	// 		// TEST: BEFORE
	// 		chrome.cookies.getAll (
	// 			{
	// 				"url"	: "https://*.settrade.com",
	// 			},
	// 			(cookies) => {
	// 				document.getElementById ( "content" ).value = JSON.stringify(cookies)
	// 			}
	// 		)
	// 		setSession ( )

	// 		// TEST: AFTER
	// 		chrome.cookies.getAll (
	// 			{
	// 				"url"	: "https://*.settrade.com",
	// 			},
	// 			cookies => {
	// 				document.getElementById ( "content" ).value += JSON.stringify(cookies)
	// 			}
	// 		)
	// 	} );
	// } catch (e) {
	// 	console.error(e)
	// }
	
} );

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