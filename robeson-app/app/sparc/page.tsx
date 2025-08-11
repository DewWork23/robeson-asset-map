'use client';

import { useEffect } from 'react';
import './sparc-styles.css';

export default function SparcPage() {
  useEffect(() => {
    // Add Inter font from Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="sparc-page-wrapper">
      <section className="page-hero">
        <div className="container">
          <h1>About SPARC</h1>
          <p className="page-hero-subtitle">Building a unified voice for substance prevention, treatment, and recovery in Robeson County</p>
        </div>
      </section>

      <section className="about-main">
        <div className="container">
          <div className="about-intro">
            <p className="lead">The Southeastern Prevention and Addiction Recovery Resource Center (SPARC) is funded by the Kate B. Reynolds Foundation and supports the Robeson Rural Communities Opioid Response Program (RCORP) Consortium.</p>
          </div>

          <div className="content-grid">
            <div className="content-section">
              <h2>Our Mission</h2>
              <div className="mission-statement">
                <p>To unite community resources and create accessible pathways to prevention, treatment, and recovery for all residents of Robeson County affected by substance use disorders.</p>
              </div>
              <p>We work to create one unified voice to address substance prevention, treatment, and recovery needs in the Robeson County community. Through collaboration with over 60 partner organizations, we're building a comprehensive support network for individuals and families affected by substance use disorders.</p>
            </div>

            <div className="content-section">
              <h2>Our Approach</h2>
              <div className="approach-cards">
                <div className="approach-card">
                  <h3>Collaborative</h3>
                  <p>Uniting over 60 partner organizations to create a comprehensive support network</p>
                </div>
                <div className="approach-card">
                  <h3>Data-Driven</h3>
                  <p>Using evidence-based strategies and tracking outcomes to ensure effectiveness</p>
                </div>
                <div className="approach-card">
                  <h3>Community-Focused</h3>
                  <p>Tailoring solutions to meet the unique needs of Robeson County's rural communities</p>
                </div>
                <div className="approach-card">
                  <h3>Holistic</h3>
                  <p>Addressing prevention, treatment, and recovery as interconnected components</p>
                </div>
              </div>
            </div>
          </div>

          <div className="timeline-section">
            <h2>Our Journey</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>2022</h3>
                  <p>SPARC established with initial funding from Kate B. Reynolds Foundation</p>
                  <p><strong>10 partner organizations</strong> join the consortium</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>2023</h3>
                  <p>Rapid expansion of partnership network</p>
                  <p>Implementation of evidence-based strategies across the county</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>2024</h3>
                  <p><strong>60+ partner organizations</strong> now part of the consortium</p>
                  <p>$1.178 million in Year 1 funding allocated across key service areas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="leadership-section">
            <h2>Consortium Structure</h2>
            <p>The Robeson Rural Communities Opioid Response Program (RCORP) Consortium operates as a collective impact model, bringing together diverse stakeholders to address the opioid epidemic comprehensively.</p>
            
            <div className="structure-visual">
              <div className="structure-center">
                <h3>RCORP Consortium</h3>
                <p>Central Coordination</p>
              </div>
              <div className="structure-branches">
                <div className="branch">
                  <h4>Healthcare Providers</h4>
                  <p>Treatment centers, hospitals, clinics</p>
                </div>
                <div className="branch">
                  <h4>Community Organizations</h4>
                  <p>Faith-based groups, nonprofits</p>
                </div>
                <div className="branch">
                  <h4>Government Partners</h4>
                  <p>County services, law enforcement</p>
                </div>
                <div className="branch">
                  <h4>Recovery Support</h4>
                  <p>Peer groups, housing services</p>
                </div>
              </div>
            </div>
          </div>

          <div className="values-section">
            <h2>Our Core Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">💙</div>
                <h3>Compassion</h3>
                <p>Meeting people where they are with dignity and respect</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Collaboration</h3>
                <p>Working together to create lasting change</p>
              </div>
              <div className="value-card">
                <div className="value-icon">📊</div>
                <h3>Accountability</h3>
                <p>Transparent reporting and measurable outcomes</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🌟</div>
                <h3>Hope</h3>
                <p>Believing in recovery and the potential for change</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Join Our Mission</h2>
          <p>Together, we can build a stronger, healthier Robeson County</p>
          <div className="cta-buttons">
            <a href="mailto:jordan.dew@uncp.edu" className="btn btn-secondary">Partner With Us</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>SPARC</h3>
              <p>Southeastern Prevention and Addiction Recovery Resource Center</p>
              <p>Funded by the Kate B. Reynolds Foundation</p>
            </div>
            <div className="footer-section">
              <h4>Emergency Resources</h4>
              <p><strong>Crisis Line:</strong> 1-800-XXX-XXXX</p>
              <p><strong>National Suicide Prevention:</strong> 988</p>
              <p><strong>SAMHSA Helpline:</strong> 1-800-662-4357</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SPARC. All rights reserved. | Serving Robeson County, North Carolina</p>
          </div>
        </div>
      </footer>
    </div>
  );
}