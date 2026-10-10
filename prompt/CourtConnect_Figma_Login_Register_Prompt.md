# CourtConnect – Prompt Figma AI: Login & Register

Design a modern, clean and responsive authentication interface for a Vietnamese sports court booking and player matching web application called **CourtConnect**.

## Product context

CourtConnect helps users:
- Find and book sports courts
- Find players with a similar skill level
- Join or create matches
- Manage their sports activities

The authentication flow should feel trustworthy, simple, friendly and suitable for a university frontend web project.

## Create these screens

### 1. Login page

Design a desktop-first login page with a responsive mobile version.

Content:
- CourtConnect logo and brand name
- Heading: "Đăng nhập"
- Supporting text: "Đăng nhập để tiếp tục sử dụng CourtConnect"
- Email input
- Password input
- Show/hide password button
- "Ghi nhớ đăng nhập" checkbox
- "Quên mật khẩu?" link
- Primary button: "Đăng nhập"
- Divider with "Hoặc"
- Social login button:
  - Google
- Link: "Chưa có tài khoản? Đăng ký"

Include:
- Input default state
- Input focus state
- Input error state
- Disabled button state
- Loading button state
- Login error message
- Successful login feedback

### 2. Register page

Create a matching registration page using the same design system.

Content:
- CourtConnect logo and brand name
- Heading: "Tạo tài khoản"
- Supporting text: "Đăng ký tài khoản để bắt đầu kết nối và chơi thể thao"
- Full name input
- Email input
- Password input
- Confirm password input
- Show/hide password buttons
- Terms and conditions checkbox
- Primary button: "Đăng ký"
- Divider with "Hoặc"
- Google registration button
- Link: "Đã có tài khoản? Đăng nhập"

Include:
- Default state
- Focus state
- Validation error state
- Password strength indicator
- Password mismatch error
- Disabled state
- Loading state
- Registration success state

## Visual style

Use a modern sports-tech SaaS visual style.

Design characteristics:
- Clean and minimal
- Friendly and energetic but not overly flashy
- Strong visual hierarchy
- Rounded cards and input fields
- Clear primary CTA
- Generous spacing
- Accessible contrast
- Professional enough for a university project presentation

Use a consistent design system:
- 8px spacing system
- Consistent border radius
- Consistent input/button height
- One primary brand color
- Neutral background and text colors
- Clear success, warning and error colors
- Modern sans-serif typography

Do not use excessive gradients, excessive shadows, glassmorphism, or unnecessary decorative elements.

## Layout

### Desktop
- Centered authentication card
- Optional sports-related illustration or subtle decorative visual on one side
- Maximum content width around 420–480px for the form
- Comfortable whitespace

### Mobile
- Single-column layout
- No horizontal scrolling
- Form width adapts to screen size
- Touch-friendly controls
- Maintain readable typography and spacing

## UX requirements

Make the login and registration experience easy to understand for first-time users.

Clearly distinguish:
- Primary actions
- Secondary actions
- Links
- Validation errors
- Loading states
- Success states

Use Vietnamese UI text throughout the interface.

## Components to create

Create reusable components/variants for:
- Logo
- Text input
- Password input
- Checkbox
- Primary button
- Secondary/social button
- Error message
- Success message
- Loading button
- Divider
- Authentication card

Create component variants for:
- Default
- Hover
- Focus
- Disabled
- Error
- Loading
- Success where appropriate

## Responsive design

Create both:
- Desktop version: approximately 1440px wide
- Mobile version: approximately 390px wide

Make sure the same design system and components are reused between desktop and mobile.

## Figma organization

Organize the file clearly:

Pages:
1. Design System
2. Login
3. Register
4. Responsive
5. Components

For the Design System page include:
- Colors
- Typography
- Spacing
- Border radius
- Buttons
- Inputs
- Form states

For Login and Register pages:
- Main desktop design
- Important UI states

For Responsive:
- Mobile Login
- Mobile Register

Focus on a realistic, implementation-friendly design that can later be converted directly into semantic HTML, CSS and JavaScript.

Do not design backend functionality or real authentication logic.
