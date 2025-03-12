import Link from 'next/link';

const Footer = () => {
  return (
    <footer style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #ccc' }}>
      <nav>
        <ul style={{ 
          listStyle: 'none', 
          display: 'flex', 
          gap: '3rem',
          justifyContent: 'center', 
          padding: 0 
        }}>
          <li><Link href="/how-it-works">How it Works</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
          <li><Link href="/privacy-policy">Privacy Policy</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
