"use client";

import { Box, Typography, Container, Stack, Divider } from "@mui/material";
import { Heading, Text } from "@/components";

// Metadata is exported from metadata.tsx

export default function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box>
        <Heading variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 4 }}>
          Privacy Policy
        </Heading>
        
        <Text variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        <Stack spacing={4}>
          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              1. Information We Collect
            </Heading>
            <Text variant="body1" paragraph>
              We collect information that you provide directly to us, including:
            </Text>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Text>Personal information such as name, email address, and phone number</Text>
              </li>
              <li>
                <Text>Account credentials and profile information</Text>
              </li>
              <li>
                <Text>Communication records, including emails and messages</Text>
              </li>
              <li>
                <Text>Usage data and analytics information</Text>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              2. How We Use Your Information
            </Heading>
            <Text variant="body1" paragraph>
              We use the information we collect to:
            </Text>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Text>Provide, maintain, and improve our services</Text>
              </li>
              <li>
                <Text>Process transactions and send related information</Text>
              </li>
              <li>
                <Text>Send technical notices and support messages</Text>
              </li>
              <li>
                <Text>Respond to your comments and questions</Text>
              </li>
              <li>
                <Text>Monitor and analyze trends, usage, and activities</Text>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              3. Information Sharing and Disclosure
            </Heading>
            <Text variant="body1" paragraph>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only:
            </Text>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Text>With your consent or at your direction</Text>
              </li>
              <li>
                <Text>To comply with legal obligations</Text>
              </li>
              <li>
                <Text>To protect our rights and safety</Text>
              </li>
              <li>
                <Text>With service providers who assist us in operating our platform</Text>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              4. Data Security
            </Heading>
            <Text variant="body1" paragraph>
              We implement appropriate security measures to protect your personal information. This includes:
            </Text>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Text>Encryption of data in transit using HTTPS</Text>
              </li>
              <li>
                <Text>Secure password hashing with bcrypt</Text>
              </li>
              <li>
                <Text>Regular security audits and updates</Text>
              </li>
              <li>
                <Text>Access controls and authentication mechanisms</Text>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              5. Your Rights
            </Heading>
            <Text variant="body1" paragraph>
              You have the right to:
            </Text>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Text>Access and receive a copy of your personal data</Text>
              </li>
              <li>
                <Text>Correct inaccurate or incomplete information</Text>
              </li>
              <li>
                <Text>Request deletion of your personal data</Text>
              </li>
              <li>
                <Text>Object to or restrict processing of your data</Text>
              </li>
              <li>
                <Text>Data portability to receive your data in a structured format</Text>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              6. Cookies and Tracking Technologies
            </Heading>
            <Text variant="body1">
              We use cookies and similar tracking technologies to collect and use personal information about you. 
              You can control cookies through your browser settings.
            </Text>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              7. Contact Us
            </Heading>
            <Text variant="body1" paragraph>
              If you have questions about this Privacy Policy, please contact us at:
            </Text>
            <Box>
              <Text fontWeight={600}>Email:</Text>
              <Text>privacy@ooplab.org</Text>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}

