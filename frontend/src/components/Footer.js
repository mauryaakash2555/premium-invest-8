import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const Footer = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '919368689338';
    const message = encodeURIComponent('Hello, I would like to know more about your services.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Premium Invest
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Your trusted partner in wealth management and investment solutions. Building financial futures since 2010.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="Facebook"
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Twitter"
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Instagram"
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="LinkedIn"
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Home
              </Link>
              <Link href="/about" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                About Us
              </Link>
              <Link href="/services" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Services
              </Link>
              <Link href="/contact" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Our Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/services/mutual-funds" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Mutual Funds
              </Link>
              <Link href="/services/stocks" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Stock Trading
              </Link>
              <Link href="/services/insurance" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Insurance
              </Link>
              <Link href="/services/retirement" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Retirement Planning
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  info@premiuminvest.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +91 93686 89338
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  123 Finance Street, Mumbai, India
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            © {new Date().getFullYear()} Premium Invest. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="/privacy" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
              Terms of Service
            </Link>
          </Box>
        </Box>

        {/* WhatsApp Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3,
          }}
        >
          <IconButton
            onClick={handleWhatsAppClick}
            sx={{
              bgcolor: '#25D366',
              color: 'white',
              '&:hover': {
                bgcolor: '#128C7E',
              },
              padding: 1.5,
            }}
            aria-label="WhatsApp Us"
          >
            <WhatsAppIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
