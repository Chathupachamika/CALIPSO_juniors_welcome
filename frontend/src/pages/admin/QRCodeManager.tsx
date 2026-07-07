import { useEffect, useState } from 'react';
import { qrService } from '../../services/api';

interface QRCodeEntry {
  _id: string;
  code: string;
  label: string;
  points: number;
  isActive: boolean;
  scanCount: number;
}

export default function QRCodeManager() {
  const [codes, setCodes] = useState<QRCodeEntry[]>([]);
  const [label, setLabel] = useState('');
  const [points, setPoints] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadCodes = async () => {
    try {
      const res = await qrService.getAll();
      setCodes(res.data);
    } catch (err: any) {
      console.error('[QRCodeManager Error]', err);
      setError(err.response?.data?.error || 'Failed to load QR codes');
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await qrService.create(label, points);
      setLabel('');
      setPoints(10);
      await loadCodes();
    } catch (err: any) {
      console.error('[QR Create Error]', err);
      setError(err.response?.data?.error || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleShowImage = async (id: string) => {
    try {
      const res = await qrService.getImage(id);
      setPreviewImage(res.data.image);
      setPreviewUrl(res.data.url);
    } catch (err: any) {
      console.error('[QR Image Error]', err);
      setError(err.response?.data?.error || 'Failed to load QR image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this QR code? This cannot be undone.')) return;
    try {
      await qrService.delete(id);
      await loadCodes();
    } catch (err: any) {
      console.error('[QR Delete Error]', err);
      setError(err.response?.data?.error || 'Failed to delete QR code');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Secret QR Codes</h2>
      <p className="text-gray-500 mb-6">
        Create a code, print/download its QR image, and hide it somewhere on campus.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleCreate} className="flex gap-3 mb-8 flex-wrap items-end">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Label</label>
          <input
            className="input"
            placeholder="e.g. Library entrance"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Points</label>
          <input
            type="number"
            className="input w-24"
            min={1}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Creating...' : 'Create QR Code'}
        </button>
      </form>

      <div className="space-y-3">
        {codes.length === 0 && (
          <p className="text-gray-400 text-sm">No QR codes yet. Create one above.</p>
        )}

        {codes.map((qr) => (
          <div
            key={qr._id}
            className="flex items-center justify-between border rounded-lg p-4"
          >
            <div>
              <p className="font-semibold text-gray-900">{qr.label || '(no label)'}</p>
              <p className="text-sm text-gray-500">
                {qr.points} pts · scanned by {qr.scanCount} team(s)
                {!qr.isActive && <span className="ml-2 text-red-500">(inactive)</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleShowImage(qr._id)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm transition"
              >
                Show QR
              </button>
              <button
                onClick={() => handleDelete(qr._id)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-lg p-6 text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImage} alt="QR Code" className="mx-auto mb-3 w-full" />
            <p className="text-xs text-gray-500 mb-3 break-all">{previewUrl}</p>
            <div className="flex gap-2 justify-center">
              <a
                href={previewImage}
                download="qr-code.png"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Download PNG
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}