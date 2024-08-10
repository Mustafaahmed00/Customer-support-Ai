'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;  // Don't send empty messages
    setIsLoading(true)
    const userMessage = { role: 'user', content: message }

    setMessage('')
    setMessages((messages) => [...messages, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let assistantMessage = { role: 'assistant', content: '' }
      setMessages((messages) => [...messages, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgcolor="#2c2c2c" // Dark grey background
    >
      <Stack
        direction="column"
        width="100%"
        maxWidth="600px"
        height="700px"
        border="1px solid #3e3e3e"
        p={2}
        spacing={2}
        bgcolor="#1a1a1a"
        borderRadius={4}
        overflow="hidden"
      >
        <Typography
        variant="h7"
        color="white"
        textAlign="center"
        mb={2}
      >
        <span style={{ color: '#0066cc'}}>FEJM</span> AI Chat Bot
      </Typography>

        <Stack
          direction="column"
          spacing={1}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={msg.role === 'assistant' ? '#1f1f1f' : '#003366'} // Dark blue
                color="white"
                borderRadius="50px"
                p={2}
                maxWidth="75%"
                boxShadow={2}
                display="flex"
                alignItems="center"
                sx={{ 
                  '& .MuiTypography-root': {
                    color: 'white'
                  }
                }}
              >
                {msg.role === 'assistant' && (
                  <Box
                    bgcolor="transparent"
                    borderRadius="50%"
                    width="30px"
                    height="30px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mr={1}
                  >
                    <img 
                      src="/logo.png" 
                      alt="Robot Icon" 
                      style={{ width: '20px', height: '20px' }} 
                    />
                  </Box>
                )}
                <Typography variant="body1">
                  {msg.content}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            variant="outlined"
            size="small"
            InputProps={{
              style: { color: 'white' },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#3e3e3e',
                },
                '&:hover fieldset': {
                  borderColor: '#003366', // Dark blue
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#003366', // Dark blue
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              backgroundColor: '#003366', // Dark blue
              '&:hover': {
                backgroundColor: '#002a52', // Slightly darker blue
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}