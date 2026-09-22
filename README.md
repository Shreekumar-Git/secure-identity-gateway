# Secure Identity Gateway

Important Implementation Guidelines

Use Lovable's current recommended approach for authentication and backend/database integration.

Prefer a managed authentication service rather than building custom authentication.

Do not create a custom password-storage system.

Never store passwords in plain text.

Never hardcode credentials.

Protect authenticated routes.

Maintain authentication sessions securely.

Handle signup, login, logout, loading states, and errors.

Keep the application simple and focused on the assignment.

Use clean, understandable code that can easily be explained in an interview.

Make the UI responsive and professional without adding unnecessary features.
Please first determine the appropriate implementation approach based on Lovable's current capabilities and documentation, then implement the application.

After implementation, test the complete flow:

Signup → Authentication → Login → Protected Hello World → Logout

Fix any issues you find and make sure the application is ready to demonstrate.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1b45674e-40fe-4775-ac07-26ec8fe7c621).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
<img width="1099" height="614" alt="Architecture diagram" src="https://github.com/user-attachments/assets/9a617c82-3a3a-4418-b31d-49b4b47070c3" />

