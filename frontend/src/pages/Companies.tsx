import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCompanies, getMyProfile, API_BASE_URL } from '../services/api';

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadCompanies = async (params?: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params?.q) queryParams.append('search', params.q);
      if (params?.industry) queryParams.append('industry', params.industry);
      if (params?.location) queryParams.append('location', params.location);

      const response = await fetch(`${API_BASE_URL}/api/jobs/companies/?${queryParams}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load companies');
      const data = await response.json();
      setCompanies(Array.isArray(data.results) ? data.results : data);
    } catch (err) {
      setError('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    getMyProfile().then(setProfile).catch(() => navigate('/login'));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCompanies({ q: search, industry, location });
  };



  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar role={profile?.role} username={profile?.username || localStorage.getItem('username') || ''} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0 }}>Companies</h1>
            <p style={{ color: '#64748b', marginTop: 6 }}>Discover and explore companies</p>
          </div>
          {profile?.role === 'RECRUITER' && (
            <button
              onClick={() => navigate('/companies/create')}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Create Company
            </button>
          )}
        </div>

        {message && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #86efac',
            color: '#166534', padding: '12px 16px', borderRadius: 10, marginBottom: 20,
          }}>{message}</div>
        )}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            color: '#991b1b', padding: '12px 16px', borderRadius: 10, marginBottom: 20,
          }}>{error}</div>
        )}

        {/* Filters */}
        <form onSubmit={handleSearch} style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 16, marginBottom: 32, padding: 20, background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: 14, fontFamily: 'inherit'
            }}
          />
          <input
            type="text"
            placeholder="Industry..."
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={{
              padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: 14, fontFamily: 'inherit'
            }}
          />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: 14, fontFamily: 'inherit'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#2563eb', color: 'white', border: 'none',
              padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>

        {/* Companies Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading companies...</div>
        ) : companies.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No companies found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {companies.map((company: any) => (
              <div
                key={company.id}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onClick={() => navigate(`/companies/${company.id}`)}
              >
                {/* Company Logo */}
                <div style={{
                  height: 140,
                  background: company.logo ? `url(${company.logo}) center/cover` : '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 700,
                  color: '#94a3b8',
                }}>
                  {!company.logo && company.name.charAt(0)}
                </div>

                {/* Company Info */}
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                    {company.name}
                  </h3>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: 13 }}>
                    {company.industry || 'N/A'}
                  </p>
                  <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: 13 }}>
                    📍 {company.location || 'N/A'}
                  </p>

                  {/* Description Preview */}
                  <p style={{
                    margin: '0 0 12px 0', color: '#475569', fontSize: 13,
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {company.description || 'No description'}
                  </p>

                  {/* Meta Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                    <span>📋 {company.jobs_count || 0} jobs</span>
                    <span>👥 {company.employee_count || 'N/A'} employees</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/companies/${company.id}`);
                      }}
                      style={{
                        flex: 1,
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
