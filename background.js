'use strict'

try {
	// import "aes-gcm.js"
	// import {encrypt, decrypt} from 'aes-gcm.js'
} catch (e) {
	console.error(e)
}

// function generateKey () {
//   return crypto.subtle.generateKey({
//       name: "AES-GCM",
//       length: 256,
//     },
//     true,
//     ['encrypt', 'decrypt']
//   )
// }

// async function encrypt (raw) {
//   const key = generateKey()
  
//   return await crypto.subtle.encrypt(
//     {
//       name: "AES-GCM",
//       iv: iv
//     },
//     key,
//     new TextEncoder().encode(raw)
//   )
// }

// async function decrypt (cipher) {
//   const key = generateKey()
  
//   const data = await crypto.subtle.decrypt(
//     {
//       name: "AES-GCM",
//       iv: iv
//     },
//     key,
//     cipher
//   )
  
//   return new TextDecoder().decode(data)
// }

// const iv = Uint8Array.from([21, 20, 12, 27, 0, 12, 50])

const cookieUrl = "https://*.settrade.com"
const cookieDomain = ".settrade.com"
const defaultAccountId = "all"	// ISSUE: deprecated for token, seemingly

chrome.runtime.onMessage.addListener( async (req, sender, callback) => {
	console.log("onMessage(): mode=" + req.mode)

	switch (req.mode) {
		case 'import':
			// TODO: get from cloud
			fetch(
				req.cloud_url + '?apiService=token&userId=' + req.userId + '&brokerId=' + req.brokerId + '&accountId=' + defaultAccountId,
				{
					method: 'GET',
					mode: 'cors',
					// headers: { 'Content-Type': 'application/json' }
					redirect: 'follow',
					referrerPolicy: 'no-referrer'
				}
			)
				.then (res => {
					return res.json()
				})
				.then (async res => {
					console.log("onMessage: import: res.json=" + JSON.stringify(res, undefined, 4))
					res = res[0]
					let userId = res[0]
					let brokerId = res[1]
					let accountId = res[2]
					let token = res[3]

					await chrome.storage.local.set({
						"userId": userId,
						"brokerId": brokerId,
						"accountId": accountId,
					})

					console.log("onMessage: import: token=" + token)
					try {
						console.log("onMessage: import: decrypt(token)=" + (await decrypt(token)))
					} catch (e) {
						console.error(JSON.stringify(e, undefined, 4))
					}

					const cookies = (await decrypt (token))
					console.log("onMessage: import: cookies=" + cookies)
					if (cookies) {
						for (const cookie of cookies.split(';')) {
							try {
								console.log("onMessage: import: cookie=" + cookie)
								const entry = cookie.split('=', 2)
			await chrome.cookies.get (
				{
					url: cookieUrl,
					name: entry[0]
				},
				async ( cookie ) => {
					console.log("onMessage: import: cookie.before[" + entry[0] + "]: " + JSON.stringify(cookie, undefined, 4))
				}
			)
								await chrome.cookies.set ( {
									"url"	: cookieUrl,
									"name"	: entry[0],
									"value"	: entry[1],
									"domain"	: cookieDomain,
									"secure"	: true,
								} )
			await chrome.cookies.get (
				{
					url: cookieUrl,
					name: entry[0]
				},
				async ( cookie ) => {
					console.log("onMessage: import: cookie.after[" + entry[0] + "]=" + JSON.stringify(cookie, undefined, 4))
				}
			)
							} catch(e) {
								console.log("onMessage: import: skip: [" + cookie + "] because " + JSON.stringify(e, undefined, 4))
							}
						}
					}
					console.log("onMessage: import: finish")

					return true
				})
		break
		case 'export':
			const cookies = await chrome.cookies.getAll (
				{ "url"	: cookieUrl, },
				async ( cookies ) => {
					console.log("onMessage: export: cookies[" + typeof(cookies) + "]=" + JSON.stringify(cookies, undefined, 4))
					let session = "";
					for ( const cookie of cookies ) {
						console.log("onMessage: export: cookie[" + typeof(cookie) + "]=" + JSON.stringify(cookie, undefined, 4))
						if ( [ 'id', 'if', 'st', '__txtBrokerId', '__txtUserRef' ].indexOf ( cookie.name ) >= 0 ) session += cookie.name + "=" + cookie.value + ";"
					}
					
					console.log("onMessage: export: token=" + JSON.stringify(session, undefined, 4))

					const token = await encrypt(session)

					console.log("onMessage: export: encrypt(token)=" + token)
					console.log("onMessage: export: decrypt(encrypt(token))=" + await decrypt(token))
					
					const body = JSON.stringify({
						apiService: 'token',
						userId: req.userId,
						brokerId: req.brokerId,
						accountId: defaultAccountId,
						token: token,
					})

					return await fetch (
						req.cloud_url,
						{
							method: 'POST',
							mode: 'cors',
							cache: 'no-cache',
							headers: { 'Content-Type': 'application/json' },
							redirect: 'follow',
							referrerPolicy: 'no-referrer',
							body: body
						}
					).then ( res => res.text ( ) )
				}
			)
		
		break
		default:
	}
	
	return true
})