import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrService } from '../services/api';

type Status = 'loading' | 'success' | 'already' | 'error' | 'need-login';

export default function ScanPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const doScan = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('need-login');
        return;
      }

      try {
        const res = await qrService.scan(code!);
        setStatus('success');
        setMessage(res.data.message);
        setPoints(res.data.pointsAwarded);
      } catch (err: any) {
        if (err.response?.status === 409) {
          setStatus('already');
          setMessage(err.response.data.error);
        } else {
          setStatus('error');
          setMessage(err.response?.data?.error || 'Something went wrong');
        }
      }
    };

    doScan();
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && <p className="text-gray-600">Checking QR code...</p>}

        {status === 'need-login' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please log in first</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to claim points.</p>
            <button
              onClick={() => navigate(`/login?redirect=/scan/${code}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Success!</h2>
            <p className="text-gray-800">{message}</p>
            <p className="text-lg font-semibold mt-2">+{points} points for your team!</p>
          </>
        )}

        {status === 'already' && (
          <>
            <h2 className="text-xl font-semibold text-yellow-600 mb-2">Already claimed</h2>
            <p className="text-gray-700">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Oops</h2>
            <p className="text-gray-700">{message}</p>
          </>
        )}

        {status !== 'loading' && status !== 'need-login' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}