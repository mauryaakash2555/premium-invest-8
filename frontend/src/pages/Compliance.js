import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

// COMPLETE COMPLIANCE PAGE - All Sections Included

export default function Compliance() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Regulatory Compliance & Investor Charter | BM Wealth Mumbai ARN 90008</title>
        <meta name="description" content="BM Wealth regulatory compliance, investor charter, grievance redressal mechanism. IRDAI Licensed and AMFI Registered ARN 90008. Transparent and regulated financial advisory in Mumbai." />
        <meta name="keywords" content="regulatory compliance, investor charter, ARN 90008, IRDAI licensed, AMFI registered, investment advisor compliance, grievance redressal, investor protection" />
        <link rel="canonical" href="https://www.bmwealth.co.in/compliance" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/compliance" />
        <meta property="og:title" content="Regulatory Compliance & Investor Charter | BM Wealth ARN 90008" />
        <meta property="og:description" content="Regulatory compliance, investor charter, and grievance redressal. IRDAI Licensed and AMFI Registered ARN 90008." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.bmwealth.co.in/compliance" />
        <meta name="twitter:title" content="Regulatory Compliance & Investor Charter | BM Wealth" />
        <meta name="twitter:description" content="Regulatory compliance, investor charter, and grievance redressal. IRDAI Licensed and AMFI Registered ARN 90008." />
        <meta name="twitter:image" content="https://www.bmwealth.co.in/logo.webp" />
      </Helmet>

      {/* Hero Section */}
      <section
        style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '80px',
          background: '#000000',
        }}
      >
        {/* Background Gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)',
          }}
        />
        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '1200px', padding: '0 20px' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '48px',
              fontWeight: '700',
              color: '#B8860B',
              marginBottom: '24px',
              textAlign: 'center',
              lineHeight: '1.2',
            }}
          >
            Regulatory Compliance & Investor Protection
          </h1>
        </div>
      </section>

      <div style={{
        background: '#000000',
        padding: '40px 0',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <section style={{
            width: '100%',
            textAlign: 'justify',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '0 0 24px 0',
              padding: 0,
              lineHeight: '1.3'
            }}>
              Investor Charter
            </h2>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '24px 0 16px 0',
              padding: 0
            }}>
              Vision Statement
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              margin: '0 0 24px 0',
              padding: 0,
              textAlign: 'justify',
              width: '100%'
            }}>
              BM Wealth is committed to providing professional investment advisory services with the highest standards of integrity, transparency, and investor protection in accordance with IRDAI and AMFI regulations.
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '24px 0 16px 0',
              padding: 0
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
                }}>
                  <strong style={{ color: '#e5e5e5' }}>Right to Fair Treatment:</strong> Equal and fair treatment without discrimination
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
                }}>
                  <strong style={{ color: '#e5e5e5' }}>Right to Information:</strong> Complete and accurate disclosure of all material information
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
                }}>
                  <strong style={{ color: '#e5e5e5' }}>Right to Suitability:</strong> Investment advice suitable to your risk profile and financial goals
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
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                margin: 0,
                textAlign: 'justify'
              }}>
                <strong style={{ color: '#e5e5e5' }}>Right to Grievance Redressal:</strong> Access to fair and timely resolution of complaints
              </p>
            </div>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              margin: '25px 0 15px 0',
              padding: 0
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                margin: 0,
                textAlign: 'justify'
              }}>
                Stay informed about market conditions and review your portfolio regularly
              </p>
            </div>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '24px 0 16px 0',
              padding: 0
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                margin: 0,
                textAlign: 'justify'
              }}>
                Address your concerns and grievances promptly and fairly
              </p>
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
            marginBottom: '24px',
            paddingLeft: '0'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Grievance Redressal Mechanism
            </h2>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '24px 0 16px 0',
              padding: 0
            }}>
              How to File a Complaint
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              margin: '0 0 24px 0',
              padding: 0,
              textAlign: 'justify'
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
                fontSize: '24px',
                fontWeight: '600',
                color: '#B8860B',
                marginBottom: '16px'
              }}>
                Step 1: Contact Us Directly
              </h4>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                marginBottom: '8px',
                textAlign: 'justify'
              }}>
                <strong style={{ color: '#e5e5e5' }}>Phone:</strong> +91 8850977259
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                marginBottom: '8px',
                textAlign: 'justify'
              }}>
                <strong style={{ color: '#e5e5e5' }}>Email:</strong> mauryaakash2555@gmail.com
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                margin: '0',
                textAlign: 'justify'
              }}>
                <strong style={{ color: '#e5e5e5' }}>Grievance Email:</strong> grievance@bmwealth.co.in
              </p>
            </div>
            
            <div style={{
              background: 'rgba(218, 165, 32, 0.05)',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#B8860B',
                marginBottom: '16px'
              }}>
                Step 2: Written Complaint
              </h4>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                marginBottom: '12px',
                textAlign: 'justify'
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
                    lineHeight: '1.7',
                    color: '#e5e5e5',
                    margin: 0,
                    textAlign: 'justify'
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
                    lineHeight: '1.7',
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
                    lineHeight: '1.7',
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
                    lineHeight: '1.7',
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
                    lineHeight: '1.7',
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
                fontSize: '24px',
                fontWeight: '600',
                color: '#B8860B',
                marginBottom: '16px'
              }}>
                Step 3: Escalation to Regulatory Authorities
              </h4>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                marginBottom: '16px',
                textAlign: 'justify'
              }}>
                If you are not satisfied with our resolution, you may escalate your complaint to the respective regulatory authorities:
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                marginBottom: '8px',
                textAlign: 'justify'
              }}>
                <strong style={{ color: '#e5e5e5' }}>AMFI Complaints:</strong>
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                marginBottom: '16px',
                textAlign: 'justify'
              }}>
                Website: <a href="https://www.amfiindia.com" target="_blank" rel="noopener noreferrer" style={{ color: '#B8860B', textDecoration: 'none' }}>https://www.amfiindia.com</a>
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                marginBottom: '8px',
                textAlign: 'justify'
              }}>
                <strong style={{ color: '#e5e5e5' }}>IRDAI Grievance Redressal:</strong>
              </p>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                margin: '0',
                textAlign: 'justify'
              }}>
                Website: <a href="https://www.irdai.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#B8860B', textDecoration: 'none' }}>https://www.irdai.gov.in</a>
              </p>
            </div>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              margin: '25px 0 15px 0',
              padding: 0
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
                }}>
                  <strong style={{ color: '#e5e5e5' }}>Acknowledgment:</strong> Within 3 working days of receiving the complaint
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
                  lineHeight: '1.7',
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
                }}>
                  <strong style={{ color: '#e5e5e5' }}>Resolution:</strong> Within 30 days from the date of receipt
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
                lineHeight: '1.7',
                color: '#B8860B',
                fontWeight: '600',
                margin: '0',
                textAlign: 'justify'
              }}>
                Important Note: Please keep a copy of your complaint and all correspondence for your records. We are committed to resolving all grievances in a fair, transparent, and timely manner in accordance with regulatory guidelines.
              </p>
            </div>
            
          </section>
          
          {/* Section 3: Regulatory Disclosures & Licenses */}
          <section style={{
            marginBottom: '24px',
            paddingLeft: '0'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Regulatory Disclosures & Licenses
            </h2>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '24px 0 16px 0',
              padding: 0
            }}>
              Insurance Advisory Services
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              marginBottom: '12px',
              textAlign: 'justify'
            }}>
              <strong style={{ color: '#e5e5e5' }}>IRDAI License Number:</strong> 277925
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              marginBottom: '12px',
              textAlign: 'justify'
            }}>
              <strong style={{ color: '#e5e5e5' }}>Service Type:</strong> Insurance Advisory
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              margin: '0 0 24px 0',
              padding: 0,
              textAlign: 'justify',
              width: '100%'
            }}>
              <strong style={{ color: '#e5e5e5' }}>Principal Officer:</strong> Brahmdeo Maurya
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              margin: '25px 0 15px 0',
              padding: 0
            }}>
              Mutual Fund Distribution Services
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>AMFI Registration:</strong> ARN 90008
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#B8B8B8',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Validity:</strong> Perpetual (subject to regulatory compliance)
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#B8B8B8',
              margin: '0 0 30px 0',
              padding: 0,
              textAlign: 'left',
              width: '100%'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Principal Officer:</strong> Brahmdeo Maurya
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '24px 0 16px 0',
              padding: 0
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
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
                  lineHeight: '1.7',
                  color: '#e5e5e5',
                  margin: 0,
                  textAlign: 'justify'
                }}>
                  Investment Planning & Financial Consulting
                </p>
              </div>
            </div>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '24px 0 16px 0',
              padding: 0
            }}>
              Registered Office
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              marginBottom: '8px',
              textAlign: 'justify'
            }}>
              66, Vinod Villa Bldg., 1st floor office no. 108
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              marginBottom: '8px',
              textAlign: 'justify'
            }}>
              Cavel Cross Lane 3, Kalbadevi
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              margin: '0 0 24px 0',
              padding: 0,
              textAlign: 'justify',
              width: '100%'
            }}>
              Mumbai - 400002, Maharashtra, India
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              margin: '24px 0 16px 0',
              padding: 0
            }}>
              Regulatory Authorities
            </h3>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              marginBottom: '12px',
              textAlign: 'justify'
            }}>
              <strong style={{ color: '#e5e5e5' }}>IRDAI (Insurance Regulatory and Development Authority of India)</strong>
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              marginBottom: '24px',
              textAlign: 'justify'
            }}>
              Website: <a href="https://www.irdai.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#B8860B', textDecoration: 'none' }}>www.irdai.gov.in</a>
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              marginBottom: '12px',
              textAlign: 'justify'
            }}>
              <strong style={{ color: '#e5e5e5' }}>AMFI (Association of Mutual Funds in India)</strong>
            </p>
            
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#e5e5e5',
              margin: '0 0 24px 0',
              padding: 0,
              textAlign: 'justify',
              width: '100%'
            }}>
              Website: <a href="https://www.amfiindia.com" target="_blank" rel="noopener noreferrer" style={{ color: '#B8860B', textDecoration: 'none' }}>www.amfiindia.com</a>
            </p>
            
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: '600',
              color: '#E5E5E5',
              margin: '25px 0 15px 0',
              padding: 0
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
              margin: '0 0 30px 0',
              padding: 0,
              textAlign: 'left',
              width: '100%'
            }}>
              <strong style={{ color: '#E5E5E5' }}>Response Time:</strong> Within 7 working days
            </p>
            
          </section>
          
          {/* Section 4: Compliance Statement */}
          <section style={{
            marginBottom: '24px',
            paddingLeft: '0'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Compliance Statement
            </h2>
            
            <div style={{
              background: 'rgba(184, 134, 11, 0.1)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(184, 134, 11, 0.3)'
            }}>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#e5e5e5',
                margin: '0',
                textAlign: 'justify'
              }}>
                BM Wealth is an <strong style={{ color: '#e5e5e5' }}>IRDAI Licensed Insurance Advisor (License No. 277925)</strong> and <strong style={{ color: '#e5e5e5' }}>AMFI Registered Mutual Fund Distributor (ARN 90008)</strong>. We follow SEBI guidelines for mutual fund distribution but are <strong style={{ color: '#e5e5e5' }}>NOT SEBI-registered Investment Advisors</strong>. Our PMS and FD services are advisory in nature and provided through partnerships with SEBI-registered institutions.
              </p>
            </div>
            
          </section>
          
          {/* Section 5: Investment Disclaimer */}
          <section style={{
            marginBottom: '0',
            paddingLeft: '0'
          }}>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px',
              fontWeight: '600',
              color: '#B8860B',
              marginBottom: '24px',
              lineHeight: '1.3'
            }}>
              Investment Disclaimer
            </h2>
            
            <div style={{
              background: 'rgba(184, 134, 11, 0.1)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(184, 134, 11, 0.3)'
            }}>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#B8860B',
                fontWeight: '600',
                margin: '0',
                textAlign: 'justify'
              }}>
                Mutual fund investments are subject to market risks. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
              </p>
            </div>
            
          </section>
          
        </div>
        
        {/* Mobile Responsive Styles */}
        <style>{`
          @media (max-width: 768px) {
            section {
              padding-left: 0 !important;
            }
            
            h1 {
              font-size: 32px !important;
            }
            
            h2 {
              font-size: 24px !important;
            }
            
            h3 {
              font-size: 24px !important;
            }
            
            h4 {
              font-size: 24px !important;
            }
            
            p {
              font-size: 16px !important;
            }
            
            .section-container {
              padding: 0 20px !important;
            }
          }
        `}</style>
        
      </div>
    </>
  );
}
