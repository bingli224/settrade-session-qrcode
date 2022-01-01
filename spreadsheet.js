try {
	// import {jQuery as $} from 'jquery.min'
	// import {jQuery as $} from 'jquery.min'
	// import 'jquery.min'
	self.importScripts ('jquery.min.js')
	// importScripts ('jquery.min.js')
} catch (e) {
	console.error(e)
}

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
	})

	$("#btn_export_session").on ('click', async (e) => {
		await exportConfig ( )
	})

	// get config
	chrome.storage.local.get ([ 'cloud_url', 'userId', 'brokerId' ], (cfg) => {
		console.log("init: restore: " + JSON.stringify(cfg, undefined, 4))
		$('#cloud_url').val(cfg.cloud_url ?? "")
		$('#userId').val(cfg.userId ?? "")
		$('#brokerId').val(cfg.brokerId ?? "")
	})
} )

async function importConfig ( ) {
	const cfg = await chrome.storage.local.get ([ 'cloud_url', 'userId', 'brokerId' ])

	return await chrome.runtime.sendMessage ( undefined, {
			mode: 'import',
			cloud_url: cfg.cloud_cfg,
			userId: cfg.userId,
			brokerId: cfg.brokerId,
			accountId: cfg.accountId
		}, 
		undefined,	// optional object if use Tls as in doc
	)
}

async function exportConfig (config) {
	var cfg = await chrome.storage.local.get([ 'cloud_url' ])
	
	console.log('exportConfig(..)')
	
	return await chrome.runtime.sendMessage ( undefined, {
			mode: 'export',
			cloud_url: cfg.cloud_cfg,
			userId: cfg.userId,
			brokerId: cfg.brokerId,
			accountId: cfg.accountId
		}, 
		undefined,	// optional object if use Tls as in doc
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