export default function ComplianceFooter() {
  return (
    <div
      style={{
        marginTop: '46px',
        paddingTop: '22px',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        color: '#9ca3af',
        fontSize: '12px',
        lineHeight: 1.7,
      }}
    >
      <p style={{ marginBottom: '10px' }}>
        <strong style={{ color: 'rgba(235,242,255,0.86)' }}>Disclaimer:</strong> Content is for educational and informational purposes only.
        Not personalized investment advice. Consult a registered financial adviser before making decisions.
      </p>
      <p style={{ marginBottom: '10px' }}>
        <strong style={{ color: 'rgba(235,242,255,0.86)' }}>Affiliate Links:</strong> Some posts contain affiliate links.
        We may earn a commission at no extra cost to you.
      </p>
      <p>
        <strong style={{ color: 'rgba(235,242,255,0.86)' }}>Sponsored Content:</strong> Sponsored posts are clearly marked.
        Sponsors do not control editorial content.
      </p>
    </div>
  );
}
