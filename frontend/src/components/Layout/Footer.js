import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{ background: 'var(--g-900)', color: 'white', marginTop: 'auto' }}>
      <div className="container mx-auto px-6" style={{ maxWidth: '1280px', paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>
          
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--g-600) 0%, var(--g-400) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'var(--gold-l)', fontSize: 14, fontFamily: "'Amiri', serif", fontWeight: 700 }}>إ</span>
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.01em' }}>IHSAN</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: '240px' }}>
              Plateforme de charité transparente et traçable. Chaque don, chaque besoin, chaque preuve — sur la blockchain.
            </p>
            <div style={{ marginTop: '1rem', padding: '12px', background: 'rgba(201,168,76,.08)', borderRadius: 8, borderLeft: '2px solid var(--gold)' }}>
              <p className="arabic" style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,.8)', lineHeight: 1.8 }}>إن الله يأمر بالعدل والإحسان</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '4px', letterSpacing: '0.04em' }}>Sourate An-Nahl : 90</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>Navigation</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[['/', 'Accueil'], ['/register', 'S\'inscrire'], ['/login', 'Connexion'], ['/donor', 'Catalogue dons']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontSize: '0.8125rem', transition: 'color .15s' }}
                    onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,.9)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.5)'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Project info */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>Projet</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['⛓', 'Blockchain Polygon Amoy'],
                ['📸', 'Photos floutées automatiquement'],
                ['🔒', 'Anonymat total des bénéficiaires'],
                ['📍', 'Validation terrain GPS'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,.5)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.3)' }}>© 2026 IHSAN — S3C'1447 Défi 2 — Ramadan 1447</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.25)' }}>React • Node.js • PostgreSQL</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.25)' }}>Polygon Amoy • Cloudinary</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;