import Chatbot from './components/Chatbot';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <CssBaseline />
      <Container maxWidth='md' sx={{ mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{
              scale: [1, loading ? 1.1 : 1],
              rotate: loading ? [0, 15, -15, 0] : 0,
            }}
            transition={{
              duration: 0.6,
              repeat: loading ? Infinity : 0,
              repeatType: 'loop',
            }}
          >
            <Typography sx={{ fontSize: '4rem' }}>🤖</Typography>
          </motion.div>
          <Typography variant='h4' component='h1'>
            GenAI PDF Q&A Bot
          </Typography>
        </Box>

        {/* Pass setLoading to Chatbot */}
        <Chatbot setLoading={setLoading} />
      </Container>
    </>
  );
}
