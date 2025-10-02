import React from 'react';
import { Body, Container, Head, Heading, Html, Img, Section, Text } from '@react-email/components';

interface OTPEmailProps {
  validationCode: string;
  title: string;
}

const logoUrl = `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRv4di43NnuA6378fql-sQ6Cf6dzwOxiyMjg&s`;

export const OTPEmail = ({ validationCode, title }: OTPEmailProps) => (
  <Html>
    <Head>{title}</Head>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} width="212" height="88" alt="logoUrl" style={logo} />
        <Text style={tertiary}>Mã xác thực OTP</Text>
        <Heading style={secondary}>Hãy nhập mã xác thực OTP vào website.</Heading>
        <Section style={codeContainer}>
          <Text style={code}>{validationCode}</Text>
        </Section>
        <Text style={paragraph}>Nếu bạn không chủ động thực hiện, xin bỏ qua email này.</Text>
      </Container>
      <Text style={footer}>Securely powered by Plaid.</Text>
    </Body>
  </Html>
);

OTPEmail.PreviewProps = {
  validationCode: '144833',
  title: 'Mã OTP',
} as OTPEmailProps;

export default OTPEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 130px',
};

const logo = {
  margin: '0 auto',
  borderRadius: '100%',
  width: '80px',
  height: '80px',
};

const tertiary = {
  color: '#0a85ea',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
};

const secondary = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  textAlign: 'center' as const,
};

const codeContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
};

const code = {
  color: '#000',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  display: 'block',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0',
  textAlign: 'center' as const,
};

const footer = {
  color: '#000',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};
