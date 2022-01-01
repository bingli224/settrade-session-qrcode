
try {
	self.importScripts ( "aes-gcm.js" )
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

// chrome.runtime.onInstalled.addListener(() => {
// })

chrome.runtime.onMessage.addListener( async (req, sender, callback) => {
	console.log("onMessage(): mode=" + req.mode)

	switch (req.mode) {
		case 'import':
			// TODO: get from cloud
			fetch(
				req.url + '?apiService=token&userId=' + req.userId + '&brokerId=' + req.brokerId + '&accountId=',
				{
					method: 'POST',
					mode: 'cors',
					// headers: { 'Content-Type': 'application/json' }
					redirect: 'follow',
					referrerPolicy: 'no-referrer'
				}
			)
				.then (res => {
					console.log(JSON.stringify(res, undefined, 4))
					return res.json()
				})
				.then (async res => {
					console.log("onMessage: import: res=" + JSON.stringify(res, undefined, 4))
					console.log("onMessage: import: token=" + res.token)
					console.log("onMessage: import: decrypt(token)=" + decrypt(res.token))

					await chrome.storage.local.set({
						"userId": res.userId,
						"brokerId": res.brokerId,
						"accountId": res.accountId,
					})

					const cookies = decrypt (res.token)
						.split (';')
					for (cookie in cookies) {
						const entry = cookie.split('=', 2)
						await chrome.cookies.set ( {
							"url"	: cookieUrl,
							"name"	: entry[0],
							"value"	: entry[1],
							"domain"	: cookieDomain,
							"secure"	: true,
						} )
					}

					
					return true
				})
		break
		case 'export':
			const cookies = await chrome.cookies.getAll (
				{ "url"	: cookieUrl, }
				// ,
				// ( cookies ) => {
				// 	let session = "";
				// 	for ( cookie of cookies ) {
				// 		if ( [ 'id', 'if', 'st', '__txtBrokerId', '__txtUserRef' ].indexOf ( cookie.name ) >= 0 ) session += cookie.name + "=" + cookie.value + ";"
				// 	}
					
				// 	return session
				// }
			)
			let session = "";
			for ( cookie of cookies ) {
				if ( [ 'id', 'if', 'st', '__txtBrokerId', '__txtUserRef' ].indexOf ( cookie.name ) >= 0 ) session += cookie.name + "=" + cookie.value + ";"
			}
			
			console.log("onMessage: import: token=" + (session))
			console.log("onMessage: import: encrypt(token)=" + encrypt(session))

			const token = encrypt(session)

			return await fetch (
				req.cloud_url,
				{
					method: 'POST',
					mode: 'cors',
					// cache: 'no-cache',
					// headers: { 'Content-Type': 'application/json' }
					redirect: 'follow',
					referrerPolicy: 'no-referrer',
					body: 'apiService=token&userId=' + req.userId + '&brokerId=' + req.brokerId + '&accountId=&token=' + token
				}
			).then ( res => res.text ( ) )
		
		break
		default:
	}
	
	return true
})