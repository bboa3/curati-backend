# cura-backend

Current structure: `
amplify/functions/notification-stream-watcher/
├── handler.ts
├── resource.ts
│── triggers/
│   ├── post-notification-creation.ts
├── templates/
│   ├── index.ts                  
│   ├── shared/                 
│   │   ├── buttons.ts
│   │   ├── footer.ts
│   │   └── header.ts
│   ├── APPOINTMENT_CONFIRMATION_REQUIRED/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── email.ts
│   │   ├── sms.ts
│   │   ├── in-app.ts
│   │   └── push.ts
│   ├── APPOINTMENT_CONFIRMED/
│   │   └── ...
│   └── ...
│── channels/
│   ├── index.ts
│   ├── in-app.ts
│   ├── email.ts
│   ├── sms.ts
│   └── push.ts
│── helpers/
│   ├── types.ts
│   └── ...
`