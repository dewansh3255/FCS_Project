import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { registerUser, getTOTPSetupURI, verifyTOTPCode, uploadKeys } from '../services/api';
import { generateAndWrapKeys } from '../utils/crypto'; // <--- ADD THIS
import VirtualKeyboard from '../components/VirtualKeyboard';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Form, 2 = 2FA Setup
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrUri, setQrUri] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', phone_number: ''
  });

  // Step 1: Submit the Registration Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await registerUser(formData);
      setSessionId(data.session_id);
      setQrUri(data.qr_uri);
      setStep(2); // Move to QR Code screen
    } catch (err: any) {
      setError(err.message);
      return;
    }
  };

  // Step 2: Verify their first OTP
  // Step 2: Verify their first OTP and Generate Keys
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!sessionId) return;

    try {
      // 1. Verify TOTP (This creates the user, logs the user in and sets cookie!)
      const data = await verifyTOTPCode(sessionId, otpCode);

      localStorage.setItem('username', formData.username);
      
      // 2. Now that we are logged in, generate the RSA keys and wrap them with the password
      setSuccess("Securing account with End-to-End Encryption...");
      const { publicKey, encryptedPrivateKey } = await generateAndWrapKeys(formData.password, formData.username);

      // 3. Upload them to our new endpoint
      await uploadKeys(publicKey, encryptedPrivateKey);

      if (data.backup_codes && data.backup_codes.length > 0) {
        setBackupCodes(data.backup_codes);
        setSuccess("Account secured! Please save your backup codes.");
        setStep(3); // Move to Backup Codes screen
      } else {
        setSuccess("Account secured! Redirecting to dashboard...");
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err: any) {
      setOtpCode(''); // auto-clear on error so keyboard works
      setError(err.message || 'Verification failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        {success && <p className="text-green-600 font-bold mb-4 text-center">{success}</p>}

        {step === 1 && (
          <form onSubmit={handleRegisterSubmit}>
            <input type="text" placeholder="Username" required
              className="w-full border p-2 mb-4 rounded"
              onChange={e => setFormData({ ...formData, username: e.target.value })} />
            <input type="email" placeholder="Email" required
              className="w-full border p-2 mb-4 rounded"
              onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <input type="password" placeholder="Password" required
              className="w-full border p-2 mb-4 rounded"
              onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <input type="tel" placeholder="Phone Number"
              className="w-full border p-2 mb-6 rounded"
              onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Sign Up & Setup 2FA
            </button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-blue-600 underline">Login</button>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifySubmit} className="flex flex-col items-center">
            <div className="mb-6 p-2 border-2 rounded flex flex-col items-center">
              <p className="font-bold mb-2">Setup Authenticator</p>
              {qrUri ? <QRCodeSVG value={qrUri} size={150} /> : <p>Loading QR...</p>}
              <p className="text-xs text-center mt-2 text-gray-500">Scan with Microsoft Authenticator</p>
            </div>

            <input type="text" placeholder="••••••" value={otpCode} readOnly
              className="w-full border p-2 mb-4 rounded text-center tracking-widest text-2xl font-mono bg-slate-50 outline-none"
            />
            <VirtualKeyboard
              disabled={otpCode.length >= 6}
              onKeyPress={(key) => setOtpCode(prev => (prev.length < 6 ? prev + key : prev))}
              onDelete={() => setOtpCode(prev => prev.slice(0, -1))}
              onClear={() => setOtpCode('')}
            />
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
              Verify & Complete Registration
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-red-600">⚠️ Save These Codes!</h3>
            <p className="text-sm text-center text-gray-700 mb-4">
              If you lose access to your Authenticator app, these are your ONLY way to log back in. They will never be shown again.
            </p>
            <div className="w-full bg-slate-50 p-4 rounded border-2 border-dashed border-gray-300 grid grid-cols-2 gap-2 mb-6">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="font-mono text-sm tracking-wider text-center font-bold bg-white p-2 border rounded">
                  {code}
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700 shadow shadow-blue-500/30"
            >
              I have saved them. Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}