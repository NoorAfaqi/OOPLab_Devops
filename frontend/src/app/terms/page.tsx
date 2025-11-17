"use client";

import { Box, Typography, Container, Stack, Divider } from "@mui/material";
import { Heading, Text } from "@/components";

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box>
        <Heading variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 4 }}>
          Terms of Service
        </Heading>
        
        <Text variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        <Stack spacing={4}>
          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              1. Acceptance of Terms
            </Heading>
            <Text variant="body1">
              By accessing and using OOPLab services, you accept and agree to be bound by the terms and provision of this agreement.
            </Text>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              2. Use License
            </Heading>
            <Text variant="body1" paragraph>
              Permission is granted to temporarily download one copy of the materials on OOPLab's website for personal, non-commercial transitory viewing only.
            </Text>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              3. User Accounts
            </Heading>
            <Text variant="body1" paragraph>
              You are responsible for:
            </Text>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Text>Maintaining the confidentiality of your account credentials</Text>
              </li>
              <li>
                <Text>All activities that occur under your account</Text>
              </li>
              <li>
                <Text>Providing accurate and current information</Text>
              </li>
              <li>
                <Text>Notifying us immediately of any unauthorized use</Text>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              4. User Content
            </Heading>
            <Text variant="body1" paragraph>
              You retain ownership of any content you post on our platform. By posting content, you grant us a license to use, modify, and display your content in connection with our services.
            </Text>
            <Text variant="body1">
              You agree not to post content that:
            </Text>
            <Box component="ul" sx={{ pl: 3, mt: 2 }}>
              <li>
                <Text>Is illegal, harmful, or violates any laws</Text>
              </li>
              <li>
                <Text>Infringes on intellectual property rights</Text>
              </li>
              <li>
                <Text>Contains malware or harmful code</Text>
              </li>
              <li>
                <Text>Is spam or unsolicited commercial messages</Text>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              5. Disclaimer
            </Heading>
            <Text variant="body1" paragraph>
              The materials on OOPLab's website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation:
            </Text>
            <Box component="ul" sx={{ pl: 3 }}>
              <li>
                <Text>Implied warranties of merchantability</Text>
              </li>
              <li>
                <Text>Fitness for a particular purpose</Text>
              </li>
              <li>
                <Text>Non-infringement of intellectual property or other violation of rights</Text>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              6. Limitations
            </Heading>
            <Text variant="body1">
              In no event shall OOPLab or its suppliers be liable for any damages arising out of the use or inability to use the materials on our website, even if we or an authorized representative have been notified.
            </Text>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              7. Revisions and Errata
            </Heading>
            <Text variant="body1">
              The materials appearing on OOPLab's website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current.
            </Text>
          </Box>

          <Divider />

          <Box>
            <Heading variant="h2" sx={{ fontSize: '1.75rem', mb: 2 }}>
              8. Contact Information
            </Heading>
            <Text variant="body1" paragraph>
              If you have questions about these Terms, please contact us:
            </Text>
            <Box>
              <Text fontWeight={600}>Email:</Text>
              <Text>legal@ooplab.org</Text>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}

