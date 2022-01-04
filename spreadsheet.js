'use strict'

document.addEventListener ( 'DOMContentLoaded', function () {

	$("#btn_save").on ('click', async (e) => {
		await chrome.storage.local.set ( {
			"cloud_url": document.getElementById("cloud_url").value,
			"userId": document.getElementById("userId").value,
			"brokerId": document.getElementById("brokerId").value,
		} )
	})

	$("#btn_import_session").on ('click', async (e) => {
		await importConfig ( )
		return true
	})

	$("#btn_export_session").on ('click', async (e) => {
		await exportConfig ( )
		return true
	})

	// get config
	chrome.storage.local.get ([ 'cloud_url', 'userId', 'brokerId' ], (cfg) => {
		console.log("init: restore: " + JSON.stringify(cfg, undefined, 4))
		$('#cloud_url').val(cfg.cloud_url ?? "")
		$('#userId').val(cfg.userId ?? "")
		$('#brokerId').val(cfg.brokerId ?? "")
	})
	
	$('#btn_get_cookies').on('click', async (e) => {
		await test_cookies()
	})
} )

async function importConfig ( ) {
	const retn = await chrome.storage.local.get (
		[ 'cloud_url', 'userId', 'brokerId' ],
		async cfg => {
			console.log('importConfig(): local.get(): callbacl(): param=' + JSON.stringify(cfg, undefined, 4))
			return await chrome.runtime.sendMessage ( undefined, {
					mode: 'import',
					cloud_url: cfg.cloud_url,
					userId: cfg.userId,
					brokerId: cfg.brokerId,
					accountId: cfg.accountId ?? ""
				}, 
				retn => {
					console.log('importConfig(): sendMessage(): callback(): retn=' + retn)
					return retn
				}
			)
		}
		// undefined,	// optional object if use Tls as in doc
	)
	console.log('importConfig(): retn=' + retn)
	
	return retn
}

async function exportConfig ( ) {
	let cloud_url = $('#cloud_url').val() ?? ""
	let userId = $('#userId').val() ?? ""
	let brokerId = $('#brokerId').val() ?? ""
	let accountId = $('#accountId').val() ?? ""
	
	console.log('exportConfig(): cloud_url: ' + cloud_url)
	console.log('exportConfig(): userId: ' + userId)
	console.log('exportConfig(): brokerId: ' + brokerId)
	console.log('exportConfig(): accountId: ' + accountId)

	return await chrome.runtime.sendMessage ( undefined, {
			mode: 'export',
			cloud_url: cloud_url,
			userId: userId,
			brokerId: brokerId,
			accountId: accountId
		},
		retn => {
			console.log('exportConfig(): sendMessage(): callbacl(): retn=' + retn)
			return retn
		}
		// undefined,	// optional object if use Tls as in doc
	)
}

/**
 * Find userId and brokerId, and save into the local storage.
 * 
 * @returns Undefined if successfully updated. Exception if being caught.
 */
async function updateUser ( ) {
	const uKey = await chrome.cookies.get (
		{
			url	: "https://*.settrade.com",
			name	: "__txtUKey"
		}
	).split ( '_', 2 )
	try {
		const userId = uKey [0]
		const brokerId = uKey [1]
		
		await chrome.storage.local.set ({'userId': userId, 'brokerId': brokerId})
		
		return undefined
	} catch (e) {
		return e
	}
	
}


/**
 * Test: get cookies
 * 
 * @returns 
 */
async function test_cookies() {
	// TEST
	const cookieUrl = $('#cookies_url').val() ?? ''
	try {
		let params = {}
		if (document.querySelector('#chk_cookies_url').checked)
			params.url = $('#cookies_url').val() ?? ''
		if (document.querySelector('#chk_cookies_domain').checked)
			params.domain = $('#cookies_domain').val() ?? ''

		await chrome.cookies.getAll (
			params,
			cookies => {
				console.log(JSON.stringify(cookies, undefined, 4))
				$('#content').val(JSON.stringify(cookies, undefined, 4))
				return cookies
			}
		)
	} catch (e) {
		$('#content').val(e)
		console.error(e)
	}
	
}