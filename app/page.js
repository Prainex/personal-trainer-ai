'use client'

import { Box, Button, Stack, TextField, Paper } from '@mui/material'
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

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)

    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
    ])

    // Send the message to the server
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

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
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '20px', 
        bgcolor: '#f5f5f5', 
        borderRadius: '10px' 
      }} // Set a max width and center content
    >
      <Stack spacing={2}>
        <Stack spacing={2} sx={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
          {messages.map((message, index) => (
            <Paper 
              key={index} 
              sx={{
                padding: '10px',
                borderRadius: '15px',
                backgroundColor: message.role === 'assistant' ? 'lightblue' : 'lightgreen',
                alignSelf: message.role === 'assistant' ? 'flex-start' : 'flex-end', // Align messages based on role
                maxWidth: '80%', // Limit bubble width
              }}
            >
              {message.content}
            </Paper>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{ bgcolor: 'white', borderRadius: '5px' }} // Give the input some visual depth
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
            sx={{ width: '100px' }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
