# Real-time Group Chat Application

A full-featured real-time chat application built with Node.js, Express, MySQL, Socket.IO, and AWS S3 for file sharing.

## Features

- **User Authentication**

  - Secure signup and login with JWT
  - Password hashing using bcrypt

- **Real-time Messaging**

  - Direct messages between users
  - Group chat functionality
  - Real-time message delivery using Socket.IO
  - Message history persistence

- **Group Management**

  - Create new groups
  - Add/remove group members
  - Promote/demote group admins
  - Search group members

- **File Sharing**

  - Upload and share files in chats
  - Secure file storage using AWS S3
  - Support for various file types
  - Secure file access with signed URLs

- **Performance Optimization**
  - Automatic message archiving after 24 hours
  - Separate storage for archived messages
  - Efficient database querying
  - Real-time message delivery

## Tech Stack

- **Backend**

  - Node.js
  - Express.js
  - Socket.IO
  - Sequelize ORM
  - MySQL

- **Storage**

  - MySQL (messages and user data)
  - AWS S3 (file storage)

- **Authentication**
  - JWT (JSON Web Tokens)
  - bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MySQL
- AWS Account with S3 bucket
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/group-chat-app.git
cd group-chat-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
# Create a MySQL database
mysql -u root -p
CREATE DATABASE group_chat;
```

4. Start the server:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /signup` - Register a new user
- `POST /login` - Login user

### Messages

- `GET /messages/:userId` - Get direct messages with a user
- `POST /messages/:userId` - Send direct message
- `POST /messages/:userId/files` - Send file in direct message

### Groups

- `POST /groups` - Create new group
- `GET /groups` - Get user's groups
- `POST /groups/:id/messages` - Send group message
- `GET /groups/:id/messages` - Get group messages
- `POST /groups/:id/files` - Send file in group
- `PUT /groups/:id/members` - Add members to group
- `DELETE /groups/:id/members` - Remove members from group
- `PUT /groups/:id/admins` - Update admin status

## Architecture

- **Models**

  - User
  - Group
  - GroupMember
  - Message
  - ArchivedMessage

- **Controllers**

  - Authentication
  - Messages
  - Groups
  - File Upload

- **WebSocket Events**
  - Direct messages
  - Group messages
  - User connections
  - Group join/leave

## Performance Features

- Message archiving using cron jobs
- Efficient file handling with S3
- Real-time message delivery
- Database query optimization

## Security Features

- JWT authentication
- Password hashing
- Secure file access
- Input validation
- Role-based access control

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
