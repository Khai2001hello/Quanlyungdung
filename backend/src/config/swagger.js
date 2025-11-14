const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Room Booking API',
      version: '1.0.0',
      description: 'API documentation for Room Management and Booking System',
      contact: {
        name: 'API Support',
        email: 'support@roombooking.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        Room: {
          type: 'object',
          required: ['name', 'code', 'type', 'capacity'],
          properties: {
            _id: {
              type: 'string',
              description: 'Room ID'
            },
            name: {
              type: 'string',
              description: 'Room name',
              example: 'Phòng họp A1'
            },
            code: {
              type: 'string',
              description: 'Unique room code',
              example: 'MR-001'
            },
            type: {
              type: 'string',
              enum: ['small', 'medium', 'large'],
              description: 'Room size type'
            },
            capacity: {
              type: 'number',
              description: 'Maximum capacity',
              example: 10
            },
            description: {
              type: 'string',
              description: 'Room description',
              example: 'Phòng họp với đầy đủ trang thiết bị'
            },
            equipment: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of equipment',
              example: ['Máy chiếu', 'Tivi', 'Bảng trắng']
            },
            image: {
              type: 'string',
              description: 'Room image URL',
              example: '/uploads/room-1234.jpg'
            },
            status: {
              type: 'string',
              enum: ['available', 'booked', 'maintenance'],
              description: 'Room status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['room', 'startTime', 'endTime'],
          properties: {
            _id: {
              type: 'string',
              description: 'Booking ID'
            },
            room: {
              type: 'string',
              description: 'Room ID',
              example: '507f1f77bcf86cd799439011'
            },
            user: {
              type: 'string',
              description: 'User ID who created the booking'
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              description: 'Booking start time',
              example: '2025-11-12T09:00:00.000Z'
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              description: 'Booking end time',
              example: '2025-11-12T11:00:00.000Z'
            },
            purpose: {
              type: 'string',
              description: 'Booking purpose',
              example: 'Team meeting'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled'],
              description: 'Booking status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            fullName: {
              type: 'string',
              example: 'Nguyễn Văn A'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    security: []
  },
  apis: ['./src/routes/*.js'] // Path to API routes with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
