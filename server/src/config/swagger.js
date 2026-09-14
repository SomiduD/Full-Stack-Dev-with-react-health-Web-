// server/src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedCore Healthcare Platform API',
      version: '1.0.0',
      description: `
## MedCore Healthcare Platform — REST API

A multi-role, multi-hospital healthcare management platform.

### Authentication
All protected routes require a **Bearer JWT** access token in the \`Authorization\` header.
Obtain a token via **POST /api/auth/login**.

### Roles
| Role | Description |
|------|-------------|
| \`patient\` | Books appointments, views health records, requests ambulances |
| \`doctor\` | Manages patient queue, creates health records |
| \`hospital_admin\` | Manages doctors, views hospital analytics |
| \`super_admin\` | Platform-wide control across all hospitals |

### Quick Start
1. \`POST /api/auth/login\` with demo credentials below
2. Copy the \`accessToken\` from the response
3. Click **Authorize** (🔓) and paste \`Bearer <token>\`

**Demo Credentials:**
- Patient: \`patient@demo.com\` / \`Patient@12345\`
- Doctor: \`doctor@demo.com\` / \`Doctor@12345\`
- Admin: \`admin@demo.com\` / \`Admin@12345\`
      `,
      contact: {
        name:  'MedCore Support',
        email: 'support@medcore.health',
      },
    },
    servers: [
      { url: 'http://localhost:5001', description: 'Local Development' },
      { url: 'https://your-deployed-url.com', description: 'Production (replace after deployment)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          description:  'Paste the accessToken returned by POST /api/auth/login',
        },
      },
      schemas: {
        // ── Success envelope ────────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Operation successful.' },
            data:    { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string',  example: 'Something went wrong.' },
            errors:  { type: 'array', items: { type: 'object' } },
          },
        },
        // ── Auth ────────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'hospitalCode', 'profile'],
          properties: {
            email:        { type: 'string', format: 'email', example: 'newpatient@example.com' },
            password:     { type: 'string', minLength: 8, example: 'SecurePass@123' },
            role:         { type: 'string', enum: ['patient', 'doctor'], default: 'patient' },
            hospitalCode: { type: 'string', example: 'DEMO' },
            profile: {
              type: 'object',
              required: ['firstName', 'lastName'],
              properties: {
                firstName: { type: 'string', example: 'Jane' },
                lastName:  { type: 'string', example: 'Doe' },
                phone:     { type: 'string', example: '+91-9000000099' },
                bloodGroup:{ type: 'string', example: 'O+' },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'doctor@demo.com' },
            password: { type: 'string', example: 'Doctor@12345' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken:  { type: 'string', description: 'Short-lived JWT (15 min)' },
            refreshToken: { type: 'string', description: 'Long-lived refresh token (7 days)' },
            user:         { $ref: '#/components/schemas/UserProfile' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id:         { type: 'string', example: '64abc123...' },
            email:      { type: 'string' },
            role:       { type: 'string', enum: ['patient', 'doctor', 'hospital_admin', 'super_admin'] },
            hospitalId: { type: 'string' },
            profile: {
              type: 'object',
              properties: {
                firstName:      { type: 'string' },
                lastName:       { type: 'string' },
                phone:          { type: 'string' },
                specialization: { type: 'string', description: 'Doctors only' },
                bloodGroup:     { type: 'string', description: 'Patients only' },
              },
            },
          },
        },
        // ── Appointment ─────────────────────────────────────────────────────
        BookAppointmentRequest: {
          type: 'object',
          required: ['doctorId', 'date', 'timeSlot', 'reason'],
          properties: {
            doctorId: { type: 'string', example: '64abc123...' },
            date:     { type: 'string', format: 'date', example: '2026-09-20' },
            timeSlot: { type: 'string', enum: ['08:00','09:00','10:00','11:00','14:00','15:00','16:00'], example: '09:00' },
            reason:   { type: 'string', maxLength: 500, example: 'Fever and headache for 3 days' },
          },
        },
        UpdateAppointmentStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status:         { type: 'string', enum: ['pending','confirmed','completed','cancelled'] },
            doctorNotes:    { type: 'string', maxLength: 2000 },
            cancelledReason:{ type: 'string', maxLength: 300 },
            version:        { type: 'integer', description: 'Current __v value for optimistic locking / conflict detection', example: 0 },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            _id:        { type: 'string' },
            patientId:  { type: 'string' },
            doctorId:   { type: 'string' },
            hospitalId: { type: 'string' },
            date:       { type: 'string', format: 'date-time' },
            timeSlot:   { type: 'string' },
            reason:     { type: 'string' },
            status:     { type: 'string', enum: ['pending','confirmed','completed','cancelled'] },
            doctorNotes:{ type: 'string' },
            __v:        { type: 'integer', description: 'Document version for conflict detection' },
            createdAt:  { type: 'string', format: 'date-time' },
          },
        },
        // ── Health Record ───────────────────────────────────────────────────
        CreateHealthRecordRequest: {
          type: 'object',
          required: ['patientId', 'type', 'title', 'date'],
          properties: {
            patientId:   { type: 'string' },
            type:        { type: 'string', enum: ['lab','imaging','prescription','discharge','vaccination'] },
            title:       { type: 'string', example: 'Blood CBC Report' },
            description: { type: 'string' },
            fileUrl:     { type: 'string', format: 'uri', example: 'https://storage.example.com/cbc.pdf' },
            date:        { type: 'string', format: 'date', example: '2026-09-08' },
          },
        },
        // ── Ambulance ───────────────────────────────────────────────────────
        AmbulanceRequestBody: {
          type: 'object',
          properties: {
            locationNote:  { type: 'string', example: 'Near Main Gate, Building A' },
            emergencyType: { type: 'string', enum: ['general','cardiac','trauma','respiratory','other'], default: 'general' },
            notes:         { type: 'string', example: 'Patient unconscious' },
          },
        },
      },
    },
    // Apply Bearer auth globally — individual routes can opt out with security:[]
    security: [{ bearerAuth: [] }],

    // ── PATHS ──────────────────────────────────────────────────────────────────
    paths: {

      // ── Health Check ────────────────────────────────────────────────────────
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'API health check',
          security: [],
          responses: {
            200: { description: 'API is operational', content: { 'application/json': { schema: {
              type: 'object',
              properties: {
                success:     { type: 'boolean', example: true },
                message:     { type: 'string' },
                environment: { type: 'string' },
                version:     { type: 'string' },
                database:    { type: 'string', enum: ['connected','disconnected'] },
              },
            }}}},
          },
        },
      },

      // ── Auth ────────────────────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user (patient or doctor)',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' }}}},
          responses: {
            201: { description: 'User created and tokens issued', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokens' }}}},
            409: { description: 'Email already registered' },
            422: { description: 'Validation error' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive JWT tokens',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' }}}},
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokens' }}}},
            401: { description: 'Invalid credentials' },
            503: { description: 'Database unavailable' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' }}}}}},
          responses: {
            200: { description: 'New access + refresh tokens issued' },
            401: { description: 'Invalid or expired refresh token' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout (invalidate refresh token)',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' }}}}}},
          responses: {
            200: { description: 'Logged out successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          responses: {
            200: { description: 'Current user data', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfile' }}}},
            401: { description: 'Unauthorized' },
          },
        },
      },

      // ── Appointments ─────────────────────────────────────────────────────────
      '/api/appointments': {
        post: {
          tags: ['Appointments'],
          summary: 'Book a new appointment (patient)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BookAppointmentRequest' }}}},
          responses: {
            201: { description: 'Appointment booked', content: { 'application/json': { schema: { $ref: '#/components/schemas/Appointment' }}}},
            409: { description: 'Time slot already booked' },
            422: { description: 'Validation error' },
          },
        },
      },
      '/api/appointments/my': {
        get: {
          tags: ['Appointments'],
          summary: "Get patient's own appointments",
          parameters: [
            { in: 'query', name: 'status',   schema: { type: 'string', enum: ['pending','confirmed','completed','cancelled'] }},
            { in: 'query', name: 'upcoming', schema: { type: 'boolean' }, description: 'Filter to future appointments only' },
          ],
          responses: {
            200: { description: 'List of appointments' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/appointments/{id}/status': {
        patch: {
          tags: ['Appointments'],
          summary: 'Update appointment status (doctor or patient)',
          description: 'Send `version` (the `__v` field from the last GET) to enable **conflict detection**. A `409` is returned if another user modified the record first.',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Appointment ObjectId' }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAppointmentStatusRequest' }}}},
          responses: {
            200: { description: 'Appointment updated' },
            409: { description: 'Conflict — record modified by another user (optimistic locking)' },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/api/appointments/doctor/queue': {
        get: {
          tags: ['Appointments'],
          summary: "Get doctor's queue for today (or a specific date)",
          parameters: [{ in: 'query', name: 'date', schema: { type: 'string', format: 'date' }, description: 'Defaults to today' }],
          responses: { 200: { description: "Today's patient queue" }},
        },
      },
      '/api/appointments/doctor/schedule': {
        get: {
          tags: ['Appointments'],
          summary: "Get doctor's full upcoming schedule",
          responses: { 200: { description: 'List of future appointments' }},
        },
      },
      '/api/appointments/slots': {
        get: {
          tags: ['Appointments'],
          summary: 'Get available time slots for a doctor on a date',
          parameters: [
            { in: 'query', name: 'doctorId', required: true, schema: { type: 'string' }},
            { in: 'query', name: 'date',     required: true, schema: { type: 'string', format: 'date' }},
          ],
          responses: { 200: { description: 'Available and booked slots' }},
        },
      },

      // ── Health Records ────────────────────────────────────────────────────────
      '/api/health-records': {
        get: {
          tags: ['Health Records'],
          summary: 'Get health records (patient: own | doctor: patients in hospital)',
          responses: { 200: { description: 'List of health records' }},
        },
        post: {
          tags: ['Health Records'],
          summary: 'Create a health record (doctor only)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateHealthRecordRequest' }}}},
          responses: {
            201: { description: 'Health record created' },
            403: { description: 'Forbidden — doctor role required' },
          },
        },
      },

      // ── Doctors (public-ish) ──────────────────────────────────────────────────
      '/api/doctors': {
        get: {
          tags: ['Doctors'],
          summary: 'List active doctors in the authenticated user\'s hospital',
          responses: { 200: { description: 'List of doctors' }},
        },
      },

      // ── Ambulance ────────────────────────────────────────────────────────────
      '/api/ambulance/request': {
        post: {
          tags: ['Ambulance'],
          summary: 'Submit emergency ambulance request (patient)',
          description: 'Emits a real-time `ambulance_request` Socket.io event to the hospital room.',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AmbulanceRequestBody' }}}},
          responses: {
            201: { description: 'Request submitted — help is on the way' },
            403: { description: 'Patient role required' },
          },
        },
      },
      '/api/ambulance/my-requests': {
        get: {
          tags: ['Ambulance'],
          summary: "Patient's ambulance request history (last 10)",
          responses: { 200: { description: 'List of ambulance requests' }},
        },
      },

      // ── Admin ────────────────────────────────────────────────────────────────
      '/api/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Hospital dashboard statistics (hospital_admin or super_admin)',
          responses: { 200: { description: 'Hospital stats aggregate' }},
        },
      },
      '/api/admin/hospital': {
        get: {
          tags: ['Admin'],
          summary: "Get the authenticated admin's hospital details",
          responses: { 200: { description: 'Hospital document' }},
        },
      },
      '/api/admin/doctors': {
        get: {
          tags: ['Admin'],
          summary: 'List all doctors in the hospital',
          responses: { 200: { description: 'List of doctor profiles' }},
        },
        post: {
          tags: ['Admin'],
          summary: 'Create a new doctor account',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: {
              type: 'object',
              required: ['email','password','profile'],
              properties: {
                email:    { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6 },
                profile: {
                  type: 'object',
                  required: ['firstName','lastName','specialization'],
                  properties: {
                    firstName:      { type: 'string' },
                    lastName:       { type: 'string' },
                    specialization: { type: 'string' },
                    department:     { type: 'string' },
                    licenseNumber:  { type: 'string' },
                    yearsExperience:{ type: 'integer' },
                  },
                },
              },
            }}},
          },
          responses: {
            201: { description: 'Doctor account created' },
            409: { description: 'Email already registered' },
          },
        },
      },
      '/api/admin/doctors/{id}/status': {
        patch: {
          tags: ['Admin'],
          summary: 'Activate or deactivate a doctor',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }}],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { isActive: { type: 'boolean' }}}}}},
          responses: { 200: { description: 'Doctor status updated' }},
        },
      },
      '/api/admin/appointments': {
        get: {
          tags: ['Admin'],
          summary: 'List all appointments in the hospital',
          responses: { 200: { description: 'List of appointments' }},
        },
      },
      '/api/admin/patients': {
        get: {
          tags: ['Admin'],
          summary: 'List all patients registered in the hospital',
          responses: { 200: { description: 'List of patient profiles' }},
        },
      },

      // ── Super Admin ──────────────────────────────────────────────────────────
      '/api/superadmin/stats': {
        get: {
          tags: ['Super Admin'],
          summary: 'Platform-wide aggregate statistics (super_admin only)',
          responses: { 200: { description: 'Global stats across all hospitals' }},
        },
      },
      '/api/superadmin/hospitals': {
        get: {
          tags: ['Super Admin'],
          summary: 'List all hospitals on the platform',
          responses: { 200: { description: 'List of hospital documents' }},
        },
      },
      '/api/superadmin/hospitals/{id}/status': {
        patch: {
          tags: ['Super Admin'],
          summary: 'Activate or deactivate a hospital',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }}],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { isActive: { type: 'boolean' }}}}}},
          responses: { 200: { description: 'Hospital status updated' }},
        },
      },
      '/api/superadmin/verifications': {
        get: {
          tags: ['Super Admin'],
          summary: 'List users pending verification',
          parameters: [{ in: 'query', name: 'status', schema: { type: 'string', enum: ['pending','approved','rejected'] }, description: 'Filter by status (default: pending)' }],
          responses: { 200: { description: 'List of users awaiting verification' }},
        },
      },
      '/api/superadmin/verifications/{userId}/approve': {
        patch: {
          tags: ['Super Admin'],
          summary: 'Approve a pending user',
          parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' }}],
          responses: { 200: { description: 'User approved and activated' }},
        },
      },
      '/api/superadmin/verifications/{userId}/reject': {
        patch: {
          tags: ['Super Admin'],
          summary: 'Reject a pending user',
          parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' }}],
          requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string', example: 'Identity could not be verified.' }}}}}},
          responses: { 200: { description: 'User rejected' }},
        },
      },
    },
  },
  apis: [], // Using inline definition above — no file scanning needed
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
