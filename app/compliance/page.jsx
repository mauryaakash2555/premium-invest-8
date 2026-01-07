/**
 * FILE: app\compliance\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import { useEffect } from 'react';
// COMPLETE COMPLIANCE PAGE - All Sections Included

export default function Compliance() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      

      {/* Hero Section */}
      <section
        style={{
          minHeight: '70vh',
          maxHeight: '70vh',
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage: 'url(/compliance-hero.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.65,
            filter: 'brightness(1.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              color: '#C0A062',
            }}
          >
            Regulatory Compliance & Investor Charter
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#C0A062',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Committed to transparency, integrity, and investor protection in accordance with IRDAI and AMFI regulations.
          </p>
        </div>
      </section>

      <div style={{
        minHeight: '100vh',
        background: '#000000',
        paddingTop: '60px',
        paddingBottom: '80px'
      }}>
        
        {/* Page Container */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          
          {/* Section 1: Investor Charter */}
          <section style={{
            marginBottom: '60px'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Investor Charter
            </h2>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Vision Statement
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '30px'
            }}>
              BM Wealth is committed to delivering transparent mutual fund distribution (AMFI ARN 90008) and IRDAI-licensed insurance advisory (License 277925) with the highest standards of integrity, transparency, and investor protection.
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Your Rights as an Investor
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  <strong style={{ color: '#E5E5E5' }}>Right to Fair Treatment:</strong> Equal and fair treatment without discrimination
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  <strong style={{ color: '#E5E5E5' }}>Right to Information:</strong> Complete and accurate disclosure of all material information
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  <strong style={{ color: '#E5E5E5' }}>Right to Suitability:</strong> Investment advice suitable to your risk profile and financial goals
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  <strong style={{ color: '#E5E5E5' }}>Right to Privacy:</strong> Protection of your personal and financial information
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '30px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  <strong style={{ color: '#E5E5E5' }}>Right to Grievance Redressal:</strong> Access to fair and timely resolution of complaints
                </p>
              </div>
            </div>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Your Responsibilities as an Investor
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Conduct thorough research and due diligence before making investment decisions
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Provide complete and accurate information about your financial situation and risk appetite
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Read all documents carefully, including terms and conditions, before signing
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Keep records of all transactions and communications with your advisor
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Report any suspicious activity or concerns promptly
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '30px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Stay informed about market conditions and review your portfolio regularly
                </p>
              </div>
            </div>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Our Commitments to You
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Provide investment advice based on thorough analysis and your best interests
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Maintain transparency in all dealings and disclose any conflicts of interest
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Protect your confidential information and ensure data security
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Comply with all IRDAI and AMFI regulations and industry best practices
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Provide timely and accurate information about your investments
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '30px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Address your concerns and grievances promptly and fairly
                </p>
              </div>
            </div>
            
            {/* License Info Box */}
            <div style={{
              background: 'rgba(218, 165, 32, 0.05)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.3)',
              marginTop: '30px'
            }}>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#DAA520' }}>IRDAI License Number:</strong> 277925
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#DAA520' }}>AMFI Registration:</strong> ARN 90008
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#DAA520' }}>Validity:</strong> Perpetual (subject to regulatory compliance)
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#DAA520' }}>Regulatory Bodies:</strong> IRDAI (Insurance) | AMFI (Mutual Funds)
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                margin: '0'
              }}>
                <strong style={{ color: '#DAA520' }}>Principal Officer:</strong> Brahmdeo Maurya
              </p>
            </div>
            
          </section>
          
          {/* Section 2: Grievance Redressal Mechanism */}
          <section style={{
            marginBottom: '60px',
            paddingLeft: '0'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Grievance Redressal Mechanism
            </h2>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              How to File a Complaint
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '24px'
            }}>
              We are committed to addressing your concerns promptly and fairly. If you have any grievances regarding our services, please follow the process outlined below:
            </p>
            
            <div style={{
              background: 'rgba(218, 165, 32, 0.05)',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '16px'
              }}>
                Step 1: Contact Us Directly
              </h4>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#E5E5E5' }}>Phone:</strong> +91 8850977259
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#E5E5E5' }}>Email:</strong> support@bmwealth.co.in
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                margin: '0'
              }}>
                <strong style={{ color: '#E5E5E5' }}>Grievance Email:</strong> grievance@bmwealth.co.in
              </p>
            </div>
            
            <div style={{
              background: 'rgba(218, 165, 32, 0.05)',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '16px'
              }}>
                Step 2: Written Complaint
              </h4>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '12px'
              }}>
                If your concern is not resolved through initial contact, please submit a written complaint including:
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '12px',
                paddingLeft: '0',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  width: '3px',
                  height: '20px',
                  background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                  borderRadius: '2px'
                }}></div>
                <div style={{ paddingLeft: '16px', width: '100%' }}>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#B8B8B8',
                    margin: 0
                  }}>
                    Your name and contact details
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '12px',
                paddingLeft: '0',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  width: '3px',
                  height: '20px',
                  background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                  borderRadius: '2px'
                }}></div>
                <div style={{ paddingLeft: '16px', width: '100%' }}>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#B8B8B8',
                    margin: 0
                  }}>
                    Client ID or account reference number
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '12px',
                paddingLeft: '0',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  width: '3px',
                  height: '20px',
                  background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                  borderRadius: '2px'
                }}></div>
                <div style={{ paddingLeft: '16px', width: '100%' }}>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#B8B8B8',
                    margin: 0
                  }}>
                    Detailed description of the grievance
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '12px',
                paddingLeft: '0',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  width: '3px',
                  height: '20px',
                  background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                  borderRadius: '2px'
                }}></div>
                <div style={{ paddingLeft: '16px', width: '100%' }}>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#B8B8B8',
                    margin: 0
                  }}>
                    Supporting documents (if any)
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0',
                paddingLeft: '0',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  width: '3px',
                  height: '20px',
                  background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                  borderRadius: '2px'
                }}></div>
                <div style={{ paddingLeft: '16px', width: '100%' }}>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#B8B8B8',
                    margin: 0
                  }}>
                    Expected resolution
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(218, 165, 32, 0.05)',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '30px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#DAA520',
                marginBottom: '16px'
              }}>
                Step 3: Escalation to Regulatory Authorities
              </h4>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '16px'
              }}>
                If you are not satisfied with our resolution, you may escalate your complaint to the respective regulatory authorities:
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#E5E5E5' }}>AMFI Complaints:</strong>
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '16px'
              }}>
                Website: <a href="https://www.amfiindia.com" target="_blank" rel="noopener noreferrer" style={{ color: '#DAA520', textDecoration: 'none' }}>https://www.amfiindia.com</a>
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                marginBottom: '8px'
              }}>
                <strong style={{ color: '#E5E5E5' }}>IRDAI Grievance Redressal:</strong>
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#B8B8B8',
                margin: '0'
              }}>
                Website: <a href="https://www.irdai.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#DAA520', textDecoration: 'none' }}>https://www.irdai.gov.in</a>
              </p>
            </div>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Resolution Timeline
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  <strong style={{ color: '#E5E5E5' }}>Acknowledgment:</strong> Within 3 working days of receiving the complaint
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  <strong style={{ color: '#E5E5E5' }}>Initial Response:</strong> Within 7 working days with status update
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '24px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  <strong style={{ color: '#E5E5E5' }}>Resolution:</strong> Within 30 days from the date of receipt
                </p>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(218, 165, 32, 0.1)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.3)'
            }}>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#DAA520',
                fontWeight: '600',
                margin: '0'
              }}>
                Important Note: Please keep a copy of your complaint and all correspondence for your records. We are committed to resolving all grievances in a fair, transparent, and timely manner in accordance with regulatory guidelines.
              </p>
            </div>
            
          </section>
          
          {/* Section 3: Regulatory Disclosures & Licenses */}
          <section style={{
            marginBottom: '60px'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Regulatory Disclosures & Licenses
            </h2>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Insurance Advisory Services
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>IRDAI License Number:</strong> 277925
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Service Type:</strong> Insurance Advisory
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '30px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Principal Officer:</strong> Brahmdeo Maurya
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Mutual Fund Distribution Services
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>AMFI Registration:</strong> ARN 90008
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Validity:</strong> Perpetual (subject to regulatory compliance)
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '30px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Principal Officer:</strong> Brahmdeo Maurya
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Additional Advisory Services
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Portfolio Management Services (PMS) - Advisory & Referral Services
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Fixed Deposit (FD) Advisory Services
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '30px',
              paddingLeft: '0',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '3px',
                height: '20px',
                background: 'linear-gradient(180deg, #DAA520 0%, #C0A062 100%)',
                borderRadius: '2px'
              }}></div>
              <div style={{ paddingLeft: '16px', width: '100%' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#B8B8B8',
                  margin: 0
                }}>
                  Investment Planning & Financial Consulting
                </p>
              </div>
            </div>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Registered Office
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '8px'
            }}>
              66, Vinod Villa Bldg., 1st floor office no. 108
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '8px'
            }}>
              Cavel Cross Lane 3, Kalbadevi
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '30px'
            }}>
              Mumbai - 400002, Maharashtra, India
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Regulatory Authorities
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>IRDAI (Insurance Regulatory and Development Authority of India)</strong>
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '24px'
            }}>
              Website: <a href="https://www.irdai.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#DAA520', textDecoration: 'none' }}>www.irdai.gov.in</a>
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>AMFI (Association of Mutual Funds in India)</strong>
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '30px'
            }}>
              Website: <a href="https://www.amfiindia.com" target="_blank" rel="noopener noreferrer" style={{ color: '#DAA520', textDecoration: 'none' }}>www.amfiindia.com</a>
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              marginTop: '30px',
              marginBottom: '16px'
            }}>
              Grievance Redressal Mechanism
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Email:</strong> grievance@bmwealth.co.in
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Phone:</strong> +91 8850977259
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#B8B8B8',
              marginBottom: '30px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Response Time:</strong> Within 7 working days
            </p>
            
          </section>
          
          {/* Section 4: Compliance Statement */}
          <section style={{
            marginBottom: '60px'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Compliance Statement
            </h2>
            
            <div style={{
              background: 'rgba(218, 165, 32, 0.1)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.3)'
            }}>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#888888',
                margin: '0'
              }}>
                BM Wealth is an <strong style={{ color: '#999999' }}>IRDAI Licensed Insurance Advisor (License No. 277925)</strong> and <strong style={{ color: '#999999' }}>AMFI Registered Mutual Fund Distributor (ARN 90008)</strong>. <strong style={{ color: '#999999' }}>PMS Certification No. 2430447816</strong>. Portfolio management services (PMS) and fixed-deposit products, where applicable, are offered by regulated third-party providers; BM Wealth may assist with introductions and execution support.
              </p>
            </div>
            
          </section>
          
          {/* Section 5: Investment Disclaimer */}
          <section style={{
            marginBottom: '0'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: '600',
              color: '#DAA520',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Investment Disclaimer
            </h2>
            
            <div style={{
              background: 'rgba(218, 165, 32, 0.1)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(218, 165, 32, 0.3)'
            }}>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#DAA520',
                fontWeight: '600',
                margin: '0'
              }}>
                Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
              </p>
            </div>
            
          </section>
          
        </div>
        
      </div>
    </>
  );
}
