
// https://github.com/bingli224/dom-examples/blob/master/web-crypto/encrypt-decrypt/aes-gcm.js

// (() => {

  /*
  Store the calculated ciphertext and IV here, so we can decrypt the message later.
  */
  // let ciphertext;
  // let iv;

  /*
  Fetch the contents of the "message" textbox, and encode it
  in a form we can use for the encrypt operation.
  */
  // function getMessageEncoding() {
  //   const messageBox = document.querySelector("#aes-gcm-message");
  //   let message = messageBox.value;
  //   let enc = new TextEncoder();
  //   return enc.encode(message);
  // }

  /*
  Get the encoded message, encrypt it and display a representation
  of the ciphertext in the "Ciphertext" element.
  */
  // async function encryptMessage(key) {
  //   let encoded = getMessageEncoding();
  //   // The iv must never be reused with a given key.
  //   iv = window.crypto.getRandomValues(new Uint8Array(12));
  //   ciphertext = await window.crypto.subtle.encrypt(
  //     {
  //       name: "AES-GCM",
  //       iv: iv
  //     },
  //     key,
  //     encoded
  //   );

  //   let buffer = new Uint8Array(ciphertext, 0, 5);
  //   const ciphertextValue = document.querySelector(".aes-gcm .ciphertext-value");
  //   ciphertextValue.classList.add('fade-in');
  //   ciphertextValue.addEventListener('animationend', () => {
  //     ciphertextValue.classList.remove('fade-in');
  //   });
  //   ciphertextValue.textContent = `${buffer}...[${ciphertext.byteLength} bytes total]`;
  // }

  /*
  Fetch the ciphertext and decrypt it.
  Write the decrypted message into the "Decrypted" box.
  */
  // async function decryptMessage(key) {
  //   let decrypted = await window.crypto.subtle.decrypt(
  //     {
  //       name: "AES-GCM",
  //       iv: iv
  //     },
  //     key,
  //     ciphertext
  //   );

  //   let dec = new TextDecoder();
  //   const decryptedValue = document.querySelector(".aes-gcm .decrypted-value");
  //   decryptedValue.classList.add('fade-in');
  //   decryptedValue.addEventListener('animationend', () => {
  //     decryptedValue.classList.remove('fade-in');
  //   });
  //   decryptedValue.textContent = dec.decode(decrypted);
  // }

  /*
  Generate an encryption key, then set up event listeners
  on the "Encrypt" and "Decrypt" buttons.
  */
  // window.crypto.subtle.generateKey(
  //   {
  //       name: "AES-GCM",
  //       length: 256,
  //   },
  //   true,
  //   ["encrypt", "decrypt"]
  // ).then((key) => {
  //   const encryptButton = document.querySelector(".aes-gcm .encrypt-button");
  //   encryptButton.addEventListener("click", () => {
  //     encryptMessage(key);
  //   });

  //   const decryptButton = document.querySelector(".aes-gcm .decrypt-button");
  //   decryptButton.addEventListener("click", () => {
  //     decryptMessage(key);
  //   });
  // });

// })();

// 20:45 THA 26/12/2021

async function getKey ( ) {
  if(!key) {
    key = await crypto.subtle.importKey(
      "raw",
      Uint8Array.from([150, 132, 190, 125, 86, 2, 167, 170, 116, 12, 253, 119, 217, 192, 1, 101]),
      "AES-GCM",
      true,
      ['encrypt', 'decrypt']
    )
  }

  return key

}

async function generateIV () {
  return await crypto.getRandomValues(new Uint8Array(16))  // for 128-bit VI
}

async function encrypt (raw) {
  const iv = await generateIV()

  console.log("encrypt(): iv=" + iv)
  const iv_str = btoa(String.fromCharCode(...
    iv
    // new Uint8Array(
  //   await crypto.subtle.exportKey (
  //     "raw",
  //     iv
  //   )
    // )
  ))
  console.log("encrypt(): base64 iv[" + iv_str.length + "]=" + iv_str)
  console.log("encrypt(): key=" + await getKey())
  
  return iv_str + btoa(
    String.fromCharCode(...new Uint8Array(
      await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        await getKey(),
        te.encode(raw)
      )
    ))
  )
}

async function decrypt (cipher) {
  // const key = await generateIV()
  
  // console.log("decrypt(): iv=" + iv)
  // console.log("decrypt(): key=" + await getKey())
  // console.log("decrypt(): cipher=" + cipher)
  // console.log("decrypt(): atob(cipher)=" + atob(cipher))
  // console.log("decrypt(): uint8array(atob(cipher))=" + Uint8Array.from(atob(cipher), c => c.charCodeAt(0)))
  // console.log("decrypt(): uint8array(atob(cipher)).buffer=" + Uint8Array.from(atob(cipher), c => c.charCodeAt(0)).buffer)
  
  // split iv
  const iv = (
    cipher.substring(0, 24)  // for 128 iv size
  )
  cipher = cipher.substring(24, cipher.length)

  console.log("iv:\t" + iv + "\ncipher:\t" + cipher)
  
  try {
    const data = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)).buffer
      },
      await getKey(),
      Uint8Array.from(atob(cipher), c => c.charCodeAt(0)).buffer
    )

    console.log("decrypt(): decoded=" + data)
    
    return td.decode(data)
  } catch(e) {
    console.error(e)
    return null
  }
}

// const key = Uint8Array.from([150, 132, 190, 125, 86, 2, 167, 170, 116, 12, 253, 119, 217, 192, 1, 101])
let key = null  // see getKey()
const te = new TextEncoder ( )
const td = new TextDecoder ( )