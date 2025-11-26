import { useState, useEffect } from 'react';

const API_BASE = '/api';

function App() {
  const [view, setView] = useState('today');
  const [todayApod, setTodayApod] = useState(null);
  const [selectedApod, setSelectedApod] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalApod, setModalApod] = useState(null);

  // Fetch today's APOD
  useEffect(() => {
    if (view === 'today') {
      setLoading(true);
      setError(null);
      fetch(`${API_BASE}/apod`)
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setTodayApod(data);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [view]);

  // Fetch gallery
  useEffect(() => {
    if (view === 'gallery') {
      setLoading(true);
      setError(null);
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      fetch(`${API_BASE}/apod/range?start=${start}&end=${end}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setGallery(Array.isArray(data) ? data.reverse() : [data]);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [view]);

  // Fetch by date
  useEffect(() => {
    if (view === 'date' && selectedDate) {
      setLoading(true);
      setError(null);
      fetch(`${API_BASE}/apod/${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setSelectedApod(data);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [view, selectedDate]);

  const renderMedia = (apod, className = '') => {
    if (!apod) return null;
    if (apod.media_type === 'video') {
      return <iframe src={apod.url} title={apod.title} className={className} allowFullScreen />;
    }
    return <img src={apod.hdurl || apod.url} alt={apod.title} className={className} />;
  };

  const renderApodCard = (apod) => (
    <div className="today-apod" key={apod.date}>
      <div className="apod-media">{renderMedia(apod)}</div>
      <div className="apod-info">
        <h2>{apod.title}</h2>
        <span className="apod-date">📅 {apod.date}</span>
        <p className="apod-explanation">{apod.explanation}</p>
        {apod.copyright && <p className="apod-copyright">© {apod.copyright}</p>}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header>
        <h1>NASA APOD EXPLORER</h1>
        <p>Discover the cosmos, one picture at a time</p>
      </header>

      <nav className="nav-tabs">
        <button className={view === 'today' ? 'active' : ''} onClick={() => setView('today')}>
          TODAY'S APOD
        </button>
        <button className={view === 'date' ? 'active' : ''} onClick={() => setView('date')}>
          PICK A DATE
        </button>
        <button className={view === 'gallery' ? 'active' : ''} onClick={() => setView('gallery')}>
          GALLERY
        </button>
      </nav>

      <main>
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <span>Loading cosmic wonders...</span>
          </div>
        )}

        {error && (
          <div className="error">
            {error.includes('429') || error.includes('API') 
              ? '⚠️ API rate limit exceeded. Please wait a few minutes or add your own NASA API key.'
              : `Error: ${error}`}
          </div>
        )}

        {!loading && !error && view === 'today' && todayApod && renderApodCard(todayApod)}

        {!loading && view === 'date' && (
          <>
            <div className="date-picker-section">
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                min="1995-06-16"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            {!error && selectedApod && renderApodCard(selectedApod)}
          </>
        )}

        {!loading && !error && view === 'gallery' && (
          <div className="gallery-grid">
            {gallery.map((apod) => (
              <div key={apod.date} className="gallery-card" onClick={() => setModalApod(apod)}>
                <div className="gallery-card-media">
                  {apod.media_type === 'video' ? (
                    <img src={apod.thumbnail_url || `https://img.youtube.com/vi/${apod.url.match(/embed\/([^?]+)/)?.[1]}/hqdefault.jpg`} alt={apod.title} />
                  ) : (
                    <img src={apod.url} alt={apod.title} />
                  )}
                </div>
                <div className="gallery-card-info">
                  <h3>{apod.title}</h3>
                  <span>{apod.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalApod && (
          <div className="modal-overlay" onClick={() => setModalApod(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {modalApod.media_type === 'video' ? (
                <iframe src={modalApod.url} className="modal-image" style={{ height: '400px' }} allowFullScreen />
              ) : (
                <img src={modalApod.hdurl || modalApod.url} alt={modalApod.title} className="modal-image" />
              )}
              <div className="modal-info">
                <h2>{modalApod.title}</h2>
                <p style={{ marginBottom: '0.5rem', opacity: 0.6 }}>{modalApod.date}</p>
                <p>{modalApod.explanation}</p>
                {modalApod.copyright && <p style={{ marginTop: '1rem', opacity: 0.6 }}>© {modalApod.copyright}</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

