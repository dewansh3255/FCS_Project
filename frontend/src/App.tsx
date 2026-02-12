// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
import { useEffect, useState } from 'react';
import { generateKeyPair, exportKey, encryptPrivateKey } from './utils/crypto';
import { uploadKeys } from './services/api'; // Import the new service

function App() {
  const [status, setStatus] = useState<string>("Initializing...");

  useEffect(() => {
    const runCryptoFlow = async () => {
      try {
        // 1. Generate Keys
        setStatus("Generating RSA Keys...");
        const keys = await generateKeyPair();
        
        // 2. Export Public Key
        const publicKeyBase64 = await exportKey(keys.publicKey);
        
        // 3. Encrypt Private Key (Mock Password for now)
        setStatus("Encrypting Private Key...");
        const privateKeyBase64 = await exportKey(keys.privateKey);
        const encryptedPrivateKey = await encryptPrivateKey(privateKeyBase64, "TestPass123");

        // 4. Upload to Backend
        setStatus("Uploading to Server...");
        await uploadKeys(publicKeyBase64, encryptedPrivateKey);

        setStatus("✅ Success! Keys generated, encrypted, and saved to DB.");
        console.log("Public Key:", publicKeyBase64);
        console.log("Encrypted Private Key:", encryptedPrivateKey);

      } catch (e: any) {
        console.error(e);
        setStatus(`❌ Error: ${e.message}`);
      }
    };

    runCryptoFlow();
  }, []);

  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Member B: Crypto Integration</h1>
      <div className={`p-4 rounded border ${status.includes("Error") ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"}`}>
        <p className="font-mono">{status}</p>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Check the Network Tab (F12) to see the POST request.
      </p>
    </div>
  );
}

export default App;