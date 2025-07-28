import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
} from '@mui/material';

export default function Chatbot({ setLoading }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);

  const URL = 'http://10.224.233.91:8000/';

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setIsBotThinking(true);

    try {
      const res = await fetch(`${URL}upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { text: data.status || 'PDF uploaded successfully.', sender: 'bot' },
      ]);
      setPdfUploaded(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: 'Error uploading PDF.', sender: 'bot' },
      ]);
    } finally {
      setLoading(false);
      setIsBotThinking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !pdfUploaded) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setLoading(true);
    setIsBotThinking(true);

    try {
      const formData = new FormData();
      formData.append('question', userMsg.text);

      const res = await fetch(`${URL}ask`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      const botMsg = {
        text: data.answer || 'Sorry, I couldn’t find an answer.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: 'Error contacting server.', sender: 'bot' },
      ]);
    } finally {
      setLoading(false);
      setIsBotThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mt: 2,
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Button variant='contained' component='label'>
          Upload PDF
          <input type='file' hidden onChange={handleFileUpload} />
        </Button>
      </Box>

      <List
        sx={{
          flexGrow: 1,
          maxHeight: 400,
          minHeight: 300,
          overflowY: 'auto',
          mb: 2,
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          p: 1,
          bgcolor: '#fafafa',
        }}
      >
        {messages.map((msg, index) => (
          <ListItem key={index} alignItems='flex-start'>
            <ListItemAvatar>
              <Avatar>{msg.sender === 'user' ? '👤' : '🤖'}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    bgcolor:
                      msg.sender === 'user' ? 'primary.light' : 'grey.300',
                    p: 1,
                    borderRadius: 1,
                    maxWidth: '75%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </Typography>
              }
            />
          </ListItem>
        ))}

        {isBotThinking && (
          <ListItem>
            <ListItemAvatar>
              <Avatar>🤖</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />{' '}
                  <Typography variant='body2'>Bot is thinking…</Typography>
                </Box>
              }
            />
          </ListItem>
        )}
      </List>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label='Type your question'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!pdfUploaded}
        />
        <Button
          variant='contained'
          onClick={handleSendMessage}
          disabled={!pdfUploaded}
        >
          Send
        </Button>
      </Box>

      {!pdfUploaded && (
        <Typography variant='caption' color='error' sx={{ mt: 1 }}>
          Please upload a PDF first.
        </Typography>
      )}
    </Paper>
  );
}
