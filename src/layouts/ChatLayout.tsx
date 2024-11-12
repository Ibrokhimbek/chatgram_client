import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import axios from "axios";
import io from "socket.io-client";
const socket = io("https://chatgram.gymrat.uz");

export interface Message {
  _id: string;
  room: string;
  sender: string;
  text: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

const ChatLayout: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await axios("https://chatgram.gymrat.uz/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      setUsers(data.data.users);
    };
    fetchUsers();

    // Listen for new messages
    socket.on("newMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  const joinRoom = (user: User) => {
    setSelectedUser(user);
    socket.emit("joinRoom", {
      username: `${sessionStorage.getItem("username")}`,
      targetUserId: user._id,
    });
    socket.on("roomJoined", (roomId: string) => {
      setRoomId(roomId);
    });
  };

  const sendMessage = (text: string) => {
    if (roomId) {
      socket.emit("message", {
        roomId,
        senderName: sessionStorage.getItem("username"),
        text,
      });
    }
  };

  const handleSendMessage = () => {
    sendMessage(newMessage);
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Chat App</Typography>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box display="flex" flexGrow={1}>
        {/* Sidebar */}
        <Box
          width="250px"
          bgcolor="background.paper"
          display="flex"
          flexDirection="column"
          padding={2}
          borderRight="1px solid #ddd"
        >
          <Typography variant="h6">Users</Typography>
          <Divider />
          <List>
            {users?.map((user) => (
              <ListItem
                key={user._id}
                onClick={() => {
                  joinRoom(user);
                }}
              >
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Chat Area */}
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          padding={2}
          bgcolor="background.default"
        >
          <Typography variant="h6">
            Chat with {selectedUser?.username || "Select a User"}
          </Typography>
          <Divider sx={{ marginY: 2 }} />

          {/* Messages */}
          <Box
            flexGrow={1}
            overflow="auto"
            display="flex"
            flexDirection="column-reverse"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                flexDirection={
                  message.sender === selectedUser?._id ? "row-reverse" : "row"
                }
                padding={1}
              >
                <Typography variant="body2" fontWeight="bold" marginRight={1}>
                  {selectedUser?.username}:
                </Typography>
                <Typography variant="body1">{message.text}</Typography>
              </Box>
            ))}
          </Box>

          {/* Message input and send button */}
          <Box display="flex" gap={1} marginTop={2}>
            <TextField
              label="Type a message"
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              variant="outlined"
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatLayout;
