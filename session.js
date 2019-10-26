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

document.addEventListener ( 'DOMContentLoaded', function () {
	document.getElementById ( 'btn_session' ).addEventListener ( 'click', function () {
		session2qrcode ( );
		document.getElementById ( 'btn_session' ).remove ( );
	} );
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

